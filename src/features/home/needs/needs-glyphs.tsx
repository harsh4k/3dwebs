/**
 * The CTA's two glyphs, drawn inline rather than imported.
 *
 * Both are `currentColor` strokes, so they inherit the row's colour and its
 * hover transition without a second rule. Neither is a brand asset and neither
 * is borrowed marketing art — the footer's arrow is a literal `→` character for
 * the same reason (see `ContactCta`), but these two need a fixed box so the
 * three-column row grid does not reflow between states.
 *
 * Sizes are `px`, not rem: `globals.css` restarts its root font-size ramp at
 * every breakpoint, so a rem-sized glyph sawtooths instead of holding. Same
 * rationale as the touch targets and type floors in `site-footer.tsx`.
 */

/** Return-arrow (↳) marking each option. Decorative — the label carries the meaning. */
export function CornerArrow({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 11 20"
      width="11"
      height="20"
      aria-hidden
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`block ${className}`}
    >
      <path d="M1 3v9a3.5 3.5 0 0 0 3.5 3.5H9.5" />
      <path d="M7 13l2.5 2.5L7 18" />
    </svg>
  );
}

/**
 * Add/remove affordance. One glyph, not two: selecting a row rotates the plus
 * 45° into a cross, so the control's shape says what the next click will do.
 * Rotation is a transform, and it is one of **three** signals of the selected
 * state (with the label colour and the pill appearing in the bar), so state is
 * never carried by colour alone.
 */
export function PlusGlyph({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 15 15"
      width="15"
      height="15"
      aria-hidden
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      className={`block ${className}`}
    >
      <path d="M7.5 1.25v12.5M1.25 7.5h12.5" />
    </svg>
  );
}
