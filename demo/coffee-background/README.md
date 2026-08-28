# Coffee Digital — background

The atmospheric layer of the Coffee Digital home page, extracted as a standalone package you can
run locally and attach to any other site.

**A lit gradient room, drifting dust, a few rising sparks, film grain, light leaks, bloom and a
vignette.** That is the whole thing. No models, no point clouds, no textures, no fonts —
**zero network requests**: every particle is generated at runtime from a seeded PRNG, so the
composition is identical on every load. The only dependency is three.js.

Two of those layers are not WebGL at all. The site lays **film grain** (a tiled SVG
`feTurbulence` noise) and **light leaks** (three WebP flare plates) over its canvas in
`mix-blend-mode`, and they are most of why the render reads as film rather than as three.js —
the grain breaks up the banding a very smooth cream ramp would otherwise show, and the flares
both light *and shade* the frame. This package reproduces both without the WebP files: the leaks
are CSS gradients. Turn them off with `grain: 0` / `lightLeak: 0` and the room goes flat, which
is the quickest way to see what they are doing.

---

## Run it

```bash
cd demo/coffee-background
npm install
npm run dev          # http://localhost:5180
```

Other scripts: `npm run build` (the demo page), `npm run build:lib` (the embeddable bundle),
`npm run typecheck`.

## Attach it to another site

**With a bundler** — copy `src/` into the project (`npm i three`), then:

```ts
import { mountCoffeeBackground } from "./coffee-background/src";

const bg = mountCoffeeBackground(document.querySelector("#background")!);
// on teardown (route change, unmount)
bg.destroy();
```

**Without a build step** — `npm run build:lib`, copy `dist-lib/coffee-background.iife.js`
(≈125 KB gzipped, three.js included) and:

```html
<div id="background" aria-hidden="true"></div>
<script src="/coffee-background.iife.js"></script>
<script>
  CoffeeBackground.mountCoffeeBackground(document.getElementById("background"));
</script>
```

**In React** — mount in an effect, destroy in its cleanup:

```tsx
useEffect(() => {
  const bg = mountCoffeeBackground(ref.current!);
  return () => bg.destroy();
}, []);
```

The container must be positioned and sized; the canvas fills it. The usual host CSS is:

```css
#background {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
```

Give the page content `position: relative; z-index: 1` so it sits over the canvas.

---

## Colours

The locked Coffee Digital palette. **The old brown trio is dead and must not reappear.**

| Token | Hex | Role |
|---|---|---|
| `--paper` | `#FFFAF3` | Top of the room's gradient; the page ground |
| `--cream` | `#FFF2DB` | Bottom of the gradient **and** the fog — same value, so the horizon never seams |
| `--peach` | `#FFE5BF` | Hover accent |
| `--heat` | `#F62440` | The one hot colour. **Never body text** — 3.86:1 on paper, AA-large only |
| `--orange` | `#FF6A00` | The accent that blooms: the rising motes |
| `--ink` | `#3F2210` | Dust, and all foreground text |

Rules that came with the palette and still apply: **one accent element per viewport**, `--heat`
only at display sizes (≥30px), fills, rules and indicators, and no colour outside this set.

The scene reads its colours from `src/scene/scene.config.ts` — three.js materials cannot consume
CSS variables. `injectPalette()` writes the same values onto the document as custom properties, so
the page ground and the WebGL ground are the same value by construction:

```ts
import { injectPalette } from "./coffee-background/src";
injectPalette(); // sets --paper, --cream, --ink, --scene-backdrop, …
```

---

## Options

Every default is the number that ships on the site. Pass a partial — groups merge one level deep.

