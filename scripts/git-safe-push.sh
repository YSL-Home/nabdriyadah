#!/bin/bash
# git-safe-push.sh — Safe commit + push for CI
# Usage: bash scripts/git-safe-push.sh "commit message"

set -e

git config user.name  "github-actions[bot]"
git config user.email "github-actions@github.com"
# Force merge mode — override any pull.rebase=true set globally on the runner
git config pull.rebase false

git add -A

# Commit only if there are staged changes
if ! git diff --cached --quiet; then
  MSG="${1:-auto: $(date '+%d/%m %H:%M')}"
  git commit -m "$MSG"
  echo "✔ Committed: $MSG"
else
  echo "ℹ Nothing new to commit."
fi

# Push with retry (safety net against concurrent jobs)
for ATTEMPT in 1 2 3; do
  # Clean up any leftover merge / rebase state before each attempt
  git merge --abort 2>/dev/null || true
  git rebase --abort 2>/dev/null || true

  # Fetch latest remote state
  git fetch origin main --quiet

  LOCAL=$(git rev-parse HEAD)
  REMOTE=$(git rev-parse origin/main)

  # Already in sync (e.g. previous attempt pushed successfully)
  if [ "$LOCAL" = "$REMOTE" ]; then
    echo "✔ Already in sync — nothing to push."
    exit 0
  fi

  BEHIND=$(git rev-list --count HEAD..origin/main 2>/dev/null || echo 0)
  if [ "$BEHIND" -gt 0 ]; then
    echo "⚡ Attempt $ATTEMPT: remote is $BEHIND commit(s) ahead — merging …"
    # Merge remote changes; our version wins on any conflict (no rebase, no unrelated-histories flag)
    if ! git merge origin/main --no-edit -X ours; then
      echo "  Conflict detected — resolving: our version wins …"
      git diff --name-only --diff-filter=U | xargs -r git checkout --ours --
      git add -A
      git commit -m "ci: force-ours after conflict [attempt $ATTEMPT]" 2>/dev/null || true
    fi
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
