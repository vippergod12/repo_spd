'use client';

import Link from 'next/link';
import { CSSProperties, useEffect, useMemo, useRef, useState } from 'react';

/**
 * Sticky scrollytelling stage cho trang giới thiệu R.E.P.O.
 *
 * Cấu trúc giống MINT (5 beat crossfade theo scroll), nhưng:
 *  - Bỏ hẳn lớp "lá phong rơi" — thay bằng các đốm particle gaming (chấm
 *    cam/cyan rơi nhẹ) phù hợp vibe dark battle royale.
 *  - Toàn bộ copy đổi sang context PUBG PC.
 */

function clamp(v: number, lo = 0, hi = 1) {
  return Math.max(lo, Math.min(hi, v));
}

function beatOpacity(p: number, start: number, end: number, fade = 0.04) {
  if (p <= start || p >= end) return 0;
  const peak = start + fade;
  const holdEnd = end - fade;
  if (p < peak) return clamp((p - start) / fade);
  if (p > holdEnd) return clamp(1 - (p - holdEnd) / fade);
  return 1;
}

function beatOpacityNoFadeIn(p: number, end: number, fade = 0.04) {
  if (p >= end) return 0;
  const holdEnd = end - fade;
  if (p > holdEnd) return clamp(1 - (p - holdEnd) / fade);
  return 1;
}

function beatOpacityNoFadeOut(p: number, start: number, fade = 0.04) {
  if (p <= start) return 0;
  const peak = start + fade;
  if (p < peak) return clamp((p - start) / fade);
  return 1;
}

const PILLARS = [
  { mark: '◇\uFE0E', title: 'Acc Verify In-Game', body: 'Demo Steam trực tiếp, soi inventory, match history trước khi chốt' },
  { mark: '◆\uFE0E', title: 'Bảo hành trọn đời', body: 'Mất acc do shop = đền 100%. Hỗ trợ recover 24/7' },
  { mark: '○\uFE0E', title: 'Full Mail · Đổi Pass', body: 'Mọi acc kèm hotmail full quyền — bạn tự đổi mật khẩu + 2FA' },
  { mark: '●\uFE0E', title: 'Giao acc 5 phút', body: 'Sau khi nhận thanh toán, info acc gửi qua chat private' },
];

const DIFFS = [
  {
    eyebrow: '01 — Nguồn acc',
    title: 'Tự cày + thu mua từ player',
    body: 'Không phải shop trung gian. Acc đến từ team cày của shop hoặc player cao thủ chuyển nhượng.',
  },
  {
    eyebrow: '02 — Đa dạng',
    title: 'Bronze tới Conqueror — đủ tier',
    body: 'Kho 500+ acc đủ rank, đủ ngân sách. Có cả acc starter rẻ + acc Conqueror full Glacier.',
  },
  {
    eyebrow: '03 — Uy tín',
    title: '10K+ khách hàng từ 2021',
    body: 'Tỷ lệ giao dịch thành công 99.7%. Có review thật trên Telegram channel & Facebook fanpage.',
  },
];

/* ============================================================
   PARTICLES — chấm cam/cyan rơi nhẹ tạo vibe gaming dark.
   Số lượng tăng dần theo scroll progress.
   ============================================================ */

const PARTICLE_COUNT = 28;

function rand(i: number, salt: number) {
  const x = Math.sin(i * 9301.7 + salt * 49297.3) * 233280;
  return x - Math.floor(x);
}

interface Particle {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  appearAt: number;
  color: 'orange' | 'cyan' | 'magenta';
}

function buildParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i): Particle => {
    const colorRoll = rand(i, 1);
    return {
      id: i,
      x: rand(i, 2) * 100,
      size: 3 + rand(i, 3) * 6,
      duration: 12 + rand(i, 4) * 14,
      delay: -rand(i, 5) * 22,
      appearAt: rand(i, 6) * 0.85,
      color: colorRoll < 0.6 ? 'orange' : colorRoll < 0.9 ? 'cyan' : 'magenta',
    };
  });
}

const COLOR_MAP = {
  orange: '#f5a623',
  cyan: '#00d4ff',
  magenta: '#ff3da6',
};

