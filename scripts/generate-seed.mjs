// Generates supabase/seed.sql from the mock player pool so the two never drift.
// Usage: node scripts/generate-seed.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const src = readFileSync("src/features/draft-room/players.ts", "utf8");
const eq = src.indexOf("= [");
const arrText = src.slice(eq + 2, src.lastIndexOf("]") + 1);
/** @type {{name:string,role:string,rating:number,club?:string,nationality?:string,era?:string,imageUrl?:string}[]} */
const players = eval(arrText);

const esc = (s) => String(s).replace(/'/g, "''");

const rows = players.map((p) => {
  const meta = {};
  if (p.club) meta.club = p.club;
  if (p.nationality) meta.nationality = p.nationality;
  if (p.era) meta.era = p.era;
  if (p.imageUrl) meta.imageUrl = p.imageUrl;
  meta.categories = p.categories ?? [];
  return `  ('${esc(p.name)}', '${p.role}', ${p.rating}, '${esc(JSON.stringify(meta))}'::jsonb)`;
});

const sql = `-- Generated from src/features/draft-room/players.ts — do not edit by hand.
-- Regenerate: node scripts/generate-seed.mjs
-- Idempotent: wipes the players table (and any picks referencing it) first, so
-- it is safe to re-run after the player pool changes.

truncate table players cascade;

insert into players (name, role, rating, metadata) values
${rows.join(",\n")};
`;

mkdirSync("supabase", { recursive: true });
writeFileSync("supabase/seed.sql", sql);
console.log(`Wrote supabase/seed.sql with ${players.length} players.`);
