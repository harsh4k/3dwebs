/**
 * GLSL for the two materials in this section.
 *
 * Both are small on purpose. The ribbon shader does one thing texture mapping cannot do on its
 * own, and the grid shader does one thing a mask texture would otherwise cost a download for.
 */

/** Shared vertex stage. The ribbons rewrite their positions on the CPU, so this only forwards UVs. */
export const PLANE_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * Ribbon fragment.
 *
 * The cards are `DoubleSide` because the helix turns them through the camera and you see the back
 * of a card on the far half of every turn. A texture mapped straight onto a double-sided plane is
 * mirrored on one of the two faces, so the artwork reads backwards there. Flipping U on the front
 * face is the correction, and `gl_FrontFacing` is the only way to know which face is being shaded.
 */
export const RIBBON_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  varying vec2 vUv;
  void main() {
    vec2 uv = vUv;
    if (gl_FrontFacing) uv.x = 1.0 - uv.x;
    gl_FragColor = texture2D(uMap, uv);
  }
`;

/**
 * Grid fragment — a textured plane with rounded corners.
 *
 * The corner is cut with a signed-distance field rather than a mask texture: an SDF is resolution
 * independent, costs no download, and stays exact while the plane is still flying in and being
 * scaled. `roundedBox` is the standard rounded-rectangle distance function.
 *
 * **The radius is specified in real pixels, not UV.** `uSize` carries the plane's on-screen size,
 * so the shader works in pixel space and an 8px corner stays 8px whether the plane is filling a
 * 1440px viewport or a phone. Expressed as a UV fraction it would grow and shrink with the plane
 * and the corners would not match anything else on the page.
 *
 * Antialiasing is `fwidth` of the distance — one pixel of feather measured from the actual screen
 * derivative, which stays correct at any scale and under any device pixel ratio.
 */
export const GRID_FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec2 uSize;
  uniform float uRadius;
  varying vec2 vUv;

  float roundedBox(vec2 point, vec2 halfSize, float radius) {
    vec2 q = abs(point) - halfSize + radius;
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - radius;
  }

  void main() {
    vec2 point = (vUv - 0.5) * uSize;
    float dist = roundedBox(point, uSize * 0.5, uRadius);

    float edge = fwidth(dist);
    float alpha = 1.0 - smoothstep(-edge, edge, dist);
    if (alpha <= 0.0) discard;

    vec4 texel = texture2D(uMap, vUv);
    gl_FragColor = vec4(texel.rgb, texel.a * alpha);
  }
`;
