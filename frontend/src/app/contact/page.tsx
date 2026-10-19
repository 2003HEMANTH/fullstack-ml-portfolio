"use client";

import { FormEvent, useState } from "react";
import api, { errorMessage } from "@/lib/api";

const EMAIL = "hemanth9886609@gmail.com";
const MAX_MESSAGE_LENGTH = 4500;
const projectTypes = ["Full-stack product", "Machine learning", "Data & analytics", "Cloud & DevOps", "Something else"];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", projectType: projectTypes[0], message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const update = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }));

  const copyEmail = async () => { try { await navigator.clipboard.writeText(EMAIL); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { window.location.href = `mailto:${EMAIL}`; } };
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setLoading(true); setError(""); try { await api.post("/contact", { name: form.name.trim(), email: form.email.trim(), message: `Project type: ${form.projectType}\n\n${form.message.trim()}` }); setSuccess(true); setForm({ name: "", email: "", projectType: projectTypes[0], message: "" }); } catch (failure) { setError(errorMessage(failure)); } finally { setLoading(false); } };

  return <main className="page-shell"><div className="content-shell">
    <header className="max-w-3xl"><p className="eyebrow">Contact</p><h1 className="display-title">Let&apos;s discuss what you&apos;re building.</h1><p className="body-copy mt-7 max-w-2xl">Share the problem, the stage you&apos;re at, and what a successful outcome looks like. I usually reply within one business day.</p></header>
    <div className="mt-16 grid gap-10 lg:grid-cols-[.72fr_1.28fr]">
      <aside className="space-y-8"><div className="border-t border-[#dfdfd9] pt-6"><p className="text-sm text-[#686864]">Email</p><div className="mt-2 flex items-center gap-3"><a href={`mailto:${EMAIL}`} className="font-medium hover:text-[#2557d6]">{EMAIL}</a><button onClick={copyEmail} type="button" className="text-xs font-semibold text-[#2557d6]">{copied ? "Copied" : "Copy"}</button></div></div><div className="border-t border-[#dfdfd9] pt-6"><p className="text-sm text-[#686864]">Based in</p><p className="mt-2 font-medium">Bengaluru, India · Open to remote</p></div><div className="border-t border-[#dfdfd9] pt-6"><p className="text-sm text-[#686864]">Elsewhere</p><div className="mt-3 flex gap-5 text-sm font-semibold"><a href="https://linkedin.com/in/hemanth-l-/" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a><a href="https://github.com/2003HEMANTH" target="_blank" rel="noopener noreferrer">GitHub ↗</a></div></div></aside>
      <section className="card p-6 sm:p-9">{success ? <div className="flex min-h-[30rem] flex-col items-start justify-center"><span className="mb-6 grid h-12 w-12 place-items-center rounded-full bg-emerald-50 text-xl text-emerald-700">✓</span><p className="eyebrow">Message received</p><h2 className="section-title">Thanks for reaching out.</h2><p className="mt-4 max-w-md leading-7 text-[#686864]">Your message is in my inbox. I&apos;ll review the details and get back to you shortly.</p><button type="button" onClick={() => setSuccess(false)} className="button-secondary mt-7">Send another message</button></div> : <form onSubmit={handleSubmit} className="space-y-6">
        <div><h2 className="text-2xl font-semibold tracking-[-.03em]">Project inquiry</h2><p className="mt-2 text-sm leading-6 text-[#686864]">A few useful details will help me respond clearly.</p></div>
        {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        <div className="grid gap-5 sm:grid-cols-2"><label className="text-sm font-medium">Your name<input required maxLength={100} autoComplete="name" value={form.name} onChange={(event)=>update("name",event.target.value)} className="field mt-2" placeholder="Jane Smith"/></label><label className="text-sm font-medium">Email address<input required maxLength={254} type="email" autoComplete="email" value={form.email} onChange={(event)=>update("email",event.target.value)} className="field mt-2" placeholder="jane@company.com"/></label></div>
        <label className="block text-sm font-medium">What can I help with?<select value={form.projectType} onChange={(event)=>update("projectType",event.target.value)} className="field mt-2">{projectTypes.map((type)=><option key={type}>{type}</option>)}</select></label>
        <label className="block text-sm font-medium"><span className="flex justify-between"><span>Project details</span><span className="font-normal text-[#9a9a93]">{form.message.length}/{MAX_MESSAGE_LENGTH}</span></span><textarea required minLength={10} maxLength={MAX_MESSAGE_LENGTH} value={form.message} onChange={(event)=>update("message",event.target.value)} className="field mt-2 min-h-40 resize-y" placeholder="What are you building, where are you stuck, and what would a great outcome look like?"/></label>
        <button type="submit" disabled={loading} className="button-primary w-full disabled:cursor-wait disabled:opacity-60">{loading ? "Sending…" : "Send inquiry →"}</button><p className="text-center text-xs text-[#888881]">Your details are used only to respond to this inquiry.</p>
      </form>}</section>
    </div>
  </div></main>;
}