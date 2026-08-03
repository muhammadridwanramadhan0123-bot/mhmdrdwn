import {
  useCallback,
  useEffect,
  useMemo,
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

import { PageHero } from "../components/Common";
import { getPublishedInsights } from "../services/insightService";

/*
 * Kategori dibuat tetap agar urutannya selalu:
 * All → News → Article
 */
const INSIGHT_CATEGORIES = [
  {
    label: "All",
    value: "all",
  },
  {
    label: "News",
    value: "news",
  },
  {
    label: "Article",
    value: "article",
  },
];

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

function normalizeCategory(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

export default function InsightPage() {
  const [insights, setInsights] = useState([]);
  const [activeCategory, setActiveCategory] =
    useState("all");

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] =
    useState("");

  const loadInsights = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const data = await getPublishedInsights();

      setInsights(data);
    } catch (error) {
      console.error(
        "Gagal mengambil Insight publik:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Insight gagal dimuat."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  const filteredInsights = useMemo(() => {
    if (activeCategory === "all") {
      return insights;
    }

    return insights.filter(
      (insight) =>
        normalizeCategory(insight.category) ===
        activeCategory
    );
  }, [activeCategory, insights]);

  return (
    <>
      <PageHero
        eyebrow="Insight"
        title="Insight"
        description="Latest updates, articles, and insights from the healthcare technology ecosystem."
      />

      <section className="container-jmt py-14 md:py-20">
        {/* Filter kategori tetap */}
        {!loading && (
          <div className="mb-10 flex flex-wrap gap-3">
            {INSIGHT_CATEGORIES.map(
              (category) => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() =>
                    setActiveCategory(
                      category.value
                    )
                  }
                  className={`rounded-full px-5 py-2.5 text-xs font-semibold transition ${
                    activeCategory ===
                    category.value
                      ? "bg-orange text-white"
                      : "border border-slate-200 bg-white text-slate-500 hover:border-orange hover:text-orange"
                  }`}
                >
                  {category.label}
                </button>
              )
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex min-h-[420px] items-center justify-center">
            <div className="text-center">
              <LoaderCircle
                size={44}
                className="mx-auto animate-spin text-orange"
              />

              <h2 className="mt-5 text-xl font-bold text-navy">
                Memuat Insight
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Data sedang diambil dari Supabase.
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && errorMessage && (
          <div className="mx-auto max-w-xl rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <AlertTriangle size={28} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-navy">
              Insight gagal dimuat
            </h2>

            <p className="mt-3 text-sm leading-7 text-red-600">
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={loadInsights}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <RefreshCw size={17} />
              Coba Lagi
            </button>
          </div>
        )}

        {/* Semua data kosong */}
        {!loading &&
          !errorMessage &&
          insights.length === 0 && (
            <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-slate-50 p-10 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
                <Newspaper size={29} />
              </div>

              <h2 className="mt-5 text-xl font-bold text-navy">
                Belum ada Insight
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-500">
                Belum ada artikel atau berita
                berstatus published yang dapat
                ditampilkan.
              </p>
            </div>
          )}

        {/* Daftar Insight */}
        {!loading &&
          !errorMessage &&
          filteredInsights.length > 0 && (
            <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
              {filteredInsights.map(
                (insight) => (
                  <Link
                    key={insight.id}
                    to={`/insight/${insight.slug}`}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <article className="h-full">
                      {/* Cover */}
                      {insight.cover_image_url ? (
                        <div className="overflow-hidden bg-slate-100">
                          <img
                            src={
                              insight.cover_image_url
                            }
                            alt={insight.title}
                            loading="lazy"
                            className="aspect-video w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-ink to-teal">
                          <span className="text-5xl font-extrabold text-white/15">
                            JMT
                          </span>
                        </div>
                      )}

                      <div className="p-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-orange">
                            {insight.category ||
                              "Insight"}
                          </span>

                          {insight.is_featured && (
                            <span className="rounded-full bg-orange/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-orange">
                              Featured
                            </span>
                          )}
                        </div>

                        <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                          <CalendarDays size={14} />

                          {formatDate(
                            insight.published_at
                          )}
                        </div>

                        <h2 className="mt-4 text-xl font-semibold leading-7 text-navy transition group-hover:text-orange">
                          {insight.title}
                        </h2>

                        <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-500">
                          {insight.excerpt ||
                            "Ringkasan artikel belum tersedia."}
                        </p>

                        <div className="mt-6 flex items-center justify-between gap-4">
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
                      </div>
                    </article>
                  </Link>
                )
              )}
            </div>
          )}

        {/* Kategori tidak mempunyai data */}
        {!loading &&
          !errorMessage &&
          insights.length > 0 &&
          filteredInsights.length === 0 && (
            <div className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-14 text-center">
              <Newspaper
                size={34}
                className="mx-auto text-slate-400"
              />

              <h2 className="mt-4 text-lg font-bold text-navy">
                Belum ada{" "}
                {activeCategory === "news"
                  ? "News"
                  : "Article"}
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Belum ada Insight published pada
                kategori tersebut.
              </p>

              <button
                type="button"
                onClick={() =>
                  setActiveCategory("all")
                }
                className="mt-5 text-sm font-semibold text-orange"
              >
                Lihat semua Insight
              </button>
            </div>
          )}
      </section>
    </>
  );
}