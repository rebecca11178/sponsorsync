import { dealStages } from "@/lib/mockData";

// Horizontal progress timeline for a deal. `current` is a stage key.
export default function StatusTimeline({ current }) {
  const currentIdx = dealStages.findIndex((s) => s.key === current);

  return (
    <ol className="flex items-center">
      {dealStages.map((s, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <li key={s.key} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center">
              <span
                className={`grid h-7 w-7 place-items-center rounded-full text-xs font-semibold ${
                  done
                    ? "bg-success text-white"
                    : active
                    ? "bg-brand text-white ring-4 ring-brand-soft"
                    : "bg-background text-muted border border-border"
                }`}
              >
                {done ? "✓" : i + 1}
              </span>
              <span className={`mt-1 text-[11px] ${active ? "font-semibold text-foreground" : "text-muted"}`}>
                {s.label}
              </span>
            </div>
            {i < dealStages.length - 1 && (
              <span className={`mx-1 h-0.5 flex-1 ${i < currentIdx ? "bg-success" : "bg-border"}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
