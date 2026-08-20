import { ImageResponse } from "next/og";

/**
 * Apple touch icon (home-screen tile), generated from the same mark as `icon.tsx`.
 *
 * iOS applies its own rounded-corner mask and never renders transparency, so this draws the black
 * field itself and keeps the mark well inside the safe area — a mark sized to the full tile would be
 * clipped at the corners.
 */

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#000000",
        }}
      >
        <div style={{ position: "relative", display: "flex", width: 104, height: 104 }}>
          <div
            style={{
              position: "absolute",
              top: 43,
              left: 0,
              width: 104,
              height: 18,
              background: "#ffffff",
              transform: "rotate(45deg)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 43,
              left: 0,
              width: 104,
              height: 18,
              background: "#ffffff",
              transform: "rotate(-45deg)",
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
