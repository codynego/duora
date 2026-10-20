import type { Metadata, Viewport } from 'next';
import './globals.css';
import PwaRuntime from '@/components/PwaRuntime';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://duorah.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Duorah — Make Every Connection More Interesting',
  description: 'A mobile-first relationship entertainment platform. Play interactive romance games, send private links to crushes, and turn chemistry into banter.',
  applicationName: 'Duorah',
  icons: { icon: '/icon.svg', apple: '/icon-192.svg' },
  appleWebApp: {
    capable: true,
    title: 'Duorah',
    statusBarStyle: 'black-translucent',
  },
  openGraph: {
    title: 'Duorah — Make Every Connection More Interesting',
    description: 'More ways to flirt, discover each other, and create meaningful connection.',
    type: 'website',
    siteName: 'Duorah',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Duorah — Make Every Connection More Interesting',
    description: 'Shared experiences that turn chemistry into conversation.',
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
    <html lang="en">
      <body className="min-h-screen bg-white text-dark-950 antialiased">
        {children}
        <PwaRuntime />
      </body>
    </html>
  );
}
