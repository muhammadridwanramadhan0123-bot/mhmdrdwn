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
  Eye,
  EyeOff,
  FileText,
  ImageIcon,
  Layers3,
  LoaderCircle,
  RefreshCw,
  Rocket,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { Link } from "react-router-dom";

import { useAdminAuth } from "../../contexts/AdminAuthContext";

import {
  getAdminServiceFeatures,
} from "../../services/serviceService";

import {
  getAdminServicePagePreview,
  publishServicePageContent,
  unpublishServicePageContent,
} from "../../services/servicePageService";

/* ======================================================
   PRODUCT REQUIREMENTS
====================================================== */

const PRODUCT_REQUIREMENTS = {
  "simrs-erp": {
    expectedFeatures: 33,

    requiredSections: [
      "hero",
      "intro",
      "why-simrs",
      "benefits",
      "module-stats",
      "catalog",
      "standards",
      "integration",
      "ai-powered",
      "features",
    ],

    itemRequirements: {
      "why-simrs": 6,
      benefits: 6,
      "module-stats": 3,
    },
  },

  "konsultasi-pengelolaan-fasilitas-kesehatan": {
    expectedFeatures: 4,

    requiredSections: [
      "hero",
      "intro",
      "features",
      "cta",
    ],

    itemRequirements: {},
  },

  "infrastruktur-it-layanan-pendukung": {
    expectedFeatures: 14,

    requiredSections: [
      "hero",
      "intro",
      "features",
      "cta",
    ],

    itemRequirements: {},
  },

  "pelatihan-pengembangan-sdm": {
    expectedFeatures: 5,

    requiredSections: [
      "hero",
      "intro",
      "features",
      "cta",
    ],

    itemRequirements: {},
  },
};

/* ======================================================
   HELPERS
====================================================== */

function cleanText(value) {
  return String(value || "").trim();
}

function hasText(value) {
  return cleanText(value).length > 0;
}

function getSection(
  sections,
  sectionKey
) {
  return (
    sections.find(
      (section) =>
        section.section_key ===
        sectionKey
    ) || null
  );
}

function getActiveItems(
  section
) {
  return (
    Array.isArray(section?.items)
      ? section.items
      : []
  ).filter(
    (item) =>
      item.status !==
      "archived"
  );
}