| Option | Default | What it does |
|---|---|---|
| `colors` | locked palette | `fog`, `backdropTop`, `backdropBottom`, `dust`, … Recolour the room wholesale |
| `accent` | `#FF6A00` | Colour of the rising motes — the only thing that blooms |
| `dustCount` | `700` | Airborne motes. `0` disables the layer |
| `dustSize` | `1` | Size multiplier. Past ~2 they read as blobs, not fine air |
| `dustDrift` | `1` | Time multiplier on the drift. `0` freezes the motes where they were seeded |
| `grain` | `1` | Film grain over the canvas. `0` removes the layer |
| `lightLeak` | `0.5` | Warm raking shafts and corner shading. `0` removes the layer |
| `moteCount` | `150` | Rising accent sparks. `0` disables the layer |
| `fov` · `cameraPosition` · `cameraTarget` | `32` · `[0,12,50]` · `[0,12,0]` | The framing |
| `drift` | `0` | World units of slow autonomous camera motion. The site's hero camera is locked |
| `parallax` | `0` | World units the camera eases toward the cursor. `0` skips the listener entirely |
| `bloom` | `{ threshold: 3.5, strength: 1.5, radius: 1.9 }` | Selective additive bloom |
| `vignette` · `exposure` | `{ offset: 1, darkness: 1.25 }` · `0.94` | The grade. The site runs exposure `1`; a bare room at `1` reads a stop brighter than the site's frame, which is a third dark beads |
| `fog` | `{ near: 25, far: 130 }` | Where motes dissolve into the fog colour |
| `quality` | `"auto"` | `"low"` forces the mobile tier on any device |
| `motion` | `"auto"` | `"always"` ignores `prefers-reduced-motion` |
| `pauseOffscreen` | `true` | Stop rendering when the container scrolls out of view |

`mountCoffeeBackground` returns `{ destroy, setPaused, renderer }`.

---

## What it does about the things that usually go wrong

- **Reduced motion is a first-class branch, not a kill switch.** With
  `prefers-reduced-motion: reduce` the room still builds and renders in full — it simply holds
  still. Nothing is hidden by animation, so the reduced scene *is* the complete scene.
- **No WebGL, no problem.** A page can hit the browser's context limit; `WebGLRenderer` throws
  there. The mount catches it, mounts nothing, and returns a handle with `renderer: null`. The
  host page is untouched.
- **Device tiering is read once.** DPR clamp, particle counts, bloom scale and the frame budget
  (30 fps mobile / 45 tablet / ~60 desktop) all derive from one tier value, so they cannot drift
  apart. The pointer listener is not attached on touch at all.
- **It pauses itself** when scrolled out of view, and `setPaused(true)` parks it while a modal
  owns the screen.
- **It cleans up after itself.** `destroy()` cancels the loop, disconnects both observers, removes
  the listeners, disposes every geometry, material and render target, and removes the canvas.
- **The layer is inert**: `pointer-events: none`, `aria-hidden="true"` in the demo markup. It is
  decoration and is never in the tab order or the accessibility tree.

## What was deliberately left behind

The site's figures — the bean mark, the trophy, the tree — their containment lattices, the scatter
burst, the hand-to-wave vortex and the screen-space wipe. All of that is *scroll choreography*: it
needs a pinned 1180vh stage and baked point-cloud assets to read at all, and none of it belongs in
a background. The extraction kept the room, not the film.

## Files

```
src/background.ts        the mount — renderer, room, atmosphere, post chain, loop, teardown
src/options.ts           every knob, with the site's numbers as defaults
src/palette.ts           the tokens, derived from the scene config
src/scene/backdrop.ts    the gradient sphere that makes it read as a lit room, not a void
src/scene/dust.ts        CPU-drifted motes with fog falloff
src/scene/rising-motes.ts  GPU-driven sparks — one uniform write per frame
src/scene/bloom-pass.ts  selective additive bloom (UnrealBloomPass renders black on this stack)
src/scene/device.ts      the single source of device tiering
src/scene/scene.config.ts  the site's scene config, verbatim — the colour source of truth
src/scene/random.ts      seeded mulberry32, so the layout is identical on every run
src/overlays.ts          the DOM layers over the canvas: film grain and the light leaks
demo/                    the demo page harness — not part of the package
```

`scene.config.ts` is copied from the site unchanged, including the parts this package does not
use. It is the documented source of truth for the palette and it is easier to keep honest as an
exact copy than as an edited subset.
