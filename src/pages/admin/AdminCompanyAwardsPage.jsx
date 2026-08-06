import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  ImageIcon,
  LoaderCircle,
  Medal,
  Plus,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Trash2,
  Trophy,
  UploadCloud,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

import { useAdminAuth } from "../../contexts/AdminAuthContext";

import {
  createAward,
  deleteAward,
  deleteCredentialAsset,
  getAdminAwards,
  updateAward,
  uploadAwardImage,
} from "../../services/companyCredentialService";

function createInitialFormData(sortOrder = 0) {
  return {
    title: "",
    institution: "",
    description: "",
    year: "",
    image_url: "",
    sort_order: sortOrder,
    is_active: true,
  };
}

function sortAwardRecords(items) {
  return [...items].sort((firstItem, secondItem) => {
    const firstOrder =
      Number(firstItem.sort_order) || 0;

    const secondOrder =
      Number(secondItem.sort_order) || 0;

    if (firstOrder !== secondOrder) {
      return firstOrder - secondOrder;
    }

    const firstYear =
      Number(firstItem.year) || 0;

    const secondYear =
      Number(secondItem.year) || 0;

    if (firstYear !== secondYear) {
      return secondYear - firstYear;
    }

    return String(firstItem.title || "").localeCompare(
      String(secondItem.title || ""),
      "id"
    );
  });
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

function AwardsLoading() {
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
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div
            key={item}
            className="h-[460px] animate-pulse rounded-3xl bg-slate-200"
          />
        ))}
      </div>
    </div>
  );
}

