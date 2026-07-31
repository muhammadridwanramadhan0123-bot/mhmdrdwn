import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  LoaderCircle,
  UserRound,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { CTA } from "../components/Common";
import { getPublishedPortfolioBySlug } from "../services/portfolioService";

export default function PortfolioDetailPage() {
  const { slug } = useParams();

  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadPortfolioDetail() {
      try {
        setLoading(true);
        setErrorMessage("");

        const data = await getPublishedPortfolioBySlug(slug);

        if (!isMounted) return;

        setPortfolio(data);
      } catch (error) {
        if (!isMounted) return;

        console.error(
          "Gagal mengambil detail portfolio:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Detail portfolio gagal dimuat."
        );

        setPortfolio(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (!slug) {
      setErrorMessage("Slug portfolio tidak tersedia.");
      setLoading(false);
      return undefined;
    }

    loadPortfolioDetail();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!portfolio?.title) return undefined;

    const previousTitle = document.title;

    document.title = `${portfolio.title} | Jasa Medika Transmedic`;

    return () => {
      document.title = previousTitle;
    };
  }, [portfolio]);

  /*
   * Loading
   */
  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-6">
        <div className="text-center">
          <LoaderCircle
            size={44}
            className="mx-auto animate-spin text-orange"
          />

          <h1 className="mt-5 text-xl font-bold text-navy">
            Memuat detail portfolio
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Data sedang diambil dari database.
          </p>
        </div>
      </main>
    );
  }

  /*
   * Error query
   */
  if (errorMessage) {
    return (
      <>
        <main className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-6 py-16">
          <div className="w-full max-w-xl rounded-3xl border border-red-200 bg-white p-8 text-center shadow-soft sm:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <AlertTriangle size={29} />
            </div>

            <h1 className="mt-6 text-2xl font-bold text-navy">
              Detail portfolio gagal dimuat
            </h1>

            <p className="mt-3 text-sm leading-7 text-slate-500">
              {errorMessage}
            </p>

            <Link
              to="/portfolio"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-orange px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <ArrowLeft size={17} />
              Kembali ke Portfolio
            </Link>
          </div>
        </main>

        <CTA />
      </>
    );
  }

  /*
   * Data tidak ditemukan
   */
  if (!portfolio) {
    return (
      <>
        <main className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-6 py-16">
          <div className="w-full max-w-xl rounded-3xl border bg-white p-8 text-center shadow-soft sm:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange/10 text-2xl font-bold text-orange">
              !
            </div>

            <h1 className="mt-6 text-3xl font-bold text-navy">
              Portfolio tidak ditemukan
            </h1>

            <p className="mt-4 text-sm leading-7 text-slate-500">
              Portfolio yang Anda cari tidak tersedia, belum dipublikasikan,
              atau alamatnya tidak sesuai.
            </p>

            <Link
              to="/portfolio"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-orange px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <ArrowLeft size={17} />
              Kembali ke Portfolio
            </Link>
          </div>
        </main>

        <CTA />
      </>
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#082B3A] py-16 text-white md:py-20">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-orange/20 blur-3xl" />
        <div className="absolute -bottom-24 left-16 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="container-jmt relative">
          {/* Breadcrumb */}
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
              to="/portfolio"
              className="transition hover:text-orange"
            >
              Portfolio
            </Link>

            <span aria-hidden="true">/</span>

            <span className="text-white">
              {portfolio.title}
            </span>
          </nav>

          <div className="mt-8 max-w-4xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex rounded-full bg-orange/20 px-4 py-2 text-xs font-bold uppercase tracking-wider text-orange">
                {portfolio.category || "Portfolio"}
              </span>

              {portfolio.is_featured && (
                <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white">
                  Featured Project
                </span>
              )}
            </div>

            <h1 className="mt-6 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              {portfolio.title}
            </h1>

            {portfolio.short_description && (
              <p className="mt-6 max-w-3xl text-base leading-8 text-white/70 md:text-lg">
                {portfolio.short_description}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Isi detail */}
      <section className="container-jmt py-12 md:py-16">
        <Link
          to="/portfolio"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-orange"
        >
          <ArrowLeft size={17} />
          Kembali ke semua portfolio
        </Link>

        {/* Gambar utama */}
        <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-soft">
          {portfolio.image_url ? (
            <img
              src={portfolio.image_url}
              alt={portfolio.title}
              className="max-h-[620px] min-h-[320px] w-full object-contain"
            />
          ) : (
            <div className="flex min-h-[420px] items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-400">
              <BriefcaseBusiness
                size={120}
                strokeWidth={1}
                className="text-white/90"
              />
            </div>
          )}
        </div>

        <div className="mt-12 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* Konten utama */}
          <article>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange">
              Project Overview
            </p>

            <h2 className="mt-3 text-3xl font-bold text-navy">
              Tentang Project
            </h2>

            <div className="mt-6 whitespace-pre-line text-sm leading-8 text-slate-600 md:text-base">
              {portfolio.full_description ||
                portfolio.short_description ||
                "Informasi lengkap mengenai project ini belum tersedia."}
            </div>

            {portfolio.challenge && (
              <section className="mt-10">
                <h2 className="text-2xl font-bold text-navy">
                  Tantangan
                </h2>

                <p className="mt-4 whitespace-pre-line text-sm leading-8 text-slate-600 md:text-base">
                  {portfolio.challenge}
                </p>
              </section>
            )}

            {portfolio.solution && (
              <section className="mt-10">
                <h2 className="text-2xl font-bold text-navy">
                  Solusi yang Diberikan
                </h2>

                <p className="mt-4 whitespace-pre-line text-sm leading-8 text-slate-600 md:text-base">
                  {portfolio.solution}
                </p>
              </section>
            )}

            {portfolio.result && (
              <section className="mt-10 rounded-3xl border border-green-200 bg-green-50 p-6 md:p-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-700">
                    <CheckCircle2 size={22} />
                  </div>

                  <h2 className="text-2xl font-bold text-navy">
                    Hasil Project
                  </h2>
                </div>

                <p className="mt-5 whitespace-pre-line text-sm leading-8 text-slate-600 md:text-base">
                  {portfolio.result}
                </p>
              </section>
            )}
          </article>

          {/* Informasi project */}
          <aside className="h-fit rounded-3xl border border-slate-200 bg-slate-50 p-6 md:p-8">
            <h2 className="text-xl font-bold text-navy">
              Informasi Project
            </h2>

            <dl className="mt-6 divide-y divide-slate-200">
              <div className="flex gap-4 py-5 first:pt-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange/10 text-orange">
                  <BriefcaseBusiness size={19} />
                </div>

                <div>
                  <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Kategori
                  </dt>

                  <dd className="mt-1.5 font-semibold text-navy">
                    {portfolio.category || "Tidak dicantumkan"}
                  </dd>
                </div>
              </div>

              <div className="flex gap-4 py-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange/10 text-orange">
                  <UserRound size={19} />
                </div>

                <div>
                  <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Klien
                  </dt>

                  <dd className="mt-1.5 font-semibold text-navy">
                    {portfolio.client_name || "Tidak dicantumkan"}
                  </dd>
                </div>
              </div>

              <div className="flex gap-4 py-5 last:pb-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange/10 text-orange">
                  <CalendarDays size={19} />
                </div>

                <div>
                  <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Tahun Project
                  </dt>

                  <dd className="mt-1.5 font-semibold text-navy">
                    {portfolio.project_year || "Tidak dicantumkan"}
                  </dd>
                </div>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      <CTA />
    </>
  );
}