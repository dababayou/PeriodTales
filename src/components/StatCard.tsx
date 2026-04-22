import type { LucideIcon } from "lucide-react";

type Props = {
  icon: LucideIcon;
  label: string;
  value: string | number;
  unit?: string;
  accent?: "primary" | "accent" | "muted";
};

export function StatCard({ icon: Icon, label, value, unit, accent = "primary" }: Props) {
  const accentClass = {
    primary: "text-primary bg-primary/10",
    accent: "text-accent-foreground bg-accent/30",
    muted: "text-muted-foreground bg-muted",
  }[accent];

  return (
    <div className="flex flex-col gap-3 p-5 rounded-2xl bg-card border border-border shadow-[var(--shadow-card)]">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accentClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-3xl font-semibold text-foreground tabular-nums">
          {value}
          {unit && <span className="text-base text-muted-foreground font-normal ml-1">{unit}</span>}
        </p>
      </div>
    </div>
  );
}
