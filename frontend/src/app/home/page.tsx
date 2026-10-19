import Link from "next/link";

const experience = [
  { period: "Jun — Jul 2025", role: "Data Science Intern", company: "APEXIQ.AI", summary: "Built and evaluated a real-estate ROI prediction pipeline, reaching an R² score of 0.81 and shipping an interactive Streamlit interface." },
  { period: "May — Jul 2023", role: "Technical Support Engineer (L1)", company: "HOSTUPCLOUD TECHNOLOGY", summary: "Supported 30+ clients, managed 20+ Windows and Linux VMs at 99% uptime, and maintained a 95% first-contact resolution rate." },
];

const capabilities = [
  { title: "Product engineering", text: "Next.js, React, TypeScript, Node.js, Express, Flask and REST APIs." },
  { title: "Data & machine learning", text: "Python, Pandas, NumPy, scikit-learn, TensorFlow and model evaluation." },
  { title: "Cloud & operations", text: "AWS, Azure, Linux, CI/CD, MongoDB, MySQL and production support." },
];

export default function HomePage() {
  return (
    <main>
      <section className="px-5 pb-24 pt-40 sm:px-8 sm:pb-32 sm:pt-48">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 flex items-center gap-3 text-sm text-[#686864]"><span className="h-2 w-2 rounded-full bg-emerald-600"/>Available for opportunities · Bengaluru, India</div>
          <div className="grid items-end gap-12 lg:grid-cols-[1fr_18rem]">
            <div><p className="eyebrow">Full-stack & ML engineer</p><h1 className="max-w-4xl text-[clamp(3.25rem,8vw,7.5rem)] font-semibold leading-[.94] tracking-[-.065em]">I build useful software with data and AI.</h1></div>
            <div className="pb-2"><p className="body-copy !text-base">I turn complex ideas into reliable web products, machine-learning tools, and clear user experiences.</p><div className="mt-7 flex flex-wrap gap-3"><Link href="/projects" className="button-primary">View selected work</Link><Link href="/contact" className="button-secondary">Contact me</Link></div></div>
          </div>
        </div>
      </section>
      <section className="border-y border-[#dfdfd9] bg-white px-5 py-10 sm:px-8"><div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 md:grid-cols-4">{[["0.81","Model R²"],["99%","VM uptime"],["40+","Tickets weekly"],["6+","Certifications"]].map(([value,label]) => <div key={label}><p className="text-3xl font-semibold tracking-[-.04em] sm:text-4xl">{value}</p><p className="mt-2 text-sm text-[#686864]">{label}</p></div>)}</div></section>
      <section className="px-5 py-24 sm:px-8 sm:py-32"><div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[.75fr_1.25fr]"><div><p className="eyebrow">About</p><h2 className="section-title">Engineering discipline, informed by data.</h2></div><div className="space-y-6"><p className="body-copy">I&apos;m a full-stack developer and Data Science postgraduate student at Kristu Jayanti College. My work connects intelligent systems with production-ready applications.</p><p className="body-copy">I enjoy owning the full path from data exploration and model evaluation to API design, frontend implementation, deployment, and support.</p><div className="flex flex-wrap gap-2 pt-2">{["Python","TypeScript","Next.js","Node.js","MongoDB","scikit-learn","AWS","Flask"].map((skill)=><span className="tag" key={skill}>{skill}</span>)}</div></div></div></section>
      <section className="border-y border-[#dfdfd9] bg-white px-5 py-24 sm:px-8 sm:py-32"><div className="mx-auto max-w-6xl"><p className="eyebrow">Experience</p><div className="mt-10 divide-y divide-[#dfdfd9] border-y border-[#dfdfd9]">{experience.map((item)=><article key={item.role} className="grid gap-4 py-8 md:grid-cols-[10rem_1fr_1.25fr] md:gap-8"><p className="text-sm text-[#686864]">{item.period}</p><div><h3 className="font-semibold">{item.role}</h3><p className="mt-1 text-sm text-[#2557d6]">{item.company}</p></div><p className="leading-7 text-[#686864]">{item.summary}</p></article>)}</div></div></section>
      <section className="px-5 py-24 sm:px-8 sm:py-32"><div className="mx-auto max-w-6xl"><div className="max-w-2xl"><p className="eyebrow">Capabilities</p><h2 className="section-title">A practical toolkit for shipping complete products.</h2></div><div className="mt-12 grid gap-5 md:grid-cols-3">{capabilities.map((item,index)=><article key={item.title} className="card p-7"><p className="mb-12 text-sm text-[#9a9a93]">0{index+1}</p><h3 className="text-lg font-semibold">{item.title}</h3><p className="mt-3 leading-7 text-[#686864]">{item.text}</p></article>)}</div></div></section>
      <section className="border-y border-[#dfdfd9] bg-white px-5 py-24 sm:px-8"><div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2"><div><p className="eyebrow">Education</p><h2 className="section-title">Continuous learning, grounded in practice.</h2></div><div className="space-y-8"><div><p className="text-sm text-[#2557d6]">2024 — 2026 · Current</p><h3 className="mt-2 text-xl font-semibold">M.Sc. Data Science</h3><p className="mt-1 text-[#686864]">Kristu Jayanti College, Bengaluru</p></div><div className="border-t border-[#dfdfd9] pt-8"><p className="text-sm text-[#686864]">2021 — 2024</p><h3 className="mt-2 text-xl font-semibold">Bachelor of Computer Applications</h3><p className="mt-1 text-[#686864]">Kristu Jayanti College · CGPA 7.74</p></div></div></div></section>
      <section className="px-5 py-28 sm:px-8 sm:py-36"><div className="mx-auto max-w-4xl text-center"><p className="eyebrow">Have a project in mind?</p><h2 className="text-4xl font-semibold tracking-[-.045em] sm:text-6xl">Let&apos;s build something clear, useful, and dependable.</h2><div className="mt-9 flex flex-wrap justify-center gap-3"><Link href="/contact" className="button-primary">Start a conversation</Link><a href="https://github.com/2003HEMANTH" target="_blank" rel="noopener noreferrer" className="button-secondary">View GitHub</a></div></div></section>
      <footer className="border-t border-[#dfdfd9] px-5 py-8 text-sm text-[#686864] sm:px-8"><div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} Hemanth L.</p><div className="flex gap-5"><a href="https://github.com/2003HEMANTH" target="_blank" rel="noopener noreferrer">GitHub</a><a href="https://linkedin.com/in/hemanth-l-/" target="_blank" rel="noopener noreferrer">LinkedIn</a><a href="mailto:hemanth9886609@gmail.com">Email</a></div></div></footer>
    </main>
  );
}