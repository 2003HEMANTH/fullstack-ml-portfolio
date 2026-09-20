import Link from "next/link";
import { notFound } from "next/navigation";
import api, { ApiError } from "@/lib/api";
import type { Blog } from "@/types";

export const dynamic = "force-dynamic";
export default async function BlogPostPage({ params }: { params: { id: string } }) {
  if (!/^[a-f0-9]{24}$/i.test(params.id)) notFound();
  let blog: Blog;
  try {
    const response = await api.get<{ blog: Blog }>(`/blogs/${params.id}`);
    blog = response.data.blog;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.code === "INVALID_ID")) notFound();
    throw error;
  }
  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-violet-950 to-black text-white px-6 py-28">
      <div className="max-w-3xl mx-auto">

        {/* Back Button */}
        <Link href="/blog" className="mb-8 inline-block text-gray-400 hover:text-purple-300">Back to Blog</Link>

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
              className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 mb-8" />

        {/* HTML is sanitized by backend/utils/sanitize.js on write; legacy posts require sanitizeExistingBlogs.js. */}
        <div
          className="prose prose-invert prose-blue max-w-none text-gray-300 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </div>
    </main>
  );
}
