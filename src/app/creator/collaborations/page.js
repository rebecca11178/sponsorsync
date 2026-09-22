"use client";

import { useState } from "react";
import Link from "next/link";
import { deals, getCreator, creatorProfileId } from "@/lib/mockData";
import { compact, usd } from "@/lib/format";
import Avatar from "@/components/Avatar";
import StatusTimeline from "@/components/StatusTimeline";
import { XIcon } from "@/components/icons";

// Creator-side mirror of the sponsor Campaigns console. Shows every deal where
// this creator is the counterparty, across the same lifecycle statuses.
const STATUS = {
  draft: { label: "Draft", color: "#6b7280" },
  chatroom: { label: "In discussion", color: "#7c3aed" },
  contracted: { label: "Contracted", color: "#2563eb" },
  in_production: { label: "Filming", color: "#d97706" },
  in_review: { label: "Awaiting brand approval", color: "#ea580c" },
  completed: { label: "Completed", color: "#16a34a" },
  enquiry: { label: "Enquiry", color: "#6b7280" },
};

const FILTERS = [
  { key: "all", label: "All", match: () => true },
  { key: "active", label: "In progress", match: (d) => ["chatroom", "contracted", "in_production"].includes(d.status) },
  { key: "review", label: "In review", match: (d) => d.status === "in_review" },
  { key: "completed", label: "Completed", match: (d) => d.status === "completed" },
];

function Chip({ status }) {
  const s = STATUS[status] || STATUS.draft;
  return (
    <span className="inline-block rounded-full px-2.5 py-1 text-xs font-medium" style={{ color: s.color, background: s.color + "1a" }}>
      {s.label}
    </span>
  );
}

