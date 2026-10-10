#!/usr/bin/env bash
# Clone repo GitHub
# Pakai: ./scripts/clone.sh <repo-url> [nama-folder]
# Contoh: ./scripts/clone.sh https://github.com/owner/e-commerce.git .
#        ./scripts/clone.sh https://github.com/owner/e-commerce.git e-commerce
set -e

if [ -z "$1" ]; then
  echo "Pakai: $0 <repo-url> [nama-folder]"
  echo "Contoh: $0 https://github.com/owner/repo.git ."
  exit 1
fi

REPO_URL="$1"
TARGET="${2:-}"

if [ "$TARGET" = "." ]; then
  # Clone isi repo langsung ke folder saat ini (folder harus kosong)
  echo "Clone $REPO_URL ke folder saat ini..."
  git clone "$REPO_URL" temp-clone
  shopt -s dotglob
  mv temp-clone/* .
  rmdir temp-clone
else
  if [ -z "$TARGET" ]; then
    git clone "$REPO_URL"
  else
    git clone "$REPO_URL" "$TARGET"
  fi
fi

echo "Selesai clone: $REPO_URL"
