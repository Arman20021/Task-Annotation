import { create } from "zustand";
import { api } from "@/lib/api";
import type { Task, TaskPayload } from "@/types/task";

type TaskStore = {
  selectedDate: string;
  tasks: Task[];
  loading: boolean;
  error: string;

  setSelectedDate: (date: string) => void;
  setTasks: (tasks: Task[]) => void;

  fetchTasks: () => Promise<void>;
  createTask: (payload: TaskPayload) => Promise<void>;
  updateTask: (id: number, payload: Partial<TaskPayload>) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
};

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  selectedDate: getTodayDate(),
  tasks: [],
  loading: false,
  error: "",

  setSelectedDate: (date) => {
    set({ selectedDate: date });
  },

  setTasks: (tasks) => {
    set({ tasks });
  },

  fetchTasks: async () => {
    const { selectedDate } = get();

    set({ loading: true, error: "" });

    try {
      const response = await api.get<Task[]>("/tasks/", {
        params: {
          date: selectedDate,
        },
      });

      set({
        tasks: response.data,
        loading: false,
      });
    } catch {
      set({
        error: "Could not load tasks. Please try again.",
        loading: false,
      });
    }
  },

  createTask: async (payload) => {
    const response = await api.post<Task>("/tasks/", payload);

    set((state) => ({
      tasks: [...state.tasks, response.data].sort((a, b) => a.order - b.order),
    }));
  },

  updateTask: async (id, payload) => {
    const response = await api.patch<Task>(`/tasks/${id}/`, payload);

    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? response.data : task
      ),
    }));
  },

  deleteTask: async (id) => {
    await api.delete(`/tasks/${id}/`);

    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    }));
  },
}));