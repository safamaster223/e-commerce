#!/usr/bin/env bash
# Push branch aktif ke origin (untuk kerja fitur / PR)
# Pakai: ./scripts/push-repo.sh "pesan commit" [nama-branch]
# Contoh: ./scripts/push-repo.sh "PPL-12 tambah keranjang"
set -e

MSG="$1"
BRANCH="${2:-$(git branch --show-current)}"

if [ -z "$MSG" ]; then
  echo "Pakai: $0 \"pesan commit\" [nama-branch]"
  exit 1
fi

echo "Branch: $BRANCH"
git add -A

if git diff --cached --quiet; then
  echo "Tidak ada perubahan untuk di-commit."
else
  git commit -m "$MSG"
fi

git push -u origin "$BRANCH"
echo "Selesai push ke origin/$BRANCH"
