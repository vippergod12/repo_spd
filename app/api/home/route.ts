import { sql } from '@/lib/server/db';
import { jsonOk } from '@/lib/server/http';

export const dynamic = 'force-dynamic';

const TRENDING_LIMIT = 24;
const FEATURED_LIMIT = 12;

/**
 * Endpoint gộp dữ liệu cho trang chủ.
 * Chạy 5 query Postgres song song, trả tất cả trong một response.
 */
export async function GET() {
  const [categories, products, featured, heroRows, storyRows] = await Promise.all([
    sql`
      SELECT c.id, c.name, c.slug, c.image_url, c.description, c.created_at, c.updated_at,
             (SELECT COUNT(*)::int FROM products p WHERE p.category_id = c.id AND p.is_sold = FALSE) AS product_count
      FROM categories c
      ORDER BY c.name ASC
    `,
    sql`
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
      WHERE p.is_sold = FALSE
      ORDER BY p.is_active DESC, p.created_at DESC
      LIMIT ${TRENDING_LIMIT}
    `,
    sql`
      SELECT p.id, p.category_id, p.name, p.slug, p.price,
             p.sale_price, p.sale_end_at,
             p.image_url, p.images, p.colors,
             p.is_active, p.featured_rank,
             p.account_code, p.tier, p.steam_level, p.pubg_level,
             p.server, p.hours_played, p.skin_count, p.has_mythic,
             p.register_method, p.gcoin_balance, p.is_sold,
             p.kd_ratio, p.win_rate,
             p.created_at, p.updated_at,
             c.name AS category_name, c.slug AS category_slug
      FROM products p
      JOIN categories c ON c.id = p.category_id
      WHERE p.featured_rank IS NOT NULL
        AND p.is_sold = FALSE
      ORDER BY p.featured_rank ASC
      LIMIT ${FEATURED_LIMIT}
    `,
    sql`
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
    `,
    sql`SELECT value FROM site_settings WHERE key = 'home_story' LIMIT 1`,
  ]);

  const storyRaw = (storyRows as { value: unknown }[])[0]?.value as
    | { image_url?: unknown }
    | undefined;
  const storyImageUrl =
    typeof storyRaw?.image_url === 'string' ? storyRaw.image_url : '';

  return jsonOk(
    {
      categories,
      products,
      featured,
      hero: (heroRows as Record<string, unknown>[])[0] ?? null,
      story: { image_url: storyImageUrl },
    },
    { cache: 'public', cacheOpts: { sMaxAge: 60, staleWhileRevalidate: 300 } },
  );
}
