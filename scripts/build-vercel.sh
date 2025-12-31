#!/bin/bash
# Build script for Vercel deployment
# Sets VITE_BASE_URL to '/' for Vercel (overrides GitHub Pages base)

set -e  # Exit on error

echo "🚀 Building California Puzzle Game for Vercel..."

# Set base URL for Vercel deployment (root path)
export VITE_BASE_URL="/"

echo "📦 Environment: production"
echo "🌐 Base URL: $VITE_BASE_URL"

# Verify required environment variables are set
if [ -z "$VITE_SUPABASE_URL" ]; then
  echo "⚠️  Warning: VITE_SUPABASE_URL not set"
fi

if [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
  echo "⚠️  Warning: VITE_SUPABASE_ANON_KEY not set"
fi

# Run the build
echo "🔨 Running Vite build..."
npm run build

# Verify build output
if [ ! -d "dist" ]; then
  echo "❌ Build failed: dist directory not found"
  exit 1
fi

if [ ! -f "dist/index.html" ]; then
  echo "❌ Build failed: index.html not found in dist"
  exit 1
fi

echo "✅ Build completed successfully!"
echo "📂 Output directory: dist"
echo "📊 Build stats:"
du -sh dist
echo ""
echo "📁 Files in dist:"
ls -lh dist
