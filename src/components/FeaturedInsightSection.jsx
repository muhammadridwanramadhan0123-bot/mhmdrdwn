import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  LoaderCircle,
  Newspaper,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";

import { getFeaturedInsights } from "../services/insightService";

function formatDate(value) {
  if (!value) {
    return "Tanggal belum tersedia";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Tanggal belum tersedia";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function FeaturedInsightSection() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadFeaturedInsights = useCallback(
    async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        /*
         * Hanya mengambil Insight dengan:
         * status = published
         * is_featured = true
         */
        const data = await getFeaturedInsights(3);

        setInsights(data);
      } catch (error) {
        console.error(
          "Gagal mengambil Featured Insight:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Featured Insight gagal dimuat."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadFeaturedInsights();
  }, [loadFeaturedInsights]);

  return (
    <section className="bg-cream py-20">
      <div className="container-jmt">
        {/* Header */}
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange">
              Insight & News
            </p>

            <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-tight text-navy md:text-4xl">
              Update terbaru dari JMT Group
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500">
              Informasi, berita, dan wawasan pilihan
              mengenai teknologi serta ekosistem
              pelayanan kesehatan.
            </p>
          </div>

          <Link
            to="/insight"
            className="inline-flex items-center gap-2 text-sm font-semibold text-orange transition hover:opacity-70"
          >
            View All Insights
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-10 flex min-h-[300px] items-center justify-center rounded-3xl border border-slate-200 bg-white">
            <div className="text-center">
              <LoaderCircle
                size={42}
                className="mx-auto animate-spin text-orange"
              />

              <p className="mt-4 font-semibold text-navy">
                Memuat Featured Insight
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
              Featured Insight gagal dimuat
            </h3>

            <p className="mt-3 text-sm leading-7 text-red-600">
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={loadFeaturedInsights}
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
          insights.length === 0 && (
            <div className="mt-10 rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Newspaper size={29} />
              </div>

              <h3 className="mt-5 text-xl font-bold text-navy">
                Belum ada Featured Insight
              </h3>

              <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-slate-500">
                Pilih artikel berstatus Published,
                kemudian aktifkan opsi Featured Insight
                melalui dashboard admin.
              </p>

              <Link
                to="/insight"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-orange"
              >
                Lihat semua Insight
                <ArrowRight size={16} />
              </Link>
            </div>
          )}

        {/* Daftar Featured Insight */}
        {!loading &&
          !errorMessage &&
          insights.length > 0 && (
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {insights.map((insight) => (
                <Link
                  key={insight.id}
                  to={`/insight/${insight.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* Cover */}
                  {insight.cover_image_url ? (
                    <div className="overflow-hidden bg-slate-100">
                      <img
                        src={insight.cover_image_url}
                        alt={insight.title}
                        loading="lazy"
                        className="aspect-video w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-[#082B3A] to-cyan-700">
                      <Newspaper
                        size={58}
                        strokeWidth={1.2}
                        className="text-white/80"
                      />
                    </div>
                  )}

                  <article className="flex flex-1 flex-col p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="rounded-full bg-orange/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-orange">
                        {insight.category || "Insight"}
                      </span>

                      <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                        Featured
                      </span>
                    </div>

                    <div className="mt-5 flex items-center gap-2 text-xs text-slate-400">
                      <CalendarDays size={14} />

                      <span>
                        {formatDate(
                          insight.published_at
                        )}
                      </span>
                    </div>

                    <h3 className="mt-4 text-xl font-semibold leading-7 text-navy transition group-hover:text-orange">
                      {insight.title}
                    </h3>

                    <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-500">
                      {insight.excerpt ||
                        "Ringkasan artikel belum tersedia."}
                    </p>

                    <div className="mt-auto flex items-center justify-between gap-4 pt-6">
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-orange">
                        Read More

                        <ArrowRight
                          size={16}
                          className="transition group-hover:translate-x-1"
                        />
                      </span>

                      {insight.author_name && (
                        <span className="max-w-[130px] truncate text-xs text-slate-400">
                          {insight.author_name}
                        </span>
                      )}
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
      </div>
    </section>
  );
}