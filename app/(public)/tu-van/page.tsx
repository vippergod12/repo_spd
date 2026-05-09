import type { Metadata } from 'next';
import ConsultationForm from '@/components/consultation/ConsultationForm';
import { HOTLINE, SITE_NAME } from '@/lib/seo/siteConfig';

export const metadata: Metadata = {
  title: `Tìm acc theo yêu cầu — ${SITE_NAME}`,
  description:
    'Để lại số điện thoại — đội R.E.P.O sẽ tư vấn chọn acc PUBG phù hợp ngân sách, rank, skin yêu cầu và liên hệ trong vòng 30 phút (giờ hành chính).',
  alternates: { canonical: '/tu-van' },
  openGraph: {
    title: `Tìm acc PUBG theo yêu cầu — ${SITE_NAME}`,
    description: 'Đăng ký tìm acc PUBG theo nhu cầu — phản hồi trong 30 phút.',
    url: '/tu-van',
    type: 'website',
  },
};

const telHref = `tel:${HOTLINE.replace(/\s+/g, '')}`;

export default function ConsultationPage() {
  return (
    <div className="consult-page">
      <section className="consult-section">
        <div className="container consult-grid">
          <div className="consult-intro">
            <span className="consult-eyebrow">— Tìm acc theo yêu cầu —</span>
            <h1 className="consult-title">
              Không tìm thấy acc <em>vừa ý?</em>
            </h1>
            <p className="consult-lead">
              Để lại số điện thoại + mô tả ngắn về acc bạn cần (rank, skin,
              ngân sách). Đội R.E.P.O sẽ săn acc theo đúng yêu cầu và liên hệ
              lại trong <strong>30 phút</strong> (giờ hành chính). Kho acc của
              shop được bổ sung mỗi ngày — luôn có hàng đúng nhu cầu.
            </p>

            <ul className="consult-perks">
              <li>
                <span className="consult-perk-mark" aria-hidden>
                  {'◆\uFE0E'}
                </span>
                <div>
                  <strong>Tư vấn miễn phí, không ràng buộc</strong>
                  <span>Bạn chỉ thanh toán khi đồng ý acc cụ thể.</span>
                </div>
              </li>
              <li>
                <span className="consult-perk-mark" aria-hidden>
                  {'◆\uFE0E'}
                </span>
                <div>
                  <strong>Săn acc Glacier · Mythic PC theo yêu cầu</strong>
                  <span>M416 Glacier, AKM Glacier, AWM Pyromaniac, Wanderer Set, PGC Crown — chỉ acc PC chính chủ.</span>
                </div>
              </li>
              <li>
                <span className="consult-perk-mark" aria-hidden>
                  {'◆\uFE0E'}
                </span>
                <div>
                  <strong>Bảo mật tuyệt đối</strong>
                  <span>SĐT chỉ dùng để liên hệ tư vấn — không spam, không chia sẻ.</span>
                </div>
              </li>
            </ul>

            <div className="consult-hotline">
              <span>Hoặc inbox trực tiếp:</span>
              <a href={telHref}>{HOTLINE}</a>
            </div>
          </div>

          <div className="consult-form-wrap">
            <ConsultationForm />
          </div>
        </div>
      </section>
    </div>
  );
}
