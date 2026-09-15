"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ACCOUNTS, findAccount, HOME_BY_ROLE } from "@/lib/accounts";
import { useAuth } from "@/components/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function signIn(account) {
    login(account);
    router.push(HOME_BY_ROLE[account.role] || "/");
  }

  function submit(e) {
    e.preventDefault();
    const acct = findAccount(email, password);
    if (!acct) return setError("Wrong email or password. Try one of the demo accounts below.");
    signIn(acct);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Log in</h1>
      <p className="mt-2 text-sm text-muted">Sign in as a sponsor (brand) or as a creator.</p>

      <form onSubmit={submit} className="mt-6 space-y-4 rounded-2xl border border-border bg-surface p-6">
        <div>
          <label className="text-sm font-medium">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com"
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand" />
        </div>
        <div>
          <label className="text-sm font-medium">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand" />
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <button className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">Log in</button>
      </form>

      {/* Demo quick-login */}
      <p className="mt-8 text-xs font-medium uppercase tracking-wide text-muted">Demo accounts — one click</p>
      <div className="mt-3 space-y-3">
        {ACCOUNTS.map((a) => (
          <button
            key={a.id}
            onClick={() => signIn(a)}
            className="flex w-full items-center gap-3 rounded-2xl border border-border bg-surface p-4 text-left hover:shadow-md"
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-soft text-2xl">{a.emoji}</span>
            <span className="flex-1">
              <span className="block font-medium">{a.name}</span>
              <span className="block text-xs text-muted">{a.role === "sponsor" ? "Company / brand side" : "Creator side"} · {a.email}</span>
            </span>
            <span className="text-sm font-medium text-brand">Log in →</span>
          </button>
        ))}
      </div>
      <p className="mt-4 text-center text-xs text-muted">
        Passwords: <code className="rounded bg-background px-1">sponsor123</code> / <code className="rounded bg-background px-1">creator123</code>
      </p>

      <p className="mt-6 text-center text-sm text-muted">
        New creator?{" "}
        <Link href="/creator/signup" className="font-medium text-brand hover:underline">Join here →</Link>
      </p>
    </div>
  );
}
