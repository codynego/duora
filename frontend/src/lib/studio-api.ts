import { getAccessToken } from '@/lib/auth';

const api = process.env.NEXT_PUBLIC_DUORA_API_URL ?? 'http://127.0.0.1:8000';

export type StudioProject = { id: string; title: string; summary: string; status: string; aspect_ratio: string; storyboard: unknown[]; asset_count: number };

async function studioRequest(path: string, init: RequestInit = {}) {
  const token = await getAccessToken();
  if (!token) throw new Error('Sign in to use the studio.');
  const response = await fetch(`${api}/api/v1/studio/${path}`, { ...init, credentials: 'include', headers: { ...(init.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...(init.headers ?? {}) } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.detail ?? 'Something went wrong.');
  return body.data;
}

export function createStudioProject(input: { title: string; summary: string; aspect_ratio?: string }) {
  return studioRequest('projects/', { method: 'POST', body: JSON.stringify({ ...input, aspect_ratio: input.aspect_ratio ?? '16:9' }) }) as Promise<StudioProject>;
}

export function uploadStudioAsset(projectId: string, file: File) {
  const form = new FormData(); form.append('project_id', projectId); form.append('file', file);
  return studioRequest('assets/', { method: 'POST', body: form });
}

export function generateStoryboard(projectId: string) { return studioRequest(`projects/${projectId}/storyboard/`, { method: 'POST' }) as Promise<StudioProject>; }
export function queueRender(projectId: string) { return studioRequest(`projects/${projectId}/render/`, { method: 'POST' }); }
