import DorahPublicShell from '@/components/dorah-market/DorahPublicShell';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <DorahPublicShell>{children}</DorahPublicShell>;
}
