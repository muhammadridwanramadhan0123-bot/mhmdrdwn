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
  CheckCircle2,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  Globe2,
  Handshake,
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
  createPartner,
  deleteCompanyImage,
  deletePartner,
  getAdminPartners,
  updatePartner,
  uploadPartnerLogo,
} from "../../services/companyAdminService";

function createInitialFormData(sortOrder = 0) {
  return {
    name: "",
    logo_url: "",
    website_url: "",
    description: "",
    sort_order: sortOrder,
    is_active: true,
  };
}

function sortPartnerRecords(items) {
  return [...items].sort(
    (firstItem, secondItem) => {
      const firstOrder =
        Number(firstItem.sort_order) || 0;

      const secondOrder =
        Number(secondItem.sort_order) || 0;

      if (firstOrder !== secondOrder) {
        return firstOrder - secondOrder;
      }

      return String(firstItem.name || "").localeCompare(
        String(secondItem.name || ""),
        "id"
      );
    }
  );
}

function normalizeExternalUrl(value) {
  const normalizedValue = String(
    value || ""
  ).trim();

  if (!normalizedValue) {
    return "";
  }

  if (
    normalizedValue.startsWith("http://") ||
    normalizedValue.startsWith("https://")
  ) {
    return normalizedValue;
  }

  return `https://${normalizedValue}`;
}

function isValidUrl(value) {
  const normalizedValue = String(
    value || ""
  ).trim();

  if (!normalizedValue) {
    return true;
  }

  try {
    new URL(
      normalizeExternalUrl(normalizedValue)
    );

    return true;
  } catch {
    return false;
  }
}

