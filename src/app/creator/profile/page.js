"use client";

import { useState } from "react";
import Link from "next/link";
import { getCreator, creatorProfileId } from "@/lib/mockData";
import { compact, usd, scoreTone } from "@/lib/format";
import Avatar from "@/components/Avatar";

export default function CreatorProfile() {
  const me = getCreator(creatorProfileId);
  const [rates, setRates] = useState(me.rates);
  const [editing, setEditing] = useState(false);
  const safety = scoreTone(me.brandSafety);

  const setRate = (k) => (e) => setRates((r) => ({ ...r, [k]: Number(e.target.value) }));

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">My profile</h1>
        <Link href="/creator" className="text-sm text-muted hover:text-foreground">← Inbox</Link>
      </div>

      {/* Header card */}
      <div className="mt-6 flex flex-wrap items-start gap-4 rounded-2xl border border-border bg-surface p-6">
        <Avatar name={me.name} size={64} />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">{me.name}</h2>
            {me.verified && <span className="rounded bg-success-soft px-1.5 py-0.5 text-[10px] font-semibold text-success">✓ Verified</span>}
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

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Editable rate card */}
        <div className="rounded-2xl border border-border bg-surface p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Rate card</h2>
            <button onClick={() => setEditing((v) => !v)} className="text-sm font-medium text-brand hover:underline">
              {editing ? "Done" : "Edit"}
            </button>
          </div>
          <div className="mt-4 space-y-3 text-sm">
            {[
              { key: "integratedVideo", label: "Integrated video" },
              { key: "dedicatedVideo", label: "Dedicated video" },
              { key: "short", label: "YouTube Short" },
            ].map((r) => (
              <div key={r.key} className="flex items-center justify-between">
                <span className="font-medium">{r.label}</span>
                {editing ? (
                  <span className="flex items-center gap-1">
                    <span className="text-muted">$</span>
                    <input type="number" value={rates[r.key]} onChange={setRate(r.key)}
                      className="w-28 rounded-lg border border-border bg-background px-3 py-1.5 text-right outline-none focus:border-brand" />
                  </span>
                ) : (
                  <span className="font-semibold">{usd(rates[r.key])}</span>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-border pt-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Commercial rights (add-ons)</p>
            <div className="mt-2 space-y-1.5 text-sm">
              <Row label="Ad whitelisting" v={me.commercialRights.whitelisting} />
              <Row label="Usage extension" v={me.commercialRights.usageExtension} />
              <Row label="Category exclusivity" v={me.commercialRights.exclusivity} />
            </div>
          </div>
        </div>

        {/* Recent videos */}
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="font-semibold">Recent videos</h2>
          <ul className="mt-4 space-y-3">
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
    </div>
  );
}

function Row({ label, v }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted">{label}</span>
      <span className="font-medium">+{usd(v)}</span>
    </div>
  );
}
