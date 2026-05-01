#!/bin/bash
# git-safe-push.sh — Safe commit + push for CI
# Usage: bash scripts/git-safe-push.sh "commit message"
#
# The workflow already guarantees serial execution via concurrency groups
# and pulls the latest remote at job start. This script just commits + pushes,
# with a small retry loop in case a rare race still occurs.

set -e

git config user.name  "github-actions[bot]"
git config user.email "github-actions@github.com"

git add -A

# Commit only if there are staged changes
if ! git diff --cached --quiet; then
  MSG="${1:-auto: $(date '+%d/%m %H:%M')}"
  git commit -m "$MSG"
  echo "✔ Committed: $MSG"
else
  echo "ℹ Nothing new to commit."
fi

# Push with retry (safety net against any remaining race)
for ATTEMPT in 1 2 3; do
  # Fetch latest state
  git fetch origin main --quiet

  LOCAL=$(git rev-parse HEAD)
  REMOTE=$(git rev-parse origin/main)

  # Nothing to push (local == remote, meaning our commit was already applied
  # by a previous attempt or there was truly nothing to push)
  if [ "$LOCAL" = "$REMOTE" ]; then
    echo "✔ Already in sync — nothing to push."
    exit 0
  fi

  # If remote moved ahead of us, merge their changes (ours win on conflict)
  BEHIND=$(git rev-list --count HEAD..origin/main 2>/dev/null || echo 0)
  if [ "$BEHIND" -gt 0 ]; then
    echo "⚡ Attempt $ATTEMPT: remote is $BEHIND commit(s) ahead — merging …"
    git merge origin/main --no-edit -X ours \
        -m "ci: merge remote changes [attempt $ATTEMPT]" \
        --allow-unrelated-histories 2>/dev/null || {
      # Conflict: resolve by taking our version of every file
      git diff --name-only --diff-filter=U | xargs -r git checkout --ours --
      git add -A
      git commit -m "ci: force-ours after conflict [attempt $ATTEMPT]" 2>/dev/null || true
    }
  fi

  # Try pushing
  if git push origin main; then
    echo "✅ Push successful (attempt $ATTEMPT)"
    exit 0
  fi

  echo "↩ Push rejected (attempt $ATTEMPT) — retrying in 5s …"
  sleep 5
done

echo "❌ Could not push after 3 attempts — check CI logs"
exit 1
