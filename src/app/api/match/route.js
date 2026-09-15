import { NextResponse } from "next/server";
import { creators } from "@/lib/mockData";

// POST /api/match
// Body: { product, audience, budget, duration, kpi, notes }
// Returns: { matches: [{ id, name, emoji, subscribers, rates, fit, reason }] }
//
// TODO(api + llm): the real version does two things:
//   1. Pull candidate creators (YouTube Data API + your creator DB).
//   2. Ask Gemini to score each candidate's RECENT videos against the brief
//      and return a 0–100 fit + a one-line reason. Rank by fit, respect budget.
//
// This mock ranks the seeded creators by a naive budget filter + their stored
// fit signal so the UI is fully clickable today.

export async function POST(req) {
  const brief = await req.json();
  const budget = Number(brief.budget) || 99999;

  const matches = creators
    .filter((c) => c.rates.dedicatedVideo <= budget * 1.2)
    .map((c) => {
      const recentFit = Math.round(
        c.recentVideos.reduce((s, v) => s + v.fit, 0) / c.recentVideos.length
      );
      return {
        id: c.id,
        name: c.name,
        emoji: c.emoji,
        subscribers: c.subscribers,
        rates: c.rates,
        fit: recentFit,
        reason:
          recentFit >= 85
            ? `Recent videos strongly match "${brief.product || "your product"}"; ${c.engagement}% engagement fits your KPI.`
            : `Audience is adjacent but recent content has drifted — expect a softer fit.`,
      };
    })
    .sort((a, b) => b.fit - a.fit);

  await new Promise((r) => setTimeout(r, 700));
  return NextResponse.json({ matches });
}
