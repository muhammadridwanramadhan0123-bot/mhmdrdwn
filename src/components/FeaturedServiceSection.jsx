import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  AlertTriangle,
  ArrowRight,
  HeartPulse,
  Hospital,
  LoaderCircle,
  RefreshCw,
  Server,
  Stethoscope,
} from "lucide-react";
import { Link } from "react-router-dom";

import { getFeaturedServices } from "../services/serviceService";

function getServiceIcon(iconName) {
  const normalizedIcon = String(iconName || "")
    .trim()
    .toLowerCase();

  if (
    normalizedIcon.includes("hospital") ||
    normalizedIcon.includes("building")
  ) {
    return Hospital;
  }

  if (
    normalizedIcon.includes("server") ||
    normalizedIcon.includes("database") ||
    normalizedIcon.includes("infrastructure")
  ) {
    return Server;
  }

  if (
    normalizedIcon.includes("heart") ||
    normalizedIcon.includes("pulse")
  ) {
    return HeartPulse;
  }

  return Stethoscope;
}

export default function FeaturedServiceSection() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] =
    useState("");

  const loadFeaturedServices = useCallback(
    async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const data = await getFeaturedServices(4);

        setServices(data);
      } catch (error) {
        console.error(
          "Featured Services gagal dimuat:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Featured Services gagal dimuat."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadFeaturedServices();
  }, [loadFeaturedServices]);

  return (
    <section className="bg-mist py-20">
      <div className="container-jmt">
        {/* Header section */}
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange">
              Featured Solutions
            </p>

            <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-tight text-[#082B3A] md:text-4xl">
              Teknologi yang mendukung pelayanan modern
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500">
              Solusi unggulan yang dirancang untuk
              membantu transformasi digital, operasional,
              dan pelayanan organisasi kesehatan.
            </p>
          </div>

          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-sm font-semibold text-orange transition hover:opacity-70"
          >
            Lihat Semua Layanan
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-10 flex min-h-[280px] items-center justify-center rounded-3xl border border-slate-200 bg-white">
            <div className="text-center">
              <LoaderCircle
                size={42}
                className="mx-auto animate-spin text-orange"
              />

              <p className="mt-4 font-semibold text-[#082B3A]">
                Memuat Featured Services
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

            <h3 className="mt-5 text-xl font-bold text-[#082B3A]">
              Featured Services gagal dimuat
            </h3>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-red-600">
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={loadFeaturedServices}
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
          services.length === 0 && (
            <div className="mt-10 rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Stethoscope size={30} />
              </div>

              <h3 className="mt-5 text-xl font-bold text-[#082B3A]">
                Belum ada Featured Service
              </h3>

              <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-slate-500">
                Pilih layanan berstatus Published,
                kemudian aktifkan opsi Featured Service
                melalui dashboard admin.
              </p>

              <Link
                to="/services"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-orange"
              >
                Lihat semua layanan
                <ArrowRight size={16} />
              </Link>
            </div>
          )}

        {/* Daftar Featured Service */}
        {!loading &&
          !errorMessage &&
          services.length > 0 && (
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {services.map((service) => {
                const Icon = getServiceIcon(
                  service.icon
                );

                const normalizedSlug = String(
                  service.slug || ""
                ).trim();

                const detailUrl = normalizedSlug
                  ? `/services/${encodeURIComponent(
                      normalizedSlug
                    )}`
                  : "/services";

                return (
                  <Link
                    key={service.id}
                    to={detailUrl}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft transition duration-300 hover:-translate-y-1 hover:border-orange/30 hover:shadow-xl"
                  >
                    {service.image_url ? (
                      <div className="overflow-hidden bg-slate-100">
                        <img
                          src={service.image_url}
                          alt={service.name}
                          loading="lazy"
                          className="aspect-video w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-[#082B3A] to-cyan-700">
                        <Icon
                          size={52}
                          strokeWidth={1.25}
                          className="text-white/80"
                        />
                      </div>
                    )}

                    <article className="flex flex-1 flex-col p-6">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cream text-orange">
                          <Icon size={23} />
                        </div>

                        <span className="rounded-full bg-orange/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-orange">
                          Featured
                        </span>
                      </div>

                      <p className="mt-5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        {service.category_name ||
                          "Healthcare Service"}
                      </p>

                      <h3 className="mt-2 text-lg font-semibold leading-7 text-[#082B3A] transition group-hover:text-orange">
                        {service.name}
                      </h3>

                      <p className="mt-3 line-clamp-3 text-xs leading-6 text-slate-500">
                        {service.short_description ||
                          "Informasi layanan akan segera tersedia."}
                      </p>

                      <div className="mt-auto pt-6">
                        <span className="inline-flex items-center gap-2 text-sm font-semibold text-orange">
                          Pelajari Selengkapnya

                          <ArrowRight
                            size={16}
                            className="transition group-hover:translate-x-1"
                          />
                        </span>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          )}
      </div>
    </section>
  );
}