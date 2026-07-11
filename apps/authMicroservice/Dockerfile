FROM node:lts-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx nx build authMicroservice

FROM node:lts-alpine
WORKDIR /app

COPY --from=builder /app .

CMD ["node", "apps/authMicroservice/dist/main.js"]
