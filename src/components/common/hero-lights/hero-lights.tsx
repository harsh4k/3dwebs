// 📖 Docs: obsidian/frontend/components/common.md
"use client";

import { animated, to, useSpring } from "@react-spring/web";
import { useEffect } from "react";

import { sceneConfig } from "@/components/common/scene";
import { isPageRevealed } from "@/components/common/scene/scene-ready";
import { getScrollProgress } from "@/utils/scroll-progress";

/**
 * Decorative light-flare overlays for the particle scene. Three blended layers that **parallax the
 * cursor** for a subtle depth feel — in every act (X/hand, wave, tree finale) except the wave→tree
 * wipe, where they are cut to the wipe line and must hold still (`isWipeMasked`):
 *  1. `light_1` — full-frame diffuse light rays, `mix-blend-mode: overlay` (darkens
 *     the studio and adds the bright diagonal streak).
 *  2. `light_2` — a soft glint anchored bottom-left, `mix-blend-mode: plus-lighter`,
 *     feathered so the added light fades out instead of showing a hard rectangle.
 *  3. `light_3` — a full-frame bokeh flare, `mix-blend-mode: overlay`.
 *
 * **Flares change with the acts:** `light_1` + `light_2` own the head-on **X / hand** view; `light_3`
 * owns the **wave**; and the **tree** (the last act) gets `light_1` + `light_2` back — like the first.
 *  - **X/hand → wave** (the camera crane-up): `light_1`/`light_2` fade **out** and `light_3` fades
 *    **in** by a plain opacity crossfade (`handoffAt`), complete just before the wave forms.
 *  - **wave → tree**: the two flare sets swap **through the *same wipe* that swaps the scenes** — the
 *    tilted screen-space line of `WipePass`. `light_3` is masked to the **wave side** of the line and
 *    `light_1`/`light_2` to the **tree side**, so as the wipe sweeps the tree in, the flares hand over
 *    exactly with it (`wipeMaskFields` reconstructs the line; `edgeFor` solves each layer's cut).
 *
 * The mask CSS vars are set on **this component's own root element** (not `:root`), and the line is
 * shared with `WaveOverlay` through the **`wipeLine` module** rather than a CSS variable — per-frame
 * writes to inherited custom properties on `:root` dirty the whole document's style every frame.
 *
 * The layers also **roll with the camera** on the first transition: the 3D camera rolls a full turn,
 * so `light_1`/`light_2` rotate about the screen centre by the same angle (read from scroll via the
 * same formula the scene uses). Rotation is applied to **each layer's own transform** (not a wrapper):
 * a transformed/masked wrapper would create a stacking context that isolates the layers'
 * `mix-blend-mode` from the canvas (they'd stop blending and go dark). `light_1` is authored **square**
 * and sits in a centred square `RAYS_SIZE` (≥ the viewport diagonal) so rotating it never exposes an
 * edge. `light_3` needs no roll/oversize (the camera's turn is done by its act), so a plain `inset-0`.
 *
 * Motion is spring-based (`@react-spring/web`, hard rule #1): a pointer listener sets the parallax
 * targets (smoothed), while roll/opacity are set immediately (the Lenis-smoothed scroll makes it
 * smooth, and it must track the camera exactly). Non-interactive (`pointer-events-none`).
 */

/** Drift, in px, at the screen edge. The layers move opposite ways (depth).
 *
 * Each is bounded by how much slack its layer has before an edge shows, and those bounds differ a
 * lot — see `RAYS_SIZE`, `BOKEH_OVERHANG_VMAX` and `GLINT_FEATHER`. The glint is the tight one: its
 * box's top and right edges sit *inside* the viewport and only the feather hides them, so it keeps
 * the figure that has been on screen since the hero rather than gaining a new one. */
const RAYS_DRIFT = 32;
const GLINT_DRIFT = 46;
const BOKEH_DRIFT = 34;
/** Sign of the overlay roll relative to the camera roll (so the flares turn *with* the world). */
const ROLL_SIGN = -1;
/** Side of the (square) rays layer. A centred square only fully covers the viewport at **every**
 *  rotation angle when its side ≥ the viewport diagonal; `130vmax` clears that for all common
 *  desktop aspect ratios (16:9 needs ~115%, 4:3 ~125%), so rotating it never exposes an edge. */
