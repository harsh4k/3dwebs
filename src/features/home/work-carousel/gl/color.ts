/**
 * MIT — adapted from Yousuf Soomro, dither-blur-carousel.
 * The composite writes display-space colour with no automatic conversion.
 */
import { Vector3 } from "three";

export const hexToSRGB = (hex: string): Vector3 => {
  const n = Number.parseInt(hex.replace("#", ""), 16);
  return new Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
};

export const cssColorToHex = (value: string, fallback: string): string => {
  const trimmed = value.trim();
  if (trimmed.startsWith("#") && (trimmed.length === 7 || trimmed.length === 4)) {
    return trimmed.length === 4
      ? `#${trimmed[1]}${trimmed[1]}${trimmed[2]}${trimmed[2]}${trimmed[3]}${trimmed[3]}`
      : trimmed;
  }
  const rgb = trimmed.match(/rgba?\(\s*([\d.]+)\s*[, ]\s*([\d.]+)\s*[, ]\s*([\d.]+)/i);
  if (!rgb) return fallback;
  const toHex = (channel: string) =>
    Math.round(Number(channel)).toString(16).padStart(2, "0");
  return `#${toHex(rgb[1] ?? "0")}${toHex(rgb[2] ?? "0")}${toHex(rgb[3] ?? "0")}`;
};
