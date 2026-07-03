import { useMemo } from "react";
import { LuAlignLeft, LuClock, LuPencil } from "react-icons/lu";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Trash2 } from "lucide-react";

import { Button } from "../shadcn-ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../shadcn-ui/dialog";

import { CalendarEvent } from "@/src/hooks/use-calendar";

export default function EventDetailsModal({
  isOpen,
  event,
  onOpenChange,
  onDelete,
  onEdit,
  isDeleting,
}: {
  isOpen: boolean;
  event: CalendarEvent | null;
  onOpenChange: (open: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (event: CalendarEvent) => void;
  isDeleting: boolean;
}) {
  const formattedDate = useMemo(() => {
    return event?.date
      ? format(event.date as Date, "dd 'de' MMM, yyyy", { locale: ptBR })
      : "";
  }, [event]);

  const formattedTime = useMemo(() => {
    return event?.date ? format(event.date as Date, "HH:mm") : "";
  }, [event]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-100 rounded-xl border-[#1A1A1A] bg-[#121212] p-4 text-white sm:max-w-md sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 border-b border-[#1A1A1A] pb-3 text-lg font-bold text-[#E0E0E0] sm:pb-4 sm:text-xl">
            <LuAlignLeft className="text-[#007AFF]" /> Detalhes do Evento
          </DialogTitle>
        </DialogHeader>

        {event && (
          <div className="space-y-4 pt-2 sm:space-y-6">
            <div>
              <h3 className="mb-0.5 text-[10px] font-semibold tracking-wider text-zinc-500 uppercase sm:mb-1 sm:text-xs">
                Título
              </h3>
              <p className="text-lg font-bold text-[#007AFF] sm:text-xl">
                {event.title}
              </p>
            </div>

            <div className="flex gap-6 rounded-xl border border-[#1A1A1A] bg-black/30 p-3 sm:gap-12 sm:p-4">
              <div>
                <h3 className="mb-0.5 flex items-center gap-1 text-[10px] font-semibold tracking-wider text-zinc-500 uppercase sm:mb-1 sm:text-xs">
                  Data
                </h3>
                <p className="text-sm font-medium text-white capitalize sm:text-base">
                  {formattedDate}
                </p>
              </div>
              <div>
                <h3 className="mb-0.5 flex items-center gap-1 text-[10px] font-semibold tracking-wider text-zinc-500 uppercase sm:mb-1 sm:text-xs">
                  <LuClock className="hidden sm:block" /> Hora
                </h3>
                <p className="text-sm font-medium text-white sm:text-base">
                  {formattedTime}
                </p>
              </div>
            </div>

            {event.description && (
              <div>
                <h3 className="mb-1.5 text-[10px] font-semibold tracking-wider text-zinc-500 uppercase sm:mb-2 sm:text-xs">
                  Descrição
                </h3>
                <p className="rounded-xl border border-[#1A1A1A] bg-black/50 p-3 text-xs leading-relaxed whitespace-pre-wrap text-zinc-300 sm:p-4 sm:text-sm">
                  {event.description}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-2 flex items-center justify-between border-t border-[#1A1A1A] pt-4 sm:pt-6">
          <div className="flex gap-1 sm:gap-2">
            <Button
              variant="ghost"
              onClick={() => event && onDelete(event.id)}
              disabled={isDeleting}
              className="flex items-center gap-1.5 rounded-lg px-2 text-xs text-[#FF3B30] transition-colors hover:bg-[#FF3B30] hover:text-white sm:gap-2 sm:px-4 sm:text-sm"
            >
              <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">
                {isDeleting ? "A excluir..." : "Excluir"}
              </span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => event && onEdit(event)}
              className="flex items-center gap-1.5 rounded-lg px-2 text-xs text-[#007AFF] transition-colors hover:bg-[#007AFF] hover:text-white sm:gap-2 sm:px-4 sm:text-sm"
            >
              <LuPencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Editar</span>
            </Button>
          </div>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="rounded-lg px-3 text-xs text-white hover:bg-zinc-800 sm:px-4 sm:text-sm"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
