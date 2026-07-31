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

import { CTA, PageHero } from "../components/Common";
import { getPublishedPortfolios } from "../services/portfolioService";

export default function PortfolioPage() {
  const [portfolios, setPortfolios] = useState([]);
  const [activeCategory, setActiveCategory] =
    useState("All");

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] =
    useState("");

  const loadPortfolios = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const data = await getPublishedPortfolios();

      setPortfolios(data);
    } catch (error) {
      console.error(
        "Gagal mengambil portfolio publik:",
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

  const categories = useMemo(() => {
    const availableCategories = portfolios
      .map((portfolio) => portfolio.category)
      .filter(Boolean);

    return [
      "All",
      ...new Set(availableCategories),
    ];
  }, [portfolios]);

  const shownPortfolios = useMemo(() => {
    if (activeCategory === "All") {
      return portfolios;
    }

    return portfolios.filter(
      (portfolio) =>
        portfolio.category === activeCategory
    );
  }, [activeCategory, portfolios]);

  return (
    <>
      <PageHero
        eyebrow="Portfolio"
        title="Our Portfolio"
        description="Explore our successful projects across healthcare, government, education, sports, tourism, and research."
      />

      <section className="container-jmt py-14">
        {/* Filter kategori */}
        {!loading && portfolios.length > 0 && (
          <div className="mb-10 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() =>
                  setActiveCategory(category)
                }
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                  activeCategory === category
                    ? "bg-orange text-white"
                    : "border bg-white text-slate-500 hover:border-orange hover:text-orange"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex min-h-[360px] items-center justify-center">
            <div className="text-center">
              <LoaderCircle
                size={42}
                className="mx-auto animate-spin text-orange"
              />

              <h2 className="mt-5 text-xl font-bold text-navy">
                Memuat portfolio
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Data sedang diambil dari database.
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && errorMessage && (
          <div className="mx-auto max-w-xl rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertTriangle size={26} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-navy">
              Portfolio gagal dimuat
            </h2>

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
          portfolios.length === 0 && (
            <div className="mx-auto max-w-xl rounded-3xl border bg-slate-50 p-10 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
                <BriefcaseBusiness size={29} />
              </div>

              <h2 className="mt-5 text-xl font-bold text-navy">
                Belum ada portfolio
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Belum ada portfolio berstatus published
                yang dapat ditampilkan.
              </p>
            </div>
          )}

        {/* Daftar portfolio */}
        {!loading &&
          !errorMessage &&
          shownPortfolios.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {shownPortfolios.map((portfolio) => (
                <Link
                  key={portfolio.id}
                  to={`/portfolio/${portfolio.slug}`}
                  className="group block overflow-hidden rounded-2xl border bg-white shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-xl"
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
                          {portfolio.category ||
                            "Portfolio"}
                        </span>

                        {portfolio.is_featured && (
                          <span className="rounded-full bg-orange/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-orange">
                            Featured
                          </span>
                        )}
                      </div>

                      <h2 className="mt-3 text-lg font-semibold text-navy transition group-hover:text-orange">
                        {portfolio.title}
                      </h2>

                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
                        {portfolio.short_description ||
                          "Informasi singkat portfolio belum tersedia."}
                      </p>

                      <div className="mt-5 flex items-center justify-between gap-4">
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

        {/* Filter tidak menghasilkan data */}
        {!loading &&
          !errorMessage &&
          portfolios.length > 0 &&
          shownPortfolios.length === 0 && (
            <div className="rounded-3xl border bg-slate-50 px-6 py-14 text-center">
              <BriefcaseBusiness
                size={34}
                className="mx-auto text-slate-400"
              />

              <h2 className="mt-4 text-lg font-bold text-navy">
                Portfolio kategori ini belum tersedia
              </h2>

              <button
                type="button"
                onClick={() =>
                  setActiveCategory("All")
                }
                className="mt-5 text-sm font-semibold text-orange"
              >
                Lihat semua portfolio
              </button>
            </div>
          )}
      </section>

      <CTA />
    </>
  );
}