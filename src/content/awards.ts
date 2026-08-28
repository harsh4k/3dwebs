import { AwardSchema, validate, type Award } from './schema';

/**
 * Deck slide 3, verbatim. Every `line` is transcribed exactly as printed;
 * `count` is what that line represents when expanded.
 *
 * The counters on the home page are DERIVED from this array, never
 * hardcoded. If the source is corrected, the numbers follow automatically
 * and cannot drift away from the evidence.
 *
 * The source's own three-way split (international / asia-pacific / india)
 * is preserved. It is deliberately NOT re-bucketed into two groups — that
 * would strand the Asia-Pacific lines.
 */
const raw = [
  // ── International ────────────────────────────────────────────
  { line: 'Finalist – Cannes Cyber Lion (×2)', region: 'international', body: 'Cannes Lions', count: 2 },
  { line: 'Merit Award – One Show', region: 'international', body: 'One Show', count: 1 },
  {
    line: "People's Voice & People's Choice – Webby Awards (×2)",
    region: 'international',
    body: 'Webby Awards',
    count: 2,
  },
  {
    line: 'Finalist – D&AD (Interactive & Alternate Media)',
    region: 'international',
    body: 'D&AD',
    count: 1,
  },
  { line: 'Finalist – New York Festival (×2)', region: 'international', body: 'New York Festival', count: 2 },
  {
    // A jury seat is a credential, not an award. Counted as a body, never
    // as a win. This distinction is why the awards total is 30, not 31.
    line: 'On Jury Panel – Digital @ New York Design Festival',
    region: 'international',
    body: 'New York Design Festival',
    count: 1,
    isAward: false,
  },
  { line: 'Silver – Rx Awards (Ambient)', region: 'international', body: 'Rx Awards', count: 1 },
  { line: 'Global Awards – (Ambient Category)', region: 'international', body: 'Global Awards', count: 1 },

  // ── Asia-Pacific ─────────────────────────────────────────────
  {
    line: '1 Silver & 2 Bronze – Asia Pacific Advertising Festival (×2 years)',
    region: 'asia-pacific',
    body: 'Asia Pacific Advertising Festival',
    count: 6,
  },
  {
    line: 'Finalist – Asia Pacific Advertising Festival (Interactive Category)',
    region: 'asia-pacific',
    body: 'Asia Pacific Advertising Festival',
    count: 1,
  },

  // ── India ────────────────────────────────────────────────────
  {
    line: '1 Gold, 2 Silver & 7 Bronze – Goafest (ABAI Awards)',
    region: 'india',
    body: 'Goafest (ABAI Awards)',
    count: 10,
  },
  { line: "Gold – Abby's (Advergame)", region: 'india', body: 'Abby Awards', count: 1 },
  { line: "Silver – Abby's (Banner)", region: 'india', body: 'Abby Awards', count: 1 },
  { line: 'Silver – Abby Awards (Mainstream)', region: 'india', body: 'Abby Awards', count: 1 },
];

export const awards: Award[] = raw.map((a, i) => validate(AwardSchema, a, `award[${i}]`));

/** 11 distinct awarding organisations. The only figure the site currently prints —
 *  `hand-overlay.tsx`. Totals, jury seats and the region split are derivable from
 *  `awards` the day a page needs them; they are not kept as unused exports. */
export const totalBodies = new Set(awards.map((a) => a.body)).size;
