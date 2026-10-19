"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import api, { errorMessage } from "@/lib/api";
import ApiErrorNotice from "@/components/ApiErrorNotice";
import { Blog } from "@/types";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";

export default function AdminBlogPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
    setError("");
    try {
      const res = await api.get("/blogs");
      setBlogs(res.data.blogs);
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
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
      setError(errorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;
    setError("");
    try {
      await api.delete(`/blogs/${id}`);
      fetchBlogs();
    } catch (error) {
      setError(errorMessage(error));
    }
  };

  if (loading) {
    return (
      <div className="admin-light min-h-screen bg-[#f7f7f4] flex items-center justify-center px-5">
        <div className="text-[#2557d6] text-2xl animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <main className="admin-light page-shell">
      <ApiErrorNotice message={error} />
      {/* Header */}
      <div className="flex justify-between items-center mb-10 max-w-7xl mx-auto">
        <div>
          <h1 className="text-4xl font-bold text-[#2557d6]">Blog Manager</h1>
          <p className="text-[#686864] mt-1">Create and manage blog posts</p>
        </div>
        <button
          onClick={() => router.push("/admin/dashboard")}
          className="px-6 py-2 bg-white border border-[#dfdfd9] hover:bg-[#f0f0ec] rounded-xl transition"
        >
          ← Back to Dashboard
        </button>
      </div>

      {!error && blogs.length === 0 && <p className="text-center text-[#686864]">No published blogs yet. Create your first blog above.</p>}
      {/* Add Blog Button */}
      <div className="max-w-7xl mx-auto mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-[#171716] hover:bg-[#2557d6] text-white rounded-xl font-semibold transition"
        >
          {showForm ? "Cancel" : "+ Add New Blog"}
        </button>
      </div>

      {/* Blog Form */}
      {showForm && (
        <div className="max-w-7xl mx-auto mb-10">
          <form
            onSubmit={handleSubmit}
            className="card p-8 space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[#3f3f3b] text-sm mb-2 block">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-[#dfdfd9] rounded-xl text-[#171716] placeholder-gray-500 focus:outline-none focus:border-[#2557d6] transition"
                  placeholder="Blog Title"
                  required
                />
              </div>

              <div>
                <label className="text-[#3f3f3b] text-sm mb-2 block">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-[#dfdfd9] rounded-xl text-[#171716] placeholder-gray-500 focus:outline-none focus:border-[#2557d6] transition"
                  placeholder="nextjs, mongodb, aws"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-[#3f3f3b] text-sm mb-2 block">Summary</label>
                <textarea
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-[#dfdfd9] rounded-xl text-[#171716] placeholder-gray-500 focus:outline-none focus:border-[#2557d6] transition h-20 resize-none"
                  placeholder="Short summary of your blog..."
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-[#3f3f3b] text-sm mb-2 block">Cover Image URL</label>
                <input
                  type="url"
                  value={form.coverImage}
                  onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-[#dfdfd9] rounded-xl text-[#171716] placeholder-gray-500 focus:outline-none focus:border-[#2557d6] transition"
                  placeholder="https://image-url.com/..."
                />
              </div>
            </div>

            {/* Rich Text Editor */}
            <div>
              <label className="text-[#3f3f3b] text-sm mb-2 block">Content</label>
              <div className="rounded-xl overflow-hidden border border-[#dfdfd9]">
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
                className="w-4 h-4 accent-[#2557d6]"
              />
              <label className="text-[#3f3f3b] text-sm">Publish immediately</label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-[#171716] hover:bg-[#2557d6] disabled:bg-[#888881] text-white rounded-xl font-semibold transition"
            >
              {submitting ? "Publishing..." : "Publish Blog"}
            </button>
          </form>
        </div>
      )}

      {/* Blogs List */}
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-[#171716] mb-6">All Blogs ({blogs.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <div
              key={blog._id}
              className="card p-6"
            >
              <h3 className="text-lg font-bold text-[#171716] mb-2">{blog.title}</h3>
              <p className="text-[#686864] text-sm mb-4 line-clamp-2">{blog.summary}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {blog.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-[#eef2ff] text-[#2557d6] text-xs rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/blog/${blog._id}`)}
                  className="flex-1 py-2 bg-[#eef2ff] hover:bg-[#e3e9ff] border border-[#cad5ff] text-[#2557d6] rounded-xl text-sm transition"
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