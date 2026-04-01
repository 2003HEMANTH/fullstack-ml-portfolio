"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import api from "@/lib/api";
import { Blog } from "@/types";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";

export default function AdminBlogPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState("");
  const [form, setForm] = useState({
    title: "",
    summary: "",
    coverImage: "",
    tags: "",
    published: true,
  });

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await api.get("/blogs");
      setBlogs(res.data.blogs);
    } catch (error) {
      console.error("Failed to fetch blogs", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/blogs", {
        ...form,
        content,
        tags: form.tags.split(",").map((t) => t.trim()),
      });
      setForm({
        title: "",
        summary: "",
        coverImage: "",
        tags: "",
        published: true,
      });
      setContent("");
      setShowForm(false);
      fetchBlogs();
    } catch (error) {
      console.error("Failed to create blog", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;
    try {
      await api.delete(`/blogs/${id}`);
      fetchBlogs();
    } catch (error) {
      console.error("Failed to delete blog", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-black flex items-center justify-center">
        <div className="text-blue-400 text-2xl animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-black text-white px-10 py-28">
      {/* Header */}
      <div className="flex justify-between items-center mb-10 max-w-7xl mx-auto">
        <div>
          <h1 className="text-4xl font-bold text-blue-400">Blog Manager</h1>
          <p className="text-gray-400 mt-1">Create and manage blog posts</p>
        </div>
        <button
          onClick={() => router.push("/admin/dashboard")}
          className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition"
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Add Blog Button */}
      <div className="max-w-7xl mx-auto mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold transition"
        >
          {showForm ? "Cancel" : "+ Add New Blog"}
        </button>
      </div>

      {/* Blog Form */}
      {showForm && (
        <div className="max-w-7xl mx-auto mb-10">
          <form
            onSubmit={handleSubmit}
            className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-gray-300 text-sm mb-2 block">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                  placeholder="Blog Title"
                  required
                />
              </div>

              <div>
                <label className="text-gray-300 text-sm mb-2 block">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                  placeholder="nextjs, mongodb, aws"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-gray-300 text-sm mb-2 block">Summary</label>
                <textarea
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition h-20 resize-none"
                  placeholder="Short summary of your blog..."
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-gray-300 text-sm mb-2 block">Cover Image URL</label>
                <input
                  type="url"
                  value={form.coverImage}
                  onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                  placeholder="https://image-url.com/..."
                />
              </div>
            </div>

            {/* Rich Text Editor */}
            <div>
              <label className="text-gray-300 text-sm mb-2 block">Content</label>
              <div className="rounded-xl overflow-hidden border border-white/10">
                <ReactQuill
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  className="bg-white text-black"
                  placeholder="Write your blog content here..."
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
                className="w-4 h-4 accent-blue-500"
              />
              <label className="text-gray-300 text-sm">Publish immediately</label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 rounded-xl font-semibold transition"
            >
              {submitting ? "Publishing..." : "Publish Blog"}
            </button>
          </form>
        </div>
      )}

      {/* Blogs List */}
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6">All Blogs ({blogs.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <div
              key={blog._id}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6"
            >
              <h3 className="text-lg font-bold text-white mb-2">{blog.title}</h3>
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">{blog.summary}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {blog.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/blog/${blog._id}`)}
                  className="flex-1 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 rounded-xl text-sm transition"
                >
                  View
                </button>
                <button
                  onClick={() => handleDelete(blog._id)}
                  className="flex-1 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-xl text-sm transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}