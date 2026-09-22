"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { creators } from "@/lib/mockData";
import { compact, usd, scoreTone } from "@/lib/format";
import { loadAllOverrides, mergePricing } from "@/lib/pricing";
import Avatar from "@/components/Avatar";
import { useAuth } from "@/components/AuthProvider";
import GuestPromo from "@/components/GuestPromo";

const tiers = ["All", "Nano", "Micro", "Mid-tier"];

export default function CreatorsPage() {
  const { user, ready } = useAuth();
  const [tier, setTier] = useState("All");
  const [maxPrice, setMaxPrice] = useState(10000);
  const [overrides, setOverrides] = useState({});

  // Reflect creator-set prices so the list matches each creator's detail page (P0-3).
  useEffect(() => setOverrides(loadAllOverrides()), []);

  const list = useMemo(() => {
    return creators
      .map((c) => ({ ...c, rates: mergePricing(c, overrides).rates }))
      .filter((c) => (tier === "All" || c.tier === tier) && c.rates.dedicatedVideo <= maxPrice);
  }, [tier, maxPrice, overrides]);

  // Guests get a promotional pitch for this feature, not the full directory.
  if (!ready) return <div className="min-h-[60vh]" />;
  if (!user) return <GuestPromo variant="creators" />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Find creators</h1>
          <p className="mt-1 text-sm text-muted">
            Transparent pricing by content type — the rate card YouTube and TikTok never show you.
          </p>
        </div>
        <Link href="/match" className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium hover:bg-background">
          Or let AI match me →
        </Link>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-surface p-4">
        <div className="flex items-center gap-2">
          {tiers.map((t) => (
            <button
              key={t}
              onClick={() => setTier(t)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                tier === t ? "bg-brand text-white" : "text-muted hover:bg-background"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted">Max dedicated-video rate</span>
          <input
            type="range"
            min={500}
            max={10000}
            step={500}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
          />
          <span className="font-medium">{usd(maxPrice)}</span>
        </div>
      </div>

      {/* Grid */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {list.map((c) => {
          const safety = scoreTone(c.brandSafety);
          return (
            <Link
              key={c.id}
              href={`/creators/${c.id}`}
              className="group rounded-2xl border border-border bg-surface p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <Avatar name={c.name} size={56} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{c.name}</h3>
                    {c.verified && <span className="rounded bg-success-soft px-1.5 py-0.5 text-[10px] font-semibold text-success">Channel verified</span>}
                  </div>
                  <p className="text-sm text-muted">{c.handle} · {c.niche}</p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                    <span><span className="font-medium text-foreground">{compact(c.subscribers)}</span> subs</span>
                    <span><span className="font-medium text-foreground">{compact(c.avgViews)}</span> avg views</span>
                    <span><span className="font-medium text-foreground">{c.engagement}%</span> engagement</span>
                  </div>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${safety.bg} ${safety.text}`}>
                  Safety {c.brandSafety}
                </span>
              </div>

              {/* Rate card preview */}
              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4 text-center text-sm">
                <div>
                  <p className="text-xs text-muted">Integrated</p>
                  <p className="font-semibold">{usd(c.rates.integratedVideo)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Dedicated</p>
                  <p className="font-semibold">{usd(c.rates.dedicatedVideo)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Short</p>
                  <p className="font-semibold">{usd(c.rates.short)}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      {list.length === 0 && (
        <p className="mt-10 text-center text-sm text-muted">No creators match those filters.</p>
      )}
    </div>
  );
}
