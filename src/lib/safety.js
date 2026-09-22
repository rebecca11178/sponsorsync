// Off-platform / circumvention detection for the deal chatroom.
//
// This is a fast client-side stand-in for Gemini moderation: it scans the
// conversation for attempts to move the deal off SponsorSync (sharing personal
// contact details, external messengers, or off-platform payment). In production
// the same signal comes from a Gemini moderation call (see /api/moderate);
// keeping a deterministic detector here means the safety prompt always works in
// the demo even when the API quota is exhausted.

const EMAIL = /\b[\w.+-]+@[\w-]+\.[a-z]{2,}\b/i;
// 7+ digits, allowing spaces / dashes / parentheses — catches phone numbers.
const PHONE = /(?:\+?\d[\s().-]?){7,}\d/;

const KEYWORDS = [
  // external messengers / socials
  "whatsapp", "wechat", "we chat", "telegram", "signal app", "snapchat",
  "instagram", "insta dm", "\\big\\b", "line app", "kakao", "messenger",
  // off-platform intent (EN)
  "off platform", "off-platform", "outside the platform", "outside this platform",
  "off the platform", "off app", "dm me", "text me", "call me", "email me",
  "my number", "my email", "my personal", "reach me at", "contact me directly",
  "deal directly", "pay you directly", "pay me directly", "skip the platform",
  "avoid the fee", "save the fee", "without the platform",
  // off-platform payment
  "venmo", "paypal", "cash app", "cashapp", "zelle", "wire transfer", "bank transfer",
  // off-platform intent (ZH)
  "微信", "私聊", "私下", "加我", "线下", "手机号", "电话联系", "绕过",
];

const KW_RE = new RegExp(KEYWORDS.join("|"), "i");

// Returns { flagged, reason } for the whole conversation (most recent first).
export function detectOffPlatform(messages = []) {
  for (let i = messages.length - 1; i >= 0; i--) {
    const t = messages[i]?.text || "";
    if (!t) continue;
    if (EMAIL.test(t)) return { flagged: true, reason: "an email address was shared" };
    if (PHONE.test(t)) return { flagged: true, reason: "a phone number was shared" };
    if (KW_RE.test(t)) return { flagged: true, reason: "an attempt to move the conversation off-platform" };
  }
  return { flagged: false, reason: "" };
}
