/** Shared gate so the particle canvas stops drawing once the work helix owns the viewport. */

let carouselVisible = false;

export const setWorkCarouselVisible = (visible: boolean): void => {
  carouselVisible = visible;
};

export const isWorkCarouselVisible = (): boolean => carouselVisible;
