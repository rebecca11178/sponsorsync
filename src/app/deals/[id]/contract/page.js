"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getDeal, getCreator } from "@/lib/mockData";

export default function ContractPage() {
  const { id } = useParams();
  const deal = getDeal(id);
  const creator = deal ? getCreator(deal.creatorId) : null;

  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signed, setSigned] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const res = await fetch("/api/contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealId: id }),
      });
      const data = await res.json();
      if (alive) {
        setContract(data.contract);
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  if (!deal) return <div className="mx-auto max-w-3xl px-6 py-16">Deal not found.</div>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link href={`/deals/${deal.id}`} className="text-sm text-muted hover:text-foreground">← Back to chatroom</Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Contract</h1>
      <p className="mt-1 text-sm text-muted">
        Generated from your agreed terms with {creator.name}.{" "}
        <span className="text-brand">TODO(llm): draft with Gemini.</span>
      </p>

      {loading ? (
        <div className="mt-6 grid place-items-center rounded-2xl border border-border bg-surface p-16 text-sm text-muted">
          Drafting the agreement…
        </div>
      ) : (
        <>
          <article className="mt-6 rounded-2xl border border-border bg-surface p-8 shadow-sm">
            <h2 className="text-center text-lg font-semibold">{contract.title}</h2>
            <p className="mt-2 text-center text-sm text-muted">{contract.parties}</p>
            <div className="mt-6 space-y-4">
              {contract.clauses.map((c) => (
                <div key={c.heading}>
                  <h3 className="text-sm font-semibold">{c.heading}</h3>
                  <p className="mt-1 text-sm text-muted">{c.body}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 grid grid-cols-2 gap-6 border-t border-border pt-6 text-sm">
              <div>
                <div className={`h-10 ${signed ? "font-[cursive] text-lg text-foreground" : ""}`}>
                  {signed ? "BrightLeaf Tea Co." : ""}
                </div>
                <p className="border-t border-border pt-1 text-muted">Brand signature</p>
              </div>
              <div>
                <div className="h-10 text-muted">{signed ? "Pending creator…" : ""}</div>
                <p className="border-t border-border pt-1 text-muted">Creator signature</p>
              </div>
            </div>
          </article>

          {signed ? (
            <div className="mt-4 rounded-2xl border border-border bg-success-soft/50 p-4 text-sm">
              <p className="font-medium text-success">✓ Signed on your side — sent to {creator.name}.</p>
              <Link href={`/deals/${deal.id}/review`} className="mt-2 inline-block font-medium text-brand hover:underline">
                Skip ahead to order review →
              </Link>
            </div>
          ) : (
            <button onClick={() => setSigned(true)} className="mt-4 w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">
              Sign &amp; send to creator
            </button>
          )}
        </>
      )}
    </div>
  );
}
