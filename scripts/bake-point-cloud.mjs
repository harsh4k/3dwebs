/**
 * Bake a GLB mesh into the same `bin_u16` point cloud the hand/tree loaders use.
 *
 * Surface-biased: points sit on the skin, then a fraction is pushed a little
 * inward along the normal so the cloud has a thin shell (crease stays a valley).
 * Do not volume-fill — a filled bean reads as a blob.
 *
 * **Pass `--shell 0` for a flat or double-sided mesh.** The offset walks along the
 * vertex normal, so it only goes inward where the winding is outward-facing. On a
 * Blender "double-sided" plate the two halves can wind opposite ways, and the offset
 * then inflates one half while thinning the other — identical shapes bake to visibly
 * different stroke weights. The tell is the normalised height printed at the end:
 * anything above 2.000 means points were pushed outward. A flat plate is already a
 * shell, so it loses nothing by skipping the offset.
 *
 * The source GLB is a third-party mesh. Keep it in `reference/bean/` (gitignored).
 * Only the derived `points.bin` + manifest ship with the site.
 *
 *   node scripts/bake-point-cloud.mjs reference/bean/coffee-bean.glb --out public/assets/bean
 *
 * Options:
 *   --count N     surface samples (default 12000)
 *   --shell F     inward offset as a fraction of the model's height (default 0.035)
 *   --seed N
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { Box3, LoadingManager, Mesh, MeshBasicMaterial, Vector3 } from "three";

// GLTFLoader walks textures via `self.URL`. We only need POSITION; polyfill the
// browser global so Node can parse a Sketchfab GLB without a DOM.
if (typeof globalThis.self === "undefined") {
  globalThis.self = globalThis;
}
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

const U16_MAX = 65535;

const args = process.argv.slice(2);
const input = args.find((a) => !a.startsWith("--"));
const outDir = flag("out") ?? "public/assets/bean";
const count = Number(flag("count") ?? 12000);
const shellFrac = Number(flag("shell") ?? 0.035);
const seed = Number(flag("seed") ?? 20260821);

if (!input) {
  console.error(
    "Usage: node scripts/bake-point-cloud.mjs <model.glb> --out public/assets/bean [--count 12000] [--shell 0.035]",
  );
  process.exit(1);
}

function flag(name) {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
}

function mulberry32(s) {
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const buffer = await readFile(path.resolve(input));
const manager = new LoadingManager();
manager.setURLModifier((url) => {
  if (/\.(png|jpe?g|webp|gif|ktx2)$/i.test(url) || url.startsWith("blob:")) {
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
  }
  return url;
});
const gltf = await new Promise((resolve, reject) => {
  new GLTFLoader(manager).parse(
    buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
    "",
    resolve,
    reject,
  );
});

const geos = [];
gltf.scene.traverse((obj) => {
  if (obj.isMesh && obj.geometry) {
    const g = obj.geometry.clone();
    obj.updateWorldMatrix(true, false);
    g.applyMatrix4(obj.matrixWorld);
    geos.push(g);
  }
});

if (geos.length === 0) {
  console.error("No meshes in GLB.");
  process.exit(1);
}

const vertexCount = (g) => g.getAttribute("position")?.count ?? 0;
const largest = geos.reduce((a, b) => (vertexCount(b) > vertexCount(a) ? b : a));
const useLargest = args.includes("--largest") || geos.length > 1;
const geometry = useLargest
  ? largest
  : geos.length === 1
    ? geos[0]
    : mergeGeometries(geos, false);
if (!geometry) {
  console.error("Could not merge meshes.");
  process.exit(1);
}
console.log(
  `Meshes: ${geos.length} · using ${useLargest && geos.length > 1 ? "largest" : geos.length === 1 ? "only" : "merged"} (${vertexCount(geometry)} verts)`,
);

geometry.computeBoundingBox();
const box = geometry.boundingBox ?? new Box3().setFromBufferAttribute(geometry.getAttribute("position"));
const size = new Vector3();
box.getSize(size);
const height = size.y || 1;
// Same convention as the hand: model height 2, centred on origin.
const scaleToUnit = 2 / height;
geometry.translate(-(box.min.x + box.max.x) / 2, -(box.min.y + box.max.y) / 2, -(box.min.z + box.max.z) / 2);
geometry.scale(scaleToUnit, scaleToUnit, scaleToUnit);
geometry.computeVertexNormals();

const mesh = new Mesh(geometry, new MeshBasicMaterial());
const sampler = new MeshSurfaceSampler(mesh).build();
const rand = mulberry32(seed);
const position = new Vector3();
const normal = new Vector3();
const shell = 2 * shellFrac;

const xs = new Float32Array(count);
const ys = new Float32Array(count);
const zs = new Float32Array(count);

for (let i = 0; i < count; i += 1) {
  sampler.sample(position, normal);
  const inward = rand() * shell;
  position.addScaledVector(normal, -inward);
  xs[i] = position.x;
  ys[i] = position.y;
  zs[i] = position.z;
}

let minX = Infinity;
let minY = Infinity;
let minZ = Infinity;
let maxX = -Infinity;
let maxY = -Infinity;
let maxZ = -Infinity;
for (let i = 0; i < count; i += 1) {
  minX = Math.min(minX, xs[i]);
  minY = Math.min(minY, ys[i]);
  minZ = Math.min(minZ, zs[i]);
  maxX = Math.max(maxX, xs[i]);
  maxY = Math.max(maxY, ys[i]);
  maxZ = Math.max(maxZ, zs[i]);
}

const sx = maxX - minX || 1;
const sy = maxY - minY || 1;
const sz = maxZ - minZ || 1;
const packed = new Uint16Array(count * 3);
for (let i = 0; i < count; i += 1) {
  packed[i * 3] = Math.round(((xs[i] - minX) / sx) * U16_MAX);
  packed[i * 3 + 1] = Math.round(((ys[i] - minY) / sy) * U16_MAX);
  packed[i * 3 + 2] = Math.round(((zs[i] - minZ) / sz) * U16_MAX);
}

const dest = path.resolve(outDir);
await mkdir(dest, { recursive: true });
await writeFile(path.join(dest, "points.bin"), Buffer.from(packed.buffer));
await writeFile(
  path.join(dest, "points.manifest.json"),
  `${JSON.stringify(
    {
      objects: [
        {
          name: "points",
          file: "points.bin",
          format: "bin_u16",
          count,
          up_axis: "Y",
          decode_offset: [minX, minY, minZ],
          decode_scale: [sx, sy, sz],
        },
      ],
    },
    null,
    2,
  )}\n`,
);

console.log(`Wrote ${count} points → ${dest}/points.bin (${(count * 6 / 1024).toFixed(1)} KB)`);
console.log(`Normalised height ≈ ${sy.toFixed(3)} (hand/tree expect ~2)`);
