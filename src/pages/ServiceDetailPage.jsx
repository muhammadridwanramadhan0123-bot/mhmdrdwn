import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  AlertTriangle,
  ArrowLeft,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";

import {
  Link,
  useParams,
} from "react-router-dom";

import ServicePageSectionsRenderer from "../components/services/ServicePageSectionsRenderer";

import {
  useLanguage,
} from "../contexts/LanguageContext";

import {
  getPublishedServicePageBySlug,
} from "../services/serviceService";

/* ======================================================
   FALLBACK SECTIONS
====================================================== */

function createFallbackSections(
  service,
  t
) {
  return [
    {
      id: "fallback-hero",
      section_key: "hero",
      section_type: "hero",

      eyebrow: t(
        "serviceDetail.fallbackEyebrow"
      ),

      title:
        service?.name || "",

      description:
        service?.short_description ||
        "",

      image_url:
        service?.image_url || "",

      button_label: t(
        "serviceDetail.contact"
      ),

      button_url:
        "/contact",

      metadata: {},

      items: [],

      sort_order: 1,
    },

    {
      id: "fallback-intro",
      section_key: "intro",
      section_type: "intro",

      eyebrow: t(
        "serviceDetail.fallbackIntroEyebrow"
      ),

      title:
        service?.name || "",

      description:
        service?.full_description ||
        service?.short_description ||
        "",

      metadata: {},

      items: [],

      sort_order: 2,
    },

    {
      id: "fallback-features",
      section_key: "features",
      section_type: "features",

      eyebrow: t(
        "serviceDetail.fallbackFeaturesEyebrow"
      ),

      title: t(
        "serviceDetail.fallbackFeaturesTitle"
      ),

      description: "",

      metadata: {},

      items: [],

      sort_order: 3,
    },

    {
      id: "fallback-cta",
      section_key: "cta",
      section_type: "cta",

      eyebrow: t(
        "serviceDetail.fallbackCtaEyebrow"
      ),

      title: t(
        "serviceDetail.fallbackCtaTitle"
      ),

      description: t(
        "serviceDetail.fallbackCtaDescription"
      ),

      button_label: t(
        "serviceDetail.contact"
      ),

      button_url:
        "/contact",

      metadata: {},

      items: [],

      sort_order: 4,
    },
  ];
}

/* ======================================================
   PAGE
====================================================== */

export default function ServiceDetailPage() {
  const {
    slug,
  } = useParams();

  const {
    language,
    t,
  } = useLanguage();

  const [
    service,
    setService,
  ] = useState(null);

  const [
    features,
    setFeatures,
  ] = useState([]);

  const [
    sections,
    setSections,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  /* ====================================================
     LOAD
  ==================================================== */

  const loadPage =
    useCallback(
      async () => {
        if (!slug) {
          setService(null);
          setFeatures([]);
          setSections([]);
          setErrorMessage("");
          setLoading(false);

          return;
        }

        try {
          setLoading(true);
          setErrorMessage("");

          /*
           * Satu query utama.
           *
           * serviceService.js sudah menangani:
           *
           * services
           * + service_translations
           *
           * sections
           * + section_translations
           *
           * section items
           * + item_translations
           *
           * features
           * + feature_translations
           *
           * termasuk fallback EN -> ID.
           */
          const pageData =
            await getPublishedServicePageBySlug(
              slug,
              language
            );

          if (!pageData) {
            setService(null);
            setFeatures([]);
            setSections([]);

            return;
          }

          setService(
            pageData
          );

          setFeatures(
            Array.isArray(
              pageData.features
            )
              ? pageData.features
              : []
          );

          /*
           * serviceService.js mengembalikan:
           *
           * sections     = object map
           * section_list = array
           *
           * Renderer membutuhkan array.
           */
          setSections(
            Array.isArray(
              pageData.section_list
            )
              ? pageData.section_list
              : []
          );
        } catch (error) {
          console.error(
            "Halaman Service gagal dimuat:",
            error
          );

          setErrorMessage(
            error instanceof Error
              ? error.message
              : t(
                  "serviceDetail.errorTitle"
                )
          );

          setService(null);
          setFeatures([]);
          setSections([]);
        } finally {
          setLoading(false);
        }
      },
      [
        slug,
        language,
        t,
      ]
    );

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  /* ====================================================
     SEO
  ==================================================== */

  useEffect(() => {
    if (!service) {
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
      service.seo_title ||
      `${service.name} | Jasa Medika Transmedic`;

    descriptionMeta.setAttribute(
      "content",
      service.seo_description ||
        service.short_description ||
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
  }, [service]);

  /* ====================================================
     LOADING
  ==================================================== */

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-white">
        <div className="text-center">
          <LoaderCircle
            size={42}
            className="mx-auto animate-spin text-[#FF5A0A]"
          />

          <p className="mt-4 font-semibold text-[#082B3A]">
            {t(
              "serviceDetail.loading"
            )}
          </p>
        </div>
      </main>
    );
  }

  /* ====================================================
     ERROR
  ==================================================== */

  if (errorMessage) {
    return (
      <main className="bg-white py-24">
        <div className="container-jmt">
          <div className="mx-auto max-w-xl rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
            <AlertTriangle
              size={38}
              className="mx-auto text-red-500"
            />

            <h1 className="mt-5 text-2xl font-bold text-[#082B3A]">
              {t(
                "serviceDetail.errorTitle"
              )}
            </h1>

            <p className="mt-3 text-sm leading-7 text-red-700">
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={
                loadPage
              }
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#082B3A] px-5 py-3 text-sm font-semibold text-white"
            >
              <RefreshCw
                size={17}
              />

              {t(
                "serviceDetail.retry"
              )}
            </button>
          </div>
        </div>
      </main>
    );
  }

  /* ====================================================
     NOT FOUND
  ==================================================== */

  if (!service) {
    return (
      <main className="bg-white py-24">
        <div className="container-jmt">
          <div className="mx-auto max-w-xl text-center">
            <h1 className="text-3xl font-bold text-[#082B3A]">
              {t(
                "serviceDetail.notFoundTitle"
              )}
            </h1>

            <p className="mt-3 text-sm leading-7 text-slate-500">
              {t(
                "serviceDetail.notFoundDescription"
              )}
            </p>

            <Link
              to="/services"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#FF5A0A] px-5 py-3 text-sm font-semibold text-white"
            >
              <ArrowLeft
                size={17}
              />

              {t(
                "serviceDetail.backToServices"
              )}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /* ====================================================
     CMS / FALLBACK
  ==================================================== */

  const finalSections =
    sections.length > 0
      ? sections
      : createFallbackSections(
          service,
          t
        );

  return (
    <main className="overflow-hidden bg-white">
      <ServicePageSectionsRenderer
        service={
          service
        }
        sections={
          finalSections
        }
        features={
          features
        }
      />
    </main>
  );
}