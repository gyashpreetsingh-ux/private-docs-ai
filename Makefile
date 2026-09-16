# Private Docs AI - Automation Makefile

.PHONY: help install dev backend frontend test clean docker-up docker-down

help:
	@echo "Available commands:"
	@echo "  make install     - Install both backend and frontend dependencies"
	@echo "  make dev         - Run both backend and frontend concurrently"
	@echo "  make backend     - Run FastAPI backend server"
	@echo "  make frontend    - Run Vite React frontend"
	@echo "  make test        - Run backend pytest suite"
	@echo "  make docker-up   - Build and start Docker containers"
	@echo "  make docker-down - Stop and remove Docker containers"
	@echo "  make clean       - Remove cache, temp, and test files"

install:
	cd backend && python -m pip install -r requirements.txt
	cd frontend && npm install

backend:
	cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

frontend:
	cd frontend && npm run dev

test:
	pytest tests/ -v

docker-up:
	docker compose up --build -d

docker-down:
	docker compose down

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
