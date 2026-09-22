// Small monochrome line icons used in place of emoji/dingbat glyphs, so status
// marks render consistently (and professionally) on every platform.
export function CheckIcon({ className = "", size = 14, strokeWidth = 2.4 }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 12.5l5 5 11-12" />
    </svg>
  );
}

export function XIcon({ className = "", size = 16, strokeWidth = 2 }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function WarnIcon({ className = "", size = 14, strokeWidth = 2 }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l9 16H3z" />
      <path d="M12 10v4M12 17.5v.5" />
    </svg>
  );
}

export function MenuIcon({ className = "", size = 18, strokeWidth = 2 }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}
