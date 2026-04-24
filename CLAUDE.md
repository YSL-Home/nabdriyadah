# CLAUDE.md — Règles d'or du projet نبض الرياضة

## ⚠️ RÈGLE D'OR ABSOLUE — VALIDATION DE L'INFORMATION

**Toute information publiée sur le site DOIT être vérifiable depuis au moins une source fiable.**

Sources acceptées (par ordre de priorité) :
1. Site officiel du club/fédération
2. BBC Sport, ESPN, Sky Sports, L'Équipe, Marca, AS
3. Wikipedia (version anglaise ou arabe, sections sourcées)
4. TheSportsDB API

### Ce qui est INTERDIT sans vérification :
- Ajouter un entraîneur sans confirmer depuis 2+ sources
- Lister un joueur qui a quitté le club (vérifier la date de départ)
- Copier des palmarès sans compter les titres réels
- Écrire "المدرب الحالي" ou tout placeholder — **c'est une erreur, pas une valeur**

### Processus de vérification obligatoire :
Avant tout `git push` qui modifie des données d'équipes :
1. Exécuter : `node scripts/validate-info.mjs`
2. Lire `content/validation-report.json`
3. Corriger TOUS les problèmes de type `PLACEHOLDER` ou `MISMATCH`
4. Ne pousser que si le rapport dit `"status": "ALL_OK"`

### En cas de doute :
- Utiliser `"غير محدد"` (non spécifié) plutôt qu'une info non vérifiée
- **Jamais inventer, jamais supposer**

---

## Règles techniques

### Architecture
- Next.js 14 App Router, `output: "export"` (SSG statique)
- Déployé sur Cloudflare Pages via GitHub Actions
- Zéro dépendance locale — tout doit fonctionner 100% en ligne

### Jamais en local
- Ne jamais stocker d'images ou données sur le PC de l'utilisateur
- Toutes les photos → CDN (TheSportsDB) ou `public/`
- Toutes les données → fichiers JSON commités sur GitHub

### Images
- Si l'image est libre de droits SANS logo d'un autre site → utiliser directement
- Si l'image a des watermarks ou logos → régénérer avec le logo نبض الرياضة

### Langue
- Répondre toujours en **français** à l'utilisateur
- Contenu du site en **arabe** (direction rtl)

### Git
- Toujours vérifier `validate-info.mjs` avant push
- Tag de sauvegarde créé : `sauvegarde-1`
- Ne jamais faire `git push --force` sans confirmation

### PAT GitHub
- Le PAT actuel n'a PAS le scope `workflow`
- Pour modifier `.github/workflows/` → éditer directement sur GitHub.com

---

## Structure des fichiers clés

```
app/team/[slug]/page.jsx     → données + rendu des 37 équipes
app/player/[slug]/page.jsx   → pages individuelles joueurs (514 pages)
app/live/page.jsx            → scores live (API-Football)
content/player-photos.json   → URLs photos (TheSportsDB CDN)
content/players-registry.json → index des 514 joueurs
scripts/validate-info.mjs    → ⭐ VALIDATEUR D'INFORMATIONS
content/validation-report.json → rapport de validation (auto-généré)
```
