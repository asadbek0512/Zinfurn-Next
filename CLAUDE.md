# Zinfurn Frontend

Next.js 14 frontend for the Zinfurn furniture marketplace — browsing, filtering, ordering, repair service, agent profiles, community, AI chat, and admin panel.

## Tech Stack

- Framework: Next.js 14 + TypeScript (Pages Router)
- Data: Apollo Client (GraphQL) + WebSocket subscriptions
- UI: MUI 5 + SCSS (separate `pc/` and `mobile/` stylesheets)
- State: Apollo reactive variables (`userVar`, `socketVar`)
- Auth: JWT in localStorage, auto-refreshed via `TokenRefreshLink`
- i18n: next-i18next (uz, en, kr, ru, ar — 5 locales)
- AI: OpenAI chat via `pages/api/ai-chat.ts`
- Deploy: Docker on VPS, CI/CD via GitHub Actions

## Architecture

```
pages/
├── _admin/             # Admin panel (community, cs, properties, users)
├── account/join.tsx    # Login / signup
├── agent/              # Agent list and detail
├── community/          # Articles (index, detail)
├── cs/                 # Customer support
├── member/             # Member profile
├── mypage/             # Personal dashboard
├── order/tracking.tsx  # Order tracking
├── property/           # Furniture list and detail
├── repairService/      # Repair service (index, detail)
├── checkout.tsx        # Checkout
├── index.tsx           # Homepage
└── api/ai-chat.ts      # AI chat API route

libs/
├── components/
│   ├── admin/          # Admin UI
│   ├── agent/          # Agent cards and profiles
│   ├── cart/           # Cart
│   ├── common/         # Shared components
│   ├── community/      # Article components
│   ├── homepage/       # Hero, trending, top agents, brands
│   ├── layout/         # LayoutHome, LayoutAdmin
│   ├── property/       # Furniture components
│   ├── repairService/  # Repair components
│   ├── AiChat.tsx      # AI chat widget
│   ├── Chat.tsx        # WebSocket chat
│   ├── Footer.tsx
│   └── Top.tsx         # Navigation header
├── auth/index.ts       # logIn, signUp, refreshTokens, logOut
├── config.ts           # Constants (price ranges, mileage, years)
├── enums/              # Shared enums (property, order, member, etc.)
├── hooks/useDeviceDetect.ts
├── sweetAlert.ts       # sweetalert2 helpers
├── types/              # TypeScript interfaces (mirrors backend DTOs)
└── utils/              # cartUtils, flyToCart, orderUtils

apollo/
├── admin/              # Admin queries and mutations
├── user/               # User queries and mutations
├── client.ts           # Apollo setup (auth link, WebSocket, TokenRefreshLink)
└── store.ts            # userVar, socketVar reactive variables

scss/
├── pc/                 # Desktop styles per feature
├── mobile/             # Mobile styles per feature
├── MaterialTheme/      # MUI theme (index, shadow, styled, typography)
├── app.scss
├── reset.scss
└── variables.scss
```

## Key Conventions

- Pages Router only — never use App Router patterns
- `useDeviceDetect()` hook determines layout — mobile and desktop render different JSX
- SCSS is device-split: every feature needs both `scss/pc/` and `scss/mobile/` files
- GraphQL queries in `apollo/user/query.ts`, mutations in `apollo/user/mutation.ts`
- Admin uses `apollo/admin/` and `pages/_admin/` with `LayoutAdmin` wrapper
- Auth state: `useReactiveVar(userVar)` — decoded from JWT, set after login
- Alerts: `sweetalert2` via `libs/sweetAlert.ts` for user messages, `notistack` for notifications
- Filter state serialized as JSON in URL query params: `?input=JSON`
- i18n: translations in `public/locales/{uz,en,kr,ru,ar}/`

## Auth Flow

1. `logIn()` or `signUp()` in `libs/auth/index.ts` calls GraphQL mutation
2. Response: access token + refresh token → stored in `localStorage`
3. `TokenRefreshLink` in `apollo/client.ts` detects expired access token automatically
4. `isTokenExpired()` checks JWT `exp` claim client-side
5. `logOut()` clears both tokens and redirects to `/`

## Commands

```bash
yarn dev        # Dev server
yarn build      # Production build
yarn start      # Run production build
yarn lint       # ESLint (next/core-web-vitals)
```

## Docker

```bash
docker compose up -d                                       # Dev (volume mount)
docker compose -f docker-compose.prod.yml build            # Prod build (env baked as args)
docker compose -f docker-compose.prod.yml up -d            # Prod run (port 4006 -> 3006)
```

## Environment Variables

See `.env.local` (copy from `.env.example`). Frontend needs:

- `NEXT_PUBLIC_API_URL` — Backend API base URL
- `NEXT_PUBLIC_GRAPHQL_URL` — GraphQL endpoint
- `NEXT_PUBLIC_API_WS` — WebSocket URL
- `OPENAI_API_KEY` — AI chat (server-side only, in `pages/api/ai-chat.ts`)

## Deployment

VPS: Docker container behind Nginx with SSL. Port 4006 externally, 3006 internally. CI/CD via GitHub Actions on push to `develop` — build + lint, then SSH deploy with retry.
