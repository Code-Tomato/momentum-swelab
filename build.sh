#!/bin/bash
set -e

# Install Node.js if not available
if ! command -v node &> /dev/null; then
    echo "Node.js not found, installing..."
    # Try using nvm (Node Version Manager)
    export NVM_DIR="$HOME/.nvm"
    if [ ! -d "$NVM_DIR" ]; then
        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
    fi
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm install 18
    nvm use 18
fi

echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

# Build React app
echo "Building React app..."
cd client
npm ci
npm run build

# Create 404.html for GitHub Pages SPA routing
# GitHub Pages will serve 404.html for unknown routes, allowing React Router to handle them
if [ -f "build/index.html" ]; then
    cp build/index.html build/404.html
    echo "Created 404.html for GitHub Pages routing"
fi

cd ..

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Build complete!"

