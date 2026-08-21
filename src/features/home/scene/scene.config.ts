// 📖 Docs: obsidian/frontend/components/common.md

import type { Vector3Tuple } from "three";

/**
 * Scene configuration — the single source of truth for the particle scene.
 *
 * These are the "design tokens" of the 3D layer: every colour, light, and
 * geometry parameter lives here rather than scattered as magic numbers in the
 * builders — mirroring the CSS token rule (ADR-0004) for the WebGL layer, where
 * three.js materials can't consume Tailwind tokens directly. The container
 * backdrop token in `src/styles/tokens.css` (`--scene-backdrop`) is kept in sync with
 * `colors.fog` here (same duplication rationale as the grid — ADR-0008).
 */

export interface SceneColors {
  /** Atmospheric fog — objects dissolve into this. */
  fog: string;
  /** Top of the background gradient (near the key light). */
  backdropTop: string;
  /** Bottom of the background gradient (the dark floor of the room). */
  backdropBottom: string;
  /** Base albedo of the glyph particles. */
  particle: string;
  /** Triangulated containment wireframe. */
  field: string;
  /** Key light. */
  keyLight: string;
  /** Sky side of the hemisphere fill. */
  skyFill: string;
  /** Ground side of the hemisphere fill. */
  groundFill: string;
  /** Airborne dust motes. */
  dust: string;
}

/** The hero glyph — a loaded bean point cloud (procedural X if the asset is missing). */
export interface GlyphConfig {
  /** Target instance count. The baked cloud is **subsampled** down to this; never jitter-copied. */
  count: number;
  /** Uniform scale from normalised model units (height 2) to world units. */
  scale: number;
  /** Base edge length of a single cube. */
  particleSize: number;
  /** Random size variation, 0–1. */
  sizeJitter: number;
  /** Rotation of the glyph about the vertical Y axis, in radians (turns it in 3D). */
  rotation: number;
  /** World position of the glyph's centre. */
  center: Vector3Tuple;
  /** Key-light direction, used to bake directional light/shade into the cloud. */
  lightDirection: Vector3Tuple;
  /** Fraction of particles that are oversized "hero" beads — rendered `bigScale`× and given a
   *  saturated white glow (they, and only they, feed the bloom pass). */
  bigFraction: number;
  /** Size multiplier for those hero beads (e.g. 2 = twice the base particle size). */
  bigScale: number;
  seed: number;
}

export interface FieldConfig {
  radiusTop: number;
  radiusBottom: number;
  height: number;
  radialSegments: number;
  heightSegments: number;
  opacity: number;
  centerY: number;
  /** The hero act's net is drawn this much larger (radius + height, base kept planted) — the X
   *  is the biggest figure and its cage should clear it generously. The hand/tree nets use the
   *  base size (with their own wrap scales). */
  heroScale: number;
  /** Continuous rotation of every net about its own axis, radians/second — the cage slowly
   *  turns forever (~80 s per revolution at 0.08), opposite in feel to the figures' rock. */
  spin: number;
}

/** Cursor repulsion + tint applied to nearby particles. */
export interface PointerConfig {
  /** World-space reach of the cursor's influence. */
  radius: number;
  /** How far particles are pushed out of the way. */
  strength: number;
  /** Per-frame easing while being pushed out, 0–1. Higher scatters faster. */
  relax: number;
  /** Per-frame easing while drifting back to rest — kept low for a soft reflow. */
  returnRelax: number;
  /** Colour of the emissive glow on touched particles. */
  color: string;
  /** Emissive strength. Above ~1 the particles blow out and read as lights. */
  glow: number;
}

export interface DustConfig {
  count: number;
  /** Half-extent of the box the motes fill. */
  spread: number;
  height: number;
  size: number;
  opacity: number;
  /** Chromatic-dispersion offset — how far the R/B channels split for the prism fringe. */
  dispersion: number;
  seed: number;
}

/** Scroll-driven scatter of the glyph into glowing strands. */
export interface ScatterConfig {
  /** How far the curl-flow strands reach at full scatter. */
  distance: number;
  /** Extra outward push along each particle's rest direction, as a fraction. */
  radial: number;
  /** Span of per-particle start delays in [0, 1] — staggers the strands. */
  stagger: number;
  /** Swirl: radians the displacement twists about Y per world-unit travelled —
   *  turns straight strands into spiralling ribbons. */
  twist: number;
  /** Continuous rotation of the formed ribbons about Y, in radians/second — keeps
   *  them alive (flowing) while the camera moves instead of frozen. */
  drift: number;
  /** Amplitude of the per-particle wander that shimmers the held ribbons. */
  wander: number;
  /** Fraction of +Z (toward-camera) scatter kept, so the burst dodges the lens. */
  towardCamera: number;
  /** The formed ribbons then reflow into **camera-relative streamers around the frame
   *  perimeter** for the flight to the hand — anchored to the camera so they follow it (never
   *  falling behind → no vanish), bending dynamically, ends visible, centre kept clear. */
  flight: FlightConfig;
  /** Purple bloom colour. */
  color: string;
  /** Emissive strength of the bloom. */
  glow: number;
}

