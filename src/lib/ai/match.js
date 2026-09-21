// ---------------------------------------------------------------------------
// Creator-matching prompt, schema and scoring — shared by /api/match and
// scripts/try-ai.mjs so the test script runs EXACTLY the production logic.
//
// Division of labour (the design we pitch):
//   • Code   → hard numbers: engagement rate from real YouTube stats, tier
//              preference, the final weighted score.
//   • Gemini → semantic judgement only: how well recent content fits the brief,
//              a (clearly inferred) audience fit, reasons, risk flags.
// No imports on purpose — keeps this file runnable from plain Node.
// ---------------------------------------------------------------------------

// Final score = weighted blend. Shown to users as the "how we score" note.
export const WEIGHTS = { content: 0.55, audience: 0.25, engagement: 0.2 };
export const TIER_MISMATCH_PENALTY = 10;

export const MATCH_SCHEMA = {
  type: "object",
  properties: {
    results: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          contentFit: { type: "integer", minimum: 0, maximum: 100 },
          audienceFit: { type: "integer", minimum: 0, maximum: 100 },
          reasons: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 3 },
          riskFlags: { type: "array", items: { type: "string" }, maxItems: 3 },
          videoFits: {
            type: "array",
            items: {
              type: "object",
              properties: { index: { type: "integer" }, fit: { type: "integer", minimum: 0, maximum: 100 } },
              required: ["index", "fit"],
            },
          },
        },
        required: ["id", "contentFit", "audienceFit", "reasons", "riskFlags", "videoFits"],
      },
    },
  },
  required: ["results"],
};

export const MATCH_SYSTEM = `You are a YouTube influencer-marketing strategist shortlisting creators for a small business.
Judge only from the data given. Some creators carry an "audience" profile (self-reported demo data) — use it when it is
there. When it is absent, infer audience fit from topics, titles, language and location, and never state demographics
as fact. Never invent metrics, past sponsors or facts not in the input.`;

export function buildMatchPrompt(brief, pool) {
  const b = {
    business: brief.businessName, industry: brief.industry, goal: brief.goal, product: brief.product,
    targetAge: brief.ageRange, locations: brief.locations, interests: brief.interests,
    language: brief.language, kpi: brief.kpi, positioning: brief.positioning, mustAvoid: brief.avoid,
  };
  const cs = pool.map((c) => ({
    id: c.id, niche: c.niche, location: c.location, subscribers: c.subscribers,
    ...(c.bio ? { bio: c.bio } : {}),
    ...(c.audience?.age ? { audience: c.audience } : {}),
    ...(c.workedWith?.length ? { pastSponsorCategories: c.workedWith } : {}),
    // Derived by the data layer (src/lib/metrics.js) from real YouTube stats, if available.
    ...(c.metrics ? {
      metrics: {
        medianViews: c.metrics.medianViews, engagementRatePct: c.metrics.engagementRate,
        postsLast30Days: c.metrics.postsLast.d30, daysSinceLastPost: c.metrics.daysSinceLastPost,
        dataWarnings: c.metrics.warnings,
      },
    } : {}),
    recentVideos: c.recentVideos.map((v, i) => ({
      index: i, title: v.title, views: v.views, daysAgo: v.days,
      ...(v.description ? { description: v.description } : {}),
      ...(v.tags?.length ? { tags: v.tags } : {}),
    })),
  }));

  return `CAMPAIGN BRIEF
${JSON.stringify(b, null, 2)}

CANDIDATE CREATORS
${JSON.stringify(cs, null, 2)}

For EVERY creator return:
- contentFit (0-100): how closely their RECENT videos match the product, category and positioning.
  Recent content matters more than the niche label. Content that conflicts with "mustAvoid" is a strong penalty.
- audienceFit (0-100): likely overlap with the target audience, INFERRED from topics, language and location.
  Be conservative (stay near 50-75) when the evidence is thin.
- reasons: 2-3 short sentences (≤15 words) for a busy business owner. At least one cites a specific video title.
- riskFlags: brand-safety or mustAvoid concerns seen in recent videos (empty array if none).
- videoFits: 0-100 topic fit for EACH recentVideos index.
If a creator has "metrics", they were computed by code from real data — use them as context, don't recompute them.
If it has "dataWarnings", lower your confidence and say so in a reason.
Calibration: 90+ obvious fit · 75-89 good · 60-74 possible with caveats · <60 weak.
Return all ${cs.length} creators with their exact ids.`;
}

// Engagement rate (%) from REAL stats when we have them, else the profile number.
export function engagementRate(creator) {
  if (creator.metrics?.engagementRate != null) return { rate: creator.metrics.engagementRate, source: "youtube" };
  const vids = (creator.recentVideos || []).filter((v) => v.views > 0 && (v.likes != null || v.comments != null));
  if (vids.length) {
    const views = vids.reduce((s, v) => s + v.views, 0);
    const inter = vids.reduce((s, v) => s + (v.likes || 0) + (v.comments || 0), 0);
    return { rate: +((inter / views) * 100).toFixed(1), source: "youtube" };
  }
  return { rate: creator.engagement ?? null, source: "profile" };
}

// 0% → 0, 8%+ → 100 (8% is a very strong YouTube engagement rate).
const engagementScore = (rate) => (rate == null ? 50 : Math.round(Math.min(100, (rate / 8) * 100)));

// Deterministic final score from Gemini's sub-scores + code-computed engagement.
export function combineScore(ai, creator, brief) {
  const eng = engagementRate(creator);
  const breakdown = {
    contentFit: ai.contentFit,
    audienceFit: ai.audienceFit,
    engagement: engagementScore(eng.rate),
    engagementRate: eng.rate,
    engagementSource: eng.source,
  };
  let fit = WEIGHTS.content * ai.contentFit + WEIGHTS.audience * ai.audienceFit + WEIGHTS.engagement * breakdown.engagement;

  // The UI shows the first 3 reasons, so warnings go right after the headline reason.
  const warnings = (ai.riskFlags || []).map((r) => `⚠ ${r}`);
  if (brief.tier && brief.tier !== "Any" && brief.tier !== creator.tier) {
    fit -= TIER_MISMATCH_PENALTY;
    warnings.push(`Is ${creator.tier}, but you asked for ${brief.tier}`);
  }
  const reasons = [ai.reasons[0], ...warnings, ...ai.reasons.slice(1)].filter(Boolean);

  const vf = new Map((ai.videoFits || []).map((v) => [v.index, v.fit]));
  const matchedVideos = creator.recentVideos
    .map((v, i) => ({ title: v.title, views: v.views, days: v.days, url: v.url, fit: vf.get(i) ?? 0 }))
    .sort((a, b) => b.fit - a.fit)
    .slice(0, 2);

  return {
    fit: Math.max(0, Math.min(100, Math.round(fit))),
    breakdown,
    reasons: reasons.slice(0, 4),
    riskFlags: ai.riskFlags || [],
    matchedVideos,
  };
}
