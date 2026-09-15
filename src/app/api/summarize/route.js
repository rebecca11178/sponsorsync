import { NextResponse } from "next/server";

// POST /api/summarize
// Body: { messages: [{ from, text, time }] }
// Returns: { terms: [{ label, value }] }
//
// TODO(llm): send the chat transcript to Gemini and ask it to extract the
// agreed deal terms as structured JSON. Example:
//
//   const prompt = `From this brand–creator chat, extract the agreed terms as
//     JSON with keys: deliverable, price, addOns, timeline, creativeControl,
//     restrictions. Chat:\n${messages.map(m => m.from+': '+m.text).join('\n')}`;
//   const out = await model.generateContent(prompt);
//   const terms = JSON.parse(out.response.text());
//
// The mock below returns a fixed, realistic extraction so the panel renders.

export async function POST(req) {
  const { messages = [] } = await req.json();

  // Trivial heuristic so the mock reacts a little to the conversation.
  const joined = messages.map((m) => m.text).join(" ").toLowerCase();
  const hasBoost = joined.includes("boost") || joined.includes("ad");

  const terms = [
    { label: "Deliverable", value: "1 dedicated review video" },
    { label: "Base price", value: "$2,500" },
    { label: "Add-on", value: hasBoost ? "Ad whitelisting +$800" : "None" },
    { label: "Timeline", value: "~3 weeks to delivery" },
    { label: "Creative control", value: "Creator keeps intro" },
    { label: "Restrictions", value: "No health claims (e.g. 'boosts metabolism')" },
    { label: "Disclosure", value: "Paid promotion label required" },
  ];

  await new Promise((r) => setTimeout(r, 600));
  return NextResponse.json({ terms });
}
