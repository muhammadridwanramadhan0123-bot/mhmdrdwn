import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  ImageIcon,
  Layers3,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  useLanguage,
} from "../contexts/LanguageContext";

import {
  getPublishedServiceFeatureBySlug,
} from "../services/serviceService";

/*
 * ======================================================
 * HELPERS
 * ======================================================
 */

function getSafeText(value) {
  return String(
    value || ""
  ).trim();
}

function createFeatureUrl(
  serviceSlug,
  featureSlug
) {
  if (
    !serviceSlug ||
    !featureSlug
  ) {
    return "/services";
  }

  return `/services/${serviceSlug}/features/${featureSlug}`;
}

/*
 * ======================================================
 * PAGE
 * ======================================================
 */

export default function ServiceFeatureDetailPage() {
  const params =
    useParams();

  /*
   * Mendukung dua kemungkinan route:
   *
   * /services/:serviceSlug/features/:featureSlug
   *
   * atau:
   *
   * /services/:slug/features/:featureSlug
   */
  const serviceSlug =
    params.serviceSlug ||
    params.slug ||
    "";

  const featureSlug =
    params.featureSlug ||
    params.feature ||
    "";

  const {
    language,
    t,
  } = useLanguage();

  const [
    feature,
    setFeature,
  ] = useState(null);

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
   * LOAD FEATURE
   * ====================================================
   */

  const loadFeature =
    useCallback(
      async () => {
        if (
          !serviceSlug ||
          !featureSlug
        ) {
          setFeature(null);
          setErrorMessage("");
          setLoading(false);

          return;
        }

        try {
          setLoading(true);

          setErrorMessage("");

          const data =
            await getPublishedServiceFeatureBySlug(
              serviceSlug,
              featureSlug,
              language
            );

          setFeature(
            data || null
          );
        } catch (error) {
          console.error(
            "Detail feature gagal dimuat:",
            error
          );

          setFeature(null);

          setErrorMessage(
            error instanceof Error
              ? error.message
              : ""
          );
        } finally {
          setLoading(false);
        }
      },
      [
        serviceSlug,
        featureSlug,
        language,
      ]
    );

  useEffect(() => {
    loadFeature();
  }, [loadFeature]);

  /*
   * ====================================================
   * SEO
   * ====================================================
   */

  useEffect(() => {
    if (!feature) {
      return undefined;
    }

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
      `${feature.name} | Jasa Medika Transmedic`;

    descriptionMeta.setAttribute(
      "content",
      feature.short_description ||
        feature.service
          ?.seo_description ||
        ""
    );

    return () => {
      document.title =
        previousTitle;

      if (
        metaWasCreated
      ) {
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
  }, [feature]);

  /*
   * ====================================================
   * LOADING
   * ====================================================
   */

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-white">
        <div className="px-6 text-center">
          <LoaderCircle
            size={44}
            className="mx-auto animate-spin text-[#FF5A0A]"
          />

          <p className="mt-5 text-lg font-bold text-[#082B3A]">
            {t(
              "featureDetail.loadingTitle"
            )}
          </p>

          <p className="mt-2 text-sm text-slate-500">
            {t(
              "featureDetail.loadingDescription"
            )}
          </p>
        </div>
      </main>
    );
  }

  /*
   * ====================================================
   * ERROR
   * ====================================================
   */

  if (errorMessage) {
    return (
      <main className="bg-white py-24">
        <div className="container-jmt">
          <div className="mx-auto max-w-xl rounded-[28px] border border-red-200 bg-red-50 p-8 text-center">
            <AlertTriangle
              size={42}
              className="mx-auto text-red-500"
            />

            <h1 className="mt-5 text-2xl font-bold text-[#082B3A]">
              {t(
                "featureDetail.errorTitle"
              )}
            </h1>

            <p className="mt-3 text-sm leading-7 text-red-700">
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={
                loadFeature
              }
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#082B3A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0A4053]"
            >
              <RefreshCw
                size={17}
              />

              {t(
                "featureDetail.retry"
              )}
            </button>
          </div>
        </div>
      </main>
    );
  }

  /*
   * ====================================================
   * NOT FOUND
   * ====================================================
   */

  if (!feature) {
    return (
      <main className="bg-white py-24">
        <div className="container-jmt">
          <div className="mx-auto max-w-xl text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-[#FF5A0A]">
              <Layers3
                size={30}
              />
            </div>

            <h1 className="mt-6 text-3xl font-bold text-[#082B3A]">
              {t(
                "featureDetail.notFoundTitle"
              )}
            </h1>

            <p className="mt-3 text-sm leading-7 text-slate-500">
              {t(
                "featureDetail.notFoundDescription"
              )}
            </p>

            <Link
              to="/services"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#FF5A0A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#E94F00]"
            >
              <ArrowLeft
                size={17}
              />

              {t(
                "featureDetail.productServices"
              )}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /*
   * ====================================================
   * NORMALIZED DATA
   *
   * Tidak ada hook di bawah conditional return.
   * ====================================================
   */

  const service =
    feature.service || {};

  const parentFeature =
    feature.parent_feature ||
    null;

  const childFeatures =
    Array.isArray(
      feature.child_features
    )
      ? feature.child_features
      : [];

  const shortDescription =
    getSafeText(
      feature.short_description
    );

  const fullDescription =
    getSafeText(
      feature.full_description
    );

  const serviceName =
    getSafeText(
      service.name
    ) ||
    t(
      "featureDetail.fallbackServiceName"
    );

  const currentServiceSlug =
    getSafeText(
      feature.service_slug
    ) ||
    getSafeText(
      service.slug
    ) ||
    serviceSlug;

  const serviceUrl =
    currentServiceSlug
      ? `/services/${currentServiceSlug}`
      : "/services";

  /*
   * ====================================================
   * PAGE
   * ====================================================
   */

  return (
    <main className="overflow-hidden bg-white">
      {/* =================================================
          HERO
      ================================================= */}

      <section className="relative overflow-hidden bg-[#082B3A]">
        {/* DECORATION */}

        <div className="pointer-events-none absolute -right-24 -top-32 h-[420px] w-[420px] rounded-full bg-[#FF5A0A]/20 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-32 left-[20%] h-[320px] w-[320px] rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="container-jmt relative py-12 md:py-16 lg:py-20">
          {/* BREADCRUMB */}

          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-xs font-semibold text-white/60"
          >
            <Link
              to="/services"
              className="transition hover:text-orange-300"
            >
              {t(
                "featureDetail.productServices"
              )}
            </Link>

            <ChevronRight
              size={14}
              className="text-white/30"
            />

            <Link
              to={
                serviceUrl
              }
              className="transition hover:text-orange-300"
            >
              {serviceName}
            </Link>

            <ChevronRight
              size={14}
              className="text-white/30"
            />

            <span className="text-orange-300">
              {feature.name}
            </span>
          </nav>

          <div className="mt-10 grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            {/* TEXT */}

            <div>
              {feature.group_name && (
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-300">
                  {
                    feature.group_name
                  }
                </p>
              )}

              {parentFeature && (
                <Link
                  to={createFeatureUrl(
                    currentServiceSlug,
                    parentFeature.slug
                  )}
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-orange-300/40 hover:text-orange-300"
                >
                  <span>
                    {t(
                      "featureDetail.parentFeature"
                    )}
                  </span>

                  <span className="text-orange-300">
                    {
                      parentFeature.name
                    }
                  </span>

                  <ChevronRight
                    size={13}
                  />
                </Link>
              )}

              <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-[1.12] text-white md:text-5xl lg:text-[58px]">
                {feature.name}
              </h1>

              {shortDescription && (
                <p className="mt-6 max-w-3xl text-base leading-8 text-white/70 md:text-lg md:leading-9">
                  {
                    shortDescription
                  }
                </p>
              )}

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#FF5A0A] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#E94F00]"
                >
                  {t(
                    "featureDetail.contact"
                  )}

                  <ArrowRight
                    size={17}
                  />
                </Link>

                <Link
                  to={
                    serviceUrl
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
                >
                  <ArrowLeft
                    size={17}
                  />

                  {t(
                    "featureDetail.backToService"
                  )}
                </Link>
              </div>
            </div>

            {/* IMAGE */}

            <div className="relative">
              <div className="absolute -inset-4 rounded-[36px] bg-gradient-to-br from-orange-400/20 to-cyan-300/10 blur-2xl" />

              <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-white/5 shadow-2xl shadow-black/20">
                {feature.image_url ? (
                  <img
                    src={
                      feature.image_url
                    }
                    alt={
                      feature.name
                    }
                    className="aspect-[4/3] h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-white/10 to-white/[0.03] p-10">
                    <div className="text-center">
                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/10 text-orange-300">
                        <ImageIcon
                          size={38}
                        />
                      </div>

                      <p className="mt-5 text-sm font-semibold text-white/50">
                        {feature.name}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================
          OVERVIEW
      ================================================= */}

      {(shortDescription ||
        fullDescription) && (
        <section className="py-16 md:py-20 lg:py-24">
          <div className="container-jmt">
            <div className="grid gap-10 lg:grid-cols-[0.32fr_0.68fr] lg:gap-16">
              {/* LABEL */}

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF5A0A]">
                  {t(
                    "featureDetail.overview"
                  )}
                </p>

                <h2 className="mt-4 text-3xl font-bold leading-tight text-[#082B3A] md:text-4xl">
                  {feature.name}
                </h2>

                {feature.group_name && (
                  <p className="mt-4 text-sm font-semibold text-slate-400">
                    {
                      feature.group_name
                    }
                  </p>
                )}
              </div>

              {/* CONTENT */}

              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-8 lg:p-10">
                {shortDescription && (
                  <p className="text-lg font-medium leading-8 text-[#082B3A] md:text-xl md:leading-9">
                    {
                      shortDescription
                    }
                  </p>
                )}

                {fullDescription && (
                  <>
                    {shortDescription && (
                      <div className="my-8 h-px bg-slate-200" />
                    )}

                    <div>
                      <p className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-[#FF5A0A]">
                        {t(
                          "featureDetail.detail"
                        )}
                      </p>

                      <div className="whitespace-pre-line text-[15px] leading-8 text-slate-600 md:text-base md:leading-8">
                        {
                          fullDescription
                        }
                      </div>
                    </div>
                  </>
                )}

                {!shortDescription &&
                  !fullDescription && (
                    <p className="text-sm leading-7 text-slate-500">
                      {t(
                        "featureDetail.fallbackDescription"
                      )}
                    </p>
                  )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =================================================
          PARENT FEATURE
      ================================================= */}

      {parentFeature && (
        <section className="border-y border-slate-100 bg-slate-50 py-12 md:py-16">
          <div className="container-jmt">
            <div className="flex flex-col justify-between gap-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:p-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#FF5A0A]">
                  {t(
                    "featureDetail.parentFeature"
                  )}
                </p>

                <h2 className="mt-3 text-2xl font-bold text-[#082B3A]">
                  {
                    parentFeature.name
                  }
                </h2>

                {parentFeature.short_description && (
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
                    {
                      parentFeature.short_description
                    }
                  </p>
                )}
              </div>

              <Link
                to={createFeatureUrl(
                  currentServiceSlug,
                  parentFeature.slug
                )}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-[#082B3A] transition hover:border-[#FF5A0A] hover:text-[#FF5A0A]"
              >
                {t(
                  "featureDetail.viewDetails"
                )}

                <ArrowRight
                  size={17}
                />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* =================================================
          CHILD FEATURES
      ================================================= */}

      {childFeatures.length > 0 && (
        <section className="bg-slate-50 py-16 md:py-20 lg:py-24">
          <div className="container-jmt">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF5A0A]">
                {t(
                  "featureDetail.childFeatures"
                )}
              </p>

              <h2 className="mt-4 text-3xl font-bold text-[#082B3A] md:text-4xl">
                {feature.name}
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-500 md:text-base">
                {t(
                  "featureDetail.childFeaturesDescription"
                )}
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {childFeatures.map(
                (childFeature) => (
                  <Link
                    key={
                      childFeature.id
                    }
                    to={createFeatureUrl(
                      currentServiceSlug,
                      childFeature.slug
                    )}
                    className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl"
                  >
                    {/* IMAGE */}

                    <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                      {childFeature.image_url ? (
                        <img
                          src={
                            childFeature.image_url
                          }
                          alt={
                            childFeature.name
                          }
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-300">
                          <Layers3
                            size={34}
                          />
                        </div>
                      )}
                    </div>

                    {/* CONTENT */}

                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="text-lg font-bold leading-7 text-[#082B3A] transition group-hover:text-[#FF5A0A]">
                        {
                          childFeature.name
                        }
                      </h3>

                      {childFeature.short_description && (
                        <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-500">
                          {
                            childFeature.short_description
                          }
                        </p>
                      )}

                      <div className="mt-auto flex items-center gap-2 pt-5 text-sm font-bold text-[#FF5A0A]">
                        <span>
                          {t(
                            "featureDetail.learnMore"
                          )}
                        </span>

                        <ArrowRight
                          size={16}
                          className="transition group-hover:translate-x-1"
                        />
                      </div>
                    </div>
                  </Link>
                )
              )}
            </div>
          </div>
        </section>
      )}

      {/* =================================================
          CTA
      ================================================= */}

      <section className="py-16 md:py-20">
        <div className="container-jmt">
          <div className="relative overflow-hidden rounded-[32px] bg-[#082B3A] px-6 py-12 text-center text-white md:px-10 md:py-16">
            <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[#FF5A0A]/20 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-20 left-10 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />

            <div className="relative mx-auto max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-300">
                {serviceName}
              </p>

              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-4xl">
                {t(
                  "featureDetail.contact"
                )}
              </h2>

              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/70 md:text-base">
                {t(
                  "featureDetail.contactDescription"
                )}
              </p>

              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#FF5A0A] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#E94F00]"
                >
                  {t(
                    "featureDetail.contact"
                  )}

                  <ArrowRight
                    size={17}
                  />
                </Link>

                <Link
                  to={
                    serviceUrl
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
                >
                  <ArrowLeft
                    size={17}
                  />

                  {t(
                    "featureDetail.backToService"
                  )}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}