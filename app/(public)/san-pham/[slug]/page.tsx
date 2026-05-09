import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { fetchProductDetail } from '@/lib/data';
import { formatVnd } from '@/lib/utils/format';
import { getSaleInfo } from '@/lib/utils/sale';
import { SaleBadge } from '@/components/SaleBadge';
import ProductCarousel from '@/components/ProductCarousel';
import ProductDetailCta from './ProductDetailCta';
import ProductGallery from './ProductGallery';
import { breadcrumbJsonLd, productJsonLd } from '@/lib/seo/jsonLd';
import {
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
} from '@/lib/seo/siteConfig';
import { ensureHtml, htmlToPlainText } from '@/lib/server/sanitize-html';
import { tierClass } from '@/lib/utils/tier';

export const revalidate = 60;

function formatSaleEnd(date: Date): string {
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

type Params = { slug: string };
type Props = { params: Params };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const bundle = await fetchProductDetail(params.slug).catch(() => null);
  if (!bundle?.product) {
    return {
      title: 'Không tìm thấy account',
      robots: { index: false, follow: false },
    };
  }

  const product = bundle.product;
  const sale = getSaleInfo(product);
  const priceLabel = formatVnd(sale.effectivePrice);
  const tierBit = product.tier ? `${product.tier} · ` : '';
  const title = sale.isOnSale
    ? `${tierBit}${product.name} — Giảm còn ${priceLabel}`
    : `${tierBit}${product.name} — ${priceLabel}`;
  const descriptionText = htmlToPlainText(product.description ?? '').slice(0, 200);
  const description =
    descriptionText ||
    `Account PUBG: ${product.name}${product.tier ? ` (${product.tier})` : ''} — ${priceLabel}. Bảo hành trọn đời tại ${SITE_NAME}.`;
  const canonical = `/san-pham/${product.slug}`;
  const image = product.image_url ? absoluteUrl(product.image_url) : undefined;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      title,
      description,
      url: `${SITE_URL}${canonical}`,
      images: image ? [{ url: image, alt: product.name }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const bundle = await fetchProductDetail(params.slug).catch(() => null);
  if (!bundle?.product) notFound();

  const product = bundle.product;
  const sale = getSaleInfo(product);
  const related = (bundle.related ?? []).slice(0, 12);
  const hot = (bundle.featured ?? []).slice(0, 12);
  const soldOut = !product.is_active || product.is_sold === true;

  const galleryImages =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : product.image_url
        ? [product.image_url]
        : [];

  const jsonLd: unknown[] = [
    productJsonLd(product),
    breadcrumbJsonLd([
      { name: 'Trang chủ', url: '/' },
      {
        name: product.category_name ?? 'Danh mục',
        url: `/danh-muc/${product.category_slug ?? ''}`,
      },
      { name: product.name, url: `/san-pham/${product.slug}` },
    ]),
  ];

  /** Hiển thị stat panel: chỉ hiện stat có giá trị. */
  const stats: Array<{ label: string; value: string; cls?: 'accent' | 'cyan' | 'magenta' }> = [];
  if (product.tier) stats.push({ label: 'Tier', value: product.tier, cls: 'accent' });
  if (product.steam_level != null) stats.push({ label: 'Steam Level', value: String(product.steam_level) });
  if (product.pubg_level != null) stats.push({ label: 'PUBG Level', value: String(product.pubg_level) });
  if (product.server) stats.push({ label: 'Server', value: product.server });
  if (product.kd_ratio != null) stats.push({ label: 'K/D Ratio', value: Number(product.kd_ratio).toFixed(2), cls: 'cyan' });
  if (product.win_rate != null) stats.push({ label: 'Win Rate', value: `${Number(product.win_rate).toFixed(1)}%`, cls: 'cyan' });
  if (product.hours_played != null) stats.push({ label: 'Giờ chơi', value: `${product.hours_played.toLocaleString('vi-VN')}h` });
  if (product.skin_count != null) stats.push({ label: 'Tổng Skin', value: String(product.skin_count), cls: 'accent' });
  if (product.gcoin_balance != null) stats.push({ label: 'G-Coin', value: product.gcoin_balance.toLocaleString('vi-VN') });
  if (product.register_method) stats.push({ label: 'Loại đăng ký', value: product.register_method });

  return (
    <>
      {jsonLd.map((data, idx) => (
        <script
          key={idx}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
      <section className="section">
        <div className="container">
          <nav className="breadcrumb">
            <Link href="/">Trang chủ</Link>
            <span>/</span>
            <Link href={`/danh-muc/${product.category_slug ?? ''}`}>
              {product.category_name}
            </Link>
            <span>/</span>
            <span>{product.name}</span>
          </nav>

          <div className={`product-detail ${soldOut ? 'is-soldout' : ''}`}>
            <div className="product-detail-media">
              <ProductGallery
                images={galleryImages}
                alt={`${product.name}${product.category_name ? ` — ${product.category_name}` : ''} | ${SITE_NAME}`}
              />
              <SaleBadge product={product} />
              {product.has_mythic && (
                <span className="mythic-pill" style={{ position: 'absolute', top: 16, left: 16, zIndex: 4 }}>
                  Mythic
                </span>
              )}
              {soldOut && (
                <div className="soldout-overlay">
                  <span>{product.is_sold ? 'Đã có chủ' : 'Tạm khoá'}</span>
                </div>
              )}
            </div>
            <div className="product-detail-info">
              {product.account_code && (
                <span className="acc-code" style={{ marginBottom: 12 }}>{product.account_code}</span>
              )}
              <h1>{product.name}</h1>

              {product.tier && (
                <div style={{ marginTop: 8, marginBottom: 16 }}>
                  <span className={`tier-badge ${tierClass(product.tier)}`} style={{ fontSize: 13, padding: '6px 14px' }}>
                    Rank: {product.tier}
                  </span>
                </div>
              )}

              {sale.isOnSale ? (
                <div className="product-detail-price-group">
                  <div className="product-detail-price">{formatVnd(sale.effectivePrice)}</div>
                  <div className="product-detail-price-original">
                    <span className="strike">{formatVnd(sale.originalPrice)}</span>
                    <span className="discount-tag">-{sale.discountPercent}%</span>
                  </div>
                  {sale.saleEndAt && (
                    <p className="sale-countdown">
                      Sale kết thúc lúc <strong>{formatSaleEnd(sale.saleEndAt)}</strong>
                    </p>
                  )}
                </div>
              ) : (
                <div className="product-detail-price">{formatVnd(product.price)}</div>
              )}

              {product.description && product.description.trim() ? (
                <div
                  className="product-detail-description product-description-html"
                  dangerouslySetInnerHTML={{ __html: ensureHtml(product.description) }}
                />
              ) : (
                <p className="product-detail-description product-description-empty">
                  Chưa có mô tả chi tiết. Vui lòng inbox shop để được tư vấn về acc này.
                </p>
              )}

              {/* Skin tags (lưu trong product.colors) */}
              {Array.isArray(product.colors) && product.colors.length > 0 && (
                <div className="variant-block" style={{ marginTop: 16 }}>
                  <div className="variant-label"><span>Skin nổi bật</span></div>
                  <div className="variant-options">
                    {product.colors.map((tag) => (
                      <span key={tag} className="variant-chip is-selected" style={{ cursor: 'default' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Stat panel */}
              {stats.length > 0 && (
                <div className="acc-info">
                  <h3>Thông số Account</h3>
                  <ul className="acc-stats">
                    {stats.map((s) => (
                      <li key={s.label} className="acc-stat">
                        <span className="acc-stat-label">{s.label}</span>
                        <span className={`acc-stat-value ${s.cls ?? ''}`}>{s.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <ProductDetailCta product={product} />

              <div className="product-detail-meta">
                <div>
                  <span className="meta-label">Danh mục</span>
                  <span>{product.category_name}</span>
                </div>
                <div>
                  <span className="meta-label">Tình trạng</span>
                  <span className={!soldOut ? 'status-on' : 'status-off'}>
                    {soldOut ? (product.is_sold ? 'Đã có chủ' : 'Tạm khoá') : 'Sẵn sàng giao'}
                  </span>
                </div>
                <div>
                  <span className="meta-label">Mã acc</span>
                  <span>{product.account_code ?? `#${product.id}`}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <ProductCarousel
          eyebrow="Cùng phân loại"
          title={`Acc PUBG khác trong "${product.category_name}"`}
          products={related}
        />
      )}

      {hot.length > 0 && (
        <ProductCarousel
          eyebrow="★ Hot"
          title="Đang được săn đón"
          products={hot}
        />
      )}
    </>
  );
}
