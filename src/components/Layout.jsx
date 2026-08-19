import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Link,
  NavLink,
  Outlet,
  useLocation,
} from "react-router-dom";

import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Instagram,
  Linkedin,
  LoaderCircle,
  Mail,
  MapPin,
  Menu,
  Phone,
  RefreshCw,
  X,
} from "lucide-react";

import {
  getProductServicesMegaMenuData,
} from "../services/serviceService";

import {
  useLanguage,
} from "../contexts/LanguageContext";

/*
 * ======================================================
 * NAVIGATION
 * ======================================================
 */

const nav = [
  {
    id: "home",
    labelKey: "nav.home",
    to: "/",
  },
  {
    id: "services",
    labelKey: "nav.services",
    to: "/services",
  },
  {
    id: "portfolio",
    labelKey: "nav.portfolio",
    to: "/portfolio",
  },
  {
    id: "company",
    labelKey: "nav.company",
    to: "/company",
  },
  {
    id: "insight",
    labelKey: "nav.insight",
    to: "/insight",
  },
  {
    id: "contact",
    labelKey: "nav.contact",
    to: "/contact",
  },
];

const companyNavigation = [
  {
    key: "aboutUs",
    to: "/company/about-us",
  },
  {
    key: "milestone",
    to: "/company/milestone",
  },
  {
    key: "partners",
    to: "/company/partners",
  },
  {
    key: "location",
    to: "/company/location",
  },
  {
    key: "career",
    to: "/company/career",
  },
];

/*
 * ======================================================
 * FALLBACK PRODUCT NAVIGATION
 * ======================================================
 */

const fallbackProductNavigation = [
  {
    id: "fallback-simrs",
    name:
      "Sistem Informasi Manajemen Rumah Sakit (SIMRS) - Enterprise Resource Planning (ERP)",
    slug: "simrs-erp",
    features: [],
  },
  {
    id: "fallback-consulting",
    name:
      "Konsultasi & Pengelolaan Fasilitas Kesehatan",
    slug:
      "konsultasi-pengelolaan-fasilitas-kesehatan",
    features: [],
  },
  {
    id: "fallback-infrastructure",
    name:
      "Infrastruktur IT & Layanan Pendukung",
    slug:
      "infrastruktur-it-layanan-pendukung",
    features: [],
  },
  {
    id: "fallback-training",
    name:
      "Pelatihan & Pengembangan SDM",
    slug:
      "pelatihan-pengembangan-sdm",
    features: [],
  },
];

/*
 * ======================================================
 * SPECIAL SERVICE SLUGS
 * ======================================================
 */

const SIMRS_SERVICE_SLUG =
  "simrs-erp";

const INFRASTRUCTURE_SERVICE_SLUG =
  "infrastruktur-it-layanan-pendukung";

function isSimrsService(service) {
  return (
    service?.slug ===
    SIMRS_SERVICE_SLUG
  );
}

function isSingleLinkService(service) {
  return (
    service?.slug ===
    INFRASTRUCTURE_SERVICE_SLUG
  );
}

/*
 * ======================================================
 * SORT FEATURE
 * ======================================================
 */

function sortFeatureItems(
  items = []
) {
  return [...items].sort(
    (
      firstItem,
      secondItem
    ) => {
      const firstOrder =
        Number(
          firstItem.sort_order
        ) || 0;

      const secondOrder =
        Number(
          secondItem.sort_order
        ) || 0;

      if (
        firstOrder !==
        secondOrder
      ) {
        return (
          firstOrder -
          secondOrder
        );
      }

      return String(
        firstItem.name || ""
      ).localeCompare(
        String(
          secondItem.name ||
            ""
        ),
        "id"
      );
    }
  );
}

/*
 * ======================================================
 * FEATURE HIERARCHY
 * ======================================================
 */

function createFeatureGroups(
  features = []
) {
  const records =
    Array.isArray(
      features
    )
      ? features
      : [];

  const featureMap =
    new Map(
      records.map(
        (feature) => [
          feature.id,
          {
            ...feature,
            children: [],
          },
        ]
      )
    );

  /*
   * Child -> Parent
   */

  featureMap.forEach(
    (feature) => {
      if (
        !feature.parent_feature_id
      ) {
        return;
      }

      const parent =
        featureMap.get(
          feature.parent_feature_id
        );

      if (parent) {
        parent.children.push(
          feature
        );
      }
    }
  );

  /*
   * Sort children
   */

  featureMap.forEach(
    (feature) => {
      feature.children =
        sortFeatureItems(
          feature.children
        );
    }
  );

  /*
   * Root feature only
   */

  const rootFeatures =
    Array.from(
      featureMap.values()
    ).filter(
      (feature) =>
        !feature.parent_feature_id
    );

  const groupMap =
    new Map();

  const standalone = [];

  rootFeatures.forEach(
    (feature) => {
      const groupName =
        String(
          feature.group_name ||
            ""
        ).trim();

      if (!groupName) {
        standalone.push(
          feature
        );

        return;
      }

      if (
        !groupMap.has(
          groupName
        )
      ) {
        groupMap.set(
          groupName,
          {
            name: groupName,

            order:
              Number(
                feature.group_order
              ) || 0,

            features: [],
          }
        );
      }

      groupMap
        .get(groupName)
        .features.push(
          feature
        );
    }
  );

  const groups =
    Array.from(
      groupMap.values()
    )
      .map(
        (group) => ({
          ...group,

          features:
            sortFeatureItems(
              group.features
            ),
        })
      )
      .sort(
        (
          firstGroup,
          secondGroup
        ) => {
          if (
            firstGroup.order !==
            secondGroup.order
          ) {
            return (
              firstGroup.order -
              secondGroup.order
            );
          }

          return firstGroup.name.localeCompare(
            secondGroup.name,
            "id"
          );
        }
      );

  standalone.sort(
    (
      firstItem,
      secondItem
    ) => {
      const firstGroupOrder =
        Number(
          firstItem.group_order
        ) || 0;

      const secondGroupOrder =
        Number(
          secondItem.group_order
        ) || 0;

      if (
        firstGroupOrder !==
        secondGroupOrder
      ) {
        return (
          firstGroupOrder -
          secondGroupOrder
        );
      }

      return (
        (Number(
          firstItem.sort_order
        ) || 0) -
        (Number(
          secondItem.sort_order
        ) || 0)
      );
    }
  );

  return {
    groups,
    standalone,
  };
}

