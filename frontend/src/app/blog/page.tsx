"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import api, { errorMessage } from "@/lib/api";
import ApiErrorNotice from "@/components/ApiErrorNotice";
import { Blog } from "@/types";

export default function BlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => { const load = async () => { try { const response = await api.get("/blogs"); setBlogs(response.data.blogs); } catch (failure) { setError(errorMessage(failure)); } finally { setLoading(false); } }; load(); }, []);

  return <main className="page-shell"><div className="content-shell">
    <header className="max-w-3xl border-b border-[#dfdfd9] pb-14"><p className="eyebrow">Notes & ideas</p><h1 className="display-title">Writing about engineering, data, and what I learn.</h1></header>
    <ApiErrorNotice message={error}/>
    {loading ? <div className="py-24 text-sm text-[#686864]">Loading articles…</div> : !error && blogs.length === 0 ? <div className="py-24 text-[#686864]">New articles are on the way.</div> : <div className="divide-y divide-[#dfdfd9]">{blogs.map((blog)=><article key={blog._id} className="grid gap-6 py-9 md:grid-cols-[1fr_13rem] md:items-center">
      <div><div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-[#686864]"><span>{new Date(blog.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</span>{blog.tags.slice(0,3).map((tag)=><span key={tag} className="tag">{tag}</span>)}</div><Link href={`/blog/${blog._id}`} className="group"><h2 className="text-2xl font-semibold tracking-[-.03em] transition group-hover:text-[#2557d6] sm:text-3xl">{blog.title}</h2><p className="mt-3 max-w-3xl leading-7 text-[#686864]">{blog.summary}</p><span className="mt-5 inline-block text-sm font-semibold">Read article →</span></Link></div>
      {blog.coverImage && <img src={blog.coverImage} alt="" className="aspect-[4/3] w-full rounded-xl border border-[#dfdfd9] object-cover"/>}
    </article>)}</div>}
  </div></main>;
}