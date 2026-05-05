'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';

interface Props {
  images: string[];
  alt: string;
  /** Hiện priority + sizes cho ảnh đầu tiên (LCP) */
  priorityFirst?: boolean;
}

/**
 * Gallery cho trang chi tiết sản phẩm với:
 *   - 1 ảnh chính lớn (responsive, fill container)
 *   - 1 hàng thumbnail bên dưới khi có >1 ảnh
 *   - Click thumbnail đổi ảnh chính
 *   - Phím ← → khi gallery được focus để duyệt nhanh
 *
 * Là Client Component để xử lý interaction; ảnh đầu tiên vẫn được Next/Image
 * tải priority cho LCP và SEO.
 */
export default function ProductGallery({ images, alt, priorityFirst = true }: Props) {
  const safe = useMemo(() => images.filter((s) => typeof s === 'string' && s.trim()), [images]);
  const [active, setActive] = useState(0);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActive(0);
  }, [safe]);

  if (safe.length === 0) {
    return <div className="product-card-placeholder">No image</div>;
  }

  const idx = Math.min(active, safe.length - 1);
  const main = safe[idx];

  function go(delta: number) {
    if (safe.length < 2) return;
    setActive((cur) => (cur + delta + safe.length) % safe.length);
  }

  return (
    <div
      className="product-gallery"
      ref={mainRef}
      tabIndex={safe.length > 1 ? 0 : -1}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          go(-1);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          go(1);
        }
      }}
    >
      <div className="product-gallery-main">
        <Image
          key={main}
          src={main}
          alt={alt}
          fill
          priority={priorityFirst && idx === 0}
          sizes="(max-width: 768px) 100vw, 50vw"
          className="product-detail-media-img"
        />
        {safe.length > 1 && (
          <>
            <button
              type="button"
              className="product-gallery-nav prev"
              onClick={() => go(-1)}
              aria-label="Ảnh trước"
            >
              ‹
            </button>
            <button
              type="button"
              className="product-gallery-nav next"
              onClick={() => go(1)}
              aria-label="Ảnh kế tiếp"
            >
              ›
            </button>
            <div className="product-gallery-counter" aria-hidden>
              {idx + 1} / {safe.length}
            </div>
          </>
        )}
      </div>

      {safe.length > 1 && (
        <ul className="product-gallery-thumbs" role="tablist" aria-label="Ảnh sản phẩm">
          {safe.map((src, i) => (
            <li key={`${i}-${src.slice(0, 40)}`}>
              <button
                type="button"
                role="tab"
                aria-selected={i === idx}
                className={`product-gallery-thumb ${i === idx ? 'is-active' : ''}`}
                onClick={() => setActive(i)}
              >
                <Image
                  src={src}
                  alt={`${alt} — ảnh ${i + 1}`}
                  width={72}
                  height={72}
                  sizes="72px"
                  loading="lazy"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
