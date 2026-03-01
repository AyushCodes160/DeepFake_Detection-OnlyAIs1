#!/usr/bin/env bash
set -o errexit

echo "Starting Render build process..."

# Install Python dependencies
echo "Installing dependencies from requirements.txt..."
pip install -r requirements.txt

# Download ML models for offline inference
echo "Downloading Models (This may take a few minutes)..."
python download_models.py

echo "Build complete!"
