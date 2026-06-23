import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MythFlashcard } from "./MythFlashcard";
import { MYTHS_FACTS } from "@/lib/myths";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function MythsModal({ isOpen, onClose }: Props) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-bold">Koleksi Mitos vs Fakta</DialogTitle>
          <DialogDescription>
            Klik pada setiap kartu untuk membalikkannya dan melihat fakta ilmiah di balik mitos seputar menstruasi.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MYTHS_FACTS.map((myth) => (
              <MythFlashcard key={myth.id} data={myth} />
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
