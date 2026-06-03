"use client";

interface StatBarChartProps {
  title: string;
  items: { label: string; count: number }[];
  total?: number;
  barClass?: string;
}

export default function StatBarChart({
  title,
  items,
  total,
  barClass = "bg-primary",
}: StatBarChartProps) {
  const max = Math.max(...items.map((i) => i.count), 1);
  const sum = total ?? items.reduce((a, b) => a + b.count, 0);

  return (
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-dark_border dark:bg-darklight">
      <h3 className="text-sm font-semibold text-midnight_text sm:text-base dark:text-white">
        {title}
      </h3>
      <ul className="mt-4 space-y-4">
        {items.length === 0 ? (
          <li className="text-sm text-grey">Aucune donnée</li>
        ) : (
          items.map((row) => (
            <li
              key={row.label}
              className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
            >
              <span className="min-w-0 text-sm text-midnight_text dark:text-white sm:max-w-[45%] sm:flex-1">
                <span className="line-clamp-2 break-words">{row.label}</span>
              </span>
              <div className="flex w-full items-center gap-2 sm:max-w-[55%] sm:flex-1">
                <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-dark_border">
                  <div
                    className={`h-full rounded-full ${barClass}`}
                    style={{ width: `${(row.count / max) * 100}%` }}
                  />
                </div>
                <span className="w-10 shrink-0 text-right text-sm font-medium tabular-nums">
                  {row.count}
                </span>
              </div>
            </li>
          ))
        )}
      </ul>
      {sum > 0 && (
        <p className="mt-3 text-xs text-grey dark:text-white/50">Total : {sum}</p>
      )}
    </section>
  );
}
