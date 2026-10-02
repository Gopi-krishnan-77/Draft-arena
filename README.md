# Draft Arena

**Pick your XI. Settle the debate.**

Draft Arena is a head-to-head football drafting game. Two managers take turns picking legends in a snake draft until each has a starting XI. Then an AI judges both squads and delivers a verdict: who wins, why, and whose picks were genius or a disaster.

You can play on one device, passing it back and forth, or online, sending a friend an invite link and drafting live.

---

## How a draft works

1. **Pick a mode** and name your draft.
2. **Snake draft.** Managers alternate picks in snake order (1-2, 2-1, 1-2 …) until both have 11 players, 22 picks in total.
3. **Build a real team.** Formation rules stop silly squads like 11 strikers:

   | Position | Min | Max |
   |---|---|---|
   | Goalkeeper | 1 | 1 |
   | Defenders | 3 | 5 |
   | Midfielders | 2 | 5 |
   | Forwards | 1 | 3 |

   That still allows any real shape (4-3-3, 4-4-2, 3-5-2, 5-3-2…). The board hides positions you can't take, and stops you painting yourself into a corner.
4. **Beat the clock.** Online, each pick has a 60-second timer. If a manager stalls or disconnects, their best eligible player is auto-drafted, so the game always finishes.
5. **See both XIs on the pitch,** face to face. Tap two players on the same team to swap their spots.
6. **Get the AI verdict.**

### Draft modes

| Mode | Player pool |
|---|---|
| **GOAT XI** | 60 all-time legends only |
| **All-Time XI** | Everyone (147 players, every era) |
| **Underrated XI** | 51 criminally slept-on players |

### The AI verdict

The AI compares both squads and returns team strengths and weaknesses, each side's best and worst pick, a predicted winner and a win probability. It comes in four personalities:

- **Analyst**: measured and tactical
- **Commentator**: live-broadcast hype
- **Historian**: reverent, era-spanning
- **Trash Talk**: savage but playful roasts

Verdicts can be shared as a link or saved as an image.

---

## Features

- **Quick Play**: one device, no account needed.
- **Online rooms**: invite links, a lobby, and live picks over Supabase Realtime.
- **Online presence**: see when your opponent is connected or has dropped.
- **Clear turns**: a sticky "on the clock" bar, plus a colour per manager (blue vs orange) used across the whole board.
- **Rules enforced server-side**: turn order, duplicate picks, formation limits and draft-mode eligibility are all checked in Postgres, not just in the UI.
- **Sign-in**: Google or guest.
- **Your drafts**: recent drafts on the home page let you jump back in.
- **Mobile-first**: built for phones, with a sports-broadcast look.

---

## Tech stack

- **Next.js 15** (App Router, Server Actions) + **TypeScript**
- **Tailwind CSS** + shadcn/ui primitives
- **Supabase**: Postgres, Auth, Realtime and row-level security
- **OpenRouter** for the AI verdict (defaults to free models)
- **Zod** for validation, **Vitest** for tests

---

## Getting started

### 1. Install

```bash
git clone git@github.com:Gopi-krishnan-77/Draft-arena.git
cd Draft-arena
npm install
cp .env.example .env.local
```

### 2. Try it with no setup

```bash
npm run dev
```

Open <http://localhost:3000> and choose **Quick Play**. The one-device mode works without any keys. Online rooms, sign-in and the AI verdict need the setup below.

### 3. Full setup

**Supabase** (online rooms + sign-in):
1. Create a free project.
2. Put its URL and publishable key in `.env.local`.
3. Run the SQL files in `supabase/migrations/` in order (`0001` → `0005`), then `supabase/seed.sql`.
4. Enable Anonymous (and optionally Google) sign-in.

**OpenRouter** (AI verdict):
1. Add `OPENROUTER_API_KEY` to `.env.local`.
2. The app uses free models by default and blocks paid ones unless you opt in with `OPENROUTER_ALLOW_PAID="true"`.

Full step-by-step instructions, including Google sign-in and deploying to Vercel, are in **[SETUP.md](SETUP.md)**.

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server on port 3000 |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (snake order + formation rules) |

---

## Project structure

```
src/
  app/                  routes: home, login, draft create/play/new/join, room, verdict
  features/
    draft-room/         snake logic, formation rules, rooms, realtime, board UI
    verdict/            AI prompts, OpenRouter client, verdict UI
    auth/               sign-in actions and helpers
    home/               landing page sections
  components/           shared UI (buttons, badges, player cards, nav)
  lib/                  Supabase clients, env, utilities
supabase/
  migrations/           schema, pick/auto-pick functions, security policies
  seed.sql              the player pool (generated)
scripts/                player-pool and seed generators
```

### Editing the player pool

The pool lives in `scripts/build-players.mjs`. After editing it:

```bash
node scripts/build-players.mjs && node scripts/generate-seed.mjs
```

Then re-run `supabase/seed.sql` in the SQL editor. It replaces the existing pool. Ratings and clubs are best-effort: it's a draft game, not a stats database.

---

## Roadmap

Known gaps and planned work are tracked in **[TODO.md](TODO.md)**.
