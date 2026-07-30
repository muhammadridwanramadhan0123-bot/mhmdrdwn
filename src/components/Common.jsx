import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight } from "lucide-react";

export function PageHero({ eyebrow, title, description }) {
  return (
    <section className="hero-grid border-b bg-mist py-14 md:py-20">
      <div className="container-jmt">
        <p className="mb-4 flex items-center gap-2 text-xs font-semibold text-slate-500"><Link to="/" className="hover:text-orange">Home</Link><ChevronRight size={14} />{eyebrow}</p>
        <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-ink md:text-5xl">{title}</h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">{description}</p>
      </div>
    </section>
  );
}

export function SectionHeading({ kicker, title, description, center = false }) {
  return (
    <div className={center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {kicker && <p className="section-kicker">{kicker}</p>}
      <h2 className="section-title">{title}</h2>
      {description && <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base">{description}</p>}
    </div>
  );
}

export function CTA() {
  return (
    <section className="container-jmt py-16">
      <div className="overflow-hidden rounded-3xl bg-ink px-6 py-12 text-center text-white md:px-14">
        <p className="section-kicker">Let’s Collaborate</p>
        <h2 className="text-3xl font-bold md:text-4xl">Siap mempercepat transformasi layanan kesehatan Anda?</h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300">Diskusikan kebutuhan fasilitas kesehatan Anda bersama tim Jasa Medika Transmedic.</p>
        <Link to="/contact" className="btn-primary mt-7">Konsultasi Sekarang <ArrowRight size={17} /></Link>
      </div>
    </section>
  );
}
