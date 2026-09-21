import { NextResponse } from "next/server";
import { creators } from "@/lib/mockData";
import { generateJSON } from "@/lib/gemini";
import { getRecentVideos, youtubeEnabled } from "@/lib/youtube";
import { computeMetrics, RECENT_N } from "@/lib/metrics";
import { keywordBaseline } from "@/lib/ai/baseline";
import { MATCH_SCHEMA, MATCH_SYSTEM, buildMatchPrompt, combineScore, WEIGHTS } from "@/lib/ai/match";

// POST /api/match
// Body: the full brief from the wizard.
// Returns: { creators: [{ id, name, subscribers, rates, tier, brandSafety, fit, breakdown, reasons[], matchedVideos[] }],
//            missing: string[], method, videoSource, weights }
//
// Pipeline:
//   1. Hard gate: drop creators below the brief's minimum brand-safety score.
//   2. Pull each creator's latest uploads from the YouTube Data API and derive
//      metrics (src/lib/metrics.js — data layer). Falls back to
//      mockData.recentVideos if no key / no handle / API error.
//   3. Two-stage ranking (standard retrieve-then-rerank): the cheap keyword
//      baseline shortlists the top SHORTLIST_N candidates, and ONE Gemini call
//      re-ranks only those. Sending 50 creators in one prompt is slow and the
//      first thing to fail when the API is busy.
//   4. Code computes engagement from real stats and blends the final score
//      (src/lib/ai/match.js).
//   5. If Gemini fails, the keyword baseline scores everyone instead — the UI
//      always gets the same shape, clearly labelled as an estimate.

// ---------------------------------------------------------------------------
// Fallback scorer (no AI): keyword overlap + engagement, from src/lib/ai/baseline.js.
// Used when Gemini is unavailable, and as the comparison baseline in
// scripts/eval-match.mjs. Always labelled as an estimate in the UI.
// ---------------------------------------------------------------------------
// How many candidates Gemini re-ranks. Bigger = better recall, slower and more
// likely to time out when the API is busy. 15 keeps the call ~3x smaller.
const SHORTLIST_N = 15;

function baselineScore(brief, c) {
  const { fit, contentScore, engagementScore } = keywordBaseline(brief, c);
  const top = [...(c.recentVideos || [])].sort((a, b) => b.views - a.views).slice(0, 2)
    .map((v) => ({ title: v.title, views: v.views, days: v.days, url: v.url, fit: contentScore }));
  return {
    fit,
    breakdown: null,
    reasons: [
      `Rule-based estimate: ${contentScore}% of recent videos mention your campaign keywords`,
      `${c.engagement != null ? c.engagement + "% engagement" : "Engagement unknown"} (score ${engagementScore})`,
      "AI scoring was unavailable — treat this ranking as a rough first pass",
    ],
    matchedVideos: top,
  };
}

// ---------------------------------------------------------------------------
// Step 2: real recent videos (or mock) per creator.
// ---------------------------------------------------------------------------
async function withRecentVideos(c) {
  if (youtubeEnabled() && c.youtubeHandle) {
    try {
      const yt = await getRecentVideos(c.youtubeHandle); // ~20 uploads, newest first
      if (yt.videos.length) {
        const metrics = computeMetrics(yt); // data layer: derived metrics + data-quality warnings
        return {
          ...c,
          subscribers: yt.hiddenSubscriberCount ? c.subscribers : yt.subscribers,
          tier: metrics.tier || c.tier,
          metrics,
          recentVideos: yt.videos.slice(0, RECENT_N), // Gemini sees the latest 5
          videoSource: "youtube",
        };
      }
    } catch (err) {
      console.error(`[match] YouTube failed for ${c.id}:`, err.message);
    }
  }
  return { ...c, metrics: null, videoSource: "mock" };
}

export async function POST(req) {
  const brief = await req.json();

  // What the user didn't give us — reported, never guessed.
  const missing = [];
  if (!brief.product) missing.push("what you're promoting");
  if (!brief.audience && !brief.interests) missing.push("target audience / interests");
  if (!brief.positioning) missing.push("brand positioning & tone");

  const minSafety = Number(brief.minSafety) || 0;
  const eligible = creators.filter((c) => c.brandSafety >= minSafety); // hard brand-safety gate
  const pool = await Promise.all(eligible.map(withRecentVideos));

  // Stage 1 — cheap keyword shortlist, so Gemini only re-ranks real contenders.
  const ranked = pool
    .map((c) => ({ c, pre: keywordBaseline(brief, c).fit }))
    .sort((a, b) => b.pre - a.pre);
  const shortlist = ranked.slice(0, SHORTLIST_N).map((r) => r.c);
  const restIds = new Set(ranked.slice(SHORTLIST_N).map((r) => r.c.id));

  // Stage 2 — one Gemini call over the shortlist only.
  const { data, error } = shortlist.length
    ? await generateJSON({ system: MATCH_SYSTEM, prompt: buildMatchPrompt(brief, shortlist), schema: MATCH_SCHEMA })
    : { data: { results: [] } };

  const byId = new Map((data?.results || []).map((r) => [r.id, r]));
  let usedGemini = 0;

  const scored = pool
    .map((c) => {
      const ai = byId.get(c.id);
      let scored;
      if (ai) {
        usedGemini++;
        scored = combineScore(ai, c, brief);
      } else if (restIds.has(c.id) && byId.size) {
        // Not shortlisted: keep it as a browsable alternative, but never let a
        // keyword score outrank a creator Gemini actually looked at.
        scored = baselineScore(brief, c);
        scored.fit = Math.min(scored.fit, 59);
        scored.reasons = ["Not in the AI shortlist — keyword match only", ...scored.reasons.slice(0, 1)];
      } else {
        // Gemini unavailable, or it skipped this creator → baseline for this one.
        scored = baselineScore(brief, c);
      }
      const { fit, reasons, matchedVideos, breakdown } = scored;

      return {
        id: c.id, name: c.name, subscribers: c.subscribers, rates: c.rates,
        tier: c.tier, brandSafety: c.brandSafety, fit, breakdown, reasons, matchedVideos,
        metrics: c.metrics, // derived metrics (null for mock creators)
      };
    })
    .sort((a, b) => b.fit - a.fit);

  const method = usedGemini === shortlist.length && shortlist.length
      ? (restIds.size ? "gemini-shortlist" : "gemini")
    : usedGemini > 0 ? "gemini-partial"
    : "baseline-fallback";

  return NextResponse.json({
    creators: scored,
    missing,
    method,
    videoSource: pool.some((c) => c.videoSource === "youtube") ? "youtube" : "mock",
    weights: WEIGHTS,
    shortlisted: shortlist.length,
    ...(error ? { debug: error } : {}),
  });
}
