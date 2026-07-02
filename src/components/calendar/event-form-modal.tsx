import { useMemo } from "react";
import { LuCalendarPlus, LuClock } from "react-icons/lu";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Button } from "../shadcn-ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../shadcn-ui/dialog";
import { Input } from "../shadcn-ui/input";
import { Textarea } from "../shadcn-ui/textarea";

import { CalendarEvent } from "@/src/hooks/use-calendar";


type EventFormModalProps = {
  isOpen: boolean;
  selectedDate: Date | undefined;
  time: string;
  descCount: number;
  loading: boolean;
  error: string | null;
  editingEvent: CalendarEvent | null;
  onTimeChange: (value: string) => void;
  onDescCountChange: (value: number) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onOpenChange: (open: boolean) => void;
};

export default function EventFormModal({
  isOpen,
  selectedDate,
  time,
  descCount,
  loading,
  error,
  editingEvent,
  onTimeChange,
  onDescCountChange,
  onSubmit,
  onOpenChange,
}: EventFormModalProps) {
  const formattedDate = useMemo(() => {
    return selectedDate
      ? format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
      : "";
  }, [selectedDate]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-100 rounded-xl border-[#1A1A1A] bg-[#121212] p-4 text-white sm:max-w-md sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold sm:text-2xl">
            <LuCalendarPlus className="text-[#007AFF]" />
            {editingEvent ? "Editar Evento" : "Novo Evento"}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={onSubmit}
          className="space-y-4 pt-2 sm:space-y-5 sm:pt-4"
        >
          {error && (
            <p className="text-xs font-medium text-[#FF3B30] sm:text-sm">
              {error}
            </p>
          )}
          <div className="rounded-lg border border-zinc-800 bg-black/50 p-2 text-center text-xs font-medium text-zinc-300 capitalize sm:p-3 sm:text-sm">
            {formattedDate}
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="col-span-2 space-y-1.5 sm:space-y-2">
              <label className="text-xs font-semibold text-zinc-300 sm:text-sm">
                Título
              </label>
              <Input
                name="title"
                defaultValue={editingEvent?.title || ""}
                placeholder="Ex: Prova de Geometria"
                className="h-10 rounded-xl border-zinc-800 bg-zinc-900/50 text-sm text-white focus-visible:ring-[#007AFF] sm:h-12 sm:text-base"
              />
            </div>
            <div className="col-span-1 space-y-1.5 sm:space-y-2">
              <label className="flex items-center gap-1 text-xs font-semibold text-zinc-300 sm:text-sm">
                <LuClock className="hidden sm:block" /> Hora
              </label>
              <Input
                type="time"
                value={time}
                onChange={(e) => onTimeChange(e.target.value)}
                className="h-10 rounded-xl border-zinc-800 bg-zinc-900/50 text-sm text-white focus-visible:ring-[#007AFF] sm:h-12 sm:text-base [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:filter"
              />
            </div>
          </div>
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-300 sm:text-sm">
                Descrição
              </label>
              <span
                className={`text-[10px] sm:text-xs ${descCount >= 100 ? "text-[#FF3B30]" : "text-zinc-500"}`}
              >
                {descCount}/100
              </span>
            </div>
            <Textarea
              name="description"
              maxLength={100}
              defaultValue={editingEvent?.description || ""}
              onChange={(e) => onDescCountChange(e.target.value.length)}
              placeholder="Anotações para o evento..."
              className="min-h-20 resize-none rounded-xl border-zinc-800 bg-zinc-900/50 text-sm text-white focus-visible:ring-[#007AFF] sm:min-h-25 sm:text-base"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="mt-2 h-10 w-full rounded-xl bg-[#007AFF] text-sm font-bold text-white hover:bg-[#005bb5] sm:mt-4 sm:h-12 sm:text-base"
          >
            {loading
              ? "Processando..."
              : editingEvent
                ? "Salvar Alterações"
                : "Salvar Evento"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
