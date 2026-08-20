'use client';

import { useState } from 'react';

import type { Project } from '@/content/schema';

import { CaseModal } from './case-modal';
import { useCaseQuery } from './use-case-query';

export const WorkGrid = ({ projects }: { projects: readonly Project[] }) => {
  const { project, open, close } = useCaseQuery();
  const [trigger, setTrigger] = useState<HTMLElement | null>(null);

  return (
    <>
      <ul className="mt-[2.5rem] grid grid-cols-1 gap-[1.25rem] md:grid-cols-2 md:gap-x-[1.5rem] md:gap-y-[3rem]">
        {projects.map((item, index) => (
          <li key={item.slug} className={index % 2 === 1 ? 'md:mt-[3.5rem]' : undefined}>
            <a
              href={`/work?case=${item.slug}`}
              className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
              onClick={(event) => {
                event.preventDefault();
                setTrigger(event.currentTarget);
                open(item.slug);
              }}
            >
              <span className="relative block aspect-[4/3] overflow-hidden bg-cream">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.images[0]?.src}
                  alt={item.images[0]?.alt ?? ''}
                  className="size-full object-cover object-[center_20%] transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
              </span>
              <span className="relative mt-[0.75rem] block text-[0.75rem] uppercase tracking-[0.08em] text-ink">
                {item.client}
              </span>
              <span className="mt-[0.25rem] block font-display text-[1.25rem] font-extralight leading-[1.15] text-ink md:text-[1.5rem]">
                {item.title}
              </span>
              <span className="mt-[0.35rem] block text-[0.8125rem] text-ink-muted">
                {item.deliverables.join(' · ')}
              </span>
            </a>
          </li>
        ))}
      </ul>
      <CaseModal project={project} onClose={close} returnFocus={trigger} />
    </>
  );
};
