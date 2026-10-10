#!/usr/bin/env bash
# Deploy / install lokal untuk repo ini:
# - frontend (React+Vite): npm install + build
# - backend (Laravel 13): composer install + npm install + build + migrate
# Pakai: ./scripts/deploy.sh [--skip-migrate]
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SKIP_MIGRATE=false
if [ "$1" = "--skip-migrate" ]; then
  SKIP_MIGRATE=true
fi

command -v node >/dev/null 2>&1 || { echo "ERROR: node belum terinstal"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "ERROR: npm belum terinstal"; exit 1; }
command -v php >/dev/null 2>&1 || { echo "ERROR: php belum terinstal"; exit 1; }
command -v composer >/dev/null 2>&1 || { echo "ERROR: composer belum terinstal"; exit 1; }

echo "=== 1/2 Frontend ==="
cd "$ROOT/frontend"
if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi
npm run build

echo "=== 2/2 Backend ==="
cd "$ROOT/backend"
composer install --optimize-autoloader

if [ ! -f .env ] && [ -f .env.example ]; then
  cp .env.example .env
  php artisan key:generate --force
fi

if [ -f package-lock.json ]; then
  npm ci --ignore-scripts
else
  npm install --ignore-scripts
fi
npm run build

if [ "$SKIP_MIGRATE" = false ]; then
  php artisan migrate --force
fi

php artisan config:clear
echo "Deploy selesai."
