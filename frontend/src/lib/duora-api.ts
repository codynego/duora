export type RoomSummary = {
  id: string;
  code: string;
  slug: string;
  title: string;
  description: string;
  tone: string;
  status: 'scheduled' | 'open' | 'active';
  max_members: number;
  members_count: number;
  duration_minutes: number;
  starts_at: string;
};

const apiBaseUrl = process.env.DUORA_API_URL ?? 'http://127.0.0.1:8000';

export async function getDiscoverRooms(): Promise<RoomSummary[]> {
  try {
    const response = await fetch(`${apiBaseUrl}/api/v1/rooms/`, {
      next: { revalidate: 30 },
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return [];
    const body: unknown = await response.json();
    return Array.isArray(body) ? body as RoomSummary[] : [];
  } catch {
    return [];
  }
}

export async function getRoom(code: string): Promise<RoomSummary | null> {
  try {
    const response = await fetch(`${apiBaseUrl}/api/v1/rooms/${encodeURIComponent(code)}/`, {
      next: { revalidate: 30 },
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return null;
    return await response.json() as RoomSummary;
  } catch {
    return null;
  }
}
