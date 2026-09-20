import Link from "next/link";
export default function NotFound() {
  return <main className="min-h-screen flex flex-col items-center justify-center gap-5 bg-black text-white">
    <h1 className="text-5xl font-bold text-purple-300">404 - Page not found</h1>
    <p>The page you requested does not exist.</p>
    <Link className="rounded-xl bg-violet-600 px-6 py-3" href="/home">Back home</Link>
  </main>;
}
