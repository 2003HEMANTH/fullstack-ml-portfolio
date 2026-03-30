"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

const roles = ["Full Stack Developer", "ML Engineer", "Data Scientist", "Cloud Engineer"];

const THEME = {
  royalViolet: "#7400b8",
  indigoBloom: "#6930c3",
  slateIndigo: "#5e60ce",
  blueEnergy: "#5390d9",
  freshSky: "#4ea8de",
  skySurge: "#48bfe3",
  strongCyan: "#56cfe1",
  pearlAqua: "#64dfdf",
  turquoise: "#72efdd",
  aquamarine: "#80ffdb",
};

function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const stars: { x: number; y: number; r: number; speed: number; opacity: number; twinkle: number; hue: number }[] = [];
    const hues = [270, 250, 220, 190, 175];
    for (let i = 0; i < 220; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.8 + 0.2,
        speed: Math.random() * 0.12 + 0.02,
        opacity: Math.random(),
        twinkle: Math.random() * 0.015 + 0.003,
        hue: hues[Math.floor(Math.random() * hues.length)],
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
        ctx.fillStyle = `hsla(${s.hue}, 80%, 75%, ${Math.max(0, Math.min(1, s.opacity))})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(animate);
    };
    animate();
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}

function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const step = (target / 1500) * 16;
        const timer = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 16);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref}>{count}{suffix}</span>;
}

function SkillBar({ name, level, delay }: { name: string; level: number; delay: number }) {
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setTimeout(() => setWidth(level), delay);
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [level, delay]);
  return (
    <div ref={ref} className="mb-5">
      <div className="flex justify-between mb-2">
        <span className="text-sm text-gray-300 font-medium">{name}</span>
        <span className="text-sm font-mono" style={{ color: THEME.turquoise }}>{level}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${width}%`, background: `linear-gradient(90deg, ${THEME.royalViolet}, ${THEME.slateIndigo}, ${THEME.blueEnergy}, ${THEME.turquoise})` }}
        />
      </div>
    </div>
  );
}

