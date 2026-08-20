"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

// Ported faithfully from Showreel/sphere.js — particle sphere (deformed shell,
// additive glow, purple shimmer). Geometry: COUNT points on a Fibonacci sphere
// (golden angle). Custom ShaderMaterial with simplex-noise deformation, view-space
// purple->pink->white coloring, hollow center via `hole` smoothstep, soft circular
// point sprite, additive blending. Uniforms: uTime, uSize, uAmp, uPR.

const SIMPLEX = /* glsl */ `
    vec3 mod289(vec3 x){return x - floor(x*(1.0/289.0))*289.0;}
    vec4 mod289(vec4 x){return x - floor(x*(1.0/289.0))*289.0;}
    vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
    vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314*r;}
    float snoise(vec3 v){
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        i = mod289(i);
        vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
        float n_ = 0.142857142857;
        vec3 ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);
        vec4 x = x_ * ns.x + ns.yyyy;
        vec4 y = y_ * ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
        p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }
`;

const VERTEX_SHADER = /* glsl */ SIMPLEX + `
    uniform float uTime; uniform float uSize; uniform float uAmp; uniform float uPR;
    uniform float uDisperse;
    attribute float aRand;
    varying float vAlpha; varying float vLit; varying float vVert; varying float vSide;
    void main(){
        vec3 p = position;
        // soft radial deformation (two noise octaves, waves drift over time)
        float n1 = snoise(p * 1.6 + vec3(0.0, uTime * 0.18, 0.0));
        float n2 = snoise(p * 3.3 - vec3(uTime * 0.12));
        float disp = n1 * 0.72 + n2 * 0.28;
        vec3 pos = p * (1.0 + uAmp * disp);

        // Dispersion into the portfolio transition: gently push each particle
        // outward along its radius + a small per-particle jitter so the shell
        // loosens (kept modest so it stays within the canvas frustum).
        vec3 dir = normalize(p + vec3(1e-4));
        pos += dir * uDisperse * (0.18 + 0.5 * aRand);
        pos += vec3(n1, n2, n1 * n2) * uDisperse * 0.22;

        // lighting: crests (disp>0) bright, troughs dark -> light/shadow contrast
        float lit = smoothstep(-0.25, 0.5, disp);
        vLit = lit;

        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = uSize * uPR * (1.0 / max(0.1, -mv.z));

        // STATIC view-space coloring (does not rotate with the sphere):
        // top <-> bottom and horizontal distance from center (sides)
        vVert = mv.y;          // + top, - bottom
        vSide = abs(mv.x);     // 0 center .. ~1.2 sides

        float depth = pos.z * 0.5 + 0.5;          // front brighter
        // hollow center under the logo — by angular radius (round, aspect-independent)
        float angR = length(mv.xy) / max(0.1, -mv.z);
        float hole = smoothstep(0.10, 0.20, angR);
        // lower base alpha + strong tie to lighting => dark troughs; fade out
        // strongly as the particles scatter so the shell dissolves (rather than
        // getting hard-cut at the scene seam).
        vAlpha = hole * (0.10 + 0.40 * depth) * (0.15 + 0.95 * lit) * (1.0 - 0.85 * uDisperse);
    }
`;

