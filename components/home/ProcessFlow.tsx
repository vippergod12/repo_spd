import Reveal from '../Reveal';

/**
 * "Quy trình mua acc 5 bước" — minh hoạ flow từ lúc khách chọn acc đến
 * khi đăng nhập Steam thành công. Mục tiêu: khách mới mua acc lần đầu
 * không phải lo lắng "acc có thật không / có lừa không".
 */

interface Step {
  num: string;
  title: string;
  body: string;
  duration: string;
}

const STEPS: Step[] = [
  {
    num: '01',
    title: 'Chọn acc & inbox shop',
    body: 'Browse kho acc hoặc gửi yêu cầu cụ thể (rank, skin, ngân sách). Nhân viên shop tư vấn miễn phí 24/7.',
    duration: '< 5 phút',
  },
  {
    num: '02',
    title: 'Xem demo in-game',
    body: 'Shop livestream / quay video Steam đang đăng nhập acc, soi inventory, match history theo yêu cầu. Tránh acc fake.',
    duration: '5–15 phút',
  },
  {
    num: '03',
    title: 'Thanh toán & nhận info',
    body: 'Chuyển khoản / MoMo / banking / crypto. Sau khi shop nhận tiền, info acc + mail full quyền gửi qua chat riêng tư.',
    duration: '< 5 phút',
  },
  {
    num: '04',
    title: 'Đổi mail & mật khẩu',
    body: 'Shop hướng dẫn từng bước đổi hotmail, mật khẩu Steam, gắn 2FA mới của bạn — đảm bảo an toàn vĩnh viễn.',
    duration: '5 phút',
  },
  {
    num: '05',
    title: 'Bảo hành trọn đời',
    body: 'Có vấn đề về acc bất cứ lúc nào (mất acc, mail bị thu hồi) → liên hệ shop, hỗ trợ 100% hoặc đền tiền.',
    duration: 'Forever',
  },
];

export default function ProcessFlow() {
  return (
    <section className="section section-process">
      <div className="container">
        <Reveal variant="fade-up">
          <header className="process-head">
            <span className="section-eyebrow">Quy trình minh bạch</span>
            <h2 className="process-head-title">
              Từ <em>chọn acc</em> tới chiến chicken dinner —<br />
              chỉ trong <strong>15 phút</strong>
            </h2>
            <p className="process-head-lead">
              Mọi giao dịch đều có demo in-game trước, có hợp đồng (bằng tin nhắn
              / video) và bảo hành trọn đời. Bạn không cần lo về scam — shop
              ưu tiên uy tín hơn lợi nhuận trước mắt.
            </p>
          </header>
        </Reveal>

        <Reveal variant="fade-up" delay={120}>
          <ol className="process-steps" aria-label="Quy trình 5 bước">
            {STEPS.map((s, i) => (
              <li key={s.num} className="process-step" style={{ ['--i' as string]: i }}>
                <div className="process-step-card">
                  <span className="process-step-num" aria-hidden>
                    {s.num}
                  </span>
                  <span className="process-step-duration">{s.duration}</span>
                  <strong className="process-step-title">{s.title}</strong>
                  <span className="process-step-body">{s.body}</span>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
