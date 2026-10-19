import Link from "next/link";
import { notFound } from "next/navigation";
import api, { ApiError } from "@/lib/api";
import type { Blog } from "@/types";

export const dynamic = "force-dynamic";
export default async function BlogPostPage({ params }: { params: { id: string } }) {
  if (!/^[a-f0-9]{24}$/i.test(params.id)) notFound();
  let blog: Blog;
  try { const response = await api.get<{ blog: Blog }>(`/blogs/${params.id}`); blog = response.data.blog; }
  catch (error) { if (error instanceof ApiError && (error.status === 404 || error.code === "INVALID_ID")) notFound(); throw error; }

  return <main className="page-shell"><article className="mx-auto max-w-3xl">
    <Link href="/blog" className="text-sm font-semibold text-[#686864] hover:text-black">← All writing</Link>
    <header className="pb-10 pt-12"><div className="mb-5 flex flex-wrap gap-2">{blog.tags.map((tag)=><span key={tag} className="tag">{tag}</span>)}</div><h1 className="text-4xl font-semibold leading-tight tracking-[-.045em] sm:text-6xl">{blog.title}</h1><div className="mt-7 flex gap-3 text-sm text-[#686864]"><span>{blog.author?.name}</span><span>·</span><time>{new Date(blog.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}</time></div></header>
    {blog.coverImage && <img src={blog.coverImage} alt="" className="mb-12 aspect-[16/9] w-full rounded-2xl border border-[#dfdfd9] object-cover"/>}
    {/* HTML is sanitized by backend/utils/sanitize.js on write; legacy posts require sanitizeExistingBlogs.js. */}
    <div className="article-content border-t border-[#dfdfd9] pt-10" dangerouslySetInnerHTML={{ __html: blog.content }}/>
  </article></main>;
}