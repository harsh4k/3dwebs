/**
 * Showreel scroll timeline — a faithful port of the original vanilla
 * `updateScroll()` choreography (Showreel/script.js).
 *
 * The whole experience is driven by ONE normalised scroll progress `p` (0→1)
 * across the tall scroll track. Every animated value is a pure function of `p`
 * (and the live `vmin` in px where a calc can't stay unit-only), so the stage
 * needs only a single react-spring value scrubbed by a `ProgressTrigger`
 * (the sanctioned "one spring, many `.to()` selectors" pattern).
 *
 * Progress model (matches the original's virtual-timeline compression):
 *   SCROLL_COMPRESS = 0.4 → real scroll is multiplied by 1/0.4 = 2.5.
 *   The original used 2000vh of virtual scroll for phases 1–5, then absolute
 *   virtual thresholds for portfolio / camera-flight. We map `p` to the same
 *   virtual-scroll axis (`vScroll`, in vh) and reuse every original formula.
 *
 * Responsive geometry: the card/sphere constants that read wrong in portrait are
 * driven from `geometry.ts`. Pure-string builders emit `var(--sr-*)` (swapped
 * live by `useShowreelLayout`, so their spring selectors never rebuild); the two
 * JS-math counter-scales take a numeric `geo` (default desktop → unchanged
 * output). `PERSP` is shared and constant across layouts (see geometry.ts).
 */

import { assets } from './assets';
import { DESKTOP_GEO, PERSP, type ShowreelGeo } from './geometry';

// ── Track / progress geometry ──────────────────────────────────────────────
export const TRACK_VH = 2000; // total scroll-track height (vh)
const STICKY_VH = 100; // sticky stage height (one viewport)
const TRAVEL_VH = TRACK_VH - STICKY_VH; // scrollable travel
const SCROLL_COMPRESS = 0.4;
/** Max virtual scroll (vh) reached at p = 1. */
const VSCROLL_MAX = TRAVEL_VH / SCROLL_COMPRESS; // 4750

// Virtual-scroll thresholds (vh), identical to the original derivation.
const OLD_MAX = 2000; // phases 1–5 span 0..2000vh of virtual scroll
const PS = OLD_MAX - 400; // portfolioStart = 1600
const PF_DUR = 1500;
const PF_END = PS + PF_DUR; // 3100
const GRID_START = PS + 0.72 * PF_DUR; // 2680
const P6_END = GRID_START + 1000; // 3680
const P7_START = P6_END; // 3680
const P7_END = P7_START + 900; // 4580
// PERSP (scene perspective px, used for counter-scales) is imported from
// geometry.ts — it is shared with the `[perspective:1500px]` CSS and the grid
// depth scale, so it must stay one constant across layouts.

// ── Helpers ──────────────────────────────────────────────────────────────
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
/** Smoothstep (cubic hermite). */
const smooth = (t: number) => t * t * (3 - 2 * t);

const vScroll = (p: number) => clamp01(p) * VSCROLL_MAX;
const gp = (p: number) => clamp01(vScroll(p) / OLD_MAX);

// Phase progresses (gp-relative), matching the original breakpoints.
const phase1 = (p: number) => clamp01(gp(p) / (2 / 15)); // 0 – 13.33%
const phase2 = (p: number) => clamp01((gp(p) - 0.1) / 0.05); // 10 – 15%
const phase3 = (p: number) => clamp01((gp(p) - 0.15) / 0.25); // 15 – 40%
const phase4 = (p: number) => clamp01((gp(p) - 0.4) / 0.35); // 40 – 75%

// ── Card 1 (hero) ──────────────────────────────────────────────────────────
// The hero card is rotated 90°, so its box width = the side-card *height*
// (`--sr-card-h`) and its box height = the side-card *width* (`--sr-card-w`).
export const card1Width = (p: number) => {
  const t = phase1(p);
  return `calc((100vw - var(--sr-hero-pad)) * ${1 - t} + var(--sr-card-h) * ${t})`;
};
export const card1Height = (p: number) => {
  const t = phase1(p);
  return `calc((100vh - var(--sr-hero-pad)) * ${1 - t} + var(--sr-card-w) * ${t})`;
};
export const card1Transform = (p: number) => {
  const rotateZ = phase1(p) * 90;
  // currentRadius = phase2 * carousel radius; translateZ(currentRadius + 1px)
  return `rotateZ(${rotateZ}deg) translateZ(calc(var(--sr-carousel-r) * ${phase2(p)} + 1px))`;
};
export const card1Opacity = (p: number) => (gp(p) >= 0.75 ? 0 : 1);

