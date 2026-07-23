"use client";

import { useState } from "react";
import {
  closestCorners,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import * as RadixCheckbox from "@radix-ui/react-checkbox";
import { Plus } from "lucide-react";

import { updateTaskOrdersAction } from "@/src/app/actions/task-actions";
import { cn } from "@/src/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Checkbox = (props: any) => <RadixCheckbox.Root {...props} />;

type Priority = "baixa" | "media" | "alta";
type CategoryKey = "hoje" | "semana" | "mes" | "superfluo";

type Subtask = { id: string; text: string; done: boolean };

export type Task = {
  id: string;
  title: string;
  description?: string | null;
  category: CategoryKey;
  priority: Priority;
  date?: string | null;
  subtasks?: Subtask[];
  order: number;
};

const COLUMNS: { id: CategoryKey; title: string; roman: string }[] = [
  { id: "hoje", title: "Hoje", roman: "I" },
  { id: "semana", title: "Esta Semana", roman: "II" },
  { id: "mes", title: "Este Mês", roman: "III" },
  { id: "superfluo", title: "Sem Data", roman: "IV" },
];

const PRIORITIES: { id: Priority; label: string }[] = [
  { id: "baixa", label: "Baixa" },
  { id: "media", label: "Média" },
  { id: "alta", label: "Alta" },
];

const PRIORITY_DOGEAR: Record<Priority, string> = {
  baixa: "#00FF88",
  media: "#FFB020",
  alta: "#FF3B30",
};

function uid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function formatDate(d?: string | null) {
  if (!d) return "";
  const parts = d.split("-");
  if (parts.length !== 3) return d;
  return `${parts[2]}/${parts[1]}`;
}

function sortTasks(list: Task[]) {
  return [...list].sort((a, b) => {
    if (a.date && b.date) {
      if (a.date !== b.date) return a.date < b.date ? -1 : 1;
      return a.order - b.order;
    }
    if (a.date && !b.date) return -1;
    if (!a.date && b.date) return 1;
    return a.order - b.order;
  });
}

export function KanbanClient({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [openId, setOpenId] = useState<string | null>(null);
  const [addingCategory, setAddingCategory] = useState<CategoryKey | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  function persistOrders(next: Task[]) {
    updateTaskOrdersAction(
      next.map((t) => ({ id: t.id, category: t.category, order: t.order })),
    );
  }

  function updateTask(id: string, patch: Partial<Task>) {
    setTasks((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, ...patch } : t));
      return next;
    });
  }

  function completeTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (openId === id) setOpenId(null);
  }

  function addTask(
    category: CategoryKey,
    data: { title: string; description: string; priority: Priority; date: string },
  ) {
    setTasks((prev) => {
      const order = prev.filter((t) => t.category === category).length;
      const newTask: Task = {
        id: uid(),
        title: data.title,
        description: data.description || null,
        priority: data.priority,
        category,
        date: data.date || null,
        subtasks: [],
        order,
      };
      return [...prev, newTask];
    });
    setAddingCategory(null);
  }

  function addSubtask(taskId: string, text: string) {
    if (!text.trim()) return;
    updateTask(taskId, {
      subtasks: [
        ...(tasks.find((t) => t.id === taskId)?.subtasks ?? []),
        { id: uid(), text: text.trim(), done: false },
      ],
    });
  }

  function removeSubtask(taskId: string, subId: string) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    updateTask(taskId, {
      subtasks: (task.subtasks ?? []).filter((s) => s.id !== subId),
    });
  }

  function updateSubtaskText(taskId: string, subId: string, text: string) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    updateTask(taskId, {
      subtasks: (task.subtasks ?? []).map((s) =>
        s.id === subId ? { ...s, text } : s,
      ),
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeTask = tasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    const overTask = tasks.find((t) => t.id === over.id);
    const overColumn = COLUMNS.find((c) => c.id === over.id);
    const newCategory = overTask ? overTask.category : overColumn?.id;
    if (!newCategory) return;

    setTasks((prev) => {
      const activeIndex = prev.findIndex((t) => t.id === active.id);
      let next = prev.map((t, i) =>
        i === activeIndex ? { ...t, category: newCategory } : t,
      );

      if (overTask) {
        const overIndex = next.findIndex((t) => t.id === over.id);
        next = arrayMove(next, activeIndex, overIndex);
      }

      const orderByCategory: Partial<Record<CategoryKey, number>> = {};
      next = next.map((t) => {
        const order = orderByCategory[t.category] ?? 0;
        orderByCategory[t.category] = order + 1;
        return { ...t, order };
      });

      persistOrders(next);
      return next;
    });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 gap-px md:grid-cols-4 h-full w-full bg-[#000000]">
        {COLUMNS.map((col) => {
          const colTasks = sortTasks(tasks.filter((t) => t.category === col.id));
          return (
            <Column
              key={col.id}
              column={col}
              tasks={colTasks}
              openId={openId}
              isAdding={addingCategory === col.id}
              onOpen={(id) => {
                setOpenId((prev) => (prev === id ? prev : id));
                setAddingCategory(null);
              }}
              onClose={() => setOpenId(null)}
              onShowAdd={() => {
                setAddingCategory(col.id);
                setOpenId(null);
              }}
              onCancelAdd={() => setAddingCategory(null)}
              onSubmitAdd={(data) => addTask(col.id, data)}
              onUpdateTask={updateTask}
              onCompleteTask={completeTask}
              onAddSubtask={addSubtask}
              onRemoveSubtask={removeSubtask}
              onUpdateSubtaskText={updateSubtaskText}
            />
          );
        })}
      </div>
    </DndContext>
  );
}

function Column({
  column,
  tasks,
  openId,
  isAdding,
  onOpen,
  onClose,
  onShowAdd,
  onCancelAdd,
  onSubmitAdd,
  onUpdateTask,
  onCompleteTask,
  onAddSubtask,
  onRemoveSubtask,
  onUpdateSubtaskText,
}: {
  column: { id: CategoryKey; title: string; roman: string };
  tasks: Task[];
  openId: string | null;
  isAdding: boolean;
  onOpen: (id: string) => void;
  onClose: () => void;
  onShowAdd: () => void;
  onCancelAdd: () => void;
  onSubmitAdd: (data: { title: string; description: string; priority: Priority; date: string }) => void;
  onUpdateTask: (id: string, patch: Partial<Task>) => void;
  onCompleteTask: (id: string) => void;
  onAddSubtask: (taskId: string, text: string) => void;
  onRemoveSubtask: (taskId: string, subId: string) => void;
  onUpdateSubtaskText: (taskId: string, subId: string, text: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <section className="flex flex-col bg-[#121212] min-w-0 h-full">
      <div className="flex items-baseline gap-2.5 px-5 pb-3 pt-5 border-b border-[#1A1A1A]">
        <span className="font-serif italic text-sm text-[#007AFF]">{column.roman}</span>
        <h2 className="font-serif text-sm tracking-wide text-[#E0E0E0]">{column.title}</h2>
        <span className="ml-auto text-xs text-[#888888] bg-[#0A0A0A] border border-[#1A1A1A] px-1.5 py-px rounded-sm">
          {tasks.length}
        </span>
      </div>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={cn(
            "flex-1 flex flex-col gap-3 px-3 pt-3 pb-2 min-h-20 transition-colors",
            isOver && "bg-[#007AFF]/10",
          )}
        >
          {isAdding && (
            <TaskForm
              mode="add"
              defaultCategory={column.id}
              onCancel={onCancelAdd}
              onSubmit={onSubmitAdd}
            />
          )}

          {tasks.length === 0 && !isAdding && (
            <div className="py-6 text-center text-sm italic font-serif text-[#555555]">
              nada por aqui ainda
            </div>
          )}

          {tasks.map((task) =>
            openId === task.id ? (
              <TaskForm
                key={task.id}
                mode="edit"
                task={task}
                onCancel={onClose}
                onComplete={() => onCompleteTask(task.id)}
                onDelete={() => onCompleteTask(task.id)}
                onFieldChange={(patch) => onUpdateTask(task.id, patch)}
                onAddSubtask={(text) => onAddSubtask(task.id, text)}
                onRemoveSubtask={(subId) => onRemoveSubtask(task.id, subId)}
                onUpdateSubtaskText={(subId, text) => onUpdateSubtaskText(task.id, subId, text)}
              />
            ) : (
              <SortableTask
                key={task.id}
                task={task}
                onOpen={() => onOpen(task.id)}
                onComplete={() => onCompleteTask(task.id)}
              />
            ),
          )}
        </div>
      </SortableContext>
      <button
        onClick={onShowAdd}
        className="mx-3 mb-4 mt-1 flex items-center justify-center gap-2 py-2 border border-dashed border-[#1A1A1A] text-[#888888] rounded-sm text-xs tracking-wide transition-colors hover:border-[#007AFF]/50 hover:text-[#007AFF] hover:bg-[#007AFF]/10"
      >
        <Plus className="w-3 h-3" /> nova tarefa
      </button>
    </section>
  );
}

function SortableTask({
  task,
  onOpen,
  onComplete,
}: {
  task: Task;
  onOpen: () => void;
  onComplete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative bg-[#0A0A0A] border border-[#1A1A1A] rounded-sm p-3 overflow-hidden transition-all",
        "hover:border-[#222222] hover:shadow-md",
        isDragging && "opacity-40 scale-[0.97] shadow-none",
      )}
    >
      <span
        className="absolute top-0 right-0 w-0 h-0 opacity-80"
        style={{
          borderStyle: "solid",
          borderWidth: "0 13px 13px 0",
          borderColor: `transparent ${PRIORITY_DOGEAR[task.priority]} transparent transparent`,
        }}
      />
      <span
        className="absolute top-0 left-0 right-0 h-px opacity-70"
        style={{
          backgroundImage:
            "linear-gradient(to right, #1A1A1A 0 5px, transparent 5px 9px)",
          backgroundSize: "9px 1px",
        }}
      />

      <div className="flex gap-3 items-start" {...attributes} {...listeners}>
        <Checkbox
          onClick={(e: { stopPropagation: () => void; }) => {
            e.stopPropagation();
            onComplete();
          }}
          title="Concluir tarefa"
          aria-label="Concluir tarefa"
          className="mt-0.5 flex-none w-4 h-4 rounded-sm border border-[#888888]/60 transition-colors hover:border-[#007AFF] active:scale-90 cursor-pointer"
        />
        <button onClick={onOpen} className="flex-1 min-w-0 text-left cursor-pointer">
          <h3 className="font-serif text-sm leading-snug text-[#E0E0E0] wrap-break-word">
            {task.title}
          </h3>
          {task.date && (
            <span className="inline-block mt-1.5 text-xs tracking-wide text-[#007AFF] border border-[#1A1A1A] px-1.5 py-px rounded-sm">
              {formatDate(task.date)}
            </span>
          )}
          {task.description && (
            <p className="mt-1.5 text-xs leading-relaxed text-[#888888] line-clamp-2">
              {task.description}
            </p>
          )}
          {!!task.subtasks?.length && (
            <div className="mt-2 text-xs tracking-wide text-[#888888]/70">
              ▸ 0/{task.subtasks.length} subtarefas
            </div>
          )}
        </button>
      </div>
    </div>
  );
}

function TaskForm(
  props:
    | {
      mode: "add";
      defaultCategory: CategoryKey;
      onCancel: () => void;
      onSubmit: (data: { title: string; description: string; priority: Priority; date: string }) => void;
    }
    | {
      mode: "edit";
      task: Task;
      onCancel: () => void;
      onComplete: () => void;
      onDelete: () => void;
      onFieldChange: (patch: Partial<Task>) => void;
      onAddSubtask: (text: string) => void;
      onRemoveSubtask: (subId: string) => void;
      onUpdateSubtaskText: (subId: string, text: string) => void;
    },
) {
  const isAdd = props.mode === "add";
  const task = !isAdd ? props.task : undefined;

  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [priority, setPriority] = useState<Priority>(task?.priority ?? "media");
  const [date, setDate] = useState(task?.date ?? "");
  const [newSubtaskText, setNewSubtaskText] = useState("");

  function handleSubmit() {
    if (!isAdd) return;
    const trimmed = title.trim();
    if (!trimmed) return;
    props.onSubmit({ title: trimmed, description, priority, date });
  }

  return (
    <div className="relative bg-[#0A0A0A] border border-[#1A1A1A] rounded-sm p-3 overflow-hidden cursor-default">
      {!isAdd && (
        <span
          className="absolute top-0 right-0 w-0 h-0 opacity-80"
          style={{
            borderStyle: "solid",
            borderWidth: "0 13px 13px 0",
            borderColor: `transparent ${PRIORITY_DOGEAR[priority]} transparent transparent`,
          }}
        />
      )}

      <div className="mb-2">
        <input
          autoFocus={isAdd}
          type="text"
          placeholder="Título da tarefa"
          defaultValue={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={(e) => !isAdd && props.onFieldChange({ title: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === "Enter" && isAdd) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          className="w-full font-serif text-[15px] bg-[#121212] border border-[#1A1A1A] rounded-sm px-2 py-1.5 text-[#E0E0E0] outline-none focus:border-[#007AFF]"
        />
      </div>

      <div className="mb-2">
        <textarea
          placeholder="Descrição (opcional)"
          defaultValue={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={(e) => !isAdd && props.onFieldChange({ description: e.target.value })}
          className="w-full min-h-12 text-xs leading-relaxed bg-[#121212] border border-[#1A1A1A] rounded-sm px-2 py-1.5 text-[#E0E0E0] outline-none resize-y focus:border-[#007AFF]"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 mb-2">
        <div>
          <span className="block text-[9.5px] tracking-wider uppercase text-[#888888] mb-1">
            Prioridade
          </span>
          <select
            value={priority}
            onChange={(e) => {
              const value = e.target.value as Priority;
              setPriority(value);
              if (!isAdd) props.onFieldChange({ priority: value });
            }}
            className="w-full bg-[#121212] border border-[#1A1A1A] rounded-sm px-2 py-1.5 text-xs text-[#E0E0E0] outline-none focus:border-[#007AFF]"
          >
            {PRIORITIES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <span className="block text-[9.5px] tracking-wider uppercase text-[#888888] mb-1">
            Data
          </span>
          <input
            type="date"
            value={date ?? ""}
            onChange={(e) => {
              setDate(e.target.value);
              if (!isAdd) props.onFieldChange({ date: e.target.value });
            }}
            className="w-full bg-[#121212] border border-[#1A1A1A] rounded-sm px-2 py-1.5 text-xs text-[#E0E0E0] outline-none focus:border-[#007AFF]"
          />
        </div>
      </div>

      {!isAdd && task && (
        <div className="mt-2.5 pt-2.5 border-t border-dashed border-[#1A1A1A]">
          <span className="block text-[9.5px] tracking-wider uppercase text-[#888888] mb-1.5">
            Subtarefas
          </span>
          {(task.subtasks ?? []).map((s) => (
            <div key={s.id} className="flex items-center gap-2 mb-1.5">
              <button
                onClick={() => props.onRemoveSubtask(s.id)}
                title="Concluir subtarefa"
                aria-label="Concluir subtarefa"
                className="flex-none w-3 h-3 rounded-sm border border-[#888888]/60 hover:border-[#007AFF] transition-colors"
              />
              <input
                type="text"
                defaultValue={s.text}
                onBlur={(e) => props.onUpdateSubtaskText(s.id, e.target.value)}
                className="flex-1 bg-[#121212] border border-[#1A1A1A] rounded-sm px-2 py-2 text-xs text-[#E0E0E0] outline-none focus:border-[#007AFF]"
              />
              <button
                onClick={() => props.onRemoveSubtask(s.id)}
                aria-label="Remover subtarefa"
                className="flex-none text-[#888888] hover:text-[#FF3B30] text-sm leading-none px-1 transition-colors"
              >
                ×
              </button>
            </div>
          ))}
          <div className="flex gap-1.5 mt-1">
            <input
              type="text"
              placeholder="nova subtarefa…"
              value={newSubtaskText}
              onChange={(e) => setNewSubtaskText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  props.onAddSubtask(newSubtaskText);
                  setNewSubtaskText("");
                }
              }}
              className="flex-1 bg-[#121212] border border-[#1A1A1A] rounded-sm px-2 py-2 text-xs text-[#E0E0E0] outline-none focus:border-[#007AFF]"
            />
            <button
              onClick={() => {
                props.onAddSubtask(newSubtaskText);
                setNewSubtaskText("");
              }}
              className="flex-none bg-[#121212] border border-[#1A1A1A] text-[#888888] rounded-sm px-2.5 py-2 text-xs hover:border-[#007AFF]/50 hover:text-[#007AFF] transition-colors"
            >
              adicionar
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-2 mt-3 pt-2.5 border-t border-[#1A1A1A]">
        {isAdd ? (
          <>
            <button
              onClick={handleSubmit}
              className="px-3 py-1.5 rounded-sm text-xs tracking-wide bg-[#007AFF]/10 border border-[#007AFF]/40 text-[#007AFF] hover:bg-[#007AFF]/20 transition-colors"
            >
              adicionar
            </button>
            <button
              onClick={props.onCancel}
              className="ml-auto px-3 py-1.5 rounded-sm text-xs tracking-wide text-[#888888] hover:text-[#E0E0E0] transition-colors"
            >
              cancelar
            </button>
          </>
        ) : (
          <>
            <button
              onClick={props.onComplete}
              className="px-3 py-1.5 rounded-sm text-xs tracking-wide bg-[#007AFF]/10 border border-[#007AFF]/40 text-[#007AFF] hover:bg-[#007AFF]/20 transition-colors"
            >
              concluir
            </button>
            <button
              onClick={props.onDelete}
              className="px-3 py-1.5 rounded-sm text-xs tracking-wide border border-[#1A1A1A] text-[#888888] hover:border-[#FF3B30] hover:text-[#FF3B30] transition-colors"
            >
              excluir
            </button>
            <button
              onClick={props.onCancel}
              className="ml-auto px-3 py-1.5 rounded-sm text-xs tracking-wide text-[#888888] hover:text-[#E0E0E0] transition-colors"
            >
              fechar
            </button>
          </>
        )}
      </div>
    </div>
  );
}