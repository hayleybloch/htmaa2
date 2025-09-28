#!/bin/bash

# Simple Asset Optimization for MIT GitLab (25MB limit)
echo "🎨 Simple asset optimization..."

# Compress GLB files (3D models) - this alone should save significant space
echo "📦 Compressing GLB files..."
find apps/web/public/assets/ -name "*.glb" -exec gzip -k {} \;

echo "✅ Basic optimization complete!"
echo "📊 Current sizes:"
du -sh apps/web/public/assets/ apps/desktop/public/
echo ""
echo "📊 Total repo size:"
du -sh .
