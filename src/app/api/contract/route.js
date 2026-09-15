import { NextResponse } from "next/server";

// POST /api/contract
// Body: { dealId }
// Returns: { contract: { title, parties, clauses: [{ heading, body }] } }
//
// TODO(llm): generate the contract from the agreed terms (from /api/summarize)
// with Gemini, so the language always matches what the two sides actually agreed.
// Example:
//   const prompt = `Draft a short influencer sponsorship agreement from these
//     terms: ${JSON.stringify(terms)}. Include a multi-activation clause so the
//     brand can re-run future activations without re-papering. Return sections.`;
//
// The mock returns a realistic agreement including a MULTI-ACTIVATION clause —
// the "negotiate once, reuse" idea that removes mid-campaign contract friction.

export async function POST(req) {
  await req.json(); // { dealId }

  const contract = {
    title: "Creator Sponsorship Agreement",
    parties: "Godfather (“Brand”) and Lady Gaga / @ladygaga (“Creator”)",
    clauses: [
      { heading: "1. Deliverable", body: "One (1) dedicated review video (60–90s of branded content) published on the Creator’s primary YouTube channel." },
      { heading: "2. Fee", body: "US$2,500 base fee, plus US$800 for ad-whitelisting rights. Total: US$3,300, paid 50% on signing, 50% on publication." },
      { heading: "3. Timeline", body: "Draft delivered within 3 weeks of signing; publication within 5 business days of Brand approval." },
      { heading: "4. Creative control", body: "Creator retains full creative control over the video intro and style, provided the agreed talking points are covered." },
      { heading: "5. Compliance", body: "Creator will enable YouTube’s paid-promotion disclosure. No health or performance claims (e.g. “boosts metabolism”)." },
      { heading: "6. Ad rights", body: "Brand may run the video as a Creator Partnerships Boost ad for 90 days from publication." },
      { heading: "7. Multi-activation", body: "Both parties agree to up to two (2) further activations within 6 months at the same rate card, executable via a one-line addendum — no new contract required." },
    ],
  };

  await new Promise((r) => setTimeout(r, 800));
  return NextResponse.json({ contract });
}
