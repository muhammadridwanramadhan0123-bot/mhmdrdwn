import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  FileImage,
  FileText,
  LoaderCircle,
  Plus,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

import { useAdminAuth } from "../../contexts/AdminAuthContext";

import {
  CERTIFICATION_CATEGORIES,
  createCertification,
  deleteCertification,
  deleteCredentialAsset,
  getAdminCertifications,
  updateCertification,
  uploadCertificationFile,
} from "../../services/companyCredentialService";

function createInitialFormData(
  sortOrder = 0
) {
  return {
    title: "",
    category: "ISO",
    description: "",
    image_url: "",
    document_url: "",
    issued_year: "",
    sort_order: sortOrder,
    is_active: true,
  };
}

function sortCertificationRecords(items) {
  return [...items].sort(
    (firstItem, secondItem) => {
      const firstOrder =
        Number(firstItem.sort_order) || 0;

      const secondOrder =
        Number(secondItem.sort_order) || 0;

      if (firstOrder !== secondOrder) {
        return firstOrder - secondOrder;
      }

      return String(
        firstItem.title || ""
      ).localeCompare(
        String(secondItem.title || ""),
        "id"
      );
    }
  );
}

function formatUpdatedAt(value) {
  if (!value) {
    return "Belum tersedia";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Belum tersedia";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getFileNameFromUrl(value) {
  const normalizedUrl = String(
    value || ""
  ).trim();

  if (!normalizedUrl) {
    return "";
  }

  try {
    const parsedUrl = new URL(
      normalizedUrl
    );

    const pathParts =
      parsedUrl.pathname.split("/");

    return decodeURIComponent(
      pathParts[pathParts.length - 1] ||
        "dokumen-sertifikat"
    );
  } catch {
    const pathParts =
      normalizedUrl.split("/");

    return decodeURIComponent(
      pathParts[pathParts.length - 1] ||
        "dokumen-sertifikat"
    );
  }
}

function getCategoryClass(category) {
  switch (category) {
    case "ISO":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "Hak Cipta":
      return "border-violet-200 bg-violet-50 text-violet-700";

    case "PSE":
      return "border-cyan-200 bg-cyan-50 text-cyan-700";

    case "BSSN":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "Sertifikat Lain":
    default:
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
}

function CertificationsLoading() {
  return (
    <div className="space-y-7">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-32 animate-pulse rounded-3xl bg-slate-200"
          />
        ))}
      </div>

      <div className="h-20 animate-pulse rounded-3xl bg-slate-200" />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map(
          (item) => (
            <div
              key={item}
              className="h-[460px] animate-pulse rounded-3xl bg-slate-200"
            />
          )
        )}
      </div>
    </div>
  );
}

