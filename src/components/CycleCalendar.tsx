import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addDays, isInPeriod, isInPredicted, type PeriodEntry } from "@/lib/cycle";

type Props = {
  entries: PeriodEntry[];
  predictedStart: Date | null;
  predictedEnd: Date | null;
};

const WEEKDAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export function CycleCalendar({ entries, predictedStart, predictedEnd }: Props) {
  const [view, setView] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const firstDay = new Date(view.year, view.month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(view.year, view.month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const navigate = (delta: number) => {
    setView((v) => {
      const d = new Date(v.year, v.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-secondary transition-colors"
          aria-label="Bulan sebelumnya"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h3 className="text-lg font-semibold text-foreground">
          {MONTHS[view.month]} {view.year}
        </h3>
        <button
          onClick={() => navigate(1)}
          className="p-2 rounded-full hover:bg-secondary transition-colors"
          aria-label="Bulan berikutnya"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-2">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <div key={i} />;
          const inPeriod = isInPeriod(date, entries);
          const inPredicted = !inPeriod && isInPredicted(date, predictedStart, predictedEnd);
          const isToday = date.getTime() === today.getTime();

          return (
            <div
              key={i}
              className={`
                aspect-square flex items-center justify-center text-sm rounded-full transition-all
                ${inPeriod ? "bg-primary text-primary-foreground font-semibold shadow-[var(--shadow-soft)]" : ""}
                ${inPredicted ? "bg-accent/40 text-accent-foreground border-2 border-dashed border-accent" : ""}
                ${!inPeriod && !inPredicted ? "text-foreground hover:bg-secondary" : ""}
                ${isToday && !inPeriod ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}
              `}
            >
              {date.getDate()}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span>Menstruasi</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full border-2 border-dashed border-accent bg-accent/40" />
          <span>Prediksi</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full ring-2 ring-primary" />
          <span>Hari ini</span>
        </div>
      </div>
    </div>
  );
}
