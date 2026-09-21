"use client";

import { useState } from "react";
import Link from "next/link";

// Company-email verification (mock).
// TODO(api): send a real verification email + check the domain is a business
// domain (reject gmail/outlook/etc.) before granting the "Verified Sponsor" badge.
const FREE_DOMAINS = ["gmail.com", "outlook.com", "hotmail.com", "yahoo.com", "icloud.com"];

export default function SponsorSignup() {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [state, setState] = useState("idle"); // idle | sent | verified | error
  const [error, setError] = useState("");

  function submit(e) {
    e.preventDefault();
    const domain = email.split("@")[1]?.toLowerCase() || "";
    if (!domain) return setError("Enter a valid email.");
    if (FREE_DOMAINS.includes(domain)) {
      setState("error");
      setError("Please use your company email — free inboxes can't be verified as a business.");
      return;
    }
    setError("");
    setState("sent"); // In production this is where the verification email fires.
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Verify your business</h1>
      <p className="mt-2 text-sm text-muted">
        We verify sponsors by company email so creators know you&apos;re a real brand — not a scam DM.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-4 rounded-2xl border border-border bg-surface p-6">
        <div>
          <label className="text-sm font-medium">Company name</label>
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="BrightLeaf Tea Co."
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Company email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@yourbusiness.com"
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand"
          />
          <p className="mt-1 text-xs text-muted">Free inboxes (gmail, outlook…) are rejected.</p>
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <button className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">
          Send verification link
        </button>
      </form>

      {state === "sent" && (
        <div className="mt-6 rounded-2xl border border-border bg-success-soft/50 p-5">
          <p className="text-sm font-medium text-success">✓ Verification link sent to {email}</p>
          <p className="mt-1 text-sm text-muted">
            (Prototype) In the real product you&apos;d click the emailed link. For the demo, continue as verified:
          </p>
          <Link href="/creators" className="mt-3 inline-block rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
            Continue as Verified Sponsor →
          </Link>
        </div>
      )}
    </div>
  );
}
