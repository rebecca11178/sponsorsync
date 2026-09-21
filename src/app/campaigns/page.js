"use client";

import { useState } from "react";
import Link from "next/link";
import { currentSponsor, deals, getCreator } from "@/lib/mockData";
import { usd } from "@/lib/format";
import Avatar from "@/components/Avatar";

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
  const mine = deals.filter((d) => d.sponsor === currentSponsor.company);

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
                <span className="rounded bg-success-soft px-1.5 py-0.5 text-[10px] font-semibold text-success">✓ Business verified</span>
              )}
            </div>
            <p className="text-xs text-muted">FY26 · Creator sponsorships · {currentSponsor.industry}</p>
          </div>
          <Link href="/sponsor/profile" className="text-sm font-medium text-brand hover:underline">View profile →</Link>
        </div>
      </div>

      {/* KPI cards */}
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-xs text-muted">{k.label}</p>
            <p className="mt-1 text-2xl font-semibold">{k.value}</p>
            <p className="text-[11px] text-muted">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Toolbar: filters + new */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1">
          {FILTERS.map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${filter === f.key ? "bg-brand text-white" : "text-muted hover:bg-background"}`}>
              {f.label}
            </button>
          ))}
        </div>
        <Link href="/match" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">+ New campaign</Link>
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
          const href = isDraft ? "/match" : `/deals/${d.id}`;
          return (
            <Link key={d.id} href={href}
              className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-border px-4 py-3 last:border-0 hover:bg-background sm:grid-cols-[1.6fr_1.4fr_150px_130px]">
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
                  {isDraft ? <span className="text-brand">Finish setup →</span> : usd(d.amount)}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
