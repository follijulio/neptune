"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LuCheck,
  LuGripHorizontal,
  LuPencil,
  LuPlus,
  LuTrash2,
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

type NoteColor = {
  name: string;
  value: string;
};

const NOTE_COLORS: NoteColor[] = [
  { name: "Azul Netuno", value: "#007AFF" },
  { name: "Vermelho Urgente", value: "#FF3B30" },
  { name: "Verde Aprovado", value: "#34C759" },
  { name: "Laranja Atenção", value: "#FF9500" },
  { name: "Roxo Seminário", value: "#AF52DE" },
  { name: "Cinza Neutro", value: "#8E8E93" },
];

interface SortableNoteCardProps {
  note: Note;
  onDelete: (id: string) => void;
  onEdit: (note: Note) => void;
  isDeleting: boolean;
  index: number;
}

interface DialogFormProps {
  editingNote: Note | null;
  noteTitle: string;
  noteContent: string;
  selectedColor: string;
  error: string | null;
  isSaving: boolean;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onColorChange: (color: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

interface ColorSelectorProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
}

interface NoteGridProps {
  notes: Note[];
  isDeleting: string | null;
  onDelete: (id: string) => void;
  onEdit: (note: Note) => void;
  onDragEnd: (event: DragEndEvent) => void;
}

const ColorSelector = ({
  selectedColor,
  onColorChange,
}: ColorSelectorProps) => (
  <div className="space-y-2 sm:space-y-3">
    <label className="text-xs font-semibold text-zinc-300 sm:text-sm">
      Cor da Tag
    </label>
    <div className="flex flex-wrap gap-2 sm:gap-3">
      {NOTE_COLORS.map((c) => (
        <button
          key={c.value}
          type="button"
          onClick={() => onColorChange(c.value)}
          className={`flex h-7 w-7 items-center justify-center rounded-2xl transition-transform hover:scale-110 sm:h-8 sm:w-8 ${
            selectedColor === c.value
              ? "ring-2 ring-white ring-offset-2 ring-offset-[#121212]"
              : ""
          }`}
          style={{ backgroundColor: c.value }}
          title={c.name}
        >
          {selectedColor === c.value && (
            <LuCheck className="h-3 w-3 text-white drop-shadow-md sm:h-4 sm:w-4" />
          )}
        </button>
      ))}
    </div>
  </div>
);

const NoteFormDialog = ({
  editingNote,
  noteTitle,
  noteContent,
  selectedColor,
  error,
  isSaving,
  onTitleChange,
  onContentChange,
  onColorChange,
  onSubmit,
}: DialogFormProps) => (
  <DialogContent className="w-[95vw] max-w-100 rounded-xl border-[#1A1A1A] bg-[#121212] p-4 text-white sm:max-w-md sm:p-6">
    <DialogHeader>
      <DialogTitle className="text-lg font-bold sm:text-2xl">
        {editingNote ? "Editar Anotação" : "Criar Anotação"}
      </DialogTitle>
    </DialogHeader>
    <form onSubmit={onSubmit} className="space-y-4 pt-2 sm:space-y-6 sm:pt-4">
      {error && (
        <p className="text-xs font-medium text-red-500 sm:text-sm">{error}</p>
      )}

      <div className="space-y-1.5 sm:space-y-2">
        <label className="text-xs font-semibold text-zinc-300 sm:text-sm">
          Título
        </label>
        <Input
          value={noteTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Ex: Prova de..."
          className="h-10 rounded-xl border-zinc-800 bg-zinc-900/50 text-sm text-white focus-visible:ring-[#007AFF] sm:h-12 sm:text-base"
        />
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        <label className="text-xs font-semibold text-zinc-300 sm:text-sm">
          Conteúdo
        </label>
        <Textarea
          value={noteContent}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="Resumo, ideias..."
          className="min-h-24 resize-none rounded-xl border-zinc-800 bg-zinc-900/50 text-sm text-white focus-visible:ring-[#007AFF] sm:min-h-30 sm:text-base"
        />
      </div>

      <ColorSelector
        selectedColor={selectedColor}
        onColorChange={onColorChange}
      />

      <Button
        type="submit"
        disabled={isSaving}
        className="h-10 w-full rounded-xl bg-[#007AFF] text-sm font-bold text-white hover:bg-[#005bb5] sm:h-12 sm:text-base"
      >
        {isSaving
          ? "Salvando..."
          : editingNote
            ? "Salvar Alterações"
            : "Salvar Post-it"}
      </Button>
    </form>
  </DialogContent>
);

const SortableNoteCard = ({
  note,
  onDelete,
  onEdit,
  isDeleting,
  index,
}: SortableNoteCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: note.id });

