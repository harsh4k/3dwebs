/**
 * MIT — adapted from Yousuf Soomro, dither-blur-carousel.
 * Helix progress is scrubbed from the page. No wheel steal, no drag-to-spin.
 */
import type { CarouselConfig, ScrollState } from "./types";

export const createScrollController = (config: CarouselConfig) => {
  const state: ScrollState = {
    target: 0,
    current: 0,
    velocity: 0,
    bendVelocity: 0,
    snapVelocity: 0,
    snapping: false,
  };

  const applyBend = (previous: number) => {
    state.velocity = state.current - previous;
    const capped = Math.max(
      -config.bendMaxVelocity,
      Math.min(config.bendMaxVelocity, state.velocity),
    );
    state.bendVelocity += (capped - state.bendVelocity) * config.bendEase;
    return state.current;
  };

  return {
    state,
    get dragging() {
      return false;
    },
    get tweening() {
      return false;
    },
    goTo(value: number) {
      state.target = value;
      state.current = value;
    },
    /** Page progress in helix slots. Written 1:1 so cards track the scroll like parallax. */
    syncFromPage(slot: number) {
      const previous = state.current;
      state.target = slot;
      state.current = slot;
      applyBend(previous);
    },
    update() {
      return state.current;
    },
    dispose() {},
  };
};
