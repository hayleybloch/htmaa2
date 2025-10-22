#!/usr/bin/env bash
set -eu -o pipefail

# Push assembled htmaa2/out to a GitLab repo.
# Supports two modes:
#  - HTTPS+token: set GITLAB_REPO to the https clone URL (https://gitlab.example/you/repo.git)
#    and set GITLAB_TOKEN to a personal access token with repo permissions.
#    The script will clone using https://oauth2:<token>@host/...
#  - SSH: set GITLAB_REPO to an SSH URL (git@gitlab.example:you/repo.git) and ensure
#    your local SSH key can auth with GitLab.
#
# Optional environment variables:
#  GITLAB_REPO  (required)
#  GITLAB_TOKEN (optional, required for HTTPS with token)
#  GIT_BRANCH   (default: main)
#  GIT_NAME     (defaults to git config user.name or "htmaa2-bot")
#  GIT_EMAIL    (defaults to git config user.email or "htmaa2-bot@example.com")
#
# Example (HTTPS token):
#  GITLAB_REPO="https://fab.cba.mit.edu/classes/863.25/people/HayleyBloch.git" \
#  GITLAB_TOKEN="glpat-..." \
#  ./scripts/push_to_gitlab.sh
#
# Example (SSH):
#  GITLAB_REPO="git@gitlab.com:owner/repo.git" ./scripts/push_to_gitlab.sh

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="$ROOT_DIR/out"

if [ ! -d "$OUT_DIR" ]; then
  echo "Error: assembled output directory '$OUT_DIR' not found. Run 'npm run build:static' first." >&2
  exit 2
fi

if [ -z "${GITLAB_REPO:-}" ]; then
  echo "Error: set GITLAB_REPO to your GitLab repo URL (ssh or https)." >&2
  exit 2
fi

BRANCH="${GIT_BRANCH:-main}"
GIT_NAME="${GIT_NAME:-$(git config --global user.name || echo htmaa2-bot)}"
GIT_EMAIL="${GIT_EMAIL:-$(git config --global user.email || echo htmaa2-bot@example.com)}"

TMPDIR="$(mktemp -d "$(pwd)/.gitlab-push-XXXX")"
trap 'rm -rf "$TMPDIR"' EXIT

echo "Cloning target repo into $TMPDIR..."

CLONE_URL="$GITLAB_REPO"

