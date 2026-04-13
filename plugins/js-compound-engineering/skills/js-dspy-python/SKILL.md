---
name: js-dspy-python
description: Build type-safe, composable LLM applications with Stanford's DSPy Python framework. Use when implementing predictable AI features, creating LLM signatures and modules, configuring language model providers (OpenAI, Anthropic, Gemini), building agent systems with tools, optimizing prompts, or testing LLM-powered functionality in Python applications. Integrates with Node.js via API/HTTP microservice architecture.
---

# DSPy (Python)

> Build LLM apps like you build software. Type-safe, modular, testable.

DSPy brings software engineering best practices to LLM development. Instead of tweaking prompts, define what you want with Python types and let DSPy handle the rest.

## Overview

DSPy is Stanford's Python framework for building language model applications with programmatic prompts. It provides:

- **Type-safe signatures** -- Define inputs/outputs with Pydantic types
- **Modular components** -- Compose and reuse LLM logic
- **Automatic optimization** -- Use data to improve prompts, not guesswork
- **Production-ready** -- Built-in observability, testing, and error handling

## Core Concepts

### 1. Signatures

Define interfaces between your app and LLMs using Python types:

```python
import dspy

class EmailClassifier(dspy.Signature):
    """Classify customer support emails by category and priority."""

    email_content: str = dspy.InputField()
    sender: str = dspy.InputField()

    category: str = dspy.OutputField()
    priority: str = dspy.OutputField(desc="low, medium, high, or urgent")
    confidence: float = dspy.OutputField()
```

### 2. Modules

Build complex workflows from simple building blocks:

- **Predict** -- Basic LLM calls with signatures
- **ChainOfThought** -- Step-by-step reasoning
- **ReAct** -- Tool-using agents
- **ProgramOfThought** -- Code generation agents

### 3. Tools

Create tools for ReAct agents:

```python
def calculator(expression: str) -> str:
    """Evaluate a math expression."""
    try:
        result = eval(expression)
        return str(result)
    except Exception as e:
        return f"Error: {e}"

def search(query: str) -> str:
    """Search the web for information."""
    # Implementation
    return results

# Use with ReAct
react = dspy.ReAct(
    signature="question -> answer",
    tools=[calculator, search],
)
```

### 4. Optimization

Improve accuracy with real data:

- **BootstrapFewShot** -- Few-shot example selection
- **BootstrapFewShotWithRandomSearch** -- Optimized few-shot
- **MIPROv2** -- Advanced multi-prompt optimization
- **Evaluation** -- Comprehensive testing framework

## Quick Start

```python
# Install
pip install dspy

# Configure
import dspy
lm = dspy.LM('openai/gpt-4o-mini', api_key=os.environ['OPENAI_API_KEY'])
dspy.configure(lm=lm)

# Define a task
class SentimentAnalysis(dspy.Signature):
    """Analyze sentiment of text."""
    text: str = dspy.InputField()
    sentiment: str = dspy.OutputField(desc="positive, negative, or neutral")
    score: float = dspy.OutputField(desc="0.0 to 1.0")

# Use it
analyzer = dspy.Predict(SentimentAnalysis)
result = analyzer(text="This product is amazing!")
print(result.sentiment)  # => "positive"
print(result.score)      # => 0.92
```

## Provider Configuration

DSPy supports multiple LLM providers:

```python
# OpenAI
lm = dspy.LM('openai/gpt-4o-mini', api_key=os.environ['OPENAI_API_KEY'])

# Anthropic
lm = dspy.LM('anthropic/claude-sonnet-4-20250514', api_key=os.environ['ANTHROPIC_API_KEY'])

# Google Gemini
lm = dspy.LM('google/gemini-2.5-flash', api_key=os.environ['GEMINI_API_KEY'])

# Local (Ollama)
lm = dspy.LM('ollama_chat/llama3.2', api_base='http://localhost:11434')
```

## ChainOfThought Module

Step-by-step reasoning before answering:

```python
class FactCheck(dspy.Signature):
    """Check if a claim is factual."""
    claim: str = dspy.InputField()
    verdict: str = dspy.OutputField(desc="true, false, or uncertain")
    reasoning: str = dspy.OutputField()

cot = dspy.ChainOfThought(FactCheck)
result = cot(claim="The Earth is flat")
print(result.reasoning)  # Shows step-by-step analysis
print(result.verdict)    # => "false"
```

