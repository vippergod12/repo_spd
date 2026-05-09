'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { api } from '@/lib/api-client';
import type { Category, Product } from '@/lib/types';
import Modal from '@/components/Modal';
import MultiImagePicker from '@/components/MultiImagePicker';
import TagInput from '@/components/TagInput';
import Switch from '@/components/Switch';
import Pagination from '@/components/Pagination';
import RowActions from '@/components/RowActions';
import { formatVnd } from '@/lib/utils/format';
import { fromDatetimeLocalValue, getSaleInfo, toDatetimeLocalValue } from '@/lib/utils/sale';
import { ALL_TIERS, ALL_SERVERS, REGISTER_METHODS, tierClass } from '@/lib/utils/tier';
import type { PubgServer, PubgTier, RegisterMethod } from '@/lib/types';

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
  ssr: false,
  loading: () => (
    <div className="rte-field">
      <span className="rte-label">Mô tả</span>
      <div className="rte-wrapper">
        <div className="rte-toolbar rte-toolbar-skeleton" />
        <div className="rte-content rte-skeleton" style={{ minHeight: 144 }} />
      </div>
    </div>
  ),
});

interface FormState {
  id?: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  sale_price: string;
  sale_end_at: string;
  images: string[];
  category_id: string;
  is_active: boolean;
  is_sold: boolean;
  colors: string[];
  // PUBG fields
  account_code: string;
  tier: string;
  steam_level: string;
  pubg_level: string;
  server: string;
  hours_played: string;
  skin_count: string;
  has_mythic: boolean;
  register_method: string;
  gcoin_balance: string;
  kd_ratio: string;
  win_rate: string;
}

const emptyForm: FormState = {
  name: '',
  slug: '',
  description: '',
  price: '',
  sale_price: '',
  sale_end_at: '',
  images: [],
  category_id: '',
  is_active: true,
  is_sold: false,
  colors: [],
  account_code: '',
  tier: '',
  steam_level: '',
  pubg_level: '',
  server: '',
  hours_played: '',
  skin_count: '',
  has_mythic: false,
  register_method: '',
  gcoin_balance: '',
  kd_ratio: '',
  win_rate: '',
};

/** Gợi ý skin tag phổ biến trên PUBG: BATTLEGROUNDS PC (Steam).
 *  Lưu ý: KHÔNG có X-Suit / Royal Pass / UC — đó là PUBG MOBILE. */
const SKIN_SUGGESTIONS = [
  // Glacier weapons (PC mythic ultimate)
  'Glacier M416',
  'Glacier AKM',
  'Glacier AWM',
  'Glacier Kar98K',
  'Glacier Mk14',
  'Glacier AUG',
  // Fool / Ice Fang (PC special)
  'Fool M416',
  'Ice Fang M416',
  'Diadem AKM',
  'Pyromaniac AWM',
  // Kar98K specials
  'Goldfish Kar98K',
  'Hong Kong Kar98K',
  // PC outfits / sets
  'Trench Coat',
  'School Skirt',
  'Wanderer Set',
  'Werewolf Set',
  'Pillage Set',
  // PC esports / event drops
  'PGC 2023 Crown',
  'PGC 2024 Set',
  'Twitch Drops Bronze Crown',
  'Survivor Pass Title',
  'Conqueror Title',
];

