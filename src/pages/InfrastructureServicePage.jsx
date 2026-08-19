import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Layers,
  LoaderCircle,
  Network,
  RefreshCw,
  Server,
  Settings,
  ShieldCheck,
  Wrench,
  Zap,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import {
  useLanguage,
} from "../contexts/LanguageContext";

import {
  getPublishedServicePageBySlug,
} from "../services/serviceService";

/*
 * ======================================================
 * CONFIG
 * ======================================================
 */

const INFRASTRUCTURE_SLUG =
  "infrastruktur-it-layanan-pendukung";

/*
 * ======================================================
 * ICONS
 * ======================================================
 */

const GROUP_ICONS = [
  Server,
  ShieldCheck,
  Network,
];

const BENEFIT_ICONS = {
  server: Server,
  network: Network,
  settings: Settings,
  wrench: Wrench,
  shield: ShieldCheck,
  security: ShieldCheck,
  layers: Layers,
  zap: Zap,
};

/*
 * ======================================================
 * HELPERS
 * ======================================================
 */

function getBenefitIcon(
  iconName
) {
  const normalizedName =
    String(
      iconName || ""
    )
      .trim()
      .toLowerCase();

  return (
    BENEFIT_ICONS[
      normalizedName
    ] ||
    CheckCircle2
  );
}

function getGroupIcon(
  index
) {
  return (
    GROUP_ICONS[
      index %
        GROUP_ICONS.length
    ] ||
    Server
  );
}

/*
 * Link internal / anchor / external.
 */
function SmartLink({
  to,
  className,
  children,
}) {
  const url =
    String(
      to || ""
    ).trim();

  if (
    url.startsWith("#")
  ) {
    return (
      <a
        href={url}
        className={
          className
        }
      >
        {children}
      </a>
    );
  }

  if (
    /^https?:\/\//i.test(
      url
    )
  ) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className={
          className
        }
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      to={
        url || "/"
      }
      className={
        className
      }
    >
      {children}
    </Link>
  );
}

/*
 * ======================================================
 * LIST ITEM
 * ======================================================
 */

function ServiceListItem({
  feature,
}) {
  return (
    <li className="flex items-start gap-3">
      <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange/10">
        <CheckCircle2
          size={15}
          className="text-orange"
        />
      </div>

      <div className="min-w-0">
        <p className="text-sm font-medium leading-7 text-slate-600 md:text-[15px]">
          {feature.name}
        </p>

        {feature.short_description && (
          <p className="mt-1 text-xs leading-6 text-slate-400">
            {
              feature.short_description
            }
          </p>
        )}
      </div>
    </li>
  );
}

/*
 * ======================================================
 * COMPONENT
 * ======================================================
 */

