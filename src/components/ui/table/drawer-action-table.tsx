"use client";

import { useEffect, useState } from "react";
import { GoPlus } from "react-icons/go";
import {
  LuArrowLeft,
  LuCalendar,
  LuCheck,
  LuChevronDown,
  LuChevronRight,
  LuDownload,
  LuFileText,
  LuLoader,
  LuPaperclip,
  LuPencil,
} from "react-icons/lu";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Button } from "../../shadcn-ui/button";
import { Calendar } from "../../shadcn-ui/calendar";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../../shadcn-ui/drawer";
import { Input } from "../../shadcn-ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../shadcn-ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../shadcn-ui/select";

import { CourseStatusCardProps } from "./course-status-table";

import {
  createExamAction,
  createSubjectNoteAction,
  getSubjectDetailsAction,
  updateSubjectNoteAction,
} from "@/src/app/actions/subject-details-actions";
import { UploadButton } from "@/src/components/ui/upload-button";
import { cn } from "@/src/lib/utils";

interface CourseDrawerActionProps {
  course: CourseStatusCardProps;
}

type ViewState = "list" | "add-note" | "add-exam";

interface NoteColor {
  name: string;
  value: string;
  code: string;
}

interface SubjectNote {
  id: string;
  title: string;
  content: string;
}

interface SubjectExam {
  id: string;
  title: string;
  examDate: string | Date;
}

interface SubjectMaterial {
  id: string;
  name: string;
  url: string;
  size: number;
  createdAt: string | Date;
}

const NOTE_COLORS: NoteColor[] = [
  { name: "Azul Netuno", value: "#007AFF", code: "9" },
  { name: "Vermelho Urgente", value: "#FF3B30", code: "11" },
  { name: "Verde Aprovado", value: "#34C759", code: "10" },
  { name: "Laranja Atenção", value: "#FF9500", code: "6" },
  { name: "Roxo Seminário", value: "#AF52DE", code: "3" },
  { name: "Cinza Neutro", value: "#8E8E93", code: "8" },
];