const RAYS_SIZE = "130vmax";
/** Slack left over after the rotation clearance above, at the widest common desktop ratios: the
 *  inscribed circle of a 130vmax square clears a 16:9 viewport's diagonal by ~87 px at 1440×900, and
 *  `RAYS_DRIFT` has to fit inside that. Widen `RAYS_SIZE` before raising the drift. */
/** How much of the remapped `sp` the X/hand → wave crossfade takes as the camera cranes up off the
 *  hand (from `arrive`). Wide → a slow fade that finishes **just before the wave forms**. */
const FLARE_FADE_SPAN = 0.42;
/** `light_3` is oversized by this overhang **per side** (vmax), so its cursor parallax (during the
 *  wave) never drags the viewport edge into view. `inset: -Nvmax` on the box; the same figure feeds
 *  `edgeFor` so its wipe cut still lands on the line. Must exceed `BOKEH_DRIFT` in px. */
const BOKEH_OVERHANG_VMAX = 10;
/** The glint's own soft edge — it fades well before its box edge (and the box is pushed off the
 *  lower-left corner), so the layer's border never shows, even with the parallax drift. This one is
 *  part of the look, so it's the only mask the flares carry outside the wave→tree transition. */
const GLINT_FEATHER = "radial-gradient(115% 115% at 22% 82%, #000 30%, transparent 68%)";
/** Gradient stop % past the far end of any box — the cut lands outside it, so nothing is cut. */
const NO_CUT = 150;
/** Gradient stop % before the near end of any box — the whole box is on the cut-away side. */
const ALL_CUT = -50;

/**
 * The wave→tree window in which every layer is spatially **cut to the wipe line** — and the only
 * place the flares must hold still.
 *
 * Each layer drifts a different amount, and a layer's mask travels with it, so any drift here slides
 * the tree-side and wave-side cuts apart and opens a dark seam where they no longer meet. Outside
 * this window nothing is masked (`wipeMaskFields` returns `null`) and the layers are free: the
 * X/hand, the **wave**, and the **tree finale** all parallax. Gating on the mask rather than on
 * "anything past `treeStart`" is what gives the finale its parallax back.
 */
const isWipeMasked = (progress: number): boolean =>
  progress >= sceneConfig.sequence.treeStart && progress < sceneConfig.sequence.wipeRange[1];

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const smoother = (t: number): number => t * t * t * (t * (t * 6 - 15) + 10);
const range = (p: number, a: number, b: number): number => clamp01((p - a) / (b - a));

/** The camera's on-screen roll (degrees) at a given scroll progress — mirrors `updateCamera` in
 *  `particle-scene.tsx` (the fly **banks** `roll · sin(π·ep)` over `[dollyStart, arrive]` in the
 *  remapped `sp` — out to the peak mid-flight and back upright by `arrive`). The rays layer is an
 *  oversized centred **square** (`RAYS_SIZE`), so rotating it about the screen centre never
 *  exposes an edge — no cover-scale or crop is involved. */
const rollDegAt = (progress: number): number => {
  const { sequence } = sceneConfig;
  const sp = clamp01(progress / sequence.treeStart);
  const ep = sp <= sequence.arrive ? smoother(range(sp, sequence.dollyStart, sequence.arrive)) : 1;
  return ROLL_SIGN * sequence.camera.roll * Math.sin(Math.PI * ep) * (180 / Math.PI);
};

/** Crossfade progress `0 → 1` across the camera crane-up (from `arrive`, in the remapped `sp`): at
 *  `0` `light_1`/`light_2` own the X/hand view, by `1` (just before the wave forms) `light_3` has it. */
const handoffAt = (progress: number): number => {
  const { sequence } = sceneConfig;
  const sp = clamp01(progress / sequence.treeStart);
  return smoother(range(sp, sequence.arrive, sequence.arrive + FLARE_FADE_SPAN));
};
/** `light_1`/`light_2` opacity: full on X/hand, fading out across the hand-off, then **back to full**
 *  for the tree section (where the wipe *mask* — not opacity — gates them to the tree side). */
const flareOpacityAt = (progress: number): number =>
  progress >= sceneConfig.sequence.treeStart ? 1 : 1 - handoffAt(progress);
/** `light_3` opacity: fades in across the hand-off, holds through the wave, then is gone once the
 *  wipe has fully passed (the tree is up); during the wipe the *mask* gates it to the wave side. */
