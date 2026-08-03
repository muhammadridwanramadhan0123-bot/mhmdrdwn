import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AlertTriangle,
  ImageIcon,
  LoaderCircle,
  Pencil,
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

import { useAdminAuth } from "../../contexts/AdminAuthContext";
import {
  deleteService,
  getAdminServices,
} from "../../services/serviceService";

function getStatusStyle(status) {
  switch (status) {
    case "published":
      return "bg-green-100 text-green-700";

    case "archived":
      return "bg-slate-200 text-slate-700";

    default:
      return "bg-amber-100 text-amber-700";
  }
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

export default function AdminServicePage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { role, isAdmin } = useAdminAuth();

  const [services, setServices] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [isDeleting, setIsDeleting] =
    useState(false);

  const [search, setSearch] =
    useState("");

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

  const loadServices = useCallback(
    async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const data =
          await getAdminServices();

        setServices(data);
      } catch (error) {
        console.error(
          "Daftar Services gagal dimuat:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Daftar Services gagal dimuat."
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

  useEffect(() => {
    const message =
      location.state?.successMessage;

    if (!message) return undefined;

    setSuccessMessage(message);

    navigate(location.pathname, {
      replace: true,
      state: {},
    });

    const timeout =
      window.setTimeout(() => {
        setSuccessMessage("");
      }, 5000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [
    location.pathname,
    location.state,
    navigate,
  ]);

  const filteredServices =
    useMemo(() => {
      const normalizedSearch =
        search.trim().toLowerCase();

      return services.filter(
        (service) => {
          const searchableText = [
            service.name,
            service.slug,
            service.category_name,
            service.short_description,
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

  function openDeleteModal(service) {
    if (!isAdmin) {
      setErrorMessage(
        "Hanya administrator yang dapat menghapus Service."
      );
      return;
    }

    setDeleteTarget(service);
  }

  function closeDeleteModal() {
    if (isDeleting) return;

    setDeleteTarget(null);
  }

  async function handleDeleteService() {
    if (
      !deleteTarget ||
      isDeleting ||
      !isAdmin
    ) {
      return;
    }

    const serviceToDelete =
      deleteTarget;

    try {
      setIsDeleting(true);
      setErrorMessage("");
      setSuccessMessage("");

      const result =
        await deleteService(
          serviceToDelete.id
        );

      setServices(
        (currentServices) =>
          currentServices.filter(
            (service) =>
              service.id !==
              serviceToDelete.id
          )
      );

      const hasImage =
        Boolean(
          result?.deletedService
            ?.image_url
        ) ||
        Boolean(
          serviceToDelete.image_url
        );

      const imageDeleteFailed =
        hasImage &&
        result?.imageDeleted === false;

      setSuccessMessage(
        imageDeleteFailed
          ? `Service “${serviceToDelete.name}” berhasil dihapus dari database, tetapi file gambar belum berhasil dihapus dari Storage.`
          : `Service “${serviceToDelete.name}” berhasil dihapus.`
      );

      setDeleteTarget(null);

      window.setTimeout(() => {
        setSuccessMessage("");
      }, 6000);
    } catch (error) {
      console.error(
        "Gagal menghapus Service:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Service gagal dihapus."
      );

      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-[#FF5A0A]">
                Content Management
              </p>

              <h1 className="mt-2 text-3xl font-bold text-[#082B3A]">
                Kelola Services
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Kelola produk dan layanan Jasa
                Medika Transmedic.
              </p>
            </div>

            <Link
              to="/admin/services/create"
              className="inline-flex items-center gap-2 rounded-xl bg-[#FF5A0A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#E94F00]"
            >
              <Plus size={18} />
              Tambah Service
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="text-xs text-slate-500">
              Akses:
            </span>

            <span className="rounded-full bg-slate-200 px-3 py-1.5 text-xs font-semibold capitalize text-[#082B3A]">
              {role || "Memuat role"}
            </span>

            {role === "editor" && (
              <span className="text-xs text-slate-400">
                Editor dapat menambah dan
                mengedit, tetapi tidak dapat
                menghapus Service.
              </span>
            )}
          </div>

          {successMessage && (
            <div
              role="status"
              className="mt-6 flex items-start justify-between gap-4 rounded-2xl border border-green-200 bg-green-50 px-5 py-4"
            >
              <div>
                <p className="font-semibold text-green-700">
                  Berhasil
                </p>

                <p className="mt-1 text-sm text-green-600">
                  {successMessage}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSuccessMessage("")
                }
                className="text-green-600"
                aria-label="Tutup pesan sukses"
              >
                <X size={19} />
              </button>
            </div>
          )}

          {errorMessage && (
            <div
              role="alert"
              className="mt-6 flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle
                  size={21}
                  className="mt-0.5 shrink-0 text-red-600"
                />

                <div>
                  <p className="font-semibold text-red-700">
                    Terjadi kesalahan
                  </p>

                  <p className="mt-1 text-sm leading-6 text-red-600">
                    {errorMessage}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setErrorMessage("")
                }
                className="text-red-600"
                aria-label="Tutup pesan error"
              >
                <X size={19} />
              </button>
            </div>
          )}

          <section className="mt-8 grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_220px_auto]">
            <div className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <label
                htmlFor="service-search"
                className="sr-only"
              >
                Cari Service
              </label>

              <input
                id="service-search"
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Cari nama, kategori, slug, atau deskripsi..."
                className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div>
              <label
                htmlFor="service-status-filter"
                className="sr-only"
              >
                Filter status
              </label>

              <select
                id="service-status-filter"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#FF5A0A]"
              >
                <option value="all">
                  Semua status
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
            </div>

            <button
              type="button"
              onClick={loadServices}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-[#082B3A] transition hover:border-[#FF5A0A] hover:text-[#FF5A0A] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>
          </section>

          <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {loading ? (
              <div className="flex min-h-80 items-center justify-center">
                <div className="text-center">
                  <LoaderCircle
                    size={42}
                    className="mx-auto animate-spin text-[#FF5A0A]"
                  />

                  <p className="mt-4 font-semibold text-[#082B3A]">
                    Memuat Services
                  </p>
                </div>
              </div>
            ) : filteredServices.length ===
              0 ? (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <Stethoscope
                    size={29}
                  />
                </div>

                <h2 className="mt-5 text-xl font-bold text-[#082B3A]">
                  Service tidak ditemukan
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  {services.length === 0
                    ? "Belum ada Service di database."
                    : "Tidak ada Service yang sesuai dengan pencarian atau filter."}
                </p>

                {services.length === 0 && (
                  <Link
                    to="/admin/services/create"
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#FF5A0A] px-5 py-3 text-sm font-semibold text-white"
                  >
                    <Plus size={17} />
                    Tambah Service Pertama
                  </Link>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1150px]">
                  <thead className="bg-slate-50">
                    <tr className="text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      <th className="px-6 py-4">
                        Service
                      </th>

                      <th className="px-6 py-4">
                        Kategori
                      </th>

                      <th className="px-6 py-4">
                        Urutan
                      </th>

                      <th className="px-6 py-4">
                        Status
                      </th>

                      <th className="px-6 py-4">
                        Featured
                      </th>

                      <th className="px-6 py-4 text-right">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredServices.map(
                      (service) => (
                        <tr
                          key={service.id}
                          className="transition hover:bg-slate-50"
                        >
                          <td className="px-6 py-5">
                            <div className="flex min-w-72 items-center gap-4">
                              {service.image_url ? (
                                <img
                                  src={
                                    service.image_url
                                  }
                                  alt={
                                    service.name
                                  }
                                  className="h-16 w-24 shrink-0 rounded-xl border object-cover"
                                />
                              ) : (
                                <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                                  <ImageIcon
                                    size={24}
                                  />
                                </div>
                              )}

                              <div className="min-w-0">
                                <p className="font-semibold text-[#082B3A]">
                                  {
                                    service.name
                                  }
                                </p>

                                <p className="mt-1 max-w-72 truncate text-xs text-slate-400">
                                  /services/
                                  {
                                    service.slug
                                  }
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-5 text-sm text-slate-600">
                            {service.category_name ||
                              "-"}
                          </td>

                          <td className="px-6 py-5 text-sm text-slate-600">
                            {service.display_order ??
                              0}
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusStyle(
                                service.status
                              )}`}
                            >
                              {getStatusLabel(
                                service.status
                              )}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            {service.is_featured ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600">
                                <Star
                                  size={16}
                                  fill="currentColor"
                                />
                                Featured
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400">
                                Tidak
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex justify-end gap-2">
                              <Link
                                to={`/admin/services/edit/${service.id}`}
                                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-semibold text-[#082B3A] transition hover:border-[#FF5A0A] hover:text-[#FF5A0A]"
                              >
                                <Pencil
                                  size={15}
                                />
                                Edit
                              </Link>

                              {isAdmin && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    openDeleteModal(
                                      service
                                    )
                                  }
                                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                                >
                                  <Trash2
                                    size={15}
                                  />
                                  Hapus
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {!loading &&
              services.length > 0 && (
                <div className="border-t border-slate-100 px-6 py-4">
                  <p className="text-xs text-slate-500">
                    Menampilkan{" "}
                    <span className="font-semibold text-[#082B3A]">
                      {
                        filteredServices.length
                      }
                    </span>{" "}
                    dari{" "}
                    <span className="font-semibold text-[#082B3A]">
                      {services.length}
                    </span>{" "}
                    Service.
                  </p>
                </div>
              )}
          </section>
        </div>
      </main>

      {deleteTarget && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-service-title"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeDeleteModal();
            }
          }}
        >
          <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <Trash2 size={27} />
            </div>

            <h2
              id="delete-service-title"
              className="mt-5 text-2xl font-bold text-[#082B3A]"
            >
              Hapus Service?
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-500">
              Service{" "}
              <span className="font-semibold text-[#082B3A]">
                “{deleteTarget.name}”
              </span>{" "}
              akan dihapus dari database.
              Tindakan ini tidak dapat
              dibatalkan.
            </p>

            {deleteTarget.image_url && (
              <p className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500">
                File gambar Service juga akan
                dihapus dari Supabase Storage.
              </p>
            )}

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={isDeleting}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleDeleteService}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? (
                  <>
                    <LoaderCircle
                      size={17}
                      className="animate-spin"
                    />
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 size={17} />
                    Ya, Hapus
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}