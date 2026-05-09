import type { Metadata, Viewport } from 'next';
import {
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_LOCALE,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
  DEFAULT_OG_IMAGE,
} from '@/lib/seo/siteConfig';
import Providers from './providers';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  generator: 'Next.js',
  keywords: SITE_KEYWORDS,
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  openGraph: {
    type: 'website',
    locale: SITE_LOCALE,
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [{ url: DEFAULT_OG_IMAGE, alt: `${SITE_NAME} — ${SITE_TAGLINE}` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  icons: {
    icon: '/favicon.svg',
  },
  alternates: {
    canonical: '/',
    languages: { vi: SITE_URL, 'x-default': SITE_URL },
  },
};

export const viewport: Viewport = {
  themeColor: '#f5a623',
  width: 'device-width',
  initialScale: 1,
};

// Font strategy (đồng nhất toàn site, tránh per-character fallback):
//   - Be Vietnam Pro: PRIMARY display + body (full Vietnamese subset, 5 weights,
//     tone modern grotesque hợp gaming). Mọi text có khả năng chứa ô/ậ/ợ/ằ
//     đều render bằng font này → không còn cảnh "1 ký tự rời ra".
//   - JetBrains Mono: PRIMARY numeric (giá, K/D, mã acc, page number...).
//     Monospace + lining/tabular figures → các con số xếp thẳng cột.
//   - Rajdhani / Orbitron: chỉ dùng decorative cho text TOÀN LATIN
//     (R.E.P.O brand, badge "MYTHIC/SALE", header bảng all-caps EN).
const GOOGLE_FONTS_HREF =
  'https://fonts.googleapis.com/css2?' +
  'family=Be+Vietnam+Pro:wght@400;500;600;700;800&' +
  'family=JetBrains+Mono:wght@400;500;600;700&' +
  'family=Rajdhani:wght@500;600;700&' +
  'family=Orbitron:wght@600;700;800&' +
  'family=Inter:wght@400;500;600;700&' +
  'display=swap';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="" />
        <link rel="stylesheet" href={GOOGLE_FONTS_HREF} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
