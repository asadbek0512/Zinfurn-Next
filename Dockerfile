# Zinfurn frontend — production image.
# `next build` image-build bosqichida bajariladi: deploy paytida eski container
# ishlab turaveradi, almashtirish bir necha soniya (502 oynasi yo'qoladi).
FROM node:20-alpine

WORKDIR /usr/src/zinfurn-next

# Deps — alohida layer (kod o'zgarsa ham cache'dan foydalanadi)
COPY package.json yarn.lock ./
RUN yarn install

# Kod + .env.production (NEXT_PUBLIC_* build vaqtida kerak — Next uni avtomatik o'qiydi)
COPY . .
RUN yarn build

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["yarn", "start"]
