export type RoomSummary = {
  id: string;
  code: string;
  slug: string;
  title: string;
  description: string;
  experience: string;
  tone: string;
  mode: 'talk' | 'play' | 'flirt' | 'create' | 'plan';
  audience: 'adults' | 'all';
  is_discovery_room: boolean;
  status: 'scheduled' | 'open' | 'active';
  max_members: number;
  members_count: number;
  duration_minutes: number;
  starts_at: string;
};

// Use the same API origin on the server and in the browser. The public
// variable is configured for the deployed frontend; using DUORA_API_URL here
// made room detail requests fall back to localhost and render an empty room.
const apiBaseUrl = process.env.NEXT_PUBLIC_DUORA_API_URL ?? 'http://127.0.0.1:8000';

export async function getDiscoverRooms(): Promise<RoomSummary[]> {
  try {
    const response = await fetch(`${apiBaseUrl}/api/v1/rooms/`, {
      // A newly published room redirects here immediately. Do not serve a
      // stale empty list from the server cache in that flow.
      cache: 'no-store',
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
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return null;
    return await response.json() as RoomSummary;
  } catch {
    return null;
  }
}
