# Draft Arena — Supabase setup (Week 2)

Do these once to activate auth + persistence. The app runs without them (landing
page + hotseat `/draft/play` work offline); only online rooms and login need this.

## 1. Create the project
1. Go to [supabase.com](https://supabase.com) → **New project** (free tier is fine).
2. Save the database password somewhere safe.
3. Wait for it to finish provisioning.

## 2. Add your keys
`.env.local` already has the URL filled in. You only need to paste the
**publishable** key:

```bash
# URL = https://<project-ref>.supabase.co  (derived from the project ref; already set)
NEXT_PUBLIC_SUPABASE_URL="https://nlltqovvnbjdhqpocnsd.supabase.co"

# Settings → API Keys → "Publishable key" (sb_publishable_...). Client-safe;
# this replaces the old "anon" key. Do NOT use the secret key — the app
# never needs it (picks run through the make_pick() RPC as the logged-in user).
NEXT_PUBLIC_SUPABASE_ANON_KEY="<your sb_publishable_... key>"

NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

Restart `npm run dev` after editing env.

## 3. Create the schema + seed
Open **SQL Editor** and run these files **in order** (paste contents, Run):
1. `supabase/migrations/0001_init.sql` — tables + enums
2. `supabase/migrations/0002_make_pick.sql` — the atomic pick function
3. `supabase/migrations/0003_rls.sql` — row-level security
4. `supabase/migrations/0004_analyses_rls.sql` — AI verdict write policy
5. `supabase/migrations/0005_week4.sql` — **realtime, 60s pick timer + auto-draft,
   server-side formation rules, leave/cancel** (Week 4 — required for live play)
6. `supabase/migrations/0006_public_verdict.sql` — **public verdict pages + link previews**
   (lets anyone with the link see a finished draft's verdict, no sign-in)
7. `supabase/seed.sql` — the player pool (re-run any time the pool changes; it wipes + reloads)

> Regenerate the seed any time the pool changes: `node scripts/generate-seed.mjs`.

## 4. Enable auth providers
In **Authentication → Providers**:

- **Anonymous** → toggle **ON**. (That's all guest play needs.)
- **Google** → toggle **ON**, then:
  1. In [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services → Credentials**,
     create an **OAuth 2.0 Client ID** (type: Web application).
  2. Under **Authorized redirect URIs**, add:
     `https://<your-ref>.supabase.co/auth/v1/callback`
  3. Copy the **Client ID** and **Client secret** into Supabase's Google provider.

In **Authentication → URL Configuration**:
- **Site URL**: `http://localhost:3000`
- **Redirect URLs**: add `http://localhost:3000/**` (and your production URL later).

## 5. Verify
- Restart the dev server, open `/login` → both buttons are now enabled.
- "Play as Guest" should sign you in and return home with your name chip in the header.

## 6. AI verdict (OpenRouter) — Week 3
1. Sign up at [openrouter.ai](https://openrouter.ai), go to **Keys**, create a key. No credit
   needed — the app uses free models only.
2. Add to `.env.local` (server-only — do NOT prefix with `NEXT_PUBLIC_`):
   ```bash
   OPENROUTER_API_KEY="sk-or-..."
   OPENROUTER_MODEL="nvidia/nemotron-3-super-120b-a12b:free,apodex/apodex-1.1-mini:free"
   # free models; first = primary, rest = fallbacks. Paid models are blocked
   # unless you also set OPENROUTER_ALLOW_PAID="true".
   ```
3. Restart `npm run dev`. Finish a draft → **Get AI Verdict** → the four personality
   tabs (Analyst / Commentator / Historian / Trash Talk) generate on first view.
   - Online drafts cache each mode in `draft_analyses` (needs migration `0004`).
   - Hotseat `/draft/play` generates on the fly (not saved).

> Note: the hotseat verdict endpoint is unauthenticated but IP-rate-limited
> (8 requests / 10 min, in-memory). Good enough for MVP scale.

## 7. Deploy (Vercel)
1. Push the repo to GitHub → [vercel.com](https://vercel.com) → **Add New Project** → import it.
   Framework auto-detects as Next.js; no build settings needed.
2. **Environment variables** (Project → Settings → Environment Variables) — same as
   `.env.local` but with the production site URL:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL="https://nlltqovvnbjdhqpocnsd.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="<publishable key>"
   NEXT_PUBLIC_SITE_URL="https://<your-app>.vercel.app"
   OPENROUTER_API_KEY="sk-or-..."
   OPENROUTER_MODEL="nvidia/nemotron-3-super-120b-a12b:free,apodex/apodex-1.1-mini:free"
   ```
3. **Supabase → Authentication → URL Configuration**:
   - Site URL → `https://<your-app>.vercel.app`
   - Redirect URLs → add `https://<your-app>.vercel.app/**` (keep the localhost one for dev)
4. Deploy, then smoke test on two devices: sign in → create → join via link → draft
   live → let one timer expire (auto-pick) → AI verdict → save as image.

> The database is already set up — production uses the same Supabase project.
> If you ever split dev/prod projects, re-run all migrations + seed on the new one.

## (Optional) Regenerate typed DB
After linking the project with the Supabase CLI:
```bash
supabase gen types typescript --linked > src/types/database.ts
```
The hand-authored types already match the migrations, so this is optional.