/*
 * ======================================================
 * FEATURE LINK
 * ======================================================
 */

function FeatureMenuLink({
  serviceSlug,
  feature,
  onClick,
  compact = false,
}) {
  const children =
    Array.isArray(
      feature.children
    )
      ? feature.children
      : [];

  const hasChildren =
    children.length > 0;

  return (
    <div className="group/item">
      <Link
        to={`/services/${serviceSlug}/features/${feature.slug}`}
        onClick={onClick}
        className={`group/link flex items-start gap-2.5 rounded-lg px-2 py-2 transition-all duration-200 hover:bg-orange-50/70 ${
          hasChildren
            ? "font-semibold text-[#082B3A]"
            : "text-slate-600"
        } ${
          compact
            ? "text-[11px] leading-5"
            : "text-[13px] leading-5"
        }`}
      >
        <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-orange" />

        <span className="min-w-0 flex-1">
          {feature.name}
        </span>

        <ChevronRight
          size={13}
          className="mt-[3px] shrink-0 text-slate-300 transition-all duration-200 group-hover/link:translate-x-0.5 group-hover/link:text-orange"
        />
      </Link>

      {hasChildren && (
        <div className="ml-4 mt-1 space-y-0.5 border-l border-slate-200 pl-3">
          {children.map(
            (child) => (
              <Link
                key={
                  child.id
                }
                to={`/services/${serviceSlug}/features/${child.slug}`}
                onClick={
                  onClick
                }
                className={`group/child flex items-start gap-2 rounded-lg px-2 py-1.5 text-slate-500 transition hover:bg-slate-50 hover:text-orange ${
                  compact
                    ? "text-[10px] leading-5"
                    : "text-[11px] leading-5"
                }`}
              >
                <span className="mt-[8px] h-1 w-1 shrink-0 rounded-full bg-slate-300 transition group-hover/child:bg-orange" />

                <span className="flex-1">
                  {
                    child.name
                  }
                </span>
              </Link>
            )
          )}
        </div>
      )}
    </div>
  );
}

/*
 * ======================================================
 * FEATURE GROUP
 * ======================================================
 */

function FeatureGroupBlock({
  group,
  serviceSlug,
  onClose,
  compact = false,
}) {
  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-start gap-2">
        <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-orange" />

        <p
          className={`font-bold uppercase leading-5 text-slate-500 ${
            compact
              ? "text-[9px] tracking-[0.1em]"
              : "text-[10px] tracking-[0.13em]"
          }`}
        >
          {group.name}
        </p>
      </div>

      <div className="space-y-0.5">
        {group.features.map(
          (feature) => (
            <FeatureMenuLink
              key={
                feature.id
              }
              serviceSlug={
                serviceSlug
              }
              feature={
                feature
              }
              compact={
                compact
              }
              onClick={
                onClose
              }
            />
          )
        )}
      </div>
    </div>
  );
}

/*
 * ======================================================
 * PRODUCT SERVICE CARD
 * ======================================================
 */

