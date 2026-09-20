"use client";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="min-h-screen flex flex-col items-center justify-center gap-5 bg-black text-white">
    <h1 className="text-3xl font-bold">Something went wrong</h1>
    <p>We could not load this page. Please try again.</p>
    <button className="rounded-xl bg-blue-600 px-6 py-3" onClick={reset}>Try again</button>
  </main>;
}
