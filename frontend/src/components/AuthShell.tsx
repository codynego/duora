import Link from 'next/link';
import { ReactNode } from 'react';

export default function AuthShell({ title, description, children, footer }: { title: string; description: string; children: ReactNode; footer: ReactNode }) {
  return <main className="auth-page grid min-h-screen bg-[#F3F1EC] px-5 py-8 text-[#171622] sm:place-items-center"><div className="auth-glow auth-glow--one" /><div className="auth-glow auth-glow--two" /><section className="relative z-10 mx-auto w-full max-w-md"><Link href="/" className="font-serif text-3xl tracking-[-.075em]">Duorah<span className="text-[#9B84F7]">.</span></Link><div className="mt-10 rounded-[30px] border border-[#171622]/10 bg-[#FAF9F5]/90 p-6 shadow-[0_22px_60px_rgba(23,22,34,.09)] backdrop-blur sm:p-8"><p className="eyebrow"><span className="eyebrow-dot" />A private place to begin</p><h1 className="display-heading mt-5 text-4xl leading-[.98] tracking-[-.06em]">{title}</h1><p className="mt-4 text-sm leading-6 text-[#666372]">{description}</p>{children}</div><p className="mt-6 text-center text-sm text-[#666372]">{footer}</p></section></main>;
}
