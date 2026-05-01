#!/bin/bash
# git-safe-push.sh — Safe commit + push for CI
# Usage: bash scripts/git-safe-push.sh "commit message"
#
# Stratégie : reset-and-reapply (évite tout merge/rebase)
# 1) On commit nos fichiers générés
# 2) Si remote est en avance, on récupère ses fichiers puis on réapplique les nôtres par-dessus
# 3) On push (toujours fast-forward après l'étape 2)

set -e

git config user.name  "github-actions[bot]"
git config user.email "github-actions@github.com"
git config pull.rebase false
git config branch.main.rebase false

git add -A

# Message du commit (fourni en argument ou auto-généré)
MSG="${1:-auto: $(date '+%d/%m %H:%M')}"

# Commit si des changements sont en attente
if ! git diff --cached --quiet; then
  git commit -m "$MSG"
  echo "✔ Committed: $MSG"
else
  echo "ℹ Nothing new to commit."
fi

# ── Boucle de push avec retry ────────────────────────────────────────────────
for ATTEMPT in 1 2 3; do

  # Annuler tout merge/rebase en cours (état propre)
  git merge --abort  2>/dev/null || true
  git rebase --abort 2>/dev/null || true

  git fetch origin main --quiet

  LOCAL=$(git rev-parse HEAD)
  REMOTE=$(git rev-parse origin/main)

  # Déjà en sync — rien à pusher
  if [ "$LOCAL" = "$REMOTE" ]; then
    echo "✔ Already in sync — nothing to push."
    exit 0
  fi

  BEHIND=$(git rev-list --count HEAD..origin/main 2>/dev/null || echo 0)
  if [ "$BEHIND" -gt 0 ]; then
    echo "⚡ Attempt $ATTEMPT: remote is $BEHIND commit(s) ahead — reset + reapply …"

    # Lister les fichiers que NOUS avons modifiés par rapport au remote
    CHANGED_FILES=$(git diff --name-only origin/main HEAD 2>/dev/null || true)

    if [ -n "$CHANGED_FILES" ]; then
      # Sauvegarder nos fichiers dans un répertoire temporaire
      TMPDIR_OURS=$(mktemp -d)
      while IFS= read -r f; do
        [ -z "$f" ] && continue
        if [ -f "$f" ]; then
          mkdir -p "$TMPDIR_OURS/$(dirname "$f")"
          cp "$f" "$TMPDIR_OURS/$f"
        fi
      done <<< "$CHANGED_FILES"

      # Reset dur vers le remote (récupère TOUS leurs fichiers sans conflit)
      git reset --hard origin/main

      # Réappliquer nos fichiers générés par-dessus
      while IFS= read -r f; do
        [ -z "$f" ] && continue
        if [ -f "$TMPDIR_OURS/$f" ]; then
          mkdir -p "$(dirname "$f")"
          cp "$TMPDIR_OURS/$f" "$f"
        fi
      done <<< "$CHANGED_FILES"

      rm -rf "$TMPDIR_OURS"

      # Commiter nos fichiers sur la pointe du remote (sera fast-forward)
      git add -A
      if ! git diff --cached --quiet; then
        git commit -m "$MSG"
      fi
    else
      # Aucun de nos fichiers ne diffère du remote — on se contente du reset
      git reset --hard origin/main
    fi
  fi

  # Tenter le push (devrait être fast-forward maintenant)
  if git push origin main; then
    echo "✅ Push successful (attempt $ATTEMPT)"
    exit 0
  fi

  echo "↩ Push rejected (attempt $ATTEMPT) — retrying in 5s …"
  sleep 5
done

echo "❌ Could not push after 3 attempts — check CI logs"
exit 1
