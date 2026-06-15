# TJFleet HQ — Build Rules

## From previous project (Superior Motor Club) — hard-learned lessons:

1. NEVER use mock/hardcoded data as fallback. If DB fails, show error or empty state.
   Client components receive data via props from server components. Never import mock files.

2. Forms must actually write to the database. Don't show success without a confirmed DB write.

3. All server actions must check user role before executing. Use requireRole('admin') or
   requireRole('secretary') guards. Viewer role = read-only, enforce at the action level.

4. Root error.tsx required — graceful error UI instead of blank 500.

5. RLS on every table from day one. Public = nothing accessible. Service role only.

6. Supabase connection: use pooler URL (port 6543) with pgbouncer=true for DATABASE_URL.
   SSL: rejectUnauthorized: false (Supabase pooler uses self-signed cert chain).

7. Prisma singleton via globalThis pattern (not Proxy — Proxy breaks on Vercel serverless).

8. .env.local in .gitignore. Sensitive keys (SERVICE_ROLE_KEY, DATABASE_URL) marked
   Sensitive in Vercel, Production+Preview only.

9. When deploying: push to GitHub → Vercel auto-deploys. Empty commits trigger redeploy:
   git commit --allow-empty -m "chore: redeploy" && git push

10. File uploads go to Supabase Storage. Vehicle photos = public bucket.
    Customer documents = private bucket. Use admin client (service role) for uploads.

11. Calendar bookings must check for overlaps BEFORE creating. Use FOR UPDATE row lock
    on conflict check to prevent race conditions.

12. Test with real data early. Don't build 7 modules then test. Build fleet → test with
    real cars → build customers → test with real people → build bookings → test with
    real dates. Catch bugs per-module.

## Tech Stack
- Next.js (App Router) + TypeScript
- Supabase (Auth + Storage + Postgres)
- Prisma with @prisma/adapter-pg
- FullCalendar for calendar views
- Tailwind CSS for styling
- Vercel for hosting

## Next.js Notes
- params and searchParams are Promises in server components — must await them
- Server actions use 'use server' directive
- Client components use 'use client' directive
