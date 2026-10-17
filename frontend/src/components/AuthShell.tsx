import Link from 'next/link';
import { ReactNode } from 'react';

export default function AuthShell({ title, description, children, footer }: { title: string; description: string; children: ReactNode; footer: ReactNode }) {
  return <main className="grid min-h-screen bg-[#fffdfc] px-5 py-8 text-dark-950 sm:place-items-center"><section className="mx-auto w-full max-w-md"><Link href="/" className="text-2xl font-bold tracking-[-.065em]">duora<span className="text-spark-coral">.</span></Link><div className="mt-12 rounded-[30px] border border-dark-950/10 bg-white p-6 shadow-[0_16px_48px_rgba(40,29,50,.07)] sm:p-8"><p className="section-label">Your space</p><h1 className="mt-3 text-3xl font-bold tracking-[-.055em]">{title}</h1><p className="mt-3 text-sm leading-6 text-[#6F6470]">{description}</p>{children}</div><p className="mt-6 text-center text-sm text-[#6F6470]">{footer}</p></section></main>;
}
