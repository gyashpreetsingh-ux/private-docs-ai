# =================================================================
# PRIVATE DOCS AI - BACKEND DOCKERFILE
# =================================================================
FROM python:3.12-slim

WORKDIR /app

# Install system utilities & tesseract OCR support
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application code
COPY . /app/backend

# Create private storage mounts
RUN mkdir -p /app/data/uploads /app/data/chroma /app/data/exports

ENV PYTHONPATH=/app
ENV PORT=8000
ENV HOST=0.0.0.0

EXPOSE 8000

CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
