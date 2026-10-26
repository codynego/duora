import type { Metadata, Viewport } from 'next';
import './globals.css';
import PwaRuntime from '@/components/PwaRuntime';
import PwaStartup from '@/components/PwaStartup';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://duorah.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Dorah — Pay for the seat, not the whole plan',
    template: '%s · Dorah',
  },
  description: 'Find eligible seats for digital tools, share the cost, and manage every subscription in one place.',
  applicationName: 'Dorah',
  keywords: ['subscription sharing', 'subscription management', 'digital subscriptions', 'subscription marketplace', 'Dorah'],
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
    title: 'Dorah — Pay for the seat, not the whole plan',
    description: 'Affordable access to digital tools, with clear payments and simple renewals.',
    type: 'website',
    siteName: 'Dorah',
    locale: 'en_NG',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Dorah — Pay for the seat, not the whole plan.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dorah — Pay for the seat, not the whole plan',
    description: 'Affordable digital access, organized.',
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
              description: 'Find eligible seats for digital tools, share the cost, and manage every subscription in one place.',
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
