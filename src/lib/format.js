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

export const statusLabels = {
  enquiry: "Enquiry sent",
  chatroom: "In chat",
  contracted: "Contracted",
  in_production: "In production",
  in_review: "In review",
  completed: "Completed",
};
