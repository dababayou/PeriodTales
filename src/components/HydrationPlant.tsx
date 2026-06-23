import { useState } from "react";
import { Droplet, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import tmbh1 from "./assets/tmbh1.PNG";
import tmbh2 from "./assets/tmbh2.PNG";
import tmbh3 from "./assets/tmbh3.PNG";
import tmbh4 from "./assets/tmbh4.PNG";
import tmbh5 from "./assets/tmbh5.PNG";

const IMAGES = [tmbh1, tmbh2, tmbh3, tmbh4, tmbh5];

type Props = {
  water: number;
  onChange: (newWater: number) => void;
};

export function HydrationPlant({ water, onChange }: Props) {
  const [isWatering, setIsWatering] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);

  // Map 0 to 8+ glasses into 5 stages (0 to 4 index)
  // Stage 0: 0-1 glasses
  // Stage 1: 2-3 glasses
  // Stage 2: 4-5 glasses
  // Stage 3: 6-7 glasses
  // Stage 4: 8+ glasses
  const stageIndex = Math.min(Math.floor(water / 2), 4);
  const currentImage = IMAGES[stageIndex];

  const handleWater = () => {
    setIsWatering(true);
    
    // Plant bounce starts slightly after water animation starts
    setTimeout(() => {
      setIsBouncing(true);
    }, 300);

    setTimeout(() => {
      setIsWatering(false);
      onChange(water + 1);
    }, 1000);

    setTimeout(() => {
      setIsBouncing(false);
    }, 1300);
  };

  const handleUndo = () => {
    if (water > 0) {
      onChange(water - 1);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-5 w-full py-2 relative">
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
        `}
      </style>

      {/* Watering Animation Area */}
      <div className="relative w-48 h-48 flex items-end justify-center rounded-3xl bg-gradient-to-t from-primary/5 to-transparent p-4 border border-primary/10">
        
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
          disabled={isWatering}
          className="h-12 px-8 rounded-full font-semibold gap-2 shadow-[var(--shadow-soft)] transition-all hover:scale-105 active:scale-95 text-md"
        >
          <Droplet className="h-5 w-5" />
          Siram Tanaman
        </Button>
      </div>
      
    </div>
  );
}
