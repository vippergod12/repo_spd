'use client';

interface Props {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onChange: (next: number) => void;
  /** Khi true, vẫn render khi totalPages = 1 (cho consistent UI). Default false. */
  alwaysShow?: boolean;
  /** Nhãn đơn vị item, default "mục". VD: "acc", "danh mục"... */
  itemLabel?: string;
}

/**
 * Trả về dãy số trang hiển thị, dùng dấu '...' để ẩn các trang xa hiện tại.
 * Ví dụ: total=20, current=8 -> [1, '...', 6, 7, 8, 9, 10, '...', 20]
 */
function buildPageList(current: number, total: number): Array<number | 'gap'> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: Array<number | 'gap'> = [1];
  const left = Math.max(2, current - 2);
  const right = Math.min(total - 1, current + 2);

  if (left > 2) pages.push('gap');
  for (let i = left; i <= right; i += 1) pages.push(i);
  if (right < total - 1) pages.push('gap');

  pages.push(total);
  return pages;
}

export default function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onChange,
  alwaysShow = false,
  itemLabel = 'mục',
}: Props) {
  if (totalItems === 0) return null;
  if (!alwaysShow && totalPages <= 1) return null;

  const items = buildPageList(page, totalPages);
  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  return (
    <nav className="pagination" aria-label="Phân trang">
      <span className="pagination-info">
        Hiển thị <strong>{from}</strong>–<strong>{to}</strong> trên tổng{' '}
        <strong>{totalItems}</strong> {itemLabel}
      </span>
      <div className="pagination-controls">
        <button
          type="button"
          className="pagination-btn pagination-btn-edge"
          onClick={() => onChange(1)}
          disabled={page <= 1}
          aria-label="Trang đầu"
          title="Trang đầu"
        >
          «
        </button>
        <button
          type="button"
          className="pagination-btn pagination-btn-edge"
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          aria-label="Trang trước"
          title="Trang trước"
        >
          ‹
        </button>
        {items.map((it, idx) =>
          it === 'gap' ? (
            <span key={`gap-${idx}`} className="pagination-gap" aria-hidden>
              …
            </span>
          ) : (
            <button
              key={it}
              type="button"
              className={`pagination-btn ${it === page ? 'is-active' : ''}`}
              onClick={() => onChange(it)}
              aria-current={it === page ? 'page' : undefined}
            >
              {it}
            </button>
          ),
        )}
        <button
          type="button"
          className="pagination-btn pagination-btn-edge"
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Trang sau"
          title="Trang sau"
        >
          ›
        </button>
        <button
          type="button"
          className="pagination-btn pagination-btn-edge"
          onClick={() => onChange(totalPages)}
          disabled={page >= totalPages}
          aria-label="Trang cuối"
          title="Trang cuối"
        >
          »
        </button>
      </div>
    </nav>
  );
}
