export function compact(n) {
  return Intl.NumberFormat("en", { notation: "compact" }).format(n);
}

export function usd(n) {
  return "$" + Intl.NumberFormat("en").format(n);
}

// Color token for a 0–100 fit / safety score.
export function scoreTone(score) {
  if (score >= 85) return { text: "text-success", bg: "bg-success-soft" };
  if (score >= 65) return { text: "text-warning", bg: "bg-warning-soft" };
  return { text: "text-danger", bg: "bg-danger-soft" };
}

// Shared package labels so list / match / detail all read the same names.
export const PACKAGE_LABELS = {
  integratedVideo: "Integrated video",
  dedicatedVideo: "Dedicated video",
  short: "YouTube Short",
};

// The lowest purchasable base price — this is what "from $X" must always use.
export function startingPrice(rates) {
  return Math.min(...Object.values(rates));
}

// Best-value package whose price is within `cap`; null if even the cheapest is over.
export function bestPackageWithin(rates, cap) {
  const entries = Object.entries(rates)
    .map(([key, price]) => ({ key, price, label: PACKAGE_LABELS[key] }))
    .sort((a, b) => a.price - b.price);
  const affordable = entries.filter((p) => p.price <= cap);
  return affordable.length ? affordable[affordable.length - 1] : null;
}

// The single cheapest package (used for "from" and budget gating).
export function cheapestPackage(rates) {
  return Object.entries(rates)
    .map(([key, price]) => ({ key, price, label: PACKAGE_LABELS[key] }))
    .sort((a, b) => a.price - b.price)[0];
}

export const statusLabels = {
  enquiry: "Enquiry sent",
  chatroom: "In chat",
  contracted: "Contracted",
  in_production: "In production",
  in_review: "In review",
  completed: "Completed",
};
