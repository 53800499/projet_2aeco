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
    <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-dark_border dark:bg-darklight">
      <h3 className="font-semibold text-midnight_text dark:text-white">{title}</h3>
      <ul className="mt-4 space-y-3">
        {items.length === 0 ? (
          <li className="text-sm text-grey">Aucune donnée</li>
        ) : (
          items.map((row) => (
            <li key={row.label} className="flex items-center justify-between gap-4">
              <span className="min-w-0 flex-1 truncate text-sm text-midnight_text dark:text-white">
                {row.label}
              </span>
              <div className="flex flex-1 max-w-[200px] items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-dark_border">
                  <div
                    className={`h-full rounded-full ${barClass}`}
                    style={{ width: `${(row.count / max) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right text-sm font-medium">{row.count}</span>
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
