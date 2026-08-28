"use client";

import Link from "next/link";

import { HoverBlur } from "@/components/common/hover-blur";
import { RevealScope, RevealText } from "@/components/common/reveal";
import { WordShiftButton } from "@/components/common/word-shift";
import { positioning, site } from "@/content/site";

import "./footer.css";

import { restPath } from "./line-field";
import { useFooterStrings } from "./use-strings";

/**
 * The home page's closing footer — a field of hairlines that ring when you run the cursor across
 * them, over a slow WebGL smoke.
 *
 * **This footer is scoped to `/`.** `features/footer/site-footer.tsx` still closes `/work` and
 * every page rendered through `page-shell`. That split is deliberate: the four text routes sit at
 * 183.7KB against a 195KB ceiling, and putting WebGL on them to close a page of headings and a
 * list would be the same trade that put the spring runtime on four routes for one fade (brain
 * D20). Home already carries three.js, so here it is marginal. See brain D21.
 *
 * **Purpose statement** (animation rule: no purpose, no ship). The page ends on a surface that
 * answers the reader rather than one that merely stops. Everything above the footer is scrubbed to
 * scroll — the reader drives it, but only forwards, and only at the rate the page allows. The
 * field is the one thing on the site that responds to *where they are* rather than *how far they
 * have come, which is why it belongs at the end: it is the first moment the page is not a
 * sequence. It carries no content, so a reader who never touches it loses nothing.
 *
 * **There is no sound.** No `AudioContext` is constructed anywhere in this directory.
 *
 * **Every string on screen comes from `content/site.ts`.** There is no phone number, no address
 * and no social row, because none exists in any source — they are `undefined` in the schema on
 * purpose (Rule 0; TBD N1–N3), and a footer that invented them would be inventing the most
 * checkable facts on the site.
 */

const NAV = [
  { href: "/", label: "home" },
  { href: "/work", label: "work" },
  { href: "/services", label: "services" },
  { href: "/about", label: "about" },
  { href: "/contact", label: "contact" },
] as const;

/** Design.md §4 — Geist Mono, uppercase, 0.08em tracking. */
const LABEL = "font-mono text-[clamp(12px,0.75rem,13px)] uppercase tracking-[0.08em]";
/** Design.md §3 rule 3. On this ground the ring is `--paper`, not `--ink`. */
const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-paper";

export const HomeFooter = () => {
  const { host, canvas, svg, lines } = useFooterStrings();
  const year = new Date().getFullYear();

  return (
    <RevealScope tag="footer" className="relative bg-ink text-paper">
      <div ref={host} className="footer-field">
        <canvas ref={canvas} className="footer-fog" aria-hidden="true" />

        {/* Decorative: it carries no information and every line is identical to every other, so
            there is nothing here for a screen reader to be told about. */}
        <svg
          ref={svg}
          className="footer-lines"
          data-live="true"
          viewBox="0 0 1000 520"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          {lines.map((line) => (
            <g key={line.index}>
              <path
                data-string
                data-index={line.index}
                className="footer-string"
                d={restPath(line)}
                /* The intensity ramp, as presence. Lines further down the stack sit brighter, so
                   the field reads as gaining weight toward the end of the page. */
                style={{ opacity: 0.18 + line.intensity * 0.5 }}
              />
              <path
                data-string-hit
                data-index={line.index}
                className="footer-string-hit"
                d={restPath(line)}
              />
            </g>
          ))}
        </svg>

        <div className="relative mx-auto w-full max-w-[80rem] px-[1.25rem] pt-[clamp(4rem,10vw,8rem)] pb-[clamp(2rem,5vw,3rem)] md:px-[4rem]">
          <RevealText
            tag="p"
            act="scope"
            variant="heading"
            className="max-w-[18ch] font-hero text-[clamp(40px,7vw,96px)] font-medium lowercase leading-[0.95] tracking-[-0.02em]"
          >
            let&rsquo;s build something
          </RevealText>

          <div className="mt-[clamp(2.5rem,6vw,4rem)] grid grid-cols-1 gap-[clamp(2.5rem,5vw,3rem)] md:grid-cols-12">
            <div className="md:col-span-6">
              <p className={`${LABEL} text-peach`}>General enquiries</p>
              <a
                href={`mailto:${site.email}`}
                className={`group mt-[0.6rem] inline-flex min-h-[44px] items-center font-hero text-[clamp(20px,2.6vw,36px)] font-medium text-paper ${FOCUS_RING}`}
              >
                <HoverBlur text={site.email} />
              </a>

              <p className={`${LABEL} mt-[2rem] text-peach`}>Careers</p>
              <a
                href={`mailto:${site.careersEmail}`}
                className={`group mt-[0.6rem] inline-flex min-h-[44px] items-center font-hero text-[clamp(18px,2vw,28px)] font-medium text-paper ${FOCUS_RING}`}
              >
                <HoverBlur text={site.careersEmail} />
              </a>
            </div>

            <div className="md:col-span-4 md:col-start-9">
              <p className={`${LABEL} text-peach`}>{site.tagline}</p>
              <p className="mt-[1rem] max-w-[38ch] text-[clamp(14px,0.95rem,17px)] leading-[1.6] text-peach text-pretty">
                {positioning}
              </p>

              <nav aria-label="Footer" className="mt-[2rem]">
                <ul className="flex flex-col">
                  {NAV.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`group inline-flex min-h-[44px] items-center text-[clamp(15px,1rem,18px)] lowercase text-paper ${FOCUS_RING}`}
                      >
                        <HoverBlur text={item.label} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>

          <div className="mt-[clamp(3rem,7vw,5rem)] w-56">
            <WordShiftButton text="Start a project" href="/contact" />
          </div>

          <div
            className={`mt-[clamp(2.5rem,6vw,3.5rem)] flex flex-col gap-[0.65rem] border-t border-peach/25 pt-[1.1rem] text-peach md:flex-row md:items-center md:justify-between ${LABEL}`}
          >
            <p>
              © {year} {site.name}
            </p>
            <p className="normal-case tracking-[0]">{site.domain}</p>
          </div>
        </div>
      </div>
    </RevealScope>
  );
};