function ProductServiceCard({
  service,
  serviceNumber,
  onClose,
  compact = false,
  fillHeight = false,
  t,
}) {
  const isInfrastructure =
    isSingleLinkService(
      service
    );

  const isSimrs =
    isSimrsService(
      service
    );

  const groups =
    Array.isArray(
      service?.menu?.groups
    )
      ? service.menu.groups
      : [];

  const standalone =
    Array.isArray(
      service?.menu?.standalone
    )
      ? service.menu.standalone
      : [];

  return (
    <section
      className={`group/service relative min-w-0 overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.03)] transition-all duration-300 hover:border-orange-200 hover:shadow-[0_16px_45px_rgba(2,6,23,0.08)] ${
        fillHeight
          ? "h-full"
          : ""
      }`}
    >
      {/* HEADER */}

      <div
        className={`flex items-start gap-4 ${
          compact
            ? "px-5 pb-3 pt-4"
            : "px-5 pb-4 pt-5 sm:px-6 sm:pt-6"
        }`}
      >
        {/* NUMBER */}

        <div
          className={`flex shrink-0 items-center justify-center rounded-xl bg-slate-100 font-bold tracking-[0.08em] text-slate-400 transition-colors group-hover/service:bg-orange/10 group-hover/service:text-orange ${
            compact
              ? "h-8 w-8 text-[10px]"
              : "h-9 w-9 text-[11px]"
          }`}
        >
          {
            serviceNumber
          }
        </div>

        {/* TITLE */}

        <Link
          to={`/services/${service.slug}`}
          onClick={
            onClose
          }
          className="group/title flex min-w-0 flex-1 items-start justify-between gap-4"
        >
          <h3
            className={`min-w-0 font-bold text-[#082B3A] transition-colors group-hover/title:text-orange ${
              compact
                ? "text-[16px] leading-6"
                : "text-[17px] leading-7 xl:text-[18px]"
            }`}
          >
            {
              service.name
            }
          </h3>

          <div
            className={`mt-0.5 flex shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition-all duration-200 group-hover/title:border-orange group-hover/title:bg-orange group-hover/title:text-white ${
              compact
                ? "h-8 w-8"
                : "h-9 w-9"
            }`}
          >
            <ArrowRight
              size={
                compact
                  ? 14
                  : 15
              }
              className="transition-transform group-hover/title:translate-x-0.5"
            />
          </div>
        </Link>
      </div>

      <div
        className={`border-t border-slate-100 ${
          compact
            ? "mx-5"
            : "mx-5 sm:mx-6"
        }`}
      />

      {/* ================================================
          INFRASTRUCTURE SINGLE LINK
      ================================================ */}

      {isInfrastructure ? (
        <Link
          to={`/services/${service.slug}`}
          onClick={
            onClose
          }
          className={`group/infra block ${
            compact
              ? "px-5 py-4"
              : "px-5 py-5 sm:px-6 sm:py-6"
          }`}
        >
          <p
            className={`text-slate-500 ${
              compact
                ? "text-xs leading-6"
                : "text-sm leading-7"
            }`}
          >
            {t(
              "servicesMenu.infrastructureDescription"
            )}
          </p>

          <div
            className={`flex flex-wrap gap-2 ${
              compact
                ? "mt-3"
                : "mt-5"
            }`}
          >
            {[
              "servicesMenu.hardware",
              "servicesMenu.software",
              "servicesMenu.network",
            ].map(
              (key) => (
                <span
                  key={
                    key
                  }
                  className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-slate-500 transition group-hover/infra:border-orange-200 group-hover/infra:bg-orange-50 group-hover/infra:text-orange"
                >
                  {t(key)}
                </span>
              )
            )}
          </div>

          <div
            className={`flex items-center gap-2 text-xs font-bold text-[#082B3A] transition-colors group-hover/infra:text-orange ${
              compact
                ? "mt-3"
                : "mt-5"
            }`}
          >
            {t(
              "servicesMenu.viewDetails"
            )}

            <ArrowRight
              size={13}
              className="transition-transform group-hover/infra:translate-x-1"
            />
          </div>
        </Link>
      ) : (
        <div
          className={
            compact
              ? "px-5 pb-4 pt-3"
              : "px-5 pb-5 pt-4 sm:px-6 sm:pb-6"
          }
        >
          {/* ============================================
              SIMRS SPECIAL LAYOUT

              LEFT
              Solusi Klinis

              RIGHT
              Operasional
              TransHealthcare Ecosystem
          ============================================ */}

          {isSimrs &&
          groups.length > 0 ? (
            <div className="grid items-start gap-x-8 gap-y-6 md:grid-cols-2">
              {/* LEFT */}

              <div className="min-w-0">
                {groups[0] && (
                  <FeatureGroupBlock
                    group={
                      groups[0]
                    }
                    serviceSlug={
                      service.slug
                    }
                    onClose={
                      onClose
                    }
                  />
                )}

                {standalone.length >
                  0 && (
                  <div className="mt-5 border-t border-slate-100 pt-4">
                    {standalone.map(
                      (
                        feature
                      ) => (
                        <FeatureMenuLink
                          key={
                            feature.id
                          }
                          serviceSlug={
                            service.slug
                          }
                          feature={
                            feature
                          }
                          onClick={
                            onClose
                          }
                        />
                      )
                    )}
                  </div>
                )}
              </div>

              {/* RIGHT */}

              <div className="min-w-0 space-y-7">
                {groups
                  .slice(1)
                  .map(
                    (
                      group
                    ) => (
                      <FeatureGroupBlock
                        key={
                          group.name
                        }
                        group={
                          group
                        }
                        serviceSlug={
                          service.slug
                        }
                        onClose={
                          onClose
                        }
                      />
                    )
                  )}
              </div>
            </div>
          ) : (
            <>
              {/* NORMAL GROUPS */}

              {groups.length >
                0 && (
                <div
                  className={`grid ${
                    compact
                      ? "gap-y-3"
                      : "gap-x-6 gap-y-5"
                  } ${
                    !compact &&
                    groups.length >
                      1
                      ? "md:grid-cols-2"
                      : "grid-cols-1"
                  }`}
                >
                  {groups.map(
                    (
                      group
                    ) => (
                      <FeatureGroupBlock
                        key={
                          group.name
                        }
                        group={
                          group
                        }
                        serviceSlug={
                          service.slug
                        }
                        compact={
                          compact
                        }
                        onClose={
                          onClose
                        }
                      />
                    )
                  )}
                </div>
              )}

              {/* STANDALONE */}

              {standalone.length >
                0 && (
                <div
                  className={`${
                    groups.length > 0
                      ? compact
                        ? "mt-3 border-t border-slate-100 pt-3"
                        : "mt-5 border-t border-slate-100 pt-4"
                      : ""
                  } ${
                    !compact &&
                    standalone.length >
                      4
                      ? "grid gap-x-5 md:grid-cols-2"
                      : "space-y-0.5"
                  }`}
                >
                  {standalone.map(
                    (
                      feature
                    ) => (
                      <FeatureMenuLink
                        key={
                          feature.id
                        }
                        serviceSlug={
                          service.slug
                        }
                        feature={
                          feature
                        }
                        compact={
                          compact
                        }
                        onClick={
                          onClose
                        }
                      />
                    )
                  )}
                </div>
              )}
            </>
          )}

          {/* EMPTY */}

          {groups.length ===
            0 &&
            standalone.length ===
              0 && (
              <Link
                to={`/services/${service.slug}`}
                onClick={
                  onClose
                }
                className="group/empty flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
              >
                <p className="text-xs leading-6 text-slate-500">
                  {t(
                    "servicesMenu.viewComplete"
                  )}
                </p>

                <ArrowRight
                  size={14}
                  className="shrink-0 text-slate-300 transition group-hover/empty:translate-x-1 group-hover/empty:text-orange"
                />
              </Link>
            )}
        </div>
      )}
    </section>
  );
}

