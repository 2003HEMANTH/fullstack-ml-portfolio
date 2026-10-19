"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api, { errorMessage } from "@/lib/api";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/login", { email, password });
      router.push("/admin/dashboard");
    } catch (err: unknown) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-light min-h-screen bg-[#f7f7f4] flex items-center justify-center px-5">
      <div className="card p-10 w-full max-w-md">
        <h1 className="text-3xl font-bold text-[#2557d6] text-center mb-2">Admin Login</h1>
        <p className="text-[#686864] text-center mb-8">Portfolio Control Panel</p>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="text-[#3f3f3b] text-sm mb-2 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-[#dfdfd9] rounded-xl text-[#171716] placeholder-gray-500 focus:outline-none focus:border-[#2557d6] transition"
              placeholder="hemanth@gmail.com"
              required
            />
          </div>

          <div>
            <label className="text-[#3f3f3b] text-sm mb-2 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-[#dfdfd9] rounded-xl text-[#171716] placeholder-gray-500 focus:outline-none focus:border-[#2557d6] transition"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#171716] hover:bg-[#2557d6] disabled:bg-[#888881] text-white disabled:cursor-not-allowed rounded-xl font-semibold transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </main>
  );
}