import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit3,
  ExternalLink,
  FileText,
  LoaderCircle,
  MapPin,
  Plus,
  RefreshCw,
  Save,
  Search,
  Tag,
  Trash2,
  UsersRound,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  createCareer,
  deleteCareer,
  getAdminCareers,
  updateCareer,
} from "../../services/companyAdminService";

const careerStatuses = [
  {
    value: "draft",
    label: "Draft",
  },
  {
    value: "open",
    label: "Open",
  },
  {
    value: "closed",
    label: "Closed",
  },
];

const employmentTypes = [
  {
    value: "full-time",
    label: "Full Time",
  },
  {
    value: "part-time",
    label: "Part Time",
  },
  {
    value: "contract",
    label: "Contract",
  },
  {
    value: "internship",
    label: "Internship",
  },
  {
    value: "freelance",
    label: "Freelance",
  },
];

function createInitialFormData() {
  return {
    position: "",
    slug: "",
    department: "",
    location: "",
    employment_type: "full-time",
    description: "",
    requirements: "",
    closing_date: "",
    status: "draft",
    seo_title: "",
    seo_description: "",
  };
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeRequirements(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map((item) =>
        String(item || "").trim()
      )
      .filter(Boolean);
  }

  if (typeof value === "string") {
    const normalizedValue = value.trim();

    if (!normalizedValue) {
      return [];
    }

    try {
      const parsedValue = JSON.parse(
        normalizedValue
      );

      if (Array.isArray(parsedValue)) {
        return parsedValue
          .map((item) =>
            String(item || "").trim()
          )
          .filter(Boolean);
      }
    } catch {
      // Gunakan pemisahan teks biasa.
    }

    return normalizedValue
      .split(/\r?\n|;/)
      .map((item) =>
        item
          .replace(/^[-•]\s*/, "")
          .trim()
      )
      .filter(Boolean);
  }

  return [];
}

function requirementsToEditorText(value) {
  return normalizeRequirements(value).join(
    "\n"
  );
}

function formatDate(value) {
  if (!value) {
    return "Tanpa batas waktu";
  }

  const date = new Date(
    `${value}T00:00:00`
  );

  if (Number.isNaN(date.getTime())) {
    return "Tanggal tidak valid";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
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

function isClosingDateExpired(value) {
  if (!value) {
    return false;
  }

  const closingDate = new Date(
    `${value}T23:59:59`
  );

  if (
    Number.isNaN(closingDate.getTime())
  ) {
    return false;
  }

  return closingDate < new Date();
}

function getDaysUntilClosing(value) {
  if (!value) {
    return null;
  }

  const closingDate = new Date(
    `${value}T23:59:59`
  );

  if (
    Number.isNaN(closingDate.getTime())
  ) {
    return null;
  }

  const difference =
    closingDate.getTime() -
    new Date().getTime();

  return Math.ceil(
    difference /
      (1000 * 60 * 60 * 24)
  );
}

function getClosingInformation(value) {
  const daysRemaining =
    getDaysUntilClosing(value);

  if (daysRemaining === null) {
    return {
      label: "Tanpa batas waktu",
      className:
        "border-slate-200 bg-slate-50 text-slate-600",
    };
  }

  if (daysRemaining < 0) {
    return {
      label: "Kedaluwarsa",
      className:
        "border-red-200 bg-red-50 text-red-700",
    };
  }

  if (daysRemaining === 0) {
    return {
      label: "Berakhir hari ini",
      className:
        "border-red-200 bg-red-50 text-red-700",
    };
  }

  if (daysRemaining <= 7) {
    return {
      label: `${daysRemaining} hari lagi`,
      className:
        "border-orange-200 bg-orange-50 text-[#FF5A0A]",
    };
  }

  return {
    label: `${daysRemaining} hari lagi`,
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
  };
}

function getStatusInformation(status) {
  switch (status) {
    case "open":
      return {
        label: "Open",
        className:
          "border-emerald-200 bg-emerald-50 text-emerald-700",
      };

    case "closed":
      return {
        label: "Closed",
        className:
          "border-slate-300 bg-slate-100 text-slate-700",
      };

    case "draft":
    default:
      return {
        label: "Draft",
        className:
          "border-amber-200 bg-amber-50 text-amber-700",
      };
  }
}

function getEmploymentTypeLabel(value) {
  const employmentType =
    employmentTypes.find(
      (item) => item.value === value
    );

  return employmentType?.label || value;
}

function sortCareerRecords(items) {
  return [...items].sort(
    (firstItem, secondItem) => {
      const firstDate = new Date(
        firstItem.created_at || 0
      ).getTime();

      const secondDate = new Date(
        secondItem.created_at || 0
      ).getTime();

      return secondDate - firstDate;
    }
  );
}

function CareersLoading() {
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

      <div className="space-y-5">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-72 animate-pulse rounded-3xl bg-slate-200"
          />
        ))}
      </div>
    </div>
  );
}

