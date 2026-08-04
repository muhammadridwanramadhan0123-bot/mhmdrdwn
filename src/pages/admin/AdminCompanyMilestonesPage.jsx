import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  History,
  ImageIcon,
  LoaderCircle,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  createMilestone,
  deleteCompanyImage,
  deleteMilestone,
  getAdminMilestones,
  updateMilestone,
  uploadMilestoneImage,
} from "../../services/companyAdminService";

function createInitialFormData(sortOrder = 0) {
  return {
    year: new Date().getFullYear(),
    title: "",
    description: "",
    image_url: "",
    sort_order: sortOrder,
    is_active: true,
  };
}

function sortMilestoneRecords(items) {
  return [...items].sort((firstItem, secondItem) => {
    const firstOrder =
      Number(firstItem.sort_order) || 0;

    const secondOrder =
      Number(secondItem.sort_order) || 0;

    if (firstOrder !== secondOrder) {
      return firstOrder - secondOrder;
    }

    return (
      Number(firstItem.year || 0) -
      Number(secondItem.year || 0)
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

function MilestonesLoading() {
  return (
    <div className="space-y-7">
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((item) => (
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
            className="h-96 animate-pulse rounded-3xl bg-slate-200"
          />
        ))}
      </div>
    </div>
  );
}

export default function AdminCompanyMilestonesPage() {
  const [milestones, setMilestones] = useState([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] =
    useState(null);

  const [togglingId, setTogglingId] =
    useState(null);

  const [formOpen, setFormOpen] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [formData, setFormData] = useState(
    createInitialFormData()
  );

  const [imageFile, setImageFile] =
    useState(null);

  const [imagePreviewUrl, setImagePreviewUrl] =
    useState("");

  const [originalImageUrl, setOriginalImageUrl] =
    useState("");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [yearFilter, setYearFilter] =
    useState("all");

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  useEffect(() => {
    return () => {
      if (imagePreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const loadMilestones = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const data = await getAdminMilestones();

      setMilestones(
        sortMilestoneRecords(
          Array.isArray(data) ? data : []
        )
      );
    } catch (error) {
      console.error(
        "Milestone gagal dimuat:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Milestone gagal dimuat."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMilestones();
  }, [loadMilestones]);

  const summary = useMemo(() => {
    const active = milestones.filter(
      (item) => item.is_active
    ).length;

    return {
      total: milestones.length,
      active,
      inactive: milestones.length - active,
    };
  }, [milestones]);

  const availableYears = useMemo(() => {
    return [
      ...new Set(
        milestones
          .map((item) => Number(item.year))
          .filter(Number.isFinite)
      ),
    ].sort(
      (firstYear, secondYear) =>
        secondYear - firstYear
    );
  }, [milestones]);

  const filteredMilestones = useMemo(() => {
    const normalizedSearch = searchTerm
      .trim()
      .toLowerCase();

    return milestones.filter((milestone) => {
      const searchableText = [
        milestone.year,
        milestone.title,
        milestone.description,
      ]
        .map((value) =>
          String(value || "").toLowerCase()
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
          milestone.is_active) ||
        (statusFilter === "inactive" &&
          !milestone.is_active);

      const matchesYear =
        yearFilter === "all" ||
        String(milestone.year) === yearFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesYear
      );
    });
  }, [
    milestones,
    searchTerm,
    statusFilter,
    yearFilter,
  ]);

  function resetFilters() {
    setSearchTerm("");
    setStatusFilter("all");
    setYearFilter("all");
  }

  function closeForm() {
    if (saving) {
      return;
    }

    setFormOpen(false);
    setEditingId(null);
    setImageFile(null);
    setImagePreviewUrl("");
    setOriginalImageUrl("");
    setFormData(createInitialFormData());
  }

  function openCreateForm() {
    const highestSortOrder = milestones.reduce(
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
    setImagePreviewUrl("");
    setOriginalImageUrl("");
    setErrorMessage("");
    setSuccessMessage("");
    setFormOpen(true);
  }

  function openEditForm(milestone) {
    setEditingId(milestone.id);

    setFormData({
      year:
        Number(milestone.year) ||
        new Date().getFullYear(),

      title: milestone.title || "",

      description:
        milestone.description || "",

      image_url:
        milestone.image_url || "",

      sort_order:
        Number(milestone.sort_order) || 0,

      is_active:
        Boolean(milestone.is_active),
    });

    setOriginalImageUrl(
      milestone.image_url || ""
    );

    setImageFile(null);
    setImagePreviewUrl("");
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

    setFormData((currentData) => ({
      ...currentData,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

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
        "Gambar milestone harus berformat JPG, PNG, atau WebP."
      );

      return;
    }

    const maximumSize =
      5 * 1024 * 1024;

    if (selectedFile.size > maximumSize) {
      setErrorMessage(
        "Ukuran gambar milestone maksimal 5 MB."
      );

      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setImageFile(selectedFile);

    setImagePreviewUrl(
      URL.createObjectURL(selectedFile)
    );
  }

  function handleRemoveImage() {
    setImageFile(null);
    setImagePreviewUrl("");

    setFormData((currentData) => ({
      ...currentData,
      image_url: "",
    }));

    setSuccessMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const year = Number.parseInt(
      formData.year,
      10
    );

    const sortOrder = Number.parseInt(
      formData.sort_order,
      10
    );

    if (
      !Number.isFinite(year) ||
      year < 1900 ||
      year > 2200
    ) {
      setErrorMessage(
        "Tahun milestone harus berada antara 1900 dan 2200."
      );

      return;
    }

    if (!formData.title.trim()) {
      setErrorMessage(
        "Judul milestone wajib diisi."
      );

      return;
    }

    if (
      !Number.isFinite(sortOrder) ||
      sortOrder < 0
    ) {
      setErrorMessage(
        "Urutan tampil minimal bernilai 0."
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
          await uploadMilestoneImage(
            imageFile
          );

        nextImageUrl =
          uploadedImage.publicUrl;
      }

      const payload = {
        year,
        title: formData.title.trim(),

        description:
          formData.description.trim(),

        image_url: nextImageUrl,

        sort_order: sortOrder,

        is_active:
          Boolean(formData.is_active),
      };

      const savedMilestone = editingId
        ? await updateMilestone(
            editingId,
            payload
          )
        : await createMilestone(payload);

      saveCompleted = true;

      if (
        originalImageUrl &&
        originalImageUrl !==
          savedMilestone.image_url
      ) {
        try {
          await deleteCompanyImage(
            originalImageUrl
          );
        } catch (deleteError) {
          console.warn(
            "Gambar lama gagal dihapus:",
            deleteError
          );
        }
      }

      setMilestones((currentItems) => {
        if (editingId) {
          return sortMilestoneRecords(
            currentItems.map((item) =>
              item.id === editingId
                ? savedMilestone
                : item
            )
          );
        }

        return sortMilestoneRecords([
          ...currentItems,
          savedMilestone,
        ]);
      });

      setSuccessMessage(
        editingId
          ? "Milestone berhasil diperbarui."
          : "Milestone berhasil ditambahkan."
      );

      setFormOpen(false);
      setEditingId(null);
      setFormData(createInitialFormData());
      setImageFile(null);
      setImagePreviewUrl("");
      setOriginalImageUrl("");
    } catch (error) {
      console.error(
        "Milestone gagal disimpan:",
        error
      );

      if (
        uploadedImage &&
        !saveCompleted
      ) {
        try {
          await deleteCompanyImage(
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
          : "Milestone gagal disimpan."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(milestone) {
    try {
      setTogglingId(milestone.id);
      setErrorMessage("");
      setSuccessMessage("");

      const updatedMilestone =
        await updateMilestone(
          milestone.id,
          {
            year: milestone.year,
            title: milestone.title,
            description:
              milestone.description,
            image_url:
              milestone.image_url,
            sort_order:
              milestone.sort_order,
            is_active:
              !milestone.is_active,
          }
        );

      setMilestones((currentItems) =>
        sortMilestoneRecords(
          currentItems.map((item) =>
            item.id === milestone.id
              ? updatedMilestone
              : item
          )
        )
      );

      setSuccessMessage(
        updatedMilestone.is_active
          ? "Milestone berhasil diaktifkan."
          : "Milestone berhasil dinonaktifkan."
      );
    } catch (error) {
      console.error(
        "Status milestone gagal diperbarui:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Status milestone gagal diperbarui."
      );
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(milestone) {
    const approved = window.confirm(
      `Hapus milestone "${milestone.title}"?\n\nData yang sudah dihapus tidak dapat dikembalikan.`
    );

    if (!approved) {
      return;
    }

    try {
      setDeletingId(milestone.id);
      setErrorMessage("");
      setSuccessMessage("");

      await deleteMilestone(
        milestone.id
      );

      if (milestone.image_url) {
        try {
          await deleteCompanyImage(
            milestone.image_url
          );
        } catch (deleteImageError) {
          console.warn(
            "Data terhapus, tetapi gambar gagal dihapus:",
            deleteImageError
          );
        }
      }

      setMilestones((currentItems) =>
        currentItems.filter(
          (item) =>
            item.id !== milestone.id
        )
      );

      setSuccessMessage(
        "Milestone berhasil dihapus."
      );
    } catch (error) {
      console.error(
        "Milestone gagal dihapus:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Milestone gagal dihapus."
      );
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return <MilestonesLoading />;
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

          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-violet-600">
            <History size={14} />
            Milestones
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#082B3A] md:text-4xl">
            Kelola Milestone
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
            Tambahkan dan kelola perjalanan,
            pencapaian, gambar, status, serta
            urutan milestone perusahaan.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            to="/company/milestone"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-[#082B3A] shadow-sm transition hover:border-[#FF5A0A] hover:text-[#FF5A0A]"
          >
            Halaman Publik
            <ExternalLink size={16} />
          </Link>

          <button
            type="button"
            onClick={loadMilestones}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-[#FF5A0A] hover:text-[#FF5A0A]"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF5A0A] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:bg-[#E94F00]"
          >
            <Plus size={18} />
            Tambah Milestone
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
            onClick={() => setErrorMessage("")}
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
            onClick={() => setSuccessMessage("")}
            className="shrink-0 text-xs font-semibold text-emerald-700"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Statistik */}
      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-3xl bg-[#082B3A] p-6 text-white">
          <History
            size={24}
            className="text-[#FF5A0A]"
          />

          <p className="mt-7 text-3xl font-bold">
            {summary.total}
          </p>

          <p className="mt-2 text-sm text-white/60">
            Total milestone
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
            Milestone aktif
          </p>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <EyeOff
            size={24}
            className="text-slate-500"
          />

          <p className="mt-7 text-3xl font-bold text-[#082B3A]">
            {summary.inactive}
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Milestone nonaktif
          </p>
        </article>
      </section>

      {/* Filter */}
      <section className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-[minmax(0,1fr)_220px_200px_auto]">
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
            placeholder="Cari tahun, judul, atau deskripsi..."
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

        <select
          value={yearFilter}
          onChange={(event) =>
            setYearFilter(
              event.target.value
            )
          }
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#082B3A] outline-none transition focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
        >
          <option value="all">
            Semua Tahun
          </option>

          {availableYears.map((year) => (
            <option
              key={year}
              value={String(year)}
            >
              {year}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={resetFilters}
          className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-[#FF5A0A] hover:text-[#FF5A0A]"
        >
          Reset
        </button>
      </section>

      {/* Daftar milestone */}
      {filteredMilestones.length === 0 ? (
        <section className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <History
            size={44}
            className="mx-auto text-slate-300"
          />

          <h2 className="mt-5 text-xl font-bold text-[#082B3A]">
            Milestone tidak ditemukan
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Belum ada data atau tidak ada
            milestone yang sesuai dengan filter.
          </p>

          <button
            type="button"
            onClick={
              milestones.length === 0
                ? openCreateForm
                : resetFilters
            }
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#FF5A0A] px-5 py-3 text-sm font-semibold text-white"
          >
            {milestones.length === 0 ? (
              <>
                <Plus size={17} />
                Tambah Milestone
              </>
            ) : (
              "Tampilkan Semua"
            )}
          </button>
        </section>
      ) : (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredMilestones.map(
            (milestone) => (
              <article
                key={milestone.id}
                className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl"
              >
                <div className="relative h-52 overflow-hidden bg-gradient-to-br from-[#082B3A] to-[#0A4053]">
                  {milestone.image_url ? (
                    <img
                      src={milestone.image_url}
                      alt={milestone.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <History
                        size={54}
                        className="text-white/20"
                      />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-[#082B3A]/80 via-transparent to-transparent" />

                  <span className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-[#FF5A0A] px-4 py-2 text-sm font-bold text-white shadow-lg">
                    <CalendarDays size={15} />
                    {milestone.year}
                  </span>

                  <span
                    className={`absolute right-5 top-5 rounded-full px-3 py-2 text-xs font-semibold shadow-lg ${
                      milestone.is_active
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-700 text-white"
                    }`}
                  >
                    {milestone.is_active
                      ? "Aktif"
                      : "Nonaktif"}
                  </span>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#FF5A0A]">
                      Urutan{" "}
                      {milestone.sort_order}
                    </p>

                    <p className="text-xs text-slate-400">
                      {formatUpdatedAt(
                        milestone.updated_at
                      )}
                    </p>
                  </div>

                  <h2 className="mt-4 text-xl font-bold leading-8 text-[#082B3A]">
                    {milestone.title}
                  </h2>

                  <p className="mt-3 line-clamp-3 min-h-[5.25rem] text-sm leading-7 text-slate-500">
                    {milestone.description ||
                      "Deskripsi milestone belum tersedia."}
                  </p>

                  <div className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5">
                    <button
                      type="button"
                      onClick={() =>
                        handleToggleActive(
                          milestone
                        )
                      }
                      disabled={
                        togglingId ===
                        milestone.id
                      }
                      className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition disabled:opacity-50 ${
                        milestone.is_active
                          ? "border-slate-200 text-slate-600 hover:border-slate-400"
                          : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      }`}
                    >
                      {togglingId ===
                      milestone.id ? (
                        <LoaderCircle
                          size={16}
                          className="animate-spin"
                        />
                      ) : milestone.is_active ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}

                      {milestone.is_active
                        ? "Nonaktifkan"
                        : "Aktifkan"}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        openEditForm(
                          milestone
                        )
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#082B3A] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0A4053]"
                    >
                      <Edit3 size={16} />
                      Edit
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(milestone)
                    }
                    disabled={
                      deletingId ===
                      milestone.id
                    }
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deletingId ===
                    milestone.id ? (
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
                        Hapus Milestone
                      </>
                    )}
                  </button>
                </div>
              </article>
            )
          )}
        </section>
      )}

      {/* Modal form */}
      {formOpen && (
        <div className="fixed inset-0 z-[80] overflow-y-auto bg-[#082B3A]/70 px-4 py-8 backdrop-blur-sm">
          <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-5 border-b border-slate-100 px-6 py-5 md:px-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#FF5A0A]">
                  Milestone Form
                </p>

                <h2 className="mt-2 text-2xl font-bold text-[#082B3A]">
                  {editingId
                    ? "Edit Milestone"
                    : "Tambah Milestone"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-red-200 hover:text-red-600 disabled:opacity-50"
                aria-label="Tutup form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid gap-8 p-6 md:p-8 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-6">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="milestone-year"
                        className="mb-2 block text-sm font-semibold text-[#082B3A]"
                      >
                        Tahun
                        <span className="ml-1 text-red-500">
                          *
                        </span>
                      </label>

                      <input
                        id="milestone-year"
                        name="year"
                        type="number"
                        min="1900"
                        max="2200"
                        value={formData.year}
                        onChange={handleChange}
                        required
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#082B3A] outline-none transition focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="milestone-sort-order"
                        className="mb-2 block text-sm font-semibold text-[#082B3A]"
                      >
                        Urutan Tampil
                        <span className="ml-1 text-red-500">
                          *
                        </span>
                      </label>

                      <input
                        id="milestone-sort-order"
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
                    <label
                      htmlFor="milestone-title"
                      className="mb-2 block text-sm font-semibold text-[#082B3A]"
                    >
                      Judul Milestone
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <input
                      id="milestone-title"
                      name="title"
                      type="text"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      placeholder="Contoh: PT Jasamedika Saranatama Berdiri"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#082B3A] outline-none transition placeholder:text-slate-400 focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
                    />
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <label
                        htmlFor="milestone-description"
                        className="text-sm font-semibold text-[#082B3A]"
                      >
                        Deskripsi
                      </label>

                      <span className="text-xs text-slate-400">
                        {
                          formData.description
                            .length
                        }{" "}
                        karakter
                      </span>
                    </div>

                    <textarea
                      id="milestone-description"
                      name="description"
                      value={
                        formData.description
                      }
                      onChange={handleChange}
                      rows={8}
                      placeholder="Jelaskan pencapaian atau perjalanan perusahaan..."
                      className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-7 text-[#082B3A] outline-none transition placeholder:text-slate-400 focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
                    />
                  </div>

                  <label className="flex cursor-pointer items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={
                        formData.is_active
                      }
                      onChange={handleChange}
                      className="mt-1 h-5 w-5 rounded border-slate-300 text-[#FF5A0A] focus:ring-orange-200"
                    />

                    <div>
                      <p className="font-semibold text-[#082B3A]">
                        Tampilkan milestone
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        Milestone aktif akan
                        muncul pada halaman
                        publik.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Gambar */}
                <aside>
                  <p className="text-sm font-semibold text-[#082B3A]">
                    Gambar Milestone
                  </p>

                  <div className="mt-3 flex min-h-64 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50">
                    {displayedImage ? (
                      <img
                        src={displayedImage}
                        alt="Preview milestone"
                        className="h-64 w-full object-cover"
                      />
                    ) : (
                      <div className="px-5 text-center">
                        <ImageIcon
                          size={40}
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
                      <UploadCloud size={17} />
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
                    Format JPG, PNG, atau WebP.
                    Ukuran maksimal 5 MB.
                  </p>
                </aside>
              </div>

              <div className="flex flex-col-reverse justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-5 sm:flex-row md:px-8">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-400 disabled:opacity-50"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF5A0A] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:bg-[#E94F00] disabled:cursor-not-allowed disabled:opacity-60"
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
                        : "Tambah Milestone"}
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