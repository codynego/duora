import RoomExperience from '@/components/RoomExperience';

export default function RoomPage({ params }: { params: { roomId: string } }) {
  const names: Record<string, string> = { 'common-ground': 'Common Ground', 'weekend-energy': 'Weekend Energy', 'quiet-company': 'Quiet Company', 'good-questions': 'Good Questions' };
  return <RoomExperience roomName={names[params.roomId] ?? 'Connection Room'} />;
}
