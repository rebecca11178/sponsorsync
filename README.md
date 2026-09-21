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

---

## AI backend (API + LLM) — status

| Route | Status | How it works |
| --- | --- | --- |
| `api/match` | **Live** (falls back to keyword baseline) | roster or YouTube Data API → recent videos · metrics computed in code · Gemini → content fit, audience fit, reasons, risk flags · code → weighted final score |
| `api/review` | **Live** (falls back to mock) | platform check = rules on YouTube metadata · order review = Gemini watches the public video against the agreed terms |
| `api/summarize` | **Live** (falls back to mock) | Gemini extracts agreed terms from the chat, marking what is still unsettled |
| `api/contract` | **Live** (falls back to mock) | Gemini drafts clauses from those terms; anything not agreed becomes a visible `[TO CONFIRM]` blank |
| `api/optimize-brief` | Mock | — |
| `api/performance` | Mock | closer to Track 1; left as demo data |

**Creator data.** `data/creator-roster.xlsx` (owned by the data team) → `npm run import:roster` → `src/lib/creators.generated.js`. 50 fictional creators with 3 recent videos each. Never hand-edit the generated file. Set a creator's `youtubeHandle` to pull that creator's **real** recent videos instead.

Shared logic: `src/lib/gemini.js`, `src/lib/youtube.js`, `src/lib/metrics.js`, `src/lib/ai/{match,review,deal,baseline}.js`.
Every response carries `method` / `source` so the UI can say whether Gemini actually ran.

**Data layer & evaluation** (owner: data teammate)
- `src/lib/metrics.js` — raw YouTube data → derived metrics (median/avg views, engagement rate, posting cadence, tier, data-quality warnings).
- `src/lib/ai/baseline.js` — non-AI keyword baseline: the fallback scorer *and* the comparison baseline.
- `scripts/eval-match.mjs` + `eval/campaigns.example.json` — label creators high/medium/low per campaign, then compare Gemini vs baseline (P@3, low@3, Spearman).

**Commands** (copy `env.example` → `.env.local` first; Node 20.9+):

```bash
npm run import:roster                      # spreadsheet → creators.generated.js
npm run try -- match @somehandle "cold brew green tea" "Food & Beverage"
npm run try -- review https://www.youtube.com/watch?v=XXXXXXXXXXX
npm run try -- deal d3                     # chat → terms → draft contract
npm run eval -- eval/campaigns.json        # Gemini vs baseline vs human labels
```

Limits to know: Gemini can only watch **public** YouTube videos by URL (unlisted/private drafts would need a file upload); the YouTube API gives no audience demographics for other people's channels, so `audience` on roster creators is demo data and audience fit for real channels is inferred.
