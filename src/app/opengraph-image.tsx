import { ImageResponse } from 'next/og';

import { siteConfig } from '@/lib/site';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = `${siteConfig.name} — ${siteConfig.description}`;

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 44,
          background: '#000000',
          color: '#ffffff',
        }}
      >
        <div style={{ display: 'flex', fontSize: 56, letterSpacing: 8, textTransform: 'uppercase' }}>
          {siteConfig.name}
        </div>
        <div style={{ display: 'flex', width: 360, height: 1, background: 'rgba(255,255,255,0.4)' }} />
        <div
          style={{
            display: 'flex',
            maxWidth: 780,
            textAlign: 'center',
            fontSize: 22,
            letterSpacing: 1,
            color: 'rgba(255,255,255,0.8)',
          }}
        >
          {siteConfig.description}
        </div>
      </div>
    ),
    { ...size },
  );
}