/*
 * ======================================================
 * LANGUAGE SWITCH
 * ======================================================
 */

function LanguageSwitch({
  language,
  setLanguage,
  t,
  compact = false,
}) {
  return (
    <div
      className={`inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 ${
        compact
          ? "w-full"
          : ""
      }`}
      aria-label={
        t(
          "language.title"
        )
      }
    >
      <button
        type="button"
        onClick={() =>
          setLanguage(
            "id"
          )
        }
        aria-pressed={
          language ===
          "id"
        }
        className={`rounded-lg font-bold transition-all duration-200 ${
          compact
            ? "flex-1 px-4 py-2.5 text-xs"
            : "px-3 py-2 text-[11px]"
        } ${
          language ===
          "id"
            ? "bg-[#082B3A] text-white shadow-sm"
            : "text-slate-400 hover:bg-white hover:text-[#082B3A]"
        }`}
      >
        ID
      </button>

      <button
        type="button"
        onClick={() =>
          setLanguage(
            "en"
          )
        }
        aria-pressed={
          language ===
          "en"
        }
        className={`rounded-lg font-bold transition-all duration-200 ${
          compact
            ? "flex-1 px-4 py-2.5 text-xs"
            : "px-3 py-2 text-[11px]"
        } ${
          language ===
          "en"
            ? "bg-[#082B3A] text-white shadow-sm"
            : "text-slate-400 hover:bg-white hover:text-[#082B3A]"
        }`}
      >
        EN
      </button>
    </div>
  );
}

/*
 * ======================================================
 * LAYOUT
 * ======================================================
 */