export default function AdminCompanyCertificationsPage() {
  const {
    isAdmin,
    isEditor,
  } = useAdminAuth();

  const [
    certifications,
    setCertifications,
  ] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [
    deletingId,
    setDeletingId,
  ] = useState(null);

  const [
    togglingId,
    setTogglingId,
  ] = useState(null);

  const [formOpen, setFormOpen] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [formData, setFormData] =
    useState(createInitialFormData());

  const [imageFile, setImageFile] =
    useState(null);

  const [
    imagePreviewUrl,
    setImagePreviewUrl,
  ] = useState("");

  const [
    originalImageUrl,
    setOriginalImageUrl,
  ] = useState("");

  const [
    documentFile,
    setDocumentFile,
  ] = useState(null);

  const [
    originalDocumentUrl,
    setOriginalDocumentUrl,
  ] = useState("");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [
    categoryFilter,
    setCategoryFilter,
  ] = useState("all");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  useEffect(() => {
    return () => {
      if (
        imagePreviewUrl.startsWith(
          "blob:"
        )
      ) {
        URL.revokeObjectURL(
          imagePreviewUrl
        );
      }
    };
  }, [imagePreviewUrl]);

  const loadCertifications =
    useCallback(async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const data =
          await getAdminCertifications();

        setCertifications(
          sortCertificationRecords(
            Array.isArray(data)
              ? data
              : []
          )
        );
      } catch (error) {
        console.error(
          "Sertifikasi gagal dimuat:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Daftar sertifikasi gagal dimuat."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadCertifications();
  }, [loadCertifications]);

  const summary = useMemo(() => {
    const active =
      certifications.filter(
        (item) => item.is_active
      ).length;

    const withDocument =
      certifications.filter((item) =>
        Boolean(
          String(
            item.document_url || ""
          ).trim()
        )
      ).length;

    const categories = new Set(
      certifications
        .map((item) => item.category)
        .filter(Boolean)
    );

    return {
      total: certifications.length,
      active,
      inactive:
        certifications.length -
        active,
      withDocument,
      categories: categories.size,
    };
  }, [certifications]);

  const filteredCertifications =
    useMemo(() => {
      const normalizedSearch =
        searchTerm.trim().toLowerCase();

      return certifications.filter(
        (certification) => {
          const searchableText = [
            certification.title,
            certification.category,
            certification.description,
            certification.issued_year,
          ]
            .map((value) =>
              String(value || "")
                .toLowerCase()
            )
            .join(" ");

          const matchesSearch =
            !normalizedSearch ||
            searchableText.includes(
              normalizedSearch
            );

          const matchesCategory =
            categoryFilter === "all" ||
            certification.category ===
              categoryFilter;

          const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "active" &&
              certification.is_active) ||
            (statusFilter ===
              "inactive" &&
              !certification.is_active);

          return (
            matchesSearch &&
            matchesCategory &&
            matchesStatus
          );
        }
      );
    }, [
      certifications,
      searchTerm,
      categoryFilter,
      statusFilter,
    ]);

  function resetFilters() {
    setSearchTerm("");
    setCategoryFilter("all");
    setStatusFilter("all");
  }

  function clearImagePreview() {
    if (
      imagePreviewUrl.startsWith(
        "blob:"
      )
    ) {
      URL.revokeObjectURL(
        imagePreviewUrl
      );
    }

    setImagePreviewUrl("");
  }

  function resetFormState() {
    setEditingId(null);

    setFormData(
      createInitialFormData()
    );

    setImageFile(null);
    clearImagePreview();
    setOriginalImageUrl("");

    setDocumentFile(null);
    setOriginalDocumentUrl("");
  }

  function closeForm() {
    if (saving) {
      return;
    }

    setFormOpen(false);
    resetFormState();
  }

  function openCreateForm() {
    const highestSortOrder =
      certifications.reduce(
        (highestValue, item) =>
          Math.max(
            highestValue,
            Number(item.sort_order) || 0
          ),
        -1
      );

    setEditingId(null);

    setFormData(
      createInitialFormData(
        highestSortOrder + 1
      )
    );

    setImageFile(null);
    clearImagePreview();
    setOriginalImageUrl("");

    setDocumentFile(null);
    setOriginalDocumentUrl("");

    setErrorMessage("");
    setSuccessMessage("");
    setFormOpen(true);
  }

  function openEditForm(
    certification
  ) {
    setEditingId(certification.id);

    setFormData({
      title:
        certification.title || "",

      category:
        certification.category ||
        "ISO",

      description:
        certification.description || "",

      image_url:
        certification.image_url || "",

      document_url:
        certification.document_url ||
        "",

      issued_year:
        certification.issued_year ??
        "",

      sort_order:
        Number(
          certification.sort_order
        ) || 0,

      is_active: Boolean(
        certification.is_active
      ),
    });

    setOriginalImageUrl(
      certification.image_url || ""
    );

    setOriginalDocumentUrl(
      certification.document_url || ""
    );

    setImageFile(null);
    clearImagePreview();
    setDocumentFile(null);

    setErrorMessage("");
    setSuccessMessage("");
    setFormOpen(true);
  }

  function handleChange(event) {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormData(
      (currentFormData) => ({
        ...currentFormData,

        [name]:
          type === "checkbox"
            ? checked
            : value,
      })
    );

    setSuccessMessage("");
  }

  function handleImageChange(event) {
    const selectedFile =
      event.target.files?.[0];

    event.target.value = "";

    if (!selectedFile) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(
        selectedFile.type
      )
    ) {
      setErrorMessage(
        "Gambar sertifikat harus berformat JPG, PNG, atau WebP."
      );

      return;
    }

    const maximumSize =
      10 * 1024 * 1024;

    if (
      selectedFile.size >
      maximumSize
    ) {
      setErrorMessage(
        "Ukuran gambar maksimal 10 MB."
      );

      return;
    }

    clearImagePreview();

    setErrorMessage("");
    setSuccessMessage("");
    setImageFile(selectedFile);

    setImagePreviewUrl(
      URL.createObjectURL(
        selectedFile
      )
    );
  }

  function handleDocumentChange(
    event
  ) {
    const selectedFile =
      event.target.files?.[0];

    event.target.value = "";

    if (!selectedFile) {
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(
        selectedFile.type
      )
    ) {
      setErrorMessage(
        "Dokumen harus berformat PDF, JPG, PNG, atau WebP."
      );

      return;
    }

    const maximumSize =
      10 * 1024 * 1024;

    if (
      selectedFile.size >
      maximumSize
    ) {
      setErrorMessage(
        "Ukuran dokumen maksimal 10 MB."
      );

      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setDocumentFile(selectedFile);
  }

  function handleRemoveImage() {
    setImageFile(null);
    clearImagePreview();

    setFormData(
      (currentFormData) => ({
        ...currentFormData,
        image_url: "",
      })
    );

    setSuccessMessage("");
  }

  function handleRemoveDocument() {
    setDocumentFile(null);

    setFormData(
      (currentFormData) => ({
        ...currentFormData,
        document_url: "",
      })
    );

    setSuccessMessage("");
  }

  function validateForm() {
    const title =
      formData.title.trim();

    if (!title) {
      return "Judul sertifikasi wajib diisi.";
    }

    if (
      !CERTIFICATION_CATEGORIES.includes(
        formData.category
      )
    ) {
      return "Kategori sertifikasi tidak valid.";
    }

    if (
      formData.issued_year !== ""
    ) {
      const issuedYear =
        Number.parseInt(
          formData.issued_year,
          10
        );

      if (
        !Number.isFinite(issuedYear) ||
        issuedYear < 1900 ||
        issuedYear > 2200
      ) {
        return "Tahun penerbitan harus berada antara 1900 dan 2200.";
      }
    }

    const sortOrder =
      Number.parseInt(
        formData.sort_order,
        10
      );

    if (
      !Number.isFinite(sortOrder) ||
      sortOrder < 0
    ) {
      return "Urutan tampil minimal bernilai 0.";
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationMessage =
      validateForm();

    if (validationMessage) {
      setErrorMessage(
        validationMessage
      );

      return;
    }

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    const newlyUploadedAssets = [];
    let saveCompleted = false;

    try {
      let nextImageUrl =
        formData.image_url;

      let nextDocumentUrl =
        formData.document_url;

      if (imageFile) {
        const uploadedImage =
          await uploadCertificationFile(
            imageFile
          );

        nextImageUrl =
          uploadedImage.publicUrl;

        newlyUploadedAssets.push(
          uploadedImage
        );
      }

      if (documentFile) {
        const uploadedDocument =
          await uploadCertificationFile(
            documentFile
          );

        nextDocumentUrl =
          uploadedDocument.publicUrl;

        newlyUploadedAssets.push(
          uploadedDocument
        );
      }

      const payload = {
        title:
          formData.title.trim(),

        category:
          formData.category,

        description:
          formData.description.trim(),

        image_url:
          nextImageUrl,

        document_url:
          nextDocumentUrl,

        issued_year:
          formData.issued_year
            ? Number.parseInt(
                formData.issued_year,
                10
              )
            : null,

        sort_order:
          Number.parseInt(
            formData.sort_order,
            10
          ),

        is_active: Boolean(
          formData.is_active
        ),
      };

      const savedCertification =
        editingId
          ? await updateCertification(
              editingId,
              payload
            )
          : await createCertification(
              payload
            );

      saveCompleted = true;

      const oldAssets = new Set();

      if (
        originalImageUrl &&
        originalImageUrl !==
          savedCertification.image_url
      ) {
        oldAssets.add(
          originalImageUrl
        );
      }

      if (
        originalDocumentUrl &&
        originalDocumentUrl !==
          savedCertification.document_url
      ) {
        oldAssets.add(
          originalDocumentUrl
        );
      }

      for (
        const assetUrl of oldAssets
      ) {
        try {
          await deleteCredentialAsset(
            assetUrl
          );
        } catch (deleteError) {
          console.warn(
            "File lama gagal dihapus:",
            deleteError
          );
        }
      }

      setCertifications(
        (currentItems) => {
          if (editingId) {
            return sortCertificationRecords(
              currentItems.map((item) =>
                item.id === editingId
                  ? savedCertification
                  : item
              )
            );
          }

          return sortCertificationRecords([
            ...currentItems,
            savedCertification,
          ]);
        }
      );

      setSuccessMessage(
        editingId
          ? "Sertifikasi berhasil diperbarui."
          : "Sertifikasi berhasil ditambahkan."
      );

      setFormOpen(false);
      resetFormState();
    } catch (error) {
      console.error(
        "Sertifikasi gagal disimpan:",
        error
      );

      if (!saveCompleted) {
        for (
          const uploadedAsset of
          newlyUploadedAssets
        ) {
          try {
            await deleteCredentialAsset(
              uploadedAsset?.publicUrl ||
                uploadedAsset
            );
          } catch (cleanupError) {
            console.warn(
              "File sementara gagal dibersihkan:",
              cleanupError
            );
          }
        }
      }

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Sertifikasi gagal disimpan."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(
    certification
  ) {
    try {
      setTogglingId(
        certification.id
      );

      setErrorMessage("");
      setSuccessMessage("");

      const updatedCertification =
        await updateCertification(
          certification.id,
          {
            title:
              certification.title,

            category:
              certification.category,

            description:
              certification.description,

            image_url:
              certification.image_url,

            document_url:
              certification.document_url,

            issued_year:
              certification.issued_year,

            sort_order:
              certification.sort_order,

            is_active:
              !certification.is_active,
          }
        );

      setCertifications(
        (currentItems) =>
          sortCertificationRecords(
            currentItems.map((item) =>
              item.id ===
              certification.id
                ? updatedCertification
                : item
            )
          )
      );

      setSuccessMessage(
        updatedCertification.is_active
          ? "Sertifikasi berhasil diaktifkan."
          : "Sertifikasi berhasil dinonaktifkan."
      );
    } catch (error) {
      console.error(
        "Status sertifikasi gagal diperbarui:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Status sertifikasi gagal diperbarui."
      );
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(
    certification
  ) {
    if (!isAdmin) {
      setSuccessMessage("");

      setErrorMessage(
        "Hanya admin yang dapat menghapus sertifikasi."
      );

      return;
    }

    const approved = window.confirm(
      `Hapus sertifikasi "${certification.title}"?\n\nData yang dihapus tidak dapat dikembalikan.`
    );

    if (!approved) {
      return;
    }

    try {
      setDeletingId(
        certification.id
      );

      setErrorMessage("");
      setSuccessMessage("");

      await deleteCertification(
        certification.id
      );

      const assetUrls = new Set(
        [
          certification.image_url,
          certification.document_url,
        ].filter(Boolean)
      );

      for (
        const assetUrl of assetUrls
      ) {
        try {
          await deleteCredentialAsset(
            assetUrl
          );
        } catch (deleteAssetError) {
          console.warn(
            "Data terhapus, tetapi file gagal dihapus:",
            deleteAssetError
          );
        }
      }

      setCertifications(
        (currentItems) =>
          currentItems.filter(
            (item) =>
              item.id !==
              certification.id
          )
      );

      setSuccessMessage(
        "Sertifikasi berhasil dihapus."
      );
    } catch (error) {
      console.error(
        "Sertifikasi gagal dihapus:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Sertifikasi gagal dihapus."
      );
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <CertificationsLoading />
    );
  }

  const displayedImage =
    imagePreviewUrl ||
    formData.image_url;

  const displayedDocumentName =
    documentFile?.name ||
    getFileNameFromUrl(
      formData.document_url
    );

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <Link
            to="/admin/company"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#FF5A0A]"
          >
            <ArrowLeft size={17} />
            Company Management
          </Link>

          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
            <ShieldCheck size={14} />
            Certifications
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#082B3A] md:text-4xl">
            Kelola Sertifikasi
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
            Kelola ISO, Hak Cipta, PSE,
            BSSN, sertifikat lainnya,
            dokumen, gambar, status, dan
            urutan tampil.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Link
            to="/company/about-us"
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-[#082B3A] shadow-sm transition hover:border-[#FF5A0A] hover:text-[#FF5A0A] sm:w-auto"
          >
            Halaman Publik
            <ExternalLink size={16} />
          </Link>

          <button
            type="button"
            onClick={
              loadCertifications
            }
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-[#FF5A0A] hover:text-[#FF5A0A] sm:w-auto"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF5A0A] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:bg-[#E94F00] sm:w-auto"
          >
            <Plus size={18} />
            Tambah Sertifikasi
          </button>
        </div>
      </section>

      {/* Error */}
      {errorMessage && (
        <div
          role="alert"
          className="flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle
              size={21}
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
            className="shrink-0 text-xs font-semibold text-red-700"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Success */}
      {successMessage && (
        <div
          role="status"
          className="flex items-start justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2
              size={21}
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
            className="shrink-0 text-xs font-semibold text-emerald-700"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Mode editor */}
      {isEditor && (
        <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4">
          <ShieldCheck
            size={21}
            className="mt-0.5 shrink-0 text-blue-600"
          />

          <div>
            <p className="font-semibold text-blue-800">
              Mode Editor
            </p>

            <p className="mt-1 text-sm leading-6 text-blue-700">
              Anda dapat menambah,
              mengedit, mengunggah file,
              dan mengubah status
              sertifikasi. Penghapusan
              data hanya dapat dilakukan
              oleh admin.
            </p>
          </div>
        </div>
      )}

      {/* Statistik */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-3xl bg-[#082B3A] p-6 text-white">
          <ShieldCheck
            size={24}
            className="text-[#FF5A0A]"
          />

          <p className="mt-7 text-3xl font-bold">
            {summary.total}
          </p>

          <p className="mt-2 text-sm text-white/60">
            Total sertifikasi
          </p>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <Eye
            size={24}
            className="text-emerald-600"
          />

          <p className="mt-7 text-3xl font-bold text-[#082B3A]">
            {summary.active}
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Sertifikasi aktif
          </p>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <FileText
            size={24}
            className="text-blue-600"
          />

          <p className="mt-7 text-3xl font-bold text-[#082B3A]">
            {summary.withDocument}
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Memiliki dokumen
          </p>
        </article>

        <article className="rounded-3xl bg-gradient-to-br from-blue-600 to-blue-800 p-6 text-white">
          <BadgeCheck size={24} />

          <p className="mt-7 text-3xl font-bold">
            {summary.categories}
          </p>

          <p className="mt-2 text-sm text-white/80">
            Kategori digunakan
          </p>
        </article>
      </section>

      {/* Filter */}
      <section className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm xl:grid-cols-[minmax(0,1fr)_220px_200px_auto]">
        <div className="relative">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="search"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
            placeholder="Cari judul, kategori, tahun..."
            className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm text-[#082B3A] outline-none transition placeholder:text-slate-400 focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(event) =>
            setCategoryFilter(
              event.target.value
            )
          }
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#082B3A] outline-none transition focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
        >
          <option value="all">
            Semua Kategori
          </option>

          {CERTIFICATION_CATEGORIES.map(
            (category) => (
              <option
                key={category}
                value={category}
              >
                {category}
              </option>
            )
          )}
        </select>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value
            )
          }
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#082B3A] outline-none transition focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
        >
          <option value="all">
            Semua Status
          </option>

          <option value="active">
            Aktif
          </option>

          <option value="inactive">
            Nonaktif
          </option>
        </select>

        <button
          type="button"
          onClick={resetFilters}
          className="w-full rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-[#FF5A0A] hover:text-[#FF5A0A] xl:w-auto"
        >
          Reset
        </button>
      </section>

      {/* Daftar */}
      {filteredCertifications.length ===
      0 ? (
        <section className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <ShieldCheck
            size={44}
            className="mx-auto text-slate-300"
          />

          <h2 className="mt-5 text-xl font-bold text-[#082B3A]">
            Sertifikasi tidak ditemukan
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Belum ada data atau tidak ada
            sertifikasi yang sesuai filter.
          </p>

          <button
            type="button"
            onClick={
              certifications.length === 0
                ? openCreateForm
                : resetFilters
            }
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#FF5A0A] px-5 py-3 text-sm font-semibold text-white"
          >
            {certifications.length ===
            0 ? (
              <>
                <Plus size={17} />
                Tambah Sertifikasi
              </>
            ) : (
              "Tampilkan Semua"
            )}
          </button>
        </section>
      ) : (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredCertifications.map(
            (certification) => (
              <article
                key={certification.id}
                className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
              >
                <div className="relative flex h-52 items-center justify-center overflow-hidden bg-slate-50">
                  {certification.image_url ? (
                    <img
                      src={
                        certification.image_url
                      }
                      alt={
                        certification.title
                      }
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="text-center">
                      <ShieldCheck
                        size={52}
                        className="mx-auto text-slate-300"
                      />

                      <p className="mt-3 text-xs font-semibold text-slate-400">
                        Gambar belum tersedia
                      </p>
                    </div>
                  )}

                  <span
                    className={`absolute left-3 top-3 max-w-[60%] truncate rounded-full border px-3 py-1.5 text-xs font-semibold sm:left-5 sm:top-5 ${getCategoryClass(
                      certification.category
                    )}`}
                  >
                    {
                      certification.category
                    }
                  </span>

                  <span
                    className={`absolute right-3 top-3 rounded-full px-3 py-1.5 text-xs font-semibold sm:right-5 sm:top-5 ${
                      certification.is_active
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-700 text-white"
                    }`}
                  >
                    {certification.is_active
                      ? "Aktif"
                      : "Nonaktif"}
                  </span>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#FF5A0A]">
                      Urutan{" "}
                      {
                        certification.sort_order
                      }
                    </p>

                    <p className="text-xs text-slate-400">
                      {formatUpdatedAt(
                        certification.updated_at
                      )}
                    </p>
                  </div>

                  <h2 className="mt-4 break-words text-xl font-bold leading-8 text-[#082B3A]">
                    {certification.title}
                  </h2>

                  {certification.issued_year && (
                    <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-500">
                      <CalendarDays
                        size={16}
                      />

                      Diterbitkan{" "}
                      {
                        certification.issued_year
                      }
                    </p>
                  )}

                  <p className="mt-4 line-clamp-3 min-h-[5.25rem] text-sm leading-7 text-slate-500">
                    {certification.description ||
                      "Deskripsi sertifikasi belum tersedia."}
                  </p>

                  <div className="mt-5 border-t border-slate-100 pt-5">
                    {certification.document_url ? (
                      <a
                        href={
                          certification.document_url
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600"
                      >
                        <Download
                          size={16}
                        />

                        Lihat Dokumen

                        <ExternalLink
                          size={14}
                        />
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400">
                        <FileText size={16} />
                        Dokumen belum tersedia
                      </span>
                    )}
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-3 border-t border-slate-100 pt-5 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleToggleActive(
                          certification
                        )
                      }
                      disabled={
                        togglingId ===
                        certification.id
                      }
                      className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                        certification.is_active
                          ? "border-slate-200 text-slate-600 hover:border-slate-400"
                          : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      }`}
                    >
                      {togglingId ===
                      certification.id ? (
                        <LoaderCircle
                          size={16}
                          className="animate-spin"
                        />
                      ) : certification.is_active ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}

                      {certification.is_active
                        ? "Nonaktifkan"
                        : "Aktifkan"}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        openEditForm(
                          certification
                        )
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#082B3A] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0A4053]"
                    >
                      <Edit3 size={16} />
                      Edit
                    </button>
                  </div>

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(
                          certification
                        )
                      }
                      disabled={
                        deletingId ===
                        certification.id
                      }
                      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingId ===
                      certification.id ? (
                        <>
                          <LoaderCircle
                            size={16}
                            className="animate-spin"
                          />
                          Menghapus...
                        </>
                      ) : (
                        <>
                          <Trash2
                            size={16}
                          />
                          Hapus Sertifikasi
                        </>
                      )}
                    </button>
                  )}
                </div>
              </article>
            )
          )}
        </section>
      )}

      {/* Modal */}
      {formOpen && (
        <div className="fixed inset-0 z-[80] overflow-y-auto bg-[#082B3A]/70 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-8">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl sm:rounded-3xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5 md:px-8">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#FF5A0A]">
                  Certification Form
                </p>

                <h2 className="mt-2 break-words text-xl font-bold text-[#082B3A] sm:text-2xl">
                  {editingId
                    ? "Edit Sertifikasi"
                    : "Tambah Sertifikasi"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                aria-label="Tutup form"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-red-200 hover:text-red-600 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid gap-8 p-4 sm:p-6 md:p-8 xl:grid-cols-[minmax(0,1fr)_360px]">
                {/* Form utama */}
                <div className="min-w-0 space-y-6">
                  <div>
                    <label
                      htmlFor="certification-title"
                      className="mb-2 block text-sm font-semibold text-[#082B3A]"
                    >
                      Judul Sertifikasi

                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <input
                      id="certification-title"
                      name="title"
                      type="text"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      placeholder="Contoh: ISO 27001 Information Security Management"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#082B3A] outline-none transition placeholder:text-slate-400 focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
                    />
                  </div>

                  <div className="grid gap-5 md:grid-cols-3">
                    <div>
                      <label
                        htmlFor="certification-category"
                        className="mb-2 block text-sm font-semibold text-[#082B3A]"
                      >
                        Kategori

                        <span className="ml-1 text-red-500">
                          *
                        </span>
                      </label>

                      <select
                        id="certification-category"
                        name="category"
                        value={
                          formData.category
                        }
                        onChange={handleChange}
                        required
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#082B3A] outline-none transition focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
                      >
                        {CERTIFICATION_CATEGORIES.map(
                          (category) => (
                            <option
                              key={category}
                              value={category}
                            >
                              {category}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="certification-year"
                        className="mb-2 block text-sm font-semibold text-[#082B3A]"
                      >
                        Tahun Penerbitan
                      </label>

                      <input
                        id="certification-year"
                        name="issued_year"
                        type="number"
                        min="1900"
                        max="2200"
                        value={
                          formData.issued_year
                        }
                        onChange={handleChange}
                        placeholder="2026"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#082B3A] outline-none transition focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="certification-sort-order"
                        className="mb-2 block text-sm font-semibold text-[#082B3A]"
                      >
                        Urutan Tampil

                        <span className="ml-1 text-red-500">
                          *
                        </span>
                      </label>

                      <input
                        id="certification-sort-order"
                        name="sort_order"
                        type="number"
                        min="0"
                        value={
                          formData.sort_order
                        }
                        onChange={handleChange}
                        required
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#082B3A] outline-none transition focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <label
                        htmlFor="certification-description"
                        className="text-sm font-semibold text-[#082B3A]"
                      >
                        Deskripsi
                      </label>

                      <span className="shrink-0 text-xs text-slate-400">
                        {
                          formData.description
                            .length
                        }{" "}
                        karakter
                      </span>
                    </div>

                    <textarea
                      id="certification-description"
                      name="description"
                      value={
                        formData.description
                      }
                      onChange={handleChange}
                      rows={9}
                      placeholder="Jelaskan sertifikasi, ruang lingkup, atau informasi penting lainnya..."
                      className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-7 text-[#082B3A] outline-none transition placeholder:text-slate-400 focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
                    />
                  </div>

                  <label className="flex cursor-pointer items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={
                        formData.is_active
                      }
                      onChange={handleChange}
                      className="mt-1 h-5 w-5 shrink-0 rounded border-slate-300 text-[#FF5A0A] focus:ring-orange-200"
                    />

                    <div>
                      <p className="font-semibold text-[#082B3A]">
                        Tampilkan sertifikasi
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        Sertifikasi aktif akan
                        muncul pada bagian About
                        Us publik.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Aset */}
                <aside className="min-w-0 space-y-6">
                  <section>
                    <p className="text-sm font-semibold text-[#082B3A]">
                      Gambar Sertifikat
                    </p>

                    <div className="mt-3 flex min-h-52 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50">
                      {displayedImage ? (
                        <img
                          src={displayedImage}
                          alt="Preview sertifikat"
                          className="h-52 w-full object-cover"
                        />
                      ) : (
                        <div className="text-center">
                          <FileImage
                            size={38}
                            className="mx-auto text-slate-300"
                          />

                          <p className="mt-3 text-sm font-semibold text-slate-500">
                            Gambar belum dipilih
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 space-y-3">
                      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#082B3A] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0A4053]">
                        <UploadCloud
                          size={17}
                        />

                        Pilih Gambar

                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={
                            handleImageChange
                          }
                          className="hidden"
                        />
                      </label>

                      {displayedImage && (
                        <button
                          type="button"
                          onClick={
                            handleRemoveImage
                          }
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                          Hapus Gambar
                        </button>
                      )}
                    </div>
                  </section>

                  <section className="border-t border-slate-100 pt-6">
                    <p className="text-sm font-semibold text-[#082B3A]">
                      Dokumen Sertifikat
                    </p>

                    <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      {displayedDocumentName ? (
                        <>
                          <FileText
                            size={30}
                            className="text-blue-600"
                          />

                          <p className="mt-3 break-all text-sm font-semibold leading-6 text-[#082B3A]">
                            {
                              displayedDocumentName
                            }
                          </p>

                          {formData.document_url &&
                            !documentFile && (
                              <a
                                href={
                                  formData.document_url
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-blue-600"
                              >
                                Buka Dokumen

                                <ExternalLink
                                  size={13}
                                />
                              </a>
                            )}
                        </>
                      ) : (
                        <div className="py-3 text-center">
                          <FileText
                            size={34}
                            className="mx-auto text-slate-300"
                          />

                          <p className="mt-3 text-sm font-semibold text-slate-500">
                            Dokumen belum dipilih
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 space-y-3">
                      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
                        <UploadCloud
                          size={17}
                        />

                        Pilih Dokumen

                        <input
                          type="file"
                          accept="application/pdf,image/jpeg,image/png,image/webp"
                          onChange={
                            handleDocumentChange
                          }
                          className="hidden"
                        />
                      </label>

                      {displayedDocumentName && (
                        <button
                          type="button"
                          onClick={
                            handleRemoveDocument
                          }
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                          Hapus Dokumen
                        </button>
                      )}
                    </div>

                    <p className="mt-4 text-xs leading-5 text-slate-400">
                      Format PDF, JPG, PNG, atau
                      WebP. Ukuran maksimal 10 MB.
                    </p>
                  </section>
                </aside>
              </div>

              <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-100 bg-slate-50 px-4 py-4 sm:flex-row sm:px-6 sm:py-5 md:px-8">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="w-full rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-400 disabled:opacity-50 sm:w-auto"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF5A0A] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:bg-[#E94F00] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {saving ? (
                    <>
                      <LoaderCircle
                        size={18}
                        className="animate-spin"
                      />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save size={18} />

                      {editingId
                        ? "Simpan Perubahan"
                        : "Tambah Sertifikasi"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}