/** Hero image slider horizontal pan during phase 1 (translateX %). */
export const heroSlidePan = (p: number) => phase1(p) * -100;

/** Cursor-tilt strength for the hero image card — full at the top, faded out as
 *  the card flips into the carousel (so the tilt doesn't fight the flip). */
export const heroTiltFade = (p: number) => 1 - phase1(p);

/**
 * Slider grows from a portrait hero crop to **cover the whole card**. The final
 * size slightly exceeds the 62×42vmin card (the card clips the overflow) so the
 * image fully fills it — no hero shader peeking at the edges in the end state.
 */
export const heroSliderWidth = (p: number) =>
  `calc(min(90vw, 46vh) * ${1 - phase1(p)} + 66vmin * ${phase1(p)})`;
export const heroSliderHeight = (p: number) =>
  `calc(62vh * ${1 - phase1(p)} + 46vmin * ${phase1(p)})`;

/**
 * Hero foreground copy (headline + bottom content block) fades out over the
 * first half of phase 1, so the card reads clean as it flips into the carousel.
 * Pure opacity on absolutely-positioned layers → no layout shift on scroll.
 */
export const heroContentFade = (p: number) => Math.max(0, 1 - phase1(p) * 1.9);

// ── Side cards (2/3/4) ───────────────────────────────────────────────────
export const sideCardVisible = (p: number) => phase2(p) > 0;
export const sideCardTransform = (p: number, baseRotateY: number) => {
  const sx = Math.max(phase2(p), 0.0001);
  return `rotateY(${baseRotateY}deg) translateZ(calc(var(--sr-carousel-r) * ${phase2(p)})) scaleX(${sx})`;
};
export const card4Opacity = (p: number) => {
  const sphereFade = clamp01((vScroll(p) - PS) / 400);
  return 1 - sphereFade;
};

/** Cosine z-sort: keeps the front-facing carousel card painted last. */
export const cardZIndex = (p: number, slot: 0 | 1 | 2 | 3) => {
  const rotY = phase3(p) * -270;
  return Math.round(Math.cos(((rotY + slot * 90) * Math.PI) / 180) * 100) + 1000;
};

/**
 * Carousel CTA — a call-to-action pinned under the 4-card carousel (the second
 * block). Appears the instant the hero card snaps to its strictly-vertical
 * (portrait) carousel pose — i.e. as `phase1` (the 0→90° flip) completes — and
 * fades back out before the sphere card opens (gp ~0.40). Pure spring opacity.
 */
export const carouselCtaReveal = (p: number) => {
  const appear = smooth(clamp01((phase1(p) - 0.9) / 0.1));
  const fadeOut = smooth(clamp01((gp(p) - 0.4) / 0.06));
  return appear * (1 - fadeOut);
};

// ── Carousel ───────────────────────────────────────────────────────────────
export const carouselTransform = (p: number) => {
  const fly = phase4(p) * phase4(p); // easeFlyBack = p4^2
  const rotY = phase3(p) * -270;
  return `translateZ(calc(var(--sr-flyback) * ${-fly})) rotateY(${rotY}deg)`;
};

// ── Sphere card (card-4 internals) ──────────────────────────────────────────
export const starMaskSize = (p: number) => `${8 + Math.pow(phase4(p), 4) * 1500}vmin`;

// JS-math islands: the sphere's optical counter-scales. They divide a perspective
// by a live `vmin`-in-px length, which CSS `calc` can't express, so they read the
// numeric `geo` (default desktop → output unchanged). The flyback/radius here
// MUST match the `--sr-flyback` / `--sr-carousel-r` CSS the cards use, which is
// why both come from the one geometry table.
const flyBackZpx = (p: number, vmin: number, geo: ShowreelGeo) =>
  -(phase4(p) * phase4(p)) * geo.flybackVmin * vmin;

