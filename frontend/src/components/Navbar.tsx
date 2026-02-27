"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/resume-analyzer", label: "Resume AI" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      <nav
        className="fixed top-0 w-full z-[9999] transition-all duration-300"
        style={{
          background: scrolled ? "rgba(6,2,15,0.95)" : "rgba(6,2,15,0.6)",
          backdropFilter: "blur(20px)",
          borderBottom: scrolled ? "1px solid rgba(116,0,184,0.2)" : "1px solid transparent",
          boxShadow: scrolled ? "0 4px 30px rgba(116,0,184,0.08)" : "none",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* Logo */}
          <button
            onClick={() => router.replace("/")}
            className="group flex items-center gap-2 focus:outline-none"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white transition-all duration-300 group-hover:scale-110"
              style={{ background: "linear-gradient(135deg, #7400b8, #5e60ce, #72efdd)" }}
            >
              HL
            </div>
            <span
              className="font-black text-lg tracking-tight bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, #ffffff, #a78bfa, #72efdd)" }}
            >
              Hemanth.dev
            </span>
          </button>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  style={{
                    color: isActive ? "#ffffff" : "rgba(255,255,255,0.5)",
                    background: isActive ? "rgba(116,0,184,0.15)" : "transparent",
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.color = "rgba(255,255,255,0.9)";
                      e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  {link.label}
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                      style={{ background: "linear-gradient(90deg, #7400b8, #72efdd)" }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/admin"
              className="px-4 py-2 rounded-lg text-xs font-mono transition-all duration-200 text-gray-600 hover:text-red-400 border border-transparent hover:border-red-500/20"
            >
              Admin
            </Link>
            <Link
              href="/contact"
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, #7400b8, #5e60ce)" }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 8px 25px rgba(116,0,184,0.4)")}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
            >
              Hire Me
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded-lg transition-all duration-200 focus:outline-none"
            style={{ background: menuOpen ? "rgba(116,0,184,0.15)" : "rgba(255,255,255,0.05)" }}
            aria-label="Toggle menu"
          >
            <span
              className="block w-5 h-0.5 rounded-full transition-all duration-300"
              style={{
                background: menuOpen ? "#a78bfa" : "rgba(255,255,255,0.7)",
                transform: menuOpen ? "translateY(6px) rotate(45deg)" : "none",
              }}
            />
            <span
              className="block w-5 h-0.5 rounded-full my-1.5 transition-all duration-300"
              style={{
                background: menuOpen ? "#a78bfa" : "rgba(255,255,255,0.7)",
                opacity: menuOpen ? 0 : 1,
              }}
            />
            <span
              className="block w-5 h-0.5 rounded-full transition-all duration-300"
              style={{
                background: menuOpen ? "#a78bfa" : "rgba(255,255,255,0.7)",
                transform: menuOpen ? "translateY(-6px) rotate(-45deg)" : "none",
              }}
            />
          </button>
        </div>
      </nav>

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9997] md:hidden transition-all duration-300"
        style={{
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "all" : "none",
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(4px)",
        }}
        onClick={() => setMenuOpen(false)}
      />

      {/* Mobile Slide-in Panel */}
      <div
        className="fixed top-0 right-0 h-full w-72 z-[9998] md:hidden flex flex-col transition-all duration-300 ease-out"
        style={{
          background: "linear-gradient(160deg, rgba(10,3,25,0.99), rgba(20,5,45,0.99))",
          borderLeft: "1px solid rgba(116,0,184,0.25)",
          transform: menuOpen ? "translateX(0)" : "translateX(100%)",
          boxShadow: menuOpen ? "-20px 0 60px rgba(116,0,184,0.2)" : "none",
        }}
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white"
              style={{ background: "linear-gradient(135deg, #7400b8, #5e60ce, #72efdd)" }}
            >
              HL
            </div>
            <span className="font-bold text-white text-sm">Hemanth.dev</span>
          </div>
          <button
            onClick={() => setMenuOpen(false)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all duration-200 text-lg"
          >
            ✕
          </button>
        </div>

        {/* Panel Links */}
        <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 px-4 py-4 rounded-xl transition-all duration-200"
                style={{
                  background: isActive ? "rgba(116,0,184,0.15)" : "transparent",
                  border: isActive ? "1px solid rgba(116,0,184,0.3)" : "1px solid transparent",
                  color: isActive ? "#ffffff" : "rgba(255,255,255,0.5)",
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                    e.currentTarget.style.color = "rgba(255,255,255,0.9)";
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                  }
                }}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{
                    background: isActive
                      ? "linear-gradient(135deg, #7400b8, #72efdd)"
                      : "rgba(255,255,255,0.12)",
                  }}
                />
                <span className="font-medium text-sm">{link.label}</span>
                {isActive && (
                  <span className="ml-auto text-xs" style={{ color: "#7400b8" }}>●</span>
                )}
              </Link>
            );
          })}

          <div className="my-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }} />

          <Link
            href="/admin"
            className="flex items-center gap-3 px-4 py-4 rounded-xl transition-all duration-200 hover:bg-red-500/5"
            style={{ color: "rgba(255,255,255,0.25)", border: "1px solid transparent" }}
            onMouseEnter={e => e.currentTarget.style.color = "rgba(255,100,100,0.7)"}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.25)"}
          >
            <span className="w-2 h-2 rounded-full bg-red-500/30 shrink-0" />
            <span className="font-medium text-sm">Admin Panel</span>
          </Link>
        </div>

        {/* Panel Footer */}
        <div className="px-6 py-6" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <Link
            href="/contact"
            className="flex items-center justify-center w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all duration-200 hover:opacity-90 mb-4"
            style={{ background: "linear-gradient(135deg, #7400b8, #5e60ce, #48bfe3)" }}
          >
            Hire Me
          </Link>
          <div className="flex justify-center gap-6">
            <a href="https://github.com/2003HEMANTH" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-white text-xs transition-colors duration-200">
              GitHub
            </a>
            <a href="https://linkedin.com/in/hemanth-l-/" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-white text-xs transition-colors duration-200">
              LinkedIn
            </a>
            <a href="mailto:hemanth9886609@gmail.com" className="text-gray-700 hover:text-white text-xs transition-colors duration-200">
              Email
            </a>
          </div>
        </div>
      </div>
    </>
  );
}