  const style = useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isDragging ? 50 : 1,
      opacity: isDragging ? 0.8 : 1,
      animationDelay: `${index * 20}ms`,
    }),
    [transform, transition, isDragging, index],
  );

  const dateString = useMemo(
    () => new Date(note.createdAt).toLocaleDateString("pt-BR"),
    [note.createdAt],
  );

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(note.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(note);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group slide-in-from-bottom-4 fill-mode-both relative flex min-h-60 flex-col overflow-hidden rounded border border-[#1A1A1A] bg-[#0A0A0A] shadow-lg transition-colors duration-500 hover:border-zinc-700 sm:min-h-70 ${
        isDragging ? "cursor-grabbing shadow-2xl ring-2 ring-[#007AFF]/50" : ""
      }`}
    >
      <div
        className="absolute top-0 left-0 h-1.5 w-full sm:h-2"
        style={{ backgroundColor: note.color || "#007AFF" }}
      />

      <div
        {...attributes}
        {...listeners}
        className="absolute top-3 right-3 cursor-grab touch-none p-1 text-zinc-600 hover:text-zinc-300 active:cursor-grabbing sm:top-4 sm:right-4"
        title="Arrastar anotação"
      >
        <LuGripHorizontal className="h-4 w-4 sm:h-5 sm:w-5" />
      </div>

      <div className="flex h-full flex-col p-5 sm:p-8">
        <h3 className="mb-3 pr-6 text-lg leading-tight font-bold text-[#E0E0E0] sm:mb-4 sm:pr-8 sm:text-2xl">
          {note.title}
        </h3>
        <div className="prose prose-sm prose-invert prose-p:leading-relaxed prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-zinc-800 line-clamp-4 max-w-none text-xs text-zinc-400 sm:text-sm">
          <ReactMarkdown>{note.content}</ReactMarkdown>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-[#1A1A1A] pt-3 text-xs font-medium text-zinc-600 sm:mt-8 sm:pt-4 sm:text-sm">
          <span>{dateString}</span>

          <div className="flex items-center gap-1">
            <button
              onClick={handleEdit}
              className="relative z-10 rounded-lg p-1.5 text-zinc-500 transition-all hover:bg-[#007AFF]/10 hover:text-[#007AFF] sm:p-2 sm:opacity-0 sm:group-hover:opacity-100"
              title="Editar anotação"
            >
              <LuPencil className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="relative z-10 -mr-1 rounded-lg p-1.5 text-zinc-500 transition-all hover:bg-[#FF3B30]/10 hover:text-[#FF3B30] disabled:opacity-50 sm:-mr-2 sm:p-2 sm:opacity-0 sm:group-hover:opacity-100"
              title="Apagar anotação"
            >
              <LuTrash2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const EmptyState = () => (
  <div className="rounded-xl border border-dashed border-[#1A1A1A] bg-[#0A0A0A] py-16 text-center sm:py-24">
    <p className="text-base text-zinc-500 sm:text-lg">Mural vazio...</p>
  </div>
);

const NoteGrid = ({
  notes,
  isDeleting,
  onDelete,
  onEdit,
  onDragEnd,
}: NoteGridProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={notes} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {notes.map((note, index) => (
            <SortableNoteCard
              key={note.id}
              note={note}
              index={index}
              onDelete={onDelete}
              onEdit={onEdit}
              isDeleting={isDeleting === note.id}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

interface HeaderProps {
  onCreateClick: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

const Header = ({
  onCreateClick,
  isOpen,
  onOpenChange,
  children,
}: HeaderProps) => (
  <header className="flex items-end justify-between border-[#1A1A1A] pb-4">
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          onClick={onCreateClick}
          className="h-10 gap-2 rounded-xl bg-[#007AFF] px-4 text-sm font-bold text-white hover:bg-[#005bb5] sm:h-12 sm:px-6 sm:text-base"
        >
          <LuPlus className="h-4 w-4 sm:h-5 sm:w-5" /> Novo Post-it
        </Button>
      </DialogTrigger>

      {children}
    </Dialog>
  </header>
);

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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = notes.findIndex((n) => n.id === active.id);
      const newIndex = notes.findIndex((n) => n.id === over.id);

      const newOrder = arrayMove(notes, oldIndex, newIndex);
      setNotes(newOrder);

      const orderedIds = newOrder.map((n) => n.id);
      await reorderNotesAction(orderedIds);
    }
  };

  const handleDelete = async (noteId: string) => {
    setIsDeleting(noteId);
    const result = await deleteNoteAction(noteId);
    if (result.success) setNotes((prev) => prev.filter((n) => n.id !== noteId));
    setIsDeleting(null);
  };

  const openEditModal = (note: Note) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setSelectedColor(note.color || NOTE_COLORS[0].value);
    setError(null);
    setIsOpen(true);
  };

  const openCreateModal = () => {
    setEditingNote(null);
    setNoteTitle("");
    setNoteContent("");
    setSelectedColor(NOTE_COLORS[0].value);
    setError(null);
    setIsOpen(true);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
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
  };

  return (
    <section className="">
      <Header
        onCreateClick={openCreateModal}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
      >
        <NoteFormDialog
          editingNote={editingNote}
          noteTitle={noteTitle}
          noteContent={noteContent}
          selectedColor={selectedColor}
          error={error}
          isSaving={isSaving}
          onTitleChange={setNoteTitle}
          onContentChange={setNoteContent}
          onColorChange={setSelectedColor}
          onSubmit={handleSave}
        />
      </Header>

      {notes.length === 0 ? (
        <EmptyState />
      ) : (
        <NoteGrid
          notes={notes}
          isDeleting={isDeleting}
          onDelete={handleDelete}
          onEdit={openEditModal}
          onDragEnd={handleDragEnd}
        />
      )}
    </section>
  );
}
