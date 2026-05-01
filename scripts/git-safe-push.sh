#!/bin/bash
# Safe git push that handles merge conflicts in JSON data files
# Uses "ours" strategy — our new data files win over remote in conflicts

set -e

git config user.name "github-actions[bot]"
git config user.email "github-actions@github.com"

git add -A

if git diff --cached --quiet; then
  echo "Nothing to commit."
  exit 0
fi

MSG="${1:-auto: $(date '+%d/%m %H:%M')}"
git commit -m "$MSG"

# Try fast-forward first
git fetch origin main

# Merge with "ours" strategy — keeps our new article/fixture data on conflict
if ! git merge -X ours origin/main --no-edit --no-ff 2>/dev/null; then
  # Fallback: accept all conflicts in favour of ours
  git checkout --ours content/articles/seo-articles.json content/raw-news.json 2>/dev/null || true
  git add -A
  git rebase --continue 2>/dev/null || git merge --continue --no-edit 2>/dev/null || true
fi

git push origin main
