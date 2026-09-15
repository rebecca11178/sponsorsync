"use client";

import { useState } from "react";
import Link from "next/link";
import { compact, usd, scoreTone } from "@/lib/format";
import Avatar from "@/components/Avatar";

export default function MatchPage() {
  const [form, setForm] = useState({
    product: "",
    audience: "",
    budget: 5000,
    duration: "6 weeks",
    kpi: "Sales / conversions",
    notes: "",
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
      setForm((f) => ({ ...f, notes: data.optimized }));
    } finally {
      setOptimizing(false);
    }
  }

  async function runMatch(e) {
    e.preventDefault();
    setMatching(true);
    setResults(null);
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

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">AI match</h1>
      <p className="mt-1 text-sm text-muted">
        Tell us about your campaign. Gemini ranks creators from the library by fit — no Google Ads account needed.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
        {/* Questionnaire */}
        <form onSubmit={runMatch} className="space-y-4 rounded-2xl border border-border bg-surface p-6">
          <Field label="What are you promoting?">
            <input value={form.product} onChange={set("product")} placeholder="Cold-brew green tea, no added sugar"
              className="input" />
          </Field>
          <Field label="Target audience">
            <input value={form.audience} onChange={set("audience")} placeholder="Health-conscious 25–40, US"
              className="input" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Budget (USD)">
              <input type="number" value={form.budget} onChange={set("budget")} className="input" />
            </Field>
            <Field label="Campaign window">
              <input value={form.duration} onChange={set("duration")} className="input" />
            </Field>
          </div>
          <Field label="Primary KPI">
            <select value={form.kpi} onChange={set("kpi")} className="input">
              <option>Sales / conversions</option>
              <option>Brand awareness</option>
              <option>Website traffic</option>
              <option>New subscribers / followers</option>
            </select>
          </Field>
          <Field label="Positioning & notes">
            <textarea value={form.notes} onChange={set("notes")} rows={4}
              placeholder="Describe your brand voice, must-haves, and anything creators should avoid…"
              className="input resize-none" />
            <button type="button" onClick={optimizeBrief} disabled={optimizing}
              className="mt-2 text-xs font-medium text-brand hover:underline disabled:opacity-50">
              {optimizing ? "Optimizing…" : "✨ Improve this with Gemini"}
            </button>
          </Field>
          <button disabled={matching} className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
            {matching ? "Matching…" : "Find my creators"}
          </button>
        </form>

        {/* Results */}
        <div className="space-y-3">
          {!results && !matching && (
            <div className="grid h-full place-items-center rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted">
              Fill in the brief and Gemini will rank your best-fit creators here.
            </div>
          )}
          {matching && (
            <div className="grid h-full place-items-center rounded-2xl border border-border bg-surface p-10 text-sm text-muted">
              Analyzing creators against your brief…
            </div>
          )}
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
      </div>

      <style>{`.input{margin-top:0.25rem;width:100%;border-radius:0.5rem;border:1px solid var(--border);background:var(--background);padding:0.5rem 0.75rem;font-size:0.875rem;outline:none}.input:focus{border-color:var(--brand)}`}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
