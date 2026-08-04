import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  FileClock,
  Inbox,
  Mail,
  MessageSquareText,
  Newspaper,
  Plus,
  RefreshCw,
  Star,
  Stethoscope,
} from "lucide-react";
import { Link } from "react-router-dom";

import { getAdminPortfolios } from "../../services/portfolioService";
import { getAdminInsights } from "../../services/insightService";
import { getAdminServices } from "../../services/serviceService";
import { getAdminContactMessages } from "../../services/contactMessageService";
import AdminCompanyDashboardSection from "../../components/admin/AdminCompanyDashboardSection";

/*
 * Status untuk Portfolio, Insight, dan Service.
 */
function getStatusLabel(status) {
  switch (status) {
    case "published":
      return "Published";

    case "archived":
      return "Archived";

    default:
      return "Draft";
  }
}

function getStatusClass(status) {
  switch (status) {
    case "published":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "archived":
      return "border-slate-200 bg-slate-100 text-slate-600";

    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}

/*
 * Status untuk Pesan Masuk.
 */
function getMessageStatusLabel(status) {
  switch (status) {
    case "read":
      return "Dibaca";

    case "replied":
      return "Dibalas";

    case "closed":
      return "Selesai";

    default:
      return "Baru";
  }
}

function getMessageStatusClass(status) {
  switch (status) {
    case "read":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "replied":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "closed":
      return "border-slate-200 bg-slate-100 text-slate-600";

    default:
      return "border-orange-200 bg-orange-50 text-[#FF5A0A]";
  }
}

function formatDate(value) {
  if (!value) {
    return "Tanggal tidak tersedia";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Tanggal tidak tersedia";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getTimestamp(item) {
  return (
    item.updated_at ||
    item.created_at ||
    item.published_at ||
    null
  );
}

function getTimestampValue(item) {
  const timestamp = getTimestamp(item);

  if (!timestamp) {
    return 0;
  }

  const parsedDate = new Date(timestamp);

  if (Number.isNaN(parsedDate.getTime())) {
    return 0;
  }

  return parsedDate.getTime();
}

function getContentTypeClass(type) {
  switch (type) {
    case "Portfolio":
      return "bg-blue-50 text-blue-700";

    case "Insight":
      return "bg-violet-50 text-violet-700";

    case "Service":
      return "bg-cyan-50 text-cyan-700";

    default:
      return "bg-slate-100 text-slate-600";
  }
}

function getContentIcon(type) {
  switch (type) {
    case "Portfolio":
      return BriefcaseBusiness;

    case "Insight":
      return Newspaper;

    case "Service":
      return Stethoscope;

    default:
      return Activity;
  }
}

function LoadingDashboard() {
  return (
    <div className="space-y-7">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(
          (item) => (
            <div
              key={item}
              className="h-40 animate-pulse rounded-3xl border border-slate-200 bg-white p-6"
            >
              <div className="h-4 w-28 rounded bg-slate-200" />

              <div className="mt-6 h-10 w-16 rounded bg-slate-200" />

              <div className="mt-5 h-3 w-40 rounded bg-slate-100" />
            </div>
          )
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,0.8fr)]">
        <div className="h-[460px] animate-pulse rounded-3xl border border-slate-200 bg-white" />

        <div className="h-[460px] animate-pulse rounded-3xl border border-slate-200 bg-white" />
      </div>

      <div className="h-[420px] animate-pulse rounded-3xl border border-slate-200 bg-white" />
    </div>
  );
}

export default function AdminDashboardPage() {
  const [portfolios, setPortfolios] = useState([]);
  const [insights, setInsights] = useState([]);
  const [services, setServices] = useState([]);
  const [messages, setMessages] = useState([]);

  const [loading, setLoading] = useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      /*
       * Semua modul dimuat secara paralel.
       * Jika salah satu gagal, modul lain
       * tetap dapat tampil.
       */
      const results = await Promise.allSettled([
        getAdminPortfolios(),
        getAdminInsights(),
        getAdminServices(),
        getAdminContactMessages(),
      ]);

      const [
        portfolioResult,
        insightResult,
        serviceResult,
        messageResult,
      ] = results;

      const failedModules = [];

      if (portfolioResult.status === "fulfilled") {
        setPortfolios(
          portfolioResult.value || []
        );
      } else {
        setPortfolios([]);
        failedModules.push("Portfolio");

        console.error(
          "Portfolio dashboard gagal dimuat:",
          portfolioResult.reason
        );
      }

      if (insightResult.status === "fulfilled") {
        setInsights(
          insightResult.value || []
        );
      } else {
        setInsights([]);
        failedModules.push("Insight");

        console.error(
          "Insight dashboard gagal dimuat:",
          insightResult.reason
        );
      }

      if (serviceResult.status === "fulfilled") {
        setServices(
          serviceResult.value || []
        );
      } else {
        setServices([]);
        failedModules.push("Services");

        console.error(
          "Services dashboard gagal dimuat:",
          serviceResult.reason
        );
      }

      if (messageResult.status === "fulfilled") {
        setMessages(
          messageResult.value || []
        );
      } else {
        setMessages([]);
        failedModules.push("Pesan Masuk");

        console.error(
          "Pesan masuk dashboard gagal dimuat:",
          messageResult.reason
        );
      }

      if (failedModules.length > 0) {
        setErrorMessage(
          `Sebagian data gagal dimuat: ${failedModules.join(
            ", "
          )}. Gunakan tombol Refresh untuk mencoba kembali.`
        );
      }
    } catch (error) {
      console.error(
        "Dashboard gagal dimuat:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Dashboard gagal dimuat."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  /*
   * Gabungan konten yang mempunyai
   * status publikasi.
   *
   * Pesan tidak dimasukkan karena mempunyai
   * status berbeda: new, read, replied, closed.
   */
  const allContent = useMemo(
    () => [
      ...portfolios,
      ...insights,
      ...services,
    ],
    [portfolios, insights, services]
  );

  const summary = useMemo(() => {
    const published = allContent.filter(
      (item) => item.status === "published"
    ).length;

    const draft = allContent.filter(
      (item) => item.status === "draft"
    ).length;

    const archived = allContent.filter(
      (item) => item.status === "archived"
    ).length;

    const featured = allContent.filter(
      (item) => Boolean(item.is_featured)
    ).length;

    return {
      total: allContent.length,
      published,
      draft,
      archived,
      featured,
    };
  }, [allContent]);

  const messageSummary = useMemo(() => {
    const newMessages = messages.filter(
      (message) => message.status === "new"
    ).length;

    const readMessages = messages.filter(
      (message) => message.status === "read"
    ).length;

    const repliedMessages = messages.filter(
      (message) => message.status === "replied"
    ).length;

    const closedMessages = messages.filter(
      (message) => message.status === "closed"
    ).length;

    return {
      total: messages.length,
      new: newMessages,
      read: readMessages,
      replied: repliedMessages,
      closed: closedMessages,
    };
  }, [messages]);

  const statistics = useMemo(
    () => [
      {
        label: "Total Portfolio",
        value: portfolios.length,
        description:
          "Seluruh project yang tersimpan",
        icon: BriefcaseBusiness,
        iconClass:
          "bg-blue-50 text-blue-600 ring-blue-100",
        to: "/admin/portfolio",
      },
      {
        label: "Total Insight",
        value: insights.length,
        description:
          "Seluruh artikel dan berita",
        icon: Newspaper,
        iconClass:
          "bg-violet-50 text-violet-600 ring-violet-100",
        to: "/admin/insight",
      },
      {
        label: "Total Services",
        value: services.length,
        description:
          "Seluruh produk dan layanan",
        icon: Stethoscope,
        iconClass:
          "bg-cyan-50 text-cyan-600 ring-cyan-100",
        to: "/admin/services",
      },
      {
        label: "Pesan Masuk",
        value: messageSummary.total,
        description:
          "Seluruh pesan dari website",
        icon: Mail,
        iconClass:
          "bg-indigo-50 text-indigo-600 ring-indigo-100",
        to: "/admin/messages",
      },
      {
        label: "Published",
        value: summary.published,
        description:
          "Konten yang tampil di website",
        icon: CheckCircle2,
        iconClass:
          "bg-emerald-50 text-emerald-600 ring-emerald-100",
      },
      {
        label: "Draft",
        value: summary.draft,
        description:
          "Konten yang belum dipublikasikan",
        icon: FileClock,
        iconClass:
          "bg-amber-50 text-amber-600 ring-amber-100",
      },
      {
        label: "Featured",
        value: summary.featured,
        description:
          "Konten unggulan di homepage",
        icon: Star,
        iconClass:
          "bg-orange-50 text-[#FF5A0A] ring-orange-100",
      },
      {
        label: "Pesan Baru",
        value: messageSummary.new,
        description:
          "Pesan yang belum dibaca",
        icon: Inbox,
        iconClass:
          "bg-red-50 text-red-600 ring-red-100",
        to: "/admin/messages",
      },
    ],
    [
      portfolios.length,
      insights.length,
      services.length,
      summary,
      messageSummary,
    ]
  );

  const recentContent = useMemo(() => {
    const portfolioItems = portfolios.map(
      (portfolio) => ({
        id: portfolio.id,
        type: "Portfolio",
        title:
          portfolio.title ||
          "Portfolio tanpa judul",
        subtitle:
          portfolio.category ||
          "Tanpa kategori",
        status: portfolio.status,
        isFeatured: Boolean(
          portfolio.is_featured
        ),
        timestamp: getTimestamp(portfolio),
        timestampValue:
          getTimestampValue(portfolio),
        editUrl: `/admin/portfolio/edit/${portfolio.id}`,
      })
    );

    const insightItems = insights.map(
      (insight) => ({
        id: insight.id,
        type: "Insight",
        title:
          insight.title ||
          "Insight tanpa judul",
        subtitle:
          insight.category ||
          "Tanpa kategori",
        status: insight.status,
        isFeatured: Boolean(
          insight.is_featured
        ),
        timestamp: getTimestamp(insight),
        timestampValue:
          getTimestampValue(insight),
        editUrl: `/admin/insight/edit/${insight.id}`,
      })
    );

    const serviceItems = services.map(
      (service) => ({
        id: service.id,
        type: "Service",
        title:
          service.name ||
          "Service tanpa nama",
        subtitle:
          service.category_name ||
          "Tanpa kategori",
        status: service.status,
        isFeatured: Boolean(
          service.is_featured
        ),
        timestamp: getTimestamp(service),
        timestampValue:
          getTimestampValue(service),
        editUrl: `/admin/services/edit/${service.id}`,
      })
    );

    return [
      ...portfolioItems,
      ...insightItems,
      ...serviceItems,
    ]
      .sort(
        (firstItem, secondItem) =>
          secondItem.timestampValue -
          firstItem.timestampValue
      )
      .slice(0, 8);
  }, [portfolios, insights, services]);

  const recentMessages = useMemo(() => {
    return [...messages]
      .sort((firstMessage, secondMessage) => {
        const firstTimestamp = new Date(
          firstMessage.created_at || 0
        ).getTime();

        const secondTimestamp = new Date(
          secondMessage.created_at || 0
        ).getTime();

        return (
          secondTimestamp - firstTimestamp
        );
      })
      .slice(0, 5);
  }, [messages]);

  const statusItems = useMemo(() => {
    const total = summary.total;

    function createPercentage(value) {
      if (total === 0) {
        return 0;
      }

      return Math.round(
        (value / total) * 100
      );
    }

    return [
      {
        label: "Published",
        value: summary.published,
        percentage: createPercentage(
          summary.published
        ),
        barClass: "bg-emerald-500",
      },
      {
        label: "Draft",
        value: summary.draft,
        percentage: createPercentage(
          summary.draft
        ),
        barClass: "bg-amber-500",
      },
      {
        label: "Archived",
        value: summary.archived,
        percentage: createPercentage(
          summary.archived
        ),
        barClass: "bg-slate-400",
      },
    ];
  }, [summary]);

  return (
    <div className="space-y-8">
      {/* Header dashboard */}
      <section className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#FF5A0A]">
            <Activity size={14} />
            Overview
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#082B3A] md:text-4xl">
            Dashboard
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
            Pantau Portfolio, Insight, Services,
            serta pesan pelanggan Jasa Medika
            Transmedic dari satu tempat.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={loadDashboardData}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#082B3A] shadow-sm transition hover:border-[#FF5A0A] hover:text-[#FF5A0A] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={
                loading ? "animate-spin" : ""
              }
            />

            Refresh
          </button>

          <Link
            to="/admin/portfolio/create"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-200 bg-white px-4 py-3 text-sm font-semibold text-[#FF5A0A] shadow-sm transition hover:border-[#FF5A0A] hover:bg-orange-50"
          >
            <Plus size={17} />
            Portfolio
          </Link>

          <Link
            to="/admin/insight/create"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-200 bg-white px-4 py-3 text-sm font-semibold text-[#FF5A0A] shadow-sm transition hover:border-[#FF5A0A] hover:bg-orange-50"
          >
            <Plus size={17} />
            Insight
          </Link>

          <Link
            to="/admin/services/create"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF5A0A] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:bg-[#E94F00]"
          >
            <Plus size={17} />
            Service
          </Link>
        </div>
      </section>

      {/* Peringatan */}
      {errorMessage && (
        <div
          role="alert"
          className="flex items-start justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle
              size={21}
              className="mt-0.5 shrink-0 text-amber-600"
            />

            <div>
              <p className="font-semibold text-amber-800">
                Sebagian data belum tersedia
              </p>

              <p className="mt-1 text-sm leading-6 text-amber-700">
                {errorMessage}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setErrorMessage("")
            }
            className="shrink-0 text-xs font-semibold text-amber-700 hover:text-amber-900"
          >
            Tutup
          </button>
        </div>
      )}

      {loading ? (
        <LoadingDashboard />
      ) : (
        <>
          {/* Statistik */}
          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {statistics.map((item) => {
              const Icon = item.icon;

              const cardContent = (
                <>
                  <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-slate-50 transition group-hover:bg-orange-50" />

                  <div className="relative flex items-start justify-between gap-5">
                    <div>
                      <p className="text-sm font-semibold text-slate-500">
                        {item.label}
                      </p>

                      <p className="mt-3 text-4xl font-bold tracking-tight text-[#082B3A]">
                        {item.value}
                      </p>
                    </div>

                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1 ${item.iconClass}`}
                    >
                      <Icon size={22} />
                    </div>
                  </div>

                  <div className="relative mt-5 flex items-center justify-between gap-3">
                    <p className="text-xs leading-5 text-slate-400">
                      {item.description}
                    </p>

                    {item.to && (
                      <ArrowUpRight
                        size={16}
                        className="shrink-0 text-slate-300 transition group-hover:text-[#FF5A0A]"
                      />
                    )}
                  </div>
                </>
              );

              if (item.to) {
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl"
                  >
                    {cardContent}
                  </Link>
                );
              }

              return (
                <article
                  key={item.label}
                  className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl"
                >
                  {cardContent}
                </article>
              );
            })}
          </section>

           {/* Ringkasan Company */}
          <AdminCompanyDashboardSection />

          {/* Konten utama */}
          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.85fr)]">
            {/* Aktivitas terbaru */}
            <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-6 py-5">
                <div>
                  <div className="flex items-center gap-2">
                    <Clock3
                      size={19}
                      className="text-[#FF5A0A]"
                    />

                    <h2 className="text-lg font-bold text-[#082B3A]">
                      Aktivitas Konten Terbaru
                    </h2>
                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    Konten yang terakhir dibuat atau
                    diperbarui.
                  </p>
                </div>

                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500">
                  {recentContent.length} aktivitas
                </span>
              </div>

              {recentContent.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <Activity size={29} />
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-[#082B3A]">
                    Belum ada aktivitas
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Tambahkan Portfolio, Insight, atau
                    Service untuk mulai mengelola konten.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentContent.map((item) => {
                    const Icon = getContentIcon(
                      item.type
                    );

                    return (
                      <div
                        key={`${item.type}-${item.id}`}
                        className="group flex flex-col gap-4 px-6 py-5 transition hover:bg-slate-50/80 sm:flex-row sm:items-center"
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-[#082B3A] transition group-hover:bg-orange-50 group-hover:text-[#FF5A0A]">
                            <Icon size={21} />
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${getContentTypeClass(
                                  item.type
                                )}`}
                              >
                                {item.type}
                              </span>

                              {item.isFeatured && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-600">
                                  <Star
                                    size={12}
                                    fill="currentColor"
                                  />
                                  Featured
                                </span>
                              )}
                            </div>

                            <p className="mt-2 truncate font-semibold text-[#082B3A]">
                              {item.title}
                            </p>

                            <p className="mt-1 truncate text-xs text-slate-400">
                              {item.subtitle} •{" "}
                              {formatDate(
                                item.timestamp
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 sm:justify-end">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusClass(
                              item.status
                            )}`}
                          >
                            {getStatusLabel(
                              item.status
                            )}
                          </span>

                          <Link
                            to={item.editUrl}
                            aria-label={`Edit ${item.title}`}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-[#FF5A0A] hover:text-[#FF5A0A]"
                          >
                            <ArrowUpRight
                              size={17}
                            />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </article>

            {/* Ringkasan kanan */}
            <aside className="space-y-6">
              <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#FF5A0A]">
                      Content Health
                    </p>

                    <h2 className="mt-2 text-xl font-bold text-[#082B3A]">
                      Status Publikasi
                    </h2>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-[#FF5A0A]">
                    <Activity size={21} />
                  </div>
                </div>

                <div className="mt-7 space-y-6">
                  {statusItems.map((item) => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-sm font-semibold text-slate-600">
                          {item.label}
                        </p>

                        <p className="text-sm font-bold text-[#082B3A]">
                          {item.value}

                          <span className="ml-1 font-normal text-slate-400">
                            ({item.percentage}%)
                          </span>
                        </p>
                      </div>

                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${item.barClass}`}
                          style={{
                            width: `${item.percentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-7 rounded-2xl bg-[#082B3A] p-5 text-white">
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
                    Total Konten
                  </p>

                  <div className="mt-2 flex items-end justify-between gap-4">
                    <p className="text-4xl font-bold">
                      {summary.total}
                    </p>

                    <Activity
                      size={28}
                      className="text-[#FF5A0A]"
                    />
                  </div>

                  <p className="mt-3 text-xs leading-5 text-white/60">
                    Gabungan Portfolio, Insight, dan
                    Services.
                  </p>
                </div>
              </article>

              {/* Akses cepat */}
              <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-[#082B3A]">
                  Kelola Data
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Akses cepat ke setiap modul.
                </p>

                <div className="mt-5 space-y-3">
                  {[
                    {
                      label: "Portfolio",
                      value: portfolios.length,
                      to: "/admin/portfolio",
                      icon: BriefcaseBusiness,
                    },
                    {
                      label: "Insight",
                      value: insights.length,
                      to: "/admin/insight",
                      icon: Newspaper,
                    },
                    {
                      label: "Services",
                      value: services.length,
                      to: "/admin/services",
                      icon: Stethoscope,
                    },
                    {
                      label: "Pesan Masuk",
                      value: messages.length,
                      to: "/admin/messages",
                      icon: Mail,
                    },
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.label}
                        to={item.to}
                        className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-200 px-4 py-3 transition hover:border-orange-200 hover:bg-orange-50/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-[#082B3A] transition group-hover:bg-white group-hover:text-[#FF5A0A]">
                            <Icon size={18} />
                          </div>

                          <span className="text-sm font-semibold text-[#082B3A]">
                            {item.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                            {item.value}
                          </span>

                          <ArrowUpRight
                            size={16}
                            className="text-slate-400 transition group-hover:text-[#FF5A0A]"
                          />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </article>
            </aside>
          </section>

          {/* Pesan masuk terbaru */}
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-6 py-5">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#FF5A0A]">
                    <Inbox size={19} />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-[#082B3A]">
                      Pesan Masuk Terbaru
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Pesan terbaru dari halaman
                      Contact Us.
                    </p>
                  </div>
                </div>
              </div>

              <Link
                to="/admin/messages"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#FF5A0A] transition hover:text-[#E94F00]"
              >
                Lihat Semua Pesan
                <ArrowRight size={16} />
              </Link>
            </div>

            {recentMessages.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <MessageSquareText
                    size={29}
                  />
                </div>

                <h3 className="mt-5 text-lg font-bold text-[#082B3A]">
                  Belum ada pesan masuk
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Pesan dari formulir Contact Us
                  akan tampil di bagian ini.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentMessages.map((message) => {
                  const displayName =
                    message.display_name ||
                    message.full_name ||
                    message.name ||
                    "Tanpa nama";

                  const subject =
                    message.subject ||
                    "Pesan Kontak";

                  return (
                    <Link
                      key={message.id}
                      to={`/admin/messages/${message.id}`}
                      className={`group flex flex-col gap-4 px-6 py-5 transition hover:bg-slate-50/80 md:flex-row md:items-center ${
                        message.status === "new"
                          ? "bg-orange-50/30"
                          : ""
                      }`}
                    >
                      <div className="flex min-w-0 flex-1 items-start gap-4">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                            message.status === "new"
                              ? "bg-orange-100 text-[#FF5A0A]"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <Mail size={20} />
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate font-semibold text-[#082B3A]">
                              {displayName}
                            </p>

                            {message.status ===
                              "new" && (
                              <span className="h-2 w-2 rounded-full bg-[#FF5A0A]" />
                            )}
                          </div>

                          <p className="mt-1 truncate text-sm font-medium text-slate-600">
                            {subject}
                          </p>

                          <p className="mt-2 line-clamp-1 text-xs leading-5 text-slate-400">
                            {message.message ||
                              "Tidak ada isi pesan."}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4 md:justify-end">
                        <div className="text-left md:text-right">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${getMessageStatusClass(
                              message.status
                            )}`}
                          >
                            {getMessageStatusLabel(
                              message.status
                            )}
                          </span>

                          <p className="mt-2 text-xs text-slate-400">
                            {formatDate(
                              message.created_at
                            )}
                          </p>
                        </div>

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition group-hover:border-[#FF5A0A] group-hover:text-[#FF5A0A]">
                          <ArrowUpRight
                            size={17}
                          />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}