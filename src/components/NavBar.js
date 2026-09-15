"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_NAME } from "@/lib/config";
import { currentSponsor } from "@/lib/mockData";

const links = [
  { href: "/creators", label: "Find Creators" },
  { href: "/match", label: "AI Match" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function NavBar() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-white">S</span>
          <span className="text-lg tracking-tight">{APP_NAME}</span>
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
          {currentSponsor.verified && (
            <span className="hidden items-center gap-1 rounded-full bg-success-soft px-2.5 py-1 text-xs font-medium text-success sm:flex">
              ✓ Verified Sponsor
            </span>
          )}
          <span className="hidden text-sm text-muted md:inline">{currentSponsor.company}</span>
        </div>
      </div>
    </header>
  );
}
