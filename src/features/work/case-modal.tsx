'use client';

import { useEffect, useId, useRef } from 'react';

import type { Project } from '@/content/schema';

type CaseModalProps = {
  project: Project | null;
  onClose: () => void;
  returnFocus: HTMLElement | null;
};

export const CaseModal = ({ project, onClose, returnFocus }: CaseModalProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const open = Boolean(project);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    dialog?.addEventListener('keydown', onKey);
    return () => dialog?.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) return;
    returnFocus?.focus();
  }, [open, returnFocus]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 m-0 max-h-none max-w-none bg-transparent p-0 [&::backdrop]:bg-[color-mix(in_srgb,var(--ink)_72%,transparent)]"
      onClose={() => {
        if (project) onClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
    >
      {project ? (
        <div className="flex min-h-svh items-end justify-center p-[1rem] md:items-center md:p-[2rem]">
          <article className="relative grid max-h-[92svh] w-full max-w-[72rem] overflow-hidden bg-paper text-ink md:grid-cols-2 md:max-h-[80vh]">
            <div className="relative min-h-[40vh] bg-cream md:min-h-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={project.images[0]?.src}
                alt={project.images[0]?.alt ?? ''}
                className="absolute inset-0 size-full object-cover"
              />
            </div>
            <div className="flex flex-col justify-between gap-[1.5rem] p-[1.5rem] md:p-[2.5rem]">
              <div>
                <p className="text-[0.75rem] uppercase tracking-[0.08em]">{project.client}</p>
                <h2 id={titleId} className="mt-[0.5rem] font-display text-[2rem] font-extralight leading-[1.1] md:text-[3rem]">
                  {project.title}
                </h2>
                <p className="mt-[1rem] text-[0.9375rem] leading-relaxed">
                  {project.deliverables.join(' · ')}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-[1.25rem]">
                {project.liveUrl && project.tier === 'A' ? (
                  <a
                    href={project.liveUrl}
                    className="text-[0.9375rem] underline decoration-from-font underline-offset-4"
                    rel="noreferrer"
                    target="_blank"
                  >
                    visit live site ↗
                  </a>
                ) : null}
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-[44px] rounded-[8px] border border-ink/20 px-[1.25rem] text-[0.9375rem]"
                >
                  Close
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="absolute right-[0.75rem] top-[0.75rem] flex size-[2.75rem] items-center justify-center bg-paper text-[1.25rem] text-ink"
              aria-label="Close case"
            >
              ×
            </button>
          </article>
        </div>
      ) : null}
    </dialog>
  );
};
