"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  return (
    <nav className="fixed top-0 w-full flex justify-between px-10 py-4 bg-black/30 backdrop-blur-lg border-b border-white/10">
      
      {/* Home Logo Click → No history */}
      <h2 
        onClick={() => router.replace("/")} 
        className="text-xl font-bold text-blue-400 cursor-pointer"
      >
        Hemanth.dev
      </h2>

      <div className="space-x-6 text-gray-300">
        <Link href="/" className="hover:text-blue-400">Home</Link>
        <Link href="/projects" className="hover:text-blue-400">Projects</Link>
        <Link href="/blog" className="hover:text-blue-400">Blog</Link>
        <Link href="/contact" className="hover:text-blue-400">Contact</Link>
        <Link href="/admin" className="hover:text-red-400">Admin</Link>
      </div>
    </nav>
  );
}