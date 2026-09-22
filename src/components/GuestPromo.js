"use client";

import Link from "next/link";

// Promotional gate shown to logged-out visitors when they open a core feature
// (Find Creators / AI Match). Instead of the full tool, guests get a marketing
// pitch for that feature with a clear path to log in or verify a business.
const CONTENT = {
  creators: {
    eyebrow: "Find creators",
    title: "Browse creators with prices on the table.",
    subtitle:
      "SponsorSync is the only place where small businesses can see a creator's rate card by content type — integrated videos, dedicated videos, and Shorts — along with commercial-rights add-ons, before sending a single message.",
    bullets: [
      { title: "Transparent rate cards", desc: "No back-and-forth DMs just to learn a price — the number YouTube and TikTok never show you." },
      { title: "Verified, brand-safe creators", desc: "Every creator is channel-verified, with a brand-safety score and a real track record." },
      { title: "Filter to your budget", desc: "Narrow by tier and maximum rate, so you only see creators you can actually afford." },
    ],
    preview: <CreatorsPreview />,
  },
  match: {
    eyebrow: "AI Match",
    title: "Describe your campaign. Let Gemini build the shortlist.",
    subtitle:
      "Answer a few questions about your business, goal, audience, and budget. Gemini reads creators' recent videos and ranks the best-fit, best-value matches — with a brand-safety risk check on each.",
    bullets: [
      { title: "Brief in, shortlist out", desc: "A guided six-step brief — no marketing team or media plan required." },
      { title: "Grounded fit scores", desc: "Matches are scored on real recent content, not follower count alone." },
      { title: "Budget-aware picks", desc: "For every recommended creator, see the best package within your budget." },
    ],
    preview: <MatchPreview />,
  },
};

export default function GuestPromo({ variant }) {
  const c = CONTENT[variant] || CONTENT.creators;
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        {/* Copy */}
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-brand">{c.eyebrow}</span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{c.title}</h1>
          <p className="mt-4 text-lg text-muted">{c.subtitle}</p>

          <ul className="mt-6 space-y-3">
            {c.bullets.map((b) => (
              <li key={b.title} className="flex gap-3">
                <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2.5 6.5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span>
                  <span className="font-medium">{b.title}</span>
                  <span className="text-muted"> — {b.desc}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/login" className="rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark">
              Log in to continue
            </Link>
            <Link href="/sponsor/signup" className="rounded-lg border border-border bg-surface px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-background">
              Verify your business
            </Link>
          </div>
          <p className="mt-3 text-xs text-muted">Free to verify with your company email · takes under a minute.</p>
        </div>

        {/* Blurred product peek */}
        <div className="relative">
          <div className="pointer-events-none select-none overflow-hidden rounded-2xl border border-border bg-surface p-5 opacity-90 [mask-image:linear-gradient(to_bottom,black_55%,transparent)]">
            {c.preview}
          </div>
          <div className="absolute inset-x-0 bottom-4 flex justify-center">
            <span className="rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-medium text-muted shadow-sm">
              Log in to see the full experience
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- decorative previews (static, non-interactive) --------------------------
function CreatorsPreview() {
  const rows = [
    { i: "MC", n: "Maya Chen", h: "@mayaeats · Food & Beverage", s: 96, p: "$1,200" },
    { i: "DA", n: "Diego Alvarez", h: "@diegocooks · Cooking", s: 90, p: "$1,800" },
    { i: "PN", n: "Priya Nair", h: "@priyawellness · Health", s: 98, p: "$900" },
  ];
  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div key={r.i} className="flex items-center gap-3 rounded-xl border border-border p-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-brand/80 text-sm font-semibold text-white">{r.i}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{r.n}</p>
            <p className="truncate text-xs text-muted">{r.h}</p>
          </div>
          <span className="rounded-full bg-success-soft px-2 py-0.5 text-xs text-success">Safety {r.s}</span>
          <span className="text-sm font-semibold">{r.p}</span>
        </div>
      ))}
    </div>
  );
}

function MatchPreview() {
  const steps = ["Business", "Goal", "Audience", "Budget", "Brand", "Results"];
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {steps.map((s, i) => (
          <span key={s} className={`rounded-full px-2.5 py-1 text-xs font-medium ${i === 0 ? "bg-brand text-white" : "bg-background text-muted"}`}>{s}</span>
        ))}
      </div>
      <div className="rounded-xl border border-border p-4">
        <p className="text-sm font-medium">What does your business do?</p>
        <div className="mt-2 h-9 rounded-lg border border-border bg-background" />
        <p className="mt-4 text-sm font-medium">Campaign goal</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {["Purchase / sales", "Leads", "Website traffic", "Brand awareness"].map((g, i) => (
            <div key={g} className={`rounded-lg border p-2 text-xs ${i === 0 ? "border-brand bg-brand-soft" : "border-border"}`}>{g}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