if [[ "$GITLAB_REPO" =~ ^https?:// ]] && [ -n "${GITLAB_TOKEN:-}" ]; then
  # Insert token as oauth2 user for HTTPS clone
  # transform: https://host/foo -> https://oauth2:TOKEN@host/foo
  CLONE_URL="${GITLAB_REPO/https:\/\//https:\/\/oauth2:${GITLAB_TOKEN}@}"
  # Protect token from being printed
  echo "(Using HTTPS+token clone; token not echoed)"
fi

# Clone
if ! git clone --depth=1 --branch "$BRANCH" "$CLONE_URL" "$TMPDIR/repo"; then
  echo "Branch '$BRANCH' may not exist; trying to clone default branch and create '$BRANCH'..."
  rm -rf "$TMPDIR/repo"
  git clone --depth=1 "$CLONE_URL" "$TMPDIR/repo"
  cd "$TMPDIR/repo"
  git checkout -b "$BRANCH"
else
  cd "$TMPDIR/repo"
fi

# Make sure git user is set
git config user.name "$GIT_NAME"
git config user.email "$GIT_EMAIL"

# Instead of syncing everything and committing once (which creates a large pack),
# we will push files in batches so each push's pack stays under the remote limit.
# Defaults to 25 MiB (GitLab default). Set GITLAB_MAX_BYTES to override.
MAX_BYTES="${GITLAB_MAX_BYTES:-26214400}"
SKIPPED_FILE_LIST="$TMPDIR/repo/SKIPPED_FILES.txt"
> "$SKIPPED_FILE_LIST"

echo "Collecting files from $OUT_DIR (skipping files > $MAX_BYTES bytes)..."
# Build a list of files relative to $OUT_DIR, skipping large files
RELFILES="$TMPDIR/relfiles.txt"
> "$RELFILES"
find "$OUT_DIR" -type f -print0 | while IFS= read -r -d '' file; do
  # get size in bytes (cross-platform)
  size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo 0)
  if [ "$size" -gt "$MAX_BYTES" ]; then
    echo "$file  $size" >> "$SKIPPED_FILE_LIST"
    continue
  fi
  # store "size TAB relpath"
  rel=${file#"$OUT_DIR"/}
  printf "%d\t%s\n" "$size" "$rel" >> "$RELFILES"
done

if [ -s "$SKIPPED_FILE_LIST" ]; then
  echo "Large files skipped (listed in $SKIPPED_FILE_LIST):"
  sed -n '1,200p' "$SKIPPED_FILE_LIST" || true
fi

if [ ! -s "$RELFILES" ]; then
  echo "No files to push (all files were skipped). Exiting."
  exit 0
fi

echo "Grouping files into batches (target <= ${MAX_BYTES} bytes per batch)..."
BATCH_DIR="$TMPDIR/batches"
mkdir -p "$BATCH_DIR"

# Greedy pack into batches by size
BATCH_INDEX=0
BATCH_SIZE=0
BATCH_FILELIST="$BATCH_DIR/batch-${BATCH_INDEX}.txt"
> "$BATCH_FILELIST"

while IFS=$'\t' read -r size rel; do
  # Add a small safety margin (5%) to avoid edge-case packs
  MARGIN=$(( MAX_BYTES - MAX_BYTES / 20 ))
  if [ $((BATCH_SIZE + size)) -gt $MARGIN ]; then
    BATCH_INDEX=$((BATCH_INDEX+1))
    BATCH_SIZE=0
    BATCH_FILELIST="$BATCH_DIR/batch-${BATCH_INDEX}.txt"
    > "$BATCH_FILELIST"
  fi
  echo "$rel" >> "$BATCH_FILELIST"
  BATCH_SIZE=$((BATCH_SIZE + size))
done < <(sort -nrk1 "$RELFILES")

TOTAL_BATCHES=$((BATCH_INDEX+1))
echo "Created $TOTAL_BATCHES batches. Proceeding to apply them to the repo and push each batch." 

# Make sure repo is empty (preserve .git)
cd "$TMPDIR/repo"
git rm -r --cached . >/dev/null 2>&1 || true
git ls-files -z | xargs -0 -r rm -f || true
rm -rf * || true

# If Git LFS is available, initialize it in the temp repo and copy the repo
# .gitattributes so tracked patterns (like out/**.mp4) are respected.
if command -v git-lfs >/dev/null 2>&1 || git lfs version >/dev/null 2>&1; then
  echo "Git LFS available: initializing in temp repo"
  git lfs install --local || true
  if [ -f "$ROOT_DIR/.gitattributes" ]; then
    echo "Copying .gitattributes into temp repo"
    cp "$ROOT_DIR/.gitattributes" .
    # Register tracked patterns locally (git lfs track reads .gitattributes)
    git add .gitattributes
    git commit -m "Add .gitattributes for LFS-tracked site assets" || true
  fi
else
  echo "git-lfs not available; large files will be skipped unless tracked on remote." 
fi

# Now iterate batches: extract files from OUT_DIR for each batch, commit, and push.
for idx in $(seq 0 $BATCH_INDEX); do
  filelist="$BATCH_DIR/batch-${idx}.txt"
  echo "Processing batch $((idx+1))/$TOTAL_BATCHES (files: $(wc -l < "$filelist"))..."
  # create parent directories and extract files
  while read -r rel; do
    src="$OUT_DIR/$rel"
    destdir=$(dirname "$rel")
    mkdir -p "$destdir"
    cp --preserve=mode,timestamps "$src" "$rel" 2>/dev/null || cp "$src" "$rel"
  done < "$filelist"

  # commit and push this batch
  git add -A
  if git diff --staged --quiet; then
    echo "No changes in batch $idx"
  else
    git commit -m "Site update (batch $((idx+1))/$TOTAL_BATCHES) $(date -u +"%Y-%m-%dT%H:%M:%SZ")" || true
    echo "Pushing batch $((idx+1))/$TOTAL_BATCHES to origin $BRANCH..."
    git push origin "$BRANCH" || {
      echo "Push failed on batch $idx. See remote error. Exiting." >&2
      exit 1
    }
  fi
done

echo "All batches pushed."

# Commit changes if any
if [ -n "$(git status --porcelain)" ]; then
  git add -A
  git pull --rebase origin "$BRANCH" || true
  git commit -m "Site update: $(date -u +"%Y-%m-%dT%H:%M:%SZ") from local preview" || true
  echo "Pushing to origin $BRANCH..."
  git push origin "$BRANCH"
  echo "Push complete."
else
  echo "No changes to commit. Nothing pushed."
fi

# Done

exit 0
