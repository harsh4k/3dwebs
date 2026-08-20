import { ImageResponse } from 'next/og';

import { siteConfig } from '@/config/seo';

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
          background: '#fffaf3',
          color: '#3f2210',
        }}
      >
        <div style={{ display: 'flex', fontSize: 56, letterSpacing: 8, textTransform: 'uppercase' }}>
          {siteConfig.name}
        </div>
        <div style={{ display: 'flex', width: 360, height: 1, background: '#9f8576' }} />
        <div
          style={{
            display: 'flex',
            maxWidth: 780,
            textAlign: 'center',
            fontSize: 22,
            letterSpacing: 1,
            color: '#6b4a33',
          }}
        >
          {siteConfig.description}
        </div>
      </div>
    ),
    { ...size },
  );
}
