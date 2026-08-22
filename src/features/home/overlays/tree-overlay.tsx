import Link from 'next/link';

import { RevealItem, RevealText } from '@/components/common/reveal';
import { closingCopy, site } from '@/content/site';

export const TreeOverlay = () => {
  return (
    <div className="pointer-events-none absolute inset-0 select-none font-display text-overlay-ink">
      <div className="absolute left-1/2 top-[4.75rem] -translate-x-1/2 md:top-[6.0625rem]">
        <RevealText
          tag="h2"
          variant="heading"
          act="tree"
          className="max-w-[min(90vw,22em)] text-center text-[1.5rem] font-extralight leading-[1.1] md:text-[3rem]"
        >
          {closingCopy[0]}
        </RevealText>
      </div>

      <div className="absolute inset-x-[1.25rem] top-[8.5rem] text-center md:inset-x-auto md:left-[1.875rem] md:top-[calc(50%-1.125rem)] md:w-[20rem] md:max-w-[24vw] md:text-left">
        <RevealText
          tag="p"
          variant="copy"
          act="tree"
          delayIn={160}
          className="justify-center text-[0.8125rem] font-light leading-[1.15] md:justify-start md:text-[1rem] md:leading-[1.1]"
        >
          {closingCopy[1]}
        </RevealText>
      </div>
      <div className="absolute right-[1.875rem] top-[calc(50%-1.125rem)] hidden w-[20rem] max-w-[24vw] text-right md:block">
        <RevealText
          tag="p"
          variant="copy"
          act="tree"
          delayIn={240}
          className="justify-end text-[1rem] font-light leading-[1.1]"
        >
          {closingCopy[2]} {closingCopy[3]}
        </RevealText>
      </div>

      <RevealItem
        act="tree"
        delay={340}
        className="pointer-events-auto absolute inset-x-[1.25rem] bottom-[1.25rem] flex flex-col gap-[0.5rem] border border-overlay-edge bg-overlay-glass p-[0.75rem] backdrop-blur-overlay-form md:inset-x-auto md:bottom-[2.5rem] md:left-1/2 md:w-auto md:-translate-x-1/2 md:flex-row md:items-center md:gap-[2.6875rem] md:p-0 md:py-[0.25rem] md:pl-[2rem] md:pr-[0.25rem]"
      >
        <Link
          href="/work"
          className="text-[0.875rem] font-light leading-[1.1] text-overlay-ink underline decoration-from-font underline-offset-4 transition-opacity hover:opacity-70 md:text-[1rem]"
        >
          see the work
        </Link>
        <a
          href={`mailto:${site.email}`}
          className="flex w-full items-center justify-center whitespace-nowrap bg-ink px-[1rem] py-[0.75rem] text-[0.875rem] leading-[1.2] text-paper transition-opacity hover:opacity-90 md:w-auto md:px-[2.9375rem] md:text-[1rem]"
        >
          start a project
        </a>
      </RevealItem>
    </div>
  );
};
