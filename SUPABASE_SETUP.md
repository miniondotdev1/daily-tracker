# ☁️ Cloud Accounts & Cross-Device Sync — Setup

The app works fully offline with no account (data lives in `localStorage`).
Follow these steps to switch on **login + sync across browsers and devices**.
It uses [Supabase](https://supabase.com) — free tier is plenty.

Total time: ~10 minutes.

---

## 1. Create a Supabase project

1. Go to <https://supabase.com> → **Start your project** → sign in.
2. **New project** → give it a name and a database password → **Create**.
3. Wait ~1 minute for it to provision.

## 2. Get your API keys

Project → **Settings** (gear) → **API Keys**. Copy:

- **Project URL** → `VITE_SUPABASE_URL`
- **Publishable key** (`sb_publishable_…`, or the legacy **anon public** JWT) →
  `VITE_SUPABASE_ANON_KEY`

Create a `.env` file in the `daily-tracker/` folder (copy `.env.example`):

```
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...your-key...
```

> The publishable/anon key is safe to expose in a browser app — row-level
> security (next step) is what actually protects each user's data.
>
> ⚠️ The **secret** key (`sb_secret_…` / `service_role`) bypasses row-level
> security. Never put it in `.env` here, in the frontend, or in Vercel — any
> `VITE_`-prefixed var is bundled into the public JavaScript.

Restart the dev server after adding `.env`.

## 3. Create the data table (with row-level security)

Supabase → **SQL Editor** → **New query** → paste this and **Run**:

```sql
-- One JSON blob per user holds their whole tracker.
create table if not exists public.user_data (
  user_id    uuid primary key references auth.users on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Lock it down: a user can only ever see/change their OWN row.
alter table public.user_data enable row level security;

create policy "read own data"   on public.user_data
  for select using (auth.uid() = user_id);
create policy "insert own data" on public.user_data
  for insert with check (auth.uid() = user_id);
create policy "update own data" on public.user_data
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Enable live cross-device updates (optional but nice).
alter publication supabase_realtime add table public.user_data;
```

## 4. Turn on the sign-in methods

Supabase → **Authentication** → **Providers**:

- **Email** — enabled by default. This powers both *email + password* and the
  *magic link*. (For quick testing you can turn OFF "Confirm email" so new
  accounts work instantly.)
- **Google** — toggle on, then paste a Google OAuth **Client ID** and **Secret**:
  1. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
     → **Create Credentials → OAuth client ID → Web application**.
  2. Under **Authorized redirect URIs**, add the callback shown in Supabase's
     Google provider panel (looks like
     `https://xxxx.supabase.co/auth/v1/callback`).
  3. Copy the Client ID/Secret back into Supabase → **Save**.

## 5. Allow your app URLs

Supabase → **Authentication** → **URL Configuration**:

- **Site URL:** your production URL (e.g. `https://your-app.vercel.app`).
- **Redirect URLs:** add both:
  - `http://localhost:5173` (local dev)
  - `https://your-app.vercel.app` (production)

## 6. Add the same env vars to Vercel

Vercel → your project → **Settings → Environment Variables**, add
`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, then **redeploy**.

---

## ✅ Done

Reload the app — a **Sign in** button appears in the header. Create an account,
and your days, submissions, milestones, streaks, badges and settings now follow
you to any device you sign in on.

### How the sync works
- **Offline-first:** the app always reads/writes `localStorage` instantly, so it
  never blocks or breaks if you're offline.
- **On login:** your local data is *merged* with the cloud copy (nothing is
  overwritten — the richer copy of any day wins), then saved to both.
- **Ongoing:** changes push to the cloud a moment after you make them, and other
  signed-in devices pull them live (realtime) and on tab focus.
- **Sign out** leaves your data on the device; it does not delete anything.
