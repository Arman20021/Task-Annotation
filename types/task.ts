export type TaskStatus = "todo" | "in_progress" | "done";

export type TaskPriority = "low" | "medium" | "high";

export type Task = {
  id: number;
  user: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string;
  task_date: string;
  tags: string[];
  order: number;
  created_at: string;
  updated_at: string;
};

export type TaskPayload = {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string;
  task_date: string;
  tags: string[];
  order: number;
};

export const TASK_COLUMNS: {
  status: TaskStatus;
  title: string;
  description: string;
}[] = [
  {
    status: "todo",
    title: "To Do",
    description: "Planned tasks for this date",
  },
  {
    status: "in_progress",
    title: "In Progress",
    description: "Tasks currently being worked on",
  },
  {
    status: "done",
    title: "Done",
    description: "Completed tasks",
  },
];