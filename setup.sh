#!/usr/bin/env bash
# Requiere git y GitHub CLI (gh auth login). Ejecuta dentro de esta carpeta.
set -e
REPO=montacargas-reportes
git init -b main
git add .
git commit -m "App de reportes de montacargas"
gh repo create "$REPO" --public --source=. --push
U=$(gh api user -q .login)
gh api -X POST "repos/$U/$REPO/pages" -f "source[branch]=main" -f "source[path]=/"
echo "Listo (tarda ~1 min): https://$U.github.io/$REPO/"
