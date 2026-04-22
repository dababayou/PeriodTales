import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MOOD_OPTIONS, SYMPTOM_OPTIONS, type PeriodEntry } from "@/lib/cycle";

type Props = {
  onAdd: (entry: PeriodEntry) => void;
};

export function AddPeriodDialog({ onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [flow, setFlow] = useState<PeriodEntry["flow"]>("sedang");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [mood, setMood] = useState("tenang");
  const [notes, setNotes] = useState("");

  const toggleSymptom = (s: string) => {
    setSymptoms((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const handleSubmit = () => {
    if (!startDate || !endDate) return;
    onAdd({
      id: `entry-${Date.now()}`,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      flow,
      symptoms,
      mood,
      notes: notes || undefined,
    });
    setOpen(false);
    setStartDate(""); setEndDate(""); setFlow("sedang"); setSymptoms([]); setMood("tenang"); setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full shadow-[var(--shadow-soft)]">
          <Plus className="h-4 w-4" />
          Tambah Periode
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Catat Periode Baru</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="start">Tanggal Mulai</Label>
              <Input id="start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">Tanggal Selesai</Label>
              <Input id="end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Aliran</Label>
            <div className="flex gap-2">
              {(["ringan", "sedang", "berat"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFlow(f)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm capitalize transition-all border ${
                    flow === f
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-foreground border-border hover:bg-secondary"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Mood</Label>
            <div className="grid grid-cols-3 gap-2">
              {MOOD_OPTIONS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMood(m.value)}
                  className={`p-2 rounded-lg text-sm transition-all border ${
                    mood === m.value
                      ? "bg-accent/40 border-accent"
                      : "bg-card border-border hover:bg-secondary"
                  }`}
                >
                  <span className="text-lg">{m.emoji}</span>
                  <div className="text-xs">{m.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Gejala</Label>
            <div className="flex flex-wrap gap-2">
              {SYMPTOM_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSymptom(s)}
                  className={`px-3 py-1.5 rounded-full text-xs transition-all border ${
                    symptoms.includes(s)
                      ? "bg-primary/20 border-primary text-primary"
                      : "bg-card border-border text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Catatan (opsional)</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
          <Button onClick={handleSubmit} disabled={!startDate || !endDate}>Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