function getStatusClass(
  status
) {
  if (
    status === "published"
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (
    status === "archived"
  ) {
    return "border-slate-300 bg-slate-100 text-slate-600";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

function getStatusLabel(
  status
) {
  if (
    status === "published"
  ) {
    return "Published";
  }

  if (
    status === "archived"
  ) {
    return "Archived";
  }

  return "Draft";
}

function getReadinessLabel(
  value
) {
  if (value >= 100) {
    return "Siap";
  }

  if (value >= 75) {
    return "Hampir Siap";
  }

  if (value >= 50) {
    return "Perlu Dilengkapi";
  }

  return "Belum Siap";
}

function getReadinessBadge(
  value
) {
  if (value >= 100) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (value >= 75) {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  if (value >= 50) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-red-200 bg-red-50 text-red-700";
}

function calculatePercentage(
  checks
) {
  if (!checks.length) {
    return 0;
  }

  const passed =
    checks.filter(
      (item) =>
        item.passed
    ).length;

  return Math.round(
    (passed /
      checks.length) *
      100
  );
}

/* ======================================================
   REQUIREMENT ROW
====================================================== */

function RequirementRow({
  passed,
  title,
  description,
  blocking = true,
}) {
  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border p-4 ${
        passed
          ? "border-emerald-100 bg-emerald-50/60"
          : blocking
            ? "border-red-200 bg-red-50/60"
            : "border-amber-200 bg-amber-50/60"
      }`}
    >
      <div
        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
          passed
            ? "bg-emerald-100 text-emerald-600"
            : blocking
              ? "bg-red-100 text-red-600"
              : "bg-amber-100 text-amber-600"
        }`}
      >
        {passed ? (
          <CheckCircle2
            size={18}
          />
        ) : blocking ? (
          <XCircle
            size={18}
          />
        ) : (
          <AlertTriangle
            size={18}
          />
        )}
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-bold text-[#082B3A]">
            {title}
          </p>

          {!blocking && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-700">
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
   SUMMARY CARD
====================================================== */

function SummaryCard({
  icon: Icon,
  value,
  title,
  description,
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-[#082B3A]">
        <Icon
          size={20}
        />
      </div>

      <p className="mt-4 text-3xl font-bold text-[#082B3A]">
        {value}
      </p>

      <p className="mt-1 text-sm font-semibold text-[#082B3A]">
        {title}
      </p>

      <p className="mt-2 text-xs leading-5 text-slate-400">
        {description}
      </p>
    </article>
  );
}

/* ======================================================
   COMPONENT
====================================================== */

export default function AdminServicePublishPanel({
  serviceId,
  serviceName = "",
  serviceSlug = "",
  serviceStatus = "draft",
  onChangeTab,
}) {
  const {
    isContentManager,
  } = useAdminAuth();

  /* ====================================================
     STATE
  ==================================================== */

  const [
    serviceData,
    setServiceData,
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
    publishing,
    setPublishing,
  ] = useState(false);

  const [
    unpublishing,
    setUnpublishing,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  /* ====================================================
     LOAD
  ==================================================== */

  const loadPublicationData =
    useCallback(async () => {
      if (!serviceId) {
        setLoading(false);

        setErrorMessage(
          "ID Product tidak tersedia."
        );

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
              serviceId
            ),

            getAdminServiceFeatures(
              serviceId
            ),
          ]);

        setServiceData(
          previewData?.service ||
            {
              id: serviceId,
              name:
                serviceName,
              slug:
                serviceSlug,
              status:
                serviceStatus,
            }
        );

        setSections(
          Array.isArray(
            previewData?.sections
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
          "Publication Control gagal dimuat:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Publication Control gagal dimuat."
        );

        setSections([]);

        setFeatures([]);
      } finally {
        setLoading(false);
      }
    }, [
      serviceId,
      serviceName,
      serviceSlug,
      serviceStatus,
    ]);

  useEffect(() => {
    loadPublicationData();
  }, [loadPublicationData]);

  /* ====================================================
     RESOLVED SERVICE
  ==================================================== */

  const resolvedService =
    serviceData || {
      id: serviceId,
      name: serviceName,
      slug: serviceSlug,
      status: serviceStatus,
    };

  const resolvedSlug =
    resolvedService.slug ||
    serviceSlug;

  const requirements =
    PRODUCT_REQUIREMENTS[
      resolvedSlug
    ] || {
      expectedFeatures: null,

      requiredSections: [
        "hero",
        "intro",
        "features",
      ],

      itemRequirements: {},
    };

  /* ====================================================
     ACTIVE RECORDS
  ==================================================== */

  const activeFeatures =
    useMemo(
      () =>
        features.filter(
          (feature) =>
            feature.status !==
            "archived"
        ),
      [features]
    );

  const publishedFeatures =
    useMemo(
      () =>
        activeFeatures.filter(
          (feature) =>
            feature.status ===
            "published"
        ),
      [activeFeatures]
    );

  const activeSections =
    useMemo(
      () =>
        sections.filter(
          (section) =>
            section.status !==
            "archived"
        ),
      [sections]
    );

  const allItems =
    useMemo(
      () =>
        activeSections.flatMap(
          (section) =>
            Array.isArray(
              section.items
            )
              ? section.items
              : []
        ),
      [activeSections]
    );

  const activeItems =
    useMemo(
      () =>
        allItems.filter(
          (item) =>
            item.status !==
            "archived"
        ),
      [allItems]
    );

  /* ====================================================
     COMMON SECTIONS
  ==================================================== */

  const heroSection =
    getSection(
      sections,
      "hero"
    );

  const introSection =
    getSection(
      sections,
      "intro"
    );

  const featureSection =
    getSection(
      sections,
      "features"
    );

  const whySection =
    getSection(
      sections,
      "why-simrs"
    );

  const benefitsSection =
    getSection(
      sections,
      "benefits"
    );

  const statsSection =
    getSection(
      sections,
      "module-stats"
    );

  const catalogSection =
    getSection(
      sections,
      "catalog"
    );

  const standardsSection =
    getSection(
      sections,
      "standards"
    );

  const integrationSection =
    getSection(
      sections,
      "integration"
    );

  const aiSection =
    getSection(
      sections,
      "ai-powered"
    );

  /* ====================================================
     SIMRS HIERARCHY CHECK
  ==================================================== */

  const simrsHierarchyCheck =
    useMemo(() => {
      if (
        resolvedSlug !==
        "simrs-erp"
      ) {
        return true;
      }

      const telehealth =
        features.find(
          (feature) =>
            feature.slug ===
            "telehealth" &&
            !feature.parent_feature_id
        );

      if (!telehealth) {
        return false;
      }

      const requiredChildren = [
        "tele-icu",
        "tele-ekg",
        "iot-ambulance",
        "mobile-clinic",
      ];

      return requiredChildren.every(
        (slug) => {
          return features.some(
            (feature) =>
              feature.slug ===
                slug &&
              feature.parent_feature_id ===
                telehealth.id
          );
        }
      );
    }, [
      features,
      resolvedSlug,
    ]);

  /* ====================================================
     REQUIRED CHECKS
  ==================================================== */

  const requiredChecks =
    useMemo(() => {
      const checks = [
        {
          key:
            "service-status",

          title:
            "Status Product",

          description:
            resolvedService.status ===
            "published"
              ? "Product utama sudah Published."
              : "Product utama harus berstatus Published agar halaman publik dapat diakses.",

          passed:
            resolvedService.status ===
            "published",

          tab:
            "informasi",
        },

        {
          key:
            "product-name",

          title:
            "Nama Product",

          description:
            "Nama Product utama harus tersedia.",

          passed:
            hasText(
              resolvedService.name
            ),

          tab:
            "informasi",
        },

        {
          key:
            "product-slug",

          title:
            "Slug Product",

          description:
            "Slug diperlukan untuk URL halaman publik.",

          passed:
            hasText(
              resolvedService.slug
            ),

          tab:
            "informasi",
        },

        {
          key:
            "short-description",

          title:
            "Deskripsi Singkat",

          description:
            "Deskripsi singkat Product harus tersedia.",

          passed:
            hasText(
              resolvedService.short_description
            ),

          tab:
            "informasi",
        },

        {
          key:
            "full-description",

          title:
            "Deskripsi Lengkap",

          description:
            "Deskripsi lengkap Product harus tersedia.",

          passed:
            hasText(
              resolvedService.full_description
            ),

          tab:
            "informasi",
        },
      ];

      /* ================================================
         FEATURES
      ================================================ */

      if (
        requirements.expectedFeatures
      ) {
        checks.push({
          key:
            "features",

          title:
            "Fitur & Cakupan",

          description:
            `${publishedFeatures.length} fitur Published dari target ${requirements.expectedFeatures}. Total fitur aktif: ${activeFeatures.length}.`,

          passed:
            publishedFeatures.length >=
              requirements.expectedFeatures &&
            activeFeatures.length >=
              requirements.expectedFeatures,

          tab:
            "fitur",
        });
      } else {
        checks.push({
          key:
            "features",

          title:
            "Fitur & Cakupan",

          description:
            `${publishedFeatures.length} fitur Published.`,

          passed:
            publishedFeatures.length >
            0,

          tab:
            "fitur",
        });
      }

      /* ================================================
         SIMRS HIERARCHY
      ================================================ */

      if (
        resolvedSlug ===
        "simrs-erp"
      ) {
        checks.push({
          key:
            "telehealth-hierarchy",

          title:
            "Hierarchy Telehealth",

          description:
            "Tele-ICU, Tele-EKG, IoT Ambulance dan Mobile Clinic harus berada di bawah Telehealth.",

          passed:
            simrsHierarchyCheck,

          tab:
            "fitur",
        });
      }

      /* ================================================
         REQUIRED SECTIONS
      ================================================ */

      requirements.requiredSections.forEach(
        (sectionKey) => {
          const section =
            getSection(
              sections,
              sectionKey
            );

          checks.push({
            key:
              `section-${sectionKey}`,

            title:
              `Section: ${sectionKey}`,

            description:
              section
                ? section.status ===
                  "archived"
                  ? "Section tersedia tetapi berstatus Archived."
                  : `Section tersedia dengan status ${getStatusLabel(section.status)}.`
                : "Section belum tersedia.",

            passed:
              Boolean(
                section
              ) &&
              section.status !==
                "archived",

            tab:
              "konten",
          });
        }
      );

      /* ================================================
         ITEM REQUIREMENTS
      ================================================ */

      Object.entries(
        requirements.itemRequirements
      ).forEach(
        ([
          sectionKey,
          expectedCount,
        ]) => {
          const section =
            getSection(
              sections,
              sectionKey
            );

          const itemCount =
            getActiveItems(
              section
            ).length;

          let label =
            sectionKey;

          if (
            sectionKey ===
            "why-simrs"
          ) {
            label =
              "Mengapa SIMRS";
          }

          if (
            sectionKey ===
            "benefits"
          ) {
            label =
              "Keunggulan SIMRS";
          }

          if (
            sectionKey ===
            "module-stats"
          ) {
            label =
              "Statistik Modul";
          }

          checks.push({
            key:
              `items-${sectionKey}`,

            title:
              label,

            description:
              `${itemCount} dari ${expectedCount} item wajib tersedia.`,

            passed:
              itemCount >=
              expectedCount,

            tab:
              "konten",
          });
        }
      );

      return checks;
    }, [
      resolvedService,
      requirements,
      activeFeatures.length,
      publishedFeatures.length,
      sections,
      resolvedSlug,
      simrsHierarchyCheck,
    ]);

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

          description:
            "Visual utama Product pada website.",

          passed:
            hasText(
              resolvedService.image_url
            ),

          tab:
            "informasi",
        },

        {
          key:
            "hero-image",

          title:
            "Hero Image",

          description:
            "Hero menggunakan image section atau fallback gambar utama Product.",

          passed:
            hasText(
              heroSection?.image_url
            ) ||
            hasText(
              resolvedService.image_url
            ),

          tab:
            "media",
        },
      ];

      if (
        resolvedSlug ===
        "simrs-erp"
      ) {
        checks.push(
          {
            key:
              "module-image",

            title:
              "Infografik 62 / 49 / 13",

            description:
              "Visual statistik modul SIMRS.",

            passed:
              hasText(
                statsSection?.image_url
              ),

            tab:
              "media",
          },

          {
            key:
              "catalog-pdf",

            title:
              "Katalog Modul SIMRS PDF",

            description:
              "Dokumen katalog yang dapat diunduh pengunjung.",

            passed:
              hasText(
                catalogSection?.file_url
              ),

            tab:
              "media",
          },

          {
            key:
              "standards-image",

            title:
              "Visual Standarisasi",

            description:
              "Visual HL7 FHIR, SNOMED CT, ICD dan ISO.",

            passed:
              hasText(
                standardsSection?.image_url
              ),

            tab:
              "media",
          },

          {
            key:
              "integration-image",

            title:
              "Visual SATUSEHAT & BPJS",

            description:
              "Visual integrasi sistem kesehatan nasional.",

            passed:
              hasText(
                integrationSection?.image_url
              ),

            tab:
              "media",
          },

          {
            key:
              "ai-image",

            title:
              "Visual AI-Powered",

            description:
              "Visual Artificial Intelligence pada SIMRS ERP.",

            passed:
              hasText(
                aiSection?.image_url
              ),

            tab:
              "media",
          }
        );
      }

      return checks;
    }, [
      resolvedService.image_url,
      resolvedSlug,
      heroSection,
      statsSection,
      catalogSection,
      standardsSection,
      integrationSection,
      aiSection,
    ]);

  /* ====================================================
     READINESS
  ==================================================== */

  const requiredReadiness =
    calculatePercentage(
      requiredChecks
    );

  const overallReadiness =
    calculatePercentage([
      ...requiredChecks,
      ...mediaChecks,
    ]);

  const blockingChecks =
    requiredChecks.filter(
      (item) =>
        !item.passed
    );

  const missingMedia =
    mediaChecks.filter(
      (item) =>
        !item.passed
    );

  const canPublish =
    blockingChecks.length ===
      0 &&
    activeSections.length >
      0;

  /* ====================================================
     CURRENT PUBLICATION STATUS
  ==================================================== */

  const publishedSections =
    activeSections.filter(
      (section) =>
        section.status ===
        "published"
    ).length;

  const draftSections =
    activeSections.filter(
      (section) =>
        section.status ===
        "draft"
    ).length;

  const publishedItems =
    activeItems.filter(
      (item) =>
        item.status ===
        "published"
    ).length;

  const draftItems =
    activeItems.filter(
      (item) =>
        item.status ===
        "draft"
    ).length;

  const allContentPublished =
    activeSections.length >
      0 &&
    publishedSections ===
      activeSections.length &&
    publishedItems ===
      activeItems.length;

  const hasPublishedContent =
    publishedSections > 0 ||
    publishedItems > 0;

  /* ====================================================
     PUBLISH
  ==================================================== */

  async function handlePublish() {
    if (
      !isContentManager ||
      publishing ||
      !canPublish
    ) {
      return;
    }

    const mediaWarning =
      missingMedia.length > 0
        ? `\n\nPerhatian: ${missingMedia.length} media pendukung masih belum lengkap.`
        : "";

    const confirmed =
      window.confirm(
        `Publish seluruh konten aktif untuk "${resolvedService.name}"?${mediaWarning}\n\nSection dan item aktif akan diubah menjadi Published.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setPublishing(true);

      setErrorMessage("");

      setSuccessMessage("");

      await publishServicePageContent(
        serviceId
      );

      setSuccessMessage(
        "Seluruh konten aktif berhasil dipublikasikan."
      );

      await loadPublicationData();
    } catch (error) {
      console.error(
        "Publish Product gagal:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Publish Product gagal."
      );
    } finally {
      setPublishing(false);
    }
  }

  /* ====================================================
     UNPUBLISH
  ==================================================== */

  async function handleUnpublish() {
    if (
      !isContentManager ||
      unpublishing ||
      !hasPublishedContent
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Jadikan seluruh konten "${resolvedService.name}" sebagai Draft?\n\nProduct utama tidak dihapus. Section Published akan menjadi Draft. Halaman publik dapat kembali menggunakan fallback sampai konten dipublish lagi.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setUnpublishing(true);

      setErrorMessage("");

      setSuccessMessage("");

      await unpublishServicePageContent(
        serviceId
      );

      setSuccessMessage(
        "Seluruh konten halaman berhasil dijadikan Draft."
      );

      await loadPublicationData();
    } catch (error) {
      console.error(
        "Unpublish Product gagal:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Konten gagal dijadikan Draft."
      );
    } finally {
      setUnpublishing(false);
    }
  }

  /* ====================================================
     LOADING
  ==================================================== */

  if (loading) {
    return (
      <section className="flex min-h-[420px] items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="text-center">
          <LoaderCircle
            size={40}
            className="mx-auto animate-spin text-[#FF5A0A]"
          />

          <p className="mt-4 font-semibold text-[#082B3A]">
            Memeriksa Kesiapan Publikasi...
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Memvalidasi Product, fitur, CMS, hierarchy dan media.
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
          HEADER
      ================================================== */}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#FF5A0A]">
              <Rocket
                size={14}
              />

              Publication Control
            </div>

            <h2 className="mt-4 text-2xl font-bold text-[#082B3A]">
              Publikasi Product
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">
              Periksa seluruh struktur Product sebelum konten dipublikasikan
              ke website.
            </p>
          </div>

          <button
            type="button"
            onClick={
              loadPublicationData
            }
            disabled={
              publishing ||
              unpublishing
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-[#FF5A0A] hover:text-[#FF5A0A] disabled:opacity-50"
          >
            <RefreshCw
              size={16}
            />

            Refresh QC
          </button>
        </div>
      </section>

      {/* ==================================================
          MESSAGE
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
                Terjadi kesalahan
              </p>

              <p className="mt-1 text-sm leading-6 text-red-700">
                {errorMessage}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setErrorMessage("")
            }
            className="text-xs font-semibold text-red-700"
          >
            Tutup
          </button>
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="flex items-start justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2
              size={20}
              className="mt-0.5 shrink-0 text-emerald-600"
            />

            <div>
              <p className="font-semibold text-emerald-800">
                Berhasil
              </p>

              <p className="mt-1 text-sm leading-6 text-emerald-700">
                {successMessage}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setSuccessMessage("")
            }
            className="text-xs font-semibold text-emerald-700"
          >
            Tutup
          </button>
        </div>
      )}

      {/* ==================================================
          READINESS HERO
      ================================================== */}

      <section className="relative overflow-hidden rounded-3xl bg-[#082B3A] p-6 text-white shadow-xl md:p-8">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#FF5A0A]/20 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-orange-300">
                Publication Readiness
              </span>

              <span
                className={`rounded-full border px-3 py-1 text-[10px] font-bold ${getStatusClass(
                  resolvedService.status
                )}`}
              >
                {getStatusLabel(
                  resolvedService.status
                )}
              </span>
            </div>

            <h3 className="mt-4 max-w-3xl text-2xl font-bold leading-tight md:text-3xl">
              {resolvedService.name ||
                serviceName}
            </h3>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60">
              Publikasi hanya dapat dilakukan ketika seluruh kebutuhan wajib
              Product sudah lengkap.
            </p>

            {/* REQUIRED PROGRESS */}

            <div className="mt-7 max-w-3xl">
              <div className="mb-2 flex items-center justify-between gap-4">
                <span className="text-xs font-semibold text-white/60">
                  Kesiapan Wajib
                </span>

                <span className="text-sm font-bold">
                  {requiredReadiness}%
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full transition-all ${
                    requiredReadiness >=
                    100
                      ? "bg-emerald-400"
                      : "bg-[#FF5A0A]"
                  }`}
                  style={{
                    width: `${requiredReadiness}%`,
                  }}
                />
              </div>
            </div>

            {/* OVERALL */}

            <div className="mt-5 max-w-3xl">
              <div className="mb-2 flex items-center justify-between gap-4">
                <span className="text-xs font-semibold text-white/60">
                  Kesiapan Keseluruhan
                </span>

                <span className="text-sm font-bold">
                  {overallReadiness}%
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-blue-400 transition-all"
                  style={{
                    width: `${overallReadiness}%`,
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

            <p className="mt-3 text-6xl font-bold">
              {requiredReadiness}
              <span className="text-2xl text-white/40">
                %
              </span>
            </p>

            <span
              className={`mt-4 inline-flex rounded-full border px-3 py-1.5 text-xs font-bold ${getReadinessBadge(
                requiredReadiness
              )}`}
            >
              {getReadinessLabel(
                requiredReadiness
              )}
            </span>

            {blockingChecks.length >
              0 && (
              <p className="mt-4 text-xs leading-6 text-red-200">
                {
                  blockingChecks.length
                }{" "}
                kebutuhan wajib masih belum lengkap.
              </p>
            )}

            {blockingChecks.length ===
              0 &&
              missingMedia.length >
                0 && (
                <p className="mt-4 text-xs leading-6 text-orange-200">
                  Struktur wajib sudah lengkap.{" "}
                  {
                    missingMedia.length
                  }{" "}
                  media pendukung masih belum tersedia.
                </p>
              )}

            {blockingChecks.length ===
              0 &&
              missingMedia.length ===
                0 && (
                <p className="mt-4 text-xs leading-6 text-emerald-200">
                  Struktur dan media Product sudah lengkap.
                </p>
              )}
          </div>
        </div>
      </section>

      {/* ==================================================
          SUMMARY
      ================================================== */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={Layers3}
          value={
            activeFeatures.length
          }
          title="Fitur Aktif"
          description={`${publishedFeatures.length} Published`}
        />

        <SummaryCard
          icon={FileText}
          value={
            activeSections.length
          }
          title="Section CMS"
          description={`${publishedSections} Published · ${draftSections} Draft`}
        />

        <SummaryCard
          icon={CheckCircle2}
          value={
            activeItems.length
          }
          title="Item Konten"
          description={`${publishedItems} Published · ${draftItems} Draft`}
        />

        <SummaryCard
          icon={ImageIcon}
          value={
            missingMedia.length
          }
          title="Media Belum Lengkap"
          description={`${mediaChecks.length - missingMedia.length} dari ${mediaChecks.length} tersedia`}
        />
      </section>

      {/* ==================================================
          CURRENT PUBLICATION STATE
      ================================================== */}

      <section
        className={`rounded-3xl border p-5 md:p-6 ${
          allContentPublished
            ? "border-emerald-200 bg-emerald-50"
            : "border-amber-200 bg-amber-50"
        }`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
              allContentPublished
                ? "bg-emerald-100 text-emerald-600"
                : "bg-amber-100 text-amber-600"
            }`}
          >
            {allContentPublished ? (
              <Eye
                size={21}
              />
            ) : (
              <EyeOff
                size={21}
              />
            )}
          </div>

          <div>
            <h3
              className={`font-bold ${
                allContentPublished
                  ? "text-emerald-800"
                  : "text-amber-800"
              }`}
            >
              {allContentPublished
                ? "Seluruh CMS aktif sudah Published"
                : "CMS Product belum sepenuhnya Published"}
            </h3>

            <p
              className={`mt-1 text-sm leading-6 ${
                allContentPublished
                  ? "text-emerald-700"
                  : "text-amber-700"
              }`}
            >
              {allContentPublished
                ? "Halaman publik menggunakan section CMS yang telah dipublikasikan."
                : "Jika Product utama Published tetapi tidak ada section CMS Published, halaman publik dapat menggunakan fallback generic."}
            </p>
          </div>
        </div>
      </section>

      {/* ==================================================
          REQUIRED CHECKLIST
      ================================================== */}

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#082B3A] text-white">
              <ShieldCheck
                size={19}
              />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#FF5A0A]">
                Mandatory QC
              </p>

              <h3 className="mt-1 text-xl font-bold text-[#082B3A]">
                Kebutuhan Wajib
              </h3>

              <p className="mt-1 text-xs leading-6 text-slate-500">
                Semua item di bagian ini harus hijau sebelum Publish Semua
                Konten dapat dilakukan.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 p-5 md:grid-cols-2 md:p-6">
          {requiredChecks.map(
            (item) => (
              <RequirementRow
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
                blocking
              />
            )
          )}
        </div>
      </section>

      {/* ==================================================
          MEDIA CHECKLIST
      ================================================== */}

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#FF5A0A]">
              <ImageIcon
                size={19}
              />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#FF5A0A]">
                Supporting Media
              </p>

              <h3 className="mt-1 text-xl font-bold text-[#082B3A]">
                Media Pendukung
              </h3>

              <p className="mt-1 text-xs leading-6 text-slate-500">
                Media tidak memblokir tombol Publish, tetapi sebaiknya
                dilengkapi sebelum halaman dianggap final.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 p-5 md:grid-cols-2 md:p-6">
          {mediaChecks.map(
            (item) => (
              <RequirementRow
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
                blocking={false}
              />
            )
          )}
        </div>
      </section>

      {/* ==================================================
          BLOCKING PROBLEMS
      ================================================== */}

      {blockingChecks.length >
        0 && (
        <section className="rounded-3xl border border-red-200 bg-red-50 p-5 md:p-6">
          <div className="flex items-start gap-4">
            <AlertTriangle
              size={24}
              className="mt-0.5 shrink-0 text-red-600"
            />

            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-red-800">
                Product belum dapat dipublish
              </h3>

              <p className="mt-1 text-sm leading-6 text-red-700">
                Selesaikan kebutuhan wajib berikut terlebih dahulu.
              </p>

              <div className="mt-4 space-y-2">
                {blockingChecks.map(
                  (item) => (
                    <div
                      key={
                        item.key
                      }
                      className="flex flex-col justify-between gap-3 rounded-xl bg-white px-4 py-3 sm:flex-row sm:items-center"
                    >
                      <div>
                        <p className="text-sm font-semibold text-[#082B3A]">
                          {
                            item.title
                          }
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {
                            item.description
                          }
                        </p>
                      </div>

                      {onChangeTab &&
                        item.tab && (
                          <button
                            type="button"
                            onClick={() =>
                              onChangeTab(
                                item.tab
                              )
                            }
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-[#FF5A0A] hover:text-[#FF5A0A]"
                          >
                            Perbaiki

                            <ArrowRight
                              size={13}
                            />
                          </button>
                        )}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ==================================================
          QUICK QC ACTION
      ================================================== */}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#FF5A0A]">
          Quality Control
        </p>

        <h3 className="mt-2 text-xl font-bold text-[#082B3A]">
          Periksa Sebelum Publikasi
        </h3>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {onChangeTab && (
            <>
              <button
                type="button"
                onClick={() =>
                  onChangeTab(
                    "informasi"
                  )
                }
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-[#FF5A0A] hover:text-[#FF5A0A]"
              >
                Informasi
              </button>

              <button
                type="button"
                onClick={() =>
                  onChangeTab(
                    "fitur"
                  )
                }
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-[#FF5A0A] hover:text-[#FF5A0A]"
              >
                Fitur
              </button>

              <button
                type="button"
                onClick={() =>
                  onChangeTab(
                    "konten"
                  )
                }
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-[#FF5A0A] hover:text-[#FF5A0A]"
              >
                Konten
              </button>

              <button
                type="button"
                onClick={() =>
                  onChangeTab(
                    "media"
                  )
                }
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-[#FF5A0A] hover:text-[#FF5A0A]"
              >
                Media
              </button>
            </>
          )}

          <Link
            to={`/admin/services/preview/${serviceId}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#082B3A] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0A4053]"
          >
            <ExternalLink
              size={15}
            />

            Preview
          </Link>
        </div>
      </section>

      {/* ==================================================
          PUBLICATION ACTION
      ================================================== */}

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#FF5A0A]">
            Publication Action
          </p>

          <h3 className="mt-2 text-xl font-bold text-[#082B3A]">
            Kontrol Status CMS
          </h3>
        </div>

        <div className="grid gap-5 p-5 md:grid-cols-2 md:p-6">
          {/* DRAFT */}

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <EyeOff
              size={24}
              className="text-slate-500"
            />

            <h4 className="mt-4 font-bold text-[#082B3A]">
              Jadikan Semua Draft
            </h4>

            <p className="mt-2 min-h-[48px] text-xs leading-6 text-slate-500">
              Mengubah seluruh Section dan Item Published menjadi Draft.
              Section Archived tidak akan diubah.
            </p>

            <button
              type="button"
              onClick={
                handleUnpublish
              }
              disabled={
                !isContentManager ||
                !hasPublishedContent ||
                unpublishing ||
                publishing
              }
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-[#082B3A] hover:text-[#082B3A] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {unpublishing ? (
                <LoaderCircle
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <EyeOff
                  size={16}
                />
              )}

              {unpublishing
                ? "Memproses..."
                : "Jadikan Semua Draft"}
            </button>
          </div>

          {/* PUBLISH */}

          <div
            className={`rounded-2xl border p-5 ${
              canPublish
                ? "border-emerald-200 bg-emerald-50"
                : "border-red-200 bg-red-50"
            }`}
          >
            <Rocket
              size={24}
              className={
                canPublish
                  ? "text-emerald-600"
                  : "text-red-500"
              }
            />

            <h4 className="mt-4 font-bold text-[#082B3A]">
              Publish Semua Konten
            </h4>

            <p className="mt-2 min-h-[48px] text-xs leading-6 text-slate-500">
              {canPublish
                ? "Seluruh kebutuhan wajib sudah lengkap. Section dan Item aktif dapat dipublikasikan."
                : `${blockingChecks.length} kebutuhan wajib harus diselesaikan sebelum publikasi.`}
            </p>

            <button
              type="button"
              onClick={
                handlePublish
              }
              disabled={
                !isContentManager ||
                !canPublish ||
                publishing ||
                unpublishing
              }
              className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-40 ${
                canPublish
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-slate-400"
              }`}
            >
              {publishing ? (
                <LoaderCircle
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <Rocket
                  size={16}
                />
              )}

              {publishing
                ? "Publishing..."
                : "Publish Semua Konten"}
            </button>
          </div>
        </div>
      </section>

      {/* ==================================================
          LIVE LINK
      ================================================== */}

      {resolvedService.status ===
        "published" &&
        resolvedService.slug && (
          <section className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-semibold text-blue-800">
                  URL Product Publik
                </p>

                <p className="mt-1 break-all text-xs text-blue-700">
                  /services/
                  {
                    resolvedService.slug
                  }
                </p>
              </div>

              <Link
                to={`/services/${resolvedService.slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#082B3A] px-4 py-2.5 text-xs font-semibold text-white"
              >
                <ExternalLink
                  size={14}
                />

                Buka Website
              </Link>
            </div>
          </section>
        )}
    </div>
  );
}