# HERO CLASH — FINAL PROJECT BUILD

Telegram Mini App / mobile-first sci-fi hero battler.

## Included
- 10 worlds × 20 stages
- server-authoritative PvE battle system
- Coins / Gems / Energy / XP / Fragments
- 4 heroes with original SVG artwork
- hero levels 1–50
- skills + ultimate combat actions
- first-clear rewards / mini-boss / world-boss rewards
- real chest inventory + server-side chest opening
- duplicate hero → fragments
- daily quests
- referral system
- leaderboard API
- profile / RU + EN
- shop catalog
- GRAM payment flow via TON Connect
- USDT BEP20 order verification flow
- PostgreSQL persistence
- transaction idempotency
- Docker Compose deployment
- production deployment documentation

## No Stars
Telegram Stars are intentionally excluded from the game economy and shop.

## Important payment note
The code implements the requested GRAM and USDT payment paths, but real production operation still requires the merchant's own Telegram bot token, PostgreSQL/database, RPC/API credentials and HTTPS hosting. Those credentials cannot safely be bundled into a public source archive.

## Price source
GRAM catalog values are defined in the backend product catalog. USDT quotes are derived from the configured `GRAM_USDT_RATE`; there is no separate invented USDT economy.

## Merchant wallets
GRAM: `UQAZ3funj_qRm0ZN6N6KK35zSL4gYPkxRjTX_QsOKi_8oRBw`
USDT BEP20: `0xa3CD09200F8A0e8dBd27e0dE56a1B1CF9b14EbD2`

## Local structure
- `index.html`, `main.js`, `style.css` — frontend
- `assets/` — game artwork
- `server/` — backend + database schema
- `docker-compose.yml` — PostgreSQL + backend
- `DEPLOYMENT.md` — production deployment
