#!/bin/bash

# Create MIT GitLab Repository (25MB limit)
echo "🚀 Creating MIT repository without Git history..."

# Create a fresh copy without .git
echo "📁 Creating clean copy..."
cd ..
cp -r htmaa2 htmaa2-mit
cd htmaa2-mit

# Remove Git history
echo "🗑️ Removing Git history..."
rm -rf .git

# Remove large files that aren't essential
echo "🗑️ Removing non-essential files..."
rm -rf htmaa2-portfolio.zip 2>/dev/null || true
rm -rf apps/*/.next/cache/ 2>/dev/null || true
rm -rf apps/*/node_modules/ 2>/dev/null || true
rm -rf node_modules/ 2>/dev/null || true

# Compress remaining assets
echo "📦 Compressing assets..."
find apps/web/public/assets/ -name "*.glb" -exec gzip -k {} \;

echo "📊 Final size check:"
du -sh .

if (( $(du -s . | cut -f1) < 26214400 )); then
    echo "✅ SUCCESS: Repository is under 25MB!"
    echo "🎯 Ready for MIT GitLab deployment"
    echo ""
    echo "Next steps:"
    echo "1. cd htmaa2-mit"
    echo "2. git init"
    echo "3. git add ."
    echo "4. git commit -m 'Initial commit for MIT deployment'"
    echo "5. git remote add origin https://gitlab.cba.mit.edu/classes/863.25/people/HayleyBloch.git"
    echo "6. git push -u origin main"
else
    echo "❌ Still too large. Need more optimization."
    echo "📊 Current size: $(du -sh . | cut -f1)"
fi
