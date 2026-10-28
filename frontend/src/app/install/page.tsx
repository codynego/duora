import type { Metadata } from 'next';
import InstallDorah from '@/components/InstallDorah';
import { publicPageMetadata } from '@/lib/seo';

export const metadata: Metadata = publicPageMetadata({ title: 'Install the Dorah App', description: 'Install Dorah as a progressive web app on your phone or desktop for quick access to your small-business financial workspace.', path: '/install', keywords: ['install Dorah app', 'small business finance PWA'] });

export default function InstallPage() {
  return <InstallDorah />;
}
