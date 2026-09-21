import Link from "next/link";
import { currentSponsor, deals, getCreator } from "@/lib/mockData";
import { usd } from "@/lib/format";
import Avatar from "@/components/Avatar";

export default function SponsorProfile() {
  const mine = deals.filter((d) => d.sponsor === currentSponsor.company);
  const spend = mine.reduce((s, d) => s + (d.amount || 0), 0);
  const creatorsWorkedWith = new Set(mine.map((d) => d.creatorId)).size;
  const completed = mine.filter((d) => d.status === "completed").length;

  const recent = mine.slice(0, 4);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Company profile</h1>
        <Link href="/campaigns" className="text-sm text-muted hover:text-foreground">Campaigns →</Link>
      </div>

      {/* Header */}
      <div className="mt-6 flex flex-wrap items-start gap-4 rounded-2xl border border-border bg-surface p-6">
        <Avatar name={currentSponsor.company} size={64} />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">{currentSponsor.company}</h2>
            {currentSponsor.verified && (
              <span className="rounded bg-success-soft px-1.5 py-0.5 text-[10px] font-semibold text-success" title="Company email confirmed">✓ Business verified</span>
            )}
          </div>
          <p className="text-sm text-muted">{currentSponsor.industry}</p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
            <span>🌐 {currentSponsor.domain}</span>
            <span>✉ {currentSponsor.email}</span>
            <span>Monthly budget: <span className="font-medium text-foreground">{usd(currentSponsor.budget)}</span></span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Campaigns", value: mine.length },
          { label: "Completed", value: completed },
          { label: "Creators worked with", value: creatorsWorkedWith },
          { label: "Total committed", value: usd(spend) },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-xl font-semibold">{s.value}</p>
            <p className="text-xs text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Verification */}
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="font-semibold">Verification</h2>
          <p className="mt-2 flex items-center gap-2 text-sm">
            <span className="text-success">✓</span>
            <span><span className="font-medium">Business verified</span> — company email <span className="text-muted">{currentSponsor.email}</span> confirmed.</span>
          </p>
          <p className="mt-3 text-xs text-muted">
            The verified badge is what tells creators you&apos;re a real business, not a scam DM — the trust layer Google&apos;s Creator Partnerships doesn&apos;t provide.
          </p>
        </div>

        {/* Recent campaigns */}
        <div className="rounded-2xl border border-border bg-surface p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Recent campaigns</h2>
            <Link href="/campaigns" className="text-xs font-medium text-brand hover:underline">View all</Link>
          </div>
          <div className="mt-3 space-y-2">
            {recent.length === 0 && <p className="text-sm text-muted">No campaigns yet.</p>}
            {recent.map((d) => {
              const c = getCreator(d.creatorId);
              return (
                <Link key={d.id} href={`/deals/${d.id}`} className="flex items-center gap-3 rounded-lg p-2 hover:bg-background">
                  <Avatar name={c?.name || "?"} size={32} />
                  <span className="min-w-0 flex-1 truncate text-sm">{c?.name}</span>
                  <span className="text-xs text-muted">{usd(d.amount)}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
