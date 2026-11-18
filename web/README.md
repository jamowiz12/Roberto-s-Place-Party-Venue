# Roberto's Place Standalone Web App

## Local development

1. Copy `.env.example` to `.env.local`.
2. Add the Supabase project URL and publishable key.
3. Apply `supabase/schema.sql` in the Supabase SQL editor.
4. Run `npm install`.
5. Run `npm run dev`.

Open `http://localhost:3000`.

## Vercel deployment

Set these Vercel environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Deploy the `web` directory as the project root.

Never place a Supabase service-role key in browser code or in `NEXT_PUBLIC_*` variables.
