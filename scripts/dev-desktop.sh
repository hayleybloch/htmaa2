#!/usr/bin/env zsh
set -euo pipefail

# Repository root (one level up from scripts/)
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP_DIR="$ROOT/apps/desktop"
PORT_DEFAULT=3001
PORT=${1:-$PORT_DEFAULT}
LOGFILE="$ROOT/scripts/dev-desktop.log"

echo "[dev-desktop] repo root: $ROOT"
echo "[dev-desktop] app dir: $APP_DIR"
echo "[dev-desktop] port: $PORT"

echo "[dev-desktop] checking for process on port $PORT..."
PIDS=$(lsof -tiTCP:"$PORT" -sTCP:LISTEN -n -P || true)
if [[ -n "$PIDS" ]]; then
  echo "[dev-desktop] killing existing process(es): $PIDS"
  kill $PIDS || true
  sleep 0.2
else
  echo "[dev-desktop] no process found on port $PORT"
fi

if [[ -d "$APP_DIR/.next" ]]; then
  echo "[dev-desktop] removing $APP_DIR/.next (clean build artifacts)"
  rm -rf "$APP_DIR/.next"
else
  echo "[dev-desktop] no .next folder to remove"
fi

echo "[dev-desktop] starting dev server (logs -> $LOGFILE)"
cd "$APP_DIR"
# start dev server in background, capture output
npm run dev &> "$LOGFILE" &
DEV_PID=$!

# Wait a moment and check status
sleep 1
if lsof -iTCP:"$PORT" -sTCP:LISTEN -n -P >/dev/null 2>&1; then
  echo "[dev-desktop] dev server appears to be listening on port $PORT (PID: $DEV_PID)"
else
  echo "[dev-desktop] dev server not listening yet; check log: $LOGFILE"
fi

echo "[dev-desktop] tailing last 20 lines of log:"
 tail -n 20 "$LOGFILE" || true

echo "[dev-desktop] finished"
