# DSPy Core Concepts

## Signatures

Signatures define the interface between application code and language models. They specify inputs, outputs, and a task description using Python types.

### Inline Signatures

For simple cases, use string-based signatures:

```python
predictor = dspy.Predict("question -> answer")
result = predictor(question="What is the capital of France?")
result.answer  # => "Paris"

# With type hints in the string
predictor = dspy.Predict("text -> sentiment, score: float")
```

### Class-Based Signatures

For complex cases with descriptions and constraints:

```python
class ClassifyEmail(dspy.Signature):
    """Classify customer support emails by urgency and category."""

    subject: str = dspy.InputField()
    body: str = dspy.InputField()

    category: str = dspy.OutputField()
    urgency: str = dspy.OutputField()
```

### Supported Types

| Type | Notes |
|------|-------|
| `str` | Required string |
| `int` | Whole numbers |
| `float` | Decimal numbers |
| `bool` | true/false |
| `list[X]` | Typed lists |
| `dict[K, V]` | Typed dictionaries |
| `Optional[X]` | Optional fields |
| `Literal["a", "b"]` | Constrained string values (enum-like) |
| `BaseModel` | Pydantic models for nested structures |

### Literal Types for Constrained Outputs

Use `Literal` for controlled output values:

```python
from typing import Literal

class SentimentAnalysis(dspy.Signature):
    """Analyze sentiment of text."""

    text: str = dspy.InputField()

    sentiment: Literal["positive", "negative", "neutral"] = dspy.OutputField()
    confidence: float = dspy.OutputField()
```

### Field Descriptions

Add `desc=` to any field to guide the LLM on expected content:

```python
class ExtractEntities(dspy.Signature):
    """Extract named entities from text."""

    text: str = dspy.InputField(desc="Raw text to analyze")
    language: str = dspy.InputField(default="en", desc="ISO 639-1 language code")

    entities: list[str] = dspy.OutputField(desc="List of extracted entity names")
    count: int = dspy.OutputField(desc="Total number of unique entities found")
```

### Nested Pydantic Models

Use Pydantic `BaseModel` for complex structured outputs:

```python
from pydantic import BaseModel, Field

class Entity(BaseModel):
    name: str = Field(description="The entity text as it appears in the source")
    type: str = Field(description="Entity type: person, organization, location, date")
    confidence: float = Field(description="Extraction confidence from 0.0 to 1.0")

class EntityExtraction(dspy.Signature):
    """Extract named entities from text."""

    text: str = dspy.InputField()
    entities: list[Entity] = dspy.OutputField()
    total_found: int = dspy.OutputField()
```

Pydantic models support recursive types (self-referencing) natively in v2. Call `Model.model_rebuild()` after defining recursive models.

---

## Modules

Modules are composable building blocks that wrap predictors. Define a `forward` method; invoke the module directly with `module(input=value)`.

### Basic Structure

```python
class SentimentAnalyzer(dspy.Module):
    def __init__(self):
        super().__init__()
        self.predictor = dspy.Predict(SentimentSignature)

    def forward(self, text: str):
        return self.predictor(text=text)

analyzer = SentimentAnalyzer()
result = analyzer(text="I love this product!")

result.sentiment    # => "positive"
result.confidence   # => 0.9
```

**API rules:**
- Invoke modules with `module(input=value)`, not `module.forward(input=value)`.
- Access result fields with `result.field`, not `result["field"]`.

### Module Composition

Combine multiple modules through explicit method calls in `forward`:

```python
class DocumentProcessor(dspy.Module):
    def __init__(self):
        super().__init__()
        self.classifier = DocumentClassifier()
        self.summarizer = DocumentSummarizer()

    def forward(self, document: str):
        classification = self.classifier(content=document)
        summary = self.summarizer(content=document)

        return dspy.Prediction(
            document_type=classification.document_type,
            summary=summary.summary,
        )
```

### Assertions and Suggestions

DSPy provides `Assert` (hard constraint) and `Suggest` (soft hint) for output validation:

```python
class ValidatedModule(dspy.Module):
    VALID_CATEGORIES = {"tech", "business", "science"}

    def __init__(self):
        super().__init__()
        self.predictor = dspy.ChainOfThought("text -> category: str, confidence: float")

    def forward(self, text: str):
        result = self.predictor(text=text)

        # Soft: retries if violated, does not raise
        dspy.Suggest(
            result.confidence > 0.5,
            "Confidence should be above 0.5",
        )

        # Hard: raises after retry budget is exhausted
        dspy.Assert(
            result.category.lower() in self.VALID_CATEGORIES,
            f"Category must be one of: {self.VALID_CATEGORIES}",
        )

        return result
```

