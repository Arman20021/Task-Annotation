"use client";
import Link from "next/link";
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
<Link
  href="/tasks"
  className="inline-block rounded-2xl transition-all duration-300 hover:scale-[1.03]"
>
  <h1 className="cursor-pointer text-xl font-extrabold text-[#0F172A] drop-shadow-[0_0_18px_rgba(99,102,241,0.85)] transition-all duration-300 hover:text-[#6366F1] hover:drop-shadow-[0_0_30px_rgba(99,102,241,1)]">
    To Do Annotation
  </h1>
</Link>
     
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/tasks")}
           className="rounded-2xl border border-[#E2E8F0] bg-white px-5 py-3 font-semibold text-[#0F172A] shadow-sm transition-all duration-300 hover:-translate-x-1 hover:scale-[1.03] hover:border-[#C7D2FE] hover:bg-[#EEF2FF] hover:text-[#4F46E5] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:scale-100 disabled:hover:border-[#E2E8F0] disabled:hover:bg-white disabled:hover:text-[#0F172A]"

          >
            Tasks
          </button>

          <button
            onClick={() => router.push("/annotate")}
           className="rounded-2xl border border-[#58c533] bg-white px-5 py-3 font-semibold text-[#3dea46] shadow-sm transition-all duration-300 hover:-translate-x-1 hover:scale-[1.03] hover:border-[#C7D2FE] hover:bg-[#EEF2FF] hover:text-[#37ce6c] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:scale-100 disabled:hover:border-[#E2E8F0] disabled:hover:bg-white disabled:hover:text-[#0F172A]"

          >
            Annotate
          </button>

          <button
            onClick={handleLogout}
           className="rounded-2xl border border-[#cb4c2f] bg-white px-5 py-3 font-semibold text-[#ed2121] shadow-sm transition-all duration-300 hover:-translate-x-1 hover:scale-[1.03] hover:border-[#C7D2FE] hover:bg-[#EEF2FF] hover:text-[#eb1b1b] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:scale-100 disabled:hover:border-[#E2E8F0] disabled:hover:bg-white disabled:hover:text-[#0F172A]"

          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}