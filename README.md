# R.E.P.O — Shop bán Account PUBG: BATTLEGROUNDS PC

> **R.E.P.O** = Reliable Esports PUBG Outlet
> Website thương mại điện tử chuyên mua bán **account PUBG: BATTLEGROUNDS (Steam/PC)**
> tại Việt Nam — full skin Glacier, Conqueror tier, bảo hành trọn đời.

Stack: **Next.js 14 (App Router) + TypeScript + Neon Postgres serverless**.
Không có cart/checkout — buyer liên hệ shop qua **Zalo / Telegram / Facebook**
để xem demo Steam in-game trước khi giao dịch.

---

## ✨ Tính năng

- 📦 **Kho account**: 8 danh mục theo tier / loại skin / server (Conqueror, Ace,
  Crown/Diamond, Full Glacier, Mythic/Limited Edition, Starter, Steam High Lv, Server Riêng)
- 🎯 **Filter theo tier** (Conqueror → Bronze) bằng chip màu sắc đặc trưng PUBG
- 🏆 **Tier badge** với màu chuẩn game (Conqueror = magenta, Ace = purple, ...)
- 🛒 **Mua acc**: 3 nút song song (Zalo / Telegram / Facebook) tự copy
  thông tin acc + giá vào clipboard, mở chat private
- 🔒 **Bảo hành trọn đời**: trang `/bao-hanh` với 4 cam kết, 5 bước mua,
  4 phương thức thanh toán
- 📝 **Tìm acc theo yêu cầu**: form `/tu-van` cho khách đăng ký nhu cầu
- 🎨 **Dark gaming theme** + cam PUBG `#f5a623` + cyan `#00d4ff` +
  font Rajdhani/Orbitron
- 📊 **Admin panel** đầy đủ CRUD acc với 14 fields PUBG: tier, level, server,
  KDR, win rate, skin count, has_mythic, register method, G-Coin, sold flag
- 🔍 **SEO chuẩn**: Metadata API, JSON-LD (Product, BreadcrumbList,
  CollectionPage, ItemList), sitemap động, OpenGraph, canonical
- ⚡ **ISR + Server Components** — pre-render cache 60s, hot pages
  load <500ms từ edge

---

## 📂 Cấu trúc thư mục

```
shop_ban_acc_game/
├── app/
│   ├── (public)/              # Routes công khai
│   │   ├── page.tsx           # Trang chủ
│   │   ├── cua-hang/          # Kho acc + filter
│   │   ├── danh-muc/[slug]/   # Theo phân loại
│   │   ├── san-pham/[slug]/   # Chi tiết acc
│   │   ├── gioi-thieu/        # About scrollytelling
│   │   ├── tu-van/            # Tìm acc theo yêu cầu
│   │   └── bao-hanh/          # Cam kết & hướng dẫn
│   ├── admin/                 # Admin panel (CRUD)
│   ├── api/                   # Route handlers
│   ├── globals.css            # Dark gaming theme
│   └── layout.tsx             # Root layout + fonts
├── components/                # UI components
├── db/schema.sql              # Postgres schema (idempotent)
├── lib/
│   ├── data.ts                # Server data fetch
│   ├── types.ts               # TypeScript types
│   ├── api-client.ts          # Browser API client
│   ├── seo/                   # SEO config + JSON-LD
│   ├── server/                # DB + auth + http helpers
│   └── utils/                 # tier, format, sale, zalo
├── scripts/
│   ├── init-db.ts             # Apply schema
│   └── seed.ts                # Seed 8 danh mục + 25 acc
└── public/                    # Static assets
```

---

## 🚀 Cài đặt & Chạy local

### 1. Tạo Neon Postgres (miễn phí)

