"use client";

import { useState } from "react";
import Link from "next/link";
import { enquiries as seed, getCreator, creatorProfileId } from "@/lib/mockData";
import { compact, usd } from "@/lib/format";

export default function CreatorInbox() {
  const me = getCreator(creatorProfileId);
  const [items, setItems] = useState(seed);
  const [hideUnverified, setHideUnverified] = useState(false);

  function setStatus(id, status) {
    setItems((list) => list.map((e) => (e.id === id ? { ...e, status } : e)));
  }

  const shown = hideUnverified ? items.filter((e) => e.verified) : items;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-4">
        <div className="grid h-14 w-14 place-items-center rounded-xl bg-brand-soft text-2xl">{me.emoji}</div>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">Creator inbox</h1>
          <p className="text-sm text-muted">{me.name} · {me.handle} · {compact(me.subscribers)} subscribers</p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between rounded-2xl border border-border bg-surface p-4">
        <p className="text-sm text-muted">
          Every enquiry shows if the brand is a <span className="font-medium text-success">verified business</span>. Scam DMs can&apos;t hide here.
        </p>
        <label className="flex shrink-0 cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" checked={hideUnverified} onChange={(e) => setHideUnverified(e.target.checked)} />
          Verified only
        </label>
      </div>

      <div className="mt-4 space-y-3">
        {shown.map((e) => (
          <div
            key={e.id}
            className={`rounded-2xl border bg-surface p-5 ${e.verified ? "border-border" : "border-danger/40 bg-danger-soft/20"}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{e.sponsor}</h3>
                  {e.verified ? (
                    <span className="rounded bg-success-soft px-1.5 py-0.5 text-[10px] font-semibold text-success">✓ Verified business</span>
                  ) : (
                    <span className="rounded bg-danger-soft px-1.5 py-0.5 text-[10px] font-semibold text-danger">⚠ Unverified</span>
                  )}
                </div>
                <p className="text-xs text-muted">{e.industry} · {e.package}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold">{usd(e.offer)}</p>
                <p className="text-xs text-muted">offered</p>
              </div>
            </div>

            <p className="mt-3 text-sm text-muted">“{e.message}”</p>

            {!e.verified && (
              <p className="mt-2 text-xs font-medium text-danger">
                This sender has no verified company email. We recommend declining.
              </p>
            )}

            <div className="mt-4 flex gap-2">
              {e.status === "new" && (
                <>
                  <button
                    onClick={() => setStatus(e.id, "accepted")}
                    disabled={!e.verified}
                    className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Accept &amp; start chat
                  </button>
                  <button
                    onClick={() => setStatus(e.id, "declined")}
                    className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-background"
                  >
                    Decline
                  </button>
                </>
              )}
              {e.status === "accepted" && (
                <>
                  <span className="flex items-center rounded-lg bg-success-soft px-3 py-2 text-sm font-medium text-success">✓ Accepted</span>
                  {e.dealId && (
                    <Link href={`/deals/${e.dealId}`} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
                      Open chatroom →
                    </Link>
                  )}
                </>
              )}
              {e.status === "declined" && <span className="rounded-lg bg-background px-3 py-2 text-sm font-medium text-muted">Declined</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
