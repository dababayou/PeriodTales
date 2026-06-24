import { useState, useEffect } from "react";
import { Droplet, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import tmbh1 from "./assets/tmbh1.PNG";
import tmbh2 from "./assets/tmbh2.PNG";
import tmbh3 from "./assets/tmbh3.PNG";
import tmbh4 from "./assets/tmbh4.PNG";
import tmbh5 from "./assets/tmbh5.PNG";

import koin1 from "./assets/koin1.png";
import koin2 from "./assets/koin2.png";
import koin3 from "./assets/koin3.png";
import koin4 from "./assets/koin4.png";
import koin5 from "./assets/koin5.png";
import koin6 from "./assets/koin6.png";
import koin7 from "./assets/koin7.png";
import coinSoundFile from "./assets/coinsound.mp3";

const IMAGES = [tmbh1, tmbh2, tmbh3, tmbh4, tmbh5];
const KOINS = [koin1, koin2, koin3, koin4, koin5, koin6, koin7];
const coinAudio = typeof window !== 'undefined' ? new Audio(coinSoundFile) : null;

type Props = {
  water: number;
  coins?: number;
  onChange: (newWater: number, newCoins: number) => void;
};

export function HydrationPlant({ water, coins = 0, onChange }: Props) {
  const [isWatering, setIsWatering] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);
  const [showCoin, setShowCoin] = useState(false);
  const [coinFrame, setCoinFrame] = useState(0);
  const [lastWateredAt, setLastWateredAt] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  // Load last watered time
  useEffect(() => {
    const stored = localStorage.getItem("lunaflow-last-watered");
    if (stored) {
      setLastWateredAt(parseInt(stored, 10));
    }
  }, []);

  // Update timer
  useEffect(() => {
    if (lastWateredAt > 0) {
      const updateTimer = () => {
        const elapsed = Date.now() - lastWateredAt;
        const thirtyMins = 30 * 60 * 1000;
        if (elapsed >= thirtyMins) {
          setTimeRemaining(0);
        } else {
          setTimeRemaining(thirtyMins - elapsed);
        }
      };
      updateTimer(); // Initial call
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [lastWateredAt]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Map 0 to 8+ glasses into 5 stages (0 to 4 index)
  const stageIndex = Math.min(Math.floor(water / 2), 4);
  const currentImage = IMAGES[stageIndex];

  // Coin flip animation loop
  useEffect(() => {
    if (showCoin) {
      const interval = setInterval(() => {
        setCoinFrame((f) => (f + 1) % 7);
      }, 70); // 70ms per frame for a fast flip
      return () => clearInterval(interval);
    } else {
      setCoinFrame(0);
    }
  }, [showCoin]);

  const handleWater = () => {
    if (coinAudio) {
      coinAudio.volume = 0.7; // Not too loud
      coinAudio.load(); // Helps unlock audio context on mobile
    }
    
    setIsWatering(true);
    
    // Plant bounce starts slightly after water animation starts
    setTimeout(() => {
      setIsBouncing(true);
    }, 300);

    setTimeout(() => {
      setIsWatering(false);
      onChange(water + 1, coins + 1);
    }, 1000);

    setTimeout(() => {
      setIsBouncing(false);
      // Start coin animation
      setShowCoin(true);
      if (coinAudio) {
        coinAudio.currentTime = 0;
        coinAudio.play().catch(e => console.log("Audio play error:", e));
      }
    }, 1300);

    // End coin animation
    setTimeout(() => {
      setShowCoin(false);
      const now = Date.now();
      setLastWateredAt(now);
      localStorage.setItem("lunaflow-last-watered", now.toString());
    }, 2300); // 1 second of flipping coin
  };

  const handleUndo = () => {
    if (water > 0) {
      onChange(water - 1, Math.max(0, coins - 1));
      setLastWateredAt(0);
      setTimeRemaining(0);
      localStorage.removeItem("lunaflow-last-watered");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-5 w-full py-2 relative">
      {/* Hidden preloads */}
      <div className="hidden">
        {KOINS.map((src, i) => <img key={`preload-koin-${i}`} src={src} alt="preload" />)}
      </div>

      <style>
        {`
          @keyframes pour {
            0% { transform: translateY(-30px) scale(0.5); opacity: 0; }
            30% { opacity: 1; }
            100% { transform: translateY(50px) scale(1.2); opacity: 0; }
          }
          .animate-pour-1 { animation: pour 0.7s ease-in forwards; }
          .animate-pour-2 { animation: pour 0.8s ease-in 0.1s forwards; }
          .animate-pour-3 { animation: pour 0.7s ease-in 0.2s forwards; }
          
          @keyframes coin-float {
            0% { transform: translateY(20px) scale(0.5); opacity: 0; }
            15% { transform: translateY(-40px) scale(1.2); opacity: 1; }
            85% { transform: translateY(-40px) scale(1.2); opacity: 1; }
            100% { transform: translateY(-70px) scale(0.5); opacity: 0; }
          }
          .animate-coin-float {
            animation: coin-float 1s ease-in-out forwards;
          }
        `}
      </style>

      {/* Watering Animation Area */}
      <div className="relative w-48 h-48 flex items-end justify-center rounded-3xl bg-gradient-to-t from-primary/5 to-transparent p-4 border border-primary/10">
        
        {/* Coin Badge */}
        {coins > 0 && (
          <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-amber-100/90 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 px-2 py-1 rounded-full text-xs font-bold z-20 shadow-sm border border-amber-200/50 transition-all">
            <img src={koin1} className="w-4 h-4 object-contain" alt="Coin Icon" />
            <span>{coins}</span>
          </div>
        )}

        {/* Floating Coin Animation */}
        {showCoin && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 animate-coin-float pointer-events-none drop-shadow-lg">
            <img src={KOINS[coinFrame]} alt="Coin Flipping" className="w-14 h-14 object-contain" />
          </div>
        )}

        {/* Plant Image */}
        <div className={cn(
          "relative z-10 transition-transform duration-500 ease-in-out origin-bottom",
          isBouncing ? "scale-110 drop-shadow-md" : "scale-100"
        )}>
          <img 
            src={currentImage} 
            alt={`Tahap Pertumbuhan Bunga: ${stageIndex + 1}`} 
            className="w-full h-full object-contain max-h-40"
          />
        </div>

        {/* Droplets Animation */}
        {isWatering && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-3 z-20">
             <Droplet className="h-5 w-5 text-blue-400 fill-blue-400 animate-pour-1 opacity-0" />
             <Droplet className="h-6 w-6 text-blue-500 fill-blue-500 animate-pour-2 opacity-0" />
             <Droplet className="h-5 w-5 text-blue-400 fill-blue-400 animate-pour-3 opacity-0" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 w-full justify-center">
        <Button 
          type="button"
          variant="outline"
          size="icon"
          onClick={handleUndo}
          disabled={water === 0}
          className="h-12 w-12 rounded-full border-2 transition-all hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
          title="Kurangi 1 Gelas"
          aria-label="Kurangi air"
        >
          <Undo2 className="h-5 w-5" />
        </Button>

        <Button 
          type="button"
          onClick={handleWater}
          disabled={isWatering || showCoin || timeRemaining > 0}
          className="h-12 px-8 rounded-full font-semibold gap-2 shadow-[var(--shadow-soft)] transition-all hover:scale-105 active:scale-95 text-md"
        >
          {timeRemaining > 0 ? (
            `Tunggu ${formatTime(timeRemaining)}`
          ) : (
            <>
              <Droplet className="h-5 w-5" />
              Siram Tanaman
            </>
          )}
        </Button>
      </div>
      
    </div>
  );
}
