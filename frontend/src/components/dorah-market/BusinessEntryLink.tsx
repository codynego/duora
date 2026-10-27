'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { usePublicAuth } from './PublicAuthContext';

export default function BusinessEntryLink({ className, label = 'Get started free' }: { className: string; label?: string }) {
  const { user } = usePublicAuth();
  return <Link href={user ? '/dashboard' : '/signup'} className={className}>{user ? 'My business' : label}<ArrowRight /></Link>;
}
