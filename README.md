# SponsorSync

Prototype for the **NYU SPS × Google Hackathon — Track 2 (Product & Engineering)**.

A B2B **verified sponsor ↔ creator** platform that lets small businesses run YouTube
creator sponsorships without a marketing team. It packages the things Google's
Creator Partnerships doesn't do for SMBs: **verified sponsors, transparent pricing,
and AI-assisted contract & content review.**

> One-line pitch: *Google built the enterprise engine parts. We assemble them into
> one accessible car for SMBs.*

---

## Run it

```bash
npm run dev
```

Open http://localhost:3000

Everything runs on **mock data** today — fully clickable, no API keys needed.

---

## The hero flow (what to demo)

1. **/sponsor/signup** — verify with a company email → "Verified Sponsor" badge
2. **/creators** — browse creators with transparent rate cards (指定达人 / Xingtu-style)
3. **/creators/[id]** — build a package (content type + commercial-rights add-ons) → send enquiry
4. **/match** — or fill a brief and let Gemini rank best-fit creators (AI custom match)
5. **/deals/[id]** — chatroom → "Summarize with Gemini" turns the chat into clear terms
6. **/deals/[id]/review** — after delivery: platform compliance check + Gemini order review

---

## Where teammates plug in APIs + LLM

All the AI/data calls are isolated in **`src/app/api/*`** as mock route handlers.
Each file has a `TODO(llm)` / `TODO(api)` block showing exactly what to call and an
example Gemini snippet. Swap the mock return for a real call and the UI just works.

| Route | Does | Wire in |
| --- | --- | --- |
| `api/optimize-brief` | Rewrites the sponsor's notes into a clean brief | Gemini |
| `api/match` | Ranks creators by recent-video fit to the brief | YouTube Data API + Gemini |
| `api/summarize` | Turns the chatroom into structured deal terms | Gemini |
| `api/review` | Platform compliance + content/contract review | YouTube Data API + Gemini |

Mock creator/deal data lives in **`src/lib/mockData.js`** — keep the field shapes the
same when you swap in real data and every page keeps rendering.

### Gemini setup (when ready)

```bash
npm install @google/generative-ai
```

Add `.env.local`:

```
GEMINI_API_KEY=your_key_from_ai_studio
YOUTUBE_API_KEY=your_youtube_data_api_key
```

Keys stay server-side (only used inside `src/app/api/*`), never shipped to the browser.

---

## Project map

```
src/
  app/
    page.js               landing / story
    sponsor/signup/       company-email verification
    creators/             directory + [id] profile & rate card
    match/                AI brief → ranked creators
    dashboard/            active deals + creator pushes
    deals/[id]/           chatroom (+ Gemini terms)
    deals/[id]/review/    platform + AI order review
    api/                  ← all LLM/data integration points (mock now)
  lib/
    config.js             APP_NAME + pitch copy (rename here)
    mockData.js           creators, deals, pushes
    format.js             number/currency/score helpers
```

Rename the product in `src/lib/config.js`.
