#!/bin/bash
set -e
git fetch origin develop
git reset --hard origin/develop
docker compose -f docker-compose.prod.yml up -d --force-recreate
