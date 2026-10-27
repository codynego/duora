import { ImageResponse } from 'next/og';

export const alt = 'Dorah — Know where your business money stands.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ height: '100%', width: '100%', display: 'flex', position: 'relative', overflow: 'hidden', background: '#111B33', color: '#ffffff', padding: '76px' }}>
        <div style={{ position: 'absolute', right: '-82px', top: '-126px', width: '520px', height: '520px', borderRadius: '50%', border: '88px solid #3157F5', opacity: 0.95 }} />
        <div style={{ position: 'absolute', right: '138px', bottom: '-190px', width: '500px', height: '500px', borderRadius: '50%', border: '76px solid #C9F45D', opacity: 0.9 }} />
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '680px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: 28, fontWeight: 700, letterSpacing: 3 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 52, borderRadius: 16, background: '#3157F5', color: '#FFFFFF', fontSize: 34, fontWeight: 800 }}>D</div>
            DORAH
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 68, lineHeight: 1.03, fontWeight: 800, letterSpacing: -3 }}>Know where your business money stands.</div>
            <div style={{ marginTop: 30, fontSize: 27, lineHeight: 1.35, color: '#c8d1ea' }}>An AI-powered financial controller for clearer business decisions.</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 22, color: '#C9F45D' }}><span style={{ width: 10, height: 10, borderRadius: 10, background: '#C9F45D' }} /> See what came in. Know what needs attention.</div>
        </div>
      </div>
    ),
    size,
  );
}
