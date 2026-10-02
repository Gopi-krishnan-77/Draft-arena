# Draft Arena — TODO & Known Gaps

Running list of flaws, deferred work, and polish. Grouped by priority/phase.

## ✅ Done (Week 4 finish pass)
- [x] **Opponent disconnect handling.** Realtime **presence** shows opponent online/offline; a **60s pick timer** with **auto-draft** (`auto_pick()` RPC, migration 0005) keeps the draft moving when someone stalls or quits — the waiting player's client force-picks the best eligible player after the clock + grace.
- [x] **Real realtime.** Polling replaced by Supabase Realtime (`postgres_changes` on picks/rooms/participants + presence), with a slow 20s refresh as a websocket safety net.
- [x] **Server-side formation + eligibility enforcement.** `make_pick()` now rejects position-limit and wrong-category picks in Postgres (not just the UI).
- [x] **Leave / cancel draft.** Guests can leave a lobby; hosts can cancel one (RLS delete policies in 0005). Cancelled rooms land visitors on the on-brand 404.
- [x] **Loading / error boundaries.** Room + verdict skeletons, room error boundary, global error page, custom 404.
- [x] **Hotseat verdict abuse guard.** IP rate limit (8/10min, in-memory) + clear "AI not configured" message when the OpenRouter key is missing.
- [x] **Verdict share-as-image.** PNG export of the verdict card (native file share on mobile, download elsewhere).
- [x] **Recent drafts on home.** Signed-in users see their lobbies / live drafts / finals with jump-back-in links.
- [x] **Tests.** Vitest suite for snake order + formation rules (`npm test`).
- [x] **Adversarial security/race review (14 findings fixed).** Start/leave are now locked RPCs (`start_draft`/`leave_room` — closes a race that could brick a draft with one player); the host's unrestricted room-UPDATE policy was dropped; verdict inserts require a COMPLETED room; open-redirect via `//host` closed; rate-limit keys use the trusted proxy hop; auto-pick retries transient failures instead of dying; the pitch keeps your swaps across realtime refreshes; verdict schema rejects duplicate-position replies.

## 🟡 Deferred (post-launch)
- [ ] **Formation arrangement isn't saved.** Post-draft pitch swaps are local-only (reset on reload; opponent doesn't see them). Persist to DB if users ask for it.
- [ ] **In-progress leave/forfeit.** Leaving is lobby-only; mid-draft abandonment is handled by the auto-pick clock rather than an explicit "forfeit" button.
- [ ] **Rate limiter is per-instance.** In-memory Map resets on redeploy and doesn't share across serverless instances. Move to Upstash/Postgres if abuse appears.
- [ ] **A participant can still hand-craft a verdict row for their own COMPLETED room** (the insert policy validates room + status, not the JSON shape). Only self-vandalism; move inserts into a SECURITY DEFINER RPC if it ever matters.
- [ ] **Realtime auth on token refresh.** Very long sessions may need a channel resubscribe after token rotation; the 20s fallback refresh masks this. Revisit if users report stale rooms.
- [ ] **Verdict image on shared link.** `/draft/[id]/verdict` renders for any signed-in user, but no OG image/meta for social embeds yet.

## 🟢 Polish / nice-to-have
- [ ] **Player data is best-effort.** Ratings/clubs approximate; fix any miscategorized players in `scripts/build-players.mjs` (→ rebuild + re-seed).
- [ ] **Accessibility + mobile QA pass** — focus states, tap targets, screen-reader labels.
- [ ] **Per-user verdict cost cap** (per-day) if OpenRouter spend ever matters.
- [ ] **Sound / haptics** on pick + clock urgency (fun, later).

## 🔧 Setup reminders (see SETUP.md)
- [ ] Run **`supabase/migrations/0005_week4.sql`** in the SQL editor (required for realtime, timer, auto-draft, leave/cancel).
- [x] `OPENROUTER_API_KEY` + free `OPENROUTER_MODEL` chain in `.env.local` (paid models blocked by the app).
- [ ] Finish Google OAuth provider config + redirect URLs if not done.
- [ ] Deploy: SETUP.md §7 (Vercel env vars + Supabase prod URLs).
