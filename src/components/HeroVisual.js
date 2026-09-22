"use client";

// Full-width "YouTube × SponsorSync" campaign key visual (KV) banner. Pure
// inline SVG + CSS — no external assets. A wide co-branded lockup with an
// animated gradient, a brand↔creator link "synced" through the centre, and
// floating trust chips. Motion respects prefers-reduced-motion.
export default function HeroVisual() {
  return (
    <div className="ss-kv relative h-[260px] w-full overflow-hidden sm:h-[320px]">
      {/* Animated gradient backdrop */}
      <div className="ss-bg absolute inset-0" />
      <div className="ss-blob ss-blob-a absolute" />
      <div className="ss-blob ss-blob-b absolute" />
      <div className="ss-grain absolute inset-0" />

      {/* Wide connection line across the banner */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1000 320" fill="none" preserveAspectRatio="none" aria-hidden="true">
        <path id="ss-link" d="M150 210 C 340 210, 400 120, 500 120 C 600 120, 660 210, 850 210"
          stroke="rgba(255,255,255,0.45)" strokeWidth="2.5" strokeDasharray="7 8" className="ss-dash" />
        <circle r="5" fill="#fff" className="ss-pulse">
          <animateMotion dur="3s" repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="linear">
            <mpath href="#ss-link" />
          </animateMotion>
        </circle>
      </svg>

      {/* Centre: co-brand lockup + tagline */}
      <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* YouTube play badge */}
          <span className="ss-yt grid h-11 w-16 place-items-center rounded-xl sm:h-12 sm:w-[76px]">
            <svg width="22" height="22" viewBox="0 0 16 16" fill="#fff" aria-hidden="true"><path d="M5 3.4v9.2l7.5-4.6z" /></svg>
          </span>
          <span className="text-2xl font-semibold text-white/90 sm:text-3xl">×</span>
          {/* SponsorSync mark + wordmark */}
          <span className="flex items-center gap-2.5">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-lg font-bold text-brand sm:h-12 sm:w-12">S</span>
            <span className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">SponsorSync</span>
          </span>
        </div>
        <p className="mt-3 text-sm font-medium uppercase tracking-[0.22em] text-white/80 sm:text-base">
          Verified creator sponsorships
        </p>
      </div>

      {/* Centre sync badge with pulsing rings (sits on the link apex) */}
      <div className="absolute left-1/2 top-[30%] -translate-x-1/2 -translate-y-1/2 sm:top-[28%]">
        <span className="ss-ring absolute inset-0 rounded-full" />
        <span className="ss-ring ss-ring-2 absolute inset-0 rounded-full" />
        <span className="relative grid h-11 w-11 place-items-center rounded-full bg-white shadow-lg">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 12a8 8 0 0 1 13-6.2M20 12a8 8 0 0 1-13 6.2" stroke="var(--brand)" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M17 4v3.4h-3.4M7 20v-3.4h3.4" stroke="var(--brand)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>

      {/* Brand node (left) */}
      <div className="ss-float-a absolute left-[4%] top-[60%] w-[240px] max-w-[42%]">
        <div className="rounded-xl border border-white/25 bg-white/15 p-3 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-white text-sm font-bold text-brand">B</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">Your brand</p>
              <p className="truncate text-xs text-white/75">Verified sponsor</p>
            </div>
          </div>
        </div>
      </div>

      {/* Creator node (right) */}
      <div className="ss-float-b absolute right-[4%] top-[60%] w-[240px] max-w-[42%]">
        <div className="rounded-xl border border-white/25 bg-white/15 p-3 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-g-red">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="#fff" aria-hidden="true"><path d="M5 3.4v9.2l7.5-4.6z" /></svg>
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">YouTube Creators</p>
              <p className="truncate text-xs text-white/75">Verified · transparent rates</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating trust chips */}
      <div className="ss-float-c absolute right-[22%] top-[13%] hidden rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-success shadow sm:block">
        ✓ Verified
      </div>
      <div className="ss-float-d absolute left-[22%] top-[15%] hidden rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-brand shadow sm:block">
        AI match
      </div>

      <style>{`
        .ss-kv { background: #1a0730; }
        .ss-bg {
          background:
            radial-gradient(120% 140% at 15% 25%, rgba(87,6,140,0.95), transparent 60%),
            radial-gradient(120% 140% at 85% 20%, rgba(234,67,53,0.85), transparent 55%),
            radial-gradient(140% 140% at 60% 110%, rgba(66,133,244,0.85), transparent 55%),
            linear-gradient(120deg, #3b0a63, #57068c 45%, #7b1fa2);
          background-size: 200% 200%;
          animation: ss-sheen 12s ease-in-out infinite;
        }
        .ss-blob { width: 40%; height: 120%; border-radius: 9999px; filter: blur(46px); opacity: .5; }
        .ss-blob-a { background: rgba(234,67,53,.6); left: -8%; top: -20%; animation: ss-drift1 14s ease-in-out infinite; }
        .ss-blob-b { background: rgba(66,133,244,.55); right: -8%; bottom: -30%; animation: ss-drift2 16s ease-in-out infinite; }
        .ss-grain { background-image: radial-gradient(rgba(255,255,255,0.10) 1px, transparent 1px); background-size: 20px 20px; opacity: .45; }
        .ss-yt { background: #FF0033; box-shadow: 0 8px 20px rgba(255,0,51,.45); }

        .ss-ring { box-shadow: 0 0 0 2px rgba(255,255,255,.55) inset; animation: ss-ping 3s ease-out infinite; }
        .ss-ring-2 { animation-delay: 1.5s; }
        .ss-dash { animation: ss-dash 1.4s linear infinite; }

        .ss-float-a { animation: ss-floaty 6s ease-in-out infinite; }
        .ss-float-b { animation: ss-floaty 6s ease-in-out infinite; animation-delay: .8s; }
        .ss-float-c { animation: ss-floaty 5s ease-in-out infinite; animation-delay: .3s; }
        .ss-float-d { animation: ss-floaty 5.5s ease-in-out infinite; animation-delay: 1.1s; }

        @keyframes ss-sheen { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes ss-drift1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(14%,6%) scale(1.12); } }
        @keyframes ss-drift2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-12%,-6%) scale(1.1); } }
        @keyframes ss-floaty { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes ss-ping { 0% { transform: scale(1); opacity: .8; } 80%,100% { transform: scale(2.6); opacity: 0; } }
        @keyframes ss-dash { to { stroke-dashoffset: -30; } }

        @media (prefers-reduced-motion: reduce) {
          .ss-bg, .ss-blob-a, .ss-blob-b, .ss-ring, .ss-dash,
          .ss-float-a, .ss-float-b, .ss-float-c, .ss-float-d { animation: none; }
          .ss-pulse { display: none; }
        }
      `}</style>
    </div>
  );
}
