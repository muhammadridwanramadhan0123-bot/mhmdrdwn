import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  AlertTriangle,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  ImageIcon,
  LoaderCircle,
  RefreshCw,
  Trash2,
  UploadCloud,
} from "lucide-react";

import { useAdminAuth } from "../../contexts/AdminAuthContext";
import { supabase } from "../../lib/supabase";

/* ======================================================
   CONFIG
====================================================== */

const SECTION_TABLE =
  "service_page_sections";

const MEDIA_BUCKET =
  "service-page-media";

const IMAGE_MAX_SIZE =
  5 * 1024 * 1024;

const PDF_MAX_SIZE =
  10 * 1024 * 1024;

const IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const PDF_TYPES = [
  "application/pdf",
];

/* ======================================================
   SIMRS MEDIA DEFINITIONS
====================================================== */

const SIMRS_MEDIA_TARGETS = [
  {
    sectionKey: "hero",
    mediaType: "image",
    title: "Hero Image",
    description:
      "Visual utama pada bagian pembuka halaman SIMRS ERP.",
  },
  {
    sectionKey: "module-stats",
    mediaType: "image",
    title: "Infografik 62 / 49 / 13",
    description:
      "Visual untuk 62 Modul Utama, 49 Modul Aplikasi, dan 13 Modul Terintegrasi.",
  },
  {
    sectionKey: "catalog",
    mediaType: "pdf",
    title: "Katalog Modul SIMRS",
    description:
      "Dokumen PDF katalog modul SIMRS ERP yang dapat diunduh pengunjung.",
  },
  {
    sectionKey: "standards",
    mediaType: "image",
    title: "Visual Standarisasi",
    description:
      "Visual HL7 FHIR, SNOMED CT, ICD-9, ICD-10, ISO dan standar interoperabilitas.",
  },
  {
    sectionKey: "integration",
    mediaType: "image",
    title: "Visual SATUSEHAT & BPJS",
    description:
      "Visual integrasi SIMRS dengan SATUSEHAT Kemenkes dan BPJS Kesehatan.",
  },
  {
    sectionKey: "ai-powered",
    mediaType: "image",
    title: "AI-Powered Solutions",
    description:
      "Visual solusi Artificial Intelligence pada ekosistem SIMRS ERP.",
  },
];

/* ======================================================
   HELPERS
====================================================== */

function cleanText(value) {
  return String(value || "").trim();
}

