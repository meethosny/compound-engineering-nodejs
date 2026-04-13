# =============================================================================
# DSPy Signature Template — Python (dspy 2.6+)
#
# Signatures define the interface between your application and LLMs.
# They specify inputs, outputs, and a task description using Python types.
#
# Key patterns:
#   - Use dspy.Signature for typed interfaces
#   - Use Literal[] for constrained outputs (enums)
#   - Use dspy.InputField() / dspy.OutputField() with desc= for field guidance
#   - Use Pydantic models for nested structures
#   - Access results with result.field
#   - Invoke with predictor(input=value)
# =============================================================================

import dspy
from typing import Literal, Optional
from pydantic import BaseModel, Field

# --- Basic Signature (inline string) ---

# Quick definition for simple cases:
#   predictor = dspy.Predict("text -> sentiment, score: float")
#   result = predictor(text="This product is amazing!")
#   result.sentiment  # => "positive"
#   result.score      # => 0.92

# --- Class-Based Signature ---

class SentimentAnalysis(dspy.Signature):
    """Analyze sentiment of text."""

    text: str = dspy.InputField()

    sentiment: Literal["positive", "negative", "neutral"] = dspy.OutputField()
    score: float = dspy.OutputField(desc="Confidence score from 0.0 to 1.0")

# Usage:
#   predictor = dspy.Predict(SentimentAnalysis)
#   result = predictor(text="This product is amazing!")
#   result.sentiment  # => "positive"
#   result.score      # => 0.92


# --- Signature with Default Values ---

class SmartSearch(dspy.Signature):
    """Search with intelligent defaults."""

    query: str = dspy.InputField()
    max_results: int = dspy.InputField(default=10)
    language: str = dspy.InputField(default="English")

    results: list[str] = dspy.OutputField()
    total_found: int = dspy.OutputField()

# Input defaults reduce boilerplate:
#   search = dspy.Predict(SmartSearch)
#   result = search(query="Python programming")
#   # max_results=10, language="English" are applied


# --- Signature with Nested Pydantic Models ---

class Entity(BaseModel):
    """A named entity extracted from text."""
    name: str = Field(description="The entity text as it appears in the source")
    type: Literal["person", "organization", "location", "date"] = Field(
        description="Entity type classification"
    )
    confidence: float = Field(description="Extraction confidence from 0.0 to 1.0")


class EntityExtraction(dspy.Signature):
    """Extract named entities from text."""

    text: str = dspy.InputField()
    entity_types: Optional[list[str]] = dspy.InputField(
        default=None,
        desc="Filter to these entity types; None means all types",
    )

    entities: list[Entity] = dspy.OutputField()
    total_found: int = dspy.OutputField()


# --- Signature with Structured Output ---

class ClassificationResult(BaseModel):
    """Structured classification output."""
    category: Literal["technical", "business", "personal"] = Field(
        description="Primary category"
    )
    subcategory: str = Field(description="More specific classification")
    confidence: float = Field(description="Confidence from 0.0 to 1.0")
    reasoning: str = Field(description="Brief explanation of the classification")


class StructuredClassification(dspy.Signature):
    """Classify input text with structured result."""

    text: str = dspy.InputField()
    result: ClassificationResult = dspy.OutputField()


# --- Signature for Document Parsing ---

class TreeNode(BaseModel):
    """A node in a document tree structure."""
    node_type: Literal["heading", "paragraph", "list", "code_block"] = Field(
        description="The type of document element"
    )
    text: str = Field(default="", description="Text content of the node")
    level: int = Field(default=0, description="Heading level (1-6) for heading nodes")
    children: list["TreeNode"] = Field(
        default_factory=list,
        description="Child nodes",
    )

# Pydantic v2 handles recursive models natively.
TreeNode.model_rebuild()


class DocumentParser(dspy.Signature):
    """Parse document into tree structure."""

    html: str = dspy.InputField(desc="Raw HTML to parse")

    root: TreeNode = dspy.OutputField()
    word_count: int = dspy.OutputField()


# --- Image Analysis Signature ---

class ImageAnalysis(dspy.Signature):
    """Analyze an image and answer questions about its content."""

    image: dspy.Image = dspy.InputField(desc="The image to analyze")
    question: str = dspy.InputField(desc="Question about the image content")

    answer: str = dspy.OutputField()
    confidence: float = dspy.OutputField(desc="Confidence in the answer (0.0-1.0)")

# Vision usage:
#   predictor = dspy.Predict(ImageAnalysis)
#   result = predictor(
#       image=dspy.Image.from_file("path/to/image.jpg"),
#       question="What objects are visible?",
#   )
#   result.answer  # => "The image shows..."


# --- Multi-Hop Question Answering ---

class GenerateSearchQuery(dspy.Signature):
    """Write a simple search query that will help answer a complex question."""

    context: list[str] = dspy.InputField(desc="May contain relevant facts")
    question: str = dspy.InputField()

    query: str = dspy.OutputField()


class GenerateAnswer(dspy.Signature):
    """Answer questions with short factoid answers."""

    context: list[str] = dspy.InputField(desc="May contain relevant facts")
    question: str = dspy.InputField()

    answer: str = dspy.OutputField(desc="Often between 1 and 5 words")
