import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  HeartPulse,
  Hospital,
} from "lucide-react";

import { CTA, SectionHeading } from "../components/Common";
import FeaturedPortfolioSection from "../components/FeaturedPortfolioSection";
import FeaturedInsightSection from "../components/FeaturedInsightSection";
import FeaturedServiceSection from "../components/FeaturedServiceSection";

import {
  stats,
  serviceCategories,
} from "../data/siteData";

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="hero-grid overflow-hidden bg-gradient-to-br from-white via-white to-cream">
        <div className="container-jmt grid min-h-[650px] items-center gap-12 py-16 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <span className="inline-flex rounded-full bg-cream px-4 py-2 text-xs font-semibold text-orange">
              Indonesia’s Leading Healthcare Technology
            </span>

            <h1 className="mt-6 text-4xl font-extrabold leading-[1.13] tracking-tight text-ink sm:text-5xl lg:text-[58px]">
              Integrated Healthcare Solutions{" "}
              <span className="text-orange">
                for Better Healthcare Services
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
              Empowering healthcare providers through integrated digital
              solutions, professional consulting, IT infrastructure, and
              workforce development.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/services" className="btn-primary">
                Explore Our Solutions
                <ArrowRight size={17} />
              </Link>

              <Link to="/contact" className="btn-secondary">
                Contact Us
              </Link>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-slate-600">
              {["Integrated", "Secure", "Scalable"].map((item) => (
                <span
                  key={item}
                  className="flex items-center gap-2"
                >
                  <CheckCircle2
                    size={16}
                    className="text-orange"
                  />

                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -left-4 top-16 h-24 w-24 rounded-3xl bg-orange/10" />

            <div className="absolute -right-4 bottom-10 h-32 w-32 rounded-full bg-teal/10" />

            <div className="relative rounded-[2rem] bg-gradient-to-br from-ink to-teal p-8 text-white shadow-2xl">
              <div className="grid min-h-[370px] content-between">
                <div className="flex items-start justify-between">
                  <div className="rounded-2xl bg-white/10 p-4">
                    <Hospital size={46} />
                  </div>

                  <span className="rounded-full bg-orange px-3 py-1 text-xs font-semibold">
                    Healthcare 4.0
                  </span>
                </div>

                <div>
                  <HeartPulse
                    size={84}
                    className="mb-8 text-orange"
                    strokeWidth={1.25}
                  />

                  <h2 className="text-3xl font-bold">
                    Technology that connects every point of care.
                  </h2>

                  <p className="mt-4 text-sm leading-7 text-cyan-50/75">
                    One ecosystem for clinical services, operations,
                    infrastructure, and people.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATISTIK */}
      <section className="border-y bg-white">
        <div className="container-jmt grid grid-cols-2 lg:grid-cols-4">
          {stats.map(([value, label]) => (
            <div
              key={label}
              className="border-slate-200 px-4 py-9 text-center even:border-l lg:border-l"
            >
              <p className="text-3xl font-bold text-orange">
                {value}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CORE SERVICES */}
      <section className="container-jmt py-20">
        <SectionHeading
          kicker="Our Core Services"
          title="Solusi menyeluruh untuk ekosistem kesehatan"
          description="Dari sistem informasi hingga pengembangan talenta, seluruh solusi dirancang untuk mempercepat transformasi operasional Anda."
          center
        />

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {serviceCategories.map(
            ({
              id,
              name,
              short,
              icon: Icon,
            }) => (
              <Link
                to={`/services#${id}`}
                key={id}
                className="group card p-7 transition hover:-translate-y-1 hover:border-orange/40"
              >
                <div className="mb-5 inline-flex rounded-xl bg-cream p-3 text-orange">
                  <Icon size={28} />
                </div>

                <h3 className="font-semibold">
                  {name}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {short}
                </p>

                <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-orange">
                  Learn More

                  <ArrowRight
                    size={14}
                    className="transition group-hover:translate-x-1"
                  />
                </span>
              </Link>
            )
          )}
        </div>
      </section>

      {/* FEATURED SERVICES */}
      <FeaturedServiceSection />

      {/* PORTFOLIO DARI SUPABASE */}
      <FeaturedPortfolioSection />

      {/* INSIGHT */}
      <FeaturedInsightSection />

      <CTA />
    </>
  );
}