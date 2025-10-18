#!/usr/bin/env bash
set -euo pipefail

# Usage: scripts/preview_full_static.sh [port]
# Assembles repo-root `out/` by copying web and desktop exports, runs fix_export_paths, then starts the preview server.

PORT="${1:-8080}"

# Resolve repo root (one level up from scripts/)
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

DESKTOP_OUT="$ROOT_DIR/apps/desktop/out"
WEB_OUT="$ROOT_DIR/apps/web/out"
OUT_ROOT="$ROOT_DIR/out"

echo "Repo root: $ROOT_DIR"

if [ ! -d "$WEB_OUT" ]; then
  echo "Error: web export not found at $WEB_OUT"
  echo "Run from repo root:"
  echo "  cd apps/web && NODE_ENV=production BUILD_FOR_GITHUB=true npm run build && NODE_ENV=production BUILD_FOR_GITHUB=true npx next export"
  exit 1
fi

if [ ! -d "$DESKTOP_OUT" ]; then
  echo "Error: desktop export not found at $DESKTOP_OUT"
  echo "Run from repo root:"
  echo "  cd apps/desktop && NODE_ENV=production BUILD_FOR_GITHUB=true npm run build && NODE_ENV=production BUILD_FOR_GITHUB=true npx next export"
  exit 1
fi

echo "Assembling repo-root out/ from web and desktop exports..."
rm -rf "$OUT_ROOT"
mkdir -p "$OUT_ROOT"

echo "Copying web export into out/..."
cp -R "$WEB_OUT/." "$OUT_ROOT/"

if [ -d "$DESKTOP_OUT" ]; then
  echo "Copying desktop export into out/desktop..."
  mkdir -p "$OUT_ROOT/desktop"
  cp -R "$DESKTOP_OUT/." "$OUT_ROOT/desktop/"
fi

echo "Running path fixer to add /htmaa2 prefixes where needed..."
node "$ROOT_DIR/scripts/fix_export_paths.js" "$OUT_ROOT/desktop" "/htmaa2"

echo "Starting preview server at http://localhost:$PORT/htmaa2/"
node "$ROOT_DIR/scripts/preview_static_node.js" "$PORT"