/** World-space ribbon streamers strung **along the flight corridor** (roughly the camera's
 *  path from the glyph to the hand). The camera flies *through* them, so they stream past on
 *  the sides with real parallax (no lag, no lens-locked rotation). Each ribbon is an
 *  asymmetric snaking curve offset from the corridor axis. */
export interface FlightConfig {
  /** Number of distinct ribbons around the corridor (a few, so their ends read). */
  ribbons: number;
  /** Base perpendicular offset of a ribbon from the corridor axis (world units) — how far out
   *  to the sides they sit. Varied per ribbon so they don't form a clean ring. */
  radius: number;
  /** Angular snake amplitude along a ribbon (radians). */
  bend: number;
  /** Snake waves along a ribbon's length. */
  bendWaves: number;
  /** Gentle helical turn from a ribbon's near end to its far end (radians) — adds variety
   *  without a locked circular orbit. */
  turn: number;
  /** Temporal speed of the snake — the "alive" flex. */
  speed: number;
  /** Corridor axis height (Y). Kept high enough that ribbons don't dip below the floor. */
  axisY: number;
  /** Vertical squash of the corridor cross-section (× the horizontal radius) — <1 keeps the
   *  ribbons from reaching as far down (below the floor) while staying wide at the sides. */
  vScale: number;
  /** Corridor Z span: `zStart` (near, ahead of the glyph) → `zEnd` (far, past the hand). */
  zStart: number;
  zEnd: number;
  /** How much the offset radius grows from near to far end (× `radius`). Counters perspective
   *  so the far parts don't bunch into the centre — the ribbons stay out at the sides. */
  spread: number;
  /** Tube radius — each particle sits at a fixed random point within this radius on the disc
   *  **perpendicular to the ribbon**, so the ribbon reads as a solid round tube (not a flat
   *  sheet). */
  thickness: number;
  /** Exit: how far each ribbon's head sweeps out to its side. */
  exitDistance: number;
  /** Exit: how much the sweep heading curves as the head flies (radians) — so the head traces
   *  an arc and the body follows it, rather than the ribbon sliding straight sideways. */
  exitCurve: number;
  /** Exit: vertical arc amplitude — the sweep rises and settles (0 at both ends, so never a
   *  net drop through the floor). */
  exitLift: number;
  /** Exit: how far (in ribbon-lengths) the tip is pulled out by the end of the exit. The whole
   *  ribbon streams toward the tip and out along its path — the tip leads, every point behind
   *  flows to where the tip went. >1 so even the far end reaches the exit extension. */
  exitSpan: number;
}

/** The particle hand that rises inside the second lattice (loaded point cloud). */
export interface HandConfig {
  /** Uniform scale from normalised model units (height 2) to world units. */
  scale: number;
  particleSize: number;
  sizeJitter: number;
  center: Vector3Tuple;
  lightDirection: Vector3Tuple;
  /** Fraction of hand particles that are oversized white-glow bloomers (see `GlyphConfig`). */
  bigFraction: number;
  /** Size multiplier for those hero beads. */
  bigScale: number;
  /** Rotation of the hand about the vertical Y axis, in radians. */
  rotation: number;
  /** Upsample factor — each loaded point is duplicated this many times (jittered) to make the
   *  hand denser (more balls). The wave grid (`columns`×`rows`) must cover `count × density`. */
  density: number;
  /** Fraction of the hand's beads **held hidden until the wave forms** (0–1). Thins the *hand*
   *  without touching the instance count, so the wave curtain it becomes still gets every bead.
   *  Lowering `density` instead would thin both, and shrink what the wave grid has to cover. */
  sparse: number;
  /** Strength of the pink bloom band on the scan-in reveal (bottom-up materialise). */
  scanGlow: number;
  seed: number;
}

/** The particle tree — the final tableau, at its own anchor below the wave (loaded point
 *  cloud, same `bin_u16` format as the hand). It reveals bottom-up through an **angled mask**
 *  and, unlike the hand, does not morph into anything. Same lattice environment as the X. */
export interface TreeConfig {
  /** Uniform scale from normalised model units (height 2) to world units. */
  scale: number;
  particleSize: number;
  sizeJitter: number;
  center: Vector3Tuple;
  lightDirection: Vector3Tuple;
  /** Fraction of tree particles that are oversized white-glow bloomers (see `GlyphConfig`). */
  bigFraction: number;
  /** Size multiplier for those hero beads. */
  bigScale: number;
  /** Rotation of the tree about the vertical Y axis, in radians. */
  rotation: number;
  /** Upsample factor — each loaded point duplicated this many times (jittered) for density. */
  density: number;
  /** Strength of the pink bloom band riding the bottom-up materialise (the GPU `uScanTint`). */
  scanGlow: number;
  seed: number;
}

/** The hand's own particles **crumble through a vortex into a wave curtain** in the
 *  final phase. These are the destination (a vertical curtain the camera cranes up to),
 *  the ripple, and the vortex swirl of that transform. No new particles — the hand's
 *  `scatterTarget` holds these destinations; `updateCloud`'s wave branch drives it. */
