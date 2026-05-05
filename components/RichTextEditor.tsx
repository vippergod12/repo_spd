'use client';

import { useEditor, EditorContent, type Editor } from '@tiptap/react';
// StarterKit (v3) đã bao gồm Bold/Italic/Underline/Strike/Heading/Lists/Link/...
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useState } from 'react';

interface Props {
  value: string;
  onChange: (html: string) => void;
  /** Placeholder hiển thị khi nội dung trống. */
  placeholder?: string;
  label?: string;
  hint?: string;
  disabled?: boolean;
  /** Số dòng tối thiểu (mặc định 6). */
  minRows?: number;
}

/**
 * Rich text editor cho admin — dùng TipTap (ProseMirror).
 *
 * Hỗ trợ:
 *  - Định dạng: B / I / U
 *  - Tiêu đề H2 / H3
 *  - Danh sách: bullet / numbered
 *  - Quote, code block
 *  - Căn lề: trái / giữa / phải
 *  - Liên kết (chèn bằng prompt())
 *  - In hoa qua transform CSS (tránh ghi UPPERCASE thẳng vào DB → mất gốc)
 *
 * Output là HTML string. Server cần sanitize trước khi lưu (xem
 * `lib/server/sanitize-html.ts`).
 */
export default function RichTextEditor({
  value,
  onChange,
  placeholder,
  label,
  hint,
  disabled,
  minRows = 6,
}: Props) {
  const [mounted, setMounted] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: {
            rel: 'noopener noreferrer',
            target: '_blank',
          },
        },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({
        placeholder: placeholder || 'Bắt đầu nhập mô tả...',
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: value || '',
    editable: !disabled,
    onUpdate({ editor }) {
      const html = editor.getHTML();
      // TipTap trả "<p></p>" cho nội dung trống — chuẩn hoá về "" cho consistency.
      onChange(html === '<p></p>' ? '' : html);
    },
    // Tắt SSR để tránh hydration mismatch
    immediatelyRender: false,
  });

  // Sync khi `value` từ ngoài thay đổi (ví dụ openEdit reset form), tránh
  // reset trong lúc user đang gõ — chỉ replace khi nội dung thực sự khác.
  useEffect(() => {
    if (!editor) return;
    const next = value || '';
    const current = editor.getHTML();
    // TipTap render '<p></p>' cho rỗng — coi như tương đương '' để khỏi loop
    const normalized = current === '<p></p>' ? '' : current;
    if (normalized !== next) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }, [value, editor]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (editor) editor.setEditable(!disabled);
  }, [disabled, editor]);

  return (
    <div className={`rte-field ${disabled ? 'is-disabled' : ''}`}>
      {label && <span className="rte-label">{label}</span>}
      <div className="rte-wrapper">
        <Toolbar editor={editor} disabled={!!disabled || !mounted} />
        <div className="rte-content-wrap" style={{ minHeight: `${minRows * 24}px` }}>
          {editor ? (
            <EditorContent editor={editor} className="rte-content" />
          ) : (
            <div className="rte-content rte-skeleton" />
          )}
        </div>
      </div>
      {hint && <span className="rte-hint">{hint}</span>}
    </div>
  );
}

/* -----------------------------------------------------------
   Toolbar
   ----------------------------------------------------------- */
interface ToolbarProps {
  editor: Editor | null;
  disabled?: boolean;
}

