import RoomExperience from '@/components/RoomExperience';
import { getRoom } from '@/lib/duora-api';

export default async function RoomPage({ params }: { params: { roomId: string } }) {
  const room = await getRoom(params.roomId);
  return <RoomExperience roomId={room?.id ?? ''} roomCode={params.roomId} roomName={room?.title ?? 'Connection Room'} mode={room?.mode ?? 'talk'} audience={room?.audience} experience={room?.experience} startsAt={room?.starts_at} durationMinutes={room?.duration_minutes} maxMembers={room?.max_members} roomStatus={room?.status} isDiscoveryRoom={room?.is_discovery_room} />;
}
