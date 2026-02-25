"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Project } from "@/types";

export default function AdminDashboard() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    techStack: "",
    githubUrl: "",
    liveUrl: "",
    imageUrl: "",
    featured: false,
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects");
      setProjects(res.data.projects);
    } catch (error) {
      console.error("Failed to fetch projects", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await api.post("/auth/logout");
    router.push("/admin");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/projects", {
        ...form,
        techStack: form.techStack.split(",").map((t) => t.trim()),
      });
      setForm({
        title: "",
        description: "",
        techStack: "",
        githubUrl: "",
        liveUrl: "",
        imageUrl: "",
        featured: false,
      });
      setShowForm(false);
      fetchProjects();
    } catch (error) {
      console.error("Failed to create project", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await api.delete(`/projects/${id}`);
      fetchProjects();
    } catch (error) {
      console.error("Failed to delete project", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-black flex items-center justify-center">
        <div className="text-blue-400 text-2xl animate-pulse">Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-black text-white px-10 py-28">
      {/* Header */}
      <div className="flex justify-between items-center mb-10 max-w-7xl mx-auto">
        <div>
          <h1 className="text-4xl font-bold text-blue-400">Admin Dashboard</h1>
          <p className="text-gray-400 mt-1">Manage your portfolio content</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-xl transition"
        >
          Logout
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto mb-10">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
          <p className="text-gray-400 text-sm">Total Projects</p>
          <p className="text-4xl font-bold text-blue-400 mt-2">{projects.length}</p>
        </div>
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
          <p className="text-gray-400 text-sm">Featured Projects</p>
          <p className="text-4xl font-bold text-blue-400 mt-2">
            {projects.filter((p) => p.featured).length}
          </p>
        </div>
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
          <p className="text-gray-400 text-sm">Status</p>
          <p className="text-4xl font-bold text-green-400 mt-2">Live</p>
        </div>
      </div>

      {/* Add Project Button */}
      <div className="max-w-7xl mx-auto mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold transition"
        >
          {showForm ? "Cancel" : "+ Add New Project"}
        </button>
      </div>

      {/* Add Project Form */}
      {showForm && (
        <div className="max-w-7xl mx-auto mb-10">
          <form
            onSubmit={handleSubmit}
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div>
              <label className="text-gray-300 text-sm mb-2 block">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                placeholder="Project Title"
                required
              />
            </div>

            <div>
              <label className="text-gray-300 text-sm mb-2 block">
                Tech Stack (comma separated)
              </label>
              <input
                type="text"
                value={form.techStack}
                onChange={(e) => setForm({ ...form, techStack: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                placeholder="React, Node.js, MongoDB"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-gray-300 text-sm mb-2 block">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition h-28 resize-none"
                placeholder="Project description..."
                required
              />
            </div>

            <div>
              <label className="text-gray-300 text-sm mb-2 block">GitHub URL</label>
              <input
                type="url"
                value={form.githubUrl}
                onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                placeholder="https://github.com/..."
              />
            </div>

            <div>
              <label className="text-gray-300 text-sm mb-2 block">Live URL</label>
              <input
                type="url"
                value={form.liveUrl}
                onChange={(e) => setForm({ ...form, liveUrl: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                placeholder="https://..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-gray-300 text-sm mb-2 block">Image URL</label>
              <input
                type="url"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                placeholder="https://image-url.com/..."
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                className="w-4 h-4 accent-blue-500"
              />
              <label className="text-gray-300 text-sm">Featured Project</label>
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 rounded-xl font-semibold transition"
              >
                {submitting ? "Adding Project..." : "Add Project"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Projects List */}
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6">All Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project._id}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6"
            >
              <h3 className="text-lg font-bold text-white mb-2">{project.title}</h3>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">{project.description}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {project.techStack.map((tech, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              <button
                onClick={() => handleDelete(project._id)}
                className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-xl text-sm transition"
              >
                Delete Project
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}