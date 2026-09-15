import { NextResponse } from "next/server";

// POST /api/optimize-brief
// Body: { product, audience, budget, duration, kpi, notes }
// Returns: { optimized: string }
//
// TODO(llm): call Gemini to rewrite the sponsor's rough notes into a tight,
// creator-ready brief. Example wiring:
//
//   import { GoogleGenerativeAI } from "@google/generative-ai";
//   const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
//   const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
//   const prompt = `Rewrite this into a clear campaign brief for a YouTube
//     creator. Product: ${product}. Audience: ${audience}. KPI: ${kpi}.
//     Notes: ${notes}`;
//   const out = await model.generateContent(prompt);
//   return NextResponse.json({ optimized: out.response.text() });

export async function POST(req) {
  const { product, audience, kpi } = await req.json();

  const optimized =
    `Campaign goal: drive ${kpi?.toLowerCase() || "results"} for ${product || "our product"}.\n` +
    `Audience: ${audience || "our core buyers"}.\n` +
    `Tone: authentic, first-person, show real use.\n` +
    `Must include: the "includes paid promotion" disclosure.\n` +
    `Avoid: unverified health/performance claims (e.g. "boosts metabolism").`;

  // Simulate latency so the demo feels real.
  await new Promise((r) => setTimeout(r, 500));
  return NextResponse.json({ optimized });
}
