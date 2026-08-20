import { ImageResponse } from "next/og";

/**
 * Favicon, generated from the brand mark at build time.
 *
 * The mark is the scene's glyph — two crossed bars — drawn here as two rotated rules rather than
 * imported from `public/assets/brand/logo.svg`, because Satori (what `ImageResponse` renders with)
 * doesn't rasterise external SVG files. The proportions match `sceneConfig.glyph`, so the tab icon and
 * the 3D hero are the same shape.
 *
 * File-based metadata: Next picks this up as `/icon` automatically — no `icons` entry needed.
 */

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
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
        <div style={{ position: "relative", display: "flex", width: 44, height: 44 }}>
          <div
            style={{
              position: "absolute",
              top: 18,
              left: 0,
              width: 44,
              height: 8,
              background: "#ffffff",
              transform: "rotate(45deg)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 18,
              left: 0,
              width: 44,
              height: 8,
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
