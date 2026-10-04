import { ImageResponse } from "next/og";

import { SITE_URL } from "@/lib/env";
import { OG_COLORS as C, OG_SIZE, loadOgFonts } from "@/lib/og";

export const alt = "Draft Arena — Pick your XI. Settle the debate.";
export const size = OG_SIZE;
export const contentType = "image/png";

const host = new URL(SITE_URL).host;

/** Default link preview for every page without its own (home, create, join…). */
export default async function Image() {
  const fonts = await loadOgFonts();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          background: C.bg,
          color: C.surface,
          fontFamily: "Barlow",
          borderBottom: `14px solid ${C.lime}`,
        }}
      >
        <div style={{ display: "flex", fontSize: 44, fontWeight: 800, fontStyle: "italic", color: C.lime }}>
          DRAFT ARENA
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 112, fontWeight: 800, fontStyle: "italic", lineHeight: 0.95, textTransform: "uppercase" }}>
          <span>Pick your XI.</span>
          <span style={{ color: C.lime }}>Settle the debate.</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 32, fontWeight: 700 }}>
          <span>Head-to-head football drafts · brutal AI verdicts</span>
          <span style={{ color: C.muted }}>{host}</span>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
