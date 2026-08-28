/**
 * The two DOM layers the site lays over its canvas — and most of why the render reads as film
 * rather than as WebGL.
 *
 * 1. **Film grain.** A tiled monochrome `feTurbulence` noise at `mix-blend-mode: overlay`. It is
 *    what breaks up the 8-bit banding across a very smooth cream gradient, and it is static on
 *    purpose: the noise "boils" enough from the scene drifting underneath it.
 * 2. **Light leaks.** Soft warm shafts and a corner glint. The site paints these from three WebP
 *    flares; this package draws them with CSS gradients instead, so the background still fetches
 *    nothing. Same blend modes (`overlay` for the rays, `plus-lighter` for the glint), which is
 *    what keeps them from turning into grey haze over the paper ground.
 *
 * Both layers are inert — `pointer-events: none`, `aria-hidden` — and sit above the canvas.
 */

/** Tiled greyscale fractal noise as an inline SVG data URI (`feColorMatrix saturate 0`). */
const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E\")";

const layer = (): HTMLDivElement => {
  const el = document.createElement("div");
  el.setAttribute("aria-hidden", "true");
  el.style.position = "absolute";
  el.style.inset = "0";
  el.style.pointerEvents = "none";
  return el;
};

/**
 * The grain layer. `opacity` at 0 returns `null` — no element, no compositing cost.
 *
 * Two stacked passes, because one is not enough on a ground this pale: `overlay` alone (what the
 * site uses over a frame full of dark beads) compresses to almost nothing against near-white
 * paper — the blend flips to screen above 50% luminance. The second `multiply` pass carries the
 * actual grit and takes a little of the glare off the paper at the same time.
 */
export const createGrain = (opacity: number): HTMLDivElement | null => {
  if (opacity <= 0) return null;

  const contrast = layer();
  contrast.style.backgroundImage = NOISE;
  contrast.style.backgroundSize = "160px 160px";
  contrast.style.mixBlendMode = "overlay";
  contrast.style.opacity = String(Math.min(1, opacity));

  const grit = layer();
  grit.style.backgroundImage = NOISE;
  grit.style.backgroundSize = "160px 160px";
  grit.style.mixBlendMode = "multiply";
  grit.style.opacity = String(Math.min(1, opacity * 0.25));

  const group = layer();
  group.appendChild(contrast);
  group.appendChild(grit);
  return group;
};

/**
 * The light leaks: a wide raking shaft from the upper right, a narrower one crossing it, and a
 * warm glint low on the left. Sized in `vmax` so the geometry holds its shape on any aspect.
 *
 * `strength` scales all three together; `tint` is the warm colour they carry (the site's paper).
 */
export const createLightLeak = (
  strength: number,
  tint: string,
  shade: string,
): HTMLDivElement | null => {
  if (strength <= 0) return null;

  // The wash the light enters by — and, just as importantly, the shadow opposite it. The site's
  // flare plate is a mid-dark image in `overlay`, so it *darkens* as much as it lights: that
  // falloff away from the source is what stops the paper ground reading as flat white. A pure
  // highlight gradient bleaches the frame; this one has both ends.
  const rays = layer();
  rays.style.mixBlendMode = "overlay";
  rays.style.opacity = String(Math.min(1, strength));
  rays.style.backgroundImage = [
    `radial-gradient(70vmax 52vmax at 88% -8%, ${tint} 0%, transparent 62%)`,
    `linear-gradient(200deg, transparent 18%, ${shade} 100%)`,
    `radial-gradient(72vmax 54vmax at 4% 106%, ${shade} 0%, transparent 72%)`,
  ].join(", ");

  // The raking shaft: a long thin streak rotated across the lower left, feathered at both ends so
  // it has no visible start or stop. A rotated child, not a `radial-gradient` blob — an ellipse
  // reads as a headlight, a streak reads as light through a lens.
  const shaft = document.createElement("div");
  shaft.style.position = "absolute";
  shaft.style.left = "-30%";
  shaft.style.top = "34%";
  shaft.style.width = "110%";
  shaft.style.height = "34vmax";
  shaft.style.transform = "rotate(-28deg)";
  shaft.style.pointerEvents = "none";
  shaft.style.backgroundImage =
    `linear-gradient(90deg, transparent 0%, ${tint} 34%, ${tint} 52%, transparent 86%)`;
  // The mask feathers the streak across its width; the gradient feathers it along its length.
  shaft.style.maskImage = "linear-gradient(180deg, transparent 0%, #000 46%, transparent 100%)";
  shaft.style.setProperty("-webkit-mask-image", shaft.style.maskImage);
  shaft.style.filter = "blur(3vmax)";

  // `plus-lighter` adds light rather than re-contrasting the ground, which is what keeps the
  // shaft reading as a lens flare instead of a grey smear. Weak — it is a glint, not a lamp.
  const glint = layer();
  glint.style.mixBlendMode = "plus-lighter";
  glint.style.opacity = String(Math.min(1, strength * 0.14));
  glint.appendChild(shaft);

  const group = layer();
  group.appendChild(rays);
  group.appendChild(glint);
  return group;
};
