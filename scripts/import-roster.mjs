#!/usr/bin/env node
// ---------------------------------------------------------------------------
// Roster importer: data/creator-roster.xlsx  →  src/lib/creators.generated.js
//
//   node scripts/import-roster.mjs [path/to/roster.xlsx]
//
// The data team owns the spreadsheet; the app owns the field names. This script
// is the translation layer between them, so nobody has to hand-edit 50+ records:
// edit the sheet, re-run this, done.
//
// It also validates: missing fields, engagement out of range, rate ordering,
// duplicate handles, too few videos, tier vs. subscribers. Problems are printed;
// only hard errors stop the write.
// ---------------------------------------------------------------------------
import { readFileSync, writeFileSync } from "node:fs";
import * as XLSX from "xlsx";
import { tierOf } from "../src/lib/metrics.js";

const src = process.argv[2] || "data/creator-roster.xlsx";
const OUT = "src/lib/creators.generated.js";
// 真实频道来源，两个都可选，表格里的列优先：
//   1. Creators 表的 youtube_handle 列（组员维护）
//   2. data/youtube-handles.json（本地覆盖，重新导出表格也不会丢）
const OVERRIDES = "data/youtube-handles.json";

// Category → emoji shown next to the creator in the UI.
const EMOJI = {
  "Food & Beverage": "🍵", Cooking: "🍳", "Health & Lifestyle": "🧘", "Tech Reviews": "💻",
  "Parenting & Family": "👨‍👩‍👧", Fitness: "🏋️", Beauty: "💄", Fashion: "👗", Travel: "✈️",
  Gaming: "🎮", Finance: "💰", Home: "🏡", Education: "📚", Pets: "🐾", Auto: "🚗",
};

// Commercial rights aren't in the sheet — derive them from the dedicated rate so
// every creator has a sensible, non-identical add-on price card.
const rightsFor = (dedicated) => ({
  whitelisting: Math.round((dedicated * 0.32) / 50) * 50,
  usageExtension: Math.round((dedicated * 0.2) / 50) * 50,
  exclusivity: Math.round((dedicated * 0.6) / 50) * 50,
});

const list = (v) => String(v ?? "").split(/[;,]/).map((s) => s.trim()).filter(Boolean);
const num = (v) => (v === "" || v == null || Number.isNaN(Number(v)) ? null : Number(v));
const bool = (v) => String(v).trim().toUpperCase() === "TRUE" || v === true;

// A sheet here is: some intro rows, then a header row, then data. Find the header.
function table(wb, sheet, firstCol) {
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheet], { header: 1, blankrows: false, defval: "" });
  const h = rows.findIndex((r) => String(r[0]).trim() === firstCol);
  if (h < 0) throw new Error(`Sheet "${sheet}": no header row starting with "${firstCol}"`);
  const cols = rows[h].map((c) => String(c).trim());
  // Data ends at the first blank id or a footer/legend line (ids are slugs).
  const data = [];
  for (const r of rows.slice(h + 1)) {
    const id = String(r[0]).trim();
    if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) break;
    data.push(Object.fromEntries(cols.map((c, i) => [c, r[i] ?? ""])));
  }
  return data;
}

let overrides = {};
try {
  overrides = JSON.parse(readFileSync(OVERRIDES, "utf8"));
  delete overrides._readme;
} catch { /* 没有这个文件也正常 */ }

const wb = XLSX.read(readFileSync(src));
const rawCreators = table(wb, "Creators", "creator_id");
const rawVideos = table(wb, "RecentVideos", "creator_id");

const videosBy = new Map();
for (const v of rawVideos) {
  if (!videosBy.has(v.creator_id)) videosBy.set(v.creator_id, []);
  videosBy.get(v.creator_id).push({
    title: String(v.video_title).trim(),
    views: num(v.views) ?? 0,
    days: num(v.days_ago) ?? 0, // app-wide field name is `days`
    likes: num(v.likes),
    comments: num(v.comments),
    hadSponsor: bool(v.had_sponsor),
    tags: list(v.topic_tags),
  });
}

const problems = [];
const seenHandles = new Set();

