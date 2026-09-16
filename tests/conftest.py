"""
Private Docs AI - Pytest Configuration & Test Fixtures
"""

import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

# Ensure project root is on sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.app.main import app
from backend.app.database import Base, engine, SessionLocal


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    """Create test tables before tests and tear down after."""
    Base.metadata.create_all(bind=engine)
    yield
    # Keep db clean or drop if needed


@pytest.fixture
def client():
    """TestClient instance for making API requests."""
    with TestClient(app) as test_client:
        yield test_client
