import { Link } from "@tanstack/react-router";
import poster from "./assets/poster.png";

export function SubscriptionBanner() {
  return (
    <Link 
      to="/subscription" 
      className="block w-full mb-8 rounded-2xl md:rounded-3xl overflow-hidden shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-card)] hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background group"
    >
      <div className="relative w-full overflow-hidden bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30">
        <img 
          src={poster} 
          alt="Berlangganan Cycletrack cuma 15K/bulan. Pantau datang bulan, lebih siap setiap hari." 
          className="w-full h-auto object-cover object-center group-hover:opacity-95 transition-opacity"
          loading="lazy"
        />
      </div>
    </Link>
  );
}
