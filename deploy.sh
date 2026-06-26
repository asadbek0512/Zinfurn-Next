#!/bin/bash
set -e
git fetch origin main
git reset --hard origin/main
docker compose -f docker-compose.prod.yml up -d --force-recreate
