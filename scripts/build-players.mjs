// Compiles the researched player lists into src/features/draft-room/players.ts.
// Dedupes by name with precedence GOAT > UNDERRATED > ALL_TIME(only).
// Every player is implicitly eligible for ALL_TIME_XI; `categories` holds only
// the special tags (GOAT_XI / UNDERRATED_XI).
//
// Usage: node scripts/build-players.mjs  (then: node scripts/generate-seed.mjs)
import { writeFileSync } from "node:fs";

const GOAT = `
Lionel Messi | FWD | 99 | Barcelona | Argentina | 2000s–20s
Pelé | FWD | 99 | Santos | Brazil | 1950s–60s
Diego Maradona | FWD | 98 | Napoli | Argentina | 1980s–90s
Cristiano Ronaldo | FWD | 98 | Real Madrid | Portugal | 2000s–20s
Johan Cruyff | FWD | 97 | Ajax | Netherlands | 1970s
Alfredo Di Stéfano | FWD | 97 | Real Madrid | Argentina | 1950s–60s
Ferenc Puskás | FWD | 96 | Real Madrid | Hungary | 1950s–60s
Ronaldo Nazário | FWD | 96 | Real Madrid | Brazil | 1990s–2000s
Zinedine Zidane | MID | 96 | Real Madrid | France | 1990s–2000s
Franz Beckenbauer | DEF | 96 | Bayern Munich | Germany | 1970s
Garrincha | FWD | 95 | Botafogo | Brazil | 1950s–60s
Michel Platini | MID | 95 | Juventus | France | 1980s
Marco van Basten | FWD | 95 | AC Milan | Netherlands | 1980s–90s
George Best | FWD | 95 | Manchester United | Northern Ireland | 1960s–70s
Eusébio | FWD | 95 | Benfica | Portugal | 1960s–70s
Paolo Maldini | DEF | 95 | AC Milan | Italy | 1990s–2000s
Ronaldinho | FWD | 95 | Barcelona | Brazil | 2000s
Xavi | MID | 94 | Barcelona | Spain | 2000s–10s
Andrés Iniesta | MID | 94 | Barcelona | Spain | 2000s–10s
Franco Baresi | DEF | 94 | AC Milan | Italy | 1980s–90s
Lev Yashin | GK | 94 | Dynamo Moscow | USSR | 1950s–60s
Gerd Müller | FWD | 94 | Bayern Munich | Germany | 1970s
Bobby Charlton | MID | 94 | Manchester United | England | 1960s–70s
Lothar Matthäus | MID | 93 | Bayern Munich | Germany | 1980s–90s
Gianluigi Buffon | GK | 93 | Juventus | Italy | 2000s–10s
Roberto Baggio | FWD | 93 | Juventus | Italy | 1990s
Cafu | DEF | 93 | AC Milan | Brazil | 1990s–2000s
Roberto Carlos | DEF | 93 | Real Madrid | Brazil | 1990s–2000s
Luka Modrić | MID | 93 | Real Madrid | Croatia | 2010s–20s
Kaká | MID | 92 | AC Milan | Brazil | 2000s
Andrea Pirlo | MID | 92 | AC Milan | Italy | 2000s–10s
Gordon Banks | GK | 92 | Stoke City | England | 1960s–70s
Dino Zoff | GK | 92 | Juventus | Italy | 1970s–80s
Iker Casillas | GK | 92 | Real Madrid | Spain | 2000s–10s
Manuel Neuer | GK | 92 | Bayern Munich | Germany | 2010s–20s
Sergio Ramos | DEF | 92 | Real Madrid | Spain | 2000s–10s
Carlos Alberto | DEF | 92 | Santos | Brazil | 1970s
Giacinto Facchetti | DEF | 91 | Inter Milan | Italy | 1960s–70s
Daniel Passarella | DEF | 91 | River Plate | Argentina | 1970s–80s
Peter Schmeichel | GK | 91 | Manchester United | Denmark | 1990s
Bobby Moore | DEF | 92 | West Ham United | England | 1960s–70s
Frank Rijkaard | MID | 91 | AC Milan | Netherlands | 1980s–90s
Ruud Gullit | MID | 92 | AC Milan | Netherlands | 1980s–90s
Zico | MID | 93 | Flamengo | Brazil | 1980s
Sócrates | MID | 92 | Corinthians | Brazil | 1980s
Romário | FWD | 93 | Barcelona | Brazil | 1990s
Thierry Henry | FWD | 93 | Arsenal | France | 2000s
Steven Gerrard | MID | 91 | Liverpool | England | 2000s–10s
Paul Scholes | MID | 91 | Manchester United | England | 1990s–2000s
Didier Drogba | FWD | 91 | Chelsea | Ivory Coast | 2000s–10s
Virgil van Dijk | DEF | 91 | Liverpool | Netherlands | 2010s–20s
Philipp Lahm | DEF | 91 | Bayern Munich | Germany | 2000s–10s
Carles Puyol | DEF | 91 | Barcelona | Spain | 2000s–10s
Fabio Cannavaro | DEF | 91 | Real Madrid | Italy | 2000s
Oliver Kahn | GK | 91 | Bayern Munich | Germany | 1990s–2000s
Kenny Dalglish | FWD | 92 | Liverpool | Scotland | 1970s–80s
Raymond Kopa | FWD | 91 | Real Madrid | France | 1950s–60s
Rivaldo | MID | 91 | Barcelona | Brazil | 1990s–2000s
Neymar | FWD | 91 | Barcelona | Brazil | 2010s–20s
Kylian Mbappé | FWD | 92 | Paris Saint-Germain | France | 2010s–20s
`;

