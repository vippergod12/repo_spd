import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_NAME, ZALO_URL, TELEGRAM_URL } from '@/lib/seo/siteConfig';

export const revalidate = 600;

export const metadata: Metadata = {
  title: `Cam kết & Bảo hành — ${SITE_NAME}`,
  description:
    'Chính sách bảo hành trọn đời, hướng dẫn mua acc PUBG an toàn 5 bước, các phương thức thanh toán & cam kết hoàn tiền 100% nếu acc không đúng mô tả tại R.E.P.O.',
  alternates: { canonical: '/bao-hanh' },
};

const COMMITMENTS = [
  {
    icon: '✓',
    title: 'Bảo hành trọn đời',
    body: 'Acc bị thu hồi do shop = đền 100% giá trị, hoặc đổi acc khác tương đương. Hỗ trợ recover acc 24/7 qua Telegram.',
  },
  {
    icon: '✓',
    title: 'Acc thật — verify in-game',
    body: 'Mọi acc đều có demo Steam livestream / video soi inventory + match history trước khi bạn quyết định mua.',
  },
  {
    icon: '✓',
    title: 'Full mail · Đổi pass thoải mái',
    body: 'Mọi acc bán đều giao kèm hotmail full quyền — bạn tự đổi mật khẩu Steam + 2FA, an toàn vĩnh viễn.',
  },
  {
    icon: '✓',
    title: 'Hoàn tiền nếu acc sai mô tả',
    body: 'Nếu acc nhận được không đúng mô tả (rank, skin, level), shop hoàn tiền 100% trong 24h, không hỏi lý do.',
  },
];

const STEPS = [
  {
    num: '01',
    title: 'Browse & chọn acc',
    body: 'Vào /cua-hang để xem kho acc đầy đủ. Filter theo rank, ngân sách. Hoặc gửi yêu cầu cụ thể qua /tu-van.',
  },
  {
    num: '02',
    title: 'Inbox shop xem demo',
    body: 'Click "Mua qua Zalo / Telegram" trên trang acc → shop sẽ livestream/quay video Steam đăng nhập acc cho bạn xem.',
  },
  {
    num: '03',
    title: 'Thanh toán an toàn',
    body: 'Chuyển khoản ngân hàng / MoMo / Banking QR / USDT. Có hoá đơn xác nhận giao dịch trước khi shop giao info.',
  },
  {
    num: '04',
    title: 'Nhận info & đổi mail',
    body: 'Sau khi shop nhận tiền, info acc + hotmail full quyền gửi qua chat private (không qua email công khai). Shop hướng dẫn đổi mail Steam, đổi mật khẩu.',
  },
  {
    num: '05',
    title: 'Bảo hành trọn đời',
    body: 'Lưu liên hệ shop. Có vấn đề về acc bất kỳ lúc nào → inbox shop, hỗ trợ giải quyết trong 1-24h.',
  },
];

const PAYMENT_METHODS = [
  { name: 'Vietcombank', detail: 'STK: 0123456789 — NGUYEN VAN A' },
  { name: 'MoMo', detail: 'SĐT: 0987 654 321' },
  { name: 'Banking QR', detail: 'Quét QR trong tin nhắn xác nhận' },
  { name: 'USDT (TRC20)', detail: 'Wallet sẽ gửi khi xác nhận đơn' },
];

