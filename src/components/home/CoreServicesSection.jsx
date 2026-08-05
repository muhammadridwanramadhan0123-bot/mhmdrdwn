import {
  Activity,
  ArrowRight,
  Building2,
  ClipboardList,
  GraduationCap,
  HeartPulse,
  Server,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { Link } from "react-router-dom";

import { getActiveServiceCategories } from "../../services/serviceService";

const categoryDescriptions = {
  "healthcare-information-system":
    "Digitalisasi terintegrasi untuk operasional dan manajemen fasilitas kesehatan.",

  "clinical-patient-care-solutions":
    "Meningkatkan kualitas pelayanan pasien melalui teknologi klinis modern.",

  "hospital-operations-management":
    "Mengoptimalkan proses kerja, aset, SDM, logistik, dan klaim rumah sakit.",

  "healthcare-consulting-facility-solutions":
    "Pendampingan profesional untuk pengembangan dan pengelolaan fasilitas kesehatan.",

  "infrastructure-solutions-managed-services":
    "Solusi infrastruktur teknologi serta layanan pengelolaan sistem yang andal.",

  "training-talent-development":
    "Pengembangan kompetensi teknologi dan sumber daya manusia kesehatan.",
};

function getCategoryIcon(slug) {
  switch (slug) {
    case "healthcare-information-system":
      return ClipboardList;

    case "clinical-patient-care-solutions":
      return HeartPulse;

    case "hospital-operations-management":
      return Activity;

    case "healthcare-consulting-facility-solutions":
      return Building2;

    case "infrastructure-solutions-managed-services":
      return Server;

    case "training-talent-development":
      return GraduationCap;

    default:
      return ClipboardList;
  }
}

function LoadingCards() {
  return (
    <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map(
        (item) => (
          <div
            key={item}
            className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white p-7"
          >
            <div className="h-14 w-14 rounded-xl bg-slate-200" />

            <div className="mt-6 h-5 w-3/4 rounded bg-slate-200" />

            <div className="mt-5 h-4 w-full rounded bg-slate-100" />

            <div className="mt-2 h-4 w-2/3 rounded bg-slate-100" />
          </div>
        )
      )}
    </div>
  );
}

export default function CoreServicesSection() {
  const [categories, setCategories] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const loadCategories =
    useCallback(async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const data =
          await getActiveServiceCategories();

        setCategories(
          Array.isArray(data) ? data : []
        );
      } catch (error) {
        console.error(
          "Kategori layanan gagal dimuat:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Kategori layanan gagal dimuat."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return (
    <section className="container-jmt py-20">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange">
          Our Core Services
        </p>

        <h2 className="mt-4 text-3xl font-bold leading-tight text-[#082B3A] md:text-4xl">
          Solusi menyeluruh untuk ekosistem
          kesehatan
        </h2>

        <p className="mt-5 text-base leading-7 text-slate-500">
          Dari sistem informasi hingga
          pengembangan talenta, seluruh solusi
          dirancang untuk mempercepat transformasi
          operasional Anda.
        </p>
      </div>

      {loading && <LoadingCards />}

      {!loading && errorMessage && (
        <div className="mt-12 rounded-3xl border border-red-200 bg-red-50 px-6 py-10 text-center">
          <p className="font-semibold text-red-700">
            {errorMessage}
          </p>

          <button
            type="button"
            onClick={loadCategories}
            className="mt-5 rounded-xl bg-orange px-5 py-3 text-sm font-semibold text-white"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {!loading &&
        !errorMessage &&
        categories.length === 0 && (
          <div className="mt-12 rounded-3xl border border-slate-200 bg-slate-50 px-6 py-12 text-center">
            <h3 className="text-xl font-bold text-[#082B3A]">
              Kategori layanan belum tersedia
            </h3>

            <p className="mt-3 text-sm text-slate-500">
              Tambahkan kategori melalui
              Supabase atau dashboard admin.
            </p>
          </div>
        )}

      {!loading &&
        !errorMessage &&
        categories.length > 0 && (
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {categories.map((category) => {
              const Icon =
                getCategoryIcon(
                  category.slug
                );

              const description =
                category.description ||
                categoryDescriptions[
                  category.slug
                ] ||
                "Solusi profesional untuk mendukung transformasi fasilitas kesehatan.";

              return (
                <article
                  key={category.id}
                  className="group flex min-h-64 flex-col rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange/40 hover:shadow-xl"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-orange/10 text-orange">
                    <Icon size={27} />
                  </div>

                  <h3 className="mt-6 text-lg font-bold leading-7 text-[#082B3A]">
                    {category.name}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-500">
                    {description}
                  </p>

                  <div className="mt-auto pt-6">
                    <Link
                      to={`/services?category=${encodeURIComponent(
                        category.slug
                      )}`}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-orange transition hover:underline"
                    >
                      Learn More

                      <ArrowRight
                        size={16}
                        className="transition group-hover:translate-x-1"
                      />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
    </section>
  );
}