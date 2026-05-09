import type { NextRequest } from 'next/server';
import { sql } from '@/lib/server/db';
import { getAdminFromRequest } from '@/lib/server/auth';
import {
  badRequest,
  jsonError,
  jsonOk,
  parseStringArray,
  slugify,
  unauthorized,
} from '@/lib/server/http';
import { sanitizeHtml } from '@/lib/server/sanitize-html';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEFAULT_LIST_LIMIT = 60;
const MAX_LIST_LIMIT = 200;

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const categoryRaw = sp.get('category')?.trim() || undefined;
  const search = (sp.get('q') ?? '').trim();
  /** Filter theo tier (vd "Conqueror", "Ace"). */
  const tier = sp.get('tier')?.trim() || null;
  /** "1" = bao gồm acc đã bán; mặc định ẩn. */
  const includeSold = sp.get('include_sold') === '1';
  const limitRaw = sp.get('limit');
  const limit = (() => {
    const n = Number(limitRaw);
    if (!Number.isFinite(n) || n <= 0) return DEFAULT_LIST_LIMIT;
    return Math.min(Math.floor(n), MAX_LIST_LIMIT);
  })();

  const categoryId = categoryRaw && /^\d+$/.test(categoryRaw) ? Number(categoryRaw) : null;
  const categorySlug = categoryRaw && !categoryId ? categoryRaw : null;
  const searchTerm = search ? `%${search}%` : null;

  const rows = await sql`
    SELECT p.id, p.category_id, p.name, p.slug, p.price,
           p.sale_price, p.sale_end_at,
           p.image_url, p.images, p.colors,
           p.is_active, p.is_hero, p.featured_rank,
           p.account_code, p.tier, p.steam_level, p.pubg_level,
           p.server, p.hours_played, p.skin_count, p.has_mythic,
           p.register_method, p.gcoin_balance, p.is_sold,
           p.kd_ratio, p.win_rate,
           p.created_at, p.updated_at,
           c.name AS category_name, c.slug AS category_slug
    FROM products p
    JOIN categories c ON c.id = p.category_id
    WHERE (${categoryId}::int IS NULL OR p.category_id = ${categoryId}::int)
      AND (${categorySlug}::text IS NULL OR c.slug = ${categorySlug}::text)
      AND (${searchTerm}::text IS NULL OR p.name ILIKE ${searchTerm}::text OR p.account_code ILIKE ${searchTerm}::text)
      AND (${tier}::text IS NULL OR p.tier = ${tier}::text)
      AND (${includeSold}::boolean OR p.is_sold = FALSE)
    ORDER BY p.is_sold ASC, p.is_active DESC, p.created_at DESC
    LIMIT ${limit}
  `;
  return jsonOk(rows, {
    cache: 'public',
    cacheOpts: { sMaxAge: 60, staleWhileRevalidate: 300 },
  });
}

const MAX_IMAGES = 10;

function normalizeImages(input: {
  images?: unknown;
  image_url?: string | null;
}): string[] {
  const list: string[] = [];
  const seen = new Set<string>();
  const push = (raw: unknown) => {
    if (typeof raw !== 'string') return;
    const v = raw.trim();
    if (!v) return;
    if (seen.has(v)) return;
    seen.add(v);
    list.push(v);
  };
  if (Array.isArray(input.images)) input.images.forEach(push);
  if (list.length === 0 && input.image_url) push(input.image_url);
  return list.slice(0, MAX_IMAGES);
}

/** Helper: parse số nguyên >= 0, null nếu rỗng / không hợp lệ. */
function nullableInt(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.floor(n);
}

