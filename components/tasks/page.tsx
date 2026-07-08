"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/common/Navbar";
import { Board } from "@/components/tasks/Board";
import { DateSelector } from "@/components/tasks/DateSelector";
import { useTaskStore } from "@/store/taskStore";

export default function TasksPage() {
  const router = useRouter();

  const {
    selectedDate,
    setSelectedDate,
    fetchTasks,
    loading,
    error,
    tasks,
  } = useTaskStore();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      router.push("/login");
      return;
    }

    fetchTasks();
  }, [selectedDate, fetchTasks, router]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f8fbff] text-slate-900">
      <div className="absolute left-[-160px] top-[-160px] h-96 w-96 rounded-full bg-sky-200/70 blur-3xl" />
      <div className="absolute right-[-140px] top-40 h-96 w-96 rounded-full bg-violet-200/70 blur-3xl" />
      <div className="absolute bottom-[-160px] left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-100 blur-3xl" />

      <div className="relative">
        <Navbar />

        <section className="mx-auto max-w-7xl px-6 py-8">
          <div className="mb-8">
            <DateSelector
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50/80 px-5 py-4 text-red-600 shadow-sm backdrop-blur">
              {error}
            </div>
          )}

          {loading ? (
            <div className="rounded-[30px] border border-white/80 bg-white/60 p-10 text-center font-semibold text-slate-500 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl">
              Loading tasks...
            </div>
          ) : (
            <>
              {tasks.length === 0 && (
                <div className="mb-6 rounded-[28px] border border-white/80 bg-white/60 p-6 text-slate-600 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl">
                  No tasks found for this date. Click{" "}
                  <span className="font-bold text-violet-600">Add Task</span>{" "}
                  to create your first task.
                </div>
              )}

              <Board />
            </>
          )}
        </section>
      </div>
    </main>
  );
}