// 📖 Docs: obsidian/frontend/components/common.md

/**
 * Curl of a value-noise vector field — a divergence-free 3D flow.
 *
 * Sampled at low frequency, nearby points get nearly the same vector, so a cloud
 * of particles displaced along it bundles into coherent, curving **strands**
 * rather than scattering uniformly. Divergence-free means the flow swirls
 * instead of simply pushing everything outward, which is what makes the streaks
 * read as wisps.
 */

const hash = (x: number, y: number, z: number, seed: number): number => {
  let h = x * 374761393 + y * 668265263 + z * 2147483647 + seed * 1274126177;
  h = (h ^ (h >> 13)) * 1274126177;
  h = h ^ (h >> 16);
  return (h >>> 0) / 4294967295;
};

const smoother = (t: number): number => t * t * t * (t * (t * 6 - 15) + 10);

const valueNoise = (x: number, y: number, z: number, seed: number): number => {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const z0 = Math.floor(z);
  const fx = smoother(x - x0);
  const fy = smoother(y - y0);
  const fz = smoother(z - z0);

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  const c = (dx: number, dy: number, dz: number) =>
    hash(x0 + dx, y0 + dy, z0 + dz, seed);

  const x00 = lerp(c(0, 0, 0), c(1, 0, 0), fx);
  const x10 = lerp(c(0, 1, 0), c(1, 1, 0), fx);
  const x01 = lerp(c(0, 0, 1), c(1, 0, 1), fx);
  const x11 = lerp(c(0, 1, 1), c(1, 1, 1), fx);
  const y0i = lerp(x00, x10, fy);
  const y1i = lerp(x01, x11, fy);
  return lerp(y0i, y1i, fz);
};

/** The three components of the vector potential, offset so they decorrelate. */
const potential = (x: number, y: number, z: number, out: [number, number, number]) => {
  out[0] = valueNoise(x, y, z, 11);
  out[1] = valueNoise(x + 31.4, y + 17.2, z + 47.1, 53);
  out[2] = valueNoise(x - 19.7, y - 8.3, z - 27.9, 97);
};

const pa: [number, number, number] = [0, 0, 0];
const pb: [number, number, number] = [0, 0, 0];

/**
 * Curl of the potential at (x, y, z), written into `out` (not normalised).
 * `eps` is the finite-difference step.
 */
export const curl = (
  x: number,
  y: number,
  z: number,
  out: [number, number, number],
  eps = 0.4,
): void => {
  // ∂P/∂y, ∂P/∂z for the x component, etc. — central differences.
  potential(x, y + eps, z, pa);
  potential(x, y - eps, z, pb);
  const dPz_dy = (pa[2] - pb[2]) / (2 * eps);
  const dPx_dy = (pa[0] - pb[0]) / (2 * eps);

  potential(x, y, z + eps, pa);
  potential(x, y, z - eps, pb);
  const dPy_dz = (pa[1] - pb[1]) / (2 * eps);
  const dPx_dz = (pa[0] - pb[0]) / (2 * eps);

  potential(x + eps, y, z, pa);
  potential(x - eps, y, z, pb);
  const dPz_dx = (pa[2] - pb[2]) / (2 * eps);
  const dPy_dx = (pa[1] - pb[1]) / (2 * eps);

  out[0] = dPz_dy - dPy_dz;
  out[1] = dPx_dz - dPz_dx;
  out[2] = dPy_dx - dPx_dy;
};
