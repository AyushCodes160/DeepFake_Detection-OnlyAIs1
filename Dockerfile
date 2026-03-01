# Stage 1: Build the React Frontend
FROM node:18 AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Build the Python Backend
FROM python:3.10-slim
WORKDIR /app

# Install system dependencies required by OpenCV
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend code
COPY backend ./backend

# Copy the built React frontend from Stage 1 into the Python container
COPY --from=frontend-builder /app/dist ./dist

# Pre-download the HuggingFace Machine Learning models during the build phase
# This ensures the Docker container boots instantly instead of downloading gigabytes on startup
RUN python backend/download_models.py

# Hugging Face Spaces expects the app to run on port 7860
ENV PORT=7860
EXPOSE 7860

# Start the FastAPI monolithic server
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "7860"]
