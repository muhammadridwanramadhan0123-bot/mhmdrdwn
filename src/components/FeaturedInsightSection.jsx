import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  LoaderCircle,
  Newspaper,
  RefreshCw,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import {
  getFeaturedInsights,
} from "../services/insightService";

import {
  useLanguage,
} from "../contexts/LanguageContext";


function formatDate(
  value,
  language
) {
  const isEnglish =
    language === "en";

  if (!value) {
    return isEnglish
      ? "Date unavailable"
      : "Tanggal belum tersedia";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return isEnglish
      ? "Date unavailable"
      : "Tanggal belum tersedia";
  }

  return new Intl.DateTimeFormat(
    isEnglish
      ? "en-US"
      : "id-ID",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  ).format(date);
}


function translateInsightCategory(
  category,
  isEnglish
) {
  const normalized =
    String(
      category || ""
    )
      .trim()
      .toLowerCase();

  if (
    normalized === "news" ||
    normalized === "berita"
  ) {
    return isEnglish
      ? "News"
      : "Berita";
  }

  if (
    normalized === "article" ||
    normalized === "artikel"
  ) {
    return isEnglish
      ? "Article"
      : "Artikel";
  }

  return "Insight";
}


export default function FeaturedInsightSection() {
  const {
    language,
  } = useLanguage();

  const isEnglish =
    language === "en";


  const [
    insights,
    setInsights,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");


  /*
   * ==================================================
   * LOAD FEATURED INSIGHTS
   * ==================================================
   *
   * language:
   *
   * id
   * → mengambil data utama dari insights
   *
   * en
   * → mengambil translation dari
   *   insight_translations
   *
   * Jika translation EN belum tersedia,
   * insightService otomatis fallback ke ID.
   */

  const loadFeaturedInsights =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setErrorMessage("");

          const data =
            await getFeaturedInsights(
              3,
              language
            );

          setInsights(
            Array.isArray(data)
              ? data
              : []
          );
        } catch (error) {
          console.error(
            "Gagal mengambil Featured Insight:",
            error
          );

          setErrorMessage(
            isEnglish
              ? "Featured Insights could not be loaded."
              : "Featured Insight gagal dimuat."
          );
        } finally {
          setLoading(false);
        }
      },
      [
        language,
        isEnglish,
      ]
    );


  useEffect(() => {
    loadFeaturedInsights();
  }, [loadFeaturedInsights]);


  return (
    <section className="bg-cream py-20">
      <div className="container-jmt">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange">
              {isEnglish
                ? "Insights & News"
                : "Insight & Berita"}
            </p>


            <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-tight text-navy md:text-4xl">
              {isEnglish
                ? "Latest Updates from JMT Group"
                : "Update Terbaru dari JMT Group"}
            </h2>


            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500">
              {isEnglish
                ? "Selected information, news, and insights on technology and the healthcare services ecosystem."
                : "Informasi, berita, dan wawasan pilihan mengenai teknologi serta ekosistem pelayanan kesehatan."}
            </p>
          </div>


          <Link
            to="/insight"
            className="inline-flex items-center gap-2 text-sm font-semibold text-orange transition hover:opacity-70"
          >
            {isEnglish
              ? "View All Insights"
              : "Lihat Semua Insight"}

            <ArrowRight
              size={16}
            />
          </Link>

        </div>


        {/* ==================================================
            LOADING
        ================================================== */}

        {loading && (
          <div className="mt-10 flex min-h-[300px] items-center justify-center rounded-3xl border border-slate-200 bg-white">

            <div className="text-center">

              <LoaderCircle
                size={42}
                className="mx-auto animate-spin text-orange"
              />


              <p className="mt-4 font-semibold text-navy">
                {isEnglish
                  ? "Loading Featured Insights"
                  : "Memuat Featured Insight"}
              </p>


              <p className="mt-2 text-sm text-slate-500">
                {isEnglish
                  ? "Data is being loaded from Supabase."
                  : "Data sedang diambil dari Supabase."}
              </p>

            </div>

          </div>
        )}


        {/* ==================================================
            ERROR
        ================================================== */}

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
                  ? "Featured Insights could not be loaded"
                  : "Featured Insight gagal dimuat"}
              </h3>


              <p className="mt-3 text-sm leading-7 text-red-600">
                {errorMessage}
              </p>


              <button
                type="button"
                onClick={
                  loadFeaturedInsights
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


        {/* ==================================================
            EMPTY
        ================================================== */}

        {!loading &&
          !errorMessage &&
          insights.length === 0 && (
            <div className="mt-10 rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Newspaper
                  size={29}
                />
              </div>


              <h3 className="mt-5 text-xl font-bold text-navy">
                {isEnglish
                  ? "No Featured Insights Yet"
                  : "Belum Ada Featured Insight"}
              </h3>


              <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-slate-500">
                {isEnglish
                  ? "Select a published Insight and enable the Featured option through the admin dashboard."
                  : "Pilih artikel berstatus Published, kemudian aktifkan opsi Featured Insight melalui dashboard admin."}
              </p>


              <Link
                to="/insight"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-orange"
              >
                {isEnglish
                  ? "View All Insights"
                  : "Lihat Semua Insight"}

                <ArrowRight
                  size={16}
                />
              </Link>

            </div>
          )}


        {/* ==================================================
            FEATURED INSIGHT CARDS
        ================================================== */}

        {!loading &&
          !errorMessage &&
          insights.length > 0 && (
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

              {insights.map(
                (insight) => (
                  <Link
                    key={
                      insight.id
                    }
                    to={`/insight/${insight.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >

                    {/* COVER */}

                    {insight.cover_image_url ? (
                      <div className="overflow-hidden bg-slate-100">

                        <img
                          src={
                            insight.cover_image_url
                          }
                          alt={
                            insight.title
                          }
                          loading="lazy"
                          className="aspect-video w-full object-cover transition duration-500 group-hover:scale-105"
                        />

                      </div>
                    ) : (
                      <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-[#082B3A] to-cyan-700">

                        <Newspaper
                          size={58}
                          strokeWidth={
                            1.2
                          }
                          className="text-white/80"
                        />

                      </div>
                    )}


                    {/* CONTENT */}

                    <article className="flex flex-1 flex-col p-6">

                      {/* CATEGORY + FEATURED */}

                      <div className="flex flex-wrap items-center justify-between gap-3">

                        <span className="rounded-full bg-orange/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-orange">
                          {translateInsightCategory(
                            insight.category ||
                              insight.type,
                            isEnglish
                          )}
                        </span>


                        <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                          {isEnglish
                            ? "Featured"
                            : "Unggulan"}
                        </span>

                      </div>


                      {/* DATE */}

                      <div className="mt-5 flex items-center gap-2 text-xs text-slate-400">

                        <CalendarDays
                          size={14}
                        />


                        <span>
                          {formatDate(
                            insight.published_at,
                            language
                          )}
                        </span>

                      </div>


                      {/* TITLE */}

                      <h3 className="mt-4 text-xl font-semibold leading-7 text-navy transition group-hover:text-orange">
                        {
                          insight.title
                        }
                      </h3>


                      {/* EXCERPT */}

                      <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-500">
                        {insight.excerpt ||
                          (isEnglish
                            ? "An article summary is not available yet."
                            : "Ringkasan artikel belum tersedia.")}
                      </p>


                      {/* FOOTER */}

                      <div className="mt-auto flex items-center justify-between gap-4 pt-6">

                        <span className="inline-flex items-center gap-2 text-sm font-semibold text-orange">
                          {isEnglish
                            ? "Read More"
                            : "Baca Selengkapnya"}

                          <ArrowRight
                            size={16}
                            className="transition group-hover:translate-x-1"
                          />
                        </span>


                        {insight.author_name && (
                          <span className="max-w-[130px] truncate text-xs text-slate-400">
                            {
                              insight.author_name
                            }
                          </span>
                        )}

                      </div>

                    </article>

                  </Link>
                )
              )}

            </div>
          )}

      </div>
    </section>
  );
}