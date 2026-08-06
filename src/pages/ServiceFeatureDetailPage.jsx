import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  LoaderCircle,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import {
  Link,
  useParams,
} from "react-router-dom";

import { CTA } from "../components/Common";

import {
  getPublishedServiceFeatureBySlug,
} from "../services/serviceService";

export default function ServiceFeatureDetailPage() {
  const {
    serviceSlug,
    featureSlug,
  } = useParams();

  const [feature, setFeature] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const loadFeature =
    useCallback(async () => {
      const normalizedServiceSlug =
        String(
          serviceSlug || ""
        ).trim();

      const normalizedFeatureSlug =
        String(
          featureSlug || ""
        ).trim();

      if (
        !normalizedServiceSlug ||
        !normalizedFeatureSlug
      ) {
        setFeature(null);
        setErrorMessage("");
        setLoading(false);

        return;
      }

      try {
        setLoading(true);
        setErrorMessage("");

        const data =
          await getPublishedServiceFeatureBySlug(
            normalizedServiceSlug,
            normalizedFeatureSlug
          );

        setFeature(data);
      } catch (error) {
        console.error(
          "Detail fitur layanan gagal dimuat:",
          error
        );

        setFeature(null);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Detail fitur layanan gagal dimuat."
        );
      } finally {
        setLoading(false);
      }
    }, [
      serviceSlug,
      featureSlug,
    ]);

  useEffect(() => {
    loadFeature();
  }, [loadFeature]);

  useEffect(() => {
    if (!feature?.name) {
      return undefined;
    }

    const previousTitle =
      document.title;

    document.title = `${feature.name} | ${
      feature.service_name ||
      "Jasa Medika Transmedic"
    }`;

    return () => {
      document.title =
        previousTitle;
    };
  }, [feature]);

  if (loading) {
    return (
      <main className="flex min-h-[65vh] items-center justify-center bg-slate-50 px-6">
        <div className="text-center">
          <LoaderCircle
            size={44}
            className="mx-auto animate-spin text-orange"
          />

          <h1 className="mt-5 text-xl font-bold text-[#082B3A]">
            Memuat detail fitur
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Data sedang diambil dari
            Supabase.
          </p>
        </div>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <>
        <main className="flex min-h-[65vh] items-center justify-center bg-slate-50 px-6 py-16">
          <div className="w-full max-w-xl rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <AlertTriangle
                size={29}
              />
            </div>

            <h1 className="mt-6 text-2xl font-bold text-[#082B3A]">
              Detail fitur gagal dimuat
            </h1>

            <p className="mt-3 text-sm leading-7 text-red-600">
              {errorMessage}
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to={`/services/${serviceSlug}`}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-orange hover:text-orange"
              >
                <ArrowLeft
                  size={17}
                />

                Kembali
              </Link>

              <button
                type="button"
                onClick={loadFeature}
                className="inline-flex items-center gap-2 rounded-xl bg-orange px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#E94F00]"
              >
                <RefreshCw
                  size={17}
                />

                Coba Lagi
              </button>
            </div>
          </div>
        </main>

        <CTA />
      </>
    );
  }

  if (!feature) {
    return (
      <>
        <main className="flex min-h-[65vh] items-center justify-center bg-slate-50 px-6 py-16">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange/10 font-bold text-orange">
              404
            </div>

            <h1 className="mt-6 text-3xl font-bold text-[#082B3A]">
              Fitur tidak ditemukan
            </h1>

            <p className="mt-4 text-sm leading-7 text-slate-500">
              Fitur tidak tersedia,
              belum dipublikasikan,
              tidak terhubung dengan
              layanan induk, atau slug
              tidak sesuai.
            </p>

            <Link
              to={`/services/${serviceSlug}`}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-orange px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#E94F00]"
            >
              <ArrowLeft
                size={17}
              />

              Kembali ke Layanan
            </Link>
          </div>
        </main>

        <CTA />
      </>
    );
  }

  const parentServiceName =
    feature.service_name ||
    feature.service?.name ||
    "Product & Services";

  const parentServiceSlug =
    feature.service_slug ||
    feature.service?.slug ||
    serviceSlug;

  const parentServiceUrl =
    `/services/${parentServiceSlug}`;

  return (
    <>
      <main>
        {/* Hero detail fitur */}
        <section className="border-b border-slate-200 bg-gradient-to-br from-white via-cream/40 to-mist">
          <div className="container-jmt py-14 md:py-20">
            <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <Link
                to="/"
                className="transition hover:text-orange"
              >
                Home
              </Link>

              <span>/</span>

              <Link
                to="/services"
                className="transition hover:text-orange"
              >
                Product & Services
              </Link>

              <span>/</span>

              <Link
                to={parentServiceUrl}
                className="transition hover:text-orange"
              >
                {parentServiceName}
              </Link>

              <span>/</span>

              <span className="font-medium text-[#082B3A]">
                {feature.name}
              </span>
            </nav>

            <div className="mt-10 grid items-center gap-10 lg:grid-cols-[1.05fr_.95fr]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-orange/20 bg-orange/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-orange">
                  <Sparkles
                    size={14}
                  />

                  Fitur dan Cakupan
                </div>

                <h1 className="mt-5 text-4xl font-bold leading-tight text-[#082B3A] md:text-5xl">
                  {feature.name}
                </h1>

                <p className="mt-4 text-sm font-semibold text-orange">
                  Bagian dari{" "}
                  {parentServiceName}
                </p>

                {feature.short_description && (
                  <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600">
                    {
                      feature.short_description
                    }
                  </p>
                )}

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 rounded-xl bg-orange px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#E94F00]"
                  >
                    Konsultasikan Kebutuhan

                    <ArrowRight
                      size={18}
                    />
                  </Link>

                  <Link
                    to={parentServiceUrl}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-orange hover:text-orange"
                  >
                    <ArrowLeft
                      size={18}
                    />

                    Kembali ke Layanan
                  </Link>
                </div>
              </div>

              <div>
                {feature.image_url ? (
                  <img
                    src={
                      feature.image_url
                    }
                    alt={feature.name}
                    className="h-72 w-full rounded-3xl border border-slate-200 object-cover shadow-soft md:h-96"
                  />
                ) : (
                  <div className="relative flex h-72 items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft md:h-96">
                    <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-orange/10" />

                    <div className="absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-teal/10" />

                    <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-orange/10 text-orange">
                      <CheckCircle2
                        size={48}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Isi detail fitur */}
        <section className="container-jmt py-14 md:py-20">
          <div className="mx-auto max-w-5xl">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-orange">
              Detail Fitur
            </p>

            <h2 className="mt-3 text-3xl font-bold leading-tight text-[#082B3A]">
              Solusi yang mendukung{" "}
              {parentServiceName}
            </h2>

            <div className="mt-6 whitespace-pre-line text-base leading-9 text-slate-600">
              {feature.full_description ||
                feature.short_description ||
                "Informasi lengkap fitur belum tersedia."}
            </div>

            <div className="mt-12 rounded-3xl border border-slate-200 bg-slate-50 p-6 md:p-8">
              <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange">
                    Layanan Induk
                  </p>

                  <h3 className="mt-3 text-2xl font-bold text-[#082B3A]">
                    {parentServiceName}
                  </h3>

                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
                    Lihat informasi lengkap
                    mengenai layanan induk dan
                    fitur lain yang tersedia.
                  </p>
                </div>

                <Link
                  to={parentServiceUrl}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#082B3A] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#0A4053]"
                >
                  Lihat Layanan

                  <ArrowRight
                    size={18}
                  />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <CTA />
    </>
  );
}