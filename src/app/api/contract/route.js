import { NextResponse } from "next/server";
import { getDeal, getCreator } from "@/lib/mockData";
import { generateJSON } from "@/lib/gemini";
import { CONTRACT_SCHEMA, CONTRACT_SYSTEM, contractPrompt } from "@/lib/ai/deal";

// POST /api/contract
// Body: { dealId, terms? }   ← terms come from /api/summarize when the user
//                              just summarized the chat; otherwise deal.terms.
// Returns: { contract: { title, parties, clauses: [{ heading, body }], flags }, source }
//
// Gemini drafts from the agreed terms only; anything the parties never discussed
// is left as a visible [TO CONFIRM] blank instead of an invented number.

function mockContract(deal, creator) {
  return {
    title: "Creator Sponsorship Agreement",
    parties: `${deal?.sponsor || "Brand"} (“Brand”) and ${creator?.name || "Creator"} / ${creator?.handle || ""} (“Creator”)`,
    clauses: [
      { heading: "1. Deliverable", body: "One (1) dedicated review video (60–90s of branded content) published on the Creator’s primary YouTube channel." },
      { heading: "2. Fee", body: "US$2,500 base fee, plus US$800 for ad-whitelisting rights. Total: US$3,300, paid 50% on signing, 50% on publication." },
      { heading: "3. Timeline", body: "Draft delivered within 3 weeks of signing; publication within 5 business days of Brand approval." },
      { heading: "4. Creative control", body: "Creator retains full creative control over the video intro and style, provided the agreed talking points are covered." },
      { heading: "5. Compliance", body: "Creator will enable YouTube’s paid-promotion disclosure. No health or performance claims (e.g. “boosts metabolism”)." },
      { heading: "6. Ad rights", body: "Brand may run the video as a Creator Partnerships Boost ad for 90 days from publication." },
      { heading: "7. Multi-activation", body: "Both parties agree to up to two (2) further activations within 6 months at the same rate card, executable via a one-line addendum — no new contract required." },
    ],
    flags: [],
  };
}

export async function POST(req) {
  const { dealId, terms } = await req.json();
  const deal = getDeal(dealId);
  const creator = deal ? getCreator(deal.creatorId) : null;
  const agreedTerms = terms?.length ? terms : deal?.terms;

  const { data, error } = agreedTerms?.length
    ? await generateJSON({
        system: CONTRACT_SYSTEM,
        prompt: contractPrompt(deal, creator, agreedTerms),
        schema: CONTRACT_SCHEMA,
        timeoutMs: 60_000,
      })
    : { data: null, error: "no agreed terms — summarize the chat first" };

  if (!data?.clauses?.length) {
    return NextResponse.json({ contract: mockContract(deal, creator), source: "mock", ...(error ? { debug: error } : {}) });
  }
  return NextResponse.json({ contract: data, source: "gemini" });
}
