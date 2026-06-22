# Algodeck

A boot.dev-flavored LeetCode trainer. Solve DSA problems, grind streaks, earn XP.
No auth — just pick a handle and your progress syncs to the cloud.

## Stack

- Vite + React 18 + React Router
- TailwindCSS (custom boot.dev-inspired palette)
- Monaco Editor (the engine behind VSCode)
- Supabase (progress, activity, achievements tables)
- Piston API (multi-language code execution)

## Quick start

```bash
cd /root/dsa-dojo
npm install
npm run dev
```

Open http://localhost:5173

## Supabase setup

1. Create a free project at https://supabase.com
2. Run the SQL in `supabase/schema.sql` (creates 3 tables + RLS policies)
3. Copy `.env.example` → `.env.local` and fill in your URL + anon key

## Features

- 150+ curated problems from NeetCode 150 (Arrays → DP → Graphs)
- 5 languages: JavaScript, Python, Java, C++, Go
- Real code execution via Piston API
- Strict 3-click solution reveal (forces you to try first)
- XP, streaks, per-topic progress, 8 achievements
- Cloud sync by handle (no login)