export interface WaveConfig {
  /** Destination grid resolution: particles across X (columns) and up Y (rows). Their
   *  product should roughly match the hand's particle count. */
  columns: number;
  rows: number;
  /** Spacing between destination grid points. */
  spacing: number;
  /** World centre of the grid. Offset to the lower-left so the wave sits in that
   *  corner and its near edges bleed off-frame. */
  center: Vector3Tuple;
  /** Tilt of the grid plane, radians — the plane recedes in depth as it goes up, so the
   *  far edge dissolves into fog (no visible border) and it reads at an oblique angle. */
  tilt: number;
  /** Yaw of the grid plane about vertical, radians — swings the right side back into the
   *  fog so the plane recedes diagonally (dense near corner → faded far corner). This is
   *  what puts the wave in the bottom-left while the camera only rotates *up*. */
  yaw: number;
  /** Fraction of the grid half-extent over which particles fade out toward the edges,
   *  so the wave dissolves at its borders instead of ending in a hard line. */
  edgeFade: number;
  /** Amplitude of the depth (Z) ripple. */
  amplitude: number;
  /** Spatial frequencies of the two crossing travelling waves (across X, up Y). */
  freqX: number;
  freqY: number;
  /** Travel speed of the waves. */
  speed: number;
  /** The morph routes mid-transition through **several meandering bright streams** (vortex): a few
   *  dense glowing spines that each snake side-to-side (S-curves) **up** the column, wrapped in a
   *  diffuse dust halo. Strongest at `sin(π·wave)`, then settles into the wave. The spines are
   *  spread symmetrically about the hand's X/Z axis (so the group stays centred overall) and each
   *  particle's hand→curve→wave timing is **staggered** so the three states blend seamlessly rather
   *  than snapping. Cheap (pure trig, no curl noise) so it doesn't tank the frame at 33k. */
  vortex: {
    /** How fully particles are pulled onto the streams at the peak (0–1). */
    strength: number;
    /** Widens/sustains the peak (the `sin(π·wave)` envelope is ×`plateau` then clamped to 1).
     *  Kept modest so particles pass *through* the curves rather than freezing on them (seamless). */
    plateau: number;
    /** Number of distinct meandering streams (curves). */
    strands: number;
    /** How far the stream bases spread across X, symmetric about the axis (world units) — the
     *  group stays centred, so no net left/right drift. */
    spread: number;
    /** Radius of each stream's dust halo (world units) — how far the sparse particles spread out
     *  from that stream's bright centreline. */
    radius: number;
    /** How tall the column rises above the hand's base (world units) — the vertical extent,
     *  kept large vs `radius` so the streams read as tall vertical curves, not squat discs. */
    height: number;
    /** Amplitude of each spine's side-to-side **snake** (world units) — the S-curve wander. */
    meander: number;
    /** Number of snake wiggles up the full height. */
    meanderFreq: number;
    /** Density concentration toward each spine (radius = `radius · rj^coreBias`): >1 packs most
     *  particles into a tight bright core with a thinning dust halo outward. */
    coreBias: number;
    /** Radians the halo swirls around its spine per unit height — subtle rotation for life. */
    twist: number;
    /** Animation speed of the swirl + the slow drift of the snakes over time, rad/s. */
    spin: number;
    /** Per-particle timing spread of the hand→curve→wave journey (fraction of the morph, 0–~0.5).
     *  Higher = particles peel off the hand and rejoin the wave at more different times → a more
     *  seamless, flowing morph instead of the whole cloud moving in lockstep. */
    stagger: number;
    /** Emissive multiplier on the bright spines (fades out into the dust halo). */
    flash: number;
  };
  /** Size multiplier applied as particles spread into the wave. */
  sizeBoost: number;
  /** Extra darkening of wave troughs so the sparse curtain reads on the light scene. */
  troughShade: number;
  /** Emissive lift on settled **crests**, tinted with `bloomParticles` (orange). High enough
   *  with the lit bead to clear `bloom.threshold` on the peaks; troughs stay dark. */
  lift: number;
  /** Settled-curtain albedo. `--ink` #3F2210 — same roast as the glyph / hand / tree. */
  settleColor: string;
  /** Progress window over which the hand transforms into the wave. */
  transformRange: [number, number];
  seed: number;
}

/** Idle life applied to *every* figure at rest: a slow, super-smooth per-particle
 *  shimmer, plus an always-on white glow on the biggest particles (which — with the
 *  cursor-touched ones — are the only things the bloom pass catches). */
export interface IdleConfig {
  /** Amplitude of the per-particle positional shimmer, in world units. */
  amplitude: number;
  /** Base angular speed of the shimmer, radians/second — kept low for slow drift. */
  speed: number;
  /** Per-frame easing floor so the slow shimmer isn't over-damped at rest. */
  relax: number;
  /** Emissive glow on the biggest particles (scaled by the cloud's `bloomMask`). */
  bigGlow: number;
}

/** **GPU idle life** — a slow tinted band that drifts through each resting cloud plus a gentle
 *  whole-form sway, both computed in the vertex shader off a `uTime` uniform (so even the baked
 *  ~150k tree breathes without a CPU pass). `flow` is the band's emissive strength — kept well
 *  below `bloom.threshold` so it *tints* rather than blooms; `sway` is world units. */
