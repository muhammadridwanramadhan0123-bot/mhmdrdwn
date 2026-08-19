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

import { Link } from "react-router-dom";

import {
  CTA,
  PageHero,
} from "../components/Common";

import {
  getPublishedPortfolios,
} from "../services/portfolioService";

import {
  useLanguage,
} from "../contexts/LanguageContext";

const ALL_CATEGORY = "All";

/*
 * ======================================================
 * CATEGORY LABEL
 * ======================================================
 *
 * Nilai database tetap:
 *
 * Healthcare
 * Government
 * Sports
 * Tourism
 *
 * Yang diterjemahkan hanya label
 * yang terlihat di frontend.
 */

function getPortfolioCategoryLabel(
  category,
  t
) {
  const normalizedCategory =
    String(category || "")
      .trim()
      .toLowerCase();

  const categoryKeyMap = {
    healthcare:
      "portfolioCategories.healthcare",

    government:
      "portfolioCategories.government",

    sports:
      "portfolioCategories.sports",

    tourism:
      "portfolioCategories.tourism",

    education:
      "portfolioCategories.education",

    research:
      "portfolioCategories.research",
  };

  const translationKey =
    categoryKeyMap[
      normalizedCategory
    ];

  if (!translationKey) {
    return (
      category ||
      t(
        "portfolioCategories.default"
      )
    );
  }

  return t(
    translationKey,
    category
  );
}

/*
 * ======================================================
 * PAGE
 * ======================================================
 */