const UNDERRATED = `
Neville Southall | GK | 85 | Everton | Wales | 1980s–90s
Sepp Maier | GK | 84 | Bayern Munich | Germany | 1970s–80s
Keylor Navas | GK | 84 | Real Madrid | Costa Rica | 2010s–20s
Júlio César | GK | 84 | Inter Milan | Brazil | 2000s–10s
Samir Handanović | GK | 83 | Inter Milan | Slovenia | 2010s–20s
Jussi Jääskeläinen | GK | 80 | Bolton Wanderers | Finland | 2000s–10s
Joe Hart | GK | 81 | Manchester City | England | 2010s
Tim Howard | GK | 81 | Everton | USA | 2000s–10s
César Azpilicueta | DEF | 84 | Chelsea | Spain | 2010s–20s
Gary Pallister | DEF | 83 | Manchester United | England | 1990s
Phil Jagielka | DEF | 81 | Everton | England | 2000s–10s
Jonny Evans | DEF | 81 | Manchester United | Northern Ireland | 2010s–20s
John Arne Riise | DEF | 81 | Liverpool | Norway | 2000s
Joël Matip | DEF | 82 | Liverpool | Cameroon | 2010s–20s
Ronald Koeman | DEF | 86 | Barcelona | Netherlands | 1980s–90s
Gaetano Scirea | DEF | 86 | Juventus | Italy | 1970s–80s
Lilian Thuram | DEF | 86 | Juventus | France | 1990s–2000s
Aldair | DEF | 84 | Roma | Brazil | 1990s–2000s
Jaap Stam | DEF | 85 | Manchester United | Netherlands | 1990s–2000s
Ricardo Carvalho | DEF | 85 | Chelsea | Portugal | 2000s–10s
Bacary Sagna | DEF | 81 | Arsenal | France | 2000s–10s
Claude Makélélé | MID | 85 | Chelsea | France | 2000s
Michael Carrick | MID | 84 | Manchester United | England | 2000s–10s
Fernandinho | MID | 84 | Manchester City | Brazil | 2010s–20s
Fernando Redondo | MID | 86 | Real Madrid | Argentina | 1990s–2000s
Santi Cazorla | MID | 84 | Arsenal | Spain | 2010s
Youri Djorkaeff | MID | 84 | Inter Milan | France | 1990s–2000s
Pavel Nedvěd | MID | 86 | Juventus | Czech Republic | 1990s–2000s
Gheorghe Hagi | MID | 86 | Galatasaray | Romania | 1980s–90s
Michael Laudrup | MID | 87 | Barcelona | Denmark | 1980s–90s
Esteban Cambiasso | MID | 84 | Inter Milan | Argentina | 2000s–10s
Demetrio Albertini | MID | 83 | AC Milan | Italy | 1990s–2000s
Mark van Bommel | MID | 82 | Bayern Munich | Netherlands | 2000s–10s
Yaya Touré | MID | 85 | Manchester City | Ivory Coast | 2000s–10s
Georgi Kinkladze | MID | 82 | Manchester City | Georgia | 1990s
Tomáš Rosický | MID | 83 | Arsenal | Czech Republic | 2000s–10s
Dirk Kuyt | MID | 81 | Liverpool | Netherlands | 2000s–10s
Ricardo Quaresma | FWD | 83 | Porto | Portugal | 2000s–10s
Pedro Rodríguez | FWD | 82 | Barcelona | Spain | 2010s
Diego Milito | FWD | 85 | Inter Milan | Argentina | 2000s–10s
Antonio Di Natale | FWD | 84 | Udinese | Italy | 2000s–10s
Hristo Stoichkov | FWD | 87 | Barcelona | Bulgaria | 1990s
Ian Rush | FWD | 86 | Liverpool | Wales | 1980s–90s
Jimmy Greaves | FWD | 86 | Tottenham | England | 1960s–70s
Peter Crouch | FWD | 80 | Stoke City | England | 2000s–10s
Edin Džeko | FWD | 83 | Roma | Bosnia | 2010s–20s
Wissam Ben Yedder | FWD | 82 | Monaco | France | 2010s–20s
Hernán Crespo | FWD | 85 | Lazio | Argentina | 1990s–2000s
Roberto Firmino | FWD | 84 | Liverpool | Brazil | 2010s–20s
Olivier Giroud | FWD | 83 | Arsenal | France | 2010s–20s
Carlos Tévez | FWD | 85 | Manchester City | Argentina | 2000s–10s
`;

