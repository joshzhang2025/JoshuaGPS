# Cloud accounts + data sync — setup guide

This adds real accounts and a cloud database to Joshua GPS so that each person's
data (daily logs, project notes, meeting summaries, Groq key) is saved online and
follows them to **any device** when they sign in.

It uses **Supabase** — a free hosted database with built-in accounts. There is no
server for you or IT to run. You only do a one-time setup below.

> Until you finish this, the app still works in the old offline mode
> (login `admin` / `bigblaze`, data stays on the one device).

---

## What you do (about 10 minutes, one time)

### 1. Create a free Supabase project
1. Go to https://supabase.com and click **Start your project** / sign in.
2. Click **New project**.
3. Pick any name (e.g. `joshua-gps`), set a database password (save it somewhere),
   choose the region closest to your users, and click **Create new project**.
4. Wait ~1–2 minutes for it to finish setting up.

### 2. Create the database table
1. In your project, open **SQL Editor** (left sidebar) → **New query**.
2. Open the file `supabase-schema.sql` from this project, copy **all** of it,
   and paste it into the editor.
3. Click **Run**. You should see "Success".

### 3. Turn off email confirmation (recommended for simple internal use)
This lets people sign in immediately after signing up, without a confirmation email.
1. Go to **Authentication** → **Sign In / Providers** (or **Providers → Email**).
2. Find **Confirm email** and turn it **OFF**. Save.

> If you'd rather require email confirmation, leave it on — the app will then tell
> users "Check your email to confirm, then sign in." (You must also configure an
> email sender in Supabase for those emails to actually send.)

### 4. Copy your two connection values into the app
1. In Supabase, go to **Project Settings** → **API**.
2. Copy these two values:
   - **Project URL**
   - **anon public** key (under "Project API keys")
3. Open the file `supabase-config.js` in this project and paste them in:

```js
window.SUPABASE_CONFIG = {
  url: "https://abcdefgh.supabase.co",      // your Project URL
  anonKey: "eyJhbGciOi..."                   // your anon public key
};
```

4. Save the file.

That's it. The `anon` key is meant to be public — your data is protected by the
security rules created in step 2 (each account can only read/write its own rows).

---

## Try it
1. Open the site (for the website) or rebuild the mobile app (see below).
2. On the login screen, click **"Need an account? Sign up"**, enter an email +
   password, and create an account.
3. Add a daily log or project note.
4. Sign out (button at the bottom of the left menu), then sign in on a **different
   device or browser** with the same email/password — your data is there.

---

## For the mobile app (Capacitor)
The new files are plain web assets, so the normal build picks them up:

```powershell
npm run sync
```

(That runs `build-www.ps1` to copy assets into `www/`, then `npx cap sync`.)
The app needs an internet connection to sign in and sync.

---

## How it works (for reference)
- Sign up / sign in / sign out is handled by Supabase Auth (`cloud-sync.js`).
- On sign in, the app downloads that account's rows from the `user_data` table
  into the browser's `localStorage`, then renders.
- Whenever the app saves one of these keys, it's uploaded automatically:
  `joshuaGpsLocalUpdateState`, `joshuaGpsProjectNotes`,
  `joshuaGpsMeetingSummaries`, `joshuaGpsGroqKey`.
- On sign out, those keys are cleared from the device so the next person starts
  clean.

## Notes & limits
- **Internet required** to log in and sync. Offline, the app shows cached content
  but cannot reach the cloud.
- This is **last-write-wins** per device. If the same account edits on two devices
  at the exact same time, the most recent save wins. Fine for single-user-per-account
  use; not built for simultaneous multi-device editing of the same account.
- The shared content in `data/gps.json` is the same for everyone (it's the site
  template), and is not part of per-account sync.