## Typed Predictors with Pydantic

Use Pydantic models for structured outputs:

```python
from pydantic import BaseModel, Field
from typing import Literal

class ExtractedEntity(BaseModel):
    name: str
    entity_type: Literal["person", "organization", "location"]
    confidence: float = Field(ge=0.0, le=1.0)

class EntityExtraction(dspy.Signature):
    """Extract named entities from text."""
    text: str = dspy.InputField()
    entities: list[ExtractedEntity] = dspy.OutputField()

extractor = dspy.TypedPredictor(EntityExtraction)
result = extractor(text="Tim Cook announced new products at Apple Park in Cupertino.")
for entity in result.entities:
    print(f"{entity.name} ({entity.entity_type}): {entity.confidence}")
```

## Evaluation Framework

Systematically test LLM application performance:

```python
# Define metric
def exact_match(example, prediction, trace=None):
    return example.answer.lower() == prediction.answer.lower()

# Create evaluator
evaluator = dspy.Evaluate(
    devset=test_examples,
    metric=exact_match,
    num_threads=4,
    display_progress=True,
)

# Run evaluation
score = evaluator(program)
print(f"Accuracy: {score}%")
```

## Optimization

Use data to improve prompts automatically:

```python
# Bootstrap few-shot examples
teleprompter = dspy.BootstrapFewShotWithRandomSearch(
    metric=exact_match,
    max_bootstrapped_demos=4,
    max_labeled_demos=4,
    num_candidate_programs=10,
)

optimized = teleprompter.compile(program, trainset=train_examples)
```

## Integration with Node.js

DSPy runs in Python. To integrate with Node.js applications:

**FastAPI microservice pattern:**

```python
# dspy_service.py
from fastapi import FastAPI
import dspy

app = FastAPI()

lm = dspy.LM('openai/gpt-4o-mini')
dspy.configure(lm=lm)

classifier = dspy.Predict(EmailClassifier)

@app.post("/classify")
async def classify_email(email: dict):
    result = classifier(
        email_content=email["content"],
        sender=email["sender"],
    )
    return {
        "category": result.category,
        "priority": result.priority,
        "confidence": result.confidence,
    }
```

**Call from Node.js:**

```javascript
const response = await fetch('http://localhost:8000/classify', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({content: emailBody, sender: senderEmail}),
});
const result = await response.json();
```

## Testing

### Unit Tests

```python
import pytest
import dspy

def test_sentiment_analysis():
    dspy.configure(lm=dspy.LM('openai/gpt-4o-mini'))
    analyzer = dspy.Predict(SentimentAnalysis)

    result = analyzer(text="This is great!")
    assert result.sentiment in ["positive", "negative", "neutral"]
    assert 0.0 <= result.score <= 1.0
```

### Signature Schema Tests

Test that signatures produce valid schemas without calling any LLM:

```python
def test_email_classifier_signature():
    fields = EmailClassifier.model_fields
    assert "email_content" in fields
    assert "category" in fields
```

## Resources

- `references/core-concepts.md` -- Signatures, modules, predictors, type system
- `references/toolsets.md` -- ReAct tools, tool creation, structured inputs
- `references/providers.md` -- Provider configuration, model selection
- `references/optimization.md` -- BootstrapFewShot, MIPROv2, evaluation
- `references/observability.md` -- Logging, tracing, debugging

## Key URLs

- Homepage: https://dspy.ai/
- GitHub: https://github.com/stanfordnlp/dspy
- Documentation: https://dspy.ai/learn/

## Guidelines for Claude

When helping users with DSPy:

1. **Signatures over prompts** -- Define structure with typed fields, not prose
2. **Pydantic for complex outputs** -- Use BaseModel for nested/structured data
3. **Per-task model selection** -- Use different LMs for different modules
4. **Short-circuit LLM calls** -- Skip the LLM for trivial cases
5. **Evaluate before optimizing** -- Measure baseline, then optimize
6. **Type annotations everywhere** -- Leverage Python typing for clarity
7. **Test schemas without LLM** -- Validate signatures in unit tests
8. **Graceful degradation** -- Handle LLM errors with fallback behavior

## Version

Current: 2.6+
