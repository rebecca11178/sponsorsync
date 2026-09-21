#!/usr/bin/env node
// ---------------------------------------------------------------------------
// Lightweight evaluation: does Gemini rank creators like a human would —
// and better than a simple keyword baseline?          Owner: data & evaluation
//
//   node --env-file=.env.local scripts/eval-match.mjs [eval/campaigns.json]
//
// For each campaign: fetch real YouTube data → metrics → score with
// (a) Gemini (production logic) and (b) keyword baseline → compare with labels.
// Metrics per method:
//   P@3        share of the top 3 that humans labelled "high"
//   low@3      how many "low" creators slipped into the top 3 (want 0)
//   Spearman   rank correlation between score and label (high=2, medium=1, low=0)
// Writes full results to eval/results-<timestamp>.json for further analysis.
// Small samples → treat numbers as directional, not proof.
// ---------------------------------------------------------------------------
import { readFileSync, writeFileSync } from "node:fs";
import { getRecentVideos } from "../src/lib/youtube.js";
import { computeMetrics, RECENT_N } from "../src/lib/metrics.js";
import { generateJSON } from "../src/lib/gemini.js";
import { MATCH_SCHEMA, MATCH_SYSTEM, buildMatchPrompt, combineScore } from "../src/lib/ai/match.js";
import { keywordBaseline } from "../src/lib/ai/baseline.js";

const file = process.argv[2] || "eval/campaigns.json";
const LABEL = { high: 2, medium: 1, low: 0 };

function ranks(xs) { // average ranks for ties
  const idx = xs.map((x, i) => [x, i]).sort((a, b) => a[0] - b[0]);
  const r = Array(xs.length);
  for (let i = 0; i < idx.length; ) {
    let j = i;
    while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++;
    for (let k = i; k <= j; k++) r[idx[k][1]] = (i + j) / 2 + 1;
    i = j + 1;
  }
  return r;
}
function spearman(a, b) {
  if (a.length < 3) return null;
  const ra = ranks(a), rb = ranks(b), n = a.length;
  const ma = ra.reduce((s, x) => s + x, 0) / n, mb = rb.reduce((s, x) => s + x, 0) / n;
  let num = 0, da = 0, db = 0;
  for (let i = 0; i < n; i++) { num += (ra[i] - ma) * (rb[i] - mb); da += (ra[i] - ma) ** 2; db += (rb[i] - mb) ** 2; }
  return da && db ? +(num / Math.sqrt(da * db)).toFixed(2) : null;
}
function score(rows, key) {
  const sorted = [...rows].sort((x, y) => y[key] - x[key]);
  const top = sorted.slice(0, 3);
  return {
    top3: top.map((r) => `${r.handle}(${r.label})`),
    "P@3": +(top.filter((r) => r.label === "high").length / Math.min(3, top.length)).toFixed(2),
    "low@3": top.filter((r) => r.label === "low").length,
    spearman: spearman(rows.map((r) => r[key]), rows.map((r) => LABEL[r.label])),
  };
}

const { campaigns } = JSON.parse(readFileSync(file, "utf8"));
const out = [];

for (const camp of campaigns) {
  console.log(`\n=== ${camp.id} ===`);
  const pool = [];
  for (const [handle, label] of Object.entries(camp.labels)) {
    if (!(label in LABEL)) { console.log(`  skip ${handle}: label must be high/medium/low`); continue; }
    try {
      const yt = await getRecentVideos(handle);
      const metrics = computeMetrics(yt);
      pool.push({ id: handle, handle, label, niche: "unknown", location: "unknown", tier: metrics.tier,
        subscribers: yt.subscribers, metrics, recentVideos: yt.videos.slice(0, RECENT_N) });
      console.log(`  ✓ ${handle} (${yt.videos.length} videos${metrics.warnings.length ? ", " + metrics.warnings.length + " data warning(s)" : ""})`);
    } catch (e) {
      console.log(`  ✗ ${handle}: ${e.message}`);
    }
  }
  if (pool.length < 3) { console.log("  need ≥3 creators with data — skipping"); continue; }

  const { data, error } = await generateJSON({ system: MATCH_SYSTEM, prompt: buildMatchPrompt(camp.brief, pool), schema: MATCH_SCHEMA });
  if (!data) { console.log(`  Gemini failed: ${error}`); continue; }
  const byId = new Map(data.results.map((r) => [r.id, r]));

  const rows = pool.map((c) => {
    const ai = byId.get(c.id);
    const g = ai ? combineScore(ai, c, camp.brief) : null;
    const b = keywordBaseline(camp.brief, c);
    return { handle: c.handle, label: c.label, gemini: g?.fit ?? -1, baseline: b.fit,
      breakdown: g?.breakdown, reasons: g?.reasons, metrics: c.metrics };
  });

  const result = { campaign: camp.id, n: rows.length, gemini: score(rows, "gemini"), baseline: score(rows, "baseline"), rows };
  console.table({ gemini: { ...result.gemini, top3: result.gemini.top3.join(" ") }, baseline: { ...result.baseline, top3: result.baseline.top3.join(" ") } });
  out.push(result);
}

const path = `eval/results-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
writeFileSync(path, JSON.stringify(out, null, 2));
console.log(`\nSaved ${path}`);
