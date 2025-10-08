#!/usr/bin/env bash
set -euo pipefail

# Usage: scripts/preview_full_static.sh [port]
# Copies apps/desktop/out -> apps/web/out/desktop, runs fix_export_paths, then starts the preview server.

PORT="${1:-8080}"

# Resolve repo root (one level up from scripts/)
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

DESKTOP_OUT="$ROOT_DIR/apps/desktop/out"
WEB_OUT="$ROOT_DIR/apps/web/out"

echo "Repo root: $ROOT_DIR"

if [ ! -d "$WEB_OUT" ]; then
  echo "Error: web export not found at $WEB_OUT"
  echo "Run from repo root:"
  echo "  cd apps/web && NODE_ENV=production BUILD_FOR_GITHUB=true npm run build && NODE_ENV=production BUILD_FOR_GITHUB=true npx next export -o out"
  exit 1
fi

if [ ! -d "$DESKTOP_OUT" ]; then
  echo "Error: desktop export not found at $DESKTOP_OUT"
  echo "Run from repo root:"
  echo "  cd apps/desktop && NODE_ENV=production BUILD_FOR_GITHUB=true npm run build && NODE_ENV=production BUILD_FOR_GITHUB=true npx next export -o out"
  exit 1
fi

echo "Copying desktop export into web/out/desktop..."
mkdir -p "$WEB_OUT/desktop"
# Use rsync-like behavior with cp (POSIX) — copy contents (including hidden files)
cp -R "$DESKTOP_OUT/." "$WEB_OUT/desktop/"

echo "Running path fixer to add /htmaa2 prefixes where needed..."
node "$ROOT_DIR/scripts/fix_export_paths.js" "$WEB_OUT" "/htmaa2"

echo "Starting preview server at http://localhost:$PORT/htmaa2/"
node "$ROOT_DIR/scripts/preview_static.js" "$PORT"
