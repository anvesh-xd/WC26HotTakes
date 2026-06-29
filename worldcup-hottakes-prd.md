# PRD: World Cup Hot Takes

**Author:** Anvesh Reddy  
**Status:** Ready for build  
**Last updated:** June 28, 2026

---

## Overview

A lightweight Next.js web app for World Cup 2026 Round of 32 predictions. Past matches show locked results pulled live from football-data.org. Upcoming matches let anyone enter a score prediction. Once you've made your picks, you get a clean shareable card — a grid of all your predictions — that you screenshot and post to Instagram, X, or WhatsApp.

---

## Core User Flow

1. User lands on the app → enters their name (one time, stored in localStorage)
2. Sees all R32 matches in a feed — past matches locked with real scores, upcoming matches open
3. For each upcoming match → picks a score (e.g. Brazil 3 – 1 Japan)
4. Hits "Generate my card" → sees a shareable card with all their predictions
5. Downloads the card as a PNG → posts it wherever

---

## Features

### Match Feed

- All R32 matches in chronological order, fetched from football-data.org
- Each card shows: team names, flag emojis, kickoff time (local), status
- **Past/live matches** — locked, show actual score
- **Upcoming matches** — two number inputs for score prediction
- Predictions auto-saved to localStorage as user types

---

### Prediction Input

- Name field at top of page (saved to localStorage, pre-filled on return)
- Per match: two number inputs side by side (home | away)
- No explicit submit per match — state saved automatically
- "Generate my card" button appears once at least one prediction is filled

---

### Share Card

A full-card PNG the user downloads and posts manually.

**Card layout:**
- Header: "World Cup 2026 · [Name]'s Picks"
- Grid of every match the user predicted:
  - Team A vs Team B
  - Their predicted score (e.g. 3–1)
  - If already played: actual result + ✓ or ✗
- Footer: site URL
- Aesthetic: dark background, bold typography, stadium green accents

**Export:**
- `html2canvas` renders a hidden card div to PNG
- "Download card" saves to device
- Entirely client-side, no backend

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) |
| Hosting | Vercel |
| Match data | football-data.org free API |
| Prediction storage | localStorage (client-side, personal) |
| Share card | html2canvas |
| Styling | Tailwind CSS |

---

## API Integration

**Base URL:** `https://api.football-data.org/v4/`

**Endpoint:** `GET /competitions/WC/matches?stage=LAST_32`

**Auth:** `X-Auth-Token: YOUR_API_KEY` header

**Next.js usage:**
- Fetch in a Next.js API route (`/api/matches`) to keep the API key server-side
- Cache response for 5 minutes (`revalidate: 300`) to avoid hitting rate limits
- Map response to match status: `FINISHED` → locked with score, `SCHEDULED` or `TIMED` → open for prediction, `IN_PLAY` → locked, show "Live"

**Env variable:**
```
FOOTBALL_DATA_API_KEY=your_key_here
```
Set this in Vercel dashboard under Project Settings → Environment Variables.

---

## Data Shape (from API → app)

```js
// What you get from football-data.org (simplified)
{
  id: 123,
  utcDate: "2026-06-29T17:00:00Z",
  status: "SCHEDULED", // SCHEDULED | TIMED | IN_PLAY | FINISHED
  homeTeam: { name: "Brazil", crest: "..." },
  awayTeam: { name: "Japan", crest: "..." },
  score: {
    fullTime: { home: null, away: null } // fills in when FINISHED
  }
}

// What you store in localStorage
{
  name: "Anvesh",
  predictions: {
    "123": { home: 3, away: 1 },
    "124": { home: 2, away: 0 }
  }
}
```

---

## File Structure

```
/app
  /page.tsx              → match feed + name input
  /api/matches/route.ts  → server-side fetch from football-data.org
/components
  MatchCard.tsx          → single match card (locked or prediction input)
  ShareCard.tsx          → hidden div rendered to PNG by html2canvas
  NameInput.tsx          → name field at top
/lib
  useLocalStorage.ts     → hook for predictions state
  scoring.ts             → correct/wrong logic for played matches
/public
  → flag emojis handled inline, no assets needed
```

---

## Out of Scope (v1)

- Leaderboard or points system
- Community feed (other people's predictions)
- Hot takes / text commentary
- User accounts / auth
- Direct IG/X API posting
- R16 and beyond

---

## Open Questions

1. **Flags** — emoji flags (🇧🇷) are simplest and render fine in html2canvas. Alternatively use team crest URLs from the API. Recommend emoji for v1.
2. **Rate limits** — football-data.org free tier is 10 requests/min. The `/api/matches` route with 5-min cache on Vercel handles this fine.

---

## Build Notes for Cursor

- Start with `npx create-next-app@latest` (TypeScript, Tailwind, App Router)
- Build the API route first, confirm match data shape before touching UI
- Use `html2canvas` from npm — install as `html2canvas`
- The share card div should be rendered off-screen (`position: absolute; left: -9999px`) and captured on button click
- Test localStorage persistence by refreshing — predictions should survive
- Deploy to Vercel with `vercel --prod`, add `FOOTBALL_DATA_API_KEY` in Vercel dashboard
