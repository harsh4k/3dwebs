/**
 * Design in Motion — geometry and timing.
 *
 * **These numbers are derived here, for our imagery.** The reference section this follows rides
 * near-square Dribbble shots (roughly 1.43:1); our deck stills average **1.86:1** — measured
 * across the eleven entries in `content/projects.ts`. Card spacing, ribbon width and the helix
 * radius all key off that ratio, so its numbers would frame our images wrongly even if they were
 * ours to take. What follows is worked from the camera out, and every value says what it keys off
 * so the next person can re-derive rather than guess.
 *
 * The scene is three.js, which is already on `/` for `ParticleScene` — no new dependency.
 */

/** Mean height/width of the deck stills. Everything cross-path scales from this. */
export const PLANE_ASPECT = 0.536;

/* ── Camera ───────────────────────────────────────────────────────────────
   Distance and field of view set how much of the helix is in frame at once. Wider viewports get
   a tighter fov and a closer camera, because they have the pixels to carry a bigger card. */

export const camera = {
  distance: { mobile: 30, tablet: 25, desktop: 22 },
  fov: { mobile: 60, tablet: 55, desktop: 52 },
} as const;

/* ── The helix ────────────────────────────────────────────────────────────
   A card is 11 units along the path. At the near pass it sits about 9 units from the camera,
   where a 52° fov shows ~15.6 units of width — so the card fills roughly two-thirds of the frame
   as it goes by. That is the readability target the rest of these follow from.

   Radius 13 keeps the far side of the turn inside the fog. Two turns over a 30-unit rise gives a
   pitch shallow enough that a card is legible at the crossing rather than edge-on. */

export const helix = {
  /** Arc length of one card along the path. */
  cardArc: 11,
  /** Arc spacing between consecutive card starts — the difference is the air between them. */
  cardGap: 12.6,
  radius: 13,
  turns: 2,
  /** Total climb, in world units, across every turn. */
  rise: 30,
  /** Segments along a card. Enough that the bend reads as a curve, not a fan. */
  cardSegments: 96,
  /** Samples along each guide line. */
  guideSegments: 512,
  /** Visible tail of the guide lines, in samples. */
  guideTrail: 72,
  /** Scale a card lifts to under the cursor. */
  hoverScale: 1.12,
} as const;

/** Rise per radian. */
export const RISE_PER_RADIAN = helix.rise / (2 * Math.PI * helix.turns);
/** Arc length per radian — the hypotenuse of radius against climb. */
export const HELIX_SLOPE = Math.hypot(helix.radius, RISE_PER_RADIAN);
/** Total arc length of the path. */
export const HELIX_LENGTH = 2 * Math.PI * helix.turns * HELIX_SLOPE;

/* ── The grid ─────────────────────────────────────────────────────────────
   Six planes, 3x2 on desktop and 2x3 on mobile. **Six is structural** — the layout maths below
   divides the frame by those counts, so a seventh image has nowhere to go. If the grid ever needs
   a different count, `columns`/`rows` and the fly-in directions change together. */

export const grid = {
  count: 6,
  columns: { mobile: 2, desktop: 3 },
  rows: { mobile: 3, desktop: 2 },
  /** Gaps as a fraction of a cell. */
  gap: { x: { mobile: 0.18, desktop: 0.4 }, y: { mobile: 0.22, desktop: 0.6 } },
  /** Stagger between one plane's arrival and the next, in progress units. */
  stagger: 0.08,
  /** Corner radius in real pixels — held constant by passing the plane's pixel size to the shader. */
  cornerRadiusPx: 8,
  /** Ripple amplitude climbs at this rate while a plane travels… */
  rippleRise: 1.8,
  /** …and falls at this rate once it has parked, so the wave damps out on arrival. */
  rippleFall: 0.72,
} as const;

/* ── The belts ────────────────────────────────────────────────────────────
   Five bands wipe up from the bottom to close the section and hand off to the dark ground of
   Recognition below. Bottom-anchored, lowest first. */

export const belts = {
  count: 5,
  stagger: 0.09,
} as const;

/* ── Phases ───────────────────────────────────────────────────────────────
   Fractions of the pin. The grid deliberately starts before the helix is finished — the overlap
   is what makes it one sequence instead of three clips played in order. */

export const phase = {
  /** The helix train has fully crossed by here. */
  helixEnd: 0.7,
  /** The grid begins arriving here, over the helix's tail. */
  gridStart: 0.44,
  /** The grid is fully parked here. */
  gridEnd: 0.78,
  /** The belts begin their wipe here and finish at 1. */
  beltStart: 0.78,
} as const;

/** Pin length in viewport heights. Long enough that the helix reads as travel, not a cut. */
export const PIN_VH = { mobile: 450, desktop: 600 } as const;

export const MOBILE_MAX = 768;
export const TABLET_MAX = 1200;