export interface LifeConfig {
  /** Colour of the flowing tint band (all clouds share it — one accent, not a rainbow). */
  color: string;
  /** Per cloud: `flow` = tint-band strength, `sway` = per-particle GPU shimmer (world units),
   *  `rock` = whole-mesh yaw oscillation about the figure's own vertical axis (radians, peak),
   *  `bob` = whole-mesh vertical float (world units, peak). Rock/bob are CPU mesh transforms
   *  (two writes per frame) applied in the render loop — see `rockMesh` in `particle-scene.tsx`. */
  glyph: { flow: number; sway: number; rock: number; bob: number };
  hand: { flow: number; sway: number; rock: number; bob: number };
  tree: { flow: number; sway: number; rock: number; bob: number };
  /** Cursor parallax on the figures: peak radians of yaw / pitch each figure eases toward the
   *  pointer (low-passed, on top of its idle rock; zero on touch). Kept small — past ~0.1 rad
   *  the pointer-repulsion and hover simulations, which measure from unrotated rest positions,
   *  start visibly missing the cursor. */
  cursorTilt: { yaw: number; pitch: number };
}

/** Sparse **accent motes** that rise and dissolve — depth cue over the wave "terrain" and around
 *  the tree. Fully GPU-driven (one `uTime` uniform per frame): each mote loops up its `rise`
 *  span, fading in at the start and out before the top, with a small sway amplitude. */
export interface MotesConfig {
  count: number;
  /** World centre of the emitter box (its floor). */
  center: Vector3Tuple;
  /** Half-extents of the emitter box across X / Z. */
  spreadX: number;
  spreadZ: number;
  /** Vertical span each mote climbs before recycling. */
  rise: number;
  /** Sway amplitude (small, so the climb reads as drift, not orbit). */
  sway: number;
  /** Rise speed range in cycles/second — [min, max], randomised per mote. */
  speed: [number, number];
  size: number;
  opacity: number;
  /** Emissive-style accent colour (rendered additively). */
  color: string;
  seed: number;
}

/** Scroll choreography: the camera flight and the timing of each effect. */
export interface SequenceConfig {
  /** Scroll length in viewport heights — how much scroll the whole run takes. */
  scrollVh: number;
  /** Extra viewport-heights after `scrollVh` so the tree tableau can sit before the next act.
   *  Does not stretch hero-scene progress — progress is already 1 for this hold. */
  treeHoldVh: number;
  /** Progress at which the camera starts dollying (holds at the start before). */
  dollyStart: number;
  /** Progress at which the camera reaches the hand; roll completes here, then the
   *  final push-in + look-up runs from here to 1. */
  arrive: number;
  /** Progress at which the X→hand→wave act finishes and the **tree section** begins. The whole
   *  earlier sequence is remapped onto `[0, treeStart]`. At `treeStart` the wave **freezes in
   *  place** and a screen-space wipe reveals the tree scene over it. */
  treeStart: number;
  /** Progress window [start, end] of the screen-space wipe — a tilted line sweeps bottom-up,
   *  revealing the (separately-framed) tree view over the frozen wave view. */
  wipeRange: [number, number];
  /** Screen-space slope of the wipe line (0 = level; larger = more tilted top edge). */
  wipeTilt: number;
  /** Parallax: how far (screen fraction) the wave view drifts **down** across the wipe. */
  wipeWaveDrop: number;
  /** Parallax: how far (screen fraction) the tree view **descends into place** across the wipe
   *  (it starts this much higher and settles to rest by the end — a different rate than the wave,
   *  which reads as depth). */
  wipeTreeDrop: number;
  /** Progress window over which the tree **materialises bottom-up** (GPU `uScan` 0 → 1). Deliberately
   *  *later* than the wipe: the wipe should uncover an empty lattice and the tree grow into it. Run
   *  the two together and the tree is already standing wherever the wipe has passed, which reads as
   *  the finale arriving fully formed. */
  treeScanRange: [number, number];
  /** The glyph's **intro assembly** once the preloader hands the page over: every particle flies
   *  in from around the camera and settles onto its spot in the X. Unlike every other timing here
   *  `seconds` is **wall-clock, not scroll** — the glyph is already on screen at progress 0, so
   *  there is no scroll window to hang it on. `spread` scales how widely the launch points
   *  scatter around the camera; `glow` is the pink emissive a particle carries mid-flight.
   *  The hero net waits until the X is `netDelay` of the way assembled, then weaves in over
   *  `netWeaveSeconds` — the cage closes around an almost-finished figure. */
  intro: { seconds: number; spread: number; glow: number; netDelay: number; netWeaveSeconds: number };
  camera: {
    startPos: Vector3Tuple;
    endPos: Vector3Tuple;
    startTarget: Vector3Tuple;
    endTarget: Vector3Tuple;
    /** Camera pose when the wave act ends (at `treeStart`) — pitched up off the hand, looking
     *  out over the wave field. The main camera **holds here** through the wipe (the wave stays
     *  in place). */
    finalPos: Vector3Tuple;
    finalTarget: Vector3Tuple;
    /** Base pose of the separate tree camera — frames the tree head-on (like the X). Its
     *  view is composited over the wave by the wipe; the render loop adds a slow drift around
     *  this pose so the finale has parallax life. */
    treePos: Vector3Tuple;
    treeTarget: Vector3Tuple;
    /** **Peak** roll in radians across the fly. The roll runs on a `sin(π·t)` envelope — it
     *  banks out to this angle mid-flight and settles back upright by `arrive` (the old full 2π
     *  barrel roll read as a gimmick; a small bank keeps the immersion without the spin). */
    roll: number;
  };
  /** Progress window [start, end] over which the glyph scatters. */
  scatterRange: [number, number];
  /** Progress window over which the containment net collapses downward. */
  netRange: [number, number];
}

