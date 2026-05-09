import Reveal from '../Reveal';

/**
 * Section khẳng định R.E.P.O là shop acc PUBG có kho thực tế, có team
 * chăm sóc 24/7 — không phải bot trung gian. Đặt sau Marquee để build trust
 * trước khi user xem sản phẩm.
 */

interface Stat {
  num: string;
  label: string;
  hint?: string;
}

const STATS: Stat[] = [
  { num: '500+', label: 'Acc trong kho', hint: 'Tự cày + thu mua' },
  { num: '10.000+', label: 'Khách hàng', hint: 'Trên toàn quốc từ 2021' },
  { num: '99.7%', label: 'Tỷ lệ giao dịch thành công', hint: '0.3% còn lại được hoàn tiền' },
  { num: '5 phút', label: 'Giao acc trung bình', hint: 'Sau khi nhận thanh toán' },
  { num: '24/7', label: 'Hỗ trợ', hint: 'Telegram / Zalo / FB Messenger' },
  { num: '∞', label: 'Bảo hành', hint: 'Trọn đời, đền 100% nếu mất acc' },
];

interface Pillar {
  mark: string;
  title: string;
  body: string;
}

const PILLARS: Pillar[] = [
  {
    mark: '◇',
    title: 'Acc thật — verify in-game',
    body: 'Mọi acc đều có screenshot inventory + match history. Demo trực tiếp Steam trước khi chốt.',
  },
  {
    mark: '◆',
    title: 'Full mail · đổi mật khẩu thoải mái',
    body: 'Mọi acc bán đều giao kèm hotmail full quyền — bạn tự đổi pass + 2FA, an toàn vĩnh viễn.',
  },
  {
    mark: '○',
    title: 'Bảo hành trọn đời',
    body: 'Acc bị thu hồi do shop = đền 100%. Hỗ trợ recover acc 24/7 qua Telegram private chat.',
  },
];

export default function ManufacturerTrust() {
  return (
    <section className="section section-trust" id="trust">
      <div className="container">
        <Reveal variant="fade-up">
          <header className="trust-head">
            <span className="section-eyebrow">● Shop acc PUBG uy tín #1 VN</span>
            <h2 className="trust-head-title">
              <span>Kho acc thực tế &amp;</span>
              <em>đội chăm sóc</em>
              <span>chuyên PUBG PC</span>
            </h2>
            <p className="trust-head-lead">
              R.E.P.O không phải shop trung gian — chúng tôi <strong>tự cày
              acc</strong> và <strong>thu mua trực tiếp</strong> từ player cao
              thủ Việt Nam. Mọi acc đều được verify in-game, có demo Steam,
              giao acc kèm hotmail full quyền và bảo hành trọn đời.
            </p>
          </header>
        </Reveal>

        <Reveal variant="fade-up" delay={120}>
          <ul className="trust-stats">
            {STATS.map((s) => (
              <li key={s.label} className="trust-stat">
                <span className="trust-stat-num">{s.num}</span>
                <span className="trust-stat-label">{s.label}</span>
                {s.hint && <span className="trust-stat-hint">{s.hint}</span>}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal variant="fade-up" delay={200}>
          <ul className="trust-pillars">
            {PILLARS.map((p) => (
              <li key={p.title} className="trust-pillar">
                <span className="trust-pillar-mark" aria-hidden>
                  {p.mark}
                </span>
                <div>
                  <strong>{p.title}</strong>
                  <span>{p.body}</span>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal variant="fade-up" delay={280}>
          <div className="trust-cta">
            <a href="/cua-hang" className="trust-cta-primary">
              Xem kho acc &nbsp;↗
            </a>
            <a href="/bao-hanh" className="trust-cta-ghost">
              Cam kết bảo hành
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
