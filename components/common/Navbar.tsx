"use client";

import { useRouter } from "next/navigation";

export function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-white/60 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Task Annotation App
          </h1>
     
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/tasks")}
            className="rounded-2xl border border-white/80 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-xl transition hover:bg-white"
          >
            Tasks
          </button>

          <button
            onClick={() => router.push("/annotate")}
            className="rounded-2xl border border-white/80 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-xl transition hover:bg-white"
          >
            Annotate
          </button>

          <button
            onClick={handleLogout}
            className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}