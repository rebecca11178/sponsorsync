// Creator vetting — screen a creator's PAST sponsored video BEFORE signing.
// No contract exists yet, so we ask "is this creator a compliance risk to
// sponsor at all" against general FTC / YouTube standards. That works on any
// real video, unlike review-against-a-contract.

export const VET_SCHEMA = {
  type: "object",
  properties: {
    isSponsored: { type: "boolean" },
    summary: { type: "string" },
    checks: {
      type: "array",
      minItems: 4,
      maxItems: 7,
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
  required: ["isSponsored", "summary", "checks"],
};

export const VET_SYSTEM = `You screen YouTube creators for brands that are deciding whether to sponsor them.
You watch one of the creator's own videos and judge how safely they handle brand work in general.
Judge only what you actually see or hear, give a timestamp (m:ss) for every issue, and do not assume a
sponsorship exists if none is shown. You are not a lawyer: you flag risk, you do not give legal conclusions.`;

export function vetPrompt(video) {
  return `VIDEO
Title: ${video?.title || "(unknown)"}
YouTube "includes paid promotion" flag: ${video?.hasPaidPromotion === true ? "on" : video?.hasPaidPromotion === false ? "off" : "not reported"}

TASK
Watch the video and return 4-6 checks covering:
1. Disclosure — if anything is promoted, is it disclosed verbally and/or on screen, and how early?
   A promotion with no disclosure is "fail". No promotion at all is "ok" with a note saying so.
2. Claims — health, medical, financial or performance claims about any product. Quote the words and timestamp them.
3. Comparisons — knocking a named competitor, or "best"/"#1" claims presented as fact.
4. Brand safety — profanity, unsafe acts, adult or political content a sponsor would object to.
5. Integration quality — woven in naturally, or a bolted-on ad read?
6. Audience suitability — anything suggesting a significant under-18 audience.

Rules:
- "ok" = no concern, "warn" = a sponsor should ask about it, "fail" = a clear FTC/YouTube-policy problem.
- label: under 8 words, with a timestamp when there is an issue.
- note: one or two sentences — what happened and what a brand should do about it.
- summary: one sentence a brand manager can act on.
- isSponsored: true only if the video actually promotes a product or brand.
- If you cannot hear or see something clearly, use "warn" and say so. Never invent content.`;
}

// Risk is computed here, not by the model, so the badge matches the checks.
export function riskOf(checks) {
  if (checks.some((c) => c.status === "fail")) return "high";
  if (checks.filter((c) => c.status === "warn").length >= 2) return "medium";
  if (checks.some((c) => c.status === "warn")) return "low-medium";
  return "low";
}
