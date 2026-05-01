#!/bin/bash
# git-safe-push.sh — Atomic push that survives concurrent CI jobs
# Usage: bash scripts/git-safe-push.sh "commit message"
#
# Strategy: stage + commit (if anything new), then always fetch + merge-ours + push.

set -e

git config user.name  "github-actions[bot]"
git config user.email "github-actions@github.com"

git add -A

# Commit only if there is something staged
if ! git diff --cached --quiet; then
  MSG="${1:-auto: $(date '+%d/%m %H:%M')}"
  git commit -m "$MSG"
  echo "✔ Committed: $MSG"
else
  echo "ℹ Nothing new to commit."
fi

# Always sync with remote and push
git fetch origin main

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" = "$REMOTE" ]; then
  echo "✔ Already up-to-date, nothing to push."
  exit 0
fi

# Are we behind? Merge remote into local — "ours" keeps our new data on conflict
BEHIND=$(git rev-list --count HEAD..origin/main)
if [ "$BEHIND" -gt 0 ]; then
  echo "⚡ Remote is $BEHIND commit(s) ahead — merging with -X ours …"
  git merge -X ours origin/main --no-edit -m "merge: sync remote changes" 2>/dev/null || {
    echo "⚠ Merge failed, resetting to remote and re-applying our changes via checkout"
    git checkout --ours -- .
    git add -A
    git commit -m "merge: force-ours after conflict" 2>/dev/null || true
  }
fi

git push origin main
echo "✅ Push successful"
