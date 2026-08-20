'use client';

import { useCallback, useEffect, useState } from 'react';

import { projectBySlug } from '@/content/projects';
import type { Project } from '@/content/schema';
import { useScroll } from '@/hooks/smooth-scroll/use-scroll';

const PARAM = 'case';

const readSlug = (): string | null => {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get(PARAM);
};

const writeSlug = (slug: string | null, mode: 'push' | 'replace') => {
  const url = new URL(window.location.href);
  if (slug) url.searchParams.set(PARAM, slug);
  else url.searchParams.delete(PARAM);
  const next = `${url.pathname}${url.search}${url.hash}`;
  if (mode === 'push') window.history.pushState({ case: slug }, '', next);
  else window.history.replaceState({ case: slug }, '', next);
};

/**
 * Case state lives in React. The URL is synced with pushState — never router.push —
 * so /work does not remount. Unknown slugs open nothing and are stripped.
 */
export const useCaseQuery = () => {
  const [project, setProject] = useState<Project | null>(null);

  const resolve = useCallback((slug: string | null, mode: 'push' | 'replace') => {
    if (!slug) {
      setProject(null);
      return;
    }
    const found = projectBySlug(slug);
    if (!found) {
      setProject(null);
      writeSlug(null, 'replace');
      return;
    }
    setProject(found);
    writeSlug(found.slug, mode);
  }, []);

  useEffect(() => {
    resolve(readSlug(), 'replace');
    const onPop = () => {
      const slug = readSlug();
      const found = slug ? projectBySlug(slug) ?? null : null;
      setProject(found);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [resolve]);

  useEffect(() => {
    if (project) useScroll.getState().stop();
    else useScroll.getState().start();
    return () => useScroll.getState().start();
  }, [project]);

  const open = useCallback(
    (slug: string) => {
      resolve(slug, 'push');
    },
    [resolve],
  );

  const close = useCallback(() => {
    setProject(null);
    if (readSlug()) writeSlug(null, 'push');
  }, []);

  return { project, open, close };
};
