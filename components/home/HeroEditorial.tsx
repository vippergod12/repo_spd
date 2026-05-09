'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import type { Category, Product } from '@/lib/types';
import { SITE_NAME, SITE_TAGLINE } from '@/lib/seo/siteConfig';
import { DEFAULT_BLUR_DATA_URL } from '@/lib/utils/blur';

interface Props {
  categories: Category[];
  products: Product[];
  /** Account hero được admin chọn (ưu tiên cao nhất). null = chưa cấu hình. */
  hero?: Product | null;
  loading?: boolean;
}

function pickImage(items: Array<{ image_url?: string | null }>): string | null {
  for (const it of items) {
    const url = it.image_url?.trim();
    if (url) return url;
  }
  return null;
}

export default function HeroEditorial({ categories, products, hero, loading }: Props) {
  const [time, setTime] = useState(() => new Date());
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const heroImage = useMemo<string | null>(() => {
    const fromAdmin = hero?.image_url?.trim();
    if (fromAdmin) return fromAdmin;
    return pickImage(products) ?? pickImage(categories) ?? null;
  }, [hero?.image_url, products, categories]);

  const heroAlt = hero?.name
    ? `${hero.name} — Account PUBG nổi bật ${SITE_NAME}`
    : `${SITE_NAME} — ${SITE_TAGLINE}`;

  useEffect(() => {
    setImgError(false);
  }, [heroImage]);

  const monthYear = time.toLocaleString('en-US', { month: 'short', year: 'numeric' }).toUpperCase();
  const showImage = !loading && !!heroImage && !imgError;

  return (
    <section className="hero-editorial">
      <div className="container hero-edit-grid">
        <div className="hero-edit-meta">
          <span className="hero-edit-tag">● PUBG: BATTLEGROUNDS — STEAM PC</span>
          <span className="hero-edit-date">SEASON · {monthYear}</span>
          <span className="hero-edit-loc">VIETNAM — GIAO ACC 5 PHÚT</span>
        </div>

        <div className="hero-edit-headline">
          <h1 className="hero-edit-title">
            <span className="hero-edit-title-statement">Acc PUBG</span>
            <span className="hero-edit-title-eyebrow">
              <span className="hero-edit-title-rule" aria-hidden />
              full skin · all server
            </span>
            <span className="hero-edit-title-accent">cho chiến thần.</span>
          </h1>
        </div>

        <div className="hero-edit-side">
          <div className={`hero-edit-image ${showImage ? '' : 'is-placeholder'}`}>
            {showImage ? (
              <Image
                src={heroImage as string}
                alt={heroAlt}
                onError={() => setImgError(true)}
                fill
                priority
                fetchPriority="high"
                sizes="(max-width: 768px) 90vw, 50vw"
                quality={85}
                placeholder="blur"
                blurDataURL={DEFAULT_BLUR_DATA_URL}
                className="hero-edit-image-img"
              />
            ) : (
              <div className="hero-edit-image-skeleton" aria-hidden>
                <span className="hero-edit-image-mark">R</span>
              </div>
            )}
          </div>
          <p className="hero-edit-desc">
            Kho hàng hơn <strong>500+ acc PUBG: BATTLEGROUNDS PC</strong> đã verify Steam — từ Bronze
            tới <strong>Conqueror</strong>, full skin <strong>Glacier M416/AKM/AWM</strong>,
            Wanderer Set, PGC Crown esports. Thanh toán MoMo / banking, giao acc qua
            Zalo / Telegram trong <strong>5 phút</strong>. Bảo hành trọn đời.
          </p>
          <a
            href="#hot"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('hot')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hero-edit-cta"
          >
            Khám phá kho acc ↘
          </a>
        </div>

        <div className="hero-edit-bottom">
          <div className="hero-edit-stat">
            <span className="hero-edit-stat-num">500+</span>
            <span className="hero-edit-stat-label">Acc đã verify</span>
          </div>
          <div className="hero-edit-stat">
            <span className="hero-edit-stat-num">10K+</span>
            <span className="hero-edit-stat-label">Khách hàng</span>
          </div>
          <div className="hero-edit-stat">
            <span className="hero-edit-stat-num">5'</span>
            <span className="hero-edit-stat-label">Giao acc nhanh</span>
          </div>
          <div className="hero-edit-stat">
            <span className="hero-edit-stat-num">∞</span>
            <span className="hero-edit-stat-label">Bảo hành trọn đời</span>
          </div>
        </div>
      </div>
    </section>
  );
}
