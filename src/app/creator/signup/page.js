"use client";

import { useState } from "react";
import Link from "next/link";
import { compact } from "@/lib/format";
import Avatar from "@/components/Avatar";

// Creator registration — connect YouTube (mock), then set a rate card.
// TODO(auth): real YouTube OAuth; TODO(api): pull real channel stats.
const MOCK_CHANNEL = {
  name: "Maya Chen",
  handle: "@mayabrews",
  emoji: "🍵",
  subscribers: 84000,
  avgViews: 41000,
  niche: "Food & Wellness",
};

export default function CreatorSignup() {
  const [step, setStep] = useState(1);
  const [rates, setRates] = useState({ integratedVideo: 1200, dedicatedVideo: 2500, short: 600 });

  const setRate = (k) => (e) => setRates((r) => ({ ...r, [k]: Number(e.target.value) }));

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Join as a creator</h1>
      <p className="mt-2 text-sm text-muted">Connect your channel and set your prices. Only verified brands can reach you.</p>

      {/* Step indicator */}
      <div className="mt-6 flex items-center gap-2 text-xs text-muted">
        <span className={step >= 1 ? "font-semibold text-brand" : ""}>1. Connect</span>
        <span>→</span>
        <span className={step >= 2 ? "font-semibold text-brand" : ""}>2. Rate card</span>
        <span>→</span>
        <span className={step >= 3 ? "font-semibold text-brand" : ""}>3. Done</span>
      </div>

      {step === 1 && (
        <div className="mt-6 rounded-2xl border border-border bg-surface p-6 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-danger-soft text-2xl">▶</div>
          <p className="mt-3 text-sm text-muted">Connect your YouTube channel so we can verify your stats.</p>
          <button onClick={() => setStep(2)} className="mt-4 w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">
            Connect YouTube
          </button>
          <p className="mt-2 text-xs text-muted">TODO(auth): real YouTube OAuth</p>
        </div>
      )}

      {step === 2 && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-3 rounded-2xl border border-success/40 bg-success-soft/30 p-4">
            <Avatar name={MOCK_CHANNEL.name} size={44} />
            <div>
              <p className="text-sm font-medium">{MOCK_CHANNEL.name} · {MOCK_CHANNEL.handle}</p>
              <p className="text-xs text-muted">{compact(MOCK_CHANNEL.subscribers)} subs · {compact(MOCK_CHANNEL.avgViews)} avg views · verified ✓</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="font-semibold">Set your rate card</h2>
            <p className="mt-1 text-xs text-muted">Transparent pricing means fewer back-and-forth DMs.</p>
            <div className="mt-4 space-y-3">
              {[
                { key: "integratedVideo", label: "Integrated video" },
                { key: "dedicatedVideo", label: "Dedicated video" },
                { key: "short", label: "YouTube Short" },
              ].map((r) => (
                <label key={r.key} className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium">{r.label}</span>
                  <span className="flex items-center gap-1">
                    <span className="text-muted">$</span>
                    <input type="number" value={rates[r.key]} onChange={setRate(r.key)}
                      className="w-28 rounded-lg border border-border bg-background px-3 py-1.5 text-right outline-none focus:border-brand" />
                  </span>
                </label>
              ))}
            </div>
            <button onClick={() => setStep(3)} className="mt-5 w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">
              Publish my profile
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="mt-6 rounded-2xl border border-border bg-success-soft/40 p-6 text-center">
          <p className="text-lg font-semibold text-success">🎉 You&apos;re live!</p>
          <p className="mt-1 text-sm text-muted">Verified brands can now find you and send enquiries.</p>
          <Link href="/creator" className="mt-4 inline-block rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
            Go to my inbox →
          </Link>
        </div>
      )}
    </div>
  );
}
