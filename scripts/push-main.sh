#!/usr/bin/env bash
# Push ke main: commit branch aktif, merge ke main, push main
# Pakai: ./scripts/push-main.sh "pesan commit"
# Contoh: ./scripts/push-main.sh "PPL-12 merge keranjang ke main"
# Catatan: untuk repo tim, lebih aman lewat PR dibanding script ini.
set -e

MSG="$1"
if [ -z "$MSG" ]; then
  echo "Pakai: $0 \"pesan commit\""
  exit 1
fi

CURRENT=$(git branch --show-current)
echo "Branch aktif: $CURRENT"

git add -A
if ! git diff --cached --quiet; then
  git commit -m "$MSG"
else
  echo "Tidak ada perubahan baru."
fi

git fetch origin
git checkout main
git pull origin main

if [ "$CURRENT" != "main" ]; then
  git merge "$CURRENT"
fi

git push origin main
echo "Selesai push ke main."
