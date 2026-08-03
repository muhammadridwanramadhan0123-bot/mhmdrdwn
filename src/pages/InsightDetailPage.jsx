import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  LoaderCircle,
  Newspaper,
  UserRound,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { CTA } from "../components/Common";
import { getPublishedInsightBySlug } from "../services/insightService";

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

export default function InsightDetailPage() {
  const { slug } = useParams();

  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadInsightDetail() {
      try {
        setLoading(true);
        setErrorMessage("");

        const data = await getPublishedInsightBySlug(slug);

        if (!isMounted) return;

        setInsight(data);
      } catch (error) {
        if (!isMounted) return;

        console.error(
          "Gagal mengambil detail Insight:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Detail Insight gagal dimuat."
        );

        setInsight(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (!slug) {
      setErrorMessage("Slug Insight tidak tersedia.");
      setLoading(false);

      return undefined;
    }

    loadInsightDetail();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!insight?.title) {
      return undefined;
    }

    const previousTitle = document.title;

    document.title = `${insight.title} | Jasa Medika Transmedic`;

    return () => {
      document.title = previousTitle;
    };
  }, [insight]);

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-6">
        <div className="text-center">
          <LoaderCircle
            size={44}
            className="mx-auto animate-spin text-orange"
          />

          <h1 className="mt-5 text-xl font-bold text-navy">
            Memuat Insight
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Artikel sedang diambil dari database.
          </p>
        </div>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <>
        <main className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-6 py-16">
          <div className="w-full max-w-xl rounded-3xl border border-red-200 bg-white p-8 text-center shadow-soft sm:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <AlertTriangle size={29} />
            </div>

            <h1 className="mt-6 text-2xl font-bold text-navy">
              Detail Insight gagal dimuat
            </h1>

            <p className="mt-3 text-sm leading-7 text-red-600">
              {errorMessage}
            </p>

            <Link
              to="/insight"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-orange px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <ArrowLeft size={17} />
              Kembali ke Insight
            </Link>
          </div>
        </main>

        <CTA />
      </>
    );
  }

  if (!insight) {
    return (
      <>
        <main className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-6 py-16">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-soft sm:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange/10 text-orange">
              <Newspaper size={29} />
            </div>

            <h1 className="mt-6 text-3xl font-bold text-navy">
              Insight tidak ditemukan
            </h1>

            <p className="mt-4 text-sm leading-7 text-slate-500">
              Artikel yang Anda cari tidak tersedia, belum
              dipublikasikan, atau alamatnya tidak sesuai.
            </p>

            <Link
              to="/insight"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-orange px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <ArrowLeft size={17} />
              Kembali ke Insight
            </Link>
          </div>
        </main>

        <CTA />
      </>
    );
  }

  return (
    <>
      <section className="relative overflow-hidden bg-[#082B3A] py-16 text-white md:py-24">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-orange/20 blur-3xl" />

        <div className="container-jmt relative">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-sm text-white/60"
          >
            <Link
              to="/"
              className="transition hover:text-orange"
            >
              Home
            </Link>

            <span aria-hidden="true">/</span>

            <Link
              to="/insight"
              className="transition hover:text-orange"
            >
              Insight
            </Link>

            <span aria-hidden="true">/</span>

            <span className="line-clamp-1 text-white">
              {insight.title}
            </span>
          </nav>

          <div className="mt-8 max-w-4xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-orange/20 px-4 py-2 text-xs font-bold uppercase tracking-wider text-orange">
                {insight.category || "Insight"}
              </span>

              {insight.is_featured && (
                <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white">
                  Featured
                </span>
              )}
            </div>

            <h1 className="mt-6 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              {insight.title}
            </h1>

            {insight.excerpt && (
              <p className="mt-6 max-w-3xl text-base leading-8 text-white/70 md:text-lg">
                {insight.excerpt}
              </p>
            )}

            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/60">
              <span className="inline-flex items-center gap-2">
                <CalendarDays size={17} />
                {formatDate(insight.published_at)}
              </span>

              <span className="inline-flex items-center gap-2">
                <UserRound size={17} />
                {insight.author_name || "JMT Editorial"}
              </span>
            </div>
          </div>
        </div>
      </section>

      <main className="container-jmt py-12 md:py-16">
        <Link
          to="/insight"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-orange"
        >
          <ArrowLeft size={17} />
          Kembali ke semua Insight
        </Link>

        {insight.cover_image_url && (
          <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-soft">
            <img
              src={insight.cover_image_url}
              alt={insight.title}
              className="max-h-[650px] w-full object-cover"
            />
          </div>
        )}

        <article className="mx-auto mt-10 max-w-4xl">
          <div className="whitespace-pre-line text-base leading-9 text-slate-600">
            {insight.content || "Isi artikel belum tersedia."}
          </div>
        </article>
      </main>

      <CTA />
    </>
  );
}