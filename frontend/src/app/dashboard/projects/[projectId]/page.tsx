'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Clapperboard, Download, Play, Sparkles } from 'lucide-react';
import StudioShell from '@/components/studio/StudioShell';
import { downloadStudioVideo, getStudioProject, queueRender, type StudioProject } from '@/lib/studio-api';

type Scene = { type?: string; duration?: number; text?: string };

function projectScenes(project: StudioProject | null): Scene[] {
  if (!project) return [];
  return project.storyboard.filter((scene): scene is Scene => typeof scene === 'object' && scene !== null);
}

export default function ProjectEditorPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<StudioProject | null>(null);
  const [active, setActive] = useState(0);
  const [error, setError] = useState('');
  const [queueing, setQueueing] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    void getStudioProject(projectId)
      .then(setProject)
      .catch((reason) => setError(reason instanceof Error ? reason.message : 'Could not load this project.'));
  }, [projectId]);

  async function render() {
    if (!project) return;
    try {
      setQueueing(true);
      setError('');
      const result = await queueRender(project.id);
      setProject(result.project);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not queue the render.');
    } finally {
      setQueueing(false);
    }
  }

  async function download() {
    if (!project) return;
    try {
      setDownloading(true);
      setError('');
      await downloadStudioVideo(project.id, project.title);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not download the video.');
    } finally {
      setDownloading(false);
    }
  }

  const scenes = projectScenes(project);
  const scene = scenes[active] ?? { type: 'Opening', duration: 0, text: 'Generate a storyboard to begin.' };

  return <StudioShell>
    <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div>
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-[#52615F]"><ArrowLeft className="h-4 w-4" />Projects</Link>
        <p className="motion-kicker mt-7"><span />{project?.status ?? 'Loading'} · {scenes.length} scenes · {project?.aspect_ratio ?? '—'}</p>
        <h1 className="motion-display mt-4 text-5xl leading-[.9] tracking-[-.07em] sm:text-7xl">{project?.title ?? 'Loading project'}</h1>
      </div>
      {project?.status === 'ready' ? <button type="button" disabled={downloading} onClick={() => void download()} className="motion-button motion-button--primary disabled:cursor-not-allowed disabled:opacity-55"><Download className="h-4 w-4" />{downloading ? 'Preparing download…' : 'Download MP4'}</button> : <button type="button" disabled={!project || queueing || project.status === 'rendering'} onClick={() => void render()} className="motion-button motion-button--primary disabled:cursor-not-allowed disabled:opacity-55"><Clapperboard className="h-4 w-4" />{project?.status === 'rendering' ? 'Rendering…' : queueing ? 'Rendering…' : 'Render video'}</button>}
    </header>

    {error && <p className="mt-8 border border-[#D45235] bg-[#FFF0EC] p-4 text-sm font-semibold text-[#922A12]">{error}</p>}
    {project?.status === 'ready' && <p className="mt-8 border border-[#102126] bg-[#7EE7DD] px-4 py-3 text-sm font-bold">Your MP4 is ready. Download the finished launch cut.</p>}

    <section className="mt-10 grid gap-5 xl:grid-cols-[210px_minmax(0,1fr)_280px]">
      <aside className="border border-[#102126] bg-white p-3">
        <p className="px-2 pb-3 font-mono text-[10px] font-bold uppercase tracking-[.14em] text-[#52615F]">Storyboard</p>
        {scenes.length ? scenes.map((item, index) => <button type="button" key={`${item.type}-${index}`} onClick={() => setActive(index)} className={`mb-2 w-full border p-3 text-left ${active === index ? 'border-[#102126] bg-[#FF6B4A]' : 'border-[#102126]/15 bg-[#F8F5EE]'}`}><span className="font-mono text-[10px] font-bold">{String(index + 1).padStart(2, '0')}</span><span className="mt-3 block text-sm font-bold">{item.type ?? 'Scene'}</span><span className="mt-1 block line-clamp-2 text-xs leading-5 text-[#52615F]">{item.text ?? ''}</span></button>) : <p className="p-3 text-sm leading-6 text-[#656b74]">This launch has no storyboard yet.</p>}
      </aside>

      <div className="border border-[#102126] bg-[#102126] p-3 shadow-[8px_8px_0_#FF6B4A]">
        <div className="flex items-center justify-between border-b border-white/15 px-1 pb-3 text-[10px] font-bold uppercase tracking-[.14em] text-white/55"><span>Storyboard preview</span><span>{scene.duration ?? 0}s</span></div>
        <div className="relative mt-3 flex min-h-[420px] items-end overflow-hidden bg-[#E6DFD0] p-6 sm:p-9"><div className="absolute left-0 top-0 h-4 w-24 bg-[#FF6B4A]" /><div><p className="font-mono text-[10px] font-bold uppercase tracking-[.14em] text-[#52615F]">Scene {String(active + 1).padStart(2, '0')} · {scene.type ?? 'Scene'}</p><h2 className="motion-display mt-5 max-w-lg text-5xl leading-[.87] tracking-[-.07em] sm:text-6xl">{scene.text}</h2></div><div className="absolute bottom-0 right-0 w-[54%] border-l border-t border-[#102126] bg-[#F8F5EE] p-4"><div className="h-2 w-16 bg-[#102126]" /><div className="mt-3 h-1.5 w-full bg-[#102126]/20" /><div className="mt-1.5 h-1.5 w-4/5 bg-[#102126]/20" /></div></div>
        <div className="flex items-center gap-3 pt-3 text-white"><Play className="h-4 w-4 fill-current text-[#7EE7DD]" /><div className="h-1 flex-1 bg-white/15"><div className="h-full w-[38%] bg-[#FF6B4A]" /></div><span className="font-mono text-[10px] text-white/60">Storyboard</span></div>
      </div>

      <aside className="border border-[#102126] bg-white p-5"><p className="font-mono text-[10px] font-bold uppercase tracking-[.14em] text-[#D45235]">Scene details</p><h2 className="mt-4 text-xl font-bold tracking-[-.04em]">{scene.type ?? 'Scene'}</h2><p className="mt-6 text-sm font-bold">On-screen copy</p><p className="mt-2 min-h-28 border border-[#102126]/20 bg-[#F8F5EE] p-3 text-sm leading-6 text-[#52615F]">{scene.text}</p><p className="mt-5 text-sm leading-6 text-[#656b74]">Storyboard editing arrives with the next studio API. This preview reflects the generated project storyboard.</p><div className="mt-6 flex items-center gap-2 text-sm font-bold text-[#D75A3D]"><Sparkles className="h-4 w-4" />AI-generated scene</div></aside>
    </section>
  </StudioShell>;
}
