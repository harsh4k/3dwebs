// 📖 Docs: obsidian/frontend/components/common.md

import { BackSide, Color, Mesh, ShaderMaterial, SphereGeometry } from "three";

/**
 * Builds the enveloping background — a large inverted sphere carrying a vertical
 * gradient, bright where the ring light sits and falling away to near-black at
 * the floor.
 *
 * A flat `scene.background` colour would read as a void; the gradient is what
 * makes the space feel like a lit room. It opts out of fog (it *is* the
 * horizon) and writes no depth so everything renders in front of it.
 */
export const createBackdrop = (
  topColor: string,
  bottomColor: string,
  radius = 400,
): Mesh<SphereGeometry, ShaderMaterial> => {
  const material = new ShaderMaterial({
    side: BackSide,
    depthWrite: false,
    fog: false,
    uniforms: {
      topColor: { value: new Color(topColor) },
      bottomColor: { value: new Color(bottomColor) },
      // Offset 0 puts the gradient's darkest stop exactly at ground level, so
      // everything below the horizon is a flat `bottomColor`. Paired with
      // `bottomColor === fog`, the fogged ground and the sky meet at the same
      // value and the horizon line disappears.
      gradientScale: { value: 110 },
      gradientOffset: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      uniform float gradientScale;
      uniform float gradientOffset;
      varying vec3 vWorldPosition;
      void main() {
        float h = clamp(vWorldPosition.y / gradientScale + gradientOffset, 0.0, 1.0);
        gl_FragColor = vec4(mix(bottomColor, topColor, h), 1.0);
      }
    `,
  });

  return new Mesh(new SphereGeometry(radius, 32, 32), material);
};
