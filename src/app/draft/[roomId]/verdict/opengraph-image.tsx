import { ImageResponse } from "next/og";

import { SITE_URL } from "@/lib/env";
import { OG_COLORS as C, OG_SIZE, clip, loadOgFonts } from "@/lib/og";
import { DRAFT_TYPE_MAP } from "@/features/draft-room/draft-types";
import { featuredVerdict, getPublicVerdict } from "@/features/verdict/public";
import SiteImage from "@/app/opengraph-image";

export const alt = "Draft Arena AI verdict";
export const size = OG_SIZE;
export const contentType = "image/png";

const host = new URL(SITE_URL).host;

/** Link preview for a shared verdict: headline, win odds, predicted winner. */
export default async function Image({ params }: { params: { roomId: string } }) {
  const [data, fonts] = await Promise.all([getPublicVerdict(params.roomId), loadOgFonts()]);
  // Unfinished / unknown draft: nothing to show, use the site-wide card.
  if (!data) return SiteImage();
  const featured = featuredVerdict(data.verdicts);

  const names = [data.teams[0].name, data.teams[1].name];
  const probA = featured?.result.winProbability.find((w) => w.position === 0)?.percent ?? 50;
  const probB = 100 - probA;
  const winner = featured ? names[featured.result.predictedWinnerPosition] : null;
  const label = DRAFT_TYPE_MAP[data.room.draftType].label;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 64px",
          background: C.bg,
          color: C.surface,
          fontFamily: "Barlow",
          borderBottom: `14px solid ${C.lime}`,
        }}
      >
        {/* top row: brand + mode */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontSize: 40, fontWeight: 800, fontStyle: "italic", color: C.lime }}>
            DRAFT ARENA
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 26,
              fontWeight: 700,
              textTransform: "uppercase",
              padding: "6px 18px",
              borderRadius: 999,
              border: `3px solid ${C.surface}`,
            }}
          >
            {featured ? `AI Verdict · ${label}` : label}
          </div>
        </div>

        {/* headline */}
        <div
          style={{
            display: "flex",
            fontSize: featured ? 68 : 84,
            fontWeight: 800,
            fontStyle: "italic",
            lineHeight: 1.02,
            textTransform: "uppercase",
          }}
        >
          {featured
            ? `“${clip(featured.result.headline, 90)}”`
            : clip(`${names[0]} vs ${names[1]}`, 48)}
        </div>

        {/* odds bar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 38, fontWeight: 700 }}>
            <span style={{ color: C.blueSoft }}>
              {clip(names[0], 22)}
              {featured ? ` ${probA}%` : ""}
            </span>
            <span style={{ color: C.orangeSoft }}>
              {featured ? `${probB}% ` : ""}
              {clip(names[1], 22)}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              height: 28,
              borderRadius: 999,
              overflow: "hidden",
              border: `3px solid ${C.ink}`,
            }}
          >
            <div style={{ display: "flex", width: `${probA}%`, background: C.blue }} />
            <div style={{ display: "flex", width: `${probB}%`, background: C.orange }} />
          </div>
        </div>

        {/* footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 30, fontWeight: 700 }}>
          {winner ? (
            <div
              style={{
                display: "flex",
                padding: "8px 22px",
                borderRadius: 12,
                background: C.lime,
                color: C.limeInk,
                textTransform: "uppercase",
              }}
            >
              AI picks: {clip(winner, 24)}
            </div>
          ) : (
            <div style={{ display: "flex", color: C.lime, textTransform: "uppercase" }}>
              Who wins? The AI decides.
            </div>
          )}
          <div style={{ display: "flex", color: C.muted }}>{host}</div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