export default function WarrantyPage() {
  return (
    <div className="section">
      <div className="container">
        <nav className="breadcrumb">
          <Link href="/">Trang chủ</Link>
          <span>/</span>
          <span>Cam kết & Bảo hành</span>
        </nav>

        <header style={{ textAlign: 'center', maxWidth: 720, margin: '32px auto 48px' }}>
          <span className="section-eyebrow">Cam kết R.E.P.O</span>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', margin: '12px 0' }}>
            Mua acc PUBG <em style={{ color: 'var(--primary)', fontStyle: 'normal' }}>an toàn — bảo hành trọn đời</em>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, lineHeight: 1.7 }}>
            Đây là cam kết của shop với mỗi giao dịch. Đọc kỹ để hiểu rõ quyền
            lợi của bạn khi mua acc tại R.E.P.O.
          </p>
        </header>

        <section id="cam-ket">
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', marginBottom: 8 }}>
            <span className="section-eyebrow">01 — Cam kết</span>
            <br />
            4 cam kết bằng văn bản
          </h2>
          <div className="warranty-grid">
            {COMMITMENTS.map((c) => (
              <div key={c.title} className="warranty-card">
                <span className="icon">{c.icon}</span>
                <h3>{c.title}</h3>
                <p>{c.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="huong-dan" style={{ marginTop: 64 }}>
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', marginBottom: 8 }}>
            <span className="section-eyebrow">02 — Hướng dẫn</span>
            <br />
            5 bước mua acc an toàn
          </h2>
          <ol className="steps-list">
            {STEPS.map((s) => (
              <li key={s.num}>
                <span className="step-num">{s.num}</span>
                <span className="step-text">
                  <strong>{s.title}</strong>
                  {s.body}
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section id="thanh-toan" style={{ marginTop: 64 }}>
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', marginBottom: 8 }}>
            <span className="section-eyebrow">03 — Thanh toán</span>
            <br />
            Phương thức thanh toán
          </h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: 640, marginBottom: 24 }}>
            R.E.P.O hỗ trợ nhiều phương thức thanh toán phổ biến. STK / địa chỉ
            ví được gửi cho bạn ở chat riêng tư khi xác nhận giao dịch — không
            đăng công khai để tránh giả mạo.
          </p>
          <div className="warranty-grid">
            {PAYMENT_METHODS.map((m) => (
              <div key={m.name} className="warranty-card">
                <span className="icon">$</span>
                <h3>{m.name}</h3>
                <p>{m.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="bao-hanh" style={{ marginTop: 64 }}>
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', marginBottom: 8 }}>
            <span className="section-eyebrow">04 — Bảo hành</span>
            <br />
            Chính sách bảo hành trọn đời
          </h2>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: 28, color: 'var(--text)', lineHeight: 1.8 }}>
            <p>
              <strong style={{ color: 'var(--primary)' }}>1. Acc bị thu hồi do shop:</strong>{' '}
              Nếu acc bị KRAFTON / Steam khóa do lý do từ phía shop (acc cũ bị
              report, dùng cheat trước khi bán...), shop hoàn 100% giá trị acc
              hoặc đổi acc khác tương đương.
            </p>
            <p>
              <strong style={{ color: 'var(--primary)' }}>2. Acc bị thu hồi do người mua:</strong>{' '}
              Nếu bạn dùng cheat / hack / share acc cho người khác → mất acc
              không được bảo hành. Shop khuyến cáo chơi sạch để giữ acc lâu dài.
            </p>
            <p>
              <strong style={{ color: 'var(--primary)' }}>3. Hỗ trợ recover:</strong>{' '}
              Trường hợp bạn quên mật khẩu, mất hotmail, hoặc bị chiếm acc
              (do thao tác sai) — shop hỗ trợ recover trong 24h qua Telegram
              private chat. Miễn phí trọn đời.
            </p>
            <p>
              <strong style={{ color: 'var(--primary)' }}>4. Đổi mật khẩu, mail:</strong>{' '}
              Bạn có thể đổi pass Steam, đổi mail liên kết bất cứ lúc nào sau
              khi nhận acc — shop hướng dẫn miễn phí.
            </p>
            <p style={{ marginTop: 18, padding: 16, background: 'var(--bg)', borderLeft: '3px solid var(--primary)', borderRadius: 6 }}>
              <strong style={{ color: 'var(--primary)' }}>★ Lưu ý quan trọng:</strong>{' '}
              Toàn bộ giao dịch của shop có log trong Telegram channel /
              Facebook fanpage. Mọi tranh chấp được xử lý minh bạch. Nếu bạn
              gặp vấn đề mà không liên hệ được shop qua kênh thường — vui lòng
              comment trực tiếp trên fanpage R.E.P.O.
            </p>
          </div>
        </section>

        <section style={{ marginTop: 64, textAlign: 'center', padding: '48px 24px', background: 'var(--bg-dark)', borderRadius: 12, border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: 24, marginBottom: 16 }}>Cần hỗ trợ ngay?</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
            Đội R.E.P.O online 24/7 — phản hồi trong 5 phút.
          </p>
          <div className="buy-cta-row" style={{ justifyContent: 'center' }}>
            <a href={ZALO_URL} target="_blank" rel="noopener noreferrer" className="buy-btn buy-btn-zalo" style={{ flex: '0 0 auto' }}>
              Inbox Zalo
            </a>
            <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="buy-btn buy-btn-tg" style={{ flex: '0 0 auto' }}>
              Telegram
            </a>
            <Link href="/cua-hang" className="buy-btn buy-btn-primary" style={{ flex: '0 0 auto' }}>
              Khám phá kho acc
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