/** PBR finish of a surface. `envMapIntensity` needs a scene environment to show. */
export interface MaterialFinish {
  roughness: number;
  metalness: number;
  envMapIntensity: number;
}

export interface SceneConfig {
  colors: SceneColors;
  /** Surface finishes. */
  materials: {
    particle: MaterialFinish;
  };
  glyph: GlyphConfig;
  hand: HandConfig;
  tree: TreeConfig;
  /** World anchor of the hand act (where its containment net stands). */
  handAnchor: Vector3Tuple;
  /** World anchor of the tree act, below/behind the wave. */
  treeAnchor: Vector3Tuple;
  field: FieldConfig;
  pointer: PointerConfig;
  scatter: ScatterConfig;
  wave: WaveConfig;
  idle: IdleConfig;
  /** GPU idle life — the flowing tint band + whole-form sway per cloud. */
  life: LifeConfig;
  /** Rising accent motes over the wave "terrain" and around the tree. */
  waveMotes: MotesConfig;
  treeMotes: MotesConfig;
  sequence: SequenceConfig;
  dust: DustConfig;
  camera: {
    fov: number;
  };
  fog: { near: number; far: number };
  /** **Pink bloom particles — the main colour/intensity knob.** The dramatic pink-glowing beads
   *  (the X **scatter burst**, the hand→wave **vortex streams**, and the **hand scan-in**) all take
   *  their emissive colour from here; pair it with `bloom` (the bloom pass) to tune the look. */
  bloomParticles: BloomParticlesConfig;
  /** Custom additive bloom on the particles (UnrealBloomPass renders black here —
   *  ADR-0015). See [[bloom-pass]]. */
  bloom: BloomConfig;
  vignette: { offset: number; darkness: number };
  /** Exposure of the ACES filmic tone mapping. */
  exposure: number;
}

/** Colour + emissive strength of the **pink bloom particles** (scatter burst / vortex streams /
 *  hand scan-in). One place to recolour all of them; `SceneConfig.bloom` controls how they bloom. */
export interface BloomParticlesConfig {
  /** Emissive colour of the pink beads (hex). */
  color: string;
  /** Emissive multiplier (HDR). Must clear `bloom.threshold` on at least one channel to bloom. */
  glow: number;
}

/** Custom additive bloom — bright pixels are blurred and added back, making the white
 *  particles glow and softening them (a slight blur). See [[bloom-pass]]. */
export interface BloomConfig {
  /** Luminance above which a pixel blooms (0–1) — tuned to catch the white particles. */
  threshold: number;
  /** How strongly the blurred bloom is added back over the sharp frame. */
  strength: number;
  /** Base blur radius (half-res px); each of the two iterations widens it. */
  radius: number;
}

/** === ORANGE BLOOM PARTICLES — TUNE HERE ===
 *  Scatter burst, vortex streams, hand scan-in. Saturated orange — `#b27b45` read brown,
 *  `--heat` bloomed pink. Green channel is what keeps this orange (not red, not brown). */
const BLOOM_PARTICLES: BloomParticlesConfig = {
  color: "#ff6a00",
  glow: 5.5,
};

