import { NextResponse } from "next/server";
import { generateJSON } from "@/lib/gemini";
import { SUMMARIZE_SCHEMA, SUMMARIZE_SYSTEM, summarizePrompt } from "@/lib/ai/deal";

// POST /api/summarize
// Body: { messages: [{ from, text, time }], dealId? }
// Returns: { terms: [{ label, value, agreed }], openQuestions: string[], source }
//
// Gemini reads the chat and extracts the agreed terms. These same terms are what
// /api/contract drafts from and what /api/review checks the delivered video
// against — one structured object, three features.

// Fallback if Gemini is unavailable: the original fixed extraction.
function mockTerms(messages) {
  const joined = messages.map((m) => m.text).join(" ").toLowerCase();
  const hasBoost = joined.includes("boost") || joined.includes("ad");
  return [
    { label: "Deliverable", value: "1 dedicated review video", agreed: true },
    { label: "Base price", value: "$2,500", agreed: true },
    { label: "Add-on", value: hasBoost ? "Ad whitelisting +$800" : "None", agreed: true },
    { label: "Timeline", value: "~3 weeks to delivery", agreed: true },
    { label: "Creative control", value: "Creator keeps intro", agreed: true },
    { label: "Restrictions", value: "No health claims (e.g. 'boosts metabolism')", agreed: true },
    { label: "Disclosure", value: "Paid promotion label required", agreed: true },
  ];
}

export async function POST(req) {
  const { messages = [] } = await req.json();

  if (!messages.length) {
    return NextResponse.json({ terms: [], openQuestions: ["No messages to summarize yet."], source: "empty" });
  }

  const { data, error } = await generateJSON({
    system: SUMMARIZE_SYSTEM,
    prompt: summarizePrompt(messages),
    schema: SUMMARIZE_SCHEMA,
  });

  if (!data?.terms?.length) {
    return NextResponse.json({ terms: mockTerms(messages), openQuestions: [], source: "mock", ...(error ? { debug: error } : {}) });
  }

  // De-duplicate labels (the chat panel keys rows by label).
  const seen = new Set();
  const terms = data.terms.filter((t) => !seen.has(t.label) && seen.add(t.label));
  return NextResponse.json({ terms, openQuestions: data.openQuestions || [], source: "gemini" });
}