export const blackScreenTransform = (p: number, vmin: number, geo: ShowreelGeo = DESKTOP_GEO) => {
  const scale = (PERSP - flyBackZpx(p, vmin, geo)) / PERSP;
  const up = clamp01((vScroll(p) - PS) / 400);
  const upY = smooth(up) * 100; // vh — sphere block scrolls up to meet portfolio
  return `translate(-50%, calc(-50% - ${upY}vh)) scale(${scale})`;
};
export const sphereSceneScale = (p: number, vmin: number, geo: ShowreelGeo = DESKTOP_GEO) => {
  const fly = flyBackZpx(p, vmin, geo);
  const radius = geo.carouselRVmin * vmin;
  return (PERSP - fly - radius) / (PERSP - fly);
};
export const sphereLogoEase = (p: number) => {
  const inP = clamp01((phase3(p) - 0.6) / 0.4);
  return smooth(inP);
};

/** Supporting copy in the sphere block fades/rises in just after the headings
 *  land (gp 0.64→0.74). */
export const sphereBodyReveal = (p: number) => smooth(clamp01((gp(p) - 0.64) / 0.1));

/**
 * "Collapse" progress through the fully-open sphere state: the particle sphere
 * grows to fill the frame while the white star logo shrinks back. Runs after
 * the reveal (gp 0.52→0.72), before the portfolio scrolls in.
 */
export const sphereCollapse = (p: number) => smooth(clamp01((gp(p) - 0.52) / 0.2));
/** Sphere shell scale — grows as it collapses (canvas grows past the viewport so
 *  scattered particles aren't clipped by the canvas edge). */
export const sphereScale = (p: number) => 1 + 0.5 * sphereCollapse(p);

export const sphereLogoTransform = (p: number) =>
  `translate(-50%, -50%) scale(${0.12 + 0.88 * sphereLogoEase(p) - 0.55 * sphereCollapse(p)})`;
export const sphereLogoOpacity = (p: number) => sphereLogoEase(p);

/**
 * Particle dispersion (0→1) as the portfolio takes over: the sphere's particles
 * loosen + dissolve. Gentle + long (vScroll PS-400 → PS+200) and overlapping the
 * end of the collapse, so it reads as a soft fade-out rather than a hard burst
 * at the scene seam.
 */
export const sphereDisperse = (p: number) => smooth(clamp01((vScroll(p) - (PS - 400)) / 600));

// ── Services marquee ────────────────────────────────────────────────────────
export const marqueeOpacity = (p: number) => {
  const fade = clamp01((gp(p) - 0.58) / 0.12);
  return phase1(p) * (1 - fade);
};
export const marqueeBlur = (p: number) => (1 - phase1(p)) * 20; // px

/**
 * White stage backdrop opacity. Phases 1–4 sit on white (matching the original
 * `html` background); it fades to reveal the black page + flame shader as the
 * sphere fully opens (gp 0.72→0.75).
 */
export const stageBackdropOpacity = (p: number) => clamp01((0.75 - gp(p)) / 0.03);

// ── Unified aurora background (sphere + portfolio) ──────────────────────────
// One pinned mesh-gradient ("northern lights") shared by the sphere scene and
// the portfolio so the background reads as continuous across both blocks
// (replaces the flame backdrop there + the portfolio's own fly-in aurora).
// Fades in behind the white backdrop as the sphere opens, holds through the
// portfolio, fades out as the camera flies on to the target.
export const auroraOpacity = (p: number) => {
  const v = vScroll(p);
  const fadeIn = clamp01((v - 1200) / 350); // in by ~1550 (white backdrop gone by 1500)
  const fadeOut = 1 - clamp01((v - 2900) / 350); // out by ~3250 (after portfolio exits)
  return Math.min(fadeIn, fadeOut);
};

// ── Portfolio ───────────────────────────────────────────────────────────────
const pfProgress = (p: number) => clamp01((vScroll(p) - PS) / PF_DUR);
const pfEnter = (p: number) => smooth(clamp01(pfProgress(p) / 0.267));
const pfSlide = (p: number) => clamp01((pfProgress(p) - 0.267) / 0.453);
const pfExit = (p: number) => smooth(clamp01((pfProgress(p) - 0.72) / 0.28));

export const portfolioActive = (p: number) => vScroll(p) > PS;
export const portfolioTransform = (p: number) => {
  if (!portfolioActive(p)) return "translateY(100%)";
  const ty = (1 - pfEnter(p)) * 100;
  const sc = 1 - pfExit(p) * 0.62;
  const tx = -pfExit(p) * 130;
  return `translate(${tx}vw, ${ty}%) scale(${sc})`;
};
export const pfTrackTransform = (p: number, maxPan: number) =>
  `translateX(${-pfSlide(p) * maxPan}px)`;

