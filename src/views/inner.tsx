import type { ReactNode } from 'react';

import { SiteFooter } from '@/components/common/site-footer';
import { SiteHeader } from '@/components/common/hero-overlay';

export function InnerPage({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <main className="relative min-h-svh bg-overlay-solid text-overlay-ink">
      <SiteHeader />
      <div className="px-[1.25rem] pb-[4rem] pt-[6rem] md:px-[1.875rem] md:pt-[7rem]">
        <h1 className="font-display text-[2.5rem] font-extralight leading-[1.1] md:text-[4rem]">
          {title}
        </h1>
        <div className="mt-[2rem] max-w-[40rem] font-display text-[1rem] font-light leading-[1.4]">
          {children}
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
