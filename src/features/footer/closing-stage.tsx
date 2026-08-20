import Link from 'next/link';

import { jurySeats, totalAwards, totalBodies } from '@/content/awards';
import { closingCopy, site } from '@/content/site';

import { FOOTER_PANEL_VIDEO } from './assets';
import { HandsScene } from './hands-scene';

const NAV = [
  { href: '/work', label: 'Work' },
  { href: '/services', label: 'Services' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const;

const year = new Date().getFullYear();

const STATS = [
  { value: String(totalAwards), label: 'Awards recorded', place: 'brands' },
  { value: String(totalBodies), label: 'Awarding bodies', place: 'awards' },
  { value: String(jurySeats), label: jurySeats === 1 ? 'Jury seat' : 'Jury seats', place: 'rating' },
] as const;

function Chevron() {
  return (
    <svg viewBox="0 0 24 24" className="size-[1.4375rem]" fill="none" aria-hidden>
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StatCard({
  value,
  label,
  place,
}: {
  value: string;
  label: string;
  place: (typeof STATS)[number]['place'];
}) {
  const pos =
    place === 'brands'
      ? 'max-lg:static lg:bottom-[11.875rem] lg:left-[calc(100%-10.5rem)]'
      : place === 'awards'
        ? 'max-lg:static lg:bottom-[0.625rem] lg:left-[calc(100%-21.25rem)]'
        : 'max-lg:static lg:bottom-[0.625rem] lg:left-[calc(100%-10.5rem)]';

  return (
    <div
      className={`flex h-[10.625rem] w-[9.875rem] flex-col justify-between rounded-[1rem] border border-paper/40 bg-ink/55 p-[1.25rem] text-paper backdrop-blur-overlay-glass max-lg:h-auto max-lg:min-h-[5.5rem] max-lg:w-auto max-lg:flex-1 max-lg:p-[0.75rem] lg:absolute lg:z-20 ${pos}`}
    >
      <p className="text-[3rem] leading-none max-lg:text-[1.5rem]">{value}</p>
      <p className="text-[1rem] leading-[1.2] max-lg:text-[0.75rem]">{label}</p>
    </div>
  );
}

/**
 * Light closing stage that replaces the dark text footer in the showreel final frame.
 * Copy is confirmed only. Stats are derived from `awards.ts`. No extra nav, no second preloader.
 */
export function ClosingStage({ active = true }: { active?: boolean }) {
  return (
    <footer className="relative flex h-full min-h-0 flex-col overflow-hidden bg-paper font-display text-ink">
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="relative flex min-h-0 flex-col items-center justify-center gap-[2rem] px-[1.25rem] py-[1.5rem] lg:px-[2.5rem]">
          <div className="flex w-full max-w-[37rem] flex-col items-center gap-[1rem]">
            <p className="flex items-center gap-[0.5rem] rounded-full border border-[color-mix(in_srgb,var(--ink)_10%,transparent)] px-[1.5rem] py-[0.5rem] text-[1rem] leading-[1.2]">
              <span
                aria-hidden
                className="size-[0.375rem] rounded-full border border-[color-mix(in_srgb,var(--ink)_40%,transparent)]"
              />
              {site.tagline}
            </p>
            <h2 className="w-full text-center text-[clamp(1.5rem,4.2vw,3.5rem)] leading-none text-balance">
              <span className="block font-light max-lg:whitespace-normal">
                {closingCopy[0]}
              </span>
              <span className="mt-[0.15em] block font-normal max-lg:whitespace-normal">
                {closingCopy[1]}
              </span>
            </h2>
          </div>
          <p className="w-full max-w-[30.375rem] text-center text-[1rem] leading-[1.2] text-pretty">
            {closingCopy[2]} {closingCopy[3]}
          </p>

          <div className="mt-auto flex w-full max-w-[42rem] flex-col items-stretch gap-[0.75rem] pt-[1rem] sm:flex-row sm:items-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-[1rem] rounded-full bg-heat py-[0.125rem] pr-[2rem] text-[1rem] leading-[1.2] text-paper transition-transform hover:-translate-y-[0.125rem] hover:scale-[1.035]"
            >
              <span className="grid size-[2.9375rem] place-items-center rounded-full bg-paper text-ink">
                <Chevron />
              </span>
              Start a Project
            </Link>
            <nav
              aria-label="Footer"
              className="flex h-[3.1875rem] min-w-0 flex-1 items-center justify-center gap-[0.75rem] overflow-hidden rounded-full border border-[color-mix(in_srgb,var(--ink)_10%,transparent)] px-[1rem]"
            >
              <ul className="flex flex-wrap items-center justify-center gap-x-[1.25rem] gap-y-[0.25rem] text-[0.875rem] leading-[1.2] text-ink">
                {NAV.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="hover:opacity-55">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <div className="relative mx-[0.75rem] mb-[0.75rem] aspect-[4/5] min-h-0 overflow-hidden rounded-[1.5rem] bg-[var(--ink)] max-lg:max-w-[34rem] max-lg:justify-self-center lg:m-[0.625rem] lg:aspect-auto lg:max-w-none">
          {active ? (
            <video
              className="absolute inset-0 z-0 size-full object-cover"
              src={FOOTER_PANEL_VIDEO}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden
            />
          ) : null}
          {active ? <HandsScene /> : null}
          <p className="absolute top-[1.875rem] left-[1.875rem] z-20 w-[min(14.3125rem,70%)] text-[1.125rem] leading-[1.2] text-paper uppercase max-lg:top-[1rem] max-lg:left-[1rem] max-lg:w-[min(18rem,80%)] max-lg:text-[0.8rem]">
            {site.tagline}
          </p>
          <div className="absolute right-[0.625rem] bottom-[0.625rem] left-[0.625rem] z-20 flex gap-[0.5rem] lg:static lg:contents">
            {STATS.map((stat) => (
              <StatCard key={stat.place} {...stat} />
            ))}
          </div>
        </div>
      </div>

      <div className="relative flex shrink-0 flex-col gap-[0.35rem] px-[1.25rem] py-[0.65rem] text-[0.75rem] tracking-[0.08em] text-ink/80 uppercase md:flex-row md:items-center md:justify-between">
        <span aria-hidden className="absolute top-0 left-0 h-px w-full bg-ink opacity-20" />
        <p>
          © {year} {site.name}
        </p>
        <div className="flex flex-wrap gap-x-[1.25rem] gap-y-[0.25rem] normal-case tracking-[0]">
          <a href={`mailto:${site.email}`}>{site.email}</a>
          <a href={`mailto:${site.careersEmail}`}>{site.careersEmail}</a>
        </div>
      </div>
    </footer>
  );
}
