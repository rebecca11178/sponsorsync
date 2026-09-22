"use client";

// Animated "YouTube × SponsorSync" co-brand hero visual. Pure inline SVG + CSS
// (no external assets). It tells the product story: a brand node and a creator
// node on YouTube, connected — "synced" — through SponsorSync in the middle, a
// pulse travelling the link. All motion respects prefers-reduced-motion.
export default function HeroVisual() {
  return (
    <div className="ss-hero relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-border">
      {/* Animated gradient backdrop */}
      <div className="ss-bg absolute inset-0" />
      <div className="ss-blob ss-blob-a absolute" />
      <div className="ss-blob ss-blob-b absolute" />
      <div className="ss-grain absolute inset-0" />

      {/* Co-brand lockup */}
      <div className="absolute left-1/2 top-6 flex -translate-x-1/2 items-center gap-3 text-white">
        {/* YouTube play badge */}
        <span className="ss-yt grid h-9 w-12 place-items-center rounded-lg">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="#fff" aria-hidden="true"><path d="M5 3.4v9.2l7.5-4.6z" /></svg>
        </span>
        <span className="text-lg font-semibold text-white/90">×</span>
        {/* SponsorSync mark */}
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-white font-bold text-brand">S</span>
      </div>

      {/* Connection scene */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 300" fill="none" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        {/* curved link */}
        <path id="ss-link" d="M78 210 C 150 120, 250 120, 322 210" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeDasharray="6 7" className="ss-dash" />
        {/* travelling pulse */}
        <circle r="4.5" fill="#fff" className="ss-pulse">
          <animateMotion dur="2.6s" repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="linear">
            <mpath href="#ss-link" />
          </animateMotion>
        </circle>
      </svg>

      {/* Brand node (left) */}
      <div className="ss-node ss-float-a absolute left-[9%] top-[58%] w-[38%]">
        <div className="rounded-xl border border-white/25 bg-white/15 p-2.5 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-white text-xs font-bold text-brand">B</span>
            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold text-white">Your brand</p>
              <p className="truncate text-[9px] text-white/70">Verified sponsor</p>
            </div>
          </div>
        </div>
      </div>

      {/* Creator node (right) */}
      <div className="ss-node ss-float-b absolute right-[9%] top-[58%] w-[38%]">
        <div className="rounded-xl border border-white/25 bg-white/15 p-2.5 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-g-red text-xs font-bold text-white">MC</span>
            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold text-white">Creator</p>
              <p className="truncate text-[9px] text-white/70">Safety 96 · rate card</p>
            </div>
          </div>
        </div>
      </div>

      {/* Center sync badge with pulsing rings */}
      <div className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2">
        <span className="ss-ring absolute inset-0 rounded-full" />
        <span className="ss-ring ss-ring-2 absolute inset-0 rounded-full" />
        <span className="relative grid h-14 w-14 place-items-center rounded-full bg-white shadow-lg">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 12a8 8 0 0 1 13-6.2M20 12a8 8 0 0 1-13 6.2" stroke="var(--brand)" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M17 4v3.4h-3.4M7 20v-3.4h3.4" stroke="var(--brand)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>

      {/* Floating verified chip */}
      <div className="ss-float-c absolute right-[14%] top-[16%] rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-success shadow">
        ✓ Verified
      </div>
      <div className="ss-float-d absolute left-[13%] top-[24%] rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-brand shadow">
        AI match
      </div>

      <style>{`
        .ss-hero { background: #1a0730; }
        .ss-bg {
          background:
            radial-gradient(120% 120% at 20% 20%, rgba(87,6,140,0.95), transparent 60%),
            radial-gradient(120% 120% at 85% 25%, rgba(234,67,53,0.85), transparent 55%),
            radial-gradient(130% 130% at 60% 100%, rgba(66,133,244,0.85), transparent 55%),
            linear-gradient(135deg, #3b0a63, #57068c 45%, #7b1fa2);
          background-size: 200% 200%;
          animation: ss-sheen 12s ease-in-out infinite;
        }
        .ss-blob { width: 55%; height: 55%; border-radius: 9999px; filter: blur(40px); opacity: .55; }
        .ss-blob-a { background: rgba(234,67,53,.6); left: -10%; top: -12%; animation: ss-drift1 14s ease-in-out infinite; }
        .ss-blob-b { background: rgba(66,133,244,.55); right: -12%; bottom: -14%; animation: ss-drift2 16s ease-in-out infinite; }
        .ss-grain { background-image: radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1px); background-size: 18px 18px; opacity: .5; }
        .ss-yt { background: #FF0033; box-shadow: 0 6px 16px rgba(255,0,51,.45); }

        .ss-ring { box-shadow: 0 0 0 2px rgba(255,255,255,.6) inset; animation: ss-ping 2.6s ease-out infinite; }
        .ss-ring-2 { animation-delay: 1.3s; }

        .ss-dash { animation: ss-dash 1.4s linear infinite; }

        .ss-float-a { animation: ss-floaty 6s ease-in-out infinite; }
        .ss-float-b { animation: ss-floaty 6s ease-in-out infinite; animation-delay: .8s; }
        .ss-float-c { animation: ss-floaty 5s ease-in-out infinite; animation-delay: .3s; }
        .ss-float-d { animation: ss-floaty 5.5s ease-in-out infinite; animation-delay: 1.1s; }

        @keyframes ss-sheen { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes ss-drift1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(12%,8%) scale(1.12); } }
        @keyframes ss-drift2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-10%,-8%) scale(1.1); } }
        @keyframes ss-floaty { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-9px); } }
        @keyframes ss-ping { 0% { transform: scale(1); opacity: .8; } 80%,100% { transform: scale(2.4); opacity: 0; } }
        @keyframes ss-dash { to { stroke-dashoffset: -26; } }

        @media (prefers-reduced-motion: reduce) {
          .ss-bg, .ss-blob-a, .ss-blob-b, .ss-ring, .ss-dash,
          .ss-float-a, .ss-float-b, .ss-float-c, .ss-float-d { animation: none; }
          .ss-pulse { display: none; }
        }
      `}</style>
    </div>
  );
}
