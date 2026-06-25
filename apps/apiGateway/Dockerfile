FROM node:lts-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx nx build apiGateway


FROM node:lts-alpine
WORKDIR /app

COPY --from=builder /app .

CMD ["node", "apps/apiGateway/dist/main.js"]
