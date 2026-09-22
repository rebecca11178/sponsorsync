"use client";

import { useEffect, useRef, useState } from "react";

// Fade + slide-up a block when it scrolls into view. `delay` staggers siblings.
// Respects prefers-reduced-motion (shows immediately, no motion).
export default function Reveal({ children, className = "", delay = 0, as: Tag = "div" }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setInView(true); return; }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setInView(true)),
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(16px)",
        transition: "opacity .55s ease-out, transform .55s ease-out",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </Tag>
  );
}
