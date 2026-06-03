# Shuroku Web

Next.js 15 (App Router) frontend for Shuroku. Implements the foundation and data layer from `design.md`: the "Ink & Vermillion Archive" token system, app shell, auth flow, and React Query data layer wired to the Fastify backend.

## Stack
- Next.js 15 App Router + TypeScript
- Tailwind CSS with design.md tokens (ink / washi / shu palette; Zodiak + Satoshi + Shippori Mincho + Spline Sans Mono)
- TanStack React Query for server state
- In-memory access token + httpOnly refresh cookie, transparent one-shot refresh on 401

## Setup
```bash
npm install
cp .env.local.example .env.local   # point NEXT_PUBLIC_API_URL at the backend
npm run dev                        # http://localhost:3000
```
The backend must run on http://localhost:4000 (or set NEXT_PUBLIC_API_URL). Backend CORS must allow http://localhost:3000 (its default).

## Built (foundation + data layer)
- Tokens & atmosphere: globals.css + tailwind.config.ts, paper grain, focus rings, reduced-motion
- App shell: fixed rail (wordmark, nav, status filters), sticky top bar with the search trigger, mobile bottom tabs, auth gating + redirect
- Auth: /login and /register with the oversized 収 backdrop, session bootstrap via refresh cookie, useAuth() context
- Data layer: typed api() client, shared types/api.ts mirroring the backend, React Query provider
- Library home: fetches /library, minimal poster grid with status spine + progress hairline + staggered fade-in, loading skeletons, empty state

## Also built (Step 4 screens)
- Anime detail page (/anime/[id], design.md 7.3): banner, poster, status pill (6.3), episode stepper (6.4), gold star rating, genres, synopsis, official/free source sections, inline add-source form
- Collections (7.4): folio cards with stacked-paper effect, create/delete, mini-poster stacks
- Data layer: lib/hooks.ts with all queries + mutations (optimistic +1 episode), home tiles link into detail

## Next (in Claude Design)
- Poster card with the seal-stamp animation (6.2)
- Search command palette / Cmd-K (6.5)
Drop these into src/components when ready; the minimal home tiles are placeholders for the hero poster card.

## Routes
/ library, /anime/[id] detail, /collections, /login, /register, /search (palette pending)