export default function AdminCompanyAwardsPage() {
  const { isAdmin, isEditor } =
    useAdminAuth();

  const [awards, setAwards] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState(null);

  const [togglingId, setTogglingId] =
    useState(null);

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

  const [searchTerm, setSearchTerm] =
    useState("");

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
        imagePreviewUrl.startsWith("blob:")
      ) {
        URL.revokeObjectURL(
          imagePreviewUrl
        );
      }
    };
  }, [imagePreviewUrl]);

  const loadAwards =
    useCallback(async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const data =
          await getAdminAwards();

        setAwards(
          sortAwardRecords(
            Array.isArray(data)
              ? data
              : []
          )
        );
      } catch (error) {
        console.error(
          "Awards gagal dimuat:",
          error
        );

        setAwards([]);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Daftar penghargaan gagal dimuat."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadAwards();
  }, [loadAwards]);

  const summary = useMemo(() => {
    const active = awards.filter(
      (item) => item.is_active
    ).length;

    const withImage = awards.filter(
      (item) =>
        Boolean(
          String(
            item.image_url || ""
          ).trim()
        )
    ).length;

    const institutions = new Set(
      awards
        .map((item) =>
          String(
            item.institution || ""
          ).trim()
        )
        .filter(Boolean)
    );

    return {
      total: awards.length,
      active,
      inactive:
        awards.length - active,
      withImage,
      institutions:
        institutions.size,
    };
  }, [awards]);

  const filteredAwards =
    useMemo(() => {
      const normalizedSearch =
        searchTerm.trim().toLowerCase();

      return awards.filter((award) => {
        const searchableText = [
          award.title,
          award.institution,
          award.description,
          award.year,
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
          (statusFilter === "active" &&
            award.is_active) ||
          (statusFilter ===
            "inactive" &&
            !award.is_active);

        return (
          matchesSearch &&
          matchesStatus
        );
      });
    }, [
      awards,
      searchTerm,
      statusFilter,
    ]);

  function resetFilters() {
    setSearchTerm("");
    setStatusFilter("all");
  }

  function clearImagePreview() {
    if (
      imagePreviewUrl.startsWith("blob:")
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
      awards.reduce(
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

    setErrorMessage("");
    setSuccessMessage("");
    setFormOpen(true);
  }

  function openEditForm(award) {
    setEditingId(award.id);

    setFormData({
      title: award.title || "",

      institution:
        award.institution || "",

      description:
        award.description || "",

      year:
        award.year ?? "",

      image_url:
        award.image_url || "",

      sort_order:
        Number(
          award.sort_order
        ) || 0,

      is_active:
        Boolean(award.is_active),
    });

    setOriginalImageUrl(
      award.image_url || ""
    );

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
        "Gambar penghargaan harus berformat JPG, PNG, atau WebP."
      );

      return;
    }

    if (
      selectedFile.size >
      3 * 1024 * 1024
    ) {
      setErrorMessage(
        "Ukuran gambar maksimal 3 MB."
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

  function validateForm() {
    if (!formData.title.trim()) {
      return "Nama penghargaan wajib diisi.";
    }

    if (formData.year !== "") {
      const year =
        Number.parseInt(
          formData.year,
          10
        );

      if (
        !Number.isFinite(year) ||
        year < 1900 ||
        year > 2200
      ) {
        return "Tahun penghargaan harus berada antara 1900 dan 2200.";
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

    let uploadedImage = null;
    let saveCompleted = false;

    try {
      let nextImageUrl =
        formData.image_url;

      if (imageFile) {
        uploadedImage =
          await uploadAwardImage(
            imageFile
          );

        nextImageUrl =
          uploadedImage.publicUrl;
      }

      const payload = {
        title:
          formData.title.trim(),

        institution:
          formData.institution.trim(),

        description:
          formData.description.trim(),

        year:
          formData.year !== ""
            ? Number.parseInt(
                formData.year,
                10
              )
            : null,

        image_url:
          nextImageUrl,

        sort_order:
          Number.parseInt(
            formData.sort_order,
            10
          ),

        is_active:
          Boolean(
            formData.is_active
          ),
      };

      const savedAward = editingId
        ? await updateAward(
            editingId,
            payload
          )
        : await createAward(payload);

      saveCompleted = true;

      if (
        originalImageUrl &&
        originalImageUrl !==
          savedAward.image_url
      ) {
        try {
          await deleteCredentialAsset(
            originalImageUrl
          );
        } catch (deleteError) {
          console.warn(
            "Gambar lama gagal dihapus:",
            deleteError
          );
        }
      }

      setAwards((currentItems) => {
        if (editingId) {
          return sortAwardRecords(
            currentItems.map((item) =>
              item.id === editingId
                ? savedAward
                : item
            )
          );
        }

        return sortAwardRecords([
          ...currentItems,
          savedAward,
        ]);
      });

      setSuccessMessage(
        editingId
          ? "Penghargaan berhasil diperbarui."
          : "Penghargaan berhasil ditambahkan."
      );

      setFormOpen(false);
      resetFormState();
    } catch (error) {
      console.error(
        "Penghargaan gagal disimpan:",
        error
      );

      if (
        uploadedImage &&
        !saveCompleted
      ) {
        try {
          await deleteCredentialAsset(
            uploadedImage?.publicUrl ||
              uploadedImage
          );
        } catch (cleanupError) {
          console.warn(
            "Gambar sementara gagal dibersihkan:",
            cleanupError
          );
        }
      }

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Penghargaan gagal disimpan."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(
    award
  ) {
    try {
      setTogglingId(award.id);
      setErrorMessage("");
      setSuccessMessage("");

      const updatedAward =
        await updateAward(
          award.id,
          {
            title: award.title,

            institution:
              award.institution,

            description:
              award.description,

            year: award.year,

            image_url:
              award.image_url,

            sort_order:
              award.sort_order,

            is_active:
              !award.is_active,
          }
        );

      setAwards((currentItems) =>
        sortAwardRecords(
          currentItems.map((item) =>
            item.id === award.id
              ? updatedAward
              : item
          )
        )
      );

      setSuccessMessage(
        updatedAward.is_active
          ? "Penghargaan berhasil diaktifkan."
          : "Penghargaan berhasil dinonaktifkan."
      );
    } catch (error) {
      console.error(
        "Status penghargaan gagal diperbarui:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Status penghargaan gagal diperbarui."
      );
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(award) {
    if (!isAdmin) {
      setSuccessMessage("");

      setErrorMessage(
        "Hanya admin yang dapat menghapus penghargaan."
      );

      return;
    }

    const approved = window.confirm(
      `Hapus penghargaan "${award.title}"?\n\nData yang dihapus tidak dapat dikembalikan.`
    );

    if (!approved) {
      return;
    }

    try {
      setDeletingId(award.id);
      setErrorMessage("");
      setSuccessMessage("");

      await deleteAward(award.id);

      if (award.image_url) {
        try {
          await deleteCredentialAsset(
            award.image_url
          );
        } catch (deleteAssetError) {
          console.warn(
            "Data terhapus, tetapi gambar gagal dihapus:",
            deleteAssetError
          );
        }
      }

      setAwards((currentItems) =>
        currentItems.filter(
          (item) =>
            item.id !== award.id
        )
      );

      setSuccessMessage(
        "Penghargaan berhasil dihapus."
      );
    } catch (error) {
      console.error(
        "Penghargaan gagal dihapus:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Penghargaan gagal dihapus."
      );
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return <AwardsLoading />;
  }

  const displayedImage =
    imagePreviewUrl ||
    formData.image_url;

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

          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-amber-700">
            <Trophy size={14} />
            Awards & Recognition
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#082B3A] md:text-4xl">
            Kelola Penghargaan
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
            Kelola penghargaan perusahaan,
            institusi pemberi penghargaan,
            tahun, gambar, status, dan
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
            onClick={loadAwards}
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
            Tambah Penghargaan
          </button>
        </div>
      </section>

      {/* Pesan error */}
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

      {/* Pesan berhasil */}
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

      {/* Informasi editor */}
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
              mengedit, mengunggah gambar,
              dan mengubah status
              penghargaan. Penghapusan
              data hanya dapat dilakukan
              oleh admin.
            </p>
          </div>
        </div>
      )}

      {/* Statistik */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-3xl bg-[#082B3A] p-6 text-white">
          <Trophy
            size={24}
            className="text-[#FF5A0A]"
          />

          <p className="mt-7 text-3xl font-bold">
            {summary.total}
          </p>

          <p className="mt-2 text-sm text-white/60">
            Total penghargaan
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
            Penghargaan aktif
          </p>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <ImageIcon
            size={24}
            className="text-blue-600"
          />

          <p className="mt-7 text-3xl font-bold text-[#082B3A]">
            {summary.withImage}
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Memiliki gambar
          </p>
        </article>

        <article className="rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 p-6 text-white">
          <Building2 size={24} />

          <p className="mt-7 text-3xl font-bold">
            {summary.institutions}
          </p>

          <p className="mt-2 text-sm text-white/80">
            Institusi pemberi
          </p>
        </article>
      </section>

      {/* Filter */}
      <section className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm xl:grid-cols-[minmax(0,1fr)_220px_auto]">
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
            placeholder="Cari penghargaan, institusi, atau tahun..."
            className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm text-[#082B3A] outline-none transition placeholder:text-slate-400 focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
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

      {/* Daftar penghargaan */}
      {filteredAwards.length === 0 ? (
        <section className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <Trophy
            size={44}
            className="mx-auto text-slate-300"
          />

          <h2 className="mt-5 text-xl font-bold text-[#082B3A]">
            Penghargaan tidak ditemukan
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Belum ada data atau tidak ada
            penghargaan yang sesuai filter.
          </p>

          <button
            type="button"
            onClick={
              awards.length === 0
                ? openCreateForm
                : resetFilters
            }
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#FF5A0A] px-5 py-3 text-sm font-semibold text-white"
          >
            {awards.length === 0 ? (
              <>
                <Plus size={17} />
                Tambah Penghargaan
              </>
            ) : (
              "Tampilkan Semua"
            )}
          </button>
        </section>
      ) : (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredAwards.map((award) => (
            <article
              key={award.id}
              className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-amber-200 hover:shadow-xl"
            >
              <div className="relative flex h-56 items-center justify-center overflow-hidden bg-slate-50">
                {award.image_url ? (
                  <img
                    src={award.image_url}
                    alt={award.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="text-center">
                    <Medal
                      size={54}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 text-xs font-semibold text-slate-400">
                      Gambar belum tersedia
                    </p>
                  </div>
                )}

                {award.year && (
                  <span className="absolute left-3 top-3 rounded-full bg-[#FF5A0A] px-3 py-1.5 text-xs font-semibold text-white sm:left-5 sm:top-5">
                    {award.year}
                  </span>
                )}

                <span
                  className={`absolute right-3 top-3 rounded-full px-3 py-1.5 text-xs font-semibold sm:right-5 sm:top-5 ${
                    award.is_active
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-700 text-white"
                  }`}
                >
                  {award.is_active
                    ? "Aktif"
                    : "Nonaktif"}
                </span>
              </div>

              <div className="p-5 sm:p-6">
                <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#FF5A0A]">
                    Urutan{" "}
                    {award.sort_order}
                  </p>

                  <p className="text-xs text-slate-400">
                    {formatUpdatedAt(
                      award.updated_at
                    )}
                  </p>
                </div>

                <h2 className="mt-4 break-words text-xl font-bold leading-8 text-[#082B3A]">
                  {award.title}
                </h2>

                {award.institution && (
                  <p className="mt-3 flex items-start gap-2 text-sm font-semibold leading-6 text-slate-500">
                    <Building2
                      size={16}
                      className="mt-0.5 shrink-0"
                    />

                    {award.institution}
                  </p>
                )}

                {award.year && (
                  <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                    <CalendarDays
                      size={16}
                    />

                    Tahun {award.year}
                  </p>
                )}

                <p className="mt-4 line-clamp-3 min-h-[5.25rem] text-sm leading-7 text-slate-500">
                  {award.description ||
                    "Deskripsi penghargaan belum tersedia."}
                </p>

                <div className="mt-6 grid grid-cols-1 gap-3 border-t border-slate-100 pt-5 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleToggleActive(
                        award
                      )
                    }
                    disabled={
                      togglingId ===
                      award.id
                    }
                    className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      award.is_active
                        ? "border-slate-200 text-slate-600 hover:border-slate-400"
                        : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                    }`}
                  >
                    {togglingId ===
                    award.id ? (
                      <LoaderCircle
                        size={16}
                        className="animate-spin"
                      />
                    ) : award.is_active ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}

                    {award.is_active
                      ? "Nonaktifkan"
                      : "Aktifkan"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      openEditForm(award)
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
                      handleDelete(award)
                    }
                    disabled={
                      deletingId ===
                      award.id
                    }
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deletingId ===
                    award.id ? (
                      <>
                        <LoaderCircle
                          size={16}
                          className="animate-spin"
                        />
                        Menghapus...
                      </>
                    ) : (
                      <>
                        <Trash2 size={16} />
                        Hapus Penghargaan
                      </>
                    )}
                  </button>
                )}
              </div>
            </article>
          ))}
        </section>
      )}

      {/* Modal tambah/edit */}
      {formOpen && (
        <div className="fixed inset-0 z-[80] overflow-y-auto bg-[#082B3A]/70 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-8">
          <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl sm:rounded-3xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5 md:px-8">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#FF5A0A]">
                  Award Form
                </p>

                <h2 className="mt-2 break-words text-xl font-bold text-[#082B3A] sm:text-2xl">
                  {editingId
                    ? "Edit Penghargaan"
                    : "Tambah Penghargaan"}
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
              <div className="grid gap-8 p-4 sm:p-6 md:p-8 lg:grid-cols-[minmax(0,1fr)_320px]">
                {/* Form utama */}
                <div className="min-w-0 space-y-6">
                  <div>
                    <label
                      htmlFor="award-title"
                      className="mb-2 block text-sm font-semibold text-[#082B3A]"
                    >
                      Nama Penghargaan

                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <input
                      id="award-title"
                      name="title"
                      type="text"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      placeholder="Contoh: Best Healthcare Technology Provider"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#082B3A] outline-none transition placeholder:text-slate-400 focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="award-institution"
                      className="mb-2 block text-sm font-semibold text-[#082B3A]"
                    >
                      Institusi Pemberi
                    </label>

                    <input
                      id="award-institution"
                      name="institution"
                      type="text"
                      value={
                        formData.institution
                      }
                      onChange={handleChange}
                      placeholder="Contoh: Kementerian Kesehatan Republik Indonesia"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#082B3A] outline-none transition placeholder:text-slate-400 focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="award-year"
                        className="mb-2 block text-sm font-semibold text-[#082B3A]"
                      >
                        Tahun Penghargaan
                      </label>

                      <input
                        id="award-year"
                        name="year"
                        type="number"
                        min="1900"
                        max="2200"
                        value={formData.year}
                        onChange={handleChange}
                        placeholder="2026"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#082B3A] outline-none transition focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="award-sort-order"
                        className="mb-2 block text-sm font-semibold text-[#082B3A]"
                      >
                        Urutan Tampil

                        <span className="ml-1 text-red-500">
                          *
                        </span>
                      </label>

                      <input
                        id="award-sort-order"
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
                        htmlFor="award-description"
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
                      id="award-description"
                      name="description"
                      value={
                        formData.description
                      }
                      onChange={handleChange}
                      rows={8}
                      placeholder="Jelaskan penghargaan dan pencapaian perusahaan..."
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
                        Tampilkan penghargaan
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        Penghargaan aktif akan
                        muncul pada halaman About
                        Us publik.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Gambar */}
                <aside className="min-w-0">
                  <p className="text-sm font-semibold text-[#082B3A]">
                    Gambar Penghargaan
                  </p>

                  <div className="mt-3 flex min-h-64 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50">
                    {displayedImage ? (
                      <img
                        src={displayedImage}
                        alt="Preview penghargaan"
                        className="h-64 w-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <Medal
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
                    WebP. Ukuran maksimal 3 MB.
                  </p>
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
                        : "Tambah Penghargaan"}
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