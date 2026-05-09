-- Schema cho R.E.P.O Shop (Neon Postgres)
-- Bán account PUBG: BATTLEGROUNDS (PC / Steam)
--
-- Bảng `products` thực chất là "accounts" — giữ tên cũ để các API/route handler
-- không phải refactor toàn bộ. Mọi field PUBG-specific là ALTER TABLE ADD IF NOT EXISTS
-- nên có thể chạy lại trên DB cũ an toàn (idempotent).

CREATE TABLE IF NOT EXISTS categories (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  slug        VARCHAR(160) NOT NULL UNIQUE,
  image_url   TEXT,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_url   TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE TABLE IF NOT EXISTS products (
  id            SERIAL PRIMARY KEY,
  category_id   INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name          VARCHAR(200) NOT NULL,
  slug          VARCHAR(220) NOT NULL UNIQUE,
  description   TEXT,
  price         NUMERIC(12, 2) NOT NULL DEFAULT 0,
  sale_price    NUMERIC(12, 2),
  sale_end_at   TIMESTAMPTZ,
  image_url     TEXT,                              -- ảnh bìa (mirror images[0])
  images        TEXT[] NOT NULL DEFAULT '{}',      -- gallery screenshot xác minh in-game
  colors        TEXT[] NOT NULL DEFAULT '{}',      -- tags mô tả (vd: "Glacier M416", "Wanderer Set")
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  is_hero       BOOLEAN NOT NULL DEFAULT FALSE,
  featured_rank INTEGER,
  -- PUBG-specific
  account_code      VARCHAR(40),                   -- mã hiển thị buyer (vd: #REPO1024)
  tier              VARCHAR(40),                   -- Conqueror / Ace / Crown / ...
  steam_level       INTEGER,                       -- Steam level
  pubg_level        INTEGER,                       -- PUBG career level
  server            VARCHAR(20),                   -- AS / SEA / EU / NA / KR/JP / Global
  hours_played      INTEGER,                       -- Số giờ đã chơi
  skin_count        INTEGER,                       -- Tổng skin (gun + outfit)
  has_mythic        BOOLEAN NOT NULL DEFAULT FALSE,-- Có Glacier / Fool / Mythic items
  register_method   VARCHAR(40),                   -- Steam Mail / Phone / Full
  gcoin_balance     INTEGER,                       -- Dư G-Coin
  is_sold           BOOLEAN NOT NULL DEFAULT FALSE,-- Đã bán
  kd_ratio          NUMERIC(5, 2),                 -- K/D
  win_rate          NUMERIC(5, 2),                 -- Win % (0-100)
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Migrations cho DB đã tồn tại
ALTER TABLE products ADD COLUMN IF NOT EXISTS price             NUMERIC(12, 2) NOT NULL DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sale_price        NUMERIC(12, 2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS sale_end_at       TIMESTAMPTZ;
ALTER TABLE products ADD COLUMN IF NOT EXISTS featured_rank     INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_hero           BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active         BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url         TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS images            TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS description       TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS colors            TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW();
-- PUBG-specific migrations
ALTER TABLE products ADD COLUMN IF NOT EXISTS account_code      VARCHAR(40);
ALTER TABLE products ADD COLUMN IF NOT EXISTS tier              VARCHAR(40);
ALTER TABLE products ADD COLUMN IF NOT EXISTS steam_level       INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS pubg_level        INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS server            VARCHAR(20);
ALTER TABLE products ADD COLUMN IF NOT EXISTS hours_played      INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS skin_count        INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS has_mythic        BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS register_method   VARCHAR(40);
ALTER TABLE products ADD COLUMN IF NOT EXISTS gcoin_balance     INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_sold           BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS kd_ratio          NUMERIC(5, 2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS win_rate          NUMERIC(5, 2);

ALTER TABLE products DROP COLUMN IF EXISTS stock;
ALTER TABLE products DROP COLUMN IF EXISTS sizes;

-- Backfill images cho dữ liệu cũ
UPDATE products
SET images = ARRAY[image_url]
WHERE image_url IS NOT NULL
  AND image_url <> ''
  AND (images IS NULL OR cardinality(images) = 0);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active   ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_sold     ON products(is_sold);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured_rank) WHERE featured_rank IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_hero ON products(is_hero) WHERE is_hero = TRUE;

CREATE INDEX IF NOT EXISTS idx_products_listing
  ON products(is_sold ASC, is_active DESC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_products_tier ON products(tier) WHERE tier IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

-- pg_trgm cho ILIKE search theo name & account_code
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_products_name_trgm
  ON products USING gin (name gin_trgm_ops);

CREATE TABLE IF NOT EXISTS admins (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(80) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Yêu cầu tư vấn / tìm acc theo yêu cầu (form công khai trên /tu-van)
CREATE TABLE IF NOT EXISTS consultations (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(120),
  gender        VARCHAR(10),
  phone         VARCHAR(30) NOT NULL,
  note          TEXT,
  status        VARCHAR(20) NOT NULL DEFAULT 'new',
  contacted_at  TIMESTAMPTZ,
  source_ip     VARCHAR(64),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE consultations ADD COLUMN IF NOT EXISTS contacted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_consultations_status_created
  ON consultations(status, created_at DESC);

-- Cấu hình trang chủ / nội dung tĩnh
CREATE TABLE IF NOT EXISTS site_settings (
  key        VARCHAR(80) PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO site_settings (key, value) VALUES
  ('home_story', '{"image_url": ""}'::jsonb)
ON CONFLICT (key) DO NOTHING;
