import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AlertTriangle,
  BriefcaseBusiness,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";

import { getPublishedPortfolios } from "../services/portfolioService";

export default function FeaturedPortfolioSection() {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadPortfolios = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const data = await getPublishedPortfolios();

      setPortfolios(data);
    } catch (error) {
      console.error(
        "Gagal mengambil portfolio homepage:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Portfolio gagal dimuat."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPortfolios();
  }, [loadPortfolios]);

  /*
   * Prioritas:
   * 1. Portfolio berstatus published dan featured.
   * 2. Jika featured kurang dari 3, ambil portfolio published lainnya.
   * 3. Maksimal 3 portfolio di homepage.
   */
  const selectedPortfolios = useMemo(() => {
    const featured = portfolios.filter(
      (portfolio) => portfolio.is_featured
    );

    const regular = portfolios.filter(
      (portfolio) => !portfolio.is_featured
    );

    return [...featured, ...regular].slice(0, 3);
  }, [portfolios]);

  return (
    <section className="container-jmt py-16 md:py-20">
      {/* Header section */}
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange">
            Selected Portfolio
          </p>

          <h2 className="mt-4 max-w-4xl text-3xl font-bold leading-tight text-navy md:text-4xl lg:text-5xl">
            Proyek yang memberi dampak nyata
          </h2>
        </div>

        <Link
          to="/portfolio"
          className="inline-flex items-center gap-2 text-sm font-semibold text-orange transition hover:opacity-70"
        >
          View All Projects
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      {/* Loading */}
      {loading && (
        <div className="mt-10 flex min-h-[320px] items-center justify-center rounded-3xl border bg-slate-50">
          <div className="text-center">
            <LoaderCircle
              size={40}
              className="mx-auto animate-spin text-orange"
            />

            <p className="mt-4 font-semibold text-navy">
              Memuat portfolio
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Data sedang diambil dari Supabase.
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {!loading && errorMessage && (
        <div className="mt-10 rounded-3xl border border-red-200 bg-red-50 px-6 py-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
            <AlertTriangle size={26} />
          </div>

          <h3 className="mt-5 text-xl font-bold text-navy">
            Portfolio gagal dimuat
          </h3>

          <p className="mt-3 text-sm leading-6 text-red-600">
            {errorMessage}
          </p>

          <button
            type="button"
            onClick={loadPortfolios}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <RefreshCw size={17} />
            Coba Lagi
          </button>
        </div>
      )}

      {/* Data kosong */}
      {!loading &&
        !errorMessage &&
        selectedPortfolios.length === 0 && (
          <div className="mt-10 rounded-3xl border bg-slate-50 px-6 py-14 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
              <BriefcaseBusiness size={29} />
            </div>

            <h3 className="mt-5 text-xl font-bold text-navy">
              Belum ada portfolio
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Belum ada portfolio berstatus published yang dapat
              ditampilkan di halaman utama.
            </p>
          </div>
        )}

      {/* Daftar portfolio */}
      {!loading &&
        !errorMessage &&
        selectedPortfolios.length > 0 && (
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {selectedPortfolios.map((portfolio) => (
              <Link
                key={portfolio.id}
                to={`/portfolio/${portfolio.slug}`}
                className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <article>
                  {/* Gambar */}
                  {portfolio.image_url ? (
                    <div className="overflow-hidden bg-slate-100">
                      <img
                        src={portfolio.image_url}
                        alt={portfolio.title}
                        className="h-64 w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="flex h-64 items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-400">
                      <BriefcaseBusiness
                        size={76}
                        strokeWidth={1.2}
                        className="text-white/90 transition duration-500 group-hover:scale-110"
                      />
                    </div>
                  )}

                  {/* Isi card */}
                  <div className="p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-orange">
                        {portfolio.category || "Portfolio"}
                      </span>

                      {portfolio.is_featured && (
                        <span className="rounded-full bg-orange/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-orange">
                          Featured
                        </span>
                      )}
                    </div>

                    <h3 className="mt-3 text-xl font-semibold text-navy transition group-hover:text-orange">
                      {portfolio.title}
                    </h3>

                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
                      {portfolio.short_description ||
                        "Informasi singkat portfolio belum tersedia."}
                    </p>

                    <div className="mt-6 flex items-center justify-between gap-4">
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-orange">
                        View Project

                        <span
                          aria-hidden="true"
                          className="transition-transform group-hover:translate-x-1"
                        >
                          →
                        </span>
                      </span>

                      {portfolio.project_year && (
                        <span className="text-xs text-slate-400">
                          {portfolio.project_year}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
    </section>
  );
}