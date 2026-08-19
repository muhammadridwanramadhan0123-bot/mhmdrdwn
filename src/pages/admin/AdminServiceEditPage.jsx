import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  FileText,
  ImageIcon,
  Layers3,
  LayoutDashboard,
  LoaderCircle,
  RefreshCw,
  Rocket,
  Settings2,
} from "lucide-react";

import {
  Link,
  useParams,
  useSearchParams,
} from "react-router-dom";

import ServiceForm from "../../components/admin/ServiceForm";

import AdminServiceOverview from "../../components/admin/AdminServiceOverview";

import AdminServiceFeaturesSection from "../../components/admin/AdminServiceFeaturesSection";

import AdminServicePageContentSection from "../../components/admin/AdminServicePageContentSection";

import AdminInfrastructurePageContentSection from "../../components/admin/AdminInfrastructurePageContentSection";

import AdminServiceMediaSection from "../../components/admin/AdminServiceMediaSection";

import AdminServicePublishPanel from "../../components/admin/AdminServicePublishPanel";

import {
  getServiceById,
  updateService,
} from "../../services/serviceService";

/*
 * ======================================================
 * CONFIG
 * ======================================================
 */

const INFRASTRUCTURE_SERVICE_SLUG =
  "infrastruktur-it-layanan-pendukung";

/*
 * ======================================================
 * TAB CONFIGURATION
 * ======================================================
 */

const TABS = [
  {
    id: "overview",
    label: "Overview",
    description:
      "Ringkasan kesiapan Product",
    icon: LayoutDashboard,
  },
  {
    id: "informasi",
    label: "Informasi",
    description:
      "Data utama, gambar & SEO",
    icon: FileText,
  },
  {
    id: "fitur",
    label: "Fitur & Cakupan",
    description:
      "Feature & hierarchy",
    icon: Layers3,
  },
  {
    id: "konten",
    label: "Konten Halaman",
    description:
      "Section CMS Product",
    icon: Settings2,
  },
  {
    id: "media",
    label: "Media",
    description:
      "Gambar & dokumen",
    icon: ImageIcon,
  },
  {
    id: "publikasi",
    label: "Publikasi",
    description:
      "QC & publication control",
    icon: Rocket,
  },
];

/*
 * ======================================================
 * PAGE
 * ======================================================
 */

