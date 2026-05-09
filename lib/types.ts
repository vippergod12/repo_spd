export interface Category {
  id: number;
  name: string;
  slug: string;
  image_url: string | null;
  description: string | null;
  product_count?: number;
  created_at?: string;
  updated_at?: string;
}

/* PUBG: BATTLEGROUNDS tier system (cho ranked mode TPP/FPP).
 * Order quan trọng để filter & sort theo "tier" cao → thấp. */
export type PubgTier =
  | 'Conqueror'
  | 'Ace Master'
  | 'Ace Dominator'
  | 'Ace'
  | 'Crown'
  | 'Diamond'
  | 'Platinum'
  | 'Gold'
  | 'Silver'
  | 'Bronze'
  | 'Unranked';

export const PUBG_TIERS: PubgTier[] = [
  'Conqueror',
  'Ace Master',
  'Ace Dominator',
  'Ace',
  'Crown',
  'Diamond',
  'Platinum',
  'Gold',
  'Silver',
  'Bronze',
  'Unranked',
];

/** Loại đăng ký gốc của tài khoản Steam (để buyer biết acc có thể chuyển mail). */
export type RegisterMethod = 'Steam Mail' | 'Steam Phone' | 'Steam Full' | 'Other';

/** Server / vùng chính của tài khoản. */
export type PubgServer = 'AS' | 'SEA' | 'EU' | 'NA' | 'KR/JP' | 'SA' | 'OC' | 'Global';

/**
 * Product trong R.E.P.O = 1 ACCOUNT PUBG PC.
 * Schema giữ tên `products` để khớp DB cũ, nhưng semantic = "account".
 *
 * Các field PUBG-specific (account_code, tier, level, ...) là OPTIONAL ở mức
 * type để các trang chung (search, list) vẫn render được khi DB cũ chưa migrate.
 * Sau khi chạy `npm run db:init` migrate sẽ có đủ.
 */
export interface Product {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  sale_end_at: string | null;
  /** Ảnh bìa (mirror `images[0]`). */
  image_url: string | null;
  /** Gallery nhiều ảnh (screenshot xác minh in-game). Phần tử đầu là ảnh bìa. */
  images: string[];
  /** Trên MINT cũ là màu túi, trên R.E.P.O dùng làm "skin tag" mô tả nhanh
   *  PUBG PC (vd: ["Glacier M416", "Wanderer Set", "PGC 2023 Crown"]).
   *  KHÔNG dùng skin Mobile (X-Suit, Royal Pass, UC, Mythic Forge). */
  colors: string[];
  is_active: boolean;
  is_hero: boolean;
  featured_rank: number | null;
  created_at?: string;
  updated_at?: string;
  category_name?: string;
  category_slug?: string;

  /* ===== PUBG-specific fields ===== */
  /** Mã hiển thị cho buyer dạng "#ACC1024". Tự gen nếu null. */
  account_code?: string | null;
  /** Tier hiện tại / cao nhất của account. */
  tier?: PubgTier | null;
  /** Steam level. */
  steam_level?: number | null;
  /** PUBG career level (Survivor Pass / season level). */
  pubg_level?: number | null;
  /** Server chính. */
  server?: PubgServer | null;
  /** Số giờ đã chơi PUBG. */
  hours_played?: number | null;
  /** Tổng số skin súng / outfit. */
  skin_count?: number | null;
  /** Có Mythic / Glacier / Fool / Wanderer / PGC items không (PUBG PC only). */
  has_mythic?: boolean | null;
  /** Loại đăng ký (cho biết buyer có đổi mail được không). */
  register_method?: RegisterMethod | null;
  /** Số dư G-Coin (PUBG PC). */
  gcoin_balance?: number | null;
  /** Đã bán chưa. Khi sold = TRUE thì soldout overlay hiện. */
  is_sold?: boolean | null;
  /** K/D ratio, 1 dấu thập phân. */
  kd_ratio?: number | null;
  /** Win rate %, vd 12.5. */
  win_rate?: number | null;
}

export interface AdminUser {
  sub: number;
  username: string;
}

export interface LoginResponse {
  token: string;
  admin: { id: number; username: string };
}

export interface ApiError {
  message: string;
}

export type ConsultationGender = 'male' | 'female' | 'other' | null;
export type ConsultationStatus = 'new' | 'contacted';

export interface Consultation {
  id: number;
  name: string | null;
  gender: ConsultationGender;
  phone: string;
  note: string | null;
  status: ConsultationStatus;
  contacted_at: string | null;
  source_ip: string | null;
  created_at: string;
}
