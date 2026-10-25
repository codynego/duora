'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import {
  ArrowLeft, ArrowRight, Check, ChevronRight, CircleHelp, Clapperboard, FolderKanban,
  ImagePlus, Library, Menu, MoreHorizontal, Palette, Play, Plus, Settings2, Sparkles,
  Upload, X,
} from 'lucide-react';

type View = 'projects' | 'brand' | 'assets';
type Project = { id: number; title: string; summary: string; status: 'Draft' | 'Ready'; format: string; scenes: number; accent: string };

const starterProjects: Project[] = [
  { id: 1, title: 'Automatic reminders', summary: 'A feature launch for teams that want invoices followed up automatically.', status: 'Ready', format: '16:9 + 9:16', scenes: 5, accent: '#FF6B4A' },
  { id: 2, title: 'Quarterly planning', summary: 'A product story about turning a plan into a visible weekly rhythm.', status: 'Draft', format: '16:9', scenes: 4, accent: '#7EE7DD' },
];

const nav = [
  { id: 'projects' as const, label: 'Projects', icon: FolderKanban },
  { id: 'brand' as const, label: 'Brand kit', icon: Palette },
  { id: 'assets' as const, label: 'Assets', icon: Library },
];

export default function DashboardPage() {
  const [view, setView] = useState<View>('projects');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [newLaunchOpen, setNewLaunchOpen] = useState(false);
  const [projects, setProjects] = useState(starterProjects);
  const [notice, setNotice] = useState('');

  function createProject(project: Omit<Project, 'id'>) {
    setProjects((current) => [{ ...project, id: Date.now() }, ...current]);
    setNewLaunchOpen(false);
    setView('projects');
    setNotice('Draft created. Your storyboard is ready to shape.');
  }

  return (
    <div className="motion-dashboard min-h-screen bg-[#F8F5EE] text-[#102126]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[252px] flex-col border-r border-[#102126] bg-[#102126] p-4 text-[#F8F5EE] md:flex">
        <DashboardBrand />
        <button type="button" onClick={() => setNewLaunchOpen(true)} className="dashboard-new-button mt-10"><Plus className="h-4 w-4" /> New launch</button>
        <nav className="mt-7 space-y-1" aria-label="Dashboard navigation">
          {nav.map(({ id, label, icon: Icon }) => <button type="button" key={id} onClick={() => setView(id)} className={`dashboard-nav-item ${view === id ? 'dashboard-nav-item--active' : ''}`}><Icon className="h-[18px] w-[18px]" />{label}</button>)}
        </nav>
        <div className="mt-auto border-t border-white/15 pt-4">
          <Link href="/" className="dashboard-nav-item"><ArrowLeft className="h-[18px] w-[18px]" /> Back to site</Link>
          <button type="button" onClick={() => setNotice('Help is on the way. We will add guided support here next.')} className="dashboard-nav-item"><CircleHelp className="h-[18px] w-[18px]" /> Help</button>
          <button type="button" onClick={() => setNotice('Settings will be available once accounts are connected.')} className="dashboard-nav-item"><Settings2 className="h-[18px] w-[18px]" /> Settings</button>
          <div className="mt-5 flex items-center gap-3 px-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#FF6B4A] text-xs font-black text-[#102126]">S</span><span className="min-w-0"><span className="block truncate text-sm font-bold">Shina’s studio</span><span className="block text-xs text-white/55">Free workspace</span></span></div>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-[#102126] bg-[#F8F5EE]/95 px-5 backdrop-blur md:hidden">
        <DashboardBrand compact />
        <div className="flex gap-2"><button type="button" onClick={() => setNewLaunchOpen(true)} className="grid h-10 w-10 place-items-center bg-[#102126] text-[#F8F5EE]" aria-label="Create new launch"><Plus className="h-5 w-5" /></button><button type="button" onClick={() => setMobileOpen(true)} className="grid h-10 w-10 place-items-center border border-[#102126]" aria-label="Open navigation"><Menu className="h-5 w-5" /></button></div>
      </header>

      {mobileOpen && <div className="fixed inset-0 z-50 bg-[#102126] p-5 text-[#F8F5EE] md:hidden"><div className="flex items-center justify-between"><DashboardBrand compact /><button type="button" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X /></button></div><button type="button" onClick={() => { setNewLaunchOpen(true); setMobileOpen(false); }} className="dashboard-new-button mt-10"><Plus className="h-4 w-4" /> New launch</button><nav className="mt-7 space-y-1">{nav.map(({ id, label, icon: Icon }) => <button type="button" key={id} onClick={() => { setView(id); setMobileOpen(false); }} className={`dashboard-nav-item ${view === id ? 'dashboard-nav-item--active' : ''}`}><Icon className="h-[18px] w-[18px]" />{label}</button>)}</nav></div>}

      <main className="min-h-screen md:ml-[252px]">
        <div className="mx-auto max-w-7xl px-5 pb-16 pt-8 sm:px-8 sm:pt-12">
          {notice && <div className="mb-7 flex items-center justify-between border border-[#102126] bg-[#7EE7DD] px-4 py-3 text-sm font-semibold"><span className="flex items-center gap-2"><Check className="h-4 w-4" />{notice}</span><button type="button" onClick={() => setNotice('')} aria-label="Dismiss message"><X className="h-4 w-4" /></button></div>}
          {view === 'projects' && <ProjectsView projects={projects} onNew={() => setNewLaunchOpen(true)} onNotice={setNotice} />}
          {view === 'brand' && <BrandKitView onNotice={setNotice} />}
          {view === 'assets' && <AssetsView onNotice={setNotice} />}
        </div>
      </main>
      {newLaunchOpen && <NewLaunch onClose={() => setNewLaunchOpen(false)} onCreate={createProject} />}
    </div>
  );
}

function DashboardBrand({ compact = false }: { compact?: boolean }) {
  return <Link href="/" className="motion-brand inline-block">Dorah<span>.</span>{!compact && <span className="ml-2 align-middle font-mono text-[9px] font-bold uppercase tracking-[.18em] text-white/45">Studio</span>}</Link>;
}

function ProjectsView({ projects, onNew, onNotice }: { projects: Project[]; onNew: () => void; onNotice: (message: string) => void }) {
  return <>
    <header className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><p className="motion-kicker"><span />Your release desk</p><h1 className="motion-display mt-4 text-5xl leading-[.9] tracking-[-.07em] sm:text-7xl">Projects</h1><p className="mt-4 max-w-xl text-base leading-7 text-[#52615F]">Make the work visible. Every project holds the cuts, screens, and story behind one launch.</p></div><button type="button" onClick={onNew} className="motion-button motion-button--primary"><Plus className="h-4 w-4" /> New launch</button></header>
    <section className="mt-10 grid gap-5 lg:grid-cols-[1.3fr_.7fr]">
      <div className="grid gap-4 sm:grid-cols-2">{projects.map((project) => <ProjectCard key={project.id} project={project} onNotice={onNotice} />)}</div>
      <aside className="dashboard-slate p-6 text-[#F8F5EE] sm:p-7"><p className="font-mono text-[10px] font-bold uppercase tracking-[.16em] text-[#7EE7DD]">Your next move</p><h2 className="motion-display mt-6 text-3xl leading-[.92] tracking-[-.055em]">Turn your next release into something people can see.</h2><p className="mt-4 text-sm leading-6 text-white/60">Start with the feature, the screens, and the one thing the audience should remember.</p><button type="button" onClick={onNew} className="mt-8 inline-flex items-center gap-2 border border-[#7EE7DD] px-4 py-3 text-sm font-bold text-[#7EE7DD] transition hover:bg-[#7EE7DD] hover:text-[#102126]">Start a launch <ArrowRight className="h-4 w-4" /></button><div className="mt-10 border-t border-white/15 pt-4 text-xs text-white/50"><span className="text-[#FF6B4A]">●</span> Your first draft takes about 3 minutes</div></aside>
    </section>
  </>;
}

function ProjectCard({ project, onNotice }: { project: Project; onNotice: (message: string) => void }) {
  return <article className="group overflow-hidden border border-[#102126] bg-white"><div className="relative min-h-[205px] p-5" style={{ backgroundColor: project.accent }}><span className="font-mono text-[10px] font-bold uppercase tracking-[.14em]">Launch / {String(project.id).padStart(2, '0')}</span><h2 className="motion-display mt-7 max-w-[210px] text-3xl leading-[.88] tracking-[-.06em]">{project.title}</h2><div className="absolute bottom-0 right-0 w-[58%] border-l border-t border-[#102126] bg-[#F8F5EE] p-3"><div className="h-2 w-14 bg-[#102126]" /><div className="mt-2 h-1.5 w-full bg-[#102126]/25" /><div className="mt-1 h-1.5 w-3/4 bg-[#102126]/25" /></div></div><div className="p-5"><div className="flex items-center justify-between"><span className={`text-[10px] font-bold uppercase tracking-[.13em] ${project.status === 'Ready' ? 'text-[#09897F]' : 'text-[#D45235]'}`}>{project.status === 'Ready' ? '● Ready to export' : '● Draft in progress'}</span><button type="button" onClick={() => onNotice(`${project.title} options are ready for the next editing pass.`)} aria-label={`More options for ${project.title}`}><MoreHorizontal className="h-5 w-5" /></button></div><p className="mt-4 min-h-[42px] text-sm leading-5 text-[#52615F]">{project.summary}</p><div className="mt-5 flex items-center justify-between border-t border-[#102126]/15 pt-4 text-xs font-semibold text-[#52615F]"><span>{project.scenes} scenes · {project.format}</span><Link href={`/dashboard/projects/${project.id}`} className="inline-flex items-center gap-1 text-[#102126] hover:text-[#FF6B4A]">Edit <ChevronRight className="h-4 w-4" /></Link></div></div></article>;
}

function BrandKitView({ onNotice }: { onNotice: (message: string) => void }) {
  return <><header><p className="motion-kicker"><span />The parts that make it yours</p><h1 className="motion-display mt-4 text-5xl leading-[.9] tracking-[-.07em] sm:text-7xl">Brand kit</h1><p className="mt-4 max-w-xl text-base leading-7 text-[#52615F]">Set the visual rules once. Every release starts recognizably yours.</p></header><section className="mt-10 grid gap-4 lg:grid-cols-[.78fr_1.22fr]"><div className="border border-[#102126] bg-[#FF6B4A] p-7"><p className="font-mono text-[10px] font-bold uppercase tracking-[.14em]">Your mark</p><div className="mt-16 flex h-20 w-20 items-center justify-center bg-[#102126] text-3xl font-black text-[#F8F5EE]">I</div><p className="mt-5 text-xl font-bold tracking-[-.04em]">InvoiceFlow</p><button type="button" onClick={() => onNotice('Logo upload will connect when file storage is configured.')} className="mt-5 inline-flex items-center gap-2 border border-[#102126] px-4 py-2.5 text-sm font-bold"><Upload className="h-4 w-4" /> Replace logo</button></div><div className="border border-[#102126] bg-white p-6 sm:p-8"><div className="flex items-center justify-between"><h2 className="text-xl font-bold tracking-[-.04em]">Visual rules</h2><button type="button" onClick={() => onNotice('Brand changes saved for this browser session.')} className="text-sm font-bold text-[#D45235]">Save changes</button></div><div className="mt-8 grid gap-7 sm:grid-cols-2"><label className="text-sm font-bold">Primary color<input defaultValue="#102126" className="dashboard-field mt-2" /></label><label className="text-sm font-bold">Accent color<input defaultValue="#FF6B4A" className="dashboard-field mt-2" /></label><label className="text-sm font-bold">Website<input defaultValue="invoiceflow.com" className="dashboard-field mt-2" /></label><label className="text-sm font-bold">Default CTA<input defaultValue="Try InvoiceFlow free" className="dashboard-field mt-2" /></label></div></div></section></>;
}

function AssetsView({ onNotice }: { onNotice: (message: string) => void }) {
  return <><header><p className="motion-kicker"><span />The raw material</p><h1 className="motion-display mt-4 text-5xl leading-[.9] tracking-[-.07em] sm:text-7xl">Assets</h1><p className="mt-4 max-w-xl text-base leading-7 text-[#52615F]">Keep your product screens, logo variants, and recordings ready for the next release.</p></header><section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><button type="button" onClick={() => onNotice('Asset uploading will connect when project storage is configured.')} className="flex min-h-[210px] flex-col items-center justify-center border border-dashed border-[#102126]/50 bg-white p-6 text-center hover:border-[#102126]"><ImagePlus className="h-7 w-7 text-[#FF6B4A]" /><span className="mt-4 text-sm font-bold">Add product screens</span><span className="mt-2 text-xs leading-5 text-[#52615F]">PNG, JPG, or a short screen recording</span></button>{['Reminder list · PNG', 'Overdue invoice · PNG', 'Payments overview · PNG'].map((asset, index) => <article key={asset} className="border border-[#102126] bg-white p-4"><div className={`flex min-h-[135px] items-end border border-[#102126]/15 p-3 ${index === 1 ? 'bg-[#FF6B4A]' : index === 2 ? 'bg-[#7EE7DD]' : 'bg-[#E6DFD0]'}`}><div className="w-full bg-[#F8F5EE] p-2"><div className="h-1.5 w-1/2 bg-[#102126]" /><div className="mt-2 h-1 w-full bg-[#102126]/20" /><div className="mt-1 h-1 w-4/5 bg-[#102126]/20" /></div></div><p className="mt-4 text-sm font-bold">{asset}</p><p className="mt-1 text-xs text-[#52615F]">Used in Automatic reminders</p></article>)}</section></>;
}

function NewLaunch({ onClose, onCreate }: { onClose: () => void; onCreate: (project: Omit<Project, 'id'>) => void }) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [files, setFiles] = useState<string[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);
  const canContinue = step === 1 ? Boolean(title.trim() && summary.trim()) : files.length > 0;
  function selectFiles(list: FileList | null) { setFiles(Array.from(list ?? []).map((file) => file.name)); }
  function finish() { onCreate({ title: title.trim(), summary: summary.trim(), status: 'Draft', format: '16:9', scenes: Math.max(3, files.length + 1), accent: '#E6DFD0' }); }
  return <div className="fixed inset-0 z-[70] flex items-end bg-[#102126]/55 p-0 sm:items-center sm:justify-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="new-launch-title"><section className="w-full max-w-3xl bg-[#F8F5EE] shadow-[12px_12px_0_#FF6B4A]"><header className="flex items-center justify-between border-b border-[#102126] p-5 sm:px-7"><div><p className="font-mono text-[10px] font-bold uppercase tracking-[.14em] text-[#D45235]">New launch</p><h2 id="new-launch-title" className="motion-display mt-1 text-2xl tracking-[-.05em]">Build the first cut</h2></div><button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center border border-[#102126]" aria-label="Close new launch"><X className="h-5 w-5" /></button></header><div className="p-5 sm:p-7"><ol className="grid grid-cols-3 border border-[#102126] text-[10px] font-bold uppercase tracking-[.12em]"><li className={`p-3 ${step >= 1 ? 'bg-[#102126] text-[#F8F5EE]' : ''}`}>01 · Feature</li><li className={`border-l border-[#102126] p-3 ${step >= 2 ? 'bg-[#102126] text-[#F8F5EE]' : ''}`}>02 · Screens</li><li className={`border-l border-[#102126] p-3 ${step >= 3 ? 'bg-[#102126] text-[#F8F5EE]' : ''}`}>03 · Review</li></ol>{step === 1 && <div className="mt-8"><h3 className="text-2xl font-bold tracking-[-.045em]">What just shipped?</h3><p className="mt-2 text-sm leading-6 text-[#52615F]">Name the release, then tell us the one thing people should understand.</p><label className="mt-7 block text-sm font-bold">Feature name<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Automatic invoice reminders" className="dashboard-field mt-2" autoFocus /></label><label className="mt-5 block text-sm font-bold">Release summary<textarea value={summary} onChange={(event) => setSummary(event.target.value)} placeholder="What changed, who is it for, and why does it matter?" className="dashboard-field mt-2 min-h-28 resize-y" /></label></div>}{step === 2 && <div className="mt-8"><h3 className="text-2xl font-bold tracking-[-.045em]">Show the product.</h3><p className="mt-2 text-sm leading-6 text-[#52615F]">Add the screens in the order you want people to see them. Three to five works best.</p><input ref={fileInput} type="file" multiple accept="image/png,image/jpeg,image/webp,video/mp4" className="hidden" onChange={(event) => selectFiles(event.target.files)} /><button type="button" onClick={() => fileInput.current?.click()} className="mt-7 flex min-h-36 w-full flex-col items-center justify-center border border-dashed border-[#102126]/50 bg-white p-5 text-center hover:border-[#102126]"><Upload className="h-6 w-6 text-[#FF6B4A]" /><span className="mt-3 text-sm font-bold">Choose screenshots or a recording</span><span className="mt-1 text-xs text-[#52615F]">PNG, JPG, WebP, or MP4</span></button>{files.length > 0 && <ul className="mt-4 divide-y divide-[#102126]/10 border border-[#102126]/15 bg-white">{files.map((file) => <li key={file} className="flex items-center justify-between px-4 py-3 text-sm"><span className="flex items-center gap-2 truncate"><ImagePlus className="h-4 w-4 shrink-0 text-[#D45235]" />{file}</span><Check className="h-4 w-4 shrink-0 text-[#09897F]" /></li>)}</ul>}</div>}{step === 3 && <div className="mt-8"><h3 className="text-2xl font-bold tracking-[-.045em]">A clear first cut.</h3><p className="mt-2 text-sm leading-6 text-[#52615F]">We’ll open with the problem, move into your product moment, then close with the benefit.</p><div className="mt-7 border border-[#102126] bg-[#102126] p-5 text-[#F8F5EE]"><div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[.14em] text-[#7EE7DD]"><span>Storyboard preview</span><span>{files.length + 1} scenes</span></div><h4 className="motion-display mt-8 text-3xl leading-[.9] tracking-[-.06em]">{title}</h4><p className="mt-4 max-w-lg text-sm leading-6 text-white/65">{summary}</p><div className="mt-7 flex gap-1">{Array.from({ length: Math.max(3, files.length + 1) }).map((_, index) => <span key={index} className={`h-1 flex-1 ${index === 0 ? 'bg-[#FF6B4A]' : 'bg-white/25'}`} />)}</div></div></div>}<div className="mt-8 flex items-center justify-between border-t border-[#102126]/15 pt-5"><button type="button" onClick={() => step === 1 ? onClose() : setStep((current) => current - 1)} className="inline-flex items-center gap-2 text-sm font-bold text-[#52615F]"><ArrowLeft className="h-4 w-4" />{step === 1 ? 'Cancel' : 'Back'}</button>{step < 3 ? <button type="button" disabled={!canContinue} onClick={() => setStep((current) => current + 1)} className="motion-button motion-button--primary disabled:cursor-not-allowed disabled:opacity-35">Continue <ArrowRight className="h-4 w-4" /></button> : <button type="button" onClick={finish} className="motion-button motion-button--primary"><Sparkles className="h-4 w-4" /> Create draft</button>}</div></div></section></div>;
}