export default function AdminServiceEditPage() {
  const { id } =
    useParams();

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  /*
   * ====================================================
   * ACTIVE TAB
   * ====================================================
   */

  const requestedTab =
    searchParams.get(
      "tab"
    );

  const activeTab =
    TABS.some(
      (tab) =>
        tab.id ===
        requestedTab
    )
      ? requestedTab
      : "overview";

  const currentTab =
    TABS.find(
      (tab) =>
        tab.id ===
        activeTab
    ) || TABS[0];

  /*
   * ====================================================
   * STATE
   * ====================================================
   */

  const [
    service,
    setService,
  ] = useState(null);

  const [
    loadingData,
    setLoadingData,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  /*
   * ====================================================
   * LOAD SERVICE
   * ====================================================
   */

  const loadService =
    useCallback(
      async ({
        silent = false,
      } = {}) => {
        if (!id) {
          setErrorMessage(
            "ID Service tidak tersedia."
          );

          setLoadingData(
            false
          );

          return;
        }

        try {
          if (silent) {
            setRefreshing(
              true
            );
          } else {
            setLoadingData(
              true
            );
          }

          setErrorMessage(
            ""
          );

          const data =
            await getServiceById(
              id
            );

          if (!data) {
            throw new Error(
              "Service tidak ditemukan."
            );
          }

          setService(
            data
          );
        } catch (error) {
          console.error(
            "Service gagal dimuat:",
            error
          );

          if (!silent) {
            setService(
              null
            );
          }

          setErrorMessage(
            error instanceof
              Error
              ? error.message
              : "Service gagal dimuat."
          );
        } finally {
          if (silent) {
            setRefreshing(
              false
            );
          } else {
            setLoadingData(
              false
            );
          }
        }
      },
      [id]
    );

  useEffect(() => {
    loadService();
  }, [loadService]);

  /*
   * ====================================================
   * UPDATE SERVICE
   * ====================================================
   */

  async function handleUpdateService(
    values,
    imageFile
  ) {
    if (
      !id ||
      saving
    ) {
      return;
    }

    try {
      setSaving(
        true
      );

      setErrorMessage(
        ""
      );

      setSuccessMessage(
        ""
      );

      const updatedService =
        await updateService(
          id,
          values,
          imageFile
        );

      /*
       * Update state lokal agar seluruh
       * workspace langsung memakai data
       * Service terbaru.
       */

      setService(
        (current) => ({
          ...current,
          ...updatedService,
        })
      );

      setSuccessMessage(
        `Service “${
          updatedService?.name ||
          values?.name ||
          service?.name ||
          "Product"
        }” berhasil diperbarui.`
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error(
        "Service gagal diperbarui:",
        error
      );

      setErrorMessage(
        error instanceof
          Error
          ? error.message
          : "Service gagal diperbarui."
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setSaving(
        false
      );
    }
  }

  /*
   * ====================================================
   * CHANGE TAB
   * ====================================================
   */

  function changeTab(
    tabId
  ) {
    const tabExists =
      TABS.some(
        (tab) =>
          tab.id ===
          tabId
      );

    if (!tabExists) {
      return;
    }

    setSearchParams(
      {
        tab: tabId,
      },
      {
        replace: true,
      }
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /*
   * ====================================================
   * REFRESH
   * ====================================================
   */

  async function handleRefresh() {
    if (refreshing) {
      return;
    }

    setSuccessMessage(
      ""
    );

    await loadService({
      silent: true,
    });
  }

  /*
   * ====================================================
   * LOADING
   * ====================================================
   */

  if (loadingData) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-slate-50">
        <div className="text-center">
          <LoaderCircle
            size={42}
            className="mx-auto animate-spin text-[#FF5A0A]"
          />

          <p className="mt-4 font-semibold text-[#082B3A]">
            Memuat Product...
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Mengambil data
            Product &
            Services dari
            Supabase.
          </p>
        </div>
      </main>
    );
  }

  /*
   * ====================================================
   * SERVICE NOT FOUND
   * ====================================================
   */

  if (!service) {
    return (
      <main className="min-h-screen bg-slate-50 p-5 md:p-8">
        <div className="mx-auto max-w-xl rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <AlertTriangle
            size={40}
            className="mx-auto text-red-500"
          />

          <h1 className="mt-5 text-2xl font-bold text-[#082B3A]">
            Service tidak
            dapat dimuat
          </h1>

          <p className="mt-3 text-sm leading-7 text-red-600">
            {errorMessage ||
              "Service tidak ditemukan."}
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              to="/admin/services"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-[#FF5A0A] hover:text-[#FF5A0A]"
            >
              <ArrowLeft
                size={16}
              />

              Product &
              Services
            </Link>

            <button
              type="button"
              onClick={() =>
                loadService()
              }
              className="inline-flex items-center gap-2 rounded-xl bg-[#082B3A] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0A4053]"
            >
              <RefreshCw
                size={16}
              />

              Coba Lagi
            </button>
          </div>
        </div>
      </main>
    );
  }

  /*
   * ====================================================
   * DERIVED DATA
   * ====================================================
   */

  const isPublished =
    service.status ===
    "published";

  const isInfrastructure =
    service.slug ===
    INFRASTRUCTURE_SERVICE_SLUG;

  const statusLabel =
    service.status ===
    "published"
      ? "Published"
      : service.status ===
          "archived"
        ? "Archived"
        : "Draft";

  const statusClass =
    service.status ===
    "published"
      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
      : service.status ===
          "archived"
        ? "border-white/15 bg-white/10 text-white/60"
        : "border-amber-400/30 bg-amber-400/10 text-amber-300";

  const productOrder =
    service.display_order ??
    service.sort_order ??
    0;

  /*
   * ====================================================
   * RENDER
   * ====================================================
   */

  return (
    <main className="min-h-screen bg-slate-50/80">
      <div className="mx-auto max-w-[1500px] p-4 sm:p-5 md:p-8">
        {/* ==================================================
            TOP NAVIGATION
        ================================================== */}

        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/admin/services"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#FF5A0A]"
          >
            <ArrowLeft
              size={17}
            />

            Product &
            Services
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={
                handleRefresh
              }
              disabled={
                refreshing
              }
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-[#FF5A0A] hover:text-[#FF5A0A] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>

            <Link
              to={`/admin/services/preview/${service.id}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#082B3A] shadow-sm transition hover:border-[#FF5A0A] hover:text-[#FF5A0A]"
            >
              <ExternalLink
                size={16}
              />

              Preview
            </Link>

            {isPublished &&
              service.slug && (
                <Link
                  to={`/services/${service.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#082B3A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0A4053]"
                >
                  <ExternalLink
                    size={16}
                  />

                  Lihat Website
                </Link>
              )}
          </div>
        </div>

        {/* ==================================================
            PRODUCT HEADER
        ================================================== */}

        <section className="relative overflow-hidden rounded-[30px] bg-[#082B3A] px-6 py-7 text-white shadow-xl shadow-slate-900/5 md:px-8 md:py-9">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#FF5A0A]/20 blur-3xl" />

          <div className="pointer-events-none absolute bottom-0 right-1/4 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
            <div className="max-w-4xl">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-300">
                  Product &
                  Services
                  Workspace
                </p>

                {service.is_featured && (
                  <span className="rounded-full border border-orange-300/20 bg-orange-300/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-orange-200">
                    Featured
                  </span>
                )}
              </div>

              <h1 className="mt-3 text-2xl font-bold leading-tight md:text-3xl lg:text-[34px]">
                {service.name}
              </h1>

              {service.slug && (
                <p className="mt-3 break-all text-sm text-white/45">
                  /services/
                  {service.slug}
                </p>
              )}

              {service.short_description && (
                <p className="mt-5 max-w-3xl text-sm leading-7 text-white/65">
                  {
                    service.short_description
                  }
                </p>
              )}
            </div>

            <div className="flex shrink-0 flex-col items-start gap-2 lg:items-end">
              <span
                className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-bold ${statusClass}`}
              >
                {
                  statusLabel
                }
              </span>

              {service.category_name && (
                <span className="max-w-xs text-left text-xs leading-5 text-white/45 lg:text-right">
                  {
                    service.category_name
                  }
                </span>
              )}

              <span className="text-[11px] text-white/35">
                Urutan
                Product:{" "}
                {productOrder}
              </span>
            </div>
          </div>
        </section>

        {/* ==================================================
            SUCCESS MESSAGE
        ================================================== */}

        {successMessage && (
          <div
            role="status"
            className="mt-5 flex items-start justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2
                size={20}
                className="mt-0.5 shrink-0 text-emerald-600"
              />

              <div>
                <p className="font-semibold text-emerald-800">
                  Berhasil
                </p>

                <p className="mt-1 text-sm leading-6 text-emerald-700">
                  {
                    successMessage
                  }
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setSuccessMessage(
                  ""
                )
              }
              className="shrink-0 text-xs font-semibold text-emerald-700 transition hover:text-emerald-900"
            >
              Tutup
            </button>
          </div>
        )}

        {/* ==================================================
            ERROR MESSAGE
        ================================================== */}

        {errorMessage && (
          <div
            role="alert"
            className="mt-5 flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle
                size={20}
                className="mt-0.5 shrink-0 text-red-600"
              />

              <div>
                <p className="font-semibold text-red-800">
                  Terjadi
                  kesalahan
                </p>

                <p className="mt-1 text-sm leading-6 text-red-700">
                  {
                    errorMessage
                  }
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setErrorMessage(
                  ""
                )
              }
              className="shrink-0 text-xs font-semibold text-red-700 transition hover:text-red-900"
            >
              Tutup
            </button>
          </div>
        )}

        {/* ==================================================
            WORKSPACE TABS
        ================================================== */}

        <nav className="sticky top-0 z-30 mt-6 rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-sm backdrop-blur">
          <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {TABS.map(
              (tab) => {
                const Icon =
                  tab.icon;

                const active =
                  activeTab ===
                  tab.id;

                return (
                  <button
                    key={
                      tab.id
                    }
                    type="button"
                    onClick={() =>
                      changeTab(
                        tab.id
                      )
                    }
                    aria-current={
                      active
                        ? "page"
                        : undefined
                    }
                    className={`group flex min-w-0 items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition ${
                      active
                        ? "border-orange-200 bg-orange-50 text-[#082B3A] shadow-sm"
                        : "border-transparent bg-white text-slate-500 hover:bg-slate-50 hover:text-[#082B3A]"
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${
                        active
                          ? "bg-[#FF5A0A] text-white"
                          : "bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-[#082B3A]"
                      }`}
                    >
                      <Icon
                        size={17}
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">
                        {
                          tab.label
                        }
                      </p>

                      <p className="mt-0.5 hidden truncate text-[10px] text-slate-400 2xl:block">
                        {
                          tab.description
                        }
                      </p>
                    </div>
                  </button>
                );
              }
            )}
          </div>
        </nav>

        {/* ==================================================
            ACTIVE TAB INFO
        ================================================== */}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-1">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Workspace
            </p>

            <p className="mt-1 text-sm font-semibold text-[#082B3A]">
              {
                currentTab.label
              }
            </p>
          </div>

          <p className="hidden text-xs text-slate-400 md:block">
            {
              currentTab.description
            }
          </p>
        </div>

        {/* ==================================================
            TAB CONTENT
        ================================================== */}

        <div className="mt-5">
          {/* OVERVIEW */}

          {activeTab ===
            "overview" && (
            <AdminServiceOverview
              service={
                service
              }
              onChangeTab={
                changeTab
              }
            />
          )}

          {/* INFORMASI */}

          {activeTab ===
            "informasi" && (
            <ServiceForm
              key={
                service.id
              }
              initialData={
                service
              }
              onSubmit={
                handleUpdateService
              }
              loading={
                saving
              }
              submitLabel="Simpan Perubahan"
            />
          )}

          {/* FITUR & CAKUPAN */}

          {activeTab ===
            "fitur" && (
            <AdminServiceFeaturesSection
              serviceId={
                service.id
              }
              serviceName={
                service.name ||
                ""
              }
              serviceSlug={
                service.slug ||
                ""
              }
            />
          )}

          {/* ==================================================
              KONTEN HALAMAN
              
              Infrastruktur memakai editor khusus.
              Tiga layanan lain tetap menggunakan CMS lama.
          ================================================== */}

          {activeTab ===
            "konten" &&
            (isInfrastructure ? (
              <AdminInfrastructurePageContentSection
                serviceId={
                  service.id
                }
                serviceName={
                  service.name ||
                  ""
                }
                serviceSlug={
                  service.slug ||
                  ""
                }
              />
            ) : (
              <AdminServicePageContentSection
                serviceId={
                  service.id
                }
                serviceName={
                  service.name ||
                  ""
                }
                serviceSlug={
                  service.slug ||
                  ""
                }
                onChangeTab={
                  changeTab
                }
              />
            ))}

          {/* MEDIA */}

          {activeTab ===
            "media" && (
            <AdminServiceMediaSection
              service={
                service
              }
              onChangeTab={
                changeTab
              }
            />
          )}

          {/* PUBLIKASI */}

          {activeTab ===
            "publikasi" && (
            <AdminServicePublishPanel
              serviceId={
                service.id
              }
              serviceName={
                service.name ||
                ""
              }
              serviceSlug={
                service.slug ||
                ""
              }
              serviceStatus={
                service.status ||
                "draft"
              }
              onChangeTab={
                changeTab
              }
            />
          )}
        </div>

        {/* ==================================================
            BOTTOM WORKSPACE INFO
        ================================================== */}

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-bold text-[#082B3A]">
                Product &
                Services
                Workspace
              </p>

              <p className="mt-1 max-w-3xl text-[11px] leading-5 text-slate-400">
                Perubahan pada
                Informasi,
                Fitur, Konten
                Halaman dan
                Media disimpan
                ke Supabase.
                Status
                publikasi CMS
                dikontrol
                melalui tab
                Publikasi.
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              {activeTab !==
                "overview" && (
                <button
                  type="button"
                  onClick={() =>
                    changeTab(
                      "overview"
                    )
                  }
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 transition hover:border-[#FF5A0A] hover:text-[#FF5A0A]"
                >
                  Overview
                </button>
              )}

              <Link
                to={`/admin/services/preview/${service.id}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#082B3A] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#0A4053]"
              >
                <ExternalLink
                  size={13}
                />

                Preview
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}