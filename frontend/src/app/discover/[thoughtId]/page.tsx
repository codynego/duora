import { redirect } from 'next/navigation';

export default async function LegacyThoughtRoute({ params }: { params: Promise<{ thoughtId: string }> }) {
  const { thoughtId } = await params;
  redirect(`/explore/${thoughtId}`);
}
