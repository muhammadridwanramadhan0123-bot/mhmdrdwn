import { Link } from "react-router-dom";

import {
  ArrowRight,
  CheckCircle2,
  MapPin,
} from "lucide-react";

import {
  CTA,
} from "../components/Common";

import FeaturedPortfolioSection from "../components/FeaturedPortfolioSection";
import FeaturedInsightSection from "../components/FeaturedInsightSection";
import FeaturedServiceSection from "../components/FeaturedServiceSection";

import gedungJmt from "../assets/images/gedung.webp";

import {
  stats,
} from "../data/siteData";

import {
  useLanguage,
} from "../contexts/LanguageContext";


export default function HomePage() {
  const {
    language,
  } = useLanguage();

  const isEnglish =
    language === "en";


  const heroBenefits =
    isEnglish
      ? [
          "Integrated",
          "Secure",
          "Scalable",
        ]
      : [
          "Terintegrasi",
          "Aman",
          "Skalabel",
        ];


  return (
    <>
      {/* ==================================================
          HERO
      ================================================== */}

      <section className="hero-grid overflow-hidden bg-gradient-to-br from-white via-white to-cream">
        <div className="container-jmt grid min-h-[650px] items-center gap-12 py-16 lg:grid-cols-[1.05fr_.95fr]">

          {/* KONTEN KIRI */}

          <div>
            <span className="inline-flex rounded-full bg-cream px-4 py-2 text-xs font-semibold text-orange">
              {isEnglish
                ? "Indonesia’s Leading Healthcare Technology"
                : "Teknologi Kesehatan Terdepan di Indonesia"}
            </span>


            <h1 className="mt-6 text-4xl font-extrabold leading-[1.13] tracking-tight text-ink sm:text-5xl lg:text-[58px]">
              {isEnglish ? (
                <>
                  Integrated Healthcare Solutions{" "}
                  <span className="text-orange">
                    for Better Healthcare Services
                  </span>
                </>
              ) : (
                <>
                  Solusi Kesehatan Terintegrasi{" "}
                  <span className="text-orange">
                    untuk Pelayanan Kesehatan yang Lebih Baik
                  </span>
                </>
              )}
            </h1>


            <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
              {isEnglish
                ? "Empowering healthcare providers through integrated digital solutions, professional consulting, IT infrastructure, and workforce development."
                : "Mendukung fasilitas kesehatan melalui solusi digital terintegrasi, konsultasi profesional, infrastruktur IT, dan pengembangan sumber daya manusia."}
            </p>


            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/services"
                className="btn-primary"
              >
                {isEnglish
                  ? "Explore Our Solutions"
                  : "Jelajahi Solusi Kami"}

                <ArrowRight
                  size={17}
                />
              </Link>


              <Link
                to="/contact"
                className="btn-secondary"
              >
                {isEnglish
                  ? "Contact Us"
                  : "Hubungi Kami"}
              </Link>
            </div>


            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-slate-600">
              {heroBenefits.map(
                (item) => (
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
                )
              )}
            </div>
          </div>


          {/* ==================================================
              FOTO GEDUNG
          ================================================== */}

          <div className="relative mx-auto w-full max-w-xl">

            <div className="absolute -left-4 top-16 h-24 w-24 rounded-3xl bg-orange/10" />

            <div className="absolute -right-4 bottom-10 h-32 w-32 rounded-full bg-teal/10" />


            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl">

              <img
                src={gedungJmt}
                alt={
                  isEnglish
                    ? "Jasa Medika Transmedic company building"
                    : "Gedung perusahaan Jasa Medika Transmedic"
                }
                className="h-[370px] w-full object-cover sm:h-[420px]"
              />


              <div className="absolute inset-0 bg-gradient-to-t from-[#082B3A]/90 via-[#082B3A]/20 to-transparent" />


              <div className="absolute left-5 top-5 rounded-full border border-white/20 bg-[#082B3A]/70 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md">
                {isEnglish
                  ? "JMT Group Headquarters"
                  : "Kantor Pusat JMT Group"}
              </div>


              <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">

                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-orange">
                  <MapPin
                    size={16}
                  />

                  Bandung, Indonesia
                </div>


                <h2 className="mt-3 max-w-md text-2xl font-bold leading-tight sm:text-3xl">
                  Jasa Medika Transmedic Group
                </h2>


                <p className="mt-3 max-w-lg text-sm leading-6 text-white/75">
                  {isEnglish
                    ? "Building an integrated healthcare ecosystem through technology, infrastructure, consulting, and professional services."
                    : "Membangun ekosistem layanan kesehatan terintegrasi melalui teknologi, infrastruktur, konsultasi, dan layanan profesional."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ==================================================
          STATISTIK
      ================================================== */}

      <section className="border-y bg-white">
  <div className="container-jmt grid grid-cols-2 lg:grid-cols-4">

    {stats.map(
      (stat) => (
        <div
          key={stat.value}
          className="border-slate-200 px-4 py-9 text-center even:border-l lg:border-l"
        >
          <p className="text-3xl font-bold text-orange">
            {stat.value}
          </p>

          <p className="mt-2 text-xs text-slate-500">
            {
              stat.label[
                isEnglish
                  ? "en"
                  : "id"
              ]
            }
          </p>
        </div>
      )
    )}

  </div>
</section>


      {/* ==================================================
          PRODUCTS & SERVICES
      ================================================== */}

      <FeaturedServiceSection />


      {/* ==================================================
          PORTFOLIO
      ================================================== */}

      <FeaturedPortfolioSection />


      {/* ==================================================
          INSIGHT
      ================================================== */}

      <FeaturedInsightSection />


      {/* ==================================================
          CTA
      ================================================== */}

      <CTA />
    </>
  );
}