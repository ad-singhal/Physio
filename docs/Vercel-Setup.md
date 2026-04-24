# Vercel Deployment Setup

1. Go to [vercel.com](https://vercel.com), log in, click **Add New Project**
2. Import the `ad-singhal/Physio` GitHub repo
3. Set **Root Directory** to `web`
4. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click **Deploy**

Every push to `main` will auto-deploy after this.
