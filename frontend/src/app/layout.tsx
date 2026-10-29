import type { Metadata, Viewport } from 'next';
import './globals.css';
import PwaRuntime from '@/components/PwaRuntime';
import PwaStartup from '@/components/PwaStartup';
import { SITE_URL } from '@/lib/seo';

const siteUrl = SITE_URL;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Dorah — Know where your business money stands',
    template: '%s · Dorah',
  },
  description: 'An AI-powered financial controller to track business money, customer debts, bills, and discrepancies.',
  applicationName: 'Dorah',
  keywords: ['small business finance', 'financial controller', 'business cash flow', 'customer debt tracking', 'Dorah'],
  authors: [{ name: 'Dorah' }],
  creator: 'Dorah',
  publisher: 'Dorah',
  category: 'finance',
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION ? { 'msvalidate.01': process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION } : undefined,
  },
  icons: {
    icon: [
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [{ url: '/icon-192.png', type: 'image/png', sizes: '192x192' }],
  },
  appleWebApp: {
    capable: true,
    title: 'Dorah',
    statusBarStyle: 'black-translucent',
  },
  openGraph: {
    url: '/',
    title: 'Dorah — Know where your business money stands',
    description: 'Track business money, customer debts, bills, and financial discrepancies in one place.',
    type: 'website',
    siteName: 'Dorah',
    locale: 'en_NG',
    images: [{ url: '/dorah-social-preview.png', width: 1200, height: 630, alt: 'Dorah — Know where your business money stands.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dorah — Know where your business money stands',
    description: 'Your AI-powered financial controller for clearer business decisions.',
    images: ['/dorah-social-preview.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#3157F5',
  colorScheme: 'light',
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-NG">
      <body className="min-h-screen bg-white text-dark-950 antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
              try {
                const standalone = window.matchMedia('(display-mode: standalone)').matches || Boolean(window.navigator.standalone);
                const firstRootLaunch = window.location.pathname === '/' && !window.sessionStorage.getItem('dorah-pwa-launch-checked') && window.history.length <= 1;
                if (standalone && firstRootLaunch) window.location.replace('/launch');
              } catch (_) {}
            })();`,
          }}
        />
        {children}
        <PwaStartup />
        <PwaRuntime />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'Organization',
                  '@id': `${siteUrl}/#organization`,
                  name: 'Dorah',
                  url: siteUrl,
                  logo: {
                    '@type': 'ImageObject',
                    url: `${siteUrl}/icon-512.png`,
                    width: 512,
                    height: 512,
                  },
                  email: 'support@dorah.me',
                  description: 'Dorah helps small businesses understand recorded cash, customer balances, supplier bills, and financial activity.',
                },
                {
                  '@type': 'WebSite',
                  '@id': `${siteUrl}/#website`,
                  name: 'Dorah',
                  url: siteUrl,
                  description: 'A financial controller for small businesses to track money, customer debts, bills, and discrepancies.',
                  inLanguage: 'en-NG',
                  publisher: { '@id': `${siteUrl}/#organization` },
                  potentialAction: {
                    '@type': 'RegisterAction',
                    target: `${siteUrl}/signup`,
                    name: 'Create a Dorah account',
                  },
                },
              ],
            }),
          }}
        />
      </body>
    </html>
  );
}
