import { ImageResponse } from 'next/og';

export const alt = 'Dorah — Meet through minds. Connect by choice.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ height: '100%', width: '100%', display: 'flex', position: 'relative', overflow: 'hidden', background: '#281D32', color: '#fffdfc', padding: '76px' }}>
        <div style={{ position: 'absolute', right: '-82px', top: '-126px', width: '520px', height: '520px', borderRadius: '50%', border: '88px solid #7454A6', opacity: 0.95 }} />
        <div style={{ position: 'absolute', right: '138px', bottom: '-190px', width: '500px', height: '500px', borderRadius: '50%', border: '76px solid #d7953d', opacity: 0.9 }} />
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '680px', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: 28, fontWeight: 700, letterSpacing: 3 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 52, borderRadius: 16, background: '#7454A6', color: '#FFFDFC', fontSize: 34, fontWeight: 800 }}>D</div>
            DORAH
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 68, lineHeight: 1.03, fontWeight: 800, letterSpacing: -3 }}>Meet through minds. Connect by choice.</div>
            <div style={{ marginTop: 30, fontSize: 27, lineHeight: 1.35, color: '#eadfea' }}>Discover anonymous thoughts and the people behind the conversations.</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 22, color: '#c9b9e2' }}><span style={{ width: 10, height: 10, borderRadius: 10, background: '#7454A6' }} /> Start with a thought worth sharing</div>
        </div>
      </div>
    ),
    size,
  );
}
