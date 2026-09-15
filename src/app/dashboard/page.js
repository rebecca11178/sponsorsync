import Link from "next/link";
import { currentSponsor, deals, getCreator, creatorPushes } from "@/lib/mockData";
import { usd, statusLabels } from "@/lib/format";

export default function Dashboard() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">{currentSponsor.company} · {currentSponsor.industry}</p>
        </div>
        {currentSponsor.verified && (
          <span className="rounded-full bg-success-soft px-3 py-1.5 text-sm font-medium text-success">✓ Verified Sponsor</span>
        )}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Active deals */}
        <section>
          <h2 className="font-semibold">Active deals</h2>
          <div className="mt-3 space-y-3">
            {deals.map((d) => {
              const c = getCreator(d.creatorId);
              return (
                <Link key={d.id} href={`/deals/${d.id}`} className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 hover:shadow-md">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-soft text-2xl">{c.emoji}</div>
                  <div className="flex-1">
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-muted">{d.package} · {usd(d.amount)}</p>
                  </div>
                  <span className="rounded-full bg-background px-2.5 py-1 text-xs font-medium text-muted">{statusLabels[d.status]}</span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Creator pushes */}
        <aside>
          <h2 className="font-semibold">Recommended for you</h2>
          <p className="mt-1 text-xs text-muted">
            Pushed to your business.{" "}
            <span className="text-brand">TODO(llm): generate from Gemini using industry + order history.</span>
          </p>
          <div className="mt-3 space-y-3">
            {creatorPushes.map((p) => {
              const c = getCreator(p.creatorId);
              return (
                <Link key={p.creatorId} href={`/creators/${c.id}`} className="block rounded-2xl border border-border bg-surface p-4 hover:shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand-soft text-xl">{c.emoji}</div>
                    <div>
                      <p className="text-sm font-medium">{c.name}</p>
                      <p className="text-xs text-muted">{c.niche}</p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-muted">{p.reason}</p>
                </Link>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}
