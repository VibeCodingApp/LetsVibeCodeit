import { ImageResponse } from 'next/og';
import { getAppBySlug } from '@/lib/apps';
import { loadOgFonts } from '@/lib/og-font';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'LetsVibeCodeit.com - Can I vibecode this app?';

export default async function Image({ params }: { params: { slug: string } }) {
  const app = getAppBySlug(params.slug);
  const fonts = await loadOgFonts();
  const family = fonts.length ? 'Space Grotesk' : 'sans-serif';
  const price = app ? (app.priceMonthly === null ? 'price varies' : app.priceMonthly === 0 ? 'free' : `$${app.priceMonthly}/mo`) : '';
  const label = app
    ? app.verdict === 'yes'
      ? 'YES - build it'
      : app.verdict === 'kinda'
        ? 'KINDA - buildable, with trade-offs'
        : 'NOT REALLY - keep paying'
    : '';

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
          fontFamily: family,
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
          <div style={{ display: 'flex', fontSize: 34, fontWeight: 700, letterSpacing: -1 }}>
            <span>Lets</span>
            <span style={{ color: '#33e667' }}>VibeCode</span>
            <span>it.com</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div style={{ display: 'flex', fontSize: 96, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}>
            Can I vibecode {app?.name ?? params.slug}?
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 34, color: '#9aa79c' }}>
            <span>{app ? app.category : ''}</span>
            {price && <span style={{ color: '#f2f5f2' }}>{price}</span>}
            <span
              style={{
                display: 'flex',
                padding: '10px 20px',
                borderRadius: 999,
                background: '#33e667',
                color: '#0b0d0b',
                fontWeight: 700,
                fontSize: 26,
              }}
            >
              {label}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: 24, color: '#9aa79c' }}>
          {app?.verdictSummary ? app.verdictSummary.slice(0, 120) : 'One prompt away from free.'}
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
