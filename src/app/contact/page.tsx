import { closingCopy, site } from '@/content/site';
import { NEEDS_PARAM, labelsForSlugs } from '@/features/home/needs';
import { InnerPage } from '@/features/page-shell/inner';

/**
 * `/contact`, with the pickup for the home page's CTA (specs/home.md §5).
 *
 * The selection arrives as repeated `?need=` params on a real link, so this is
 * resolved on the **server** — no `sessionStorage`, no client component, no
 * flash of an empty recap. `labelsForSlugs` maps each slug back through
 * `content/services.ts`, so a hand-edited or stale query string can only ever
 * produce confirmed deck copy or nothing at all (Rule 0).
 *
 * There is no enquiry form here yet (specs/contact.md §2), so the recap does the
 * one useful thing it can with the selection: it prefills the mailto. When the
 * form lands, bind the selection to an explicit named field — the reference this
 * was modelled on writes it into `querySelector('input.gform_hidden')`, which on
 * their live site lands in the consent field's hidden sub-input rather than
 * anywhere useful.
 */
export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = params[NEEDS_PARAM];
  const needs = labelsForSlugs(Array.isArray(raw) ? raw : raw ? [raw] : []);

  const mailto =
    needs.length > 0
      ? `mailto:${site.email}?subject=${encodeURIComponent('Project enquiry')}&body=${encodeURIComponent(
          `Hello,\n\nI need a:\n${needs.map((need) => `- ${need}`).join('\n')}\n\n`,
        )}`
      : `mailto:${site.email}`;

  return (
    <InnerPage title="Contact">
      {needs.length > 0 ? (
        <div className="mb-[2rem] border-l-[3px] border-heat pl-[1rem]">
          <p className="font-mono text-[clamp(11px,0.7rem,12px)] uppercase tracking-[0.08em] text-ink-muted">
            You told us you need
          </p>
          <ul className="mt-[0.5rem] flex flex-col gap-[0.25rem]">
            {needs.map((need) => (
              <li key={need} className="font-medium">
                {need}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {closingCopy.map((line) => (
        <p key={line}>{line}</p>
      ))}
      <p className="mt-[1.5rem]">
        <a className="underline decoration-from-font underline-offset-4" href={mailto}>
          {site.email}
        </a>
      </p>
      <p>
        <a className="underline decoration-from-font underline-offset-4" href={`mailto:${site.careersEmail}`}>
          {site.careersEmail}
        </a>
      </p>
    </InnerPage>
  );
}
