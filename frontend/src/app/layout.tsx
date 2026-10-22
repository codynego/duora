import type { Metadata, Viewport } from 'next';
import './globals.css';
import PwaRuntime from '@/components/PwaRuntime';
import PwaStartup from '@/components/PwaStartup';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://duorah.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Duorah — Meet through minds. Connect by choice.',
    template: '%s · Duorah',
  },
  description: 'Discover anonymous thoughts, join meaningful conversations, and connect with people through what they think.',
  applicationName: 'Duorah',
  keywords: ['anonymous social discovery', 'meaningful conversations', 'anonymous questions', 'thoughts and connections', 'Duorah'],
  authors: [{ name: 'Duorah' }],
  creator: 'Duorah',
  publisher: 'Duorah',
  category: 'social networking',
  alternates: { canonical: '/' },
  icons: { icon: '/icon.svg', apple: '/icon-192.svg' },
  appleWebApp: {
    capable: true,
    title: 'Duorah',
    statusBarStyle: 'black-translucent',
  },
  openGraph: {
    url: '/',
    title: 'Duorah — Meet through minds. Connect by choice.',
    description: 'Discover anonymous thoughts, join meaningful conversations, and connect with people through what they think.',
    type: 'website',
    siteName: 'Duorah',
    locale: 'en_NG',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Duorah — Meet through minds. Connect by choice.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Duorah — Meet through minds. Connect by choice.',
    description: 'Discover anonymous thoughts and find meaningful conversations.',
    images: ['/opengraph-image'],
  },
};

export const viewport: Viewport = {
  themeColor: '#7454A6',
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
              name: 'Duorah',
              url: siteUrl,
              description: 'Discover anonymous thoughts, join meaningful conversations, and connect with people through what they think.',
              inLanguage: 'en-NG',
              potentialAction: {
                '@type': 'RegisterAction',
                target: `${siteUrl}/signup`,
                name: 'Join Duorah',
              },
            }),
          }}
        />
      </body>
    </html>
  );
}
