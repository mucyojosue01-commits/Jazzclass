# JazzClass database setup

1. Create a dedicated Supabase project for JazzClass. Do not reuse the UmurimoHub database.
2. Apply `migrations/20261101000000_music_knowledge_platform.sql` in the Supabase SQL editor or through the Supabase CLI migration workflow.
3. Add the project URL and publishable key to Vercel as `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
4. Never add a service-role or secret key to Vite variables. The browser only uses the publishable key; PostgreSQL RLS protects the tables.
5. Add curated lesson records with source and licence metadata before marking them published.

The frontend remains usable without Supabase: the music theory engine generates formulas locally. Database-backed catalogue reads activate automatically once both environment variables are present.

## Content governance

Store original editorial lessons, formulas and examples separately from source references. Record source URL, author, publisher, licence, attribution and verification date in `sources` and `content_sources`. Do not copy complete copyrighted books, lesson text, sheet music or recordings into the catalogue. Publish only original material, public-domain content, or content with a licence that permits the intended use.
