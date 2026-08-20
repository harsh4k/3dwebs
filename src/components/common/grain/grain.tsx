// 📖 Docs: obsidian/frontend/components/common.md

/**
 * Film grain — a monochrome noise texture laid over the 3D scenes **and the flares**, but **below
 * the DOM UI**. A tiled SVG `feTurbulence` noise blended with `mix-blend-mode: overlay` at a low
 * `--grain-opacity`, non-interactive. It sits at `z-[5]` inside the pinned scene container: above
 * the canvas + flares (auto `z`), below the UI overlays (`z-10`) and header (`z-20`), so the grain
 * textures every scene while the UI stays crisp. Static (a filmic texture, not motion — so no CSS
 * keyframes, hard rule #1); the noise "boils" enough visually from the scene moving underneath it.
 */

// Tiled greyscale fractal noise as an inline SVG data URI (`feColorMatrix saturate 0` → monochrome).
const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)'/%3E%3C/svg%3E\")";

export const Grain = () => (
  <div
    aria-hidden
    className="pointer-events-none absolute inset-0 z-[5] mix-blend-overlay opacity-[var(--grain-opacity)]"
    style={{ backgroundImage: NOISE, backgroundSize: "160px 160px" }}
  />
);
