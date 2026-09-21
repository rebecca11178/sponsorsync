"use client";

import { useState } from "react";
import Link from "next/link";
import { compact, usd, scoreTone, startingPrice, bestPackageWithin } from "@/lib/format";
import { loadAllOverrides, mergePricing } from "@/lib/pricing";
import Avatar from "@/components/Avatar";

const STEPS = ["Business", "Goal", "Audience", "Budget", "Brand", "Results"];

const GOALS = [
  { key: "purchase", label: "Purchase / sales", desc: "Someone buys your product, subscription or service", icon: "🛒" },
  { key: "leads", label: "Leads", desc: "A potential customer signs up or fills out a form", icon: "📝" },
  { key: "traffic", label: "Website traffic", desc: "Drive visits to a page on your site", icon: "🔗" },
  { key: "awareness", label: "Brand awareness", desc: "Reach a broad audience and get video views", icon: "📣" },
];

const inputCls =
  "mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand";

export default function MatchPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    businessName: "",
    website: "",
    industry: "Food & Beverage",
    goal: "purchase",
    product: "",
    ageRange: "25–34",
    locations: "United States",
    interests: "",
    language: "English",
    budget: 5000,
    perCreatorCap: "",
    window: "6–8 weeks",
    kpi: "Sales / conversions",
    targetRoas: "",
    positioning: "",
    avoid: "",
    tier: "Any",
    minSafety: 80,
  });
  const [optimizing, setOptimizing] = useState(false);
  const [matching, setMatching] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function optimizeBrief() {
    setOptimizing(true);
    try {
      const res = await fetch("/api/optimize-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setForm((f) => ({ ...f, positioning: data.optimized }));
    } finally {
      setOptimizing(false);
    }
  }

  async function runMatch() {
    setMatching(true);
    setResults(null);
    setError(false);
    setStep(5);
    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("request failed");
      const data = await res.json();
      // Never render a silent blank page: a response without a creators list is a failure.
      if (!Array.isArray(data?.creators)) throw new Error("malformed response");
      setResults(data);
    } catch {
      setError(true);
    } finally {
      setMatching(false);
    }
  }

  const next = () => setStep((s) => Math.min(s + 1, 5));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  // Client-side budget grouping so displayed prices honor creator-set overrides
  // and the same pricing rules as every other page (P0-3, P0-4).
  const groups = deriveGroups(form, results);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">AI creator match</h1>
      <p className="mt-1 text-sm text-muted">
        Tell us about your campaign — Gemini ranks best-fit creators. No Google Ads account needed.
      </p>

      {/* Stepper */}
      <ol className="mt-6 flex items-center gap-1">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center">
              <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-semibold ${
                i < step ? "bg-brand text-white" : i === step ? "bg-brand text-white ring-4 ring-brand-soft" : "bg-background text-muted border border-border"
              }`}>
                {i < step ? "✓" : i + 1}
              </span>
              <span className={`mt-1 hidden text-[10px] sm:block ${i === step ? "font-semibold text-foreground" : "text-muted"}`}>{label}</span>
            </div>
            {i < STEPS.length - 1 && <span className={`mx-1 h-0.5 flex-1 ${i < step ? "bg-brand" : "bg-border"}`} />}
          </li>
        ))}
      </ol>

      <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
        {/* STEP 1 — Business */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="font-semibold">Let&apos;s start with your business</h2>
            <label className="block">
              <span className="text-sm font-medium">Business name</span>
              <input value={form.businessName} onChange={set("businessName")} placeholder="BrightLeaf Tea Co." className={inputCls} />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Website</span>
              <input value={form.website} onChange={set("website")} placeholder="https://brightleaftea.co" className={inputCls} />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Industry</span>
              <select value={form.industry} onChange={set("industry")} className={inputCls}>
                {["Food & Beverage", "Beauty & Personal Care", "Fashion", "Consumer Electronics", "Health & Wellness", "Software / SaaS", "Home & Lifestyle", "Other"].map((x) => <option key={x}>{x}</option>)}
              </select>
            </label>
          </div>
        )}

        {/* STEP 2 — Goal */}
        {step === 1 && (
          <div className="space-y-3">
            <h2 className="font-semibold">What&apos;s your goal for this campaign?</h2>
            <p className="text-sm text-muted">Focus on the outcome most valuable to your business.</p>
            {GOALS.map((g) => (
              <button key={g.key} onClick={() => setForm((f) => ({ ...f, goal: g.key }))}
                className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left ${form.goal === g.key ? "border-brand bg-brand-soft" : "border-border hover:bg-background"}`}>
                <span className="text-xl">{g.icon}</span>
                <span className="flex-1">
                  <span className="block font-medium">{g.label}</span>
                  <span className="block text-xs text-muted">{g.desc}</span>
                </span>
                <span className={`grid h-5 w-5 place-items-center rounded-full border ${form.goal === g.key ? "border-brand" : "border-border"}`}>
                  {form.goal === g.key && <span className="h-2.5 w-2.5 rounded-full bg-brand" />}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* STEP 3 — Product & audience */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-semibold">Product &amp; audience</h2>
            <label className="block">
              <span className="text-sm font-medium">What are you promoting?</span>
              <input value={form.product} onChange={set("product")} placeholder="Cold-brew green tea, no added sugar" className={inputCls} />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium">Audience age</span>
                <select value={form.ageRange} onChange={set("ageRange")} className={inputCls}>
                  {["13–17", "18–24", "25–34", "35–44", "45–54", "55+"].map((x) => <option key={x}>{x}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium">Language</span>
                <select value={form.language} onChange={set("language")} className={inputCls}>
                  {["English", "Spanish", "Bilingual (EN/ES)", "Mandarin", "Other"].map((x) => <option key={x}>{x}</option>)}
                </select>
              </label>
            </div>
            <label className="block">
              <span className="text-sm font-medium">Locations</span>
              <input value={form.locations} onChange={set("locations")} placeholder="United States, Canada" className={inputCls} />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Audience interests</span>
              <input value={form.interests} onChange={set("interests")} placeholder="wellness, clean eating, fitness" className={inputCls} />
            </label>
          </div>
        )}

        {/* STEP 4 — Budget & timeline */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-semibold">Budget &amp; timeline</h2>
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium">Total budget (USD)</span>
                <input type="number" value={form.budget} onChange={set("budget")} className={inputCls} />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Per-creator cap (optional)</span>
                <input type="number" value={form.perCreatorCap} onChange={set("perCreatorCap")} placeholder="e.g. 3000" className={inputCls} />
              </label>
            </div>
            <label className="block">
              <span className="text-sm font-medium">Campaign window</span>
              <select value={form.window} onChange={set("window")} className={inputCls}>
                {["One-off drop", "2–3 weeks", "6–8 weeks", "Ongoing / always-on"].map((x) => <option key={x}>{x}</option>)}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium">Primary KPI</span>
                <select value={form.kpi} onChange={set("kpi")} className={inputCls}>
                  {["Sales / conversions", "New customers", "Website traffic", "Brand awareness", "New subscribers"].map((x) => <option key={x}>{x}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium">Target ROAS (optional)</span>
                <input value={form.targetRoas} onChange={set("targetRoas")} placeholder="e.g. 3x" className={inputCls} />
              </label>
            </div>
          </div>
        )}

        {/* STEP 5 — Brand voice & guardrails */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="font-semibold">Brand voice &amp; guardrails</h2>
            <label className="block">
              <span className="text-sm font-medium">Positioning &amp; tone</span>
              <textarea value={form.positioning} onChange={set("positioning")} rows={4}
                placeholder="Describe your brand voice and what must be covered…" className={`${inputCls} resize-none`} />
              <button type="button" onClick={optimizeBrief} disabled={optimizing}
                className="mt-2 text-xs font-medium text-brand hover:underline disabled:opacity-50">
                {optimizing ? "Optimizing…" : "✨ Improve this with Gemini"}
              </button>
            </label>
            <label className="block">
              <span className="text-sm font-medium">Content to avoid</span>
              <input value={form.avoid} onChange={set("avoid")} placeholder='e.g. no health claims like "boosts metabolism"' className={inputCls} />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium">Creator tier</span>
                <select value={form.tier} onChange={set("tier")} className={inputCls}>
                  {["Any", "Nano", "Micro", "Mid-tier"].map((x) => <option key={x}>{x}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium">Min. brand safety: {form.minSafety}</span>
                <input type="range" min={0} max={100} step={5} value={form.minSafety} onChange={set("minSafety")} className="mt-3 w-full" />
              </label>
            </div>
          </div>
        )}

        {/* STEP 6 — Results */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-semibold">Best-fit creators</h2>
              {results && <AnalysisBadge method={results.method} videoSource={results.videoSource} />}
            </div>

            {matching && <p className="py-10 text-center text-sm text-muted">Analyzing creators against your brief…</p>}

            {!matching && error && (
              <div className="rounded-xl border border-danger/30 bg-danger-soft/30 p-6 text-center">
                <p className="text-sm font-medium text-danger">Couldn&apos;t run the analysis.</p>
                <p className="mt-1 text-sm text-muted">The request failed — your answers are saved.</p>
                <button onClick={runMatch} className="mt-3 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">Retry</button>
              </div>
            )}

            {!matching && !error && groups && (
              <>
                {groups.missing.length > 0 && (
                  <p className="rounded-lg bg-background px-3 py-2 text-xs text-muted">
                    Scored on what you provided. For a sharper score, add: {groups.missing.join(", ")}.
                  </p>
                )}

                {groups.within.length > 0 ? (
                  groups.within.map((c) => <ResultCard key={c.id} c={c} />)
                ) : (
                  <div className="rounded-xl border border-border bg-background p-6 text-center">
                    <p className="text-sm font-medium">
                      No creator fits your {groups.cap === Infinity ? "budget" : usd(groups.cap)} cap.
                    </p>
                    <p className="mt-1 text-sm text-muted">Raise your budget or per-creator cap to see matches.</p>
                    <button onClick={() => setStep(3)} className="mt-3 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">Adjust budget</button>
                  </div>
                )}

                {groups.over.length > 0 && (
                  <div className="pt-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted">Over your budget</p>
                    <p className="mb-2 text-xs text-muted">Strong fits, but their cheapest package is above your cap.</p>
                    <div className="space-y-3 opacity-80">
                      {groups.over.map((c) => <ResultCard key={c.id} c={c} over />)}
                    </div>
                  </div>
                )}

                {groups.within.length === 0 && groups.over.length === 0 && (
                  <div className="rounded-xl border border-border bg-background p-6 text-center">
                    <p className="text-sm font-medium">No creators match your conditions.</p>
                    <p className="mt-1 text-sm text-muted">Try lowering the minimum brand-safety, or widening tier / industry.</p>
                    <button onClick={() => setStep(0)} className="mt-3 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-surface">Change conditions</button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer nav */}
      <div className="mt-5 flex items-center justify-between">
        <button onClick={back} disabled={step === 0} className="text-sm font-medium text-muted hover:text-foreground disabled:opacity-0">
          ← Back
        </button>
        {step < 4 && (
          <button onClick={next} className="rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">Next</button>
        )}
        {step === 4 && (
          <button onClick={runMatch} className="rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">Find my creators</button>
        )}
        {step === 5 && (
          <button onClick={() => setStep(0)} className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium hover:bg-background">Refine brief</button>
        )}
      </div>
    </div>
  );
}

// Split scored creators into within-budget vs over-budget using merged (creator-set)
// prices, and pick a recommended package for each. Per-creator cap and total
// budget are both enforced (whichever is tighter).
function deriveGroups(form, results) {
  if (!results?.creators) return null;
  const overrides = typeof window !== "undefined" ? loadAllOverrides() : {};
  const cap = Math.min(
    Number(form.perCreatorCap) > 0 ? Number(form.perCreatorCap) : Infinity,
    Number(form.budget) > 0 ? Number(form.budget) : Infinity
  );
  const within = [];
  const over = [];
  for (const c of results.creators) {
    const rates = mergePricing({ id: c.id, rates: c.rates }, overrides).rates;
    const from = startingPrice(rates);
    const rec = bestPackageWithin(rates, cap);
    const item = { ...c, from, rec };
    if (from <= cap) within.push(item);
    else over.push(item);
  }
  return { within, over, missing: results.missing || [], cap };
}

// Risk level → label, text color, and marker position on the deep→light scale.
const RISK = {
  high: { label: "High", text: "text-danger", pos: 12 },
  medium: { label: "Medium", text: "text-warning", pos: 38 },
  "low-medium": { label: "Low–medium", text: "text-warning", pos: 63 },
  low: { label: "Low", text: "text-success", pos: 88 },
};
const RISK_GRADIENT = "linear-gradient(to right,#dc2626 0%,#ea580c 33%,#f59e0b 66%,#16a34a 100%)";
const DOT = { ok: "#16a34a", warn: "#d97706", fail: "#dc2626" };
const VET_STAGES = [
  "Fetching recent videos…",
  "Watching a recent video…",
  "Checking disclosure & claims…",
  "Assessing brand safety…",
  "Scoring the risk…",
];

function ResultCard({ c, over }) {
  const tone = scoreTone(c.fit);
  const [vet, setVet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(VET_STAGES[0]);

  async function evaluateRisk() {
    setLoading(true);
    setVet(null);
    setProgress(6);
    let s = 0;
    setStage(VET_STAGES[0]);
    const iv = setInterval(() => {
      setProgress((p) => Math.min(93, p + (p < 60 ? 4 : 2)));
      if (Math.random() < 0.4) { s = Math.min(VET_STAGES.length - 1, s + 1); setStage(VET_STAGES[s]); }
    }, 850);
    try {
      const res = await fetch("/api/vet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creatorId: c.id }),
      });
      setVet(await res.json());
    } catch {
      setVet({ error: true });
    } finally {
      clearInterval(iv);
      setProgress(100);
      setLoading(false);
    }
  }

  const risk = vet && !vet.error ? RISK[vet.risk] || RISK.medium : null;

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center gap-3">
        <Avatar name={c.name} size={48} />
        <div className="flex-1">
          <Link href={`/creators/${c.id}`} className="font-semibold hover:underline">{c.name}</Link>
          <p className="text-xs text-muted">{compact(c.subscribers)} subs · from {usd(c.from)}</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-sm font-semibold ${tone.bg} ${tone.text}`}>{c.fit}</span>
      </div>
      {c.rec ? (
        <p className="mt-3 text-sm"><span className="font-medium">Recommended:</span> {c.rec.label} — {usd(c.rec.price)}</p>
      ) : over ? (
        <p className="mt-3 text-sm text-danger">Cheapest package {usd(c.from)} is above your cap</p>
      ) : null}
      <ul className="mt-2 space-y-1 text-sm text-muted">
        {c.reasons.slice(0, 3).map((r, i) => <li key={i}>• {r}</li>)}
      </ul>
      {c.matchedVideos?.length > 0 && (
        <p className="mt-2 text-xs text-muted">Top matched video: &ldquo;{c.matchedVideos[0].title}&rdquo; (fit {c.matchedVideos[0].fit})</p>
      )}

      {/* Brand-safety risk — on demand (Gemini watches a video, ~1 min) */}
      <div className="mt-4 border-t border-border pt-3">
        {!vet && !loading && (
          <div>
            <button
              onClick={evaluateRisk}
              className="w-full rounded-lg border border-brand bg-brand-soft px-4 py-2 text-sm font-semibold text-brand hover:bg-brand-soft/70"
            >
              Evaluate brand-safety risk
            </button>
            <p className="mt-1.5 text-center text-[11px] text-muted">AI review by Gemini · watches a recent video (~1 min)</p>
          </div>
        )}

        {loading && (
          <div>
            <div className="flex items-center justify-between text-xs text-muted">
              <span>{stage}</span>
              <span>{progress}%</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-background">
              <div className="h-full rounded-full bg-brand transition-[width] duration-700 ease-out" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-1.5 text-[11px] text-muted">Gemini is reviewing a recent video — about a minute.</p>
          </div>
        )}

        {vet && !vet.error && (
          <div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-semibold">
                Brand-safety risk
                <span className="rounded-full bg-brand-soft px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-brand">Gemini</span>
              </span>
              <span className={`text-xs font-semibold uppercase tracking-wide ${risk.text}`}>{risk.label} risk</span>
            </div>

            {/* Deep→light severity scale with a marker at this creator's level */}
            <div className="relative mt-2 h-1.5 rounded-full" style={{ background: RISK_GRADIENT }}>
              <span
                className="absolute -top-1 h-3.5 w-1 rounded-full bg-foreground ring-2 ring-surface"
                style={{ left: `${risk.pos}%`, transform: "translateX(-50%)" }}
              />
            </div>
            <div className="mt-1 flex justify-between text-[10px] uppercase tracking-wide text-muted">
              <span>High</span>
              <span>Low</span>
            </div>

            {vet.summary && <p className="mt-3 text-xs leading-snug text-muted">{vet.summary}</p>}

            <ul className="mt-2.5 space-y-2">
              {vet.checks?.map((it, i) => (
                <li key={i} className="flex items-start gap-2 text-xs leading-snug">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: DOT[it.status] || DOT.warn }} />
                  <span>
                    <span className="font-medium text-foreground">{it.label}</span>
                    <span className="text-muted"> — {it.note}</span>
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-3 text-[10px] text-muted">
              {vet.source === "gemini"
                ? `Live analysis via Gemini${vet.video?.title ? ` · “${vet.video.title}”` : ""}.`
                : "Sample result — connect a real YouTube channel for a live check."}
            </p>
          </div>
        )}

        {vet?.error && (
          <div className="text-sm">
            <p className="text-danger">Couldn&apos;t run the risk check.</p>
            <button onClick={evaluateRisk} className="mt-1 font-medium text-brand hover:underline">Retry</button>
          </div>
        )}
      </div>
    </div>
  );
}

// Tells the user honestly where the scores came from (P0-1): real Gemini
// analysis, a partial result, or the rule-based fallback when AI is unavailable.
const ANALYSIS = {
  gemini: { cls: "bg-success-soft text-success", text: "Scored by Gemini · your brief + recent videos" },
  "gemini-shortlist": { cls: "bg-success-soft text-success", text: "Scored by Gemini · top 15 shortlist re-ranked on recent videos" },
  "gemini-partial": { cls: "bg-warning-soft text-warning", text: "Gemini scored most creators · rest use a rule-based estimate" },
  "baseline-fallback": { cls: "bg-warning-soft text-warning", text: "AI unavailable · showing a rule-based estimate" },
};

function AnalysisBadge({ method, videoSource }) {
  const a = ANALYSIS[method] || ANALYSIS["baseline-fallback"];
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${a.cls}`}>
      {a.text}{videoSource !== "youtube" ? " · sample video data" : ""}
    </span>
  );
}
