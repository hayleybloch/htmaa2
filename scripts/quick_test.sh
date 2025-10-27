#!/bin/bash
# Quick test script for future iterations

set -e

echo "🧪 Quick Portfolio Test"
echo "===================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this from the portfolio root directory"
    exit 1
fi

echo "📦 Installing/updating dependencies..."
npm install

echo "🏗️  Building static site..."
npm run build:static:clean

echo "🔍 Checking for common issues..."

# Check for large files
echo "Checking for files >25MB..."
large_files=$(find out/ -type f -size +25M 2>/dev/null | wc -l)
if [ "$large_files" -gt 0 ]; then
    echo "⚠️  Found large files (>25MB):"
    find out/ -type f -size +25M -exec ls -lh {} \;
    echo "   These may cause GitLab deployment issues"
else
    echo "✅ No large files found"
fi

# Check for broken asset references
echo "Checking for potential asset issues..."
if grep -r "localhost:300" out/ 2>/dev/null; then
    echo "⚠️  Found localhost references in build output"
else
    echo "✅ No localhost references found"
fi

echo ""
echo "🚀 Starting preview server..."
echo "   Web: http://localhost:5002/classes/863.25/people/HayleyBloch/web/"
echo "   Desktop: http://localhost:5002/classes/863.25/people/HayleyBloch/desktop/"
echo ""
echo "Press Ctrl+C to stop"

npm run preview:eleventy