export const sceneConfig: SceneConfig = {
  bloomParticles: BLOOM_PARTICLES,
  colors: {
    // Roast-light room. Hexes match `src/styles/tokens.css`. Fog equals
    // `backdropBottom` so the horizon doesn't seam. `--scene-backdrop` in tokens
    // is kept in sync with `fog`.
    fog: "#fff2db",
    backdropTop: "#fffaf3",
    backdropBottom: "#fff2db",
    particle: "#3f2210",
    field: "#3f2210",
    keyLight: "#fffaf3",
    skyFill: "#fffaf3",
    groundFill: "#fff2db",
    dust: "#3f2210",
  },
  materials: {
    // Matte ink. Metalness would tint the beads off-palette, so it stays at zero
    // and the environment contribution is almost switched off. Opaque.
    particle: { roughness: 0.98, metalness: 0, envMapIntensity: 0.08 },
  },
  glyph: {
    // Surface-sampled bean (~14k baked). Subsample on tablet/mobile; do not upsample.
    count: 14000,
    // Flatter bean (coffee_beans1) — height-2 × 8 ≈ 16 tall, ~11 wide, thin in Z.
    scale: 8,
    particleSize: 0.12,
    sizeJitter: 0.55,
    // Turned about Y so the glyph reads in 3D rather than face-on.
    rotation: Math.PI / 7,
    center: [0, 11, 0],
    // Front-top-left — lights the X's large front faces so they read as the lit side, the
    // sides/back falling into shadow (drives both the baked form shade and the key light).
    lightDirection: [-14, 26, 34],
    // ~4% of beads are 2× size with a saturated white bloom, scattered through the form.
    bigFraction: 0.04,
    bigScale: 2,
    seed: 20260720,
  },
  hand: {
    // Trophy model (was a hand — see hand-particles.ts). Normalised to height 2; scale ~7 → a
    // ~14-unit trophy. Starting point; re-tune once seen in frame.
    scale: 7,
    // Same bead size as the glyph.
    particleSize: 0.1,
    sizeJitter: 0.4,
    // Centred on the hand anchor (z −110), framed by the camera end.
    center: [0, 8, -110],
    lightDirection: [-18, 42, 16],
    bigFraction: 0.04,
    bigScale: 2,
    // The trophy stands upright — no palm angle to turn toward. A small yaw can be dialled back
    // in if the silhouette reads better off-axis.
    rotation: 0,
    // No upsample — the trophy is baked at ~14k, dense enough on its own (unlike the old 4173-point
    // hand). Jitter-copying would fill the cup interior and the handle gaps, killing the silhouette.
    density: 1,
    // Kept from the hand: over half the beads sit out the resting figure and arrive with the wave,
    // so it reads as an airy sketch rather than a solid, while the curtain still gets every instance.
    sparse: 0.55,
    // Emissive strength of the bottom-up scan-in band. Tinted with `--heat`
    // (`bloomParticles.color`); must still clear `bloom.threshold`.
    scanGlow: 6,
    seed: 90210,
  },
  tree: {
    // Model is normalised to height 2; scale ~8 → a ~16-unit tree, so the glyph's containment
    // net (height 18) wraps it just like the X — same environment.
    scale: 8,
    // Small, dense beads — a finer, sandier tree volume (smaller than the glyph/hand).
    particleSize: 0.08,
    sizeJitter: 0.4,
    // On the tree anchor (z −175), down-range past the wave.
    center: [0, 9, -175],
    // Front-top-left, like the glyph — the lit side faces the camera.
    lightDirection: [-14, 26, 34],
    bigFraction: 0.04,
    bigScale: 2,
    rotation: 0,
    // Upsample 50k → ~150k (×3): finer, denser cloud to go with the smaller beads.
    density: 3,
    // Heat band on the bottom-up materialise, same meaning (and the same bloom
    // threshold to clear) as `hand.scanGlow`. Lower than the hand's 6: the tree's
    // beads are smaller and much denser, so an identical per-bead emissive piles
    // up into a solid glowing slab.
    scanGlow: 4.2,
    seed: 71717,
  },
  handAnchor: [0, 0, -110],
  // Tree anchor — down-range past the wave (wave centre z −120) so nothing occludes it; the
  // camera flies forward past the wave to frame it.
  treeAnchor: [0, 0, -175],
  field: {
    // Equal radii — a straight cylinder, not a flared cone.
    radiusTop: 7.6,
    radiusBottom: 7.6,
    height: 18,
    radialSegments: 56,
    heightSegments: 20,
    // Strength at the waist; the shader fades it to zero at both ends.
    opacity: 0.32,
    centerY: 10.5,
    // Hero net ×1.2 with the ×1.2 X (radial extent ~8.6 vs radius 9.1 — near-touching, on purpose).
    heroScale: 1.2,
    // Slow forever-turn of every cage (~80 s/rev) — enough to read as alive, never as a carousel.
    spin: 0.08,
  },
  pointer: {
    // Radius trades off against readability: much past 5 the cursor engulfs the
    // whole glyph and the "X" collapses into a ball instead of parting around it.
    radius: 5,
    strength: 6,
    relax: 0.22,
    returnRelax: 0.035,
    // Hover accent — peach, so scan/reveal can keep `--heat` as the one hot colour.
    color: "#ffe5bf",
    // Blooms now (custom BloomPass), so a lower glow reads as a soft halo, not a white blob.
    glow: 3.6,
  },
  scatter: {
    // Curl-driven strands, twisted into spiralling ribbons as they extend. Kept
    // short of the camera's standoff so the burst never reaches it.
    distance: 26,
    radial: 0.4,
    stagger: 0.25,
    twist: 0.3,
    // A gentle coherent rotation of the whole ribbon field is the main "alive"
    // motion; the wander rides the ribbon tangent for a small extra flow. Both
    // stay modest — too much wander smears the thin ribbons back into a cloud.
    drift: 0.28,
    wander: 0.8,
    // Fraction of +Z (toward the camera's start) motion kept. Low, so the burst
    // opens sideways/backward and the advancing camera flies through a clear
    // corridor even though it moves at the same time as the scatter.
    towardCamera: 0.22,
    // After forming, the ribbons reflow into world-space streamers strung along the flight
    // corridor; the camera flies through them (parallax, no lag, no lens-locked spin).
    flight: {
      // Just a couple of distinct curves.
      ribbons: 3,
      radius: 14,
      bend: 0.8,
      bendWaves: 2.2,
      turn: 1.4,
      speed: 0.5,
      // Lifted + vertically squashed so ribbons stay above the floor (no sinking in). A hard
      // floor clamp in `updateCloud` catches the far/wide parts that would still dip below.
      axisY: 14,
      vScale: 0.5,
      // Start just ahead of the glyph, run past the hand (z −110).
      zStart: -6,
      zEnd: -120,
      // Mild far-widening so perspective doesn't pull the far parts into the centre (too much
      // makes a giant cone that leaves the frame).
      spread: 0.5,
      // Very thin round-tube radius — thread-like curves.
      thickness: 0.2,
      // Exit: each ribbon's head sweeps out to its side along a curving arc; the body streams
      // along the path the head traced (strong lag).
      exitDistance: 60,
      exitCurve: 1.3,
      exitLift: 14,
      exitSpan: 1.2,
    },
    // Pink bloom colour/intensity — sourced from the shared `BLOOM_PARTICLES` knob (top of file).
    color: BLOOM_PARTICLES.color,
    glow: BLOOM_PARTICLES.glow,
  },
  wave: {
    // Destination grid for the trophy's ~14k particles (no upsample — see hand.density). A wide
    // grid tilted back and set to the lower-left, so it sits in that corner at an oblique angle,
    // bleeds off the near edges, and its far edge dissolves into fog. `columns × rows` must cover
    // the particle count (140×100 = 14000). `spacing` kept at the old value as a starting point —
    // with a third of the old cell count this reads narrower than the hand's curtain did; re-check
    // in browser and widen `spacing` if it needs to fill the frame the same way.
    columns: 140,
    rows: 100,
    spacing: 0.41,
    // Slightly left and closer; the plane's own tilt + yaw (not a camera yaw) create the
    // diagonal bottom-left composition, and the tilt sends the top into the fog.
    center: [-8, 33, -120],
    tilt: 0.45,
    // Swing the right side of the plane back into the fog → recedes to the top-right.
    yaw: 0.6,
    // Outer quarter of the grid fades out, so no hard border shows anywhere in frame.
    edgeFade: 0.28,
    amplitude: 5,
    freqX: 0.16,
    freqY: 0.2,
    speed: 0.5,
    // The morph routes through **several meandering bright streams** — a few dense glowing spines
    // that snake up the column (S-curves) in a dust halo, staggered so hand→curves→wave blends seamlessly.
    vortex: {
      // Full pull onto the streams at the peak.
      strength: 1,
      // Modest plateau — particles pass through the curves rather than freezing (seamless).
      plateau: 1.3,
      // A few distinct curves.
      strands: 4,
      // Spread the curve bases across X, symmetric about the axis (stays centred overall).
      spread: 24,
      // Very tight tube → thin dense thread-like curves, like the X→hand flight ribbons (not fluffy).
      radius: 2,
      // Rises well above the hand — the vertical extent that dominates the shape.
      height: 46,
      // Side-to-side snake of each bright spine.
      meander: 9,
      // ~1.6 wiggles up the height (the S-curve of the reference).
      meanderFreq: 1.6,
      // Pack the particles hard onto the spine → even the tail stays close, so the thread stays thin.
      coreBias: 6,
      // Subtle halo swirl.
      twist: 5,
      // Slow animation of the swirl + snake drift.
      spin: 0.8,
      // Stagger for a gradual blend, but trimmed so more particles sit crisply on the thread at once
      // (a wider stagger scatters mid-journey particles into a fluffy cloud around the curves).
      stagger: 0.26,
      // Bright glowing spines.
      flash: 2.2,
    },
    // Small grid dots — a finer, sandier curtain (the grid is denser now).
    sizeBoost: 0.9,
    // Troughs drop toward ink so the curtain has the same roast depth as the other figures.
    troughShade: 0.48,
    // Crest bloom — orange `#ff6a00` via `bloomParticles`; peaks clear the threshold, troughs don't.
    lift: 5.5,
    settleColor: "#3f2210",
    // Start the crumble later — the hand holds framed for a beat after the camera arrives — then
    // run the morph over a long window so it plays out gradually and settles gently into the wave.
    transformRange: [0.66, 0.99],
    seed: 4242,
  },
  idle: {
    // A little bigger + much slower — a super-smooth float that adds depth, never fast.
    amplitude: 0.16,
    speed: 0.18,
    relax: 0.05,
    // Saturated white emissive on the oversized "hero" beads (the `bigFraction` subset), so
    // they read as bright glowing points and feed the bloom pass. Set well above the lit-white
    // range of ordinary beads (~2.6 with the key light) so the bloom threshold can isolate
    // *only* these. Only these beads carry it (their `bloomMask` is 1, everyone else 0).
    bigGlow: 5,
  },
  life: {
    // The shared accent — the same violet family as the bloom particles, so the flowing band
    // reads as the site's one accent moving through the forms, not a second colour.
    color: BLOOM_PARTICLES.color,
    // Flow strengths sit far below `bloom.threshold` (3.5) — a visible tint drifting through the
    // white beads, never a glow. Sway is extra world-unit motion on top of the CPU idle shimmer;
    // the tree leans on it hardest because it is baked and gets no CPU idle at all. Rock/bob are
    // the whole-figure float: the X turns the furthest (~7° peak — the "rotate left and right"
    // hero move), the hand and tree keep a subtler drift inside their static framings.
    glyph: { flow: 0.55, sway: 0.05, rock: 0.12, bob: 0.3 },
    hand: { flow: 0.45, sway: 0.04, rock: 0.045, bob: 0.12 },
    tree: { flow: 0.8, sway: 0.14, rock: 0.055, bob: 0.18 },
    // ~4° of yaw and ~2.3° of pitch at the screen edges — a glide, not a drag-orbit.
    cursorTilt: { yaw: 0.07, pitch: 0.04 },
  },
  waveMotes: {
    // Sparse sparks drifting up the face of the wave curtain — a depth cue between the camera
    // and the rippling field. Small amplitude, slow, dissolving well before the top.
    count: 130,
    center: [-8, 18, -116],
    spreadX: 34,
    spreadZ: 10,
    rise: 22,
    sway: 0.9,
    speed: [0.02, 0.05],
    size: 0.42,
    opacity: 0.72,
    color: BLOOM_PARTICLES.color,
    seed: 5150,
  },
  treeMotes: {
    // Fireflies around the finale tree — tighter box hugging the crown, slightly larger/brighter
    // than the wave's so the last act reads the most alive.
    count: 110,
    center: [0, 3, -175],
    spreadX: 11,
    spreadZ: 9,
    rise: 20,
    sway: 1.2,
    speed: [0.025, 0.06],
    size: 0.5,
    opacity: 0.65,
    color: BLOOM_PARTICLES.color,
    seed: 6060,
  },
  sequence: {
    // Longer now — the X→hand→wave act is remapped onto [0, treeStart] and the tree section
    // onto [treeStart, 1]; scroll grown so each act keeps plenty of scroll.
    scrollVh: 1180,
    treeHoldVh: 100,
    // Camera and scatter run together from the very start; the burst avoids the
    // camera corridor (scatter.towardCamera) and dissolves, so the dolly stays
    // clean without holding.
    dollyStart: 0.02,
    // The fly lands on the hand here (roll completes); the lift-and-look runs to 1.
    // NB: `arrive` and every other boundary below are in **remapped** progress (0..1 over the
    // X→hand→wave act), which occupies real progress [0, treeStart].
    arrive: 0.56,
    // Real progress at which the wave act ends; the wave freezes and the wipe takes over.
    treeStart: 0.72,
    // The screen-space wipe sweeps the tree in over the frozen wave across this window.
    wipeRange: [0.74, 0.95],
    // Tilt of the sweep line (top edge angled, not level).
    wipeTilt: 0.4,
    // Parallax: wave drifts down, tree descends into place at a different rate → depth.
    wipeWaveDrop: 0.07,
    wipeTreeDrop: 0.045,
    // Starts with the wipe ~2/3 up the frame (so there is a bare lattice to grow into) and finishes
    // just short of the end, with the tree still filling out as the finale copy animates in.
    treeScanRange: [0.88, 0.99],
    // The fly-in reads as a story beat, so it gets a little longer than the old 1.2 s scan; the
    // hero copy is now staggered to land *with* it (the words finish as the X settles), so the
    // page never shows finished words over a still-assembling form. `spread` scales the launch
    // scatter around the camera (via each particle's random flow vector); `glow` is the pink
    // comet trail carried mid-flight (clears `bloom.threshold` at its peak so the streams bloom).
    // netDelay 0.75: the cage starts weaving once the X is ~3/4 collected, closing around a
    // nearly-finished figure over its own 1.4 s window.
    intro: { seconds: 1.8, spread: 11, glow: 4.2, netDelay: 0.75, netWeaveSeconds: 1.4 },
    camera: {
      // Start frames the glyph at the reference angle, set back so the lattice sits at the same
      // ~50-unit distance as the hand's in the end framing (was z 40 ≈ 40 units).
      startPos: [0, 12, 50],
      endPos: [0, 12, -60],
      startTarget: [0, 10, 0],
      endTarget: [0, 8, -110],
      // Final: a pure upward pitch off the hand (no sideways drift — x stays 0). The
      // wave is positioned lower-left in world so it still lands in the bottom-left
      // corner; the camera just rotates up to it.
      finalPos: [0, 15, -92],
      finalTarget: [0, 48, -134],
      // Static tree camera: frames the tree (anchored at z −175, centre y 9) head-on, **~50 units
      // back** — matching the X start / hand end standoff (both ~50 units) so the tree is framed at
      // the same scale as the other scenes, not zoomed in. Composited over the wave by the wipe.
      treePos: [0, 12, -125],
      treeTarget: [0, 9, -175],
      // A gentle ~15° bank at the flight's midpoint, back upright by `arrive` (sin envelope) —
      // the full 2π barrel roll read as tacky.
      roll: 0.26,
    },
    // Scatter resolves early while the camera approaches, then dissolves.
    scatterRange: [0.02, 0.28],
    netRange: [0.02, 0.26],
  },
  dust: {
    count: 700,
    spread: 38,
    height: 34,
    // Small motes — at 0.5 they read as white blobs covering empty space rather than fine air.
    size: 0.3,
    opacity: 0.72,
    // 0 — no chromatic fringe; the motes are plain round soft dots.
    dispersion: 0,
    seed: 77,
  },
  camera: {
    fov: 32,
  },
  fog: { near: 25, far: 130 },
  // Selective bloom on an HDR (HalfFloat) composer buffer: the threshold sits **above** the
  // lit-white range of ordinary beads (~2.6) but below the glowing hero beads (lit + `bigGlow`
  // 5 ≈ 7) and the scatter/cursor emissive, so only those bloom — never the lit cloud or
  // backdrop (that scene-wide haze is exactly what got bloom removed before).
  bloom: { threshold: 3.5, strength: 1.5, radius: 1.9 },
  vignette: { offset: 1, darkness: 1.25 },
  exposure: 1,
};
