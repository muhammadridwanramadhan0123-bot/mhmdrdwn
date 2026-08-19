import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  ArrowRight,
  HeartPulse,
  RefreshCw,
  Search,
  Stethoscope,
} from "lucide-react";

import {
  Link,
  useSearchParams,
} from "react-router-dom";

import {
  PageHero,
} from "../components/Common";

import {
  getActiveServiceCategories,
  getProductServicesMegaMenuData,
  getPublishedServicesForPublic,
} from "../services/serviceService";

import {
  useLanguage,
} from "../contexts/LanguageContext";

/*
 * ======================================================
 * HELPERS
 * ======================================================
 */

function getServiceIcon(iconName) {
  const normalizedIcon =
    String(
      iconName || ""
    )
      .trim()
      .toLowerCase();

  if (
    normalizedIcon.includes(
      "heart"
    ) ||
    normalizedIcon.includes(
      "pulse"
    )
  ) {
    return HeartPulse;
  }

  return Stethoscope;
}

function normalizeLegacyFeatures(
  features
) {
  if (!Array.isArray(features)) {
    return [];
  }

  return features
    .map((feature) => {
      if (
        typeof feature === "string"
      ) {
        return feature.trim();
      }

      if (
        feature &&
        typeof feature === "object"
      ) {
        return String(
          feature.name || ""
        ).trim();
      }

      return "";
    })
    .filter(Boolean);
}

/*
 * ======================================================
 * LOADING SKELETON
 * ======================================================
 */

