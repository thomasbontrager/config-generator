#!/usr/bin/env bash
set -e

echo "Installing Docker if needed..."

if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com | sh
fi

echo "Starting Shipforge platform..."

cd ../platform
docker compose up -d

echo "Shipforge controller installed."
