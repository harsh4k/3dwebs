"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

interface FlameUniforms {
  u_time: { value: number };
  [uniform: string]: THREE.IUniform;
}

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

// "Northern lights" corner shader — the original flame warp restyled to aurora
// colours (green/teal curtains with violet tops). Dark in the centre, glow
// concentrated at the edges/corners, so it reads as aurora wrapping the screen
// behind the black sphere panel + the portfolio.
const fragmentShader = /* glsl */ `
  precision mediump float;
  varying vec2 vUv;
  uniform float u_time;
  const vec3 iAuroraDeep = vec3(0.38, 0.14, 0.88);   // deep indigo-violet
  const vec3 iAuroraBright = vec3(0.66, 0.30, 1.00); // bright purple curtain
  vec3 warp3d(vec3 pos, float t) {
      float curv = .8, a = 1.9, b = 0.7; pos *= 2.;
      pos.x += curv * sin(t + a * pos.y) + t * b; pos.y += curv * cos(t + a * pos.x);
      pos.y += curv * sin(t + a * pos.z) + t * b; pos.z += curv * cos(t + a * pos.y);
      pos.z += curv * sin(t + a * pos.x) + t * b; pos.x += curv * cos(t + a * pos.z);
      return 0.5 + 0.5 * cos(pos.xyz + vec3(1, 2, 4));
  }
  void main() {
      vec2 uv = 2.0 * vUv - 1.0;
      vec3 w = pow(warp3d(vec3(uv.x, sin(uv.y), uv.y), u_time * 1.5), vec3(1.5));
      vec3 col = 1.6 * iAuroraDeep * w.x; col *= w.y; col += iAuroraBright * w.z;
      // Corner concentration (dark centre), as in the source flame.
      col *= smoothstep(0.6, 1.0, abs(uv.y));
      col *= smoothstep(-0.5, 1.0, -uv.y * uv.x); col *= smoothstep(-0.5, 1.0, -uv.y * uv.x);
      // Alpha = glow magnitude, so the centre is transparent and only the
      // corners paint. This lets the shader sit as an OVERLAY above the black
      // sphere panel — the sphere shows through the clear centre while the
      // aurora wraps the corners.
      vec3 c = col * 1.15;
      float a = clamp(max(c.r, max(c.g, c.b)) * 1.6, 0.0, 0.9);
      gl_FragColor = vec4(c, a);
  }
`;

function FlameMesh() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo<FlameUniforms>(() => ({ u_time: { value: 0 } }), []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.u_time.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

export function FlameBackground({
  className,
  active = true,
}: {
  className?: string;
  /** Pause the render loop when off-screen (see timeline `sceneVisibility`). */
  active?: boolean;
}) {
  return (
    <div className={className}>
      <Canvas
        style={{ width: "100%", height: "100%" }}
        gl={{ alpha: true }}
        dpr={[1, 2]}
        frameloop={active ? "always" : "never"}
        // Size the drawing buffer from the element's LAYOUT box (offsetSize),
        // not its transformed bounding rect, and don't re-measure on scroll.
        // The showreel zooms canvases via CSS 3D transforms; without this R3F
        // tracks the on-screen (scaled) rect and reallocates a ballooning
        // framebuffer every scroll frame — the source of the scroll freeze.
        resize={{ offsetSize: true, scroll: false }}
      >
        <FlameMesh />
      </Canvas>
    </div>
  );
}
