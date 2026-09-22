// Historical risk-control profile for a creator.
//
// Our roster is fictional and has no real YouTube channel to analyse, so a live
// Gemini vet would return the same generic verdict for everyone. To make the
// pre-deal risk screen realistic and DIFFERENT per creator, we derive a stable
// "commercial track record" for each one from signals we already store
// (brand-safety score, niche, tier, past-sponsorship history). The output is
// deterministic — seeded by the creator's slug — so a creator always shows the
// same history, but the 50 creators differ from each other.
//
// This is demo data, clearly labelled as such in the UI. When a creator has a
// real `youtubeHandle` and the Gemini + YouTube keys are on, the live analysis
// takes precedence over this profile (see /api/vet).

// --- deterministic PRNG (so each creator's history is stable) ---------------
function seedFrom(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function makeRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
const chance = (rng, p) => rng() < p;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function recentMonth(rng) {
  // Some month in the last ~14 months (demo timeframe up to 2026).
  const back = 1 + Math.floor(rng() * 14);
  const d = new Date(2026, 8 - back, 1); // anchor near "now" in the demo
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

// --- niche-specific things a brand should watch for -------------------------
// Keyed by loose niche matching so we don't need an exact taxonomy.
function nicheWatch(niche = "") {
  const n = niche.toLowerCase();
  if (/health|fitness|wellness|lifestyle/.test(n))
    return { label: "Health & performance claims", note: "Talks about energy, recovery and results — keep any product claim to what's on the label, no medical framing.", cats: ["Supplements", "Medical / health devices"] };
  if (/tech|review|gadget/.test(n))
    return { label: "Superlatives & competitor comparisons", note: "Uses \"best\"/\"#1\" and names rival products in reviews — fine as opinion, but avoid it inside a category-exclusive deal.", cats: ["Direct competitors", "Crypto / trading apps"] };
  if (/gaming|game/.test(n))
    return { label: "Profanity & audience age", note: "Occasional strong language and a younger-skewing audience — confirm the under-18 share before youth-sensitive products.", cats: ["Gambling / loot-box", "Alcohol"] };
  if (/finance|money|business/.test(n))
    return { label: "Financial claims", note: "Discusses returns and savings — anything implying guaranteed outcomes is a disclosure risk.", cats: ["Trading / crypto", "Get-rich-quick offers"] };
  if (/food|beverage|cooking|kitchen/.test(n))
    return { label: "Health framing on food", note: "Sometimes calls foods \"clean\" or \"guilt-free\" — keep away from health/weight claims.", cats: ["Weight-loss", "Alcohol"] };
  if (/fashion|beauty|makeup/.test(n))
    return { label: "Before/after & skin claims", note: "Uses before/after visuals — cosmetic claims must avoid implying a medical effect.", cats: ["Cosmetic procedures", "Rx skincare"] };
  return { label: "General brand-safety", note: "No category-specific concern on file; standard FTC disclosure still applies.", cats: ["Politics", "Gambling"] };
}

// --- past-incident pool (written like real sponsorship situations) ----------
const INCIDENTS = {
  disclosure: (rng) => pick(rng, [
    (m) => ({ status: "warn", label: `Late disclosure once (${m})`, note: `On one sponsored upload the "paid promotion" tag was added a few hours after publishing. The brand asked for it up front next time; creator complied.` }),
    (m) => ({ status: "warn", label: `Verbal-only disclosure (${m})`, note: `Said "thanks to my sponsor" but the on-screen "Includes paid promotion" flag was missing on one video. Now uses both.` }),
  ]),
  claim: (rng) => pick(rng, [
    (m) => ({ status: "warn", label: `Unscripted product claim (${m})`, note: `Ad-libbed that a product "basically fixed" a problem; the brand requested a re-edit to soften it. Resolved before payment.` }),
    (m) => ({ status: "warn", label: `Off-brief benefit line (${m})`, note: `Went beyond the approved talking points with a stronger benefit claim. Creator re-recorded the segment.` }),
  ]),
  exclusivity: (rng) => pick(rng, [
    (m) => ({ status: "warn", label: `Category overlap flagged (${m})`, note: `Featured a competing product ~3 weeks before a category-exclusive deal started. Caught in scheduling review; the two brands didn't overlap on air.` }),
  ]),
  delivery: (rng) => pick(rng, [
    (m) => ({ status: "warn", label: `Delivered late once (${m})`, note: `A sponsored video slipped past the agreed go-live by a few days. Communicated ahead of time; brand agreed to the new date.` }),
  ]),
  serious: (rng) => pick(rng, [
    (m) => ({ status: "fail", label: `Missed disclosure, disputed (${m})`, note: `A paid integration ran with no disclosure at all; a brand raised it and the video was updated after the fact. Worth confirming a disclosure checklist before signing.` }),
    (m) => ({ status: "fail", label: `Refund dispute on a deal (${m})`, note: `One past deal ended in a partial refund over deliverables that didn't match the brief. Recommend a clear scope and milestone sign-off.` }),
  ]),
};

// --- main derivation --------------------------------------------------------
export function deriveRiskHistory(creator) {
  if (!creator) return null;
  const rng = makeRng(seedFrom(creator.slug || creator.id || creator.name || "x"));
  const bs = creator.brandSafety ?? 90; // 85..98 in the roster
  const sponsoredPast = (creator.recentVideos || []).filter((v) => v.hadSponsor).length;

  // Track record numbers, correlated with brand-safety so they feel consistent.
  const pastSponsorships = 6 + Math.floor(rng() * 24) + (creator.tier === "Mid" ? 8 : 0);
  const disclosureRate = Math.max(80, Math.min(100, Math.round(bs - 4 + rng() * 8)));
  const onTimeRate = Math.max(84, Math.min(100, Math.round(90 + rng() * 10 - (bs < 90 ? 4 : 0))));

  const watch = nicheWatch(creator.niche);

  // Build the checks the vet screen shows. Calibrated so a roster of verified,
  // high-brand-safety creators mostly clears, with a realistic minority flagged
  // — a credible vetting tool shouldn't paint everyone as risky.
  const checks = [];

  // 1) Disclosure history — the main driver.
  if (disclosureRate >= 96) {
    checks.push({ status: "ok", label: "Consistent paid-promotion disclosure", note: `Disclosed on ${disclosureRate}% of ${pastSponsorships} tracked sponsorships — on-screen tag plus a verbal mention.` });
  } else if (disclosureRate >= 90 || bs >= 88) {
    checks.push(INCIDENTS.disclosure(rng)(recentMonth(rng)));
  } else {
    checks.push(INCIDENTS.serious(rng)(recentMonth(rng)));
  }

  // 2) Claims & comparisons — an occasional past slip for lower-safety channels,
  // otherwise a clean note.
  const claimSlip = bs >= 95 ? 0.15 : bs >= 90 ? 0.3 : 0.55;
  if (chance(rng, claimSlip)) {
    checks.push(INCIDENTS.claim(rng)(recentMonth(rng)));
  } else {
    checks.push({ status: "ok", label: "Stays on the approved brief", note: "Past reads kept product claims to what brands supplied — no medical/financial overreach on file." });
  }

  // 3) Exclusivity / category overlap — rare, only for busy creators.
  if (pastSponsorships >= 20 && chance(rng, 0.2)) {
    checks.push(INCIDENTS.exclusivity(rng)(recentMonth(rng)));
  }

  // 4) Delivery reliability.
  if (onTimeRate >= 94) {
    checks.push({ status: "ok", label: "Reliable delivery", note: `On-time on ${onTimeRate}% of past deals; responsive on revisions.` });
  } else {
    checks.push(INCIDENTS.delivery(rng)(recentMonth(rng)));
  }

  // 5) Brand safety baseline.
  checks.push({
    status: bs >= 88 ? "ok" : "warn",
    label: bs >= 88 ? "No unsafe or adult content on file" : "Occasional edgy content",
    note: bs >= 88
      ? "Family-safe language and visuals across recent uploads."
      : "Some strong language / edgy segments — review a few recent uploads for tone fit.",
  });

  // 6) Category to keep an eye on — informational, never inflates risk.
  checks.push({ status: "ok", label: `Category to watch: ${watch.cats[0]}`, note: watch.note });

  const riskLevel = riskFromChecks(checks);

  return {
    // The variables, surfaced as data on the creator record.
    pastSponsorships,
    disclosureRate,       // %
    onTimeRate,           // %
    disputes: checks.filter((c) => c.status === "fail").length,
    sponsoredRecent: sponsoredPast,
    categoriesToWatch: watch.cats,
    riskLevel,
    // Ready-made screen output.
    isSponsored: true,
    summary: summaryFor(creator, riskLevel, disclosureRate, onTimeRate, pastSponsorships),
    checks,
  };
}

// Same rule the vet route uses, kept here so a creator's stored riskLevel
// matches the checks exactly.
export function riskFromChecks(checks) {
  if (checks.some((c) => c.status === "fail")) return "high";
  if (checks.filter((c) => c.status === "warn").length >= 2) return "medium";
  if (checks.some((c) => c.status === "warn")) return "low-medium";
  return "low";
}

function summaryFor(creator, level, disclosureRate, onTimeRate, n) {
  const name = creator?.name || "This creator";
  if (level === "high")
    return `${name} has a workable history but one past issue is worth clearing before you sign — set a disclosure checklist and a scoped brief.`;
  if (level === "medium")
    return `${name} is a solid partner with a couple of things to confirm — disclosed on ${disclosureRate}% of ${n} deals, on-time ${onTimeRate}%.`;
  if (level === "low-medium")
    return `${name} handles brand work cleanly, with one point to keep an eye on — ${disclosureRate}% disclosure across ${n} sponsorships.`;
  return `${name} has a clean commercial track record — ${disclosureRate}% disclosure and ${onTimeRate}% on-time across ${n} past deals.`;
}
