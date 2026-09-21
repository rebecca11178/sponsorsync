// ---------------------------------------------------------------------------
// DATA LAYER — derived creator metrics.            Owner: data & evaluation
//
// Turns raw YouTube data into metrics the matching step can trust. This is a
// STARTER implementation: the contract (input → output shape) is what the API
// relies on; the formulas and thresholds inside are yours to refine.
//
// Input:  { subscribers, hiddenSubscriberCount, videos: [{ views, likes, comments, days, likesHidden }] }
//         videos newest first (youtube.js already sorts them).
// Output: see the returned object at the bottom. Everything is null-safe:
//         when a number can't be computed reliably it is null + a warning,
//         never a guess.
// No imports on purpose — runnable from plain Node (scripts/*).
// ---------------------------------------------------------------------------

export const RECENT_N = 5; // "recent videos" window used for averages
const MIN_RELIABLE_SAMPLE = 3;

// Common influencer-marketing tiers by subscribers. Adjust if the team prefers.
export function tierOf(subscribers) {
  if (!subscribers) return null;
  if (subscribers < 10_000) return "Nano";
  if (subscribers < 100_000) return "Micro";
  if (subscribers < 500_000) return "Mid-tier";
  if (subscribers < 1_000_000) return "Macro";
  return "Mega";
}

const median = (xs) => {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
};

export function computeMetrics({ subscribers = 0, hiddenSubscriberCount = false, videos = [] }) {
  const warnings = [];
  const recent = videos.slice(0, RECENT_N);

  // Views — median is shown next to the mean because one viral video skews averages.
  const views = recent.map((v) => v.views).filter((n) => Number.isFinite(n));
  const avgViews = views.length ? Math.round(views.reduce((a, b) => a + b, 0) / views.length) : null;
  const medianViews = median(views);

  // Engagement = (likes + comments) / views, pooled over recent videos that expose likes.
  const withLikes = recent.filter((v) => !v.likesHidden && v.likes != null && v.views > 0);
  const engagementRate = withLikes.length
    ? +((withLikes.reduce((s, v) => s + v.likes + (v.comments || 0), 0) / withLikes.reduce((s, v) => s + v.views, 0)) * 100).toFixed(2)
    : null;
  if (recent.length && withLikes.length < recent.length) warnings.push(`Likes hidden on ${recent.length - withLikes.length} of ${recent.length} recent videos`);

  // Posting cadence. If every fetched video is inside a window, the count is a lower bound.
  const posts = (d) => videos.filter((v) => v.days <= d).length;
  const allInside = (d) => videos.length > 0 && videos.every((v) => v.days <= d);
  const postsLast = { d30: posts(30), d60: posts(60), d90: posts(90) };
  if (allInside(90)) warnings.push(`All ${videos.length} fetched videos are within 90 days — posting counts are lower bounds`);
  const daysSinceLastPost = videos.length ? videos[0].days : null;
  if (daysSinceLastPost != null && daysSinceLastPost > 60) warnings.push(`No upload in ${daysSinceLastPost} days`);

  // Reliability.
  if (recent.length < MIN_RELIABLE_SAMPLE) warnings.push(`Only ${recent.length} recent video(s) — metrics unreliable`);
  if (hiddenSubscriberCount) warnings.push("Subscriber count hidden — tier unknown");

  return {
    sampleSize: recent.length,
    avgViews,
    medianViews,
    viewsPerSubscriber: subscribers && medianViews != null ? +(medianViews / subscribers).toFixed(2) : null,
    engagementRate, // %
    postsLast,
    daysSinceLastPost,
    tier: hiddenSubscriberCount ? null : tierOf(subscribers),
    reliable: recent.length >= MIN_RELIABLE_SAMPLE && engagementRate != null,
    warnings,
  };
}
