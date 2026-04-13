# DSPy Optimization

## BootstrapFewShot

The simplest optimizer. Automatically selects few-shot examples from a training set to improve predictor performance.

### Basic Usage

```python
import dspy
from dspy.teleprompt import BootstrapFewShot

# Define a metric
def accuracy_metric(example, pred, trace=None):
    return example.answer.lower() == pred.answer.lower()

# Compile with the optimizer
optimizer = BootstrapFewShot(metric=accuracy_metric, max_bootstrapped_demos=4)
optimized = optimizer.compile(student=my_module, trainset=train_examples)

# Use the optimized module
result = optimized(question="What is DSPy?")
```

### Configuration

| Parameter | Default | Purpose |
|-----------|---------|---------|
| `metric` | required | Evaluation function |
| `max_bootstrapped_demos` | 4 | Max bootstrapped examples to include |
| `max_labeled_demos` | 16 | Max labeled examples to include |
| `max_rounds` | 1 | Bootstrap iterations |

---

## BootstrapFewShotWithRandomSearch

Extends BootstrapFewShot with random search over candidate demo sets. Evaluates multiple random subsets and keeps the best.

```python
from dspy.teleprompt import BootstrapFewShotWithRandomSearch

optimizer = BootstrapFewShotWithRandomSearch(
    metric=accuracy_metric,
    max_bootstrapped_demos=4,
    num_candidate_programs=10,
)
optimized = optimizer.compile(student=my_module, trainset=train_examples)
```

---

## MIPROv2

MIPROv2 (Multi-prompt Instruction Proposal with Retrieval Optimization) is the primary instruction tuner in DSPy. It proposes new instructions and few-shot demonstrations per predictor, evaluates them on mini-batches, and retains candidates that improve the metric.

### Basic Usage

```python
from dspy.teleprompt import MIPROv2

optimizer = MIPROv2(
    metric=accuracy_metric,
    auto="medium",  # "light", "medium", or "heavy"
)
optimized = optimizer.compile(
    student=my_module,
    trainset=train_examples,
    valset=val_examples,
)
```

### Auto Presets

| Preset | Trials | Use case |
|--------|--------|----------|
| `"light"` | ~6 | Quick wins on small datasets or during prototyping |
| `"medium"` | ~12 | Balanced exploration vs. runtime for most pilots |
| `"heavy"` | ~18 | Highest accuracy targets or multi-stage programs |

### Manual Configuration

```python
optimizer = MIPROv2(
    metric=accuracy_metric,
    num_candidates=10,
    num_threads=4,
    max_bootstrapped_demos=4,
    max_labeled_demos=16,
)
optimized = optimizer.compile(
    student=my_module,
    trainset=train_examples,
    valset=val_examples,
    num_trials=15,
    minibatch_size=25,
)
```

### Multi-stage Programs

MIPROv2 generates dataset summaries for each predictor and proposes per-stage instructions. For a ReAct agent, the optimizer handles credit assignment internally. The metric only needs to evaluate the final output.

---

## Evaluation Framework

`dspy.Evaluate` provides batch evaluation of modules against test datasets.

### Basic Usage

```python
from dspy.evaluate import Evaluate

metric = lambda example, pred, trace=None: example.answer == pred.answer

evaluator = Evaluate(
    devset=test_examples,
    metric=metric,
    num_threads=4,
    display_progress=True,
    display_table=5,  # Show first 5 results
)

score = evaluator(my_module)
print(f"Accuracy: {score}%")
```

### DSPy Example

Convert raw data into `dspy.Example` instances before passing to optimizers or evaluators:

```python
examples = [
    dspy.Example(
        question="What is Python?",
        answer="A programming language",
    ).with_inputs("question")
    for row in dataset
]

# Split into train/val/test
train, val, test = examples[:60], examples[60:80], examples[80:]
```

Hold back a test set from the optimization loop. Optimizers work on train/val; only the test set proves generalization.

### Custom Metrics

```python
def quality_metric(example, pred, trace=None):
    """Multi-factor quality metric."""
    score = 0.0

    # Correctness
    if pred.answer.lower() == example.answer.lower():
        score += 0.5

    # Explanation quality
    if hasattr(pred, "reasoning") and len(pred.reasoning) > 50:
        score += 0.3

    # Confidence
    if hasattr(pred, "confidence") and pred.confidence > 0.8:
        score += 0.2

    return score >= 0.7
```

### Integration with Optimizers

```python
# Define metric
metric = lambda example, pred, trace=None: (
    example.answer.lower().strip() in pred.answer.lower().strip()
)

# Optimize
optimizer = MIPROv2(metric=metric, auto="medium")
optimized = optimizer.compile(
    student=dspy.Predict(QASignature),
    trainset=train_examples,
    valset=val_examples,
)

# Evaluate on held-out test set
evaluator = Evaluate(devset=test_examples, metric=metric, num_threads=4)
test_score = evaluator(optimized)
print(f"Test accuracy: {test_score}%")
```

---

## Saving and Loading Optimized Programs

### Save/Load State

```python
# Save optimized program
optimized.save("optimized_classifier.json")

# Load later
loaded = MyModule()
loaded.load("optimized_classifier.json")

# Use the loaded module
result = loaded(text="Test input")
```

### Checkpoint Pattern

```python
import json
from pathlib import Path

def save_checkpoint(module, path: str, metadata: dict = None):
    """Save module state with metadata."""
    checkpoint_dir = Path(path)
    checkpoint_dir.mkdir(parents=True, exist_ok=True)

    module.save(str(checkpoint_dir / "module.json"))

    if metadata:
        with open(checkpoint_dir / "metadata.json", "w") as f:
            json.dump(metadata, f, indent=2)

def load_checkpoint(module_class, path: str):
    """Load module from checkpoint."""
    checkpoint_dir = Path(path)
    module = module_class()
    module.load(str(checkpoint_dir / "module.json"))

    metadata = None
    meta_path = checkpoint_dir / "metadata.json"
    if meta_path.exists():
        with open(meta_path) as f:
            metadata = json.load(f)

    return module, metadata
```

---

## API Rules

- Call modules with `module(input=value)`, not `module.forward(input=value)`.
- Access prediction fields with dot notation (`result.answer`), not dict notation.
- Metrics can return `bool`, `float` (0.0-1.0), or `int` (0 or 1).
- Always hold back a test set from the optimization loop.
- Use `with_inputs()` on examples to mark which fields are inputs vs. expected outputs.
