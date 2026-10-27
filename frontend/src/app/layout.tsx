import type { Metadata, Viewport } from 'next';
import './globals.css';
import PwaRuntime from '@/components/PwaRuntime';
import PwaStartup from '@/components/PwaStartup';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://duorah.vercel.app';

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
  alternates: { canonical: '/' },
  icons: { icon: '/icon.svg', apple: '/icon-192.svg' },
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
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Dorah — Pay for the seat, not the whole plan.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dorah — Know where your business money stands',
    description: 'Your AI-powered financial controller for clearer business decisions.',
    images: ['/opengraph-image'],
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
        {children}
        <PwaStartup />
        <PwaRuntime />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Dorah',
              url: siteUrl,
              description: 'An AI-powered financial controller to track business money and understand what needs attention.',
              inLanguage: 'en-NG',
              potentialAction: {
                '@type': 'RegisterAction',
                target: `${siteUrl}/signup`,
                name: 'Create a Dorah account',
              },
            }),
          }}
        />
      </body>
    </html>
  );
}
