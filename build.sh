#!/usr/bin/env bash
set -e

echo "==> Node: $(node --version) | npm: $(npm --version)"
echo "==> PWD: $(pwd)"

echo "==> Installing server dependencies..."
cd server && npm ci && cd ..

echo "==> Installing client dependencies..."
cd client && npm ci

echo "==> Building client..."
npm run build

echo "==> Build complete. Dist contents:"
ls -la dist/
