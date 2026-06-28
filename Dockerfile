# ---- Builder: dependency o'rnatish + .next build ----
FROM node:20-alpine AS builder
WORKDIR /app

# Avval faqat dependency fayllari (Docker layer cache uchun)
COPY package.json yarn.lock ./
RUN yarn install --network-timeout 600000

# Qolgan kod (.env.production ham kiradi — Next build paytida o'qiydi)
COPY . .

# NODE_ENV=production bo'lganda Next .env.production ni avtomatik yuklaydi
ENV NODE_ENV=production
RUN yarn build

# ---- Runner: faqat ishga tushirish ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/package.json /app/yarn.lock ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/next-i18next.config.js ./next-i18next.config.js

EXPOSE 3000
CMD ["yarn", "start"]