1. Vào [console.neon.tech](https://console.neon.tech), tạo project mới.
2. Copy **Pooled connection string** vào `.env`.

### 2. Setup project

```bash
# Clone về & cài deps
npm install

# Copy template env
cp .env.example .env
# Mở .env và điền: DATABASE_URL, JWT_SECRET, NEXT_PUBLIC_SITE_URL...

# Apply schema vào DB (idempotent — chạy lại an toàn)
npm run db:init

# Seed 8 danh mục + 25 account PUBG mẫu
npm run db:seed

# Chạy dev server
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem website.

### 3. Đăng nhập admin

- URL: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- Mặc định: `admin / admin@123` (đổi trong `.env`)

---

## 🎮 Schema DB — Account PUBG fields

Bảng `products` (semantic = "accounts") có các cột PUBG-specific:

| Cột | Kiểu | Mô tả |
|---|---|---|
| `account_code` | varchar(40) | Mã hiển thị buyer (vd `#REPO1024`) |
| `tier` | varchar(40) | Conqueror / Ace Master / Crown / Diamond / Platinum / Gold / Silver / Bronze |
| `steam_level` | int | Steam profile level |
| `pubg_level` | int | PUBG career level |
| `server` | varchar(20) | AS / SEA / EU / NA / KR/JP / SA / OC / Global |
| `hours_played` | int | Số giờ đã chơi PUBG |
| `skin_count` | int | Tổng skin (gun + outfit) |
| `has_mythic` | bool | Có Glacier / Mythic items không |
| `register_method` | varchar(40) | Steam Mail / Steam Phone / Steam Full / Other |
| `gcoin_balance` | int | Số dư G-Coin |
| `is_sold` | bool | Đã bán chưa (overlay "Đã bán") |
| `kd_ratio` | numeric(5,2) | K/D ratio |
| `win_rate` | numeric(5,2) | Win rate % |

Field `colors` (kế thừa từ codebase cũ) ở đây dùng làm **skin tags** — vd:
`["Glacier M416", "AWM Pyromaniac", "Wanderer Set", "PGC 2023 Crown"]`.

> ⚠️ **Lưu ý**: shop chỉ bán **PUBG: BATTLEGROUNDS PC (Steam)** — không bán PUBG Mobile.
> Skin/item phổ biến PC: Glacier weapons (M416/AKM/AWM/Kar98K/Mk14), Trench Coat,
> School Skirt, Wanderer Set, Werewolf, PGC Crown, Twitch Drops, Survivor Pass…
> KHÔNG có: X-Suit, Royal Pass, UC, Mythic Forge — đó là PUBG Mobile.

---

## 🔌 API endpoints

| Method | Path | Mô tả |
|---|---|---|
| `POST` | `/api/auth/login` | Đăng nhập admin |
| `GET` | `/api/auth/me` | Thông tin admin hiện tại |
| `GET` | `/api/categories` | List danh mục |
| `POST/PUT/DELETE` | `/api/categories[/id]` | CRUD danh mục (admin) |
| `GET` | `/api/products?category=&q=&tier=&include_sold=` | List acc với filter |
| `POST` | `/api/products` | Tạo acc (admin) |
| `GET/PUT/PATCH/DELETE` | `/api/products/[id]` | CRUD acc |
| `PATCH` | `/api/products/[id]` body `{is_sold: true}` | Đánh dấu đã bán |
| `GET/PUT` | `/api/products/featured` | Acc tiêu biểu trang chủ |
| `GET/PUT` | `/api/products/hero` | Acc hero banner |
| `POST` | `/api/consultations` | Form tìm acc theo yêu cầu |
| `GET` | `/api/home` | Bundle data trang chủ (1 round-trip) |

---

## 🎨 Customize

### Đổi brand (R.E.P.O → S.P.D hoặc tên khác)

Sửa file `lib/seo/siteConfig.ts`:

```ts
export const SITE_NAME = 'S.P.D';
export const SITE_FULL_NAME = 'S.P.D — Steam PUBG Direct';
export const SITE_TAGLINE = '...';
```

Và `components/Navbar.tsx` (logo `R` → `S`),
`components/Footer.tsx` (logo `R` → `S`).

### Đổi màu chủ đạo

Sửa CSS variables trong `app/globals.css`, section `:root` ở đầu file:

```css
:root {
  --primary: #f5a623;       /* PUBG orange */
  --accent: #00d4ff;        /* cyan neon */
  --bg: #0a0e14;            /* dark navy */
  /* ... */
}
```

Toàn bộ site sẽ tự reskin.

### Thêm skin / tier mới

Sửa `lib/utils/tier.ts`:

```ts
export const ALL_TIERS: PubgTier[] = ['Conqueror', 'Ace Master', ...];
export const TIER_COLOR: Record<string, string> = { ... };
```

---

## 📦 Deploy lên Vercel

1. Push code lên GitHub.
2. Vào [vercel.com](https://vercel.com), New Project, import repo.
3. Trong Environment Variables, paste đúng các biến từ `.env.example` (đặc biệt
   `DATABASE_URL`, `JWT_SECRET`, `NEXT_PUBLIC_SITE_URL`).
4. Deploy. Mỗi khi push branch `main`, Vercel auto-build.

Sau lần deploy đầu, vào Vercel Project Settings → Functions → Cron Jobs để
add cron `0 */4 * * *` gọi `/api/_warm` (giữ Neon DB không sleep).

---

## ⚠️ Disclaimer

Website là sản phẩm phục vụ mục đích thương mại của shop độc lập — **không
liên kết** chính thức với KRAFTON / PUBG Studios / Tencent. Mọi quyền sở hữu
trí tuệ về **PUBG: BATTLEGROUNDS** thuộc về KRAFTON Inc.

Buyer có trách nhiệm tuân thủ ToS của Steam / KRAFTON khi mua acc. R.E.P.O
không chịu trách nhiệm với acc bị thu hồi do người mua sử dụng cheat / hack /
share acc cho bên thứ ba.

---

## 📝 License

MIT — Free to fork & customize cho shop của bạn. Có credit là vui :)
