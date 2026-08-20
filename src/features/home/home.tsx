import { Grain } from "@/components/common/grain";
import { HeroLights } from "@/components/common/hero-lights";
import { Preloader } from "@/components/common/preloader";
import { TuningPanel } from "@/components/common/tuning-panel";
import { UserCursor } from "@/components/common/user-cursor";
import { SiteFooter } from "@/features/footer/site-footer";
import {
  HandOverlay,
  HeroOverlay,
  ScrollFade,
  TreeOverlay,
  WaveOverlay,
} from "@/features/home/overlays";
import { ParticleScene, sceneConfig } from "@/features/home/scene";
import { SceneShell } from "@/features/home/scene-shell";
import { ShowreelStage } from "@/features/home/showreel/showreel-stage";
import { SiteHeader } from "@/features/navigation/site-header";

/**
 * Home view — a full-viewport 3D particle scene driven by scroll.
 *
 * The `<ParticleScene>` canvas is pinned to the viewport (`fixed`) while a
 * spacer below it gives the page its scroll length; the scene reads scroll
 * progress to fly the camera, scatter the glyph, and reveal the hand. Over it,
 * `<HeroLights>` adds two blended, cursor-parallaxing light flares, `<Grain>` lays
 * film grain over the scenes (below the UI), a persistent
 * `<SiteHeader>`, and per-scene UI overlays (`<HeroOverlay>` for the glyph,
 * `<HandOverlay>` for the hand, `<WaveOverlay>` for the wave) that `<ScrollFade>`
 * cross-fades with scroll so each shows only while its scene is on screen. A dev-only `<TuningPanel>`
 * (mounts with `?tune`) live-tweaks the pink particles + bloom. All are client-safe leaves, so
 * this view stays a Server Component (hard rule #6). One `sr-only` `<h1>` names
 * the landmark; the visible headings are decorative.
 */
export const HomeView = () => {
  return (
    <main id="top" className="relative bg-scene-backdrop">
      <h1 className="sr-only">Coffee Digital — the digital branding people</h1>
      {/* `isolation-isolate` scopes the overlays' `mix-blend-mode` (flares + grain) to this pinned
          container. Without it the blend group's backdrop is the whole page, so the compositor has to
          keep re-resolving a blend stack that sits over a canvas repainting at 60 fps. */}
      <SiteHeader />
      <UserCursor />
      <SceneShell>
        <ParticleScene />
        <HeroLights />
        {/* Film grain over the scenes + flares, below the UI (z-[5] < overlays z-10, header z-20). */}
        <Grain />
        {/* Glyph-scene UI: shown at the top, fades out as the X bursts. */}
        <ScrollFade appear={[0, 0]} disappear={[0.05, 0.14]} className="pointer-events-none absolute inset-0 z-10">
          <HeroOverlay />
        </ScrollFade>
        {/* Hand-scene UI: fades in as the hand is framed, out as the wave morph begins. */}
        <ScrollFade appear={[0.34, 0.41]} disappear={[0.47, 0.53]} className="pointer-events-none absolute inset-0 z-10">
          <HandOverlay />
        </ScrollFade>
        {/* Wave-scene UI: fades **in** once the wave has formed; it disappears by being **clipped
            along the tree-wipe line** (inside WaveOverlay), not by opacity — so it takes **no**
            `disappear` window at all. */}
        <ScrollFade appear={[0.6, 0.67]} className="pointer-events-none absolute inset-0 z-10">
          <WaveOverlay />
        </ScrollFade>
        {/* Tree-scene UI (final): fades in once the tree has wiped in and stays to the end — so, again,
            no `disappear` window (a zero-width one would blank it at exactly progress 1). */}
        <ScrollFade appear={[0.93, 0.98]} className="pointer-events-none absolute inset-0 z-10">
          <TreeOverlay />
        </ScrollFade>
      </SceneShell>
      {/* Scroll length of the hero sequence, then a hold so the tree stays on screen
          before the showreel. Hold is not part of scene progress (that is already 1). */}
      <div aria-hidden className="w-full" style={{ height: `${sceneConfig.sequence.scrollVh}vh` }} />
      <div aria-hidden className="w-full" style={{ height: `${sceneConfig.sequence.treeHoldVh}vh` }} />
      <ShowreelStage />
      <noscript>
        <SiteFooter />
      </noscript>
      {/* Black hold until the scene's assets and shaders are ready — see `Preloader`. */}
      <Preloader />
      {/* Dev-only live tuning panel for the pink particles + bloom — mounts only with `?tune`. */}
      <TuningPanel />
    </main>
  );
};
