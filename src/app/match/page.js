"use client";

import { useState } from "react";
import Link from "next/link";
import { compact, usd, scoreTone } from "@/lib/format";
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
    setStep(5);
    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setResults(data.matches);
    } finally {
      setMatching(false);
    }
  }

  const next = () => setStep((s) => Math.min(s + 1, 5));
  const back = () => setStep((s) => Math.max(s - 1, 0));

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
              <input value={form.businessName} onChange={set("businessName")} placeholder="Godfather" className={inputCls} />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Website</span>
              <input value={form.website} onChange={set("website")} placeholder="https://godfather.co" className={inputCls} />
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
          <div className="space-y-3">
            <h2 className="font-semibold">Your best-fit creators</h2>
            {matching && <p className="py-8 text-center text-sm text-muted">Analyzing creators against your brief…</p>}
            {results?.map((m) => {
              const tone = scoreTone(m.fit);
              return (
                <Link key={m.id} href={`/creators/${m.id}`} className="block rounded-2xl border border-border bg-surface p-5 hover:shadow-md">
                  <div className="flex items-center gap-3">
                    <Avatar name={m.name} size={48} />
                    <div className="flex-1">
                      <p className="font-semibold">{m.name}</p>
                      <p className="text-xs text-muted">{compact(m.subscribers)} subs · from {usd(m.rates.dedicatedVideo)}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-sm font-semibold ${tone.bg} ${tone.text}`}>{m.fit}</span>
                  </div>
                  <p className="mt-3 text-sm text-muted"><span className="font-medium text-foreground">Why:</span> {m.reason}</p>
                </Link>
              );
            })}
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
