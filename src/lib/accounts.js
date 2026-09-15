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
    username: "Godfather",
    name: "Godfather",
    email: "admin@godfather.co",
    password: "admin",
    emoji: "🍃",
    verified: true,
  },
  {
    id: "creator-admin",
    role: "creator",
    username: "Lady Gaga",
    name: "Lady Gaga",
    email: "hello@ladygaga.tv",
    password: "admin",
    emoji: "🍵",
    verified: true,
    creatorId: "c1", // links to the creator profile in mockData
  },
];

// Login by username (or email), case-insensitive.
export function findAccount(login, password) {
  const q = login.trim().toLowerCase();
  return ACCOUNTS.find(
    (a) =>
      (a.username.toLowerCase() === q || a.email.toLowerCase() === q) &&
      a.password === password
  );
}

// Home route after login, by role.
export const HOME_BY_ROLE = { sponsor: "/dashboard", creator: "/creator" };
