# Zinfurn — Furniture E-commerce Marketplace

**Live:** [zinfurn.uz](https://zinfurn.uz) · **API:** GraphQL @ api.zinfurn.uz · **Backend repo:** [Zinfurn](https://github.com/asadbek0512/Zinfurn)

A production-deployed furniture marketplace: browsing with rich filters, ordering with coupons, a repair-service vertical, agent profiles, community articles, an AI shopping assistant, and a full admin panel — in 5 languages with a hand-built dark/light theme system.

---

## Features

**Storefront**
- Product catalog with faceted filters (category, type, material, color, price, condition), typo-tolerant live search, list/grid view modes
- Flash Sale section driven by a server-side "active sale" filter with live countdowns
- Cart → 3-step checkout with **coupon codes** (percent/fixed, usage limits, expiry — discount is computed server-side, never trusted from the client)
- Order lifecycle: pending → processing → shipped → delivered → confirmed, with return requests
- **Telegram order notifications** — customers with a linked Telegram account get a bot message on every status change; admin gets a new-order alert
- Reviews with ratings, favorites, recently viewed, agent following, real-time chat (WebSocket) and notifications

**AI**
- Shopping assistant (Groq · Llama 3.3 70B) grounded in the live catalog: recommends real products as clickable cards and navigates the site via a whitelisted action set
- Automatic content translation (Groq with Gemini fallback): product/article/notice content is machine-translated into all 5 locales on create/update

**Platform**
- i18n: `uz / en / ru / kr / ar` via next-i18next
- **Dark/light theming**: a single CSS custom-property token system (~40 semantic tokens replaced 270+ scattered hardcoded colors); no-flash boot script, `prefers-color-scheme` default, MUI palettes derived from the same tokens
- SEO: SSR product list & detail pages (crawlers get real product HTML), sitemap, hreflang, JSON-LD
- Responsive: dedicated mobile layout ≤768px; 769–1400px windows scale-to-fit so the fixed-width desktop design never clips
- Admin panel: users, properties, community, CS content, **coupons**, order management

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 (Pages Router) · TypeScript · MUI 5 · SCSS (token-based theming) |
| Data | Apollo Client (GraphQL) + WebSocket subscriptions |
| Backend | NestJS 10 monorepo · Apollo Server (code-first) · MongoDB/Mongoose |
| Auth | JWT (1h access + 30d refresh, rotation) · Google OAuth · Telegram OAuth |
| AI | Groq (Llama 3.3 70B) · Gemini fallback |
| Infra | Docker on VPS · Nginx + SSL · cron-based auto-deploy on push to `main` |

## Security Highlights

- **Brute-force protection**: global + per-endpoint rate limiting (login/signup 5/min, GraphQL-aware throttler guard behind `trust proxy`)
- **Token pair**: 1h access / 30d refresh with rotation; refresh tokens carry a `tokenType` claim and are rejected as access credentials; blocked members can't refresh
- **Server-authoritative money math**: coupon validation/redemption is atomic (race-safe usage limits) and discounts are recomputed server-side
- **Uploads**: target-directory whitelist (path-traversal safe), extension pinning, and content transcoding through `sharp` (a non-image can't survive re-encoding)
- GraphQL: depth limit, introspection & playground disabled in production
- Nginx layer: HSTS, CSP (Telegram-widget aware), frame/content-type protections; helmet on the API

## Architecture

```
zinfurn/
├── zinfurn/                 # NestJS monorepo
│   ├── apps/zinfurn-api     #   GraphQL + WebSocket + OAuth (port 3007)
│   └── apps/zinfurn-batch   #   cron jobs (rankings)
└── zinfurn-next/            # Next.js frontend (port 3006)
    ├── pages/               #   routes (+ /_admin panel)
    ├── libs/components/     #   feature components
    ├── apollo/              #   client, queries, reactive stores
    └── scss/                #   pc/ + mobile/ splits, theme.scss tokens
```

Deploys are boring on purpose: push to `main` → a VPS cron detects the new commit within a minute → `git reset --hard` + container recreate → runtime build. A committed pre-push hook builds the project locally (in an isolated dist dir) so a broken build can never reach `main`.

## Known Limitations

Being upfront — these are conscious trade-offs, not blind spots:

1. **No real payment provider.** Checkout validates a card form and creates the order, but no PSP (Payme/Click/Stripe) is wired yet — merchant onboarding is the blocker, the order model is ready for it.
2. **Demo order progression.** Order statuses auto-advance (pending→delivered in ~1 min) via in-process timers so reviewers can see the full lifecycle without a warehouse. In a real deployment this is replaced by admin/ops updates; timers don't survive a restart.
3. **JWTs live in `localStorage`.** Mitigated by a strict nginx CSP; the httpOnly-cookie migration is planned but touches WebSocket auth and both OAuth flows, so it's deliberately a separate change.
4. **Refresh tokens are stateless.** Rotation works, but there's no server-side revocation store — a stolen refresh token is valid until expiry unless the member is blocked.
5. **Test coverage is thin.** The auth token system has focused unit tests (8); the rest of the codebase relies on typed contracts and manual E2E passes. Widening coverage is the top of the roadmap.
6. **~60s deploy window.** Runtime-build deploys briefly 502; an earlier zero-downtime attempt was reverted for env-injection reasons, and revisiting it needs build-arg plumbing.
7. **Single-instance assumptions.** Rate-limit counters and the AI-chat daily quota are in-memory; horizontal scaling would need Redis.
8. **Legacy TS looseness.** Some `any`/`@ts-ignore` remain in older components; new code is typed strictly.

## Running Locally

```bash
# backend (needs MongoDB + .env, see .env.example)
cd zinfurn && npm i && npm run start:dev        # :3007

# frontend
cd zinfurn-next && yarn && yarn dev             # :3000
```

Key env vars: `REACT_APP_API_URL`, `REACT_APP_API_GRAPHQL_URL`, `REACT_APP_API_WS`, `GROQ_API_KEY` (AI chat), backend `SECRET_TOKEN`, `MONGO_DEV`, OAuth credentials.

---

**Author:** Asadbek Khusanov · [Telegram](https://t.me/Khusanov_Asadbek2000)
