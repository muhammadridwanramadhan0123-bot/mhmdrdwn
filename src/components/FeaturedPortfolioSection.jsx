import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  BriefcaseBusiness,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import {
  getPublishedPortfolios,
} from "../services/portfolioService";

import {
  supabase,
} from "../lib/supabase";

import {
  useLanguage,
} from "../contexts/LanguageContext";


function getTranslatedText(
  translatedValue,
  originalValue
) {
  const translated =
    String(
      translatedValue || ""
    ).trim();

  if (translated) {
    return translated;
  }

  return String(
    originalValue || ""
  ).trim();
}


function translateCategory(
  category,
  isEnglish
) {
  const value =
    String(
      category || ""
    ).trim();

  if (!value) {
    return isEnglish
      ? "Portfolio"
      : "Portofolio";
  }

  const normalized =
    value.toLowerCase();

  const map = {
    healthcare: {
      id: "Kesehatan",
      en: "Healthcare",
    },

    kesehatan: {
      id: "Kesehatan",
      en: "Healthcare",
    },

    government: {
      id: "Pemerintahan",
      en: "Government",
    },

    pemerintahan: {
      id: "Pemerintahan",
      en: "Government",
    },

    sports: {
      id: "Olahraga",
      en: "Sports",
    },

    olahraga: {
      id: "Olahraga",
      en: "Sports",
    },

    tourism: {
      id: "Pariwisata",
      en: "Tourism",
    },

    pariwisata: {
      id: "Pariwisata",
      en: "Tourism",
    },

    education: {
      id: "Pendidikan",
      en: "Education",
    },

    pendidikan: {
      id: "Pendidikan",
      en: "Education",
    },

    research: {
      id: "Riset",
      en: "Research",
    },

    riset: {
      id: "Riset",
      en: "Research",
    },
  };

  const match =
    map[normalized];

  if (!match) {
    return value;
  }

  return isEnglish
    ? match.en
    : match.id;
}


