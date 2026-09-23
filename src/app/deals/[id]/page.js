"use client";

import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getDeal, getCreator } from "@/lib/mockData";
import { usd } from "@/lib/format";
import { detectOffPlatform } from "@/lib/safety";
import StatusTimeline from "@/components/StatusTimeline";
import { useAuth } from "@/components/AuthProvider";
import Avatar from "@/components/Avatar";
import GeminiProgress from "@/components/GeminiProgress";
import BackLink from "@/components/BackLink";

const REPORT_REASONS = [
  "Trying to move the deal off-platform",
  "Asking to pay or be paid outside SponsorSync",
  "Spam or a suspected scam",
  "Inappropriate or abusive messages",
];

export default function DealChatroom() {
  const { id } = useParams();
  const search = useSearchParams();
  const { user } = useAuth();
  const role = user?.role || "sponsor"; // viewer perspective
  const deal = getDeal(id);
  // A freshly-created chatroom carries the package/price the sponsor just built.
  if (deal?.synthetic) {
    const pkg = search.get("pkg");
    const amount = search.get("amount");
    if (pkg) deal.package = pkg;
    if (amount && !Number.isNaN(Number(amount))) deal.amount = Number(amount);
  }
  const creator = deal ? getCreator(deal.creatorId) : null;

  // Who the viewer is talking TO (the counterparty).
  const counterparty =
    role === "creator"
      ? { name: deal?.sponsor || "Brand" }
      : { name: creator?.name };
  const backHref = role === "creator" ? "/creator" : "/dashboard";
  const backLabel = role === "creator" ? "← Back to inbox" : "← Back to dashboard";

  const [messages, setMessages] = useState(deal?.messages || []);
  const [draft, setDraft] = useState("");
  const [terms, setTerms] = useState(null);
  const [termsSource, setTermsSource] = useState(null);
  const [summarizing, setSummarizing] = useState(false);

  // Live deal head (package / price) — an accepted offer updates these.
  const [dealPackage, setDealPackage] = useState(deal?.package || "");
  const [dealAmount, setDealAmount] = useState(deal?.amount || 0);

  // Price-offer composer
  const [offerOpen, setOfferOpen] = useState(false);
  const [offerPkg, setOfferPkg] = useState(deal?.package || "");
  const [offerAmount, setOfferAmount] = useState(deal?.amount || 0);
  const [offerNote, setOfferNote] = useState("");

  // Report
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState(REPORT_REASONS[0]);
  const [reported, setReported] = useState(false);

  // Gemini safety monitor — flags off-platform contact attempts in the thread.
  const safety = useMemo(() => detectOffPlatform(messages), [messages]);

  if (!deal) return <div className="mx-auto max-w-3xl px-6 py-16">Deal not found.</div>;

  function send(e) {
    e.preventDefault();
    if (!draft.trim()) return;
    setMessages((m) => [...m, { from: role, text: draft.trim(), time: "now" }]);
    setDraft("");
  }

  function sendOffer(e) {
    e.preventDefault();
    const amt = Number(offerAmount);
    if (!offerPkg.trim() || Number.isNaN(amt) || amt <= 0) return;
    setMessages((m) => [
      ...m,
      { from: role, type: "offer", time: "now", offer: { package: offerPkg.trim(), amount: amt, note: offerNote.trim(), accepted: false } },
    ]);
    setOfferOpen(false);
    setOfferNote("");
  }

  function acceptOffer(idx) {
    setMessages((m) => {
      const copy = m.map((msg, i) => (i === idx ? { ...msg, offer: { ...msg.offer, accepted: true } } : msg));
      const o = m[idx].offer;
      copy.push({ from: "system", type: "system", time: "now", text: `Offer accepted — ${o.package} for ${usd(o.amount)}.` });
      return copy;
    });
    const o = messages[idx].offer;
    setDealPackage(o.package);
    setDealAmount(o.amount);
  }

  function submitReport(e) {
    e.preventDefault();
    setReported(true);
    setReportOpen(false);
  }

  async function summarize() {
    setSummarizing(true);
    setTerms(null);
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: messages.filter((m) => m.text), dealId: deal.id }),
      });
      const data = await res.json();
      setTerms(data.terms);
      setTermsSource(data.source);
    } finally {
      setSummarizing(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <BackLink href={backHref} className="text-sm text-muted hover:text-foreground">{backLabel}</BackLink>

      <div className="mt-4 rounded-2xl border border-border bg-surface p-5">
        <StatusTimeline current={deal.status} />
        <div className="mt-4 flex justify-end border-t border-border pt-3">
          <Link href={`/deals/${deal.id}/performance`} className="text-sm font-medium text-brand hover:underline">
            View campaign performance →
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Chat */}
        <div className="relative flex h-[560px] flex-col rounded-2xl border border-border bg-surface">
          <div className="flex items-center gap-3 border-b border-border p-4">
            <Avatar name={counterparty.name} size={40} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{counterparty.name}</p>
              <p className="truncate text-xs text-muted">{dealPackage} · {usd(dealAmount)}</p>
            </div>
            {/* Report */}
            {reported ? (
              <span className="shrink-0 rounded-lg bg-warning-soft px-2.5 py-1 text-xs font-medium text-warning">Reported</span>
            ) : (
              <button onClick={() => setReportOpen((v) => !v)}
                className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-muted hover:bg-background">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 21V4h13l-2 4 2 4H4" /></svg>
                Report
              </button>
            )}
          </div>

          {/* Report panel */}
          {reportOpen && (
            <form onSubmit={submitReport} className="absolute right-3 top-16 z-10 w-72 rounded-xl border border-border bg-surface p-4 shadow-xl">
              <p className="text-sm font-semibold">Report this conversation</p>
              <p className="mt-0.5 text-xs text-muted">Our Trust &amp; Safety team reviews every report.</p>
              <div className="mt-3 space-y-1.5">
                {REPORT_REASONS.map((r) => (
                  <label key={r} className="flex items-start gap-2 text-xs">
                    <input type="radio" name="reason" checked={reportReason === r} onChange={() => setReportReason(r)} className="mt-0.5" />
                    <span>{r}</span>
                  </label>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <button type="submit" className="flex-1 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark">Submit report</button>
                <button type="button" onClick={() => setReportOpen(false)} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-background">Cancel</button>
              </div>
            </form>
          )}

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => {
              if (m.type === "system") {
                return (
                  <div key={i} className="flex justify-center">
                    <span className="rounded-full bg-background px-3 py-1 text-[11px] text-muted">{m.text}</span>
                  </div>
                );
              }
              if (m.type === "offer") {
                return <OfferCard key={i} m={m} mine={m.from === role} onAccept={() => acceptOffer(i)} />;
              }
              return (
                <div key={i} className={`flex ${m.from === role ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${m.from === role ? "bg-brand text-white" : "bg-background text-foreground"}`}>
                    {m.text}
                    <span className={`mt-1 block text-[10px] ${m.from === role ? "text-white/70" : "text-muted"}`}>{m.time}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Gemini safety monitor banner */}
          {safety.flagged && !reported && (
            <div className="mx-3 mb-1 flex items-start gap-2 rounded-lg border border-warning/40 bg-warning-soft/50 px-3 py-2">
              <svg className="mt-0.5 shrink-0 text-warning" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" /></svg>
              <p className="text-[11px] leading-snug text-warning">
                <span className="font-semibold">To protect your rights, please don&apos;t take the deal off-platform.</span>{" "}
                Keep all messages and payment on SponsorSync — off-platform contact isn&apos;t covered by our protections.
                <span className="ml-1 rounded-full bg-warning/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide">Gemini safety monitor</span>
              </p>
            </div>
          )}

          {/* Offer composer */}
          {offerOpen && (
            <form onSubmit={sendOffer} className="mx-3 mb-2 rounded-xl border border-brand/40 bg-brand-soft/40 p-3">
              <p className="text-xs font-semibold text-brand">Send a price offer</p>
              <div className="mt-2 grid grid-cols-[1fr_120px] gap-2">
                <input value={offerPkg} onChange={(e) => setOfferPkg(e.target.value)} placeholder="Package (e.g. Dedicated video)"
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand" />
                <div className="flex items-center rounded-lg border border-border bg-background px-2 focus-within:border-brand">
                  <span className="text-sm text-muted">$</span>
                  <input type="number" value={offerAmount} onChange={(e) => setOfferAmount(e.target.value)} placeholder="0"
                    className="w-full bg-transparent px-1 py-2 text-right text-sm outline-none" />
                </div>
              </div>
              <input value={offerNote} onChange={(e) => setOfferNote(e.target.value)} placeholder="Note (optional) — what changed"
                className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand" />
              <div className="mt-2 flex gap-2">
                <button type="submit" className="rounded-lg bg-brand px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark">Send offer</button>
                <button type="button" onClick={() => setOfferOpen(false)} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-background">Cancel</button>
              </div>
            </form>
          )}

          {/* Composer */}
          <form onSubmit={send} className="flex items-center gap-2 border-t border-border p-3">
            <button type="button" onClick={() => setOfferOpen((v) => !v)} title="Send a price offer"
              className="flex shrink-0 items-center gap-1 rounded-lg border border-border px-2.5 py-2 text-sm font-medium text-brand hover:bg-brand-soft">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
              Offer
            </button>
            <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type a message…"
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand" />
            <button className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">Send</button>
          </form>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {reported && (
            <div className="rounded-2xl border border-warning/40 bg-warning-soft/40 p-4">
              <p className="text-sm font-medium text-warning">Reported to Trust &amp; Safety</p>
              <p className="mt-1 text-xs text-muted">Thanks — our team will review this conversation. Keep everything on-platform while we look into it.</p>
            </div>
          )}

          <div className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="font-semibold">Collaboration terms</h2>
            <p className="mt-1 text-xs text-muted">
              Gemini reads the chat and pulls out the agreed details, so nothing gets lost before the contract.
            </p>
            <button onClick={summarize} disabled={summarizing}
              className="mt-3 w-full rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
              {summarizing ? "Summarizing…" : "Summarize with Gemini"}
            </button>
            {summarizing && (
              <GeminiProgress className="mt-3" stages={["Reading the conversation…", "Extracting agreed terms…", "Flagging open questions…"]} note="Gemini is reading the chat — a few seconds." />
            )}

            {termsSource === "deal-record" && (<p className="mt-3 rounded-lg bg-warning-soft px-3 py-2 text-xs text-warning">Gemini is unavailable. These are the terms already saved on this deal, not a summary of this chat.</p>)}
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

function OfferCard({ m, mine, onAccept }) {
  const o = m.offer;
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div className="w-[78%] max-w-[300px] overflow-hidden rounded-2xl border border-brand/40 bg-surface">
        <div className="flex items-center justify-between bg-brand-soft px-3.5 py-2">
          <span className="text-xs font-semibold text-brand">Price offer</span>
          {o.accepted && <span className="rounded-full bg-success-soft px-2 py-0.5 text-[10px] font-semibold text-success">Accepted</span>}
        </div>
        <div className="px-3.5 py-3">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm font-medium">{o.package}</span>
            <span className="text-lg font-semibold">{usd(o.amount)}</span>
          </div>
          {o.note && <p className="mt-1 text-xs text-muted">{o.note}</p>}
          {!o.accepted && (
            mine ? (
              <p className="mt-2 text-[11px] text-muted">Offer sent — awaiting their response.</p>
            ) : (
              <button onClick={onAccept} className="mt-2.5 w-full rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark">
                Accept offer
              </button>
            )
          )}
        </div>
        <span className="block px-3.5 pb-2 text-[10px] text-muted">{m.time}</span>
      </div>
    </div>
  );
}
