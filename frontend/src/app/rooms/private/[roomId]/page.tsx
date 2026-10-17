import RoomExperience from '@/components/RoomExperience';

export default function PrivateRoomPage({ params }: { params: { roomId: string } }) {
  return <RoomExperience roomId={params.roomId} roomCode="" roomName="Private room" alreadyJoined />;
}