function getStatusClass(status) {
  if (status === "published") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "archived") {
    return "border-slate-300 bg-slate-100 text-slate-600";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

function getStatusLabel(status) {
  if (status === "published") {
    return "Published";
  }

  if (status === "archived") {
    return "Archived";
  }

  return "Draft";
}

function sanitizeFileName(fileName) {
  const extension =
    fileName.includes(".")
      ? fileName.split(".").pop()
      : "";

  const baseName =
    fileName
      .replace(/\.[^/.]+$/, "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "media";

  return extension
    ? `${baseName}.${extension.toLowerCase()}`
    : baseName;
}

function createStoragePath({
  serviceId,
  sectionKey,
  fileName,
}) {
  const random =
    Math.random()
      .toString(36)
      .slice(2, 9);

  const safeName =
    sanitizeFileName(
      fileName
    );

  return [
    "services",
    serviceId,
    sectionKey,
    `${Date.now()}-${random}-${safeName}`,
  ].join("/");
}

function extractStoragePath(
  publicUrl
) {
  const marker =
    `/storage/v1/object/public/${MEDIA_BUCKET}/`;

  const url =
    cleanText(
      publicUrl
    );

  if (
    !url ||
    !url.includes(marker)
  ) {
    return "";
  }

  return decodeURIComponent(
    url.split(marker)[1] || ""
  );
}

function supportsGenericMedia(
  section
) {
  if (
    section.section_type ===
    "download"
  ) {
    return "pdf";
  }

  if (
    [
      "hero",
      "stats",
      "showcase",
    ].includes(
      section.section_type
    )
  ) {
    return "image";
  }

  return "";
}

/* ======================================================
   MEDIA CARD
====================================================== */

function MediaCard({
  item,
  canManage,
  uploadingKey,
  deletingKey,
  onUpload,
  onRemove,
}) {
  const inputRef =
    useRef(null);

  const isImage =
    item.mediaType ===
    "image";

  const isPdf =
    item.mediaType ===
    "pdf";

  const mediaUrl =
    isPdf
      ? item.section.file_url
      : item.section.image_url;

  const hasMedia =
    Boolean(
      cleanText(
        mediaUrl
      )
    );

  const isUploading =
    uploadingKey ===
    item.sectionKey;

  const isDeleting =
    deletingKey ===
    item.sectionKey;

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      {/* PREVIEW */}

      <div className="relative flex min-h-[220px] items-center justify-center overflow-hidden bg-slate-50">
        {isImage &&
        hasMedia ? (
          <img
            src={mediaUrl}
            alt={item.title}
            className="h-[240px] w-full object-cover"
          />
        ) : isPdf &&
          hasMedia ? (
          <div className="px-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50 text-red-500">
              <FileText
                size={36}
              />
            </div>

            <p className="mt-4 text-sm font-bold text-[#082B3A]">
              PDF tersedia
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Dokumen siap diunduh dari halaman Product.
            </p>
          </div>
        ) : (
          <div className="px-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-slate-300 shadow-sm">
              {isPdf ? (
                <FileText
                  size={34}
                />
              ) : (
                <ImageIcon
                  size={34}
                />
              )}
            </div>

            <p className="mt-4 text-sm font-bold text-slate-500">
              {isPdf
                ? "PDF belum tersedia"
                : "Gambar belum tersedia"}
            </p>
          </div>
        )}

        {/* MEDIA STATUS */}

        <span
          className={`absolute right-4 top-4 rounded-full px-3 py-1.5 text-[10px] font-bold ${
            hasMedia
              ? "bg-emerald-50 text-emerald-700 shadow-sm"
              : "bg-amber-50 text-amber-700 shadow-sm"
          }`}
        >
          {hasMedia
            ? "Tersedia"
            : "Belum Ada"}
        </span>
      </div>

      {/* INFO */}

      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#FF5A0A]">
            {isPdf
              ? "PDF"
              : "IMAGE"}
          </span>

          <span
            className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${getStatusClass(
              item.section.status
            )}`}
          >
            {getStatusLabel(
              item.section.status
            )}
          </span>
        </div>

        <h3 className="mt-4 text-lg font-bold leading-7 text-[#082B3A]">
          {item.title}
        </h3>

        <p className="mt-2 min-h-[48px] text-xs leading-6 text-slate-500">
          {item.description}
        </p>

        <p className="mt-3 break-all text-[10px] text-slate-400">
          Section:{" "}
          {item.sectionKey}
        </p>

        {/* ACTION */}

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {canManage && (
            <>
              <input
                ref={inputRef}
                type="file"
                accept={
                  isPdf
                    ? "application/pdf"
                    : "image/jpeg,image/png,image/webp"
                }
                onChange={(
                  event
                ) => {
                  const file =
                    event.target
                      .files?.[0];

                  event.target.value =
                    "";

                  if (file) {
                    onUpload(
                      item,
                      file
                    );
                  }
                }}
                className="hidden"
              />

              <button
                type="button"
                onClick={() =>
                  inputRef.current?.click()
                }
                disabled={
                  isUploading ||
                  isDeleting
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#082B3A] px-4 py-3 text-xs font-semibold text-white transition hover:bg-[#0A4053] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUploading ? (
                  <LoaderCircle
                    size={15}
                    className="animate-spin"
                  />
                ) : (
                  <UploadCloud
                    size={15}
                  />
                )}

                {isUploading
                  ? "Mengupload..."
                  : hasMedia
                    ? "Ganti Media"
                    : "Upload Media"}
              </button>
            </>
          )}

          {hasMedia && (
            <a
              href={mediaUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-xs font-semibold text-slate-600 transition hover:border-[#FF5A0A] hover:text-[#FF5A0A]"
            >
              {isPdf ? (
                <Download
                  size={15}
                />
              ) : (
                <ExternalLink
                  size={15}
                />
              )}

              {isPdf
                ? "Buka PDF"
                : "Lihat Gambar"}
            </a>
          )}
        </div>

        {canManage &&
          hasMedia && (
            <button
              type="button"
              onClick={() =>
                onRemove(
                  item
                )
              }
              disabled={
                isUploading ||
                isDeleting
              }
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDeleting ? (
                <LoaderCircle
                  size={15}
                  className="animate-spin"
                />
              ) : (
                <Trash2
                  size={15}
                />
              )}

              Hapus Media
            </button>
          )}
      </div>
    </article>
  );
}

/* ======================================================
   COMPONENT
====================================================== */

export default function AdminServiceMediaSection({
  service,
  onChangeTab,
}) {
  const {
    isContentManager,
  } = useAdminAuth();

  const [
    sections,
    setSections,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    uploadingKey,
    setUploadingKey,
  ] = useState("");

  const [
    deletingKey,
    setDeletingKey,
  ] = useState("");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  /* ====================================================
     LOAD SECTIONS
  ==================================================== */

  const loadSections =
    useCallback(async () => {
      if (!service?.id) {
        setSections([]);
        setLoading(false);

        return;
      }

      try {
        setLoading(true);

        setErrorMessage("");

        const {
          data,
          error,
        } =
          await supabase
            .from(
              SECTION_TABLE
            )
            .select(
              `
              id,
              service_id,
              section_key,
              section_type,
              eyebrow,
              title,
              image_url,
              file_url,
              sort_order,
              status
              `
            )
            .eq(
              "service_id",
              service.id
            )
            .order(
              "sort_order",
              {
                ascending: true,
              }
            );

        if (error) {
          throw error;
        }

        setSections(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(
          "Media Product gagal dimuat:",
          error
        );

        setSections([]);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Media Product gagal dimuat."
        );
      } finally {
        setLoading(false);
      }
    }, [service?.id]);

  useEffect(() => {
    loadSections();
  }, [loadSections]);

  /* ====================================================
     MEDIA TARGETS
  ==================================================== */

  const mediaTargets =
    useMemo(() => {
      if (
        service?.slug ===
        "simrs-erp"
      ) {
        return SIMRS_MEDIA_TARGETS.map(
          (definition) => {
            const section =
              sections.find(
                (item) =>
                  item.section_key ===
                  definition.sectionKey
              );

            if (!section) {
              return {
                ...definition,
                section: null,
              };
            }

            return {
              ...definition,
              section,
            };
          }
        );
      }

      /*
       * Untuk Product selain SIMRS,
       * kebutuhan media dibaca langsung
       * dari section_type.
       */

      return sections
        .map(
          (section) => {
            const mediaType =
              supportsGenericMedia(
                section
              );

            if (!mediaType) {
              return null;
            }

            return {
              sectionKey:
                section.section_key,

              mediaType,

              title:
                section.title ||
                section.section_key,

              description:
                mediaType ===
                "pdf"
                  ? "Dokumen PDF untuk section ini."
                  : "Visual untuk section halaman Product.",

              section,
            };
          }
        )
        .filter(Boolean);
    }, [
      service?.slug,
      sections,
    ]);

  const availableTargets =
    mediaTargets.filter(
      (item) =>
        Boolean(
          item.section
        )
    );

  const missingSections =
    mediaTargets.filter(
      (item) =>
        !item.section
    );

  const completedMedia =
    availableTargets.filter(
      (item) => {
        if (
          item.mediaType ===
          "pdf"
        ) {
          return Boolean(
            cleanText(
              item.section.file_url
            )
          );
        }

        return Boolean(
          cleanText(
            item.section.image_url
          )
        );
      }
    ).length;

  const missingMedia =
    availableTargets.length -
    completedMedia;

  /* ====================================================
     VALIDATE FILE
  ==================================================== */

  function validateFile(
    item,
    file
  ) {
    if (
      item.mediaType ===
      "image"
    ) {
      if (
        !IMAGE_TYPES.includes(
          file.type
        )
      ) {
        return "Gambar harus berformat JPG, PNG, atau WebP.";
      }

      if (
        file.size >
        IMAGE_MAX_SIZE
      ) {
        return "Ukuran gambar maksimal 5 MB.";
      }

      return "";
    }

    if (
      item.mediaType ===
      "pdf"
    ) {
      if (
        !PDF_TYPES.includes(
          file.type
        )
      ) {
        return "Dokumen harus berformat PDF.";
      }

      if (
        file.size >
        PDF_MAX_SIZE
      ) {
        return "Ukuran PDF maksimal 10 MB.";
      }

      return "";
    }

    return "Jenis media tidak didukung.";
  }

  /* ====================================================
     UPLOAD
  ==================================================== */

  async function handleUpload(
    item,
    file
  ) {
    if (
      !isContentManager ||
      !item?.section ||
      uploadingKey
    ) {
      return;
    }

    const validationMessage =
      validateFile(
        item,
        file
      );

    if (
      validationMessage
    ) {
      setErrorMessage(
        validationMessage
      );

      return;
    }

    const oldUrl =
      item.mediaType ===
      "pdf"
        ? item.section.file_url
        : item.section.image_url;

    const storagePath =
      createStoragePath({
        serviceId:
          service.id,

        sectionKey:
          item.sectionKey,

        fileName:
          file.name,
      });

    try {
      setUploadingKey(
        item.sectionKey
      );

      setErrorMessage("");

      setSuccessMessage("");

      /* ================================================
         1. UPLOAD FILE
      ================================================ */

      const {
        error:
          uploadError,
      } =
        await supabase.storage
          .from(
            MEDIA_BUCKET
          )
          .upload(
            storagePath,
            file,
            {
              cacheControl:
                "3600",

              upsert:
                false,

              contentType:
                file.type,
            }
          );

      if (uploadError) {
        throw uploadError;
      }

      /* ================================================
         2. GET PUBLIC URL
      ================================================ */

      const {
        data:
          publicUrlData,
      } =
        supabase.storage
          .from(
            MEDIA_BUCKET
          )
          .getPublicUrl(
            storagePath
          );

      const publicUrl =
        publicUrlData
          ?.publicUrl;

      if (!publicUrl) {
        throw new Error(
          "Public URL media gagal dibuat."
        );
      }

      /* ================================================
         3. UPDATE SECTION
      ================================================ */

      const updatePayload =
        item.mediaType ===
        "pdf"
          ? {
              file_url:
                publicUrl,
            }
          : {
              image_url:
                publicUrl,
            };

      const {
        error:
          updateError,
      } =
        await supabase
          .from(
            SECTION_TABLE
          )
          .update(
            updatePayload
          )
          .eq(
            "id",
            item.section.id
          );

      if (updateError) {
        /*
         * File baru dihapus jika
         * penyimpanan URL ke DB gagal.
         */

        await supabase.storage
          .from(
            MEDIA_BUCKET
          )
          .remove([
            storagePath,
          ]);

        throw updateError;
      }

      /* ================================================
         4. DELETE OLD FILE
      ================================================ */

      const oldPath =
        extractStoragePath(
          oldUrl
        );

      if (
        oldPath &&
        oldPath !==
          storagePath
      ) {
        const {
          error:
            removeOldError,
        } =
          await supabase.storage
            .from(
              MEDIA_BUCKET
            )
            .remove([
              oldPath,
            ]);

        if (
          removeOldError
        ) {
          console.warn(
            "Media lama tidak dapat dihapus:",
            removeOldError
          );
        }
      }

      setSuccessMessage(
        `${item.title} berhasil diupload.`
      );

      await loadSections();
    } catch (error) {
      console.error(
        "Upload media gagal:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Upload media gagal."
      );
    } finally {
      setUploadingKey("");
    }
  }

  /* ====================================================
     REMOVE MEDIA
  ==================================================== */

  async function handleRemove(
    item
  ) {
    if (
      !isContentManager ||
      !item?.section ||
      deletingKey
    ) {
      return;
    }

    const mediaUrl =
      item.mediaType ===
      "pdf"
        ? item.section.file_url
        : item.section.image_url;

    if (!mediaUrl) {
      return;
    }

    const confirmed =
      window.confirm(
        `Hapus media "${item.title}"?\n\nMedia akan dihapus dari halaman Product.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingKey(
        item.sectionKey
      );

      setErrorMessage("");

      setSuccessMessage("");

      /* ================================================
         1. CLEAR DB URL
      ================================================ */

      const updatePayload =
        item.mediaType ===
        "pdf"
          ? {
              file_url:
                null,
            }
          : {
              image_url:
                null,
            };

      const {
        error:
          updateError,
      } =
        await supabase
          .from(
            SECTION_TABLE
          )
          .update(
            updatePayload
          )
          .eq(
            "id",
            item.section.id
          );

      if (updateError) {
        throw updateError;
      }

      /* ================================================
         2. REMOVE STORAGE FILE
      ================================================ */

      const storagePath =
        extractStoragePath(
          mediaUrl
        );

      if (storagePath) {
        const {
          error:
            removeError,
        } =
          await supabase.storage
            .from(
              MEDIA_BUCKET
            )
            .remove([
              storagePath,
            ]);

        if (removeError) {
          console.warn(
            "File storage tidak dapat dihapus:",
            removeError
          );
        }
      }

      setSuccessMessage(
        `${item.title} berhasil dihapus.`
      );

      await loadSections();
    } catch (error) {
      console.error(
        "Media gagal dihapus:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Media gagal dihapus."
      );
    } finally {
      setDeletingKey("");
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
            Memuat Media Product...
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Mengambil media CMS dari Supabase.
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
              <ImageIcon
                size={14}
              />

              Media Manager
            </div>

            <h2 className="mt-4 text-2xl font-bold text-[#082B3A]">
              Media Product
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">
              Kelola visual dan dokumen halaman{" "}
              <span className="font-semibold text-[#082B3A]">
                {service?.name ||
                  "Product"}
              </span>
              . Media yang diupload disimpan di Supabase Storage dan
              dihubungkan ke section CMS terkait.
            </p>
          </div>

          <button
            type="button"
            onClick={
              loadSections
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-[#FF5A0A] hover:text-[#FF5A0A]"
          >
            <RefreshCw
              size={16}
            />

            Refresh
          </button>
        </div>
      </section>

      {/* ==================================================
          MESSAGES
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
          PRODUCT MAIN IMAGE
      ================================================== */}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-center">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
            {service?.image_url ? (
              <img
                src={
                  service.image_url
                }
                alt={
                  service.name ||
                  "Product"
                }
                className="aspect-video w-full object-cover"
              />
            ) : (
              <div className="flex aspect-video items-center justify-center">
                <ImageIcon
                  size={42}
                  className="text-slate-300"
                />
              </div>
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Product Image
              </span>

              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                  service?.image_url
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {service?.image_url
                  ? "Tersedia"
                  : "Belum Ada"}
              </span>
            </div>

            <h3 className="mt-4 text-lg font-bold text-[#082B3A]">
              Gambar Utama Product
            </h3>

            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
              Gambar utama masih menggunakan mekanisme upload dari form
              Service agar proses update tidak menduplikasi logika
              `service-images`.
            </p>

            <button
              type="button"
              onClick={() =>
                onChangeTab?.(
                  "informasi"
                )
              }
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#082B3A] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0A4053]"
            >
              <ImageIcon
                size={16}
              />

              Kelola Gambar Utama
            </button>
          </div>
        </div>
      </section>

      {/* ==================================================
          SUMMARY
      ================================================== */}

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl bg-[#082B3A] p-5 text-white">
          <ImageIcon
            size={20}
            className="text-orange-300"
          />

          <p className="mt-4 text-3xl font-bold">
            {
              availableTargets.length
            }
          </p>

          <p className="mt-1 text-sm text-white/55">
            Kebutuhan Media
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <CheckCircle2
            size={20}
            className="text-emerald-600"
          />

          <p className="mt-4 text-3xl font-bold text-[#082B3A]">
            {
              completedMedia
            }
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Sudah Tersedia
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <AlertTriangle
            size={20}
            className={
              missingMedia > 0
                ? "text-amber-600"
                : "text-emerald-600"
            }
          />

          <p className="mt-4 text-3xl font-bold text-[#082B3A]">
            {
              missingMedia
            }
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Belum Lengkap
          </p>
        </article>
      </section>

      {/* ==================================================
          MISSING SECTION WARNING
      ================================================== */}

      {missingSections.length >
        0 && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <div className="flex items-start gap-3">
            <AlertTriangle
              size={20}
              className="mt-0.5 shrink-0 text-amber-600"
            />

            <div>
              <p className="font-semibold text-amber-800">
                Ada kebutuhan media yang belum memiliki Section
              </p>

              <p className="mt-1 text-xs leading-6 text-amber-700">
                {missingSections
                  .map(
                    (item) =>
                      item.title
                  )
                  .join(", ")}
                .
              </p>

              <button
                type="button"
                onClick={() =>
                  onChangeTab?.(
                    "konten"
                  )
                }
                className="mt-3 rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-xs font-semibold text-amber-800"
              >
                Buka Konten Halaman
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ==================================================
          MEDIA GRID
      ================================================== */}

      {availableTargets.length ===
      0 ? (
        <section className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <ImageIcon
            size={46}
            className="mx-auto text-slate-300"
          />

          <h3 className="mt-5 text-xl font-bold text-[#082B3A]">
            Belum ada Section yang membutuhkan media
          </h3>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-slate-500">
            Buat Section Hero, Showcase, Statistics atau Download terlebih
            dahulu dari tab Konten Halaman.
          </p>

          <button
            type="button"
            onClick={() =>
              onChangeTab?.(
                "konten"
              )
            }
            className="mt-5 rounded-xl bg-[#082B3A] px-5 py-3 text-sm font-semibold text-white"
          >
            Buka Konten Halaman
          </button>
        </section>
      ) : (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {availableTargets.map(
            (item) => (
              <MediaCard
                key={
                  item.sectionKey
                }
                item={
                  item
                }
                canManage={
                  isContentManager
                }
                uploadingKey={
                  uploadingKey
                }
                deletingKey={
                  deletingKey
                }
                onUpload={
                  handleUpload
                }
                onRemove={
                  handleRemove
                }
              />
            )
          )}
        </section>
      )}

      {/* ==================================================
          STORAGE NOTE
      ================================================== */}

      <section className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4">
        <p className="text-sm font-semibold text-blue-800">
          Penyimpanan Media
        </p>

        <p className="mt-1 text-xs leading-6 text-blue-700">
          Gambar CMS menerima JPG, PNG, atau WebP maksimal 5 MB.
          Dokumen menerima PDF maksimal 10 MB. Upload media tidak mengubah
          status Draft/Published dari Section.
        </p>
      </section>
    </div>
  );
}