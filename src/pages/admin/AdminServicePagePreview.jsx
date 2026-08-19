import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  AlertTriangle,
  ArrowLeft,
  ExternalLink,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";

import {
  Link,
  useParams,
} from "react-router-dom";

import ServicePageSectionsRenderer from "../../components/services/ServicePageSectionsRenderer";

import {
  getAdminServiceFeatures,
} from "../../services/serviceService";

import {
  getAdminServicePagePreview,
} from "../../services/servicePageService";

/* ======================================================
   FALLBACK
====================================================== */

function createPreviewFallback(
  service
) {
  return [
    {
      id:
        "preview-fallback-hero",

      section_key:
        "hero",

      section_type:
        "hero",

      eyebrow:
        "Product & Services",

      title:
        service?.name || "",

      description:
        service?.short_description ||
        "",

      image_url:
        service?.image_url || "",

      button_label:
        "Hubungi Kami",

      button_url:
        "/contact",

      sort_order: 1,

      status:
        "draft",
    },

    {
      id:
        "preview-fallback-intro",

      section_key:
        "intro",

      section_type:
        "intro",

      eyebrow:
        "Product Overview",

      title:
        service?.name || "",

      description:
        service?.full_description ||
        "",

      sort_order: 2,

      status:
        "draft",
    },

    {
      id:
        "preview-fallback-features",

      section_key:
        "features",

      section_type:
        "features",

      eyebrow:
        "Product Capabilities",

      title:
        "Fitur & Cakupan",

      sort_order: 3,

      status:
        "draft",
    },
  ];
}

/* ======================================================
   PAGE
====================================================== */

export default function AdminServicePagePreview() {
  const {
    id,
  } = useParams();

  const [
    service,
    setService,
  ] = useState(null);

  const [
    sections,
    setSections,
  ] = useState([]);

  const [
    features,
    setFeatures,
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

  const loadPreview =
    useCallback(
      async () => {
        if (!id) {
          setErrorMessage(
            "ID Service tidak tersedia."
          );

          setLoading(false);

          return;
        }

        try {
          setLoading(true);

          setErrorMessage("");

          const [
            previewData,
            featureData,
          ] =
            await Promise.all([
              getAdminServicePagePreview(
                id
              ),

              getAdminServiceFeatures(
                id
              ),
            ]);

          if (
            !previewData?.service
          ) {
            setService(null);

            setSections([]);

            setFeatures([]);

            return;
          }

          setService(
            previewData.service
          );

          setSections(
            Array.isArray(
              previewData.sections
            )
              ? previewData.sections
              : []
          );

          setFeatures(
            Array.isArray(
              featureData
            )
              ? featureData
              : []
          );
        } catch (error) {
          console.error(
            "Preview Product gagal dimuat:",
            error
          );

          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Preview Product gagal dimuat."
          );
        } finally {
          setLoading(false);
        }
      },
      [id]
    );

  useEffect(() => {
    loadPreview();
  }, [loadPreview]);

  /* ====================================================
     LOADING
  ==================================================== */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <LoaderCircle
            size={42}
            className="mx-auto animate-spin text-[#FF5A0A]"
          />

          <p className="mt-4 font-semibold text-[#082B3A]">
            Memuat Preview...
          </p>
        </div>
      </main>
    );
  }

  /* ====================================================
     ERROR
  ==================================================== */

  if (
    errorMessage ||
    !service
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-5">
        <div className="w-full max-w-xl rounded-3xl border border-red-200 bg-white p-8 text-center">
          <AlertTriangle
            size={40}
            className="mx-auto text-red-500"
          />

          <h1 className="mt-5 text-2xl font-bold text-[#082B3A]">
            Preview tidak dapat dimuat
          </h1>

          <p className="mt-3 text-sm text-red-600">
            {errorMessage ||
              "Service tidak ditemukan."}
          </p>

          <div className="mt-7 flex justify-center gap-3">
            <Link
              to="/admin/services"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600"
            >
              <ArrowLeft
                size={16}
              />

              Services
            </Link>

            <button
              type="button"
              onClick={
                loadPreview
              }
              className="inline-flex items-center gap-2 rounded-xl bg-[#082B3A] px-4 py-3 text-sm font-semibold text-white"
            >
              <RefreshCw
                size={16}
              />

              Coba Lagi
            </button>
          </div>
        </div>
      </main>
    );
  }

  const finalSections =
    sections.length > 0
      ? sections
      : createPreviewFallback(
          service
        );

  return (
    <main className="min-h-screen bg-white">
      {/* PREVIEW TOOLBAR */}

      <div className="sticky top-0 z-[100] border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-3">
          <div className="flex items-center gap-3">
            <Link
              to={`/admin/services/edit/${service.id}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#FF5A0A]"
            >
              <ArrowLeft
                size={16}
              />

              Kembali Edit
            </Link>

            <div className="hidden h-5 w-px bg-slate-200 sm:block" />

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#FF5A0A]">
                Admin Preview
              </p>

              <p className="hidden max-w-md truncate text-xs text-slate-500 md:block">
                {service.name}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={
                loadPreview
              }
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600"
            >
              <RefreshCw
                size={14}
              />

              Refresh
            </button>

            {service.status ===
              "published" &&
              service.slug && (
                <Link
                  to={`/services/${service.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#082B3A] px-3 py-2 text-xs font-semibold text-white"
                >
                  <ExternalLink
                    size={14}
                  />

                  Live
                </Link>
              )}
          </div>
        </div>
      </div>

      {/* PREVIEW INFORMATION */}

      <div className="border-b border-amber-200 bg-amber-50 px-5 py-3 text-center text-xs font-medium text-amber-800">
        Mode Preview Admin menampilkan konten Draft, Published, dan Archived.
        Badge status tidak muncul pada halaman publik.
      </div>

      {/* SAME RENDERER AS PUBLIC */}

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
        previewMode
      />
    </main>
  );
}