export default function PortfolioPage() {
  const {
    language,
    t,
  } = useLanguage();

  const [
    portfolios,
    setPortfolios,
  ] = useState([]);

  const [
    activeCategory,
    setActiveCategory,
  ] = useState(
    ALL_CATEGORY
  );

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
   * LOAD PORTFOLIO
   * ====================================================
   *
   * ID:
   * getPublishedPortfolios("id")
   *
   * EN:
   * getPublishedPortfolios("en")
   *
   * Slug, category, client, image,
   * tahun, dan field struktural
   * tetap berasal dari base.
   */

  const loadPortfolios =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setErrorMessage("");

          const data =
            await getPublishedPortfolios(
              language
            );

          setPortfolios(
            Array.isArray(data)
              ? data
              : []
          );
        } catch (error) {
          console.error(
            "Gagal mengambil portfolio publik:",
            error
          );

          setPortfolios([]);

          /*
           * Jangan tampilkan pesan error
           * service berbahasa Indonesia
           * langsung ke user EN.
           *
           * Gunakan UI translation.
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
    loadPortfolios();
  }, [loadPortfolios]);

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
        "portfolioPage.seoTitle"
      );

    descriptionMeta.setAttribute(
      "content",
      t(
        "portfolioPage.description"
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
   * CATEGORIES
   * ====================================================
   *
   * activeCategory tetap memakai
   * nilai canonical database.
   */

  const categories =
    useMemo(() => {
      const availableCategories =
        portfolios
          .map(
            (portfolio) =>
              portfolio.category
          )
          .filter(Boolean);

      return [
        ALL_CATEGORY,
        ...new Set(
          availableCategories
        ),
      ];
    }, [portfolios]);

  /*
   * ====================================================
   * FILTER
   * ====================================================
   */

  const shownPortfolios =
    useMemo(() => {
      if (
        activeCategory ===
        ALL_CATEGORY
      ) {
        return portfolios;
      }

      return portfolios.filter(
        (portfolio) =>
          portfolio.category ===
          activeCategory
      );
    }, [
      activeCategory,
      portfolios,
    ]);

  /*
   * Jika category yang sedang aktif
   * sudah tidak ada setelah fetch
   * ulang, kembalikan ke All.
   */

  useEffect(() => {
    if (
      activeCategory ===
      ALL_CATEGORY
    ) {
      return;
    }

    const stillExists =
      portfolios.some(
        (portfolio) =>
          portfolio.category ===
          activeCategory
      );

    if (!stillExists) {
      setActiveCategory(
        ALL_CATEGORY
      );
    }
  }, [
    activeCategory,
    portfolios,
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
          "portfolioPage.eyebrow"
        )}
        title={t(
          "portfolioPage.title"
        )}
        description={t(
          "portfolioPage.description"
        )}
      />

      <section className="container-jmt py-14">

        {/* ===============================================
            CATEGORY FILTER
        =============================================== */}

        {!loading &&
          !errorMessage &&
          portfolios.length > 0 && (
            <div className="mb-10 flex flex-wrap gap-2">
              {categories.map(
                (category) => {
                  const categoryLabel =
                    category ===
                    ALL_CATEGORY
                      ? t(
                          "portfolioCategories.all"
                        )
                      : getPortfolioCategoryLabel(
                          category,
                          t
                        );

                  return (
                    <button
                      key={
                        category
                      }
                      type="button"
                      onClick={() =>
                        setActiveCategory(
                          category
                        )
                      }
                      className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                        activeCategory ===
                        category
                          ? "bg-orange text-white"
                          : "border bg-white text-slate-500 hover:border-orange hover:text-orange"
                      }`}
                    >
                      {
                        categoryLabel
                      }
                    </button>
                  );
                }
              )}
            </div>
          )}

        {/* ===============================================
            LOADING
        =============================================== */}

        {loading && (
          <div className="flex min-h-[360px] items-center justify-center">
            <div className="text-center">
              <LoaderCircle
                size={42}
                className="mx-auto animate-spin text-orange"
              />

              <h2 className="mt-5 text-xl font-bold text-navy">
                {t(
                  "portfolioPage.loadingTitle"
                )}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {t(
                  "portfolioPage.loadingDescription"
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
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
                <AlertTriangle
                  size={26}
                />
              </div>

              <h2 className="mt-5 text-xl font-bold text-navy">
                {t(
                  "portfolioPage.errorTitle"
                )}
              </h2>

              <p className="mt-3 text-sm leading-6 text-red-600">
                {t(
                  "portfolioPage.errorDescription"
                )}
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

                {t(
                  "portfolioPage.retry"
                )}
              </button>
            </div>
          )}

        {/* ===============================================
            EMPTY DATABASE
        =============================================== */}

        {!loading &&
          !errorMessage &&
          portfolios.length ===
            0 && (
            <div className="mx-auto max-w-xl rounded-3xl border bg-slate-50 p-10 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
                <BriefcaseBusiness
                  size={29}
                />
              </div>

              <h2 className="mt-5 text-xl font-bold text-navy">
                {t(
                  "portfolioPage.emptyTitle"
                )}
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                {t(
                  "portfolioPage.emptyDescription"
                )}
              </p>
            </div>
          )}

        {/* ===============================================
            PORTFOLIO LIST
        =============================================== */}

        {!loading &&
          !errorMessage &&
          shownPortfolios.length >
            0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {shownPortfolios.map(
                (
                  portfolio
                ) => {
                  const categoryLabel =
                    getPortfolioCategoryLabel(
                      portfolio.category,
                      t
                    );

                  return (
                    <Link
                      key={
                        portfolio.id
                      }
                      to={`/portfolio/${portfolio.slug}`}
                      className="group block overflow-hidden rounded-2xl border bg-white shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                    >
                      <article>
                        {/* IMAGE */}

                        {portfolio.image_url ? (
                          <div className="overflow-hidden bg-slate-100">
                            <img
                              src={
                                portfolio.image_url
                              }
                              alt={
                                portfolio.title
                              }
                              loading="lazy"
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

                        {/* CONTENT */}

                        <div className="p-6">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-orange">
                              {
                                categoryLabel
                              }
                            </span>

                            {portfolio.is_featured && (
                              <span className="rounded-full bg-orange/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-orange">
                                {t(
                                  "portfolioPage.featured"
                                )}
                              </span>
                            )}
                          </div>

                          <h2 className="mt-3 text-lg font-semibold text-navy transition group-hover:text-orange">
                            {
                              portfolio.title
                            }
                          </h2>

                          <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
                            {portfolio.short_description ||
                              t(
                                "portfolioPage.fallbackDescription"
                              )}
                          </p>

                          <div className="mt-5 flex items-center justify-between gap-4">
                            <span className="inline-flex items-center gap-2 text-sm font-semibold text-orange">
                              {t(
                                "portfolioPage.viewProject"
                              )}

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
                  );
                }
              )}
            </div>
          )}

        {/* ===============================================
            EMPTY FILTER RESULT
        =============================================== */}

        {!loading &&
          !errorMessage &&
          portfolios.length > 0 &&
          shownPortfolios.length ===
            0 && (
            <div className="rounded-3xl border bg-slate-50 px-6 py-14 text-center">
              <BriefcaseBusiness
                size={34}
                className="mx-auto text-slate-400"
              />

              <h2 className="mt-4 text-lg font-bold text-navy">
                {t(
                  "portfolioPage.emptyCategoryTitle"
                )}
              </h2>

              <button
                type="button"
                onClick={() =>
                  setActiveCategory(
                    ALL_CATEGORY
                  )
                }
                className="mt-5 text-sm font-semibold text-orange"
              >
                {t(
                  "portfolioPage.showAll"
                )}
              </button>
            </div>
          )}
      </section>

      <CTA />
    </>
  );
}