"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

// Fullscreen quad: a [2,2] plane already spans local -1..1, so we map its
// position straight to clip space (no camera transform). Note: three's
// ShaderMaterial auto-declares `attribute vec3 position`, so we reuse it
// rather than redeclaring the source's `attribute vec2 position`.
const vertexShader = /* glsl */ `
    void main() {
        gl_Position = vec4(position.xy, 0.0, 1.0);
    }
`;

const fragmentShader = /* glsl */ `
        precision mediump float;
        uniform vec2 u_resolution;
        uniform float u_time;
        uniform vec2 u_mouse;

        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

        float snoise(vec2 v) {
            const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
            vec2 i  = floor(v + dot(v, C.yy));
            vec2 x0 = v -   i + dot(i, C.xx);
            vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
            vec4 x12 = x0.xyxy + C.xxzz;
            x12.xy -= i1;
            i = mod289(i);
            vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
            vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
            m = m*m ; m = m*m ;
            vec3 x = 2.0 * fract(p * C.www) - 1.0;
            vec3 h = abs(x) - 0.5;
            vec3 ox = floor(x + 0.5);
            vec3 a0 = x - ox;
            m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
            vec3 g;
            g.x  = a0.x  * x0.x  + h.x  * x0.y;
            g.yz = a0.yz * x12.xz + h.yz * x12.yw;
            return 130.0 * dot(m, g);
        }

        // Мягкое цветовое пятно с гауссовым затуханием
        // (накапливаем взвешенный цвет — получается плавный mesh-градиент)
        void addBlob(inout vec3 acc, inout float wsum, vec2 uv, vec2 center, float radius, vec3 color) {
            float d = distance(uv, center);
            float w = exp(-(d * d) / (radius * radius));
            acc += color * w;
            wsum += w;
        }

        void main() {
            vec2 st = gl_FragCoord.xy / u_resolution.xy;
            float t = u_time * 0.22;

            // Мягкое низкочастотное искажение — живое «дыхание» градиента
            vec2 uv = st;
            uv.x += 0.16 * snoise(st * 1.1 + vec2(0.0, t));
            uv.y += 0.16 * snoise(st * 1.1 + vec2(7.3, -t * 0.9));

            // Влияние курсора — заметно тянет градиент за собой (интерактивный
            // «3D»-парallax хиро-карточки). Сильнее и шире, чем в исходнике.
            vec2 mouse = u_mouse / u_resolution.xy;
            mouse.y = 1.0 - mouse.y;
            float infl = exp(-distance(st, mouse) * 1.8);
            uv += (st - mouse) * infl * 0.22;

            // Палитра Superconscious: чёрный → индиго → электрический фиолет → лавандовый глоу
            vec3 night    = vec3(0.020, 0.015, 0.045); // почти чёрный с фиолетовым подтоном
            vec3 indigo   = vec3(0.10,  0.08,  0.32);  // глубокий индиго
            vec3 violet   = vec3(0.34,  0.14,  0.72);  // насыщенный фиолет
            vec3 electric = vec3(0.52,  0.24,  0.92);  // электрический пурпур
            vec3 glow     = vec3(0.82,  0.72,  0.99);  // яркий лавандово-белый хотспот

            vec3 acc = vec3(0.0);
            float wsum = 0.0;

            // Тёмный верх и верхние углы
            addBlob(acc, wsum, uv, vec2(0.5  + 0.05 * sin(t * 0.5), 1.18), 0.58, night);
            addBlob(acc, wsum, uv, vec2(-0.12, 1.05 + 0.05 * cos(t * 0.6)), 0.36, night);
            addBlob(acc, wsum, uv, vec2(1.12,  1.05 + 0.05 * sin(t * 0.6)), 0.36, night);

            // Индиго-переход в средней зоне + боковая заливка
            addBlob(acc, wsum, uv, vec2(0.5  + 0.05 * sin(t * 0.4), 0.66 + 0.05 * cos(t * 0.5)), 0.40, indigo);
            addBlob(acc, wsum, uv, vec2(0.16 + 0.05 * cos(t * 0.8), 0.46), 0.26, indigo);
            addBlob(acc, wsum, uv, vec2(0.84 + 0.05 * sin(t * 0.8), 0.46), 0.26, indigo);

            // Фиолетовое свечение в нижней половине
            addBlob(acc, wsum, uv, vec2(0.5  + 0.07 * sin(t * 0.6), 0.30 + 0.05 * cos(t * 0.6)), 0.42, violet);
            addBlob(acc, wsum, uv, vec2(0.5  + 0.06 * sin(t * 0.9), 0.12 + 0.04 * cos(t * 0.8)), 0.34, electric);

            // Яркий лавандовый хотспот у нижнего центра (чуть левее, как в референсе)
            addBlob(acc, wsum, uv, vec2(0.44 + 0.05 * sin(t * 1.1), 0.02 + 0.03 * cos(t)), 0.17, glow);

            // Тёмные нижние углы
            addBlob(acc, wsum, uv, vec2(-0.10, -0.05), 0.28, night);
            addBlob(acc, wsum, uv, vec2(1.10,  -0.05), 0.28, night);

            vec3 col = acc / max(wsum, 0.0001);

            // Аддитивный «блум» хотспота — пересвет к бело-лавандовому, как в референсе
            vec2 hot = vec2(0.44 + 0.05 * sin(t * 1.1), 0.02 + 0.03 * cos(t));
            float hotGlow = exp(-distance(uv, hot) * 4.5);
            col += vec3(0.78, 0.68, 1.0) * hotGlow * 0.7;

            // Лёгкое повышение насыщенности (без тёплого накала — чтобы синий оставался чистым)
            float luma = dot(col, vec3(0.299, 0.587, 0.114));
            col = mix(vec3(luma), col, 1.4);           // +saturation (циан и коралл сочнее)
            col = max(col, 0.0);                        // убираем отрицательные значения (иначе pow -> NaN)
            col = clamp(col, 0.0, 1.0);                // обрезаем ДО pow (только [0,1])
            col = pow(col, vec3(0.90));                // лёгкое осветление средних тонов

            // Мягкая виньетка — затемняем края, свечение в центре читается ярче
            float vig = smoothstep(1.20, 0.32, distance(st, vec2(0.5, 0.22)));
            col *= 0.50 + 0.50 * vig;

            // Плёночное зерно (film grain) для премиальной текстуры, как в референсе
            float grain = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233)) + u_time * 0.5) * 43758.5453);
            col += (grain - 0.5) * 0.05;

            col = clamp(col, 0.0, 1.0);
            gl_FragColor = vec4(col, 1.0);
        }
`;

