import type { Metadata, Viewport } from 'next';
import './globals.css';
import PwaRuntime from '@/components/PwaRuntime';
import PwaStartup from '@/components/PwaStartup';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://duorah.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Duora — Meet through minds. Connect by choice.',
  description: 'Discover real people through the things they think, the answers they give, and the conversations they start.',
  applicationName: 'Duora',
  icons: { icon: '/icon.svg', apple: '/icon-192.svg' },
  appleWebApp: {
    capable: true,
    title: 'Duora',
    statusBarStyle: 'black-translucent',
  },
  openGraph: {
    title: 'Duora — Meet through minds. Connect by choice.',
    description: 'Discover real people through thoughts, questions, and conversations.',
    type: 'website',
    siteName: 'Duora',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Duora — Meet through minds. Connect by choice.',
    description: 'Your next meaningful conversation could start with a single thought.',
  },
};

export const viewport: Viewport = {
  themeColor: '#281D32',
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
      </body>
    </html>
  );
}
