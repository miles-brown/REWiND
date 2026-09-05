# Getting Started with REWIND

This guide will walk you through setting up, configuring, and running the **REWIND Evidence Atlas** locally.

---

## 1. Prerequisites

Ensure your development environment meets the following requirements:
- **Node.js**: `>=22.13.0`
- **npm**: `>=10.0.0`
- **Git**: For version control

---

## 2. Quickstart

```bash
# 1. Clone the repository
git clone https://github.com/miles-brown/REWiND.git
cd REWiND

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.example .env.local

# 4. Start the development server
npm run dev
```

Visit [`http://localhost:3000`](http://localhost:3000) to inspect the interactive atlas.

---

## 3. Environment Variables

Populate `.env.local` with optional credentials if integrating cloud database or API services:

| Variable | Description | Default |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_APP_URL` | Canonical URL for metadata and sharing | `http://localhost:3000` |
| `NEXT_PUBLIC_SITE_NAME` | Site branding header | `REWIND Evidence Atlas` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL (Data API endpoint) | `https://[PROJECT-ID].supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public anonymous API key | `""` |
| `DATABASE_URL` | PostgreSQL direct connection URI (Drizzle ORM) | `postgresql://...` |
| `GEMINI_API_KEY` | Optional AI forensic verification & transcription key | `""` |

---

## 4. Verification & Testing

```bash
# Typecheck TypeScript definitions
npx tsc --noEmit

# Run ESLint across all components
npm run lint

# Run Next.js production build verification
npm run build:vercel

# Run automated unit test suite
node --test tests/ui-components.test.mjs
```
