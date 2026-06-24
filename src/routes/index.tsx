import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Calendar, Droplets, Droplet, Activity, Heart, Sparkles, TrendingUp, Smile, Flame, Moon, Dumbbell, LogIn, Mail, Lock, User, BookOpen } from "lucide-react";
import { CycleCalendar } from "@/components/CycleCalendar";
import { StatCard } from "@/components/StatCard";
import { HistoryList } from "@/components/HistoryList";
import { AddPeriodDialog } from "@/components/AddPeriodDialog";
import { DailyWellnessForm } from "@/components/DailyWellnessForm";
import { WellnessTrend } from "@/components/WellnessTrend";
import { UserMenu } from "@/components/UserMenu";
import { MythFlashcard } from "@/components/MythFlashcard";
import { MythsModal } from "@/components/MythsModal";
import { SubscriptionBanner } from "@/components/SubscriptionBanner";
import koin1 from "@/components/assets/koin1.png";
import { MYTHS_FACTS } from "@/lib/myths";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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

  // Auth Form States for Landing Page
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Myths State
  const [isMythsModalOpen, setIsMythsModalOpen] = useState(false);
  const dailyMyth = useMemo(() => {
    return MYTHS_FACTS[new Date().getDate() % MYTHS_FACTS.length];
  }, []);

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
              coins: w.coins || 0,
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

  const handleSaveWellness = async (log: WellnessLog, silent = false) => {
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
            coins: log.coins || 0,
          }, { onConflict: "user_id,date" });

        if (error) throw error;
        setWellness((prev) => ({ ...prev, [log.date]: log }));
        if (!silent) toast.success("Catatan harian disimpan ke cloud!");
      } catch (err) {
        console.error("Error saving wellness log:", err);
        if (!silent) toast.error("Gagal menyimpan catatan harian!");
      }
    } else {
      const next = { ...wellness, [log.date]: log };
      setWellness(next);
      saveWellness(next);
      if (!silent) toast.success("Catatan harian disimpan secara lokal!");
    }
  };

  const handleLandingAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Silakan isi semua kolom!");
      return;
    }

    setAuthLoading(true);
    try {
      if (isRegister) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName || email.split("@")[0],
              username: username || email.split("@")[0],
              avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(email)}`,
            },
          },
        });
        if (error) throw error;
        toast.success("Registrasi berhasil! Silakan cek email Anda untuk konfirmasi.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Berhasil masuk!");
      }
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan!");
    } finally {
      setAuthLoading(false);
    }
  };

  if (!mounted) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        {/* Decorative background blobs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute top-1/2 left-1/4 w-80 h-80 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto w-full grid md:grid-cols-12 gap-8 items-center">
          {/* Welcome Info Panel */}
          <div className="md:col-span-7 space-y-6 text-left">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
                <Sparkles className="h-6 w-6 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                CycleTrack
              </h1>
            </div>
            
            <h2 className="text-2xl font-semibold text-foreground leading-snug">
              Lacak, kelola, dan pahami siklus menstruasi Anda dengan cerdas.
            </h2>
            <p className="text-base text-muted-foreground max-w-lg">
              Sebuah platform recap menstruasi intuitif untuk mencatat gejala harian, melacak mood, mengukur aktivitas hidrasi/tidur, dan memprediksi siklus berikutnya secara aman.
            </p>

            <div className="space-y-4 pt-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground">Kalender Siklus Otomatis</h3>
                  <p className="text-xs text-muted-foreground">Prediksi fase menstruasi, folikuler, ovulasi, dan luteal berbasis data historis.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-accent/10 text-accent">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground">Statistik & Tren Kebugaran</h3>
                  <p className="text-xs text-muted-foreground">Lacak tingkat hidrasi, durasi tidur, dan olahraga harian Anda secara berkesinambungan.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Heart className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground">Perlindungan Data Aman</h3>
                  <p className="text-xs text-muted-foreground">Semua data Anda tersimpan aman dan terenkripsi di dalam cloud database Supabase.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Inline Auth Card Panel */}
          <div className="md:col-span-5 bg-card rounded-3xl p-6 border border-border shadow-[var(--shadow-card)] backdrop-blur-sm bg-card/90">
            <h2 className="text-xl font-bold tracking-tight text-foreground text-center mb-1">
              {isRegister ? "Buat Akun Baru" : "Masuk ke Akun Anda"}
            </h2>
            <p className="text-xs text-muted-foreground text-center mb-6">
              {isRegister ? "Mulai sinkronisasi data siklus Anda ke cloud" : "Akses riwayat menstruasi Anda dari perangkat apa saja"}
            </p>

            <form onSubmit={handleLandingAuth} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="landing-email">Alamat Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="landing-email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="landing-password">Kata Sandi</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="landing-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    autoComplete={isRegister ? "new-password" : "current-password"}
                    required
                  />
                </div>
              </div>

              {isRegister && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="landing-fullName">Nama Lengkap</Label>
                    <Input
                      id="landing-fullName"
                      type="text"
                      placeholder="Luna Clarissa"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      autoComplete="name"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="landing-username">Username</Label>
                    <Input
                      id="landing-username"
                      type="text"
                      placeholder="lunaclara"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoComplete="username"
                      required
                    />
                  </div>
                </>
              )}

              <Button type="submit" className="w-full mt-4 rounded-xl shadow-[var(--shadow-soft)]" disabled={authLoading}>
                {authLoading ? "Memproses..." : isRegister ? "Daftar Akun" : "Masuk"}
              </Button>
            </form>

            <div className="text-center text-xs text-muted-foreground mt-4 pt-2 border-t border-border/60">
              {isRegister ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
              <button
                onClick={() => {
                  setIsRegister(!isRegister);
                  setEmail(""); setPassword(""); setFullName(""); setUsername("");
                }}
                className="text-primary hover:underline font-semibold focus:outline-none"
              >
                {isRegister ? "Masuk di sini" : "Daftar di sini"}
              </button>
            </div>

            {isRegister && (
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl text-[10px] text-amber-800 dark:text-amber-300 leading-relaxed">
                ⚠️ <strong>Catatan penting</strong>: Jika pendaftaran stuck, pastikan Anda memverifikasi email Anda, atau matikan opsi <strong>"Confirm email"</strong> di dashboard <strong>Supabase &rarr; Authentication &rarr; Providers &rarr; Email</strong> untuk akses langsung tanpa verifikasi email!
              </div>
            )}
          </div>
        </div>
      </div>
    );
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
        <header className="sticky top-2 sm:top-4 z-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10 bg-background/85 backdrop-blur-lg p-4 rounded-2xl shadow-[var(--shadow-card)] border border-border/50 transition-all">
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
            <div className="flex items-center gap-1.5 bg-amber-100/90 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 px-3 py-1.5 rounded-full text-sm font-bold shadow-sm border border-amber-200/50 cursor-default">
              <img src={koin1} className="w-5 h-5 object-contain" alt="Coin Icon" />
              <span>{todayLog?.coins || 0}</span>
            </div>
            <UserMenu />
            <AddPeriodDialog onAdd={handleAdd} />
          </div>
        </header>

        {/* Subscription Banner */}
        <SubscriptionBanner />

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
            <DailyWellnessForm 
              todayLog={todayLog} 
              onSave={handleSaveWellness} 
              onAutoSaveWater={(water, coins) => {
                const logToSave = todayLog || {
                  date: todayKey(),
                  water: 0,
                  sleep: 7,
                  exercise: 0,
                  mood: "tenang",
                  energy: 3,
                  coins: 0,
                };
                handleSaveWellness({ ...logToSave, water, coins }, true);
              }}
            />
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

        {/* Myth vs Fact Section */}
        <section className="mt-8 bg-card rounded-3xl p-6 md:p-8 border border-border shadow-[var(--shadow-card)] relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1 space-y-4 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 text-xs font-semibold mb-2">
                <BookOpen className="h-3.5 w-3.5" />
                Edukasi Menstruasi
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                Mitos vs Fakta Hari Ini
              </h3>
              <p className="text-muted-foreground leading-relaxed max-w-md">
                Banyak mitos beredar seputar siklus menstruasi. Balik kartu di samping untuk menemukan fakta medisnya, atau jelajahi seluruh koleksi mitos dan fakta yang kami kumpulkan!
              </p>
              <div className="pt-2">
                <Button 
                  onClick={() => setIsMythsModalOpen(true)}
                  className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-[var(--shadow-soft)] transition-all hover:scale-105"
                >
                  Jelajahi Semua Mitos
                </Button>
              </div>
            </div>
            
            <div className="w-full md:w-80 shrink-0 relative z-10">
              <MythFlashcard data={dailyMyth} />
            </div>
          </div>
        </section>

        <footer className="mt-12 text-center text-xs text-muted-foreground">
          {user ? "Data tersimpan aman di cloud database Supabase." : "Data tersimpan lokal di perangkat Anda (Masuk untuk menyimpan di cloud)."} Prediksi berbasis rata-rata siklus.
        </footer>
      </div>

      <MythsModal isOpen={isMythsModalOpen} onClose={() => setIsMythsModalOpen(false)} />
    </div>
  );
}
