"use client";
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="page-shell flex items-center"><div className="content-shell max-w-xl"><p className="eyebrow">Error</p><h1 className="section-title">Something went wrong.</h1><p className="body-copy mt-4">We could not load this page. Please try again.</p><button className="button-primary mt-7" onClick={reset}>Try again</button></div></main>;
}