/** Compact team description handed to the AI (works for hotseat + online). */
export interface TeamInput {
  position: number;
  name: string;
  players: { name: string; role: string; rating: number }[];
}
