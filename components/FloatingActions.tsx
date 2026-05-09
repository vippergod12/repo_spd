'use client';

import { useEffect, useState } from 'react';
import { ZALO_ENABLED, ZALO_URL } from '@/lib/utils/zalo';
import { TELEGRAM_URL } from '@/lib/seo/siteConfig';

/**
 * Bộ floating action ở góc phải-dưới: Zalo, Telegram, Lên đầu trang.
 * Gamer thường ưa Telegram hơn email — đặt Telegram cạnh Zalo để giảm friction.
 */
export default function FloatingActions() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="floating-actions">
      {ZALO_ENABLED && (
        <a
          href={ZALO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="floating-btn floating-zalo"
          aria-label="Liên hệ shop qua Zalo"
          title="Liên hệ qua Zalo"
        >
          <svg viewBox="0 0 64 64" width="22" height="22" aria-hidden>
            <path
              fill="currentColor"
              d="M32 6C16.5 6 4 16.7 4 30c0 7 3.5 13.3 9.2 17.6-.5 2.5-1.7 5.7-4 8 .3.4.8.6 1.4.5 4.3-.5 8.5-2.2 11.5-3.7 3.2.9 6.5 1.4 9.9 1.4 15.5 0 28-10.7 28-24S47.5 6 32 6zm-9.6 28.7h-6.7c-.6 0-1-.4-1-1v-9.5c0-.6.4-1 1-1s1 .4 1 1v8.5h5.7c.6 0 1 .4 1 1s-.4 1-1 1zm5-1c0 .6-.4 1-1 1s-1-.4-1-1v-9.5c0-.6.4-1 1-1s1 .4 1 1v9.5zm9.4 0c0 .6-.4 1-1 1-.3 0-.6-.2-.8-.4l-5-6.6v6c0 .6-.4 1-1 1s-1-.4-1-1v-9.5c0-.6.4-1 1-1 .3 0 .6.2.8.4l5 6.6v-6c0-.6.4-1 1-1s1 .4 1 1v9.5zm10.6 0c0 .3-.2.6-.4.8-.2.2-.4.3-.6.3h-6c-.6 0-1-.4-1-1v-9.5c0-.6.4-1 1-1s1 .4 1 1v8.5h5c.6 0 1 .4 1 .9z"
            />
          </svg>
        </a>
      )}

      {TELEGRAM_URL && (
        <a
          href={TELEGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="floating-btn floating-tg"
          aria-label="Chat Telegram"
          title="Chat Telegram"
          style={{ background: '#229ed9', color: '#fff' }}
        >
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
            <path
              fill="currentColor"
              d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"
            />
          </svg>
        </a>
      )}

      <button
        type="button"
        className={`floating-btn floating-top ${showTop ? 'is-visible' : ''}`}
        aria-label="Lên đầu trang"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        title="Lên đầu trang"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 14l6-6 6 6" />
        </svg>
      </button>
    </div>
  );
}