---

## Predictors

Predictors are execution engines that take a signature and produce structured results from a language model. DSPy provides several predictor types.

### Predict

Direct LLM call with typed input/output. Fastest option, lowest token usage.

```python
classifier = dspy.Predict(ClassifyText)
result = classifier(text="Technical document about APIs")

result.category     # => "technical"
result.confidence   # => 0.92
```

### ChainOfThought

Adds a `reasoning` field to the output automatically. The model generates step-by-step reasoning before the final answer. Do not define a `reasoning` field in the signature output when using ChainOfThought.

```python
class SolveMathProblem(dspy.Signature):
    """Solve mathematical word problems step by step."""

    problem: str = dspy.InputField()
    answer: str = dspy.OutputField()
    # reasoning is added automatically by ChainOfThought

solver = dspy.ChainOfThought(SolveMathProblem)
result = solver(problem="Sarah has 15 apples. She gives 7 away and buys 12 more.")

result.reasoning  # => "Step by step: 15 - 7 = 8, then 8 + 12 = 20"
result.answer     # => "20 apples"
```

Use ChainOfThought for complex analysis, multi-step reasoning, or when explainability matters.

### ReAct

Reasoning + Action agent that uses tools in an iterative loop. Define tools as Python functions with docstrings.

```python
def search(query: str) -> list[str]:
    """Search for information and return relevant results."""
    return ["Result 1", "Result 2"]

class TravelSignature(dspy.Signature):
    """Help users plan travel."""

    destination: str = dspy.InputField()
    recommendations: str = dspy.OutputField()

agent = dspy.ReAct(
    TravelSignature,
    tools=[search],
    max_iters=5,
)

result = agent(destination="Tokyo, Japan")
result.recommendations  # => "Visit Senso-ji Temple early morning..."
```

### ProgramOfThought

Code generation agent that writes and executes Python code to solve problems.

```python
pot = dspy.ProgramOfThought("question -> answer: float")
result = pot(question="What is the factorial of 20?")
```

### Predictor Comparison

| Predictor | Speed | Token Usage | Best For |
|-----------|-------|-------------|----------|
| Predict | Fastest | Low | Classification, extraction |
| ChainOfThought | Moderate | Medium-High | Complex reasoning, analysis |
| ReAct | Slower | High | Multi-step tasks with tools |
| ProgramOfThought | Slowest | Very High | Dynamic programming, calculations |

### Concurrent Predictions

Process multiple independent predictions simultaneously:

```python
import asyncio
import dspy

analyzer = dspy.Predict("content -> sentiment, topics: list[str]")
documents = ["Text one", "Text two", "Text three"]

async def analyze_all():
    tasks = [
        asyncio.to_thread(analyzer, content=doc)
        for doc in documents
    ]
    return await asyncio.gather(*tasks)

results = asyncio.run(analyze_all())
for r in results:
    print(r.sentiment)
```

### Few-Shot Examples

```python
trainset = [
    dspy.Example(text="Love it!", sentiment="positive", confidence=0.95).with_inputs("text"),
    dspy.Example(text="Terrible.", sentiment="negative", confidence=0.90).with_inputs("text"),
]

# Use examples with a teleprompter (optimizer)
from dspy.teleprompt import BootstrapFewShot

optimizer = BootstrapFewShot(metric=my_metric)
optimized = optimizer.compile(classifier, trainset=trainset)
```

---

## Type System

### Automatic Type Conversion

DSPy automatically converts LLM responses to typed Python objects:

- **Literal types**: String values validated against allowed options
- **Pydantic models**: Nested JSON parsed into model instances
- **Lists**: Elements converted recursively
- **Defaults**: Missing fields use declared defaults

### Nesting Depth

- 1-2 levels: reliable across all providers.
- 3-4 levels: works but increases schema complexity.
- 5+ levels: may reduce LLM accuracy. Flatten deeply nested structures or split into multiple signatures.

### Tips

- Prefer `list[X]` with `default_factory=list` over `Optional[list[X]]` for cleaner outputs.
- Use clear field descriptions since they guide the LLM.
- Limit `Literal` types to 5-10 options for reliable model comprehension.
- Use Pydantic `Field(description=...)` for nested model documentation.
