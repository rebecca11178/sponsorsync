"use client";

import { useEffect, useRef, useState } from "react";

// Clean line icons (stroke = white) so the steps read as a product, not emoji.
const ICONS = {
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="6" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  ),
  chat: (
    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 5h16v10H9l-4 4z" />
      <path d="M8 9h8M8 12h5" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <path d="M9 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1z" />
      <path d="M9 14l2 2 4-4" />
    </svg>
  ),
};

const STEPS = [
  { n: "1", key: "shield", title: "Verify", desc: "Sign up with your company email. Creators trust you're a real business, not a scam DM.", grad: "linear-gradient(135deg,#9333ea,#57068c)", glow: "rgba(124,58,237,.45)" },
  { n: "2", key: "search", title: "Discover", desc: "Browse creators with transparent pricing — or let Gemini match you from a brief.", grad: "linear-gradient(135deg,#5b9bff,#2563eb)", glow: "rgba(66,133,244,.45)" },
  { n: "3", key: "chat", title: "Agree", desc: "Send an enquiry, chat, and let AI turn the conversation into clear collaboration terms.", grad: "linear-gradient(135deg,#fbbf24,#d97706)", glow: "rgba(245,158,11,.45)" },
  { n: "4", key: "check", title: "Review", desc: "When the video is delivered, AI checks it against your brief, brand rules, and the contract.", grad: "linear-gradient(135deg,#4ade80,#16a34a)", glow: "rgba(34,197,94,.45)" },
];

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
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
      <p className="mt-1 text-sm text-muted">From unknown brand to reviewed, published sponsorship — in four steps.</p>

      <div className="relative mt-10">
        {/* Flowing connector line (desktop) */}
        <div className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-8 hidden lg:block">
          <div className="relative h-1 overflow-visible rounded-full bg-border">
            <div
              className="hiw-flow h-full rounded-full transition-[width] duration-[1600ms] ease-out"
              style={{ width: inView ? "100%" : "0%" }}
            />
            {inView && <span className="hiw-dot" />}
          </div>
        </div>

        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <div
              key={s.n}
              className="group relative flex flex-col items-center text-center transition-all duration-500 ease-out"
              style={{
                transitionDelay: `${i * 200}ms`,
                opacity: inView ? 1 : 0,
                transform: inView ? "translateY(0)" : "translateY(20px)",
              }}
            >
              {/* colored glow */}
              <span className="pointer-events-none absolute top-2 h-16 w-16 rounded-2xl blur-xl" style={{ background: s.glow }} />
              {/* gradient icon tile */}
              <span
                className="relative z-10 grid h-16 w-16 place-items-center rounded-2xl shadow-lg ring-1 ring-white/20 transition-transform duration-300 group-hover:-translate-y-1"
                style={{ background: s.grad }}
              >
                <span className="h-7 w-7">{ICONS[s.key]}</span>
                <span className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full border-2 border-background bg-foreground text-xs font-bold text-background">{s.n}</span>
              </span>
              <h3 className="mt-4 text-base font-semibold">{s.title}</h3>
              <p className="mt-1.5 max-w-[16rem] text-sm text-muted">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .hiw-flow {
          background: linear-gradient(90deg,#7c3aed,#4285F4,#f59e0b,#22c55e);
          background-size: 200% 100%;
          animation: hiw-sheen 3s linear infinite;
        }
        .hiw-dot {
          position: absolute; top: 50%; left: 0; height: 12px; width: 12px;
          margin-top: -6px; border-radius: 9999px; background: #fff;
          box-shadow: 0 0 0 3px rgba(124,58,237,.35), 0 0 12px 2px rgba(124,58,237,.8);
          animation: hiw-run 3s cubic-bezier(.5,0,.5,1) infinite;
        }
        @keyframes hiw-sheen { to { background-position: 200% 0; } }
        @keyframes hiw-run { 0% { left: 0; opacity: 0; } 8% { opacity: 1; } 92% { opacity: 1; } 100% { left: 100%; opacity: 0; } }
        @media (prefers-reduced-motion: reduce) {
          .hiw-flow { animation: none; }
          .hiw-dot { display: none; }
        }
      `}</style>
    </section>
  );
}
