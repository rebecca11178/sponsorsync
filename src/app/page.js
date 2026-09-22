"use client";

import Link from "next/link";
import { APP_TAGLINE, APP_PITCH } from "@/lib/config";
import { useAuth } from "@/components/AuthProvider";
import WorkspaceHome from "@/components/WorkspaceHome";
import HeroVisual from "@/components/HeroVisual";
import AnimatedStats from "@/components/AnimatedStats";
import HowItWorks from "@/components/HowItWorks";
import Reveal from "@/components/Reveal";

const pillars = [
  {
    tag: "Trust",
    title: "Verified sponsors",
    desc: "Company-email verification on both sides, so there's no guessing whether a brand — or a creator — is legitimate.",
    gap: "A verified-business trust layer built for small advertisers.",
  },
  {
    tag: "Transparency",
    title: "Clear rate cards",
    desc: "Every creator lists prices by content type, plus commercial-rights add-ons — so you know what's fair before you ask.",
    gap: "Upfront rates, so first-time sponsors can plan with confidence.",
  },
  {
    tag: "AI review",
    title: "Contract & content check",
    desc: "Gemini turns the chat into clear terms, then reviews the delivered video against your brief, brand rules, and disclosure requirements.",
    gap: "Gemini handles the heavy lifting, so small teams don't have to.",
  },
];

// How SponsorSync fits with the tools brands already trust — complementary,
// not competitive.
const stack = [
  {
    tag: "YouTube",
    title: "Where your customers already are",
    desc: "The home of trusted creators and the formats — long-form, Shorts — that drive real consideration for small brands.",
  },
  {
    tag: "Gemini",
    title: "The intelligence layer",
    desc: "Matches creators to your brief, turns chats into clear terms, and reviews the delivered video for brand safety and disclosure.",
  },
  {
    tag: "SponsorSync",
    title: "Made for small businesses",
    desc: "Brings it together in one workflow: verified sponsors, transparent rate cards, and guided deals — no ads team required.",
  },
];

export default function Home() {
  const { user, ready } = useAuth();

  // Avoid a flash of the wrong home while the session resolves from storage.
  if (!ready) return <div className="min-h-[60vh]" />;

  // Signed-in users get their workspace, not the marketing pitch.
  if (user) return <WorkspaceHome />;

  return <Marketing />;
}

function Marketing() {
  return (
    <div>
      {/* Full-width campaign key visual */}
      <HeroVisual />

      {/* Hero copy */}
      <section className="mx-auto max-w-6xl px-4 pt-10 pb-12 sm:px-6 sm:pt-12">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted">
          For small & mid-size businesses · YouTube creator sponsorships
        </span>
        <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Run creator sponsorships on YouTube <span className="text-brand">without a marketing team.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted">{APP_TAGLINE}. {APP_PITCH}</p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href="/sponsor/signup" className="rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark">
            Get verified — it&apos;s free
          </Link>
          <Link href="/creators" className="rounded-lg border border-border bg-surface px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-background">
            Browse creators
          </Link>
          <Link href="/match" className="text-sm font-medium text-brand hover:underline">
            or let AI match you →
          </Link>
        </div>
        <p className="mt-3 text-xs text-muted">Verify with your company email in under a minute — no card, no marketing team.</p>
      </section>

      {/* Stats band (animated count-up) */}
      <AnimatedStats />

      {/* Pillars */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {pillars.map((p, i) => (
            <Reveal key={p.title} delay={i * 130} className="rounded-2xl border border-border bg-surface p-6">
              <span className="text-xs font-semibold uppercase tracking-wide text-brand">{p.tag}</span>
              <h3 className="mt-2 text-lg font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm text-muted">{p.desc}</p>
              <p className="mt-4 border-t border-border pt-3 text-xs text-muted">
                <span className="font-medium text-foreground">For SMBs:</span> {p.gap}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* How it works (animated workflow) */}
      <HowItWorks />

      {/* How it fits together — complementary to YouTube + Gemini */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="text-2xl font-semibold tracking-tight">Built on the tools brands already trust</h2>
        <p className="mt-1 text-sm text-muted">
          SponsorSync doesn&apos;t replace YouTube — it brings YouTube&apos;s reach and Gemini&apos;s intelligence together into one workflow small businesses can actually run.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {stack.map((s, i) => (
            <Reveal key={s.tag} delay={i * 130} className="relative rounded-2xl border border-border bg-surface p-6">
              <span className="text-xs font-semibold uppercase tracking-wide text-brand">{s.tag}</span>
              <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted">{s.desc}</p>
              {i < stack.length - 1 && (
                <span className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-border md:block" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                </span>
              )}
            </Reveal>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted">
          Reflects the workflow demonstrated in this prototype, built with the YouTube Data API and Gemini.
        </p>
      </section>

      {/* CTA band */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <Reveal className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-brand px-6 py-8 text-white sm:flex-row sm:items-center sm:px-10">
          <div>
            <h2 className="text-xl font-semibold">Ready to run your first sponsorship?</h2>
            <p className="mt-1 text-sm text-white/80">Verify your business in under a minute.</p>
          </div>
          <Link href="/sponsor/signup" className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-brand transition-colors hover:bg-white/90">
            Get verified
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
