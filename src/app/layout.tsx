import type { Metadata, Viewport } from 'next';
import { Geist_Mono, Jost, Onest, Outfit } from 'next/font/google';

import { AdaptiveGrid } from '@/components/common/grid';
import { ScrollProvider } from '@/motion/scroll-provider';
import {
  generateMetadata,
  generateViewport,
} from '@/utils/seo/generate-page-metadata';
import { getSiteStructuredData } from '@/utils/seo/structured-data';

import '@/styles/tokens.css';
import '@/app/globals.css';

const onest = Onest({
  variable: '--font-onest',
  subsets: ['latin'],
  display: 'swap',
});

const display = Outfit({
  variable: '--font-google-sans',
  subsets: ['latin'],
  display: 'swap',
});

const jost = Jost({
  variable: '--font-jost',
  subsets: ['latin'],
  display: 'swap',
});

/* Design.md §4's label/eyebrow/metadata face. It used to arrive with sixteen other families
   through a render-blocking `@import` off fonts.googleapis.com in globals.css — a third-party
   request the performance rules forbid, un-subset, for one face the design actually uses.
   Self-hosted here instead: same family and weights, so the render is unchanged. */
const mono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
});

export const metadata: Metadata = generateMetadata();
export const viewport: Viewport = generateViewport();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${onest.variable} ${display.variable} ${jost.variable} ${mono.variable}`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getSiteStructuredData()),
          }}
        />
        {/* `ReducedMotion` used to mount here. It exists only to flip react-spring's global
            `skipAnimation`, so importing it in the root layout put the entire spring runtime
            (~50KB gzipped) on every route — including three text pages that run no springs at
            all. It now mounts in `HomeView`, the only route that does.
            ⚠️ If another route ever introduces a spring, it must mount `<ReducedMotion />` too,
            or `prefers-reduced-motion` will be silently ignored there. */}
        <ScrollProvider>
          <AdaptiveGrid />
          {children}
        </ScrollProvider>
      </body>
    </html>
  );
}
