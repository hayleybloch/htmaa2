#!/bin/bash
# Build script for static deployment - ensures clean separation from dev servers

set -e  # Exit on any error

echo "🚀 Building static portfolio..."

# Kill any existing dev servers to prevent conflicts
echo "🛑 Stopping any running dev servers..."
pkill -f "next dev" || true
pkill -f "next-server" || true

# Set environment variables for static build
export NODE_ENV=production
export DEPLOY_BASE_PATH='/classes/863.25/people/HayleyBloch'
export NEXT_PUBLIC_BASE_PATH='/classes/863.25/people/HayleyBloch'
export NEXT_PUBLIC_DESKTOP_URL='http://localhost:5002/classes/863.25/people/HayleyBloch/desktop/'

# Also set for the preview server
export PREVIEW_BASE_PATH='/classes/863.25/people/HayleyBloch'

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf out/
rm -rf apps/web/.next/
rm -rf apps/desktop/.next/
rm -rf apps/web/out/
rm -rf apps/desktop/out/

# Build Eleventy first
echo "📝 Building Eleventy..."
npm run build:eleventy

# Build web app with static configuration
echo "🌐 Building web app (static)..."
cd apps/web
npm run build
cd ../..

# Build desktop app with static configuration  
echo "🖥️  Building desktop app (static)..."
cd apps/desktop
npm run build
cd ../..

# Assemble all static files
echo "📦 Assembling static files..."
node scripts/assemble_static.js

# Copy assets to correct locations for static serving
echo "🔗 Setting up asset links..."
cd out

# Ensure _next directory exists at root level for web assets
if [ -d "web/_next" ]; then
    cp -r web/_next ./
fi

# Ensure assets directory exists at root level
if [ -d "web/assets" ]; then
    cp -r web/assets ./
fi

# Ensure icons directory exists at root level  
if [ -d "web/icons" ]; then
    cp -r web/icons ./
fi

# Copy desktop assets to the deployment path structure
if [ -d "desktop/_next" ]; then
    mkdir -p classes/863.25/people/HayleyBloch/desktop
    cp -r desktop/_next classes/863.25/people/HayleyBloch/desktop/
fi

if [ -d "desktop/icons" ]; then
    mkdir -p classes/863.25/people/HayleyBloch/desktop
    cp -r desktop/icons classes/863.25/people/HayleyBloch/desktop/
fi

if [ -d "desktop/images" ]; then
    mkdir -p classes/863.25/people/HayleyBloch/desktop
    cp -r desktop/images classes/863.25/people/HayleyBloch/desktop/
fi

if [ -d "desktop/fonts" ]; then
    mkdir -p classes/863.25/people/HayleyBloch/desktop
    cp -r desktop/fonts classes/863.25/people/HayleyBloch/desktop/
fi

# Copy web assets to the deployment path structure
if [ -d "web/_next" ]; then
    mkdir -p classes/863.25/people/HayleyBloch/web
    cp -r web/_next classes/863.25/people/HayleyBloch/web/
fi

if [ -d "web/assets" ]; then
    mkdir -p classes/863.25/people/HayleyBloch/web
    cp -r web/assets classes/863.25/people/HayleyBloch/web/
fi

if [ -d "web/icons" ]; then
    mkdir -p classes/863.25/people/HayleyBloch/web
    cp -r web/icons classes/863.25/people/HayleyBloch/web/
fi

cd ..

echo "✅ Static build complete!"
echo "📁 Output directory: out/"
echo "🌐 Web portfolio: http://localhost:5002/classes/863.25/people/HayleyBloch/web/"
echo "🖥️  Desktop portfolio: http://localhost:5002/classes/863.25/people/HayleyBloch/desktop/"
echo ""
echo "🚀 To start the static preview server:"
echo "   npm run preview:eleventy"
