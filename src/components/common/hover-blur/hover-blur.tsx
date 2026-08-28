// 📖 Docs: obsidian/frontend/components/common.md
"use client";

import "./hover-blur.css";

import type { CSSProperties } from "react";

/**
 * The link treatment for the footer columns — a label that, on hover, blurs apart and is replaced
 * by a second copy of itself fading in behind it.
 *
 * The label is rendered twice: an `original` layer and a `clone` layer stacked on top at zero
 * opacity. On hover the original's characters blur, fade and split — even indices lift, odd
 * indices drop — while the clone's characters fade in, starting just before the outgoing run
 * finishes so the two read as one event rather than two.
 *
 * **It returns to rest on its own.** The animations carry no fill mode, so when the run ends every
 * property reverts to its base value and the original is visible again. That is what makes a second
 * hover replay it, and it is why this is `animation` and not `transition`: a transition would hold
 * the end state for as long as the pointer stayed put.
 *
 * **Both layers are `aria-hidden`.** Two copies of the same string in the accessibility tree is a
 * double announcement; the real name is carried by a single `sr-only` span.
 *
 * The effect also fires from an ancestor marked `.group`, so a whole button or row can drive it
 * rather than just the text — matching how the reference wires its footer links.
 */

interface HoverBlurProps {
  /** The label. Rendered per character on two layers, so keep it short. */
  text: string;
  className?: string;
}

const Layer = ({ text, variant }: { text: string; variant: "original" | "clone" }) => {
  const characters = [...text];
  return (
    <span className={`hover-blur__layer hover-blur__layer--${variant}`}>
      {characters.map((character, index) => (
        <span
          key={`${character}-${index}`}
          className="hover-blur__char"
          style={{ "--i": index, "--n": characters.length } as CSSProperties}
        >
          {character}
        </span>
      ))}
    </span>
  );
};

export const HoverBlur = ({ text, className }: HoverBlurProps) => (
  <span className={`hover-blur${className ? ` ${className}` : ""}`}>
    <span aria-hidden="true">
      <Layer text={text} variant="original" />
      <Layer text={text} variant="clone" />
    </span>
    <span className="sr-only">{text}</span>
  </span>
);
