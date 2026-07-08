"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import type { Task, TaskPayload, TaskPriority, TaskStatus } from "@/types/task";

type TaskModalProps = {
  open: boolean;
  selectedDate: string;
  initialTask?: Task | null;
  onClose: () => void;
  onSubmit: (payload: TaskPayload) => Promise<void>;
};

export function TaskModal({
  open,
  selectedDate,
  initialTask,
  onClose,
  onSubmit,
}: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [dueDate, setDueDate] = useState(selectedDate);
  const [tagsText, setTagsText] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description);
      setPriority(initialTask.priority);
      setStatus(initialTask.status);
      setDueDate(initialTask.due_date);
      setTagsText(initialTask.tags.join(", "));
      return;
    }

    setTitle("");
    setDescription("");
    setPriority("medium");
    setStatus("todo");
    setDueDate(selectedDate);
    setTagsText("");
  }, [initialTask, selectedDate, open]);

  if (!open) {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const tags = tagsText
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    setSaving(true);

    try {
      await onSubmit({
        title,
        description,
        priority,
        status,
        due_date: dueDate,
        task_date: selectedDate,
        tags,
        order: initialTask?.order ?? 0,
      });

      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 px-4 backdrop-blur-sm">
      <section className="w-full max-w-xl rounded-[32px] border border-white/80 bg-white/80 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.18)] backdrop-blur-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {initialTask ? "Edit Task" : "Add New Task"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Task date: {selectedDate}
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-2xl bg-slate-100 px-4 py-2 font-bold text-slate-600 transition hover:bg-slate-200"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Title
            </label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              className="w-full rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-slate-900 shadow-sm outline-none focus:ring-4 focus:ring-violet-100"
              placeholder="Design Kanban board UI"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              className="w-full resize-none rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-slate-900 shadow-sm outline-none focus:ring-4 focus:ring-violet-100"
              placeholder="Write a short task description"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Priority
              </label>
              <select
                value={priority}
                onChange={(event) =>
                  setPriority(event.target.value as TaskPriority)
                }
                className="w-full rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-slate-900 shadow-sm outline-none focus:ring-4 focus:ring-violet-100"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Status
              </label>
              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as TaskStatus)
                }
                className="w-full rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-slate-900 shadow-sm outline-none focus:ring-4 focus:ring-violet-100"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                required
                className="w-full rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-slate-900 shadow-sm outline-none focus:ring-4 focus:ring-violet-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Tags
            </label>
            <input
              value={tagsText}
              onChange={(event) => setTagsText(event.target.value)}
              className="w-full rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-slate-900 shadow-sm outline-none focus:ring-4 focus:ring-violet-100"
              placeholder="frontend, urgent, ui"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-2xl bg-gradient-to-r from-violet-500 to-sky-500 px-4 py-3 font-bold text-white shadow-[0_18px_35px_rgba(99,102,241,0.24)] transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : initialTask ? "Update Task" : "Create Task"}
          </button>
        </form>
      </section>
    </div>
  );
}