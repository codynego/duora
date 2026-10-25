import { getAccessToken } from '@/lib/auth';

const api = process.env.NEXT_PUBLIC_DUORA_API_URL ?? 'http://127.0.0.1:8000';

export type StudioProject = { id: string; title: string; summary: string; status: string; aspect_ratio: string; storyboard: unknown[]; asset_count: number; video_url: string | null };

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
export function listStudioProjects() { return studioRequest('projects/') as Promise<StudioProject[]>; }
export function getStudioProject(projectId: string) { return studioRequest(`projects/${projectId}/`) as Promise<StudioProject>; }
export function listStudioAssets() { return studioRequest('assets/') as Promise<{ id: string; kind: string; url: string; created_at: string }[]>; }
export function getBrandKit() { return studioRequest('brand-kit/') as Promise<{ name: string; website: string; primary_color: string; accent_color: string; default_cta: string }>; }
export function saveBrandKit(input: Record<string, string>) { return studioRequest('brand-kit/', { method: 'PUT', body: JSON.stringify(input) }); }

export function uploadStudioAsset(projectId: string, file: File) {
  const form = new FormData(); form.append('project_id', projectId); form.append('file', file);
  return studioRequest('assets/', { method: 'POST', body: form });
}

export function generateStoryboard(projectId: string) { return studioRequest(`projects/${projectId}/storyboard/`, { method: 'POST' }) as Promise<StudioProject>; }
export function queueRender(projectId: string) { return studioRequest(`projects/${projectId}/render/`, { method: 'POST' }) as Promise<{ job: { id: string; status: string }; project: StudioProject }>; }

export async function downloadStudioVideo(projectId: string, filename: string) {
  const token = await getAccessToken();
  if (!token) throw new Error('Sign in to download this video.');
  const response = await fetch(`${api}/api/v1/studio/projects/${projectId}/download/`, { credentials: 'include' });
  if (!response.ok) throw new Error('The rendered video is not available yet.');
  const url = URL.createObjectURL(await response.blob());
  const link = document.createElement('a'); link.href = url; link.download = `${filename || 'launch'}.mp4`; link.click();
  URL.revokeObjectURL(url);
}
