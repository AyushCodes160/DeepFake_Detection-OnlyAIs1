#!/usr/bin/env bash
set -o errexit

echo "Starting Monolithic Render build process..."

# 1. Build the React Frontend into static assets
echo "Installing Node dependencies..."
npm install
echo "Building Vite frontend..."
npm run build

# 2. Setup the Python Backend
echo "Installing Python dependencies..."
pip install -r backend/requirements.txt

# 3. Download the Gigantic PyTorch Model Weights
echo "Downloading Models (This may take a few minutes)..."
python backend/download_models.py

echo "Monolithic Build complete!"
