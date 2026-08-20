import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

/**
 * Favicon from the real bean-pair mark (`public/assets/hand/logo.jpeg`).
 */

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default async function Icon() {
  const bytes = await readFile(join(process.cwd(), "public/assets/hand/logo.jpeg"));
  const src = `data:image/jpeg;base64,${bytes.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#3f2210",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} width={64} height={64} alt="" />
      </div>
    ),
    { ...size },
  );
}
