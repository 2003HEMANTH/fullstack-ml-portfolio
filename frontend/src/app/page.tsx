"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

function StarField({ side }: { side: "left" | "right" }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const stars: { x: number; y: number; r: number; speed: number; opacity: number; twinkle: number }[] = [];
    for (let i = 0; i < 80; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.2,
        speed: Math.random() * 0.1 + 0.02,
        opacity: Math.random(),
        twinkle: Math.random() * 0.015 + 0.003,
      });
    }
    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((s) => {
        s.opacity += s.twinkle;
        if (s.opacity > 1 || s.opacity < 0) s.twinkle *= -1;
        s.y -= s.speed;
        if (s.y < 0) { s.y = canvas.height; s.x = Math.random() * canvas.width; }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        const hue = side === "left" ? "175, 80%, 75%" : "270, 80%, 75%";
        ctx.fillStyle = `hsla(${hue}, ${Math.max(0, Math.min(1, s.opacity))})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animId);
  }, [side]);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

export default function LandingPage() {
  const router = useRouter();
  const [hovered, setHovered] = useState<"guest" | "admin" | null>(null);
  const [entered, setEntered] = useState(false);
  const [visible, setVisible] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (cursorRef.current) cursorRef.current.style.transform = `translate(${e.clientX - 20}px, ${e.clientY - 20}px)`;
      if (cursorDotRef.current) cursorDotRef.current.style.transform = `translate(${e.clientX - 3}px, ${e.clientY - 3}px)`;
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  const handleEnter = (type: "guest" | "admin") => {
    setEntered(true);
    setTimeout(() => {
      if (type === "guest") router.push("/home");
      else router.push("/admin");
    }, 600);
  };

  return (
    <main className="h-screen w-screen overflow-hidden bg-[#06020f] cursor-none relative">

      {/* Custom cursor */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-10 h-10 rounded-full pointer-events-none z-[99999] transition-all duration-150"
        style={{
          border: `1.5px solid ${hovered === "admin" ? "#a78bfa" : hovered === "guest" ? "#72efdd" : "rgba(255,255,255,0.3)"}`,
          transform: hovered ? "scale(1.5)" : "scale(1)",
        }}
      />
      <div
        ref={cursorDotRef}
        className="fixed top-0 left-0 w-1.5 h-1.5 rounded-full pointer-events-none z-[99999]"
        style={{ background: hovered === "admin" ? "#a78bfa" : hovered === "guest" ? "#72efdd" : "white" }}
      />

      {/* Entry animation overlay */}
      <div
        className="fixed inset-0 z-[9999] pointer-events-none transition-opacity duration-700"
        style={{ background: "#06020f", opacity: entered ? 1 : 0 }}
      />

      {/* Split container */}
      <div className="flex h-full w-full">

        {/* LEFT — GUEST */}
        <div
          className="relative flex-1 flex flex-col items-center justify-center overflow-hidden transition-all duration-700 ease-out cursor-none"
          style={{
            flex: hovered === "guest" ? "1.4" : hovered === "admin" ? "0.6" : "1",
            background: "linear-gradient(135deg, #030f0f 0%, #021a1a 50%, #030f14 100%)",
          }}
          onMouseEnter={() => setHovered("guest")}
          onMouseLeave={() => setHovered(null)}
          onClick={() => handleEnter("guest")}
        >
          <StarField side="left" />

          {/* Glow */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-500"
            style={{
              background: "radial-gradient(ellipse at center, rgba(114,239,221,0.08) 0%, transparent 70%)",
              opacity: hovered === "guest" ? 1 : 0,
            }}
          />

          {/* Top accent line */}
          <div
            className="absolute top-0 left-0 right-0 h-0.5 transition-all duration-500"
            style={{
              background: "linear-gradient(90deg, transparent, #72efdd, transparent)",
              opacity: hovered === "guest" ? 1 : 0.3,
            }}
          />

          {/* Content */}
          <div
            className="relative z-10 flex flex-col items-center text-center px-8 transition-all duration-500"
            style={{
              transform: visible ? "translateY(0)" : "translateY(30px)",
              opacity: visible ? 1 : 0,
              transitionDelay: "0.2s",
            }}
          >
            {/* Icon */}
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center mb-8 transition-all duration-500"
              style={{
                background: hovered === "guest"
                  ? "linear-gradient(135deg, rgba(114,239,221,0.2), rgba(72,191,227,0.1))"
                  : "rgba(255,255,255,0.04)",
                border: `1px solid ${hovered === "guest" ? "rgba(114,239,221,0.4)" : "rgba(255,255,255,0.08)"}`,
                boxShadow: hovered === "guest" ? "0 0 40px rgba(114,239,221,0.15)" : "none",
                transform: hovered === "guest" ? "scale(1.1) translateY(-4px)" : "scale(1)",
              }}
            >
              <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: hovered === "guest" ? "#72efdd" : "rgba(255,255,255,0.4)" }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>

            <p
              className="text-xs font-mono tracking-widest uppercase mb-3 transition-colors duration-300"
              style={{ color: hovered === "guest" ? "#72efdd" : "rgba(255,255,255,0.3)" }}
            >
              // Enter as
            </p>

            <h2
              className="text-6xl md:text-7xl font-black mb-4 tracking-tight transition-all duration-300"
              style={{
                background: hovered === "guest"
                  ? "linear-gradient(135deg, #ffffff, #72efdd)"
                  : "linear-gradient(135deg, rgba(255,255,255,0.5), rgba(255,255,255,0.2))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Guest
            </h2>

            <p
              className="text-sm max-w-xs leading-relaxed mb-10 transition-colors duration-300"
              style={{ color: hovered === "guest" ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)" }}
            >
              Explore the portfolio, projects, blog and resume analyzer
            </p>

            {/* Enter button */}
            <div
              className="flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300"
              style={{
                background: hovered === "guest" ? "rgba(114,239,221,0.12)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${hovered === "guest" ? "rgba(114,239,221,0.4)" : "rgba(255,255,255,0.08)"}`,
                transform: hovered === "guest" ? "translateY(-2px)" : "translateY(0)",
              }}
            >
              <span className="text-sm font-semibold" style={{ color: hovered === "guest" ? "#72efdd" : "rgba(255,255,255,0.3)" }}>
                Enter Portfolio
              </span>
              <svg
                width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                className="transition-all duration-300"
                style={{
                  color: hovered === "guest" ? "#72efdd" : "rgba(255,255,255,0.3)",
                  transform: hovered === "guest" ? "translateX(4px)" : "translateX(0)",
                }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>

          {/* Bottom label */}
          <div
            className="absolute bottom-8 left-0 right-0 flex justify-center transition-opacity duration-300"
            style={{ opacity: hovered === "guest" ? 1 : 0 }}
          >
            <div className="flex items-center gap-2 text-xs" style={{ color: "rgba(114,239,221,0.5)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Click anywhere to enter
            </div>
          </div>
        </div>

        {/* CENTER DIVIDER */}
        <div className="relative flex items-center justify-center z-10" style={{ width: "2px", flexShrink: 0 }}>
          <div
            className="absolute inset-0 transition-all duration-500"
            style={{ background: hovered === "guest" ? "linear-gradient(to bottom, transparent, #72efdd40, transparent)" : hovered === "admin" ? "linear-gradient(to bottom, transparent, #a78bfa40, transparent)" : "linear-gradient(to bottom, transparent, rgba(255,255,255,0.1), transparent)" }}
          />
          {/* Center logo */}
          <div
            className="absolute w-12 h-12 rounded-full flex items-center justify-center z-20 transition-all duration-500"
            style={{
              background: "linear-gradient(135deg, #7400b8, #5e60ce, #72efdd)",
              boxShadow: "0 0 30px rgba(116,0,184,0.4)",
              transform: hovered ? "scale(1.2)" : "scale(1)",
            }}
          >
            <span className="text-white font-black text-xs">HL</span>
          </div>
        </div>

        {/* RIGHT — ADMIN */}
        <div
          className="relative flex-1 flex flex-col items-center justify-center overflow-hidden transition-all duration-700 ease-out cursor-none"
          style={{
            flex: hovered === "admin" ? "1.4" : hovered === "guest" ? "0.6" : "1",
            background: "linear-gradient(135deg, #0a0315 0%, #12023a 50%, #0a0220 100%)",
          }}
          onMouseEnter={() => setHovered("admin")}
          onMouseLeave={() => setHovered(null)}
          onClick={() => handleEnter("admin")}
        >
          <StarField side="right" />

          {/* Glow */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-500"
            style={{
              background: "radial-gradient(ellipse at center, rgba(116,0,184,0.12) 0%, transparent 70%)",
              opacity: hovered === "admin" ? 1 : 0,
            }}
          />

          {/* Top accent line */}
          <div
            className="absolute top-0 left-0 right-0 h-0.5 transition-all duration-500"
            style={{
              background: "linear-gradient(90deg, transparent, #7400b8, transparent)",
              opacity: hovered === "admin" ? 1 : 0.3,
            }}
          />

          {/* Content */}
          <div
            className="relative z-10 flex flex-col items-center text-center px-8 transition-all duration-500"
            style={{
              transform: visible ? "translateY(0)" : "translateY(30px)",
              opacity: visible ? 1 : 0,
              transitionDelay: "0.3s",
            }}
          >
            {/* Icon */}
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center mb-8 transition-all duration-500"
              style={{
                background: hovered === "admin"
                  ? "linear-gradient(135deg, rgba(116,0,184,0.2), rgba(94,96,206,0.1))"
                  : "rgba(255,255,255,0.04)",
                border: `1px solid ${hovered === "admin" ? "rgba(116,0,184,0.5)" : "rgba(255,255,255,0.08)"}`,
                boxShadow: hovered === "admin" ? "0 0 40px rgba(116,0,184,0.2)" : "none",
                transform: hovered === "admin" ? "scale(1.1) translateY(-4px)" : "scale(1)",
              }}
            >
              <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: hovered === "admin" ? "#a78bfa" : "rgba(255,255,255,0.4)" }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>

            <p
              className="text-xs font-mono tracking-widest uppercase mb-3 transition-colors duration-300"
              style={{ color: hovered === "admin" ? "#a78bfa" : "rgba(255,255,255,0.3)" }}
            >
              // Enter as
            </p>

            <h2
              className="text-6xl md:text-7xl font-black mb-4 tracking-tight transition-all duration-300"
              style={{
                background: hovered === "admin"
                  ? "linear-gradient(135deg, #ffffff, #a78bfa)"
                  : "linear-gradient(135deg, rgba(255,255,255,0.5), rgba(255,255,255,0.2))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Admin
            </h2>

            <p
              className="text-sm max-w-xs leading-relaxed mb-10 transition-colors duration-300"
              style={{ color: hovered === "admin" ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)" }}
            >
              Manage projects, blogs, and view contact messages
            </p>

            {/* Enter button */}
            <div
              className="flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300"
              style={{
                background: hovered === "admin" ? "rgba(116,0,184,0.15)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${hovered === "admin" ? "rgba(116,0,184,0.5)" : "rgba(255,255,255,0.08)"}`,
                transform: hovered === "admin" ? "translateY(-2px)" : "translateY(0)",
              }}
            >
              <span className="text-sm font-semibold" style={{ color: hovered === "admin" ? "#a78bfa" : "rgba(255,255,255,0.3)" }}>
                Enter Dashboard
              </span>
              <svg
                width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                className="transition-all duration-300"
                style={{
                  color: hovered === "admin" ? "#a78bfa" : "rgba(255,255,255,0.3)",
                  transform: hovered === "admin" ? "translateX(4px)" : "translateX(0)",
                }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>

          {/* Bottom label */}
          <div
            className="absolute bottom-8 left-0 right-0 flex justify-center transition-opacity duration-300"
            style={{ opacity: hovered === "admin" ? 1 : 0 }}
          >
            <div className="flex items-center gap-2 text-xs" style={{ color: "rgba(167,139,250,0.5)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              Click anywhere to enter
            </div>
          </div>
        </div>
      </div>

      {/* Top center title */}
      <div
        className="absolute top-8 left-0 right-0 flex justify-center z-20 transition-all duration-700"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(-20px)" }}
      >
        <div className="flex flex-col items-center gap-1">
          <p className="text-xs font-mono tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.2)" }}>
            Welcome to
          </p>
          <h1 className="text-xl font-black bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(135deg, #ffffff, #a78bfa, #72efdd)" }}>
            Hemanth.dev
          </h1>
        </div>
      </div>

      {/* Bottom hint */}
      <div
        className="absolute bottom-6 left-0 right-0 flex justify-center z-20 transition-all duration-700"
        style={{ opacity: visible ? 0.4 : 0 }}
      >
        <p className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>
          Choose your path
        </p>
      </div>

      <style jsx global>{`
  * { cursor: none !important; }
  h2 { -webkit-text-fill-color: unset !important; }
`}</style>
    </main>
  );
}