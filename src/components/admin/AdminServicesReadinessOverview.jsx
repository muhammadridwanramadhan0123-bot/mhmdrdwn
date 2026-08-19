import {
  AlertTriangle,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Eye,
  FileEdit,
  GraduationCap,
  HeartPulse,
  LoaderCircle,
  RefreshCw,
  ServerCog,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  getAdminServiceReadinessSummaries,
} from "../../services/servicePageService";

/*
 * ======================================================
 * PRODUCT ORDER
 * ======================================================
 */

const PRODUCT_ORDER = [
  "simrs-erp",

  "konsultasi-pengelolaan-fasilitas-kesehatan",

  "infrastruktur-it-layanan-pendukung",

  "pelatihan-pengembangan-sdm",
];

/*
 * ======================================================
 * ICON
 * ======================================================
 */

const PRODUCT_ICONS = {
  "simrs-erp":
    HeartPulse,

  "konsultasi-pengelolaan-fasilitas-kesehatan":
    Building2,

  "infrastruktur-it-layanan-pendukung":
    ServerCog,

  "pelatihan-pengembangan-sdm":
    GraduationCap,
};

/*
 * ======================================================
 * SHORT PRODUCT NAME
 * ======================================================
 */

const PRODUCT_SHORT_NAMES = {
  "simrs-erp":
    "SIMRS ERP",

  "konsultasi-pengelolaan-fasilitas-kesehatan":
    "Konsultasi & Pengelolaan Fasilitas",

  "infrastruktur-it-layanan-pendukung":
    "Infrastruktur IT",

  "pelatihan-pengembangan-sdm":
    "Pelatihan & Pengembangan SDM",
};

/*
 * ======================================================
 * STATUS
 * ======================================================
 */