const FRAGMENT_SHADER = /* glsl */ `
    precision highp float;
    uniform float uDisperse;
    varying float vAlpha; varying float vLit; varying float vVert; varying float vSide;
    void main(){
        vec2 uv = gl_PointCoord - 0.5;
        float d = length(uv);
        if (d > 0.5) discard;
        // As the shell scatters (uDisperse 0→1) tighten each sprite toward a
        // crisp dot and pull the additive bloom back, so flying particles read
        // sharp instead of "soapy". At uDisperse=0 these are 1.0 → no change to
        // the intact sphere.
        float tighten = 1.0 - 0.45 * uDisperse;  // smaller visible radius
        float bloomK = 1.0 - 0.65 * uDisperse;   // less self-bloom
        float soft = smoothstep(0.5 * tighten, 0.0, d);   // soft round particle (glow)
        float core = smoothstep(0.16 * tighten, 0.0, d);  // bright core

        // Static gradient: top — pink, bottom — purple, sides — toward white
        vec3 pink   = vec3(1.00, 0.32, 0.78);   // pure saturated pink
        vec3 purple = vec3(0.52, 0.12, 1.00);   // pure saturated purple
        vec3 white  = vec3(0.86, 0.82, 1.00);   // coolish white for the edge
        float vt = clamp(vVert * 0.5 + 0.5, 0.0, 1.0);   // 0 bottom .. 1 top
        vec3 col = mix(purple, pink, vt);
        col = mix(col, white, smoothstep(0.72, 1.15, vSide));  // white only at the very side edge

        col *= (0.60 + 0.55 * vLit);              // softer shadows -> less "dirt", cleaner color
        col += smoothstep(0.55, 1.0, vLit) * core * vec3(0.75); // brighter white cores on crests

        // Bloom: a broad soft halo around every sprite plus a denser glow at the
        // poles, so bright particles bleed into a luminous cloud (additive).
        float halo = smoothstep(0.5 * tighten, 0.0, d); // wide, soft falloff over the sprite
        col += col * halo * 0.9 * bloomK;          // self-bloom, scales with brightness
        float cap = smoothstep(0.55, 1.05, abs(vVert));
        col += col * cap * 1.7 * bloomK;            // stronger pole glow
        col *= mix(1.25, 1.05, uDisperse);         // overall lift into the bloom
        float capA = 1.0 + 1.0 * cap;              // denser glow at the poles
        gl_FragColor = vec4(col, soft * vAlpha * capA);
    }
`;

/** Live getter for the dispersion amount, read every frame (see ParticleSphere). */
type DisperseGetter = () => number;

function Sphere({ count, disperse }: { count: number; disperse?: DisperseGetter }) {
  const pointsRef = useRef<THREE.Points>(null);
  const initialPR = useThree((state) => state.gl.getPixelRatio());

  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const aRand = new Float32Array(count);
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const th = golden * i;
      positions[i * 3] = Math.cos(th) * r;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(th) * r;
      // Deterministic per-index pseudo-random (SSR-stable, render-pure).
      aRand[i] = Math.abs(Math.sin((i + 1) * 12.9898) * 43758.5453) % 1;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aRand", new THREE.BufferAttribute(aRand, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: 24.0 }, // larger sprites → more additive overlap = stronger bloom
        uAmp: { value: 0.11 }, // soft deformation
        uPR: { value: initialPR },
        uDisperse: { value: 0 }, // 0 = intact shell, 1 = scattered
      },
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });

    return { geometry: geo, material: mat };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  useFrame((state) => {
    const points = pointsRef.current;
    if (!points) return;
    const mat = points.material as THREE.ShaderMaterial;
    const t = state.clock.getElapsedTime();
    mat.uniforms.uTime.value = t;
    mat.uniforms.uPR.value = state.gl.getPixelRatio();
    mat.uniforms.uDisperse.value = disperse ? disperse() : 0;
    points.rotation.y = t * 0.12;
    points.rotation.x = Math.sin(t * 0.1) * 0.12;
  });

  return <points ref={pointsRef} geometry={geometry} material={material} />;
}

export function ParticleSphere({
  className,
  count = 34000,
  active = true,
  disperse,
}: {
  className?: string;
  count?: number;
  /** Pause the render loop when off-screen (see timeline `sceneVisibility`). */
  active?: boolean;
  /** Live getter for scroll-driven dispersion (0→1); read each frame (in both
   *  scroll directions) so the sphere reassembles on scroll-back. */
  disperse?: DisperseGetter;
}) {
  return (
    <div className={className} style={{ position: "relative" }}>
      <Canvas
        camera={{ position: [0, 0, 3.8], fov: 50, near: 0.1, far: 100 }}
        style={{ width: "100%", height: "100%", pointerEvents: "none" }}
        gl={{ alpha: true, antialias: true }}
        // Higher DPR floor: the scene is CSS-scaled up (sphereScale grows the
        // canvas ~1.5×) on top of the layout-sized buffer, so a [1,2] cap reads
        // soft. [2,3] keeps the particles crisp at the cost of more fragments
        // (acceptable — the canvas only renders while the sphere is on-screen).
        dpr={[2, 3]}
        frameloop={active ? "always" : "never"}
        // Buffer sized from the layout box, not the CSS-transformed rect (see
        // flame-background) — the sphere scene counter-scales during the flip,
        // which would otherwise balloon the framebuffer each frame.
        resize={{ offsetSize: true, scroll: false }}
      >
        <Sphere count={count} disperse={disperse} />
      </Canvas>
    </div>
  );
}
