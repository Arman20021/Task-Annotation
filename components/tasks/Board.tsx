"use client";

import {
  closestCorners,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { Task, TaskStatus } from "@/types/task";
import { TASK_COLUMNS } from "@/types/task";
import { useTaskStore } from "@/store/taskStore";
import { Column } from "./Column";
import { TaskModal } from "./TaskModal";

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

export function Board() {
  const {
    tasks,
    selectedDate,
    setTasks,
    createTask,
    updateTask,
    deleteTask,
  } = useTaskStore();

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

  const persistOrders = async (changedTasks: Task[]) => {
    await Promise.all(
      changedTasks.map((task) =>
        api.patch(`/tasks/${task.id}/move/`, {
          status: task.status,
          order: task.order,
        })
      )
    );
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      return;
    }

    const activeId = Number(active.id);
    const activeTask = tasks.find((task) => task.id === activeId);

    if (!activeTask) {
      return;
    }

    const overType = over.data.current?.type;
    const overTask = tasks.find((task) => task.id === Number(over.id));

    let targetStatus: TaskStatus | null = null;

    if (overType === "column" && isTaskStatus(over.id)) {
      targetStatus = over.id;
    }

    if (overTask) {
      targetStatus = overTask.status;
    }

    if (!targetStatus) {
      return;
    }

    const previousTasks = tasks;
    const sourceStatus = activeTask.status;

    const grouped = groupTasks(tasks);

    if (sourceStatus === targetStatus) {
      const columnTasks = grouped[sourceStatus];

      const oldIndex = columnTasks.findIndex((task) => task.id === activeId);
      const newIndex = overTask
        ? columnTasks.findIndex((task) => task.id === overTask.id)
        : columnTasks.length - 1;

      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
        return;
      }

      const reorderedColumnTasks = arrayMove(columnTasks, oldIndex, newIndex).map(
        (task, index) => ({
          ...task,
          order: index,
        })
      );

      const reorderedIds = new Set(reorderedColumnTasks.map((task) => task.id));

      const updatedTasks = tasks.map((task) => {
        const updatedTask = reorderedColumnTasks.find(
          (item) => item.id === task.id
        );

        return updatedTask ?? task;
      });

      const changedTasks = updatedTasks.filter(
        (task) =>
          reorderedIds.has(task.id) &&
          task.order !== previousTasks.find((item) => item.id === task.id)?.order
      );

      setTasks(updatedTasks);

      try {
        await persistOrders(changedTasks);
      } catch {
        setTasks(previousTasks);
      }

      return;
    }

    const sourceColumnTasks = grouped[sourceStatus].filter(
      (task) => task.id !== activeId
    );

    const targetColumnTasks = grouped[targetStatus].filter(
      (task) => task.id !== activeId
    );

    const targetIndex = overTask
      ? targetColumnTasks.findIndex((task) => task.id === overTask.id)
      : targetColumnTasks.length;

    const movedTask: Task = {
      ...activeTask,
      status: targetStatus,
    };

    targetColumnTasks.splice(targetIndex, 0, movedTask);

    const updatedSourceColumn = sourceColumnTasks.map((task, index) => ({
      ...task,
      order: index,
    }));

    const updatedTargetColumn = targetColumnTasks.map((task, index) => ({
      ...task,
      order: index,
    }));

    const updatedColumns = {
      ...grouped,
      [sourceStatus]: updatedSourceColumn,
      [targetStatus]: updatedTargetColumn,
    };

    const updatedTasks = [
      ...updatedColumns.todo,
      ...updatedColumns.in_progress,
      ...updatedColumns.done,
    ];

    const changedTasks = updatedTasks.filter((updatedTask) => {
      const oldTask = previousTasks.find((task) => task.id === updatedTask.id);

      return (
        oldTask &&
        (oldTask.status !== updatedTask.status ||
          oldTask.order !== updatedTask.order)
      );
    });

    setTasks(updatedTasks);

    try {
      await persistOrders(changedTasks);
    } catch {
      setTasks(previousTasks);
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