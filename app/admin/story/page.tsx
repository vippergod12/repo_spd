'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api-client';
import ImagePicker from '@/components/ImagePicker';

export default function AdminStoryPage() {
  const [imageUrl, setImageUrl] = useState('');
  const [initialImageUrl, setInitialImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .getHomeStory()
      .then((data) => {
        if (cancelled) return;
        const url = data?.image_url ?? '';
        setImageUrl(url);
        setInitialImageUrl(url);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Không tải được dữ liệu');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (successTimer.current) clearTimeout(successTimer.current);
    };
  }, []);

  const isDirty = imageUrl !== initialImageUrl;

  async function handleSave() {
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      await api.setHomeStory({ image_url: imageUrl });
      setInitialImageUrl(imageUrl);
      setSuccess('Đã lưu ảnh story.');
      if (successTimer.current) clearTimeout(successTimer.current);
      successTimer.current = setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setImageUrl(initialImageUrl);
    setError(null);
    setSuccess(null);
  }

  if (loading) {
    return <div className="page-loading">Đang tải...</div>;
  }

  return (
    <div className="admin-story-page">
      <header className="admin-page-header">
        <div>
          <h1>Câu chuyện R.E.P.O</h1>
          <p className="admin-page-sub">
            Ảnh hiển thị bên trái section &quot;Câu chuyện R.E.P.O&quot; ở trang chủ. Có thể upload
            ảnh từ máy (sẽ tự nén ~1000px) hoặc dán URL.
          </p>
        </div>
        <div className="admin-featured-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={handleReset}
            disabled={!isDirty || saving}
          >
            Hoàn tác
          </button>
          <button
            type="button"
            className="btn"
            onClick={handleSave}
            disabled={!isDirty || saving}
          >
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </header>

      {error && <div className="admin-flash admin-flash-error">{error}</div>}
      {success && <div className="admin-flash admin-flash-success">{success}</div>}

      <section className="featured-panel">
        <div className="featured-panel-head">
          <h2>Ảnh story</h2>
          <span className="featured-hint">Tỉ lệ 4 : 5 (dọc) trên desktop</span>
        </div>

        <div className="admin-story-grid">
          <ImagePicker
            value={imageUrl}
            onChange={setImageUrl}
            label="Ảnh hiển thị"
          />

          <div className="admin-story-preview">
            <span className="admin-story-preview-label">Xem trước</span>
            <div
              className={`admin-story-preview-frame ${imageUrl ? '' : 'is-empty'}`}
              style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
            >
              {!imageUrl && <span>Chưa có ảnh — sẽ hiển thị nền gradient mặc định</span>}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