export default function CreatorCollaborations() {
  const me = getCreator(creatorProfileId);
  const [filter, setFilter] = useState("all");
  const [selId, setSelId] = useState(null);

  const mine = deals.filter((d) => d.creatorId === creatorProfileId);
  const sel = selId ? mine.find((d) => d.id === selId) : null;

  const earned = mine.filter((d) => d.status === "completed").reduce((s, d) => s + (d.amount || 0), 0);
  const booked = mine.filter((d) => ["contracted", "in_production", "in_review", "completed"].includes(d.status)).reduce((s, d) => s + (d.amount || 0), 0);
  const kpis = [
    { label: "Earned", value: usd(earned), sub: `${mine.filter((d) => d.status === "completed").length} paid & closed` },
    { label: "Booked value", value: usd(booked), sub: "signed & in flight" },
    { label: "In progress", value: mine.filter((d) => ["chatroom", "contracted", "in_production"].includes(d.status)).length, sub: "active now" },
    { label: "Awaiting approval", value: mine.filter((d) => d.status === "in_review").length, sub: "delivered, with the brand" },
  ];

  const rows = mine.filter(FILTERS.find((f) => f.key === filter).match);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Creator profile header */}
      <div className="rounded-2xl border border-border bg-surface p-5">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar name={me.name} size={52} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold">{me.name}</h1>
              {me.verified && (
                <span className="rounded bg-success-soft px-1.5 py-0.5 text-[10px] font-semibold text-success">Verified creator</span>
              )}
            </div>
            <p className="text-xs text-muted">{me.handle} · {compact(me.subscribers)} subscribers · {me.niche}</p>
          </div>
          <Link href="/creator/profile" className="text-sm font-medium text-brand hover:underline">View profile</Link>
        </div>
      </div>

      {/* KPI cards */}
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-xs uppercase tracking-wide text-muted">{k.label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">{k.value}</p>
            <p className="text-[11px] text-muted">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1">
          {FILTERS.map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${filter === f.key ? "bg-brand text-white" : "text-muted hover:bg-background"}`}>
              {f.label}
            </button>
          ))}
        </div>
        <Link href="/creator" className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground hover:bg-background">Go to inbox</Link>
      </div>

      {/* Table */}
      <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="hidden grid-cols-[1.6fr_1.4fr_190px_120px] gap-3 border-b border-border px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide text-muted sm:grid">
          <span>Brand</span>
          <span>Package</span>
          <span>Status</span>
          <span className="text-right">Fee</span>
        </div>

        {rows.length === 0 && <p className="px-4 py-10 text-center text-sm text-muted">No collaborations in this view.</p>}

        {rows.map((d) => (
          <button key={d.id} onClick={() => setSelId(d.id)}
            className={`grid w-full grid-cols-[1fr_auto] items-center gap-3 border-b border-border px-4 py-3 text-left last:border-0 hover:bg-background sm:grid-cols-[1.6fr_1.4fr_190px_120px] ${selId === d.id ? "bg-background" : ""}`}>
            <div className="flex min-w-0 items-center gap-3">
              <Avatar name={d.sponsor || "?"} size={36} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{d.sponsor}</p>
                <p className="truncate text-xs text-muted sm:hidden">{d.package}</p>
              </div>
            </div>
            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-sm text-muted">{d.package}</p>
            </div>
            <div className="hidden sm:block"><Chip status={d.status} /></div>
            <div className="flex items-center justify-end gap-2">
              <span className="sm:hidden"><Chip status={d.status} /></span>
              <span className="text-right text-sm font-medium">{usd(d.amount)}</span>
            </div>
          </button>
        ))}
      </div>

      {sel && <DetailDrawer deal={sel} onClose={() => setSelId(null)} />}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border py-2 last:border-0">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-right text-sm font-medium">{value}</dd>
    </div>
  );
}

function DetailDrawer({ deal, onClose }) {
  return (
    <>
      <div className="fixed inset-0 z-30 bg-black/20" onClick={onClose} />
      <aside className="fixed right-0 top-0 z-40 flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-border bg-surface shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-border p-5">
          <div className="flex items-center gap-3">
            <Avatar name={deal.sponsor || "?"} size={44} />
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted">Collaboration</p>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">{deal.sponsor}</h2>
                {deal.sponsorVerified && (
                  <span className="rounded bg-success-soft px-1.5 py-0.5 text-[10px] font-semibold text-success">Verified</span>
                )}
              </div>
              <div className="mt-1"><Chip status={deal.status} /></div>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-background"><XIcon size={16} /></button>
        </div>

        <div className="space-y-6 p-5">
          <StatusTimeline current={deal.status} />

          {deal.deliverable && (
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted">My deliverable</p>
              <div className="mt-2 overflow-hidden rounded-xl border border-border">
                <div className="flex aspect-video items-center justify-center bg-foreground/5">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-foreground/70">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="white" aria-hidden="true"><path d="M5 3.5v9l7-4.5z" /></svg>
                  </span>
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium">{deal.deliverable.title}</p>
                  <p className="text-xs text-muted">Delivered {deal.deliverable.deliveredDaysAgo}d ago · {deal.deliverable.lengthMin} min</p>
                </div>
              </div>
              {deal.deliverable.reviewVerdict === "pass" ? (
                <p className="mt-2 text-xs text-success">The brand&apos;s AI content review passed — payment released.</p>
              ) : (
                <p className="mt-2 text-xs text-muted">Delivered — waiting on the brand&apos;s review.</p>
              )}
            </div>
          )}

          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted">Details</p>
            <dl className="mt-2">
              <Row label="Package" value={deal.package} />
              <Row label="Fee" value={usd(deal.amount)} />
              <Row label="Status" value={STATUS[deal.status]?.label} />
            </dl>
          </div>

          {deal.terms?.length > 0 && (
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted">Agreed terms</p>
              <dl className="mt-2">
                {deal.terms.map((t) => <Row key={t.label} label={t.label} value={t.value} />)}
              </dl>
            </div>
          )}
        </div>

        <div className="mt-auto flex gap-2 border-t border-border p-5">
          {deal.status === "completed" ? (
            <>
              <Link href={`/deals/${deal.id}/performance`} className="flex-1 rounded-lg bg-brand px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-dark">Performance</Link>
              <Link href={`/deals/${deal.id}`} className="flex-1 rounded-lg border border-border px-4 py-2.5 text-center text-sm font-medium hover:bg-background">Open chat</Link>
            </>
          ) : (
            <Link href={`/deals/${deal.id}`} className="flex-1 rounded-lg bg-brand px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-dark">Open chatroom</Link>
          )}
        </div>
      </aside>
    </>
  );
}
