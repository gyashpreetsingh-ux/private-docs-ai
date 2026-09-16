# =================================================================
# PRIVATE DOCS AI - UNIFIED PRODUCTION DOCKERFILE
# Builds React Frontend + FastAPI Backend into a single deployment.
# =================================================================

# Stage 1: Build Vite React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ .
RUN npm run build

# Stage 2: Python Backend & Production Web Server
FROM python:3.12-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend /app/backend

# Copy built frontend assets from Stage 1 into /app/frontend/dist
COPY --from=frontend-builder /frontend/dist /app/frontend/dist

# Create private storage mounts
RUN mkdir -p /app/data/uploads /app/data/chroma /app/data/exports

ENV PYTHONPATH=/app
ENV PORT=8000
ENV HOST=0.0.0.0
ENV APP_ENV=production

EXPOSE 8000

# Start server dynamically on Render assigned PORT
CMD ["sh", "-c", "uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
