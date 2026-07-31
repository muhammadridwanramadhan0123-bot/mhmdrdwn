import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AlertTriangle,
  BriefcaseBusiness,
  ImageIcon,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  Star,
  Trash2,
  X,
} from "lucide-react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { supabase } from "../../lib/supabase";
import {
  deletePortfolio,
  getAdminPortfolios,
} from "../../services/portfolioService";

import { useAdminAuth } from "../../contexts/AdminAuthContext";

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

export default function AdminPortfolioPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
  role: currentRole,
  isAdmin,
} = useAdminAuth();

  const [portfolios, setPortfolios] = useState([]);

  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [deleteTarget, setDeleteTarget] = useState(null);

 
  /*
   * Mengambil semua portfolio dari Supabase.
   */
  const loadPortfolios = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const data = await getAdminPortfolios();

      setPortfolios(data);
    } catch (error) {
      console.error(
        "Gagal mengambil daftar portfolio:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Daftar portfolio gagal dimuat."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /*
   * Mengambil role user yang sedang login.
   * Backend memakai profiles.id = auth.users.id.
   */

  useEffect(() => {
  loadPortfolios();
}, [loadPortfolios]);

  /*
   * Menampilkan pesan sukses yang dikirim dari halaman tambah/edit.
   */
  useEffect(() => {
    const message = location.state?.successMessage;

    if (!message) return;

    setSuccessMessage(message);

    /*
     * Membersihkan state route agar pesan tidak muncul kembali
     * ketika halaman di-refresh.
     */
    navigate(location.pathname, {
      replace: true,
      state: {},
    });

    const timeout = window.setTimeout(() => {
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

  /*
   * Pencarian dan filter dilakukan dari data Supabase
   * yang sudah tersimpan di state.
   */
  const filteredPortfolios = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    return portfolios.filter((portfolio) => {
      const searchableText = [
        portfolio.title,
        portfolio.slug,
        portfolio.category,
        portfolio.client_name,
      ]
        .map((value) =>
          String(value || "").toLowerCase()
        )
        .join(" ");

      const matchesSearch =
        !normalizedSearch ||
        searchableText.includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" ||
        portfolio.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [portfolios, search, statusFilter]);

  function openDeleteModal(portfolio) {
    if (!isAdmin) {
      setErrorMessage(
        "Hanya administrator yang dapat menghapus portfolio."
      );

      return;
    }

    setDeleteTarget(portfolio);
  }

  function closeDeleteModal() {
    if (isDeleting) return;

    setDeleteTarget(null);
  }

  async function handleDeletePortfolio() {
  if (!deleteTarget || isDeleting || !isAdmin) {
    return;
  }

  const portfolioToDelete = deleteTarget;

  try {
    setIsDeleting(true);
    setErrorMessage("");
    setSuccessMessage("");

    const result = await deletePortfolio(
      portfolioToDelete.id
    );

    // Menghapus data dari tampilan tanpa refresh browser.
    setPortfolios((currentPortfolios) =>
      currentPortfolios.filter(
        (portfolio) =>
          portfolio.id !== portfolioToDelete.id
      )
    );

    const hasImage =
      Boolean(result?.deletedPortfolio?.image_url) ||
      Boolean(portfolioToDelete.image_url);

    const imageDeleteFailed =
      hasImage && result?.imageDeleted === false;

    setSuccessMessage(
      imageDeleteFailed
        ? `Portfolio “${portfolioToDelete.title}” berhasil dihapus dari database, tetapi file gambarnya belum berhasil dihapus dari Storage.`
        : `Portfolio “${portfolioToDelete.title}” berhasil dihapus.`
    );

    setDeleteTarget(null);

    window.setTimeout(() => {
      setSuccessMessage("");
    }, 6000);
  } catch (error) {
    console.error(
      "Gagal menghapus portfolio:",
      error
    );

    setErrorMessage(
      error instanceof Error
        ? error.message
        : "Portfolio gagal dihapus."
    );

    // Modal ditutup setelah terjadi error.
    setDeleteTarget(null);
  } finally {
    setIsDeleting(false);
  }
}

  return (
    <>
      <main className="p-5 md:p-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-[#FF5A0A]">
                Admin Dashboard
              </p>

              <h1 className="mt-2 text-3xl font-bold text-[#082B3A]">
                Kelola Portfolio
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Tambah, edit, publikasikan, dan kelola
                portfolio Jasa Medika Transmedic.
              </p>
            </div>

            <Link
              to="/admin/portfolio/create"
              className="inline-flex items-center gap-2 rounded-xl bg-[#FF5A0A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#E94F00]"
            >
              <Plus size={18} />
              Tambah Portfolio
            </Link>
          </div>

          {/* Informasi role */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="text-xs font-medium text-slate-500">
              Akses saat ini:
            </span>

            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
                isAdmin
                  ? "bg-orange-100 text-[#E94F00]"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              <ShieldAlert size={14} />
              {currentRole || "Memeriksa role"}
            </span>

            {currentRole === "editor" && (
              <span className="text-xs text-slate-400">
                Editor dapat menambah dan mengedit,
                tetapi tidak dapat menghapus portfolio.
              </span>
            )}
          </div>

          {/* Pesan sukses */}
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
                onClick={() => setSuccessMessage("")}
                className="text-green-600 transition hover:text-green-800"
                aria-label="Tutup pesan sukses"
              >
                <X size={19} />
              </button>
            </div>
          )}

          {/* Pesan error */}
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
                onClick={() => setErrorMessage("")}
                className="text-red-600 transition hover:text-red-800"
                aria-label="Tutup pesan error"
              >
                <X size={19} />
              </button>
            </div>
          )}

          {/* Pencarian dan filter */}
          <section className="mt-8 grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_220px_auto]">
            <div className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <label
                htmlFor="portfolio-search"
                className="sr-only"
              >
                Cari portfolio
              </label>

              <input
                id="portfolio-search"
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Cari judul, kategori, slug, atau klien..."
                className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div>
              <label
                htmlFor="portfolio-status"
                className="sr-only"
              >
                Filter status
              </label>

              <select
                id="portfolio-status"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
              >
                <option value="all">
                  Semua status
                </option>

                <option value="published">
                  Published
                </option>

                <option value="draft">Draft</option>

                <option value="archived">
                  Archived
                </option>
              </select>
            </div>

            <button
              type="button"
              onClick={loadPortfolios}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-[#082B3A] transition hover:border-[#FF5A0A] hover:text-[#FF5A0A] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />

              Refresh
            </button>
          </section>

          {/* Tabel */}
          <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {loading ? (
              <div className="flex min-h-[340px] items-center justify-center p-8">
                <div className="text-center">
                  <LoaderCircle
                    size={42}
                    className="mx-auto animate-spin text-[#FF5A0A]"
                  />

                  <p className="mt-4 font-semibold text-[#082B3A]">
                    Memuat portfolio
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    Data sedang diambil dari Supabase.
                  </p>
                </div>
              </div>
            ) : filteredPortfolios.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <BriefcaseBusiness size={29} />
                </div>

                <h2 className="mt-5 text-xl font-bold text-[#082B3A]">
                  Portfolio tidak ditemukan
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  {portfolios.length === 0
                    ? "Belum ada data portfolio di database."
                    : "Tidak ada portfolio yang sesuai dengan pencarian atau filter."}
                </p>

                {portfolios.length === 0 && (
                  <Link
                    to="/admin/portfolio/create"
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#FF5A0A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#E94F00]"
                  >
                    <Plus size={17} />
                    Tambah Portfolio Pertama
                  </Link>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px]">
                  <thead className="bg-slate-50">
                    <tr className="text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      <th className="px-6 py-4">
                        Portfolio
                      </th>

                      <th className="px-6 py-4">
                        Kategori
                      </th>

                      <th className="px-6 py-4">
                        Tahun
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
                    {filteredPortfolios.map(
                      (portfolio) => (
                        <tr
                          key={portfolio.id}
                          className="transition hover:bg-slate-50"
                        >
                          <td className="px-6 py-5">
                            <div className="flex min-w-[280px] items-center gap-4">
                              {portfolio.image_url ? (
                                <img
                                  src={portfolio.image_url}
                                  alt={portfolio.title}
                                  className="h-14 w-20 shrink-0 rounded-xl border border-slate-200 object-cover"
                                />
                              ) : (
                                <div className="flex h-14 w-20 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-400">
                                  <ImageIcon size={23} />
                                </div>
                              )}

                              <div className="min-w-0">
                                <p className="font-semibold text-[#082B3A]">
                                  {portfolio.title}
                                </p>

                                <p className="mt-1 max-w-[300px] truncate text-xs text-slate-400">
                                  /portfolio/{portfolio.slug}
                                </p>

                                {portfolio.client_name && (
                                  <p className="mt-1 text-xs text-slate-500">
                                    Klien:{" "}
                                    {portfolio.client_name}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-5 text-sm text-slate-600">
                            {portfolio.category || "-"}
                          </td>

                          <td className="px-6 py-5 text-sm text-slate-600">
                            {portfolio.project_year || "-"}
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusStyle(
                                portfolio.status
                              )}`}
                            >
                              {getStatusLabel(
                                portfolio.status
                              )}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            {portfolio.is_featured ? (
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
                                to={`/admin/portfolio/edit/${portfolio.id}`}
                                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-xs font-semibold text-[#082B3A] transition hover:border-[#FF5A0A] hover:text-[#FF5A0A]"
                              >
                                <Pencil size={15} />
                                Edit
                              </Link>

                              {isAdmin && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    openDeleteModal(
                                      portfolio
                                    )
                                  }
                                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                                >
                                  <Trash2 size={15} />
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

            {!loading && portfolios.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-6 py-4">
                <p className="text-xs text-slate-500">
                  Menampilkan{" "}
                  <span className="font-semibold text-[#082B3A]">
                    {filteredPortfolios.length}
                  </span>{" "}
                  dari{" "}
                  <span className="font-semibold text-[#082B3A]">
                    {portfolios.length}
                  </span>{" "}
                  portfolio.
                </p>

                {currentRole === "editor" && (
                  <p className="text-xs text-slate-400">
                    Tombol hapus hanya tersedia untuk
                    administrator.
                  </p>
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Modal konfirmasi hapus */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-portfolio-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDeleteModal();
            }
          }}
        >
          <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <Trash2 size={27} />
            </div>

            <h2
              id="delete-portfolio-title"
              className="mt-5 text-2xl font-bold text-[#082B3A]"
            >
              Hapus Portfolio?
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-500">
              Portfolio{" "}
              <span className="font-semibold text-[#082B3A]">
                “{deleteTarget.title}”
              </span>{" "}
              akan dihapus dari database. Tindakan ini
              tidak dapat dibatalkan.
            </p>
            {deleteTarget.image_url && (
              <p className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500">
              File gambar portfolio juga akan dihapus dari
               Supabase Storage.
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
                onClick={handleDeletePortfolio}
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