import { useState } from "react";
import { CTA, PageHero } from "../components/Common";
import { portfolios } from "../data/siteData";

export default function PortfolioPage() {
  const categories = ["All", ...new Set(portfolios.map((x) => x.category))];
  const [active, setActive] = useState("All");
  const shown = active === "All" ? portfolios : portfolios.filter((x) => x.category === active);
  return (
    <>
      <PageHero eyebrow="Portfolio" title="Our Portfolio" description="Explore our successful projects across healthcare, government, education, sports, tourism, and research." />
      <section className="container-jmt py-14">
        <div className="mb-10 flex flex-wrap gap-2">{categories.map((c) => <button key={c} onClick={() => setActive(c)} className={`rounded-full px-4 py-2 text-xs font-semibold transition ${active === c ? "bg-orange text-white" : "border bg-white text-slate-500 hover:border-orange"}`}>{c}</button>)}</div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {shown.map(({ title, category, description, icon: Icon, tone }) => <article key={title} className="group overflow-hidden rounded-2xl border bg-white shadow-soft"><div className={`flex h-52 items-center justify-center bg-gradient-to-br ${tone}`}><Icon size={76} className="text-white/90 transition duration-500 group-hover:scale-110" strokeWidth={1.2} /></div><div className="p-6"><span className="text-[10px] font-bold uppercase tracking-wider text-orange">{category}</span><h2 className="mt-2 text-lg font-semibold">{title}</h2><p className="mt-3 text-sm leading-6 text-slate-500">{description}</p></div></article>)}
        </div>
      </section>
      <CTA />
    </>
  );
}
