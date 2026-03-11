"use client";

import { useState, useEffect } from "react";
import { GoPlus } from "react-icons/go";
import ReactMarkdown from "react-markdown";
import {
  LuCalendar,
  LuFileText,
  LuLoader,
  LuArrowLeft,
  LuCheck,
} from "react-icons/lu";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../shadcn-ui/select";

import { Button } from "../../shadcn-ui/button";
import { Input } from "../../shadcn-ui/input";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../../shadcn-ui/drawer";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "../../shadcn-ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../shadcn-ui/popover";
import { cn } from "@/src/lib/utils";

import { CourseStatusCardProps } from "./course-status-table";
import {
  createSubjectNoteAction,
  createExamAction,
  getSubjectDetailsAction,
} from "@/src/app/actions/subject-details-actions";

interface CourseDrawerActionProps {
  course: CourseStatusCardProps;
}

type ViewState = "list" | "add-note" | "add-exam";
interface NoteColor {
  name: string;
  value: string;
  code: string;
}
const NOTE_COLORS: NoteColor[] = [
  { name: "Azul Netuno", value: "#007AFF", code: "9" },
  { name: "Vermelho Urgente", value: "#FF3B30", code: "11" },
  { name: "Verde Aprovado", value: "#34C759", code: "10" },
  { name: "Laranja Atenção", value: "#FF9500", code: "6" },
  { name: "Roxo Seminário", value: "#AF52DE", code: "3" },
  { name: "Cinza Neutro", value: "#8E8E93", code: "8" },
];

// todo: refatorar esses useState's
// acho que tem muito useState
// mas depois arrumo isso
const CourseDrawerAction: React.FC<CourseDrawerActionProps> = ({ course }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<ViewState>("list");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [notes, setNotes] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);

  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [examTitle, setExamTitle] = useState("");
  const [examDate, setExamDate] = useState("");
  const [selectedColor, setSelectedColor] = useState<NoteColor>(NOTE_COLORS[0]);
  const [examDateObj, setExamDateObj] = useState<Date | undefined>(undefined);
  const [examTime, setExamTime] = useState("08:00");
  const [examHour, setExamHour] = useState("08");
  const [examMinute, setExamMinute] = useState("00");

  useEffect(() => {
    if (isOpen && course.subjectId) {
      setIsLoading(true);
      getSubjectDetailsAction(course.subjectId).then((res) => {
        if (res.success) {
          setNotes(res.notes || []);
          setExams(res.exams || []);
        }
        setIsLoading(false);
      });
    } else {
      setView("list");
    }
  }, [isOpen, course.subjectId]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
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
    }
    setIsSaving(false);
  };

  const handleAddExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examDateObj) return;

    setIsSaving(true);

    const [hours, minutes] = examTime.split(":").map(Number);
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
    }

    setIsSaving(false);
  };

  return (
    <Drawer direction="right" open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button className="h-8 w-8 cursor-pointer rounded-full border border-zinc-800 bg-zinc-900 p-2 text-white transition-all hover:bg-zinc-800">
          <GoPlus className="text-lg" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="flex h-full w-full flex-col border-l border-[#1A1A1A] bg-[#0A0A0A] px-6 text-white sm:max-w-md">
        <DrawerHeader className="border-b border-[#1A1A1A] px-0 pt-8 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle className="text-2xl font-bold">
                {course.subject_name}
              </DrawerTitle>
              <DrawerDescription className="mt-1 text-zinc-500">
                {course.code}
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
            <div className="space-y-8">
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-bold tracking-wider text-zinc-400 uppercase">
                    <LuCalendar className="h-4 w-4" /> Provas Agendadas
                  </h3>
                  <Button
                    size="sm"
                    onClick={() => setView("add-exam")}
                    className="h-7 bg-[#007AFF]/10 text-xs text-[#007AFF] hover:bg-[#007AFF]/20"
                  >
                    + Adicionar
                  </Button>
                </div>
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
                          {new Date(exam.examDate).toLocaleDateString("pt-BR", {
                            weekday: "short",
                            day: "2-digit",
                            month: "long",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-bold tracking-wider text-zinc-400 uppercase">
                    <LuFileText className="h-4 w-4" /> Caderno de Notas
                  </h3>
                  <Button
                    size="sm"
                    onClick={() => setView("add-note")}
                    className="h-7 bg-emerald-500/10 text-xs text-emerald-500 hover:bg-emerald-500/20"
                  >
                    + Nova Nota
                  </Button>
                </div>
                {notes.length === 0 ? (
                  <p className="text-sm text-zinc-600 italic">
                    O seu caderno está vazio.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {notes.map((note) => (
                      <div
                        key={note.id}
                        className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-4"
                      >
                        <h4 className="mb-2 text-sm font-semibold">
                          {note.title}
                        </h4>
                        <div className="prose prose-sm prose-invert prose-p:leading-relaxed prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-zinc-800 line-clamp-4 max-w-none text-zinc-400">
                          <ReactMarkdown>{note.content}</ReactMarkdown>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          ) : view === "add-note" ? (
            <form
              onSubmit={handleAddNote}
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
                placeholder="Escreva aqui os seus resumos, links, ou pensamentos... (Suporte a Markdown em breve)"
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
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <div className="flex shrink-0 items-center gap-1">
                    <Select value={examHour} onValueChange={setExamHour}>
                      <SelectTrigger className="w-[65px] border-zinc-800 bg-zinc-900 focus:ring-[#007AFF]">
                        <SelectValue placeholder="HH" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px] border-zinc-800 bg-[#0A0A0A] text-white">
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
                      <SelectTrigger className="w-[65px] border-zinc-800 bg-zinc-900 focus:ring-[#007AFF]">
                        <SelectValue placeholder="MM" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px] border-zinc-800 bg-[#0A0A0A] text-white">
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
