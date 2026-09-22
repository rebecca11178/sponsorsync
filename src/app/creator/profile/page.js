"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCreator, creatorProfileId } from "@/lib/mockData";
import { compact, usd, scoreTone } from "@/lib/format";
import { loadAllOverrides, mergePricing, saveCreatorPricing } from "@/lib/pricing";
import Avatar from "@/components/Avatar";

const RATE_FIELDS = [
  { key: "integratedVideo", label: "Integrated video", note: "60–90s brand mention" },
  { key: "dedicatedVideo", label: "Dedicated video", note: "Full dedicated review" },
  { key: "short", label: "YouTube Short", note: "One vertical Short" },
];
const RIGHTS_FIELDS = [
  { key: "whitelisting", label: "Ad whitelisting", note: "Brand can boost as an ad" },
  { key: "usageExtension", label: "Usage extension", note: "Reuse footage 6 months" },
  { key: "exclusivity", label: "Category exclusivity", note: "No competitor for 60 days" },
];

export default function CreatorProfile() {
  const me = getCreator(creatorProfileId);
  const safety = scoreTone(me.brandSafety);

  const [rates, setRates] = useState(me.rates);
  const [rights, setRights] = useState(me.commercialRights);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load any prices this creator previously saved (persisted per browser).
  useEffect(() => {
    const merged = mergePricing(me, loadAllOverrides());
    setRates(merged.rates);
    setRights(merged.commercialRights);
  }, [me]);

  const setRate = (k) => (e) => setRates((r) => ({ ...r, [k]: Number(e.target.value) }));
  const setRight = (k) => (e) => setRights((r) => ({ ...r, [k]: Number(e.target.value) }));

  function save() {
    saveCreatorPricing(me.id, { rates, commercialRights: rights });
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">My profile &amp; pricing</h1>
        <Link href="/creator" className="text-sm text-muted hover:text-foreground">← Inbox</Link>
      </div>
      <p className="mt-1 text-sm text-muted">Set your rates here — this is exactly what verified brands see when they view your profile.</p>

      {/* Header card */}
      <div className="mt-6 flex flex-wrap items-start gap-4 rounded-2xl border border-border bg-surface p-6">
        <Avatar name={me.name} size={64} />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">{me.name}</h2>
            {me.verified && <span className="rounded bg-success-soft px-1.5 py-0.5 text-[10px] font-semibold text-success" title="YouTube channel ownership confirmed">✓ Channel verified</span>}
          </div>
          <p className="text-sm text-muted">{me.handle} · {me.niche} · {me.location}</p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
            <span><span className="font-medium text-foreground">{compact(me.subscribers)}</span> subscribers</span>
            <span><span className="font-medium text-foreground">{compact(me.avgViews)}</span> avg views</span>
            <span><span className="font-medium text-foreground">{me.engagement}%</span> engagement</span>
          </div>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${safety.bg} ${safety.text}`}>Brand safety {me.brandSafety}</span>
      </div>

      {/* Pricing card */}
      <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Rate card</h2>
          <div className="flex items-center gap-3">
            {saved && <span className="text-sm font-medium text-success">✓ Saved</span>}
            {editing ? (
              <button onClick={save} className="rounded-lg bg-brand px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark">Save prices</button>
            ) : (
              <button onClick={() => setEditing(true)} className="rounded-lg border border-border px-4 py-1.5 text-sm font-medium hover:bg-background">Edit prices</button>
            )}
          </div>
        </div>

        <div className="mt-5 grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Content types</p>
            <div className="mt-2 space-y-3 text-sm">
              {RATE_FIELDS.map((r) => (
                <PriceRow key={r.key} label={r.label} note={r.note} value={rates[r.key]} editing={editing} onChange={setRate(r.key)} />
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Commercial rights (add-ons)</p>
            <div className="mt-2 space-y-3 text-sm">
              {RIGHTS_FIELDS.map((r) => (
                <PriceRow key={r.key} label={r.label} note={r.note} value={rights[r.key]} editing={editing} onChange={setRight(r.key)} prefix="+" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent videos */}
      <div className="mt-6 rounded-2xl border border-border bg-surface p-6">
        <h2 className="font-semibold">Recent videos</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {me.recentVideos.map((v) => (
            <li key={v.title} className="flex items-center gap-3">
              <div className="h-10 w-16 shrink-0 rounded bg-background" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{v.title}</p>
                <p className="text-xs text-muted">{compact(v.views)} views · {v.days}d ago</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function PriceRow({ label, note, value, editing, onChange, prefix = "" }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span>
        <span className="font-medium">{label}</span>
        <span className="block text-xs text-muted">{note}</span>
      </span>
      {editing ? (
        <span className="flex items-center gap-1">
          <span className="text-muted">{prefix}$</span>
          <input type="number" value={value} onChange={onChange}
            className="w-28 rounded-lg border border-border bg-background px-3 py-1.5 text-right text-sm outline-none focus:border-brand" />
        </span>
      ) : (
        <span className="font-semibold">{prefix}{usd(value)}</span>
      )}
    </div>
  );
}
