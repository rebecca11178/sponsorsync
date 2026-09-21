import Link from "next/link";
import { APP_NAME, APP_TAGLINE, APP_PITCH } from "@/lib/config";

const steps = [
  { n: "1", title: "Verify", desc: "Sign up with your company email. Creators trust you're a real business, not a scam DM." },
  { n: "2", title: "Discover", desc: "Browse creators with transparent, listed pricing — or let Gemini match you from a brief." },
  { n: "3", title: "Agree", desc: "Send an enquiry, chat, and let AI turn the conversation into clear collaboration terms." },
  { n: "4", title: "Review", desc: "When the video is delivered, AI checks it against your brief, brand rules, and the contract." },
];

const pillars = [
  {
    tag: "Trust",
    title: "Verified sponsors",
    desc: "Company-email verification on both sides. No more guessing if a brand deal — or a creator — is legit.",
    gap: "Google's Creator Partnerships doesn't do this.",
  },
  {
    tag: "Transparency",
    title: "Clear rate cards",
    desc: "Every creator lists prices by content type plus commercial-rights add-ons. Know what's fair before you ask.",
    gap: "Neither YouTube nor TikTok publishes pricing.",
  },
  {
    tag: "AI review",
    title: "Contract & content check",
    desc: "Gemini summarizes chats into terms, then reviews the delivered video against your brief and legal claims.",
    gap: "The manual, time-heavy step the hackathon calls out.",
  },
];

const stats = [
  { value: "$32.6B", label: "creator-marketing market size", src: "Influencer Marketing Hub, 2025" },
  { value: "78%", label: "say YouTube has the most trusted creators", src: "YouTube NewFronts, 2026" },
  { value: "36.7%", label: "of brands use YouTube for influencer marketing", src: "industry survey, 2025" },
  { value: "+30%", label: "avg. conversion lift, creator videos on Shorts", src: "YouTube, Jan 2025–Jan 2026" },
];

const comparison = [
  { feature: "Verified sponsors (anti-scam trust)", yt: false, tt: false },
  { feature: "Transparent creator rate cards", yt: false, tt: false },
  { feature: "Fair-price + fit guidance for SMBs", yt: false, tt: false },
  { feature: "AI contract & content review", yt: false, tt: false },
  { feature: "Usable without an ads team", yt: false, tt: true },
];

function Cell({ on }) {
  return on ? <span className="text-success">✓</span> : <span className="text-muted/40">—</span>;
}

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-16 pb-12 sm:px-6 sm:pt-24">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted">
          For small & mid-size businesses · YouTube creator sponsorships
        </span>
        <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Run creator sponsorships on YouTube <span className="text-brand">without a marketing team.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted">{APP_TAGLINE}. {APP_PITCH}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/creators" className="rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark">
            Browse creators
          </Link>
          <Link href="/match" className="rounded-lg border border-border bg-surface px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-background">
            Let AI match me
          </Link>
        </div>
      </section>

      {/* Stats band */}
      <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-4">
          {stats.map((s, i) => (
            <div key={s.label} className="bg-surface p-5">
              <p className={`text-2xl font-bold ${["text-g-blue", "text-g-red", "text-g-yellow", "text-g-green"][i % 4]}`}>{s.value}</p>
              <p className="mt-1 text-xs text-muted">{s.label}</p>
              <p className="mt-1 text-[10px] text-muted/80">Source: {s.src}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pillars */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {pillars.map((p) => (
            <div key={p.title} className="rounded-2xl border border-border bg-surface p-6">
              <span className="text-xs font-semibold uppercase tracking-wide text-brand">{p.tag}</span>
              <h3 className="mt-2 text-lg font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm text-muted">{p.desc}</p>
              <p className="mt-4 border-t border-border pt-3 text-xs text-muted">
                <span className="font-medium text-foreground">Why us:</span> {p.gap}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="rounded-2xl border border-border bg-surface p-6">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-soft font-semibold text-brand">{s.n}</span>
              <h3 className="mt-4 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

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
              {comparison.map((row) => (
                <tr key={row.feature} className="border-b border-border">
                  <td className="py-3">{row.feature}</td>
                  <td className="px-4 py-3 text-center"><Cell on={row.yt} /></td>
                  <td className="px-4 py-3 text-center"><Cell on={row.tt} /></td>
                  <td className="bg-brand-soft/40 px-4 py-3 text-center font-semibold"><Cell on={true} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted">
          Comparison of YouTube Creator Partnerships vs TikTok Creator Marketplace, as of 2026. ✓ = capability offered to small advertisers today.
          The SponsorSync column reflects features demonstrated in this prototype.
        </p>
      </section>

      {/* CTA band */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-brand px-6 py-8 text-white sm:flex-row sm:items-center sm:px-10">
          <div>
            <h2 className="text-xl font-semibold">Ready to run your first sponsorship?</h2>
            <p className="mt-1 text-sm text-white/80">Verify your business in under a minute.</p>
          </div>
          <Link href="/sponsor/signup" className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-brand transition-colors hover:bg-white/90">
            Get verified
          </Link>
        </div>
      </section>
    </div>
  );
}
