import type { Metadata } from 'next';
import AboutHero from '@/components/about/AboutHero';
import { SITE_NAME } from '@/lib/seo/siteConfig';

export const revalidate = 300;

export const metadata: Metadata = {
  title: `Giới thiệu — Câu chuyện ${SITE_NAME}`,
  description:
    'R.E.P.O — Shop account PUBG: BATTLEGROUNDS (PC/Steam) uy tín tại Việt Nam. Khởi nguồn, đội ngũ, bốn trụ cột giá trị, ba sự khác biệt, cam kết bảo hành trọn đời cho game thủ Việt.',
  alternates: { canonical: '/gioi-thieu' },
  openGraph: {
    title: `Giới thiệu — Câu chuyện ${SITE_NAME}`,
    description:
      'Câu chuyện về R.E.P.O — shop acc PUBG PC uy tín, đội ngũ tự cày + thu mua acc từ player Việt Nam.',
    url: '/gioi-thieu',
    type: 'article',
  },
};

export default function AboutPage() {
  return (
    <div className="about-page">
      <AboutHero />
    </div>
  );
}
