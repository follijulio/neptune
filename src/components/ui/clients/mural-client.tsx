"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/shadcn-ui/button";
import { Input } from "@/src/components/shadcn-ui/input";
import { Textarea } from "@/src/components/shadcn-ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/shadcn-ui/dialog";
import { LuPlus, LuTrash2, LuCheck, LuGripHorizontal } from "react-icons/lu";
import {
  deleteNoteAction,
  createNoteAction,
  reorderNotesAction,
} from "@/src/app/actions/notes-actions";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { NavBar } from "../nav-bar";

type Note = {
  id: string;
  title: string;
  content: string;
  color: string | null;
  position: number;
  createdAt: Date;
};

const NOTE_COLORS = [
  { name: "Azul Netuno", value: "#007AFF" },
  { name: "Vermelho Urgente", value: "#FF3B30" },
  { name: "Verde Aprovado", value: "#34C759" },
  { name: "Laranja Atenção", value: "#FF9500" },
  { name: "Roxo Seminário", value: "#AF52DE" },
  { name: "Cinza Neutro", value: "#8E8E93" },
];

function SortableNoteCard({
  note,
  onDelete,
  isDeleting,
  index,
}: {
  note: Note;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  index: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: note.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
    animationDelay: `${index * 20}ms`,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl flex flex-col min-h-[280px] shadow-lg hover:border-zinc-700 transition-colors overflow-hidden  slide-in-from-bottom-4 duration-500 fill-mode-both ${isDragging ? "shadow-2xl ring-2 ring-[#007AFF]/50 cursor-grabbing" : ""}`}
    >
      <div
        className="absolute top-0 left-0 w-full h-2"
        style={{ backgroundColor: note.color || "#007AFF" }}
      />

      <div
        {...attributes}
        {...listeners}
        className="absolute top-4 right-4 text-zinc-600 hover:text-zinc-300 cursor-grab active:cursor-grabbing p-1 touch-none"
        title="Arrastar anotação"
      >
        <LuGripHorizontal className="h-5 w-5" />
      </div>

      <div className="p-8 flex flex-col h-full">
        <h3 className="text-2xl font-bold text-[#E0E0E0] mb-4 pr-8 leading-tight">
          {note.title}
        </h3>
        <p className="text-[#A0A0A0] text-base flex-1 whitespace-pre-wrap leading-relaxed">
          {note.content}
        </p>

        <div className="mt-8 flex justify-between items-center text-sm font-medium text-zinc-600 border-t border-[#1A1A1A] pt-4">
          <span>{new Date(note.createdAt).toLocaleDateString("pt-BR")}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note.id);
            }}
            disabled={isDeleting}
            className="text-zinc-500 hover:text-[#FF3B30] transition-colors disabled:opacity-50 p-2 -mr-2 rounded-lg hover:bg-[#FF3B30]/10 z-10 relative"
            title="Apagar anotação"
          >
            <LuTrash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MuralClient({
  initialNotes,
}: {
  initialNotes: Note[];
}) {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState(NOTE_COLORS[0].value);

  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = notes.findIndex((n) => n.id === active.id);
      const newIndex = notes.findIndex((n) => n.id === over.id);

      const newOrder = arrayMove(notes, oldIndex, newIndex);
      setNotes(newOrder);

      const orderedIds = newOrder.map((n) => n.id);
      await reorderNotesAction(orderedIds);
    }
  }

  async function handleDelete(noteId: string) {
    setIsDeleting(noteId);
    const result = await deleteNoteAction(noteId);
    if (result.success) setNotes((prev) => prev.filter((n) => n.id !== noteId));
    setIsDeleting(null);
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      content: formData.get("content") as string,
      color: selectedColor,
    };

    if (!data.title || !data.content) {
      setError("Preencha o título e o conteúdo da anotação.");
      setIsSaving(false);
      return;
    }

    const result = await createNoteAction(data);
    if (result.error) {
      setError(result.error);
    } else {
      setIsOpen(false);
      router.refresh();
    }
    setIsSaving(false);
  }

  return (
    <div className="mx-auto bg-black min-h-screen w-screen text-white gap-2 flex flex-col">
      <NavBar />
      <div className="max-w-7xl mx-auto w-full">
        <header className="mb-12 flex justify-between items-end border-b border-[#1A1A1A] pb-6">
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">
              Mural de Anotações
            </h1>
            <p className="text-zinc-500 mt-2 text-base">
              Organize as suas provas e ideias. Arraste os cartões para
              priorizar.
            </p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#007AFF] hover:bg-[#005bb5] text-white font-bold gap-2 rounded-xl h-12 px-6">
                <LuPlus className="h-5 w-5" /> Novo Post-it
              </Button>
            </DialogTrigger>

            <DialogContent className="bg-[#121212] border-[#1A1A1A] text-white sm:max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">
                  Criar Anotação
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-6 pt-4">
                {error && (
                  <p className="text-red-500 text-sm font-medium">{error}</p>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-300">
                    Título
                  </label>
                  <Input
                    name="title"
                    placeholder="prova de ..."
                    className="bg-zinc-900/50 border-zinc-800 text-white h-12 rounded-xl focus-visible:ring-[#007AFF]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-300">
                    Conteúdo
                  </label>
                  <Textarea
                    name="content"
                    placeholder="a prova vai ter questões sobre..."
                    className="bg-zinc-900/50 border-zinc-800 text-white min-h-[120px] rounded-xl focus-visible:ring-[#007AFF] resize-none"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-zinc-300">
                    Cor da Tag
                  </label>
                  <div className="flex gap-3">
                    {NOTE_COLORS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setSelectedColor(c.value)}
                        className={`h-8 w-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${selectedColor === c.value ? "ring-2 ring-white ring-offset-2 ring-offset-[#121212]" : ""}`}
                        style={{ backgroundColor: c.value }}
                        title={c.name}
                      >
                        {selectedColor === c.value && (
                          <LuCheck className="text-white h-4 w-4 drop-shadow-md" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-[#007AFF] hover:bg-[#005bb5] text-white font-bold h-12 rounded-xl"
                >
                  {isSaving ? "Salvando..." : "Salvar Post-it"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        {notes.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-[#1A1A1A] rounded-2xl bg-[#0A0A0A]">
            <p className="text-zinc-500 text-lg">Mural vazio...</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={notes} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {notes.map((note, index) => (
                  <SortableNoteCard
                    key={note.id}
                    note={note}
                    index={index}
                    onDelete={handleDelete}
                    isDeleting={isDeleting === note.id}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