function Toolbar({ editor, disabled }: ToolbarProps) {
  if (!editor) {
    return <div className="rte-toolbar rte-toolbar-skeleton" aria-hidden />;
  }

  function btnClass(name: string, opts?: Record<string, unknown>) {
    return `rte-btn ${editor!.isActive(name, opts) ? 'is-active' : ''}`;
  }

  /**
   * Biến đổi chữ hoa/thường cho text đang chọn. Dùng cho yêu cầu "in hoa"
   * (khác với CSS text-transform vì sửa thẳng vào nội dung — paste vào nơi
   * khác vẫn giữ chữ hoa).
   */
  function transformCase(mode: 'upper' | 'lower') {
    if (!editor) return;
    const { state } = editor;
    const { from, to, empty } = state.selection;
    if (empty) return;
    const text = state.doc.textBetween(from, to, '\n');
    if (!text) return;
    const out = mode === 'upper' ? text.toUpperCase() : text.toLowerCase();
    editor.chain().focus().insertContentAt({ from, to }, out).run();
  }

  function setLink() {
    if (!editor) return;
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Dán URL liên kết (để trống để gỡ):', prev ?? '');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    let final = url.trim();
    if (final && !/^https?:\/\//i.test(final) && !/^mailto:|^tel:/i.test(final)) {
      final = 'https://' + final;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: final }).run();
  }

  return (
    <div className="rte-toolbar" role="toolbar" aria-label="Định dạng văn bản">
      <fieldset disabled={disabled} className="rte-toolbar-group">
        <button
          type="button"
          className={btnClass('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Đậm (Ctrl+B)"
          aria-label="Đậm"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          className={btnClass('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Nghiêng (Ctrl+I)"
          aria-label="Nghiêng"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          className={btnClass('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Gạch chân (Ctrl+U)"
          aria-label="Gạch chân"
        >
          <span style={{ textDecoration: 'underline' }}>U</span>
        </button>
        <button
          type="button"
          className={btnClass('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Gạch ngang"
          aria-label="Gạch ngang"
        >
          <span style={{ textDecoration: 'line-through' }}>S</span>
        </button>
      </fieldset>

      <span className="rte-toolbar-sep" aria-hidden />

      <fieldset disabled={disabled} className="rte-toolbar-group">
        <button
          type="button"
          className="rte-btn"
          onClick={() => transformCase('upper')}
          title="In hoa text đang chọn"
          aria-label="In hoa text đang chọn"
        >
          AA
        </button>
        <button
          type="button"
          className="rte-btn"
          onClick={() => transformCase('lower')}
          title="In thường text đang chọn"
          aria-label="In thường text đang chọn"
        >
          aa
        </button>
      </fieldset>

      <span className="rte-toolbar-sep" aria-hidden />

      <fieldset disabled={disabled} className="rte-toolbar-group">
        <button
          type="button"
          className={btnClass('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Tiêu đề lớn (H2)"
        >
          H2
        </button>
        <button
          type="button"
          className={btnClass('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="Tiêu đề phụ (H3)"
        >
          H3
        </button>
        <button
          type="button"
          className={btnClass('paragraph')}
          onClick={() => editor.chain().focus().setParagraph().run()}
          title="Đoạn văn"
        >
          P
        </button>
      </fieldset>

      <span className="rte-toolbar-sep" aria-hidden />

      <fieldset disabled={disabled} className="rte-toolbar-group">
        <button
          type="button"
          className={btnClass('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Danh sách dấu chấm"
          aria-label="Danh sách dấu chấm"
        >
          •
        </button>
        <button
          type="button"
          className={btnClass('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Danh sách đánh số"
          aria-label="Danh sách đánh số"
        >
          1.
        </button>
        <button
          type="button"
          className={btnClass('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Trích dẫn"
          aria-label="Trích dẫn"
        >
          ❝
        </button>
      </fieldset>

      <span className="rte-toolbar-sep" aria-hidden />

      <fieldset disabled={disabled} className="rte-toolbar-group">
        <button
          type="button"
          className={editor.isActive({ textAlign: 'left' }) ? 'rte-btn is-active' : 'rte-btn'}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          title="Căn trái"
          aria-label="Căn trái"
        >
          ☰
        </button>
        <button
          type="button"
          className={editor.isActive({ textAlign: 'center' }) ? 'rte-btn is-active' : 'rte-btn'}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          title="Căn giữa"
          aria-label="Căn giữa"
        >
          ≡
        </button>
        <button
          type="button"
          className={editor.isActive({ textAlign: 'right' }) ? 'rte-btn is-active' : 'rte-btn'}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          title="Căn phải"
          aria-label="Căn phải"
        >
          ☷
        </button>
      </fieldset>

      <span className="rte-toolbar-sep" aria-hidden />

      <fieldset disabled={disabled} className="rte-toolbar-group">
        <button
          type="button"
          className={btnClass('link')}
          onClick={setLink}
          title="Chèn liên kết"
          aria-label="Chèn liên kết"
        >
          ↗
        </button>
        <button
          type="button"
          className="rte-btn"
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          title="Xoá định dạng"
          aria-label="Xoá định dạng"
        >
          ⌫
        </button>
        <button
          type="button"
          className="rte-btn"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Hoàn tác (Ctrl+Z)"
          aria-label="Hoàn tác"
        >
          ↶
        </button>
        <button
          type="button"
          className="rte-btn"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Làm lại (Ctrl+Shift+Z)"
          aria-label="Làm lại"
        >
          ↷
        </button>
      </fieldset>
    </div>
  );
}