export default function InfrastructureServicePage() {
  const {
    language,
    t,
  } = useLanguage();

  const [
    service,
    setService,
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
   * LOAD SERVICE
   * ====================================================
   */

  const loadService =
    useCallback(
      async () => {
        try {
          setLoading(
            true
          );

          setErrorMessage(
            ""
          );

          const data =
            await getPublishedServicePageBySlug(
              INFRASTRUCTURE_SLUG,
              language
            );

          setService(
            data
          );
        } catch (error) {
          console.error(
            "Halaman Infrastruktur gagal dimuat:",
            error
          );

          setService(
            null
          );

          setErrorMessage(
            error instanceof Error
              ? error.message
              : t(
                  "infrastructure.errorTitle"
                )
          );
        } finally {
          setLoading(
            false
          );
        }
      },
      [
        language,
        t,
      ]
    );

  useEffect(() => {
    loadService();
  }, [loadService]);

  /*
   * ====================================================
   * SEO
   * ====================================================
   */

  useEffect(() => {
    if (!service) {
      return undefined;
    }

    const previousTitle =
      document.title;

    const title =
      service.seo_title ||
      service.name ||
      t(
        "infrastructure.fallbackServiceName"
      );

    document.title =
      title.includes(
        "Jasa Medika Transmedic"
      )
        ? title
        : `${title} | Jasa Medika Transmedic`;

    return () => {
      document.title =
        previousTitle;
    };
  }, [
    service,
    t,
  ]);

  /*
   * ====================================================
   * LOADING
   * ====================================================
   */

  if (loading) {
    return (
      <main className="flex min-h-[65vh] items-center justify-center bg-slate-50 px-6">
        <div className="text-center">
          <LoaderCircle
            size={44}
            className="mx-auto animate-spin text-orange"
          />

          <h1 className="mt-5 text-xl font-bold text-[#082B3A]">
            {t(
              "infrastructure.loadingTitle"
            )}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {t(
              "infrastructure.loadingDescription"
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
      <main className="flex min-h-[65vh] items-center justify-center bg-slate-50 px-6 py-16">
        <div className="w-full max-w-xl rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertTriangle
              size={29}
            />
          </div>

          <h1 className="mt-6 text-2xl font-bold text-[#082B3A]">
            {t(
              "infrastructure.errorTitle"
            )}
          </h1>

          <p className="mt-3 text-sm leading-7 text-red-600">
            {
              errorMessage
            }
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-orange hover:text-orange"
            >
              <ArrowLeft
                size={17}
              />

              {t(
                "infrastructure.back"
              )}
            </Link>

            <button
              type="button"
              onClick={
                loadService
              }
              className="inline-flex items-center gap-2 rounded-xl bg-orange px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            >
              <RefreshCw
                size={17}
              />

              {t(
                "infrastructure.retry"
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

  if (!service) {
    return (
      <main className="flex min-h-[65vh] items-center justify-center bg-slate-50 px-6 py-16">
        <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange/10 font-bold text-orange">
            404
          </div>

          <h1 className="mt-6 text-3xl font-bold text-[#082B3A]">
            {t(
              "infrastructure.notFoundTitle"
            )}
          </h1>

          <p className="mt-4 text-sm leading-7 text-slate-500">
            {t(
              "infrastructure.notFoundDescription"
            )}
          </p>

          <Link
            to="/services"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-orange px-6 py-3 text-sm font-semibold text-white"
          >
            <ArrowLeft
              size={17}
            />

            {t(
              "infrastructure.backToServices"
            )}
          </Link>
        </div>
      </main>
    );
  }

  /*
   * ====================================================
   * CMS SECTIONS
   * ====================================================
   */

  const hero =
    service?.sections
      ?.hero || {};

  const intro =
    service?.sections
      ?.intro || {};

  const featuresSection =
    service?.sections
      ?.features || {};

  const benefitsSection =
    service?.sections
      ?.benefits || {};

  const cta =
    service?.sections
      ?.cta || {};

  const featureGroups =
    Array.isArray(
      service?.feature_groups
    )
      ? service.feature_groups
      : [];

  const benefits =
    Array.isArray(
      benefitsSection?.items
    )
      ? benefitsSection.items
      : [];

  /*
   * ====================================================
   * CONTENT RESOLUTION
   * ====================================================
   */

  const serviceName =
    service.name ||
    t(
      "infrastructure.fallbackServiceName"
    );

  const heroEyebrow =
    hero.eyebrow ||
    serviceName;

  const heroTitle =
    hero.title ||
    serviceName;

  const heroDescription =
    hero.description ||
    service.short_description ||
    "";

  const introDescription =
    intro.description ||
    service.full_description ||
    "";

  const primaryButtonLabel =
    hero.button_label ||
    t(
      "infrastructure.contactTeam"
    );

  const primaryButtonUrl =
    hero.button_url ||
    "/contact";

  const secondaryButtonLabel =
    hero?.metadata
      ?.secondary_button_label ||
    t(
      "infrastructure.viewCoverage"
    );

  const secondaryButtonUrl =
    hero?.metadata
      ?.secondary_button_url ||
    "#cakupan-layanan";

  /*
   * ====================================================
   * FEATURE GROUP ICON DATA
   * ====================================================
   */

  const resolvedFeatureGroups =
  featureGroups.map(
    (group, index) => ({
      ...group,
      Icon: getGroupIcon(index),
    })
  );

  return (
    <main>
      {/* ==================================================
          HERO
      ================================================== */}

      <section className="relative overflow-hidden bg-[#082B3A] text-white">
        <div className="pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full border border-white/5" />

        <div className="pointer-events-none absolute -right-16 -top-16 h-[300px] w-[300px] rounded-full border border-white/10" />

        <div className="pointer-events-none absolute bottom-[-180px] left-[32%] h-[380px] w-[380px] rounded-full bg-orange/5 blur-3xl" />

        <div className="container-jmt relative py-14 md:py-20 lg:py-24">
          {/* BREADCRUMB */}

          <nav className="flex flex-wrap items-center gap-2 text-sm text-white/55">
            <Link
              to="/"
              className="transition hover:text-orange"
            >
              {t(
                "nav.home"
              )}
            </Link>

            <span>/</span>

            <Link
              to="/services"
              className="transition hover:text-orange"
            >
              {t(
                "nav.services"
              )}
            </Link>

            <span>/</span>

            <span className="text-white/90">
              {
                serviceName
              }
            </span>
          </nav>

          <div className="mt-12 grid items-center gap-12 lg:grid-cols-[1.12fr_.88fr] lg:gap-16">
            {/* LEFT */}

            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-orange/30 bg-orange/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-orange">
                <Network
                  size={15}
                />

                {
                  heroEyebrow
                }
              </div>

              <h1 className="mt-6 max-w-4xl text-4xl font-bold leading-[1.15] md:text-5xl lg:text-[56px]">
                {
                  heroTitle
                }
              </h1>

              {heroDescription && (
                <p className="mt-7 max-w-3xl text-base leading-8 text-white/75 md:text-lg md:leading-9">
                  {
                    heroDescription
                  }
                </p>
              )}

              {introDescription && (
                <p className="mt-4 max-w-3xl text-base leading-8 text-white/65">
                  {
                    introDescription
                  }
                </p>
              )}

              <div className="mt-9 flex flex-wrap gap-3">
                <SmartLink
                  to={
                    primaryButtonUrl
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-orange px-6 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                >
                  {
                    primaryButtonLabel
                  }

                  <ArrowRight
                    size={17}
                  />
                </SmartLink>

                <SmartLink
                  to={
                    secondaryButtonUrl
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  {
                    secondaryButtonLabel
                  }
                </SmartLink>
              </div>
            </div>

            {/* RIGHT */}

            <div className="relative">
              {service.image_url ? (
                <div className="overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-2 shadow-2xl">
                  <img
                    src={
                      service.image_url
                    }
                    alt={
                      serviceName
                    }
                    className="h-[420px] w-full rounded-[26px] object-cover"
                  />
                </div>
              ) : (
                <div className="relative rounded-[32px] border border-white/10 bg-white/[0.06] p-6 backdrop-blur">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5">
                      <Server
                        size={28}
                        className="text-orange"
                      />

                      <p className="mt-8 text-sm font-semibold">
                        {t(
                          "infrastructure.visualServerStorage"
                        )}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5">
                      <Network
                        size={28}
                        className="text-orange"
                      />

                      <p className="mt-8 text-sm font-semibold">
                        {t(
                          "infrastructure.visualNetworkInfrastructure"
                        )}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5">
                      <ShieldCheck
                        size={28}
                        className="text-orange"
                      />

                      <p className="mt-8 text-sm font-semibold">
                        {t(
                          "infrastructure.visualSoftwareSecurity"
                        )}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5">
                      <Wrench
                        size={28}
                        className="text-orange"
                      />

                      <p className="mt-8 text-sm font-semibold">
                        {t(
                          "infrastructure.visualTechnicalSupport"
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-2xl bg-orange p-5">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
                        {t(
                          "infrastructure.visualEndToEnd"
                        )}
                      </p>

                      <p className="mt-1 font-bold">
                        {t(
                          "infrastructure.visualSolution"
                        )}
                      </p>
                    </div>

                    <ArrowRight
                      size={23}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          SERVICE COVERAGE
      ================================================== */}

      <section
        id="cakupan-layanan"
        className="bg-white py-16 md:py-24"
      >
        <div className="container-jmt">
          <div className="mx-auto max-w-3xl text-center">
            {featuresSection.eyebrow && (
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange">
                {
                  featuresSection.eyebrow
                }
              </p>
            )}

            {featuresSection.title && (
              <h2 className="mt-4 text-3xl font-bold leading-tight text-[#082B3A] md:text-4xl">
                {
                  featuresSection.title
                }
              </h2>
            )}

            {featuresSection.description && (
              <p className="mt-5 text-base leading-8 text-slate-500">
                {
                  featuresSection.description
                }
              </p>
            )}
          </div>

          {resolvedFeatureGroups.length >
          0 ? (
            <div className="mt-12 grid items-start gap-6 lg:grid-cols-3">
              {resolvedFeatureGroups.map(
                (
                  group,
                  index
                ) => {
                  const {
                    Icon,
                  } = group;

                  return (
                    <article
                      key={`${group.name}-${index}`}
                      className="group rounded-[28px] border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-orange/30 hover:shadow-[0_20px_60px_rgba(2,6,23,0.08)] md:p-7"
                    >
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange/10 text-orange">
                        <Icon
                          size={27}
                        />
                      </div>

                      <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-orange">
                        {String(
                          index + 1
                        ).padStart(
                          2,
                          "0"
                        )}
                      </p>

                      <h3 className="mt-2 text-xl font-bold leading-8 text-[#082B3A]">
                        {
                          group.name
                        }
                      </h3>

                      {group.description && (
                        <p className="mt-3 text-sm leading-7 text-slate-500">
                          {
                            group.description
                          }
                        </p>
                      )}

                      <div className="my-6 border-t border-slate-100" />

                      {Array.isArray(
                        group.features
                      ) &&
                      group.features
                        .length >
                        0 ? (
                        <ul className="space-y-3">
                          {group.features.map(
                            (
                              feature
                            ) => (
                              <ServiceListItem
                                key={
                                  feature.id ||
                                  feature.slug
                                }
                                feature={
                                  feature
                                }
                              />
                            )
                          )}
                        </ul>
                      ) : (
                        <p className="text-sm text-slate-400">
                          {t(
                            "infrastructure.noCoverage"
                          )}
                        </p>
                      )}
                    </article>
                  );
                }
              )}
            </div>
          ) : (
            <div className="mt-12 rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
              <Network
                size={34}
                className="mx-auto text-slate-300"
              />

              <p className="mt-4 text-sm text-slate-500">
                {t(
                  "infrastructure.noCoverage"
                )}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ==================================================
          BENEFITS
      ================================================== */}

      <section className="bg-slate-50 py-16 md:py-24">
        <div className="container-jmt">
          <div className="grid gap-12 lg:grid-cols-[.75fr_1.25fr] lg:gap-16">
            {/* LEFT */}

            <div>
              {benefitsSection.eyebrow && (
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange">
                  {
                    benefitsSection.eyebrow
                  }
                </p>
              )}

              {benefitsSection.title && (
                <h2 className="mt-4 text-3xl font-bold leading-tight text-[#082B3A] md:text-4xl">
                  {
                    benefitsSection.title
                  }
                </h2>
              )}

              {benefitsSection.description && (
                <p className="mt-6 text-base leading-8 text-slate-500">
                  {
                    benefitsSection.description
                  }
                </p>
              )}

              <div className="mt-8 hidden lg:block">
                <div className="grid max-w-xs grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-[#082B3A] p-5 text-white">
                    <Server
                      size={25}
                      className="text-orange"
                    />

                    <p className="mt-8 text-xs font-semibold leading-5 text-white/75">
                      {t(
                        "infrastructure.reliableInfrastructure"
                      )}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-orange p-5 text-white">
                    <Network
                      size={25}
                    />

                    <p className="mt-8 text-xs font-semibold leading-5">
                      {t(
                        "infrastructure.integratedNetwork"
                      )}
                    </p>
                  </div>

                  <div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange/10 text-orange">
                        <Layers
                          size={20}
                        />
                      </div>

                      <p className="text-xs font-semibold text-[#082B3A]">
                        {t(
                          "infrastructure.scalableSupport"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT */}

            {benefits.length >
            0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {benefits.map(
                  (
                    benefit,
                    index
                  ) => {
                    const BenefitIcon =
                      getBenefitIcon(
                        benefit.icon_name
                      );

                    const benefitTitle =
                      benefit.title ||
                      benefit.label ||
                      "";

                    const benefitDescription =
                      benefit.description ||
                      benefit.value ||
                      "";

                    return (
                      <article
                        key={
                          benefit.id ||
                          `${benefitTitle}-${index}`
                        }
                        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange/30 hover:shadow-lg"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange/10 text-orange">
                          <BenefitIcon
                            size={23}
                          />
                        </div>

                        {benefitTitle && (
                          <h3 className="mt-5 text-lg font-bold leading-7 text-[#082B3A]">
                            {
                              benefitTitle
                            }
                          </h3>
                        )}

                        {benefitDescription && (
                          <p className="mt-3 text-sm leading-7 text-slate-500">
                            {
                              benefitDescription
                            }
                          </p>
                        )}
                      </article>
                    );
                  }
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center rounded-[32px] border border-slate-200 bg-white p-10">
                <div className="text-center">
                  <Zap
                    size={38}
                    className="mx-auto text-orange"
                  />

                  <p className="mt-4 text-sm font-semibold text-[#082B3A]">
                    {
                      benefitsSection.title
                    }
                  </p>

                  {benefitsSection.description && (
                    <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-slate-500">
                      {
                        benefitsSection.description
                      }
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ==================================================
          CTA
      ================================================== */}

      <section className="bg-white py-16 md:py-24">
        <div className="container-jmt">
          <div className="relative overflow-hidden rounded-[32px] bg-[#082B3A] px-6 py-12 text-white shadow-xl md:px-10 lg:px-14 lg:py-14">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10" />

            <div className="pointer-events-none absolute -bottom-32 right-[18%] h-72 w-72 rounded-full bg-orange/10 blur-3xl" />

            <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
              <div className="max-w-3xl">
                {cta.eyebrow && (
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange">
                    {
                      cta.eyebrow
                    }
                  </p>
                )}

                <h2 className="mt-3 text-3xl font-bold leading-tight md:text-4xl">
                  {cta.title ||
                    serviceName}
                </h2>

                {cta.description && (
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65 md:text-base">
                    {
                      cta.description
                    }
                  </p>
                )}
              </div>

              <SmartLink
                to={
                  cta.button_url ||
                  "/contact"
                }
                className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-orange px-6 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
              >
                {cta.button_label ||
                  t(
                    "infrastructure.contactTeam"
                  )}

                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </SmartLink>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}