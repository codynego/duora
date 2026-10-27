import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

const palette = { ink: '#102126', mint: '#C9E9DD', coral: '#FF6B4A', cream: '#F7F3EB', lime: '#A7D477' };

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const enter = (frame: number, start: number, duration = 22) => clamp((frame - start) / duration);

const Wordmark = ({inverse = false}: {inverse?: boolean}) => <div style={{display: 'flex', alignItems: 'center', gap: 16, fontSize: 27, fontWeight: 800, letterSpacing: '-1.4px', color: inverse ? '#fff' : palette.ink}}><span style={{display: 'grid', gridTemplateColumns: '12px 12px', gap: 3, transform: 'rotate(-8deg)'}}><i style={{width: 12, height: 25, borderRadius: 5, background: palette.mint, display: 'block'}} /><i style={{width: 12, height: 17, borderRadius: 5, background: palette.lime, display: 'block', marginTop: 8}} /></span>InvoiceFlow</div>;

const Browser = ({src, frame, start, scale = 1}: {src: string; frame: number; start: number; scale?: number}) => {
  const {fps} = useVideoConfig();
  const progress = spring({frame: Math.max(0, frame - start), fps, config: {damping: 18, stiffness: 120, mass: .8}});
  const y = interpolate(progress, [0, 1], [80, 0]);
  return <div style={{position: 'absolute', left: '50%', top: '50%', width: 1220, height: 790, borderRadius: 26, overflow: 'hidden', background: '#fff', boxShadow: '0 46px 100px rgba(16,33,38,.28)', transform: `translate(-50%, -50%) translateY(${y}px) scale(${scale * interpolate(progress, [0, 1], [.94, 1])})`}}><div style={{height: 44, background: '#F3F0E9', display: 'flex', alignItems: 'center', padding: '0 18px', gap: 8}}>{[0, 1, 2].map((dot) => <span key={dot} style={{width: 10, height: 10, borderRadius: 10, background: dot === 0 ? palette.coral : '#D8D4CB'}} />)}<div style={{height: 20, width: 380, borderRadius: 8, background: '#E6E2D9', marginLeft: 16}} /></div><Img src={staticFile(src)} style={{width: '100%', height: 'calc(100% - 44px)', objectFit: 'cover', objectPosition: 'top'}} /></div>;
};

