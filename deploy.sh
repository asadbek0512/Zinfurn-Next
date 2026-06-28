#!/bin/bash
set -e
git fetch origin main
git reset --hard origin/main

# Yangi image'ni quramiz — eski konteyner shu vaqt xizmat qilaveradi (uzilish yo'q)
docker compose -f docker-compose.prod.yml build

# Tayyor image'ga tez almashtirish (~2-3s)
docker compose -f docker-compose.prod.yml up -d

# Eski ishlatilmayotgan image'larni tozalash
docker image prune -f >/dev/null 2>&1 || true