function ServicesLoading() {
  return (
    <div className="mt-10 grid gap-6 lg:grid-cols-2">
      {[1, 2, 3, 4].map(
        (item) => (
          <div
            key={item}
            className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white p-7"
          >
            <div className="flex gap-4">
              <div className="h-14 w-14 rounded-xl bg-slate-200" />

              <div className="flex-1">
                <div className="h-3 w-32 rounded bg-slate-200" />

                <div className="mt-4 h-6 w-3/4 rounded bg-slate-200" />

                <div className="mt-4 h-4 w-full rounded bg-slate-100" />

                <div className="mt-2 h-4 w-2/3 rounded bg-slate-100" />
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}

/*
 * ======================================================
 * CTA
 * ======================================================
 */

function ServicesCTA({
  t,
}) {
  return (
    <section className="container-jmt pb-14 md:pb-20">
      <div className="relative overflow-hidden rounded-3xl bg-[#082B3A] px-6 py-12 text-center text-white md:px-10 md:py-16">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-orange/20 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-24 left-16 h-56 w-56 rounded-full bg-teal-400/10 blur-3xl" />

        <div className="relative mx-auto max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange">
            {t(
              "servicesPage.contactEyebrow"
            )}
          </p>

          <h2 className="mt-4 text-3xl font-bold leading-tight md:text-4xl">
            {t(
              "servicesPage.contactTitle"
            )}
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/70 md:text-base">
            {t(
              "servicesPage.contactDescription"
            )}
          </p>

          <Link
            to="/contact"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-orange px-6 py-3.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            {t(
              "servicesPage.contactButton"
            )}

            <ArrowRight
              size={17}
            />
          </Link>
        </div>
      </div>
    </section>
  );
}

/*
 * ======================================================
 * PAGE
 * ======================================================
 */

export default function ServicesPage() {
  const {
    language,
    t,
  } = useLanguage();

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const [
    categories,
    setCategories,
  ] = useState([]);

  const [
    services,
    setServices,
  ] = useState([]);

  const [
    query,
    setQuery,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const categoryParameter =
    searchParams.get(
      "category"
    ) || "all";

  /*
   * ====================================================
   * LOAD DATA
   * ====================================================
   *
   * 1. categoryData
   *    → service_categories
   *
   * 2. baseServiceData
   *    → data struktur service:
   *      category_id, image_url, icon, dll.
   *
   * 3. translatedServiceData
   *    → service + feature translation
   *      berdasarkan language.
   *
   * Slug dan struktur database tidak diterjemahkan.
   */

  const loadData =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setErrorMessage("");

          const [
            categoryData,
            baseServiceData,
            translatedServiceData,
          ] =
            await Promise.all([
              getActiveServiceCategories(),

              getPublishedServicesForPublic(),

              getProductServicesMegaMenuData(
                language
              ),
            ]);

          const normalizedCategories =
            Array.isArray(
              categoryData
            )
              ? categoryData
              : [];

          const normalizedBaseServices =
            Array.isArray(
              baseServiceData
            )
              ? baseServiceData
              : [];

          const normalizedTranslations =
            Array.isArray(
              translatedServiceData
            )
              ? translatedServiceData
              : [];

          /*
           * Translation dicari berdasarkan
           * service ID.
           */

          const translationMap =
            new Map(
              normalizedTranslations.map(
                (
                  translatedService
                ) => [
                  translatedService.id,
                  translatedService,
                ]
              )
            );

          /*
           * =================================================
           * MERGE:
           *
           * BASE SERVICE
           * +
           * TRANSLATED SERVICE
           * =================================================
           */

          const mergedServices =
            normalizedBaseServices.map(
              (
                baseService
              ) => {
                const translatedService =
                  translationMap.get(
                    baseService.id
                  );

                /*
                 * Feature dari mega menu
                 * berbentuk object.
                 *
                 * Untuk card ServicesPage,
                 * kita hanya membutuhkan
                 * nama feature.
                 */

                const translatedFeatures =
                  Array.isArray(
                    translatedService
                      ?.features
                  )
                    ? translatedService.features
                        .map(
                          (
                            feature
                          ) =>
                            String(
                              feature
                                ?.name ||
                                ""
                            ).trim()
                        )
                        .filter(
                          Boolean
                        )
                    : [];

                const baseFeatures =
                  normalizeLegacyFeatures(
                    baseService.features
                  );

                return {
                  /*
                   * Data struktur:
                   * category_id
                   * image_url
                   * icon
                   * slug
                   * dll.
                   */
                  ...baseService,

                  /*
                   * Konten bilingual.
                   */
                  name:
                    translatedService
                      ?.name ||
                    baseService.name,

                  short_description:
                    translatedService
                      ?.short_description ||
                    baseService.short_description,

                  /*
                   * Kalau translation feature
                   * tersedia gunakan EN/ID hasil
                   * serviceService.
                   *
                   * Kalau tidak tersedia,
                   * fallback ke legacy features.
                   */
                  features:
                    translatedFeatures.length >
                    0
                      ? translatedFeatures
                      : baseFeatures,

                  translation_locale:
                    translatedService
                      ?.translation_locale ||
                    "id",
                };
              }
            );

          setCategories(
            normalizedCategories
          );

          setServices(
            mergedServices
          );
        } catch (error) {
          console.error(
            "Products & Services gagal dimuat:",
            error
          );

          setCategories([]);
          setServices([]);

          setErrorMessage(
            error instanceof Error
              ? error.message
              : "LOAD_ERROR"
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
    loadData();
  }, [loadData]);

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
      language === "en"
        ? "Products & Services | Jasa Medika Transmedic"
        : "Produk & Layanan | Jasa Medika Transmedic";

    descriptionMeta.setAttribute(
      "content",
      t(
        "servicesPage.description"
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
   * CATEGORY MAP
   * ====================================================
   */

  const categoryMap =
    useMemo(() => {
      return new Map(
        categories.map(
          (category) => [
            category.id,
            category,
          ]
        )
      );
    }, [categories]);

  /*
   * ====================================================
   * MERGE CATEGORY
   * ====================================================
   */

  const servicesWithCategory =
    useMemo(() => {
      return services.map(
        (service) => ({
          ...service,

          category:
            categoryMap.get(
              service.category_id
            ) || null,
        })
      );
    }, [
      services,
      categoryMap,
    ]);

  /*
   * ====================================================
   * SELECTED CATEGORY
   * ====================================================
   */

  const selectedCategory =
    useMemo(() => {
      return (
        categories.find(
          (category) =>
            category.slug ===
            categoryParameter
        ) || null
      );
    }, [
      categories,
      categoryParameter,
    ]);

  const activeCategory =
    selectedCategory?.slug ||
    "all";

  /*
   * ====================================================
   * FILTER + SEARCH
   * ====================================================
   */

  const filteredServices =
    useMemo(() => {
      const normalizedQuery =
        query
          .trim()
          .toLowerCase();

      return servicesWithCategory.filter(
        (service) => {
          const matchesCategory =
            activeCategory ===
              "all" ||
            service.category
              ?.slug ===
              activeCategory;

          const features =
            normalizeLegacyFeatures(
              service.features
            );

          const searchableText =
            [
              service.name,
              service.slug,
              service.short_description,
              service.full_description,
              service.category
                ?.name,
              ...features,
            ]
              .map(
                (value) =>
                  String(
                    value || ""
                  ).toLowerCase()
              )
              .join(" ");

          const matchesSearch =
            !normalizedQuery ||
            searchableText.includes(
              normalizedQuery
            );

          return (
            matchesCategory &&
            matchesSearch
          );
        }
      );
    }, [
      activeCategory,
      query,
      servicesWithCategory,
    ]);

  /*
   * ====================================================
   * CATEGORY CHANGE
   * ====================================================
   */

  function handleCategoryChange(
    event
  ) {
    const nextCategory =
      event.target.value;

    const nextParams =
      new URLSearchParams(
        searchParams
      );

    if (
      nextCategory === "all"
    ) {
      nextParams.delete(
        "category"
      );
    } else {
      nextParams.set(
        "category",
        nextCategory
      );
    }

    setSearchParams(
      nextParams,
      {
        replace: true,
      }
    );
  }

  /*
   * ====================================================
   * RESET FILTER
   * ====================================================
   */

  function resetFilters() {
    setQuery("");

    const nextParams =
      new URLSearchParams(
        searchParams
      );

    nextParams.delete(
      "category"
    );

    setSearchParams(
      nextParams,
      {
        replace: true,
      }
    );
  }

  /*
   * ====================================================
   * EMPTY CATEGORY STATE
   * ====================================================
   */

  const categoryHasNoServices =
    activeCategory !== "all" &&
    !query.trim() &&
    filteredServices.length ===
      0;

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
          "servicesPage.eyebrow"
        )}
        title={t(
          "servicesPage.title"
        )}
        description={t(
          "servicesPage.description"
        )}
      />

      {/* =================================================
          SERVICES
      ================================================= */}

      <section className="container-jmt py-14 md:py-20">
        {/* ===============================================
            SEARCH + FILTER
        =============================================== */}

        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft md:flex-row">
          {/* SEARCH */}

          <label className="relative flex-1">
            <span className="sr-only">
              {t(
                "servicesPage.searchLabel"
              )}
            </span>

            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={query}
              onChange={(
                event
              ) =>
                setQuery(
                  event.target.value
                )
              }
              placeholder={t(
                "servicesPage.searchPlaceholder"
              )}
              className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-orange focus:ring-2 focus:ring-orange/10"
            />
          </label>

          {/* CATEGORY FILTER */}

          <label>
            <span className="sr-only">
              {t(
                "servicesPage.categoryFilterLabel"
              )}
            </span>

            <select
              value={
                activeCategory
              }
              onChange={
                handleCategoryChange
              }
              className="w-full min-w-72 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange focus:ring-2 focus:ring-orange/10"
            >
              <option value="all">
                {t(
                  "servicesPage.allCategories"
                )}
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={
                      category.id
                    }
                    value={
                      category.slug
                    }
                  >
                    {
                      category.name
                    }
                  </option>
                )
              )}
            </select>
          </label>
        </div>

        {/* ===============================================
            LOADING
        =============================================== */}

        {loading && (
          <>
            <p className="mt-8 text-center text-sm font-medium text-slate-500">
              {t(
                "servicesPage.loading"
              )}
            </p>

            <ServicesLoading />
          </>
        )}

        {/* ===============================================
            ERROR
        =============================================== */}

        {!loading &&
          errorMessage && (
            <div className="mt-10 rounded-3xl border border-red-200 bg-red-50 px-6 py-12 text-center">
              <AlertTriangle
                size={34}
                className="mx-auto text-red-600"
              />

              <h2 className="mt-4 text-xl font-bold text-[#082B3A]">
                {t(
                  "servicesPage.errorTitle"
                )}
              </h2>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-red-700">
                {t(
                  "servicesPage.errorDescription"
                )}
              </p>

              <button
                type="button"
                onClick={
                  loadData
                }
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange px-5 py-3 text-sm font-semibold text-white"
              >
                <RefreshCw
                  size={17}
                />

                {t(
                  "servicesPage.retry"
                )}
              </button>
            </div>
          )}

        {/* ===============================================
            SERVICE CARDS
        =============================================== */}

        {!loading &&
          !errorMessage &&
          filteredServices.length >
            0 && (
            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              {filteredServices.map(
                (
                  service
                ) => {
                  const Icon =
                    getServiceIcon(
                      service.icon
                    );

                  const features =
                    normalizeLegacyFeatures(
                      service.features
                    );

                  return (
                    <article
                      key={
                        service.id
                      }
                      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft transition duration-300 hover:-translate-y-1 hover:border-orange/30 hover:shadow-xl"
                    >
                      {/* IMAGE */}

                      {service.image_url && (
                        <div className="overflow-hidden bg-slate-100">
                          <img
                            src={
                              service.image_url
                            }
                            alt={
                              service.name
                            }
                            loading="lazy"
                            className="aspect-[16/7] w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        </div>
                      )}

                      {/* CONTENT */}

                      <div className="flex flex-1 flex-col p-7 md:p-8">
                        <div className="flex items-start gap-4">
                          {/* ICON */}

                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-cream text-orange">
                            <Icon
                              size={28}
                            />
                          </div>

                          <div className="min-w-0">
                            {/* CATEGORY */}

                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-orange">
                              {service
                                .category
                                ?.name ||
                                t(
                                  "servicesPage.defaultCategory"
                                )}
                            </p>

                            {/* NAME */}

                            <h2 className="text-xl font-bold leading-7 text-[#082B3A]">
                              {
                                service.name
                              }
                            </h2>

                            {/* DESCRIPTION */}

                            {service.short_description && (
                              <p className="mt-3 text-sm leading-7 text-slate-500">
                                {
                                  service.short_description
                                }
                              </p>
                            )}
                          </div>
                        </div>

                        {/* FEATURE TAGS */}

                        {features.length >
                          0 && (
                          <div className="mt-6 flex flex-wrap gap-2">
                            {features
                              .slice(
                                0,
                                3
                              )
                              .map(
                                (
                                  feature,
                                  index
                                ) => (
                                  <span
                                    key={`${service.id}-${feature}-${index}`}
                                    className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600"
                                  >
                                    {
                                      feature
                                    }
                                  </span>
                                )
                              )}
                          </div>
                        )}

                        {/* LINK */}

                        <div className="mt-auto pt-7">
                          <Link
                            to={`/services/${service.slug}`}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-orange transition hover:underline"
                          >
                            {t(
                              "servicesPage.learnMore"
                            )}

                            <ArrowRight
                              size={17}
                              className="transition group-hover:translate-x-1"
                            />
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          )}

        {/* ===============================================
            EMPTY STATE
        =============================================== */}

        {!loading &&
          !errorMessage &&
          filteredServices.length ===
            0 && (
            <div className="mt-10 rounded-3xl border border-slate-200 bg-slate-50 px-6 py-14 text-center">
              {categoryHasNoServices ? (
                <>
                  <Stethoscope
                    size={38}
                    className="mx-auto text-slate-400"
                  />

                  <h2 className="mt-5 text-xl font-bold text-[#082B3A]">
                    {t(
                      "servicesPage.emptyCategoryTitle"
                    )}
                  </h2>

                  <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500">
                    {t(
                      "servicesPage.emptyCategoryDescription"
                    )}

                    {selectedCategory
                      ?.name && (
                      <>
                        {" "}

                        <strong>
                          {
                            selectedCategory.name
                          }
                        </strong>
                        .
                      </>
                    )}
                  </p>
                </>
              ) : (
                <>
                  <Search
                    size={38}
                    className="mx-auto text-slate-400"
                  />

                  <h2 className="mt-5 text-xl font-bold text-[#082B3A]">
                    {t(
                      "servicesPage.noResultsTitle"
                    )}
                  </h2>

                  <p className="mt-3 text-sm text-slate-500">
                    {t(
                      "servicesPage.noResultsDescription"
                    )}
                  </p>
                </>
              )}

              <button
                type="button"
                onClick={
                  resetFilters
                }
                className="mt-6 rounded-xl bg-orange px-5 py-3 text-sm font-semibold text-white"
              >
                {t(
                  "servicesPage.showAllServices"
                )}
              </button>
            </div>
          )}
      </section>

      {/* =================================================
          CTA
      ================================================= */}

      <ServicesCTA
        t={t}
      />
    </>
  );
}