"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getDeal, getCreator } from "@/lib/mockData";
import BackLink from "@/components/BackLink";

export default function PerformancePage() {
  const { id } = useParams();
  const deal = getDeal(id);
  const creator = deal ? getCreator(deal.creatorId) : null;
  const [data, setData] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const res = await fetch("/api/performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealId: id }),
      });
      const d = await res.json();
      if (alive) setData(d);
    })();
    return () => { alive = false; };
  }, [id]);

  if (!deal) return <div className="mx-auto max-w-3xl px-6 py-16">Deal not found.</div>;

  const maxFunnel = data ? data.funnel[0].value : 1;
  const maxDaily = data ? Math.max(...data.daily) : 1;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <BackLink href={`/deals/${deal.id}`} className="text-sm text-muted hover:text-foreground">← Back</BackLink>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Campaign performance</h1>
      <p className="mt-1 text-sm text-muted">
        {creator.name} · {deal.package} · sample metrics for demonstration.
      </p>

      {!data ? (
        <div className="mt-6 grid place-items-center rounded-2xl border border-border bg-surface p-16 text-sm text-muted">
          Crunching the numbers…
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {/* ROAS headline */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-brand px-6 py-5 text-white">
            <div>
              <p className="text-sm text-white/80">Return on total spend</p>
              <p className="text-3xl font-semibold">{data.roas}x</p>
            </div>
            <div className="text-right text-sm text-white/90">
              <p>${data.spend.toLocaleString()} spent → ${data.revenue.toLocaleString()} revenue</p>
            </div>
          </div>

          {/* Metric tiles */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {data.metrics.map((m) => (
              <div key={m.label} className="rounded-2xl border border-border bg-surface p-4">
                <p className="text-xs text-muted">{m.label}</p>
                <p className="mt-1 text-xl font-semibold">{m.value}</p>
                <p className="text-xs text-muted">{m.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Funnel */}
            <div className="rounded-2xl border border-border bg-surface p-6">
              <h2 className="font-semibold">Conversion funnel</h2>
              <div className="mt-4 space-y-3">
                {data.funnel.map((f) => (
                  <div key={f.stage}>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">{f.stage}</span>
                      <span className="font-medium">{f.value.toLocaleString()}</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-background">
                      <div className="h-2 rounded-full bg-brand" style={{ width: `${(f.value / maxFunnel) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily views bar chart */}
            <div className="rounded-2xl border border-border bg-surface p-6">
              <h2 className="font-semibold">Views, first 7 days</h2>
              <div className="mt-4 flex h-32 items-end gap-2">
                {data.daily.map((v, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <div className="w-full rounded-t bg-brand/80" style={{ height: `${(v / maxDaily) * 100}%` }} />
                    <span className="text-[10px] text-muted">D{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI insight */}
          <div className="rounded-2xl border border-brand bg-brand-soft/40 p-5">
            <p className="text-sm font-semibold text-brand">AI insight</p>
            <p className="mt-1 text-sm text-foreground">{data.insight}</p>
          </div>

          {/* Close the loop back to the campaign list. */}
          <div className="flex justify-end">
            <Link href="/campaigns" className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium hover:bg-background">
              Back to Campaigns
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
