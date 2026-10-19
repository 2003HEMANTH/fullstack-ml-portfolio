"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links = [
  { href: "/home", label: "About" },
  { href: "/projects", label: "Work" },
  { href: "/blog", label: "Writing" },
  { href: "/resume-analyzer", label: "Resume AI" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  if (pathname.startsWith("/admin")) return null;

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-black/[0.07] bg-[#f7f7f4]/90 backdrop-blur-xl">
      <nav aria-label="Primary navigation" className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/home" className="flex items-center gap-3 font-semibold tracking-[-0.02em]">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#171716] text-xs font-bold text-white">HL</span><span>Hemanth L.</span>
        </Link>
        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => { const active = pathname === link.href || (link.href !== "/home" && pathname.startsWith(link.href)); return <Link key={link.href} href={link.href} className={`rounded-full px-4 py-2 text-sm transition ${active ? "bg-black/[0.06] text-black" : "text-[#686864] hover:text-black"}`}>{link.label}</Link>; })}
          <Link href="/contact" className="button-primary ml-3 !px-4 !py-2">Let&apos;s talk</Link>
        </div>
        <button type="button" aria-label="Toggle navigation" aria-expanded={open} onClick={() => setOpen((value) => !value)} className="grid h-10 w-10 place-items-center rounded-full border border-[#dfdfd9] bg-white md:hidden"><span className="space-y-1.5"><span className="block h-px w-4 bg-black"/><span className="block h-px w-4 bg-black"/></span></button>
      </nav>
      {open && <div className="border-t border-black/[0.07] bg-[#f7f7f4] px-5 py-4 md:hidden"><div className="mx-auto flex max-w-6xl flex-col">{links.map((link) => <Link key={link.href} href={link.href} className="border-b border-black/[0.06] py-4 text-base font-medium">{link.label}</Link>)}<Link href="/contact" className="button-primary mt-4">Let&apos;s talk</Link></div></div>}
    </header>
  );
}