/** Helper: parse số thực >= 0, null nếu rỗng / không hợp lệ. */
function nullableNum(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

/** Helper: trim chuỗi -> null nếu rỗng. */
function nullableStr(v: unknown, maxLen = 80): string | null {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  if (!t) return null;
  return t.length > maxLen ? t.slice(0, maxLen) : t;
}

export async function POST(req: NextRequest) {
  if (!getAdminFromRequest(req)) return unauthorized();

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  const name = (typeof body.name === 'string' ? body.name : '').trim();
  const categoryId = Number(body.category_id);
  const price = Number(body.price ?? 0);
  if (!name) return badRequest('Tên account không được trống');
  if (!categoryId) return badRequest('Cần chọn danh mục');
  if (Number.isNaN(price) || price < 0) return badRequest('Giá không hợp lệ');

  const rawSalePrice = body.sale_price;
  const salePrice =
    rawSalePrice === null || rawSalePrice === undefined || rawSalePrice === ''
      ? null
      : Number(rawSalePrice);
  if (salePrice !== null && (Number.isNaN(salePrice) || salePrice < 0)) {
    return badRequest('Giá sale không hợp lệ');
  }
  const saleEndAt = body.sale_end_at ? new Date(body.sale_end_at as string) : null;
  if (saleEndAt && Number.isNaN(saleEndAt.getTime())) {
    return badRequest('Thời gian kết thúc sale không hợp lệ');
  }
  const saleEndIso = saleEndAt ? saleEndAt.toISOString() : null;

  const colors = parseStringArray(body.colors);
  const images = normalizeImages(body as { images?: unknown; image_url?: string | null });
  const cover = images[0] ?? null;
  const slug = (typeof body.slug === 'string' && body.slug.trim()) || slugify(name);
  const isActive = body.is_active === undefined ? true : Boolean(body.is_active);
  const descriptionRaw = (typeof body.description === 'string' ? body.description : '').trim();
  const description = descriptionRaw ? sanitizeHtml(descriptionRaw) || null : null;

  // PUBG fields
  const accountCode = nullableStr(body.account_code, 40);
  const tier = nullableStr(body.tier, 40);
  const steamLevel = nullableInt(body.steam_level);
  const pubgLevel = nullableInt(body.pubg_level);
  const server = nullableStr(body.server, 20);
  const hoursPlayed = nullableInt(body.hours_played);
  const skinCount = nullableInt(body.skin_count);
  const hasMythic = body.has_mythic === undefined ? false : Boolean(body.has_mythic);
  const registerMethod = nullableStr(body.register_method, 40);
  const gcoinBalance = nullableInt(body.gcoin_balance);
  const isSold = body.is_sold === undefined ? false : Boolean(body.is_sold);
  const kdRatio = nullableNum(body.kd_ratio);
  const winRate = nullableNum(body.win_rate);

  try {
    const rows = (await sql`
      INSERT INTO products (category_id, name, slug, description, price,
                            sale_price, sale_end_at, image_url, images,
                            colors, is_active,
                            account_code, tier, steam_level, pubg_level, server,
                            hours_played, skin_count, has_mythic, register_method,
                            gcoin_balance, is_sold, kd_ratio, win_rate)
      VALUES (${categoryId}, ${name}, ${slug}, ${description}, ${price},
              ${salePrice}, ${saleEndIso},
              ${cover}, ${images}::text[],
              ${colors}::text[], ${isActive},
              ${accountCode}, ${tier}, ${steamLevel}, ${pubgLevel}, ${server},
              ${hoursPlayed}, ${skinCount}, ${hasMythic}, ${registerMethod},
              ${gcoinBalance}, ${isSold}, ${kdRatio}, ${winRate})
      RETURNING id, category_id, name, slug, description, price,
                sale_price, sale_end_at,
                image_url, images, colors,
                is_active, is_hero, featured_rank,
                account_code, tier, steam_level, pubg_level, server,
                hours_played, skin_count, has_mythic, register_method,
                gcoin_balance, is_sold, kd_ratio, win_rate,
                created_at, updated_at
    `) as Record<string, unknown>[];
    return jsonOk(rows[0], { status: 201, cache: 'no-store' });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Lỗi không xác định';
    if (msg.includes('duplicate')) return jsonError('Slug đã tồn tại', 409);
    if (msg.includes('foreign key')) return jsonError('Danh mục không tồn tại', 400);
    return jsonError(msg, 500);
  }
}
