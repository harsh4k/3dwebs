import Link from 'next/link';

import { positioning, site } from '@/content/site';

import { FooterReveal } from './footer-reveal';

/** Every page on the site. There are five; a multi-column sitemap would be a lie
 *  about the size of the IA, so they run as one deliberate column. */
const NAV = [
  { href: '/', label: 'home' },
  { href: '/work', label: 'work' },
  { href: '/services', label: 'services' },
  { href: '/about', label: 'about' },
  { href: '/contact', label: 'contact' },
] as const;

/**
 * The two confirmed contact routes — the whole of Coffee Digital's contactable
 * surface. There is no phone number, no postal address and no social handle in
 * any source (brand-audit → Missing; TBD N1–N3), so the reference footer's
 * address tile, phone tile and icon row have no counterpart here and do not
 * render. `primary` marks the mailbox that carries the single `--heat` rule.
 */
const CONTACT = [
  { label: 'General enquiries', email: site.email, primary: true },
  { label: 'Careers', email: site.careersEmail, primary: false },
] as const;

const year = new Date().getFullYear();

/**
 * ⚠️ Why this file writes `px` in three places — touch targets, rule weights,
 * and the lower bound of every type `clamp()`.
 *
 * `globals.css` derives the root font-size from the viewport, and **each
 * breakpoint restarts the ramp**, so a rem value does not descend monotonically
 * with the viewport — it sawtooths. The root falls to ~10px at 641px and again
 * to ~11.4px at 1025px. That makes rem unusable for any quantity with a real
 * floor:
 *
 * - `min-h-11` (2.75rem) resolves to ~28px on exactly the tablet widths most
 *   likely to be touched, where WCAG wants 44 CSS px.
 * - `text-[0.95rem]` renders 13.5px on a 1280px laptop and 11.4px at 768px,
 *   under Design.md §4's "never below `--fs-small`" floor of 14px.
 *
 * So every content string below is `clamp(<px floor>, <fluid ideal>, <px cap>)`.
 * The type still scales; it just stops scaling *through* the floor.
 */
const TOUCH_TARGET = 'min-h-[44px]';

/** Design.md §3 rule 3 — focus rings are `--ink`. The offset clears the rule
 *  under each address so the two never touch. */
const FOCUS_RING =
  'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink';

/** Design.md §4 — `--fs-label`: Geist Mono, uppercase, 0.08em tracking. */
const LABEL =
  'font-mono text-[clamp(12px,0.75rem,13px)] uppercase tracking-[0.08em]';

/**
 * One contact route, built as **the CTA primitive** (Design.md §7): a mono
 * label, the address, a rule beneath, and a trailing arrow that translates 4px
 * on hover. Not a filled box, and not an icon in a bordered square — that shape
 * was a ninth primitive duplicating this one, and the chevron inside it was
 * borrowed Originkit marketing-kit art. Both are gone, and the arrow is a
 * literal glyph, so the footer now carries no borrowed asset at all.
 *
 * These are the largest thing on the surface after the wordmark, because
 * `specs/footer.md` calls Zone 3 the primary CTA and the page list the
 * secondary — the type ladder has to agree with that or the spec is decoration.
 *
 * The rule is **persistent, not hover-revealed**. `--heat` measures 3.28:1 on
 * `--peach`, which clears the 3:1 UI-boundary threshold and fails the 4.5:1
 * body threshold, so it can be the rule and never the label; and a rule that
 * existed only on hover would not exist on touch at all. At address scale it
 * runs 3px against the careers route's 1px `--ink-faint` (3.98:1), so primary
 * and secondary are separated by weight as well as by colour.
 */
function ContactCta({
  label,
  email,
  primary,
}: {
  label: string;
  email: string;
  primary: boolean;
}) {
  return (
    <a
      href={`mailto:${email}`}
      className={`group block ${TOUCH_TARGET} ${FOCUS_RING}`}
    >
      <span className={`block text-ink-muted ${LABEL}`}>{label}</span>

      <span className="relative mt-[0.5rem] inline-flex items-baseline gap-[0.4em] font-hero text-[clamp(20px,2.6vw,36px)] font-medium leading-[1.15] text-ink">
        {email}
        <span
          aria-hidden
          className="inline-block transition-transform duration-300 group-hover:translate-x-[4px] motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
        >
          →
        </span>
        <span
          aria-hidden
          className={`absolute -bottom-[0.25em] left-0 w-full ${
            primary ? 'h-[3px] bg-heat' : 'h-px bg-ink-faint'
          }`}
        />
      </span>
    </a>
  );
}