interface GradientUniforms {
  u_resolution: { value: THREE.Vector2 };
  u_time: { value: number };
  u_mouse: { value: THREE.Vector2 };
  [uniform: string]: THREE.IUniform;
}

// ~36fps render cap. The gradient breathes very slowly (`u_time * 0.22`), so a
// throttled redraw looks identical but skips ~40% of the (expensive) draws.
const FRAME_MS = 1000 / 36;

function GradientPlane({ active }: { active: boolean }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { size, gl, invalidate } = useThree();

  // Mouse tracked in canvas pixels (top-left origin), matching the source's
  // `e.clientX - rect.left` feed into u_mouse. Default to center until moved.
  const target = useRef(new THREE.Vector2(size.width / 2, size.height / 2));
  const current = useRef(new THREE.Vector2(size.width / 2, size.height / 2));
  // Wall-clock origin so `u_time` stays correct under demand rendering (three's
  // own clock doesn't advance between on-demand frames).
  const startRef = useRef(0);

  const uniforms = useMemo<GradientUniforms>(
    () => ({
      u_resolution: { value: new THREE.Vector2(size.width, size.height) },
      u_time: { value: 0 },
      u_mouse: { value: new THREE.Vector2(size.width / 2, size.height / 2) },
    }),
    // Initialize once; resolution/mouse are updated in useFrame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useFrame(() => {
    const material = materialRef.current;
    if (!material) return;
    if (!startRef.current) startRef.current = performance.now();

    const u = material.uniforms as GradientUniforms;
    u.u_time.value = (performance.now() - startRef.current) / 1000;
    u.u_resolution.value.set(size.width, size.height);

    // Ease the mouse toward its target — snappier than the source so the
    // cursor parallax is clearly felt.
    current.current.x += (target.current.x - current.current.x) * 0.12;
    current.current.y += (target.current.y - current.current.y) * 0.12;
    u.u_mouse.value.copy(current.current);
  });

  // Drive the demand-mode canvas at the throttled frame rate while on-screen.
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let last = 0;
    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      if (t - last >= FRAME_MS) {
        last = t;
        invalidate();
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, invalidate]);

  // The plane lives in clip space, so R3F's raycast-based pointer events never
  // hit it. Track the pointer on the window (as the original did) and map it to
  // canvas-local pixels, so the gradient follows the cursor over the hero.
  useEffect(() => {
    const canvas = gl.domElement;
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      target.current.set(e.clientX - rect.left, e.clientY - rect.top);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [gl]);

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

export function HeroGradient({
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
        // The gradient is smooth + low-frequency, so rendering at 1× device
        // pixels (no retina super-sampling) is visually identical but ~4× cheaper
        // on the per-pixel shader. `demand` + the throttled invalidate in
        // `GradientPlane` caps it to ~36fps. Together these fix the hero lag.
        dpr={1}
        frameloop={active ? "demand" : "never"}
        // Buffer sized from the layout box, not the CSS-transformed rect (see
        // flame-background for the rationale) — keeps the hero gradient from
        // allocating a multi-screen framebuffer while the carousel scales it.
        // `debounce` coalesces the resizes: the hero card's width/height are
        // spring-animated during phase 1, so without debouncing the buffer would
        // reallocate every frame and the shader would visibly jitter. The buffer
        // holds at its current size through the animation and settles after.
        resize={{ offsetSize: true, scroll: false, debounce: { scroll: 0, resize: 200 } }}
      >
        <GradientPlane active={active} />
      </Canvas>
    </div>
  );
}
