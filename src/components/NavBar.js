"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { APP_NAME } from "@/lib/config";
import { useAuth } from "@/components/AuthProvider";
import Avatar from "@/components/Avatar";

const LINKS_BY_ROLE = {
  sponsor: [
    { href: "/creators", label: "Find Creators" },
    { href: "/match", label: "AI Match" },
    { href: "/campaigns", label: "Campaigns" },
    { href: "/dashboard", label: "Dashboard" },
  ],
  creator: [
    { href: "/creator", label: "Inbox" },
    { href: "/creator/collaborations", label: "Collaborations" },
    { href: "/creator/profile", label: "My Profile" },
  ],
  guest: [
    { href: "/creators", label: "Find Creators" },
    { href: "/match", label: "AI Match" },
  ],
};

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const role = user?.role || "guest";
  const links = LINKS_BY_ROLE[role];
  const profileHref = role === "creator" ? "/creator/profile" : "/sponsor/profile";

  const isActive = (href) => pathname === href || pathname.startsWith(href + "/");
  function signOut() {
    logout();
    setOpen(false);
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2.5 font-semibold text-foreground">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-white">S</span>
          <span className="text-lg tracking-tight">{APP_NAME}</span>
          <span className="hidden rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-muted md:inline">
            NYU SPS <span className="text-brand">×</span> Google
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 sm:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive(l.href) ? "bg-brand-soft text-brand" : "text-muted hover:text-foreground hover:bg-background"
              }`}>
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right: desktop user/login */}
        <div className="hidden items-center gap-3 sm:flex">
          {user ? (
            <>
              <Link href={profileHref} className="hidden items-center gap-2 text-sm hover:opacity-80 md:flex">
                <Avatar name={user.name} size={26} />
                <span className="font-medium">{user.name}</span>
                {user.verified && <span className="text-success">✓</span>}
              </Link>
              <button onClick={signOut} className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted hover:bg-background">Log out</button>
            </>
          ) : (
            <Link href="/login" className="rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark">Log in</Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen((v) => !v)} aria-label="Menu" aria-expanded={open}
          className="grid h-9 w-9 place-items-center rounded-lg border border-border text-foreground sm:hidden">
          <span className="text-lg leading-none">{open ? "✕" : "☰"}</span>
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="border-t border-border bg-surface sm:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            {user && (
              <Link href={profileHref} onClick={() => setOpen(false)} className="mb-1 flex items-center gap-2 px-1 pb-2 text-sm hover:opacity-80">
                <Avatar name={user.name} size={28} />
                <span className="font-medium">{user.name}</span>
                {user.verified && <span className="text-success">✓</span>}
              </Link>
            )}
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                  isActive(l.href) ? "bg-brand-soft text-brand" : "text-foreground hover:bg-background"
                }`}>
                {l.label}
              </Link>
            ))}
            <div className="my-1 border-t border-border" />
            {user ? (
              <button onClick={signOut} className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-muted hover:bg-background">Log out</button>
            ) : (
              <Link href="/login" onClick={() => setOpen(false)} className="rounded-lg bg-brand px-3 py-2.5 text-center text-sm font-semibold text-white">Log in</Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
