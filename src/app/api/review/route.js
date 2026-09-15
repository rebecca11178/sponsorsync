import { NextResponse } from "next/server";

// POST /api/review
// Body: { dealId, videoUrl }
// Returns: { platform: {verdict, checks[]}, order: {verdict, checks[]} }
//   verdict: "pass" | "warn" | "block"
//   check:   { status: "ok" | "warn" | "fail", label, note }
//
// TWO reviews run here:
//  1) platform — does the delivered video meet YouTube's paid-promotion /
//     policy rules so it can be shown. (Rules-based + metadata checks.)
//  2) order — Gemini reviews the CONTENT against the brief + contract terms
//     and flags legal/claim risks with fix suggestions.
//
// TODO(api): fetch video metadata + captions via YouTube Data API from videoUrl.
// TODO(llm): pass captions/frames + the deal's agreed terms to Gemini and ask
//     for a structured pass/warn/fail per criterion. Example:
//
//   const prompt = `You are reviewing a sponsored video against these terms:
//     ${JSON.stringify(terms)}. Transcript: ${captions}. For each term and for
//     brand-safety + legal claims, return {status, label, note}.`;

export async function POST(req) {
  await req.json(); // { dealId, videoUrl }

  const platform = {
    verdict: "pass",
    checks: [
      { status: "ok", label: "Paid-promotion disclosure present", note: "‘Includes paid promotion’ toggle detected." },
      { status: "ok", label: "No copyrighted music flags", note: "Audio cleared." },
      { status: "ok", label: "Community-guidelines safe", note: "No policy violations found." },
    ],
  };

  const order = {
    verdict: "warn",
    checks: [
      { status: "ok", label: "Product shown as briefed", note: "Cold-brew green tea featured for ~40s." },
      { status: "ok", label: "Brand voice matches", note: "First-person, authentic tone." },
      { status: "warn", label: "Possible unverified claim at 2:14", note: "Creator says ‘boosts your metabolism’ — brief prohibits health claims. Suggest re-record or cut." },
      { status: "warn", label: "Missing agreed CTA", note: "Contract terms include a discount code; not spoken. Suggest adding on-screen text." },
      { status: "ok", label: "Contract deliverables met", note: "Dedicated video + whitelisting rights granted." },
    ],
  };

  await new Promise((r) => setTimeout(r, 900));
  return NextResponse.json({ platform, order });
}
