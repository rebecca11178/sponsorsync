"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

// Auth-aware calls to action on the landing page. A logged-in user shouldn't be
// pushed to "sign up" — send them into the app instead. Two slots: the hero
// buttons and the bottom band.
export default function HomeCTA({ variant }) {
  const { user } = useAuth();
  const role = user?.role || "guest";

  if (variant === "hero") {
    if (role === "sponsor") {
      return (
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/dashboard" className="rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark">
            Go to dashboard
          </Link>
          <Link href="/match" className="rounded-lg border border-border bg-surface px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-background">
            Start an AI match
          </Link>
        </div>
      );
    }
    if (role === "creator") {
      return (
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/creator" className="rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark">
            Go to my inbox
          </Link>
          <Link href="/creator/collaborations" className="rounded-lg border border-border bg-surface px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-background">
            My collaborations
          </Link>
        </div>
      );
    }
    return (
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/creators" className="rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark">
          Browse creators
        </Link>
        <Link href="/match" className="rounded-lg border border-border bg-surface px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-background">
          Let AI match me
        </Link>
      </div>
    );
  }

  // variant === "band"
  if (role === "sponsor") {
    return (
      <div className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-brand px-6 py-8 text-white sm:flex-row sm:items-center sm:px-10">
        <div>
          <h2 className="text-xl font-semibold">Pick up where you left off</h2>
          <p className="mt-1 text-sm text-white/80">Your campaigns and creator matches are ready.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/campaigns" className="rounded-lg bg-white/15 px-5 py-3 text-sm font-semibold text-white ring-1 ring-inset ring-white/40 transition-colors hover:bg-white/25">
            View campaigns
          </Link>
          <Link href="/creators" className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-brand transition-colors hover:bg-white/90">
            Find creators
          </Link>
        </div>
      </div>
    );
  }
  if (role === "creator") {
    return (
      <div className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-brand px-6 py-8 text-white sm:flex-row sm:items-center sm:px-10">
        <div>
          <h2 className="text-xl font-semibold">New brand deals are waiting</h2>
          <p className="mt-1 text-sm text-white/80">Check your inbox and keep your collaborations moving.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/creator/collaborations" className="rounded-lg bg-white/15 px-5 py-3 text-sm font-semibold text-white ring-1 ring-inset ring-white/40 transition-colors hover:bg-white/25">
            My collaborations
          </Link>
          <Link href="/creator" className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-brand transition-colors hover:bg-white/90">
            Open inbox
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-brand px-6 py-8 text-white sm:flex-row sm:items-center sm:px-10">
      <div>
        <h2 className="text-xl font-semibold">Ready to run your first sponsorship?</h2>
        <p className="mt-1 text-sm text-white/80">Verify your business in under a minute.</p>
      </div>
      <Link href="/sponsor/signup" className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-brand transition-colors hover:bg-white/90">
        Get verified
      </Link>
    </div>
  );
}
