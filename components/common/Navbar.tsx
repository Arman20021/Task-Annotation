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
    <header className="sticky top-0 z-40 border-b border-[#E2E8F0] bg-white/90 backdrop-blur-xl">
  <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div>
         <h1 className="text-xl font-bold text-[#0F172A]">
            Task Annotation App
          </h1>
     
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/tasks")}
           className="theme-button-soft px-4 py-2 text-sm"
          >
            Tasks
          </button>

          <button
            onClick={() => router.push("/annotate")}
           className="theme-button-soft px-4 py-2 text-sm"
          >
            Annotate
          </button>

          <button
            onClick={handleLogout}
           className="theme-button-danger px-4 py-2 text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}