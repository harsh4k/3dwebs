'use client';

const POSTER = '/showreel/atmosphere/poster.svg';

/**
 * Slow atmosphere behind the showreel only. Video is skipped until a real
 * muted loop exists at `/showreel/atmosphere/paper-light.webm` (Higgsfield,
 * abortable). Reduced motion still sees this static poster.
 */
export const AtmosphereBackdrop = () => {
  return (
    <div aria-hidden className="sr-atmosphere pointer-events-none absolute inset-0 overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={POSTER} alt="" className="absolute inset-0 size-full object-cover opacity-40" />
    </div>
  );
};
