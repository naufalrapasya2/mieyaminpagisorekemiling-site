#!/usr/bin/env bash
set -euo pipefail

APP_PORT="${PORT:-3000}"
APP_NAME="mieyamin-site"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "$REPO_ROOT"

if [ ! -f package.json ]; then
  echo "package.json not found in $REPO_ROOT"
  exit 1
fi

if [ ! -f .env ]; then
  echo "No .env file found. Creating from .env.production.example..."
  cp .env.production.example .env
fi

if [ ! -d node_modules ]; then
  echo "Installing dependencies..."
  npm install
fi

if [ ! -f data/database.sqlite ]; then
  echo "Initializing SQLite database and seed data..."
  npm run init-db
fi

if [ -n "${NGROK_AUTHTOKEN:-}" ]; then
  echo "Starting app on http://localhost:${APP_PORT} and ngrok tunnel..."
  (npm start > /tmp/${APP_NAME}.log 2>&1 &) && (npx ngrok http ${APP_PORT} > /tmp/${APP_NAME}-ngrok.log 2>&1 &)
  echo "App started."
  echo "Check local: http://localhost:${APP_PORT}"
  echo "Check ngrok: tail -f /tmp/${APP_NAME}-ngrok.log"
  exit 0
fi

if command -v lt >/dev/null 2>&1; then
  echo "Starting app on http://localhost:${APP_PORT} and localtunnel..."
  (npm start > /tmp/${APP_NAME}.log 2>&1 &) && (lt --port ${APP_PORT} --subdomain mieyaminlocal > /tmp/${APP_NAME}-lt.log 2>&1 &)
  echo "App started."
  echo "Check local: http://localhost:${APP_PORT}"
  echo "Check tunnel: tail -f /tmp/${APP_NAME}-lt.log"
  exit 0
fi

echo "Starting app only on localhost..."
(npm start > /tmp/${APP_NAME}.log 2>&1 &)
echo "App launched. Open: http://localhost:${APP_PORT}"
action="${1:-}"
