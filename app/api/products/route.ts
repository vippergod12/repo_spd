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
           p.created_at, p.updated_at,
           c.name AS category_name, c.slug AS category_slug
    FROM products p
    JOIN categories c ON c.id = p.category_id
    WHERE (${categoryId}::int IS NULL OR p.category_id = ${categoryId}::int)
      AND (${categorySlug}::text IS NULL OR c.slug = ${categorySlug}::text)
      AND (${searchTerm}::text IS NULL OR p.name ILIKE ${searchTerm}::text)
    ORDER BY p.is_active DESC, p.created_at DESC
    LIMIT ${limit}
  `;
  return jsonOk(rows, {
    cache: 'public',
    cacheOpts: { sMaxAge: 60, staleWhileRevalidate: 300 },
  });
}

/**
 * Chuẩn hoá danh sách ảnh từ body:
 *   - Nhận `images` (mảng) hoặc fallback `image_url` (1 chuỗi) để tương thích
 *     client cũ hoặc seed/import.
 *   - Lọc rỗng, dedupe theo nội dung; tối đa MAX_IMAGES ảnh / sản phẩm.
 */
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
  // Nếu body chỉ có image_url cũ (legacy) → đưa vào đầu mảng.
  if (list.length === 0 && input.image_url) push(input.image_url);
  return list.slice(0, MAX_IMAGES);
}

export async function POST(req: NextRequest) {
  if (!getAdminFromRequest(req)) return unauthorized();

  let body: {
    name?: string;
    slug?: string;
    description?: string;
    price?: number | string;
    sale_price?: number | string | null;
    sale_end_at?: string | null;
    image_url?: string;
    images?: unknown;
    category_id?: number | string;
    is_active?: boolean;
    colors?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const name = (body.name ?? '').trim();
  const categoryId = Number(body.category_id);
  const price = Number(body.price ?? 0);
  if (!name) return badRequest('Tên sản phẩm không được trống');
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
  const saleEndAt = body.sale_end_at ? new Date(body.sale_end_at) : null;
  if (saleEndAt && Number.isNaN(saleEndAt.getTime())) {
    return badRequest('Thời gian kết thúc sale không hợp lệ');
  }
  const saleEndIso = saleEndAt ? saleEndAt.toISOString() : null;

  const colors = parseStringArray(body.colors);
  const images = normalizeImages(body);
  const cover = images[0] ?? null;
  const slug = (body.slug && body.slug.trim()) || slugify(name);
  const isActive = body.is_active ?? true;
  // Description từ rich text editor có thể chứa HTML — sanitize trước khi lưu
  // để chặn <script>, on* attributes, javascript:URL... Chuỗi rỗng → null.
  const descriptionRaw = (body.description ?? '').trim();
  const description = descriptionRaw ? sanitizeHtml(descriptionRaw) || null : null;

  try {
    const rows = (await sql`
      INSERT INTO products (category_id, name, slug, description, price,
                            sale_price, sale_end_at, image_url, images,
                            colors, is_active)
      VALUES (${categoryId}, ${name}, ${slug}, ${description}, ${price},
              ${salePrice}, ${saleEndIso},
              ${cover}, ${images}::text[],
              ${colors}::text[], ${isActive})
      RETURNING id, category_id, name, slug, description, price,
                sale_price, sale_end_at,
                image_url, images, colors,
                is_active, is_hero, featured_rank,
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
