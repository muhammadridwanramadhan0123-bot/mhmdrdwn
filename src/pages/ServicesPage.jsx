import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AlertTriangle,
  ArrowRight,
  HeartPulse,
  LoaderCircle,
  RefreshCw,
  Search,
  Stethoscope,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  CTA,
  PageHero,
} from "../components/Common";
import { getPublishedServices } from "../services/serviceService";

function getServiceIcon(iconName) {
  const normalizedIcon = String(iconName || "")
    .trim()
    .toLowerCase();

  if (
    normalizedIcon.includes("heart") ||
    normalizedIcon.includes("pulse")
  ) {
    return HeartPulse;
  }

  return Stethoscope;
}

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [activeCategory, setActiveCategory] =
    useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] =
    useState("");

  const loadServices = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const data = await getPublishedServices();

      setServices(data);
    } catch (error) {
      console.error(
        "Layanan publik gagal dimuat:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Layanan gagal dimuat."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const categories = useMemo(() => {
    const categoryMap = new Map();

    services.forEach((service) => {
      if (
        service.category_id &&
        service.category_name
      ) {
        categoryMap.set(service.category_id, {
          id: service.category_id,
          name: service.category_name,
        });
      }
    });

    return Array.from(categoryMap.values());
  }, [services]);

  const filteredServices = useMemo(() => {
    const normalizedQuery = query
      .trim()
      .toLowerCase();

    return services.filter((service) => {
      const matchesCategory =
        activeCategory === "all" ||
        service.category_id === activeCategory;

      const searchableText = [
        service.name,
        service.slug,
        service.short_description,
        service.full_description,
        service.category_name,
        ...(Array.isArray(service.features)
          ? service.features
          : []),
      ]
        .map((value) =>
          String(value || "").toLowerCase()
        )
        .join(" ");

      const matchesQuery =
        !normalizedQuery ||
        searchableText.includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, query, services]);

  return (
    <>
      <PageHero
        eyebrow="Product & Services"
        title="Integrated Healthcare Solutions"
        description="Empowering healthcare providers through integrated digital solutions, professional consulting, IT infrastructure, and workforce development."
      />

      <section className="container-jmt py-14 md:py-20">
        {/* Pencarian dan filter */}
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft md:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">
              Cari layanan
            </span>

            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Cari nama atau fitur layanan..."
              className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-orange focus:ring-2 focus:ring-orange/10"
            />
          </label>

          <label>
            <span className="sr-only">
              Filter kategori
            </span>

            <select
              value={activeCategory}
              onChange={(event) =>
                setActiveCategory(event.target.value)
              }
              className="w-full min-w-56 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange focus:ring-2 focus:ring-orange/10"
            >
              <option value="all">
                Semua Kategori
              </option>

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid gap-6 py-10 lg:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-7"
              >
                <div className="flex gap-4">
                  <div className="h-14 w-14 rounded-xl bg-slate-200" />

                  <div className="flex-1">
                    <div className="h-3 w-32 rounded bg-slate-200" />
                    <div className="mt-4 h-6 w-3/4 rounded bg-slate-200" />
                    <div className="mt-4 h-4 w-full rounded bg-slate-100" />
                    <div className="mt-2 h-4 w-2/3 rounded bg-slate-100" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && errorMessage && (
          <div className="mt-10 rounded-3xl border border-red-200 bg-red-50 px-6 py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <AlertTriangle size={26} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-[#082B3A]">
              Layanan gagal dimuat
            </h2>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-red-600">
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={loadServices}
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
            <div className="mt-10 rounded-3xl border border-slate-200 bg-slate-50 px-6 py-14 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
                <Stethoscope size={29} />
              </div>

              <h2 className="mt-5 text-xl font-bold text-[#082B3A]">
                Belum ada layanan
              </h2>

              <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-slate-500">
                Belum ada layanan berstatus Published
                yang dapat ditampilkan.
              </p>
            </div>
          )}

        {/* Daftar layanan */}
{!loading &&
  !errorMessage &&
  filteredServices.length > 0 && (
    <div className="mt-10 grid gap-6 lg:grid-cols-2">
      {filteredServices.map((service) => {
        const Icon = getServiceIcon(
          service.icon
        );

        const serviceFeatures =
          Array.isArray(service.features)
            ? service.features
            : [];

        const normalizedSlug = String(
          service.slug || ""
        ).trim();

        const hasSlug =
          normalizedSlug.length > 0;

        const detailUrl = hasSlug
          ? `/services/${encodeURIComponent(
              normalizedSlug
            )}`
          : "/services";

        return (
          <Link
            key={service.id}
            to={detailUrl}
            onClick={(event) => {
              if (!hasSlug) {
                event.preventDefault();

                console.error(
                  "Service tidak memiliki slug:",
                  service
                );
              }
            }}
            aria-disabled={!hasSlug}
            className={`group block h-full rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange focus:ring-offset-4 ${
              hasSlug
                ? "cursor-pointer"
                : "cursor-not-allowed opacity-70"
            }`}
          >
            <article
              id={
                hasSlug
                  ? normalizedSlug
                  : undefined
              }
              className="flex h-full scroll-mt-28 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft transition duration-300 group-hover:-translate-y-1 group-hover:border-orange/30 group-hover:shadow-xl"
            >
              {service.image_url && (
                <div className="overflow-hidden bg-slate-100">
                  <img
                    src={service.image_url}
                    alt={service.name}
                    loading="lazy"
                    className="aspect-[16/7] w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
              )}

              <div className="flex flex-1 flex-col p-7 md:p-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-cream text-orange">
                    <Icon size={28} />
                  </div>

                  <div className="min-w-0">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-orange">
                      {service.category_name ||
                        "Healthcare Service"}
                    </p>

                    <h2 className="text-xl font-bold leading-7 text-[#082B3A]">
                      {service.name}
                    </h2>

                    {service.short_description && (
                      <p className="mt-3 text-sm leading-7 text-slate-500">
                        {
                          service.short_description
                        }
                      </p>
                    )}
                  </div>
                </div>

                {serviceFeatures.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {serviceFeatures
                      .slice(0, 3)
                      .map((feature, index) => (
                        <span
                          key={`${feature}-${index}`}
                          className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600"
                        >
                          {feature}
                        </span>
                      ))}

                    {serviceFeatures.length >
                      3 && (
                      <span className="rounded-full bg-orange/10 px-3 py-1.5 text-xs font-semibold text-orange">
                        +
                        {serviceFeatures.length -
                          3}{" "}
                        fitur
                      </span>
                    )}
                  </div>
                )}

                <div className="relative z-20 mt-auto pt-7">
  {service.slug ? (
    <Link
      to={`/services/${encodeURIComponent(
        String(service.slug).trim()
      )}`}
      className="inline-flex cursor-pointer items-center gap-2 rounded-lg px-1 py-1 text-sm font-semibold text-orange transition hover:text-[#E94F00] hover:underline focus:outline-none focus:ring-2 focus:ring-orange/30"
    >
      Pelajari Selengkapnya

      <ArrowRight
        size={17}
        className="transition group-hover:translate-x-1"
      />
    </Link>
  ) : (
    <span className="text-sm font-semibold text-slate-400">
      Slug belum tersedia
    </span>
  )}
</div>
              </div>
            </article>
          </Link>
        );
      })}
    </div>
  )}

        {/* Filter tidak menemukan data */}
        {!loading &&
          !errorMessage &&
          services.length > 0 &&
          filteredServices.length === 0 && (
            <div className="mt-10 rounded-3xl border border-slate-200 bg-slate-50 px-6 py-14 text-center">
              <Search
                size={34}
                className="mx-auto text-slate-400"
              />

              <h2 className="mt-4 text-xl font-bold text-[#082B3A]">
                Layanan tidak ditemukan
              </h2>

              <p className="mt-3 text-sm text-slate-500">
                Tidak ada layanan yang sesuai dengan
                pencarian atau kategori.
              </p>

              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setActiveCategory("all");
                }}
                className="mt-5 text-sm font-semibold text-orange"
              >
                Reset pencarian
              </button>
            </div>
          )}
      </section>

      <CTA />
    </>
  );
}