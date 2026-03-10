# MedLive AI Agent - Production Dockerfile
FROM python:3.12-slim

# Install system dependencies for audio processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Install uv for fast dependency management
RUN pip install uv

# Copy dependency files
COPY pyproject.toml .
COPY uv.lock .

# Install dependencies
RUN uv sync --frozen --no-dev

# Copy application code
COPY src/ src/

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PORT=8080

# Expose port for health checks
EXPOSE 8080

# LiveKit agents connect outbound to LiveKit Cloud
# The HTTP server for health checks uses the PORT env var automatically
CMD ["uv", "run", "python", "-m", "src.agent", "start"]
