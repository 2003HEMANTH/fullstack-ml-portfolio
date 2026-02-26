"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-black text-white">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        {/* Glow Effect */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Badge */}
        <div className="mb-6 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300 text-sm">
          Available for Opportunities
        </div>

        {/* Name */}
        <h1 className="text-6xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-white via-blue-200 to-blue-400 bg-clip-text text-transparent">
          Hemanth L
        </h1>

        {/* Title */}
        <p className="text-xl md:text-2xl text-gray-400 mb-6">
          Full Stack Developer & ML Engineer
        </p>

        {/* Description */}
        <p className="max-w-2xl text-gray-500 text-lg mb-10 leading-relaxed">
          Building modern web applications and intelligent ML systems.
          Cloud Data Analyst Intern passionate about creating impactful digital experiences.
        </p>

        {/* CTA Buttons */}
        <div className="flex gap-4 flex-wrap justify-center mb-16">
          <button
            onClick={() => router.push("/projects")}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold transition text-lg"
          >
            View Projects
          </button>
          <button
            onClick={() => router.push("/contact")}
            className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-semibold transition text-lg"
          >
            Contact Me
          </button>
          <button
            onClick={() => router.push("/resume-analyzer")}
            className="px-8 py-4 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/30 rounded-xl font-semibold transition text-lg text-purple-300"
          >
            Try Resume Analyzer
          </button>
        </div>

        {/* Tech Stack Pills */}
        <div className="flex flex-wrap justify-center gap-3">
          {["Next.js", "Node.js", "MongoDB", "Flask", "Python", "AWS", "TypeScript", "TailwindCSS"].map((tech) => (
            <span
              key={tech}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-gray-400 text-sm"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { number: "3+", label: "Projects Built" },
            { number: "2+", label: "Years Learning" },
            { number: "1", label: "Internship" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 text-center"
            >
              <p className="text-5xl font-bold text-blue-400 mb-2">{stat.number}</p>
              <p className="text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Skills Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-12">What I Do</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: "🌐",
                title: "Full Stack Dev",
                description: "Building end-to-end web applications with modern frameworks like Next.js and Node.js",
              },
              {
                icon: "🤖",
                title: "ML Engineering",
                description: "Creating intelligent systems with Python, Flask and machine learning models",
              },
              {
                icon: "☁️",
                title: "Cloud & DevOps",
                description: "Deploying scalable applications on AWS with CI/CD pipelines",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-blue-500/50 transition-all duration-300"
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}