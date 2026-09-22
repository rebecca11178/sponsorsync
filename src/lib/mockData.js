import { creators as rawCreators } from "./creators.generated.js";
import { deriveRiskHistory } from "./ai/riskProfile.js";
// ---------------------------------------------------------------------------
// MOCK DATA — replace with real YouTube Data API + your DB later.
// Every field here is what the UI reads. Teammates: keep the SHAPE the same
// when you wire in real data and the pages keep working.
// ---------------------------------------------------------------------------

// The logged-in SMB (mock). In production this comes from auth + company-email
// verification. `verified` drives the "Verified Sponsor" trust badge.
export const currentSponsor = {
  company: "BrightLeaf Tea Co.",
  email: "admin@brightleaftea.co",
  domain: "brightleaftea.co",
  verified: true,
  industry: "DTC Food & Beverage",
  budget: 6000,
};

// Creator directory (指定达人 / Xingtu-style transparent pricing).
// The roster lives in data/creator-roster.xlsx (owned by the data team) and is
// converted by `node scripts/import-roster.mjs`. Edit the spreadsheet, re-run
// the script — never hand-edit creators.generated.js.
// Set a creator's `youtubeHandle` to pull that creator's REAL recent videos in
// /api/match; creators without one use the roster's demo videos.
//
// We attach a deterministic `riskHistory` to every creator (see
// lib/ai/riskProfile.js): a per-creator commercial track record that powers the
// pre-deal risk screen so the 50 creators show DIFFERENT, realistic histories
// instead of one generic verdict. Demo data; live Gemini analysis overrides it.
export const creators = rawCreators.map((c) => ({ ...c, riskHistory: deriveRiskHistory(c) }));

export function getCreator(id) {
  return creators.find((c) => c.id === id);
}

// Creator pushes shown on the dashboard — "达人推送 related to your business".
// TODO(api): generate from Gemini using the sponsor's industry + order history.
export const creatorPushes = [
  { creatorId: "c3", reason: "Audience overlaps with your wellness buyers · 97% content fit last 30d" },
  { creatorId: "c1", reason: "Posted 2 tea-related videos this month · high engagement" },
];

