"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api, { errorMessage } from "@/lib/api";

export default function DashboardGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => { let active = true; const check = async () => { try { await api.get("/auth/me"); if (active) setReady(true); } catch (failure: unknown) { const message = errorMessage(failure); if (message.toLowerCase().includes("unauthorized") || message.toLowerCase().includes("log in")) router.replace("/admin"); else if (active) setError(message); } }; check(); return () => { active = false; }; }, [router, attempt]);
  if (!ready) return <main className="admin-light min-h-screen bg-[#f7f7f4] px-5 flex items-center justify-center text-[#686864]">{error ? <div className="text-center"><p role="alert">{error}</p><button className="button-primary mt-5" onClick={() => { setError(""); setAttempt(attempt + 1); }}>Retry</button></div> : <div role="status" className="flex items-center gap-3"><span className="h-5 w-5 animate-spin rounded-full border-2 border-[#2557d6] border-t-transparent"/>Checking your session…</div>}</main>;
  return <>{children}</>;
}