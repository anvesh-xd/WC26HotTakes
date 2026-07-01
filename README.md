# wc26hottakes.com

Pick scores for every World Cup 2026 knockout match, add a short hot take and download a shareable card for Instagram, X or WhatsApp.

Live site: [wc26hottakes.com](https://wc26hottakes.com)

---

## Motivation

Growing up, every World Cup meant one thing before the first whistle: a trip to the corner store to buy the newspaper. I'd cut out the prediction bracket, stick it on our living room door and the whole family would fill it in by hand. We'd argue about it for weeks.

That memory hit me during the 2026 World Cup. I looked around for something that captured that same feeling and couldn't find it. Everything was either a full fantasy platform with points and leagues, or a generic poll.

So I built the digital version. The idea was simple: predict the score, write your hot take and get a shareable card. .

The whole thing was conceived, designed, built and deployed in under 48 hours during an active tournament, which meant every product decision had a deadline. I built it for the Round of 32 because that's when knockout football gets serious and every prediction feels high-stakes.

---

## Architecture

```
Your browser
    │
    ├─► Match feed (React page)
    │       polls /api/matches every 20-60 seconds
    │
    ├─► Predictions + name saved in localStorage (stays on your device)
    │
    └─► Share card: html2canvas turns a hidden div into a PNG download

/api/matches (Next.js API route on Vercel)
    │
    └─► football-data.org API (live scores + fixtures)
            API key stays on the server, never in the browser
```

The website is a single Next.js app hosted on Vercel. Match data comes from football-data.org through a server route so the API key stays hidden. Your predictions never leave your browser — they live in localStorage. The share card is built entirely on the client with html2canvas.

| Piece | What it does |
|---|---|
| Next.js (App Router) | Pages and API route |
| football-data.org | Live scores and knockout fixtures |
| localStorage | Name and predictions |
| html2canvas | PNG export of your prediction card |
| Tailwind CSS v4 | Styling |
| Vercel | Hosting, analytics and deploys from GitHub |

---

## What I Did vs What the AI Agent Did

This project was built using Cursor with Claude as the AI coding agent. 

**What I owned:**
- The product concept, motivation and PRD — user flow, features, scope and what to cut for v1
- The design direction and aesthetic: sports front page feel, shareable card, no accounts
- All product calls: hot takes per match, grading picks, penalty shootout handling, what not to build
- Set up the repo, football-data.org API key and Vercel deployment
- Tested during real matches and flagged issues (live scores not updating, stale data on some devices)
- All copy: site text, share card labels, the LinkedIn post and this README

**What the agent did:**
- Scaffolded the Next.js app from the PRD
- Built core UI: match feed, prediction inputs, name field and share card
- Wired the `/api/matches` route to football-data.org
- Added scoring logic (exact score / correct winner / wrong)
- Built the share card layout, PNG export and mobile share flow
- Fixed production bugs: ShareCard blank exports and two-column layout for long pick lists
- Fixed live score reliability: disabled CDN caching, faster polling during live games, halftime (PAUSED) handling, refetch on tab focus and mobile back-navigation

The agent wrote most of the code. I wrote all of the product.

---

## Product Direction

Every decision came back to one question: does this make it feel more like the newspaper bracket, or less?

**What I cut and why:**
- **Leaderboard**: a scoreboard changes the energy from "fun and social" to "competitive." The bracket on the door was never about winning.
- **User accounts**: no sign up, causes a lot of friction
- **Community hot takes feed**: showing everyone's takes sounds fun in theory, adds moderation complexity in practice. V2 maybe.
- **Direct Instagram/X API posting**: requires OAuth, app review and costs money.

**What I kept:**
- Hot takes: the name of the product had to mean something. One text box per match.
- Share card that updates: same card before and after the game. Before your picks, after your picks + the real result + a ✓ or ✗. Two moments of shareability from one action.
- Zero backend: localStorage 

**Possible next steps:**
- Extend to Round of 16 and beyond
- "Tournament card" that updates as more rounds finish
- Better live UX (match minute, extra time indicator)
- Lightweight share link (still no full auth)

---

## AI Usage

This project was built with Cursor (AI-assisted coding in the IDE).

| Stage | How AI helped |
|---|---|
| Planning | PRD written by me; agent used it as the build spec |
| Build | Agent generated components, API route, hooks and styling from the PRD |
| Iteration | I described bugs and UX issues in chat; agent traced code and shipped fixes |
| Debugging | Live score issues needed digging into caching, polling and API status values |

What AI did well: fast scaffolding, boilerplate and fixing subtle production issues.

What I still had to do: product judgment, real-match testing, knowing when something felt wrong and deciding what not to build.

---

## Stack

Next.js 16, React 19, TypeScript, Tailwind CSS v4, football-data.org API and Vercel.