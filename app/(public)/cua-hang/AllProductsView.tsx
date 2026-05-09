'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Category, Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import { getSaleInfo } from '@/lib/utils/sale';
import { ALL_TIERS, tierClass } from '@/lib/utils/tier';

type SortKey = 'newest' | 'price-asc' | 'price-desc' | 'tier-desc';

const PAGE_SIZE = 12;

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price-asc', label: 'Giá: Thấp → Cao' },
  { value: 'price-desc', label: 'Giá: Cao → Thấp' },
  { value: 'tier-desc', label: 'Tier: Conqueror → Bronze' },
];

const ALL = 'all';
const ALL_TIER = '';

const TIER_RANK: Record<string, number> = {
  Conqueror: 0,
  'Ace Master': 1,
  'Ace Dominator': 2,
  Ace: 3,
  Crown: 4,
  Diamond: 5,
  Platinum: 6,
  Gold: 7,
  Silver: 8,
  Bronze: 9,
  Unranked: 10,
};

function effectivePrice(p: Product): number {
  return getSaleInfo(p).effectivePrice;
}

function sortProducts(list: Product[], key: SortKey): Product[] {
  const arr = [...list];
  if (key === 'price-asc') {
    arr.sort((a, b) => effectivePrice(a) - effectivePrice(b));
  } else if (key === 'price-desc') {
    arr.sort((a, b) => effectivePrice(b) - effectivePrice(a));
  } else if (key === 'tier-desc') {
    arr.sort((a, b) => (TIER_RANK[a.tier ?? ''] ?? 99) - (TIER_RANK[b.tier ?? ''] ?? 99));
  } else {
    arr.sort((a, b) => {
      const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
      const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
      return tb - ta;
    });
  }
  return arr;
}

interface Props {
  categories: Category[];
  products: Product[];
  activeCategory: string;
}

/**
 * Trang /cua-hang client interactivity:
 *  - Sidebar lọc theo danh mục (URL ?cat=)
 *  - Tier filter chips (URL ?tier=) — đặc trưng PUBG
 *  - Sort dropdown (URL ?sort=)
 *  - Pagination "Xem thêm"
 */
export default function AllProductsView({
  categories,
  products,
  activeCategory,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sortRaw = (searchParams.get('sort') || 'newest') as SortKey;
  const sort: SortKey = SORT_OPTIONS.some((o) => o.value === sortRaw) ? sortRaw : 'newest';
  const tierFilter = (searchParams.get('tier') || ALL_TIER).trim();

  const [visible, setVisible] = useState(PAGE_SIZE);

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (!value || value === 'all' || (key === 'sort' && value === 'newest')) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    const qs = next.toString();
    router.replace(qs ? `/cua-hang?${qs}` : '/cua-hang', { scroll: false });
  }

  function chooseCategory(slug: string) {
    setVisible(PAGE_SIZE);
    setParam('cat', slug);
  }

  function chooseSort(s: SortKey) {
    setVisible(PAGE_SIZE);
    setParam('sort', s);
  }

  function chooseTier(t: string) {
    setVisible(PAGE_SIZE);
    setParam('tier', t);
  }

  const filteredByTier = useMemo(() => {
    if (!tierFilter) return products;
    return products.filter((p) => p.tier === tierFilter);
  }, [products, tierFilter]);

  const sorted = useMemo(() => sortProducts(filteredByTier, sort), [filteredByTier, sort]);
  const shown = sorted.slice(0, visible);
  const hasMore = visible < sorted.length;

  function loadMore() {
    setVisible((v) => Math.min(v + PAGE_SIZE, sorted.length));
  }

  return (
    <div className="all-products-layout">
      <aside className="all-products-sidebar" aria-label="Danh mục">
        <h3 className="sidebar-title">Danh mục</h3>
        <ul className="sidebar-list">
          <li>
            <button
              type="button"
              className={`sidebar-item ${activeCategory === ALL ? 'is-active' : ''}`}
              onClick={() => chooseCategory(ALL)}
            >
              <span>Tất cả</span>
              <span className="sidebar-count" aria-hidden>
                {categories.reduce((sum, c) => sum + (c.product_count ?? 0), 0)}
              </span>
            </button>
          </li>
          {categories.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                className={`sidebar-item ${activeCategory === c.slug ? 'is-active' : ''}`}
                onClick={() => chooseCategory(c.slug)}
              >
                <span>{c.name}</span>
                {typeof c.product_count === 'number' && (
                  <span className="sidebar-count" aria-hidden>
                    {c.product_count}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <div className="all-products-main">
        <div className="tier-filter" role="tablist" aria-label="Lọc theo rank">
          <button
            type="button"
            className={`tier-chip ${tierFilter === ALL_TIER ? 'active' : ''}`}
            onClick={() => chooseTier(ALL_TIER)}
          >
            Mọi rank
          </button>
          {ALL_TIERS.map((t) => (
            <button
              key={t}
              type="button"
              className={`tier-chip ${tierFilter === t ? 'active' : ''} ${tierClass(t)}`}
              onClick={() => chooseTier(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="all-products-toolbar">
          <span className="toolbar-info">
            Hiển thị <strong>{shown.length}</strong> / {sorted.length}
          </span>
          <div className="toolbar-sort">
            <label htmlFor="sort-select">Sắp xếp</label>
            <select
              id="sort-select"
              value={sort}
              onChange={(e) => chooseSort(e.target.value as SortKey)}
              className="select"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {sorted.length === 0 ? (
          <div className="empty-state">
            Chưa có acc nào khớp bộ lọc.
            <br />
            <a href="/tu-van" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
              Đăng ký tìm acc theo yêu cầu →
            </a>
          </div>
        ) : (
          <>
            <div className="product-grid all-products-grid">
              {shown.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            {hasMore && (
              <div className="load-more-wrap">
                <button type="button" className="btn-load-more" onClick={loadMore}>
                  Xem thêm
                  <span className="load-more-meta">
                    ({sorted.length - visible} acc)
                  </span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
