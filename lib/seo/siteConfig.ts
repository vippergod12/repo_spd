/**
 * Cấu hình trung tâm cho SEO + thương hiệu của shop R.E.P.O.
 *
 * R.E.P.O — Reliable Esports PUBG Outlet
 * Chuyên mua bán account PUBG: BATTLEGROUNDS (PC / Steam) uy tín, có bảo hành.
 *
 * - Đặt NEXT_PUBLIC_SITE_URL trong `.env` (vd `https://repo-shop.vn`) để các thẻ
 *   canonical / Open Graph / sitemap dùng đúng domain production.
 * - Khi deploy lên Vercel, fallback dùng VERCEL_URL được set tự động.
 * - Thông tin liên hệ (Zalo / hotline / email / địa chỉ) đọc từ env, có default
 *   để không vỡ UI khi chạy local lần đầu.
 */

function isValidUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function resolveSiteUrl(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.SITE_URL,
  ];

  for (const raw of candidates) {
    const v = raw?.trim();
    if (v && isValidUrl(v)) return v.replace(/\/$/, '');
  }

  const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL?.trim() || process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    const withScheme = `https://${vercelUrl.replace(/\/$/, '')}`;
    if (isValidUrl(withScheme)) return withScheme;
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  return 'http://localhost:3000';
}

export const SITE_URL = resolveSiteUrl();

export const SITE_NAME = 'R.E.P.O';

export const SITE_FULL_NAME = 'R.E.P.O — Reliable Esports PUBG Outlet';

export const SITE_TAGLINE = 'Shop account PUBG PC uy tín — Conqueror, Mythic skins, M416 Glacier';

export const SITE_DESCRIPTION =
  'R.E.P.O — Cửa hàng mua bán account PUBG: BATTLEGROUNDS (Steam/PC) uy tín tại Việt Nam. Acc Conqueror, Ace, Crown, đầy đủ skin Glacier M416/AKM/AWM, set rare, level cao. Bảo hành trọn đời, đổi mật khẩu / mail / hotmail full quyền.';

export const SITE_LOCALE = 'vi_VN';

export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.jpg`;

export const SITE_KEYWORDS = [
  'shop acc pubg',
  'mua bán acc pubg',
  'acc pubg pc',
  'acc pubg steam',
  'account pubg battlegrounds',
  'acc pubg conqueror',
  'acc pubg ace',
  'acc pubg m416 glacier',
  'acc pubg akm glacier',
  'acc pubg awm glacier',
  'acc pubg mythic',
  'mua acc pubg uy tín',
  'shop pubg pc',
  'thanh lý acc pubg',
  'acc pubg giá rẻ',
  SITE_NAME,
];

/** Tạo URL tuyệt đối từ path tương đối (đảm bảo có domain). */
export function absoluteUrl(path: string): string {
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

/* =====================================================================
   THÔNG TIN LIÊN HỆ — đọc từ env, dùng cho Footer / trang Tư vấn / JSON-LD
   ===================================================================== */

const RAW_PHONE = (process.env.NEXT_PUBLIC_ZALO_PHONE ?? '0987654321').toString().trim();

function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/[\s.\-()]/g, '');
  if (cleaned.startsWith('+84')) return '0' + cleaned.slice(3);
  if (cleaned.startsWith('84') && cleaned.length === 11) return '0' + cleaned.slice(2);
  return cleaned;
}

export const ZALO_PHONE = normalizePhone(RAW_PHONE);
export const ZALO_URL =
  process.env.NEXT_PUBLIC_ZALO_URL?.trim() ||
  (ZALO_PHONE ? `https://zalo.me/${ZALO_PHONE}` : '');

export const HOTLINE = (process.env.NEXT_PUBLIC_HOTLINE || ZALO_PHONE || '0987654321').trim();
export const EMAIL = (process.env.NEXT_PUBLIC_EMAIL || 'support@repo-shop.vn').trim();

/** Link Telegram / Facebook / Discord — kênh giao dịch phổ biến với gamer. */
export const TELEGRAM_URL = (process.env.NEXT_PUBLIC_TELEGRAM_URL || 'https://t.me/repo_shop').trim();
export const FACEBOOK_URL = (process.env.NEXT_PUBLIC_FACEBOOK_URL || 'https://facebook.com/repo.shop.pubg').trim();
export const DISCORD_URL = (process.env.NEXT_PUBLIC_DISCORD_URL || '').trim();

export const COMPANY = {
  name: 'R.E.P.O — Reliable Esports PUBG Outlet',
  address: 'Văn phòng giao dịch online — Hà Nội & TP. Hồ Chí Minh',
  city: 'Hà Nội',
  country: 'VN',
  workingHours: '9:00 - 23:00 (cả tuần, kể cả ngày lễ)',
};
