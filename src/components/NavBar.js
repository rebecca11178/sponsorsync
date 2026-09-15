"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { APP_NAME } from "@/lib/config";
import { useAuth } from "@/components/AuthProvider";

const LINKS_BY_ROLE = {
  sponsor: [
    { href: "/creators", label: "Find Creators" },
    { href: "/match", label: "AI Match" },
    { href: "/dashboard", label: "Dashboard" },
  ],
  creator: [
    { href: "/creator", label: "Inbox" },
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
  const role = user?.role || "guest";
  const links = LINKS_BY_ROLE[role];

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 font-semibold text-foreground">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-white">S</span>
          <span className="text-lg tracking-tight">{APP_NAME}</span>
          <span className="hidden rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-muted md:inline">
            NYU SPS <span className="text-brand">×</span> Google
          </span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {links.map((l) => {
            const active = pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active ? "bg-brand-soft text-brand" : "text-muted hover:text-foreground hover:bg-background"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden items-center gap-1.5 text-sm md:flex">
                <span>{user.emoji}</span>
                <span className="font-medium">{user.name}</span>
                {user.verified && <span className="text-success">✓</span>}
              </span>
              <button
                onClick={() => { logout(); router.push("/"); }}
                className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted hover:bg-background"
              >
                Log out
              </button>
            </>
          ) : (
            <Link href="/login" className="rounded-lg bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark">
              Log in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
