import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Handshake,
  History,
  LoaderCircle,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  getAdminCareers,
  getAdminCompanyProfile,
  getAdminMilestones,
  getAdminPartners,
  getAdminSiteSettings,
} from "../../services/companyAdminService";

function isCareerCurrentlyOpen(career) {
  if (career.status !== "open") {
    return false;
  }

  if (!career.closing_date) {
    return true;
  }

  const closingDate = new Date(
    `${career.closing_date}T23:59:59`
  );

  if (Number.isNaN(closingDate.getTime())) {
    return false;
  }

  return closingDate >= new Date();
}

function CompanyDashboardLoading() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="flex items-center justify-between gap-5">
        <div>
          <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />

          <div className="mt-4 h-8 w-56 animate-pulse rounded bg-slate-200" />
        </div>

        <div className="h-11 w-32 animate-pulse rounded-xl bg-slate-200" />
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[1, 2, 3, 4, 5].map((item) => (
          <div
            key={item}
            className="h-40 animate-pulse rounded-2xl bg-slate-100"
          />
        ))}
      </div>
    </section>
  );
}

export default function AdminCompanyDashboardSection() {
  const [profile, setProfile] =
    useState(null);

  const [settings, setSettings] =
    useState(null);

  const [milestones, setMilestones] =
    useState([]);

  const [partners, setPartners] =
    useState([]);

  const [careers, setCareers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const loadCompanyData = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setErrorMessage("");

        const results =
          await Promise.allSettled([
            getAdminCompanyProfile(),
            getAdminSiteSettings(),
            getAdminMilestones(),
            getAdminPartners(),
            getAdminCareers(),
          ]);

        const [
          profileResult,
          settingsResult,
          milestoneResult,
          partnerResult,
          careerResult,
        ] = results;

        const failedModules = [];

        if (
          profileResult.status ===
          "fulfilled"
        ) {
          setProfile(
            profileResult.value
          );
        } else {
          setProfile(null);
          failedModules.push("About Us");

          console.error(
            "Profil Company gagal dimuat:",
            profileResult.reason
          );
        }

        if (
          settingsResult.status ===
          "fulfilled"
        ) {
          setSettings(
            settingsResult.value
          );
        } else {
          setSettings(null);
          failedModules.push("Location");

          console.error(
            "Location Company gagal dimuat:",
            settingsResult.reason
          );
        }

        if (
          milestoneResult.status ===
          "fulfilled"
        ) {
          setMilestones(
            milestoneResult.value || []
          );
        } else {
          setMilestones([]);
          failedModules.push(
            "Milestones"
          );

          console.error(
            "Milestones Company gagal dimuat:",
            milestoneResult.reason
          );
        }

        if (
          partnerResult.status ===
          "fulfilled"
        ) {
          setPartners(
            partnerResult.value || []
          );
        } else {
          setPartners([]);
          failedModules.push("Partners");

          console.error(
            "Partners Company gagal dimuat:",
            partnerResult.reason
          );
        }

        if (
          careerResult.status ===
          "fulfilled"
        ) {
          setCareers(
            careerResult.value || []
          );
        } else {
          setCareers([]);
          failedModules.push("Careers");

          console.error(
            "Careers Company gagal dimuat:",
            careerResult.reason
          );
        }

        if (failedModules.length > 0) {
          setErrorMessage(
            `Sebagian modul gagal dimuat: ${failedModules.join(
              ", "
            )}.`
          );
        }
      } catch (error) {
        console.error(
          "Ringkasan Company gagal dimuat:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Ringkasan Company gagal dimuat."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadCompanyData();
  }, [loadCompanyData]);

  const summary = useMemo(() => {
    const profileReady = Boolean(
      profile?.company_name
    );

    const locationReady = Boolean(
      settings?.address &&
        settings?.email &&
        settings?.phone
    );

    const activeMilestones =
      milestones.filter(
        (item) => item.is_active
      ).length;

    const activePartners =
      partners.filter(
        (item) => item.is_active
      ).length;

    const openCareers =
      careers.filter(
        isCareerCurrentlyOpen
      ).length;

    return {
      profileReady,
      locationReady,

      totalMilestones:
        milestones.length,

      activeMilestones,

      totalPartners: partners.length,

      activePartners,

      totalCareers: careers.length,

      openCareers,
    };
  }, [
    profile,
    settings,
    milestones,
    partners,
    careers,
  ]);

  const companyModules = useMemo(
    () => [
      {
        label: "About Us",

        value: summary.profileReady
          ? "Siap"
          : "Periksa",

        description:
          "Profil dan identitas perusahaan",

        to: "/admin/company/about-us",

        icon: Building2,

        statusReady:
          summary.profileReady,

        iconClass:
          "bg-blue-50 text-blue-600",
      },
      {
        label: "Location",

        value: summary.locationReady
          ? "Siap"
          : "Periksa",

        description:
          "Lokasi dan informasi kontak",

        to: "/admin/company/location",

        icon: MapPin,

        statusReady:
          summary.locationReady,

        iconClass:
          "bg-emerald-50 text-emerald-600",
      },
      {
        label: "Milestones",

        value: `${summary.activeMilestones}/${summary.totalMilestones}`,

        description:
          "Milestone aktif dari seluruh data",

        to: "/admin/company/milestones",

        icon: History,

        statusReady:
          summary.activeMilestones > 0,

        iconClass:
          "bg-violet-50 text-violet-600",
      },
      {
        label: "Partners",

        value: `${summary.activePartners}/${summary.totalPartners}`,

        description:
          "Partner aktif dari seluruh data",

        to: "/admin/company/partners",

        icon: Handshake,

        statusReady:
          summary.activePartners > 0,

        iconClass:
          "bg-cyan-50 text-cyan-600",
      },
      {
        label: "Careers",

        value: `${summary.openCareers}/${summary.totalCareers}`,

        description:
          "Lowongan yang sedang dibuka",

        to: "/admin/company/careers",

        icon: BriefcaseBusiness,

        statusReady:
          summary.openCareers > 0,

        iconClass:
          "bg-orange-50 text-[#FF5A0A]",
      },
    ],
    [summary]
  );

  if (loading) {
    return (
      <CompanyDashboardLoading />
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-col justify-between gap-5 border-b border-slate-100 px-6 py-5 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Building2
              size={20}
              className="text-[#FF5A0A]"
            />

            <h2 className="text-lg font-bold text-[#082B3A]">
              Company Management
            </h2>
          </div>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Ringkasan profil, lokasi,
            milestone, partner, dan Career.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() =>
              loadCompanyData(true)
            }
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-[#FF5A0A] hover:text-[#FF5A0A] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {refreshing ? (
              <LoaderCircle
                size={16}
                className="animate-spin"
              />
            ) : (
              <RefreshCw size={16} />
            )}

            Refresh
          </button>

          <Link
            to="/admin/company"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#082B3A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0A4053]"
          >
            Kelola Company
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>

      {/* Error */}
      {errorMessage && (
        <div className="mx-6 mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertTriangle
            size={19}
            className="mt-0.5 shrink-0 text-amber-600"
          />

          <p className="text-sm leading-6 text-amber-700">
            {errorMessage}
          </p>
        </div>
      )}

      {/* Cards */}
      <div className="grid gap-4 p-6 sm:grid-cols-2 xl:grid-cols-5">
        {companyModules.map(
          (module) => {
            const Icon = module.icon;

            return (
              <Link
                key={module.label}
                to={module.to}
                className="group rounded-2xl border border-slate-200 p-5 transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${module.iconClass}`}
                  >
                    <Icon size={20} />
                  </div>

                  <ArrowUpRight
                    size={17}
                    className="text-slate-300 transition group-hover:text-[#FF5A0A]"
                  />
                </div>

                <p className="mt-5 text-sm font-semibold text-slate-500">
                  {module.label}
                </p>

                <p className="mt-2 text-2xl font-bold text-[#082B3A]">
                  {module.value}
                </p>

                <p className="mt-2 min-h-10 text-xs leading-5 text-slate-400">
                  {module.description}
                </p>

                <div className="mt-4 border-t border-slate-100 pt-4">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      module.statusReady
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    <CheckCircle2
                      size={13}
                    />

                    {module.statusReady
                      ? "Tersedia"
                      : "Perlu diperiksa"}
                  </span>
                </div>
              </Link>
            );
          }
        )}
      </div>
    </section>
  );
}