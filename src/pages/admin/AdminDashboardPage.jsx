import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AlertTriangle,
  BriefcaseBusiness,
  FileText,
  LoaderCircle,
  RefreshCw,
  Star,
} from "lucide-react";
import { Link } from "react-router-dom";

import { getAdminPortfolios } from "../../services/portfolioService";

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

export default function AdminDashboardPage() {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const data = await getAdminPortfolios();

      setPortfolios(data);
    } catch (error) {
      console.error(
        "Gagal mengambil data dashboard:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Data dashboard gagal dimuat."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const statistics = useMemo(() => {
    const totalPortfolio = portfolios.length;

    const totalPublished = portfolios.filter(
      (portfolio) =>
        String(portfolio.status).toLowerCase() ===
        "published"
    ).length;

    const totalDraft = portfolios.filter(
      (portfolio) =>
        String(portfolio.status).toLowerCase() === "draft"
    ).length;

    const totalFeatured = portfolios.filter(
      (portfolio) =>
        Boolean(portfolio.is_featured)
    ).length;

    return [
      {
        label: "Total Portfolio",
        value: totalPortfolio,
        description: "Seluruh project yang tersimpan",
        icon: BriefcaseBusiness,
      },
      {
        label: "Published",
        value: totalPublished,
        description: "Portfolio tampil di website",
        icon: FileText,
      },
      {
        label: "Draft",
        value: totalDraft,
        description: "Portfolio belum dipublikasikan",
        icon: FileText,
      },
      {
        label: "Featured",
        value: totalFeatured,
        description: "Portfolio yang diunggulkan",
        icon: Star,
      },
    ];
  }, [portfolios]);

  const latestPortfolios = useMemo(() => {
    return portfolios.slice(0, 5);
  }, [portfolios]);

  return (
    <main className="p-5 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-[#FF5A0A]">
              Overview
            </p>

            <h1 className="mt-2 text-3xl font-bold text-[#082B3A]">
              Dashboard
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Ringkasan pengelolaan konten website Jasa
              Medika Transmedic.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadDashboardData}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#082B3A] transition hover:border-[#FF5A0A] hover:text-[#FF5A0A] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />

              Refresh
            </button>

            <Link
              to="/admin/portfolio/create"
              className="inline-flex items-center gap-2 rounded-xl bg-[#FF5A0A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#E94F00]"
            >
              + Tambah Portfolio
            </Link>
          </div>
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
            <AlertTriangle
              size={21}
              className="mt-0.5 shrink-0 text-red-600"
            />

            <div>
              <p className="font-semibold text-red-700">
                Data dashboard gagal dimuat
              </p>

              <p className="mt-1 text-sm leading-6 text-red-600">
                {errorMessage}
              </p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <section className="mt-8 flex min-h-[400px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <div className="text-center">
              <LoaderCircle
                size={42}
                className="mx-auto animate-spin text-[#FF5A0A]"
              />

              <p className="mt-4 font-semibold text-[#082B3A]">
                Memuat dashboard
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Data sedang diambil dari Supabase.
              </p>
            </div>
          </section>
        ) : (
          <>
            {/* Statistik */}
            <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {statistics.map((item) => {
                const Icon = item.icon;

                return (
                  <article
                    key={item.label}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-500">
                          {item.label}
                        </p>

                        <p className="mt-3 text-4xl font-bold text-[#082B3A]">
                          {item.value}
                        </p>
                      </div>

                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-[#FF5A0A]">
                        <Icon size={21} />
                      </div>
                    </div>

                    <p className="mt-4 text-xs leading-5 text-slate-400">
                      {item.description}
                    </p>
                  </article>
                );
              })}
            </section>

            {/* Portfolio terbaru */}
            <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-6 py-5">
                <div>
                  <h2 className="text-xl font-bold text-[#082B3A]">
                    Portfolio Terbaru
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Data portfolio terbaru dari Supabase.
                  </p>
                </div>

                <Link
                  to="/admin/portfolio"
                  className="text-sm font-semibold text-[#FF5A0A] transition hover:text-[#E94F00]"
                >
                  Lihat Semua →
                </Link>
              </div>

              {latestPortfolios.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <BriefcaseBusiness size={29} />
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-[#082B3A]">
                    Belum ada portfolio
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Belum ada data portfolio yang tersimpan
                    di Supabase.
                  </p>

                  <Link
                    to="/admin/portfolio/create"
                    className="mt-6 inline-flex rounded-xl bg-[#FF5A0A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#E94F00]"
                  >
                    Tambah Portfolio Pertama
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[750px]">
                    <thead className="bg-slate-50">
                      <tr className="text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                        <th className="px-6 py-4">Judul</th>
                        <th className="px-6 py-4">
                          Kategori
                        </th>
                        <th className="px-6 py-4">Tahun</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">
                          Aksi
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {latestPortfolios.map(
                        (portfolio) => (
                          <tr
                            key={portfolio.id}
                            className="transition hover:bg-slate-50"
                          >
                            <td className="px-6 py-5">
                              <p className="font-semibold text-[#082B3A]">
                                {portfolio.title}
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                /portfolio/{portfolio.slug}
                              </p>
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

                            <td className="px-6 py-5 text-right">
                              <Link
                                to={`/admin/portfolio/edit/${portfolio.id}`}
                                className="inline-flex rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-[#082B3A] transition hover:border-[#FF5A0A] hover:text-[#FF5A0A]"
                              >
                                Edit
                              </Link>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}