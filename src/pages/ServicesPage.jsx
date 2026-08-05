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
  RefreshCw,
  Search,
  Stethoscope,
} from "lucide-react";
import {
  Link,
  useSearchParams,
} from "react-router-dom";

import {
  CTA,
  PageHero,
} from "../components/Common";

import {
  getActiveServiceCategories,
  getPublishedServicesForPublic,
} from "../services/serviceService";

function getServiceIcon(iconName) {
  const normalizedIcon = String(
    iconName || ""
  )
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

function ServicesLoading() {
  return (
    <div className="mt-10 grid gap-6 lg:grid-cols-2">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white p-7"
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
  );
}

export default function ServicesPage() {
  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const [categories, setCategories] =
    useState([]);

  const [services, setServices] =
    useState([]);

  const [query, setQuery] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const categoryParameter =
    searchParams.get("category") || "all";

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const [
        categoryData,
        serviceData,
      ] = await Promise.all([
        getActiveServiceCategories(),
        getPublishedServicesForPublic(),
      ]);

      setCategories(
        Array.isArray(categoryData)
          ? categoryData
          : []
      );

      setServices(
        Array.isArray(serviceData)
          ? serviceData
          : []
      );
    } catch (error) {
      console.error(
        "Product & Services gagal dimuat:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Product & Services gagal dimuat."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const categoryMap = useMemo(() => {
    return new Map(
      categories.map((category) => [
        category.id,
        category,
      ])
    );
  }, [categories]);

  const servicesWithCategory =
    useMemo(() => {
      return services.map((service) => ({
        ...service,

        category:
          categoryMap.get(
            service.category_id
          ) || null,
      }));
    }, [services, categoryMap]);

  const selectedCategory =
    useMemo(() => {
      return (
        categories.find(
          (category) =>
            category.slug ===
            categoryParameter
        ) || null
      );
    }, [
      categories,
      categoryParameter,
    ]);

  const activeCategory =
    selectedCategory?.slug || "all";

  const filteredServices = useMemo(() => {
    const normalizedQuery = query
      .trim()
      .toLowerCase();

    return servicesWithCategory.filter(
      (service) => {
        const matchesCategory =
          activeCategory === "all" ||
          service.category?.slug ===
            activeCategory;

        const features = Array.isArray(
          service.features
        )
          ? service.features
          : [];

        const searchableText = [
          service.name,
          service.slug,
          service.short_description,
          service.full_description,
          service.category?.name,
          ...features,
        ]
          .map((value) =>
            String(value || "")
              .toLowerCase()
          )
          .join(" ");

        const matchesSearch =
          !normalizedQuery ||
          searchableText.includes(
            normalizedQuery
          );

        return (
          matchesCategory &&
          matchesSearch
        );
      }
    );
  }, [
    activeCategory,
    query,
    servicesWithCategory,
  ]);

  function handleCategoryChange(event) {
    const nextCategory =
      event.target.value;

    const nextParams =
      new URLSearchParams(
        searchParams
      );

    if (nextCategory === "all") {
      nextParams.delete("category");
    } else {
      nextParams.set(
        "category",
        nextCategory
      );
    }

    setSearchParams(nextParams, {
      replace: true,
    });
  }

  function resetFilters() {
    setQuery("");

    const nextParams =
      new URLSearchParams(
        searchParams
      );

    nextParams.delete("category");

    setSearchParams(nextParams, {
      replace: true,
    });
  }

  const categoryHasNoServices =
    activeCategory !== "all" &&
    !query.trim() &&
    filteredServices.length === 0;

  return (
    <>
      <PageHero
        eyebrow="Product & Services"
        title="Integrated Healthcare Solutions"
        description="Empowering healthcare providers through integrated digital solutions, professional consulting, IT infrastructure, and workforce development."
      />

      <section className="container-jmt py-14 md:py-20">

        {/* Search dan filter */}
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
                setQuery(
                  event.target.value
                )
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
              onChange={
                handleCategoryChange
              }
              className="w-full min-w-72 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange focus:ring-2 focus:ring-orange/10"
            >
              <option value="all">
                Semua Kategori
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={category.id}
                    value={category.slug}
                  >
                    {category.name}
                  </option>
                )
              )}
            </select>
          </label>
        </div>

        {loading && <ServicesLoading />}

        {!loading && errorMessage && (
          <div className="mt-10 rounded-3xl border border-red-200 bg-red-50 px-6 py-12 text-center">
            <AlertTriangle
              size={34}
              className="mx-auto text-red-600"
            />

            <h2 className="mt-4 text-xl font-bold text-[#082B3A]">
              Layanan gagal dimuat
            </h2>

            <p className="mt-3 text-sm text-red-700">
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={loadData}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange px-5 py-3 text-sm font-semibold text-white"
            >
              <RefreshCw size={17} />
              Coba Lagi
            </button>
          </div>
        )}

        {!loading &&
          !errorMessage &&
          filteredServices.length > 0 && (
            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              {filteredServices.map(
                (service) => {
                  const Icon =
                    getServiceIcon(
                      service.icon
                    );

                  const features =
                    Array.isArray(
                      service.features
                    )
                      ? service.features
                      : [];

                  return (
                    <article
                      key={service.id}
                      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft transition duration-300 hover:-translate-y-1 hover:border-orange/30 hover:shadow-xl"
                    >
                      {service.image_url && (
                        <div className="overflow-hidden bg-slate-100">
                          <img
                            src={
                              service.image_url
                            }
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
                              {service.category
                                ?.name ||
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

                        {features.length > 0 && (
                          <div className="mt-6 flex flex-wrap gap-2">
                            {features
                              .slice(0, 3)
                              .map(
                                (
                                  feature,
                                  index
                                ) => (
                                  <span
                                    key={`${feature}-${index}`}
                                    className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600"
                                  >
                                    {feature}
                                  </span>
                                )
                              )}
                          </div>
                        )}

                        <div className="mt-auto pt-7">
                          <Link
                            to={`/services/${service.slug}`}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-orange transition hover:underline"
                          >
                            Pelajari Selengkapnya

                            <ArrowRight
                              size={17}
                              className="transition group-hover:translate-x-1"
                            />
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          )}

        {!loading &&
          !errorMessage &&
          filteredServices.length === 0 && (
            <div className="mt-10 rounded-3xl border border-slate-200 bg-slate-50 px-6 py-14 text-center">
              {categoryHasNoServices ? (
                <>
                  <Stethoscope
                    size={38}
                    className="mx-auto text-slate-400"
                  />

                  <h2 className="mt-5 text-xl font-bold text-[#082B3A]">
                    Belum ada layanan pada
                    kategori ini
                  </h2>

                  <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500">
                    Kategori{" "}
                    <strong>
                      {selectedCategory?.name}
                    </strong>{" "}
                    sudah tersedia, tetapi belum
                    memiliki produk atau layanan
                    berstatus Published.
                  </p>
                </>
              ) : (
                <>
                  <Search
                    size={38}
                    className="mx-auto text-slate-400"
                  />

                  <h2 className="mt-5 text-xl font-bold text-[#082B3A]">
                    Layanan tidak ditemukan
                  </h2>

                  <p className="mt-3 text-sm text-slate-500">
                    Tidak ada layanan yang sesuai
                    dengan pencarian Anda.
                  </p>
                </>
              )}

              <button
                type="button"
                onClick={resetFilters}
                className="mt-6 rounded-xl bg-orange px-5 py-3 text-sm font-semibold text-white"
              >
                Tampilkan Semua Layanan
              </button>
            </div>
          )}
      </section>

      <CTA />
    </>
  );
}