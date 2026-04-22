import { useEffect, useState } from "react";
import { Droplet, Moon, Dumbbell, Zap, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MOOD_OPTIONS } from "@/lib/cycle";
import { todayKey, type WellnessLog } from "@/lib/wellness";

type Props = {
  todayLog?: WellnessLog;
  onSave: (log: WellnessLog) => void;
};

export function DailyWellnessForm({ todayLog, onSave }: Props) {
  const [water, setWater] = useState(0);
  const [sleep, setSleep] = useState(7);
  const [exercise, setExercise] = useState(0);
  const [mood, setMood] = useState("tenang");
  const [energy, setEnergy] = useState(3);
  const [notes, setNotes] = useState("");
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    if (todayLog) {
      setWater(todayLog.water);
      setSleep(todayLog.sleep);
      setExercise(todayLog.exercise);
      setMood(todayLog.mood || "tenang");
      setEnergy(todayLog.energy || 3);
      setNotes(todayLog.notes || "");
    }
  }, [todayLog]);

  const handleSave = () => {
    onSave({
      date: todayKey(),
      water,
      sleep,
      exercise,
      mood,
      energy,
      notes: notes || undefined,
    });
    setSavedAt(Date.now());
    setTimeout(() => setSavedAt(null), 2000);
  };

  return (
    <div className="space-y-5">
      {/* Water */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2 text-sm">
            <Droplet className="h-4 w-4 text-primary" />
            Air minum
          </Label>
          <span className="text-sm font-semibold text-foreground tabular-nums">
            {water} <span className="text-muted-foreground font-normal">gelas</span>
          </span>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {Array.from({ length: 10 }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setWater(i + 1 === water ? i : i + 1)}
              className={`w-7 h-9 rounded-md border transition-all ${
                i < water
                  ? "bg-primary border-primary"
                  : "bg-card border-border hover:border-primary/40"
              }`}
              aria-label={`${i + 1} gelas`}
            />
          ))}
        </div>
      </div>

      {/* Sleep */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="sleep" className="flex items-center gap-2 text-sm">
            <Moon className="h-4 w-4 text-primary" />
            Tidur
          </Label>
          <span className="text-sm font-semibold text-foreground tabular-nums">
            {sleep.toFixed(1)} <span className="text-muted-foreground font-normal">jam</span>
          </span>
        </div>
        <input
          id="sleep"
          type="range"
          min={0}
          max={12}
          step={0.5}
          value={sleep}
          onChange={(e) => setSleep(Number(e.target.value))}
          className="w-full accent-primary"
        />
      </div>

      {/* Exercise */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="exercise" className="flex items-center gap-2 text-sm">
            <Dumbbell className="h-4 w-4 text-primary" />
            Olahraga
          </Label>
          <span className="text-sm font-semibold text-foreground tabular-nums">
            {exercise} <span className="text-muted-foreground font-normal">menit</span>
          </span>
        </div>
        <input
          id="exercise"
          type="range"
          min={0}
          max={120}
          step={5}
          value={exercise}
          onChange={(e) => setExercise(Number(e.target.value))}
          className="w-full accent-primary"
        />
      </div>

      {/* Mood */}
      <div className="space-y-2">
        <Label className="text-sm">Mood hari ini</Label>
        <div className="grid grid-cols-3 gap-2">
          {MOOD_OPTIONS.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMood(m.value)}
              className={`p-2 rounded-xl text-xs transition-all border ${
                mood === m.value
                  ? "bg-accent/40 border-accent shadow-sm"
                  : "bg-card border-border hover:bg-secondary"
              }`}
            >
              <div className="text-lg">{m.emoji}</div>
              <div>{m.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Energy */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2 text-sm">
            <Zap className="h-4 w-4 text-primary" />
            Tingkat Energi
          </Label>
          <span className="text-sm font-semibold text-foreground tabular-nums">{energy}/5</span>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setEnergy(n)}
              className={`flex-1 h-9 rounded-md border transition-all ${
                n <= energy
                  ? "bg-primary/80 border-primary"
                  : "bg-card border-border hover:border-primary/40"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="wnotes" className="text-sm">Catatan</Label>
        <Textarea
          id="wnotes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Bagaimana harimu?"
        />
      </div>

      <Button onClick={handleSave} className="w-full rounded-full">
        <Save className="h-4 w-4" />
        {savedAt ? "Tersimpan ✓" : "Simpan Hari Ini"}
      </Button>
    </div>
  );
}
