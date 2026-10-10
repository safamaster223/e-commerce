#!/usr/bin/env bash
# Buat issue GitHub via gh CLI
# Pakai: ./scripts/create-issue.sh "judul" "isi" [label]
# Contoh: ./scripts/create-issue.sh "[PPL-13] Bug checkout" "Langkah reproduksi..." "bug"
set -e

TITLE="$1"
BODY="$2"
LABEL="$3"

if [ -z "$TITLE" ] || [ -z "$BODY" ]; then
  echo "Pakai: $0 \"judul\" \"isi\" [label]"
  exit 1
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "ERROR: gh CLI belum terinstal. Install: https://cli.github.com/"
  exit 1
fi

if [ -z "$LABEL" ]; then
  gh issue create --title "$TITLE" --body "$BODY"
else
  gh issue create --title "$TITLE" --body "$BODY" --label "$LABEL"
fi

echo "Issue dibuat: $TITLE"
