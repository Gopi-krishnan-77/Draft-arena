import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * iOS home-screen icon: the favicon football, full-bleed (iOS rounds the
 * corners itself). Static, so icon.svg is read once at build time.
 */
export default async function AppleIcon() {
  const svg = (await import("node:fs")).readFileSync(
    (await import("node:path")).join(process.cwd(), "src/app/icon.svg"),
    "utf8"
  );
  // Drop the tile's own rounded corners so iOS's mask isn't doubled.
  const square = svg.replace('rx="14"', 'rx="0"');
  return new ImageResponse(
    (
      <img
        alt=""
        width={180}
        height={180}
        src={`data:image/svg+xml;base64,${Buffer.from(square).toString("base64")}`}
      />
    ),
    size
  );
}
