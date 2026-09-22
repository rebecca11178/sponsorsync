"use client";

import { useEffect, useRef, useState } from "react";

const STEPS = [
  { n: "1", title: "Verify", desc: "Sign up with your company email. Creators trust you're a real business, not a scam DM.", icon: "🛡️" },
  { n: "2", title: "Discover", desc: "Browse creators with transparent pricing — or let Gemini match you from a brief.", icon: "🔍" },
  { n: "3", title: "Agree", desc: "Send an enquiry, chat, and let AI turn the conversation into clear collaboration terms.", icon: "🤝" },
  { n: "4", title: "Review", desc: "When the video is delivered, AI checks it against your brief, brand rules, and the contract.", icon: "✅" },
];

// "How it works" as an animated left-to-right workflow. When it scrolls into
// view, a connector line draws across and the four steps pop in in sequence.
export default function HowItWorks() {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setInView(true); return; }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setInView(true)),
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
      <p className="mt-1 text-sm text-muted">From unknown brand to reviewed, published sponsorship — in four steps.</p>

      <div className="relative mt-8">
        {/* Connector line (desktop) that draws across on view */}
        <div className="pointer-events-none absolute left-0 right-0 top-9 hidden h-0.5 bg-border lg:block">
          <div
            className="h-full bg-brand transition-[width] duration-[1400ms] ease-out"
            style={{ width: inView ? "100%" : "0%" }}
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <div
              key={s.n}
              className="relative transition-all duration-500 ease-out"
              style={{
                transitionDelay: `${i * 220}ms`,
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(16px)",
              }}
            >
              <div className="flex items-center gap-3 lg:block">
                <span className="relative z-10 grid h-[72px] w-[72px] shrink-0 place-items-center rounded-2xl border border-border bg-surface text-2xl shadow-sm">
                  <span aria-hidden="true">{s.icon}</span>
                  <span className="absolute -right-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full bg-brand text-xs font-bold text-white">{s.n}</span>
                </span>
                <h3 className="font-semibold lg:mt-4">{s.title}</h3>
              </div>
              <p className="mt-1 text-sm text-muted lg:mt-2">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
