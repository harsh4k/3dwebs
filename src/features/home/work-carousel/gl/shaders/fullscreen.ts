/**
 * MIT — adapted from Yousuf Soomro, dither-blur-carousel.
 */

export const fullscreenVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const streakFragment = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec2 uTexel;
  uniform vec2 uDirection;
  uniform float uSpread;
  varying vec2 vUv;

  void main() {
    vec2 stride = uDirection * uTexel * uSpread;
    vec4 sum = vec4(0.0);
    float total = 0.0;
    for (int i = -8; i <= 8; i++) {
      float fi = float(i);
      float w = exp(-fi * fi / 18.0);
      sum += texture2D(uMap, vUv + stride * fi) * w;
      total += w;
    }
    gl_FragColor = sum / total;
  }
`;
