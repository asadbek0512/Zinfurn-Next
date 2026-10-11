#!/bin/bash
set -e
git fetch origin main
git reset --hard origin/main

# Yangi image build — eski container shu vaqtda ishlab turaveradi (502 oynasi yo'q)
docker compose -f docker-compose.prod.yml build

# Tayyor image'ga tez almashtirish (bir necha soniya uziladi)
docker compose -f docker-compose.prod.yml up -d

# Eski ishlatilmagan image'larni tozalash
docker image prune -f >/dev/null 2>&1 || true
