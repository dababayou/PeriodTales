import { useState } from "react";
import { HelpCircle, CheckCircle2, Quote, RefreshCw } from "lucide-react";
import { type MythFact } from "@/lib/myths";
import { cn } from "@/lib/utils";

type Props = {
  data: MythFact;
  className?: string;
};

export function MythFlashcard({ data, className }: Props) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className={cn("relative w-full h-[280px] perspective-1000 group cursor-pointer", className)}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className={cn(
          "w-full h-full absolute top-0 left-0 transition-transform duration-700 transform-style-3d shadow-[var(--shadow-card)] rounded-3xl",
          isFlipped ? "rotate-y-180" : ""
        )}
      >
        {/* Front Side: Myth */}
        <div className="absolute w-full h-full backface-hidden bg-card border border-border rounded-3xl p-6 flex flex-col hover:border-primary/50 transition-colors">
          <div className="flex items-center gap-2 mb-4 text-amber-600 dark:text-amber-500">
            <HelpCircle className="h-5 w-5" />
            <h3 className="font-bold tracking-tight">Mitos</h3>
          </div>
          
          <div className="flex-1 flex items-center justify-center text-center">
            <p className="text-lg md:text-xl font-medium text-foreground leading-relaxed">
              "{data.mitos}"
            </p>
          </div>
          
          <div className="mt-auto flex items-center justify-center gap-2 text-xs text-muted-foreground pt-4 border-t border-border/50">
            <RefreshCw className="h-3 w-3" />
            <span>Klik untuk melihat fakta</span>
          </div>
        </div>

        {/* Back Side: Fact */}
        <div className="absolute w-full h-full backface-hidden bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-3xl p-6 flex flex-col rotate-y-180 overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-2 mb-3 text-primary">
            <CheckCircle2 className="h-5 w-5" />
            <h3 className="font-bold tracking-tight">Fakta</h3>
          </div>
          
          <div className="flex-1 flex flex-col justify-center">
            <p className="text-sm md:text-base text-foreground leading-relaxed">
              {data.fakta}
            </p>
            
            <div className="mt-4 flex items-start gap-2 bg-background/60 p-3 rounded-xl border border-primary/10 text-xs text-muted-foreground">
              <Quote className="h-3 w-3 mt-0.5 shrink-0" />
              <p className="leading-tight">{data.sumber}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
