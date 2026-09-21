#!/usr/bin/env node
// ---------------------------------------------------------------------------
// Quick end-to-end test of the REAL AI pipeline — no Next.js, no browser.
// Uses the exact same prompts/schemas/scoring as the API routes.
//
//   node --env-file=.env.local scripts/try-ai.mjs match @somehandle "cold brew green tea" "Food & Beverage"
//   node --env-file=.env.local scripts/try-ai.mjs review https://www.youtube.com/watch?v=XXXXXXXXXXX
//   node --env-file=.env.local scripts/try-ai.mjs deal d3
//
// (Node 20.6+ for --env-file.)  Prints each step so you can see where it breaks.
// ---------------------------------------------------------------------------
import { getRecentVideos, getVideoDetails, parseVideoId } from "../src/lib/youtube.js";
import { generateJSON } from "../src/lib/gemini.js";
import { MATCH_SCHEMA, MATCH_SYSTEM, buildMatchPrompt, combineScore } from "../src/lib/ai/match.js";
import { ORDER_SCHEMA, ORDER_SYSTEM, orderPrompt, verdictOf } from "../src/lib/ai/review.js";
import { getDeal, getCreator } from "../src/lib/mockData.js";
import { computeMetrics, RECENT_N } from "../src/lib/metrics.js";
import { VET_SCHEMA, VET_SYSTEM, vetPrompt, riskOf } from "../src/lib/ai/vet.js";
import { SUMMARIZE_SCHEMA, SUMMARIZE_SYSTEM, summarizePrompt, CONTRACT_SCHEMA, CONTRACT_SYSTEM, contractPrompt } from "../src/lib/ai/deal.js";

const [mode, arg, product = "cold brew green tea", industry = "Food & Beverage"] = process.argv.slice(2);
const step = (n, msg) => console.log(`\n\x1b[36m[${n}]\x1b[0m ${msg}`);
const fail = (msg) => { console.error(`\x1b[31m✗ ${msg}\x1b[0m`); process.exit(1); };

step(0, "Checking keys");
console.log("  GEMINI_API_KEY :", process.env.GEMINI_API_KEY ? "set" : "MISSING");
console.log("  YOUTUBE_API_KEY:", process.env.YOUTUBE_API_KEY ? "set" : "MISSING");
console.log("  GEMINI_MODEL   :", process.env.GEMINI_MODEL || "(default gemini-flash-latest)");
if (!process.env.GEMINI_API_KEY || !process.env.YOUTUBE_API_KEY) fail("Add both keys to .env.local");

