# =============================================================================
# DSPy Configuration Template — Python (dspy 2.6+)
#
# Application setup patterns for DSPy with multi-provider routing,
# observability, and feature-flagged model selection.
#
# Key patterns:
#   - Use dspy.configure() for global LM setup
#   - Use provider prefixes for multi-provider routing
#   - Use structured outputs for reliable parsing
#   - Use environment variables for model selection
# =============================================================================

# =============================================================================
# Dependencies (requirements.txt / pyproject.toml)
# =============================================================================
#
# # Core
# dspy>=2.6
#
# # Provider SDKs (install the ones you need):
# openai>=1.0
# anthropic>=0.25
# google-generativeai>=0.5
#
# # Observability (optional)
# langfuse>=2.0
# opentelemetry-api>=1.20
# opentelemetry-sdk>=1.20
#
# # Optimization (optional)
# optuna>=3.0  # For Bayesian optimization in MIPROv2

# =============================================================================
# Basic Configuration
# =============================================================================

import os
import dspy

# Configure with a single provider
lm = dspy.LM(
    model="openai/gpt-4o-mini",
    api_key=os.environ.get("OPENAI_API_KEY"),
)
dspy.configure(lm=lm)

# =============================================================================
# Multi-Provider Configuration
# =============================================================================

# Configure provider API keys via environment variables
# DSPy uses litellm under the hood for provider routing

# OpenAI
# lm = dspy.LM("openai/gpt-4o-mini", api_key=os.environ["OPENAI_API_KEY"])

# Anthropic
# lm = dspy.LM("anthropic/claude-sonnet-4-20250514", api_key=os.environ["ANTHROPIC_API_KEY"])

# Google Gemini
# lm = dspy.LM("google/gemini-2.5-flash", api_key=os.environ["GEMINI_API_KEY"])

# Ollama (local models, no API key required)
# lm = dspy.LM("ollama_chat/llama3.2", api_base="http://localhost:11434")

# OpenRouter (200+ models)
# lm = dspy.LM(
#     "openrouter/anthropic/claude-3.5-sonnet",
#     api_key=os.environ["OPENROUTER_API_KEY"],
# )

# =============================================================================
# Feature Flags — Model Selection
# =============================================================================
#
# Use different models for different roles:
#   - Fast/cheap for classification, routing, simple tasks
#   - Powerful for synthesis, reasoning, complex analysis

SELECTOR_MODEL = os.environ.get("DSPY_SELECTOR_MODEL", "openai/gpt-4o-mini")
SYNTHESIZER_MODEL = os.environ.get("DSPY_SYNTHESIZER_MODEL", "openai/gpt-4o")
REASONING_MODEL = os.environ.get("DSPY_REASONING_MODEL", "anthropic/claude-sonnet-4-20250514")

# Usage in modules:
#
#   selector_lm = dspy.LM(SELECTOR_MODEL, api_key=os.environ.get("OPENAI_API_KEY"))
#   with dspy.context(lm=selector_lm):
#       result = classifier(text=text)

# =============================================================================
# Django / Flask Integration
# =============================================================================

# Django — config/settings.py or an AppConfig.ready() hook
#
# import dspy
#
# DSPY_MODEL = os.environ.get("DSPY_MODEL", "openai/gpt-4o-mini")
#
# def configure_dspy():
#     lm = dspy.LM(DSPY_MODEL, api_key=os.environ.get("OPENAI_API_KEY"))
#     dspy.configure(lm=lm)
#
# # Call during app startup
# configure_dspy()

# Flask — create_app() pattern
#
# def create_app():
#     app = Flask(__name__)
#     lm = dspy.LM("openai/gpt-4o-mini", api_key=app.config["OPENAI_API_KEY"])
#     dspy.configure(lm=lm)
#     return app

# FastAPI — lifespan pattern
#
# from contextlib import asynccontextmanager
# from fastapi import FastAPI
#
# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     lm = dspy.LM("openai/gpt-4o-mini", api_key=os.environ["OPENAI_API_KEY"])
#     dspy.configure(lm=lm)
#     yield
#
# app = FastAPI(lifespan=lifespan)

# =============================================================================
# Environment Variables — .env
# =============================================================================
#
# # Provider API keys (set the ones you need)
# OPENAI_API_KEY=sk-...
# ANTHROPIC_API_KEY=sk-ant-...
# GEMINI_API_KEY=...
#
# # DSPy model configuration
# DSPY_MODEL=openai/gpt-4o-mini
# DSPY_SELECTOR_MODEL=openai/gpt-4o-mini
# DSPY_SYNTHESIZER_MODEL=openai/gpt-4o
# DSPY_REASONING_MODEL=anthropic/claude-sonnet-4-20250514
#
# # Langfuse observability (optional)
# LANGFUSE_PUBLIC_KEY=pk-...
# LANGFUSE_SECRET_KEY=sk-...
# LANGFUSE_HOST=https://cloud.langfuse.com

# =============================================================================
# Langfuse Observability (optional)
# =============================================================================

# import dspy
# from langfuse.decorators import observe
#
# lm = dspy.LM("openai/gpt-4o-mini", api_key=os.environ["OPENAI_API_KEY"])
# dspy.configure(lm=lm)
#
# @observe()
# def run_pipeline(text: str):
#     classifier = dspy.Predict(ClassifySignature)
#     return classifier(text=text)

# =============================================================================
# Test Configuration
# =============================================================================

# Use dspy.configure() in test fixtures to set a test-specific LM
#
# # conftest.py
# import pytest
# import dspy
#
# @pytest.fixture(autouse=True)
# def configure_test_lm():
#     """Use a cheap model for tests, or mock the LM entirely."""
#     lm = dspy.LM("openai/gpt-4o-mini", api_key=os.environ.get("OPENAI_API_KEY"))
#     dspy.configure(lm=lm)
#     yield
#
# # For deterministic tests, use DSPy's built-in dummy LM:
# @pytest.fixture
# def mock_lm():
#     """Provide a mock LM that returns predetermined responses."""
#     dspy.configure(lm=dspy.LM("dummy"))
#     yield
