"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Blog } from "@/types";

export default function BlogPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-black flex items-center justify-center">
        <div className="text-blue-400 text-2xl animate-pulse">Loading Blogs...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-black text-white px-10 py-28">
      <h1 className="text-5xl font-bold text-center text-blue-400 mb-4">Blog</h1>
      <p className="text-center text-gray-400 mb-12">Thoughts, learnings and experiences</p>

      {blogs.length === 0 ? (
        <div className="text-center text-gray-500 text-xl mt-20">
          No blogs yet. Add some from admin panel.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {blogs.map((blog) => (
            <div
              key={blog._id}
              onClick={() => router.push(`/blog/${blog._id}`)}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer"
            >
              {blog.coverImage && (
                <img
                  src={blog.coverImage}
                  alt={blog.title}
                  className="w-full h-48 object-cover rounded-xl mb-4"
                />
              )}
              <h2 className="text-xl font-bold text-white mb-2">{blog.title}</h2>
              <p className="text-gray-400 text-sm mb-4 line-clamp-3">{blog.summary}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {blog.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="flex justify-between items-center text-gray-500 text-xs">
                <span>{blog.author?.name}</span>
                <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}