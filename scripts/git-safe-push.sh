#!/bin/bash
# git-safe-push.sh — Atomic push that survives concurrent CI jobs
# Usage: bash scripts/git-safe-push.sh "commit message"
#
# Strategy:
#   1. Stage + commit if anything changed
#   2. Fetch remote
#   3. If behind: merge with -X ours (our new data wins on conflict)
#   4. Push — retry up to 5 times in case of race with another job

set -e

git config user.name  "github-actions[bot]"
git config user.email "github-actions@github.com"

git add -A

# Commit only if something is staged
if ! git diff --cached --quiet; then
  MSG="${1:-auto: $(date '+%d/%m %H:%M')}"
  git commit -m "$MSG"
  echo "✔ Committed: $MSG"
else
  echo "ℹ Nothing new to commit."
fi

# Push with retry (handles race conditions between concurrent CI jobs)
MAX_RETRIES=5
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_RETRIES ]; do
  ATTEMPT=$((ATTEMPT + 1))

  # Always re-fetch before each attempt
  git fetch origin main

  LOCAL=$(git rev-parse HEAD)
  REMOTE=$(git rev-parse origin/main)

  if [ "$LOCAL" = "$REMOTE" ]; then
    echo "✔ Already in sync with remote — nothing to push."
    exit 0
  fi

  # Check if remote is ahead (we need to merge first)
  BEHIND=$(git rev-list --count HEAD..origin/main 2>/dev/null || echo 0)
  if [ "$BEHIND" -gt 0 ]; then
    echo "⚡ Attempt $ATTEMPT: remote is $BEHIND commit(s) ahead — merging with -X ours …"
    git merge -X ours origin/main --no-edit -m "merge: sync CI changes [attempt $ATTEMPT]" 2>/dev/null || {
      # Merge failed — force-resolve conflicts with our version
      echo "⚠ Merge conflict — force-applying our changes"
      git checkout --ours -- . 2>/dev/null || true
      git add -A
      git commit -m "merge: force-ours [attempt $ATTEMPT]" 2>/dev/null || true
    }
  fi

  # Try pushing
  if git push origin main 2>/dev/null; then
    echo "✅ Push successful (attempt $ATTEMPT)"
    exit 0
  fi

  echo "↩ Push rejected on attempt $ATTEMPT — retrying in 3s …"
  sleep 3
done

echo "❌ Failed to push after $MAX_RETRIES attempts"
exit 1
