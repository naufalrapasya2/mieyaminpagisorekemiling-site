#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="${1:-$(pwd)}"
APP_NAME="mieyamin-site"
PORT="${PORT:-3000}"

cd "$REPO_DIR"

if [ ! -f package.json ]; then
  echo "package.json not found in $REPO_DIR"
  exit 1
fi

if [ ! -f .env ]; then
  echo ".env not found. Copy .env.production.example to .env first."
  exit 1
fi

npm install --production
npm run init-db || true

if ! command -v pm2 >/dev/null 2>&1; then
  echo "PM2 not installed. Install with: sudo npm i -g pm2"
  exit 1
fi

pm2 start app.js --name "$APP_NAME" --env production || pm2 restart "$APP_NAME" --update-env
pm2 save

echo "Deployment complete."
echo "Check app status with: pm2 status"
echo "Check logs with: pm2 logs $APP_NAME"