export default function Layout() {
  const {
    language,
    setLanguage,
    t,
  } = useLanguage();

  const [
    open,
    setOpen,
  ] = useState(false);

  const [
    desktopProductOpen,
    setDesktopProductOpen,
  ] = useState(false);

  const [
    desktopCompanyOpen,
    setDesktopCompanyOpen,
  ] = useState(false);

  const [
    mobileProductOpen,
    setMobileProductOpen,
  ] = useState(false);

  const [
    mobileProductSection,
    setMobileProductSection,
  ] = useState("");

  const [
    mobileCompanyOpen,
    setMobileCompanyOpen,
  ] = useState(false);

  const [
    productServices,
    setProductServices,
  ] = useState([]);

  const [
    productLoading,
    setProductLoading,
  ] = useState(true);

  const [
    productError,
    setProductError,
  ] = useState(false);

  const headerRef =
    useRef(null);

  const companyDropdownRef =
    useRef(null);

  const {
    pathname,
  } = useLocation();

  const isProductActive =
    pathname.startsWith(
      "/services"
    );

  const isCompanyActive =
    pathname.startsWith(
      "/company"
    );

  /*
   * ====================================================
   * LOAD PRODUCT MENU
   * ====================================================
   */

  const loadProductMenu =
  useCallback(
    async () => {
      try {
        setProductLoading(
          true
        );

        setProductError(
          false
        );

        /*
         * LanguageContext:
         *
         * ID → "id"
         * EN → "en"
         */
        const data =
          await getProductServicesMegaMenuData(
            language
          );

        setProductServices(
          Array.isArray(
            data
          ) &&
            data.length > 0
            ? data
            : fallbackProductNavigation
        );
      } catch (error) {
        console.error(
          "Product & Services navbar gagal dimuat:",
          error
        );

        /*
         * Jika query gagal,
         * fallback Bahasa Indonesia.
         */
        setProductServices(
          fallbackProductNavigation
        );

        setProductError(
          true
        );
      } finally {
        setProductLoading(
          false
        );
      }
    },

    /*
     * PENTING:
     *
     * Saat ID / EN berubah,
     * fungsi dibuat ulang
     * sehingga data Supabase
     * dimuat ulang.
     */
    [language]
  );

  useEffect(() => {
    loadProductMenu();
  }, [loadProductMenu]);

  /*
   * ====================================================
   * BUILD HIERARCHY
   * ====================================================
   */

  const productMenuData =
    useMemo(
      () =>
        productServices.map(
          (service) => ({
            ...service,

            menu:
              createFeatureGroups(
                service.features
              ),
          })
        ),
      [productServices]
    );

  /*
   * ====================================================
   * CLOSE WHEN ROUTE CHANGES
   * ====================================================
   */

  useEffect(() => {
    setOpen(false);

    setDesktopProductOpen(
      false
    );

    setDesktopCompanyOpen(
      false
    );

    setMobileProductOpen(
      false
    );

    setMobileProductSection(
      ""
    );

    setMobileCompanyOpen(
      false
    );
  }, [pathname]);

  /*
   * ====================================================
   * CLICK OUTSIDE + ESC
   * ====================================================
   */

  useEffect(() => {
    function handleClickOutside(
      event
    ) {
      if (
        headerRef.current &&
        !headerRef.current.contains(
          event.target
        )
      ) {
        setDesktopProductOpen(
          false
        );

        setDesktopCompanyOpen(
          false
        );
      }

      if (
        companyDropdownRef.current &&
        !companyDropdownRef.current.contains(
          event.target
        )
      ) {
        setDesktopCompanyOpen(
          false
        );
      }
    }

    function handleEscape(
      event
    ) {
      if (
        event.key ===
        "Escape"
      ) {
        setDesktopProductOpen(
          false
        );

        setDesktopCompanyOpen(
          false
        );

        setMobileProductOpen(
          false
        );

        setMobileProductSection(
          ""
        );

        setMobileCompanyOpen(
          false
        );
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  /*
   * ====================================================
   * MOBILE HELPERS
   * ====================================================
   */

  function closeMobileMenu() {
    setOpen(false);

    setMobileProductOpen(
      false
    );

    setMobileProductSection(
      ""
    );

    setMobileCompanyOpen(
      false
    );
  }

  function toggleMobileMenu() {
    const nextOpen =
      !open;

    setOpen(
      nextOpen
    );

    if (!nextOpen) {
      setMobileProductOpen(
        false
      );

      setMobileProductSection(
        ""
      );

      setMobileCompanyOpen(
        false
      );
    }
  }

  /*
   * ====================================================
   * RENDER
   * ====================================================
   */

  return (
    <div className="min-h-screen">
      {/* ==================================================
          HEADER
      ================================================== */}

      <header
        ref={
          headerRef
        }
        className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur"
      >
        <div className="container-jmt flex h-20 items-center justify-between">
          {/* LOGO */}

          <Link
            to="/"
            onClick={
              closeMobileMenu
            }
            className="shrink-0"
          >
            <img
              src="/logo.webp"
              alt="Jasa Medika Transmedic"
              className="h-11 w-auto"
            />
          </Link>

          {/* ==================================================
              DESKTOP NAV
          ================================================== */}

          <nav className="hidden items-center gap-7 lg:flex">
            {nav.map(
              (item) => {
                const label =
                  t(
                    item.labelKey
                  );

                const to =
                  item.to;

                /*
                 * PRODUCT & SERVICES
                 */

                if (
                  item.id ===
                  "services"
                ) {
                  return (
                    <button
                      key={
                        to
                      }
                      type="button"
                      onMouseEnter={() => {
                        setDesktopProductOpen(
                          true
                        );

                        setDesktopCompanyOpen(
                          false
                        );
                      }}
                      onClick={() => {
                        setDesktopProductOpen(
                          (
                            current
                          ) =>
                            !current
                        );

                        setDesktopCompanyOpen(
                          false
                        );
                      }}
                      className={`inline-flex items-center gap-1.5 text-[13px] font-medium transition hover:text-orange ${
                        isProductActive
                          ? "text-orange"
                          : "text-ink"
                      }`}
                      aria-haspopup="menu"
                      aria-expanded={
                        desktopProductOpen
                      }
                    >
                      {label}

                      <ChevronDown
                        size={15}
                        className={`transition-transform duration-200 ${
                          desktopProductOpen
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </button>
                  );
                }

                /*
                 * COMPANY
                 */

                if (
                  item.id ===
                  "company"
                ) {
                  return (
                    <div
                      key={
                        to
                      }
                      ref={
                        companyDropdownRef
                      }
                      className="relative"
                      onMouseEnter={() => {
                        setDesktopCompanyOpen(
                          true
                        );

                        setDesktopProductOpen(
                          false
                        );
                      }}
                      onMouseLeave={() =>
                        setDesktopCompanyOpen(
                          false
                        )
                      }
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setDesktopCompanyOpen(
                            (
                              current
                            ) =>
                              !current
                          );

                          setDesktopProductOpen(
                            false
                          );
                        }}
                        className={`inline-flex items-center gap-1.5 text-[13px] font-medium transition hover:text-orange ${
                          isCompanyActive
                            ? "text-orange"
                            : "text-ink"
                        }`}
                        aria-haspopup="menu"
                        aria-expanded={
                          desktopCompanyOpen
                        }
                      >
                        {label}

                        <ChevronDown
                          size={15}
                          className={`transition-transform duration-200 ${
                            desktopCompanyOpen
                              ? "rotate-180"
                              : ""
                          }`}
                        />
                      </button>

                      {desktopCompanyOpen && (
                        <div
                          className="absolute left-1/2 top-full z-50 w-72 -translate-x-1/2 pt-5"
                          role="menu"
                        >
                          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-900/10">
                            <div className="border-b border-slate-100 px-4 py-3">
                              <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange">
                                {t(
                                  "company.title"
                                )}
                              </p>

                              <p className="mt-1 text-xs leading-5 text-slate-400">
                                {t(
                                  "company.description"
                                )}
                              </p>
                            </div>

                            <div className="mt-2 space-y-1">
                              {companyNavigation.map(
                                (
                                  companyItem
                                ) => {
                                  const isActive =
                                    pathname ===
                                    companyItem.to;

                                  return (
                                    <Link
                                      key={
                                        companyItem.to
                                      }
                                      to={
                                        companyItem.to
                                      }
                                      role="menuitem"
                                      onClick={() =>
                                        setDesktopCompanyOpen(
                                          false
                                        )
                                      }
                                      className={`group block rounded-xl px-4 py-3 transition ${
                                        isActive
                                          ? "bg-cream"
                                          : "hover:bg-slate-50"
                                      }`}
                                    >
                                      <div className="flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                          <p
                                            className={`text-sm font-semibold ${
                                              isActive
                                                ? "text-orange"
                                                : "text-ink group-hover:text-orange"
                                            }`}
                                          >
                                            {t(
                                              `company.${companyItem.key}`
                                            )}
                                          </p>

                                          <p className="mt-1 text-xs leading-5 text-slate-400">
                                            {t(
                                              `company.${companyItem.key}Description`
                                            )}
                                          </p>
                                        </div>

                                        <ArrowRight
                                          size={
                                            15
                                          }
                                          className={`shrink-0 transition-transform group-hover:translate-x-1 ${
                                            isActive
                                              ? "text-orange"
                                              : "text-slate-300 group-hover:text-orange"
                                          }`}
                                        />
                                      </div>
                                    </Link>
                                  );
                                }
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                /*
                 * NORMAL NAV
                 */

                return (
                  <NavLink
                    key={
                      to
                    }
                    to={
                      to
                    }
                    onMouseEnter={() => {
                      setDesktopProductOpen(
                        false
                      );

                      setDesktopCompanyOpen(
                        false
                      );
                    }}
                    className={({
                      isActive,
                    }) =>
                      `text-[13px] font-medium transition hover:text-orange ${
                        isActive
                          ? "text-orange"
                          : "text-ink"
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                );
              }
            )}
          </nav>

          {/* ==================================================
              LANGUAGE + CONTACT
          ================================================== */}

          <div className="hidden items-center gap-3 lg:flex">
            <LanguageSwitch
              language={
                language
              }
              setLanguage={
                setLanguage
              }
              t={
                t
              }
            />

            <Link
              to="/contact"
              onMouseEnter={() => {
                setDesktopProductOpen(
                  false
                );

                setDesktopCompanyOpen(
                  false
                );
              }}
              className="btn-primary inline-flex"
            >
              {t(
                "nav.contact"
              )}

              <ArrowRight
                size={16}
              />
            </Link>
          </div>

          {/* MOBILE BUTTON */}

          <button
            type="button"
            className="rounded-lg p-2 text-ink lg:hidden"
            onClick={
              toggleMobileMenu
            }
            aria-label={
              open
                ? t(
                    "common.close"
                  )
                : "Menu"
            }
            aria-expanded={
              open
            }
          >
            {open ? (
              <X />
            ) : (
              <Menu />
            )}
          </button>
        </div>

        {/* ==================================================
            DESKTOP PRODUCT MEGA MENU
        ================================================== */}

        {desktopProductOpen && (
          <div
            className="absolute left-0 top-full hidden w-full border-t border-slate-100 bg-white/95 shadow-[0_24px_80px_rgba(2,6,23,0.12)] backdrop-blur-xl lg:block"
            onMouseEnter={() =>
              setDesktopProductOpen(
                true
              )
            }
            onMouseLeave={() =>
              setDesktopProductOpen(
                false
              )
            }
          >
            <div className="max-h-[calc(100vh-5rem)] overflow-y-auto">
              <div className="container-jmt py-6">
                {/* HEADER */}

                <div className="relative mb-5 overflow-hidden rounded-[24px] bg-[#082B3A] px-6 py-5 text-white lg:px-7">
                  <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-orange/10 blur-3xl" />

                  <div className="relative flex items-center justify-between gap-8">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-orange">
                        {t(
                          "servicesMenu.eyebrow"
                        )}
                      </p>

                      <h2 className="mt-2 text-xl font-bold leading-tight lg:text-2xl">
                        {t(
                          "servicesMenu.title"
                        )}
                      </h2>

                      <p className="mt-2 max-w-3xl text-xs leading-6 text-white/60">
                        {t(
                          "servicesMenu.description"
                        )}
                      </p>
                    </div>

                    <Link
                      to="/services"
                      onClick={() =>
                        setDesktopProductOpen(
                          false
                        )
                      }
                      className="group inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white transition hover:border-orange hover:bg-orange"
                    >
                      {t(
                        "servicesMenu.viewAll"
                      )}

                      <ArrowRight
                        size={15}
                        className="transition-transform group-hover:translate-x-0.5"
                      />
                    </Link>
                  </div>
                </div>

                {/* LOADING */}

                {productLoading ? (
                  <div className="flex items-center justify-center py-14">
                    <LoaderCircle
                      size={27}
                      className="animate-spin text-orange"
                    />

                    <span className="ml-3 text-sm font-medium text-slate-500">
                      {t(
                        "servicesMenu.loading"
                      )}
                    </span>
                  </div>
                ) : (
                  <>
                    {/* ERROR */}

                    {productError && (
                      <div className="mb-5 flex items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3">
                        <p className="text-xs leading-6 text-amber-700">
                          {t(
                            "servicesMenu.temporaryData"
                          )}
                        </p>

                        <button
                          type="button"
                          onClick={
                            loadProductMenu
                          }
                          className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-amber-200 bg-white px-3 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
                        >
                          <RefreshCw
                            size={13}
                          />

                          {t(
                            "servicesMenu.reload"
                          )}
                        </button>
                      </div>
                    )}

                    {/* ======================================
                        FINAL DESKTOP LAYOUT

                        LEFT
                        01 SIMRS

                        RIGHT
                        02
                        03
                        04
                    ====================================== */}

                    <div className="grid items-stretch gap-4 lg:grid-cols-[1.08fr_.92fr]">
                      {/* LEFT */}

                      <div className="h-full">
                        {productMenuData[0] && (
                          <ProductServiceCard
                            service={
                              productMenuData[0]
                            }
                            serviceNumber="01"
                            fillHeight
                            t={
                              t
                            }
                            onClose={() =>
                              setDesktopProductOpen(
                                false
                              )
                            }
                          />
                        )}
                      </div>

                      {/* RIGHT */}

                      <div className="space-y-4">
                        {productMenuData
                          .slice(1)
                          .map(
                            (
                              service,
                              index
                            ) => (
                              <ProductServiceCard
                                key={
                                  service.id ||
                                  service.slug
                                }
                                service={
                                  service
                                }
                                serviceNumber={String(
                                  index +
                                    2
                                ).padStart(
                                  2,
                                  "0"
                                )}
                                compact
                                t={
                                  t
                                }
                                onClose={() =>
                                  setDesktopProductOpen(
                                    false
                                  )
                                }
                              />
                            )
                          )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================
            MOBILE NAV
        ================================================== */}

        {open && (
          <div className="max-h-[calc(100vh-5rem)] overflow-y-auto border-t border-slate-100 bg-white px-5 py-5 shadow-lg lg:hidden">
            <nav className="container-jmt flex flex-col gap-1 px-0">
              {/* LANGUAGE MOBILE */}

              <div className="mb-4 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-[#082B3A]">
                      {t(
                        "language.title"
                      )}
                    </p>

                    <p className="mt-0.5 text-[10px] text-slate-400">
                      {t(
                        "language.description"
                      )}
                    </p>
                  </div>

                  <span className="rounded-full bg-orange/10 px-2.5 py-1 text-[9px] font-bold uppercase text-orange">
                    {
                      language
                    }
                  </span>
                </div>

                <LanguageSwitch
                  language={
                    language
                  }
                  setLanguage={
                    setLanguage
                  }
                  t={
                    t
                  }
                  compact
                />
              </div>

              {nav.map(
                (item) => {
                  const label =
                    t(
                      item.labelKey
                    );

                  const to =
                    item.to;

                  /*
                   * PRODUCT MOBILE
                   */

                  if (
                    item.id ===
                    "services"
                  ) {
                    return (
                      <div
                        key={
                          to
                        }
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setMobileProductOpen(
                              (
                                current
                              ) =>
                                !current
                            );

                            setMobileCompanyOpen(
                              false
                            );
                          }}
                          className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                            isProductActive
                              ? "bg-cream text-orange"
                              : "text-ink hover:bg-slate-50"
                          }`}
                          aria-expanded={
                            mobileProductOpen
                          }
                        >
                          <span>
                            {label}
                          </span>

                          <ChevronDown
                            size={17}
                            className={`transition-transform duration-200 ${
                              mobileProductOpen
                                ? "rotate-180"
                                : ""
                            }`}
                          />
                        </button>

                        {mobileProductOpen && (
                          <div className="mt-2 space-y-2 rounded-2xl bg-slate-50 p-2">
                            <Link
                              to="/services"
                              onClick={
                                closeMobileMenu
                              }
                              className="flex items-center justify-between rounded-xl bg-[#082B3A] px-4 py-3 text-sm font-semibold text-white"
                            >
                              {t(
                                "servicesMenu.allServices"
                              )}

                              <ArrowRight
                                size={15}
                              />
                            </Link>

                            {productLoading ? (
                              <div className="flex items-center justify-center py-8">
                                <LoaderCircle
                                  size={22}
                                  className="animate-spin text-orange"
                                />
                              </div>
                            ) : (
                              productMenuData.map(
                                (
                                  service,
                                  index
                                ) => {
                                  const serviceOpen =
                                    mobileProductSection ===
                                    service.slug;

                                  const number =
                                    String(
                                      index +
                                        1
                                    ).padStart(
                                      2,
                                      "0"
                                    );

                                  /*
                                   * INFRASTRUCTURE
                                   */

                                  if (
                                    isSingleLinkService(
                                      service
                                    )
                                  ) {
                                    return (
                                      <Link
                                        key={
                                          service.id ||
                                          service.slug
                                        }
                                        to={`/services/${service.slug}`}
                                        onClick={
                                          closeMobileMenu
                                        }
                                        className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3.5 transition hover:border-orange-200 hover:bg-orange-50/50"
                                      >
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-bold text-slate-400 transition group-hover:bg-orange/10 group-hover:text-orange">
                                          {
                                            number
                                          }
                                        </div>

                                        <span className="min-w-0 flex-1 text-sm font-bold leading-6 text-[#082B3A]">
                                          {
                                            service.name
                                          }
                                        </span>

                                        <ArrowRight
                                          size={
                                            15
                                          }
                                          className="shrink-0 text-orange"
                                        />
                                      </Link>
                                    );
                                  }

                                  /*
                                   * NORMAL SERVICE MOBILE
                                   */

                                  return (
                                    <div
                                      key={
                                        service.id ||
                                        service.slug
                                      }
                                      className="overflow-hidden rounded-xl border border-slate-100 bg-white"
                                    >
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setMobileProductSection(
                                            (
                                              current
                                            ) =>
                                              current ===
                                              service.slug
                                                ? ""
                                                : service.slug
                                          )
                                        }
                                        className="flex w-full items-start gap-3 px-4 py-3.5 text-left"
                                        aria-expanded={
                                          serviceOpen
                                        }
                                      >
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-bold text-slate-400">
                                          {
                                            number
                                          }
                                        </div>

                                        <span className="min-w-0 flex-1 text-sm font-bold leading-6 text-[#082B3A]">
                                          {
                                            service.name
                                          }
                                        </span>

                                        <ChevronDown
                                          size={
                                            16
                                          }
                                          className={`mt-1 shrink-0 text-orange transition-transform duration-200 ${
                                            serviceOpen
                                              ? "rotate-180"
                                              : ""
                                          }`}
                                        />
                                      </button>

                                      {serviceOpen && (
                                        <div className="border-t border-slate-100 px-4 pb-4 pt-3">
                                          <Link
                                            to={`/services/${service.slug}`}
                                            onClick={
                                              closeMobileMenu
                                            }
                                            className="mb-4 inline-flex items-center gap-2 rounded-lg bg-orange/5 px-3 py-2 text-xs font-bold text-orange"
                                          >
                                            {t(
                                              "servicesMenu.viewMainPage"
                                            )}

                                            <ArrowRight
                                              size={
                                                13
                                              }
                                            />
                                          </Link>

                                          {/* GROUPS */}

                                          {service.menu.groups.map(
                                            (
                                              group
                                            ) => (
                                              <div
                                                key={
                                                  group.name
                                                }
                                                className="mb-5 last:mb-0"
                                              >
                                                <FeatureGroupBlock
                                                  group={
                                                    group
                                                  }
                                                  serviceSlug={
                                                    service.slug
                                                  }
                                                  compact
                                                  onClose={
                                                    closeMobileMenu
                                                  }
                                                />
                                              </div>
                                            )
                                          )}

                                          {/* STANDALONE */}

                                          {service.menu.standalone.length >
                                            0 && (
                                            <div
                                              className={
                                                service.menu.groups.length >
                                                0
                                                  ? "border-t border-slate-100 pt-3"
                                                  : ""
                                              }
                                            >
                                              {service.menu.standalone.map(
                                                (
                                                  feature
                                                ) => (
                                                  <FeatureMenuLink
                                                    key={
                                                      feature.id
                                                    }
                                                    serviceSlug={
                                                      service.slug
                                                    }
                                                    feature={
                                                      feature
                                                    }
                                                    compact
                                                    onClick={
                                                      closeMobileMenu
                                                    }
                                                  />
                                                )
                                              )}
                                            </div>
                                          )}

                                          {/* EMPTY */}

                                          {service.menu.groups.length ===
                                            0 &&
                                            service.menu.standalone.length ===
                                              0 && (
                                              <p className="text-xs leading-6 text-slate-400">
                                                {t(
                                                  "servicesMenu.detailAvailable"
                                                )}
                                              </p>
                                            )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                }
                              )
                            )}
                          </div>
                        )}
                      </div>
                    );
                  }

                  /*
                   * COMPANY MOBILE
                   */

                  if (
                    item.id ===
                    "company"
                  ) {
                    return (
                      <div
                        key={
                          to
                        }
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setMobileCompanyOpen(
                              (
                                current
                              ) =>
                                !current
                            );

                            setMobileProductOpen(
                              false
                            );

                            setMobileProductSection(
                              ""
                            );
                          }}
                          className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm font-medium transition ${
                            isCompanyActive
                              ? "bg-cream text-orange"
                              : "text-ink hover:bg-slate-50"
                          }`}
                          aria-expanded={
                            mobileCompanyOpen
                          }
                        >
                          <span>
                            {label}
                          </span>

                          <ChevronDown
                            size={17}
                            className={`transition-transform duration-200 ${
                              mobileCompanyOpen
                                ? "rotate-180"
                                : ""
                            }`}
                          />
                        </button>

                        {mobileCompanyOpen && (
                          <div className="ml-4 mt-1 space-y-1 border-l-2 border-orange/20 pl-3">
                            {companyNavigation.map(
                              (
                                companyItem
                              ) => {
                                const isActive =
                                  pathname ===
                                  companyItem.to;

                                return (
                                  <Link
                                    key={
                                      companyItem.to
                                    }
                                    to={
                                      companyItem.to
                                    }
                                    onClick={
                                      closeMobileMenu
                                    }
                                    className={`block rounded-lg px-4 py-3 text-sm transition ${
                                      isActive
                                        ? "bg-cream font-semibold text-orange"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-orange"
                                    }`}
                                  >
                                    {t(
                                      `company.${companyItem.key}`
                                    )}
                                  </Link>
                                );
                              }
                            )}
                          </div>
                        )}
                      </div>
                    );
                  }

                  /*
                   * NORMAL MOBILE NAV
                   */

                  return (
                    <Link
                      key={
                        to
                      }
                      to={
                        to
                      }
                      onClick={
                        closeMobileMenu
                      }
                      className={`rounded-lg px-4 py-3 text-sm font-medium transition ${
                        pathname ===
                        to
                          ? "bg-cream text-orange"
                          : "text-ink hover:bg-slate-50"
                      }`}
                    >
                      {label}
                    </Link>
                  );
                }
              )}
            </nav>
          </div>
        )}
      </header>

      {/* ==================================================
          MAIN
      ================================================== */}

      <main>
        <Outlet />
      </main>

      {/* ==================================================
          FOOTER
      ================================================== */}

      <footer className="bg-ink text-white">
        <div className="container-jmt grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <img
              src="/logo.webp"
              alt="Jasa Medika Transmedic"
              className="mb-5 h-12 rounded bg-white px-3 py-2"
            />

            <p className="max-w-lg text-sm leading-7 text-slate-300">
              {t(
                "footer.description"
              )}
            </p>

            <div className="mt-6 flex gap-3">
              {[
                Instagram,
                Linkedin,
              ].map(
                (
                  Icon,
                  index
                ) => (
                  <a
                    key={
                      index
                    }
                    href="#"
                    className="rounded-lg border border-white/15 p-2.5 transition hover:border-orange hover:text-orange"
                  >
                    <Icon
                      size={18}
                    />
                  </a>
                )
              )}
            </div>
          </div>

          {/* QUICK LINKS */}

          <div>
            <h3 className="mb-4 font-semibold">
              {t(
                "footer.quickLinks"
              )}
            </h3>

            <div className="space-y-3 text-sm text-slate-300">
              {nav
                .slice(1)
                .map(
                  (
                    item
                  ) => (
                    <Link
                      key={
                        item.to
                      }
                      to={
                        item.to
                      }
                      className="block transition hover:text-orange"
                    >
                      {t(
                        item.labelKey
                      )}
                    </Link>
                  )
                )}
            </div>
          </div>

          {/* CONTACT */}

          <div>
            <h3 className="mb-4 font-semibold">
              {t(
                "footer.contact"
              )}
            </h3>

            <div className="space-y-4 text-sm text-slate-300">
              <p className="flex gap-3">
                <MapPin
                  size={18}
                  className="mt-1 shrink-0 text-orange"
                />

                Gedung Paramarta
                Tridharma, Jl.
                Cikutra Baru Raya
                No. 28, Bandung
                40124
              </p>

              <p className="flex items-center gap-3">
                <Phone
                  size={18}
                  className="text-orange"
                />

                +62 878 7000
                7781
              </p>

              <p className="flex items-center gap-3">
                <Mail
                  size={18}
                  className="text-orange"
                />

                info@jasamedikatransmedic.com
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 py-5 text-center text-xs text-slate-400">
          ©{" "}
          {new Date().getFullYear()}{" "}
          PT Jasa Medika
          Transmedic.{" "}
          {t(
            "footer.rights"
          )}
        </div>
      </footer>
    </div>
  );
}