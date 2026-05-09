import Link from 'next/link';
import {
  COMPANY,
  EMAIL,
  HOTLINE,
  SITE_NAME,
  TELEGRAM_URL,
  FACEBOOK_URL,
  ZALO_URL,
} from '@/lib/seo/siteConfig';

export default function Footer() {
  const year = new Date().getFullYear();
  const telHref = `tel:${HOTLINE.replace(/\s+/g, '')}`;

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-col footer-brand-col">
          <Link href="/" className="footer-logo">
            <span className="brand-mark">R</span>
            <span className="footer-logo-text">{SITE_NAME}</span>
          </Link>
          <p className="footer-tag">
            Shop mua bán account PUBG: BATTLEGROUNDS (PC / Steam) uy tín — đa dạng
            tier từ Bronze đến Conqueror, full skin Glacier M416/AKM/AWM, set rare,
            level cao. Bảo hành trọn đời, đổi mật khẩu / mail / hotmail full quyền.
          </p>
          <ul className="footer-contact">
            <li>
              <span className="footer-contact-label">Văn phòng:</span>
              {COMPANY.address}
            </li>
            <li>
              <span className="footer-contact-label">Hotline:</span>
              <a href={telHref}>{HOTLINE}</a>
            </li>
            <li>
              <span className="footer-contact-label">Email:</span>
              <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            </li>
            <li>
              <span className="footer-contact-label">Giờ hỗ trợ:</span>
              {COMPANY.workingHours}
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Về R.E.P.O</h4>
          <ul>
            <li>
              <Link href="/gioi-thieu">Câu chuyện shop</Link>
            </li>
            <li>
              <Link href="/cua-hang">Toàn bộ acc đang bán</Link>
            </li>
            <li>
              <Link href="/tu-van">Tìm acc theo yêu cầu</Link>
            </li>
            <li>
              <Link href="/bao-hanh">Cam kết & bảo hành</Link>
            </li>
            <li>
              <Link href="/bao-hanh#huong-dan">Hướng dẫn mua acc</Link>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Hỗ trợ giao dịch</h4>
          <ul>
            <li>
              <a href={ZALO_URL} target="_blank" rel="noopener noreferrer">Zalo — chat 24/7</a>
            </li>
            <li>
              <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer">Telegram chính chủ</a>
            </li>
            <li>
              <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer">Facebook fanpage</a>
            </li>
            <li>
              <Link href="/bao-hanh#thanh-toan">Phương thức thanh toán</Link>
            </li>
            <li>
              <Link href="/bao-hanh#bao-hanh">Chính sách bảo hành</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>© {year} {COMPANY.name}. Sản phẩm dành cho người chơi PUBG: BATTLEGROUNDS PC. Không liên kết với KRAFTON / PUBG Corporation.</p>
        </div>
      </div>
    </footer>
  );
}
