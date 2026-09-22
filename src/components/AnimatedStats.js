"use client";

import { useEffect, useRef, useState } from "react";

const STATS = [
  { value: "$32.6B", label: "creator-marketing market size", src: "Influencer Marketing Hub, 2025" },
  { value: "78%", label: "say YouTube has the most trusted creators", src: "YouTube NewFronts, 2026" },
  { value: "36.7%", label: "of brands use YouTube for influencer marketing", src: "industry survey, 2025" },
  { value: "+30%", label: "avg. conversion lift, creator videos on Shorts", src: "YouTube, Jan 2025–Jan 2026" },
];

const COLORS = ["text-g-blue", "text-g-red", "text-g-yellow", "text-g-green"];

// Split "$32.6B" / "+30%" / "78%" into prefix, number, suffix, decimals.
function parse(v) {
  const m = String(v).match(/^([^0-9-]*)(-?[\d.]+)(.*)$/);
  if (!m) return { pre: "", num: 0, suf: String(v), dec: 0 };
  return { pre: m[1], num: parseFloat(m[2]), suf: m[3], dec: (m[2].split(".")[1] || "").length };
}

function CountUp({ value, className }) {
  const { pre, num, suf, dec } = parse(value);
  const [disp, setDisp] = useState(0);
  const ref = useRef(null);
  const done = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setDisp(num); done.current = true; return; }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !done.current) {
            done.current = true;
            const dur = 1300;
            const t0 = performance.now();
            const tick = (t) => {
              const p = Math.min(1, (t - t0) / dur);
              const eased = 1 - Math.pow(1 - p, 3);
              setDisp(num * eased);
              if (p < 1) requestAnimationFrame(tick);
              else setDisp(num);
            };
            requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [num]);

  return (
    <span ref={ref} className={className}>
      {pre}
      {disp.toFixed(dec)}
      {suf}
    </span>
  );
}

export default function AnimatedStats() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-4">
        {STATS.map((s, i) => (
          <div key={s.label} className="bg-surface p-5">
            <CountUp value={s.value} className={`text-2xl font-bold sm:text-3xl ${COLORS[i % 4]}`} />
            <p className="mt-1 text-xs text-muted">{s.label}</p>
            <p className="mt-1 text-[10px] text-muted/80">Source: {s.src}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
