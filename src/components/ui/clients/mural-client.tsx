"use client";

import { useEffect, useState } from "react";
import {
  LuCheck,
  LuGripHorizontal,
  LuPlus,
  LuTrash2,
  LuPencil,
} from "react-icons/lu"; 
import ReactMarkdown from "react-markdown";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRouter } from "next/navigation";

import {
  createNoteAction,
  deleteNoteAction,
  reorderNotesAction,
  updateNoteAction,
} from "@/src/app/actions/notes-actions";
import { Button } from "@/src/components/shadcn-ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/shadcn-ui/dialog";
import { Input } from "@/src/components/shadcn-ui/input";
import { Textarea } from "@/src/components/shadcn-ui/textarea";

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
  onEdit,
  isDeleting,
  index,
}: {
  note: Note;
  onDelete: (id: string) => void;
  onEdit: (note: Note) => void; 
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
      className={`group slide-in-from-bottom-4 fill-mode-both relative flex min-h-70 flex-col overflow-hidden rounded border border-[#1A1A1A] bg-[#0A0A0A] shadow-lg transition-colors duration-500 hover:border-zinc-700 ${isDragging ? "cursor-grabbing shadow-2xl ring-2 ring-[#007AFF]/50" : ""}`}
    >
      <div
        className="absolute top-0 left-0 h-2 w-full"
        style={{ backgroundColor: note.color || "#007AFF" }}
      />

      <div
        {...attributes}
        {...listeners}
        className="absolute top-4 right-4 cursor-grab touch-none p-1 text-zinc-600 hover:text-zinc-300 active:cursor-grabbing"
        title="Arrastar anotação"
      >
        <LuGripHorizontal className="h-5 w-5" />
      </div>

      <div className="flex h-full flex-col p-8">
        <h3 className="mb-4 pr-8 text-2xl leading-tight font-bold text-[#E0E0E0]">
          {note.title}
        </h3>
        <div className="prose prose-sm prose-invert prose-p:leading-relaxed prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-zinc-800 line-clamp-4 max-w-none text-zinc-400">
          <ReactMarkdown>{note.content}</ReactMarkdown>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-[#1A1A1A] pt-4 text-sm font-medium text-zinc-600">
          <span>{new Date(note.createdAt).toLocaleDateString("pt-BR")}</span>

          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(note);
              }}
              className="relative z-10 rounded-lg p-2 text-zinc-500 opacity-0 transition-all group-hover:opacity-100 hover:bg-[#007AFF]/10 hover:text-[#007AFF]"
              title="Editar anotação"
            >
              <LuPencil className="h-5 w-5" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(note.id);
              }}
              disabled={isDeleting}
              className="relative z-10 -mr-2 rounded-lg p-2 text-zinc-500 opacity-0 transition-all group-hover:opacity-100 hover:bg-[#FF3B30]/10 hover:text-[#FF3B30] disabled:opacity-50"
              title="Apagar anotação"
            >
              <LuTrash2 className="h-5 w-5" />
            </button>
          </div>
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

  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
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

  function openEditModal(note: Note) {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setSelectedColor(note.color || NOTE_COLORS[0].value);
    setError(null);
    setIsOpen(true);
  }

  function openCreateModal() {
    setEditingNote(null);
    setNoteTitle("");
    setNoteContent("");
    setSelectedColor(NOTE_COLORS[0].value);
    setError(null);
    setIsOpen(true);
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    if (!noteTitle || !noteContent) {
      setError("Preencha o título e o conteúdo da anotação.");
      setIsSaving(false);
      return;
    }

    if (editingNote) {
      const result = await updateNoteAction({
        id: editingNote.id,
        title: noteTitle,
        content: noteContent,
        color: selectedColor,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setNotes((prev) =>
          prev.map((n) =>
            n.id === editingNote.id
              ? {
                  ...n,
                  title: noteTitle,
                  content: noteContent,
                  color: selectedColor,
                }
              : n,
          ),
        );
        setIsOpen(false);
      }
    } else {
      const result = await createNoteAction({
        title: noteTitle,
        content: noteContent,
        color: selectedColor,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setIsOpen(false);
        router.refresh();
      }
    }

    setIsSaving(false);
  }

  return (
    <section>
      <header className="flex items-end justify-between border-[#1A1A1A] pb-4">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={openCreateModal}
              className="h-12 gap-2 rounded-xl bg-[#007AFF] px-6 font-bold text-white hover:bg-[#005bb5]"
            >
              <LuPlus className="h-5 w-5" /> Novo Post-it
            </Button>
          </DialogTrigger>

          <DialogContent className="rounded-2xl border-[#1A1A1A] bg-[#121212] text-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {editingNote ? "Editar Anotação" : "Criar Anotação"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-6 pt-4">
              {error && (
                <p className="text-sm font-medium text-red-500">{error}</p>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-300">
                  Título
                </label>
                <Input
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Ex: Prova de..."
                  className="h-12 rounded-xl border-zinc-800 bg-zinc-900/50 text-white focus-visible:ring-[#007AFF]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-zinc-300">
                  Conteúdo
                </label>
                <Textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Resumo, ideias..."
                  className="min-h-30 resize-none rounded-xl border-zinc-800 bg-zinc-900/50 text-white focus-visible:ring-[#007AFF]"
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
                      className={`flex h-8 w-8 items-center justify-center rounded-full transition-transform hover:scale-110 ${selectedColor === c.value ? "ring-2 ring-white ring-offset-2 ring-offset-[#121212]" : ""}`}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    >
                      {selectedColor === c.value && (
                        <LuCheck className="h-4 w-4 text-white drop-shadow-md" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSaving}
                className="h-12 w-full rounded-xl bg-[#007AFF] font-bold text-white hover:bg-[#005bb5]"
              >
                {isSaving
                  ? "Salvando..."
                  : editingNote
                    ? "Salvar Alterações"
                    : "Salvar Post-it"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      {notes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#1A1A1A] bg-[#0A0A0A] py-24 text-center">
          <p className="text-lg text-zinc-500">Mural vazio...</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={notes} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {notes.map((note, index) => (
                <SortableNoteCard
                  key={note.id}
                  note={note}
                  index={index}
                  onDelete={handleDelete}
                  onEdit={openEditModal}
                  isDeleting={isDeleting === note.id}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </section>
  );
}
