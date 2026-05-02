#!/bin/bash
set -e

git reset --hard
git checkout main
git pull origin main

docker compose up -d --force-recreate
docker compose restart
