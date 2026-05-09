'use client';

import { useMemo } from 'react';
import type { Product } from '@/lib/types';
import { formatVnd } from '@/lib/utils/format';
import { getSaleInfo } from '@/lib/utils/sale';
import { ZALO_ENABLED, ZALO_URL } from '@/lib/utils/zalo';
import { TELEGRAM_URL, FACEBOOK_URL } from '@/lib/seo/siteConfig';

interface Props {
  product: Product;
}

function buildOrderMessage(product: Product, price: number): string {
  const url = typeof window !== 'undefined' ? window.location.href : '';
  return [
    `Xin chào R.E.P.O Shop, mình muốn mua acc:`,
    `• ${product.name}`,
    product.account_code ? `• Mã acc: ${product.account_code}` : '',
    product.tier ? `• Rank: ${product.tier}` : '',
    `• Giá: ${formatVnd(price)}`,
    url ? `• Link: ${url}` : '',
    '',
    'Vui lòng cho mình xem demo Steam và hướng dẫn thanh toán. Cảm ơn!',
  ]
    .filter(Boolean)
    .join('\n');
}

async function copyAndOpen(message: string, openUrl: string) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(message);
    }
  } catch {
    /* ignore clipboard chặn */
  }
  window.open(openUrl, '_blank', 'noopener,noreferrer');
}

/**
 * Khối CTA mua acc cho R.E.P.O.
 * Khác MINT: gamer thường liên hệ qua nhiều kênh (Telegram > Zalo > FB)
 * → cho 3 nút song song, copy thông tin acc vào clipboard rồi mở chat.
 */
export default function ProductDetailCta({ product }: Props) {
  const sale = useMemo(() => getSaleInfo(product), [product]);
  const soldOut = !product.is_active || product.is_sold === true;

  if (soldOut) {
    return (
      <div className="product-detail-cta">
        <button type="button" className="buy-btn buy-btn-primary is-disabled" disabled>
          {product.is_sold ? 'Acc này đã có chủ' : 'Acc tạm khoá'}
        </button>
        <span className="product-detail-cta-hint">
          Inbox shop để được giới thiệu acc tương tự, hoặc xem các acc bên dưới.
        </span>
      </div>
    );
  }

  const message = (() => {
    if (typeof window === 'undefined') return '';
    return buildOrderMessage(product, sale.effectivePrice);
  })();

  return (
    <>
      <div className="buy-cta-row">
        {ZALO_ENABLED && (
          <button
            type="button"
            className="buy-btn buy-btn-zalo"
            onClick={() => copyAndOpen(buildOrderMessage(product, sale.effectivePrice), ZALO_URL)}
          >
            <svg viewBox="0 0 64 64" width="20" height="20" aria-hidden>
              <path
                fill="currentColor"
                d="M32 6C16.5 6 4 16.7 4 30c0 7 3.5 13.3 9.2 17.6-.5 2.5-1.7 5.7-4 8 .3.4.8.6 1.4.5 4.3-.5 8.5-2.2 11.5-3.7 3.2.9 6.5 1.4 9.9 1.4 15.5 0 28-10.7 28-24S47.5 6 32 6z"
              />
            </svg>
            Mua qua Zalo
          </button>
        )}
        {TELEGRAM_URL && (
          <button
            type="button"
            className="buy-btn buy-btn-tg"
            onClick={() => copyAndOpen(buildOrderMessage(product, sale.effectivePrice), TELEGRAM_URL)}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
              <path
                fill="currentColor"
                d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"
              />
            </svg>
            Telegram
          </button>
        )}
        {FACEBOOK_URL && (
          <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="buy-btn buy-btn-fb">
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
              <path
                fill="currentColor"
                d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.14 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.51 1.5-3.9 3.78-3.9 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.45 2.91h-2.34V22c4.78-.8 8.44-4.94 8.44-9.94z"
              />
            </svg>
            Facebook
          </a>
        )}
      </div>
      <span className="product-detail-cta-hint" style={{ display: 'block', marginTop: 12, color: 'var(--text-muted)', fontSize: 13 }}>
        ✓ Click để copy thông tin acc + mở chat. Shop demo Steam in-game trước khi chốt.
      </span>

      {/* Mobile sticky bar */}
      {ZALO_ENABLED && (
        <div className="mobile-cta-bar" role="region" aria-label="Mua acc nhanh">
          <div className="mobile-cta-bar-price">
            {sale.isOnSale ? (
              <>
                <span className="mobile-cta-bar-sale">{formatVnd(sale.effectivePrice)}</span>
                <span className="mobile-cta-bar-strike">{formatVnd(sale.originalPrice)}</span>
              </>
            ) : (
              <span className="mobile-cta-bar-sale">{formatVnd(product.price)}</span>
            )}
          </div>
          <button
            type="button"
            className="buy-btn buy-btn-primary mobile-cta-bar-btn"
            onClick={() => copyAndOpen(message, ZALO_URL)}
            aria-label="Mua acc qua Zalo"
          >
            Mua ngay
          </button>
        </div>
      )}
    </>
  );
}
