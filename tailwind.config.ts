import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";
import forms from "@tailwindcss/forms";

/**
 * Design system: "Arena Dynamic" (see design.md).
 * Source of truth for the brand. The full Material-style palette is exposed under
 * its documented names (on-surface, primary-container, tertiary-fixed, ...) and
 * a small set of shadcn/ui semantic aliases (foreground, *-foreground, border,
 * input, ring, muted, accent, ...) are layered on top so vendored ui primitives
 * render on-brand without a separate CSS-variable theme.
 */
const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ── Arena palette (design.md) ────────────────────────────
        ink: "#010816", // dark navy used for all borders + hard shadows
        background: "#f9f9ff",
        "on-background": "#121c2b",
        surface: "#f9f9ff",
        "surface-dim": "#d0daef",
        "surface-bright": "#f9f9ff",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f0f3ff",
        "surface-container": "#e7eeff",
        "surface-container-high": "#dfe8fd",
        "surface-container-highest": "#d9e3f8",
        "surface-variant": "#d9e3f8",
        "on-surface": "#121c2b",
        "on-surface-variant": "#434656",
        "inverse-surface": "#273140",
        "inverse-on-surface": "#ebf1ff",
        outline: "#737688",
        "outline-variant": "#c3c5d9",
        "surface-tint": "#004ced",
        primary: "#003ec7",
        "on-primary": "#ffffff",
        "primary-container": "#0052ff",
        "on-primary-container": "#dfe3ff",
        "inverse-primary": "#b7c4ff",
        "primary-fixed": "#dde1ff",
        "primary-fixed-dim": "#b7c4ff",
        "on-primary-fixed": "#001452",
        "on-primary-fixed-variant": "#0038b6",
        secondary: "#aa3000",
        "on-secondary": "#ffffff",
        "secondary-container": "#d43f00",
        "on-secondary-container": "#fffbff",
        "secondary-fixed": "#ffdbd0",
        "secondary-fixed-dim": "#ffb59e",
        "on-secondary-fixed": "#3a0b00",
        "on-secondary-fixed-variant": "#852400",
        tertiary: "#425400",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#576e00",
        "on-tertiary-container": "#c5f600",
        "tertiary-fixed": "#c3f400",
        "tertiary-fixed-dim": "#abd600",
        "on-tertiary-fixed": "#161e00",
        "on-tertiary-fixed-variant": "#3c4d00",
        error: "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",

        // ── shadcn/ui semantic aliases (mapped onto the palette) ──
        foreground: "#121c2b",
        "primary-foreground": "#ffffff",
        "secondary-foreground": "#ffffff",
        destructive: "#ba1a1a",
        "destructive-foreground": "#ffffff",
        muted: "#e7eeff",
        "muted-foreground": "#434656",
        accent: "#dfe8fd",
        "accent-foreground": "#121c2b",
        popover: "#ffffff",
        "popover-foreground": "#121c2b",
        card: "#ffffff",
        "card-foreground": "#121c2b",
        border: "#c3c5d9",
        input: "#c3c5d9",
        ring: "#003ec7",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-barlow)", "system-ui", "sans-serif"],
        "display-xl": ["var(--font-barlow)"],
        "headline-lg": ["var(--font-barlow)"],
        "headline-lg-mobile": ["var(--font-barlow)"],
        "headline-md": ["var(--font-barlow)"],
        "label-bold": ["var(--font-barlow)"],
        "stats-num": ["var(--font-barlow)"],
        "body-lg": ["var(--font-inter)"],
        "body-md": ["var(--font-inter)"],
      },
      fontSize: {
        "display-xl": ["72px", { lineHeight: "1.0", letterSpacing: "-0.02em", fontWeight: "800" }],
        "headline-lg": ["48px", { lineHeight: "1.1", letterSpacing: "-0.01em", fontWeight: "700" }],
        "headline-lg-mobile": ["32px", { lineHeight: "1.1", fontWeight: "700" }],
        "headline-md": ["24px", { lineHeight: "1.2", fontWeight: "700" }],
        "body-lg": ["18px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "1.5", fontWeight: "400" }],
        "label-bold": ["14px", { lineHeight: "1.0", letterSpacing: "0.05em", fontWeight: "700" }],
        "stats-num": ["20px", { lineHeight: "1.0", fontWeight: "800" }],
      },
      spacing: {
        base: "4px",
        xs: "8px",
        sm: "16px",
        md: "24px",
        lg: "40px",
        xl: "64px",
        gutter: "20px",
        "margin-mobile": "16px",
        "margin-desktop": "48px",
      },
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.5rem",
        full: "9999px",
      },
      boxShadow: {
        "hard-sm": "2px 2px 0 0 #010816",
        hard: "4px 4px 0 0 #010816",
        "hard-lg": "8px 8px 0 0 #010816",
        "hard-primary": "8px 8px 0 0 #003ec7",
        "hard-primary-sm": "4px 4px 0 0 #003ec7",
        "hard-top": "0 -4px 0 0 #010816",
      },
      keyframes: {
        "pulse-ring": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.6", transform: "scale(1.04)" },
        },
      },
      animation: {
        "pulse-ring": "pulse-ring 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate, forms({ strategy: "class" })],
};

export default config;
