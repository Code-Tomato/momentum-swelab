#!/bin/bash
# Heroku Deployment Script

echo "🚀 Starting Heroku deployment for Momentum SWELAB..."

# Build React app
echo "📦 Building React application..."
cd client
npm install
npm run build
cd ..

echo "✅ Build complete! Ready for deployment."
echo "📋 Next steps:"
echo "1. Make sure you have MongoDB Atlas set up"
echo "2. Set MONGODB_URI config var on Heroku"
echo "3. Run: git push heroku main"