const ALL_TIME = `
Raúl | FWD | 89 | Real Madrid | Spain | 1990s–2000s
Davor Šuker | FWD | 86 | Real Madrid | Croatia | 1990s
Gabriel Batistuta | FWD | 89 | Fiorentina | Argentina | 1990s
George Weah | FWD | 89 | AC Milan | Liberia | 1990s
Andriy Shevchenko | FWD | 89 | AC Milan | Ukraine | 2000s
Hugo Sánchez | FWD | 88 | Real Madrid | Mexico | 1980s–90s
Filippo Inzaghi | FWD | 86 | AC Milan | Italy | 2000s
Robbie Fowler | FWD | 85 | Liverpool | England | 1990s–2000s
Alan Shearer | FWD | 88 | Newcastle United | England | 1990s–2000s
Michael Owen | FWD | 86 | Liverpool | England | 2000s
Samuel Eto'o | FWD | 89 | Barcelona | Cameroon | 2000s–10s
David Villa | FWD | 88 | Valencia | Spain | 2000s–10s
Sergio Agüero | FWD | 90 | Manchester City | Argentina | 2010s
Zlatan Ibrahimović | FWD | 90 | AC Milan | Sweden | 2000s–10s
Robert Lewandowski | FWD | 91 | Bayern Munich | Poland | 2010s–20s
Karim Benzema | FWD | 90 | Real Madrid | France | 2010s–20s
Luis Suárez | FWD | 90 | Barcelona | Uruguay | 2010s
Juan Román Riquelme | MID | 88 | Boca Juniors | Argentina | 2000s
Juan Sebastián Verón | MID | 86 | Lazio | Argentina | 1990s–2000s
Clarence Seedorf | MID | 87 | AC Milan | Netherlands | 2000s
Edgar Davids | MID | 85 | Juventus | Netherlands | 1990s–2000s
Frank Lampard | MID | 88 | Chelsea | England | 2000s
Roy Keane | MID | 88 | Manchester United | Ireland | 1990s–2000s
Patrick Vieira | MID | 88 | Arsenal | France | 1990s–2000s
Michael Ballack | MID | 87 | Bayern Munich | Germany | 2000s
Kevin De Bruyne | MID | 91 | Manchester City | Belgium | 2010s–20s
Alessandro Nesta | DEF | 89 | AC Milan | Italy | 2000s
Javier Zanetti | DEF | 87 | Inter Milan | Argentina | 1990s–2000s
Marcel Desailly | DEF | 87 | AC Milan | France | 1990s–2000s
Rio Ferdinand | DEF | 88 | Manchester United | England | 2000s
John Terry | DEF | 87 | Chelsea | England | 2000s
Nemanja Vidić | DEF | 87 | Manchester United | Serbia | 2000s–10s
Ashley Cole | DEF | 86 | Chelsea | England | 2000s
Gerard Piqué | DEF | 88 | Barcelona | Spain | 2010s
Peter Shilton | GK | 86 | Nottingham Forest | England | 1970s–80s
Edwin van der Sar | GK | 87 | Manchester United | Netherlands | 2000s
`;

