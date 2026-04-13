# DSPy Observability

DSPy provides built-in observability through logging, tracing, and integration with external platforms like Langfuse and OpenTelemetry.

## Built-in Logging

### Inspect History

DSPy maintains a history of all LM calls. Inspect the last N calls:

```python
import dspy

lm = dspy.LM("openai/gpt-4o-mini")
dspy.configure(lm=lm)

# After running predictions...
lm.inspect_history(n=3)  # Print last 3 LM calls with prompts and responses
```

### Verbose Logging

Enable verbose output for debugging:

```python
import logging
logging.basicConfig(level=logging.DEBUG)

# Or use DSPy's built-in setting
dspy.configure(lm=lm, trace=[])
```

## Langfuse Integration

Langfuse provides production-grade tracing, scoring, and prompt management for LLM applications.

### Environment Variables

```bash
# Required
export LANGFUSE_PUBLIC_KEY=pk-lf-your-public-key
export LANGFUSE_SECRET_KEY=sk-lf-your-secret-key

# Optional (defaults to https://cloud.langfuse.com)
export LANGFUSE_HOST=https://us.cloud.langfuse.com
```

### Using the Langfuse Decorator

Wrap DSPy module calls with the `@observe()` decorator for automatic tracing:

```python
import dspy
from langfuse.decorators import observe

lm = dspy.LM("openai/gpt-4o-mini")
dspy.configure(lm=lm)

class QAModule(dspy.Module):
    def __init__(self):
        super().__init__()
        self.predictor = dspy.ChainOfThought("question -> answer")

    def forward(self, question: str):
        return self.predictor(question=question)

@observe()
def run_qa(question: str):
    qa = QAModule()
    return qa(question=question)

result = run_qa("What is DSPy?")
```

Langfuse receives hierarchical traces:

```
Trace: abc-123-def
+-- run_qa [2000ms]
    +-- QAModule.forward [1800ms]
        +-- LM call [1000ms]
            Model: gpt-4o-mini
            Tokens: 100 in / 50 out / 150 total
```

### Score Reporting

Report evaluation scores to Langfuse:

```python
from langfuse import Langfuse

langfuse = Langfuse()

# Numeric score
langfuse.score(
    trace_id="trace-id",
    name="accuracy",
    value=0.95,
)

# Categorical score
langfuse.score(
    trace_id="trace-id",
    name="sentiment",
    value="positive",
)

# With comment
langfuse.score(
    trace_id="trace-id",
    name="relevance",
    value=0.87,
    comment="High semantic similarity",
)
```

### Automatic Tracing with DSPy Callback

DSPy 2.6+ supports a callback-based approach for Langfuse:

```python
import dspy
from langfuse.dspy import LangfuseDSPyCallback

langfuse_callback = LangfuseDSPyCallback()

lm = dspy.LM("openai/gpt-4o-mini")
dspy.configure(lm=lm, callbacks=[langfuse_callback])

# All subsequent DSPy calls are automatically traced
predictor = dspy.Predict("question -> answer")
result = predictor(question="What is DSPy?")
```

## OpenTelemetry Integration

For teams using OpenTelemetry-based observability stacks:

```python
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import SimpleSpanProcessor, ConsoleSpanExporter

# Set up tracing
provider = TracerProvider()
provider.add_span_processor(SimpleSpanProcessor(ConsoleSpanExporter()))
trace.set_tracer_provider(provider)
tracer = trace.get_tracer(__name__)

# Wrap DSPy calls in spans
@observe()
def traced_prediction(text: str):
    with tracer.start_as_current_span("classify_text") as span:
        span.set_attribute("input.length", len(text))
        result = classifier(text=text)
        span.set_attribute("output.category", result.category)
        return result
```

## Token Tracking

Track token usage across predictions:

```python
import dspy

lm = dspy.LM("openai/gpt-4o-mini")
dspy.configure(lm=lm)

# After running predictions, check history for token counts
for call in lm.history:
    print(f"Tokens: {call.get('usage', {})}")
```

### Budget Tracking Pattern

```python
class TokenBudgetTracker:
    def __init__(self, budget: int):
        self.budget = budget
        self.usage = 0

    def check(self, lm):
        """Check token usage from LM history."""
        for call in lm.history:
            usage = call.get("usage", {})
            self.usage += usage.get("total_tokens", 0)

        if self.usage >= self.budget:
            raise RuntimeError(f"Token budget exceeded: {self.usage}/{self.budget}")
```

## Best Practices

- Use `@observe()` decorator from Langfuse for production tracing -- minimal code overhead.
- Use `lm.inspect_history()` during development for quick debugging.
- Track token usage to prevent cost overruns in production.
- Use structured logging (JSON format) in production for log aggregation.
- Set up alerts on token usage spikes and error rates.
- Use DSPy callbacks for automatic instrumentation without decorating every function.