// ── Camera-rig flight + target block (phases 6–7) ──────────────────────────
const flightActive = (p: number) => vScroll(p) > GRID_START;
const p6 = (p: number) => clamp01((vScroll(p) - GRID_START) / 1000);
const p7 = (p: number) => clamp01((vScroll(p) - P7_START) / (P7_END - P7_START));
const easeP7 = (p: number) => {
  const t = p7(p);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

export const cameraRigTransform = (p: number) => {
  if (!flightActive(p)) return "translate(0vw, 0vh) translateZ(0px)";
  const rigX = -250 * Math.sin((p6(p) * Math.PI) / 2);
  const rigY = -100 * (1 - Math.cos((p6(p) * Math.PI) / 2));
  const rigZ = 2250 * easeP7(p);
  return `translate(${rigX}vw, ${rigY}vh) translateZ(${rigZ}px)`;
};
export const targetOpacity = (p: number) => (flightActive(p) ? 1 : 0);

/** CTA reveal — fades/rises in over the last half of the camera flight into the
 *  target block (p7 0.5→1), so the call-to-action lands as the camera arrives. */
export const ctaReveal = (p: number) => smooth(clamp01((p7(p) - 0.5) / 0.5));

/** Final-block metal frame — appears almost at the very end of the camera flight
 *  (p7 0.8→1), snapping in as the scene settles into the target block. */
export const finalFrameReveal = (p: number) => smooth(clamp01((p7(p) - 0.8) / 0.2));

// ── Per-canvas visibility (render-loop gating) ──────────────────────────────
// The showreel mounts several WebGL canvases at once; rendering all of them
// every frame (incl. the 34k-particle sphere + chrome star) is the main cause of
// scroll lag. Each canvas is only on-screen during a slice of the scroll, so we
// pause its render loop (`frameloop="never"`) when out of range. Ranges carry a
// margin so a scene is live slightly before it appears (no pop-in / frozen
// first frame). Derived from the same thresholds as the transforms above.
export interface SceneVisibility {
  hero: boolean;
  aurora: boolean;
  sphere: boolean;
  target: boolean;
  /** Portfolio video cards — gates their (heavy) `<video>` loading/playback. */
  portfolio: boolean;
}
export const sceneVisibility = (p: number): SceneVisibility => {
  const g = gp(p);
  const v = vScroll(p);
  return {
    // Hero card lives in the carousel until it flips away (~gp 0.75).
    hero: g < 0.8,
    // Unified aurora backdrop for the sphere + portfolio blocks (the portfolio
    // has no canvas of its own now, so this also covers its range).
    aurora: v > 1000 && v < PF_END + 350,
    // Sphere is revealed from phase 3 and stays until the camera flies past it.
    sphere: g > 0.1 && v < GRID_START + 400,
    // Target star: the camera-flight + final block.
    target: v > GRID_START - 300,
    // Portfolio cards: live across the portfolio scroll range (with a lead-in
    // margin so the videos buffer just before the section flies into view).
    portfolio: v > PS - 600 && v < PF_END + 350,
  };
};
export const targetTransform = () =>
  "translate(calc(-50% + 250vw), calc(-50% + 100vh)) translateZ(-2250px)";
export const targetRadius = (p: number) => (flightActive(p) ? 30 * (1 - easeP7(p)) : 30);

// ── Parallax grid items ─────────────────────────────────────────────────────
export interface GridItem {
  tx: number; // vw
  ty: number; // vh
  w: string; // width (vw)
  h: string; // height (vh)
  z: number; // px depth
  scale: number;
  image: string; // background image url (URL-encoded)
}

const GRID_IMAGES = assets.grid;

/** The 14 placeholder positions from the original markup, with deterministic
 *  pseudo-random depth (so the parallax pattern is fixed across reloads). */
const RAW_GRID: Array<{ tx: number; ty: number; w: string; h: string }> = [
  { tx: -85, ty: -60, w: "45vw", h: "70vh" },
  { tx: -80, ty: 55, w: "40vw", h: "65vh" },
  { tx: 85, ty: -60, w: "40vw", h: "75vh" },
  { tx: 80, ty: 55, w: "45vw", h: "70vh" },
  { tx: -15, ty: -110, w: "45vw", h: "75vh" },
  { tx: 15, ty: 120, w: "50vw", h: "80vh" },
  { tx: 50, ty: 120, w: "45vw", h: "70vh" },
  { tx: 120, ty: -10, w: "40vw", h: "80vh" },
  { tx: 0, ty: 160, w: "45vw", h: "75vh" },
  { tx: 150, ty: 0, w: "50vw", h: "80vh" },
  { tx: 200, ty: 30, w: "45vw", h: "75vh" },
  { tx: 300, ty: 40, w: "40vw", h: "70vh" },
  { tx: 190, ty: 160, w: "45vw", h: "80vh" },
  { tx: 310, ty: 170, w: "50vw", h: "75vh" },
];

export const GRID_ITEMS: GridItem[] = RAW_GRID.map((it, index) => {
  const pseudoRandom = Math.abs(Math.sin((index + 1) * 12.9898) * 43758.5453) % 1;
  const z = -500 - pseudoRandom * 2500;
  const scale = PERSP / (PERSP - z);
  // Decorrelated pseudo-random pick (different multiplier) so the image spread
  // doesn't track the depth pattern.
  const imgRand = Math.abs(Math.sin((index + 1) * 78.233) * 12345.678) % 1;
  const image = GRID_IMAGES[Math.floor(imgRand * GRID_IMAGES.length)] ?? GRID_IMAGES[0] ?? '';
  return { ...it, z, scale, image };
});

export const gridItemTransform = (item: GridItem) =>
  `translate(calc(-50% + ${item.tx}vw), calc(-50% + ${item.ty}vh)) translateZ(${item.z}px) scale(${item.scale})`;
export const gridItemRadius = (item: GridItem) => `${12 / item.scale}px`;

export const gridOpacity = (p: number) => {
  const v = vScroll(p);
  if (v <= GRID_START) return 0;
  const gridFadeIn = clamp01((v - GRID_START) / (PF_END - GRID_START));
  if (v <= PF_END) return gridFadeIn;
  // Fade back out as the camera reaches the target block (phase 7).
  const fade =
    v > P7_START ? easeP7(p) : 0;
  return 1 - fade;
};

// ── Pinned-text letter choreography ─────────────────────────────────────────
// These two headings are scrubbed by the global scroll while their card is
// pinned, so the viewport-triggered TextEngine can't reach them (see ADR).
export interface LetterStyle {
  transform: string;
  filter: string;
  opacity: number;
}

/** Hero title — letters descend + blur out, staggered from the LAST letter. */
export const heroLetterStyle = (p: number, index: number, total: number): LetterStyle => {
  const reversed = total - 1 - index;
  const delay = (reversed / total) * 0.4;
  const lp = clamp01((phase1(p) - delay) / 0.6);
  const e = smooth(lp);
  return {
    transform: `translateY(${e * 40}%)`,
    filter: `blur(${e * 1.5}vmin)`,
    opacity: Math.max(0, 1 - e * 1.5),
  };
};

/** Sphere block heading — letters rise from below + come into focus. */
export const blockLetterStyle = (p: number, index: number, total: number): LetterStyle => {
  const ap = clamp01((gp(p) - 0.6) / 0.135);
  const delay = (index / total) * 0.55;
  const lp = clamp01((ap - delay) / 0.45);
  const inv = 1 - smooth(lp);
  return {
    transform: `translateY(${inv * 70}%)`,
    filter: `blur(${inv * 2.0}vmin)`,
    opacity: Math.max(0, 1 - inv * 1.3),
  };
};

/**
 * Rotated "Browse our templates" — staggered slide-up in the LATE part of
 * phase 1 (starts ~phase1 0.45, every letter reaches t=1 by ≈0.99, before the
 * carousel starts rotating at gp 0.15). Appears after the card has mostly
 * formed, not alongside the hero headline.
 */
export const templatesLetterStyle = (p: number, index: number): LetterStyle => {
  const t = clamp01((phase1(p) - 0.45 - index * 0.005) / 0.45);
  return {
    transform: `translateY(${(1 - smooth(t)) * 150}%)`,
    filter: `blur(${(1 - t) * 1.5}vmin)`,
    opacity: t,
  };
};