const norm = (s) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
const slug = (s) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function parse(block, tag) {
  return block
    .trim()
    .split("\n")
    .map((line) => line.split("|").map((s) => s.trim()))
    .filter((parts) => parts.length === 6 && parts[0])
    .map(([name, role, rating, club, nationality, era]) => ({
      name,
      role,
      rating: Number(rating),
      club,
      nationality,
      era,
      categories: tag ? [tag] : [],
    }));
}

// Precedence: GOAT first, then UNDERRATED, then ALL_TIME-only.
const ordered = [
  ...parse(GOAT, "GOAT_XI"),
  ...parse(UNDERRATED, "UNDERRATED_XI"),
  ...parse(ALL_TIME, null),
];

const byName = new Map();
for (const p of ordered) {
  const key = norm(p.name);
  if (!byName.has(key)) byName.set(key, p);
}

const players = [...byName.values()].sort(
  (a, b) => b.rating - a.rating || a.name.localeCompare(b.name)
);

const usedIds = new Set();
function uniqueId(p) {
  const base = `${p.role.toLowerCase()}-${slug(p.name)}`;
  let id = base;
  let n = 2;
  while (usedIds.has(id)) id = `${base}-${n++}`;
  usedIds.add(id);
  return id;
}

const lines = players.map((p) => {
  const id = uniqueId(p);
  const cats = `[${p.categories.map((c) => JSON.stringify(c)).join(", ")}]`;
  return `  { id: ${JSON.stringify(id)}, name: ${JSON.stringify(p.name)}, role: ${JSON.stringify(p.role)}, rating: ${p.rating}, club: ${JSON.stringify(p.club)}, nationality: ${JSON.stringify(p.nationality)}, era: ${JSON.stringify(p.era)}, categories: ${cats} },`;
});

const out = `import type { Player } from "@/types/player";

/**
 * AUTO-GENERATED by scripts/build-players.mjs — do not edit by hand.
 * Football pool tagged by draft-type eligibility. Every player is eligible for
 * ALL_TIME_XI; \`categories\` holds the special tags (GOAT_XI / UNDERRATED_XI).
 * Ratings/clubs are best-effort (this is a draft game, not a stats database).
 */
export const PLAYERS: Player[] = [
${lines.join("\n")}
];
`;

writeFileSync("src/features/draft-room/players.ts", out);

const counts = { GOAT_XI: 0, UNDERRATED_XI: 0, ALL_TIME_only: 0 };
for (const p of players) {
  if (p.categories.includes("GOAT_XI")) counts.GOAT_XI += 1;
  else if (p.categories.includes("UNDERRATED_XI")) counts.UNDERRATED_XI += 1;
  else counts.ALL_TIME_only += 1;
}
console.log(`Wrote ${players.length} players → src/features/draft-room/players.ts`);
console.log(
  `  GOAT: ${counts.GOAT_XI} | Underrated: ${counts.UNDERRATED_XI} | All-Time-only: ${counts.ALL_TIME_only} | All-Time pool: ${players.length}`
);
