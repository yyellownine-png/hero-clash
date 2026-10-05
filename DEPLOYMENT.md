# Hero Clash — production deployment

The project is split into a static Telegram Mini App frontend and a Node.js/PostgreSQL backend.

## Before launch
Create the production values in `server/.env`. Never commit this file.

Required secrets/config:
- BOT_TOKEN
- TELEGRAM_BOT_USERNAME
- JWT_SECRET
- DATABASE_URL
- FRONTEND_ORIGIN
- BSC_RPC_URL
- TONAPI_KEY (recommended)
- GRAM_USDT_RATE
- BSC_CONFIRMATIONS

Merchant wallets are already configured in `.env.example` from the project specification.

## Database
Run `server/schema.sql` once against PostgreSQL. If using Docker Compose, the schema is mounted automatically on first database initialization.

## Backend
`cd server && npm ci && npm start`

## Frontend
Upload the root frontend files and `assets/` to the static host (GitHub Pages or another HTTPS host).

Set `window.HERO_CLASH_API` to the HTTPS backend URL before `main.js` loads, or save the API URL in the app configuration.

## Telegram
Create/configure the Mini App URL in BotFather and point it at the HTTPS frontend URL.

## Payments
The backend is authoritative. Orders are created server-side. GRAM and USDT are verified from blockchain transactions before the product is granted. Do not manually mark orders as paid.

## Important
This repository contains code and configuration templates. Real third-party credentials and production hosting accounts cannot be embedded in a distributable source archive.
