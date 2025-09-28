#!/bin/bash

# Asset Optimization Script for MIT GitLab (25MB limit)
echo "🎨 Optimizing assets for MIT deployment..."

# Compress GLB files (3D models)
echo "📦 Compressing GLB files..."
find apps/web/public/assets/ -name "*.glb" -exec gzip -k {} \;

# Optimize JPEG images
echo "🖼️ Optimizing JPEG images..."
find apps/web/public/assets/ -name "*.jpg" -exec jpegoptim --max=70 --strip-all {} \;
find apps/desktop/public/ -name "*.jpg" -exec jpegoptim --max=70 --strip-all {} \;

# Optimize PNG images
echo "🖼️ Optimizing PNG images..."
find apps/web/public/assets/ -name "*.png" -exec pngquant --ext .png --force --quality=65-80 {} \;
find apps/desktop/public/ -name "*.png" -exec pngquant --ext .png --force --quality=65-80 {} \;

echo "✅ Asset optimization complete!"
echo "📊 New sizes:"
du -sh apps/web/public/assets/ apps/desktop/public/
