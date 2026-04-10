#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

cleanup() {
  trap - EXIT INT TERM
  echo "Shutting down..."
  docker compose -f "$ROOT_DIR/backend/docker-compose.yml" down
  kill -- -$$ 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "Starting MediaCMS..."
docker compose -f "$ROOT_DIR/backend/docker-compose.yml" up -d

echo "Starting Next.js dev server..."
cd "$ROOT_DIR"
pnpm turbo run dev
