"use client";

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import type { Task, TaskStatus } from "@/types/task";
import { TaskCard } from "./TaskCard";

type ColumnProps = {
  status: TaskStatus;
  title: string;
  description: string;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
};

export function Column({
  status,
  title,
  description,
  tasks,
  onEdit,
  onDelete,
}: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: {
      type: "column",
      status,
    },
  });

  return (
    <section
      ref={setNodeRef}
      className={`min-h-[520px] rounded-[30px] border p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl transition ${
        isOver
          ? "border-violet-200 bg-violet-50/70"
          : "border-white/80 bg-white/55"
      }`}
    >
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>

        <span className="rounded-full bg-white/80 px-3 py-1 text-sm font-bold text-slate-600 shadow-sm">
          {tasks.length}
        </span>
      </div>

      <SortableContext
        items={tasks.map((task) => String(task.id))}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          ) : (
            <div className="flex min-h-40 items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/50 p-6 text-center text-sm font-medium text-slate-400">
              No tasks here yet.
            </div>
          )}
        </div>
      </SortableContext>
    </section>
  );
}