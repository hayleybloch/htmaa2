#!/bin/bash
# Development script - ensures clean dev environment

set -e

echo "🧹 Cleaning development environment..."

# Kill any existing servers
echo "🛑 Stopping all running servers..."
pkill -f "next dev" || true
pkill -f "next-server" || true
pkill -f "preview_static_node" || true

# Clean build artifacts
echo "🧹 Cleaning build artifacts..."
rm -rf apps/web/.next/
rm -rf apps/desktop/.next/
rm -rf apps/web/out/
rm -rf apps/desktop/out/
rm -rf out/

echo "✅ Development environment cleaned!"
echo ""
echo "🚀 To start development servers:"
echo "   npm run dev"
echo ""
echo "🚀 To build and preview static:"
echo "   npm run build:static:clean"
echo "   npm run preview:eleventy"

