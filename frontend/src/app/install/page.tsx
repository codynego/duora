import type { Metadata } from 'next';
import InstallDorah from '@/components/InstallDorah';

export const metadata: Metadata = {
  title: 'Install Dorah',
  description: 'Install Dorah on your phone or desktop for one-tap access to your business financial workspace.',
};

export default function InstallPage() {
  return <InstallDorah />;
}
