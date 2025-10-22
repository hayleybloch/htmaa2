#!/usr/bin/env bash
set -eu -o pipefail

# Helper to build static site and push to GitLab using project's scripts.
# Usage:
#  GITLAB_REPO="ssh://git@gitlab.cba.mit.edu:846/classes/863.25/people/HayleyBloch.git" ./scripts/deploy_local.sh
# or set GITLAB_TOKEN for HTTPS clones.

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

if [ -z "${GITLAB_REPO:-}" ]; then
  echo "Error: GITLAB_REPO not set. Set it to your GitLab clone URL (ssh or https)."
  exit 2
fi

echo "You are about to build the static site and push to: $GITLAB_REPO"
read -p "Type 'yes' to continue: " confirm
if [ "$confirm" != "yes" ]; then
  echo "Aborted by user." && exit 1
fi

# Run build:static
echo "Running npm run build:static..."
cd "$ROOT_DIR"
npm run build:static

# Verify out/ exists
if [ ! -d "$ROOT_DIR/out" ]; then
  echo "Error: out/ directory not found after build. Aborting." >&2
  exit 2
fi

# Run push script
echo "Running push_to_gitlab.sh..."
GIT_BRANCH="${GIT_BRANCH:-main}" "$ROOT_DIR/scripts/push_to_gitlab.sh"

echo "Deploy script finished."