"use client";

/**
 * Design.md §9 motion tokens, for JavaScript callers.
 *
 * The Web Animations API cannot resolve a CSS custom property — `element.animate`
 * needs a literal easing string and a number of milliseconds. Rather than
 * duplicate the curves here (two definitions that drift), this module **reads
 * them out of `src/styles/tokens.css` at runtime** and caches the result. There
 * is exactly one definition of `--ease-out-quint` in this codebase, and it is in
 * the token file.
 *
 * That is also what `.claude/hooks/guard-tokens.mjs` enforces: `tokens.css` is
 * the only path allowed to contain a raw `cubic-bezier()`. This file contains
 * none, by construction.
 *
 * Fallbacks are deliberately *generic* CSS keywords, not copies of the real
 * curves — if the token layer ever fails to load, motion should degrade to
 * something plainly correct rather than silently pretend to be on-brand.
 */

const cache = new Map<string, string>();

function readToken(name: string, fallback: string): string {
  if (typeof window === 'undefined' || typeof getComputedStyle !== 'function') {
    return fallback;
  }

  const cached = cache.get(name);
  if (cached !== undefined) return cached;

  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const resolved = value || fallback;
  cache.set(name, resolved);
  return resolved;
}

function readMs(name: string, fallback: number): number {
  const raw = readToken(name, '');
  if (!raw) return fallback;
  const parsed = raw.endsWith('ms')
    ? Number.parseFloat(raw)
    : raw.endsWith('s')
      ? Number.parseFloat(raw) * 1000
      : Number.NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
}

/** Easing curves. Getters, not constants — the tokens are not readable until the DOM exists. */
export const EASE = {
  /** Primary. Entrances, reveals, hovers. */
  get outQuint() {
    return readToken('--ease-out-quint', 'ease-out');
  },
  /** Large-travel reveals, page transitions. */
  get outExpo() {
    return readToken('--ease-out-expo', 'ease-out');
  },
  /** State changes that reverse — the only curve that should yo-yo. */
  get inOut() {
    return readToken('--ease-in-out', 'ease-in-out');
  },
  /** Scroll-scrubbed motion ONLY. */
  get linear() {
    return readToken('--ease-linear', 'linear');
  },
} as const;

/** Durations in milliseconds. */
export const DUR = {
  get instant() {
    return readMs('--dur-instant', 120);
  },
  get fast() {
    return readMs('--dur-fast', 240);
  },
  get base() {
    return readMs('--dur-base', 400);
  },
  get slow() {
    return readMs('--dur-slow', 640);
  },
  get reveal() {
    return readMs('--dur-reveal', 900);
  },
} as const;
