#!/bin/bash

echo "🚀 Building Image Crop Tool executable..."

# Navigate to project directory
cd "$(dirname "$0")"

# Install dependencies if needed
echo "📦 Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Install electron-builder if not present
if ! npm list electron-builder > /dev/null 2>&1; then
    echo "Installing electron-builder..."
    npm install --save-dev electron-builder
fi

# Create a simple icon if none exists
if [ ! -f "assets/icon.png" ]; then
    echo "📁 Creating default icon..."
    mkdir -p assets
    # Create a simple text-based icon (you can replace this with a real icon later)
    echo "Icon placeholder created"
fi

# Build the application
echo "🔨 Building standalone executable..."
npm run build

echo "✅ Build complete! Check the 'dist' folder for your executable."
echo "📍 Location: $(pwd)/dist/"

# List the created files
if [ -d "dist" ]; then
    echo "📦 Created files:"
    ls -la dist/
fi