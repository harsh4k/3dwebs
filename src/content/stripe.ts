import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * The stripe — 186 bands traced from the credentials deck.
 *
 * Parsed at BUILD TIME from public/brand/stripe.svg rather than inlined as
 * a data structure here. Two reasons: the fills are raw hex and may only
 * live outside src/, and the SVG stays the single source of truth, so a
 * re-trace needs no code change.
 *
 * Every band becomes a real DOM node. That is what makes the stripe
 * animatable band-by-band — decompressing, wiping, scanning, smearing. A
 * CSS gradient could not do any of it.
 */

export interface StripeBand {
  x: number;
  width: number;
  fill: string;
}

export const STRIPE_VIEWBOX = { width: 1000, height: 100 } as const;

function parseBands(): StripeBand[] {
  const svg = readFileSync(join(process.cwd(), 'public', 'brand', 'stripe.svg'), 'utf8');
  const bands: StripeBand[] = [];
  const re = /<rect\s+x="([\d.]+)"\s+width="([\d.]+)"[^>]*fill="(#[0-9A-Fa-f]{6})"/g;

  let match: RegExpExecArray | null;
  while ((match = re.exec(svg)) !== null) {
    const [, x, width, fill] = match;
    if (x === undefined || width === undefined || fill === undefined) continue;
    bands.push({ x: Number(x), width: Number(width), fill });
  }

  if (bands.length === 0) {
    throw new Error('stripe.svg produced zero bands — the trace or the parser is wrong.');
  }
  return bands;
}

export const stripeBands: StripeBand[] = parseBands();

/** 186. Asserted in tests so a bad re-trace fails loudly. */
export const stripeBandCount = stripeBands.length;
