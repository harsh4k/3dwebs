// 📖 Docs: obsidian/frontend/components/common.md

/**
 * Deterministic seeded PRNG (mulberry32).
 *
 * The scene is built from tens of thousands of randomly placed particles; a
 * seeded generator keeps that layout identical on every run, so the composition
 * a designer signs off on is the one that ships.
 */
export const createRandom = (seed: number): (() => number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), 1 | t);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
