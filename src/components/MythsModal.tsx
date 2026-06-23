import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MythFlashcard } from "./MythFlashcard";
import { MYTHS_FACTS, type MythFact } from "@/lib/myths";
import { HelpCircle, ChevronLeft } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function MythsModal({ isOpen, onClose }: Props) {
  const [selectedMyth, setSelectedMyth] = useState<MythFact | null>(null);

  const handleClose = () => {
    setSelectedMyth(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2 shrink-0 border-b border-border/40">
          <div className="flex items-center gap-2">
            {selectedMyth && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSelectedMyth(null)} 
                className="h-8 w-8 -ml-2 hover:bg-secondary rounded-full"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            <DialogTitle className="text-2xl font-bold">Koleksi Mitos vs Fakta</DialogTitle>
          </div>
          <DialogDescription>
            {selectedMyth 
              ? "Klik pada kartu di bawah untuk membalikkannya dan melihat fakta ilmiah."
              : "Pilih mitos di bawah ini untuk mengeksplorasi kebenarannya."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 p-6 bg-secondary/20">
          {selectedMyth ? (
            <div className="flex justify-center items-center h-full min-h-[400px]">
              <MythFlashcard data={selectedMyth} className="w-full max-w-lg h-[400px] md:h-[450px]" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {MYTHS_FACTS.map((myth) => (
                <div 
                  key={myth.id} 
                  onClick={() => setSelectedMyth(myth)}
                  className="bg-card border border-border rounded-2xl p-5 cursor-pointer hover:border-primary/40 hover:shadow-md transition-all flex flex-col gap-3 group"
                >
                   <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
                     <HelpCircle className="h-4 w-4" />
                     <h3 className="font-bold text-sm">Mitos</h3>
                   </div>
                   <p className="text-sm font-medium text-foreground">"{myth.mitos}"</p>
                   <div className="mt-auto pt-3 text-xs text-primary font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                      Lihat Fakta <span className="text-lg leading-none">&rarr;</span>
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
