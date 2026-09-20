import { NextResponse } from "next/server";
import { creators } from "@/lib/mockData";

// POST /api/match
// Body: the full brief from the wizard.
// Returns: { creators: [{ id, name, subscribers, rates, fit, reasons[], matchedVideos[] }], missing: string[], method }
//
// SCORING IS A HEURISTIC DEMO, not real AI. It blends the creator's recent-video
// signal with brief-driven factors (industry fit, tier preference, KPI, brand
// safety) so the score changes reasonably when the brief changes. It never
// invents data: empty brief fields are reported back in `missing`.
//
// TODO(llm): replace scoreCreator() with a Gemini call that reads the brief +
// the creator's recent video transcripts and returns {fit, reasons}.

const INDUSTRY_NICHE = {
  "Food & Beverage": ["food", "wellness", "cooking"],
  "Beauty & Personal Care": ["beauty", "lifestyle", "wellness"],
  Fashion: ["fashion", "lifestyle"],
  "Consumer Electronics": ["tech", "review"],
  "Health & Wellness": ["health", "wellness", "lifestyle", "food"],
  "Software / SaaS": ["tech", "review", "productivity"],
  "Home & Lifestyle": ["home", "lifestyle"],
};

function scoreCreator(brief, c) {
  const contentBase = Math.round(c.recentVideos.reduce((s, v) => s + v.fit, 0) / c.recentVideos.length);
  const niche = (c.niche || "").toLowerCase();
  const reasons = [];

  // 1) Industry ↔ niche alignment (40% weight, blended with content signal).
  const keys = INDUSTRY_NICHE[brief.industry] || [];
  const industryHit = keys.some((k) => niche.includes(k));
  let score = Math.round(contentBase * 0.6 + (industryHit ? 92 : 58) * 0.4);
  if (industryHit) reasons.push(`Niche "${c.niche}" fits your ${brief.industry} campaign`);
  else reasons.push(`Niche "${c.niche}" is adjacent to your ${brief.industry || "category"}`);

  // 2) Recent-content relevance.
  if (contentBase >= 85) reasons.push(`Recent videos are on-theme (avg fit ${contentBase})`);
  else reasons.push(`Recent content has drifted a little (avg fit ${contentBase})`);

  // 3) Creator-tier preference.
  if (brief.tier && brief.tier !== "Any") {
    if (brief.tier === c.tier) { score += 6; reasons.push(`${c.tier} tier matches your preference`); }
    else { score -= 12; reasons.push(`Is ${c.tier}, but you asked for ${brief.tier}`); }
  }

  // 4) KPI: conversion-type goals reward engagement.
  if (/sales|conversion|customer/i.test(brief.kpi || "")) {
    const adj = Math.max(-4, Math.min(8, Math.round(c.engagement - 4)));
    score += adj;
    reasons.push(`${c.engagement}% engagement ${adj >= 0 ? "supports" : "is light for"} your "${brief.kpi}" goal`);
  }

  // 5) Product / interest keyword overlap (small nudge).
  const text = `${brief.product || ""} ${brief.interests || ""}`.toLowerCase();
  if (text && niche.split(/[^a-z]+/).some((w) => w.length > 3 && text.includes(w))) {
    score += 4;
    reasons.push("Your product keywords overlap their content");
  }

  score = Math.max(0, Math.min(100, score));
  const matchedVideos = [...c.recentVideos].sort((a, b) => b.fit - a.fit).slice(0, 2);
  return { fit: score, reasons, matchedVideos };
}

export async function POST(req) {
  const brief = await req.json();

  // What the user didn't give us — reported, never guessed.
  const missing = [];
  if (!brief.product) missing.push("what you're promoting");
  if (!brief.audience && !brief.interests) missing.push("target audience / interests");
  if (!brief.positioning) missing.push("brand positioning & tone");

  const minSafety = Number(brief.minSafety) || 0;

  const scored = creators
    .filter((c) => c.brandSafety >= minSafety) // hard brand-safety gate
    .map((c) => {
      const { fit, reasons, matchedVideos } = scoreCreator(brief, c);
      return { id: c.id, name: c.name, subscribers: c.subscribers, rates: c.rates, tier: c.tier, brandSafety: c.brandSafety, fit, reasons, matchedVideos };
    })
    .sort((a, b) => b.fit - a.fit);

  await new Promise((r) => setTimeout(r, 700));
  return NextResponse.json({ creators: scored, missing, method: "heuristic-demo" });
}
