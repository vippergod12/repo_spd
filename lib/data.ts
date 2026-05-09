// Data fetcher cho Server Components.
// Server Components query Neon DB trực tiếp; admin client (browser) dùng /api/*.

import { sql } from './server/db';
import type { Category, Product } from './types';

const TRENDING_LIMIT = 24;
const FEATURED_LIMIT = 12;
const RELATED_LIMIT = 12;
const PRODUCT_LIST_LIMIT = 60;

export type HomeStory = {
  image_url: string;
};

export type HomeBundle = {
  categories: Category[];
  products: Product[];
  featured: Product[];
  hero: Product | null;
  story: HomeStory;
};

export type ProductDetailBundle = {
  product: Product;
  related?: Product[];
  featured?: Product[];
};

export async function fetchHome(): Promise<HomeBundle> {
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
             p.is_active, p.is_hero, p.featured_rank,
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
    | Partial<HomeStory>
    | undefined;

  return {
    categories: categories as unknown as Category[],
    products: products as unknown as Product[],
    featured: featured as unknown as Product[],
    hero: ((heroRows as unknown as Product[])[0] ?? null) as Product | null,
    story: {
      image_url: typeof storyRaw?.image_url === 'string' ? storyRaw.image_url : '',
    },
  };
}

export async function fetchCategories(): Promise<Category[]> {
  const rows = await sql`
    SELECT c.id, c.name, c.slug, c.image_url, c.description, c.created_at, c.updated_at,
           (SELECT COUNT(*)::int FROM products p WHERE p.category_id = c.id AND p.is_sold = FALSE) AS product_count
    FROM categories c
    ORDER BY c.name ASC
  `;
  return rows as unknown as Category[];
}

export async function fetchCategory(slug: string): Promise<Category | null> {
  const rows = (await sql`
    SELECT id, name, slug, image_url, description, created_at, updated_at
    FROM categories
    WHERE slug = ${slug}
    LIMIT 1
  `) as unknown as Category[];
  return rows[0] ?? null;
}

export async function fetchProducts(
  params: { category?: string; q?: string } = {},
): Promise<Product[]> {
  const categoryRaw = params.category?.trim();
  const search = (params.q ?? '').trim();

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
    ORDER BY p.is_sold ASC, p.is_active DESC, p.created_at DESC
    LIMIT ${PRODUCT_LIST_LIMIT}
  `;
  return rows as unknown as Product[];
}

export async function fetchProductDetail(slug: string): Promise<ProductDetailBundle | null> {
  const rows = (await sql`
    SELECT p.id, p.category_id, p.name, p.slug, p.description, p.price,
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
    WHERE p.slug = ${slug}
    LIMIT 1
  `) as unknown as Product[];
  const product = rows[0];
  if (!product) return null;

  const [related, featured] = await Promise.all([
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
      WHERE p.category_id = ${product.category_id}
        AND p.id <> ${product.id}
        AND p.is_sold = FALSE
      ORDER BY p.is_active DESC, p.created_at DESC
      LIMIT ${RELATED_LIMIT}
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
      WHERE p.featured_rank IS NOT NULL
        AND p.id <> ${product.id}
        AND p.is_sold = FALSE
      ORDER BY p.featured_rank ASC
      LIMIT ${FEATURED_LIMIT}
    `,
  ]);

  return {
    product,
    related: related as unknown as Product[],
    featured: featured as unknown as Product[],
  };
}
