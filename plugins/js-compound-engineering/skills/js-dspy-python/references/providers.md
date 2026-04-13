# DSPy LLM Providers

## Provider Architecture

DSPy uses litellm under the hood for multi-provider routing. This means any provider supported by litellm works with DSPy out of the box. Configure providers by passing the model string with a provider prefix to `dspy.LM()`.

```python
import dspy

# Each provider uses a prefix
lm = dspy.LM("openai/gpt-4o-mini", api_key="sk-...")
lm = dspy.LM("anthropic/claude-sonnet-4-20250514", api_key="sk-ant-...")
lm = dspy.LM("google/gemini-2.5-flash", api_key="...")
```

---

## Per-Provider Configuration

### OpenAI

```python
lm = dspy.LM(
    "openai/gpt-4o-mini",
    api_key=os.environ["OPENAI_API_KEY"],
)
```

### Anthropic (Claude)

```python
lm = dspy.LM(
    "anthropic/claude-sonnet-4-20250514",
    api_key=os.environ["ANTHROPIC_API_KEY"],
)
```

### Google Gemini

```python
lm = dspy.LM(
    "google/gemini-2.5-flash",
    api_key=os.environ["GEMINI_API_KEY"],
)
```

### Ollama (Local Models)

```python
# No API key required
lm = dspy.LM(
    "ollama_chat/llama3.2",
    api_base="http://localhost:11434",
)

# Remote Ollama instance
lm = dspy.LM(
    "ollama_chat/llama3.2",
    api_base="https://my-ollama.example.com",
    api_key="optional-auth-token",
)
```

### OpenRouter (200+ Models)

```python
lm = dspy.LM(
    "openrouter/anthropic/claude-3.5-sonnet",
    api_key=os.environ["OPENROUTER_API_KEY"],
)

# Free models
lm = dspy.LM(
    "openrouter/x-ai/grok-4-fast:free",
    api_key=os.environ["OPENROUTER_API_KEY"],
)
```

### AWS Bedrock

```python
lm = dspy.LM(
    "bedrock/anthropic.claude-3-5-sonnet-20241022-v2:0",
    aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
    aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    aws_region_name="us-east-1",
)
```

### Azure OpenAI

```python
lm = dspy.LM(
    "azure/gpt-4o-mini",
    api_key=os.environ["AZURE_API_KEY"],
    api_base=os.environ["AZURE_API_BASE"],
    api_version="2024-02-01",
)
```

### Together AI

```python
lm = dspy.LM(
    "together_ai/meta-llama/Llama-3.2-70B-Instruct-Turbo",
    api_key=os.environ["TOGETHER_API_KEY"],
)
```

---

## Application Setup Patterns

### Django / Flask / FastAPI

Configure DSPy at application startup:

```python
# Django — in settings.py or AppConfig.ready()
import dspy
import os

lm = dspy.LM("openai/gpt-4o-mini", api_key=os.environ.get("OPENAI_API_KEY"))
dspy.configure(lm=lm)
```

```python
# FastAPI — in lifespan
from contextlib import asynccontextmanager
from fastapi import FastAPI
import dspy

@asynccontextmanager
async def lifespan(app: FastAPI):
    lm = dspy.LM("openai/gpt-4o-mini", api_key=os.environ["OPENAI_API_KEY"])
    dspy.configure(lm=lm)
    yield

app = FastAPI(lifespan=lifespan)
```

Key points:

- Configure at startup so all modules share the same LM.
- Use environment variables for API keys, never hardcode.
- In test environments, use cheap models or mock the LM.

---

## Context-Local LM Override

`dspy.context(lm=...)` sets a temporary language-model override scoped to the `with` block:

```python
fast_lm = dspy.LM("openai/gpt-4o-mini")
powerful_lm = dspy.LM("anthropic/claude-sonnet-4-20250514")

classifier = MyClassifier()

# Uses the global LM
result = classifier(text="Hello")

# Temporarily switch to the fast model
with dspy.context(lm=fast_lm):
    result = classifier(text="Hello")   # uses gpt-4o-mini

# Temporarily switch to the powerful model
with dspy.context(lm=powerful_lm):
    result = classifier(text="Hello")   # uses claude-sonnet-4
```

---

## Feature-Flagged Model Selection

Use environment variables to centralize model selection:

```python
import os
import dspy

SELECTOR_MODEL = os.environ.get("DSPY_SELECTOR_MODEL", "openai/gpt-4o-mini")
SYNTHESIZER_MODEL = os.environ.get("DSPY_SYNTHESIZER_MODEL", "openai/gpt-4o")
REASONING_MODEL = os.environ.get("DSPY_REASONING_MODEL", "anthropic/claude-sonnet-4-20250514")
```

### Per-Module Model Override

```python
class ClassifierModule(dspy.Module):
    def __init__(self, model: str = None):
        super().__init__()
        self.predictor = dspy.Predict(ClassifySignature)
        self.lm = dspy.LM(model or SELECTOR_MODEL) if model else None

    def forward(self, text: str):
        if self.lm:
            with dspy.context(lm=self.lm):
                return self.predictor(text=text)
        return self.predictor(text=text)
```

Override models via environment without touching code:

```bash
# .env
DSPY_SELECTOR_MODEL=openai/gpt-4o-mini
DSPY_SYNTHESIZER_MODEL=openai/gpt-4o
DSPY_REASONING_MODEL=anthropic/claude-sonnet-4-20250514
```

---

## Compatibility Matrix

| Feature | OpenAI | Anthropic | Gemini | Ollama | OpenRouter |
|---------|--------|-----------|--------|--------|------------|
| Structured Output | Native JSON mode | Tool-based | Native JSON schema | OpenAI-compatible | Varies by model |
| Vision (Images) | Yes | Yes | Yes | Limited | Varies |
| Tool Calling | Yes | Yes | Yes | Varies | Varies |
| Streaming | Yes | Yes | Yes | Yes | Yes |
| Async | Yes | Yes | Yes | Yes | Yes |

### Choosing a Provider

| Scenario | Recommended Provider |
|----------|---------------------|
| General purpose, cost-effective | OpenAI (`gpt-4o-mini`) |
| Complex reasoning, analysis | Anthropic (`claude-sonnet-4`) |
| Fast, cost-effective | Google (`gemini-2.5-flash`) |
| Local development, zero cost | Ollama (`llama3.2`) |
| Multi-provider routing | OpenRouter |
| Enterprise / AWS | Bedrock |
| Enterprise / Azure | Azure OpenAI |

### Current Recommended Models

| Provider | Model ID | Use Case |
|----------|----------|----------|
| OpenAI | `openai/gpt-4o-mini` | Fast, cost-effective |
| Anthropic | `anthropic/claude-sonnet-4-20250514` | Balanced reasoning |
| Google | `google/gemini-2.5-flash` | Fast, cost-effective |
| Ollama | `ollama_chat/llama3.2` | Local, zero API cost |
