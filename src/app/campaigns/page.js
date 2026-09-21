import Link from "next/link";
import { currentSponsor, deals, getCreator } from "@/lib/mockData";
import { usd, statusLabels } from "@/lib/format";
import Avatar from "@/components/Avatar";

const GROUPS = [
  { key: "active", title: "In progress", statuses: ["enquiry", "chatroom", "contracted", "in_production"], note: "Live conversations, signed deals, and shoots in progress." },
  { key: "review", title: "Awaiting review", statuses: ["in_review"], note: "Delivered — run the compliance & content review before approving." },
  { key: "completed", title: "Completed", statuses: ["completed"], note: "Published campaigns. Open one to see performance." },
];

const STATUS_TONE = {
  enquiry: "bg-background text-muted",
  chatroom: "bg-brand-soft text-brand",
  contracted: "bg-brand-soft text-brand",
  in_production: "bg-warning-soft text-warning",
  in_review: "bg-warning-soft text-warning",
  completed: "bg-success-soft text-success",
};

export default function CampaignsPage() {
  const mine = deals.filter((d) => d.sponsor === currentSponsor.company);
  const spend = mine.reduce((s, d) => s + (d.amount || 0), 0);
  const counts = {
    active: mine.filter((d) => GROUPS[0].statuses.includes(d.status)).length,
    review: mine.filter((d) => d.status === "in_review").length,
    completed: mine.filter((d) => d.status === "completed").length,
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Campaigns</h1>
          <p className="mt-1 text-sm text-muted">{currentSponsor.company} · your creator sponsorships</p>
        </div>
        <Link href="/match" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
          + New campaign
        </Link>
      </div>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "In progress", value: counts.active },
          { label: "Awaiting review", value: counts.review },
          { label: "Completed", value: counts.completed },
          { label: "Total committed", value: usd(spend) },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-xl font-semibold">{s.value}</p>
            <p className="text-xs text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Grouped lists */}
      {GROUPS.map((g) => {
        const rows = mine.filter((d) => g.statuses.includes(d.status));
        return (
          <section key={g.key} className="mt-8">
            <h2 className="font-semibold">{g.title} <span className="text-muted">· {rows.length}</span></h2>
            <p className="mt-0.5 text-xs text-muted">{g.note}</p>
            {rows.length === 0 ? (
              <p className="mt-3 rounded-xl border border-dashed border-border p-5 text-center text-sm text-muted">Nothing here yet.</p>
            ) : (
              <div className="mt-3 space-y-3">
                {rows.map((d) => {
                  const c = getCreator(d.creatorId);
                  return (
                    <Link key={d.id} href={`/deals/${d.id}`} className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 hover:shadow-md">
                      <Avatar name={c?.name || "?"} size={44} />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{c?.name || "Creator"}</p>
                        <p className="text-xs text-muted">{d.package} · {usd(d.amount)}</p>
                      </div>
                      {d.status === "completed" && (
                        <span className="hidden text-xs font-medium text-brand hover:underline sm:inline">Performance →</span>
                      )}
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_TONE[d.status] || "bg-background text-muted"}`}>
                        {statusLabels[d.status]}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
