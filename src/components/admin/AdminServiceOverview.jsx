import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  FileText,
  ImageIcon,
  Layers3,
  LoaderCircle,
  RefreshCw,
  Rocket,
  Sparkles,
  XCircle,
} from "lucide-react";

import { Link } from "react-router-dom";

import {
  getAdminServiceFeatures,
} from "../../services/serviceService";

import {
  getAdminServicePagePreview,
} from "../../services/servicePageService";

/* ======================================================
   HELPERS
====================================================== */

function cleanText(value) {
  return String(value || "").trim();
}

function hasText(value) {
  return cleanText(value).length > 0;
}

function getStatusCount(items = [], status) {
  return items.filter(
    (item) => item?.status === status
  ).length;
}

function getSectionByKey(
  sections = [],
  sectionKey
) {
  return (
    sections.find(
      (section) =>
        section.section_key === sectionKey
    ) || null
  );
}

function getSectionItems(section) {
  return Array.isArray(section?.items)
    ? section.items
    : [];
}

function getProgressClass(progress) {
  if (progress >= 100) {
    return "bg-emerald-500";
  }

  if (progress >= 75) {
    return "bg-blue-500";
  }

  if (progress >= 50) {
    return "bg-amber-500";
  }

  return "bg-red-500";
}

function getProgressLabel(progress) {
  if (progress >= 100) {
    return "Siap";
  }

  if (progress >= 75) {
    return "Hampir Siap";
  }

  if (progress >= 50) {
    return "Perlu Dilengkapi";
  }

  return "Belum Siap";
}

