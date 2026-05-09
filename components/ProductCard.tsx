import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/types';
import { PriceDisplay, SaleBadge } from './SaleBadge';
import { tierClass } from '@/lib/utils/tier';

/**
 * ProductCard trong R.E.P.O = AccountCard.
 * Layout cứng: thumb (aspect 1:1) → body flex column với các slot reserved
 * cho tier-row, meta-row, price → mọi card cùng grid row có cùng chiều cao,
 * tier badge luôn nằm sát đáy bằng `margin-top: auto`.
 */
export default function ProductCard({ product }: { product: Product }) {
  const soldOut = !product.is_active || product.is_sold === true;
  const altText = product.category_name
    ? `${product.name} — ${product.category_name}`
    : product.name;

  return (
    <Link
      href={`/san-pham/${product.slug}`}
      className={`product-card ${soldOut ? 'is-soldout' : ''}`}
      draggable={false}
    >
      <div className="product-card-thumb">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={altText}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="product-card-img"
            draggable={false}
          />
        ) : (
          <div className="product-card-placeholder">No image</div>
        )}
        {!soldOut && <SaleBadge product={product} />}
        {!soldOut && product.has_mythic && <span className="mythic-pill mythic-pill-corner">Mythic</span>}
        {soldOut && (
          <div className="soldout-overlay">
            <span>{product.is_sold ? 'Đã bán' : 'Tạm khoá'}</span>
          </div>
        )}
      </div>
      <div className="product-card-body">
        <div className="product-card-meta-top">
          {product.account_code ? (
            <span className="acc-code">{product.account_code}</span>
          ) : (
            <span className="acc-code-placeholder" aria-hidden />
          )}
        </div>
        <span className="product-card-category">
          {product.category_name ?? '\u00A0'}
        </span>
        <h3 className="product-card-name">{product.name}</h3>
        <PriceDisplay product={product} className="product-card-price" showEndDate />
        <AccountMetaStrip product={product} />
        <div className="product-card-tier-row">
          {product.tier && (
            <span className={`tier-badge ${tierClass(product.tier)}`}>{product.tier}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

/** Strip nhỏ hiển thị KDR / Skin / Level dưới giá. */
export function AccountMetaStrip({ product }: { product: Product }) {
  const parts: React.ReactNode[] = [];
  if (product.skin_count != null) {
    parts.push(
      <span key="sk" className="acc-meta-item skins">
        Skin <strong>{product.skin_count}</strong>
      </span>,
    );
  }
  if (product.kd_ratio != null) {
    parts.push(
      <span key="kd" className="acc-meta-item kd">
        K/D <strong>{Number(product.kd_ratio).toFixed(2)}</strong>
      </span>,
    );
  }
  if (product.steam_level != null) {
    parts.push(
      <span key="sl" className="acc-meta-item">
        Steam Lv <strong>{product.steam_level}</strong>
      </span>,
    );
  }
  if (product.server) {
    parts.push(
      <span key="sv" className="acc-meta-item server">
        <strong>{product.server}</strong>
      </span>,
    );
  }
  // Reserve slot dù không có data → mọi card cùng meta-row height.
  return <div className="acc-meta">{parts.length > 0 ? parts : <span className="acc-meta-empty" aria-hidden />}</div>;
}
