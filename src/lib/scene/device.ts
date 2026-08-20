/**
 * The single source of device tiering for the 3D scene.
 *
 * One module decides what "mobile" means; DPR, particle counts, bloom, the frame
 * budget and whether the pointer is listened to at all read from it, so those
 * values can never drift apart.
 *
 * **Read once at scene construction.** A device does not change tier mid-session, and rebuilding
 * particle buffers on a resize costs far more than the mismatch is worth.
 *
 * 📖 Docs: obsidian/frontend/components/common.md
 */

export type DeviceTier = "mobile" | "tablet" | "desktop";

const TABLET_MAX = 1180;
const MOBILE_MAX = 768;

/** The coarse-pointer clause is what catches tablets and large phones that clear the width test. */
export const deviceTier = (): DeviceTier => {
  if (typeof window === "undefined") return "desktop";
  const width = window.innerWidth;
  const coarse =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(hover: none) and (pointer: coarse)").matches;

  if (width < MOBILE_MAX || coarse) return "mobile";
  if (width < TABLET_MAX) return "tablet";
  return "desktop";
};

/**
 * Below 1.0 on mobile: a 3× phone renders **9×** the fragments of a 1× screen, and this scene is
 * fill-bound — soft round particle sprites, additive glow, a full-screen bloom chain. At 0.85× the
 * browser upscales and it is invisible on those edges. The wireframe containment net and the podium
 * rim are the only hard edges, and they sit behind fog.
 */
const MOBILE_MAX_DPR = 0.85;

export const clampedPixelRatio = (tier: DeviceTier = deviceTier()): number => {
  if (typeof window === "undefined") return 1;
  const dpr = window.devicePixelRatio || 1;
  if (tier === "mobile") return Math.min(dpr, MOBILE_MAX_DPR);
  if (tier === "tablet") return Math.min(Math.max(dpr, 0.75), 1.25);
  return Math.min(Math.max(dpr, 0.75), 1.5);
};

/**
 * Minimum ms between scene frames. 30 fps on a phone is the single biggest win available here: the
 * scene is fill-bound, not motion-bound — the camera flight and the particle drift both evolve
 * slowly enough that halving the rate is genuinely hard to see. Throttled **per ticker subscriber**,
 * so capping the scene never slows the springs and DOM reveals sharing the same loop.
 *
 * Desktop is capped at ~60 fps too (14 ms): a 120 Hz ProMotion / 144 Hz gaming display otherwise
 * runs the whole pipeline — 32k-instance update, 2.8 MB matrix upload, shadow pass, bloom chain —
 * at double rate for motion this slow. 14 ms (not 16.7) so a 60 Hz display's ~16.7 ms ticks always
 * clear the budget (no accidental 30 fps), while 120 Hz drops every other tick → an even 60.
 */
export const frameBudgetMs = (tier: DeviceTier = deviceTier()): number => {
  if (tier === "mobile") return 1000 / 30;
  if (tier === "tablet") return 1000 / 45;
  return 14;
};

export const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Best-effort "spend less here". Data Saver is the nearest web-exposed proxy for iOS Low Power Mode,
 * which has no API. Both inputs are absent on most desktops, so this only ever trips on a
 * constrained client.
 */
export const isEnergySaver = (): boolean => {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean };
    deviceMemory?: number;
  };
  if (nav.connection?.saveData === true) return true;
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory > 0) {
    return nav.deviceMemory <= 2;
  }
  return false;
};

/**
 * Whether to stop drawing once the scene has settled. WebGL keeps the last frame on the canvas, so a
 * frozen scene costs nothing. **Not used to skip the scroll sequence** — this scene *is* the scroll
 * narrative, so freezing it would break the page; it only drops the idle/ambient redraw.
 */
export const sceneShouldFreeze = (tier: DeviceTier = deviceTier()): boolean =>
  prefersReducedMotion() || (tier === "mobile" && isEnergySaver());

/**
 * Point sizes and glow are set in device px, so a look tuned on a tall screen occupies a larger
 * fraction of a short one — additive sprites pile up and bloom blows out. Scale against a reference.
 */
const VIEW_SCALE_REFERENCE = 1080;
export const viewScale = (): number =>
  typeof window === "undefined"
    ? 1
    : Math.min(1, Math.max(0.5, window.innerHeight / VIEW_SCALE_REFERENCE));

/** Whether to attach pointer listeners at all — not "attach and ignore". */
export const wantsPointer = (tier: DeviceTier = deviceTier()): boolean => tier !== "mobile";

export const byTier = <T,>(tier: DeviceTier, values: Record<DeviceTier, T>): T => values[tier];
