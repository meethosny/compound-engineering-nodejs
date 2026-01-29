---
name: js-dspy-python
description: Build type-safe, composable LLM applications with Stanford's DSPy Python framework. Use this skill when implementing predictable AI features, creating LLM signatures and modules, configuring language model providers (OpenAI, Anthropic, Gemini), building agent systems with tools, optimizing prompts, or testing LLM-powered functionality. Integrates with Node.js via API/HTTP microservice architecture.
---

# DSPy Python Framework

Build type-safe, composable LLM applications using Stanford's DSPy framework - the canonical implementation for programming (not prompting) language models.

**Repository**: https://github.com/stanfordnlp/dspy
**Documentation**: https://dspy.ai/

## Why DSPy?

DSPy lets you **program LLMs, not prompt them**. Instead of manually crafting prompts, define application requirements through type-safe, composable modules that can be tested, optimized, and version-controlled like regular code.

### First Principles Decision

Using original Python DSPy instead of JS alternatives because:
1. Stanford's DSPy is the canonical, most mature implementation
2. Python ML ecosystem is richer for LLM optimization
3. Microservice architecture keeps concerns separated
4. Node.js app calls Python DSPy service via HTTP/gRPC

## Quick Start

### Installation

```bash
pip install dspy
```

### Basic Configuration

```python
import dspy

# Configure language model
lm = dspy.LM('openai/gpt-4o-mini', api_key='your-key')
dspy.configure(lm=lm)
```

## Core Concepts

### Signatures

Define input/output structure for LLM calls:

```python
# Simple signature using docstring
class Summarize(dspy.Signature):
    """Summarize the given text concisely."""
    text: str = dspy.InputField()
    summary: str = dspy.OutputField()

# With detailed descriptions
class ExtractEntities(dspy.Signature):
    """Extract named entities from text."""
    text: str = dspy.InputField(desc="The input text to analyze")
    entities: list[str] = dspy.OutputField(desc="List of named entities found")
```

### Modules

Composable units that use signatures:

```python
# Basic module
summarizer = dspy.Predict(Summarize)
result = summarizer(text="Long article content here...")
print(result.summary)

# Chain of Thought for complex reasoning
cot_summarizer = dspy.ChainOfThought(Summarize)
result = cot_summarizer(text="Complex document...")
print(result.reasoning)  # Shows the reasoning
print(result.summary)
```

### Custom Modules

Build complex pipelines:

```python
class RAGPipeline(dspy.Module):
    def __init__(self, num_passages=3):
        self.retrieve = dspy.Retrieve(k=num_passages)
        self.generate = dspy.ChainOfThought('context, question -> answer')
    
    def forward(self, question):
        context = self.retrieve(question).passages
        return self.generate(context=context, question=question)

# Usage
rag = RAGPipeline()
answer = rag(question="What is DSPy?")
```

## Provider Configuration

```python
import dspy

# OpenAI
lm = dspy.LM('openai/gpt-4o', api_key='sk-...')

# Anthropic Claude
lm = dspy.LM('anthropic/claude-3-5-sonnet-20241022', api_key='sk-ant-...')

# Google Gemini
lm = dspy.LM('google/gemini-1.5-pro', api_key='...')

# Ollama (local)
lm = dspy.LM('ollama/llama3.2', api_base='http://localhost:11434')

# Apply configuration
dspy.configure(lm=lm)
```

## Integration with Node.js

### HTTP API Pattern (Recommended)

Create a FastAPI service to expose DSPy functionality:

```python
# dspy_service.py
from fastapi import FastAPI
from pydantic import BaseModel
import dspy

app = FastAPI()
dspy.configure(lm=dspy.LM('openai/gpt-4o-mini'))

class SummarizeRequest(BaseModel):
    text: str

class SummarizeResponse(BaseModel):
    summary: str

class Summarize(dspy.Signature):
    """Summarize text concisely."""
    text: str = dspy.InputField()
    summary: str = dspy.OutputField()

summarizer = dspy.Predict(Summarize)

@app.post("/summarize", response_model=SummarizeResponse)
def summarize(req: SummarizeRequest):
    result = summarizer(text=req.text)
    return SummarizeResponse(summary=result.summary)
```

### Calling from Node.js

```javascript
// node-client.js
const summarize = async (text) => {
  const response = await fetch('http://localhost:8000/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  return response.json();
};

const result = await summarize('Long article text...');
console.log(result.summary);
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
CMD ["uvicorn", "dspy_service:app", "--host", "0.0.0.0", "--port", "8000"]
```

```yaml
# docker-compose.yml
services:
  dspy-service:
    build: ./dspy-service
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
  
  node-app:
    build: ./node-app
    depends_on:
      - dspy-service
    environment:
      - DSPY_SERVICE_URL=http://dspy-service:8000
```

## Optimizers

DSPy can automatically optimize prompts:

```python
from dspy.teleprompt import BootstrapFewShot

# Define your module
module = dspy.ChainOfThought(Summarize)

# Create optimizer
optimizer = BootstrapFewShot(metric=your_metric_fn)

# Optimize with training examples
optimized_module = optimizer.compile(module, trainset=training_examples)
```

## Assertions & Validation

```python
class ValidatedSummary(dspy.Module):
    def __init__(self):
        self.summarize = dspy.ChainOfThought(Summarize)
    
    def forward(self, text):
        result = self.summarize(text=text)
        
        # Assert constraints
        dspy.Assert(
            len(result.summary.split()) <= 50,
            "Summary must be 50 words or less"
        )
        
        return result
```

## Testing

```python
# test_dspy_modules.py
import pytest
import dspy

class TestSummarizer:
    def setup_method(self):
        # Use a deterministic model for testing
        dspy.configure(lm=dspy.LM('openai/gpt-4o-mini', temperature=0))
    
    def test_summarize_returns_shorter_text(self):
        summarizer = dspy.Predict(Summarize)
        result = summarizer(text="A" * 1000)
        assert len(result.summary) < 1000
    
    def test_summarize_preserves_key_info(self):
        summarizer = dspy.Predict(Summarize)
        result = summarizer(text="Python is a programming language.")
        assert "python" in result.summary.lower()
```

## Project Structure

```
dspy-service/
├── app/
│   ├── __init__.py
│   ├── main.py           # FastAPI app
│   ├── modules/          # DSPy modules
│   │   ├── __init__.py
│   │   ├── summarizer.py
│   │   └── qa.py
│   └── config.py         # LM configuration
├── tests/
│   └── test_modules.py
├── requirements.txt
├── Dockerfile
└── docker-compose.yml
```

## Resources

- **DSPy Documentation**: https://dspy.ai/
- **GitHub Repository**: https://github.com/stanfordnlp/dspy
- **DSPy Paper**: https://arxiv.org/abs/2310.03714
- **Examples**: https://github.com/stanfordnlp/dspy/tree/main/examples
