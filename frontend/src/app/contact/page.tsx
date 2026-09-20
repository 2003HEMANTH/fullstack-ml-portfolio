"use client";

import { FormEvent, ReactNode, useState } from "react";
import api, { errorMessage } from "@/lib/api";

const EMAIL = "hemanth9886609@gmail.com";
const MAX_MESSAGE_LENGTH = 4500;
const projectTypes = ["Full-stack product", "Machine learning", "Data & analytics", "Cloud & DevOps", "Something else"];

type IconName = "arrow" | "check" | "clock" | "copy" | "email" | "github" | "linkedin" | "send" | "spark";

function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  const paths: Record<IconName, ReactNode> = {
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    check: <path d="m5 12 4 4L19 6" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    copy: <><rect x="8" y="8" width="11" height="11" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
    email: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
    github: <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3.3-.4 6.8-1.6 6.8-7A5.4 5.4 0 0 0 19.3 4 5 5 0 0 0 19.1.5S18 0 15 2a13.4 13.4 0 0 0-7 0C5-.1 3.9.5 3.9.5A5 5 0 0 0 3.7 4a5.4 5.4 0 0 0-1.5 3.7c0 5.4 3.5 6.6 6.8 7A4.8 4.8 0 0 0 8 18v4m-4-5c-3 .5-3-2-4-2" />,
    linkedin: <><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6Z" /><path d="M2 9h4v12H2z" /><circle cx="4" cy="4" r="2" /></>,
    send: <><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></>,
    spark: <><path d="m12 3-1.2 3.8L7 8l3.8 1.2L12 13l1.2-3.8L17 8l-3.8-1.2Z" /><path d="m5 15-.7 2.3L2 18l2.3.7L5 21l.7-2.3L8 18l-2.3-.7Z" /></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>{paths[name]}</svg>;
}

