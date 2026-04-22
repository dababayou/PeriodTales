import { Droplet, Moon, Dumbbell } from "lucide-react";
import { MOOD_OPTIONS } from "@/lib/cycle";
import type { WellnessLog } from "@/lib/wellness";

type Props = {
  last7: WellnessLog[];
};

const DAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export function WellnessTrend({ last7 }: Props) {
  const maxWater = 10;
  const maxSleep = 10;
  const maxExercise = Math.max(60, ...last7.map((l) => l.exercise));

  return (
    <div className="space-y-5">
      <Row
        icon={<Droplet className="h-4 w-4" />}
        label="Air"
        unit="gelas"
        data={last7}
        getValue={(l) => l.water}
        max={maxWater}
        color="primary"
      />
      <Row
        icon={<Moon className="h-4 w-4" />}
        label="Tidur"
        unit="jam"
        data={last7}
        getValue={(l) => l.sleep}
        max={maxSleep}
        color="accent"
      />
      <Row
        icon={<Dumbbell className="h-4 w-4" />}
        label="Olahraga"
        unit="mnt"
        data={last7}
        getValue={(l) => l.exercise}
        max={maxExercise}
        color="primary"
      />

      {/* Mood row */}
      <div>
        <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
          <span>Mood</span>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {last7.map((l, i) => {
            const m = MOOD_OPTIONS.find((o) => o.value === l.mood);
            const d = new Date(l.date);
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className={`w-full aspect-square rounded-lg flex items-center justify-center text-lg border ${
                    m ? "bg-accent/30 border-accent/40" : "bg-muted border-border"
                  }`}
                >
                  {m ? m.emoji : "·"}
                </div>
                <span className="text-[10px] text-muted-foreground">{DAY_LABELS[d.getDay()]}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Row({
  icon, label, unit, data, getValue, max, color,
}: {
  icon: React.ReactNode;
  label: string;
  unit: string;
  data: WellnessLog[];
  getValue: (l: WellnessLog) => number;
  max: number;
  color: "primary" | "accent";
}) {
  const colorClass = color === "primary" ? "bg-primary" : "bg-accent";
  return (
    <div>
      <div className="flex items-center justify-between mb-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          {icon}
          <span>{label}</span>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1.5 items-end h-20">
        {data.map((l, i) => {
          const v = getValue(l);
          const pct = max > 0 ? Math.max(4, (v / max) * 100) : 4;
          return (
            <div key={i} className="flex flex-col items-center gap-1 h-full justify-end">
              <span className="text-[10px] tabular-nums text-muted-foreground">
                {v > 0 ? (Number.isInteger(v) ? v : v.toFixed(1)) : "·"}
              </span>
              <div
                className={`w-full ${v > 0 ? colorClass : "bg-muted"} rounded-md transition-all`}
                style={{ height: `${pct}%` }}
                title={`${v} ${unit}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
