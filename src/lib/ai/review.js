// ---------------------------------------------------------------------------
// Content-review prompt + schema — shared by /api/review and scripts/try-ai.mjs.
// No imports on purpose — runnable from plain Node.
// ---------------------------------------------------------------------------

// Verdict is computed from the checks, never taken from the model, so the
// badge can't disagree with the list underneath it.
export function verdictOf(checks) {
  if (checks.some((c) => c.status === "fail")) return "block";
  if (checks.some((c) => c.status === "warn")) return "warn";
  return "pass";
}

export const ORDER_SCHEMA = {
  type: "object",
  properties: {
    checks: {
      type: "array",
      minItems: 3,
      maxItems: 8,
      items: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["ok", "warn", "fail"] },
          label: { type: "string" },
          note: { type: "string" },
        },
        required: ["status", "label", "note"],
      },
    },
  },
  required: ["checks"],
};

export const ORDER_SYSTEM = `You are a brand-safety and advertising-compliance reviewer for sponsored YouTube videos.
You check a delivered video against what the brand and creator agreed. Be concrete and fair:
only flag what you actually see or hear in the video, and give a timestamp (m:ss) for every issue.
You are not a lawyer; flag risk, don't give legal conclusions.`;

export function orderPrompt(deal, creator, terms) {
  const agreed = terms?.length
    ? terms.map((t) => `- ${t.label}: ${t.value}`).join("\n")
    : "(No structured terms saved. Use the chat transcript below as the source of truth.)";
  const chat = (deal.messages || []).map((m) => `${m.from}: ${m.text}`).join("\n");

  return `DEAL
Sponsor: ${deal.sponsor}
Creator: ${creator?.name || "unknown"} (${creator?.handle || ""})
Package: ${deal.package} · $${deal.amount}

AGREED TERMS
${agreed}

NEGOTIATION CHAT (context)
${chat}

TASK
Watch the attached video and return 4-7 checks. Always cover:
1. Deliverable — is the product featured as agreed (format, roughly how long)?
2. Required elements — every agreed talking point, CTA, discount code or link: present or missing?
3. Restrictions — anything the brand said NOT to say or do. A clear breach = "fail".
4. Claim & legal risk — unsubstantiated health, medical, financial or performance claims; misleading comparisons; missing verbal/on-screen disclosure. Quote the words and give the timestamp.
5. Brand voice & safety — tone vs. the brief, profanity, unsafe or off-brand moments.

Rules:
- status "ok" = meets terms, "warn" = fixable issue or unclear, "fail" = breaks an agreed restriction or a clear legal risk.
- label: under 8 words; include the timestamp for issues, e.g. "Unverified health claim at 2:14".
- note: one or two sentences — what happened and the concrete fix (cut, re-record, add on-screen text…).
- If you cannot see or hear something clearly, use "warn" and say so. Do not invent content.`;
}