// Deals in flight — powers the dashboard and the chatroom/review pages.
export const deals = [
  {
    id: "d1",
    creatorId: "c1",
    sponsor: "BrightLeaf Tea Co.",
    status: "chatroom", // enquiry → chatroom → contracted → in_production → in_review → completed
    package: "Dedicated video + whitelisting",
    amount: 3300,
    // Agreed terms (same shape /api/summarize returns). /api/review checks the
    // delivered video against these. TODO(api): save from /api/summarize output.
    terms: [
      { label: "Deliverable", value: "1 dedicated review video of the cold-brew green tea" },
      { label: "Base price", value: "$2,500" },
      { label: "Add-on", value: "Ad whitelisting +$800" },
      { label: "Talking points", value: "Clean energy, no added sugar" },
      { label: "Creative control", value: "Creator keeps the intro" },
      { label: "Restrictions", value: "No health claims (e.g. 'boosts metabolism')" },
      { label: "Disclosure", value: "YouTube paid-promotion toggle + verbal mention" },
    ],
    messages: [
      { from: "sponsor", text: "Hi Maya Chen! We love your matcha content. We'd like a dedicated review of our new cold-brew green tea.", time: "10:02" },
      { from: "creator", text: "Thanks for reaching out! I'm interested. Can you share the key talking points and any claims I should avoid?", time: "10:14" },
      { from: "sponsor", text: "Sure — focus on the clean-energy angle, no added sugar. Please don't make health claims like 'boosts metabolism'.", time: "10:19" },
      { from: "creator", text: "Got it. I'd want to keep creative control on the intro. Delivery in ~3 weeks works. Rate would be $2,500 + $800 for you to boost it as an ad.", time: "10:26" },
      { from: "sponsor", text: "That works for us. Let's lock it in.", time: "10:31" },
    ],
  },
  {
    id: "d2",
    creatorId: "c3",
    sponsor: "BrightLeaf Tea Co.",
    status: "in_review",
    package: "Integrated video",
    amount: 450,
    deliverable: { title: "My 8pm wind-down routine (ad)", lengthMin: 9, deliveredDaysAgo: 2, url: "" },
    terms: [
      { label: "Deliverable", value: "~60s integration of the caffeine-free tea in a wind-down video" },
      { label: "Base price", value: "$450" },
      { label: "Restrictions", value: "No health or sleep-aid claims" },
      { label: "Disclosure", value: "YouTube paid-promotion toggle + verbal mention" },
    ],
    messages: [
      { from: "sponsor", text: "Hi Priya — a 60s integration about our caffeine-free tea in your next wind-down video?", time: "09:00" },
      { from: "creator", text: "Perfect fit for my audience. Draft coming your way this week.", time: "09:12" },
    ],
  },
  {
    id: "d3",
    creatorId: "c1",
    sponsor: "NordVibe Audio",
    status: "chatroom",
    package: "Integrated video (60s)",
    amount: 1200,
    messages: [
      { from: "sponsor", text: "Hi Maya Chen! We'd love a 60s integration of our study headphones in an upcoming wind-down video.", time: "14:20" },
      { from: "creator", text: "Thanks! I like the fit. What are the must-hit talking points?", time: "14:33" },
    ],
  },
  {
    id: "d4",
    creatorId: "c5",
    sponsor: "BrightLeaf Tea Co.",
    status: "completed",
    package: "Integrated video",
    amount: 340,
    deliverable: { title: "3 loose-leaf teas I'm obsessed with (ad)", lengthMin: 8, deliveredDaysAgo: 12, url: "", reviewVerdict: "pass" },
    terms: [
      { label: "Deliverable", value: "60s integration of our loose-leaf sampler" },
      { label: "Base price", value: "$340" },
      { label: "Disclosure", value: "YouTube paid-promotion toggle + verbal mention" },
    ],
    messages: [
      { from: "sponsor", text: "Loved the last collab — same format for our new sampler?", time: "11:00" },
      { from: "creator", text: "Published and live! Numbers looking strong.", time: "11:05" },
    ],
  },
  {
    id: "d5",
    creatorId: "c2",
    sponsor: "BrightLeaf Tea Co.",
    status: "in_production",
    package: "Dedicated video",
    amount: 4200,
    terms: [
      { label: "Deliverable", value: "Dedicated brewing-technique video featuring our matcha" },
      { label: "Base price", value: "$4,200" },
      { label: "Restrictions", value: "No health claims" },
    ],
    messages: [
      { from: "sponsor", text: "Signed! Excited to see the brewing feature.", time: "16:20" },
      { from: "creator", text: "Filming this weekend, draft to you next week.", time: "16:31" },
    ],
  },
  {
    id: "d6",
    creatorId: "c8",
    sponsor: "BrightLeaf Tea Co.",
    status: "contracted",
    package: "Integrated video + whitelisting",
    amount: 1300,
    terms: [
      { label: "Deliverable", value: "Integration in an upcoming morning-routine video" },
      { label: "Base price", value: "$900 + $400 ad whitelisting" },
      { label: "Disclosure", value: "Paid-promotion label required" },
    ],
    messages: [
      { from: "sponsor", text: "Contract signed — looking forward to it!", time: "10:40" },
      { from: "creator", text: "Received, thank you. Shot list coming shortly.", time: "10:52" },
    ],
  },
  {
    id: "d7",
    creatorId: "c3",
    sponsor: "BrightLeaf Tea Co.",
    status: "draft",
    package: "Integrated video",
    amount: 0,
    draftNote: "Budget & no-go list not set yet",
    messages: [],
  },
  {
    id: "d8",
    creatorId: "c11",
    sponsor: "BrightLeaf Tea Co.",
    status: "draft",
    package: "Not chosen",
    amount: 0,
    draftNote: "Waiting on Q2 budget approval",
    messages: [],
  },

  // --- The logged-in creator's OWN collaborations (Maya Chen, c1) with other
  // brands. These carry non-BrightLeaf sponsors, so they populate the creator's
  // "My collaborations" page WITHOUT appearing on the sponsor's campaigns view
  // (which filters to sponsor === BrightLeaf). Gives the creator side a full
  // spread of statuses symmetric to the sponsor console.
  {
    id: "d9",
    creatorId: "c1",
    sponsor: "Verdant Skincare",
    sponsorVerified: true,
    status: "contracted",
    package: "Dedicated video",
    amount: 2500,
    terms: [
      { label: "Deliverable", value: "Dedicated 'clean pantry, clean skin' video" },
      { label: "Base price", value: "$2,500" },
      { label: "Restrictions", value: "No medical/dermatology claims" },
      { label: "Disclosure", value: "Paid-promotion label + verbal mention" },
    ],
    messages: [
      { from: "sponsor", text: "Contract signed — can't wait to see it!", time: "12:10" },
      { from: "creator", text: "Thank you! Filming next week, draft to follow.", time: "12:22" },
    ],
  },
  {
    id: "d10",
    creatorId: "c1",
    sponsor: "Nomad Coffee Roasters",
    sponsorVerified: true,
    status: "in_production",
    package: "Integrated video (90s)",
    amount: 1600,
    terms: [
      { label: "Deliverable", value: "90s integration of the cold-brew kit in a morning video" },
      { label: "Base price", value: "$1,600" },
      { label: "Disclosure", value: "Paid-promotion label required" },
    ],
    messages: [
      { from: "sponsor", text: "Shot list looks great. Go ahead and film!", time: "08:40" },
      { from: "creator", text: "On it — draft to you by Friday.", time: "08:51" },
    ],
  },
  {
    id: "d11",
    creatorId: "c1",
    sponsor: "PantryPro Kitchenware",
    sponsorVerified: true,
    status: "in_review",
    package: "Dedicated video",
    amount: 2200,
    deliverable: { title: "5 pantry tools I actually use (ad)", lengthMin: 11, deliveredDaysAgo: 1, url: "" },
    terms: [
      { label: "Deliverable", value: "Dedicated video featuring the knife set + board" },
      { label: "Base price", value: "$2,200" },
      { label: "Disclosure", value: "Paid-promotion label + verbal mention" },
    ],
    messages: [
      { from: "sponsor", text: "Excited for this one — send the draft when ready.", time: "15:00" },
      { from: "creator", text: "Just delivered the final cut for your review!", time: "15:40" },
    ],
  },
  {
    id: "d12",
    creatorId: "c1",
    sponsor: "Bloom Greens",
    sponsorVerified: true,
    status: "completed",
    package: "Integrated video",
    amount: 1400,
    deliverable: { title: "What I eat in a week on a budget (ad)", lengthMin: 10, deliveredDaysAgo: 20, url: "", reviewVerdict: "pass" },
    terms: [
      { label: "Deliverable", value: "60s integration of the salad kit" },
      { label: "Base price", value: "$1,400" },
      { label: "Disclosure", value: "Paid-promotion label + verbal mention" },
    ],
    messages: [
      { from: "sponsor", text: "Numbers look fantastic — thank you!", time: "10:15" },
      { from: "creator", text: "So glad it performed. Would love to work together again.", time: "10:20" },
    ],
  },
  {
    id: "d13",
    creatorId: "c1",
    sponsor: "Trailmix Snacks",
    sponsorVerified: false,
    status: "chatroom",
    package: "YouTube Short",
    amount: 600,
    messages: [
      { from: "sponsor", text: "Hey Maya — interested in a Short featuring our trail mix?", time: "13:05" },
      { from: "creator", text: "Thanks! Could you share more about the brand and budget?", time: "13:19" },
    ],
  },
];

