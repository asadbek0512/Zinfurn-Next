# AI Agent Guide — Zinfurn Frontend

This file helps AI coding agents understand the Next.js frontend quickly.

## What is this?

A Next.js 14 (Pages Router) frontend for a furniture marketplace. Connects to a NestJS GraphQL backend via Apollo Client and WebSockets. Device-adaptive rendering — mobile and desktop layouts differ significantly.

## Quick orientation

| What | Where |
|---|---|
| Page routes | `pages/` |
| React components | `libs/components/{feature}/` |
| GraphQL queries | `apollo/user/query.ts` |
| GraphQL mutations | `apollo/user/mutation.ts` |
| Admin queries | `apollo/admin/query.ts` |
| Apollo client setup | `apollo/client.ts` |
| Global state | `apollo/store.ts` (userVar, socketVar) |
| Auth helpers | `libs/auth/index.ts` |
| TypeScript types | `libs/types/` |
| Enums | `libs/enums/` |
| Constants | `libs/config.ts` |
| Desktop styles | `scss/pc/` |
| Mobile styles | `scss/mobile/` |
| MUI theme | `scss/MaterialTheme/` |
| i18n translations | `public/locales/{uz,en,kr,ru,ar}/` |
| Env vars | `.env.local` (see `.env.example`) |

## Architecture decisions

- Pages Router — all routes in `pages/`, never use App Router
- Device-adaptive: `useDeviceDetect()` returns `'mobile'` or `'desktop'`, components render different JSX per device
- SCSS is device-split: every feature must have `scss/pc/{feature}/` and `scss/mobile/{feature}/`
- Auth state lives in Apollo reactive variable `userVar` — read with `useReactiveVar(userVar)`
- Filter state is serialized as JSON in URL query params (`?input=JSON`)
- Admin panel: `pages/_admin/`, uses `LayoutAdmin` wrapper, `apollo/admin/` for data

## Key patterns to follow

- GraphQL: all queries in `apollo/user/query.ts`, mutations in `apollo/user/mutation.ts`, use `gql` tagged templates
- New page: create `pages/{feature}/index.tsx`, add `useDeviceDetect()`, add SCSS in both `pc/` and `mobile/`, add i18n keys in all 5 locales
- New component: create in `libs/components/{feature}/`, add corresponding SCSS in both device folders
- Alerts: `sweetalert2` via `libs/sweetAlert.ts` for user-facing messages
- Types: mirror backend DTOs in `libs/types/` — keep in sync with GraphQL schema

## Auth flow

1. `logIn()` / `signUp()` in `libs/auth/index.ts` — calls GraphQL mutation, stores tokens in `localStorage`
2. `TokenRefreshLink` in `apollo/client.ts` auto-detects expired access token and calls `refreshTokens()`
3. `isTokenExpired()` checks JWT `exp` claim client-side
4. After login, `userVar` is set with decoded user data — available everywhere via `useReactiveVar(userVar)`
5. `logOut()` clears tokens, resets `userVar`, redirects to `/`

## Build and verify

```bash
yarn install           # Install deps
yarn build             # Production build (catches type and lint errors)
yarn lint              # ESLint check
yarn dev               # Dev server
```

## Things to avoid

- Using App Router patterns (`app/` directory, `use client`, Server Components)
- Adding `@ts-ignore` — fix the underlying type issue instead
- Using `console.log` in production code
- Hardcoding API URLs — always use `process.env.NEXT_PUBLIC_*`
- Adding a new carousel library — `swiper` is already installed
- Writing SCSS for only one device — always update both `pc/` and `mobile/`
