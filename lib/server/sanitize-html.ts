/**
 * Sanitize HTML từ rich text editor (TipTap) trước khi lưu DB.
 *
 * Strategy:
 *   - Allow-list các tag/attribute mà toolbar của RichTextEditor có thể tạo ra.
 *   - Drop tất cả tag khác (bao gồm <script>, <iframe>, <object>, <embed>,
 *     <style>, <link>, <meta>, on* attributes, javascript: URLs).
 *   - Không phụ thuộc external lib → không tăng cold start.
 *
 * Lưu ý: chỉ nội dung admin (đã đăng nhập) mới đi qua đây, nhưng vẫn defense
 * in depth phòng trường hợp cookie admin bị lộ hoặc CSRF.
 */

const ALLOWED_TAGS = new Set([
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'strike',
  'del',
  'h2',
  'h3',
  'h4',
  'ul',
  'ol',
  'li',
  'blockquote',
  'pre',
  'code',
  'a',
  'span',
]);

/**
 * Map các attribute hợp lệ theo từng tag.
 * "*" áp dụng cho mọi tag (chỉ "style" cho text-align).
 */
const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(['href', 'target', 'rel', 'title']),
  '*': new Set(['style', 'class']),
};

const ALLOWED_STYLE_PROPS = new Set(['text-align']);
const ALLOWED_TEXT_ALIGN = new Set(['left', 'right', 'center', 'justify']);
/** Class name an toàn TipTap có thể sinh ra (ProseMirror nodes). */
const ALLOWED_CLASS_PREFIXES = ['ProseMirror', 'is-active', 'rte-'];

const URL_SAFE_PROTOCOLS = /^(https?:|mailto:|tel:|\/|#)/i;

function sanitizeStyle(value: string): string {
  return value
    .split(';')
    .map((decl) => decl.trim())
    .filter(Boolean)
    .map((decl) => {
      const idx = decl.indexOf(':');
      if (idx <= 0) return null;
      const prop = decl.slice(0, idx).trim().toLowerCase();
      const val = decl.slice(idx + 1).trim().toLowerCase();
      if (!ALLOWED_STYLE_PROPS.has(prop)) return null;
      if (prop === 'text-align' && !ALLOWED_TEXT_ALIGN.has(val)) return null;
      return `${prop}: ${val}`;
    })
    .filter((d): d is string => d !== null)
    .join('; ');
}

function sanitizeClass(value: string): string {
  const safe = value
    .split(/\s+/)
    .filter((cls) => cls && ALLOWED_CLASS_PREFIXES.some((p) => cls.startsWith(p)))
    .join(' ');
  return safe;
}

/**
 * Lọc 1 chuỗi attributes thô (sau "<tag ") thành chuỗi attributes đã làm sạch.
 * Trả lời chuỗi rỗng nếu không có attribute hợp lệ nào.
 */
function sanitizeAttributes(tag: string, raw: string): string {
  const out: string[] = [];
  // Match attr="value" hoặc attr='value' hoặc attr=value hoặc attr (boolean)
  const attrRe = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
  let m: RegExpExecArray | null;
  while ((m = attrRe.exec(raw)) !== null) {
    const name = m[1].toLowerCase();
    const value = m[2] ?? m[3] ?? m[4] ?? '';
    // Drop event handlers ngay
    if (name.startsWith('on')) continue;
    const tagAttrs = ALLOWED_ATTRS[tag];
    const wildAttrs = ALLOWED_ATTRS['*'];
    const allowed = (tagAttrs && tagAttrs.has(name)) || wildAttrs.has(name);
    if (!allowed) continue;

    if (name === 'href' || name === 'src') {
      const trimmed = value.trim();
      if (!URL_SAFE_PROTOCOLS.test(trimmed)) continue;
      out.push(`${name}="${escapeAttr(trimmed)}"`);
      continue;
    }
    if (name === 'style') {
      const safe = sanitizeStyle(value);
      if (safe) out.push(`style="${escapeAttr(safe)}"`);
      continue;
    }
    if (name === 'class') {
      const safe = sanitizeClass(value);
      if (safe) out.push(`class="${escapeAttr(safe)}"`);
      continue;
    }
    if (name === 'target') {
      // Chỉ cho phép _blank để tránh _top hijacking; force noopener
      if (value !== '_blank') continue;
      out.push(`target="_blank"`);
      continue;
    }
    if (name === 'rel') {
      // Bắt buộc rel chứa noopener noreferrer khi có target
      const tokens = value.split(/\s+/).filter(Boolean);
      const set = new Set(tokens);
      set.add('noopener');
      set.add('noreferrer');
      out.push(`rel="${[...set].join(' ')}"`);
      continue;
    }
    out.push(`${name}="${escapeAttr(value)}"`);
  }

  return out.join(' ');
}

function escapeAttr(s: string): string {
  return s.replace(/"/g, '&quot;');
}

/** Sanitize HTML — strip dangerous tags/attrs, giữ formatting cơ bản. */
export function sanitizeHtml(input: string): string {
  if (!input) return '';
  // Strip toàn bộ comment + CDATA + DOCTYPE
  let html = input
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, '')
    .replace(/<!DOCTYPE[^>]*>/gi, '');

  // Walk qua từng tag, giữ nội dung text giữa các tag, lọc tag/attr.
  const tagRe = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g;
  html = html.replace(tagRe, (full, tagName: string, attrs: string) => {
    const tag = tagName.toLowerCase();
    const isClose = full.startsWith('</');
    if (!ALLOWED_TAGS.has(tag)) return '';
    if (isClose) return `</${tag}>`;
    const cleaned = sanitizeAttributes(tag, attrs);
    return cleaned ? `<${tag} ${cleaned}>` : `<${tag}>`;
  });

  return html.trim();
}

/**
 * Convert plain text → HTML an toàn để render qua dangerouslySetInnerHTML.
 * Dùng cho dữ liệu cũ (seed / nhập thủ công) chưa qua rich text editor.
 *
 * Nếu input đã có HTML tag → trả nguyên (đã được server sanitize khi save).
 * Nếu là plain text → escape ký tự HTML đặc biệt + wrap mỗi paragraph trong
 * `<p>`, giữ line break đơn bằng `<br>`.
 */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function ensureHtml(input: string): string {
  if (!input) return '';
  // Phát hiện HTML tag — đủ chắc cho mục đích này
  if (/<[a-zA-Z][^>]*>/.test(input)) return input;
  return input
    .split(/\n{2,}/)
    .map((par) => `<p>${escapeHtml(par).replace(/\n/g, '<br>')}</p>`)
    .join('\n');
}

/**
 * Convert HTML → plain text cho meta description / JSON-LD / preview.
 * Decode các HTML entity phổ biến và collapse whitespace.
 */
export function htmlToPlainText(input: string): string {
  if (!input) return '';
  return input
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li|blockquote)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{2,}/g, '\n')
    .trim();
}
