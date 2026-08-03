import { ImageResponse } from 'next/og';
import { loadOgFonts } from '@/lib/og-font';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'LetsVibeCodeit.com - Which subscriptions are one prompt away from free';

export default async function Image() {
  const fonts = await loadOgFonts();
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: '#0b0d0b',
          color: '#f2f5f2',
          fontFamily: fonts.length ? 'Space Grotesk' : 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 52,
              height: 52,
              borderRadius: 14,
              border: '2px solid #33e667',
              background: '#1a2a1f',
              color: '#33e667',
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            &lt;/&gt;
          </div>
          <div style={{ display: 'flex', fontSize: 40, fontWeight: 700, letterSpacing: -1 }}>
            <span>Lets</span>
            <span style={{ color: '#33e667' }}>VibeCode</span>
            <span>it.com</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', fontSize: 88, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}>
            Which subscriptions are one prompt away from free
          </div>
          <div style={{ display: 'flex', fontSize: 32, color: '#9aa79c' }}>
            948 SaaS apps. Honest verdicts. Real trade-offs.
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', fontSize: 26, color: '#33e667', fontFamily: fonts.length ? 'Space Grotesk' : 'sans-serif' }}>
            letsvibecodeit.com
          </div>
          <div
            style={{
              display: 'flex',
              padding: '12px 24px',
              borderRadius: 999,
              background: '#33e667',
              color: '#0b0d0b',
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            vibecode it
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