const bokehOpacityAt = (progress: number): number =>
  progress >= sceneConfig.sequence.wipeRange[1] ? 0 : handoffAt(progress);

/** Screen-space fields of the tree **wipe line** at a given progress, or `null` outside the wave→tree
 *  transition (`[treeStart, wipeRange[1])`) — where no flare is spatially cut. The wipe (`WipePass`)
 *  puts the tree where `lineC < uWipe`, `lineC = vUv.y + (vUv.x − 0.5)·uTilt`, `uWipe = −0.3 + w·1.6`.
 *  `∇lineC` (screen px) sets the mask **angle**; its magnitude converts a `lineC` step to px. */
const wipeMaskFields = (
  progress: number,
): { angleDeg: number; sinT: number; cosT: number; gMag: number; uWipe: number } | null => {
  const { sequence } = sceneConfig;
  if (progress < sequence.treeStart || progress >= sequence.wipeRange[1]) return null;
  const W = window.innerWidth;
  const H = window.innerHeight;
  const uTilt = sequence.wipeTilt;
  const w = range(progress, sequence.wipeRange[0], sequence.wipeRange[1]);
  const uWipe = -0.3 + w * 1.6;
  const gx = uTilt / W;
  const gy = 1 / H;
  const angleRad = Math.atan2(gx, gy);
  return {
    angleDeg: (angleRad * 180) / Math.PI,
    sinT: Math.abs(Math.sin(angleRad)),
    cosT: Math.abs(Math.cos(angleRad)),
    gMag: Math.hypot(gx, gy),
    uWipe,
  };
};