const PAGE_SIZE = 10;

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  async function refresh() {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        api.listProducts({
          category: filterCategory || undefined,
          q: search || undefined,
          include_sold: true,
        }),
        api.listCategories(),
      ]);
      setProducts(prods);
      setCategories(cats);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCategory]);

  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginatedProducts = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return products.slice(start, start + PAGE_SIZE);
  }, [products, safePage]);

  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  useEffect(() => {
    setPage(1);
  }, [filterCategory]);

  function openCreate() {
    setForm({ ...emptyForm, category_id: categories[0]?.id ? String(categories[0].id) : '' });
    setError(null);
    setOpen(true);
  }

  function openEdit(p: Product) {
    const initialImages = Array.isArray(p.images) && p.images.length > 0
      ? p.images
      : p.image_url
        ? [p.image_url]
        : [];
    setForm({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description ?? '',
      price: String(p.price ?? 0),
      sale_price: p.sale_price != null ? String(p.sale_price) : '',
      sale_end_at: toDatetimeLocalValue(p.sale_end_at),
      images: initialImages,
      category_id: String(p.category_id),
      is_active: p.is_active,
      is_sold: p.is_sold === true,
      colors: Array.isArray(p.colors) ? p.colors : [],
      account_code: p.account_code ?? '',
      tier: p.tier ?? '',
      steam_level: p.steam_level != null ? String(p.steam_level) : '',
      pubg_level: p.pubg_level != null ? String(p.pubg_level) : '',
      server: p.server ?? '',
      hours_played: p.hours_played != null ? String(p.hours_played) : '',
      skin_count: p.skin_count != null ? String(p.skin_count) : '',
      has_mythic: p.has_mythic === true,
      register_method: p.register_method ?? '',
      gcoin_balance: p.gcoin_balance != null ? String(p.gcoin_balance) : '',
      kd_ratio: p.kd_ratio != null ? String(p.kd_ratio) : '',
      win_rate: p.win_rate != null ? String(p.win_rate) : '',
    });
    setError(null);
    setOpen(true);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const cover = form.images[0] ?? null;
    const payload: Partial<Product> = {
      name: form.name,
      slug: form.slug || undefined,
      description: form.description || null,
      price: Number(form.price || 0),
      sale_price: form.sale_price ? Number(form.sale_price) : null,
      sale_end_at: form.sale_end_at ? fromDatetimeLocalValue(form.sale_end_at) : null,
      image_url: cover,
      images: form.images,
      category_id: Number(form.category_id),
      is_active: form.is_active,
      is_sold: form.is_sold,
      colors: form.colors,
      account_code: form.account_code.trim() || null,
      tier: (form.tier || null) as PubgTier | null,
      steam_level: form.steam_level ? Number(form.steam_level) : null,
      pubg_level: form.pubg_level ? Number(form.pubg_level) : null,
      server: (form.server || null) as PubgServer | null,
      hours_played: form.hours_played ? Number(form.hours_played) : null,
      skin_count: form.skin_count ? Number(form.skin_count) : null,
      has_mythic: form.has_mythic,
      register_method: (form.register_method || null) as RegisterMethod | null,
      gcoin_balance: form.gcoin_balance ? Number(form.gcoin_balance) : null,
      kd_ratio: form.kd_ratio ? Number(form.kd_ratio) : null,
      win_rate: form.win_rate ? Number(form.win_rate) : null,
    };
    try {
      if (form.id) {
        await api.updateProduct(form.id, payload);
      } else {
        await api.createProduct(payload);
      }
      setOpen(false);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(p: Product) {
    setProducts((prev) =>
      prev.map((it) => (it.id === p.id ? { ...it, is_active: !p.is_active } : it)),
    );
    try {
      await api.setProductActive(p.id, !p.is_active);
    } catch (err) {
      setProducts((prev) =>
        prev.map((it) => (it.id === p.id ? { ...it, is_active: p.is_active } : it)),
      );
      alert(err instanceof Error ? err.message : 'Cập nhật trạng thái thất bại');
    }
  }

  async function toggleSold(p: Product) {
    const next = !(p.is_sold === true);
    setProducts((prev) =>
      prev.map((it) => (it.id === p.id ? { ...it, is_sold: next } : it)),
    );
    try {
      await api.setProductSold(p.id, next);
    } catch (err) {
      setProducts((prev) =>
        prev.map((it) => (it.id === p.id ? { ...it, is_sold: p.is_sold } : it)),
      );
      alert(err instanceof Error ? err.message : 'Cập nhật trạng thái bán thất bại');
    }
  }

  async function onDelete(p: Product) {
    if (!confirm(`Xoá account "${p.name}"?`)) return;
    try {
      await api.deleteProduct(p.id);
      await refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Xoá thất bại');
    }
  }

  function onSearchSubmit(e: FormEvent) {
    e.preventDefault();
    setPage(1);
    refresh();
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Account PUBG</h1>
          <p>Quản lý kho account PUBG: BATTLEGROUNDS đang bán.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate} disabled={categories.length === 0}>
          + Thêm acc mới
        </button>
      </div>

      {categories.length === 0 && (
        <div className="empty-state">Bạn cần tạo ít nhất 1 danh mục trước khi thêm acc.</div>
      )}

      <div className="toolbar">
        <form onSubmit={onSearchSubmit} className="toolbar-search">
          <input
            type="search"
            placeholder="Tìm theo tên / mã acc..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-ghost btn-sm">Tìm</button>
        </form>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="select"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="empty-state">Đang tải...</div>
      ) : products.length === 0 ? (
        <div className="empty-state">Không có acc phù hợp.</div>
      ) : (
        <div className="table-wrapper table-wrapper--scroll-x">
          <table className="data-table data-table--products">
            <colgroup>
              <col style={{ width: 60 }} />
              <col style={{ width: 88 }} />
              <col style={{ width: 130 }} />
              <col style={{ width: 300 }} />
              <col style={{ width: 130 }} />
              <col style={{ width: 88 }} />
              <col style={{ width: 170 }} />
              <col style={{ width: 180 }} />
              <col style={{ width: 80 }} />
              <col style={{ width: 80 }} />
              <col style={{ width: 96 }} />
              <col style={{ width: 160 }} />
              <col style={{ width: 64 }} />
            </colgroup>
            <thead>
              <tr>
                <th>#</th>
                <th>Ảnh</th>
                <th>Mã acc</th>
                <th>Tên acc</th>
                <th>Tier</th>
                <th>Server</th>
                <th>Danh mục</th>
                <th>Giá</th>
                <th>K/D</th>
                <th>Skin</th>
                <th>Hiển thị</th>
                <th>Tình trạng</th>
                <th aria-label="Hành động" />
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map((p) => {
                const cover =
                  (Array.isArray(p.images) && p.images[0]) || p.image_url || '';
                const total = Array.isArray(p.images) ? p.images.length : cover ? 1 : 0;
                const inStock = p.is_sold !== true;
                return (
                  <tr key={p.id}>
                    <td className="cell-id">#{p.id}</td>
                    <td>
                      {cover ? (
                        <div className="table-thumb-wrapper">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={cover} alt={p.name} className="table-thumb" />
                          {total > 1 && <span className="table-thumb-count">+{total - 1}</span>}
                        </div>
                      ) : (
                        <div className="table-thumb empty">—</div>
                      )}
                    </td>
                    <td>
                      {p.account_code ? (
                        <code className="cell-code">{p.account_code}</code>
                      ) : (
                        <span className="cell-muted">—</span>
                      )}
                    </td>
                    <td>
                      <div className="cell-strong cell-truncate" title={p.name}>{p.name}</div>
                      <code className="cell-muted cell-truncate">{p.slug}</code>
                    </td>
                    <td>
                      {p.tier ? (
                        <span
                          className={`tier-badge ${tierClass(p.tier)}`}
                          style={{ fontSize: 10, padding: '3px 8px' }}
                        >
                          {p.tier}
                        </span>
                      ) : (
                        <span className="cell-muted">—</span>
                      )}
                    </td>
                    <td className="cell-mono">{p.server ?? '—'}</td>
                    <td className="cell-truncate">
                      {p.category_name ?? categoryMap.get(p.category_id)?.name ?? '—'}
                    </td>
                    <td className="price-cell">
                      {(() => {
                        const info = getSaleInfo(p);
                        if (!info.isOnSale) return formatVnd(p.price);
                        return (
                          <div className="price-cell-stack">
                            <span className="price-sale">{formatVnd(info.effectivePrice)}</span>
                            <span className="price-original">{formatVnd(info.originalPrice)}</span>
                            <span className="price-sale-tag">SALE {info.saleRatio}%</span>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="cell-num">
                      {p.kd_ratio != null ? Number(p.kd_ratio).toFixed(2) : '—'}
                    </td>
                    <td className="cell-num">
                      {p.skin_count != null ? p.skin_count : '—'}
                      {p.has_mythic && (
                        <span className="mythic-dot" title="Có Mythic / Glacier" aria-label="Mythic">
                          ★
                        </span>
                      )}
                    </td>
                    <td className="cell-center">
                      <Switch
                        checked={p.is_active}
                        onChange={() => toggleActive(p)}
                        ariaLabel={p.is_active ? 'Ẩn acc' : 'Hiển thị acc'}
                      />
                    </td>
                    <td>
                      <div className="stock-cell">
                        <Switch
                          checked={inStock}
                          onChange={() => toggleSold(p)}
                          ariaLabel={inStock ? 'Đánh dấu đã bán' : 'Bỏ đánh dấu đã bán'}
                        />
                        <span className={`stock-pill ${inStock ? 'is-in' : 'is-out'}`}>
                          {inStock ? 'Còn hàng' : 'Đã bán'}
                        </span>
                      </div>
                    </td>
                    <td className="cell-center">
                      <RowActions
                        kebabOnly
                        actions={[
                          { label: 'Sửa acc', onClick: () => openEdit(p) },
                          { label: 'Xoá acc', onClick: () => onDelete(p), variant: 'danger' },
                        ]}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!loading && products.length > 0 && (
        <Pagination
          page={safePage}
          totalPages={totalPages}
          totalItems={products.length}
          pageSize={PAGE_SIZE}
          onChange={setPage}
          alwaysShow
          itemLabel="acc"
        />
      )}

      <Modal
        open={open}
        title={form.id ? 'Sửa account' : 'Thêm account mới'}
        onClose={() => setOpen(false)}
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)} disabled={submitting}>Huỷ</button>
            <button type="submit" form="product-form" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Đang lưu...' : 'Lưu'}
            </button>
          </>
        }
      >
        <form id="product-form" className="form" onSubmit={onSubmit}>
          <label className="field">
            <span>Tên account *</span>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="VD: Acc Conqueror SEA Full Glacier M416 + AWM Pyromaniac"
            />
          </label>

          <div className="form-row">
            <label className="field">
              <span>Slug (auto nếu trống)</span>
              <input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
              />
            </label>
            <label className="field">
              <span>Mã acc hiển thị</span>
              <input
                value={form.account_code}
                onChange={(e) => setForm({ ...form, account_code: e.target.value })}
                placeholder="VD: #REPO1024"
              />
            </label>
          </div>

          <div className="form-row">
            <label className="field">
              <span>Giá (VND) *</span>
              <input
                required
                type="number"
                min={0}
                step="10000"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </label>
            <label className="field">
              <span>Danh mục *</span>
              <select
                required
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              >
                <option value="" disabled>Chọn danh mục</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>
          </div>

          <fieldset className="field-group">
            <legend>Khuyến mãi (tuỳ chọn)</legend>
            <div className="form-row">
              <label className="field">
                <span>Giá sale (VND)</span>
                <input
                  type="number"
                  min={0}
                  step="10000"
                  placeholder="Để trống nếu không có sale"
                  value={form.sale_price}
                  onChange={(e) => setForm({ ...form, sale_price: e.target.value })}
                />
              </label>
              <label className="field">
                <span>Kết thúc sale</span>
                <input
                  type="datetime-local"
                  value={form.sale_end_at}
                  onChange={(e) => setForm({ ...form, sale_end_at: e.target.value })}
                />
              </label>
            </div>
            {form.sale_price && form.price && Number(form.sale_price) > 0 && Number(form.sale_price) < Number(form.price) && (
              <p className="field-hint">
                Giảm: <strong>{Math.round((1 - Number(form.sale_price) / Number(form.price)) * 100)}%</strong>
              </p>
            )}
          </fieldset>

          <fieldset className="field-group">
            <legend>Thông số PUBG</legend>
            <div className="form-row">
              <label className="field">
                <span>Tier hiện tại</span>
                <select
                  value={form.tier}
                  onChange={(e) => setForm({ ...form, tier: e.target.value })}
                >
                  <option value="">— Chọn tier —</option>
                  {ALL_TIERS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Server</span>
                <select
                  value={form.server}
                  onChange={(e) => setForm({ ...form, server: e.target.value })}
                >
                  <option value="">— Chọn server —</option>
                  {ALL_SERVERS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="form-row">
              <label className="field">
                <span>Steam level</span>
                <input
                  type="number"
                  min={0}
                  value={form.steam_level}
                  onChange={(e) => setForm({ ...form, steam_level: e.target.value })}
                />
              </label>
              <label className="field">
                <span>PUBG career level</span>
                <input
                  type="number"
                  min={0}
                  value={form.pubg_level}
                  onChange={(e) => setForm({ ...form, pubg_level: e.target.value })}
                />
              </label>
            </div>
            <div className="form-row">
              <label className="field">
                <span>K/D Ratio</span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.kd_ratio}
                  onChange={(e) => setForm({ ...form, kd_ratio: e.target.value })}
                  placeholder="VD: 4.32"
                />
              </label>
              <label className="field">
                <span>Win rate (%)</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step="0.1"
                  value={form.win_rate}
                  onChange={(e) => setForm({ ...form, win_rate: e.target.value })}
                  placeholder="VD: 12.5"
                />
              </label>
            </div>
            <div className="form-row">
              <label className="field">
                <span>Tổng số skin</span>
                <input
                  type="number"
                  min={0}
                  value={form.skin_count}
                  onChange={(e) => setForm({ ...form, skin_count: e.target.value })}
                />
              </label>
              <label className="field">
                <span>Giờ chơi</span>
                <input
                  type="number"
                  min={0}
                  value={form.hours_played}
                  onChange={(e) => setForm({ ...form, hours_played: e.target.value })}
                  placeholder="VD: 1240"
                />
              </label>
            </div>
            <div className="form-row">
              <label className="field">
                <span>G-Coin balance</span>
                <input
                  type="number"
                  min={0}
                  value={form.gcoin_balance}
                  onChange={(e) => setForm({ ...form, gcoin_balance: e.target.value })}
                />
              </label>
              <label className="field">
                <span>Loại đăng ký</span>
                <select
                  value={form.register_method}
                  onChange={(e) => setForm({ ...form, register_method: e.target.value })}
                >
                  <option value="">— Chọn loại —</option>
                  {REGISTER_METHODS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="field-inline switch-row">
              <Switch
                checked={form.has_mythic}
                onChange={(next) => setForm({ ...form, has_mythic: next })}
                ariaLabel="Có Mythic / Glacier items"
              />
              <div className="switch-label">
                <strong>Có Glacier / Mythic items</strong>
                <small>Hiển thị badge "Mythic" trên card.</small>
              </div>
            </div>
          </fieldset>

          <MultiImagePicker
            label="Ảnh acc — screenshot in-game (tối đa 10)"
            value={form.images}
            onChange={(next) => setForm({ ...form, images: next })}
            disabled={submitting}
          />

          <TagInput
            label="Skin / Item nổi bật (hiển thị trên card)"
            value={form.colors}
            onChange={(next) => setForm({ ...form, colors: next })}
            placeholder="VD: Glacier M416, AWM Fool..."
            hint="Nhập từng tag, nhấn Enter. Hiển thị dưới giá trên card sản phẩm."
            suggestions={SKIN_SUGGESTIONS}
          />

          <RichTextEditor
            label="Mô tả chi tiết acc"
            value={form.description}
            onChange={(html) => setForm({ ...form, description: html })}
            placeholder="Mô tả chi tiết: lịch sử rank, danh sách skin đầy đủ, outfit, mọt số trận điển hình..."
            hint="Có thể format đậm/nghiêng/list. Hiển thị ở trang chi tiết acc."
            minRows={6}
            disabled={submitting}
          />

          <div className="field-inline switch-row">
            <Switch
              checked={form.is_active}
              onChange={(next) => setForm({ ...form, is_active: next })}
              ariaLabel="Trạng thái hiển thị"
            />
            <div className="switch-label">
              <strong>{form.is_active ? 'Đang hiển thị' : 'Đang ẩn'}</strong>
              <small>
                {form.is_active
                  ? 'Acc hiển thị công khai trên cửa hàng.'
                  : 'Acc bị ẩn khỏi public, chỉ admin xem được.'}
              </small>
            </div>
          </div>

          <div className="field-inline switch-row">
            <Switch
              checked={!form.is_sold}
              onChange={(next) => setForm({ ...form, is_sold: !next })}
              ariaLabel="Tình trạng kho"
            />
            <div className="switch-label">
              <strong>{!form.is_sold ? 'Còn hàng' : 'Đã bán'}</strong>
              <small>
                {!form.is_sold
                  ? 'Switch ON — acc đang sẵn sàng giao dịch, hiển thị bình thường trên cửa hàng.'
                  : 'Switch OFF — acc bị khoá khỏi danh sách bán, public hiển thị overlay "Đã bán".'}
              </small>
            </div>
          </div>

          {error && <div className="form-error">{error}</div>}
        </form>
      </Modal>
    </div>
  );
}
