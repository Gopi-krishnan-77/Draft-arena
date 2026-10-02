/**
 * One colour identity per manager, used everywhere (turn bar, banner, draft
 * buttons, squads, history, pitch) so "whose pick is it?" reads at a glance.
 * Manager 1 (position 0) = Electric Blue, Manager 2 (position 1) = Vibrant Orange.
 */
export interface TeamStyle {
  /** Solid fill + readable text. */
  solid: string;
  /** Text colour on light backgrounds. */
  text: string;
  /** Left / top accent-stripe colour (pair with border-l-[Npx] / border-t-[Npx]). */
  borderLeft: string;
  borderTop: string;
  /** Faint tint for rows/cards. */
  tint: string;
  /** Small dot / swatch. */
  dot: string;
  /** HardButton intent for actions taken on this team's behalf. */
  intent: "primary" | "secondary";
}

const STYLES: [TeamStyle, TeamStyle] = [
  {
    solid: "bg-primary text-on-primary",
    text: "text-primary",
    borderLeft: "border-l-primary",
    borderTop: "border-t-primary",
    tint: "bg-primary/10",
    dot: "bg-primary",
    intent: "primary",
  },
  {
    solid: "bg-secondary-container text-on-secondary-container",
    text: "text-secondary",
    borderLeft: "border-l-secondary-container",
    borderTop: "border-t-secondary-container",
    tint: "bg-secondary-container/10",
    dot: "bg-secondary-container",
    intent: "secondary",
  },
];

export function teamStyle(position: number): TeamStyle {
  return STYLES[position === 1 ? 1 : 0];
}

/** "Lionel Messi" → "L. Messi", "Virgil van Dijk" → "V. van Dijk", "Pelé" → "Pelé". */
export function shortName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return name;
  return `${parts[0][0]}. ${parts.slice(1).join(" ")}`;
}

/** Everything after the first name — "Alfredo Di Stéfano" → "Di Stéfano". */
export function lastName(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.length > 1 ? parts.slice(1).join(" ") : name;
}
