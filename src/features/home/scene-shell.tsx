'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { sceneConfig } from '@/features/home/scene';

/** Fades the pinned hero stage out once the showreel track owns the viewport. */
export function SceneShell({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const { scrollVh, treeHoldVh } = sceneConfig.sequence;
      const flow = ((scrollVh + treeHoldVh) / 100) * window.innerHeight;
      const start = flow - window.innerHeight;
      const t = Math.min(1, Math.max(0, (window.scrollY - start) / (window.innerHeight * 0.55)));
      el.style.opacity = String(1 - t);
      el.style.pointerEvents = t >= 1 ? 'none' : 'auto';
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div ref={ref} className="fixed inset-0 z-10 isolate overflow-hidden">
      {children}
    </div>
  );
}
