'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { GEO, geoCssVars, type ShowreelGeo, type ShowreelLayout } from './geometry';

const DEBOUNCE_MS = 200;
const SERVER_LAYOUT: ShowreelLayout = 'desktop';

const computeLayout = (): ShowreelLayout => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  if (w > h) return 'desktop';
  if (w < 640) return 'mobile';
  if (w <= 1024) return 'tablet';
  return 'desktop';
};

let snapshot: ShowreelLayout =
  typeof window !== 'undefined' ? computeLayout() : SERVER_LAYOUT;

const listeners = new Set<() => void>();
let bound = false;
let debounceId: ReturnType<typeof setTimeout> | undefined;

const publish = (): void => {
  const next = computeLayout();
  if (next === snapshot) return;
  snapshot = next;
  listeners.forEach((listener) => listener());
};

const handleResize = (): void => {
  if (debounceId) clearTimeout(debounceId);
  debounceId = setTimeout(publish, DEBOUNCE_MS);
};

const subscribe = (listener: () => void): (() => void) => {
  if (!bound) {
    snapshot = computeLayout();
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });
    bound = true;
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (debounceId) clearTimeout(debounceId);
      bound = false;
    }
  };
};

export interface ShowreelLayoutState {
  layout: ShowreelLayout;
  geo: ShowreelGeo;
}

export function useShowreelLayout(root: HTMLElement | null): ShowreelLayoutState {
  const layout = useSyncExternalStore(subscribe, () => snapshot, () => SERVER_LAYOUT);

  useEffect(() => {
    if (!root) return;
    const vars = geoCssVars(GEO[layout]);
    for (const [name, value] of Object.entries(vars)) {
      root.style.setProperty(name, value);
    }
  }, [layout, root]);

  return { layout, geo: GEO[layout] };
}
