#!/usr/bin/env bash
set -e

echo "==> Node: $(node --version) | npm: $(npm --version)"
echo "==> Working dir: $(pwd)"

echo "==> Installing root deps (includes vite)..."
npm ci

echo "==> Installing server deps..."
(cd server && npm ci)

echo "==> Installing client deps..."
(cd client && npm ci)

echo "==> Building client with vite..."
./node_modules/.bin/vite build client

echo "==> Build complete"
ls -la client/dist/