export default function FeaturedPortfolioSection() {
  const {
    language,
  } = useLanguage();

  const isEnglish =
    language === "en";


  const [
    portfolios,
    setPortfolios,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");


  const loadPortfolios =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setErrorMessage("");


          /*
           * ==============================================
           * 1. DATA DASAR PORTFOLIO
           * ==============================================
           */

          const baseData =
            await getPublishedPortfolios();


          const basePortfolios =
            Array.isArray(
              baseData
            )
              ? baseData
              : [];


          /*
           * ==============================================
           * 2. BAHASA INDONESIA
           * ==============================================
           */

          if (
            !isEnglish ||
            basePortfolios.length ===
              0
          ) {
            setPortfolios(
              basePortfolios
            );

            return;
          }


          /*
           * ==============================================
           * 3. ENGLISH TRANSLATION
           * ==============================================
           */

          const portfolioIds =
            basePortfolios.map(
              (portfolio) =>
                portfolio.id
            );


          const {
            data:
              translations,
            error:
              translationError,
          } =
            await supabase
              .from(
                "portfolio_translations"
              )
              .select(`
                portfolio_id,
                locale,
                title,
                short_description,
                status
              `)
              .in(
                "portfolio_id",
                portfolioIds
              )
              .eq(
                "locale",
                "en"
              )
              .eq(
                "status",
                "published"
              );


          if (
            translationError
          ) {
            console.warn(
              "Translation portfolio homepage gagal dimuat. Menggunakan fallback Indonesia:",
              translationError
            );

            setPortfolios(
              basePortfolios
            );

            return;
          }


          const translationMap =
            new Map(
              (
                Array.isArray(
                  translations
                )
                  ? translations
                  : []
              ).map(
                (
                  translation
                ) => [
                  translation.portfolio_id,
                  translation,
                ]
              )
            );


          const translatedPortfolios =
            basePortfolios.map(
              (portfolio) => {
                const translation =
                  translationMap.get(
                    portfolio.id
                  );

                return {
                  ...portfolio,

                  title:
                    getTranslatedText(
                      translation?.title,
                      portfolio.title
                    ),

                  short_description:
                    getTranslatedText(
                      translation?.short_description,
                      portfolio.short_description
                    ),

                  translation_locale:
                    translation
                      ? "en"
                      : "id",
                };
              }
            );


          setPortfolios(
            translatedPortfolios
          );
        } catch (error) {
          console.error(
            "Gagal mengambil portfolio homepage:",
            error
          );

          setErrorMessage(
            isEnglish
              ? "Portfolio could not be loaded."
              : "Portofolio gagal dimuat."
          );
        } finally {
          setLoading(false);
        }
      },
      [
        isEnglish,
      ]
    );


  useEffect(() => {
    loadPortfolios();
  }, [loadPortfolios]);


  const selectedPortfolios =
    useMemo(
      () => {
        const featured =
          portfolios.filter(
            (portfolio) =>
              portfolio.is_featured
          );

        const regular =
          portfolios.filter(
            (portfolio) =>
              !portfolio.is_featured
          );

        return [
          ...featured,
          ...regular,
        ].slice(
          0,
          3
        );
      },
      [
        portfolios,
      ]
    );


  return (
    <section className="container-jmt py-16 md:py-20">

      {/* HEADER */}

      <div className="flex flex-wrap items-end justify-between gap-6">

        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange">
            {isEnglish
              ? "Selected Portfolio"
              : "Portofolio Pilihan"}
          </p>


          <h2 className="mt-4 max-w-4xl text-3xl font-bold leading-tight text-navy md:text-4xl lg:text-5xl">
            {isEnglish
              ? "Projects that create real impact"
              : "Proyek yang memberi dampak nyata"}
          </h2>
        </div>


        <Link
          to="/portfolio"
          className="inline-flex items-center gap-2 text-sm font-semibold text-orange transition hover:opacity-70"
        >
          {isEnglish
            ? "View All Projects"
            : "Lihat Semua Proyek"}

          <span
            aria-hidden="true"
          >
            →
          </span>
        </Link>

      </div>


      {/* LOADING */}

      {loading && (
        <div className="mt-10 flex min-h-[320px] items-center justify-center rounded-3xl border bg-slate-50">

          <div className="text-center">

            <LoaderCircle
              size={40}
              className="mx-auto animate-spin text-orange"
            />


            <p className="mt-4 font-semibold text-navy">
              {isEnglish
                ? "Loading portfolio"
                : "Memuat portofolio"}
            </p>


            <p className="mt-2 text-sm text-slate-500">
              {isEnglish
                ? "Data is being loaded from Supabase."
                : "Data sedang diambil dari Supabase."}
            </p>

          </div>

        </div>
      )}


      {/* ERROR */}

      {!loading &&
        errorMessage && (
          <div className="mt-10 rounded-3xl border border-red-200 bg-red-50 px-6 py-12 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <AlertTriangle
                size={26}
              />
            </div>


            <h3 className="mt-5 text-xl font-bold text-navy">
              {isEnglish
                ? "Portfolio could not be loaded"
                : "Portofolio gagal dimuat"}
            </h3>


            <p className="mt-3 text-sm leading-6 text-red-600">
              {errorMessage}
            </p>


            <button
              type="button"
              onClick={
                loadPortfolios
              }
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <RefreshCw
                size={17}
              />

              {isEnglish
                ? "Try Again"
                : "Coba Lagi"}
            </button>

          </div>
        )}


      {/* EMPTY */}

      {!loading &&
        !errorMessage &&
        selectedPortfolios.length ===
          0 && (
          <div className="mt-10 rounded-3xl border bg-slate-50 px-6 py-14 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
              <BriefcaseBusiness
                size={29}
              />
            </div>


            <h3 className="mt-5 text-xl font-bold text-navy">
              {isEnglish
                ? "No portfolio available yet"
                : "Belum ada portofolio"}
            </h3>


            <p className="mt-3 text-sm leading-6 text-slate-500">
              {isEnglish
                ? "There are currently no published portfolio projects available on the homepage."
                : "Belum ada portofolio berstatus published yang dapat ditampilkan di halaman utama."}
            </p>

          </div>
        )}


      {/* CARDS */}

      {!loading &&
        !errorMessage &&
        selectedPortfolios.length >
          0 && (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {selectedPortfolios.map(
              (
                portfolio
              ) => (
                <Link
                  key={
                    portfolio.id
                  }
                  to={`/portfolio/${portfolio.slug}`}
                  className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <article>

                    {portfolio.image_url ? (
                      <div className="overflow-hidden bg-slate-100">
                        <img
                          src={
                            portfolio.image_url
                          }
                          alt={
                            portfolio.title
                          }
                          className="h-64 w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="flex h-64 items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-400">

                        <BriefcaseBusiness
                          size={76}
                          strokeWidth={
                            1.2
                          }
                          className="text-white/90 transition duration-500 group-hover:scale-110"
                        />

                      </div>
                    )}


                    <div className="p-6">

                      <div className="flex flex-wrap items-center justify-between gap-3">

                        <span className="text-[10px] font-bold uppercase tracking-wider text-orange">
                          {translateCategory(
                            portfolio.category,
                            isEnglish
                          )}
                        </span>


                        {portfolio.is_featured && (
                          <span className="rounded-full bg-orange/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-orange">
                            {isEnglish
                              ? "Featured"
                              : "Unggulan"}
                          </span>
                        )}

                      </div>


                      <h3 className="mt-3 text-xl font-semibold text-navy transition group-hover:text-orange">
                        {
                          portfolio.title
                        }
                      </h3>


                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
                        {portfolio.short_description ||
                          (isEnglish
                            ? "A brief description of this project is not available yet."
                            : "Informasi singkat portofolio belum tersedia.")}
                      </p>


                      <div className="mt-6 flex items-center justify-between gap-4">

                        <span className="inline-flex items-center gap-2 text-sm font-semibold text-orange">
                          {isEnglish
                            ? "View Project"
                            : "Lihat Proyek"}

                          <span
                            aria-hidden="true"
                            className="transition-transform group-hover:translate-x-1"
                          >
                            →
                          </span>
                        </span>


                        {portfolio.project_year && (
                          <span className="text-xs text-slate-400">
                            {
                              portfolio.project_year
                            }
                          </span>
                        )}

                      </div>

                    </div>

                  </article>
                </Link>
              )
            )}

          </div>
        )}

    </section>
  );
}