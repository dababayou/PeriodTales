import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Calendar, Droplets, Droplet, Activity, Heart, Sparkles, TrendingUp, Smile, Flame, Moon, Dumbbell } from "lucide-react";
import { CycleCalendar } from "@/components/CycleCalendar";
import { StatCard } from "@/components/StatCard";
import { HistoryList } from "@/components/HistoryList";
import { AddPeriodDialog } from "@/components/AddPeriodDialog";
import { DailyWellnessForm } from "@/components/DailyWellnessForm";
import { WellnessTrend } from "@/components/WellnessTrend";
import { UserMenu } from "@/components/UserMenu";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
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
  const [user, setUser] = useState<any>(null);

  // Monitor Supabase Auth Session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch data from database if logged in, fallback to local storage
  useEffect(() => {
    async function loadData() {
      if (user) {
        try {
          // Fetch period entries
          const { data: dbEntries, error: entriesErr } = await supabase
            .from("period_entries")
            .select("*")
            .order("start_date", { ascending: true });

          if (entriesErr) throw entriesErr;

          const formattedEntries: PeriodEntry[] = (dbEntries || []).map((e: any) => ({
            id: e.id,
            startDate: e.start_date,
            endDate: e.end_date,
            flow: e.flow,
            symptoms: e.symptoms || [],
            mood: e.mood,
            notes: e.notes || undefined,
          }));

          // Fetch wellness logs
          const { data: dbWellness, error: wellnessErr } = await supabase
            .from("wellness_logs")
            .select("*");

          if (wellnessErr) throw wellnessErr;

          const wellnessMap: Record<string, WellnessLog> = {};
          (dbWellness || []).forEach((w: any) => {
            wellnessMap[w.date] = {
              date: w.date,
              water: w.water,
              sleep: Number(w.sleep),
              exercise: w.exercise,
              mood: w.mood || "",
              energy: w.energy,
              notes: w.notes || undefined,
            };
          });

          setEntries(formattedEntries);
          setWellness(wellnessMap);
        } catch (err) {
          console.error("Error loading data from Supabase:", err);
          toast.error("Gagal menyinkronkan data dari cloud!");
        }
      } else {
        // Guest mode fallback to local storage
        setEntries(loadEntries());
        setWellness(loadWellness());
      }
      setMounted(true);
    }
    loadData();
  }, [user]);

  const stats = useMemo(() => computeStats(entries), [entries]);
  const wStats = useMemo(() => computeWellnessStats(wellness), [wellness]);
  const todayLog = wellness[todayKey()];

  const handleAdd = async (entry: PeriodEntry) => {
    if (user) {
      try {
        const { data, error } = await supabase
          .from("period_entries")
          .insert({
            user_id: user.id,
            start_date: entry.startDate,
            end_date: entry.endDate,
            flow: entry.flow,
            symptoms: entry.symptoms,
            mood: entry.mood,
            notes: entry.notes || null,
          })
          .select()
          .single();

        if (error) throw error;

        const newEntry: PeriodEntry = {
          id: data.id,
          startDate: data.start_date,
          endDate: data.end_date,
          flow: data.flow,
          symptoms: data.symptoms || [],
          mood: data.mood,
          notes: data.notes || undefined,
        };

        setEntries((prev) => [...prev, newEntry]);
        toast.success("Catatan siklus disimpan ke cloud!");
      } catch (err) {
        console.error("Error saving period entry:", err);
        toast.error("Gagal menyimpan ke database!");
      }
    } else {
      const next = [...entries, entry];
      setEntries(next);
      saveEntries(next);
      toast.success("Catatan siklus disimpan secara lokal!");
    }
  };

  const handleDelete = async (id: string) => {
    if (user) {
      try {
        const { error } = await supabase
          .from("period_entries")
          .delete()
          .eq("id", id);

        if (error) throw error;
        setEntries((prev) => prev.filter((e) => e.id !== id));
        toast.success("Catatan siklus dihapus dari cloud!");
      } catch (err) {
        console.error("Error deleting period entry:", err);
        toast.error("Gagal menghapus catatan!");
      }
    } else {
      const next = entries.filter((e) => e.id !== id);
      setEntries(next);
      saveEntries(next);
      toast.success("Catatan siklus dihapus secara lokal!");
    }
  };

  const handleSaveWellness = async (log: WellnessLog) => {
    if (user) {
      try {
        const { error } = await supabase
          .from("wellness_logs")
          .upsert({
            user_id: user.id,
            date: log.date,
            water: log.water,
            sleep: log.sleep,
            exercise: log.exercise,
            mood: log.mood || null,
            energy: log.energy || 0,
            notes: log.notes || null,
          }, { onConflict: "user_id,date" });

        if (error) throw error;
        setWellness((prev) => ({ ...prev, [log.date]: log }));
        toast.success("Catatan harian disimpan ke cloud!");
      } catch (err) {
        console.error("Error saving wellness log:", err);
        toast.error("Gagal menyimpan catatan harian!");
      }
    } else {
      const next = { ...wellness, [log.date]: log };
      setWellness(next);
      saveWellness(next);
      toast.success("Catatan harian disimpan secara lokal!");
    }
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
          <div className="flex items-center gap-3">
            <UserMenu />
            <AddPeriodDialog onAdd={handleAdd} />
          </div>
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
          {user ? "Data tersimpan aman di cloud database Supabase." : "Data tersimpan lokal di perangkat Anda (Masuk untuk menyimpan di cloud)."} Prediksi berbasis rata-rata siklus.
        </footer>
      </div>
    </div>
  );
}