const CourseDrawerAction: React.FC<CourseDrawerActionProps> = ({ course }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<ViewState>("list");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [notes, setNotes] = useState<SubjectNote[]>([]);
  const [exams, setExams] = useState<SubjectExam[]>([]);
  const [materials, setMaterials] = useState<SubjectMaterial[]>([]);
  const [isUploadingPDF, setIsUploadingPDF] = useState(false);

  const [openSections, setOpenSections] = useState({
    exams: true,
    materials: true,
    notes: true,
  });

  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [examTitle, setExamTitle] = useState("");
  const [selectedColor, setSelectedColor] = useState<NoteColor>(NOTE_COLORS[0]);
  const [examDateObj, setExamDateObj] = useState<Date | undefined>(undefined);
  const [examHour, setExamHour] = useState("08");
  const [examMinute, setExamMinute] = useState("00");

  useEffect(() => {
    if (isOpen && course.subjectId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(true);
      getSubjectDetailsAction(course.subjectId).then((res) => {
        if (res.success) {
          setNotes(res.notes || []);
          setExams(res.exams || []);
          setMaterials(res.materials || []);
        }
        setIsLoading(false);
      });
    } else {
      setView("list");
    }
  }, [isOpen, course.subjectId]);

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    if (editingNoteId) {
      // MODO EDIÇÃO
      const res = await updateSubjectNoteAction({
        id: editingNoteId,
        title: noteTitle,
        content: noteContent,
      });

      if (res.success) {
        // Atualiza a lista trocando a nota velha pela nova
        setNotes((prev) =>
          prev.map((n) => (n.id === editingNoteId ? res.note : n)),
        );
        setEditingNoteId(null);
        setNoteTitle("");
        setNoteContent("");
        setView("list");
      }
    } else {
      const res = await createSubjectNoteAction({
        subjectId: course.subjectId,
        title: noteTitle,
        content: noteContent,
      });

      if (res.success) {
        setNotes([res.note, ...notes]);
        setNoteTitle("");
        setNoteContent("");
        setView("list");
        setOpenSections((prev) => ({ ...prev, notes: true }));
      }
    }
    setIsSaving(false);
  };

  const handleAddExam = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!examDateObj) return;

    setIsSaving(true);
    const finalDate = new Date(examDateObj);
    finalDate.setHours(parseInt(examHour), parseInt(examMinute), 0, 0);

    const res = await createExamAction({
      subjectId: course.subjectId,
      title: examTitle,
      examDate: finalDate,
      color: selectedColor.code,
    });

    if (res.success) {
      setExams(
        [...exams, res.exam].sort(
          (a, b) =>
            new Date(a.examDate).getTime() - new Date(b.examDate).getTime(),
        ),
      );
      setExamTitle("");
      setExamDateObj(undefined);
      setExamHour("08");
      setExamMinute("00");
      setView("list");
      setOpenSections((prev) => ({ ...prev, exams: true }));
    }
    setIsSaving(false);
  };

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <Drawer direction="right" open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button className="h-8 w-8 cursor-pointer rounded-full border border-zinc-800 bg-zinc-900 p-2 text-white transition-all hover:bg-zinc-800">
          <GoPlus className="text-lg" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="flex h-full flex-col border-l border-[#1A1A1A] bg-[#0A0A0A] px-6 text-white sm:max-w-2xl">
        <DrawerHeader className="border-b border-[#1A1A1A] px-0 pt-8 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle className="text-2xl font-bold">
                {course.subject_name}
              </DrawerTitle>
              <DrawerDescription className="mt-1 text-zinc-500">
                Situação: <span>{course.status.toLowerCase()}</span>
              </DrawerDescription>
            </div>
            {view !== "list" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setView("list")}
                className="text-zinc-400 hover:text-white"
              >
                <LuArrowLeft className="mr-2 h-4 w-4" /> Voltar
              </Button>
            )}
          </div>
        </DrawerHeader>

        <div className="custom-scrollbar flex-1 overflow-y-auto py-6">
          {isLoading ? (
            <div className="flex h-full items-center justify-center text-zinc-500">
              <LuLoader className="h-8 w-8 animate-spin" />
            </div>
          ) : view === "list" ? (
            <div className="space-y-6">
              <section className="rounded-xl border border-zinc-900 bg-[#121212]/50 p-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => toggleSection("exams")}
                    className="flex items-center gap-2 text-sm font-bold tracking-wider text-zinc-400 uppercase transition-colors hover:text-white"
                  >
                    {openSections.exams ? (
                      <LuChevronDown className="text-lg" />
                    ) : (
                      <LuChevronRight className="text-lg" />
                    )}
                    <LuCalendar className="h-4 w-4" /> Provas
                  </button>
                  <Button
                    size="sm"
                    onClick={() => setView("add-exam")}
                    className="h-7 bg-[#007AFF]/10 text-xs text-[#007AFF] hover:bg-[#007AFF]/20"
                  >
                    + Adicionar
                  </Button>
                </div>

                {openSections.exams && (
                  <div className="animate-in fade-in-0 slide-in-from-top-2 mt-4 duration-200">
                    {exams.length === 0 ? (
                      <p className="text-sm text-zinc-600 italic">
                        Nenhuma prova marcada.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {exams.map((exam) => (
                          <div
                            key={exam.id}
                            className="flex flex-col gap-1 rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-3"
                          >
                            <span className="text-sm font-semibold">
                              {exam.title}
                            </span>
                            <span className="text-xs font-medium text-[#007AFF]">
                              {new Date(exam.examDate).toLocaleDateString(
                                "pt-BR",
                                {
                                  weekday: "short",
                                  day: "2-digit",
                                  month: "long",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </section>

              <section className="rounded-xl border border-zinc-900 bg-[#121212]/50 p-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => toggleSection("materials")}
                    className="flex items-center gap-2 text-sm font-bold tracking-wider text-zinc-400 uppercase transition-colors hover:text-white"
                  >
                    {openSections.materials ? (
                      <LuChevronDown className="text-lg" />
                    ) : (
                      <LuChevronRight className="text-lg" />
                    )}
                    <LuPaperclip className="h-4 w-4" /> Materiais
                  </button>

                  <UploadButton
                    endpoint="subjectMaterial"
                    input={{ subjectId: course.subjectId }}
                    onUploadBegin={() => {
                      setIsUploadingPDF(true);
                      setOpenSections((prev) => ({ ...prev, materials: true }));
                    }}
                    onClientUploadComplete={async (res) => {
                      if (res && res[0]) {
                        const updated = await getSubjectDetailsAction(
                          course.subjectId,
                        );
                        if (updated.success)
                          setMaterials(updated.materials || []);
                      }
                      setIsUploadingPDF(false);
                    }}
                    onUploadError={(error: Error) => {
                      alert(error.message);
                      setIsUploadingPDF(false);
                    }}
                    appearance={{
                      button:
                        "h-7 px-3 bg-[#007AFF]/10 text-xs text-[#007AFF] hover:bg-[#007AFF]/20 font-semibold rounded-md border-none w-auto m-0",
                      allowedContent: "hidden",
                      container: "w-auto m-0 flex-row",
                    }}
                    content={{
                      button({ ready, isUploading }) {
                        if (isUploading) return "Enviando...";
                        if (ready) return "+ Anexar PDF";
                        return "Carregando...";
                      },
                    }}
                  />
                </div>

                {openSections.materials && (
                  <div className="animate-in fade-in-0 slide-in-from-top-2 mt-4 duration-200">
                    {materials.length === 0 && !isUploadingPDF ? (
                      <p className="text-sm text-zinc-600 italic">
                        Nenhum material anexado.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {isUploadingPDF && (
                          <div className="flex animate-pulse items-center gap-3 rounded-xl border border-zinc-800/50 bg-zinc-900/30 p-3">
                            <LuLoader className="h-4 w-4 animate-spin text-[#007AFF]" />
                            <span className="text-xs text-zinc-400">
                              A processar documento...
                            </span>
                          </div>
                        )}
                        {materials.map((mat) => (
                          <a
                            key={mat.id}
                            href={mat.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center justify-between rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-3 transition-colors hover:border-[#007AFF]/50 hover:bg-zinc-800/80"
                          >
                            <div className="flex flex-col gap-1 overflow-hidden pr-4">
                              <span className="truncate text-sm font-semibold text-zinc-200 group-hover:text-white">
                                {mat.name}
                              </span>
                              <span className="text-[10px] font-medium text-zinc-500">
                                {(mat.size / 1024 / 1024).toFixed(2)} MB •{" "}
                                {new Date(mat.createdAt).toLocaleDateString(
                                  "pt-BR",
                                )}
                              </span>
                            </div>
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 transition-colors group-hover:bg-[#007AFF] group-hover:text-white">
                              <LuDownload className="h-4 w-4" />
                            </div>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </section>

              <section className="rounded-xl border border-zinc-900 bg-[#121212]/50 p-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => toggleSection("notes")}
                    className="flex items-center gap-2 text-sm font-bold tracking-wider text-zinc-400 uppercase transition-colors hover:text-white"
                  >
                    {openSections.notes ? (
                      <LuChevronDown className="text-lg" />
                    ) : (
                      <LuChevronRight className="text-lg" />
                    )}
                    <LuFileText className="h-4 w-4" /> Caderno
                  </button>
                  <Button
                    size="sm"
                    onClick={() => setView("add-note")}
                    className="h-7 bg-emerald-500/10 text-xs text-emerald-500 hover:bg-emerald-500/20"
                  >
                    + Nova Nota
                  </Button>
                </div>

                {openSections.notes && (
                  <div className="animate-in fade-in-0 slide-in-from-top-2 mt-4 duration-200">
                    {notes.length === 0 ? (
                      <p className="text-sm text-zinc-600 italic">
                        O seu caderno está vazio.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {notes.map((note) => (
                          <div
                            key={note.id}
                            className="group rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4 transition-colors hover:border-zinc-700"
                          >
                            <div className="mb-2 flex items-center justify-between">
                              <h4 className="text-sm font-semibold text-zinc-200">
                                {note.title}
                              </h4>
                              <button
                                onClick={() => {
                                  setEditingNoteId(note.id);
                                  setNoteTitle(note.title);
                                  setNoteContent(note.content);
                                  setView("add-note");
                                }}
                                className="text-zinc-500 opacity-0 transition-all group-hover:opacity-100 hover:text-[#007AFF]"
                                title="Editar anotação"
                              >
                                <LuPencil className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="prose prose-sm prose-invert prose-p:leading-relaxed prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-zinc-800 line-clamp-4 max-w-none text-zinc-400">
                              <ReactMarkdown>{note.content}</ReactMarkdown>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </section>
            </div>
          ) : view === "add-note" ? (
            <form
              onSubmit={handleSaveNote}
              className="flex h-full flex-col space-y-4"
            >
              <h3 className="mb-2 text-lg font-bold">Nova Anotação</h3>
              <Input
                placeholder="Título da anotação..."
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                required
                className="border-zinc-800 bg-zinc-900"
              />
              <textarea
                placeholder="Escreva aqui os seus resumos, links, ou pensamentos... (Suporta formatação Markdown)"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                required
                className="w-full flex-1 resize-none rounded-md border border-zinc-800 bg-zinc-900 p-3 text-sm text-white focus-visible:ring-1 focus-visible:ring-[#007AFF] focus-visible:outline-none"
              />
              <Button
                type="submit"
                disabled={isSaving}
                className="w-full bg-emerald-600 font-bold hover:bg-emerald-700"
              >
                {isSaving ? "Salvando..." : "Salvar Anotação"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleAddExam} className="space-y-4">
              <h3 className="mb-2 text-lg font-bold">Agendar Prova</h3>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400">
                  Título / Descrição
                </label>
                <Input
                  placeholder="Prova de..."
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  required
                  className="border-zinc-800 bg-zinc-900"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400">
                  Data e Hora
                </label>
                <div className="flex w-full items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "flex-1 justify-start truncate border-zinc-800 bg-zinc-900 text-left font-normal",
                          !examDateObj && "text-zinc-500",
                        )}
                      >
                        <LuCalendar className="mr-2 h-4 w-4 shrink-0" />
                        <span className="truncate">
                          {examDateObj
                            ? format(examDateObj, "PPP", { locale: ptBR })
                            : "Selecione a data"}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto border-zinc-800 bg-[#0A0A0A] p-0 text-white">
                      <Calendar
                        mode="single"
                        selected={examDateObj}
                        onSelect={setExamDateObj}
                        autoFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <div className="flex shrink-0 items-center gap-1">
                    <Select value={examHour} onValueChange={setExamHour}>
                      <SelectTrigger className="w-16.25 border-zinc-800 bg-zinc-900 focus:ring-[#007AFF]">
                        <SelectValue placeholder="HH" />
                      </SelectTrigger>
                      <SelectContent className="max-h-50 border-zinc-800 bg-[#0A0A0A] text-white">
                        {Array.from({ length: 24 }).map((_, i) => {
                          const val = i.toString().padStart(2, "0");
                          return (
                            <SelectItem
                              key={val}
                              value={val}
                              className="focus:bg-zinc-800 focus:text-white"
                            >
                              {val}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <span className="font-bold text-zinc-500">:</span>
                    <Select value={examMinute} onValueChange={setExamMinute}>
                      <SelectTrigger className="w-16.25 border-zinc-800 bg-zinc-900 focus:ring-[#007AFF]">
                        <SelectValue placeholder="MM" />
                      </SelectTrigger>
                      <SelectContent className="max-h-50 border-zinc-800 bg-[#0A0A0A] text-white">
                        {[
                          "00",
                          "05",
                          "10",
                          "15",
                          "20",
                          "25",
                          "30",
                          "35",
                          "40",
                          "45",
                          "50",
                          "55",
                        ].map((val) => (
                          <SelectItem
                            key={val}
                            value={val}
                            className="focus:bg-zinc-800 focus:text-white"
                          >
                            {val}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="flex w-full justify-between gap-3 px-3">
                {NOTE_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    className={`flex h-8 w-8 items-center justify-center rounded-full transition-transform hover:scale-110 ${selectedColor === c ? "ring-2 ring-white ring-offset-2 ring-offset-[#121212]" : ""}`}
                    style={{ backgroundColor: c.value }}
                    title={c.name}
                  >
                    {selectedColor === c && (
                      <LuCheck className="h-4 w-4 text-white drop-shadow-md" />
                    )}
                  </button>
                ))}
              </div>
              <p className="text-xs text-zinc-500">
                essa cor vai ser atribuída apenas ao google calendar
              </p>
              <Button
                type="submit"
                disabled={isSaving}
                className="mt-4 w-full bg-[#007AFF] font-bold hover:bg-[#005bb5]"
              >
                {isSaving ? "Agendando..." : "Agendar no Calendário"}
              </Button>
            </form>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default CourseDrawerAction;