function ContactLink({ href, icon, title, detail }: { href: string; icon: IconName; title: string; detail: string }) {
  return (
    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className="group flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 transition duration-300 hover:-translate-y-0.5 hover:border-purple-300/20 hover:bg-white/[0.045]">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-purple-200 transition group-hover:border-purple-300/30 group-hover:bg-purple-300/10"><Icon name={icon} /></span>
      <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-white">{title}</span><span className="block truncate text-xs text-slate-500">{detail}</span></span>
      <Icon name="arrow" className="h-4 w-4 text-slate-700 transition group-hover:translate-x-1 group-hover:text-purple-200" />
    </a>
  );
}

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", projectType: projectTypes[0], message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const update = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }));

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${EMAIL}`;
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/contact", {
        name: form.name.trim(),
        email: form.email.trim(),
        message: `Project type: ${form.projectType}\n\n${form.message.trim()}`,
      });
      setSuccess(true);
      setForm({ name: "", email: "", projectType: projectTypes[0], message: "" });
    } catch (err: unknown) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#110720] px-5 pb-20 pt-28 text-white sm:px-8 lg:pt-32">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[42rem] w-[70rem] -translate-x-1/2 rounded-full bg-violet-700/[0.13] blur-[120px]" />
        <div className="absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-purple-400/[0.08] blur-[110px]" />
        <div className="absolute -left-40 bottom-0 h-96 w-96 rounded-full bg-indigo-500/[0.1] blur-[110px]" />
        <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.7) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.7) 1px,transparent 1px)", backgroundSize: "64px 64px", maskImage: "linear-gradient(to bottom,black,transparent 85%)" }} />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <header className="mb-12 max-w-3xl lg:mb-16">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-300/20 bg-purple-300/[0.06] px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-purple-200">
            <span className="relative flex h-2 w-2"><span className="absolute h-full w-full animate-ping rounded-full bg-emerald-300 opacity-60" /><span className="relative h-2 w-2 rounded-full bg-emerald-300" /></span>
            Available for select projects
          </div>
          <h1 className="text-5xl font-black tracking-[-0.055em] sm:text-6xl lg:text-7xl">Let&apos;s build something <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-purple-200 bg-clip-text text-transparent">worth remembering.</span></h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">Have a product idea, a data problem, or a team that needs engineering support? Share the context and I&apos;ll reply with a clear next step.</p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:gap-10">
          <aside className="space-y-5">
            <section className="rounded-3xl border border-white/[0.08] bg-white/[0.025] p-6 backdrop-blur-xl sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-600">Start a conversation</p>
              <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-white/[0.07] bg-black/20 p-4">
                <a href={`mailto:${EMAIL}`} className="min-w-0 truncate text-sm font-medium text-slate-200 hover:text-purple-200">{EMAIL}</a>
                <button type="button" onClick={copyEmail} aria-label="Copy email address" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 text-slate-400 transition hover:border-purple-300/30 hover:bg-purple-300/10 hover:text-purple-200">
                  <Icon name={copied ? "check" : "copy"} className="h-4 w-4" />
                </button>
              </div>
              <p aria-live="polite" className="mt-2 h-4 text-right text-xs text-emerald-300">{copied ? "Email copied" : ""}</p>
              <div className="mt-4 space-y-3">
                <ContactLink href="https://linkedin.com/in/hemanth-l-/" icon="linkedin" title="LinkedIn" detail="Connect professionally" />
                <ContactLink href="https://github.com/2003HEMANTH" icon="github" title="GitHub" detail="Explore my code" />
              </div>
            </section>

            <section className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5"><Icon name="clock" className="mb-4 h-5 w-5 text-violet-300" /><p className="text-sm font-semibold">Usually within 24h</p><p className="mt-1 text-xs leading-5 text-slate-600">Typical response time</p></div>
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5"><Icon name="spark" className="mb-4 h-5 w-5 text-purple-200" /><p className="text-sm font-semibold">Bengaluru, India</p><p className="mt-1 text-xs leading-5 text-slate-600">Open to remote work</p></div>
            </section>
          </aside>

          <section className="relative overflow-hidden rounded-[2rem] border border-white/[0.09] bg-[#1a0c2c]/85 p-6 shadow-2xl shadow-violet-950/30 backdrop-blur-2xl sm:p-9">
            <div aria-hidden="true" className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-purple-200/70 to-transparent" />
            {success ? (
              <div className="flex min-h-[34rem] flex-col items-center justify-center text-center" role="status">
                <div className="grid h-20 w-20 place-items-center rounded-full border border-emerald-300/30 bg-emerald-300/10 text-emerald-300 shadow-[0_0_50px_rgba(110,231,183,.15)]"><Icon name="check" className="h-9 w-9" /></div>
                <p className="mt-8 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">Message received</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight">Thanks for reaching out.</h2>
                <p className="mt-4 max-w-sm leading-7 text-slate-400">Your note is in my inbox. I&apos;ll review the details and get back to you as soon as possible.</p>
                <button type="button" onClick={() => setSuccess(false)} className="mt-8 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold transition hover:border-purple-300/30 hover:bg-purple-300/10">Send another message <Icon name="arrow" className="h-4 w-4" /></button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-300">Project inquiry</p><h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Tell me what you&apos;re working on.</h2><p className="mt-2 text-sm leading-6 text-slate-500">A few useful details will help me respond with the right questions.</p></div>
                {error && <div role="alert" className="rounded-xl border border-red-400/20 bg-red-400/[0.08] px-4 py-3 text-sm text-red-200">{error}</div>}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div><label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-300">Your name</label><input id="name" name="name" autoComplete="name" required maxLength={100} value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="Jane Smith" className="w-full rounded-xl border border-white/[0.09] bg-white/[0.035] px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-700 focus:border-purple-300/40 focus:bg-white/[0.055] focus:ring-4 focus:ring-purple-300/[0.06]" /></div>
                  <div><label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-300">Email address</label><input id="email" name="email" type="email" autoComplete="email" required maxLength={254} value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="jane@company.com" className="w-full rounded-xl border border-white/[0.09] bg-white/[0.035] px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-700 focus:border-purple-300/40 focus:bg-white/[0.055] focus:ring-4 focus:ring-purple-300/[0.06]" /></div>
                </div>
                <div><label htmlFor="projectType" className="mb-2 block text-sm font-medium text-slate-300">What can I help with?</label><div className="relative"><select id="projectType" value={form.projectType} onChange={(event) => update("projectType", event.target.value)} className="w-full appearance-none rounded-xl border border-white/[0.09] bg-[#1a0c2c] px-4 py-3.5 text-sm text-slate-200 outline-none transition focus:border-purple-300/40 focus:ring-4 focus:ring-purple-300/[0.06]">{projectTypes.map((type) => <option key={type}>{type}</option>)}</select><span aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-600">v</span></div></div>
                <div><div className="mb-2 flex items-center justify-between gap-4"><label htmlFor="message" className="text-sm font-medium text-slate-300">Project details</label><span className={`text-xs tabular-nums ${form.message.length > MAX_MESSAGE_LENGTH * 0.9 ? "text-amber-300" : "text-slate-700"}`}>{form.message.length}/{MAX_MESSAGE_LENGTH}</span></div><textarea id="message" name="message" required minLength={10} maxLength={MAX_MESSAGE_LENGTH} value={form.message} onChange={(event) => update("message", event.target.value)} placeholder="What are you building, where are you stuck, and what would a great outcome look like?" className="min-h-40 w-full resize-y rounded-xl border border-white/[0.09] bg-white/[0.035] px-4 py-3.5 text-sm leading-6 outline-none transition placeholder:text-slate-700 focus:border-purple-300/40 focus:bg-white/[0.055] focus:ring-4 focus:ring-purple-300/[0.06]" /></div>
                <button type="submit" disabled={loading} className="group flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-500 to-purple-500 px-5 py-4 text-sm font-bold shadow-lg shadow-violet-950/30 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-900/30 disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0">
                  {loading ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Sending your message...</> : <>Send project inquiry <Icon name="send" className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></>}
                </button>
                <p className="text-center text-xs leading-5 text-slate-600">Your details are used only to respond to this inquiry.</p>
              </form>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}