function GlowCard({ children, className = "", accent = THEME.slateIndigo }: { children: React.ReactNode; className?: string; accent?: string }) {
  const [hovered, setHovered] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };
  return (
    <div
      ref={ref}
      className={`relative rounded-2xl border overflow-hidden transition-all duration-500 ${className}`}
      style={{ borderColor: hovered ? `${accent}40` : "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", transform: hovered ? "translateY(-4px)" : "translateY(0)", boxShadow: hovered ? `0 20px 60px ${accent}15` : "none" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {hovered && (
        <div className="absolute pointer-events-none rounded-full transition-opacity duration-300" style={{ width: 300, height: 300, left: pos.x - 150, top: pos.y - 150, background: `radial-gradient(circle, ${accent}12 0%, transparent 70%)`, zIndex: 0 }} />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [roleIndex, setRoleIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [typing, setTyping] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [heroVisible, setHeroVisible] = useState(false);
  const [time, setTime] = useState(0);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setTimeout(() => setHeroVisible(true), 150); }, []);

  useEffect(() => {
    const tick = setInterval(() => setTime(t => t + 1), 50);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      if (cursorRingRef.current) cursorRingRef.current.style.transform = `translate(${e.clientX - 20}px, ${e.clientY - 20}px)`;
      if (cursorDotRef.current) cursorDotRef.current.style.transform = `translate(${e.clientX - 3}px, ${e.clientY - 3}px)`;
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const current = roles[roleIndex];
    let timeout: ReturnType<typeof setTimeout>;
    if (typing) {
      if (displayed.length < current.length) timeout = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 65);
      else timeout = setTimeout(() => setTyping(false), 2000);
    } else {
      if (displayed.length > 0) timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 35);
      else { setRoleIndex((p) => (p + 1) % roles.length); setTyping(true); }
    }
    return () => clearTimeout(timeout);
  }, [displayed, typing, roleIndex]);

  const mainGradient = `linear-gradient(135deg, ${THEME.royalViolet}, ${THEME.indigoBloom}, ${THEME.slateIndigo}, ${THEME.blueEnergy}, ${THEME.turquoise})`;
  const accentGradient = `linear-gradient(90deg, ${THEME.royalViolet}, ${THEME.slateIndigo}, ${THEME.blueEnergy}, ${THEME.aquamarine})`;

  return (
    <main className="bg-[#06020f] text-white overflow-x-hidden cursor-none min-h-screen">

      {/* Custom cursor */}
      <div ref={cursorRingRef} className="fixed top-0 left-0 w-10 h-10 rounded-full pointer-events-none z-[99999] transition-transform duration-75 ease-out" style={{ border: `1.5px solid ${THEME.slateIndigo}80` }} />
      <div ref={cursorDotRef} className="fixed top-0 left-0 w-1.5 h-1.5 rounded-full pointer-events-none z-[99999]" style={{ background: THEME.turquoise }} />

      {/* Starfield */}
      <StarField />

      {/* Background gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(116,0,184,0.25) 0%, transparent 70%)" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 40% at 80% 80%, rgba(128,255,219,0.06) 0%, transparent 60%)" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 50% 30% at 10% 60%, rgba(105,48,195,0.12) 0%, transparent 60%)" }} />
        {/* Animated aurora */}
        <div className="absolute top-0 left-0 right-0 h-screen pointer-events-none overflow-hidden">
          <div className="absolute w-full h-96 opacity-20" style={{ top: "-10%", background: `conic-gradient(from ${time * 2}deg at 50% 0%, ${THEME.royalViolet}00, ${THEME.slateIndigo}40, ${THEME.blueEnergy}30, ${THEME.turquoise}20, ${THEME.royalViolet}00)`, filter: "blur(40px)" }} />
        </div>
      </div>

      {/* Mouse glow */}
      <div className="fixed pointer-events-none z-10" style={{ width: 500, height: 500, borderRadius: "50%", left: mousePos.x - 250, top: mousePos.y - 250, background: `radial-gradient(circle at center, ${THEME.indigoBloom}10 0%, transparent 70%)`, transition: "left 0.1s, top 0.1s" }} />

      {/* Noise texture */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.02]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: "128px" }} />

      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16">

        {/* Grid lines */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
          <div className="absolute left-1/4 top-0 bottom-0 w-px" style={{ background: `linear-gradient(to bottom, transparent, ${THEME.royalViolet}20, transparent)` }} />
          <div className="absolute right-1/4 top-0 bottom-0 w-px" style={{ background: `linear-gradient(to bottom, transparent, ${THEME.slateIndigo}20, transparent)` }} />
          <div className="absolute top-1/3 left-0 right-0 h-px" style={{ background: `linear-gradient(to right, transparent, ${THEME.blueEnergy}15, transparent)` }} />
        </div>

        {/* Orbiting rings */}
        <div className="absolute top-1/2 left-1/2 pointer-events-none select-none" style={{ transform: "translate(-50%, -50%)" }}>
          {[
            { size: 650, dur: "35s", color: THEME.royalViolet, dotColor: THEME.indigoBloom, reverse: false },
            { size: 480, dur: "22s", color: THEME.slateIndigo, dotColor: THEME.turquoise, reverse: true },
            { size: 850, dur: "55s", color: THEME.blueEnergy, dotColor: THEME.aquamarine, reverse: false },
          ].map((ring, i) => (
            <div key={i} className="absolute rounded-full" style={{ width: ring.size, height: ring.size, top: -ring.size / 2, left: -ring.size / 2, border: `1px solid ${ring.color}18`, animation: `spin-ring ${ring.dur} linear infinite ${ring.reverse ? "reverse" : ""}` }}>
              <div className="absolute rounded-full shadow-lg" style={{ width: 8, height: 8, top: -4, left: "50%", marginLeft: -4, background: ring.dotColor, boxShadow: `0 0 12px ${ring.dotColor}` }} />
            </div>
          ))}
        </div>

        {/* Status badge */}
        <div className="relative z-10 mb-10" style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? "translateY(0)" : "translateY(20px)", transition: "all 0.8s ease 0.1s" }}>
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full text-sm backdrop-blur-sm" style={{ border: `1px solid ${THEME.slateIndigo}40`, background: `${THEME.royalViolet}10`, color: THEME.pearlAqua }}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
            </span>
            Open to Opportunities · Bengaluru, India
          </div>
        </div>

        {/* Name */}
        <div className="relative z-10 mb-4" style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? "translateY(0)" : "translateY(40px)", transition: "all 1s ease 0.2s" }}>
          <h1 className="text-[clamp(3.5rem,11vw,8.5rem)] font-black leading-none tracking-tighter">
            <span className="bg-clip-text text-transparent block" style={{ backgroundImage: `linear-gradient(135deg, #ffffff 0%, ${THEME.freshSky} 40%, ${THEME.slateIndigo} 80%)` }}>
              HEMANTH L
            </span>
          </h1>
        </div>

        {/* Typewriter */}
        <div className="relative z-10 mb-8 h-10 flex items-center justify-center" style={{ opacity: heroVisible ? 1 : 0, transition: "opacity 0.9s ease 0.4s" }}>
          <span className="text-xl md:text-2xl font-light tracking-[0.3em] uppercase font-mono" style={{ color: THEME.pearlAqua }}>
            {displayed}
            <span className="inline-block w-0.5 h-5 align-middle ml-1" style={{ background: THEME.turquoise, animation: "blink 1s step-end infinite" }} />
          </span>
        </div>

        {/* Gradient separator line */}
        <div className="relative z-10 w-24 h-px mb-8" style={{ background: accentGradient, opacity: heroVisible ? 1 : 0, transition: "opacity 0.9s ease 0.5s" }} />

        {/* Bio */}
        <div className="relative z-10 mb-12 max-w-xl" style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? "translateY(0)" : "translateY(20px)", transition: "all 0.9s ease 0.5s" }}>
          <p className="text-gray-500 text-lg leading-relaxed">
            Building intelligent web systems at the intersection of{" "}
            <span className="font-semibold" style={{ color: THEME.freshSky }}>full-stack engineering</span>{" "}and{" "}
            <span className="font-semibold" style={{ color: THEME.turquoise }}>machine learning</span>.
            Turning data into decisions, ideas into products.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="relative z-10 flex gap-4 flex-wrap justify-center mb-16" style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? "translateY(0)" : "translateY(20px)", transition: "all 0.9s ease 0.65s" }}>
          <button
            onClick={() => router.push("/projects")}
            className="group relative px-8 py-3.5 rounded-xl font-bold text-sm tracking-wide overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl text-white"
            style={{ background: mainGradient, boxShadow: `0 0 0 rgba(116,0,184,0)`, transition: "all 0.3s ease" }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 8px 40px ${THEME.royalViolet}50`)}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
          >
            <span className="flex items-center gap-2">
              View Projects
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </button>

          <button
            onClick={() => router.push("/resume-analyzer")}
            className="group px-8 py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm"
            style={{ border: `1px solid ${THEME.slateIndigo}50`, background: `${THEME.slateIndigo}12`, color: THEME.pearlAqua }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = `${THEME.turquoise}60`; e.currentTarget.style.background = `${THEME.slateIndigo}22`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = `${THEME.slateIndigo}50`; e.currentTarget.style.background = `${THEME.slateIndigo}12`; }}
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: THEME.aquamarine }} />
              Try Resume AI
            </span>
          </button>

          <button
            onClick={() => router.push("/contact")}
            className="px-8 py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 hover:-translate-y-1 text-gray-400 hover:text-gray-200"
            style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
          >
            Get In Touch
          </button>
        </div>

        {/* Social links */}
        <div className="relative z-10 flex items-center gap-8 flex-wrap justify-center" style={{ opacity: heroVisible ? 1 : 0, transition: "opacity 0.9s ease 0.75s" }}>
          {[
            { label: "GitHub", href: "https://github.com/2003HEMANTH", sub: "2003HEMANTH" },
            { label: "LinkedIn", href: "https://linkedin.com/in/hemanth-l-/", sub: "hemanth-l" },
            { label: "Email", href: "mailto:hemanth9886609@gmail.com", sub: "hemanth9886609" },
          ].map((link, i) => (
            <span key={link.label} className="flex items-center gap-8">
              {i > 0 && <span className="w-px h-6 hidden sm:block" style={{ background: "rgba(255,255,255,0.08)" }} />}
              <a href={link.href} target={link.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="group flex flex-col items-center gap-0.5 transition-all duration-200">
                <span className="text-xs font-mono tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.2)" }}>{link.label}</span>
                <span className="text-gray-500 group-hover:text-white text-sm transition-colors duration-200" style={{}}>{link.sub}</span>
              </a>
            </span>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2" style={{ animation: "float 2.5s ease-in-out infinite" }}>
          <div className="w-5 h-9 rounded-full flex items-start justify-center pt-2" style={{ border: `1px solid ${THEME.slateIndigo}40` }}>
            <div className="w-1 h-2.5 rounded-full" style={{ background: THEME.slateIndigo, animation: "scroll-dot 1.8s ease-in-out infinite" }} />
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="relative py-24 px-6">
        <div className="absolute top-0 inset-x-0 h-px" style={{ background: `linear-gradient(to right, transparent, ${THEME.royalViolet}30, ${THEME.turquoise}30, transparent)` }} />
        <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { value: 81, suffix: "%", label: "Model Accuracy", sub: "R² Score · Random Forest", icon: "🎯", accent: THEME.royalViolet },
            { value: 40, suffix: "+", label: "Tickets / Week", sub: "95% First-Contact Resolution", icon: "⚡", accent: THEME.slateIndigo },
            { value: 99, suffix: "%", label: "VM Uptime", sub: "20+ Servers Managed", icon: "🖥️", accent: THEME.blueEnergy },
            { value: 6, suffix: "+", label: "Certifications", sub: "Google · Microsoft · NPTEL", icon: "🏆", accent: THEME.turquoise },
          ].map((stat) => (
            <GlowCard key={stat.label} accent={stat.accent} className="p-6 text-center">
              <div className="text-2xl mb-3">{stat.icon}</div>
              <div className="text-4xl font-black text-white mb-1 tabular-nums">
                <Counter target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-sm font-semibold mb-1" style={{ color: stat.accent }}>{stat.label}</div>
              <div className="text-xs text-gray-600">{stat.sub}</div>
            </GlowCard>
          ))}
        </div>
      </section>

      {/* ===== ABOUT ===== */}
      <section className="relative py-24 px-6">
        <div className="absolute top-0 inset-x-0 h-px" style={{ background: `linear-gradient(to right, transparent, ${THEME.slateIndigo}25, transparent)` }} />
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs font-mono tracking-widest uppercase mb-4" style={{ color: THEME.slateIndigo }}>// About Me</p>
            <h2 className="text-5xl font-black leading-tight mb-6">
              <span className="text-white">Building at the</span><br />
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(135deg, ${THEME.royalViolet}, ${THEME.blueEnergy})` }}>intersection</span><br />
              <span className="text-white">of data and code</span>
            </h2>
            <p className="text-gray-500 leading-relaxed mb-5">
              I am a Full-Stack Developer and Data Science postgraduate student at Kristu Jayanti College, Bengaluru. I bridge the gap between intelligent ML systems and production-ready web applications.
            </p>
            <p className="text-gray-500 leading-relaxed mb-8">
              From building a real estate ROI prediction system with 0.81 R² accuracy to managing 20+ production VMs at 99% uptime, I bring both analytical rigor and engineering discipline to every project.
            </p>
            <div className="flex flex-wrap gap-2">
              {["Python", "Next.js", "Node.js", "MongoDB", "AWS", "Scikit-learn", "TensorFlow", "Flask"].map((tech, i) => {
                const colors = [THEME.royalViolet, THEME.indigoBloom, THEME.slateIndigo, THEME.blueEnergy, THEME.freshSky, THEME.turquoise, THEME.pearlAqua, THEME.aquamarine];
                return (
                  <span key={tech} className="px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-200" style={{ border: `1px solid ${colors[i]}30`, background: `${colors[i]}10`, color: colors[i] }}>
                    {tech}
                  </span>
                );
              })}
            </div>
          </div>

          <GlowCard accent={THEME.slateIndigo} className="p-8">
            <p className="text-xs text-gray-600 font-mono tracking-widest uppercase mb-6">Core Proficiencies</p>
            <SkillBar name="Python & Data Science" level={88} delay={0} />
            <SkillBar name="Full Stack (React / Next.js)" level={82} delay={100} />
            <SkillBar name="Machine Learning" level={78} delay={200} />
            <SkillBar name="Node.js & Express" level={80} delay={300} />
            <SkillBar name="Cloud & DevOps" level={70} delay={400} />
            <SkillBar name="SQL & MongoDB" level={85} delay={500} />
          </GlowCard>
        </div>
      </section>

      {/* ===== EXPERIENCE ===== */}
      <section className="relative py-24 px-6">
        <div className="absolute top-0 inset-x-0 h-px" style={{ background: `linear-gradient(to right, transparent, ${THEME.indigoBloom}25, transparent)` }} />
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-16">
            <div>
              <p className="text-xs font-mono tracking-widest uppercase mb-3" style={{ color: THEME.slateIndigo }}>// Experience</p>
              <h2 className="text-5xl font-black text-white">Work History</h2>
            </div>
          </div>

          <div className="space-y-6">
            {[
              {
                year: "2025", tag: "Data Science", role: "Data Science Intern", company: "APEXIQ.AI · Bengaluru, India",
                period: "Jun 2025 — Jul 2025", accent: THEME.royalViolet, accentLight: THEME.indigoBloom,
                points: [
                  "Built Random Forest regression model — R² score 0.81 on real estate ROI prediction",
                  "EDA, preprocessing and feature engineering with Pandas and NumPy on large datasets",
                  "Model evaluation using MAE, RMSE and R² metrics with Scikit-learn pipeline",
                  "Deployed model via Streamlit for real-time investor predictions",
                ],
              },
              {
                year: "2023", tag: "Cloud & DevOps", role: "Technical Support Engineer (L1)", company: "HOSTUPCLOUD TECHNOLOGY · Bengaluru, India",
                period: "May 2023 — Jul 2023", accent: THEME.blueEnergy, accentLight: THEME.turquoise,
                points: [
                  "Resolved 40+ tickets weekly via WHMCS with 95% first-contact resolution rate",
                  "Deployed 20+ VMs on Windows and Linux with 99% uptime SLA",
                  "Configured cPanel and Plesk for 30+ clients with WordPress and domain management",
                  "Reduced resolution time by 25% through L1 diagnosis and L2/L3 escalation",
                ],
              },
            ].map((exp) => (
              <GlowCard key={exp.role} accent={exp.accent} className="p-8">
                <div className="absolute top-0 left-0 w-1 h-full rounded-l-2xl" style={{ background: `linear-gradient(to bottom, ${exp.accent}, ${exp.accentLight}00)` }} />
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-mono" style={{ background: `${exp.accent}18`, border: `1px solid ${exp.accent}30`, color: exp.accentLight }}>{exp.year}</span>
                      <span className="text-gray-700 text-xs">{exp.tag}</span>
                    </div>
                    <h3 className="text-2xl font-black text-white mb-1">{exp.role}</h3>
                    <p className="font-semibold" style={{ color: exp.accentLight }}>{exp.company}</p>
                  </div>
                  <div className="inline-flex items-center px-4 py-2 rounded-xl text-sm shrink-0" style={{ border: `1px solid ${exp.accent}25`, background: `${exp.accent}10`, color: exp.accentLight }}>{exp.period}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {exp.points.map((p, i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <span className="shrink-0 mt-0.5" style={{ color: exp.accent }}>▹</span>
                      <span className="text-gray-400 text-sm leading-relaxed">{p}</span>
                    </div>
                  ))}
                </div>
              </GlowCard>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SKILLS ===== */}
      <section className="relative py-24 px-6">
        <div className="absolute top-0 inset-x-0 h-px" style={{ background: `linear-gradient(to right, transparent, ${THEME.blueEnergy}25, transparent)` }} />
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <p className="text-xs font-mono tracking-widest uppercase mb-3" style={{ color: THEME.slateIndigo }}>// Skills</p>
            <h2 className="text-5xl font-black text-white">Tech Arsenal</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[
              { icon: "🐍", title: "Languages", accent: THEME.royalViolet, skills: ["Python", "JavaScript", "TypeScript", "SQL", "R"] },
              { icon: "🧠", title: "ML & Data Science", accent: THEME.indigoBloom, skills: ["Scikit-learn", "TensorFlow", "Pandas", "NumPy", "Matplotlib"] },
              { icon: "⚛️", title: "Frontend", accent: THEME.slateIndigo, skills: ["Next.js", "React.js", "Tailwind CSS", "HTML5", "CSS3"] },
              { icon: "🔧", title: "Backend & APIs", accent: THEME.blueEnergy, skills: ["Node.js", "Express.js", "Flask", "REST API"] },
              { icon: "☁️", title: "Cloud & DevOps", accent: THEME.freshSky, skills: ["AWS", "Azure", "Linux", "Jenkins", "CI/CD", "Git"] },
              { icon: "🗄️", title: "Databases & BI", accent: THEME.turquoise, skills: ["MongoDB", "MySQL", "Power BI", "Tableau", "Excel"] },
            ].map((group) => (
              <GlowCard key={group.title} accent={group.accent} className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{group.icon}</span>
                  <h3 className="text-white font-bold">{group.title}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {group.skills.map((skill) => (
                    <span key={skill} className="px-2.5 py-1 rounded-lg text-xs font-mono transition-all duration-200" style={{ border: `1px solid ${group.accent}25`, background: `${group.accent}08`, color: group.accent }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </GlowCard>
            ))}
          </div>
        </div>
      </section>

      {/* ===== EDUCATION ===== */}
      <section className="relative py-24 px-6">
        <div className="absolute top-0 inset-x-0 h-px" style={{ background: `linear-gradient(to right, transparent, ${THEME.slateIndigo}25, transparent)` }} />
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <p className="text-xs font-mono tracking-widest uppercase mb-3" style={{ color: THEME.slateIndigo }}>// Education</p>
            <h2 className="text-5xl font-black text-white">Academic Path</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { degree: "M.Sc. Data Science", school: "Kristu Jayanti College (Deemed University)", period: "2024 — 2026", grade: "SEM 1: 7.15 · SEM 2: 7.23", icon: "🎓", current: true, accent: THEME.royalViolet },
              { degree: "Bachelor of Computer Application", school: "Kristu Jayanti College", period: "2021 — 2024", grade: "CGPA: 7.74", icon: "🏫", current: false, accent: THEME.blueEnergy },
            ].map((edu) => (
              <GlowCard key={edu.degree} accent={edu.accent} className="p-8">
                {edu.current && (
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs" style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)", color: "#4ade80" }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    Current
                  </div>
                )}
                <div className="text-4xl mb-4">{edu.icon}</div>
                <h3 className="text-xl font-black text-white mb-1">{edu.degree}</h3>
                <p className="font-semibold mb-2" style={{ color: edu.accent }}>{edu.school}</p>
                <p className="text-gray-600 text-sm mb-4">Bengaluru · {edu.period}</p>
                <span className="px-3 py-1.5 rounded-lg text-xs font-mono" style={{ border: `1px solid ${edu.accent}25`, background: `${edu.accent}10`, color: edu.accent }}>{edu.grade}</span>
              </GlowCard>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CERTIFICATIONS ===== */}
      <section className="relative py-24 px-6">
        <div className="absolute top-0 inset-x-0 h-px" style={{ background: `linear-gradient(to right, transparent, ${THEME.blueEnergy}25, transparent)` }} />
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <p className="text-xs font-mono tracking-widest uppercase mb-3" style={{ color: THEME.slateIndigo }}>// Certifications</p>
            <h2 className="text-5xl font-black text-white">Credentials</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "Introduction to MongoDB", issuer: "MongoDB Inc.", year: "2024", icon: "🍃", accent: THEME.turquoise },
              { name: "Python for Data Science", issuer: "NPTEL · IIT Madras", year: "2024", icon: "🐍", accent: THEME.blueEnergy },
              { name: "Qlik Sense Business Analyst", issuer: "Qlik", year: "2023", icon: "📊", accent: THEME.slateIndigo },
              { name: "Google Analytics", issuer: "Google", year: "2024", icon: "📈", accent: THEME.freshSky },
              { name: "Azure Fundamentals", issuer: "Microsoft", year: "2024", icon: "☁️", accent: THEME.indigoBloom },
              { name: "Google Cybersecurity", issuer: "Coursera · Google", year: "2024", icon: "🔒", accent: THEME.royalViolet },
            ].map((cert) => (
              <GlowCard key={cert.name} accent={cert.accent} className="p-5">
                <div className="flex items-start gap-4">
                  <span className="text-2xl shrink-0">{cert.icon}</span>
                  <div>
                    <h3 className="text-white font-semibold text-sm mb-1 leading-tight">{cert.name}</h3>
                    <p className="text-xs mb-1" style={{ color: cert.accent }}>{cert.issuer}</p>
                    <p className="text-gray-700 text-xs">{cert.year}</p>
                  </div>
                </div>
              </GlowCard>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative py-36 px-6 text-center overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px" style={{ background: `linear-gradient(to right, transparent, ${THEME.royalViolet}30, ${THEME.turquoise}30, transparent)` }} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] opacity-15" style={{ background: `radial-gradient(ellipse at center, ${THEME.royalViolet} 0%, ${THEME.slateIndigo} 40%, transparent 70%)` }} />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <p className="text-xs font-mono tracking-widest uppercase mb-6" style={{ color: THEME.slateIndigo }}>// Lets Connect</p>
          <h2 className="text-6xl md:text-7xl font-black leading-none mb-6">
            <span className="text-white">Lets work</span><br />
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: mainGradient }}>together.</span>
          </h2>
          <p className="text-gray-500 text-lg mb-12 leading-relaxed">
            Open to full-time positions, internships and freelance projects.
            Whether you need an ML pipeline or a full-stack product, lets build it.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => router.push("/contact")}
              className="group relative px-10 py-4 rounded-xl font-bold text-base overflow-hidden transition-all duration-300 hover:-translate-y-1 text-white"
              style={{ background: mainGradient }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 12px 50px ${THEME.royalViolet}50`)}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
            >
              <span className="flex items-center gap-2">
                Start a Conversation
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </button>
            <button
              onClick={() => router.push("/projects")}
              className="px-10 py-4 rounded-xl font-bold text-base transition-all duration-300 hover:-translate-y-1 text-gray-400 hover:text-white"
              style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)" }}
            >
              View My Work
            </button>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="relative py-8 px-6" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.15)" }}>HEMANTH.DEV · 2026</p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.1)" }}>Built with Next.js · Node.js · MongoDB · Flask · AWS</p>
          <div className="flex gap-6">
            {[
              { label: "GitHub", href: "https://github.com/2003HEMANTH" },
              { label: "LinkedIn", href: "https://linkedin.com/in/hemanth-l-/" },
              { label: "Email", href: "mailto:hemanth9886609@gmail.com" },
            ].map((link) => (
              <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className="text-xs font-mono transition-colors duration-200" style={{ color: "rgba(255,255,255,0.18)" }} onMouseEnter={e => (e.currentTarget.style.color = THEME.slateIndigo)} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.18)")}>
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes spin-ring {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-10px); }
        }
        @keyframes scroll-dot {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(10px); opacity: 0; }
        }
        * { cursor: none !important; }
        ::selection { background: rgba(116,0,184,0.4); color: white; }
        html { scroll-behavior: smooth; }
      `}</style>
    </main>
  );
}