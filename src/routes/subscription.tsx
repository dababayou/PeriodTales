import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/subscription")({
  head: () => ({
    meta: [
      { title: "CycleTrack Premium — Berlangganan" },
      { name: "description", content: "Dapatkan akses fitur lengkap CycleTrack hanya 15K/bulan." },
    ],
  }),
  component: SubscriptionPage,
});

function SubscriptionPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Decorative background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Beranda</span>
        </Link>

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 text-sm font-semibold mb-4">
            <Crown className="h-4 w-4" />
            CycleTrack Premium
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight mb-4">
            Pantau Datang Bulan,<br /> Lebih Siap Setiap Hari
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Dapatkan prediksi akurat, insight harian, dan keamanan data penuh. Mulai pantau siklus Anda dengan lebih baik hari ini.
          </p>
        </div>

        <div className="max-w-md mx-auto bg-card border border-primary/20 rounded-3xl p-8 shadow-[var(--shadow-card)] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <Sparkles className="h-6 w-6 text-primary opacity-20" />
          </div>
          
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-foreground mb-2">Paket Bulanan</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-primary">Rp 15.000</span>
              <span className="text-muted-foreground">/bulan</span>
            </div>
          </div>

          <ul className="space-y-4 mb-8">
            {[
              "Prediksi datang bulan yang akurat",
              "Pantau siklus & pola tubuh menyeluruh",
              "Insight & notifikasi harian untuk Anda",
              "Pengingat siklus otomatis",
              "Aman & privat: Data Anda terlindungi"
            ].map((feature, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="mt-0.5 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Check className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-foreground">{feature}</span>
              </li>
            ))}
          </ul>

          <Button className="w-full h-12 rounded-xl text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-[var(--shadow-soft)] transition-all hover:scale-[1.02]">
            Berlangganan Sekarang
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-4">
            Dapat dibatalkan kapan saja.
          </p>
        </div>
      </div>
    </div>
  );
}
