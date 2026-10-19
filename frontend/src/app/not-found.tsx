import Link from "next/link";
export default function NotFound() {
  return <main className="page-shell flex items-center"><div className="content-shell max-w-xl"><p className="eyebrow">404</p><h1 className="section-title">This page does not exist.</h1><p className="body-copy mt-4">The link may be outdated or the page may have moved.</p><Link className="button-primary mt-7" href="/home">Back home</Link></div></main>;
}