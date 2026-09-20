"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getCreator } from "@/lib/mockData";
import { compact, usd, scoreTone } from "@/lib/format";
import { loadAllOverrides, mergePricing } from "@/lib/pricing";
import Avatar from "@/components/Avatar";

const packages = [
  { key: "integratedVideo", label: "Integrated video", note: "60–90s brand mention in a normal video" },
  { key: "dedicatedVideo", label: "Dedicated video", note: "Full video dedicated to your product" },
  { key: "short", label: "YouTube Short", note: "One vertical Short" },
];

const rights = [
  { key: "whitelisting", label: "Ad whitelisting", note: "Boost the video as an ad (Creator Partnerships Boost)" },
  { key: "usageExtension", label: "Usage extension", note: "Reuse footage on your channels for 6 months" },
  { key: "exclusivity", label: "Category exclusivity", note: "They won't promote a competitor for 60 days" },
];

export default function CreatorDetail() {
  const { id } = useParams();
  const c = getCreator(id);
  const [pkg, setPkg] = useState("dedicatedVideo");
  const [selected, setSelected] = useState({});
  const [sent, setSent] = useState(false);
  const [pricing, setPricing] = useState({ rates: c?.rates, commercialRights: c?.commercialRights });

  // Reflect any prices the creator set on their profile (persisted per browser).
  useEffect(() => {
    if (c) setPricing(mergePricing(c, loadAllOverrides()));
  }, [c]);

  if (!c) return <div className="mx-auto max-w-3xl px-6 py-16">Creator not found.</div>;

  const rightsTotal = rights.reduce((sum, r) => (selected[r.key] ? sum + pricing.commercialRights[r.key] : sum), 0);
  const total = pricing.rates[pkg] + rightsTotal;
  const safety = scoreTone(c.brandSafety);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Link href="/creators" className="text-sm text-muted hover:text-foreground">← Back to creators</Link>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left: profile */}
        <div className="space-y-6">
          <div className="flex items-start gap-4 rounded-2xl border border-border bg-surface p-6">
            <Avatar name={c.name} size={64} />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold">{c.name}</h1>
                {c.verified && <span className="rounded bg-success-soft px-1.5 py-0.5 text-[10px] font-semibold text-success" title="YouTube channel ownership confirmed">✓ Channel verified</span>}
              </div>
              <p className="text-sm text-muted">{c.handle} · {c.niche} · {c.location}</p>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
                <span><span className="font-medium text-foreground">{compact(c.subscribers)}</span> subscribers</span>
                <span><span className="font-medium text-foreground">{compact(c.avgViews)}</span> avg views</span>
                <span><span className="font-medium text-foreground">{c.engagement}%</span> engagement</span>
              </div>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${safety.bg} ${safety.text}`}>Brand safety {c.brandSafety}</span>
          </div>

          {/* Recent videos with campaign-fit score */}
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="font-semibold">Recent videos & campaign fit</h2>
            <p className="mt-1 text-xs text-muted">
              Fit scores what they&apos;re posting <em>now</em> against your brief — catches content drift that channel-level matching misses.
              {" "}<span className="text-brand">TODO(llm): score with Gemini.</span>
            </p>
            <ul className="mt-4 space-y-3">
              {c.recentVideos.map((v) => {
                const tone = scoreTone(v.fit);
                return (
                  <li key={v.title} className="flex items-center gap-3">
                    <div className="h-10 w-16 shrink-0 rounded bg-background" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{v.title}</p>
                      <p className="text-xs text-muted">{compact(v.views)} views · {v.days}d ago</p>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${tone.bg} ${tone.text}`}>Fit {v.fit}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Right: pricing + enquiry */}
        <div className="lg:sticky lg:top-20 h-fit space-y-4 rounded-2xl border border-border bg-surface p-6">
          <h2 className="font-semibold">Build your package</h2>

          <div className="space-y-2">
            {packages.map((p) => (
              <button
                key={p.key}
                onClick={() => setPkg(p.key)}
                className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm ${
                  pkg === p.key ? "border-brand bg-brand-soft" : "border-border hover:bg-background"
                }`}
              >
                <span>
                  <span className="font-medium">{p.label}</span>
                  <span className="block text-xs text-muted">{p.note}</span>
                </span>
                <span className="font-semibold">{usd(pricing.rates[p.key])}</span>
              </button>
            ))}
          </div>

          <div className="border-t border-border pt-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Commercial rights (add-ons)</p>
            <div className="mt-2 space-y-2">
              {rights.map((r) => (
                <label key={r.key} className="flex cursor-pointer items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={!!selected[r.key]}
                    onChange={(e) => setSelected((s) => ({ ...s, [r.key]: e.target.checked }))}
                    className="mt-1"
                  />
                  <span className="flex-1">
                    <span className="flex justify-between">
                      <span className="font-medium">{r.label}</span>
                      <span>+{usd(pricing.commercialRights[r.key])}</span>
                    </span>
                    <span className="block text-xs text-muted">{r.note}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-3">
            <span className="text-sm text-muted">Total</span>
            <span className="text-xl font-semibold">{usd(total)}</span>
          </div>

          {sent ? (
            <div className="rounded-lg bg-success-soft/60 p-3 text-sm">
              <p className="font-medium text-success">✓ Enquiry sent</p>
              <Link href="/deals/d1" className="mt-2 inline-block font-medium text-brand hover:underline">
                Open chatroom →
              </Link>
            </div>
          ) : (
            <button
              onClick={() => setSent(true)}
              className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              Send enquiry
            </button>
          )}
          <p className="text-center text-xs text-muted">No charge until both sides agree in the chatroom.</p>
        </div>
      </div>
    </div>
  );
}
