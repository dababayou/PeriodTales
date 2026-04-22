import { Trash2, Droplet } from "lucide-react";
import { formatDateShort, MOOD_OPTIONS, daysBetween, type PeriodEntry } from "@/lib/cycle";

type Props = {
  entries: PeriodEntry[];
  onDelete: (id: string) => void;
};

export function HistoryList({ entries, onDelete }: Props) {
  const sorted = [...entries].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  if (sorted.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        Belum ada riwayat. Tambahkan periode pertama Anda.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sorted.map((entry) => {
        const duration = daysBetween(new Date(entry.startDate), new Date(entry.endDate)) + 1;
        const mood = MOOD_OPTIONS.find((m) => m.value === entry.mood);
        return (
          <div
            key={entry.id}
            className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:shadow-[var(--shadow-card)] transition-shadow"
          >
            <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Droplet className="h-5 w-5 text-primary fill-primary/30" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium text-foreground text-sm">
                  {formatDateShort(entry.startDate)} – {formatDateShort(entry.endDate)}
                </p>
                <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground capitalize">
                  {entry.flow}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {duration} hari {mood && `• ${mood.emoji} ${mood.label}`}
                {entry.symptoms.length > 0 && ` • ${entry.symptoms.length} gejala`}
              </p>
            </div>
            <button
              onClick={() => onDelete(entry.id)}
              className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              aria-label="Hapus"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
