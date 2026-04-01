"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Blog } from "@/types";

export default function BlogPostPage() {
  const { id } = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await api.get(`/blogs/${id}`);
        setBlog(res.data.blog);
      } catch (error) {
        console.error("Failed to fetch blog", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-black flex items-center justify-center">
        <div className="text-blue-400 text-2xl animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-xl mb-4">Blog post not found</p>
          <button
            onClick={() => router.push("/blog")}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl transition"
          >
            Back to Blog
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-black text-white px-6 py-28">
      <div className="max-w-3xl mx-auto">

        {/* Back Button */}
        <button
          onClick={() => router.push("/blog")}
          className="mb-8 text-gray-400 hover:text-blue-400 transition flex items-center gap-2"
        >
          ← Back to Blog
        </button>

        {/* Cover Image */}
        {blog.coverImage && (
          <img
            src={blog.coverImage}
            alt={blog.title}
            className="w-full h-64 object-cover rounded-2xl mb-8"
          />
        )}

        {/* Title */}
        <h1 className="text-4xl font-bold text-white mb-4">{blog.title}</h1>

        {/* Meta */}
        <div className="flex justify-between items-center text-gray-400 text-sm mb-6">
          <span>By {blog.author?.name}</span>
          <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-8">
          {blog.tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 mb-8" />

        {/* Content */}
        <div
          className="prose prose-invert prose-blue max-w-none text-gray-300 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </div>
    </main>
  );
}