function getPartnerInitials(name) {
  const words = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "PT";
  }

  if (words.length === 1) {
    return words[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
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

function PartnersLoading() {
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
        {[1, 2, 3, 4, 5, 6].map(
          (item) => (
            <div
              key={item}
              className="h-96 animate-pulse rounded-3xl bg-slate-200"
            />
          )
        )}
      </div>
    </div>
  );
}

function PartnerLogo({
  partner,
  className = "",
}) {
  const [imageFailed, setImageFailed] =
    useState(false);

  if (
    partner.logo_url &&
    !imageFailed
  ) {
    return (
      <img
        src={partner.logo_url}
        alt={`Logo ${partner.name}`}
        className={className}
        onError={() =>
          setImageFailed(true)
        }
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br from-[#082B3A] via-[#0A4053] to-cyan-800 text-xl font-bold text-white ${className}`}
    >
      {getPartnerInitials(partner.name)}
    </div>
  );
}

export default function AdminCompanyPartnersPage() {
  const [partners, setPartners] =
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

  const [logoFile, setLogoFile] =
    useState(null);

  const [
    logoPreviewUrl,
    setLogoPreviewUrl,
  ] = useState("");

  const [
    originalLogoUrl,
    setOriginalLogoUrl,
  ] = useState("");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [
    websiteFilter,
    setWebsiteFilter,
  ] = useState("all");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  /*
   * Menghapus preview lokal ketika file
   * diganti atau komponen ditutup.
   */
  useEffect(() => {
    return () => {
      if (
        logoPreviewUrl.startsWith(
          "blob:"
        )
      ) {
        URL.revokeObjectURL(
          logoPreviewUrl
        );
      }
    };
  }, [logoPreviewUrl]);

  const loadPartners =
    useCallback(async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const data =
          await getAdminPartners();

        setPartners(
          sortPartnerRecords(
            Array.isArray(data)
              ? data
              : []
          )
        );
      } catch (error) {
        console.error(
          "Partner gagal dimuat:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Daftar partner gagal dimuat."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadPartners();
  }, [loadPartners]);

  const summary = useMemo(() => {
    const active = partners.filter(
      (partner) => partner.is_active
    ).length;

    const withWebsite =
      partners.filter((partner) =>
        Boolean(
          String(
            partner.website_url || ""
          ).trim()
        )
      ).length;

    const withLogo = partners.filter(
      (partner) =>
        Boolean(
          String(
            partner.logo_url || ""
          ).trim()
        )
    ).length;

    return {
      total: partners.length,
      active,
      inactive:
        partners.length - active,
      withWebsite,
      withLogo,
    };
  }, [partners]);

  const filteredPartners = useMemo(() => {
    const normalizedSearch =
      searchTerm.trim().toLowerCase();

    return partners.filter((partner) => {
      const searchableText = [
        partner.name,
        partner.description,
        partner.website_url,
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
          partner.is_active) ||
        (statusFilter === "inactive" &&
          !partner.is_active);

      const hasWebsite = Boolean(
        String(
          partner.website_url || ""
        ).trim()
      );

      const matchesWebsite =
        websiteFilter === "all" ||
        (websiteFilter === "with-website" &&
          hasWebsite) ||
        (websiteFilter ===
          "without-website" &&
          !hasWebsite);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesWebsite
      );
    });
  }, [
    partners,
    searchTerm,
    statusFilter,
    websiteFilter,
  ]);

  function resetFilters() {
    setSearchTerm("");
    setStatusFilter("all");
    setWebsiteFilter("all");
  }

  function resetFormState() {
    setEditingId(null);
    setLogoFile(null);
    setLogoPreviewUrl("");
    setOriginalLogoUrl("");
    setFormData(
      createInitialFormData()
    );
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
      partners.reduce(
        (highestValue, partner) =>
          Math.max(
            highestValue,
            Number(
              partner.sort_order
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

    setLogoFile(null);
    setLogoPreviewUrl("");
    setOriginalLogoUrl("");
    setErrorMessage("");
    setSuccessMessage("");
    setFormOpen(true);
  }

  function openEditForm(partner) {
    setEditingId(partner.id);

    setFormData({
      name: partner.name || "",

      logo_url:
        partner.logo_url || "",

      website_url:
        partner.website_url || "",

      description:
        partner.description || "",

      sort_order:
        Number(
          partner.sort_order
        ) || 0,

      is_active: Boolean(
        partner.is_active
      ),
    });

    setOriginalLogoUrl(
      partner.logo_url || ""
    );

    setLogoFile(null);
    setLogoPreviewUrl("");
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
      (currentData) => ({
        ...currentData,

        [name]:
          type === "checkbox"
            ? checked
            : value,
      })
    );

    setSuccessMessage("");
  }

  function handleLogoChange(event) {
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
        "Logo partner harus berformat JPG, PNG, atau WebP."
      );

      return;
    }

    const maximumSize =
      3 * 1024 * 1024;

    if (
      selectedFile.size >
      maximumSize
    ) {
      setErrorMessage(
        "Ukuran logo partner maksimal 3 MB."
      );

      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setLogoFile(selectedFile);

    setLogoPreviewUrl(
      URL.createObjectURL(
        selectedFile
      )
    );
  }

  function handleRemoveLogo() {
    setLogoFile(null);
    setLogoPreviewUrl("");

    setFormData(
      (currentData) => ({
        ...currentData,
        logo_url: "",
      })
    );

    setSuccessMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const name =
      formData.name.trim();

    const sortOrder =
      Number.parseInt(
        formData.sort_order,
        10
      );

    if (!name) {
      setErrorMessage(
        "Nama partner wajib diisi."
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

    if (
      formData.website_url &&
      !isValidUrl(
        formData.website_url
      )
    ) {
      setErrorMessage(
        "Format website partner tidak valid."
      );

      return;
    }

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    let uploadedLogo = null;
    let saveCompleted = false;

    try {
      let nextLogoUrl =
        formData.logo_url;

      if (logoFile) {
        uploadedLogo =
          await uploadPartnerLogo(
            logoFile
          );

        nextLogoUrl =
          uploadedLogo.publicUrl;
      }

      const payload = {
        name,

        logo_url: nextLogoUrl,

        website_url:
          formData.website_url.trim()
            ? normalizeExternalUrl(
                formData.website_url
              )
            : "",

        description:
          formData.description.trim(),

        sort_order: sortOrder,

        is_active: Boolean(
          formData.is_active
        ),
      };

      const savedPartner = editingId
        ? await updatePartner(
            editingId,
            payload
          )
        : await createPartner(payload);

      saveCompleted = true;

      /*
       * Logo lama dihapus setelah data baru
       * berhasil disimpan.
       */
      if (
        originalLogoUrl &&
        originalLogoUrl !==
          savedPartner.logo_url
      ) {
        try {
          await deleteCompanyImage(
            originalLogoUrl
          );
        } catch (deleteError) {
          console.warn(
            "Logo lama gagal dihapus:",
            deleteError
          );
        }
      }

      setPartners(
        (currentPartners) => {
          if (editingId) {
            return sortPartnerRecords(
              currentPartners.map(
                (partner) =>
                  partner.id ===
                  editingId
                    ? savedPartner
                    : partner
              )
            );
          }

          return sortPartnerRecords([
            ...currentPartners,
            savedPartner,
          ]);
        }
      );

      setSuccessMessage(
        editingId
          ? "Partner berhasil diperbarui."
          : "Partner berhasil ditambahkan."
      );

      setFormOpen(false);
      resetFormState();
    } catch (error) {
      console.error(
        "Partner gagal disimpan:",
        error
      );

      /*
       * Logo baru dibersihkan jika database
       * gagal menyimpan data.
       */
      if (
        uploadedLogo &&
        !saveCompleted
      ) {
        try {
          await deleteCompanyImage(
            uploadedLogo
          );
        } catch (cleanupError) {
          console.warn(
            "Logo sementara gagal dibersihkan:",
            cleanupError
          );
        }
      }

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Partner gagal disimpan."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(
    partner
  ) {
    try {
      setTogglingId(partner.id);
      setErrorMessage("");
      setSuccessMessage("");

      const updatedPartner =
        await updatePartner(
          partner.id,
          {
            name: partner.name,

            logo_url:
              partner.logo_url,

            website_url:
              partner.website_url,

            description:
              partner.description,

            sort_order:
              partner.sort_order,

            is_active:
              !partner.is_active,
          }
        );

      setPartners(
        (currentPartners) =>
          sortPartnerRecords(
            currentPartners.map(
              (item) =>
                item.id === partner.id
                  ? updatedPartner
                  : item
            )
          )
      );

      setSuccessMessage(
        updatedPartner.is_active
          ? "Partner berhasil diaktifkan."
          : "Partner berhasil dinonaktifkan."
      );
    } catch (error) {
      console.error(
        "Status partner gagal diperbarui:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Status partner gagal diperbarui."
      );
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(
    partner
  ) {
    const approved = window.confirm(
      `Hapus partner "${partner.name}"?\n\nData yang sudah dihapus tidak dapat dikembalikan.`
    );

    if (!approved) {
      return;
    }

    try {
      setDeletingId(partner.id);
      setErrorMessage("");
      setSuccessMessage("");

      await deletePartner(partner.id);

      /*
       * Hapus logo setelah data partner
       * berhasil dihapus.
       */
      if (partner.logo_url) {
        try {
          await deleteCompanyImage(
            partner.logo_url
          );
        } catch (deleteLogoError) {
          console.warn(
            "Partner terhapus, tetapi logo gagal dihapus:",
            deleteLogoError
          );
        }
      }

      setPartners(
        (currentPartners) =>
          currentPartners.filter(
            (item) =>
              item.id !== partner.id
          )
      );

      setSuccessMessage(
        "Partner berhasil dihapus."
      );
    } catch (error) {
      console.error(
        "Partner gagal dihapus:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Partner gagal dihapus."
      );
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return <PartnersLoading />;
  }

  const displayedLogo =
    logoPreviewUrl ||
    formData.logo_url;

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

          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-cyan-700">
            <Handshake size={14} />
            Partners
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#082B3A] md:text-4xl">
            Kelola Partner
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
            Tambahkan dan kelola nama partner,
            logo, website, deskripsi, status,
            serta urutan tampil.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            to="/company/partners"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-[#082B3A] shadow-sm transition hover:border-[#FF5A0A] hover:text-[#FF5A0A]"
          >
            Halaman Publik
            <ExternalLink size={16} />
          </Link>

          <button
            type="button"
            onClick={loadPartners}
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
            Tambah Partner
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

      {/* Statistik */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-3xl bg-[#082B3A] p-6 text-white">
          <Handshake
            size={24}
            className="text-[#FF5A0A]"
          />

          <p className="mt-7 text-3xl font-bold">
            {summary.total}
          </p>

          <p className="mt-2 text-sm text-white/60">
            Total partner
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
            Partner aktif
          </p>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <Globe2
            size={24}
            className="text-blue-600"
          />

          <p className="mt-7 text-3xl font-bold text-[#082B3A]">
            {summary.withWebsite}
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Memiliki website
          </p>
        </article>

        <article className="rounded-3xl bg-gradient-to-br from-cyan-600 to-cyan-800 p-6 text-white">
          <ImageIcon size={24} />

          <p className="mt-7 text-3xl font-bold">
            {summary.withLogo}
          </p>

          <p className="mt-2 text-sm text-white/80">
            Memiliki logo
          </p>
        </article>
      </section>

      {/* Filter */}
      <section className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-[minmax(0,1fr)_220px_230px_auto]">
        <div className="relative">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <label
            htmlFor="partner-admin-search"
            className="sr-only"
          >
            Cari partner
          </label>

          <input
            id="partner-admin-search"
            type="search"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
            placeholder="Cari nama, deskripsi, atau website..."
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
          value={websiteFilter}
          onChange={(event) =>
            setWebsiteFilter(
              event.target.value
            )
          }
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#082B3A] outline-none transition focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
        >
          <option value="all">
            Semua Website
          </option>

          <option value="with-website">
            Memiliki Website
          </option>

          <option value="without-website">
            Tanpa Website
          </option>
        </select>

        <button
          type="button"
          onClick={resetFilters}
          className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-[#FF5A0A] hover:text-[#FF5A0A]"
        >
          Reset
        </button>
      </section>

      {/* Daftar partner */}
      {filteredPartners.length === 0 ? (
        <section className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <Handshake
            size={44}
            className="mx-auto text-slate-300"
          />

          <h2 className="mt-5 text-xl font-bold text-[#082B3A]">
            Partner tidak ditemukan
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Belum ada data atau tidak ada
            partner yang sesuai dengan filter.
          </p>

          <button
            type="button"
            onClick={
              partners.length === 0
                ? openCreateForm
                : resetFilters
            }
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#FF5A0A] px-5 py-3 text-sm font-semibold text-white"
          >
            {partners.length === 0 ? (
              <>
                <Plus size={17} />
                Tambah Partner
              </>
            ) : (
              "Tampilkan Semua"
            )}
          </button>
        </section>
      ) : (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredPartners.map(
            (partner) => (
              <article
                key={partner.id}
                className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-xl"
              >
                <div className="relative flex h-52 items-center justify-center overflow-hidden bg-slate-50 p-8">
                  <PartnerLogo
                    partner={partner}
                    className="h-full w-full rounded-2xl object-contain"
                  />

                  <span
                    className={`absolute right-5 top-5 rounded-full px-3 py-2 text-xs font-semibold shadow-lg ${
                      partner.is_active
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-700 text-white"
                    }`}
                  >
                    {partner.is_active
                      ? "Aktif"
                      : "Nonaktif"}
                  </span>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-cyan-700">
                      Urutan{" "}
                      {partner.sort_order}
                    </p>

                    <p className="text-xs text-slate-400">
                      {formatUpdatedAt(
                        partner.updated_at
                      )}
                    </p>
                  </div>

                  <h2 className="mt-4 text-xl font-bold leading-8 text-[#082B3A]">
                    {partner.name}
                  </h2>

                  <p className="mt-3 line-clamp-3 min-h-[5.25rem] text-sm leading-7 text-slate-500">
                    {partner.description ||
                      "Deskripsi partner belum tersedia."}
                  </p>

                  <div className="mt-5 border-t border-slate-100 pt-5">
                    {partner.website_url ? (
                      <a
                        href={
                          partner.website_url
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#FF5A0A]"
                      >
                        <Globe2 size={16} />
                        Kunjungi Website
                        <ExternalLink
                          size={14}
                        />
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400">
                        <Globe2 size={16} />
                        Website belum tersedia
                      </span>
                    )}
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5">
                    <button
                      type="button"
                      onClick={() =>
                        handleToggleActive(
                          partner
                        )
                      }
                      disabled={
                        togglingId ===
                        partner.id
                      }
                      className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition disabled:opacity-50 ${
                        partner.is_active
                          ? "border-slate-200 text-slate-600 hover:border-slate-400"
                          : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      }`}
                    >
                      {togglingId ===
                      partner.id ? (
                        <LoaderCircle
                          size={16}
                          className="animate-spin"
                        />
                      ) : partner.is_active ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}

                      {partner.is_active
                        ? "Nonaktifkan"
                        : "Aktifkan"}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        openEditForm(partner)
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
                      handleDelete(partner)
                    }
                    disabled={
                      deletingId ===
                      partner.id
                    }
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deletingId ===
                    partner.id ? (
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
                        Hapus Partner
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
                  Partner Form
                </p>

                <h2 className="mt-2 text-2xl font-bold text-[#082B3A]">
                  {editingId
                    ? "Edit Partner"
                    : "Tambah Partner"}
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
                {/* Form utama */}
                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="partner-name"
                      className="mb-2 block text-sm font-semibold text-[#082B3A]"
                    >
                      Nama Partner
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <input
                      id="partner-name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Contoh: Telkom Indonesia"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#082B3A] outline-none transition placeholder:text-slate-400 focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_160px]">
                    <div>
                      <label
                        htmlFor="partner-website"
                        className="mb-2 block text-sm font-semibold text-[#082B3A]"
                      >
                        Website Partner
                      </label>

                      <input
                        id="partner-website"
                        name="website_url"
                        type="text"
                        value={
                          formData.website_url
                        }
                        onChange={handleChange}
                        placeholder="https://partner.com"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#082B3A] outline-none transition placeholder:text-slate-400 focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
                      />

                      <p className="mt-2 text-xs leading-5 text-slate-400">
                        Opsional. Protokol
                        HTTPS akan ditambahkan
                        otomatis.
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="partner-sort-order"
                        className="mb-2 block text-sm font-semibold text-[#082B3A]"
                      >
                        Urutan Tampil
                        <span className="ml-1 text-red-500">
                          *
                        </span>
                      </label>

                      <input
                        id="partner-sort-order"
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
                        htmlFor="partner-description"
                        className="text-sm font-semibold text-[#082B3A]"
                      >
                        Deskripsi Partner
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
                      id="partner-description"
                      name="description"
                      value={
                        formData.description
                      }
                      onChange={handleChange}
                      rows={8}
                      placeholder="Jelaskan bentuk kemitraan atau profil singkat partner..."
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
                        Tampilkan partner
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        Partner aktif akan
                        ditampilkan pada halaman
                        publik.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Logo */}
                <aside>
                  <p className="text-sm font-semibold text-[#082B3A]">
                    Logo Partner
                  </p>

                  <div className="mt-3 flex min-h-64 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6">
                    {displayedLogo ? (
                      <img
                        src={displayedLogo}
                        alt="Preview logo partner"
                        className="max-h-52 max-w-full object-contain"
                      />
                    ) : (
                      <div className="text-center">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#082B3A] to-cyan-800 text-2xl font-bold text-white">
                          {getPartnerInitials(
                            formData.name
                          )}
                        </div>

                        <p className="mt-4 text-sm font-semibold text-slate-500">
                          Logo belum dipilih
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 space-y-3">
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#082B3A] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0A4053]">
                      <UploadCloud size={17} />
                      Pilih Logo

                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={
                          handleLogoChange
                        }
                        className="hidden"
                      />
                    </label>

                    {displayedLogo && (
                      <button
                        type="button"
                        onClick={
                          handleRemoveLogo
                        }
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                        Hapus Logo
                      </button>
                    )}
                  </div>

                  <p className="mt-4 text-xs leading-5 text-slate-400">
                    Format JPG, PNG, atau WebP.
                    Ukuran maksimal 3 MB.
                    Gunakan gambar dengan latar
                    transparan atau putih.
                  </p>

                  {formData.website_url &&
                    isValidUrl(
                      formData.website_url
                    ) && (
                      <a
                        href={normalizeExternalUrl(
                          formData.website_url
                        )}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-[#FF5A0A] hover:text-[#FF5A0A]"
                      >
                        <Globe2 size={16} />
                        Uji Website
                        <ExternalLink
                          size={14}
                        />
                      </a>
                    )}
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
                        : "Tambah Partner"}
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