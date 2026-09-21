import { NextResponse } from "next/server";
import { getDeal, getCreator } from "@/lib/mockData";
import { generateJSON } from "@/lib/gemini";
import { getVideoDetails, parseVideoId, youtubeEnabled } from "@/lib/youtube";
import { ORDER_SCHEMA, ORDER_SYSTEM, orderPrompt, verdictOf } from "@/lib/ai/review";

// POST /api/review
// Body: { dealId, videoUrl }
// Returns: { platform: {verdict, checks[]}, order: {verdict, checks[]}, source: {platform, order} }
//   verdict: "pass" | "warn" | "block"
//   check:   { status: "ok" | "warn" | "fail", label, note }
//
// TWO reviews:
//  1) platform — RULES, not AI. Reads the video's metadata from the YouTube
//     Data API: is it live & public, is the "Includes paid promotion" toggle on,
//     is it age-restricted, etc. Deterministic = defensible.
//  2) order — GEMINI WATCHES THE VIDEO (public YouTube URL passed straight to
//     the model) and checks it against the deal's agreed terms + restrictions,
//     flagging claim/legal risk with timestamps and a suggested fix.
// Each half falls back to the mock independently, so the page never breaks.

// ---------------------------------------------------------------------------
// Mock fallbacks (the original demo output).
// ---------------------------------------------------------------------------
const MOCK_PLATFORM = {
  verdict: "pass",
  checks: [
    { status: "ok", label: "Paid-promotion disclosure present", note: "‘Includes paid promotion’ toggle detected." },
    { status: "ok", label: "No copyrighted music flags", note: "Audio cleared." },
    { status: "ok", label: "Community-guidelines safe", note: "No policy violations found." },
  ],
};
const MOCK_ORDER = {
  verdict: "warn",
  checks: [
    { status: "ok", label: "Product shown as briefed", note: "Cold-brew green tea featured for ~40s." },
    { status: "ok", label: "Brand voice matches", note: "First-person, authentic tone." },
    { status: "warn", label: "Possible unverified claim at 2:14", note: "Creator says ‘boosts your metabolism’ — brief prohibits health claims. Suggest re-record or cut." },
    { status: "warn", label: "Missing agreed CTA", note: "Contract terms include a discount code; not spoken. Suggest adding on-screen text." },
    { status: "ok", label: "Contract deliverables met", note: "Dedicated video + whitelisting rights granted." },
  ],
};

// ---------------------------------------------------------------------------
// 1) Platform compliance — deterministic, from YouTube metadata.
// ---------------------------------------------------------------------------
async function platformReview(videoId) {
  if (!videoId || !youtubeEnabled()) return null;
  let v;
  try {
    v = await getVideoDetails(videoId);
  } catch (err) {
    console.error("[review] YouTube failed:", err.message);
    return null;
  }

  if (!v) {
    const checks = [{ status: "fail", label: "Video not found", note: "The link is wrong, deleted or private — ask the creator for the published URL." }];
    return { verdict: "block", checks, video: null };
  }

  const checks = [];
  checks.push(v.privacyStatus === "public"
    ? { status: "ok", label: "Video is live and public", note: `Published ${v.days} day(s) ago · ${v.views.toLocaleString()} views.` }
    : { status: v.privacyStatus === "unlisted" ? "warn" : "fail", label: `Video is ${v.privacyStatus}`, note: "Sponsored deliverable should be public before approval." });

  if (v.hasPaidPromotion === true) {
    checks.push({ status: "ok", label: "Paid-promotion disclosure on", note: "YouTube ‘Includes paid promotion’ toggle is enabled." });
  } else {
    const textDisclosure = /#ad\b|#sponsored|sponsored by|paid promotion|in partnership with/i.test(v.fullDescription);
    checks.push(v.hasPaidPromotion === false
      ? { status: textDisclosure ? "warn" : "fail", label: "Paid-promotion toggle is OFF",
          note: textDisclosure ? "Description mentions sponsorship, but the YouTube toggle is required too." : "No disclosure found. Creator must enable ‘Includes paid promotion’ (FTC + YouTube policy)." }
      : { status: "warn", label: "Couldn't confirm paid-promotion toggle",
          note: textDisclosure ? "API didn't report the toggle; description does disclose sponsorship." : "API didn't report the toggle and the description has no disclosure — check manually." });
  }

  checks.push(v.ageRestricted
    ? { status: "fail", label: "Video is age-restricted", note: "Restricted videos can't be boosted as ads and reach far fewer viewers." }
    : { status: "ok", label: "Not age-restricted", note: "Eligible for normal distribution." });

  if (v.madeForKids) {
    checks.push({ status: "warn", label: "Marked ‘made for kids’", note: "Comments and personalised ads are off — affects boosting and engagement." });
  }
  if (v.regionBlocked.length) {
    checks.push({ status: "warn", label: "Region-blocked in some countries", note: `Blocked in: ${v.regionBlocked.slice(0, 8).join(", ")}${v.regionBlocked.length > 8 ? "…" : ""}.` });
  }

  return { verdict: verdictOf(checks), checks, video: v };
}

// ---------------------------------------------------------------------------
// 2) Order review — Gemini watches the video against the deal terms
//    (prompt + schema live in src/lib/ai/review.js).
// ---------------------------------------------------------------------------
async function orderReview(deal, videoUrl) {
  const creator = getCreator(deal.creatorId);
  const { data, error } = await generateJSON({
    system: ORDER_SYSTEM,
    prompt: orderPrompt(deal, creator, deal.terms),
    schema: ORDER_SCHEMA,
    videoUrl,
    timeoutMs: 90_000, // watching a video takes longer than text
  });
  if (!data?.checks?.length) return { result: null, error };
  const checks = data.checks.map(({ status, label, note }) => ({ status, label, note }));
  return { result: { verdict: verdictOf(checks), checks } };
}

// ---------------------------------------------------------------------------
export async function POST(req) {
  const { dealId, videoUrl = "" } = await req.json();
  const deal = getDeal(dealId);
  const videoId = parseVideoId(videoUrl);

  // No real video (e.g. the default "watch?v=demo") → full mock, clearly labelled.
  if (!deal || !videoId) {
    return NextResponse.json({
      platform: MOCK_PLATFORM, order: MOCK_ORDER,
      source: { platform: "mock", order: "mock" },
      debug: !deal ? "unknown dealId" : "no valid YouTube video id in videoUrl",
    });
  }

  const canonicalUrl = `https://www.youtube.com/watch?v=${videoId}`;

  // Run both reviews in parallel for speed. If YouTube says the video doesn't
  // exist, the Gemini result is discarded below.
  const [platform, order] = await Promise.all([
    platformReview(videoId),
    orderReview(deal, canonicalUrl),
  ]);

  const platformOut = platform ? { verdict: platform.verdict, checks: platform.checks } : MOCK_PLATFORM;
  const orderOut = platform && !platform.video
    ? { verdict: "block", checks: [{ status: "fail", label: "Nothing to review", note: "The video couldn't be found, so the content review was skipped." }] }
    : order.result || MOCK_ORDER;

  return NextResponse.json({
    platform: platformOut,
    order: orderOut,
    source: {
      platform: platform ? "youtube" : "mock",
      order: order.result ? "gemini" : "mock",
    },
    ...(order.error ? { debug: order.error } : {}),
  });
}
