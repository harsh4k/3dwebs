import Link from 'next/link';

import { closingCopy, site } from '@/content/site';

const NAV = [
  { href: '/work', label: 'work' },
  { href: '/services', label: 'services' },
  { href: '/about', label: 'about' },
  { href: '/contact', label: 'contact' },
] as const;

const year = new Date().getFullYear();

/** End-of-page close. Confirmed copy only — no address, no invented socials. */
export function SiteFooter() {
  const hair = 'bg-ink';
  const mute = 'text-ink/80';

  return (
    <footer className="relative flex h-full min-h-0 flex-col bg-heat px-[1.25rem] pt-[3.5rem] pb-[1.25rem] font-display text-ink md:px-[4rem] md:pt-[5rem] md:pb-[1.75rem] lg:px-[5rem]">
      <div className="flex items-start justify-between gap-[1.5rem]">
        <p className="max-w-[16ch] text-[clamp(2rem,4.2vw,3.75rem)] font-bold uppercase leading-[0.9] tracking-[-0.02em] text-balance">
          <span className="block">{closingCopy[0]}</span>
          <span className="block">{closingCopy[1]}</span>
        </p>
        <a
          href="#top"
          className="grid size-[2.5rem] shrink-0 place-items-center bg-ink text-paper md:size-[2.75rem]"
          aria-label="Back to top"
        >
          <span aria-hidden className="text-[1.125rem] leading-none">
            ↑
          </span>
        </a>
      </div>

      <div className="mt-[clamp(2.5rem,6vh,5rem)] grid grid-cols-1 gap-x-[2rem] gap-y-[1.75rem] md:grid-cols-12">
        <div className="md:col-span-3">
          <p className="text-[0.75rem] font-bold uppercase tracking-[0.08em]">{site.name}</p>
          <p className={`mt-[1.1rem] max-w-[28ch] text-[0.75rem] font-medium uppercase leading-[1.55] tracking-[0.08em] ${mute}`}>
            {closingCopy[2]} {closingCopy[3]}
          </p>
          <a
            href={`mailto:${site.email}`}
            className="mt-[0.85rem] inline-block text-[0.75rem] font-medium uppercase tracking-[0.08em]"
          >
            {site.email}
          </a>
        </div>

        <nav aria-label="Footer" className="md:col-span-5 lg:col-span-6">
          <p className="text-[0.75rem] font-bold uppercase tracking-[0.08em]">Navigation</p>
          <ul className="mt-[1.1rem] grid grid-cols-2 gap-x-[1.75rem] gap-y-[0.45rem] text-[0.75rem] font-medium uppercase tracking-[0.08em] sm:grid-cols-4">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-4 md:justify-self-end lg:col-span-3">
          <p className="text-[0.75rem] font-bold uppercase tracking-[0.08em]">Careers</p>
          <div className="mt-[1.1rem] grid grid-cols-1 gap-x-[1.75rem] gap-y-[0.45rem] text-[0.75rem] font-medium uppercase tracking-[0.08em] sm:grid-cols-2">
            <a href={`mailto:${site.careersEmail}`}>{site.careersEmail}</a>
            <a href={`mailto:${site.email}`}>start a project</a>
          </div>
        </div>
      </div>

      <p className="mt-auto pt-[clamp(2rem,5vh,4rem)] text-[clamp(2.75rem,11.5vw,9rem)] font-extrabold lowercase leading-[0.8] tracking-[-0.04em]">
        coffee digital
      </p>

      <div
        className={`relative mt-[1rem] flex flex-col gap-[0.65rem] pt-[0.85rem] text-[0.75rem] font-medium uppercase tracking-[0.08em] md:flex-row md:items-center md:justify-between ${mute}`}
      >
        <span aria-hidden className={`absolute top-0 left-0 h-px w-full ${hair} opacity-40`} />
        <span aria-hidden className={`absolute top-0 left-0 h-[0.7rem] w-px ${hair} opacity-40`} />
        <span aria-hidden className={`absolute top-0 right-0 h-[0.7rem] w-px ${hair} opacity-40`} />
        <p>
          © {year} {site.name}
        </p>
        <p className="normal-case tracking-[0]">{site.tagline}</p>
      </div>
    </footer>
  );
}
