"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export default function LandingPage() {
  const router = useRouter();
  const [hovered, setHovered] = useState<"guest" | "admin" | null>(null);
  const [visible, setVisible] = useState(false);
  const [entered, setEntered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    const move = (e: MouseEvent) => {
      if (cursorRef.current) cursorRef.current.style.transform = `translate(${e.clientX - 20}px, ${e.clientY - 20}px)`;
      if (cursorDotRef.current) cursorDotRef.current.style.transform = `translate(${e.clientX - 3}px, ${e.clientY - 3}px)`;
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [isMobile]);

  const handleEnter = (type: "guest" | "admin") => {
    setEntered(true);
    setTimeout(() => {
      if (type === "guest") router.push("/home");
      else router.push("/admin");
    }, 500);
  };

  return (
    <main className="min-h-screen w-full bg-[#06020f] text-white overflow-hidden relative">

      {/* Custom cursor - desktop only */}
      {!isMobile && (
        <>
          <div
            ref={cursorRef}
            className="fixed top-0 left-0 w-10 h-10 rounded-full pointer-events-none z-[99999] transition-all duration-150"
            style={{ border: `1.5px solid ${hovered === "admin" ? "#a78bfa" : hovered === "guest" ? "#72efdd" : "rgba(255,255,255,0.3)"}` }}
          />
          <div
            ref={cursorDotRef}
            className="fixed top-0 left-0 w-1.5 h-1.5 rounded-full pointer-events-none z-[99999]"
            style={{ background: hovered === "admin" ? "#a78bfa" : hovered === "guest" ? "#72efdd" : "white" }}
          />
        </>
      )}

      {/* Entry fade */}
      <div
        className="fixed inset-0 z-[9999] pointer-events-none transition-opacity duration-500"
        style={{ background: "#06020f", opacity: entered ? 1 : 0 }}
      />

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(116,0,184,0.2) 0%, transparent 70%)" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 40% at 100% 100%, rgba(114,239,221,0.06) 0%, transparent 60%)" }} />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* ===== MOBILE LAYOUT ===== */}
      <div className="md:hidden flex flex-col min-h-screen px-5 py-8">

        {/* Top branding */}
        <div
          className="flex flex-col items-center text-center mb-8 transition-all duration-700"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(-20px)" }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-white text-xl mb-4"
            style={{ background: "linear-gradient(135deg, #7400b8, #5e60ce, #72efdd)", boxShadow: "0 8px 30px rgba(116,0,184,0.35)" }}
          >
            HL
          </div>
          <h1 className="text-3xl font-black bg-clip-text text-transparent mb-1" style={{ backgroundImage: "linear-gradient(135deg, #ffffff, #a78bfa, #72efdd)" }}>
            Hemanth.dev
          </h1>
          <p className="text-gray-600 text-xs font-mono tracking-widest uppercase mt-1">Choose your path</p>
        </div>

        {/* Cards */}
        <div
          className="flex flex-col gap-4 flex-1 justify-center"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: "all 0.7s ease 0.2s" }}
        >
          {/* Guest Card */}
          <button
            onClick={() => handleEnter("guest")}
            className="group relative w-full rounded-2xl p-6 text-left overflow-hidden transition-all duration-300 active:scale-95"
            style={{
              background: "linear-gradient(135deg, rgba(6,30,25,0.95), rgba(3,20,20,0.95))",
              border: "1px solid rgba(114,239,221,0.25)",
              boxShadow: "0 8px 32px rgba(114,239,221,0.08)",
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(114,239,221,0.1)", border: "1px solid rgba(114,239,221,0.3)" }}
              >
                <svg width="26" height="26" fill="none" stroke="#72efdd" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-2xl font-black text-white">Guest</h2>
                  <svg width="18" height="18" fill="none" stroke="#72efdd" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">Explore portfolio, projects, blog and Resume AI</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4 flex-wrap">
              {["Projects", "Blog", "Resume AI", "Contact"].map((tag) => (
                <span key={tag} className="px-2.5 py-1 rounded-lg text-xs font-mono"
                  style={{ background: "rgba(114,239,221,0.08)", border: "1px solid rgba(114,239,221,0.15)", color: "#72efdd" }}>
                  {tag}
                </span>
              ))}
            </div>
          </button>

          {/* Admin Card */}
          <button
            onClick={() => handleEnter("admin")}
            className="group relative w-full rounded-2xl p-6 text-left overflow-hidden transition-all duration-300 active:scale-95"
            style={{
              background: "linear-gradient(135deg, rgba(15,3,35,0.95), rgba(10,2,30,0.95))",
              border: "1px solid rgba(116,0,184,0.3)",
              boxShadow: "0 8px 32px rgba(116,0,184,0.1)",
            }}
          >
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(116,0,184,0.15)", border: "1px solid rgba(116,0,184,0.4)" }}
              >
                <svg width="26" height="26" fill="none" stroke="#a78bfa" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-2xl font-black text-white">Admin</h2>
                  <svg width="18" height="18" fill="none" stroke="#a78bfa" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">Manage projects, blogs and contact messages</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4 flex-wrap">
              {["Dashboard", "Projects", "Blog", "Messages"].map((tag) => (
                <span key={tag} className="px-2.5 py-1 rounded-lg text-xs font-mono"
                  style={{ background: "rgba(116,0,184,0.1)", border: "1px solid rgba(116,0,184,0.2)", color: "#a78bfa" }}>
                  {tag}
                </span>
              ))}
            </div>
          </button>
        </div>

        {/* Social links */}
        <div
          className="flex justify-center gap-8 mt-8 transition-all duration-700"
          style={{ opacity: visible ? 0.4 : 0, transitionDelay: "0.4s" }}
        >
          <a href="https://github.com/2003HEMANTH" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-white text-xs transition-colors">GitHub</a>
          <a href="https://linkedin.com/in/hemanth-l-/" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-white text-xs transition-colors">LinkedIn</a>
          <a href="mailto:hemanth9886609@gmail.com" className="text-gray-600 hover:text-white text-xs transition-colors">Email</a>
        </div>
      </div>

      {/* ===== DESKTOP LAYOUT ===== */}
      <div className="hidden md:flex h-screen w-full">

        {/* LEFT — GUEST */}
        <div
          className="relative flex flex-col items-center justify-center overflow-hidden transition-all duration-700 ease-out cursor-none"
          style={{
            flex: hovered === "guest" ? "1.4" : hovered === "admin" ? "0.6" : "1",
            background: "linear-gradient(135deg, #030f0f 0%, #021a1a 50%, #030f14 100%)",
          }}
          onMouseEnter={() => setHovered("guest")}
          onMouseLeave={() => setHovered(null)}
          onClick={() => handleEnter("guest")}
        >
          <div className="absolute inset-0 pointer-events-none transition-opacity duration-500" style={{ background: "radial-gradient(ellipse at center, rgba(114,239,221,0.08) 0%, transparent 70%)", opacity: hovered === "guest" ? 1 : 0 }} />
          <div className="absolute top-0 left-0 right-0 h-0.5 transition-opacity duration-500" style={{ background: "linear-gradient(90deg, transparent, #72efdd, transparent)", opacity: hovered === "guest" ? 1 : 0.2 }} />

          <div className="relative z-10 flex flex-col items-center text-center px-10 transition-all duration-700"
            style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)" }}>
            <div className="w-24 h-24 rounded-2xl flex items-center justify-center mb-8 transition-all duration-500"
              style={{
                background: hovered === "guest" ? "rgba(114,239,221,0.12)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${hovered === "guest" ? "rgba(114,239,221,0.4)" : "rgba(255,255,255,0.08)"}`,
                boxShadow: hovered === "guest" ? "0 0 40px rgba(114,239,221,0.15)" : "none",
                transform: hovered === "guest" ? "scale(1.1) translateY(-6px)" : "scale(1)",
              }}>
              <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: hovered === "guest" ? "#72efdd" : "rgba(255,255,255,0.35)" }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>

            <p className="text-xs font-mono tracking-widest uppercase mb-3 transition-colors duration-300"
              style={{ color: hovered === "guest" ? "#72efdd" : "rgba(255,255,255,0.25)" }}>// Enter as</p>

            <h2 className="text-7xl font-black mb-4 tracking-tight bg-clip-text text-transparent transition-all duration-300"
              style={{ backgroundImage: hovered === "guest" ? "linear-gradient(135deg, #ffffff, #72efdd)" : "linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.15))" }}>
              Guest
            </h2>

            <p className="text-sm max-w-xs leading-relaxed mb-8 transition-colors duration-300"
              style={{ color: hovered === "guest" ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)" }}>
              Explore portfolio, projects, blog and the ML Resume Analyzer
            </p>

            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {["Projects", "Blog", "Resume AI", "Contact"].map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-lg text-xs font-mono transition-all duration-300"
                  style={{ background: hovered === "guest" ? "rgba(114,239,221,0.1)" : "rgba(255,255,255,0.04)", border: `1px solid ${hovered === "guest" ? "rgba(114,239,221,0.3)" : "rgba(255,255,255,0.06)"}`, color: hovered === "guest" ? "#72efdd" : "rgba(255,255,255,0.2)" }}>
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300"
              style={{ background: hovered === "guest" ? "rgba(114,239,221,0.1)" : "rgba(255,255,255,0.04)", border: `1px solid ${hovered === "guest" ? "rgba(114,239,221,0.35)" : "rgba(255,255,255,0.06)"}`, transform: hovered === "guest" ? "translateY(-2px)" : "translateY(0)" }}>
              <span className="text-sm font-semibold transition-colors duration-300" style={{ color: hovered === "guest" ? "#72efdd" : "rgba(255,255,255,0.25)" }}>Enter Portfolio</span>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="transition-transform duration-300"
                style={{ color: hovered === "guest" ? "#72efdd" : "rgba(255,255,255,0.25)", transform: hovered === "guest" ? "translateX(4px)" : "translateX(0)" }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>

          <div className="absolute bottom-8 transition-opacity duration-300" style={{ opacity: hovered === "guest" ? 1 : 0 }}>
            <div className="flex items-center gap-2 text-xs" style={{ color: "rgba(114,239,221,0.5)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Click anywhere to enter
            </div>
          </div>
        </div>

        {/* CENTER DIVIDER */}
        <div className="relative flex items-center justify-center z-10 w-px shrink-0">
          <div className="absolute inset-0 transition-all duration-500"
            style={{ background: hovered === "guest" ? "linear-gradient(to bottom, transparent, rgba(114,239,221,0.3), transparent)" : hovered === "admin" ? "linear-gradient(to bottom, transparent, rgba(116,0,184,0.3), transparent)" : "linear-gradient(to bottom, transparent, rgba(255,255,255,0.08), transparent)" }} />
          <div className="absolute w-12 h-12 rounded-full flex items-center justify-center z-20 transition-all duration-500"
            style={{ background: "linear-gradient(135deg, #7400b8, #5e60ce, #72efdd)", boxShadow: "0 0 30px rgba(116,0,184,0.4)", transform: hovered ? "scale(1.15)" : "scale(1)" }}>
            <span className="text-white font-black text-xs">HL</span>
          </div>
        </div>

        {/* RIGHT — ADMIN */}
        <div
          className="relative flex flex-col items-center justify-center overflow-hidden transition-all duration-700 ease-out cursor-none"
          style={{
            flex: hovered === "admin" ? "1.4" : hovered === "guest" ? "0.6" : "1",
            background: "linear-gradient(135deg, #0a0315 0%, #12023a 50%, #0a0220 100%)",
          }}
          onMouseEnter={() => setHovered("admin")}
          onMouseLeave={() => setHovered(null)}
          onClick={() => handleEnter("admin")}
        >
          <div className="absolute inset-0 pointer-events-none transition-opacity duration-500" style={{ background: "radial-gradient(ellipse at center, rgba(116,0,184,0.1) 0%, transparent 70%)", opacity: hovered === "admin" ? 1 : 0 }} />
          <div className="absolute top-0 left-0 right-0 h-0.5 transition-opacity duration-500" style={{ background: "linear-gradient(90deg, transparent, #7400b8, transparent)", opacity: hovered === "admin" ? 1 : 0.2 }} />

          <div className="relative z-10 flex flex-col items-center text-center px-10 transition-all duration-700"
            style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)", transitionDelay: "0.15s" }}>
            <div className="w-24 h-24 rounded-2xl flex items-center justify-center mb-8 transition-all duration-500"
              style={{
                background: hovered === "admin" ? "rgba(116,0,184,0.15)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${hovered === "admin" ? "rgba(116,0,184,0.5)" : "rgba(255,255,255,0.08)"}`,
                boxShadow: hovered === "admin" ? "0 0 40px rgba(116,0,184,0.2)" : "none",
                transform: hovered === "admin" ? "scale(1.1) translateY(-6px)" : "scale(1)",
              }}>
              <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: hovered === "admin" ? "#a78bfa" : "rgba(255,255,255,0.35)" }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>

            <p className="text-xs font-mono tracking-widest uppercase mb-3 transition-colors duration-300"
              style={{ color: hovered === "admin" ? "#a78bfa" : "rgba(255,255,255,0.25)" }}>// Enter as</p>

            <h2 className="text-7xl font-black mb-4 tracking-tight bg-clip-text text-transparent transition-all duration-300"
              style={{ backgroundImage: hovered === "admin" ? "linear-gradient(135deg, #ffffff, #a78bfa)" : "linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.15))" }}>
              Admin
            </h2>

            <p className="text-sm max-w-xs leading-relaxed mb-8 transition-colors duration-300"
              style={{ color: hovered === "admin" ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)" }}>
              Manage projects, blogs and view contact messages
            </p>

            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {["Dashboard", "Projects", "Blog", "Messages"].map((tag) => (
                <span key={tag} className="px-3 py-1 rounded-lg text-xs font-mono transition-all duration-300"
                  style={{ background: hovered === "admin" ? "rgba(116,0,184,0.12)" : "rgba(255,255,255,0.04)", border: `1px solid ${hovered === "admin" ? "rgba(116,0,184,0.3)" : "rgba(255,255,255,0.06)"}`, color: hovered === "admin" ? "#a78bfa" : "rgba(255,255,255,0.2)" }}>
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300"
              style={{ background: hovered === "admin" ? "rgba(116,0,184,0.12)" : "rgba(255,255,255,0.04)", border: `1px solid ${hovered === "admin" ? "rgba(116,0,184,0.4)" : "rgba(255,255,255,0.06)"}`, transform: hovered === "admin" ? "translateY(-2px)" : "translateY(0)" }}>
              <span className="text-sm font-semibold transition-colors duration-300" style={{ color: hovered === "admin" ? "#a78bfa" : "rgba(255,255,255,0.25)" }}>Enter Dashboard</span>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="transition-transform duration-300"
                style={{ color: hovered === "admin" ? "#a78bfa" : "rgba(255,255,255,0.25)", transform: hovered === "admin" ? "translateX(4px)" : "translateX(0)" }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>

          <div className="absolute bottom-8 transition-opacity duration-300" style={{ opacity: hovered === "admin" ? 1 : 0 }}>
            <div className="flex items-center gap-2 text-xs" style={{ color: "rgba(167,139,250,0.5)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              Click anywhere to enter
            </div>
          </div>
        </div>
      </div>

      {/* Desktop top title */}
      <div className="hidden md:flex absolute top-8 left-0 right-0 justify-center z-20 flex-col items-center gap-1 transition-all duration-700"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(-20px)" }}>
        <p className="text-xs font-mono tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.15)" }}>Welcome to</p>
        <h1 className="text-xl font-black bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #ffffff, #a78bfa, #72efdd)" }}>Hemanth.dev</h1>
      </div>

      {/* Desktop bottom hint */}
      <div className="hidden md:flex absolute bottom-6 left-0 right-0 justify-center z-20 transition-opacity duration-700" style={{ opacity: visible ? 0.3 : 0 }}>
        <p className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>Hover to explore · Click to enter</p>
      </div>

      <style jsx global>{`
        * { cursor: none !important; }
        @media (max-width: 768px) {
          * { cursor: auto !important; }
        }
      `}</style>
    </main>
  );
}