export const HeroLights = () => {
  // `angle`/`edge` describe each layer's wipe cut and are carried **in the spring** (not written to the
  // DOM separately) so the mask and the opacity always land in the **same** write flush — see the
  // `maskImage` interpolations below. `edge` is the gradient stop %: `NO_CUT` = fully shown.
  const [rays, raysApi] = useSpring(() => ({
    x: 0,
    y: 0,
    scale: 1,
    rotate: 0,
    opacity: 1,
    angle: 0,
    edge: NO_CUT,
    config: { tension: 120, friction: 28 },
  }));
  const [glint, glintApi] = useSpring(() => ({
    x: 0,
    y: 0,
    scale: 1,
    rotate: 0,
    opacity: 1,
    angle: 0,
    edge: NO_CUT,
    config: { tension: 90, friction: 26 },
  }));
  // `light_3` — the bokeh flare that owns the wave (starts hidden). Its cut is the **inverse**, so its
  // "fully shown" sentinel is `ALL_CUT` and "fully hidden" is `NO_CUT`.
  const [bokeh, bokehApi] = useSpring(() => ({
    x: 0,
    y: 0,
    opacity: 0,
    angle: 0,
    edge: ALL_CUT,
    config: { tension: 90, friction: 26 },
  }));
  // **Entrance** — part of the load storytelling: as the preloader lets go, the rays swing into
  // place (opacity + a residual rotation that settles to the camera's roll) and the corner glint
  // slides up out of its corner a beat later, so the light rig visibly *arrives* with the particle
  // fly-in rather than being baked into the first frame. `0 → 1` per layer, staggered.
  const [enter, enterApi] = useSpring(() => ({
    rays: 0,
    glint: 0,
    config: { mass: 1, tension: 55, friction: 26 },
  }));

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const pointer = { nx: 0, ny: 0 };
    // Shared + frame-memoised, so this doesn't force its own layout each frame — see [[scroll-progress]].
    const progressNow = getScrollProgress;
    // **Parallax runs everywhere except the wipe window** (see `isWipeMasked`) — so the wave and the
    // tree finale both have it, and only the ~0.23 of scroll where the layers are cut to the wipe
    // line holds still. The springs ease the drift out well before that cut is visible and ease it
    // back in after, so neither boundary reads as a stop.
    const applyParallax = (progress: number): void => {
      const g = fine && !isWipeMasked(progress) ? 1 : 0;
      raysApi.start({ x: pointer.nx * RAYS_DRIFT * g, y: pointer.ny * RAYS_DRIFT * g });
      // Opposite phase — the corner glint drifts the other way, and further.
      glintApi.start({ x: -pointer.nx * GLINT_DRIFT * g, y: -pointer.ny * GLINT_DRIFT * g });
      bokehApi.start({ x: pointer.nx * BOKEH_DRIFT * g, y: pointer.ny * BOKEH_DRIFT * g });
    };
    const handleMove = (event: PointerEvent): void => {
      pointer.nx = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.ny = (event.clientY / window.innerHeight) * 2 - 1;
      applyParallax(progressNow());
    };
    if (fine) window.addEventListener("pointermove", handleMove);

    // Drive roll + fades + wipe-mask edges from a per-frame rAF reading the shared scroll progress —
    // the *same value the scene reads* — so the flares track the camera/wipe frame-locked. Roll,
    // opacity and the mask edges are set immediately (the Lenis-smoothed scroll makes it smooth, and
    // they must match the camera exactly); only the parallax stays spring-smoothed.
    //
    // **Everything a layer needs goes into one `.start()`.** The mask and the opacity must never
    // disagree: the bokeh, for instance, is a *full-screen* `mix-blend-mode` layer that is kept
    // invisible by its mask on the tree side and by its opacity past the wipe. Writing the mask
    // straight to the DOM here while the opacity travelled through the spring meant they landed in
    // **different frames** (react-spring flushes its style writes in its own rAF pass) — one frame of
    // "mask says show, opacity hasn't dropped yet" is a full-screen flare flashing over the scene,
    // exactly once per boundary crossing. Carrying `angle`/`edge` in the spring makes the pair atomic.
    let raf = 0;
    let last = Number.NaN;
    let entered = false;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      // Fire the entrance once, the frame the preloader hands the page over — the same signal the
      // glyph fly-in starts on, so the light rig and the particles arrive as one beat.
      if (!entered && isPageRevealed()) {
        entered = true;
        enterApi.start({ rays: 1, delay: 150 });
        enterApi.start({ glint: 1, delay: 500 });
      }
      const progress = progressNow();
      if (progress === last) return; // idle — nothing to update
      last = progress;
      const deg = rollDegAt(progress);
      const flareOpacity = flareOpacityAt(progress);
      applyParallax(progress); // re-gate the drift across the wipe-window boundaries on scroll

      const f = wipeMaskFields(progress);
      // Gradient stop % that lands the mask cut on the wipe line, for a box centred at (cx,cy)
      // viewport-fractions (y from top), size (bw,bh) px: anchor the box centre (gradient 50% ↔ its
      // own `lineC`) and step to `uWipe` along the gradient axis (Δpx = Δlince/gMag; Δ% = Δpx/gradLen).
      const edgeFor = (cx: number, cy: number, bw: number, bh: number): number => {
        if (!f) return NO_CUT;
        const lineCc = 1 - cy + (cx - 0.5) * sceneConfig.sequence.wipeTilt;
        const gradLen = bw * f.sinT + bh * f.cosT;
        return 50 + ((f.uWipe - lineCc) / (gradLen * f.gMag)) * 100;
      };
      const W = window.innerWidth;
      const H = window.innerHeight;
      const S = 1.3 * Math.max(W, H); // RAYS_SIZE (130vmax) in px
      const bokehOver = 2 * BOKEH_OVERHANG_VMAX * (Math.max(W, H) / 100); // `inset −Nvmax` → +2N total
      const angle = f ? f.angleDeg : 0;

      raysApi.start({ rotate: deg, opacity: flareOpacity, angle, edge: edgeFor(0.5, 0.5, S, S), immediate: true });
      // Glint box: left −16vw / bottom −18vh / 78vw × 88vh → centre (0.23W, 0.74H).
      glintApi.start({
        rotate: deg,
        opacity: flareOpacity,
        angle,
        edge: edgeFor(0.23, 0.74, 0.78 * W, 0.88 * H),
        immediate: true,
      });
      // Bokeh box: viewport + overhang on every side, still centred on the viewport. Outside the
      // transition its **mask alone** already resolves correctly on either side — fully shown before
      // the wipe (`ALL_CUT`), fully hidden once the tree has taken over (`NO_CUT`) — so the opacity is
      // now only a second line of defence rather than the thing hiding a full-screen layer.
      bokehApi.start({
        opacity: bokehOpacityAt(progress),
        angle,
        edge: f
          ? edgeFor(0.5, 0.5, W + bokehOver, H + bokehOver)
          : progress >= sceneConfig.sequence.wipeRange[1]
            ? NO_CUT
            : ALL_CUT,
        immediate: true,
      });
    };
    raf = requestAnimationFrame(tick);
    return () => {
      if (fine) window.removeEventListener("pointermove", handleMove);
      cancelAnimationFrame(raf);
    };
  }, [raysApi, glintApi, bokehApi, enterApi]);

  // Masks built **from the same springs** that carry the opacities, so a layer's mask and its opacity
  // are always written together in one flush — never a frame apart (see the effect's note).
  // **Tree-side** cut (`light_1`/`light_2`): black below the line, transparent above — a **hard** cut
  // (both stops at the same %). Hard, not feathered: an AA sliver overlapped the wave-side mask, so
  // *both* flares blended in that band → double `overlay` darkening = a dark seam.
  const treeSide = (a: number, e: number): string =>
    `linear-gradient(${a}deg, #000 ${e}%, transparent ${e}%)`;
  const raysMask = to([rays.angle, rays.edge], treeSide);
  // The glint keeps its feather **and** the tree-side cut (both must pass → `intersect`).
  const glintMask = to([glint.angle, glint.edge], (a, e) => `${GLINT_FEATHER}, ${treeSide(a, e)}`);
  // **Wave-side** cut (`light_3`): the inverse, meeting the tree-side masks exactly on the line.
  const bokehMask = to(
    [bokeh.angle, bokeh.edge],
    (a, e) => `linear-gradient(${a}deg, transparent ${e}%, #000 ${e}%)`,
  );

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Full-frame rays — an oversized centred square (`RAYS_SIZE`) that rotates about the screen
          centre with the camera; on the tree it's cut to the tree side of the wipe line. */}
      <animated.div
        className="absolute left-1/2 top-1/2 bg-cover bg-center"
        style={{
          x: rays.x,
          y: rays.y,
          // Entrance: eases in from a slight over-rotation + zoom, settling onto the camera-locked
          // roll — the rays visibly swing into position as the page is revealed.
          scale: to([rays.scale, enter.rays], (s, t) => s * (1.06 - 0.06 * t)),
          rotate: to([rays.rotate, enter.rays], (r, t) => r - (1 - t) * 9),
          opacity: to([rays.opacity, enter.rays], (o, t) => o * t),
          width: RAYS_SIZE,
          height: RAYS_SIZE,
          marginLeft: `calc(${RAYS_SIZE} / -2)`,
          marginTop: `calc(${RAYS_SIZE} / -2)`,
          backgroundImage: "url(/assets/lights/light_1.png)",
          mixBlendMode: "overlay",
          maskImage: raysMask,
          WebkitMaskImage: raysMask,
        }}
      />
      {/* Corner glint — rotated about the screen centre too; feather ∩ tree-side wipe. */}
      <animated.div
        className="absolute bg-cover bg-left-bottom bg-no-repeat"
        style={{
          // Entrance: the glint rises out of its corner a beat after the rays.
          x: to([glint.x, enter.glint], (x, t) => x - (1 - t) * 50),
          y: to([glint.y, enter.glint], (y, t) => y + (1 - t) * 50),
          scale: glint.scale,
          rotate: glint.rotate,
          opacity: to([glint.opacity, enter.glint], (o, t) => o * t),
          left: "-16vw",
          bottom: "-18vh",
          width: "78vw",
          height: "88vh",
          transformOrigin: "84.6% 22.7%",
          backgroundImage: "url(/assets/lights/light_2.png)",
          mixBlendMode: "plus-lighter",
          maskImage: glintMask,
          maskComposite: "intersect",
          WebkitMaskImage: glintMask,
          WebkitMaskComposite: "source-in",
        }}
      />
      {/* Bokeh flare (`light_3`) — owns the wave; on the tree wipe it's cut to the wave side of the
          line, so it hands over to the rays/glint exactly as the scene does. Oversized by
          `BOKEH_OVERHANG_VMAX` per side so its wave-phase parallax never drags an edge into view. */}
      <animated.div
        className="absolute bg-cover bg-center"
        style={{
          x: bokeh.x,
          y: bokeh.y,
          opacity: bokeh.opacity,
          inset: `-${BOKEH_OVERHANG_VMAX}vmax`,
          backgroundImage: "url(/assets/lights/light_3.png)",
          mixBlendMode: "overlay",
          maskImage: bokehMask,
          WebkitMaskImage: bokehMask,
        }}
      />
    </div>
  );
};
