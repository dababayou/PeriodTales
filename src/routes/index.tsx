import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Calendar, Droplets, Droplet, Activity, Heart, Sparkles, TrendingUp, Smile, Flame, Moon, Dumbbell } from "lucide-react";
import { CycleCalendar } from "@/components/CycleCalendar";
import { StatCard } from "@/components/StatCard";
import { HistoryList } from "@/components/HistoryList";
import { AddPeriodDialog } from "@/components/AddPeriodDialog";
import { DailyWellnessForm } from "@/components/DailyWellnessForm";
import { WellnessTrend } from "@/components/WellnessTrend";
import {
  computeStats, formatDate, loadEntries, saveEntries, type PeriodEntry,
} from "@/lib/cycle";
import {
  computeWellnessStats, loadWellness, saveWellness, todayKey, type WellnessLog,
} from "@/lib/wellness";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CycleTrack — Recap Periode Menstruasi Anda" },
      {
        name: "description",
        content: "Lacak siklus menstruasi, gejala, mood, dan dapatkan prediksi periode berikutnya dengan lembut dan intuitif.",
      },
      { property: "og:title", content: "CycleTrack — Recap Periode Menstruasi" },
      { property: "og:description", content: "Lacak siklus, gejala & mood dengan tampilan yang tenang dan intuitif." },
    ],
  }),
  component: Index,
});

function Index() {
  const [entries, setEntries] = useState<PeriodEntry[]>([]);
  const [wellness, setWellness] = useState<Record<string, WellnessLog>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setEntries(loadEntries());
    setWellness(loadWellness());
    setMounted(true);
  }, []);

  const stats = useMemo(() => computeStats(entries), [entries]);
  const wStats = useMemo(() => computeWellnessStats(wellness), [wellness]);
  const todayLog = wellness[todayKey()];

  const handleAdd = (entry: PeriodEntry) => {
    const next = [...entries, entry];
    setEntries(next);
    saveEntries(next);
  };

  const handleDelete = (id: string) => {
    const next = entries.filter((e) => e.id !== id);
    setEntries(next);
    saveEntries(next);
  };

  const handleSaveWellness = (log: WellnessLog) => {
    const next = { ...wellness, [log.date]: log };
    setWellness(next);
    saveWellness(next);
  };

  if (!mounted) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Decorative background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground tracking-tight">CycleTrack</h1>
              <p className="text-sm text-muted-foreground">Recap & prediksi siklus Anda</p>
            </div>
          </div>
          <AddPeriodDialog onAdd={handleAdd} />
        </header>

        {/* Hero / Status banner */}
        <section
          className="rounded-3xl p-6 md:p-8 mb-8 shadow-[var(--shadow-soft)] relative overflow-hidden"
          style={{ background: "var(--gradient-soft)" }}
        >
          <div className="grid md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground mb-1">Fase saat ini</p>
              <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-2">
                {stats.currentPhase}
              </h2>
              {stats.nextPredictedStart && stats.daysUntilNext !== null && (
                <p className="text-muted-foreground">
                  {stats.daysUntilNext > 0
                    ? `Periode berikutnya dalam ${stats.daysUntilNext} hari`
                    : stats.daysUntilNext === 0
                    ? "Periode diprediksi mulai hari ini"
                    : `Periode terlambat ${Math.abs(stats.daysUntilNext)} hari`}
                  {" • "}
                  {formatDate(stats.nextPredictedStart)}
                </p>
              )}
            </div>
            <div className="flex md:justify-end">
              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-card/80 backdrop-blur border border-border">
                <Heart className="h-5 w-5 text-primary fill-primary/30" />
                <div>
                  <p className="text-xs text-muted-foreground">Total tercatat</p>
                  <p className="font-semibold text-foreground">{stats.totalCycles} periode</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Calendar} label="Rata-rata Siklus" value={stats.avgCycleLength} unit="hari" />
          <StatCard icon={Droplets} label="Rata-rata Durasi" value={stats.avgPeriodDuration} unit="hari" accent="accent" />
          <StatCard icon={TrendingUp} label="Siklus Terpanjang" value={stats.longestCycle || "—"} unit={stats.longestCycle ? "hari" : ""} accent="muted" />
          <StatCard icon={Activity} label="Siklus Terpendek" value={stats.shortestCycle || "—"} unit={stats.shortestCycle ? "hari" : ""} accent="muted" />
        </section>

        {/* Main grid */}
        <section className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-card rounded-3xl p-6 border border-border shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Kalender Siklus</h3>
            </div>
            <CycleCalendar
              entries={entries}
              predictedStart={stats.nextPredictedStart}
              predictedEnd={stats.nextPredictedEnd}
            />
          </div>

          <div className="lg:col-span-2 bg-card rounded-3xl p-6 border border-border shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-2 mb-4">
              <Droplets className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Riwayat Periode</h3>
            </div>
            <HistoryList entries={entries} onDelete={handleDelete} />
          </div>
        </section>

        {/* Wellness stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          <StatCard icon={Droplet} label="Air rata-rata" value={wStats.avgWater || "—"} unit={wStats.avgWater ? "gelas" : ""} />
          <StatCard icon={Moon} label="Tidur rata-rata" value={wStats.avgSleep || "—"} unit={wStats.avgSleep ? "jam" : ""} accent="accent" />
          <StatCard icon={Dumbbell} label="Olahraga rata-rata" value={wStats.avgExercise || "—"} unit={wStats.avgExercise ? "mnt" : ""} accent="muted" />
          <StatCard icon={Flame} label="Streak harian" value={wStats.streak} unit="hari" accent="accent" />
        </section>

        {/* Wellness grid */}
        <section className="grid lg:grid-cols-5 gap-6 mt-6">
          <div className="lg:col-span-2 bg-card rounded-3xl p-6 border border-border shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Catatan Hari Ini</h3>
            </div>
            <DailyWellnessForm todayLog={todayLog} onSave={handleSaveWellness} />
          </div>

          <div className="lg:col-span-3 bg-card rounded-3xl p-6 border border-border shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-2 mb-1">
              <Smile className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Tren 7 Hari Terakhir</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-5">
              {wStats.topMood
                ? `Mood paling sering: ${wStats.topMood.emoji} ${wStats.topMood.label}`
                : "Belum ada catatan mood minggu ini"}
            </p>
            <WellnessTrend last7={wStats.last7} />
          </div>
        </section>

        <footer className="mt-12 text-center text-xs text-muted-foreground">
          Data tersimpan lokal di perangkat Anda. Prediksi berbasis rata-rata siklus.
        </footer>
      </div>
    </div>
  );
}
