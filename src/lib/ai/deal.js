// ---------------------------------------------------------------------------
// Deal-room AI: chat → agreed terms → draft contract.
// Shared by /api/summarize, /api/contract and scripts/try-ai.mjs.
// No imports on purpose — runnable from plain Node.
// ---------------------------------------------------------------------------

// Fixed label set: the chat panel keys rows by label, and /api/review reads the
// same terms, so the vocabulary has to stay stable across runs.
export const TERM_LABELS = [
  "Deliverable", "Base price", "Add-on", "Timeline",
  "Creative control", "Restrictions", "Disclosure",
];

export const SUMMARIZE_SCHEMA = {
  type: "object",
  properties: {
    terms: {
      type: "array",
      minItems: 1,
      maxItems: TERM_LABELS.length,
      items: {
        type: "object",
        properties: {
          label: { type: "string", enum: TERM_LABELS },
          value: { type: "string" },
          agreed: { type: "boolean" },
        },
        required: ["label", "value", "agreed"],
      },
    },
    openQuestions: { type: "array", items: { type: "string" }, maxItems: 4 },
  },
  required: ["terms", "openQuestions"],
};

export const SUMMARIZE_SYSTEM = `You extract what a brand and a creator actually agreed in a chat.
You are a note-taker, not a negotiator: never invent a number, a date or a condition that isn't in the messages.
If something was proposed but not accepted, mark agreed:false and say so in the value.`;

export function summarizePrompt(messages, deal) {
  const chat = messages.map((m) => `${m.from}: ${m.text}`).join("\n");
  const ctx = deal ? `CONTEXT (from the deal record)\nSponsor: ${deal.sponsor} · Package: ${deal.package} · Amount: $${deal.amount}\n\n` : "";
  return `${ctx}CHAT
${chat}

Extract the agreed terms using ONLY these labels: ${TERM_LABELS.join(", ")}.
- value: short and concrete ("$2,500", "1 dedicated video", "~3 weeks"). Money keeps its currency symbol.
- agreed: true only if both sides accepted it in the chat. If one side proposed it and the other never
  responded, agreed:false and the value starts with "Proposed: ".
- Leave out a label entirely when the chat says nothing about it — do not fill it with a guess or "N/A".
- openQuestions: anything still unsettled that should be agreed before signing (empty array if none).`;
}

export const CONTRACT_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    parties: { type: "string" },
    clauses: {
      type: "array",
      minItems: 5,
      maxItems: 9,
      items: {
        type: "object",
        properties: { heading: { type: "string" }, body: { type: "string" } },
        required: ["heading", "body"],
      },
    },
    flags: { type: "array", items: { type: "string" }, maxItems: 4 },
  },
  required: ["title", "parties", "clauses", "flags"],
};

export const CONTRACT_SYSTEM = `You draft short, plain-English creator sponsorship agreements for small businesses.
Every clause must trace back to a term the two sides agreed. You are not a lawyer and the draft is not legal advice:
where a normal agreement would need something the parties never discussed, leave a clearly marked [TO CONFIRM] blank
instead of inventing terms.`;

export function contractPrompt(deal, creator, terms) {
  const agreed = (terms || []).map((t) => `- ${t.label}: ${t.value}${t.agreed === false ? " (NOT yet agreed)" : ""}`).join("\n");
  return `PARTIES
Brand: ${deal?.sponsor || "[TO CONFIRM]"}
Creator: ${creator?.name || "[TO CONFIRM]"} (${creator?.handle || ""})

AGREED TERMS
${agreed || "(none captured — use [TO CONFIRM] blanks)"}

Draft the agreement as 6-8 numbered clauses. Cover, in this order and only where the terms support it:
deliverable · fee and payment split · timeline · creative control · compliance and disclosure
(YouTube paid-promotion toggle, plus any claims the creator agreed not to make) · ad/usage rights.
Then add a final "Multi-activation" clause: up to two further activations within 6 months at the same rates,
executed by a one-line addendum instead of a new contract.
- body: 1-2 sentences of plain English. Put every number exactly as agreed.
- Anything the terms don't cover becomes [TO CONFIRM] — never a guessed number or date.
- flags: short warnings for the brand (terms not yet agreed, blanks left, anything risky). Empty array if none.`;
}