const Caption = ({eyebrow, title, body, frame, start, align = 'left'}: {eyebrow: string; title: string; body: string; frame: number; start: number; align?: 'left' | 'center'}) => {
  const p = enter(frame, start);
  const x = interpolate(p, [0, 1], [align === 'center' ? 0 : -38, 0]);
  return <div style={{position: 'absolute', left: align === 'center' ? 0 : 122, right: align === 'center' ? 0 : undefined, bottom: align === 'center' ? 154 : 116, width: align === 'center' ? '100%' : 660, opacity: p, transform: `translateX(${x}px)`, textAlign: align}}><div style={{fontSize: 17, color: palette.coral, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase'}}>{eyebrow}</div><div style={{marginTop: 18, fontSize: 72, lineHeight: .93, letterSpacing: '-4px', fontWeight: 800, color: palette.ink, maxWidth: align === 'center' ? 1160 : undefined, marginInline: align === 'center' ? 'auto' : undefined}}>{title}</div><p style={{fontSize: 25, lineHeight: 1.35, color: '#405556', maxWidth: align === 'center' ? 700 : 580, margin: '24px auto 0', marginLeft: align === 'left' ? 0 : 'auto'}}>{body}</p></div>;
};

export const InvoiceFlowLaunch = () => {
  const frame = useCurrentFrame();
  const section = frame < 150 ? 0 : frame < 330 ? 1 : frame < 465 ? 2 : 3;
  const t = frame / 30;
  const float = Math.sin(t * 2) * 10;

  return <AbsoluteFill style={{background: palette.cream, fontFamily: 'Arial, sans-serif', overflow: 'hidden'}}>
    <div style={{position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 18% 18%, rgba(167,212,119,.42), transparent 23%), radial-gradient(circle at 88% 82%, rgba(255,107,74,.22), transparent 28%)'}} />
    <div style={{position: 'absolute', top: 54, left: 68, zIndex: 20}}><Wordmark /></div>
    <div style={{position: 'absolute', top: 58, right: 72, zIndex: 20, fontSize: 16, fontWeight: 700, color: '#637174', letterSpacing: 1}}>SMART INVOICE REMINDERS</div>

    {section === 0 && <>
      <Browser src="demo-assets/invoiceflow/invoice-list.png" frame={frame} start={0} scale={.76} />
      <div style={{position: 'absolute', right: 166, top: 216 + float, width: 190, padding: '18px 22px', background: palette.coral, color: '#fff', borderRadius: 16, boxShadow: '0 18px 40px rgba(255,107,74,.34)', transform: `rotate(${interpolate(enter(frame, 36), [0, 1], [9, 0])}deg)`, opacity: enter(frame, 36)}}><div style={{fontSize: 13, letterSpacing: 2, fontWeight: 800}}>PAST DUE</div><div style={{fontSize: 28, lineHeight: 1, fontWeight: 800, marginTop: 8}}>$18,420</div></div>
      <Caption frame={frame} start={10} eyebrow="The problem" title="Stop chasing invoices." body="Your cash flow should not depend on another follow-up email." />
    </>}

    {section === 1 && <>
      <Browser src="demo-assets/invoiceflow/automatic-reminders.png" frame={frame} start={150} scale={.84} />
      <div style={{position: 'absolute', left: 128, top: 228, display: 'flex', alignItems: 'center', gap: 16, background: palette.ink, color: '#fff', borderRadius: 99, padding: '16px 24px', opacity: enter(frame, 188), transform: `translateY(${interpolate(enter(frame, 188), [0,1], [24,0])}px)`}}><span style={{width: 15, height: 15, borderRadius: 20, background: palette.lime, boxShadow: `0 0 ${12 + Math.sin(frame / 5) * 4}px ${palette.lime}`}} /><span style={{fontWeight: 800, fontSize: 19}}>Automatic reminders: on</span></div>
      <Caption frame={frame} start={160} eyebrow="The product moment" title="The right nudge, on time." body="Set your schedule once. InvoiceFlow politely follows up before payments slip." />
    </>}

    {section === 2 && <>
      <Browser src="demo-assets/invoiceflow/payment-received.png" frame={frame} start={330} scale={.82} />
      {Array.from({length: 18}).map((_, index) => { const p = enter(frame, 356 + (index % 4) * 3, 34); const angle = (index / 18) * Math.PI * 2; return <i key={index} style={{position: 'absolute', left: 965 + Math.cos(angle) * p * 330, top: 420 + Math.sin(angle) * p * 260, width: index % 2 ? 12 : 7, height: index % 2 ? 28 : 18, background: index % 3 ? palette.lime : palette.coral, borderRadius: 4, opacity: 1 - p * .35, transform: `rotate(${index * 28 + p * 240}deg)`}} />;})}
      <Caption frame={frame} start={338} eyebrow="The payoff" title="Payments keep moving." body="Less admin. Fewer awkward chases. More time back for your team." />
    </>}

    {section === 3 && <div style={{position: 'absolute', inset: 0, background: palette.ink, color: '#fff', display: 'grid', placeItems: 'center', textAlign: 'center'}}><div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 38%, rgba(167,212,119,.35), transparent 34%)'}} /><div style={{position: 'relative'}}><Wordmark inverse /><div style={{fontSize: 88, lineHeight: .9, letterSpacing: '-5px', fontWeight: 800, marginTop: 52}}>Let invoices<br />take care of themselves.</div><div style={{margin: '38px auto 0', background: palette.coral, color: '#fff', display: 'inline-block', padding: '19px 30px', fontSize: 19, fontWeight: 800, borderRadius: 10}}>Try automatic reminders</div></div></div>}

    <div style={{position: 'absolute', height: 5, left: 0, bottom: 0, background: palette.coral, width: `${(frame / 540) * 100}%`}} />
  </AbsoluteFill>;
};
