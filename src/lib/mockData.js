// ---------------------------------------------------------------------------
// MOCK DATA — replace with real YouTube Data API + your DB later.
// Every field here is what the UI reads. Teammates: keep the SHAPE the same
// when you wire in real data and the pages keep working.
// ---------------------------------------------------------------------------

// The logged-in SMB (mock). In production this comes from auth + company-email
// verification. `verified` drives the "Verified Sponsor" trust badge.
export const currentSponsor = {
  company: "BrightLeaf Tea Co.",
  email: "marketing@brightleaftea.com",
  domain: "brightleaftea.com",
  verified: true,
  industry: "DTC Food & Beverage",
  budget: 6000,
};

// Creator directory (指定达人 / Xingtu-style transparent pricing).
// TODO(api): populate from YouTube Data API (channel stats + recent videos)
// and your creators' own listed rates.
export const creators = [
  {
    id: "c1",
    name: "Maya Chen",
    handle: "@mayabrews",
    emoji: "🍵",
    niche: "Food & Wellness",
    location: "US · English",
    subscribers: 84000,
    avgViews: 41000,
    engagement: 7.2,
    brandSafety: 96,
    verified: true,
    tier: "Micro",
    // Rates by content type (USD) — the "clear rate card" that neither
    // YouTube nor TikTok publishes today.
    rates: {
      integratedVideo: 1200, // 60–90s brand integration in a normal video
      dedicatedVideo: 2500, // full dedicated review video
      short: 600, // one YouTube Short
    },
    // Value-added commercial rights (extra fees) — like Xingtu's add-ons.
    commercialRights: {
      whitelisting: 800, // brand can boost the video as an ad (Creator Partnerships Boost)
      usageExtension: 500, // reuse footage on brand channels for 6 months
      exclusivity: 1500, // category exclusivity for 60 days
    },
    recentVideos: [
      { title: "5 morning rituals that actually stuck", views: 52000, days: 6, fit: 92 },
      { title: "I tried matcha every day for a month", views: 78000, days: 18, fit: 95 },
      { title: "My honest oat milk taste test", views: 33000, days: 29, fit: 88 },
    ],
  },
  {
    id: "c2",
    name: "Diego Alvarez",
    handle: "@diegocooks",
    emoji: "🥘",
    niche: "Cooking",
    location: "US · Bilingual",
    subscribers: 156000,
    avgViews: 62000,
    engagement: 5.1,
    brandSafety: 90,
    verified: true,
    tier: "Micro",
    rates: {
      integratedVideo: 1800,
      dedicatedVideo: 4200,
      short: 900,
    },
    commercialRights: {
      whitelisting: 1200,
      usageExtension: 700,
      exclusivity: 2200,
    },
    recentVideos: [
      { title: "Weeknight dinners under 20 minutes", views: 71000, days: 3, fit: 74 },
      { title: "Restaurant secrets for home cooks", views: 58000, days: 12, fit: 70 },
      { title: "Pantry staples I can't live without", views: 49000, days: 24, fit: 81 },
    ],
  },
  {
    id: "c3",
    name: "Priya Nair",
    handle: "@priyawellness",
    emoji: "🧘🏽‍♀️",
    niche: "Health & Lifestyle",
    location: "US · English",
    subscribers: 22000,
    avgViews: 12000,
    engagement: 9.4,
    brandSafety: 98,
    verified: false,
    tier: "Nano",
    rates: {
      integratedVideo: 450,
      dedicatedVideo: 900,
      short: 250,
    },
    commercialRights: {
      whitelisting: 350,
      usageExtension: 200,
      exclusivity: 600,
    },
    recentVideos: [
      { title: "What I actually eat in a calm day", views: 15000, days: 4, fit: 90 },
      { title: "Cutting caffeine without the crash", views: 19000, days: 15, fit: 97 },
      { title: "My 5-minute evening wind-down", views: 11000, days: 27, fit: 86 },
    ],
  },
  {
    id: "c4",
    name: "Jordan Blake",
    handle: "@jordanreviews",
    emoji: "🎧",
    niche: "Tech Reviews",
    location: "US · English",
    subscribers: 310000,
    avgViews: 140000,
    engagement: 4.3,
    brandSafety: 85,
    verified: true,
    tier: "Mid-tier",
    rates: {
      integratedVideo: 3500,
      dedicatedVideo: 8000,
      short: 1500,
    },
    commercialRights: {
      whitelisting: 2500,
      usageExtension: 1200,
      exclusivity: 4000,
    },
    recentVideos: [
      { title: "The gadgets I regret buying", views: 210000, days: 5, fit: 42 },
      { title: "Best budget desk setup 2026", views: 180000, days: 20, fit: 55 },
      { title: "Is this smart mug worth it?", views: 95000, days: 30, fit: 63 },
    ],
  },
];

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
    status: "chatroom", // enquiry → chatroom → contracted → in_production → in_review → completed
    package: "Dedicated video + whitelisting",
    amount: 3300,
    messages: [
      { from: "sponsor", text: "Hi Maya! We love your matcha content. We'd like a dedicated review of our new cold-brew green tea.", time: "10:02" },
      { from: "creator", text: "Thanks for reaching out! I'm interested. Can you share the key talking points and any claims I should avoid?", time: "10:14" },
      { from: "sponsor", text: "Sure — focus on the clean-energy angle, no added sugar. Please don't make health claims like 'boosts metabolism'.", time: "10:19" },
      { from: "creator", text: "Got it. I'd want to keep creative control on the intro. Delivery in ~3 weeks works. Rate would be $2,500 + $800 for you to boost it as an ad.", time: "10:26" },
      { from: "sponsor", text: "That works for us. Let's lock it in.", time: "10:31" },
    ],
  },
  {
    id: "d2",
    creatorId: "c3",
    status: "in_review",
    package: "Integrated video",
    amount: 450,
    messages: [
      { from: "sponsor", text: "Hi Priya — a 60s integration about our caffeine-free tea in your next wind-down video?", time: "09:00" },
      { from: "creator", text: "Perfect fit for my audience. Draft coming your way this week.", time: "09:12" },
    ],
  },
];

export function getDeal(id) {
  return deals.find((d) => d.id === id);
}

// Ordered lifecycle stages for a deal — powers the status timeline.
export const dealStages = [
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