const creators = rawCreators.map((r, i) => {
  const id = `c${i + 1}`; // stable app ids; deals/accounts reference c1, c2, c3…
  const where = `${r.creator_id || id}`;
  const subs = num(r.subscribers) ?? 0;
  const engRaw = num(r.engagement_rate);
  // The sheet stores a fraction (0.072); the app stores percent (7.2).
  const engagement = engRaw == null ? null : +(engRaw <= 1 ? engRaw * 100 : engRaw).toFixed(1);
  const rates = {
    integratedVideo: num(r.rate_integrated) ?? 0,
    dedicatedVideo: num(r.rate_dedicated) ?? 0,
    short: num(r.rate_short) ?? 0,
  };
  const videos = (videosBy.get(r.creator_id) || []).sort((a, b) => a.days - b.days);

  // ---- validation ----
  for (const f of ["name", "handle", "category", "tier"]) if (!String(r[f]).trim()) problems.push(`ERROR ${where}: missing ${f}`);
  if (!subs) problems.push(`ERROR ${where}: subscribers missing or 0`);
  if (engagement == null) problems.push(`ERROR ${where}: engagement_rate missing`);
  else if (engagement > 25) problems.push(`WARN  ${where}: engagement ${engagement}% is implausibly high`);
  if (seenHandles.has(r.handle)) problems.push(`ERROR ${where}: duplicate handle ${r.handle}`);
  seenHandles.add(r.handle);
  if (!(rates.short <= rates.integratedVideo && rates.integratedVideo <= rates.dedicatedVideo)) {
    problems.push(`WARN  ${where}: rates not ordered short ≤ integrated ≤ dedicated (${rates.short}/${rates.integratedVideo}/${rates.dedicatedVideo})`);
  }
  if (videos.length < 3) problems.push(`WARN  ${where}: only ${videos.length} recent video(s) — AI matching needs ≥3`);
  const expected = tierOf(subs);
  if (expected && r.tier && expected !== String(r.tier).trim()) {
    problems.push(`WARN  ${where}: tier "${r.tier}" but ${subs.toLocaleString()} subs ⇒ ${expected}`);
  }
  const safety = num(r.safety_score);
  if (safety == null || safety < 0 || safety > 100) problems.push(`ERROR ${where}: safety_score must be 0-100`);

  let ytHandle = String(r.youtube_handle || "").trim();
  if (!ytHandle && overrides[r.creator_id]) ytHandle = String(overrides[r.creator_id]).trim();
  if (ytHandle && !ytHandle.startsWith("@")) ytHandle = `@${ytHandle}`;

  const languages = list(r.languages);
  return {
    id,
    slug: r.creator_id,
    name: String(r.name).trim(),
    handle: String(r.handle).trim(),
    youtubeHandle: ytHandle,
    emoji: EMOJI[String(r.category).trim()] || "🎬",
    niche: String(r.category).trim(),
    location: [r.top_country, languages[0]].filter(Boolean).join(" · "),
    subscribers: subs,
    avgViews: num(r.avg_views) ?? 0,
    engagement,
    brandSafety: safety ?? 0,
    verified: bool(r.channel_verified),
    tier: String(r.tier).trim(),
    rates,
    commercialRights: rightsFor(rates.dedicatedVideo),
    // Demo-only profile data (the YouTube API does NOT expose audience demographics).
    audience: { age: String(r.audience_age).trim(), gender: String(r.audience_gender).trim(), country: String(r.top_country).trim() },
    bio: String(r.bio).trim(),
    languages,
    formatsOffered: list(r.formats_offered),
    uploadCadence: String(r.upload_cadence).trim(),
    avgLengthMin: num(r.avg_length_min),
    turnaroundDays: num(r.turnaround_days),
    workedWith: list(r.worked_with_categories),
    recentVideos: videos,
  };
});

const errors = problems.filter((p) => p.startsWith("ERROR"));
for (const p of problems) console.log(p);
const live = creators.filter((c) => c.youtubeHandle);
console.log(`\n${creators.length} creators · ${rawVideos.length} videos · ${errors.length} error(s), ${problems.length - errors.length} warning(s)`);
console.log(live.length
  ? `${live.length} bound to real YouTube channels: ${live.map((c) => `${c.name} → ${c.youtubeHandle}`).join(", ")}`
  : "0 bound to real channels (add a youtube_handle column, or data/youtube-handles.json)");
if (errors.length) {
  console.error("\nFix the errors above (or the rows will break the app) — nothing written.");
  process.exit(1);
}

writeFileSync(OUT, `// AUTO-GENERATED by scripts/import-roster.mjs — do not edit by hand.
// Source: ${src}  ·  Generated: ${new Date().toISOString().slice(0, 10)}
// Re-run \`node scripts/import-roster.mjs\` after editing the spreadsheet.
// All creators are fictional demo data. Audience fields are demo-only: the
// YouTube Data API does not expose audience demographics for other channels.
export const creators = ${JSON.stringify(creators, null, 2)};
`);
console.log(`Wrote ${OUT}`);
