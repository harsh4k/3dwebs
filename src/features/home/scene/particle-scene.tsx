// 📖 Docs: obsidian/frontend/components/common.md
"use client";

import { useEffect, useRef } from "react";
import {
  ACESFilmicToneMapping,
  AmbientLight,
  DirectionalLight,
  Fog,
  Group,
  HalfFloatType,
  HemisphereLight,
  Material,
  Mesh,
  Object3D,
  PCFSoftShadowMap,
  PerspectiveCamera,
  Plane,
  PMREMGenerator,
  Raycaster,
  Scene,
  Texture,
  Vector2,
  Vector3,
  WebGLRenderer,
  WebGLRenderTarget,
} from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { VignetteShader } from "three/examples/jsm/shaders/VignetteShader.js";

import { subscribeToTicker } from "@/lib/animation/ticker";
import { isWorkCarouselVisible } from "@/features/home/work-carousel/scene-gate";
import {
  byTier,
  clampedPixelRatio,
  deviceTier,
  frameBudgetMs,
  viewScale,
  wantsPointer,
} from "@/lib/scene/device";
import { getScrollProgress } from "@/utils/scroll-progress";

import { createBackdrop } from "./backdrop";
import { BloomPass } from "./bloom-pass";
import { createContainmentField } from "./containment-field";
import { createDust } from "./dust";
import { createGlyphParticles } from "./glyph-particles";
import { createHandParticles } from "./hand-particles";
import { updateCloud } from "./particle-cloud";
import type { ParticleCloud } from "./particle-cloud";
import { createPointerRelax } from "./pointer-relax";
import type { PointerRelax } from "./pointer-relax";
import { createRisingMotes } from "./rising-motes";
import { isPageRevealed, markSceneStep } from "./scene-ready";
import { sceneConfig } from "./scene.config";
import { createTreeParticles } from "./tree-particles";
import { tuning } from "./tuning";
import { WipePass } from "./wipe-pass";

/** Frees every GPU resource reachable from the scene graph. */
const disposeScene = (root: Object3D) => {
  root.traverse((object) => {
    const mesh = object as Partial<Mesh>;
    if (mesh.geometry) mesh.geometry.dispose();
    if (!mesh.material) return;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const entry of materials) {
      const material = entry as Material & { map?: Texture | null };
      material.map?.dispose();
      material.dispose();
    }
  });
};

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const smoother = (t: number): number => t * t * t * (t * (t * 6 - 15) + 10);
/** Normalised progress of `p` within [a, b], clamped to [0, 1]. */
const range = (p: number, a: number, b: number): number => clamp01((p - a) / (b - a));

/**
 * Particle scene — the client leaf that owns the WebGL canvas.
 *
 * A volumetric "X" of instanced spheres floats inside a containment lattice in a
 * foggy studio. **Scroll drives a single continuous shot**: the camera flies
 * forward with a gentle mid-flight bank while the glyph bursts into glowing
 * strands and the net collapses, and a particle hand inside its own lattice
 * emerges from the fog ahead. The camera is fully scroll-controlled — no orbit,
 * drag, or zoom.
 *
 * Implemented directly on three.js (not React Three Fiber): R3F augments the
 * global JSX namespace and breaks the animation engine's build — see ADR-0014.
 * All colours and geometry come from `sceneConfig`.
 */
