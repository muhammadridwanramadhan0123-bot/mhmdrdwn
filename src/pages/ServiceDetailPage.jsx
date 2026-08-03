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
} from "lucide-react";
import {
  Link,
  useParams,
} from "react-router-dom";

import { CTA } from "../components/Common";
import { getPublishedServiceBySlug } from "../services/serviceService";

export default function ServiceDetailPage() {
  const { slug } = useParams();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] =
    useState("");

  const loadService = useCallback(async () => {
    const normalizedSlug = String(
      slug || ""
    ).trim();

    if (!normalizedSlug) {
      setService(null);
      setLoading(false);
      setErrorMessage("");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const data =
        await getPublishedServiceBySlug(
          normalizedSlug
        );

      setService(data);
    } catch (error) {
      console.error(
        "Detail Service gagal dimuat:",
        error
      );

      setService(null);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Detail Service gagal dimuat."
      );
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadService();
  }, [loadService]);

  useEffect(() => {
    if (!service?.name) {
      return undefined;
    }

    const previousTitle = document.title;

    document.title = `${
      service.seo_title || service.name
    } | Jasa Medika Transmedic`;

    return () => {
      document.title = previousTitle;
    };
  }, [service]);

  if (loading) {
    return (
      <main className="flex min-h-[65vh] items-center justify-center bg-slate-50 px-6">
        <div className="text-center">
          <LoaderCircle
            size={44}
            className="mx-auto animate-spin text-orange"
          />

          <h1 className="mt-5 text-xl font-bold text-[#082B3A]">
            Memuat detail layanan
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Data sedang diambil dari Supabase.
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
              <AlertTriangle size={29} />
            </div>

            <h1 className="mt-6 text-2xl font-bold text-[#082B3A]">
              Detail layanan gagal dimuat
            </h1>

            <p className="mt-3 text-sm leading-7 text-red-600">
              {errorMessage}
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/services"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600"
              >
                <ArrowLeft size={17} />
                Kembali
              </Link>

              <button
                type="button"
                onClick={loadService}
                className="inline-flex items-center gap-2 rounded-xl bg-orange px-5 py-3 text-sm font-semibold text-white"
              >
                <RefreshCw size={17} />
                Coba Lagi
              </button>
            </div>
          </div>
        </main>

        <CTA />
      </>
    );
  }

  if (!service) {
    return (
      <>
        <main className="flex min-h-[65vh] items-center justify-center bg-slate-50 px-6 py-16">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange/10 font-bold text-orange">
              404
            </div>

            <h1 className="mt-6 text-3xl font-bold text-[#082B3A]">
              Layanan tidak ditemukan
            </h1>

            <p className="mt-4 text-sm leading-7 text-slate-500">
              Layanan tidak tersedia, belum
              dipublikasikan, atau slug tidak sesuai.
            </p>

            <Link
              to="/services"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-orange px-6 py-3 text-sm font-semibold text-white"
            >
              <ArrowLeft size={17} />
              Kembali ke Layanan
            </Link>
          </div>
        </main>

        <CTA />
      </>
    );
  }

  const features = Array.isArray(
    service.features
  )
    ? service.features
    : [];

  return (
    <>
      <main>
        {/* Hero detail */}
        <section className="border-b border-slate-200 bg-gradient-to-br from-white via-cream/40 to-mist">
          <div className="container-jmt py-14 md:py-20">
            <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <Link
                to="/"
                className="hover:text-orange"
              >
                Home
              </Link>

              <span>/</span>

              <Link
                to="/services"
                className="hover:text-orange"
              >
                Product & Services
              </Link>

              <span>/</span>

              <span className="font-medium text-[#082B3A]">
                {service.name}
              </span>
            </nav>

            <div className="mt-10 grid items-center gap-10 lg:grid-cols-[1.05fr_.95fr]">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-orange">
                  {service.category_name ||
                    "Healthcare Service"}
                </p>

                <h1 className="mt-4 text-4xl font-bold leading-tight text-[#082B3A] md:text-5xl">
                  {service.name}
                </h1>

                {service.short_description && (
                  <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600">
                    {service.short_description}
                  </p>
                )}

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 rounded-xl bg-orange px-6 py-3.5 text-sm font-semibold text-white"
                  >
                    Konsultasikan Kebutuhan
                    <ArrowRight size={18} />
                  </Link>

                  <Link
                    to="/services"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700"
                  >
                    <ArrowLeft size={18} />
                    Semua Layanan
                  </Link>
                </div>
              </div>

              <div>
                {service.image_url ? (
                  <img
                    src={service.image_url}
                    alt={service.name}
                    className="h-72 w-full rounded-3xl border border-slate-200 object-cover shadow-soft md:h-96"
                  />
                ) : (
                  <div className="flex h-72 items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-soft md:h-96">
                    <CheckCircle2
                      size={60}
                      className="text-orange"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Isi detail */}
        <section className="container-jmt py-14 md:py-20">
          <div className="mx-auto max-w-5xl">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-orange">
              Tentang Layanan
            </p>

            <h2 className="mt-3 text-3xl font-bold text-[#082B3A]">
              Solusi untuk kebutuhan organisasi Anda
            </h2>

            <div className="mt-6 whitespace-pre-line text-base leading-9 text-slate-600">
              {service.full_description ||
                "Informasi lengkap layanan belum tersedia."}
            </div>

            {features.length > 0 && (
              <div className="mt-12">
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-orange">
                  Fitur dan Cakupan
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {features.map(
                    (feature, index) => (
                      <div
                        key={`${feature}-${index}`}
                        className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                      >
                        <CheckCircle2
                          size={20}
                          className="mt-0.5 shrink-0 text-orange"
                        />

                        <span className="text-sm leading-6 text-slate-600">
                          {feature}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <CTA />
    </>
  );
}