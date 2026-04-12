# External Services Setup Guide

**For:** CEO / Tech Lead
**Purpose:** Step-by-step instructions to create accounts and credentials needed by the app.

---

## 1. Google Cloud Console (OAuth Credentials)

These credentials allow users to sign in with their Google account.

1. Go to https://console.cloud.google.com/
2. Create a new project (name: "Career Accelerator")
3. In the left sidebar, go to **APIs & Services > OAuth consent screen**
4. Select **External** user type, click **Create**
5. Fill in:
   - App name: `Career Accelerator`
   - User support email: your email
   - Developer contact: your email
6. Click **Save and Continue** through Scopes and Test Users (no changes needed)
7. Go to **APIs & Services > Credentials**
8. Click **+ Create Credentials > OAuth 2.0 Client ID**
9. Application type: **Web application**
10. Name: `Career Accelerator Web`
11. Under **Authorized redirect URIs**, add:
    - `http://localhost:3000/api/auth/callback/google` (for local dev)
    - `https://<your-vercel-url>/api/auth/callback/google` (add after Vercel setup)
12. Click **Create**
13. Copy the **Client ID** and **Client Secret** — these go into `.env.local` as:
    ```
    GOOGLE_CLIENT_ID=<client-id>
    GOOGLE_CLIENT_SECRET=<client-secret>
    ```

**Important:** While the app is in "Testing" mode in Google Console, only emails added as test users can sign in. Add your Google email under **OAuth consent screen > Test users**.

---

## 2. Vercel Deployment

1. Go to https://vercel.com/ and sign up with your GitHub account
2. Click **Add New > Project**
3. Import the `duoprocrastination` repository from GitHub
4. Framework preset: **Next.js** (should auto-detect)
5. Before deploying, go to **Settings > Environment Variables** and add:
   - `GOOGLE_CLIENT_ID` — from step 1 above
   - `GOOGLE_CLIENT_SECRET` — from step 1 above
   - `NEXTAUTH_SECRET` — generate with: `openssl rand -base64 32`
   - `NEXTAUTH_URL` — set to your Vercel URL (e.g., `https://career-accelerator.vercel.app`)
   - `DATABASE_URL` — from Supabase (see section 3)
   - `DIRECT_URL` — same as DATABASE_URL for now
6. Click **Deploy**
7. After deploy, copy the Vercel URL and go back to Google Cloud Console:
   - Add `https://<your-vercel-url>/api/auth/callback/google` to the authorized redirect URIs

---

## 3. Supabase (Database)

Dev 2 handles Supabase project creation (SP1-02). The connection string is needed for both `.env.local` and Vercel env vars.

**Where to find it:**
1. Go to your Supabase project dashboard
2. **Settings > Database > Connection string (URI)**
3. Copy the URI — it looks like: `postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres`
4. Set this as `DATABASE_URL` in `.env.local` and in Vercel

---

## 4. Local Development Setup

After all credentials are in place:

```bash
cp .env.local.example .env.local
# Fill in all values from steps 1-3 above

npm install
npx prisma migrate dev
npm run dev
```

Open http://localhost:3000 — you should see the login page.
