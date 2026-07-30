import { useEffect, useMemo, useState } from "react";
import { Search, Stethoscope } from "lucide-react";
import { CTA, PageHero } from "../components/Common";
import { supabase } from "../lib/supabase";

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [active, setActive] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadServices() {
      setLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("status", "published")
        .order("display_order", { ascending: true });

      if (error) {
        console.error("Supabase services error:", error);
        setErrorMessage(`Layanan gagal dimuat: ${error.message}`);
        setLoading(false);
        return;
      }

      setServices(data ?? []);
      setLoading(false);
    }

    loadServices();
  }, []);

  const categories = useMemo(() => {
    return [
      ...new Set(
        services
          .map((service) => service.category)
          .filter(Boolean)
      ),
    ];
  }, [services]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return services.filter((service) => {
      const matchCategory =
        active === "all" || service.category === active;

      const haystack = [
        service.title,
        service.short_description,
        service.description,
        service.category,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchCategory && haystack.includes(normalizedQuery);
    });
  }, [active, query, services]);

  return (
    <>
      <PageHero
        eyebrow="Product & Services"
        title="Integrated Healthcare Solutions"
        description="Empowering healthcare providers through integrated digital solutions, professional consulting, IT infrastructure, and workforce development."
      />

      <section className="container-jmt py-14">
        <div className="flex flex-col gap-4 rounded-2xl border bg-white p-4 shadow-soft md:flex-row">
          <label className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-3.5 text-slate-400"
            />

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search services..."
              className="w-full rounded-lg border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none focus:border-orange"
            />
          </label>

          <select
            value={active}
            onChange={(e) => setActive(e.target.value)}
            className="rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange"
          >
            <option value="all">All Categories</option>

            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {loading && (
          <div className="py-20 text-center">
            <p className="text-sm font-medium text-slate-500">
              Memuat layanan...
            </p>
          </div>
        )}

        {!loading && errorMessage && (
          <div className="mt-10 rounded-2xl bg-red-50 p-5 text-center text-sm font-medium text-red-700">
            {errorMessage}
          </div>
        )}

        {!loading && !errorMessage && (
          <>
            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              {filtered.map((service) => {
                const Icon = Stethoscope;

                return (
                  <article
                    id={service.slug}
                    key={service.id}
                    className="card scroll-mt-28 p-7 md:p-8"
                  >
                    <div className="flex items-start gap-4">
                      <div className="rounded-xl bg-cream p-3 text-orange">
                        <Icon size={28} />
                      </div>

                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-orange">
                          {service.category || "Healthcare Service"}
                        </p>

                        <h2 className="text-xl font-bold">
                          {service.title}
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {service.short_description}
                        </p>
                      </div>
                    </div>

                    {service.description && (
                      <p className="mt-6 text-sm leading-7 text-slate-600">
                        {service.description}
                      </p>
                    )}
                  </article>
                );
              })}
            </div>

            {!filtered.length && (
              <p className="py-20 text-center text-slate-500">
                Layanan tidak ditemukan.
              </p>
            )}
          </>
        )}
      </section>

      <CTA />
    </>
  );
}