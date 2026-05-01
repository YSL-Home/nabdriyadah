#!/bin/bash
# git-safe-push.sh — Atomic push that survives concurrent CI jobs
# Usage: bash scripts/git-safe-push.sh "commit message"
#
# Strategy: fetch latest, merge with -X ours (our new data files win),
# then push. No rebase = no "could not apply" errors.

set -e

git config user.name  "github-actions[bot]"
git config user.email "github-actions@github.com"

git add -A

if git diff --cached --quiet; then
  echo "Nothing to commit."
  exit 0
fi

MSG="${1:-auto: $(date '+%d/%m %H:%M')}"
git commit -m "$MSG"

# Fetch latest from remote
git fetch origin main

# Check if we're behind
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" = "$REMOTE" ]; then
  git push origin main
  exit 0
fi

# Merge remote into local — "ours" keeps our new articles/fixtures on conflict
git merge -X ours origin/main --no-edit -m "merge: sync remote changes"

git push origin main
echo "✅ Push successful"
