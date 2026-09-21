// Professional initials avatar (Gmail / Google Workspace style):
// a colored circle with the name's initials. Color is deterministic per name.
const COLORS = [
  "#4285F4", // google blue
  "#34A853", // google green
  "#EA4335", // google red
  "#F9AB00", // google yellow
  "#57068C", // NYU violet
  "#7C3AED", // violet
  "#0B8043", // deep green
  "#B0308E", // magenta
];

function initials(name = "") {
  const parts = name.replace(/[^A-Za-z0-9 ]/g, " ").trim().split(/\s+/);
  const first = parts[0]?.[0] || "";
  const second = parts[1]?.[0] || parts[0]?.[1] || "";
  return (first + second).toUpperCase();
}

function colorFor(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return COLORS[h % COLORS.length];
}

export default function Avatar({ name = "", size = 40, className = "" }) {
  return (
    <span
      aria-label={name}
      className={`inline-grid shrink-0 place-items-center rounded-full font-semibold text-white ${className}`}
      style={{ width: size, height: size, background: colorFor(name), fontSize: Math.round(size * 0.4) }}
    >
      {initials(name)}
    </span>
  );
}
