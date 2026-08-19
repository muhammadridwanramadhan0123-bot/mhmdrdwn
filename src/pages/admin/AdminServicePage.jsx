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
  Eye,
  FileEdit,
  ImageIcon,
  Layers3,
  LoaderCircle,
  Plus,
  RefreshCw,
  Search,
  Star,
  Stethoscope,
  Trash2,
  X,
} from "lucide-react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  useAdminAuth,
} from "../../contexts/AdminAuthContext";

import AdminServicesReadinessOverview from "../../components/admin/AdminServicesReadinessOverview";

import {
  deleteService,
  getAdminServices,
} from "../../services/serviceService";

function getStatusLabel(
  status
) {
  if (
    status ===
    "published"
  ) {
    return "Published";
  }

  if (
    status ===
    "archived"
  ) {
    return "Archived";
  }

  return "Draft";
}

function getStatusClass(
  status
) {
  if (
    status ===
    "published"
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (
    status ===
    "archived"
  ) {
    return "border-slate-200 bg-slate-100 text-slate-600";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

export default function AdminServicePage() {
  const location =
    useLocation();

  const navigate =
    useNavigate();

  const {
    role,
    isAdmin,
  } = useAdminAuth();

  const [
    services,
    setServices,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    isDeleting,
    setIsDeleting,
  ] = useState(false);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("all");

  const [
    deleteTarget,
    setDeleteTarget,
  ] = useState(null);

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

  const loadServices =
    useCallback(
      async () => {
        try {
          setLoading(true);

          setErrorMessage("");

          const data =
            await getAdminServices();

          setServices(
            Array.isArray(data)
              ? data
              : []
          );
        } catch (error) {
          setServices([]);

          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Services gagal dimuat."
          );
        } finally {
          setLoading(false);
        }
      },
      []
    );

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  /* ====================================================
     LOCATION MESSAGE
  ==================================================== */

  useEffect(() => {
    const message =
      location.state
        ?.successMessage;

    if (!message) {
      return undefined;
    }

    setSuccessMessage(
      message
    );

    navigate(
      location.pathname,
      {
        replace: true,
        state: {},
      }
    );

    const timer =
      window.setTimeout(
        () => {
          setSuccessMessage(
            ""
          );
        },
        5000
      );

    return () =>
      window.clearTimeout(
        timer
      );
  }, [
    location,
    navigate,
  ]);

  /* ====================================================
     SUMMARY
  ==================================================== */

  const summary =
    useMemo(() => {
      return {
        total:
          services.length,

        published:
          services.filter(
            (item) =>
              item.status ===
              "published"
          ).length,

        draft:
          services.filter(
            (item) =>
              item.status ===
              "draft"
          ).length,

        featured:
          services.filter(
            (item) =>
              item.is_featured
          ).length,
      };
    }, [services]);

  /* ====================================================
     FILTER
  ==================================================== */

  const filteredServices =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      return services.filter(
        (service) => {
          const searchable = [
            service.name,
            service.slug,
            service.category_name,
            service.short_description,
          ]
            .map(
              (value) =>
                String(
                  value || ""
                ).toLowerCase()
            )
            .join(" ");

          const matchesSearch =
            !keyword ||
            searchable.includes(
              keyword
            );

          const matchesStatus =
            statusFilter ===
              "all" ||
            service.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      services,
      search,
      statusFilter,
    ]);

  /* ====================================================
     DELETE
  ==================================================== */

  function openDeleteModal(
    service
  ) {
    if (!isAdmin) {
      setErrorMessage(
        "Hanya Admin yang dapat menghapus Service."
      );

      return;
    }

    setDeleteTarget(
      service
    );
  }

  function closeDeleteModal() {
    if (isDeleting) {
      return;
    }

    setDeleteTarget(
      null
    );
  }

  async function handleDeleteService() {
    if (
      !deleteTarget ||
      isDeleting ||
      !isAdmin
    ) {
      return;
    }

    const target =
      deleteTarget;

    try {
      setIsDeleting(true);

      setErrorMessage("");

      const result =
        await deleteService(
          target.id
        );

      setServices(
        (current) =>
          current.filter(
            (service) =>
              service.id !==
              target.id
          )
      );

      const imageFailed =
        Boolean(
          target.image_url
        ) &&
        result?.imageDeleted ===
          false;

      setSuccessMessage(
        imageFailed
          ? `Service “${target.name}” dihapus, tetapi file gambar belum berhasil dihapus dari Storage.`
          : `Service “${target.name}” berhasil dihapus.`
      );

      setDeleteTarget(
        null
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Service gagal dihapus."
      );

      setDeleteTarget(
        null
      );
    } finally {
      setIsDeleting(false);
    }
  }

  /* ====================================================
     RENDER
  ==================================================== */

  return (
    <>
      <main className="min-h-screen bg-slate-50/70">
        <div className="mx-auto max-w-7xl p-5 md:p-8">
          {/* HEADER */}

          <section className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#FF5A0A]">
                Product & Services
              </p>

              <h1 className="mt-2 text-3xl font-bold text-[#082B3A]">
                Service Management
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
                Kelola Product & Services, fitur, konten halaman, status
                publikasi dan SEO dalam satu workspace.
              </p>
            </div>

            <Link
              to="/admin/services/create"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF5A0A] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-100 transition hover:bg-[#E94F00]"
            >
              <Plus
                size={
                  18
                }
              />
              Tambah Service
            </Link>
          </section>

          {/* ACCESS */}

          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs text-slate-400">
              Login sebagai
            </span>

            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold capitalize text-[#082B3A] shadow-sm ring-1 ring-slate-200">
              {role ||
                "user"}
            </span>
          </div>

          {/* MESSAGES */}

          {successMessage && (
            <div className="mt-5 flex items-start justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2
                  size={20}
                  className="text-emerald-600"
                />

                <p className="text-sm text-emerald-700">
                  {successMessage}
                </p>
              </div>

              <button
                onClick={() =>
                  setSuccessMessage(
                    ""
                  )
                }
                type="button"
              >
                <X
                  size={
                    17
                  }
                />
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="mt-5 flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle
                  size={20}
                  className="text-red-600"
                />

                <p className="text-sm text-red-700">
                  {errorMessage}
                </p>
              </div>

              <button
                onClick={() =>
                  setErrorMessage(
                    ""
                  )
                }
                type="button"
              >
                <X
                  size={
                    17
                  }
                />
              </button>
            </div>
          )}

          {/* SUMMARY */}

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label:
                  "Total Service",
                value:
                  summary.total,
                icon:
                  Layers3,
                className:
                  "text-[#082B3A] bg-slate-100",
              },
              {
                label:
                  "Published",
                value:
                  summary.published,
                icon:
                  Eye,
                className:
                  "text-emerald-600 bg-emerald-50",
              },
              {
                label:
                  "Draft",
                value:
                  summary.draft,
                icon:
                  FileEdit,
                className:
                  "text-amber-600 bg-amber-50",
              },
              {
                label:
                  "Featured",
                value:
                  summary.featured,
                icon:
                  Star,
                className:
                  "text-[#FF5A0A] bg-orange-50",
              },
            ].map(
              (item) => {
                const Icon =
                  item.icon;

                return (
                  <div
                    key={
                      item.label
                    }
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.className}`}
                    >
                      <Icon
                        size={
                          19
                        }
                      />
                    </div>

                    <p className="mt-4 text-3xl font-bold text-[#082B3A]">
                      {
                        item.value
                      }
                    </p>

                    <p className="mt-1 text-xs font-medium text-slate-500">
                      {
                        item.label
                      }
                    </p>
                  </div>
                );
              }
            )}
          </div>

          {/* READINESS */}

          {!loading &&
            services.length >
              0 && (
              <div className="mt-6">
                <AdminServicesReadinessOverview
                  services={
                    services
                  }
                />
              </div>
            )}

          {/* FILTER */}

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid gap-3 md:grid-cols-[1fr_200px_auto]">
              <div className="relative">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="search"
                  value={
                    search
                  }
                  onChange={(
                    event
                  ) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Cari Service..."
                  className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-[#FF5A0A]"
                />
              </div>

              <select
                value={
                  statusFilter
                }
                onChange={(
                  event
                ) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
              >
                <option value="all">
                  Semua Status
                </option>

                <option value="published">
                  Published
                </option>

                <option value="draft">
                  Draft
                </option>

                <option value="archived">
                  Archived
                </option>
              </select>

              <button
                type="button"
                onClick={
                  loadServices
                }
                disabled={
                  loading
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600"
              >
                <RefreshCw
                  size={
                    17
                  }
                  className={
                    loading
                      ? "animate-spin"
                      : ""
                  }
                />
                Refresh
              </button>
            </div>
          </section>

          {/* LIST */}

          <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
              <h2 className="font-bold text-[#082B3A]">
                Daftar Services
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {
                  filteredServices.length
                }{" "}
                dari{" "}
                {
                  services.length
                }{" "}
                Service
              </p>
            </div>

            {loading ? (
              <div className="flex min-h-72 items-center justify-center">
                <LoaderCircle
                  size={36}
                  className="animate-spin text-[#FF5A0A]"
                />
              </div>
            ) : filteredServices.length ===
              0 ? (
              <div className="px-6 py-16 text-center">
                <Stethoscope
                  size={40}
                  className="mx-auto text-slate-300"
                />

                <h3 className="mt-4 font-bold text-[#082B3A]">
                  Service tidak ditemukan
                </h3>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredServices.map(
                  (
                    service
                  ) => (
                    <article
                      key={
                        service.id
                      }
                      className="p-5 transition hover:bg-slate-50/70 md:p-6"
                    >
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                        {/* IMAGE */}

                        <div className="flex h-24 w-full shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 lg:w-36">
                          {service.image_url ? (
                            <img
                              src={
                                service.image_url
                              }
                              alt={
                                service.name
                              }
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageIcon
                              size={
                                28
                              }
                              className="text-slate-300"
                            />
                          )}
                        </div>

                        {/* INFO */}

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${getStatusClass(
                                service.status
                              )}`}
                            >
                              {getStatusLabel(
                                service.status
                              )}
                            </span>

                            {service.is_featured && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold text-[#FF5A0A]">
                                <Star
                                  size={
                                    11
                                  }
                                  fill="currentColor"
                                />
                                Featured
                              </span>
                            )}

                            {service.category_name && (
                              <span className="text-xs text-slate-400">
                                {
                                  service.category_name
                                }
                              </span>
                            )}
                          </div>

                          <h3 className="mt-2 text-lg font-bold text-[#082B3A]">
                            {
                              service.name
                            }
                          </h3>

                          <p className="mt-1 text-xs text-slate-400">
                            /services/
                            {
                              service.slug
                            }
                          </p>

                          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
                            {service.short_description ||
                              "Deskripsi singkat belum tersedia."}
                          </p>
                        </div>

                        {/* ACTION */}

                        <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">
                          <Link
                            to={`/admin/services/edit/${service.id}`}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#082B3A] px-4 py-2.5 text-xs font-bold text-white"
                          >
                            <FileEdit
                              size={
                                15
                              }
                            />
                            Kelola
                          </Link>

                          <Link
                            to={`/admin/services/preview/${service.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600"
                          >
                            <Eye
                              size={
                                15
                              }
                            />
                            Preview
                          </Link>

                          {service.status ===
                            "published" &&
                            service.slug && (
                              <Link
                                to={`/services/${service.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-700"
                              >
                                <ArrowUpRight
                                  size={
                                    15
                                  }
                                />
                                Live
                              </Link>
                            )}

                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() =>
                                openDeleteModal(
                                  service
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-xs font-bold text-red-600"
                            >
                              <Trash2
                                size={
                                  15
                                }
                              />
                              Hapus
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  )
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* DELETE MODAL */}

      {deleteTarget && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onMouseDown={(
            event
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeDeleteModal();
            }
          }}
        >
          <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Trash2
                size={26}
              />
            </div>

            <h2 className="mt-5 text-2xl font-bold text-[#082B3A]">
              Hapus Service?
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-500">
              Service{" "}
              <strong className="text-[#082B3A]">
                {
                  deleteTarget.name
                }
              </strong>{" "}
              akan dihapus permanen.
            </p>

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={
                  closeDeleteModal
                }
                disabled={
                  isDeleting
                }
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={
                  handleDeleteService
                }
                disabled={
                  isDeleting
                }
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white"
              >
                {isDeleting ? (
                  <LoaderCircle
                    size={
                      17
                    }
                    className="animate-spin"
                  />
                ) : (
                  <Trash2
                    size={
                      17
                    }
                  />
                )}

                {isDeleting
                  ? "Menghapus..."
                  : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}