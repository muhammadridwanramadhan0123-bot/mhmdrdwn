import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Edit3,
  Eye,
  EyeOff,
  ImageIcon,
  LoaderCircle,
  Plus,
  RefreshCw,
  Save,
  Search,
  Sparkles,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";

import { useAdminAuth } from "../../contexts/AdminAuthContext";

import {
  createServiceFeature,
  deleteServiceFeature,
  getAdminServiceFeatures,
  updateServiceFeature,
} from "../../services/serviceService";

const STATUS_OPTIONS = [
  {
    value: "draft",
    label: "Draft",
  },
  {
    value: "published",
    label: "Published",
  },
  {
    value: "archived",
    label: "Archived",
  },
];

function createInitialFormData(
  sortOrder = 0
) {
  return {
    name: "",
    slug: "",
    short_description: "",
    full_description: "",
    image_url: "",
    sort_order: sortOrder,
    status: "draft",
  };
}

function createSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function sortFeatureRecords(items) {
  return [...items].sort(
    (firstItem, secondItem) => {
      const firstOrder =
        Number(
          firstItem.sort_order
        ) || 0;

      const secondOrder =
        Number(
          secondItem.sort_order
        ) || 0;

      if (
        firstOrder !== secondOrder
      ) {
        return (
          firstOrder - secondOrder
        );
      }

      return String(
        firstItem.name || ""
      ).localeCompare(
        String(
          secondItem.name || ""
        ),
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

  if (
    Number.isNaN(date.getTime())
  ) {
    return "Belum tersedia";
  }

  return new Intl.DateTimeFormat(
    "id-ID",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(date);
}

function getStatusLabel(status) {
  switch (status) {
    case "published":
      return "Published";

    case "archived":
      return "Archived";

    default:
      return "Draft";
  }
}

function getStatusClass(status) {
  switch (status) {
    case "published":
      return "bg-emerald-500 text-white";

    case "archived":
      return "bg-slate-700 text-white";

    default:
      return "bg-amber-500 text-white";
  }
}

function ServiceFeaturesLoading() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="h-5 w-48 animate-pulse rounded bg-slate-200" />

          <div className="mt-3 h-4 w-72 animate-pulse rounded bg-slate-100" />
        </div>

        <div className="h-11 w-40 animate-pulse rounded-xl bg-slate-200" />
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map(
          (item) => (
            <div
              key={item}
              className="h-[420px] animate-pulse rounded-3xl bg-slate-100"
            />
          )
        )}
      </div>
    </section>
  );
}

export default function AdminServiceFeaturesSection({
  serviceId,
  serviceName = "",
  serviceSlug = "",
}) {
  const {
    isAdmin,
    isEditor,
  } = useAdminAuth();

  const canManage =
    isAdmin || isEditor;

  const [
    features,
    setFeatures,
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

  const [
    formOpen,
    setFormOpen,
  ] = useState(false);

  const [
    editingId,
    setEditingId,
  ] = useState(null);

  const [
    formData,
    setFormData,
  ] = useState(
    createInitialFormData()
  );

  const [
    slugManuallyEdited,
    setSlugManuallyEdited,
  ] = useState(false);

  const [
    imageFile,
    setImageFile,
  ] = useState(null);

  const [
    imagePreviewUrl,
    setImagePreviewUrl,
  ] = useState("");

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("all");

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

  const loadFeatures =
    useCallback(async () => {
      if (!serviceId) {
        setFeatures([]);
        setLoading(false);

        return;
      }

      try {
        setLoading(true);
        setErrorMessage("");

        const data =
          await getAdminServiceFeatures(
            serviceId
          );

        setFeatures(
          sortFeatureRecords(
            Array.isArray(data)
              ? data
              : []
          )
        );
      } catch (error) {
        console.error(
          "Detail fitur gagal dimuat:",
          error
        );

        setFeatures([]);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Detail fitur gagal dimuat."
        );
      } finally {
        setLoading(false);
      }
    }, [serviceId]);

  useEffect(() => {
    loadFeatures();
  }, [loadFeatures]);

  const summary = useMemo(() => {
    const published =
      features.filter(
        (item) =>
          item.status ===
          "published"
      ).length;

    const draft =
      features.filter(
        (item) =>
          item.status === "draft"
      ).length;

    const archived =
      features.filter(
        (item) =>
          item.status ===
          "archived"
      ).length;

    const withImage =
      features.filter((item) =>
        Boolean(
          String(
            item.image_url || ""
          ).trim()
        )
      ).length;

    return {
      total: features.length,
      published,
      draft,
      archived,
      withImage,
    };
  }, [features]);

  const filteredFeatures =
    useMemo(() => {
      const normalizedSearch =
        searchTerm
          .trim()
          .toLowerCase();

      return features.filter(
        (feature) => {
          const searchableText = [
            feature.name,
            feature.slug,
            feature.short_description,
            feature.full_description,
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

          const matchesStatus =
            statusFilter === "all" ||
            feature.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      features,
      searchTerm,
      statusFilter,
    ]);

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

    setSlugManuallyEdited(false);
    setImageFile(null);
    clearImagePreview();
  }

  function closeForm() {
    if (saving) {
      return;
    }

    setFormOpen(false);
    resetFormState();
  }

  function openCreateForm() {
    if (!canManage) {
      setErrorMessage(
        "Akun tidak memiliki izin untuk menambah detail fitur."
      );

      return;
    }

    const highestSortOrder =
      features.reduce(
        (highestValue, item) =>
          Math.max(
            highestValue,
            Number(
              item.sort_order
            ) || 0
          ),
        -1
      );

    setEditingId(null);

    setFormData(
      createInitialFormData(
        highestSortOrder + 1
      )
    );

    setSlugManuallyEdited(false);
    setImageFile(null);
    clearImagePreview();

    setErrorMessage("");
    setSuccessMessage("");
    setFormOpen(true);
  }

  function openEditForm(feature) {
    if (!canManage) {
      setErrorMessage(
        "Akun tidak memiliki izin untuk mengedit detail fitur."
      );

      return;
    }

    setEditingId(feature.id);

    setFormData({
      name: feature.name || "",

      slug: feature.slug || "",

      short_description:
        feature.short_description ||
        "",

      full_description:
        feature.full_description ||
        "",

      image_url:
        feature.image_url || "",

      sort_order:
        Number(
          feature.sort_order
        ) || 0,

      status:
        feature.status || "draft",
    });

    setSlugManuallyEdited(true);
    setImageFile(null);
    clearImagePreview();

    setErrorMessage("");
    setSuccessMessage("");
    setFormOpen(true);
  }

  function handleChange(event) {
    const {
      name,
      value,
    } = event.target;

    if (name === "name") {
      setFormData(
        (currentFormData) => ({
          ...currentFormData,

          name: value,

          slug:
            slugManuallyEdited
              ? currentFormData.slug
              : createSlug(value),
        })
      );

      return;
    }

    if (name === "slug") {
      setSlugManuallyEdited(true);

      setFormData(
        (currentFormData) => ({
          ...currentFormData,
          slug: createSlug(value),
        })
      );

      return;
    }

    setFormData(
      (currentFormData) => ({
        ...currentFormData,
        [name]: value,
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
        "Gambar fitur harus berformat JPG, PNG, atau WebP."
      );

      return;
    }

    const maximumSize =
      2 * 1024 * 1024;

    if (
      selectedFile.size >
      maximumSize
    ) {
      setErrorMessage(
        "Ukuran gambar fitur maksimal 2 MB."
      );

      return;
    }

    clearImagePreview();

    setImageFile(selectedFile);

    setImagePreviewUrl(
      URL.createObjectURL(
        selectedFile
      )
    );

    setErrorMessage("");
    setSuccessMessage("");
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

  function resetFilters() {
    setSearchTerm("");
    setStatusFilter("all");
  }

  function validateForm() {
    if (!serviceId) {
      return "ID layanan induk tidak tersedia.";
    }

    if (!formData.name.trim()) {
      return "Nama fitur wajib diisi.";
    }

    if (!formData.slug.trim()) {
      return "Slug fitur wajib diisi.";
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

    if (
      !STATUS_OPTIONS.some(
        (option) =>
          option.value ===
          formData.status
      )
    ) {
      return "Status fitur tidak valid.";
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

    try {
      const payload = {
        name:
          formData.name.trim(),

        slug:
          createSlug(
            formData.slug
          ),

        short_description:
          formData.short_description.trim(),

        full_description:
          formData.full_description.trim(),

        image_url:
          formData.image_url,

        sort_order:
          Number.parseInt(
            formData.sort_order,
            10
          ),

        status:
          formData.status,
      };

      const savedFeature =
        editingId
          ? await updateServiceFeature(
              editingId,
              payload,
              imageFile
            )
          : await createServiceFeature(
              serviceId,
              payload,
              imageFile
            );

      setFeatures(
        (currentItems) => {
          if (editingId) {
            return sortFeatureRecords(
              currentItems.map(
                (item) =>
                  item.id ===
                  editingId
                    ? savedFeature
                    : item
              )
            );
          }

          return sortFeatureRecords([
            ...currentItems,
            savedFeature,
          ]);
        }
      );

      setSuccessMessage(
        editingId
          ? "Detail fitur berhasil diperbarui."
          : "Detail fitur berhasil ditambahkan."
      );

      setFormOpen(false);
      resetFormState();
    } catch (error) {
      console.error(
        "Detail fitur gagal disimpan:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Detail fitur gagal disimpan."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus(
    feature
  ) {
    if (!canManage) {
      setErrorMessage(
        "Akun tidak memiliki izin untuk mengubah status fitur."
      );

      return;
    }

    const nextStatus =
      feature.status ===
      "published"
        ? "draft"
        : "published";

    try {
      setTogglingId(feature.id);
      setErrorMessage("");
      setSuccessMessage("");

      const updatedFeature =
        await updateServiceFeature(
          feature.id,
          {
            name: feature.name,

            slug: feature.slug,

            short_description:
              feature.short_description,

            full_description:
              feature.full_description,

            image_url:
              feature.image_url,

            sort_order:
              feature.sort_order,

            status: nextStatus,
          }
        );

      setFeatures(
        (currentItems) =>
          sortFeatureRecords(
            currentItems.map(
              (item) =>
                item.id ===
                feature.id
                  ? updatedFeature
                  : item
            )
          )
      );

      setSuccessMessage(
        nextStatus ===
          "published"
          ? "Detail fitur berhasil dipublikasikan."
          : "Detail fitur berhasil dijadikan draft."
      );
    } catch (error) {
      console.error(
        "Status fitur gagal diperbarui:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Status fitur gagal diperbarui."
      );
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(
    feature
  ) {
    if (!isAdmin) {
      setErrorMessage(
        "Hanya admin yang dapat menghapus detail fitur."
      );

      return;
    }

    const approved =
      window.confirm(
        `Hapus fitur "${feature.name}"?\n\nData yang dihapus tidak dapat dikembalikan.`
      );

    if (!approved) {
      return;
    }

    try {
      setDeletingId(
        feature.id
      );

      setErrorMessage("");
      setSuccessMessage("");

      await deleteServiceFeature(
        feature.id
      );

      setFeatures(
        (currentItems) =>
          currentItems.filter(
            (item) =>
              item.id !==
              feature.id
          )
      );

      setSuccessMessage(
        "Detail fitur berhasil dihapus."
      );
    } catch (error) {
      console.error(
        "Detail fitur gagal dihapus:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Detail fitur gagal dihapus."
      );
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <ServiceFeaturesLoading />
    );
  }

  const displayedImage =
    imagePreviewUrl ||
    formData.image_url;

  return (
    <section className="space-y-7 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#FF5A0A]">
            <Sparkles size={14} />
            Detail Fitur & Cakupan
          </div>

          <h2 className="mt-4 text-2xl font-bold text-[#082B3A]">
            Kelola detail setiap fitur
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
            Tambahkan deskripsi,
            gambar, slug, dan status
            untuk setiap fitur milik{" "}
            <span className="font-semibold text-[#082B3A]">
              {serviceName ||
                "layanan ini"}
            </span>
            .
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={loadFeatures}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-[#FF5A0A] hover:text-[#FF5A0A]"
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          {canManage && (
            <button
              type="button"
              onClick={openCreateForm}
              disabled={!serviceId}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF5A0A] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:bg-[#E94F00] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={18} />
              Tambah Detail Fitur
            </button>
          )}
        </div>
      </div>

      {!serviceId && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <AlertTriangle
            size={21}
            className="mt-0.5 shrink-0 text-amber-600"
          />

          <div>
            <p className="font-semibold text-amber-800">
              Layanan belum tersedia
            </p>

            <p className="mt-1 text-sm leading-6 text-amber-700">
              Simpan layanan utama
              terlebih dahulu sebelum
              menambahkan detail fitur.
            </p>
          </div>
        </div>
      )}

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
        <div className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm leading-7 text-blue-700">
          Editor dapat menambah,
          mengedit, mengunggah gambar,
          dan mengubah status fitur.
          Penghapusan hanya dapat
          dilakukan oleh admin.
        </div>
      )}

      {/* Statistik */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl bg-[#082B3A] p-5 text-white">
          <Sparkles
            size={22}
            className="text-[#FF5A0A]"
          />

          <p className="mt-5 text-3xl font-bold">
            {summary.total}
          </p>

          <p className="mt-1 text-sm text-white/60">
            Total fitur
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <Eye
            size={22}
            className="text-emerald-600"
          />

          <p className="mt-5 text-3xl font-bold text-[#082B3A]">
            {summary.published}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Published
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <EyeOff
            size={22}
            className="text-amber-600"
          />

          <p className="mt-5 text-3xl font-bold text-[#082B3A]">
            {summary.draft}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Draft
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5">
          <ImageIcon
            size={22}
            className="text-blue-600"
          />

          <p className="mt-5 text-3xl font-bold text-[#082B3A]">
            {summary.withImage}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Memiliki gambar
          </p>
        </article>
      </div>

      {/* Filter */}
      <div className="grid gap-4 rounded-2xl bg-slate-50 p-4 lg:grid-cols-[minmax(0,1fr)_220px_auto]">
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
            placeholder="Cari nama, slug, atau deskripsi fitur..."
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-[#082B3A] outline-none transition focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
          />
        </div>

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

          {STATUS_OPTIONS.map(
            (option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            )
          )}
        </select>

        <button
          type="button"
          onClick={resetFilters}
          className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-[#FF5A0A] hover:text-[#FF5A0A]"
        >
          Reset
        </button>
      </div>

      {/* Daftar */}
      {filteredFeatures.length ===
      0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
          <Sparkles
            size={42}
            className="mx-auto text-slate-300"
          />

          <h3 className="mt-5 text-xl font-bold text-[#082B3A]">
            Detail fitur belum tersedia
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Tambahkan detail fitur agar
            setiap poin Fitur dan Cakupan
            memiliki halaman detail.
          </p>

          {canManage && (
            <button
              type="button"
              onClick={
                features.length === 0
                  ? openCreateForm
                  : resetFilters
              }
              disabled={!serviceId}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#FF5A0A] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {features.length === 0 ? (
                <>
                  <Plus size={17} />
                  Tambah Detail Fitur
                </>
              ) : (
                "Tampilkan Semua"
              )}
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredFeatures.map(
            (feature) => {
              const publicUrl =
                serviceSlug &&
                feature.slug
                  ? `/services/${serviceSlug}/features/${feature.slug}`
                  : "";

              return (
                <article
                  key={feature.id}
                  className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl"
                >
                  <div className="relative flex h-52 items-center justify-center overflow-hidden bg-slate-50">
                    {feature.image_url ? (
                      <img
                        src={
                          feature.image_url
                        }
                        alt={feature.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="text-center">
                        <Sparkles
                          size={50}
                          className="mx-auto text-slate-300"
                        />

                        <p className="mt-3 text-xs font-semibold text-slate-400">
                          Gambar belum tersedia
                        </p>
                      </div>
                    )}

                    <span
                      className={`absolute right-4 top-4 rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusClass(
                        feature.status
                      )}`}
                    >
                      {getStatusLabel(
                        feature.status
                      )}
                    </span>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#FF5A0A]">
                        Urutan{" "}
                        {
                          feature.sort_order
                        }
                      </p>

                      <p className="text-xs text-slate-400">
                        {formatUpdatedAt(
                          feature.updated_at
                        )}
                      </p>
                    </div>

                    <h3 className="mt-4 break-words text-xl font-bold leading-8 text-[#082B3A]">
                      {feature.name}
                    </h3>

                    <p className="mt-2 break-all text-xs font-semibold text-slate-400">
                      /{feature.slug}
                    </p>

                    <p className="mt-4 line-clamp-3 min-h-[5.25rem] text-sm leading-7 text-slate-500">
                      {feature.short_description ||
                        "Deskripsi singkat fitur belum tersedia."}
                    </p>

                    {publicUrl &&
                      feature.status ===
                        "published" && (
                        <a
                          href={publicUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#FF5A0A] transition hover:underline"
                        >
                          Lihat Halaman Publik

                          <ArrowUpRight
                            size={16}
                          />
                        </a>
                      )}

                    {canManage && (
                      <div className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5">
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleStatus(
                              feature
                            )
                          }
                          disabled={
                            togglingId ===
                            feature.id
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-3 text-xs font-semibold text-slate-600 transition hover:border-[#FF5A0A] hover:text-[#FF5A0A] disabled:opacity-50"
                        >
                          {togglingId ===
                          feature.id ? (
                            <LoaderCircle
                              size={16}
                              className="animate-spin"
                            />
                          ) : feature.status ===
                            "published" ? (
                            <EyeOff
                              size={16}
                            />
                          ) : (
                            <Eye size={16} />
                          )}

                          {feature.status ===
                          "published"
                            ? "Jadikan Draft"
                            : "Publish"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            openEditForm(
                              feature
                            )
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#082B3A] px-3 py-3 text-xs font-semibold text-white transition hover:bg-[#0A4053]"
                        >
                          <Edit3 size={16} />
                          Edit
                        </button>
                      </div>
                    )}

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            feature
                          )
                        }
                        disabled={
                          deletingId ===
                          feature.id
                        }
                        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingId ===
                        feature.id ? (
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
                            Hapus Detail Fitur
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </article>
              );
            }
          )}
        </div>
      )}

      {/* Modal tambah/edit */}
      {formOpen && (
        <div className="fixed inset-0 z-[90] overflow-y-auto bg-[#082B3A]/75 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-8">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl sm:rounded-3xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-7">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#FF5A0A]">
                  Service Feature Form
                </p>

                <h2 className="mt-2 text-xl font-bold text-[#082B3A] sm:text-2xl">
                  {editingId
                    ? "Edit Detail Fitur"
                    : "Tambah Detail Fitur"}
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
              <div className="grid gap-8 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_330px]">
                {/* Form utama */}
                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="feature-name"
                      className="mb-2 block text-sm font-semibold text-[#082B3A]"
                    >
                      Nama Fitur
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <input
                      id="feature-name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Contoh: TransECA-X"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#082B3A] outline-none transition focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="feature-slug"
                      className="mb-2 block text-sm font-semibold text-[#082B3A]"
                    >
                      Slug
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <input
                      id="feature-slug"
                      name="slug"
                      type="text"
                      value={formData.slug}
                      onChange={handleChange}
                      required
                      placeholder="transeca-x"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#082B3A] outline-none transition focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
                    />

                    <p className="mt-2 text-xs leading-5 text-slate-400">
                      URL publik: /services/
                      {serviceSlug ||
                        "service-slug"}
                      /features/
                      {formData.slug ||
                        "feature-slug"}
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="feature-short-description"
                      className="mb-2 block text-sm font-semibold text-[#082B3A]"
                    >
                      Deskripsi Singkat
                    </label>

                    <textarea
                      id="feature-short-description"
                      name="short_description"
                      value={
                        formData.short_description
                      }
                      onChange={handleChange}
                      rows={4}
                      placeholder="Ringkasan singkat fitur..."
                      className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-7 text-[#082B3A] outline-none transition focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="feature-full-description"
                      className="mb-2 block text-sm font-semibold text-[#082B3A]"
                    >
                      Deskripsi Lengkap
                    </label>

                    <textarea
                      id="feature-full-description"
                      name="full_description"
                      value={
                        formData.full_description
                      }
                      onChange={handleChange}
                      rows={9}
                      placeholder="Jelaskan fungsi, manfaat, proses, dan cakupan fitur secara lengkap..."
                      className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-7 text-[#082B3A] outline-none transition focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="feature-sort-order"
                        className="mb-2 block text-sm font-semibold text-[#082B3A]"
                      >
                        Urutan Tampil
                      </label>

                      <input
                        id="feature-sort-order"
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

                    <div>
                      <label
                        htmlFor="feature-status"
                        className="mb-2 block text-sm font-semibold text-[#082B3A]"
                      >
                        Status
                      </label>

                      <select
                        id="feature-status"
                        name="status"
                        value={
                          formData.status
                        }
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#082B3A] outline-none transition focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
                      >
                        {STATUS_OPTIONS.map(
                          (option) => (
                            <option
                              key={
                                option.value
                              }
                              value={
                                option.value
                              }
                            >
                              {
                                option.label
                              }
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Gambar */}
                <aside>
                  <p className="text-sm font-semibold text-[#082B3A]">
                    Gambar Fitur
                  </p>

                  <div className="mt-3 flex min-h-64 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50">
                    {displayedImage ? (
                      <img
                        src={
                          displayedImage
                        }
                        alt="Preview fitur"
                        className="h-64 w-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <ImageIcon
                          size={44}
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

                  <p className="mt-4 text-xs leading-5 text-slate-400">
                    Format JPG, PNG, atau
                    WebP. Ukuran maksimal
                    2 MB.
                  </p>
                </aside>
              </div>

              <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-100 bg-slate-50 px-5 py-5 sm:flex-row sm:px-7">
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
                        : "Tambah Detail Fitur"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}