/**
 * End-of-page close. Four zones — brand, pages, contact, legal — over the
 * `--peach` ground.
 *
 * The composition follows a supplied marketing-footer reference (brand column +
 * blurb on the left, links to the right, a contact band, a bottom bar). What it
 * does **not** follow is the reference's content: that footer carries a street
 * address, a phone number, four social icons and a row of legal pages. None of
 * those exist for Coffee Digital and none may be invented (Rule 0), so those
 * zones are absent rather than filled — see the comment on `CONTACT`. Every
 * string here comes from `content/site.ts`: the tagline and both mailboxes are
 * confirmed from the legacy site, and the paragraph is deck slide 2 verbatim.
 *
 * **The stripe device is gone** (brain.md D16). It carried 186 bands of the dead
 * brown trio — `#3E210F`–`#472D1D`, none of them in the locked palette — so
 * every place it appeared re-introduced the one set of colours the brand lock
 * exists to keep out. Nothing replaces it: the masthead row and the contact band
 * are separated by whitespace and by the type ladder, and the document ends on
 * flat `--peach` rather than on a band. Zones 1–2 and 3 are far enough apart
 * vertically that a rule between them was never load-bearing.
 *
 * The wordmark is Jost 500 (`font-hero`), the display face Design.md §4 assigns
 * *because* the real logotype is Futura-consistent. It is set at column scale,
 * not viewport scale, so the whole footer closes in roughly one screen.
 *
 * `--heat` appears exactly once, as the rule under `info@` (see `ContactCta`).
 * The legal divider uses `--overlay-line` — an 18% `--ink` mix — because
 * `--hairline` is a paper-ground token and effectively invisible on `--peach`.
 *
 * Server Component: `year` is evaluated at build, and `FooterReveal` is the
 * only client boundary. With JS disabled or before hydration the reveal renders
 * its children plainly, so this markup is complete either way.
 */
export function SiteFooter() {
  return (
    <footer className="relative bg-peach font-display text-ink">
      <div className="px-[1.25rem] pt-[clamp(3.5rem,8vw,6rem)] pb-[clamp(2.5rem,6vw,4rem)] md:px-[4rem] lg:px-[5rem]">
        <div className="grid grid-cols-1 gap-y-[2.5rem] md:grid-cols-12 md:gap-x-[2rem]">
          <FooterReveal delayIn={80} className="md:col-span-7 lg:col-span-6">
            <p className="font-hero text-[clamp(36px,5vw,60px)] font-medium lowercase leading-[0.95] tracking-[-0.01em]">
              {site.name.toLowerCase()}
            </p>
            <p className="mt-[0.9rem] text-[clamp(14px,0.95rem,17px)] font-medium text-ink-muted">
              {site.tagline}
            </p>
            <p className="mt-[1.5rem] max-w-[42ch] text-[clamp(14px,0.95rem,17px)] font-medium leading-[1.6] text-ink-muted text-pretty">
              {positioning}
            </p>
          </FooterReveal>

          {/* Right-aligned from `md` up so the list hangs off the same axis as
              the domain in the legal row, giving the masthead two poles instead
              of one anchored column and one floating one. */}
          <FooterReveal
            delayIn={160}
            className="md:col-span-4 md:col-start-9 lg:col-span-3 lg:col-start-10"
          >
            <nav aria-label="Footer" className="md:text-right">
              <ul className="flex flex-col">
                {NAV.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`inline-flex ${TOUCH_TARGET} items-center py-[0.75rem] text-[clamp(15px,1rem,18px)] font-medium lowercase leading-[1.2] text-ink transition-opacity duration-300 hover:opacity-60 motion-reduce:transition-none ${FOCUS_RING}`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </FooterReveal>
        </div>
      </div>

      <div className="px-[1.25rem] pt-[clamp(2.5rem,6vw,4rem)] pb-[clamp(1.25rem,3vw,2rem)] md:px-[4rem] lg:px-[5rem]">
        <FooterReveal delayIn={320}>
          <div className="grid grid-cols-1 gap-y-[2.25rem] md:grid-cols-2 md:gap-x-[2rem]">
            {CONTACT.map((route) => (
              <ContactCta key={route.email} {...route} />
            ))}
          </div>
        </FooterReveal>

        <FooterReveal delayIn={400}>
          <div
            className={`mt-[clamp(2.5rem,6vw,3.5rem)] flex flex-col gap-[0.65rem] border-t border-overlay-line pt-[1.1rem] text-ink-muted md:flex-row md:items-center md:justify-between ${LABEL}`}
          >
            <p>
              © {year} {site.name}
            </p>
            <p className="normal-case tracking-[0]">{site.domain}</p>
          </div>
        </FooterReveal>
      </div>
    </footer>
  );
}
