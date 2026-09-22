"use client";

import { useState } from "react";
import Link from "next/link";
import { currentSponsor, deals, getCreator } from "@/lib/mockData";
import { usd } from "@/lib/format";
import Avatar from "@/components/Avatar";
import StatusTimeline from "@/components/StatusTimeline";
import { XIcon } from "@/components/icons";

// One colour per lifecycle stage — the row's status chip.
const STATUS = {
  draft: { label: "Draft", color: "#6b7280" },
  chatroom: { label: "In discussion", color: "#7c3aed" },
  contracted: { label: "Contracted", color: "#2563eb" },
  in_production: { label: "Filming", color: "#d97706" },
  in_review: { label: "In review", color: "#ea580c" },
  completed: { label: "Completed", color: "#16a34a" },
  enquiry: { label: "Enquiry", color: "#6b7280" },
};

const FILTERS = [
  { key: "all", label: "All", match: () => true },
  { key: "draft", label: "Draft", match: (d) => d.status === "draft" },
  { key: "active", label: "In progress", match: (d) => ["chatroom", "contracted", "in_production"].includes(d.status) },
  { key: "review", label: "Awaiting review", match: (d) => d.status === "in_review" },
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

export default function CampaignsPage() {
  const [filter, setFilter] = useState("all");
  const [selId, setSelId] = useState(null);
  const mine = deals.filter((d) => d.sponsor === currentSponsor.company);
  const sel = selId ? mine.find((d) => d.id === selId) : null;

  const committed = mine.filter((d) => d.status !== "draft").reduce((s, d) => s + (d.amount || 0), 0);
  const kpis = [
    { label: "Total committed", value: usd(committed), sub: `across ${mine.filter((d) => d.status !== "draft").length} campaigns` },
    { label: "Contracted", value: mine.filter((d) => ["contracted", "in_production", "in_review", "completed"].includes(d.status)).length, sub: "signed deals" },
    { label: "In progress", value: mine.filter((d) => ["chatroom", "contracted", "in_production"].includes(d.status)).length, sub: "active now" },
    { label: "Awaiting review", value: mine.filter((d) => d.status === "in_review").length, sub: "delivered, needs approval" },
  ];

  const rows = mine.filter(FILTERS.find((f) => f.key === filter).match);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Brand profile header */}
      <div className="rounded-2xl border border-border bg-surface p-5">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar name={currentSponsor.company} size={52} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold">{currentSponsor.company}</h1>
              {currentSponsor.verified && (
                <span className="rounded bg-success-soft px-1.5 py-0.5 text-[10px] font-semibold text-success">Business verified</span>
              )}
            </div>
            <p className="text-xs text-muted">FY26 · Creator sponsorships · {currentSponsor.industry}</p>
          </div>
          <Link href="/sponsor/profile" className="text-sm font-medium text-brand hover:underline">View profile</Link>
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
        <Link href="/match" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">New campaign</Link>
      </div>

      {/* Table */}
      <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="hidden grid-cols-[1.6fr_1.4fr_150px_130px] gap-3 border-b border-border px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide text-muted sm:grid">
          <span>Creator</span>
          <span>Package</span>
          <span>Status</span>
          <span className="text-right">Budget</span>
        </div>

        {rows.length === 0 && <p className="px-4 py-10 text-center text-sm text-muted">No campaigns in this view.</p>}

        {rows.map((d) => {
          const c = getCreator(d.creatorId);
          const isDraft = d.status === "draft";
          return (
            <button key={d.id} onClick={() => setSelId(d.id)}
              className={`grid w-full grid-cols-[1fr_auto] items-center gap-3 border-b border-border px-4 py-3 text-left last:border-0 hover:bg-background sm:grid-cols-[1.6fr_1.4fr_150px_130px] ${selId === d.id ? "bg-background" : ""}`}>
              <div className="flex min-w-0 items-center gap-3">
                <Avatar name={c?.name || "?"} size={36} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{c?.name || "Creator TBD"}</p>
                  <p className="truncate text-xs text-muted sm:hidden">{d.package}{isDraft && d.draftNote ? ` · ${d.draftNote}` : ""}</p>
                </div>
              </div>
              <div className="hidden min-w-0 sm:block">
                <p className="truncate text-sm text-muted">{d.package}</p>
                {isDraft && d.draftNote && <p className="truncate text-[11px] text-muted">{d.draftNote}</p>}
              </div>
              <div className="hidden sm:block"><Chip status={d.status} /></div>
              <div className="flex items-center justify-end gap-2">
                <span className="sm:hidden"><Chip status={d.status} /></span>
                <span className="text-right text-sm font-medium">
                  {isDraft ? <span className="text-brand">Finish setup</span> : usd(d.amount)}
                </span>
              </div>
            </button>
          );
        })}
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
  const c = getCreator(deal.creatorId);
  const isDraft = deal.status === "draft";
  return (
    <>
      <div className="fixed inset-0 z-30 bg-black/20" onClick={onClose} />
      <aside className="fixed right-0 top-0 z-40 flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-border bg-surface shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-border p-5">
          <div className="flex items-center gap-3">
            <Avatar name={c?.name || "?"} size={44} />
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted">Campaign</p>
              <h2 className="text-lg font-semibold">{c?.name || "Creator TBD"}</h2>
              <div className="mt-1"><Chip status={deal.status} /></div>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-background"><XIcon size={16} /></button>
        </div>

        <div className="space-y-6 p-5">
          <StatusTimeline current={deal.status} />

          {deal.deliverable && (
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted">Deliverable</p>
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
                <p className="mt-2 text-xs text-success">AI content review passed — compliant with the agreed terms.</p>
              ) : (
                <p className="mt-2 text-xs text-muted">Not reviewed yet — run the Gemini content check below.</p>
              )}
            </div>
          )}

          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted">Attributes</p>
            <dl className="mt-2">
              <Row label="Package" value={deal.package} />
              <Row label="Budget" value={isDraft ? "Not set" : usd(deal.amount)} />
              <Row label="Status" value={STATUS[deal.status]?.label} />
              {c && <Row label="Tier" value={c.tier} />}
              {c && <Row label="Channel" value={c.handle} />}
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

          {isDraft && deal.draftNote && (
            <p className="rounded-lg bg-background px-3 py-2 text-xs text-muted">To finish: {deal.draftNote}.</p>
          )}
        </div>

        <div className="mt-auto flex gap-2 border-t border-border p-5">
          {isDraft ? (
            <Link href="/match" className="flex-1 rounded-lg bg-brand px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-dark">Finish setup</Link>
          ) : deal.status === "in_review" ? (
            <>
              <Link href={`/deals/${deal.id}/review`} className="flex-1 rounded-lg bg-brand px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-dark">Review with Gemini</Link>
              <Link href={`/deals/${deal.id}`} className="flex-1 rounded-lg border border-border px-4 py-2.5 text-center text-sm font-medium hover:bg-background">Open deal</Link>
            </>
          ) : deal.status === "completed" ? (
            <>
              <Link href={`/deals/${deal.id}/performance`} className="flex-1 rounded-lg bg-brand px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-dark">Performance</Link>
              <Link href={`/deals/${deal.id}/review`} className="flex-1 rounded-lg border border-border px-4 py-2.5 text-center text-sm font-medium hover:bg-background">Content review</Link>
            </>
          ) : (
            <Link href={`/deals/${deal.id}`} className="flex-1 rounded-lg bg-brand px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-dark">Open deal</Link>
          )}
        </div>
      </aside>
    </>
  );
}
