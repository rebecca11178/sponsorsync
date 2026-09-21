// ---------------------------------------------------------------------------
// Simple NON-AI baseline for evaluation: keyword overlap + engagement.
// Purpose: answer "is Gemini actually better than a simple rule?"
// (The old heuristic in /api/match can't be the baseline for real creators —
//  it relies on hand-typed `fit` numbers that only exist in mock data.)
// No imports on purpose — runnable from plain Node.
// ---------------------------------------------------------------------------
const STOP = new Set("with that this from your their have will about into more most very just like what when where which them they".split(" "));

export function tokens(text = "") {
  return new Set(
    text.toLowerCase().replace(/[^a-z0-9\s&-]/g, " ").split(/[\s&-]+/).filter((w) => w.length > 3 && !STOP.has(w))
  );
}

export function keywordBaseline(brief, creator) {
  const want = tokens([brief.product, brief.industry, brief.interests, brief.positioning].filter(Boolean).join(" "));
  const vids = creator.recentVideos || [];
  const hits = vids.map((v) => {
    const have = tokens([v.title, v.description, ...(v.tags || [])].join(" "));
    return [...want].filter((w) => have.has(w)).length;
  });
  const contentScore = vids.length ? Math.round((hits.filter((h) => h > 0).length / vids.length) * 100) : 0;
  const eng = creator.metrics?.engagementRate ?? creator.engagement ?? null;
  const engagementScore = eng == null ? 50 : Math.round(Math.min(100, (eng / 8) * 100));
  return { fit: Math.round(0.7 * contentScore + 0.3 * engagementScore), contentScore, engagementScore };
}
