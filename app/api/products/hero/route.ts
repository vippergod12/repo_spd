import type { NextRequest } from 'next/server';
import { sql } from '@/lib/server/db';
import { getAdminFromRequest } from '@/lib/server/auth';
import { badRequest, jsonOk, unauthorized } from '@/lib/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const HERO_COLUMNS = `
  p.id, p.category_id, p.name, p.slug, p.price,
  p.sale_price, p.sale_end_at,
  p.image_url, p.images, p.colors,
  p.is_active, p.is_hero, p.featured_rank,
  p.account_code, p.tier, p.steam_level, p.pubg_level,
  p.server, p.hours_played, p.skin_count, p.has_mythic,
  p.register_method, p.gcoin_balance, p.is_sold,
  p.kd_ratio, p.win_rate,
  p.created_at, p.updated_at
`;
// (HERO_COLUMNS ở trên chỉ làm tài liệu — không inject runtime vì neon
// tagged template không hỗ trợ unsafe insert. Cột thực sự được liệt kê
// trong từng query bên dưới.)
void HERO_COLUMNS;

export async function GET() {
  const rows = (await sql`
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
    WHERE p.is_hero = TRUE
    LIMIT 1
  `) as Record<string, unknown>[];
  return jsonOk(rows[0] ?? null, {
    cache: 'public',
    cacheOpts: { sMaxAge: 300, staleWhileRevalidate: 1800 },
  });
}

export async function PUT(req: NextRequest) {
  if (!getAdminFromRequest(req)) return unauthorized();

  let body: { id?: number | string | null };
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const raw = body.id;
  const id = raw === null || raw === undefined || raw === '' ? null : Number(raw);

  if (id === null) {
    await sql`UPDATE products SET is_hero = FALSE WHERE is_hero = TRUE`;
    return jsonOk(null, { cache: 'no-store' });
  }

  if (!Number.isFinite(id) || id <= 0) {
    return badRequest('ID không hợp lệ');
  }

  const exist = (await sql`
    SELECT id FROM products WHERE id = ${id} LIMIT 1
  `) as { id: number }[];
  if (exist.length === 0) {
    return badRequest('Account không tồn tại');
  }

  await sql`UPDATE products SET is_hero = FALSE WHERE is_hero = TRUE AND id <> ${id}`;
  await sql`UPDATE products SET is_hero = TRUE WHERE id = ${id}`;

  const rows = (await sql`
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
    WHERE p.id = ${id}
    LIMIT 1
  `) as Record<string, unknown>[];
  return jsonOk(rows[0] ?? null, { cache: 'no-store' });
}
