"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import { currentSponsor, deals, getCreator, creatorProfileId } from "@/lib/mockData";
import { usd } from "@/lib/format";
import Avatar from "@/components/Avatar";

const STATUS_LABEL = {
  draft: "Draft",
  chatroom: "In discussion",
  contracted: "Contracted",
  in_production: "Filming",
  in_review: "In review",
  completed: "Completed",
};

function firstName(name = "") {
  return name.split(" ")[0] || name;
}

function QuickAction({ href, title, sub, primary }) {
  return (
    <Link
      href={href}
      className={`rounded-2xl border p-4 transition-colors ${
        primary
          ? "border-brand bg-brand text-white hover:bg-brand-dark"
          : "border-border bg-surface hover:bg-background"
      }`}
    >
      <p className="text-sm font-semibold">{title}</p>
      <p className={`mt-0.5 text-xs ${primary ? "text-white/80" : "text-muted"}`}>{sub}</p>
    </Link>
  );
}

// The logged-in home. Replaces the marketing landing page for signed-in users
// with a personalized workspace: greeting, quick actions, and their live work.
export default function WorkspaceHome() {
  const { user } = useAuth();
  const role = user?.role || "sponsor";

  if (role === "creator") return <CreatorWorkspace user={user} />;
  return <SponsorWorkspace user={user} />;
}

function SponsorWorkspace({ user }) {
  const mine = deals.filter((d) => d.sponsor === currentSponsor.company);
  const active = mine.filter((d) => ["chatroom", "contracted", "in_production", "in_review"].includes(d.status));
  const needsReview = mine.filter((d) => d.status === "in_review");
  const committed = mine.filter((d) => d.status !== "draft").reduce((s, d) => s + (d.amount || 0), 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center gap-4">
        <Avatar name={user?.name || currentSponsor.company} size={52} />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {firstName(user?.name || currentSponsor.company)}</h1>
          <p className="text-sm text-muted">
            {usd(committed)} committed across {mine.filter((d) => d.status !== "draft").length} campaigns
            {needsReview.length > 0 && <span className="text-warning"> · {needsReview.length} awaiting your review</span>}
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <QuickAction href="/match" title="New AI match" sub="Find creators from a brief" primary />
        <QuickAction href="/creators" title="Browse creators" sub="Transparent rate cards" />
        <QuickAction href="/campaigns" title="Campaigns" sub="Manage your deals" />
        <QuickAction href="/dashboard" title="Dashboard" sub="Pushes & activity" />
      </div>

      {/* Needs attention */}
      {needsReview.length > 0 && (
        <div className="mt-6 rounded-2xl border border-warning/40 bg-warning-soft/30 p-5">
          <p className="text-sm font-semibold text-warning">Needs your review</p>
          <div className="mt-3 space-y-2">
            {needsReview.map((d) => {
              const c = getCreator(d.creatorId);
              return (
                <Link key={d.id} href={`/deals/${d.id}/review`} className="flex items-center gap-3 rounded-xl bg-surface p-3 hover:shadow-sm">
                  <Avatar name={c?.name || "?"} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{c?.name}</p>
                    <p className="truncate text-xs text-muted">{d.deliverable?.title || d.package} · delivered</p>
                  </div>
                  <span className="shrink-0 text-sm font-medium text-brand">Review →</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Active campaigns */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Active campaigns</h2>
          <Link href="/campaigns" className="text-sm font-medium text-brand hover:underline">View all →</Link>
        </div>
        <div className="mt-3 space-y-2">
          {active.length === 0 && (
            <p className="rounded-2xl border border-border bg-surface p-6 text-center text-sm text-muted">
              No active campaigns yet. <Link href="/match" className="font-medium text-brand hover:underline">Start an AI match →</Link>
            </p>
          )}
          {active.map((d) => {
            const c = getCreator(d.creatorId);
            return (
              <Link key={d.id} href={`/deals/${d.id}`} className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 hover:shadow-md">
                <Avatar name={c?.name || "?"} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{c?.name}</p>
                  <p className="truncate text-xs text-muted">{d.package}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{usd(d.amount)}</p>
                  <p className="text-xs text-muted">{STATUS_LABEL[d.status]}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CreatorWorkspace({ user }) {
  const me = getCreator(creatorProfileId);
  const mine = deals.filter((d) => d.creatorId === creatorProfileId);
  const active = mine.filter((d) => ["chatroom", "contracted", "in_production", "in_review"].includes(d.status));
  const earned = mine.filter((d) => d.status === "completed").reduce((s, d) => s + (d.amount || 0), 0);
  const inReview = mine.filter((d) => d.status === "in_review");

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center gap-4">
        <Avatar name={user?.name || me.name} size={52} />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {firstName(user?.name || me.name)}</h1>
          <p className="text-sm text-muted">
            {usd(earned)} earned · {active.length} active collaboration{active.length === 1 ? "" : "s"}
            {inReview.length > 0 && <span className="text-warning"> · {inReview.length} awaiting brand approval</span>}
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
        <QuickAction href="/creator" title="Inbox" sub="New brand enquiries" primary />
        <QuickAction href="/creator/collaborations" title="Collaborations" sub="Track every deal" />
        <QuickAction href="/creator/profile" title="My profile" sub="Rates & positioning" />
      </div>

      {/* Active collaborations */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Active collaborations</h2>
          <Link href="/creator/collaborations" className="text-sm font-medium text-brand hover:underline">View all →</Link>
        </div>
        <div className="mt-3 space-y-2">
          {active.length === 0 && (
            <p className="rounded-2xl border border-border bg-surface p-6 text-center text-sm text-muted">
              No active collaborations. <Link href="/creator" className="font-medium text-brand hover:underline">Check your inbox →</Link>
            </p>
          )}
          {active.map((d) => (
            <Link key={d.id} href={`/deals/${d.id}`} className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 hover:shadow-md">
              <Avatar name={d.sponsor || "?"} size={40} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{d.sponsor}</p>
                <p className="truncate text-xs text-muted">{d.package}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{usd(d.amount)}</p>
                <p className="text-xs text-muted">{STATUS_LABEL[d.status]}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
