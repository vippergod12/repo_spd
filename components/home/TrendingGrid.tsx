'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import type { Product } from '@/lib/types';
import Reveal from '../Reveal';
import { PriceDisplay, SaleBadge } from '../SaleBadge';
import { DEFAULT_BLUR_DATA_URL } from '@/lib/utils/blur';
import { tierClass } from '@/lib/utils/tier';
import { AccountMetaStrip } from '../ProductCard';

interface Props {
  products: Product[];
  loading?: boolean;
}

const NEW_DAYS = 14;
const MS_PER_DAY = 1000 * 60 * 60 * 24;
const PAGE_SIZE = 8;

function isNew(createdAt?: string): boolean {
  if (!createdAt) return false;
  const ageDays = (Date.now() - new Date(createdAt).getTime()) / MS_PER_DAY;
  return ageDays >= 0 && ageDays <= NEW_DAYS;
}

export default function TrendingGrid({ products, loading }: Props) {
  const sorted = useMemo(
    () =>
      [...products].sort((a, b) => {
        const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
        const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
        return tb - ta;
      }),
    [products],
  );

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const items = sorted.slice(0, visibleCount);
  const hasMore = visibleCount < sorted.length;

  function loadMore() {
    setVisibleCount((v) => Math.min(v + PAGE_SIZE, sorted.length));
  }

  return (
    <section className="section">
      <div className="container">
        <Reveal variant="fade-up">
          <div className="trending-heading">
            <div className="trending-heading-text">
              <span className="section-eyebrow">Vừa cập nhật</span>
              <h2>Acc PUBG mới về</h2>
            </div>
            <Link href="/cua-hang" className="trending-link">
              Xem toàn bộ kho acc
              <span aria-hidden>→</span>
            </Link>
          </div>
        </Reveal>

        {loading ? (
          <div className="empty-state">Đang tải...</div>
        ) : items.length === 0 ? (
          <div className="empty-state">Chưa có acc nào.</div>
        ) : (
          <>
            <div className="trending-grid">
              {items.map((p, i) => {
                const altText = p.category_name
                  ? `${p.name} — ${p.category_name}`
                  : p.name;
                const staggerDelay = (i % PAGE_SIZE) * 70;
                const soldOut = !p.is_active || p.is_sold === true;
                return (
                  <Reveal key={p.id} variant="fade-up" delay={staggerDelay}>
                    <Link
                      href={`/san-pham/${p.slug}`}
                      className={`product-card trending-card ${soldOut ? 'is-soldout' : ''}`}
                      draggable={false}
                    >
                      <div className="product-card-thumb">
                        {p.image_url ? (
                          <Image
                            src={p.image_url}
                            alt={altText}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            loading="lazy"
                            quality={80}
                            placeholder="blur"
                            blurDataURL={DEFAULT_BLUR_DATA_URL}
                            className="product-card-img"
                            draggable={false}
                          />
                        ) : (
                          <div className="product-card-placeholder">No image</div>
                        )}
                        {!soldOut && <SaleBadge product={p} />}
                        {!soldOut && isNew(p.created_at) && (
                          <span className="trending-badge">MỚI</span>
                        )}
                        {!soldOut && p.has_mythic && (
                          <span className="mythic-pill mythic-pill-corner">Mythic</span>
                        )}
                        {soldOut && (
                          <div className="soldout-overlay">
                            <span>{p.is_sold ? 'Đã bán' : 'Tạm khoá'}</span>
                          </div>
                        )}
                      </div>
                      <div className="product-card-body">
                        <div className="product-card-meta-top">
                          {p.account_code ? (
                            <span className="acc-code">{p.account_code}</span>
                          ) : (
                            <span className="acc-code-placeholder" aria-hidden />
                          )}
                        </div>
                        <span className="product-card-category">
                          {p.category_name ?? '\u00A0'}
                        </span>
                        <h3 className="product-card-name">{p.name}</h3>
                        <PriceDisplay product={p} className="product-card-price" showEndDate />
                        <AccountMetaStrip product={p} />
                        <div className="product-card-tier-row">
                          {p.tier && (
                            <span className={`tier-badge ${tierClass(p.tier)}`}>{p.tier}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </Reveal>
                );
              })}
            </div>

            {hasMore && (
              <div className="trending-load-more-wrap">
                <button
                  type="button"
                  className="trending-load-more"
                  onClick={loadMore}
                >
                  <span>Xem thêm acc</span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                <p className="trending-load-more-hint">
                  Đã hiện {visibleCount} / {sorted.length} acc
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
