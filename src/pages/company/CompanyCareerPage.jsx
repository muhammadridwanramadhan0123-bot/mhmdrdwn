import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AlertTriangle,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Filter,
  MapPin,
  RefreshCw,
  Search,
  UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  CTA,
  PageHero,
  SectionHeading,
} from "../../components/Common";

import { getOpenCareers } from "../../services/companyService";

function formatDate(value) {
  if (!value) {
    return "Tidak ditentukan";
  }

  const date = new Date(
    `${value}T00:00:00`
  );

  if (Number.isNaN(date.getTime())) {
    return "Tidak ditentukan";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getEmploymentTypeLabel(value) {
  const normalizedValue = String(
    value || ""
  )
    .trim()
    .toLowerCase();

  switch (normalizedValue) {
    case "full-time":
    case "full_time":
    case "fulltime":
      return "Full Time";

    case "part-time":
    case "part_time":
    case "parttime":
      return "Part Time";

    case "contract":
      return "Contract";

    case "internship":
    case "intern":
      return "Internship";

    case "freelance":
      return "Freelance";

    case "temporary":
      return "Temporary";

    default:
      return value || "Tidak ditentukan";
  }
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

  const currentDate = new Date();

  const difference =
    closingDate.getTime() -
    currentDate.getTime();

  return Math.ceil(
    difference / (1000 * 60 * 60 * 24)
  );
}

function getClosingInformation(value) {
  const daysRemaining =
    getDaysUntilClosing(value);

  if (daysRemaining === null) {
    return {
      label: "Tanpa batas waktu",
      className:
        "border-slate-200 bg-slate-100 text-slate-600",
    };
  }

  if (daysRemaining < 0) {
    return {
      label: "Pendaftaran ditutup",
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
    const text = value.trim();

    if (!text) {
      return [];
    }

    try {
      const parsedValue = JSON.parse(text);

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

    return text
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

function CareerPageLoading() {
  return (
    <>
      <div className="h-[420px] animate-pulse bg-slate-200" />

      <section className="container-jmt py-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <div>
            <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />

            <div className="mt-5 h-12 w-3/4 animate-pulse rounded bg-slate-200" />

            <div className="mt-6 h-5 w-full animate-pulse rounded bg-slate-100" />
          </div>

          <div className="h-64 animate-pulse rounded-3xl bg-slate-200" />
        </div>

        <div className="mt-14 space-y-5">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-64 animate-pulse rounded-3xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      </section>
    </>
  );
}

export default function CompanyCareerPage() {
  const [careers, setCareers] = useState([]);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [
    selectedDepartment,
    setSelectedDepartment,
  ] = useState("all");

  const [
    selectedEmploymentType,
    setSelectedEmploymentType,
  ] = useState("all");

  const [
    expandedCareerId,
    setExpandedCareerId,
  ] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const loadCareers = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const data = await getOpenCareers();

      setCareers(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Lowongan pekerjaan gagal dimuat:",
        error
      );

      setCareers([]);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Lowongan pekerjaan gagal dimuat."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCareers();
  }, [loadCareers]);

  const departmentOptions = useMemo(() => {
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

  const employmentTypeOptions =
    useMemo(() => {
      return [
        ...new Set(
          careers
            .map((career) =>
              String(
                career.employment_type ||
                  ""
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

  const careerSummary = useMemo(() => {
    const locations = new Set(
      careers
        .map((career) =>
          String(
            career.location || ""
          ).trim()
        )
        .filter(Boolean)
    );

    const departments = new Set(
      careers
        .map((career) =>
          String(
            career.department || ""
          ).trim()
        )
        .filter(Boolean)
    );

    const closingSoon = careers.filter(
      (career) => {
        const daysRemaining =
          getDaysUntilClosing(
            career.closing_date
          );

        return (
          daysRemaining !== null &&
          daysRemaining >= 0 &&
          daysRemaining <= 7
        );
      }
    ).length;

    return {
      total: careers.length,
      departments: departments.size,
      locations: locations.size,
      closingSoon,
    };
  }, [careers]);

  const filteredCareers = useMemo(() => {
    const normalizedSearch = searchTerm
      .trim()
      .toLowerCase();

    return careers.filter((career) => {
      const searchableText = [
        career.position,
        career.department,
        career.location,
        career.employment_type,
        career.description,
        ...(Array.isArray(
          career.requirements
        )
          ? career.requirements
          : []),
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

      const matchesDepartment =
        selectedDepartment === "all" ||
        career.department ===
          selectedDepartment;

      const matchesEmploymentType =
        selectedEmploymentType === "all" ||
        career.employment_type ===
          selectedEmploymentType;

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesEmploymentType
      );
    });
  }, [
    careers,
    searchTerm,
    selectedDepartment,
    selectedEmploymentType,
  ]);

  function resetFilters() {
    setSearchTerm("");
    setSelectedDepartment("all");
    setSelectedEmploymentType("all");
  }

  function toggleCareerDetail(id) {
    setExpandedCareerId(
      (currentCareerId) =>
        currentCareerId === id
          ? null
          : id
    );
  }

  if (loading) {
    return <CareerPageLoading />;
  }

  return (
    <>
      <PageHero
        eyebrow="Company — Career"
        title="Build Your Career With JMT Group"
        description="Bergabung bersama tim yang mengembangkan teknologi, layanan, dan ekosistem kesehatan terintegrasi di Indonesia."
      />

      {/* Peringatan error */}
      {errorMessage && (
        <section className="container-jmt pt-8">
          <div className="flex flex-col justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <AlertTriangle
                size={21}
                className="mt-0.5 shrink-0 text-amber-600"
              />

              <div>
                <p className="font-semibold text-amber-800">
                  Data lowongan belum dapat dimuat
                </p>

                <p className="mt-1 text-sm leading-6 text-amber-700">
                  {errorMessage}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={loadCareers}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
            >
              <RefreshCw size={16} />
              Muat Ulang
            </button>
          </div>
        </section>
      )}

      {/* Pendahuluan */}
      <section className="container-jmt py-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)] lg:items-center">
          <div>
            <SectionHeading
              kicker="Join Our Team"
              title="Tumbuh dan menciptakan dampak bersama JMT"
              description="Kami mencari talenta yang memiliki semangat belajar, berkolaborasi, dan menghadirkan solusi yang memberikan dampak nyata bagi layanan kesehatan."
            />

            <p className="mt-7 max-w-3xl text-base leading-8 text-slate-600">
              JMT Group menghadirkan lingkungan
              kerja yang mendukung pengembangan
              kompetensi, inovasi, dan kolaborasi
              lintas bidang.
            </p>

            <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
              Temukan posisi yang sesuai dengan
              pengalaman dan minat Anda melalui
              daftar lowongan yang sedang dibuka.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <article className="rounded-3xl bg-[#082B3A] p-6 text-white">
              <BriefcaseBusiness
                size={25}
                className="text-orange"
              />

              <p className="mt-8 text-4xl font-bold">
                {careerSummary.total}
              </p>

              <p className="mt-2 text-sm text-white/60">
                Posisi dibuka
              </p>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <Building2
                size={25}
                className="text-orange"
              />

              <p className="mt-8 text-4xl font-bold text-ink">
                {careerSummary.departments}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Departemen
              </p>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <MapPin
                size={25}
                className="text-orange"
              />

              <p className="mt-8 text-4xl font-bold text-ink">
                {careerSummary.locations}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Lokasi kerja
              </p>
            </article>

            <article className="rounded-3xl bg-gradient-to-br from-orange to-[#FF7A35] p-6 text-white">
              <Clock3 size={25} />

              <p className="mt-8 text-4xl font-bold">
                {careerSummary.closingSoon}
              </p>

              <p className="mt-2 text-sm text-white/80">
                Segera ditutup
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Daftar lowongan */}
      <section className="bg-mist py-20">
        <div className="container-jmt">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange">
                Available Positions
              </p>

              <h2 className="mt-3 text-3xl font-bold text-ink md:text-4xl">
                Lowongan Tersedia
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
                Gunakan pencarian dan dropdown
                filter untuk menemukan posisi yang
                sesuai.
              </p>
            </div>

            <p className="text-sm text-slate-500">
              Menampilkan{" "}
              <span className="font-bold text-ink">
                {filteredCareers.length}
              </span>{" "}
              dari{" "}
              <span className="font-bold text-ink">
                {careers.length}
              </span>{" "}
              posisi
            </p>
          </div>

          {/* Pencarian dan dropdown */}
          {careers.length > 0 && (
            <div className="mt-10 grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-[minmax(0,1fr)_240px_240px_auto]">
              <div className="relative">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <label
                  htmlFor="career-search"
                  className="sr-only"
                >
                  Cari lowongan
                </label>

                <input
                  id="career-search"
                  type="search"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(
                      event.target.value
                    )
                  }
                  placeholder="Cari posisi, departemen, atau lokasi..."
                  className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-orange focus:ring-2 focus:ring-orange/10"
                />
              </div>

              <div className="relative">
                <Filter
                  size={16}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <label
                  htmlFor="career-department"
                  className="sr-only"
                >
                  Filter departemen
                </label>

                <select
                  id="career-department"
                  value={selectedDepartment}
                  onChange={(event) =>
                    setSelectedDepartment(
                      event.target.value
                    )
                  }
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm font-semibold text-ink outline-none transition focus:border-orange focus:ring-2 focus:ring-orange/10"
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

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>

              <div className="relative">
                <BriefcaseBusiness
                  size={16}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <label
                  htmlFor="career-employment-type"
                  className="sr-only"
                >
                  Filter jenis pekerjaan
                </label>

                <select
                  id="career-employment-type"
                  value={
                    selectedEmploymentType
                  }
                  onChange={(event) =>
                    setSelectedEmploymentType(
                      event.target.value
                    )
                  }
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm font-semibold text-ink outline-none transition focus:border-orange focus:ring-2 focus:ring-orange/10"
                >
                  <option value="all">
                    Semua Jenis Pekerjaan
                  </option>

                  {employmentTypeOptions.map(
                    (employmentType) => (
                      <option
                        key={employmentType}
                        value={employmentType}
                      >
                        {getEmploymentTypeLabel(
                          employmentType
                        )}
                      </option>
                    )
                  )}
                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>

              <button
                type="button"
                onClick={resetFilters}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-orange hover:text-orange"
              >
                Reset
              </button>
            </div>
          )}

          {/* Kondisi belum ada lowongan */}
          {careers.length === 0 ? (
            <div className="mt-12 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              <div className="grid gap-8 p-8 md:p-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center">
                <div>
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange/10 text-orange">
                    <BriefcaseBusiness
                      size={30}
                    />
                  </div>

                  <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-orange">
                    Career Opportunity
                  </p>

                  <h3 className="mt-4 text-3xl font-bold text-ink">
                    Saat ini belum ada lowongan
                    yang tersedia
                  </h3>

                  <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
                    Terima kasih atas minat Anda
                    untuk bergabung bersama JMT
                    Group. Informasi lowongan terbaru
                    akan ditampilkan pada halaman ini.
                  </p>

                  <Link
                    to="/contact"
                    className="mt-8 inline-flex items-center gap-2 rounded-xl bg-orange px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange/20 transition hover:bg-[#E94F00]"
                  >
                    Hubungi Kami
                    <ArrowRight size={17} />
                  </Link>
                </div>

                <div className="relative flex min-h-72 items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-[#082B3A] via-[#0A4053] to-teal">
                  <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full border border-white/10" />

                  <div className="absolute -bottom-16 -left-12 h-44 w-44 rounded-full bg-orange/10 blur-xl" />

                  <UsersRound
                    size={86}
                    className="relative text-orange"
                  />
                </div>
              </div>
            </div>
          ) : filteredCareers.length === 0 ? (
            <div className="mt-10 rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
              <Search
                size={40}
                className="mx-auto text-slate-300"
              />

              <h3 className="mt-5 text-xl font-bold text-ink">
                Lowongan tidak ditemukan
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Tidak ada posisi yang sesuai dengan
                pencarian atau filter yang dipilih.
              </p>

              <button
                type="button"
                onClick={resetFilters}
                className="mt-6 rounded-xl bg-orange px-5 py-3 text-sm font-semibold text-white"
              >
                Tampilkan Semua
              </button>
            </div>
          ) : (
            <div className="mt-10 space-y-5">
              {filteredCareers.map(
                (career) => {
                  const isExpanded =
                    expandedCareerId ===
                    career.id;

                  const requirements =
                    normalizeRequirements(
                      career.requirements
                    );

                  const closingInformation =
                    getClosingInformation(
                      career.closing_date
                    );

                  return (
                    <article
                      key={career.id}
                      className={`overflow-hidden rounded-3xl border bg-white shadow-sm transition duration-300 ${
                        isExpanded
                          ? "border-orange/40 shadow-xl"
                          : "border-slate-200 hover:border-orange/30 hover:shadow-lg"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          toggleCareerDetail(
                            career.id
                          )
                        }
                        className="flex w-full flex-col gap-5 p-6 text-left md:p-8 lg:flex-row lg:items-center"
                        aria-expanded={
                          isExpanded
                        }
                      >
                        <div className="flex min-w-0 flex-1 items-start gap-5">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange/10 text-orange">
                            <BriefcaseBusiness
                              size={25}
                            />
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-700">
                                {career.department ||
                                  "General"}
                              </span>

                              <span className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700">
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

                            <h3 className="mt-4 text-xl font-bold leading-8 text-ink md:text-2xl">
                              {career.position}
                            </h3>

                            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                              <span className="inline-flex items-center gap-2">
                                <MapPin size={16} />
                                {career.location ||
                                  "Lokasi tidak ditentukan"}
                              </span>

                              <span className="inline-flex items-center gap-2">
                                <CalendarDays
                                  size={16}
                                />

                                Ditutup{" "}
                                {formatDate(
                                  career.closing_date
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-4 lg:justify-end">
                          <span className="text-sm font-semibold text-orange">
                            {isExpanded
                              ? "Tutup Detail"
                              : "Lihat Detail"}
                          </span>

                          <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition ${
                              isExpanded
                                ? "rotate-180 border-orange bg-orange text-white"
                                : "border-slate-200 text-slate-400"
                            }`}
                          >
                            <ChevronDown
                              size={19}
                            />
                          </div>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="border-t border-slate-100 bg-slate-50/60 px-6 py-7 md:px-8 md:py-8">
                          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
                            <div>
                              <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange">
                                Job Description
                              </p>

                              <h4 className="mt-3 text-xl font-bold text-ink">
                                Deskripsi Pekerjaan
                              </h4>

                              <p className="mt-5 whitespace-pre-line text-sm leading-8 text-slate-600">
                                {career.description ||
                                  "Deskripsi pekerjaan belum tersedia."}
                              </p>
                            </div>

                            <div className="rounded-3xl border border-slate-200 bg-white p-6">
                              <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange">
                                Requirements
                              </p>

                              <h4 className="mt-3 text-xl font-bold text-ink">
                                Persyaratan
                              </h4>

                              {requirements.length >
                              0 ? (
                                <div className="mt-5 space-y-4">
                                  {requirements.map(
                                    (
                                      requirement,
                                      index
                                    ) => (
                                      <div
                                        key={`${requirement}-${index}`}
                                        className="flex items-start gap-3"
                                      >
                                        <CheckCircle2
                                          size={18}
                                          className="mt-0.5 shrink-0 text-emerald-500"
                                        />

                                        <p className="text-sm leading-7 text-slate-600">
                                          {
                                            requirement
                                          }
                                        </p>
                                      </div>
                                    )
                                  )}
                                </div>
                              ) : (
                                <p className="mt-5 text-sm leading-7 text-slate-500">
                                  Persyaratan belum
                                  tersedia.
                                </p>
                              )}

                              <div className="mt-7 border-t border-slate-100 pt-6">
                                <Link
                                  to="/contact"
                                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange/20 transition hover:bg-[#E94F00]"
                                >
                                  Hubungi Tim Rekrutmen
                                  <ArrowRight
                                    size={17}
                                  />
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                }
              )}
            </div>
          )}
        </div>
      </section>

      {/* Budaya kerja */}
      <section className="container-jmt py-20">
        <SectionHeading
          kicker="Life at JMT"
          title="Lingkungan untuk belajar, tumbuh, dan berkolaborasi"
          description="Kami percaya bahwa solusi terbaik lahir dari tim yang saling mendukung, terus belajar, dan berani menghadirkan inovasi."
          center
        />

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Continuous Learning",
              description:
                "Kesempatan mengembangkan pengetahuan dan keterampilan melalui pengalaman proyek serta pembelajaran berkelanjutan.",
              icon: CheckCircle2,
            },
            {
              title: "Collaborative Team",
              description:
                "Bekerja bersama tim lintas disiplin untuk menyelesaikan tantangan dan menciptakan solusi yang berdampak.",
              icon: UsersRound,
            },
            {
              title: "Meaningful Impact",
              description:
                "Berkontribusi dalam pengembangan teknologi dan layanan yang mendukung kemajuan fasilitas kesehatan.",
              icon: BriefcaseBusiness,
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange/30 hover:shadow-xl"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange/10 text-orange">
                  <Icon size={25} />
                </div>

                <h3 className="mt-6 text-xl font-bold text-ink">
                  {item.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-slate-500">
                  {item.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <CTA />
    </>
  );
}