if (mode === "match") {
  if (!arg) fail('Usage: match @handle "product" "industry"');

  step(1, `YouTube: latest videos for ${arg}`);
  const yt = await getRecentVideos(arg).catch((e) => fail(e.message));
  if (!yt.videos.length) fail("Channel found but no uploads");
  const videos = yt.videos.slice(0, RECENT_N);
  console.log(`  ${yt.subscribers.toLocaleString()} subscribers · ${yt.videos.length} uploads fetched`);
  videos.forEach((v, i) => console.log(`  ${i}. ${v.title}  (${v.views.toLocaleString()} views, ${v.days}d ago)`));

  step("1b", "Data layer: derived metrics");
  const metrics = computeMetrics(yt);
  console.log(JSON.stringify(metrics, null, 2).replace(/^/gm, "  "));

  const creator = { id: "test", name: arg, niche: "unknown", location: "unknown", tier: metrics.tier, subscribers: yt.subscribers, metrics, recentVideos: videos };
  const brief = {
    industry, product, goal: "purchase", kpi: "Sales / conversions", ageRange: "25–34",
    locations: "United States", language: "English", positioning: "authentic, first-person",
    avoid: "health or medical claims", tier: "Any",
  };

  step(2, "Gemini: scoring against the brief");
  const t = Date.now();
  const { data, error, model } = await generateJSON({ system: MATCH_SYSTEM, prompt: buildMatchPrompt(brief, [creator]), schema: MATCH_SCHEMA });
  if (!data) fail(`Gemini failed: ${error}`);
  console.log(`  model ${model} · ${((Date.now() - t) / 1000).toFixed(1)}s`);
  const ai = data.results?.[0];
  if (!ai) fail("Gemini returned no result for the creator:\n" + JSON.stringify(data, null, 2));

  step(3, "Final result (code blends the score)");
  console.log(JSON.stringify(combineScore(ai, creator, brief), null, 2));
} else if (mode === "review") {
  const id = parseVideoId(arg || "");
  if (!id) fail("Usage: review <public YouTube URL>");
  const url = `https://www.youtube.com/watch?v=${id}`;

  step(1, "YouTube: video metadata (platform checks)");
  const v = await getVideoDetails(id).catch((e) => fail(e.message));
  if (!v) fail("Video not found / not visible");
  console.log(`  "${v.title}" · ${v.privacyStatus} · paid promotion: ${v.hasPaidPromotion ?? "not reported"} · age-restricted: ${v.ageRestricted}`);

  const deal = getDeal("d1");
  step(2, `Gemini: watching the video against deal ${deal.id} terms (can take ~30-60s)`);
  const t = Date.now();
  const { data, error, model } = await generateJSON({
    system: ORDER_SYSTEM, prompt: orderPrompt(deal, getCreator(deal.creatorId), deal.terms),
    schema: ORDER_SCHEMA, videoUrl: url, timeoutMs: 120_000,
  });
  if (!data) fail(`Gemini failed: ${error}`);
  console.log(`  model ${model} · ${((Date.now() - t) / 1000).toFixed(1)}s`);

  step(3, `Verdict: ${verdictOf(data.checks)}`);
  for (const c of data.checks) console.log(`  [${c.status.toUpperCase()}] ${c.label}\n         ${c.note}`);
} else if (mode === "full") {
  const id = parseVideoId(arg || "");
  if (!id) fail("Usage: full <public YouTube URL>");
  const url = `https://www.youtube.com/watch?v=${id}`;

  step(1, "YouTube: video metadata");
  const v = await getVideoDetails(id).catch((e) => fail(e.message));
  if (!v) fail("Video not found / not visible");
  console.log(`  "${v.title}" · ${v.privacyStatus} · paid-promotion flag: ${v.hasPaidPromotion ?? "not reported"}`);

  const rule = (t) => console.log(`\n\x1b[1m${"─".repeat(72)}\n  ${t}\n${"─".repeat(72)}\x1b[0m`);

  rule("BEFORE SIGNING — creator vetting (general FTC / YouTube standards)");
  const vet = await generateJSON({ system: VET_SYSTEM, prompt: vetPrompt(v), schema: VET_SCHEMA, videoUrl: url, timeoutMs: 120_000 });
  if (!vet.data) {
    console.log(`  (skipped — Gemini failed: ${vet.error})`);
  } else {
    console.log(`  Risk: ${riskOf(vet.data.checks).toUpperCase()} · sponsored content: ${vet.data.isSponsored ? "yes" : "no"} · ${vet.model}`);
    console.log(`  ${vet.data.summary}\n`);
    for (const c of vet.data.checks) console.log(`  [${c.status.toUpperCase()}] ${c.label}\n         ${c.note}`);
  }

  const deal = getDeal("d1");
  rule(`AFTER DELIVERY — order review against deal ${deal.id} (${deal.sponsor})`);
  console.log("  Agreed terms:");
  for (const t of deal.terms || []) console.log(`   · ${t.label}: ${t.value}`);
  console.log("");
  const rev = await generateJSON({
    system: ORDER_SYSTEM, prompt: orderPrompt(deal, getCreator(deal.creatorId), deal.terms),
    schema: ORDER_SCHEMA, videoUrl: url, timeoutMs: 120_000,
  });
  if (!rev.data) {
    console.log(`  (skipped — Gemini failed: ${rev.error})`);
  } else {
    console.log(`  Verdict: ${verdictOf(rev.data.checks).toUpperCase()} · ${rev.model}\n`);
    for (const c of rev.data.checks) console.log(`  [${c.status.toUpperCase()}] ${c.label}\n         ${c.note}`);
  }

  if (vet.data && rev.data) {
    rule("THE POINT");
    console.log("  Same creator, same video, two different questions:");
    console.log("   · Vetting asks whether this creator is safe to sponsor at all.");
    console.log("   · Order review asks whether THIS delivery matches what was agreed.");
    console.log("  Risks found in vetting become clauses in the contract — which the review then checks.");
  }
} else if (mode === "vet") {
  const id = parseVideoId(arg || "");
  if (!id) fail("Usage: vet <public YouTube URL>");
  const url = `https://www.youtube.com/watch?v=${id}`;

  step(1, "YouTube: video metadata");
  const v = await getVideoDetails(id).catch((e) => fail(e.message));
  if (!v) fail("Video not found / not visible");
  console.log(`  "${v.title}" · ${v.privacyStatus} · paid-promotion flag: ${v.hasPaidPromotion ?? "not reported"}`);

  step(2, "Gemini: screening this creator's brand-work for compliance risk");
  const t = Date.now();
  const { data, error, model } = await generateJSON({
    system: VET_SYSTEM, prompt: vetPrompt(v), schema: VET_SCHEMA, videoUrl: url, timeoutMs: 120_000,
  });
  if (!data) fail(`Gemini failed: ${error}`);
  console.log(`  model ${model} · ${((Date.now() - t) / 1000).toFixed(1)}s`);

  step(3, `Risk: ${riskOf(data.checks).toUpperCase()} · sponsored content: ${data.isSponsored ? "yes" : "no"}`);
  console.log(`  ${data.summary}\n`);
  for (const c of data.checks) console.log(`  [${c.status.toUpperCase()}] ${c.label}\n         ${c.note}`);
} else if (mode === "deal") {
  const deal = getDeal(arg || "d3"); // d3 is the deal that is still being negotiated
  if (!deal) fail("Usage: deal [dealId]  (d1 | d2 | d3)");
  const creator = getCreator(deal.creatorId);

  step(1, `Gemini: extracting agreed terms from ${deal.messages.length} chat messages`);
  const sum = await generateJSON({ system: SUMMARIZE_SYSTEM, prompt: summarizePrompt(deal.messages, deal), schema: SUMMARIZE_SCHEMA });
  if (!sum.data) fail(`Gemini failed: ${sum.error}`);
  for (const t of sum.data.terms) console.log(`  ${t.agreed ? "✓" : "○"} ${t.label}: ${t.value}`);
  if (sum.data.openQuestions?.length) console.log("  Open questions:", sum.data.openQuestions.join(" · "));

  step(2, "Gemini: drafting the contract from those terms");
  const con = await generateJSON({ system: CONTRACT_SYSTEM, prompt: contractPrompt(deal, creator, sum.data.terms), schema: CONTRACT_SCHEMA, timeoutMs: 90_000 });
  if (!con.data) fail(`Gemini failed: ${con.error}`);
  console.log(`  ${con.data.title}\n  ${con.data.parties}`);
  for (const c of con.data.clauses) console.log(`\n  ${c.heading}\n    ${c.body}`);
  if (con.data.flags?.length) console.log("\n  ⚠ Flags:", con.data.flags.join(" · "));
} else {
  fail("Mode must be 'match', 'review', 'vet', 'full' or 'deal'");
}