export default function AdminCompanyCareersPage() {
  const [careers, setCareers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState(null);

  const [
    updatingStatusId,
    setUpdatingStatusId,
  ] = useState(null);

  const [formOpen, setFormOpen] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [formData, setFormData] =
    useState(createInitialFormData());

  const [slugTouched, setSlugTouched] =
    useState(false);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [
    employmentFilter,
    setEmploymentFilter,
  ] = useState("all");

  const [
    departmentFilter,
    setDepartmentFilter,
  ] = useState("all");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const loadCareers =
    useCallback(async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const data =
          await getAdminCareers();

        setCareers(
          sortCareerRecords(
            Array.isArray(data)
              ? data
              : []
          )
        );
      } catch (error) {
        console.error(
          "Career gagal dimuat:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Daftar Career gagal dimuat."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadCareers();
  }, [loadCareers]);

  const summary = useMemo(() => {
    const open = careers.filter(
      (career) =>
        career.status === "open" &&
        !isClosingDateExpired(
          career.closing_date
        )
    ).length;

    const draft = careers.filter(
      (career) =>
        career.status === "draft"
    ).length;

    const closed = careers.filter(
      (career) =>
        career.status === "closed"
    ).length;

    const expired = careers.filter(
      (career) =>
        career.status === "open" &&
        isClosingDateExpired(
          career.closing_date
        )
    ).length;

    return {
      total: careers.length,
      open,
      draft,
      closed,
      expired,
    };
  }, [careers]);

  const departmentOptions =
    useMemo(() => {
      return [
        ...new Set(
          careers
            .map((career) =>
              String(
                career.department || ""
              ).trim()
            )
            .filter(Boolean)
        ),
      ].sort((firstItem, secondItem) =>
        firstItem.localeCompare(
          secondItem,
          "id"
        )
      );
    }, [careers]);

  const filteredCareers = useMemo(() => {
    const normalizedSearch =
      searchTerm.trim().toLowerCase();

    return careers.filter((career) => {
      const requirements =
        normalizeRequirements(
          career.requirements
        );

      const searchableText = [
        career.position,
        career.slug,
        career.department,
        career.location,
        career.employment_type,
        career.description,
        career.seo_title,
        career.seo_description,
        ...requirements,
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
        career.status === statusFilter;

      const matchesEmployment =
        employmentFilter === "all" ||
        career.employment_type ===
          employmentFilter;

      const matchesDepartment =
        departmentFilter === "all" ||
        career.department ===
          departmentFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesEmployment &&
        matchesDepartment
      );
    });
  }, [
    careers,
    searchTerm,
    statusFilter,
    employmentFilter,
    departmentFilter,
  ]);

  function resetFilters() {
    setSearchTerm("");
    setStatusFilter("all");
    setEmploymentFilter("all");
    setDepartmentFilter("all");
  }

  function resetForm() {
    setEditingId(null);
    setSlugTouched(false);
    setFormData(
      createInitialFormData()
    );
  }

  function closeForm() {
    if (saving) {
      return;
    }

    setFormOpen(false);
    resetForm();
  }

  function openCreateForm() {
    resetForm();
    setErrorMessage("");
    setSuccessMessage("");
    setFormOpen(true);
  }

  function openEditForm(career) {
    setEditingId(career.id);
    setSlugTouched(true);

    setFormData({
      position:
        career.position || "",

      slug:
        career.slug || "",

      department:
        career.department || "",

      location:
        career.location || "",

      employment_type:
        career.employment_type ||
        "full-time",

      description:
        career.description || "",

      requirements:
        requirementsToEditorText(
          career.requirements
        ),

      closing_date:
        career.closing_date || "",

      status:
        career.status || "draft",

      seo_title:
        career.seo_title || "",

      seo_description:
        career.seo_description || "",
    });

    setErrorMessage("");
    setSuccessMessage("");
    setFormOpen(true);
  }

  function handleChange(event) {
    const { name, value } =
      event.target;

    if (name === "position") {
      setFormData((currentData) => ({
        ...currentData,
        position: value,

        slug: slugTouched
          ? currentData.slug
          : slugify(value),
      }));

      setSuccessMessage("");
      return;
    }

    if (name === "slug") {
      setSlugTouched(true);

      setFormData((currentData) => ({
        ...currentData,
        slug: slugify(value),
      }));

      setSuccessMessage("");
      return;
    }

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    setSuccessMessage("");
  }

  function validateForm() {
    const position =
      formData.position.trim();

    const slug =
      slugify(formData.slug) ||
      slugify(position);

    if (!position) {
      return "Nama posisi wajib diisi.";
    }

    if (!slug) {
      return "Slug Career tidak valid.";
    }

    const validStatus =
      careerStatuses.some(
        (item) =>
          item.value === formData.status
      );

    if (!validStatus) {
      return "Status Career tidak valid.";
    }

    const validEmploymentType =
      employmentTypes.some(
        (item) =>
          item.value ===
          formData.employment_type
      );

    if (!validEmploymentType) {
      return "Jenis pekerjaan tidak valid.";
    }

    if (
      formData.status === "open" &&
      formData.closing_date &&
      isClosingDateExpired(
        formData.closing_date
      )
    ) {
      return "Lowongan berstatus Open harus memiliki tanggal penutupan hari ini atau di masa mendatang.";
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

    try {
      setSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      const payload = {
        position:
          formData.position.trim(),

        slug:
          slugify(formData.slug) ||
          slugify(
            formData.position
          ),

        department:
          formData.department.trim(),

        location:
          formData.location.trim(),

        employment_type:
          formData.employment_type,

        description:
          formData.description.trim(),

        requirements:
          normalizeRequirements(
            formData.requirements
          ),

        closing_date:
          formData.closing_date || "",

        status:
          formData.status,

        seo_title:
          formData.seo_title.trim(),

        seo_description:
          formData.seo_description.trim(),
      };

      const savedCareer = editingId
        ? await updateCareer(
            editingId,
            payload
          )
        : await createCareer(payload);

      setCareers((currentCareers) => {
        if (editingId) {
          return sortCareerRecords(
            currentCareers.map(
              (career) =>
                career.id === editingId
                  ? savedCareer
                  : career
            )
          );
        }

        return sortCareerRecords([
          savedCareer,
          ...currentCareers,
        ]);
      });

      setSuccessMessage(
        editingId
          ? "Lowongan berhasil diperbarui."
          : "Lowongan berhasil ditambahkan."
      );

      setFormOpen(false);
      resetForm();
    } catch (error) {
      console.error(
        "Career gagal disimpan:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Career gagal disimpan."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(
    career,
    nextStatus
  ) {
    if (
      nextStatus === "open" &&
      career.closing_date &&
      isClosingDateExpired(
        career.closing_date
      )
    ) {
      setErrorMessage(
        `Lowongan "${career.position}" tidak dapat dibuka karena tanggal penutupannya sudah lewat. Edit tanggal terlebih dahulu.`
      );

      return;
    }

    try {
      setUpdatingStatusId(career.id);
      setErrorMessage("");
      setSuccessMessage("");

      const updatedCareer =
        await updateCareer(
          career.id,
          {
            position:
              career.position,

            slug:
              career.slug,

            department:
              career.department,

            location:
              career.location,

            employment_type:
              career.employment_type,

            description:
              career.description,

            requirements:
              career.requirements,

            closing_date:
              career.closing_date,

            status: nextStatus,

            seo_title:
              career.seo_title,

            seo_description:
              career.seo_description,
          }
        );

      setCareers((currentCareers) =>
        sortCareerRecords(
          currentCareers.map(
            (item) =>
              item.id === career.id
                ? updatedCareer
                : item
          )
        )
      );

      setSuccessMessage(
        `Status lowongan berhasil diubah menjadi ${getStatusInformation(
          nextStatus
        ).label}.`
      );
    } catch (error) {
      console.error(
        "Status Career gagal diperbarui:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Status Career gagal diperbarui."
      );
    } finally {
      setUpdatingStatusId(null);
    }
  }

  async function handleDelete(career) {
    const approved = window.confirm(
      `Hapus lowongan "${career.position}"?\n\nData yang sudah dihapus tidak dapat dikembalikan.`
    );

    if (!approved) {
      return;
    }

    try {
      setDeletingId(career.id);
      setErrorMessage("");
      setSuccessMessage("");

      await deleteCareer(career.id);

      setCareers((currentCareers) =>
        currentCareers.filter(
          (item) =>
            item.id !== career.id
        )
      );

      setSuccessMessage(
        "Lowongan berhasil dihapus."
      );
    } catch (error) {
      console.error(
        "Career gagal dihapus:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Career gagal dihapus."
      );
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return <CareersLoading />;
  }

  const formRequirementItems =
    normalizeRequirements(
      formData.requirements
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

          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#FF5A0A]">
            <BriefcaseBusiness
              size={14}
            />
            Careers
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#082B3A] md:text-4xl">
            Kelola Career
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
            Tambahkan dan kelola lowongan,
            persyaratan, jenis pekerjaan,
            status publikasi, SEO, dan tanggal
            penutupan.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            to="/company/career"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-[#082B3A] shadow-sm transition hover:border-[#FF5A0A] hover:text-[#FF5A0A]"
          >
            Halaman Publik
            <ExternalLink size={16} />
          </Link>

          <button
            type="button"
            onClick={loadCareers}
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
            Tambah Lowongan
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
          <BriefcaseBusiness
            size={24}
            className="text-[#FF5A0A]"
          />

          <p className="mt-7 text-3xl font-bold">
            {summary.total}
          </p>

          <p className="mt-2 text-sm text-white/60">
            Total lowongan
          </p>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <UsersRound
            size={24}
            className="text-emerald-600"
          />

          <p className="mt-7 text-3xl font-bold text-[#082B3A]">
            {summary.open}
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Sedang dibuka
          </p>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <FileText
            size={24}
            className="text-amber-600"
          />

          <p className="mt-7 text-3xl font-bold text-[#082B3A]">
            {summary.draft}
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Masih draft
          </p>
        </article>

        <article className="rounded-3xl bg-gradient-to-br from-[#FF5A0A] to-[#FF7A35] p-6 text-white">
          <Clock3 size={24} />

          <p className="mt-7 text-3xl font-bold">
            {summary.expired}
          </p>

          <p className="mt-2 text-sm text-white/80">
            Tanggal sudah lewat
          </p>
        </article>
      </section>

      {/* Filter */}
      <section className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm xl:grid-cols-[minmax(0,1fr)_190px_220px_230px_auto]">
        <div className="relative">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <label
            htmlFor="career-admin-search"
            className="sr-only"
          >
            Cari lowongan
          </label>

          <input
            id="career-admin-search"
            type="search"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
            placeholder="Cari posisi, departemen, lokasi..."
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

          {careerStatuses.map((status) => (
            <option
              key={status.value}
              value={status.value}
            >
              {status.label}
            </option>
          ))}
        </select>

        <select
          value={employmentFilter}
          onChange={(event) =>
            setEmploymentFilter(
              event.target.value
            )
          }
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#082B3A] outline-none transition focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
        >
          <option value="all">
            Semua Jenis Kerja
          </option>

          {employmentTypes.map(
            (employmentType) => (
              <option
                key={
                  employmentType.value
                }
                value={
                  employmentType.value
                }
              >
                {
                  employmentType.label
                }
              </option>
            )
          )}
        </select>

        <select
          value={departmentFilter}
          onChange={(event) =>
            setDepartmentFilter(
              event.target.value
            )
          }
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#082B3A] outline-none transition focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
        >
          <option value="all">
            Semua Departemen
          </option>

          {departmentOptions.map(
            (department) => (
              <option
                key={department}
                value={department}
              >
                {department}
              </option>
            )
          )}
        </select>

        <button
          type="button"
          onClick={resetFilters}
          className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-[#FF5A0A] hover:text-[#FF5A0A]"
        >
          Reset
        </button>
      </section>

      {/* Daftar Career */}
      {filteredCareers.length === 0 ? (
        <section className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <BriefcaseBusiness
            size={44}
            className="mx-auto text-slate-300"
          />

          <h2 className="mt-5 text-xl font-bold text-[#082B3A]">
            Lowongan tidak ditemukan
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Belum ada lowongan atau tidak ada
            data yang sesuai dengan filter.
          </p>

          <button
            type="button"
            onClick={
              careers.length === 0
                ? openCreateForm
                : resetFilters
            }
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#FF5A0A] px-5 py-3 text-sm font-semibold text-white"
          >
            {careers.length === 0 ? (
              <>
                <Plus size={17} />
                Tambah Lowongan
              </>
            ) : (
              "Tampilkan Semua"
            )}
          </button>
        </section>
      ) : (
        <section className="space-y-5">
          {filteredCareers.map(
            (career) => {
              const requirements =
                normalizeRequirements(
                  career.requirements
                );

              const statusInformation =
                getStatusInformation(
                  career.status
                );

              const closingInformation =
                getClosingInformation(
                  career.closing_date
                );

              const expiredWhileOpen =
                career.status === "open" &&
                isClosingDateExpired(
                  career.closing_date
                );

              return (
                <article
                  key={career.id}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:border-orange-200 hover:shadow-xl"
                >
                  <div className="p-6 md:p-8">
                    <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-start">
                      <div className="flex min-w-0 items-start gap-5">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-[#FF5A0A]">
                          <BriefcaseBusiness
                            size={25}
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${statusInformation.className}`}
                            >
                              {
                                statusInformation.label
                              }
                            </span>

                            <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                              {getEmploymentTypeLabel(
                                career.employment_type
                              )}
                            </span>

                            <span
                              className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${closingInformation.className}`}
                            >
                              {
                                closingInformation.label
                              }
                            </span>
                          </div>

                          <h2 className="mt-4 text-2xl font-bold leading-8 text-[#082B3A]">
                            {career.position}
                          </h2>

                          <p className="mt-2 break-all text-xs font-medium text-slate-400">
                            /company/career/
                            {career.slug}
                          </p>

                          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500">
                            <span className="inline-flex items-center gap-2">
                              <Tag size={16} />

                              {career.department ||
                                "Departemen belum diisi"}
                            </span>

                            <span className="inline-flex items-center gap-2">
                              <MapPin size={16} />

                              {career.location ||
                                "Lokasi belum diisi"}
                            </span>

                            <span className="inline-flex items-center gap-2">
                              <CalendarDays
                                size={16}
                              />

                              {formatDate(
                                career.closing_date
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="w-full shrink-0 xl:w-56">
                        <label
                          htmlFor={`career-status-${career.id}`}
                          className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400"
                        >
                          Ubah Status
                        </label>

                        <select
                          id={`career-status-${career.id}`}
                          value={career.status}
                          onChange={(event) =>
                            handleStatusChange(
                              career,
                              event.target.value
                            )
                          }
                          disabled={
                            updatingStatusId ===
                            career.id
                          }
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#082B3A] outline-none transition focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {careerStatuses.map(
                            (status) => (
                              <option
                                key={
                                  status.value
                                }
                                value={
                                  status.value
                                }
                              >
                                {
                                  status.label
                                }
                              </option>
                            )
                          )}
                        </select>

                        {updatingStatusId ===
                          career.id && (
                          <p className="mt-2 inline-flex items-center gap-2 text-xs text-slate-500">
                            <LoaderCircle
                              size={13}
                              className="animate-spin"
                            />
                            Memperbarui status
                          </p>
                        )}
                      </div>
                    </div>

                    {expiredWhileOpen && (
                      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                        <AlertTriangle
                          size={18}
                          className="mt-0.5 shrink-0 text-red-600"
                        />

                        <p className="text-sm leading-6 text-red-700">
                          Status masih Open, tetapi
                          tanggal penutupan sudah
                          lewat. Lowongan ini tidak
                          tampil di halaman publik.
                        </p>
                      </div>
                    )}

                    <div className="mt-7 grid gap-6 border-t border-slate-100 pt-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#FF5A0A]">
                          Deskripsi
                        </p>

                        <p className="mt-3 line-clamp-4 whitespace-pre-line text-sm leading-7 text-slate-600">
                          {career.description ||
                            "Deskripsi pekerjaan belum tersedia."}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-5">
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#FF5A0A]">
                            Persyaratan
                          </p>

                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500">
                            {
                              requirements.length
                            }{" "}
                            poin
                          </span>
                        </div>

                        {requirements.length > 0 ? (
                          <div className="mt-4 space-y-3">
                            {requirements
                              .slice(0, 3)
                              .map(
                                (
                                  requirement,
                                  index
                                ) => (
                                  <div
                                    key={`${requirement}-${index}`}
                                    className="flex items-start gap-3"
                                  >
                                    <CheckCircle2
                                      size={16}
                                      className="mt-0.5 shrink-0 text-emerald-500"
                                    />

                                    <p className="text-xs leading-6 text-slate-600">
                                      {
                                        requirement
                                      }
                                    </p>
                                  </div>
                                )
                              )}

                            {requirements.length >
                              3 && (
                              <p className="text-xs font-semibold text-[#FF5A0A]">
                                +
                                {requirements.length -
                                  3}{" "}
                                persyaratan lainnya
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="mt-4 text-xs leading-6 text-slate-400">
                            Persyaratan belum
                            tersedia.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-7 flex flex-col justify-between gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center">
                      <p className="text-xs text-slate-400">
                        Terakhir diperbarui:{" "}
                        {formatUpdatedAt(
                          career.updated_at
                        )}
                      </p>

                      <div className="flex flex-col gap-3 sm:flex-row">
                        <button
                          type="button"
                          onClick={() =>
                            openEditForm(
                              career
                            )
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#082B3A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0A4053]"
                        >
                          <Edit3 size={16} />
                          Edit Lowongan
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              career
                            )
                          }
                          disabled={
                            deletingId ===
                            career.id
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId ===
                          career.id ? (
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
                              Hapus
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            }
          )}
        </section>
      )}

      {/* Modal Form */}
      {formOpen && (
        <div className="fixed inset-0 z-[80] overflow-y-auto bg-[#082B3A]/70 px-4 py-8 backdrop-blur-sm">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-5 border-b border-slate-100 px-6 py-5 md:px-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#FF5A0A]">
                  Career Form
                </p>

                <h2 className="mt-2 text-2xl font-bold text-[#082B3A]">
                  {editingId
                    ? "Edit Lowongan"
                    : "Tambah Lowongan"}
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
              <div className="grid gap-8 p-6 md:p-8 xl:grid-cols-[minmax(0,1fr)_360px]">
                {/* Form utama */}
                <div className="space-y-7">
                  <section>
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-[#FF5A0A]">
                        <BriefcaseBusiness
                          size={22}
                        />
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-[#082B3A]">
                          Informasi Posisi
                        </h3>

                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          Informasi utama mengenai
                          posisi yang dibuka.
                        </p>
                      </div>
                    </div>

                    <div className="mt-7 space-y-6">
                      <div>
                        <label
                          htmlFor="career-position"
                          className="mb-2 block text-sm font-semibold text-[#082B3A]"
                        >
                          Nama Posisi
                          <span className="ml-1 text-red-500">
                            *
                          </span>
                        </label>

                        <input
                          id="career-position"
                          name="position"
                          type="text"
                          value={
                            formData.position
                          }
                          onChange={handleChange}
                          required
                          placeholder="Contoh: Frontend Developer"
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#082B3A] outline-none transition placeholder:text-slate-400 focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="career-slug"
                          className="mb-2 block text-sm font-semibold text-[#082B3A]"
                        >
                          Slug
                          <span className="ml-1 text-red-500">
                            *
                          </span>
                        </label>

                        <div className="flex overflow-hidden rounded-xl border border-slate-200 focus-within:border-[#FF5A0A] focus-within:ring-2 focus-within:ring-orange-100">
                          <span className="flex items-center border-r border-slate-200 bg-slate-50 px-4 text-xs text-slate-400">
                            /career/
                          </span>

                          <input
                            id="career-slug"
                            name="slug"
                            type="text"
                            value={
                              formData.slug
                            }
                            onChange={
                              handleChange
                            }
                            required
                            placeholder="frontend-developer"
                            className="min-w-0 flex-1 px-4 py-3 text-sm text-[#082B3A] outline-none"
                          />
                        </div>

                        <p className="mt-2 text-xs leading-5 text-slate-400">
                          Slug dibuat otomatis dari
                          nama posisi dan harus unik.
                        </p>
                      </div>

                      <div className="grid gap-5 md:grid-cols-2">
                        <div>
                          <label
                            htmlFor="career-department"
                            className="mb-2 block text-sm font-semibold text-[#082B3A]"
                          >
                            Departemen
                          </label>

                          <input
                            id="career-department"
                            name="department"
                            type="text"
                            value={
                              formData.department
                            }
                            onChange={
                              handleChange
                            }
                            placeholder="Information Technology"
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#082B3A] outline-none transition placeholder:text-slate-400 focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="career-location"
                            className="mb-2 block text-sm font-semibold text-[#082B3A]"
                          >
                            Lokasi
                          </label>

                          <input
                            id="career-location"
                            name="location"
                            type="text"
                            value={
                              formData.location
                            }
                            onChange={
                              handleChange
                            }
                            placeholder="Bandung / Hybrid / Remote"
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#082B3A] outline-none transition placeholder:text-slate-400 focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
                          />
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="border-t border-slate-100 pt-7">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                        <FileText size={22} />
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-[#082B3A]">
                          Deskripsi dan Persyaratan
                        </h3>

                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          Jelaskan tanggung jawab
                          dan kualifikasi kandidat.
                        </p>
                      </div>
                    </div>

                    <div className="mt-7 space-y-6">
                      <div>
                        <div className="mb-2 flex items-center justify-between gap-4">
                          <label
                            htmlFor="career-description"
                            className="text-sm font-semibold text-[#082B3A]"
                          >
                            Deskripsi Pekerjaan
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
                          id="career-description"
                          name="description"
                          value={
                            formData.description
                          }
                          onChange={handleChange}
                          rows={9}
                          placeholder="Jelaskan tugas, tanggung jawab, dan gambaran pekerjaan..."
                          className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-7 text-[#082B3A] outline-none transition placeholder:text-slate-400 focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
                        />
                      </div>

                      <div>
                        <div className="mb-2 flex items-center justify-between gap-4">
                          <label
                            htmlFor="career-requirements"
                            className="text-sm font-semibold text-[#082B3A]"
                          >
                            Persyaratan
                          </label>

                          <span className="text-xs text-slate-400">
                            {
                              formRequirementItems.length
                            }{" "}
                            poin
                          </span>
                        </div>

                        <textarea
                          id="career-requirements"
                          name="requirements"
                          value={
                            formData.requirements
                          }
                          onChange={handleChange}
                          rows={10}
                          placeholder={`Tuliskan satu persyaratan pada setiap baris.\n\nContoh:\nMenguasai React.js\nMemahami REST API dan Supabase\nMampu bekerja secara kolaboratif`}
                          className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-7 text-[#082B3A] outline-none transition placeholder:text-slate-400 focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
                        />

                        <p className="mt-2 text-xs leading-5 text-slate-400">
                          Setiap baris akan disimpan
                          sebagai satu item dalam
                          JSON array.
                        </p>
                      </div>
                    </div>
                  </section>

                  <section className="border-t border-slate-100 pt-7">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                        <Search size={22} />
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-[#082B3A]">
                          Search Engine Optimization
                        </h3>

                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          Informasi SEO untuk
                          halaman lowongan.
                        </p>
                      </div>
                    </div>

                    <div className="mt-7 space-y-6">
                      <div>
                        <div className="mb-2 flex items-center justify-between gap-4">
                          <label
                            htmlFor="career-seo-title"
                            className="text-sm font-semibold text-[#082B3A]"
                          >
                            SEO Title
                          </label>

                          <span className="text-xs text-slate-400">
                            {
                              formData.seo_title
                                .length
                            }
                            /60
                          </span>
                        </div>

                        <input
                          id="career-seo-title"
                          name="seo_title"
                          type="text"
                          maxLength={60}
                          value={
                            formData.seo_title
                          }
                          onChange={handleChange}
                          placeholder="Lowongan Frontend Developer di JMT Group"
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#082B3A] outline-none transition placeholder:text-slate-400 focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
                        />
                      </div>

                      <div>
                        <div className="mb-2 flex items-center justify-between gap-4">
                          <label
                            htmlFor="career-seo-description"
                            className="text-sm font-semibold text-[#082B3A]"
                          >
                            SEO Description
                          </label>

                          <span className="text-xs text-slate-400">
                            {
                              formData
                                .seo_description
                                .length
                            }
                            /160
                          </span>
                        </div>

                        <textarea
                          id="career-seo-description"
                          name="seo_description"
                          maxLength={160}
                          value={
                            formData
                              .seo_description
                          }
                          onChange={handleChange}
                          rows={4}
                          placeholder="Deskripsi singkat lowongan untuk hasil pencarian..."
                          className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-7 text-[#082B3A] outline-none transition placeholder:text-slate-400 focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
                        />
                      </div>
                    </div>
                  </section>
                </div>

                {/* Sidebar pengaturan */}
                <aside className="space-y-6">
                  <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#FF5A0A]">
                      Publication
                    </p>

                    <h3 className="mt-2 text-lg font-bold text-[#082B3A]">
                      Pengaturan Lowongan
                    </h3>

                    <div className="mt-6 space-y-5">
                      <div>
                        <label
                          htmlFor="career-status"
                          className="mb-2 block text-sm font-semibold text-[#082B3A]"
                        >
                          Status
                          <span className="ml-1 text-red-500">
                            *
                          </span>
                        </label>

                        <select
                          id="career-status"
                          name="status"
                          value={
                            formData.status
                          }
                          onChange={handleChange}
                          required
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#082B3A] outline-none transition focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
                        >
                          {careerStatuses.map(
                            (status) => (
                              <option
                                key={
                                  status.value
                                }
                                value={
                                  status.value
                                }
                              >
                                {
                                  status.label
                                }
                              </option>
                            )
                          )}
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="career-employment-type"
                          className="mb-2 block text-sm font-semibold text-[#082B3A]"
                        >
                          Jenis Pekerjaan
                          <span className="ml-1 text-red-500">
                            *
                          </span>
                        </label>

                        <select
                          id="career-employment-type"
                          name="employment_type"
                          value={
                            formData.employment_type
                          }
                          onChange={handleChange}
                          required
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#082B3A] outline-none transition focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
                        >
                          {employmentTypes.map(
                            (
                              employmentType
                            ) => (
                              <option
                                key={
                                  employmentType.value
                                }
                                value={
                                  employmentType.value
                                }
                              >
                                {
                                  employmentType.label
                                }
                              </option>
                            )
                          )}
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="career-closing-date"
                          className="mb-2 block text-sm font-semibold text-[#082B3A]"
                        >
                          Tanggal Penutupan
                        </label>

                        <input
                          id="career-closing-date"
                          name="closing_date"
                          type="date"
                          value={
                            formData.closing_date
                          }
                          onChange={handleChange}
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#082B3A] outline-none transition focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
                        />

                        <p className="mt-2 text-xs leading-5 text-slate-400">
                          Kosongkan apabila tidak
                          mempunyai batas waktu.
                        </p>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-3xl bg-[#082B3A] p-6 text-white">
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#FF5A0A]">
                      Preview
                    </p>

                    <h3 className="mt-4 text-xl font-bold">
                      {formData.position ||
                        "Nama Posisi"}
                    </h3>

                    <div className="mt-5 space-y-3 text-sm text-white/70">
                      <p className="flex items-center gap-3">
                        <Tag
                          size={16}
                          className="text-[#FF5A0A]"
                        />

                        {formData.department ||
                          "Departemen"}
                      </p>

                      <p className="flex items-center gap-3">
                        <MapPin
                          size={16}
                          className="text-[#FF5A0A]"
                        />

                        {formData.location ||
                          "Lokasi kerja"}
                      </p>

                      <p className="flex items-center gap-3">
                        <BriefcaseBusiness
                          size={16}
                          className="text-[#FF5A0A]"
                        />

                        {getEmploymentTypeLabel(
                          formData.employment_type
                        )}
                      </p>

                      <p className="flex items-center gap-3">
                        <CalendarDays
                          size={16}
                          className="text-[#FF5A0A]"
                        />

                        {formatDate(
                          formData.closing_date
                        )}
                      </p>
                    </div>

                    <div className="mt-6 border-t border-white/10 pt-5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
                        Persyaratan
                      </p>

                      <p className="mt-2 text-3xl font-bold">
                        {
                          formRequirementItems.length
                        }
                      </p>

                      <p className="mt-1 text-xs text-white/50">
                        poin persyaratan
                      </p>
                    </div>
                  </section>
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
                        : "Tambah Lowongan"}
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