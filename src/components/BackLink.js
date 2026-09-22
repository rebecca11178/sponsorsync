"use client";

import { useRouter } from "next/navigation";

// A back control that returns to where you actually came from (so entering a
// deal from Campaigns goes back to Campaigns, not a hardcoded page). Falls back
// to `href` on a fresh/direct load with no in-app history.
export default function BackLink({ href, children, className = "" }) {
  const router = useRouter();
  function onClick(e) {
    if (typeof window !== "undefined" && window.history.length > 1) {
      e.preventDefault();
      router.back();
    }
  }
  return (
    <a href={href} onClick={onClick} className={className}>
      {children}
    </a>
  );
}
