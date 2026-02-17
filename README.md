# Smart Bookmark App

Live URL: [your-vercel-url]

## What I built

A full-stack bookmark manager with Google OAuth, private per-user bookmarks, and real-time sync across browser tabs.

## Tech Stack

Next.js 14 (App Router) · Supabase (Auth, DB, Realtime) · Tailwind CSS · Vercel

## Problems & Solutions

**Problem 1:** Supabase session not available in Server Components  
**Solution:** Used `@supabase/ssr` with cookie-based session handling via middleware and server helpers.

**Problem 2:** Realtime subscription showing other users' changes  
**Solution:** Filtered Realtime channel with `filter: user_id=eq.{userId}` and enforced RLS on the `bookmarks` table.

**Problem 3:** Hydration mismatch with optimistic updates  
**Solution:** Used `initialBookmarks` from the server as the `useState` initial value and let Realtime drive subsequent updates.

## Setup

1. Clone repo.
2. Create a Supabase project, run the SQL schema for the `bookmarks` table, and enable Realtime on the table.
3. Add Google OAuth provider in Supabase Auth settings with redirect URL `https://your-vercel-url/auth/callback` (and the local development URL if needed).
4. Create a `.env.local` file with:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. Install dependencies and run the app:

   ```bash
   npm install
   npm run dev
   ```

6. Deploy to Vercel, add the environment variables there, and update the production redirect URL in Supabase to match your deployed domain.

