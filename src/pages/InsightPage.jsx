import {
  useCallback,
  useEffect,
  useMemo,
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

import { Link } from "react-router-dom";

import { PageHero } from "../components/Common";

import {
  getPublishedInsights,
} from "../services/insightService";

import {
  useLanguage,
} from "../contexts/LanguageContext";

/*
 * ======================================================
 * INSIGHT TYPES
 * ======================================================
 *
 * Value tetap structural:
 *
 * all
 * news
 * article
 *
 * Label ditampilkan melalui uiTranslations.
 */

const INSIGHT_TYPES = [
  "all",
  "news",
  "article",
];

/*
 * ======================================================
 * HELPERS
 * ======================================================
 */

function normalizeInsightType(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

/*
 * Backend existing masih mempunyai:
 *
 * - category
 * - type
 *
 * Dan form admin existing menyimpan category.
 *
 * Supaya tidak merusak data lama:
 *
 * 1. Jika category = news/article → gunakan category
 * 2. Jika tidak → gunakan type
 */
function resolveInsightType(insight) {
  const category =
    normalizeInsightType(
      insight?.category
    );

  if (
    category === "news" ||
    category === "article"
  ) {
    return category;
  }

  const type =
    normalizeInsightType(
      insight?.type
    );

  if (
    type === "news" ||
    type === "article"
  ) {
    return type;
  }

  return (
    type ||
    category ||
    ""
  );
}

function getInsightTypeLabel(
  insight,
  t
) {
  const type =
    resolveInsightType(
      insight
    );

  if (type === "news") {
    return t(
      "insightTypes.news",
      "News"
    );
  }

  if (type === "article") {
    return t(
      "insightTypes.article",
      "Article"
    );
  }

  /*
   * Jika ternyata category berisi
   * kategori editorial lain seperti
   * Healthcare, pertahankan nilainya.
   */
  return (
    insight?.category ||
    t(
      "insightTypes.default",
      "Insight"
    )
  );
}

function formatDate(
  value,
  language,
  fallback
) {
  if (!value) {
    return fallback;
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return fallback;
  }

  const locale =
    language === "en"
      ? "en-US"
      : "id-ID";

  return new Intl.DateTimeFormat(
    locale,
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  ).format(date);
}

/*
 * ======================================================
 * PAGE
 * ======================================================
 */

export default function InsightPage() {
  const {
    language,
    t,
  } = useLanguage();

  const [
    insights,
    setInsights,
  ] = useState([]);

  const [
    activeType,
    setActiveType,
  ] = useState("all");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  /*
   * ====================================================
   * LOAD DATA
   * ====================================================
   */

  const loadInsights =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setErrorMessage("");

          const data =
            await getPublishedInsights(
              language
            );

          setInsights(
            Array.isArray(data)
              ? data
              : []
          );
        } catch (error) {
          console.error(
            "Gagal mengambil Insight publik:",
            error
          );

          setInsights([]);

          /*
           * Jangan tampilkan error
           * Supabase berbahasa Indonesia
           * langsung ke user EN.
           */
          setErrorMessage(
            "LOAD_ERROR"
          );
        } finally {
          setLoading(false);
        }
      },
      [
        language,
      ]
    );

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  /*
   * ====================================================
   * SEO
   * ====================================================
   */

  useEffect(() => {
    const previousTitle =
      document.title;

    let descriptionMeta =
      document.querySelector(
        'meta[name="description"]'
      );

    const metaWasCreated =
      !descriptionMeta;

    if (!descriptionMeta) {
      descriptionMeta =
        document.createElement(
          "meta"
        );

      descriptionMeta.setAttribute(
        "name",
        "description"
      );

      document.head.appendChild(
        descriptionMeta
      );
    }

    const previousDescription =
      descriptionMeta.getAttribute(
        "content"
      );

    document.title =
      t(
        "insightPage.seoTitle",
        "Insight | Jasa Medika Transmedic"
      );

    descriptionMeta.setAttribute(
      "content",
      t(
        "insightPage.description",
        ""
      )
    );

    return () => {
      document.title =
        previousTitle;

      if (metaWasCreated) {
        descriptionMeta?.remove();
        return;
      }

      if (
        previousDescription !==
        null
      ) {
        descriptionMeta?.setAttribute(
          "content",
          previousDescription
        );
      } else {
        descriptionMeta?.removeAttribute(
          "content"
        );
      }
    };
  }, [
    language,
    t,
  ]);

  /*
   * ====================================================
   * FILTER
   * ====================================================
   */

  const filteredInsights =
    useMemo(() => {
      if (
        activeType === "all"
      ) {
        return insights;
      }

      return insights.filter(
        (insight) =>
          resolveInsightType(
            insight
          ) === activeType
      );
    }, [
      activeType,
      insights,
    ]);

  /*
   * ====================================================
   * RENDER
   * ====================================================
   */

  return (
    <>
      {/* =================================================
          HERO
      ================================================= */}

      <PageHero
        eyebrow={t(
          "insightPage.eyebrow",
          "Insight"
        )}
        title={t(
          "insightPage.title",
          "Insight"
        )}
        description={t(
          "insightPage.description",
          ""
        )}
      />

      <section className="container-jmt py-14 md:py-20">

        {/* ===============================================
            FILTER
        =============================================== */}

        {!loading && (
          <div className="mb-10 flex flex-wrap gap-3">
            {INSIGHT_TYPES.map(
              (type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() =>
                    setActiveType(
                      type
                    )
                  }
                  className={`rounded-full px-5 py-2.5 text-xs font-semibold transition ${
                    activeType === type
                      ? "bg-orange text-white"
                      : "border border-slate-200 bg-white text-slate-500 hover:border-orange hover:text-orange"
                  }`}
                >
                  {t(
                    `insightTypes.${type}`,
                    type
                  )}
                </button>
              )
            )}
          </div>
        )}

        {/* ===============================================
            LOADING
        =============================================== */}

        {loading && (
          <div className="flex min-h-[420px] items-center justify-center">
            <div className="text-center">
              <LoaderCircle
                size={44}
                className="mx-auto animate-spin text-orange"
              />

              <h2 className="mt-5 text-xl font-bold text-navy">
                {t(
                  "insightPage.loadingTitle",
                  "Memuat Insight"
                )}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {t(
                  "insightPage.loadingDescription",
                  ""
                )}
              </p>
            </div>
          </div>
        )}

        {/* ===============================================
            ERROR
        =============================================== */}

        {!loading &&
          errorMessage && (
            <div className="mx-auto max-w-xl rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                <AlertTriangle
                  size={28}
                />
              </div>

              <h2 className="mt-5 text-xl font-bold text-navy">
                {t(
                  "insightPage.errorTitle",
                  "Insight gagal dimuat"
                )}
              </h2>

              <p className="mt-3 text-sm leading-7 text-red-600">
                {t(
                  "insightPage.errorDescription",
                  ""
                )}
              </p>

              <button
                type="button"
                onClick={
                  loadInsights
                }
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                <RefreshCw
                  size={17}
                />

                {t(
                  "insightPage.retry",
                  "Coba Lagi"
                )}
              </button>
            </div>
          )}

        {/* ===============================================
            EMPTY DATABASE
        =============================================== */}

        {!loading &&
          !errorMessage &&
          insights.length === 0 && (
            <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-slate-50 p-10 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
                <Newspaper
                  size={29}
                />
              </div>

              <h2 className="mt-5 text-xl font-bold text-navy">
                {t(
                  "insightPage.emptyTitle",
                  "Belum ada Insight"
                )}
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-500">
                {t(
                  "insightPage.emptyDescription",
                  ""
                )}
              </p>
            </div>
          )}

        {/* ===============================================
            INSIGHT LIST
        =============================================== */}

        {!loading &&
          !errorMessage &&
          filteredInsights.length >
            0 && (
            <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
              {filteredInsights.map(
                (insight) => {
                  const coverImageUrl =
                    insight.cover_image_url ||
                    insight.image_url ||
                    "";

                  const typeLabel =
                    getInsightTypeLabel(
                      insight,
                      t
                    );

                  const publishedDate =
                    formatDate(
                      insight.published_at,
                      language,
                      t(
                        "insightPage.dateUnavailable",
                        "Tanggal belum tersedia"
                      )
                    );

                  return (
                    <Link
                      key={
                        insight.id
                      }
                      to={`/insight/${insight.slug}`}
                      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                    >
                      <article className="h-full">

                        {/* COVER */}

                        {coverImageUrl ? (
                          <div className="overflow-hidden bg-slate-100">
                            <img
                              src={
                                coverImageUrl
                              }
                              alt={
                                insight.title
                              }
                              loading="lazy"
                              className="aspect-video w-full object-cover transition duration-500 group-hover:scale-105"
                            />
                          </div>
                        ) : (
                          <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-ink to-teal">
                            <span className="text-5xl font-extrabold text-white/15">
                              JMT
                            </span>
                          </div>
                        )}

                        <div className="p-6">
                          <div className="flex flex-wrap items-center justify-between gap-3">

                            {/* TYPE */}

                            <span className="text-[10px] font-bold uppercase tracking-wider text-orange">
                              {
                                typeLabel
                              }
                            </span>

                            {/* FEATURED */}

                            {insight.is_featured && (
                              <span className="rounded-full bg-orange/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-orange">
                                {t(
                                  "insightPage.featured",
                                  "Featured"
                                )}
                              </span>
                            )}
                          </div>

                          {/* DATE */}

                          <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                            <CalendarDays
                              size={14}
                            />

                            {
                              publishedDate
                            }
                          </div>

                          {/* TITLE */}

                          <h2 className="mt-4 text-xl font-semibold leading-7 text-navy transition group-hover:text-orange">
                            {
                              insight.title
                            }
                          </h2>

                          {/* EXCERPT */}

                          <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-500">
                            {insight.excerpt ||
                              t(
                                "insightPage.excerptFallback",
                                ""
                              )}
                          </p>

                          <div className="mt-6 flex items-center justify-between gap-4">

                            {/* READ MORE */}

                            <span className="inline-flex items-center gap-2 text-sm font-semibold text-orange">
                              {t(
                                "insightPage.readMore",
                                "Read More"
                              )}

                              <ArrowRight
                                size={16}
                                className="transition group-hover:translate-x-1"
                              />
                            </span>

                            {/* AUTHOR */}

                            {(insight.author_name ||
                              insight.author) && (
                              <span className="max-w-[130px] truncate text-xs text-slate-400">
                                {insight.author_name ||
                                  insight.author}
                              </span>
                            )}
                          </div>
                        </div>
                      </article>
                    </Link>
                  );
                }
              )}
            </div>
          )}

        {/* ===============================================
            EMPTY FILTER
        =============================================== */}

        {!loading &&
          !errorMessage &&
          insights.length > 0 &&
          filteredInsights.length ===
            0 && (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-14 text-center">
              <Newspaper
                size={34}
                className="mx-auto text-slate-400"
              />

              <h2 className="mt-4 text-lg font-bold text-navy">
                {t(
                  "insightPage.emptyTypePrefix",
                  "Belum ada"
                )}{" "}
                {t(
                  `insightTypes.${activeType}`,
                  activeType
                )}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {t(
                  "insightPage.emptyTypeDescription",
                  ""
                )}
              </p>

              <button
                type="button"
                onClick={() =>
                  setActiveType(
                    "all"
                  )
                }
                className="mt-5 text-sm font-semibold text-orange"
              >
                {t(
                  "insightPage.showAll",
                  "Lihat semua Insight"
                )}
              </button>
            </div>
          )}
      </section>
    </>
  );
}