export default function AboutHero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const [progress, setProgress] = useState(0);

  const particles = useMemo(() => buildParticles(), []);

  useEffect(() => {
    function update() {
      const el = sectionRef.current;
      if (!el) return;
      const total = el.offsetHeight - window.innerHeight;
      if (total <= 0) {
        setProgress(0);
        return;
      }
      const rect = el.getBoundingClientRect();
      const sectionDocTop = window.scrollY + rect.top;
      const scrolled =
        sectionDocTop < window.innerHeight ? window.scrollY : -rect.top;
      setProgress(clamp(scrolled / total));
    }

    function onScroll() {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        update();
      });
    }

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', update);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const b1 = beatOpacityNoFadeIn(progress, 0.12, 0.04);
  const b2 = beatOpacity(progress, 0.1, 0.32, 0.04);
  const b3 = beatOpacity(progress, 0.3, 0.55, 0.04);
  const b4 = beatOpacity(progress, 0.53, 0.78, 0.04);
  const b5 = beatOpacityNoFadeOut(progress, 0.76, 0.04);

  const ty = (op: number) => (1 - op) * 24;
  const tyUp = (op: number) => (1 - op) * -24;

  const beats = [b1, b2, b3, b4, b5];
  const beatLabels = ['Mở đầu', 'Khởi nguồn', 'Trụ cột', 'Khác biệt', 'Mua acc'];
  const activeBeat = beats.indexOf(Math.max(...beats));

  const hintOpacity = clamp(1 - progress * 8);

  return (
    <section
      ref={sectionRef}
      className="about-stage"
      aria-label="Câu chuyện R.E.P.O"
    >
      <div className="about-stage-sticky">
        <div className="about-bg-grad" aria-hidden />

        <div className="about-leaves" aria-hidden>
          {particles.map((p) => {
            const op = clamp((progress - p.appearAt) / 0.06);
            const style: CSSProperties = {
              opacity: op,
              width: `${p.size}px`,
              height: `${p.size}px`,
              borderRadius: '50%',
              background: COLOR_MAP[p.color],
              boxShadow: `0 0 ${p.size * 2}px ${COLOR_MAP[p.color]}`,
              ['--x' as string]: `${p.x}vw`,
              ['--drift' as string]: `0vw`,
              ['--duration' as string]: `${p.duration}s`,
              ['--delay' as string]: `${p.delay}s`,
              ['--rot-s' as string]: `0deg`,
              ['--rot-e' as string]: `0deg`,
              ['--leaf-filter' as string]: 'none',
            };
            return <span key={p.id} className="about-leaf" style={style} />;
          })}
        </div>

        {/* === BEAT 1: Hero title === */}
        <div
          className="about-beat about-beat-center"
          style={{
            opacity: b1,
            transform: `translateY(${ty(b1).toFixed(1)}px)`,
            pointerEvents: b1 > 0.5 ? 'auto' : 'none',
          }}
        >
          <span className="about-beat-eyebrow">— GIỚI THIỆU R.E.P.O —</span>
          <h1 className="about-beat-title about-beat-title-xl">
            <span>Account PUBG PC</span>
            <em>cho mọi chiến binh battlegrounds</em>
          </h1>
          <p className="about-beat-sub">
            Shop acc PUBG: BATTLEGROUNDS uy tín tại Việt Nam. Cuộn xuống để
            biết về đội ngũ và quy trình của chúng tôi.
          </p>
        </div>

        {/* === BEAT 2: Khởi nguồn === */}
        <div
          className="about-beat about-beat-left"
          style={{
            opacity: b2,
            transform: `translate(${(1 - b2) * -32}px, ${ty(b2).toFixed(1)}px)`,
          }}
        >
          <span className="about-beat-eyebrow">— Khởi nguồn —</span>
          <h2 className="about-beat-title">
            Khi PUBG <em>chuyển sang</em><br />free-to-play
          </h2>
          <p className="about-beat-body">
            Đầu năm 2022, PUBG: BATTLEGROUNDS chính thức free-to-play trên
            Steam. Hàng triệu player mới đổ vào, kéo theo nhu cầu khổng lồ
            cho acc Conqueror, full skin Glacier — thay vì cày 6 tháng. R.E.P.O
            ra đời để kết nối player cao thủ chuyển nhượng acc với người chơi mới.
          </p>
          <blockquote className="about-beat-quote">
            “Một acc Conqueror full Glacier — tiết kiệm 6 tháng cày của bạn.”
          </blockquote>
        </div>

        {/* === BEAT 3: 4 trụ cột === */}
        <div
          className="about-beat about-beat-center"
          style={{
            opacity: b3,
            transform: `translateY(${tyUp(b3).toFixed(1)}px)`,
          }}
        >
          <span className="about-beat-eyebrow">— Bốn trụ cột —</span>
          <h2 className="about-beat-title">
            Cách R.E.P.O <em>khác biệt</em>
          </h2>
          <div className="about-beat-pillars">
            {PILLARS.map((p, i) => {
              const localStart = 0.32 + i * 0.015;
              const op = beatOpacity(progress, localStart, 0.55, 0.025);
              return (
                <div
                  key={p.title}
                  className="about-pill-card"
                  style={{
                    opacity: op,
                    transform: `translateY(${(1 - op) * 18}px)`,
                  }}
                >
                  <span className="about-pill-mark" aria-hidden>
                    {p.mark}
                  </span>
                  <strong>{p.title}</strong>
                  <span className="about-pill-body">{p.body}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* === BEAT 4: 3 sự khác biệt === */}
        <div
          className="about-beat about-beat-right"
          style={{
            opacity: b4,
            transform: `translate(${(1 - b4) * 32}px, ${ty(b4).toFixed(1)}px)`,
          }}
        >
          <span className="about-beat-eyebrow">— Sự khác biệt —</span>
          <h2 className="about-beat-title">
            Ba điều làm nên <em>R.E.P.O</em>
          </h2>
          <ul className="about-beat-diffs">
            {DIFFS.map((d, i) => {
              const localStart = 0.55 + i * 0.025;
              const op = beatOpacity(progress, localStart, 0.78, 0.025);
              return (
                <li
                  key={d.title}
                  style={{
                    opacity: op,
                    transform: `translateX(${(1 - op) * 24}px)`,
                  }}
                >
                  <span className="about-diff-eyebrow">{d.eyebrow}</span>
                  <strong>{d.title}</strong>
                  <span>{d.body}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* === BEAT 5: CTA === */}
        <div
          className="about-beat about-beat-center"
          style={{
            opacity: b5,
            transform: `translateY(${ty(b5).toFixed(1)}px)`,
            pointerEvents: b5 > 0.5 ? 'auto' : 'none',
          }}
        >
          <span className="about-beat-eyebrow">— Bắt đầu chiến —</span>
          <h2 className="about-beat-title about-beat-title-xl">
            Sẵn sàng <em>chiến chicken dinner?</em>
          </h2>
          <p className="about-beat-sub">
            Khám phá kho 500+ acc PUBG đã verify hoặc đăng ký tìm acc theo
            yêu cầu. Đội ngũ R.E.P.O hỗ trợ 24/7 qua Telegram & Zalo.
          </p>
          <div className="about-beat-cta-row">
            <Link href="/cua-hang" className="about-beat-cta about-beat-cta-primary">
              Khám phá kho acc
            </Link>
            <Link href="/tu-van" className="about-beat-cta about-beat-cta-ghost">
              Tìm acc theo yêu cầu ↗
            </Link>
          </div>
        </div>

        {/* === Progress dots indicator === */}
        <ol className="about-stage-dots" aria-label="Tiến trình câu chuyện">
          {beatLabels.map((label, i) => (
            <li
              key={label}
              className={`about-stage-dot ${i === activeBeat ? 'is-active' : ''}`}
            >
              <span className="about-stage-dot-mark" aria-hidden />
              <span className="about-stage-dot-label">{label}</span>
            </li>
          ))}
        </ol>

        <div
          className="about-stage-hint"
          style={{ opacity: hintOpacity, pointerEvents: hintOpacity > 0.5 ? 'auto' : 'none' }}
          aria-hidden
        >
          <span>CUỘN</span>
          <span className="about-stage-hint-line" />
        </div>
      </div>
    </section>
  );
}
