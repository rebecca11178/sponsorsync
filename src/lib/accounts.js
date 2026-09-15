// ---------------------------------------------------------------------------
// DEMO ACCOUNTS (mock auth). Two logins for the pitch:
//   • Sponsor (company) side
//   • Creator side
// TODO(auth): replace with real authentication (company-email verification for
// sponsors, YouTube OAuth for creators). This is a hardcoded demo only — do NOT
// ship these credentials.
// ---------------------------------------------------------------------------
export const ACCOUNTS = [
  {
    id: "sponsor-admin",
    role: "sponsor",
    name: "BrightLeaf Tea Co.",
    email: "admin@brightleaftea.com",
    password: "sponsor123",
    emoji: "🍃",
    verified: true,
  },
  {
    id: "creator-admin",
    role: "creator",
    name: "Maya Chen",
    email: "maya@mayabrews.com",
    password: "creator123",
    emoji: "🍵",
    verified: true,
    creatorId: "c1", // links to the creator profile in mockData
  },
];

export function findAccount(email, password) {
  return ACCOUNTS.find(
    (a) => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password
  );
}

// Home route after login, by role.
export const HOME_BY_ROLE = { sponsor: "/dashboard", creator: "/creator" };
