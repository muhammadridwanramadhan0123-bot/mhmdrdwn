import { ArrowRight, CalendarDays } from "lucide-react";
import { PageHero } from "../components/Common";
import { insights } from "../data/siteData";

export default function InsightPage() {
  return (
    <>
      <PageHero eyebrow="Insight" title="Insight & News" description="Latest updates, news, and insights from the healthcare technology ecosystem." />
      <section className="container-jmt py-14">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...insights, ...insights].map((item, i) => <article key={`${item.title}-${i}`} className="group card overflow-hidden"><div className="flex h-40 items-center justify-center bg-gradient-to-br from-ink to-teal"><span className="text-5xl font-extrabold text-white/15">JMT</span></div><div className="p-6"><div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider"><span className="text-orange">{item.type}</span><span className="flex items-center gap-1 text-slate-400"><CalendarDays size={13} />{item.date}</span></div><h2 className="mt-4 font-semibold leading-6">{item.title}</h2><p className="mt-3 text-xs leading-6 text-slate-500">{item.excerpt}</p><button className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-orange">Read More <ArrowRight size={14} className="transition group-hover:translate-x-1" /></button></div></article>)}
        </div>
      </section>
    </>
  );
}
