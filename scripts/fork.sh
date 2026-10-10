#!/usr/bin/env bash
# Fork repo GitHub via gh CLI lalu clone hasil fork
# Pakai: ./scripts/fork.sh <owner/repo>
# Contoh: ./scripts/fork.sh owner-asli/e-commerce
# Butuh: gh auth login dulu
set -e

if [ -z "$1" ]; then
  echo "Pakai: $0 <owner/repo>"
  echo "Contoh: $0 owner-asli/e-commerce"
  exit 1
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "ERROR: gh CLI belum terinstal. Install: https://cli.github.com/"
  exit 1
fi

REPO="$1"
echo "Fork $REPO..."
gh repo fork "$REPO" --clone

echo "Selesai fork + clone. Tambahkan upstream agar bisa sync:"
echo "  cd $(basename "$REPO")"
echo "  git remote add upstream https://github.com/$REPO.git"
echo "  git fetch upstream"