function getStatusClass(
  status
) {
  if (
    status ===
    "published"
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (
    status ===
    "archived"
  ) {
    return "border-slate-300 bg-slate-100 text-slate-600";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

function getStatusLabel(
  status
) {
  if (
    status ===
    "published"
  ) {
    return "Published";
  }

  if (
    status ===
    "archived"
  ) {
    return "Archived";
  }

  return "Draft";
}

/*
 * ======================================================
 * PROGRESS CLASS
 * ======================================================
 */

function getProgressClass(
  progress
) {
  if (
    progress >= 100
  ) {
    return "bg-emerald-500";
  }

  if (
    progress >= 70
  ) {
    return "bg-[#FF5A0A]";
  }

  if (
    progress >= 40
  ) {
    return "bg-amber-500";
  }

  return "bg-red-500";
}

/*
 * ======================================================
 * COMPONENT
 * ======================================================
 */

export default function AdminServicesReadinessOverview({
  services = [],
}) {
  const [
    summaries,
    setSummaries,
  ] = useState({});

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  /*
   * ====================================================
   * MAIN PRODUCTS
   * ====================================================
   */

  const products =
    useMemo(() => {
      const records =
        Array.isArray(
          services
        )
          ? services
          : [];

      return PRODUCT_ORDER
        .map(
          (slug) =>
            records.find(
              (service) =>
                service.slug ===
                slug
            )
        )
        .filter(Boolean);
    }, [services]);

  /*
   * ====================================================
   * LOAD READINESS
   * ====================================================
   */

  const loadReadiness =
    useCallback(
      async () => {
        if (
          products.length ===
          0
        ) {
          setSummaries({});
          setLoading(false);

          return;
        }

        try {
          setLoading(true);
          setErrorMessage("");

          const data =
            await getAdminServiceReadinessSummaries(
              products
            );

          setSummaries(
            data || {}
          );
        } catch (error) {
          console.error(
            "Product readiness gagal dimuat:",
            error
          );

          setSummaries({});

          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Progress Product gagal dimuat."
          );
        } finally {
          setLoading(false);
        }
      },
      [products]
    );

  useEffect(() => {
    loadReadiness();
  }, [loadReadiness]);

  /*
   * ====================================================
   * LOADING
   * ====================================================
   */

  if (
    loading &&
    products.length > 0
  ) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            1,
            2,
            3,
            4,
          ].map(
            (item) => (
              <div
                key={item}
                className="h-[320px] animate-pulse rounded-2xl bg-slate-100"
              />
            )
          )}
        </div>
      </section>
    );
  }

  /*
   * ====================================================
   * RENDER
   * ====================================================
   */

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      {/* HEADER */}

      <div className="border-b border-slate-100 px-5 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-[#FF5A0A]">
              <Sparkles
                size={14}
              />

              Product Overview
            </div>

            <h2 className="mt-4 text-2xl font-bold text-[#082B3A]">
              Kesiapan Product & Services
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
              Pantau status konten, fitur, dan kesiapan publikasi empat Product
              utama JMT dari satu halaman.
            </p>
          </div>

          <button
            type="button"
            onClick={
              loadReadiness
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-[#FF5A0A] hover:text-[#FF5A0A]"
          >
            <RefreshCw
              size={17}
            />

            Refresh Progress
          </button>
        </div>
      </div>

      {/* ERROR */}

      {errorMessage && (
        <div className="mx-5 mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 sm:mx-6 lg:mx-8">
          <AlertTriangle
            size={20}
            className="mt-0.5 shrink-0 text-red-600"
          />

          <p className="text-sm leading-6 text-red-700">
            {errorMessage}
          </p>
        </div>
      )}

      {/* EMPTY */}

      {products.length ===
      0 ? (
        <div className="px-6 py-14 text-center">
          <ShieldAlert
            size={42}
            className="mx-auto text-slate-300"
          />

          <h3 className="mt-5 text-xl font-bold text-[#082B3A]">
            Product utama belum ditemukan
          </h3>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-slate-500">
            Pastikan empat Product utama sudah tersedia pada tabel services.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 p-5 sm:p-6 md:grid-cols-2 xl:grid-cols-4 lg:p-8">
          {products.map(
            (service) => {
              const summary =
                summaries[
                  service.id
                ] || {
                  ready: false,
                  progress: 0,
                  missing_required:
                    0,
                  warning_count:
                    0,

                  sections: {
                    total: 0,
                    published: 0,
                  },

                  items: {
                    total: 0,
                    published: 0,
                  },

                  features: {
                    total: 0,
                    published: 0,
                  },
                };

              const Icon =
                PRODUCT_ICONS[
                  service.slug
                ] ||
                Sparkles;

              const shortName =
                PRODUCT_SHORT_NAMES[
                  service.slug
                ] ||
                service.name;

              return (
                <article
                  key={
                    service.id
                  }
                  className="group flex flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl hover:shadow-slate-900/5"
                >
                  {/* CARD TOP */}

                  <div className="relative bg-gradient-to-br from-[#082B3A] to-[#0A4053] p-5 text-white">
                    <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#FF5A0A]/20 blur-2xl" />

                    <div className="relative">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-orange-300">
                          <Icon
                            size={24}
                          />
                        </div>

                        <span
                          className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${getStatusClass(
                            service.status
                          )}`}
                        >
                          {getStatusLabel(
                            service.status
                          )}
                        </span>
                      </div>

                      <p className="mt-5 text-xs font-bold uppercase tracking-[0.15em] text-orange-300">
                        Product
                      </p>

                      <h3 className="mt-2 min-h-[56px] text-lg font-bold leading-7">
                        {shortName}
                      </h3>
                    </div>
                  </div>

                  {/* CARD BODY */}

                  <div className="flex flex-1 flex-col p-5">
                    {/* READINESS */}

                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                          Kesiapan
                        </p>

                        <p className="mt-1 text-3xl font-bold text-[#082B3A]">
                          {
                            summary.progress
                          }
                          %
                        </p>
                      </div>

                      {summary.ready ? (
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                          <CheckCircle2
                            size={20}
                          />
                        </div>
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                          <ShieldAlert
                            size={20}
                          />
                        </div>
                      )}
                    </div>

                    {/* PROGRESS BAR */}

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${getProgressClass(
                          summary.progress
                        )}`}
                        style={{
                          width: `${Math.min(
                            Math.max(
                              summary.progress,
                              0
                            ),
                            100
                          )}%`,
                        }}
                      />
                    </div>

                    <p className="mt-2 text-xs text-slate-500">
                      {summary.ready
                        ? "Pemeriksaan wajib lengkap"
                        : `${summary.missing_required} pemeriksaan wajib belum selesai`}
                    </p>

                    {/* COUNTERS */}

                    <div className="mt-5 grid grid-cols-3 gap-2">
                      <div className="rounded-xl bg-slate-50 p-3 text-center">
                        <p className="text-lg font-bold text-[#082B3A]">
                          {
                            summary
                              .sections
                              .published
                          }
                          <span className="text-xs font-semibold text-slate-400">
                            /
                            {
                              summary
                                .sections
                                .total
                            }
                          </span>
                        </p>

                        <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          Section
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3 text-center">
                        <p className="text-lg font-bold text-[#082B3A]">
                          {
                            summary
                              .items
                              .published
                          }
                          <span className="text-xs font-semibold text-slate-400">
                            /
                            {
                              summary
                                .items
                                .total
                            }
                          </span>
                        </p>

                        <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          Item
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3 text-center">
                        <p className="text-lg font-bold text-[#082B3A]">
                          {
                            summary
                              .features
                              .published
                          }
                          <span className="text-xs font-semibold text-slate-400">
                            /
                            {
                              summary
                                .features
                                .total
                            }
                          </span>
                        </p>

                        <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          Fitur
                        </p>
                      </div>
                    </div>

                    {/* WARNINGS */}

                    {summary.warning_count >
                      0 && (
                      <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2.5">
                        <AlertTriangle
                          size={15}
                          className="mt-0.5 shrink-0 text-amber-600"
                        />

                        <p className="text-xs leading-5 text-amber-700">
                          {
                            summary.warning_count
                          }{" "}
                          aset pendukung belum lengkap.
                        </p>
                      </div>
                    )}

                    {/* BUTTONS */}

                    <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
                      <Link
                        to={`/admin/services/edit/${service.id}`}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#082B3A] px-3 py-2.5 text-xs font-bold text-white transition hover:bg-[#0A4053]"
                      >
                        <FileEdit
                          size={15}
                        />

                        Edit
                      </Link>

                      <Link
                        to={`/admin/services/preview/${service.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-600 transition hover:border-[#FF5A0A] hover:text-[#FF5A0A]"
                      >
                        <Eye
                          size={15}
                        />

                        Preview
                      </Link>

                      {service.status ===
                        "published" &&
                        service.slug && (
                          <Link
                            to={`/services/${service.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
                          >
                            <ArrowUpRight
                              size={15}
                            />

                            Lihat Halaman Live
                          </Link>
                        )}
                    </div>
                  </div>
                </article>
              );
            }
          )}
        </div>
      )}
    </section>
  );
}