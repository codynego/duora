import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Duora — Make Every Connection More Interesting',
  description: 'A mobile-first relationship entertainment platform. Play interactive romance games, send private links to crushes, and turn chemistry into banter.',
  openGraph: {
    title: 'Duora — Make Every Connection More Interesting',
    description: 'More ways to flirt, discover each other, and create meaningful connection.',
    type: 'website',
  },
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
      </body>
    </html>
  );
}
