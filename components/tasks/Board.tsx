"use client";

import {
  closestCorners,
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useMemo, useRef, useState } from "react";
import { api } from "@/lib/api";
import type { Task, TaskStatus } from "@/types/task";
import { TASK_COLUMNS } from "@/types/task";
import { useTaskStore } from "@/store/taskStore";
import { Column } from "./Column";
import { TaskModal } from "./TaskModal";

const STATUSES: TaskStatus[] = ["todo", "in_progress", "done"];

function groupTasks(tasks: Task[]) {
  return {
    todo: tasks
      .filter((task) => task.status === "todo")
      .sort((a, b) => a.order - b.order),
    in_progress: tasks
      .filter((task) => task.status === "in_progress")
      .sort((a, b) => a.order - b.order),
    done: tasks
      .filter((task) => task.status === "done")
      .sort((a, b) => a.order - b.order),
  };
}

function isTaskStatus(value: unknown): value is TaskStatus {
  return value === "todo" || value === "in_progress" || value === "done";
}

function FloatingTaskCard({ task }: { task: Task }) {
  return (
    <article className="rounded-3xl border border-violet-200 bg-white/95 p-5 shadow-[0_28px_70px_rgba(124,58,237,0.25)] backdrop-blur-2xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">{task.title}</h3>

          {task.description && (
            <p className="mt-2 line-clamp-2 text-sm text-slate-500">
              {task.description}
            </p>
          )}
        </div>

        <span className="rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-bold capitalize text-amber-700">
          {task.priority}
        </span>
      </div>

      <div className="mt-4 text-sm text-slate-500">
        Due:{" "}
        <span className="font-semibold text-slate-700">{task.due_date}</span>
      </div>
    </article>
  );
}

export function Board() {
  const {
    tasks,
    selectedDate,
    setTasks,
    createTask,
    updateTask,
    deleteTask,
  } = useTaskStore();

  const previousTasksRef = useRef<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const groupedTasks = useMemo(() => groupTasks(tasks), [tasks]);

  const openCreateModal = () => {
    setEditingTask(null);
    setModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm("Delete this task?");

    if (!confirmDelete) {
      return;
    }

    await deleteTask(id);
  };

  const persistChangedTasks = async (latestTasks: Task[]) => {
    const previousTasks = previousTasksRef.current;

    const changedTasks = latestTasks.filter((latestTask) => {
      const oldTask = previousTasks.find((task) => task.id === latestTask.id);

      return (
        oldTask &&
        (oldTask.status !== latestTask.status ||
          oldTask.order !== latestTask.order)
      );
    });

    await Promise.all(
      changedTasks.map((task) =>
        api.patch(`/tasks/${task.id}/move/`, {
          status: task.status,
          order: task.order,
        })
      )
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    const taskId = Number(event.active.id);
    const task = tasks.find((item) => item.id === taskId);

    previousTasksRef.current = tasks;

    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) {
      return;
    }

    const activeId = Number(active.id);
    const activeTaskFromState = tasks.find((task) => task.id === activeId);

    if (!activeTaskFromState) {
      return;
    }

    const overId = over.id;
    const overTask = tasks.find((task) => task.id === Number(overId));

    let targetStatus: TaskStatus | null = null;

    if (isTaskStatus(overId)) {
      targetStatus = overId;
    }

    if (overTask) {
      targetStatus = overTask.status;
    }

    if (!targetStatus) {
      return;
    }

    if (overTask?.id === activeTaskFromState.id) {
      return;
    }

    const tasksWithoutActive = tasks.filter((task) => task.id !== activeId);
    const grouped = groupTasks(tasksWithoutActive);

    const targetColumnTasks = [...grouped[targetStatus]];

    let targetIndex = targetColumnTasks.length;

    if (overTask) {
      const overTaskIndex = targetColumnTasks.findIndex(
        (task) => task.id === overTask.id
      );

      if (overTaskIndex >= 0) {
        targetIndex = overTaskIndex;
      }
    }

    const movedTask: Task = {
      ...activeTaskFromState,
      status: targetStatus,
    };

    targetColumnTasks.splice(targetIndex, 0, movedTask);

    const nextGrouped = {
      ...grouped,
      [targetStatus]: targetColumnTasks,
    };

    const nextTasks = STATUSES.flatMap((status) =>
      nextGrouped[status].map((task, index) => ({
        ...task,
        status,
        order: index,
      }))
    );

    setTasks(nextTasks);
  };

  const handleDragEnd = async (_event: DragEndEvent) => {
    const latestTasks = useTaskStore.getState().tasks;

    setActiveTask(null);

    try {
      await persistChangedTasks(latestTasks);
    } catch {
      setTasks(previousTasksRef.current);
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Daily Kanban Board
          </h2>
          <p className="mt-1 text-slate-500">
            Manage tasks for the selected day.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="rounded-2xl bg-gradient-to-r from-violet-500 to-sky-500 px-5 py-3 font-bold text-white shadow-[0_18px_35px_rgba(99,102,241,0.24)] transition hover:scale-[1.01]"
        >
          Add Task
        </button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid gap-5 lg:grid-cols-3">
          {TASK_COLUMNS.map((column) => (
            <Column
              key={column.status}
              status={column.status}
              title={column.title}
              description={column.description}
              tasks={groupedTasks[column.status]}
              onEdit={openEditModal}
              onDelete={handleDelete}
            />
          ))}
        </div>

        <DragOverlay
          dropAnimation={{
            duration: 260,
            easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
          }}
        >
          {activeTask ? <FloatingTaskCard task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>

      <TaskModal
        open={modalOpen}
        selectedDate={selectedDate}
        initialTask={editingTask}
        onClose={() => setModalOpen(false)}
        onSubmit={async (payload) => {
          if (editingTask) {
            await updateTask(editingTask.id, payload);
            return;
          }

          const sameStatusTasks = tasks.filter(
            (task) => task.status === payload.status
          );

          await createTask({
            ...payload,
            order: sameStatusTasks.length,
          });
        }}
      />
    </>
  );
}