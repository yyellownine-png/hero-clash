# NEON HEROES — Telegram Mini App

Real runnable full-stack starter for a mobile-first squad RPG.

## Stack
- FastAPI + SQLite backend
- Vanilla JS frontend (no build step required)
- Telegram WebApp authentication validation
- RU/EN interface
- Server-side chest rolls, energy, rewards and battle calculations
- 40 seeded heroes, 8 districts, 4 chest types
- Telegram bot launcher

## Run in Termux
```bash
pkg update
pkg install python -y
cd neon-heroes-FULL-PROJECT
bash run.sh
```
Open `http://127.0.0.1:8000` for local testing. For Telegram Mini App, expose the server over HTTPS and set the URL in BotFather.

## Production notes
Set `TELEGRAM_BOT_TOKEN` in `.env`. Never trust client balances/rewards. Payment/Stars webhooks, PostgreSQL, Redis, HTTPS and monitoring should be configured before public launch.
