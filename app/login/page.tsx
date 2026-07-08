"use client";

import axios from "axios";
import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

type LoginResponse = {
  access: string;
  refresh: string;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
};

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("demo12345");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post<LoginResponse>("/auth/login/", {
        email,
        password,
      });

      localStorage.setItem("accessToken", response.data.access);
      localStorage.setItem("refreshToken", response.data.refresh);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      router.push("/tasks");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const backendMessage =
          error.response?.data?.detail ||
          "Login failed. Please check your backend connection.";

        setError(backendMessage);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="theme-page flex items-center justify-center px-4">
     

      <section className="relative w-full max-w-md rounded-[32px] border border-white/70 bg-white/55 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-2xl">
        <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-white/90 via-white/50 to-white/20" />

        <div className="relative">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-white/80 bg-white/70 text-3xl font-bold text-violet-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_20px_40px_rgba(124,58,237,0.18)] backdrop-blur-xl">
              A
            </div>

            <h1 className="text-3xl font-bold text-slate-900">
              Welcome Back
            </h1>

            <p className="mt-2 text-sm text-slate-600">
              Login to manage tasks and annotate images.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="demo@example.com"
                required
                className="w-full rounded-2xl border border-white/80 bg-white/70 px-4 py-3 font-medium text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_12px_30px_rgba(15,23,42,0.06)] outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="demo12345"
                required
                className="w-full rounded-2xl border border-white/80 bg-white/70 px-4 py-3 font-medium text-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_12px_30px_rgba(15,23,42,0.06)] outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100"
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm text-red-600 shadow-sm backdrop-blur">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl theme-button-primary px-4 py-3 font-semibold text-white shadow-[0_18px_35px_rgba(99,102,241,0.28)] transition hover:scale-[1.01] hover:shadow-[0_22px_45px_rgba(99,102,241,0.35)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-6 rounded-2xl border border-white/80 bg-white/60 p-4 text-sm text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_12px_30px_rgba(15,23,42,0.05)] backdrop-blur-xl">
            <p className="font-semibold text-slate-900">Demo Account</p>
            <p>Email: demo@example.com</p>
            <p>Password: demo12345</p>
          </div>
        </div>
      </section>
    </main>
  );
}