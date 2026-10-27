import { ArrowRight, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import DorahPublicShell from '@/components/dorah-market/DorahPublicShell';

export default function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <DorahPublicShell>
      <main className="relative isolate bg-[#F5F7FB] text-[#111B33]">
        <div className="absolute inset-y-0 right-0 -z-10 hidden w-[45%] bg-[#111B33] lg:block" />
        <div className="mx-auto grid min-h-[min(780px,calc(100svh-76px))] w-full max-w-[1180px] lg:grid-cols-[1fr_.96fr]">
          <section className="flex flex-col justify-center px-5 py-12 sm:px-10 lg:px-16 lg:py-16">
            <div className="mx-auto w-full max-w-md">
              <p className="text-[10px] font-black uppercase tracking-[.15em] text-[#3157F5]">
                Account access
              </p>
              <h1 className="mt-3 font-[Aptos_Display,Arial,sans-serif] text-[clamp(2.4rem,5vw,3.7rem)] font-black leading-[.96] tracking-[-.07em]">
                {title}
              </h1>
              <p className="mt-4 max-w-sm text-sm leading-6 text-[#64708A]">
                {description}
              </p>
              {children}
              <p className="mt-6 text-center text-sm text-[#64708A]">{footer}</p>
            </div>
            <p className="mx-auto mt-10 flex w-full max-w-md items-center gap-2 text-[11px] leading-5 text-[#758096]">
              <ShieldCheck className="h-4 w-4 shrink-0 text-[#3157F5]" />
              Your financial records stay in your hands.
            </p>
          </section>

          <aside className="relative hidden min-h-0 flex-col justify-between bg-[#111B33] px-8 py-8 text-white lg:flex xl:px-12 xl:py-10">
            <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#C9F45D]">
              Dorah / financial intelligence
            </p>
            <div className="relative max-w-lg py-7 xl:py-9">
              <span className="grid h-12 w-12 place-items-center rounded-xl border border-[#C9F45D]/35 text-[#C9F45D]">
                <ArrowRight className="h-5 w-5" />
              </span>
              <h2 className="mt-6 font-[Aptos_Display,Arial,sans-serif] text-[clamp(2rem,3.5vw,3.65rem)] font-black leading-[.94] tracking-[-.075em]">
                Know where your business money stands.
              </h2>
              <p className="mt-4 max-w-sm text-[13px] leading-6 text-white/65">
                Bring transactions, customer balances, and upcoming bills into one clear financial picture.
              </p>
              <div className="mt-6 grid grid-cols-3 border-y border-white/15 py-3 text-[10px] font-bold uppercase tracking-[.1em] text-white/55">
                <span>Cash</span>
                <span>Collections</span>
                <span>Obligations</span>
              </div>
            </div>
            <p className="text-[10px] text-white/40">Clear records. More confident decisions.</p>
          </aside>
        </div>
      </main>
    </DorahPublicShell>
  );
}
