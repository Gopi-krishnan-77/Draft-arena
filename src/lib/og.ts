import "server-only";

/** Link-preview image helpers (Open Graph / Twitter cards rendered by next/og). */

export const OG_SIZE = { width: 1200, height: 630 };

export const OG_COLORS = {
  bg: "#121c2b", // on-background
  ink: "#010816",
  surface: "#f8f9ff",
  muted: "#9aa6bd",
  blue: "#003ec7", // manager 1
  blueSoft: "#b7c4ff",
  orange: "#d43f00", // manager 2
  orangeSoft: "#ffb59e",
  lime: "#c3f400", // tertiary-fixed accent
  limeInk: "#161e00",
};

type OgFont = { name: string; data: ArrayBuffer; weight: 700 | 800; style: "normal" | "italic" };

/**
 * Barlow Condensed (the site's display face) fetched from Google Fonts as TTF —
 * the image renderer can't read woff2, and a bare fetch without a browser UA
 * gets TTF back. Cached per server instance; on any failure the card falls back
 * to the built-in font instead of breaking the preview.
 */
let fontsPromise: Promise<OgFont[]> | null = null;

async function loadFont(axis: string): Promise<ArrayBuffer> {
  const css = await fetch(`https://fonts.googleapis.com/css2?family=Barlow+Condensed:${axis}`).then((r) =>
    r.text()
  );
  const url = css.match(/src: url\((.+?)\) format\('(?:truetype|opentype)'\)/)?.[1];
  if (!url) throw new Error("No TTF in Google Fonts response");
  return fetch(url).then((r) => r.arrayBuffer());
}

export function loadOgFonts(): Promise<OgFont[]> {
  fontsPromise ??= Promise.all([loadFont("wght@700"), loadFont("ital,wght@1,800")])
    .then(([regular, italic]) => [
      { name: "Barlow", data: regular, weight: 700 as const, style: "normal" as const },
      { name: "Barlow", data: italic, weight: 800 as const, style: "italic" as const },
    ])
    .catch(() => {
      fontsPromise = null; // retry on the next request
      return [];
    });
  return fontsPromise;
}

/** Trim long text to fit a fixed-size card. */
export function clip(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}