function getProgressBadgeClass(progress) {
  if (progress >= 100) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (progress >= 75) {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  if (progress >= 50) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-red-200 bg-red-50 text-red-700";
}

function getServiceStatusClass(status) {
  if (status === "published") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "archived") {
    return "border-slate-300 bg-slate-100 text-slate-600";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

function getServiceStatusLabel(status) {
  if (status === "published") {
    return "Published";
  }

  if (status === "archived") {
    return "Archived";
  }

  return "Draft";
}

/* ======================================================
   CHECKLIST ITEM
====================================================== */

function ChecklistItem({
  passed,
  title,
  description,
  optional = false,
}) {
  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border px-4 py-4 ${
        passed
          ? "border-emerald-100 bg-emerald-50/60"
          : optional
            ? "border-slate-200 bg-slate-50"
            : "border-amber-200 bg-amber-50/60"
      }`}
    >
      <div
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
          passed
            ? "bg-emerald-100 text-emerald-600"
            : optional
              ? "bg-slate-200 text-slate-500"
              : "bg-amber-100 text-amber-600"
        }`}
      >
        {passed ? (
          <CheckCircle2 size={17} />
        ) : (
          <XCircle size={17} />
        )}
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-bold text-[#082B3A]">
            {title}
          </p>

          {optional && (
            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">
              Pendukung
            </span>
          )}
        </div>

        {description && (
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

/* ======================================================
   MEDIA ITEM
====================================================== */

function MediaItem({
  title,
  available,
  description,
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex min-w-0 items-start gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
            available
              ? "bg-emerald-50 text-emerald-600"
              : "bg-slate-100 text-slate-400"
          }`}
        >
          {available ? (
            <CheckCircle2 size={17} />
          ) : (
            <ImageIcon size={17} />
          )}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#082B3A]">
            {title}
          </p>

          {description && (
            <p className="mt-1 text-xs leading-5 text-slate-400">
              {description}
            </p>
          )}
        </div>
      </div>

      <span
        className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
          available
            ? "bg-emerald-50 text-emerald-700"
            : "bg-amber-50 text-amber-700"
        }`}
      >
        {available
          ? "Tersedia"
          : "Belum Ada"}
      </span>
    </div>
  );
}

/* ======================================================
   COMPONENT
====================================================== */

export default function AdminServiceOverview({
  service,
  onChangeTab,
}) {
  const [features, setFeatures] =
    useState([]);

  const [sections, setSections] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  /* ====================================================
     LOAD DATA
  ==================================================== */

  const loadOverview =
    useCallback(async () => {
      if (!service?.id) {
        setFeatures([]);
        setSections([]);
        setLoading(false);

        return;
      }

      try {
        setLoading(true);
        setErrorMessage("");

        const [
          featureData,
          pageData,
        ] = await Promise.all([
          getAdminServiceFeatures(
            service.id
          ),

          getAdminServicePagePreview(
            service.id
          ),
        ]);

        setFeatures(
          Array.isArray(featureData)
            ? featureData
            : []
        );

        setSections(
          Array.isArray(
            pageData?.sections
          )
            ? pageData.sections
            : []
        );
      } catch (error) {
        console.error(
          "Overview Product gagal dimuat:",
          error
        );

        setFeatures([]);
        setSections([]);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Overview Product gagal dimuat."
        );
      } finally {
        setLoading(false);
      }
    }, [service?.id]);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  /* ====================================================
     FLATTEN ITEMS
  ==================================================== */

  const allItems =
    useMemo(() => {
      return sections.flatMap(
        (section) =>
          Array.isArray(section.items)
            ? section.items
            : []
      );
    }, [sections]);

  /* ====================================================
     SUMMARY
  ==================================================== */

  const summary =
    useMemo(() => {
      return {
        features: {
          total:
            features.length,

          published:
            getStatusCount(
              features,
              "published"
            ),

          draft:
            getStatusCount(
              features,
              "draft"
            ),

          archived:
            getStatusCount(
              features,
              "archived"
            ),
        },

        sections: {
          total:
            sections.length,

          published:
            getStatusCount(
              sections,
              "published"
            ),

          draft:
            getStatusCount(
              sections,
              "draft"
            ),

          archived:
            getStatusCount(
              sections,
              "archived"
            ),
        },

        items: {
          total:
            allItems.length,

          published:
            getStatusCount(
              allItems,
              "published"
            ),

          draft:
            getStatusCount(
              allItems,
              "draft"
            ),

          archived:
            getStatusCount(
              allItems,
              "archived"
            ),
        },
      };
    }, [
      features,
      sections,
      allItems,
    ]);

  /* ====================================================
     IMPORTANT SECTIONS
  ==================================================== */

  const heroSection =
    getSectionByKey(
      sections,
      "hero"
    );

  const introSection =
    getSectionByKey(
      sections,
      "intro"
    );

  const featuresSection =
    getSectionByKey(
      sections,
      "features"
    );

  const whySection =
    getSectionByKey(
      sections,
      "why-simrs"
    );

  const benefitsSection =
    getSectionByKey(
      sections,
      "benefits"
    );

  const statsSection =
    getSectionByKey(
      sections,
      "module-stats"
    );

  const catalogSection =
    getSectionByKey(
      sections,
      "catalog"
    );

  const standardsSection =
    getSectionByKey(
      sections,
      "standards"
    );

  const integrationSection =
    getSectionByKey(
      sections,
      "integration"
    );

  const aiSection =
    getSectionByKey(
      sections,
      "ai-powered"
    );

  const ctaSection =
    getSectionByKey(
      sections,
      "cta"
    );

  const isSimrs =
    service?.slug ===
    "simrs-erp";

  /* ====================================================
     MEDIA CHECKS
  ==================================================== */

  const mediaChecks =
    useMemo(() => {
      const checks = [
        {
          key:
            "product-image",

          title:
            "Gambar Utama Product",

          available:
            hasText(
              service?.image_url
            ),

          description:
            "Digunakan sebagai visual utama Product.",
        },
        {
          key:
            "hero-image",

          title:
            "Hero Image",

          available:
            hasText(
              heroSection?.image_url
            ) ||
            hasText(
              service?.image_url
            ),

          description:
            "Visual utama pada Hero halaman Product.",
        },
      ];

      if (isSimrs) {
        checks.push(
          {
            key:
              "module-image",

            title:
              "Infografik Modul 62 / 49 / 13",

            available:
              hasText(
                statsSection?.image_url
              ),

            description:
              "Visual statistik modul SIMRS.",
          },

          {
            key:
              "catalog-pdf",

            title:
              "Katalog Modul SIMRS PDF",

            available:
              hasText(
                catalogSection?.file_url
              ),

            description:
              "File PDF katalog yang dapat diunduh.",
          },

          {
            key:
              "standards-image",

            title:
              "Visual Standarisasi",

            available:
              hasText(
                standardsSection?.image_url
              ),

            description:
              "HL7 FHIR, SNOMED CT, ICD, ISO.",
          },

          {
            key:
              "integration-image",

            title:
              "Visual SATUSEHAT & BPJS",

            available:
              hasText(
                integrationSection?.image_url
              ),

            description:
              "Visual integrasi nasional.",
          },

          {
            key:
              "ai-image",

            title:
              "Visual AI-Powered Solutions",

            available:
              hasText(
                aiSection?.image_url
              ),

            description:
              "Visual solusi Artificial Intelligence.",
          }
        );
      }

      return checks;
    }, [
      service?.image_url,
      heroSection,
      statsSection,
      catalogSection,
      standardsSection,
      integrationSection,
      aiSection,
      isSimrs,
    ]);

  const missingMedia =
    mediaChecks.filter(
      (item) =>
        !item.available
    ).length;

  /* ====================================================
     CONTENT CHECKLIST
  ==================================================== */

  const contentChecklist =
    useMemo(() => {
      const checklist = [
        {
          key: "name",

          title:
            "Nama Product",

          description:
            "Nama Product utama sudah tersedia.",

          passed:
            hasText(
              service?.name
            ),
        },

        {
          key: "slug",

          title:
            "Slug Product",

          description:
            "URL Product sudah tersedia.",

          passed:
            hasText(
              service?.slug
            ),
        },

        {
          key:
            "short-description",

          title:
            "Deskripsi Singkat",

          description:
            "Deskripsi singkat Product sudah diisi.",

          passed:
            hasText(
              service?.short_description
            ),
        },

        {
          key:
            "full-description",

          title:
            "Deskripsi Lengkap",

          description:
            "Deskripsi lengkap Product sudah diisi.",

          passed:
            hasText(
              service?.full_description
            ),
        },

        {
          key:
            "features",

          title:
            "Fitur & Cakupan",

          description:
            `${features.length} fitur tersedia.`,

          passed:
            features.length > 0,
        },

        {
          key:
            "hero",

          title:
            "Hero Section",

          description:
            "Section Hero sudah dibuat.",

          passed:
            Boolean(
              heroSection
            ),
        },

        {
          key:
            "intro",

          title:
            "Intro Section",

          description:
            "Section penjelasan Product sudah dibuat.",

          passed:
            Boolean(
              introSection
            ),
        },

        {
          key:
            "features-section",

          title:
            "Section Fitur",

          description:
            "Section Fitur & Cakupan sudah tersedia.",

          passed:
            Boolean(
              featuresSection
            ),
        },
      ];

      /*
       * Checklist khusus SIMRS.
       */

      if (isSimrs) {
        checklist.push(
          {
            key:
              "why-simrs",

            title:
              "Mengapa SIMRS",

            description:
              `${getSectionItems(
                whySection
              ).length} dari 6 item tersedia.`,

            passed:
              Boolean(
                whySection
              ) &&
              getSectionItems(
                whySection
              ).length >= 6,
          },

          {
            key:
              "benefits",

            title:
              "Keunggulan SIMRS",

            description:
              `${getSectionItems(
                benefitsSection
              ).length} dari 6 item tersedia.`,

            passed:
              Boolean(
                benefitsSection
              ) &&
              getSectionItems(
                benefitsSection
              ).length >= 6,
          },

          {
            key:
              "stats",

            title:
              "Statistik Modul",

            description:
              "62 Modul Utama, 49 Modul Aplikasi dan 13 Modul Terintegrasi.",

            passed:
              Boolean(
                statsSection
              ) &&
              getSectionItems(
                statsSection
              ).length >= 3,
          },

          {
            key:
              "catalog",

            title:
              "Katalog SIMRS",

            description:
              "Section katalog sudah tersedia.",

            passed:
              Boolean(
                catalogSection
              ),
          },

          {
            key:
              "standards",

            title:
              "Standarisasi",

            description:
              "Section standar interoperabilitas sudah tersedia.",

            passed:
              Boolean(
                standardsSection
              ),
          },

          {
            key:
              "integration",

            title:
              "SATUSEHAT & BPJS",

            description:
              "Section integrasi nasional sudah tersedia.",

            passed:
              Boolean(
                integrationSection
              ),
          },

          {
            key:
              "ai",

            title:
              "AI-Powered Solutions",

            description:
              "Section solusi AI sudah tersedia.",

            passed:
              Boolean(
                aiSection
              ),
          }
        );
      } else {
        checklist.push({
          key: "cta",

          title:
            "CTA",

          description:
            "Call-to-action Product sudah tersedia.",

          passed:
            Boolean(
              ctaSection
            ),
        });
      }

      return checklist;
    }, [
      service,
      features,
      heroSection,
      introSection,
      featuresSection,
      whySection,
      benefitsSection,
      statsSection,
      catalogSection,
      standardsSection,
      integrationSection,
      aiSection,
      ctaSection,
      isSimrs,
    ]);

  /* ====================================================
     READINESS
  ==================================================== */

  const readiness =
    useMemo(() => {
      const mediaChecklist =
        mediaChecks.map(
          (media) => ({
            key:
              media.key,

            passed:
              media.available,
          })
        );

      const allChecks = [
        ...contentChecklist,
        ...mediaChecklist,
      ];

      if (
        allChecks.length === 0
      ) {
        return 0;
      }

      const passed =
        allChecks.filter(
          (item) =>
            item.passed
        ).length;

      return Math.round(
        (passed /
          allChecks.length) *
          100
      );
    }, [
      contentChecklist,
      mediaChecks,
    ]);

  /* ====================================================
     LOADING
  ==================================================== */

  if (loading) {
    return (
      <section className="flex min-h-[420px] items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="text-center">
          <LoaderCircle
            size={38}
            className="mx-auto animate-spin text-[#FF5A0A]"
          />

          <p className="mt-4 font-semibold text-[#082B3A]">
            Memuat Overview Product...
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Menghitung kesiapan konten dari Supabase.
          </p>
        </div>
      </section>
    );
  }

  /* ====================================================
     RENDER
  ==================================================== */

  return (
    <div className="space-y-6">
      {/* ==================================================
          ERROR
      ================================================== */}

      {errorMessage && (
        <div
          role="alert"
          className="flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle
              size={20}
              className="mt-0.5 shrink-0 text-red-600"
            />

            <div>
              <p className="font-semibold text-red-800">
                Overview gagal dimuat
              </p>

              <p className="mt-1 text-sm text-red-700">
                {errorMessage}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={
              loadOverview
            }
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700"
          >
            <RefreshCw size={14} />
            Coba Lagi
          </button>
        </div>
      )}

      {/* ==================================================
          READINESS HERO
      ================================================== */}

      <section className="relative overflow-hidden rounded-3xl bg-[#082B3A] p-6 text-white shadow-xl shadow-slate-900/5 md:p-8">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#FF5A0A]/20 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-orange-300">
                <Sparkles size={14} />
                Product Readiness
              </span>

              <span
                className={`rounded-full border px-3 py-1 text-[10px] font-bold ${getServiceStatusClass(
                  service.status
                )}`}
              >
                {getServiceStatusLabel(
                  service.status
                )}
              </span>
            </div>

            <h2 className="mt-4 max-w-3xl text-2xl font-bold leading-tight md:text-3xl">
              Kesiapan {service.name}
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60">
              Progress dihitung dari informasi Product, fitur,
              struktur halaman CMS, item konten, serta media yang
              dibutuhkan.
            </p>

            {/* PROGRESS */}

            <div className="mt-7 max-w-3xl">
              <div className="mb-2 flex items-center justify-between gap-4">
                <span className="text-xs font-semibold text-white/60">
                  Kesiapan Konten
                </span>

                <span className="text-sm font-bold text-white">
                  {readiness}%
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getProgressClass(
                    readiness
                  )}`}
                  style={{
                    width: `${readiness}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* SCORE */}

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
              Status Kesiapan
            </p>

            <p className="mt-3 text-6xl font-bold text-white">
              {readiness}
              <span className="text-2xl text-white/40">
                %
              </span>
            </p>

            <span
              className={`mt-4 inline-flex rounded-full border px-3 py-1.5 text-xs font-bold ${getProgressBadgeClass(
                readiness
              )}`}
            >
              {getProgressLabel(
                readiness
              )}
            </span>

            {missingMedia > 0 && (
              <p className="mt-4 text-xs leading-6 text-orange-200">
                {missingMedia} media masih perlu dilengkapi.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ==================================================
          SUMMARY
      ================================================== */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* FEATURES */}

        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Layers3 size={20} />
          </div>

          <p className="mt-5 text-3xl font-bold text-[#082B3A]">
            {summary.features.total}
          </p>

          <p className="mt-1 text-sm font-semibold text-[#082B3A]">
            Fitur
          </p>

          <p className="mt-2 text-xs text-slate-400">
            {summary.features.published} Published ·{" "}
            {summary.features.draft} Draft
          </p>
        </article>

        {/* SECTIONS */}

        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-[#FF5A0A]">
            <FileText size={20} />
          </div>

          <p className="mt-5 text-3xl font-bold text-[#082B3A]">
            {summary.sections.total}
          </p>

          <p className="mt-1 text-sm font-semibold text-[#082B3A]">
            Section CMS
          </p>

          <p className="mt-2 text-xs text-slate-400">
            {summary.sections.published} Published ·{" "}
            {summary.sections.draft} Draft
          </p>
        </article>

        {/* ITEMS */}

        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={20} />
          </div>

          <p className="mt-5 text-3xl font-bold text-[#082B3A]">
            {summary.items.total}
          </p>

          <p className="mt-1 text-sm font-semibold text-[#082B3A]">
            Item Konten
          </p>

          <p className="mt-2 text-xs text-slate-400">
            {summary.items.published} Published ·{" "}
            {summary.items.draft} Draft
          </p>
        </article>

        {/* MEDIA */}

        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
              missingMedia > 0
                ? "bg-amber-50 text-amber-600"
                : "bg-emerald-50 text-emerald-600"
            }`}
          >
            <ImageIcon size={20} />
          </div>

          <p className="mt-5 text-3xl font-bold text-[#082B3A]">
            {missingMedia}
          </p>

          <p className="mt-1 text-sm font-semibold text-[#082B3A]">
            Media Belum Lengkap
          </p>

          <p className="mt-2 text-xs text-slate-400">
            {mediaChecks.length - missingMedia} dari{" "}
            {mediaChecks.length} media tersedia
          </p>
        </article>
      </section>

      {/* ==================================================
          QUICK ACTION
      ================================================== */}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#FF5A0A]">
              Quick Action
            </p>

            <h3 className="mt-2 text-xl font-bold text-[#082B3A]">
              Kelola Product
            </h3>
          </div>

          <button
            type="button"
            onClick={
              loadOverview
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-[#FF5A0A] hover:text-[#FF5A0A]"
          >
            <RefreshCw size={16} />
            Refresh Overview
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <button
            type="button"
            onClick={() =>
              onChangeTab(
                "informasi"
              )
            }
            className="group rounded-2xl border border-slate-200 p-4 text-left transition hover:border-orange-200 hover:bg-orange-50"
          >
            <FileText
              size={19}
              className="text-[#FF5A0A]"
            />

            <p className="mt-3 text-sm font-bold text-[#082B3A]">
              Informasi
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Data utama & SEO
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              onChangeTab(
                "fitur"
              )
            }
            className="group rounded-2xl border border-slate-200 p-4 text-left transition hover:border-orange-200 hover:bg-orange-50"
          >
            <Layers3
              size={19}
              className="text-[#FF5A0A]"
            />

            <p className="mt-3 text-sm font-bold text-[#082B3A]">
              Fitur
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {features.length} fitur
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              onChangeTab(
                "konten"
              )
            }
            className="group rounded-2xl border border-slate-200 p-4 text-left transition hover:border-orange-200 hover:bg-orange-50"
          >
            <FileText
              size={19}
              className="text-[#FF5A0A]"
            />

            <p className="mt-3 text-sm font-bold text-[#082B3A]">
              Konten
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {sections.length} section
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              onChangeTab(
                "media"
              )
            }
            className="group rounded-2xl border border-slate-200 p-4 text-left transition hover:border-orange-200 hover:bg-orange-50"
          >
            <ImageIcon
              size={19}
              className="text-[#FF5A0A]"
            />

            <p className="mt-3 text-sm font-bold text-[#082B3A]">
              Media
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {missingMedia} belum ada
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              onChangeTab(
                "publikasi"
              )
            }
            className="group rounded-2xl border border-slate-200 p-4 text-left transition hover:border-orange-200 hover:bg-orange-50"
          >
            <Rocket
              size={19}
              className="text-[#FF5A0A]"
            />

            <p className="mt-3 text-sm font-bold text-[#082B3A]">
              Publikasi
            </p>

            <p className="mt-1 text-xs text-slate-400">
              QC & Publish
            </p>
          </button>

          <Link
            to={`/admin/services/preview/${service.id}`}
            target="_blank"
            rel="noreferrer"
            className="group rounded-2xl bg-[#082B3A] p-4 text-left text-white transition hover:bg-[#0A4053]"
          >
            <ExternalLink
              size={19}
              className="text-orange-300"
            />

            <p className="mt-3 text-sm font-bold">
              Preview
            </p>

            <p className="mt-1 text-xs text-white/45">
              Lihat halaman
            </p>
          </Link>
        </div>
      </section>

      {/* ==================================================
          CONTENT CHECKLIST + MEDIA
      ================================================== */}

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        {/* CHECKLIST */}

        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#FF5A0A]">
              Content Checklist
            </p>

            <h3 className="mt-2 text-xl font-bold text-[#082B3A]">
              Kesiapan Struktur & Konten
            </h3>

            <p className="mt-1 text-xs leading-6 text-slate-500">
              Checklist ini tidak mengubah status publikasi.
            </p>
          </div>

          <div className="grid gap-3 p-5 md:grid-cols-2 md:p-6">
            {contentChecklist.map(
              (item) => (
                <ChecklistItem
                  key={item.key}
                  passed={
                    item.passed
                  }
                  title={
                    item.title
                  }
                  description={
                    item.description
                  }
                />
              )
            )}
          </div>
        </section>

        {/* MEDIA */}

        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#FF5A0A]">
              Media Checklist
            </p>

            <h3 className="mt-2 text-xl font-bold text-[#082B3A]">
              Media Product
            </h3>

            <p className="mt-1 text-xs leading-6 text-slate-500">
              Media yang dibutuhkan untuk tampilan Product final.
            </p>
          </div>

          <div className="space-y-3 p-5 md:p-6">
            {mediaChecks.map(
              (item) => (
                <MediaItem
                  key={item.key}
                  title={
                    item.title
                  }
                  available={
                    item.available
                  }
                  description={
                    item.description
                  }
                />
              )
            )}

            <button
              type="button"
              onClick={() =>
                onChangeTab(
                  "media"
                )
              }
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#082B3A] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0A4053]"
            >
              Kelola Media

              <ArrowRight
                size={16}
              />
            </button>
          </div>
        </section>
      </div>

      {/* ==================================================
          PUBLICATION INFORMATION
      ================================================== */}

      <section
        className={`rounded-3xl border p-5 md:p-6 ${
          readiness >= 100
            ? "border-emerald-200 bg-emerald-50"
            : "border-amber-200 bg-amber-50"
        }`}
      >
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                readiness >= 100
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-amber-100 text-amber-600"
              }`}
            >
              {readiness >= 100 ? (
                <CheckCircle2
                  size={21}
                />
              ) : (
                <AlertTriangle
                  size={21}
                />
              )}
            </div>

            <div>
              <h3
                className={`font-bold ${
                  readiness >= 100
                    ? "text-emerald-800"
                    : "text-amber-800"
                }`}
              >
                {readiness >= 100
                  ? "Product siap untuk proses publikasi"
                  : "Product masih perlu dilengkapi"}
              </h3>

              <p
                className={`mt-1 text-sm leading-6 ${
                  readiness >= 100
                    ? "text-emerald-700"
                    : "text-amber-700"
                }`}
              >
                {readiness >= 100
                  ? "Seluruh struktur, konten, dan media yang diperiksa sudah tersedia."
                  : `${missingMedia} media masih belum lengkap. Periksa juga checklist konten sebelum melakukan Publish Semua Konten.`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              onChangeTab(
                "publikasi"
              )
            }
            className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white ${
              readiness >= 100
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-[#082B3A] hover:bg-[#0A4053]"
            }`}
          >
            <Rocket
              size={17}
            />

            Buka Publikasi
          </button>
        </div>
      </section>
    </div>
  );
}