// An existing deal for this creator, if any (used to route a creator's page
// straight into their real chatroom instead of a hardcoded one).
export function getDealForCreator(creatorId) {
  return deals.find((d) => d.creatorId === creatorId) || null;
}

// Every creator can be contacted, but only a few have a pre-seeded deal. For
// the rest we synthesize a fresh chatroom on the fly so "Open chatroom" always
// lands on the RIGHT creator. Id shape: `new-<creatorId>`.
export function newChatroomDeal(creatorId, { pkg, amount } = {}) {
  const creator = getCreator(creatorId);
  if (!creator) return null;
  const firstName = (creator.name || "there").split(" ")[0];
  const brand = (currentSponsor.company || "our brand").replace(/\.$/, ""); // avoid "Co.."
  return {
    id: `new-${creatorId}`,
    creatorId,
    creator: creator.name,
    sponsor: currentSponsor.company,
    package: pkg || "Integrated video",
    amount: amount || creator.rates?.integratedVideo || 1200,
    status: "chatroom",
    synthetic: true,
    messages: [
      { from: "sponsor", text: `Hi ${firstName} — this is the team at ${brand}. We loved your recent videos and would like to discuss a sponsored ${(pkg || "integrated video").toLowerCase()}. Are you open to it?`, time: "now" },
    ],
  };
}

export function getDeal(id) {
  if (typeof id === "string" && id.startsWith("new-")) {
    return newChatroomDeal(id.slice(4));
  }
  return deals.find((d) => d.id === id);
}

// Ordered lifecycle stages for a deal — powers the status timeline.
export const dealStages = [
  { key: "draft", label: "Draft" },
  { key: "enquiry", label: "Enquiry" },
  { key: "chatroom", label: "Chat" },
  { key: "contracted", label: "Contract" },
  { key: "in_production", label: "Filming" },
  { key: "in_review", label: "Review" },
  { key: "completed", label: "Live" },
];

// ---------------------------------------------------------------------------
// CREATOR-SIDE inbox — what a creator sees when sponsors reach out.
// Shows the two-sided, trust-first value: verified sponsors vs. scam DMs.
// TODO(api): in production this is the creator's real inbox, gated by
// the sponsor's company-email verification.
// ---------------------------------------------------------------------------
export const creatorProfileId = "c1"; // the creator we're "logged in as" for the demo

export const enquiries = [
  {
    id: "e1",
    dealId: "d1",
    sponsor: "BrightLeaf Tea Co.",
    verified: true,
    industry: "DTC Food & Beverage",
    package: "Dedicated video + whitelisting",
    offer: 3300,
    status: "new",
    message: "We love your matcha content — would you do a dedicated review of our new cold-brew green tea?",
  },
  {
    id: "e2",
    dealId: "d3",
    sponsor: "NordVibe Audio",
    verified: true,
    industry: "Consumer Electronics",
    package: "Integrated video (60s)",
    offer: 1200,
    status: "new",
    message: "A 60-second integration of our study headphones in an upcoming wind-down video.",
  },
  {
    id: "e3",
    sponsor: "quickcash-deals",
    verified: false,
    industry: "Unverified",
    package: "Dedicated video",
    offer: 5000,
    status: "new",
    message: "URGENT!! promote our crypto app, huge payout, reply fast!!! send your wallet",
  },
];

export function getEnquiry(id) {
  return enquiries.find((e) => e.id === id);
}
