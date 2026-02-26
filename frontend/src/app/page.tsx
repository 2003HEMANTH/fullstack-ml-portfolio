"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const roles = [
  "Full Stack Developer",
  "ML Engineer",
  "Data Scientist",
  "Cloud Enthusiast",
];

export default function Home() {
  const router = useRouter();
  const [roleIndex, setRoleIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    const current = roles[roleIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (typing) {
      if (displayed.length < current.length) {
        timeout = setTimeout(() => {
          setDisplayed(current.slice(0, displayed.length + 1));
        }, 60);
      } else {
        timeout = setTimeout(() => setTyping(false), 1800);
      }
    } else {
      if (displayed.length > 0) {
        timeout = setTimeout(() => {
          setDisplayed(displayed.slice(0, -1));
        }, 30);
      } else {
        setRoleIndex((prev) => (prev + 1) % roles.length);
        setTyping(true);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayed, typing, roleIndex]);

  return (
    <main className="min-h-screen bg-[#020818] text-white overflow-x-hidden">

      {/* Animated background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-400/10 rounded-full blur-2xl animate-pulse" />
      </div>

      {/* Grid overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20">

        {/* Available badge */}
        <div className="mb-8 inline-flex items-center gap-2 px-5 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-300 text-sm backdrop-blur-sm">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Available for Opportunities · Bengaluru, India
        </div>

        {/* Name */}
        <h1 className="text-7xl md:text-8xl font-black mb-4 tracking-tight">
          <span className="bg-gradient-to-r from-white via-blue-100 to-blue-400 bg-clip-text text-transparent">
            Hemanth L
          </span>
        </h1>

        {/* Typewriter */}
        <div className="h-12 flex items-center justify-center mb-6">
          <span className="text-2xl md:text-3xl text-blue-400 font-semibold">
            {displayed}
            <span className="inline-block w-1 h-7 bg-blue-400 align-middle ml-1 animate-pulse" />
          </span>
        </div>

        {/* Bio */}
        <p className="max-w-2xl text-gray-400 text-lg leading-relaxed mb-10">
          Full-Stack Web Developer with a background in{" "}
          <span className="text-blue-300">Data Science and Statistics</span>, passionate
          about building dynamic web applications and leveraging{" "}
          <span className="text-blue-300">data-driven insights</span> to solve
          real-world problems and drive business growth.
        </p>

        {/* CTA Buttons */}
        <div className="flex gap-4 flex-wrap justify-center mb-16">
          <button
            onClick={() => router.push("/projects")}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-1"
          >
            View Projects
          </button>
          <button
            onClick={() => router.push("/contact")}
            className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-blue-500/50 rounded-xl font-bold transition-all duration-300 hover:-translate-y-1"
          >
            Contact Me
          </button>
          <button
            onClick={() => router.push("/resume-analyzer")}
            className="px-8 py-4 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-xl font-bold transition-all duration-300 hover:-translate-y-1 text-cyan-300"
          >
            Resume Analyzer
          </button>
        </div>

        {/* Social Links */}
        <div className="flex gap-6 text-gray-400 text-sm flex-wrap justify-center">
          <a
            href="https://github.com/2003HEMANTH"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition flex items-center gap-2"
          >
            GitHub · 2003HEMANTH
          </a>
          <span className="text-gray-700">|</span>
          <a
            href="https://linkedin.com/in/hemanth-l-/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition flex items-center gap-2"
          >
            LinkedIn · hemanth-l
          </a>
          <span className="text-gray-700">|</span>
          <a
            href="mailto:hemanth9886609@gmail.com"
            className="hover:text-white transition"
          >
            hemanth9886609@gmail.com
          </a>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="relative py-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { number: "0.81", label: "R2 Score", sub: "ML Model" },
            { number: "40+", label: "Tickets/Week", sub: "Tech Support" },
            { number: "99%", label: "Uptime", sub: "VM Management" },
            { number: "3+", label: "Projects", sub: "Full Stack" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:border-blue-500/40 transition-all duration-300"
            >
              <p className="text-4xl font-black text-blue-400 mb-1">{stat.number}</p>
              <p className="text-white font-semibold text-sm">{stat.label}</p>
              <p className="text-gray-500 text-xs mt-1">{stat.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* EXPERIENCE SECTION */}
      <section className="relative py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-black text-center mb-3">
            <span className="bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
              Experience
            </span>
          </h2>
          <p className="text-center text-gray-500 mb-12">Where I have worked</p>

          <div className="space-y-6">
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-blue-500/40 transition-all duration-300">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">Data Science Intern</h3>
                  <p className="text-blue-400 font-semibold">APEXIQ.AI</p>
                </div>
                <div className="text-right mt-2 md:mt-0">
                  <p className="text-gray-400 text-sm">Jun 2025 - Jul 2025</p>
                  <p className="text-gray-500 text-xs">Bengaluru, India</p>
                </div>
              </div>
              <ul className="space-y-2">
                <li className="flex gap-3 text-gray-400 text-sm">
                  <span className="text-blue-400 mt-1">▹</span>
                  Built Random Forest regression model achieving R2 score of 0.81 for real estate ROI prediction
                </li>
                <li className="flex gap-3 text-gray-400 text-sm">
                  <span className="text-blue-400 mt-1">▹</span>
                  Performed EDA, data cleaning and preprocessing using Pandas and NumPy
                </li>
                <li className="flex gap-3 text-gray-400 text-sm">
                  <span className="text-blue-400 mt-1">▹</span>
                  Deployed model using Streamlit for real-time user predictions
                </li>
              </ul>
            </div>

            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-cyan-500/40 transition-all duration-300">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">Technical Support Engineer Intern (L1)</h3>
                  <p className="text-cyan-400 font-semibold">HOSTUPCLOUD TECHNOLOGY PVT. LTD.</p>
                </div>
                <div className="text-right mt-2 md:mt-0">
                  <p className="text-gray-400 text-sm">May 2023 - Jul 2023</p>
                  <p className="text-gray-500 text-xs">Bengaluru, India</p>
                </div>
              </div>
              <ul className="space-y-2">
                <li className="flex gap-3 text-gray-400 text-sm">
                  <span className="text-cyan-400 mt-1">▹</span>
                  Resolved 40+ tickets weekly with 95% first-contact resolution rate via WHMCS
                </li>
                <li className="flex gap-3 text-gray-400 text-sm">
                  <span className="text-cyan-400 mt-1">▹</span>
                  Deployed and managed 20+ VMs on Windows and Linux ensuring 99% uptime
                </li>
                <li className="flex gap-3 text-gray-400 text-sm">
                  <span className="text-cyan-400 mt-1">▹</span>
                  Reduced ticket resolution time by 25% through efficient L1 diagnosis and escalation
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SKILLS SECTION */}
      <section className="relative py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-black text-center mb-3">
            <span className="bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
              Skills
            </span>
          </h2>
          <p className="text-center text-gray-500 mb-12">Technologies I work with</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-all duration-300">
              <h3 className="text-white font-bold mb-4">💻 Programming</h3>
              <div className="flex flex-wrap gap-2">
                {["Python", "SQL", "JavaScript", "TypeScript", "R"].map((skill) => (
                  <span key={skill} className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs rounded-full">{skill}</span>
                ))}
              </div>
            </div>

            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-all duration-300">
              <h3 className="text-white font-bold mb-4">🤖 ML and Data Science</h3>
              <div className="flex flex-wrap gap-2">
                {["Scikit-learn", "TensorFlow", "Pandas", "NumPy", "Matplotlib"].map((skill) => (
                  <span key={skill} className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs rounded-full">{skill}</span>
                ))}
              </div>
            </div>

            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-all duration-300">
              <h3 className="text-white font-bold mb-4">🌐 Web Technologies</h3>
              <div className="flex flex-wrap gap-2">
                {["Next.js", "React.js", "Node.js", "Express", "HTML", "CSS"].map((skill) => (
                  <span key={skill} className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs rounded-full">{skill}</span>
                ))}
              </div>
            </div>

            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-all duration-300">
              <h3 className="text-white font-bold mb-4">☁️ Cloud and DevOps</h3>
              <div className="flex flex-wrap gap-2">
                {["AWS", "Linux", "Jenkins", "CI/CD", "Git", "Docker"].map((skill) => (
                  <span key={skill} className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs rounded-full">{skill}</span>
                ))}
              </div>
            </div>

            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-all duration-300">
              <h3 className="text-white font-bold mb-4">🗄️ Databases</h3>
              <div className="flex flex-wrap gap-2">
                {["MongoDB", "MySQL"].map((skill) => (
                  <span key={skill} className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs rounded-full">{skill}</span>
                ))}
              </div>
            </div>

            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-all duration-300">
              <h3 className="text-white font-bold mb-4">📊 Data Visualization</h3>
              <div className="flex flex-wrap gap-2">
                {["Power BI", "Tableau", "Excel"].map((skill) => (
                  <span key={skill} className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs rounded-full">{skill}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CERTIFICATIONS SECTION */}
      <section className="relative py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-black text-center mb-3">
            <span className="bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
              Certifications
            </span>
          </h2>
          <p className="text-center text-gray-500 mb-12">Verified credentials</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-5 hover:border-blue-500/30 transition-all duration-300">
              <div className="text-2xl mb-3">🏆</div>
              <h3 className="text-white font-semibold text-sm mb-1">Introduction to MongoDB</h3>
              <p className="text-blue-400 text-xs">MongoDB Inc.</p>
              <p className="text-gray-500 text-xs mt-1">2024</p>
            </div>
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-5 hover:border-blue-500/30 transition-all duration-300">
              <div className="text-2xl mb-3">🏆</div>
              <h3 className="text-white font-semibold text-sm mb-1">Python for Data Science</h3>
              <p className="text-blue-400 text-xs">NPTEL (IIT Madras)</p>
              <p className="text-gray-500 text-xs mt-1">2024</p>
            </div>
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-5 hover:border-blue-500/30 transition-all duration-300">
              <div className="text-2xl mb-3">🏆</div>
              <h3 className="text-white font-semibold text-sm mb-1">Qlik Sense Business Analyst</h3>
              <p className="text-blue-400 text-xs">Qlik</p>
              <p className="text-gray-500 text-xs mt-1">2023</p>
            </div>
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-5 hover:border-blue-500/30 transition-all duration-300">
              <div className="text-2xl mb-3">🏆</div>
              <h3 className="text-white font-semibold text-sm mb-1">Google Analytics for Beginners</h3>
              <p className="text-blue-400 text-xs">Google</p>
              <p className="text-gray-500 text-xs mt-1">2024</p>
            </div>
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-5 hover:border-blue-500/30 transition-all duration-300">
              <div className="text-2xl mb-3">🏆</div>
              <h3 className="text-white font-semibold text-sm mb-1">Azure Fundamentals</h3>
              <p className="text-blue-400 text-xs">Microsoft</p>
              <p className="text-gray-500 text-xs mt-1">2024</p>
            </div>
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-5 hover:border-blue-500/30 transition-all duration-300">
              <div className="text-2xl mb-3">🏆</div>
              <h3 className="text-white font-semibold text-sm mb-1">Google Cybersecurity</h3>
              <p className="text-blue-400 text-xs">Coursera</p>
              <p className="text-gray-500 text-xs mt-1">2024</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FOOTER SECTION */}
      <section className="relative py-28 px-6 text-center">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-96 h-64 bg-blue-600/10 rounded-full blur-3xl" />
        </div>
        <h2 className="text-5xl font-black mb-4 relative">
          <span className="bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
            Lets Build Something
          </span>
        </h2>
        <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto relative">
          Open to full-time roles, internships, and freelance projects.
          Lets create something impactful together.
        </p>
        <div className="flex gap-4 justify-center relative flex-wrap">
          <button
            onClick={() => router.push("/contact")}
            className="px-10 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-1"
          >
            Get In Touch
          </button>
          <button
            onClick={() => router.push("/projects")}
            className="px-10 py-4 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl font-bold text-lg transition-all duration-300 hover:-translate-y-1"
          >
            View Work
          </button>
        </div>
      </section>

    </main>
  );
}