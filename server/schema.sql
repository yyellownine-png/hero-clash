
CREATE TABLE IF NOT EXISTS users (
  telegram_id TEXT PRIMARY KEY,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  level INTEGER NOT NULL DEFAULT 1,
  coins BIGINT NOT NULL DEFAULT 500,
  gems BIGINT NOT NULL DEFAULT 50,
  energy INTEGER NOT NULL DEFAULT 30,
  xp INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  battles INTEGER NOT NULL DEFAULT 0,
  fragments INTEGER NOT NULL DEFAULT 0,
  tickets INTEGER NOT NULL DEFAULT 1,
  heroes JSONB NOT NULL DEFAULT '[]'::jsonb,
  hero_levels JSONB NOT NULL DEFAULT '{"lumi":1,"roxy":1,"nox":1,"blitz":1}'::jsonb,
  cleared_stages JSONB NOT NULL DEFAULT '{}'::jsonb,
  chests JSONB NOT NULL DEFAULT '{"basic":0,"rare":0,"epic":0,"legendary":0}'::jsonb,
  premium_until TIMESTAMPTZ,
  current_world INTEGER NOT NULL DEFAULT 1,
  current_stage INTEGER NOT NULL DEFAULT 1,
  referred_by TEXT REFERENCES users(telegram_id),
  referral_earned BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS referrals (
  id BIGSERIAL PRIMARY KEY,
  referrer_id TEXT NOT NULL REFERENCES users(telegram_id),
  referred_id TEXT NOT NULL UNIQUE REFERENCES users(telegram_id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  order_id TEXT PRIMARY KEY,
  telegram_id TEXT NOT NULL REFERENCES users(telegram_id),
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('GRAM','USDT')),
  amount NUMERIC(30,18) NOT NULL,
  currency TEXT NOT NULL,
  amount_base_units NUMERIC(40,0) NOT NULL,
  address TEXT NOT NULL,
  comment TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  tx_hash TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_pending ON orders(status, expires_at);
CREATE INDEX IF NOT EXISTS idx_orders_wallet ON orders(address, method, status);

CREATE TABLE IF NOT EXISTS payments (
  tx_hash TEXT PRIMARY KEY,
  order_id TEXT NOT NULL UNIQUE REFERENCES orders(order_id),
  method TEXT NOT NULL,
  amount NUMERIC(30,18) NOT NULL,
  verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ledger (
  id BIGSERIAL PRIMARY KEY,
  telegram_id TEXT NOT NULL REFERENCES users(telegram_id),
  order_id TEXT,
  type TEXT NOT NULL,
  coins BIGINT NOT NULL DEFAULT 0,
  gems BIGINT NOT NULL DEFAULT 0,
  energy INTEGER NOT NULL DEFAULT 0,
  fragments INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS active_battles (
  battle_id TEXT PRIMARY KEY,
  telegram_id TEXT NOT NULL REFERENCES users(telegram_id),
  world INTEGER NOT NULL,
  stage INTEGER NOT NULL,
  enemy_hp INTEGER NOT NULL,
  enemy_max_hp INTEGER NOT NULL,
  hero_hp INTEGER NOT NULL,
  hero_max_hp INTEGER NOT NULL,
  reward_coins BIGINT NOT NULL,
  reward_gems INTEGER NOT NULL,
  reward_xp INTEGER NOT NULL,
  first_clear BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','won','lost','expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_active_battles_user ON active_battles(telegram_id,status);

ALTER TABLE users ADD COLUMN IF NOT EXISTS hero_levels JSONB NOT NULL DEFAULT '{"lumi":1,"roxy":1,"nox":1,"blitz":1}'::jsonb;
ALTER TABLE users ADD COLUMN IF NOT EXISTS cleared_stages JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE users ADD COLUMN IF NOT EXISTS chests JSONB NOT NULL DEFAULT '{"basic":0,"rare":0,"epic":0,"legendary":0}'::jsonb;

ALTER TABLE users ADD COLUMN IF NOT EXISTS daily_state JSONB NOT NULL DEFAULT '{}'::jsonb;
CREATE TABLE IF NOT EXISTS admin_audit (id BIGSERIAL PRIMARY KEY, action TEXT NOT NULL, telegram_id TEXT, meta JSONB, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE INDEX IF NOT EXISTS idx_users_wins ON users(wins DESC);
CREATE INDEX IF NOT EXISTS idx_users_level ON users(level DESC);
