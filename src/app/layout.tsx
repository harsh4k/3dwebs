import type { Metadata, Viewport } from 'next';
import { Jost, Onest, Outfit } from 'next/font/google';

import { AdaptiveGrid } from '@/components/common/grid';
import { ReducedMotion } from '@/components/common/reduced-motion';
import { ScrollProvider } from '@/motion/scroll-provider';
import {
  generateMetadata,
  generateViewport,
} from '@/utils/seo/generate-page-metadata';
import { getSiteStructuredData } from '@/utils/seo/structured-data';

import '@/styles/tokens.css';
import '@/styles/motion.css';
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

export const metadata: Metadata = generateMetadata();
export const viewport: Viewport = generateViewport();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${onest.variable} ${display.variable} ${jost.variable}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getSiteStructuredData()),
          }}
        />
        <ScrollProvider>
          <AdaptiveGrid />
          <ReducedMotion />
          {children}
        </ScrollProvider>
      </body>
    </html>
  );
}
