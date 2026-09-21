"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getDeal, getCreator } from "@/lib/mockData";
import GeminiProgress from "@/components/GeminiProgress";

export default function OrderReview() {
  const { id } = useParams();
  const deal = getDeal(id);
  const creator = deal ? getCreator(deal.creatorId) : null;

  const [videoUrl, setVideoUrl] = useState("https://youtube.com/watch?v=demo");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);

  if (!deal) return <div className="mx-auto max-w-3xl px-6 py-16">Deal not found.</div>;

  async function runReview() {
    setRunning(true);
    setResult(null);
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealId: deal.id, videoUrl }),
      });
      setResult(await res.json());
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link href={`/deals/${deal.id}`} className="text-sm text-muted hover:text-foreground">← Back to chatroom</Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Order review</h1>
      <p className="mt-1 text-sm text-muted">
        {creator.name}&apos;s delivery for &ldquo;{deal.package}&rdquo;. Two checks run before you approve.
      </p>

      <div className="mt-6 flex gap-2 rounded-2xl border border-border bg-surface p-4">
        <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)}
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand" />
        <button onClick={runReview} disabled={running}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
          {running ? "Reviewing…" : "Run review"}
        </button>
      </div>

      {running && (
        <div className="mt-4 rounded-2xl border border-border bg-surface p-5">
          <GeminiProgress
            stages={["Fetching the video from YouTube…", "Watching the video…", "Checking claims & disclosure…", "Matching against the contract…", "Writing the review…"]}
            note="Gemini is watching the full video — this can take a minute or two."
          />
        </div>
      )}

      {result && (
        <div className="mt-6 space-y-4">
          {/* Label sample output honestly (P0-1 / P0-5) */}
          {(result.source?.platform !== "youtube" || result.source?.order !== "gemini") && (
            <p className="rounded-lg bg-warning-soft px-3 py-2 text-xs text-warning">
              {result.source?.platform !== "youtube" && result.source?.order !== "gemini"
                ? "Sample result for demo — paste a public YouTube link to run the real review."
                : result.source?.order !== "gemini"
                  ? "Platform check is live; the AI content review is unavailable, so a sample is shown."
                  : "AI content review is live; platform metadata was unavailable, so a sample check is shown."}
            </p>
          )}
          {/* Platform compliance */}
          <ReviewCard
            title="Platform compliance check"
            subtitle="Does the video meet YouTube's paid-promotion & policy rules so it can go live?"
            verdict={result.platform.verdict}
            items={result.platform.checks}
          />
          {/* Gemini order review */}
          <ReviewCard
            title="AI order review (Gemini)"
            subtitle="Content vs. your brief + contract terms — with fix suggestions."
            verdict={result.order.verdict}
            items={result.order.checks}
          />
        </div>
      )}
    </div>
  );
}

function ReviewCard({ title, subtitle, verdict, items }) {
  const tone =
    verdict === "pass" ? { bg: "bg-success-soft", text: "text-success", label: "Passed" }
    : verdict === "warn" ? { bg: "bg-warning-soft", text: "text-warning", label: "Needs changes" }
    : { bg: "bg-danger-soft", text: "text-danger", label: "Blocked" };

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">{title}</h2>
          <p className="mt-0.5 text-xs text-muted">{subtitle}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${tone.bg} ${tone.text}`}>{tone.label}</span>
      </div>
      <ul className="mt-4 space-y-2.5">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2.5 text-sm">
            <span className={
              it.status === "ok" ? "text-success" : it.status === "warn" ? "text-warning" : "text-danger"
            }>
              {it.status === "ok" ? "✓" : it.status === "warn" ? "!" : "✕"}
            </span>
            <div>
              <p className="font-medium">{it.label}</p>
              {it.note && <p className="text-xs text-muted">{it.note}</p>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
