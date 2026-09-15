"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getDeal, getCreator } from "@/lib/mockData";
import { usd } from "@/lib/format";
import StatusTimeline from "@/components/StatusTimeline";

export default function DealChatroom() {
  const { id } = useParams();
  const deal = getDeal(id);
  const creator = deal ? getCreator(deal.creatorId) : null;

  const [messages, setMessages] = useState(deal?.messages || []);
  const [draft, setDraft] = useState("");
  const [terms, setTerms] = useState(null);
  const [summarizing, setSummarizing] = useState(false);

  if (!deal) return <div className="mx-auto max-w-3xl px-6 py-16">Deal not found.</div>;

  function send(e) {
    e.preventDefault();
    if (!draft.trim()) return;
    setMessages((m) => [...m, { from: "sponsor", text: draft.trim(), time: "now" }]);
    setDraft("");
  }

  async function summarize() {
    setSummarizing(true);
    setTerms(null);
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });
      const data = await res.json();
      setTerms(data.terms);
    } finally {
      setSummarizing(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Link href="/dashboard" className="text-sm text-muted hover:text-foreground">← Back to dashboard</Link>

      <div className="mt-4 rounded-2xl border border-border bg-surface p-5">
        <StatusTimeline current={deal.status} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Chat */}
        <div className="flex h-[540px] flex-col rounded-2xl border border-border bg-surface">
          <div className="flex items-center gap-3 border-b border-border p-4">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand-soft text-xl">{creator.emoji}</div>
            <div>
              <p className="font-medium">{creator.name}</p>
              <p className="text-xs text-muted">{deal.package} · {usd(deal.amount)}</p>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === "sponsor" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                  m.from === "sponsor" ? "bg-brand text-white" : "bg-background text-foreground"
                }`}>
                  {m.text}
                  <span className={`mt-1 block text-[10px] ${m.from === "sponsor" ? "text-white/70" : "text-muted"}`}>{m.time}</span>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={send} className="flex gap-2 border-t border-border p-3">
            <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type a message…"
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand" />
            <button className="rounded-lg bg-brand px-4 text-sm font-semibold text-white hover:bg-brand-dark">Send</button>
          </form>
        </div>

        {/* Gemini terms panel */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="font-semibold">Collaboration terms</h2>
            <p className="mt-1 text-xs text-muted">
              Gemini reads the chat and pulls out the agreed details, so nothing gets lost before the contract.
            </p>
            <button onClick={summarize} disabled={summarizing}
              className="mt-3 w-full rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
              {summarizing ? "Reading chat…" : "✨ Summarize with Gemini"}
            </button>

            {terms && (
              <dl className="mt-4 space-y-2 text-sm">
                {terms.map((t) => (
                  <div key={t.label} className="flex justify-between gap-3 border-t border-border pt-2">
                    <dt className="text-muted">{t.label}</dt>
                    <dd className="text-right font-medium">{t.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          {terms && (
            <>
              <Link href={`/deals/${deal.id}/contract`} className="block rounded-2xl border border-brand bg-brand-soft p-5 hover:shadow-md">
                <p className="font-medium text-brand">Generate contract →</p>
                <p className="mt-1 text-sm text-muted">Turn these terms into a signable agreement with multi-activation terms.</p>
              </Link>
              <Link href={`/deals/${deal.id}/review`} className="block rounded-2xl border border-border bg-surface p-5 hover:shadow-md">
                <p className="font-medium">Video delivered? →</p>
                <p className="mt-1 text-sm text-muted">Run the AI order review against these terms.</p>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
