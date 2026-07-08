"use client";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import type { Task } from "@/types/task";

type TaskCardProps = {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
};

const priorityStyles = {
  low: "bg-emerald-50 text-emerald-700 border-emerald-100",
  medium: "bg-amber-50 text-amber-700 border-amber-100",
  high: "bg-red-50 text-red-700 border-red-100",
};

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: String(task.id),
    data: {
      type: "task",
      task,
    },
  });

const style = {
  transform: CSS.Transform.toString(transform),
  transition: transition || "transform 220ms ease, opacity 180ms ease",
};

  return (
    <article
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
className={`cursor-pointer select-none touch-none rounded-3xl border border-white/80 bg-white/75 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-2xl transition-all duration-200 ${
  isDragging ? "scale-[1.02] opacity-40" : "hover:-translate-y-1"
}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            {task.title}
          </h3>

          {task.description && (
            <p className="mt-2 line-clamp-2 text-sm text-slate-500">
              {task.description}
            </p>
          )}
        </div>

        <span
          className={`rounded-full border px-3 py-1 text-xs font-bold capitalize ${
            priorityStyles[task.priority]
          }`}
        >
          {task.priority}
        </span>
      </div>

      <div className="mt-4 text-sm text-slate-500">
        Due:{" "}
        <span className="font-semibold text-slate-700">
          {task.due_date}
        </span>
      </div>

      {task.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-5 flex gap-2">
        <button
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => onEdit(task)}
          className="flex-1 rounded-2xl border border-white/80 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-white"
        >
          Edit
        </button>

        <button
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => onDelete(task.id)}
          className="flex-1 rounded-2xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
        >
          Delete
        </button>
      </div>
    </article>
  );
}