export const ParticleScene = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const {
      colors,
      materials,
      glyph,
      hand,
      tree,
      handAnchor,
      treeAnchor,
      field,
      dust,
      life,
      waveMotes: waveMotesCfg,
      treeMotes: treeMotesCfg,
      scatter,
      wave: waveCfg,
      sequence,
      camera: cam,
    } = sceneConfig;

    const scene = new Scene();
    scene.fog = new Fog(colors.fog, sceneConfig.fog.near, sceneConfig.fog.far);

    const camera = new PerspectiveCamera(cam.fov, 1, 0.1, 600);

    const debug = new URLSearchParams(window.location.search).has("debug");

    // --- Device tier: read ONCE, everything else derives from it ------------
    // DPR, particle counts, bloom, the frame budget and whether the pointer is listened to all read
    // from this one value, so they can never drift apart. A device doesn't change tier mid-session.
    const tier = deviceTier();
    const isMobile = tier === "mobile";
    // Declared up here with the tier, not down by the listeners: the async cloud loaders below read
    // it, and a `const` further down the body is a trap waiting for the day one of them resolves
    // synchronously.
    const pointerEnabled = wantsPointer(tier);

    // **Per-tier particle budget.** Roughly a third of desktop on mobile, per §7. For the loaded
    // clouds the knob is `density`, the *upsample* factor — dropping it removes the jittered infill
    // copies first and keeps the original baked points, so the form survives and only the filler
    // thins out. That is the sparse end of this distribution; cutting the baked points instead would
    // punch holes in the silhouette.
    //   desktop  glyph 32k · hand ~50k · tree ~150k · dust 700×3
    //   tablet   glyph 19k · hand ~29k · tree ~100k · dust 420×3
    //   mobile   glyph 11k · hand ~17k · tree  ~50k · dust 260×3
    const countScale = byTier(tier, { desktop: 1, tablet: 0.6, mobile: 0.34 });
    const scaled = (n: number, min: number): number => Math.max(min, Math.round(n * countScale));
    const glyphT = { ...glyph, count: scaled(glyph.count, 8000) };
    const handT = { ...hand, density: scaled(hand.density, 4) };
    const treeT = { ...tree, density: scaled(tree.density, 1) };
    const dustT = { ...dust, count: scaled(dust.count, 200) };

    const renderer = new WebGLRenderer({
      // **Off on every tier, deliberately.** Everything visible renders through the
      // EffectComposer's targets, which carry no MSAA samples — the default framebuffer that
      // `antialias` multisamples only ever receives the final full-screen quad, so the flag
      // bought zero smoothing for real memory + resolve bandwidth every frame. Edges are
      // carried by the DPR clamp and the soft particle sprites instead.
      antialias: false,
      // The canvas is fully opaque (a backdrop mesh fills it), so skip blending against the page.
      alpha: false,
      stencil: false,
      powerPreference: isMobile ? "default" : "high-performance",
      preserveDrawingBuffer: debug,
    });
    renderer.setPixelRatio(clampedPixelRatio(tier));
    // **Shadows off on mobile.** The key light casts through a 4096² PCF-soft map over tens of
    // thousands of instanced spheres — by far the most expensive thing in the frame. The clouds keep
    // their baked shade + the ring light, which is what carries their form anyway (ADR-0023).
    renderer.shadowMap.enabled = !isMobile;
    renderer.shadowMap.type = PCFSoftShadowMap;
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = sceneConfig.exposure;
    container.appendChild(renderer.domElement);

    // --- Reflections (the particle material carries a faint environment term) ----
    const pmrem = new PMREMGenerator(renderer);
    const envScene = new Scene();
    envScene.add(createBackdrop(colors.backdropTop, colors.backdropBottom, 100));
    const environment = pmrem.fromScene(envScene, 0.04).texture;
    scene.environment = environment;

    // --- Environment -------------------------------------------------------
    // No ground, no podium discs, no ring fixture — each act is its containment
    // lattice (faded at both ends) floating in the gradient haze.
    scene.add(createBackdrop(colors.backdropTop, colors.backdropBottom));

    // Hero net — scaled up with the ×1.2 X, base kept planted at the same height. Starts unbuilt
    // (`uBuild` 0): it weaves itself in with the intro and unweaves over `netRange` on scroll
    // (the per-segment dissolve that replaced the old `scale.y` collapse, which read as a skew).
    const heroFieldBase = field.centerY - field.height / 2;
    const heroField = {
      ...field,
      radiusTop: field.radiusTop * field.heroScale,
      radiusBottom: field.radiusBottom * field.heroScale,
      height: field.height * field.heroScale,
      centerY: heroFieldBase + (field.height * field.heroScale) / 2,
    };
    const heroNet = createContainmentField(heroField, colors.field, life.color);
    heroNet.uBuild.value = 0;
    scene.add(heroNet.lines);

    const dustFog = { color: colors.fog, near: sceneConfig.fog.near, far: sceneConfig.fog.far };
    const dustField = createDust(dustT, colors.dust, dustFog);
    scene.add(dustField.points);
    // The X's dust hangs at the origin; the hand and tree are far down-range, so give each act its
    // own drifting motes (positioned at its anchor) — the same air the hero sits in.
    const handDust = createDust(dustT, colors.dust, dustFog);
    handDust.points.position.set(hand.center[0], 0, hand.center[2]);
    scene.add(handDust.points);

    const glyphCloud = createGlyphParticles(glyphT, colors.particle, materials.particle);
    scene.add(glyphCloud.mesh);
    // Dial in the GPU idle life per cloud (flow tint band + whole-form sway) — see [[particle-cloud]].
    const applyLife = (cloud: ParticleCloud, look: { flow: number; sway: number }): void => {
      cloud.life.uFlowTint.value.set(life.color).multiplyScalar(look.flow);
      cloud.life.uFlowAmp.value = look.sway;
    };
    applyLife(glyphCloud, life.glyph);

    // Same containment net as the glyph, wrapping the hand at its anchor. Unbuilt until the
    // camera approaches — it weaves in just ahead of the hand's scan reveal.
    const handNet = createContainmentField(field, colors.field, life.color);
    handNet.uBuild.value = 0;
    handNet.lines.position.set(handAnchor[0], hand.center[1] + 1, handAnchor[2]);
    handNet.lines.scale.set(0.72, 0.92, 0.72);
    scene.add(handNet.lines);

    // Rising accent motes over the wave "terrain" — GPU-driven sparks that climb and dissolve,
    // giving the curtain a depth layer. Hidden through the hero/flight acts (they'd read as
    // stray specks over the X), shown from the hand act on.
    const waveMotesFx = createRisingMotes({
      ...waveMotesCfg,
      count: scaled(waveMotesCfg.count, 50),
    });
    waveMotesFx.points.visible = false;
    scene.add(waveMotesFx.points);

    // The hand is a loaded point cloud (async). It's far down-range in the fog,
    // so appearing a beat after mount is invisible. Guard against the effect
    // being torn down before the fetch resolves. Once loaded it gets the per-frame
    // cursor repulsion and, in the final phase, crumbles through a vortex into the
    // wave curtain (its own particles — see the render loop + `updateCloud`).
    let handCloud: ParticleCloud | null = null;
    let disposed = false;
    createHandParticles(handT, waveCfg, colors.particle, materials.particle)
      .then((cloud) => {
        if (disposed) {
          cloud.mesh.geometry.dispose();
          cloud.mesh.material.dispose();
          return;
        }
        handCloud = cloud;
        applyLife(cloud, life.hand);
        // **Add it hidden and already in its pre-reveal state.** A freshly built cloud holds its
        // fully-formed *resting* pose and `Mesh.visible` defaults to `true`, so just adding it drops a
        // complete hand into the frame until the next `renderFrame` re-derives visibility from scroll.
        // That same frame is the one that compiles the shader and uploads ~50k instance matrices, so
        // the wrong pose stays up long enough to read as the hand **popping in mid-flight and
        // vanishing again** before its real scan-in. `scan: 0` = not yet materialised.
        cloud.mesh.visible = false;
        updateCloud(cloud, {
          pointer: null,
          pointerConfig: sceneConfig.pointer,
          pointerGate: 0,
          scatter: 0,
          scatterConfig: scatter,
          scan: 0,
          idle: sceneConfig.idle,
          time: 0,
        });
        scene.add(cloud.mesh);
        // Pre-compile off the scroll path so the first frame it *is* meant to be seen doesn't hitch.
        // `compile` walks visible objects and draws nothing, so this can't put it on screen.
        cloud.mesh.visible = true;
        renderer.compile(scene, camera);
        cloud.mesh.visible = false;
      })
      .catch(() => {
        /* asset missing — the scene still runs without the hand */
      })
      // Settled either way: a missing asset must never wedge the page behind the loader.
      .finally(markSceneStep);

    // --- Tree section (final tableau, its own framed scene) -----------------
    // Same environment as the X (containment lattice in the haze), grouped so the whole tree
    // scene can be toggled: it is rendered as a **separate view** that the wipe composites over
    // the frozen wave, so it must be hidden from the wave view.
    const treeSceneGroup = new Group();
    treeSceneGroup.visible = false;

    // Unbuilt until the wipe starts uncovering the finale — it weaves in ahead of the tree scan.
    const treeNet = createContainmentField(field, colors.field, life.color);
    treeNet.uBuild.value = 0;
    treeNet.lines.position.set(treeAnchor[0], tree.center[1] + 1, treeAnchor[2]);
    treeSceneGroup.add(treeNet.lines);

    // Dust for the tree act — inside the group so it's part of the (separately-framed) tree view.
    const treeDust = createDust(dustT, colors.dust, dustFog);
    treeDust.points.position.set(treeAnchor[0], 0, treeAnchor[2]);
    treeSceneGroup.add(treeDust.points);
    // Fireflies around the finale tree — the act the user sits with longest, so it gets the
    // densest life layer: rising accent motes hugging the crown.
    const treeMotesFx = createRisingMotes({
      ...treeMotesCfg,
      count: scaled(treeMotesCfg.count, 40),
    });
    treeSceneGroup.add(treeMotesFx.points);
    scene.add(treeSceneGroup);

    // The tree is a loaded point cloud (async, like the hand). It's fully materialised (no in-world
    // reveal) — the screen wipe does the reveal. No wave destinations (it doesn't morph).
    let treeCloud: ParticleCloud | null = null;
    let treeRelax: PointerRelax | null = null;
    createTreeParticles(treeT, colors.particle, materials.particle)
      .then((cloud) => {
        if (disposed) {
          cloud.mesh.geometry.dispose();
          cloud.mesh.material.dispose();
          return;
        }
        treeCloud = cloud;
        // The finale leans hardest on the GPU life: it is baked (no per-frame `updateCloud`), so
        // the shader-side sway + flow band are the only motion it has.
        applyLife(cloud, life.tree);
        // Down-range, outside the glyph's shadow frustum — the shadow pass over 150k spheres would
        // be wasted. It reads via its baked shade, like the wave.
        cloud.mesh.castShadow = false;
        cloud.mesh.receiveShadow = false;
        treeSceneGroup.add(cloud.mesh);
        // **Simulated hover.** The tree can't keep its easing state in the instance matrices (they're
        // never rewritten), so it goes in a ping-pong texture instead — same law as the glyph's,
        // including the slow `returnRelax` drift back. Desktop only: `wantsPointer` is false on
        // touch, and without a cursor the simulation has nothing to do (the cloud then keeps its
        // `aRelaxUv` and a null map, which samples all-zero and renders undisplaced).
        if (pointerEnabled && cloud.relax) {
          treeRelax = createPointerRelax(
            cloud.basePositions,
            sceneConfig.pointer,
            cloud.relax.uRelaxMap,
          );
          // **Prime it before the shader is compiled below.** One cursor-less step clears the
          // targets and publishes a real texture, so the material never links against a null
          // sampler and the first frame that needs the hover already has state to read.
          treeRelax.step(renderer, null);
        }
        // The tree is **static** (the wipe does the reveal, no in-world motion), so `updateCloud`
        // runs **once here at load** — to place it + light its hero beads (glow) — and never per
        // frame. A `updateCloud` over 150k particles is a ~90 ms JS block; doing it once off the
        // scroll path (instead of every frame / on every wipe entry) is what keeps the finale from
        // freezing. From then on the scene just *renders* the cloud (cheap).
        updateCloud(cloud, {
          pointer: null,
          pointerConfig: sceneConfig.pointer,
          pointerGate: 0,
          scatter: 0,
          scatterConfig: scatter,
          idle: sceneConfig.idle,
          // **Required for a one-shot update.** Everything in `updateCloud` approaches its target by
          // `ease` per call; one call at the idle floor lands 5 % of the way. That is why the tree
          // had no glowing hero beads — their emissive stopped at 0.25 of the 5 it was aiming for,
          // nowhere near the 3.5 bloom threshold.
          immediate: true,
          time: 0,
        });
        // Pre-compile the tree material's (patched) shader and **pre-bake the tree view to `rtTree`
        // now, at load** — otherwise the first tree render (compile + 100k GPU upload) is a hitch
        // right at the finale. Everything but the tree is behind `treeCamera` (z −140 → −175), so
        // rendering the scene from it captures just the tree scene; no visibility juggling needed.
        treeSceneGroup.visible = true;
        renderer.compile(scene, treeCamera);
        renderer.setRenderTarget(rtTree);
        renderer.render(scene, treeCamera);
        renderer.setRenderTarget(null);
        treeSceneGroup.visible = false;
      })
      .catch(() => {
        /* asset missing — the scene still runs without the tree */
      })
      .finally(markSceneStep);

    // --- Lighting ----------------------------------------------------------
    // Raised from 0.14 / 0.05 to make up the fill the removed ring fixture's PointLight used to
    // pour onto the clouds from above (and it's now the same look on every tier — the point light
    // was desktop-only).
    scene.add(new HemisphereLight(colors.skyFill, colors.groundFill, 0.3));
    scene.add(new AmbientLight(0xffffff, 0.12));

    // Strong, so the self-shadowing on the particle cloud reads as deep real shadow (the
    // cloud's volume comes from this light + its shadow map, not baked albedo).
    const key = new DirectionalLight(colors.keyLight, 2.6);
    key.position.set(glyph.lightDirection[0], glyph.lightDirection[1], glyph.lightDirection[2]);
    key.target.position.set(glyph.center[0], glyph.center[1], glyph.center[2]);
    key.castShadow = true;
    // High-res map + tight frustum around the glyph — the spheres are tiny, so the shadow
    // texel must be small to resolve particle-on-particle self-shadowing without speckle.
    // Desktop dropped 4096 → 2048 (the depth raster was the hero act's single most expensive
    // item; at bead scale the coarser texel reads identically with the existing `normalBias`);
    // on mobile `shadowMap.enabled` is off entirely, so this map is never allocated.
    const shadowSize = byTier(tier, { desktop: 2048, tablet: 2048, mobile: 1024 });
    key.shadow.mapSize.set(shadowSize, shadowSize);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 110;
    key.shadow.camera.left = -14;
    key.shadow.camera.right = 14;
    key.shadow.camera.top = 20;
    key.shadow.camera.bottom = -14;
    // normalBias offsets the sample along the surface normal — the fix for shadow acne on
    // curved (sphere) receivers; a small negative depth bias cleans up the rest.
    key.shadow.bias = -0.0003;
    key.shadow.normalBias = 0.08;
    scene.add(key);
    scene.add(key.target);

    // Rim fill — desktop/tablet only. The scene already carries an IBL (the PMREM'd backdrop above),
    // which is what §8's "one key + environment" prescribes; this is the extra fill that buys a
    // little separation on the far side and costs a full lighting term on every lit fragment.
    if (!isMobile) {
      const rim = new DirectionalLight(colors.skyFill, 1.1);
      rim.position.set(14, 18, -30);
      scene.add(rim);
    }

    // --- Post-processing ---------------------------------------------------
    // Selective bloom: the threshold sits above the lit-white cloud but below the glowing
    // hero beads (and the scatter/cursor emissive), so only those bloom — not the whole scene
    // (the scene-wide haze that got bloom removed before). See [[bloom-pass]] / ADR-0019.
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    // Wipe: composites the two pre-rendered views (wave + tree) by a screen-space mask. Sits
    // before bloom so both sides still bloom; disabled outside the transition.
    const wipePass = new WipePass(sequence.wipeTilt);
    wipePass.enabled = false;
    composer.addPass(wipePass);
    // Mobile halves both, and `viewScale` keeps a look tuned on a 1080-tall window from blowing out
    // on a short one. Read once — the tier can't change and the window height barely does.
    const bloomScale = (isMobile ? 0.5 : 1) * viewScale();
    const bloomRadiusScale = isMobile ? 0.5 : 1;
    const bloomPass = new BloomPass(sceneConfig.bloom);
    composer.addPass(bloomPass);
    const vignette = new ShaderPass(VignetteShader);
    vignette.uniforms.offset.value = sceneConfig.vignette.offset;
    vignette.uniforms.darkness.value = sceneConfig.vignette.darkness;
    composer.addPass(vignette);
    composer.addPass(new OutputPass());

    // The wipe reveals the tree scene from its **own static camera**, composited over the wave
    // (whose camera holds still). Both views are rendered to HDR (HalfFloat) targets each so the
    // downstream bloom still keys off the glowing beads on either side.
    const treeCamera = new PerspectiveCamera(cam.fov, 1, 0.1, 600);
    const treeBasePos = new Vector3(...sequence.camera.treePos);
    const treeLookTarget = new Vector3(...sequence.camera.treeTarget);
    treeCamera.position.copy(treeBasePos);
    treeCamera.lookAt(treeLookTarget);
    // Slow orbital drift around the base pose — the finale's static framing was the deadest shot
    // in the sequence; a sub-unit sway gives it parallax against the motes/dust without ever
    // reading as a camera move. Runs in both tree paths (the wipe re-render and the direct one).
    const driftTreeCamera = (time: number): void => {
      treeCamera.position.set(
        treeBasePos.x + Math.sin(time * 0.1) * 1.1,
        treeBasePos.y + Math.sin(time * 0.13 + 1.3) * 0.5,
        treeBasePos.z,
      );
      treeCamera.lookAt(treeLookTarget);
    };
    const rtWave = new WebGLRenderTarget(1, 1, { type: HalfFloatType });
    const rtTree = new WebGLRenderTarget(1, 1, { type: HalfFloatType });

    // --- Camera flight -----------------------------------------------------
    const startPos = new Vector3(...sequence.camera.startPos);
    const endPos = new Vector3(...sequence.camera.endPos);
    const startTarget = new Vector3(...sequence.camera.startTarget);
    const endTarget = new Vector3(...sequence.camera.endTarget);
    const finalPos = new Vector3(...sequence.camera.finalPos);
    const finalTarget = new Vector3(...sequence.camera.finalTarget);
    const camPos = new Vector3();
    const camTarget = new Vector3();
    const camForward = new Vector3();
    const camUp = new Vector3();
    const worldUp = new Vector3(0, 1, 0);
    const camCross = new Vector3();

    const updateCamera = (progress: number) => {
      // The X→hand→wave act is remapped onto real progress [0, treeStart] via `sp`, so all its
      // existing keyframes/tuning are unchanged. Fly (dollyStart → arrive): approach + a gentle
      // bank — `roll · sin(π·ep)` leans out to the peak angle mid-flight and settles back to
      // upright by `arrive` (the old full 2π barrel roll read as tacky; the out-and-back bank
      // keeps the immersion). Final (arrive → 1 in `sp`): pitch up off the hand over the wave.
      // For the tree section (progress > treeStart) the camera **holds** at the wave pose — the
      // wave stays in place while the wipe reveals the (separately-framed) tree over it.
      const sp = clamp01(progress / sequence.treeStart);
      let rollAngle: number;
      if (sp <= sequence.arrive) {
        const ep = smoother(range(sp, sequence.dollyStart, sequence.arrive));
        camPos.lerpVectors(startPos, endPos, ep);
        camTarget.lerpVectors(startTarget, endTarget, ep);
        rollAngle = sequence.camera.roll * Math.sin(Math.PI * ep);
      } else {
        const ep = smoother(range(sp, sequence.arrive, 1));
        camPos.lerpVectors(endPos, finalPos, ep);
        camTarget.lerpVectors(endTarget, finalTarget, ep);
        // The bank has fully unwound by `arrive` (sin(π) = 0) — the lift-off flies level.
        rollAngle = 0;
      }

      // Roll the camera about its view axis (Rodrigues on the up vector).
      camForward.subVectors(camTarget, camPos).normalize();
      const cos = Math.cos(rollAngle);
      const sin = Math.sin(rollAngle);
      camCross.crossVectors(camForward, worldUp);
      const dot = camForward.dot(worldUp);
      camUp
        .copy(worldUp)
        .multiplyScalar(cos)
        .addScaledVector(camCross, sin)
        .addScaledVector(camForward, dot * (1 - cos));

      // Guard against a near-vertical look: if the up vector is almost parallel to
      // the view axis, `lookAt` hits a gimbal singularity and the view matrix
      // degenerates (a blank frame). Rebuild a stable up in the perpendicular plane,
      // with -Z at the top of the frame.
      if (Math.abs(camUp.dot(camForward)) > 0.99) {
        camUp.set(0, 0, -1).addScaledVector(camForward, camForward.z).normalize();
      }

      camera.up.copy(camUp);
      camera.position.copy(camPos);
      camera.lookAt(camTarget);
    };

    // --- Cursor (idle) -----------------------------------------------------
    const raycaster = new Raycaster();
    const pointerNdc = new Vector2();
    const pointerPlane = new Plane();
    const planeNormal = new Vector3();
    const pointerHit = new Vector3();
    const glyphCenter = new Vector3(glyph.center[0], glyph.center[1], glyph.center[2]);
    const handCenter = new Vector3(hand.center[0], hand.center[1], hand.center[2]);
    const waveCenter = new Vector3(waveCfg.center[0], waveCfg.center[1], waveCfg.center[2]);
    const treeCenter = new Vector3(tree.center[0], tree.center[1], tree.center[2]);
    let pointerInside = false;

    // Raycast the cursor onto a `cam`-facing plane through `focus`, returning the hit or null. Used
    // for the glyph/hand/wave (main `camera`) and the tree (its own `treeCamera`).
    const pointerOnPlaneCam = (cam: PerspectiveCamera, focus: Vector3): Vector3 | null => {
      if (!pointerInside) return null;
      cam.getWorldDirection(planeNormal);
      pointerPlane.setFromNormalAndCoplanarPoint(planeNormal, focus);
      raycaster.setFromCamera(pointerNdc, cam);
      return raycaster.ray.intersectPlane(pointerPlane, pointerHit) ? pointerHit : null;
    };
    const pointerOnPlane = (focus: Vector3): Vector3 | null => pointerOnPlaneCam(camera, focus);

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = container.getBoundingClientRect();
      pointerNdc.set(
        ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
        -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
      );
      pointerInside = true;
    };
    // Smoothed cursor state for the **figure parallax tilt**: each figure eases a few degrees of
    // yaw/pitch toward the pointer (`life.cursorTilt`), on top of its idle rock. Eased here (not
    // raw NDC) so the tilt glides after the cursor; decays to level when the pointer leaves —
    // and on touch (`pointerInside` never true) it stays exactly zero.
    const cursorTilt = new Vector2();

    // Whole-figure float/tilt helper: mesh-level rotation + the compensating translation that
    // keeps the pivot at the figure's own centre (instance positions bake the world centre in,
    // so a bare rotation would swing the far acts around the world origin).
    const rockVec = new Vector3();
    const rockMesh = (
      mesh: Object3D,
      cx: number,
      cy: number,
      cz: number,
      yaw: number,
      pitch: number,
      bob: number,
    ): void => {
      mesh.rotation.set(pitch, yaw, 0);
      rockVec.set(cx, cy, cz).applyEuler(mesh.rotation);
      mesh.position.set(cx - rockVec.x, cy - rockVec.y + bob, cz - rockVec.z);
    };
    const handlePointerLeave = () => {
      pointerInside = false;
    };
    // **Not attached at all on mobile** — not "attached and ignored". On a touch device the cursor
    // effects are dead weight, and an unmoved pointer resolves to the centre of the plane, which
    // would punch a repulsion hole straight through the middle of every cloud. `pointerInside` stays
    // false, so `pointerOnPlane` returns `null` and every consumer already treats that as "no cursor".
    if (pointerEnabled) {
      window.addEventListener("pointermove", handlePointerMove, { passive: true });
    }

    // --- Sizing ------------------------------------------------------------
    let lastWidth = 0;
    let lastHeight = 0;
    const applySize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width === 0 || height === 0) return;
      if (width === lastWidth && height === lastHeight) return;
      lastWidth = width;
      lastHeight = height;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      treeCamera.aspect = width / height;
      treeCamera.updateProjectionMatrix();
      renderer.setSize(width, height);
      // **The composer owns its own render targets.** Leaving it at raw `devicePixelRatio` renders
      // the whole post chain (bloom, wipe, vignette, output) at full resolution and throws away the
      // entire saving made on the scene pass — so it clamps from the same function.
      composer.setSize(width, height);
      composer.setPixelRatio(clampedPixelRatio(tier));
      const bw = renderer.domElement.width;
      const bh = renderer.domElement.height;
      rtWave.setSize(bw, bh);
      rtTree.setSize(bw, bh);
      // Keep the dust/mote point-size attenuation matched to the drawing buffer.
      dustField.resize(renderer.domElement.height);
      handDust.resize(renderer.domElement.height);
      treeDust.resize(renderer.domElement.height);
      waveMotesFx.resize(renderer.domElement.height);
      treeMotesFx.resize(renderer.domElement.height);
    };
    applySize();

    // --- Prewarm the post chain (§3) ----------------------------------------
    // A pass compiles its program on **first use**. `WipePass` is only reached when the wave→tree
    // transition begins — i.e. mid-scroll — so without this its program links exactly at the
    // boundary, which is a stall right where the eye is. Same for every texture: the first render
    // that samples one uploads it. Do both now, into a throwaway target, before the loop starts.
    const warmTextures = new Set<Texture>();
    scene.traverse((object) => {
      const mesh = object as Partial<Mesh>;
      const list = Array.isArray(mesh.material)
        ? mesh.material
        : mesh.material
          ? [mesh.material]
          : [];
      for (const entry of list) {
        for (const value of Object.values(entry as unknown as Record<string, unknown>)) {
          if (value instanceof Texture) warmTextures.add(value);
        }
      }
    });
    warmTextures.forEach((texture) => renderer.initTexture(texture));

    const warmTarget = new WebGLRenderTarget(1, 1);
    wipePass.setViews(rtWave.texture, rtTree.texture, -0.3, 0, 0);
    wipePass.render(renderer, warmTarget);
    renderer.setRenderTarget(null);
    warmTarget.dispose();
    // Third and last gate for the preloader: the post chain is compiled and every texture uploaded.
    markSceneStep();
    // **Event-driven, never polled.** `applySize` reads `container.clientWidth/Height`, which forces a
    // synchronous layout; calling it on a timer from inside the render loop (it used to run every 30
    // frames) meant a **forced reflow every ~0.5 s in the middle of a frame** — with this page's
    // `mix-blend-mode` / `backdrop-filter` stack that periodic mid-frame recalc is exactly the kind of
    // thing that shows up as an intermittent flash. A `ResizeObserver` covers window resizes *and*
    // container/layout changes, and only fires when the size actually changes.
    //
    // **Not attached on touch.** iOS Safari changes the viewport height every time the URL bar
    // collapses or expands during scroll; reacting to that rebuilds the drawing buffer and both HDR
    // render targets *mid-scroll*, which reads as a full-scene flash. The canvas is sized once on
    // load and keeps that surface for the session — the trade-off is that a rotation won't reflow it.
    const sizeObserver = isMobile ? null : new ResizeObserver(() => applySize());
    sizeObserver?.observe(container);

    // --- Scroll progress ---------------------------------------------------
    // Lenis drives native scroll, so `window.scrollY` is already the smoothed value. The measurement
    // is **shared and memoised per frame** across every rAF loop that needs it (this one, `HeroLights`,
    // the four `ScrollFade`s) — see [[scroll-progress]]. A debug override lets the sequence be
    // scrubbed without scrolling.
    let debugProgress: number | null = null;
    const getProgress = (): number =>
      debugProgress !== null ? debugProgress : getScrollProgress();

    // Scene clock in **seconds of real time**, not a frame counter. Once the tier caps the frame rate
    // (30 fps on mobile) a counter would run the drift, ripple and idle life at half speed. `dt` is
    // clamped: returning to a backgrounded tab otherwise hands the scene a multi-second delta and
    // everything teleports.
    let elapsed = 0;
    let lastFrameTime = performance.now();

    // **The X assembles out of the camera when the preloader lets go** — every particle launches
    // from a scattered point around the viewer and streams down-range onto its spot in the X,
    // carrying a pink comet trail mid-flight (`updateCloud`'s assemble path). It can't run off
    // scroll progress like the hand's reveal (the glyph is already at progress 0), so it runs off
    // the scene clock, started by the hand-off signal. Un-revealed = `assemble: 0`, which snaps
    // every particle to zero scale — nothing is shown early.
    let introStart = 0;
    const introAssemble = (time: number): number => {
      if (!isPageRevealed()) return 0;
      if (introStart === 0) introStart = time;
      return Math.min(1, (time - introStart) / sequence.intro.seconds);
    };

    const renderFrame = (now: number = performance.now()) => {
      const dt = Math.min(0.05, Math.max(0, (now - lastFrameTime) / 1000));
      lastFrameTime = now;
      elapsed += dt;

      // Live dev-tuning: pull the pink-particle colour/glow and the bloom look from the shared
      // `tuning` store (written by `TuningPanel`). `scatter` is `sceneConfig.scatter` by reference, so
      // `updateCloud` reads the new colour on its next call; the bloom pass takes it via `setConfig`.
      scatter.color = tuning.pink.color;
      scatter.glow = tuning.pink.glow;
      // Bloom, per tier: halved on mobile and scaled by viewport height, because point sizes are in
      // device px — a look tuned on a tall screen occupies a larger fraction of a short one and the
      // additive halos pile up. Then **skip the pass outright when it contributes nothing**: a
      // strength-0 bloom still runs a full-screen bright-pass + four blur draws every frame.
      bloomPass.setConfig({
        threshold: tuning.bloom.threshold,
        strength: tuning.bloom.strength * bloomScale,
        radius: tuning.bloom.radius * bloomRadiusScale,
      });
      bloomPass.enabled = bloomPass.strengthValue > 0.001;

      const progress = getProgress();
      updateCamera(progress);

      // **Tree scan-in.** The tree materialises bottom-up — the same reveal the hand gets, pink
      // bloom band and all, but driven by shader uniforms instead of `updateCloud`, because the
      // cloud is ~150k and stays baked (ADR-0031). Runs on `treeScanRange`, which trails the wipe
      // on purpose (see the config note); the band's colour tracks the live-tunable pink so it
      // matches the hand's and the scatter's.
      if (treeCloud) {
        treeCloud.scan.uScan.value = range(
          progress,
          sequence.treeScanRange[0],
          sequence.treeScanRange[1],
        );
        treeCloud.scan.uScanTint.value.set(scatter.color).multiplyScalar(tree.scanGlow);
      }

      // The X→hand→wave act is remapped onto real progress [0, treeStart]; everything below
      // works in this remapped `seqP` (unchanged tuning) and finishes by `treeStart`.
      const seqP = clamp01(progress / sequence.treeStart);

      const time = elapsed;
      const introA = introAssemble(time);

      // --- Whole-figure float + cursor parallax tilt. Each cloud slowly yaws about its **own**
      // vertical axis, bobs a little, and eases a few degrees toward the cursor (yaw + a slight
      // pitch, frame-rate-independent low-pass). Gated per act so the scroll choreography
      // (scatter/flight, wave morph) never runs on a rotated frame of reference.
      const tiltK = 1 - Math.pow(0.94, dt * 60);
      cursorTilt.x += ((pointerInside ? pointerNdc.x : 0) - cursorTilt.x) * tiltK;
      cursorTilt.y += ((pointerInside ? pointerNdc.y : 0) - cursorTilt.y) * tiltK;
      const cursorYaw = cursorTilt.x * life.cursorTilt.yaw;
      const cursorPitch = -cursorTilt.y * life.cursorTilt.pitch;
      // The X rocks through the hero hold and settles level as the burst begins.
      const heroHold = 1 - smoother(range(seqP, 0, 0.08));
      rockMesh(
        glyphCloud.mesh,
        glyph.center[0],
        glyph.center[1],
        glyph.center[2],
        (Math.sin(time * 0.45) * life.glyph.rock + cursorYaw) * heroHold,
        cursorPitch * heroHold,
        Math.sin(time * 0.3) * life.glyph.bob * heroHold,
      );
      // The hand **spins a full eased 360°** as it scans in (2π by the scan's end ≡ 0, so the
      // spin hands over seamlessly), then floats while it is the framed resting figure — out
      // before the wave morph (whose curtain shares this mesh and must stay unrotated).
      if (handCloud) {
        const handSpin = smoother(range(seqP, 0.42, 0.57)) * Math.PI * 2;
        const handHold =
          smoother(range(seqP, 0.44, 0.52)) *
          (1 - smoother(range(seqP, waveCfg.transformRange[0] - 0.06, waveCfg.transformRange[0])));
        rockMesh(
          handCloud.mesh,
          hand.center[0],
          hand.center[1],
          hand.center[2],
          handSpin + (Math.sin(time * 0.27 + 1) * life.hand.rock + cursorYaw) * handHold,
          cursorPitch * handHold,
          Math.sin(time * 0.19 + 2) * life.hand.bob * handHold,
        );
      }
      // The tree floats through its whole act (its framing is otherwise static).
      if (treeCloud) {
        rockMesh(
          treeCloud.mesh,
          tree.center[0],
          tree.center[1],
          tree.center[2],
          Math.sin(time * 0.24 + 3) * life.tree.rock + cursorYaw,
          cursorPitch,
          Math.sin(time * 0.17 + 1) * life.tree.bob,
        );
      }

      // --- Lattice build states. Each net weaves itself segment by segment (see
      // [[containment-field]]). The hero's **waits** until the X is `intro.netDelay` assembled,
      // then weaves in over its own window — the cage closes around a nearly-finished figure —
      // and un-weaves over `netRange` as the X bursts. The hand's builds as its act approaches;
      // the tree's waits for **half the tree scan** before closing around it.
      const introElapsed = introStart === 0 ? 0 : time - introStart;
      const heroWeave = clamp01(
        (introElapsed - sequence.intro.seconds * sequence.intro.netDelay) /
          sequence.intro.netWeaveSeconds,
      );
      heroNet.uBuild.value =
        heroWeave * (1 - range(seqP, sequence.netRange[0], sequence.netRange[1]));
      handNet.uBuild.value = range(seqP, 0.3, 0.47);
      const treeScanMid = (sequence.treeScanRange[0] + sequence.treeScanRange[1]) / 2;
      treeNet.uBuild.value = range(progress, treeScanMid, sequence.treeScanRange[1]);
      // Impulse clock + the slow forever-turn of every cage.
      heroNet.uTime.value = time;
      handNet.uTime.value = time;
      treeNet.uTime.value = time;
      heroNet.lines.rotation.y = time * field.spin;
      handNet.lines.rotation.y = time * field.spin;
      treeNet.lines.rotation.y = time * field.spin;
      dustField.update(time);
      handDust.update(time);
      treeDust.update(time);
      // GPU life clocks — one uniform write per system; the sway/flow/rise all run in-shader.
      glyphCloud.life.uTime.value = time;
      if (handCloud) handCloud.life.uTime.value = time;
      if (treeCloud) treeCloud.life.uTime.value = time;
      waveMotesFx.update(time);
      treeMotesFx.update(time);
      // The wave motes belong to the hand/wave acts — hidden while the hero X owns the frame
      // (additive sparks over the glyph read as stray noise).
      waveMotesFx.points.visible = seqP > 0.35;

      // Glyph cursor is an idle effect at the start; it fades as the scatter takes over.
      const glyphGate = 1 - smoother(range(seqP, 0, sequence.scatterRange[0]));
      const scatterAmount = range(seqP, sequence.scatterRange[0], sequence.scatterRange[1]);
      // The X assembles **directly** into the corridor streamers (flight), then whips out in
      // front of the hand — completed *before* the camera pitches up off the hand (arrive
      // 0.56), so the fly-away is seen head-on, not during the upward turn.
      const flightAmount = range(seqP, 0.03, 0.2);
      // Curves disperse earlier — already flying off well before the camera reaches the hand.
      const exitAmount = range(seqP, 0.24, 0.5);
      // Perf: once the glyph has fully dispersed (exit done) it's invisible — stop updating and
      // rendering its 32k particles so the second morph isn't running two big clouds at once.
      const glyphActive = seqP < 0.54;
      glyphCloud.mesh.visible = glyphActive;
      // The glyph is the only thing inside the shadow camera's tight frustum (the hand and tree
      // sit far beyond its 110-unit far plane), so once it disperses the per-frame depth raster
      // draws an empty map — stop re-rendering it for the whole wave/tree half of the scroll.
      // Re-entering the hero act flips it back on (and `needsUpdate` refreshes the stale map).
      const shadowsLive = !isMobile && glyphActive;
      if (renderer.shadowMap.autoUpdate !== shadowsLive) {
        renderer.shadowMap.autoUpdate = shadowsLive;
        renderer.shadowMap.needsUpdate = shadowsLive;
      }
      if (glyphActive) {
        updateCloud(glyphCloud, {
          pointer: glyphGate > 0.001 ? pointerOnPlane(glyphCenter) : null,
          pointerConfig: sceneConfig.pointer,
          pointerGate: glyphGate,
          scatter: scatterAmount,
          scatterConfig: scatter,
          flight: flightAmount,
          exit: exitAmount,
          idle: sceneConfig.idle,
          // The intro fly-in: particles stream from around the camera's opening pose into the X.
          assemble: introA,
          assembleFrom: sequence.camera.startPos,
          assembleSpread: sequence.intro.spread,
          assembleGlow: sequence.intro.glow,
          time,
        });
      }

      // Hand: cursor repulsion once framed; then its own particles crumble through a
      // vortex into the wave curtain over `wave.transformRange`.
      const waveAmount = range(seqP, waveCfg.transformRange[0], waveCfg.transformRange[1]);
      // Bottom-up scan-in reveal of the hand (movie body-scan) as the camera nears it,
      // completing before the wave transform starts.
      const scanAmount = range(seqP, 0.42, 0.57);
      // Perf: the hand is invisible until it scans in — skip its 33k updates/render before that.
      // In the tree section (progress ≥ treeStart) the wave curtain keeps rippling, but that update
      // is driven by the wipe block below (which re-renders the live wave into `rtWave` each frame),
      // so the main path stops at `treeStart` to avoid updating the hand twice per frame.
      const handActive = seqP > 0.4;
      const handUpdating = handActive && progress < sequence.treeStart;
      if (handCloud) {
        handCloud.mesh.visible = handActive;
        // The hand casts/receives shadows only while it's a solid resting hand; during the wave
        // morph the particles spread into curves/grid where self-shadow is irrelevant and the
        // shadow pass over 33k spheres is expensive — turn it off once the morph starts.
        const handShadow = waveAmount <= 0.0001;
        if (handCloud.mesh.castShadow !== handShadow) {
          handCloud.mesh.castShadow = handShadow;
          handCloud.mesh.receiveShadow = handShadow;
        }
      }
      if (handCloud && handUpdating) {
        // Cursor works between the hand arriving and the transform starting; and again once the wave
        // has formed (repelling the curtain around the pointer, like the hero glyph).
        const handGate =
          smoother(range(seqP, sequence.arrive, sequence.arrive + 0.04)) *
          (1 - smoother(range(seqP, waveCfg.transformRange[0] - 0.05, waveCfg.transformRange[0])));
        const waveGate = smoother(range(waveAmount, 0.85, 1));
        const activeGate = Math.max(handGate, waveGate);
        updateCloud(handCloud, {
          pointer:
            activeGate <= 0.001
              ? null
              : handGate >= waveGate
                ? pointerOnPlane(handCenter)
                : pointerOnPlane(waveCenter),
          pointerConfig: sceneConfig.pointer,
          pointerGate: activeGate,
          scatter: 0,
          scatterConfig: scatter,
          scan: scanAmount,
          scanGlow: hand.scanGlow,
          idle: sceneConfig.idle,
          // Thins the hand only — the held-back beads arrive with the wave, so the curtain keeps
          // every instance and its grid still covers them.
          sparse: hand.sparse,
          wave: waveAmount,
          waveConfig: waveCfg,
          time,
        });
      }

      // --- Tree section: a screen-space wipe reveals the tree over the (live) wave ------------
      // The tree is its **own framed view** (`treeCamera`), composited over the wave view by the
      // wipe; the main camera holds on the wave (it stays in place). The **tree** is static, so it's
      // baked into `rtTree` once; the **wave keeps rippling** — it's re-rendered into `rtWave` every
      // frame (33k, cheap) so the curtain never freezes, staying dynamic until the wipe covers it.
      const treeIdle = {
        pointer: null,
        pointerConfig: sceneConfig.pointer,
        pointerGate: 0,
        scatter: 0,
        scatterConfig: scatter,
        idle: sceneConfig.idle,
        time,
      };

      if (progress >= sequence.treeStart && progress < sequence.wipeRange[1]) {
        // Keep the wave curtain **live**: update the hand to the fully-formed, rippling wave every
        // frame (33k — cheap; `time` advances so the ripple/idle never stop). Force `wave`/`scan` to
        // 1 so it's correct even when the sequence is jumped straight here (debug scrub).
        if (handCloud) {
          handCloud.mesh.visible = true;
          updateCloud(handCloud, { ...treeIdle, scan: 1, wave: 1, waveConfig: waveCfg });
        }

        // **Both views are rendered live every frame** (no bake-once cache). The wave curtain into
        // `rtWave` (tree hidden); the tree into `rtTree` (wave hidden). The tree *cloud* is static
        // (updated once at load) so this is a **warm redraw** — cheap — but its `treeDust` drifts, and
        // re-drawing keeps that dust live *and* makes the composited tree **pixel-identical to the
        // post-wipe direct render**. That's what removes the flicker + dust jump the old bake-once
        // path caused: it baked the dust at a single instant, so it sat frozen through the wipe and
        // then snapped to its live position the moment the direct render took over. No cursor push on
        // the tree mid-transition (the user is scrolling, not hovering) — keep it the resting cloud.
        treeSceneGroup.visible = false;
        renderer.setRenderTarget(rtWave);
        renderer.render(scene, camera);
        // Keep the hover simulation ticking with **no cursor**, so anything the user pushed before
        // scrolling away drifts home on its own ramp instead of freezing mid-displacement and
        // snapping back the next time the finale is entered.
        treeRelax?.step(renderer, null);
        if (handCloud) handCloud.mesh.visible = false;
        treeSceneGroup.visible = true;
        driftTreeCamera(time);
        renderer.setRenderTarget(rtTree);
        renderer.render(scene, treeCamera);
        renderer.setRenderTarget(null);
        treeSceneGroup.visible = false;
        if (handCloud) handCloud.mesh.visible = true;
        // Sweep the tilted line bottom-up: map [0,1] past the line's full range so it clears.
        const w = range(progress, sequence.wipeRange[0], sequence.wipeRange[1]);
        // Parallax: the wave drifts down (+ = content lower); the tree descends into place —
        // starts `wipeTreeDrop` higher and settles to rest (0) by the end, so it matches the
        // direct render after the wipe with no jump. Different rates read as depth.
        const waveShift = sequence.wipeWaveDrop * w;
        const treeShift = -sequence.wipeTreeDrop * (1 - w);
        wipePass.setViews(rtWave.texture, rtTree.texture, -0.3 + w * 1.6, waveShift, treeShift);
        renderPass.enabled = false;
        wipePass.enabled = true;
        composer.render();
        return;
      }

      wipePass.enabled = false;
      renderPass.enabled = true;
      if (progress >= sequence.wipeRange[1]) {
        // Fully in the tree scene — render it directly from the tree camera (wave gone). The tree
        // is static (updated once at load), so this is just a render — no per-frame 150k update.
        // **Cursor hover** on the tree runs on the **GPU** (the cloud is far too heavy to re-run
        // `updateCloud`): project the cursor onto the tree plane via `treeCamera` and feed the push
        // uniform, so the render alone repels the beads around it (like the hero glyph).
        if (treeCloud) {
          // Same violet heat the glyph's touched beads take, so the two hovers read as one effect
          // rather than "the tree moves, the glyph glows". The *amount* comes from the simulation's
          // eased heat channel, so it fades up and down with the displacement.
          treeCloud.pointer.uPointerTint.value
            .set(sceneConfig.pointer.color)
            .multiplyScalar(sceneConfig.pointer.glow);
          treeRelax?.step(renderer, pointerOnPlaneCam(treeCamera, treeCenter));
        }
        driftTreeCamera(time);
        renderPass.camera = treeCamera;
        treeSceneGroup.visible = true;
        if (handCloud) {
          handCloud.mesh.visible = false;
          // Keep the (hidden) wave curtain **updating** so it never freezes. If it froze here, then
          // scrolling back up to it would re-render a stale frame that eases to the live ripple over
          // a few frames — a visible flicker/settle as the wave re-appears. Cheap (33k, tree is
          // static so the frame budget is light) and it's the same `wave = 1` state as the bake path.
          updateCloud(handCloud, { ...treeIdle, scan: 1, wave: 1, waveConfig: waveCfg });
        }
      } else {
        // The X→hand→wave act: normal single-scene render from the wave camera.
        renderPass.camera = camera;
        treeSceneGroup.visible = false;
      }

      composer.render();
    };

    // --- Render loop: shared ticker, gated, budgeted ------------------------
    // Not its own `requestAnimationFrame`. The page already runs **one** app-wide loop
    // (`subscribeToTicker`) that the springs and the DOM reveals ride; a second forever-rAF for the
    // scene is the documented cause of scroll jank. Each subscriber is throttled independently, so
    // capping the scene at 30 fps on a phone never slows the UI animation sharing the loop.
    let paused = false;
    // The canvas is `fixed inset-0` and the sequence spans the whole document, so it is on screen for
    // the entire scroll — the meaningful gate here is the **hidden tab**, not an in-view test. The
    // observer still guards the case where the container is ever collapsed or unmounted-in-place.
    let onScreen = true;
    const visibility = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
      },
      { rootMargin: "100% 0px" },
    );
    visibility.observe(container);

    const budget = frameBudgetMs(tier);
    const unsubscribeTicker = subscribeToTicker(
      (time) => {
        if (paused || !onScreen || document.hidden || isWorkCarouselVisible()) return;
        renderFrame(time);
      },
      () => budget,
    );

    // --- Debug (`?debug=1`) ------------------------------------------------
    interface SceneDebug {
      pause: () => void;
      resume: () => void;
      frame: () => void;
      progress: (p: number | null) => void;
      inspect: () => unknown;
      info: () => unknown;
      relax: () => unknown;
    }
    const debugWindow = window as typeof window & { __scene?: SceneDebug };
    if (debug) {
      debugWindow.__scene = {
        pause: () => {
          paused = true;
        },
        resume: () => {
          paused = false;
        },
        frame: () => renderFrame(),
        // Perf baseline. **`programs` must not grow once the scene has warmed up** — if it does, a
        // shader variant is still compiling mid-scroll, which is exactly what a micro-freeze is.
        info: () => {
          let lights = 0;
          scene.traverse((o) => {
            if ((o as { isLight?: boolean }).isLight) lights += 1;
          });
          return {
            ...renderer.info.render,
            programs: renderer.info.programs?.length ?? 0,
            geometries: renderer.info.memory.geometries,
            textures: renderer.info.memory.textures,
            tier,
            pixelRatio: renderer.getPixelRatio(),
            shadows: renderer.shadowMap.enabled,
            lights,
            glyph: glyphT.count,
            handDensity: handT.density,
            treeDensity: treeT.density,
            dust: dustT.count,
            frameBudgetMs: budget,
          };
        },
        progress: (p) => {
          debugProgress = p;
        },
        // Tree hover, end to end. `maxDisplacement` should climb toward `pointer.strength` while the
        // cursor is on the tree and decay slowly once it leaves — but that only proves the
        // *simulation* runs. `attributes` and `programs` prove the **render** consumes it: the tree's
        // geometry must carry `aRelaxUv`, and the program it actually draws with must declare it.
        relax: () => ({
          ...(treeRelax ? treeRelax.debugStats(renderer) : { enabled: false }),
          map: treeCloud?.relax?.uRelaxMap.value !== undefined && treeCloud?.relax?.uRelaxMap.value !== null,
          attributes: treeCloud ? Object.keys(treeCloud.mesh.geometry.attributes) : [],
          programs: (renderer.info.programs ?? [])
            .filter((p) => p.cacheKey.includes("particle-cloud"))
            .map((p) => ({
              usedTimes: p.usedTimes,
              variant: p.cacheKey.includes("particle-cloud-relax") ? "relax" : "analytic",
              // The one that matters: an attribute the program never declared is not an error in
              // GLSL, it just reads zero — so this is the only proof the hover can move anything.
              hasRelaxAttribute: Object.keys(p.getAttributes()).includes("aRelaxUv"),
            })),
        }),
        inspect: () => {
          const m = handCloud?.mesh.instanceMatrix.array as Float32Array | undefined;
          if (!m) return { hand: null };
          let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;
          // Beads currently at a non-zero scale. The `hand.sparse` slice sits at exactly 0 through
          // the hand act and returns for the wave, so this is what proves "sparser hand, same
          // curtain": it should read well under `total` at the hand and all of it once the wave forms.
          let live = 0;
          for (let i = 0; i < m.length; i += 16) {
            const x = m[i + 12], y = m[i + 13], z = m[i + 14];
            if (m[i] > 1e-4) live += 1;
            if (x < minX) minX = x; if (x > maxX) maxX = x;
            if (y < minY) minY = y; if (y > maxY) maxY = y;
            if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
          }
          const tm = treeCloud?.mesh.instanceMatrix.array as Float32Array | undefined;
          let treeBounds: Record<string, number> | null = null;
          if (tm) {
            let tnx = Infinity, txx = -Infinity, tny = Infinity, txy = -Infinity, tnz = Infinity, txz = -Infinity;
            for (let i = 0; i < tm.length; i += 16) {
              const x = tm[i + 12], y = tm[i + 13], z = tm[i + 14];
              if (x < tnx) tnx = x; if (x > txx) txx = x;
              if (y < tny) tny = y; if (y > txy) txy = y;
              if (z < tnz) tnz = z; if (z > txz) txz = z;
            }
            treeBounds = { minX: tnx, maxX: txx, minY: tny, maxY: txy, minZ: tnz, maxZ: txz, count: tm.length / 16 };
          }
          return {
            hand: { live, total: m.length / 16 },
            handBounds: { minX, maxX, minY, maxY, minZ, maxZ },
            treeBounds,
            camPos: camera.position.toArray(),
            camDir: camera.getWorldDirection(new Vector3()).toArray(),
            camUp: camera.up.toArray(),
          };
        },
      };
    }

    return () => {
      // If the hand is still loading, its `.then` disposes it; if it already
      // resolved it's in `scene` and `disposeScene` below frees it.
      disposed = true;
      unsubscribeTicker();
      visibility.disconnect();
      if (debug) delete debugWindow.__scene;
      sizeObserver?.disconnect();
      if (pointerEnabled) {
        window.removeEventListener("pointermove", handlePointerMove);
      }
      treeRelax?.dispose();
      composer.dispose();
      wipePass.dispose();
      rtWave.dispose();
      rtTree.dispose();
      disposeScene(scene);
      disposeScene(envScene);
      environment.dispose();
      pmrem.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // `transform-gpu backface-hidden will-change-transform` promotes the canvas to its **own
  // compositor layer**. Without it a neighbouring fixed element repainting during scroll (this page
  // has several — blended flares, grain, backdrop-filtered UI) invalidates the WebGL composite on
  // WebKit and the whole scene flickers.
  return (
    <div
      ref={containerRef}
      className="pointer-events-none h-full w-full transform-gpu backface-hidden will-change-transform"
      aria-hidden="true"
    />
  );
};
