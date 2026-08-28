/**
 * The footer fog.
 *
 * A single full-screen quad running three-octave fbm, domain-warped by a second fbm and masked to
 * the bottom of the footer so the smoke sits under the type rather than over it.
 *
 * **The palette is uniforms, not literals.** Every colour arrives from `src/styles/tokens.css` by
 * way of `footer-fog.ts`, so the fog is inside the brand lock and there is exactly one place any
 * of these colours is defined. Baking a ramp into the GLSL would put four colours on the home page
 * that no token file knows about — which is the failure that retired the stripe device (brain
 * D16), and it would also make the fog the one element on the site that cannot be re-themed.
 *
 * Two values drive it from outside:
 *
 * - `uMorph` is an accumulator, not a clock. Its *rate* rises when strings are plucked, so the
 *   smoke churns harder while the field is being played and settles when it is left alone. It also
 *   cross-fades two independent noise fields, so the pattern never visibly repeats.
 * - `uPulse` is the hover pulse. This one brightens: it lifts the density and mixes in the tint.
 */

export const FOG_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const FOG_FRAG = /* glsl */ `
  precision highp float;

  uniform vec2  uResolution;
  uniform float uMorph;
  uniform float uPulse;

  uniform vec3 uBase;   // deepest smoke
  uniform vec3 uMid;    // body of the smoke
  uniform vec3 uHigh;   // where it thins out
  uniform vec3 uTint;   // mixed in by the hover pulse

  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float valueNoise(vec2 p) {
    vec2 cell = floor(p);
    vec2 f = fract(p);
    // Smoothstep the interpolant so the lattice does not show as a grid.
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(cell), hash(cell + vec2(1.0, 0.0)), u.x),
      mix(hash(cell + vec2(0.0, 1.0)), hash(cell + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float sum = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 3; i++) {
      sum += amplitude * valueNoise(p);
      p *= 2.02;          // slightly off 2.0, so octaves do not align on the lattice
      amplitude *= 0.5;
    }
    return sum;
  }

  // Domain warping: displace the sample point by another fbm before reading it. This is what turns
  // plain noise into something that curls like smoke instead of drifting like static.
  float smoke(vec2 p, float t) {
    vec2 warp = vec2(fbm(p + vec2(t * 0.11, 0.0)), fbm(p + vec2(0.0, t * 0.09)));
    return fbm(p + warp * 1.8);
  }

  void main() {
    vec2 uv = vUv;
    // Correct for viewport aspect so the smoke keeps its shape rather than stretching.
    vec2 p = vec2(uv.x * (uResolution.x / max(uResolution.y, 1.0)), uv.y) * 2.4;

    // Two independent fields half a loop apart, cross-faded, so the pattern never repeats visibly.
    float loop = 32.0;
    float m = mod(uMorph, loop);
    float blend = smoothstep(0.0, 1.0, abs(m / (loop * 0.5) - 1.0));
    float a = smoke(p, m);
    float b = smoke(p + vec2(16.0), m - loop * 0.5);
    float density = mix(a, b, blend);

    // Mask to the bottom edge. The low exponent keeps a long, soft falloff rather than a hard band.
    float mask = pow(1.0 - smoothstep(0.0, 1.0, uv.y), 0.22);
    float f = clamp(density * mask + uPulse * 0.18, 0.0, 1.0);

    vec3 col = mix(uBase, uMid, pow(f, 1.0));
    col = mix(col, uHigh, pow(f, 2.2));
    col = mix(col, uTint, uPulse * 0.55 * f);

    // Alpha follows density, so the footer ground shows through where the smoke thins out.
    gl_FragColor = vec4(col, f);
  }
`;
