'use client';

import type { Project } from '@/content/schema';
import { SiteFooter } from '@/features/footer/site-footer';
import { SiteHeader } from '@/features/navigation/site-header';

import { WorkGrid } from './work-grid';

export const WorkView = ({
  projects,
  total,
}: {
  projects: readonly Project[];
  total: number;
}) => {
  return (
    <main className="relative min-h-svh bg-paper text-ink">
      <SiteHeader />
      <div className="px-[1.25rem] pb-[4rem] pt-[6rem] md:px-[1.875rem] md:pt-[7rem]">
        <h1 className="font-display text-[2.5rem] font-extralight leading-[1.1] md:text-[4rem]">
          Work
        </h1>
        <p className="mt-[1rem] max-w-[36rem] font-display text-[1rem] font-light leading-[1.4]">
          {total} projects in the record. {projects.length} here, confirmed.
        </p>
        <WorkGrid projects={projects} />
      </div>
      <SiteFooter />
    </main>
  );
};
