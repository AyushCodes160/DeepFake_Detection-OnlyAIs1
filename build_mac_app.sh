#!/usr/bin/env bash
set -o errexit

echo "============================================="
echo "Building DeepShield macOS Desktop Application"
echo "============================================="
echo "WARNING: This can take 30-45 minutes of heavy processor load."

# 1. Build the Vite React Frontend
echo ""
echo "==== 1/4: Building Frontend ===="
npm run build

# 2. Package the Python Backend using PyInstaller
echo ""
echo "==== 2/4: Compiling Python Backend (PyInstaller) ===="
cd backend
# Make sure we have pyinstaller
pip install pyinstaller

# Run PyInstaller
# --onedir creates a folder containing the executable and libraries
# We use --add-data to firmly attach the models folder directly into the distribution array
pyinstaller --noconfirm --onedir \
    --name "api" \
    --add-data "models:models" \
    --hidden-import "uvicorn" \
    --hidden-import "fastapi" \
    --hidden-import "websockets" \
    --hidden-import "cv2" \
    --hidden-import "numpy" \
    --hidden-import "torch" \
    --hidden-import "torchvision" \
    --hidden-import "transformers" \
    main.py

echo "Python compilation finished."
cd ..

# 3. Use Electron-Builder to compress EVERYTHING into a DMG
echo ""
echo "==== 3/4: Packaging App via Electron Builder ===="
# Notice: package.json has 'extraResources' which guarantees 'backend/dist/api' is bundled inside the app container
npx electron-builder --mac dmg

echo ""
echo "==== 4/4: DONE! ===="
echo "Look inside the 'release/' folder for your DeepShield.dmg installer!"
