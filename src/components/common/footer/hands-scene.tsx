'use client';

import { useEffect, useRef } from 'react';
import {
  ACESFilmicToneMapping,
  AmbientLight,
  Box3,
  Clock,
  DirectionalLight,
  Group,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PMREMGenerator,
  Quaternion,
  Scene,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

import { DRACO_DECODER_PATH, FOOTER_HANDS_GLB } from './assets';

const TARGET_SIZE = 6.6;
const STAR_AXIS = new Vector3(0.42, 0.91, 0).normalize();
const CHROME = {
  color: 0xeef1f6,
  metalness: 1,
  roughness: 0.08,
  envMapIntensity: 1.3,
} as const;

function recenterStar(star: Mesh) {
  const geometry = star.geometry.clone();
  geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  if (!box) return;
  const centre = new Vector3();
  box.getCenter(centre);
  geometry.translate(-centre.x, -centre.y, -centre.z);
  star.geometry.dispose();
  star.geometry = geometry;
  const offset = centre.clone().multiply(star.scale).applyQuaternion(star.quaternion);
  star.position.add(offset);
}

/**
 * Transparent WebGL layer: chrome hands holding a spinning star, tilting toward the cursor.
 * Video behind the canvas is the colour. Built once per mount; loop pauses when the tab is hidden.
 */
export function HandsScene() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reduced = reduce.matches;
    const onReduce = () => {
      reduced = reduce.matches;
    };
    reduce.addEventListener('change', onReduce);

    const renderer = new WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    el.appendChild(renderer.domElement);

    const scene = new Scene();
    const camera = new PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0, 6);

    const pmrem = new PMREMGenerator(renderer);
    const envScene = new RoomEnvironment();
    const envRT = pmrem.fromScene(envScene, 0.04);
    scene.environment = envRT.texture;
    envScene.dispose();

    scene.add(new AmbientLight(0xffffff, 0.3));
    const key = new DirectionalLight(0xffffff, 1.1);
    key.position.set(3, 4, 5);
    scene.add(key);
    const rim = new DirectionalLight(0x8a7bff, 0.6);
    rim.position.set(-4, 1, -2);
    scene.add(rim);

    const tiltGroup = new Group();
    scene.add(tiltGroup);

    const chrome = new MeshStandardMaterial({
      color: CHROME.color,
      metalness: CHROME.metalness,
      roughness: CHROME.roughness,
      envMapIntensity: CHROME.envMapIntensity,
    });

    let star: Mesh | null = null;
    let raf = 0;
    let running = true;
    let cancelled = false;
    const clock = new Clock();
    const pointer = new Vector2(0, 0);
    const spinQuat = new Quaternion();

    const fit = () => {
      const w = Math.max(1, el.clientWidth);
      const h = Math.max(1, el.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(w, h, false);
    };
    fit();

    const draco = new DRACOLoader();
    draco.setDecoderPath(DRACO_DECODER_PATH);
    const loader = new GLTFLoader();
    loader.setDRACOLoader(draco);

    loader.load(FOOTER_HANDS_GLB, (gltf) => {
      if (cancelled) {
        gltf.scene.traverse((node) => {
          if (node instanceof Mesh) node.geometry.dispose();
        });
        return;
      }
      const pivot = new Group();
      gltf.scene.traverse((node) => {
        if (!(node instanceof Mesh)) return;
        node.material = chrome;
        if (node.name === 'Curve') {
          recenterStar(node);
          star = node;
        }
      });
      pivot.add(gltf.scene);
      const box = new Box3().setFromObject(pivot);
      const size = new Vector3();
      const centre = new Vector3();
      box.getSize(size);
      box.getCenter(centre);
      pivot.position.sub(centre);
      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      pivot.scale.setScalar(TARGET_SIZE / maxDim);
      tiltGroup.add(pivot);
    });

    const onMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove);

    const onVis = () => {
      running = document.visibilityState === 'visible';
      if (running) clock.getDelta();
    };
    document.addEventListener('visibilitychange', onVis);

    const ro = new ResizeObserver(fit);
    ro.observe(el);

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!running) return;
      const delta = clock.getDelta();
      if (!reduced && star) {
        spinQuat.setFromAxisAngle(STAR_AXIS, delta * 0.6);
        star.quaternion.premultiply(spinQuat);
      }
      if (!reduced) {
        tiltGroup.rotation.y += (pointer.x * 0.2 - tiltGroup.rotation.y) * 0.06;
        tiltGroup.rotation.x += (pointer.y * 0.12 - tiltGroup.rotation.x) * 0.06;
      }
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      running = false;
      cancelAnimationFrame(raf);
      reduce.removeEventListener('change', onReduce);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('visibilitychange', onVis);
      ro.disconnect();
      draco.dispose();
      chrome.dispose();
      envRT.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className="pointer-events-none absolute inset-0 z-10 [&_canvas]:size-full"
      aria-hidden
    />
  );
}
