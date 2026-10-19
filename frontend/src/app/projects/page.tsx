"use client";

import { useEffect, useState } from "react";
import api, { errorMessage } from "@/lib/api";
import ApiErrorNotice from "@/components/ApiErrorNotice";
import { Project } from "@/types";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { const load = async () => { try { const response = await api.get("/projects"); setProjects(response.data.projects); } catch (failure) { setError(errorMessage(failure)); } finally { setLoading(false); } }; load(); }, []);

  return <main className="page-shell"><div className="content-shell">
    <header className="grid gap-8 border-b border-[#dfdfd9] pb-14 lg:grid-cols-[1fr_24rem] lg:items-end"><div><p className="eyebrow">Selected work</p><h1 className="display-title">Projects built to solve real problems.</h1></div><p className="body-copy !text-base">A selection of full-stack, machine-learning, and data products—from idea and implementation through deployment.</p></header>
    <ApiErrorNotice message={error}/>
    {loading ? <div className="py-24 text-sm text-[#686864]">Loading projects…</div> : !error && projects.length === 0 ? <div className="py-24 text-[#686864]">Projects will be published here soon.</div> : <div className="grid gap-6 py-14 md:grid-cols-2">{projects.map((project,index) => <article key={project._id} className="card card-hover flex flex-col overflow-hidden">
      {project.imageUrl ? <img src={project.imageUrl} alt="" className="aspect-[16/9] w-full border-b border-[#dfdfd9] object-cover"/> : <div className="flex aspect-[16/9] items-end bg-[#ecece7] p-7"><span className="text-6xl font-semibold tracking-[-.06em] text-[#d0d0c9]">0{index+1}</span></div>}
      <div className="flex flex-1 flex-col p-7"><div className="mb-5 flex flex-wrap gap-2">{project.techStack.map((tech)=><span key={tech} className="tag">{tech}</span>)}</div><h2 className="text-2xl font-semibold tracking-[-.03em]">{project.title}</h2><p className="mt-3 flex-1 leading-7 text-[#686864]">{project.description}</p><div className="mt-7 flex gap-5 text-sm font-semibold">{project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-[#2557d6] hover:underline">Live project ↗</a>}{project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">Source code ↗</a>}</div></div>
    </article>)}</div>}
  </div></main>;
}