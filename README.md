# Zinfurn

Frontend for zinfurn.uz — a furniture e-commerce marketplace in Uzbekistan for browsing, ordering, and managing furniture, repair services, agents, and community.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (Pages Router) + TypeScript |
| UI | MUI 5 + SCSS (separate `pc/` and `mobile/` stylesheets) |
| Data | Apollo Client (GraphQL) + WebSocket subscriptions |
| State | Apollo reactive variables (userVar, socketVar) |
| i18n | next-i18next (UZ, EN, KR, RU, AR — 5 locales) |
| Auth | JWT with automatic token refresh via TokenRefreshLink |
| Deploy | Docker + GitHub Actions CI/CD |

## Getting Started

**Prerequisites:** Node.js 20+, Yarn, running Zinfurn backend

```bash
git clone <repo-url>
cd zinfurn-next

yarn install

cp .env.example .env.local
# Fill in: NEXT_PUBLIC_API_URL, NEXT_PUBLIC_GRAPHQL_URL, NEXT_PUBLIC_API_WS

yarn dev
```

Open [http://localhost:3000](http://localhost:3000)

## Docker

```bash
# Development
docker compose up -d

# Production
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

## Features

**For Users**
- Browse and search furniture with advanced filters (category, type, price range, material, location)
- Furniture detail pages with photos, specifications, and agent info
- Like and save favorite listings
- Follow agents and dealers
- Place furniture orders and track order status
- Book repair services with detail pages
- Community board — post articles, comment, like, and engage
- Real-time chat and in-app notifications via WebSocket
- AI-powered chat assistant for furniture recommendations (Gemini API)
- Multilingual interface — Uzbek, English, Korean, Russian, Arabic

**For Agents**
- Create and manage furniture listings with photo uploads
- Personal agent profile with ratings and monthly ranking
- Track listing views, likes, and engagement stats
- Manage incoming orders

**Admin Panel**
- User and agent management with role control
- Furniture listing moderation and approval
- Community content management (articles, comments)
- Repair service management
- Customer support section (notices, FAQ, inquiries)
- Car brand and category management

## Project Structure

```
pages/
├── index.tsx          # Homepage (hero, trending, top agents, brands)
├── property/          # Furniture listing and detail pages
├── repairService/     # Repair service listing and booking
├── agent/             # Agent directory and profile pages
├── community/         # Articles and community discussion
├── mypage/            # User dashboard (favorites, orders, listings, settings)
├── order/tracking.tsx # Order tracking
├── member/            # Member public profile
├── account/join.tsx   # Login / signup
├── checkout.tsx       # Checkout flow
└── _admin/            # Admin panel (users, properties, community, CS)
libs/
├── components/        # React components organized by feature
├── auth/              # JWT helpers (login, signup, refresh, logout)
├── types/             # TypeScript interfaces (mirrors backend DTOs)
├── enums/             # Shared enums (property, order, member types)
└── hooks/             # useDeviceDetect — mobile vs desktop rendering
apollo/
├── client.ts          # Apollo setup (auth link, WebSocket, TokenRefreshLink)
├── store.ts           # Reactive variables
└── user/              # GraphQL queries and mutations
scss/
├── pc/                # Desktop styles per feature
└── mobile/            # Mobile styles per feature
```

## Deployment

Auto-deploys via GitHub Actions on push to `develop`:
1. Build + lint check
2. SSH into VPS
3. Docker rebuild and container restart

## Live

[https://zinfurn.uz](https://zinfurn.uz)

 
