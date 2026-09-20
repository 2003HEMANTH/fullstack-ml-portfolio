"use client";
import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import api, { ApiError, errorMessage } from "@/lib/api";

export default function DashboardGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setError("");
    api.get<{ user: { role: string } }>("/auth/me").then(({ data }) => {
      if (!active) return;
      if (data.user?.role !== "admin") { setError("Admin access is required."); return; }
      setReady(true);
    }).catch((failure: unknown) => {
      if (!active) return;
      if (failure instanceof ApiError && failure.status === 401) router.replace("/admin");
      else setError(errorMessage(failure));
    });
    return () => { active = false; };
  }, [router, attempt]);
  if (ready) return <>{children}</>;
  return <main className="min-h-screen flex flex-col items-center justify-center gap-4 bg-black text-white">
    {error ? <><p role="alert">{error}</p><button className="rounded bg-violet-600 px-5 py-3" onClick={() => setAttempt(attempt + 1)}>Retry</button></>
      : <div role="status" className="flex items-center gap-3"><span className="h-6 w-6 animate-spin rounded-full border-2 border-purple-400 border-t-transparent" />Checking your session...</div>}
  </main>;
}
