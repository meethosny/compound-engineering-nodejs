# =============================================================================
# DSPy Module Template — Python (dspy 2.6+)
#
# Modules orchestrate predictors, tools, and business logic.
#
# Key patterns:
#   - Subclass dspy.Module and implement forward()
#   - Call modules directly: module(input=value)
#   - Use dspy.context(lm=...) for temporary model overrides
#   - Use dspy.Tool for tool definitions
# =============================================================================

import dspy

# --- Basic Module ---

class BasicClassifier(dspy.Module):
    def __init__(self):
        super().__init__()
        self.predictor = dspy.Predict("text -> category, confidence: float")

    def forward(self, text: str):
        return self.predictor(text=text)

# Usage:
#   classifier = BasicClassifier()
#   result = classifier(text="This is a test")
#   result.category   # => "technical"
#   result.confidence  # => 0.95


# --- Module with Chain of Thought ---

class ReasoningClassifier(dspy.Module):
    def __init__(self):
        super().__init__()
        self.predictor = dspy.ChainOfThought("text -> category, confidence: float")

    def forward(self, text: str):
        result = self.predictor(text=text)
        # ChainOfThought adds result.reasoning automatically
        return result


# --- Module with Typed Signature ---

class ClassificationSignature(dspy.Signature):
    """Classify text into a category with confidence score."""

    text: str = dspy.InputField()
    category: str = dspy.OutputField()
    confidence: float = dspy.OutputField(desc="Confidence from 0.0 to 1.0")


class TypedClassifier(dspy.Module):
    def __init__(self):
        super().__init__()
        self.predictor = dspy.Predict(ClassificationSignature)

    def forward(self, text: str):
        return self.predictor(text=text)


# --- Module with Tools (ReAct) ---

def search(query: str, max_results: int = 5) -> list[dict]:
    """Search for information by query."""
    return [{"title": "Result 1", "url": "https://example.com"}]


def finish(answer: str) -> str:
    """Submit the final answer."""
    return answer


class ResearchSignature(dspy.Signature):
    """Research a question and provide a comprehensive answer."""

    question: str = dspy.InputField()
    answer: str = dspy.OutputField()


class ResearchAgent(dspy.Module):
    def __init__(self):
        super().__init__()
        self.agent = dspy.ReAct(
            ResearchSignature,
            tools=[search, finish],
            max_iters=5,
        )

    def forward(self, question: str):
        return self.agent(question=question)


# --- Module with Per-Task Model Selection ---

class SmartRouter(dspy.Module):
    def __init__(self):
        super().__init__()
        self.classifier = dspy.Predict("text -> route: str, requires_deep_analysis: bool")
        self.analyzer = dspy.ChainOfThought("text -> analysis: str, recommendation: str")

        self.fast_lm = dspy.LM(
            model="openai/gpt-4o-mini",
        )
        self.powerful_lm = dspy.LM(
            model="anthropic/claude-sonnet-4-20250514",
        )

    def forward(self, text: str):
        # Use fast model for classification
        with dspy.context(lm=self.fast_lm):
            route = self.classifier(text=text)

        if route.requires_deep_analysis:
            # Switch to powerful model for analysis
            with dspy.context(lm=self.powerful_lm):
                return self.analyzer(text=text)
        return route


# --- Multi-Step Pipeline ---

class AnalysisPipeline(dspy.Module):
    def __init__(self):
        super().__init__()
        self.classifier = dspy.Predict("text -> category: str")
        self.analyzer = dspy.ChainOfThought("text, category -> analysis: str")
        self.summarizer = dspy.Predict("analysis, category -> summary: str")

    def forward(self, text: str):
        classification = self.classifier(text=text)
        analysis = self.analyzer(text=text, category=classification.category)
        return self.summarizer(
            analysis=analysis.analysis,
            category=classification.category,
        )


# --- Module with Assertions ---

class ValidatedClassifier(dspy.Module):
    """Classifier that enforces output constraints via DSPy assertions."""

    VALID_CATEGORIES = {"technical", "business", "personal", "support"}

    def __init__(self):
        super().__init__()
        self.predictor = dspy.ChainOfThought("text -> category: str, confidence: float")

    def forward(self, text: str):
        result = self.predictor(text=text)

        # Soft suggestion -- retries if violated
        dspy.Suggest(
            result.confidence > 0.5,
            "Confidence should be above 0.5 for reliable classification",
        )

        # Hard constraint -- raises if violated after retries
        dspy.Assert(
            result.category.lower() in self.VALID_CATEGORIES,
            f"Category must be one of: {self.VALID_CATEGORIES}",
        )

        return result


# --- Tool That Wraps a Prediction ---

class RerankSignature(dspy.Signature):
    """Score and rank items by relevance to the query."""

    query: str = dspy.InputField()
    items: list[str] = dspy.InputField()
    ranked_items: list[str] = dspy.OutputField(desc="Items reordered by relevance")


class Reranker(dspy.Module):
    MAX_ITEMS = 200
    MIN_ITEMS_FOR_LLM = 5

    def __init__(self):
        super().__init__()
        self.predictor = dspy.Predict(RerankSignature)

    def forward(self, query: str, items: list[str]):
        # Short-circuit: skip LLM for small sets
        if len(items) < self.MIN_ITEMS_FOR_LLM:
            return dspy.Prediction(ranked_items=items, reranked=False)

        # Cap to prevent token overflow
        capped_items = items[: self.MAX_ITEMS]

        try:
            result = self.predictor(query=query, items=capped_items)
            return dspy.Prediction(ranked_items=result.ranked_items, reranked=True)
        except Exception as e:
            return dspy.Prediction(ranked_items=items, reranked=False, error=str(e))

# Key patterns for tools wrapping predictions:
#   - Short-circuit LLM calls when unnecessary (small data, trivial cases)
#   - Cap input size to prevent token overflow
#   - Per-task model selection via dspy.context(lm=...)
#   - Graceful error handling with fallback data
