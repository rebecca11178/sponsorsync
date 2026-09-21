"use client";

import { useEffect, useState } from "react";

// A reassuring animated progress bar for slow Gemini / real-API calls.
// Mount it while the request is in flight (render it conditionally on a
// `loading` flag) and unmount it when the result arrives — it self-animates
// from ~6% toward ~93% and cycles through `stages` so the wait feels shorter.
export default function GeminiProgress({ stages, note = "Gemini is analysing — this can take up to a minute.", className = "" }) {
  const S = stages && stages.length ? stages : ["Working…"];
  const [progress, setProgress] = useState(6);
  const [i, setI] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => {
      setProgress((p) => Math.min(93, p + (p < 60 ? 4 : 2)));
      setI((x) => (Math.random() < 0.4 ? Math.min(S.length - 1, x + 1) : x));
    }, 850);
    return () => clearInterval(iv);
  }, [S.length]);

  return (
    <div className={className}>
      <div className="flex items-center justify-between text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />
          {S[i]}
        </span>
        <span>{progress}%</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-background">
        <div className="h-full rounded-full bg-brand transition-[width] duration-700 ease-out" style={{ width: `${progress}%` }} />
      </div>
      {note && <p className="mt-1.5 text-[11px] text-muted">{note}</p>}
    </div>
  );
}
