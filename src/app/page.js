"use client";

import Link from "next/link";
import { APP_TAGLINE, APP_PITCH } from "@/lib/config";
import { useAuth } from "@/components/AuthProvider";
import WorkspaceHome from "@/components/WorkspaceHome";
import HeroVisual from "@/components/HeroVisual";
import AnimatedStats from "@/components/AnimatedStats";
import HowItWorks from "@/components/HowItWorks";
import Reveal from "@/components/Reveal";
import { CheckIcon } from "@/components/icons";

const pillars = [
  {
    tag: "Trust",
    title: "Verified sponsors",
    desc: "Company-email verification on both sides, so there's no guessing whether a brand — or a creator — is legitimate.",
    gap: "Google's Creator Partnerships doesn't offer this.",
  },
  {
    tag: "Transparency",
    title: "Clear rate cards",
    desc: "Every creator lists prices by content type, plus commercial-rights add-ons — so you know what's fair before you ask.",
    gap: "Neither YouTube nor TikTok publishes creator pricing.",
  },
  {
    tag: "AI review",
    title: "Contract & content check",
    desc: "Gemini turns the chat into clear terms, then reviews the delivered video against your brief, brand rules, and disclosure requirements.",
    gap: "The manual, time-consuming step most tools leave to you.",
  },
];

const comparison = [
  { feature: "Verified sponsors (anti-scam trust)", yt: false, tt: false },
  { feature: "Transparent creator rate cards", yt: false, tt: false },
  { feature: "Fair-price + fit guidance for SMBs", yt: false, tt: false },
  { feature: "AI contract & content review", yt: false, tt: false },
  { feature: "Usable without an ads team", yt: false, tt: true },
];

function Cell({ on }) {
  return on
    ? <CheckIcon className="mx-auto text-success" size={16} />
    : <span className="text-muted/40">—</span>;
}

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
                <span className="font-medium text-foreground">Why us:</span> {p.gap}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* How it works (animated workflow) */}
      <HowItWorks />

      {/* Comparison */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="text-2xl font-semibold tracking-tight">The gap we fill</h2>
        <p className="mt-1 text-sm text-muted">
          What YouTube&apos;s Creator Partnerships and TikTok both leave out for small businesses.
        </p>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-3 font-medium text-muted">Capability</th>
                <th className="px-4 py-3 text-center font-medium text-muted">YouTube</th>
                <th className="px-4 py-3 text-center font-medium text-muted">TikTok</th>
                <th className="px-4 py-3 text-center font-semibold text-brand">SponsorSync</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((row, i) => (
                <Reveal as="tr" key={row.feature} delay={i * 90} className="border-b border-border">
                  <td className="py-3">{row.feature}</td>
                  <td className="px-4 py-3 text-center"><Cell on={row.yt} /></td>
                  <td className="px-4 py-3 text-center"><Cell on={row.tt} /></td>
                  <td className="bg-brand-soft/40 px-4 py-3 text-center font-semibold"><Cell on={true} /></td>
                </Reveal>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted">
          Comparison of YouTube Creator Partnerships vs TikTok Creator Marketplace, as of 2026. A check mark = capability offered to small advertisers today.
          The SponsorSync column reflects features demonstrated in this prototype.
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
