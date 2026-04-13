# DSPy Tools

## Defining Tools

In DSPy Python, tools are regular Python functions with type hints and docstrings. DSPy inspects the function signature and docstring to generate the schema the LLM uses to invoke the tool.

### Basic Tool

```python
def weather_lookup(city: str, units: str = "fahrenheit") -> str:
    """Look up current weather for a given city.

    Args:
        city: The city name to look up weather for.
        units: Temperature units - fahrenheit or celsius.
    """
    return f"72F and sunny in {city}"
```

Key points:

- Use regular Python functions with type hints.
- Provide a clear docstring -- the LLM sees this as the tool description.
- Use keyword arguments with defaults for optional parameters.
- Return a string (the LLM consumes the return value as an observation).

### Tool with Complex Types

```python
from pydantic import BaseModel, Field

class SearchResult(BaseModel):
    title: str
    url: str
    snippet: str

def search(query: str, max_results: int = 5) -> list[SearchResult]:
    """Search for information by query.

    Args:
        query: The search query.
        max_results: Maximum number of results to return.
    """
    return [
        SearchResult(
            title="Result 1",
            url="https://example.com",
            snippet="Relevant information...",
        )
    ]
```

### Using Tools with ReAct

Pass tool functions in a list to `dspy.ReAct`:

```python
import dspy

class ResearchSignature(dspy.Signature):
    """Research a question and provide a comprehensive answer."""
    question: str = dspy.InputField()
    answer: str = dspy.OutputField()

agent = dspy.ReAct(
    ResearchSignature,
    tools=[weather_lookup, search],
    max_iters=5,
)

result = agent(question="What is the weather in Berlin?")
print(result.answer)
```

Access output fields with dot notation (`result.answer`), not dict access (`result["answer"]`).

---

## Tool Classes with dspy.Tool

For tools that need shared state, wrap a callable class:

```python
class DatabaseTool:
    """Database query tool with connection pooling."""

    def __init__(self, connection_string: str):
        self.conn = create_connection(connection_string)

    def query(self, sql: str) -> str:
        """Run a read-only SQL query.

        Args:
            sql: The SQL query to execute.
        """
        results = self.conn.execute(sql)
        return str(results.fetchall())

    def insert(self, table: str, data: dict) -> str:
        """Insert a record into a table.

        Args:
            table: Target table name.
            data: Key-value pairs for the record.
        """
        # Implementation
        return f"Inserted into {table}"

# Use individual methods as tools
db = DatabaseTool("postgresql://localhost/mydb")
agent = dspy.ReAct(
    MySignature,
    tools=[db.query, db.insert],
)
```

---

## Type Safety

Python type hints on tool functions drive schema generation:

### Basic Types

```python
def analyze(
    text: str,
    count: int,
    score: float,
    enabled: bool,
    threshold: float = 0.5,
) -> str:
    """Analyze text with various parameters."""
    ...
```

| Python Type | JSON Schema |
|-------------|-------------|
| `str` | `{"type": "string"}` |
| `int` | `{"type": "integer"}` |
| `float` | `{"type": "number"}` |
| `bool` | `{"type": "boolean"}` |
| `list[str]` | `{"type": "array", "items": {"type": "string"}}` |
| `dict[str, Any]` | `{"type": "object"}` |
| `Optional[str]` | `{"type": "string"}` (not required) |
| `Literal["a", "b"]` | `{"type": "string", "enum": ["a", "b"]}` |
| `BaseModel` | `{"type": "object", "properties": {...}}` |

### Literal Parameters

Use `Literal` for constrained parameter values:

```python
from typing import Literal

def update_task(
    priority: Literal["low", "medium", "high", "critical"],
    status: Literal["pending", "in_progress", "completed"],
) -> str:
    """Update task priority and status."""
    return f"Updated to {priority} / {status}"
```

### Optional Parameters

Mark optional parameters with `Optional` or a default value of `None`:

```python
from typing import Optional

def search(
    query: str,
    max_results: Optional[int] = None,
    filter_type: Optional[str] = None,
) -> str:
    """Search with optional filters."""
    ...
```

---

## Built-in Tool Patterns

### Web Search Tool

```python
import requests

def web_search(query: str, num_results: int = 5) -> str:
    """Search the web for information.

    Args:
        query: Search query.
        num_results: Number of results to return.
    """
    # Implementation with your preferred search API
    response = requests.get(
        "https://api.search.example.com/search",
        params={"q": query, "num": num_results},
    )
    return response.text
```

### File System Tool

```python
from pathlib import Path

def read_file(path: str) -> str:
    """Read the contents of a file.

    Args:
        path: Path to the file to read.
    """
    return Path(path).read_text()

def list_directory(path: str = ".") -> str:
    """List files in a directory.

    Args:
        path: Directory path to list.
    """
    entries = list(Path(path).iterdir())
    return "\n".join(str(e) for e in entries)
```

### Calculator Tool

```python
def calculate(expression: str) -> str:
    """Evaluate a mathematical expression safely.

    Args:
        expression: A mathematical expression to evaluate (e.g., "2 + 3 * 4").
    """
    # Use a safe evaluator, not eval()
    import ast
    import operator

    ops = {
        ast.Add: operator.add,
        ast.Sub: operator.sub,
        ast.Mult: operator.mul,
        ast.Div: operator.truediv,
    }

    def _eval(node):
        if isinstance(node, ast.Constant):
            return node.value
        elif isinstance(node, ast.BinOp):
            return ops[type(node.op)](_eval(node.left), _eval(node.right))
        raise ValueError(f"Unsupported: {ast.dump(node)}")

    tree = ast.parse(expression, mode="eval")
    result = _eval(tree.body)
    return str(result)
```

---

## Testing

### Unit Testing Tools

Test tools by calling them directly:

```python
def test_weather_lookup():
    result = weather_lookup(city="Berlin")
    assert "Berlin" in result

def test_weather_lookup_default_units():
    result = weather_lookup(city="Tokyo")
    assert isinstance(result, str)
```

### Mocking Tools in Agent Tests

```python
from unittest.mock import patch

def test_research_agent():
    """Test agent with mocked tools."""
    def mock_search(query: str) -> str:
        return "Mocked search result for testing"

    agent = dspy.ReAct(
        ResearchSignature,
        tools=[mock_search],
        max_iters=3,
    )

    # Use a test LM
    with dspy.context(lm=dspy.LM("openai/gpt-4o-mini")):
        result = agent(question="Test question")
        assert result.answer
```

---

## Constraints

- Tool functions should return strings. The LLM consumes return values as text observations.
- Use clear, descriptive docstrings -- the LLM uses them to decide when and how to call the tool.
- Each function is an independent tool. Method chaining within a single tool call is not supported.
- Type hints are required for schema generation. Functions without type hints produce empty schemas.
- Keep tool implementations focused and single-purpose. Complex multi-step logic should be split across multiple tools.
