import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AlertTriangle,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  FileText,
  Handshake,
  History,
  LoaderCircle,
  MapPin,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  getAdminCareers,
  getAdminCompanyProfile,
  getAdminMilestones,
  getAdminPartners,
  getAdminSiteSettings,
} from "../../services/companyAdminService";

import {
  getAdminAwards,
  getAdminCertifications,
} from "../../services/companyCredentialService";

const companySections = [
  {
    key: "about-us",
    label: "About Us",
    description:
      "Kelola nama perusahaan, deskripsi, visi, misi, logo, dan company profile.",
    to: "/admin/company/about-us",
    icon: Building2,
    iconClass:
      "bg-blue-50 text-blue-600 ring-blue-100",
  },
  {
    key: "location",
    label: "Location",
    description:
      "Kelola alamat, email, telepon, WhatsApp, website, dan media sosial.",
    to: "/admin/company/location",
    icon: MapPin,
    iconClass:
      "bg-emerald-50 text-emerald-600 ring-emerald-100",
  },
  {
    key: "milestones",
    label: "Milestones",
    description:
      "Kelola perjalanan, sejarah, pencapaian, tahun, dan gambar milestone.",
    to: "/admin/company/milestones",
    icon: History,
    iconClass:
      "bg-violet-50 text-violet-600 ring-violet-100",
  },
  {
    key: "partners",
    label: "Partners",
    description:
      "Kelola daftar partner, logo, deskripsi, website, dan urutan tampilan.",
    to: "/admin/company/partners",
    icon: Handshake,
    iconClass:
      "bg-cyan-50 text-cyan-600 ring-cyan-100",
  },
  {
    key: "careers",
    label: "Careers",
    description:
      "Kelola lowongan pekerjaan, persyaratan, status, dan tanggal penutupan.",
    to: "/admin/company/careers",
    icon: BriefcaseBusiness,
    iconClass:
      "bg-orange-50 text-[#FF5A0A] ring-orange-100",
  },
  {
    key: "certifications",
    label: "Certifications",
    description:
      "Kelola ISO, Hak Cipta, PSE, BSSN, sertifikat lain, gambar, dan dokumen.",
    to: "/admin/company/certifications",
    icon: ShieldCheck,
    iconClass:
      "bg-blue-50 text-blue-600 ring-blue-100",
  },
  {
    key: "awards",
    label: "Awards & Recognition",
    description:
      "Kelola penghargaan, institusi pemberi, tahun, gambar, status, dan urutan tampil.",
    to: "/admin/company/awards",
    icon: Trophy,
    iconClass:
      "bg-amber-50 text-amber-600 ring-amber-100",
  },
];

function LoadingCompanyDashboard() {
  return (
    <div className="space-y-7">
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3, 4, 5, 6, 7].map(
          (item) => (
            <div
              key={item}
              className="h-52 animate-pulse rounded-3xl border border-slate-200 bg-white p-6"
            >
              <div className="h-12 w-12 rounded-2xl bg-slate-200" />

              <div className="mt-6 h-5 w-32 rounded bg-slate-200" />

              <div className="mt-4 h-4 w-full rounded bg-slate-100" />

              <div className="mt-2 h-4 w-3/4 rounded bg-slate-100" />
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default function AdminCompanyPage() {
  const navigate = useNavigate();

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

  const [
    certifications,
    setCertifications,
  ] = useState([]);

  const [awards, setAwards] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const loadCompanyData =
    useCallback(async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const results =
          await Promise.allSettled([
            getAdminCompanyProfile(),
            getAdminSiteSettings(),
            getAdminMilestones(),
            getAdminPartners(),
            getAdminCareers(),
            getAdminCertifications(),
            getAdminAwards(),
          ]);

        const [
          profileResult,
          settingsResult,
          milestoneResult,
          partnerResult,
          careerResult,
          certificationResult,
          awardResult,
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

          failedModules.push(
            "About Us"
          );

          console.error(
            "Profil perusahaan gagal dimuat:",
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

          failedModules.push(
            "Location"
          );

          console.error(
            "Site Settings gagal dimuat:",
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
            "Milestones gagal dimuat:",
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

          failedModules.push(
            "Partners"
          );

          console.error(
            "Partners gagal dimuat:",
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

          failedModules.push(
            "Careers"
          );

          console.error(
            "Careers gagal dimuat:",
            careerResult.reason
          );
        }

        if (
          certificationResult.status ===
          "fulfilled"
        ) {
          setCertifications(
            certificationResult.value ||
              []
          );
        } else {
          setCertifications([]);

          failedModules.push(
            "Certifications"
          );

          console.error(
            "Certifications gagal dimuat:",
            certificationResult.reason
          );
        }

        if (
          awardResult.status ===
          "fulfilled"
        ) {
          setAwards(
            awardResult.value || []
          );
        } else {
          setAwards([]);

          failedModules.push(
            "Awards & Recognition"
          );

          console.error(
            "Awards gagal dimuat:",
            awardResult.reason
          );
        }

        if (
          failedModules.length > 0
        ) {
          setErrorMessage(
            `Sebagian data gagal dimuat: ${failedModules.join(
              ", "
            )}.`
          );
        }
      } catch (error) {
        console.error(
          "Company Management gagal dimuat:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Company Management gagal dimuat."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadCompanyData();
  }, [loadCompanyData]);

  const summary = useMemo(() => {
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
        (item) =>
          item.status === "open"
      ).length;

    const activeCertifications =
      certifications.filter(
        (item) => item.is_active
      ).length;

    const activeAwards =
      awards.filter(
        (item) => item.is_active
      ).length;

    const profileReady = Boolean(
      profile?.company_name
    );

    const locationReady = Boolean(
      settings?.address ||
        settings?.email ||
        settings?.phone
    );

    return {
      profileReady,
      locationReady,

      milestones:
        milestones.length,

      activeMilestones,

      partners:
        partners.length,

      activePartners,

      careers:
        careers.length,

      openCareers,

      certifications:
        certifications.length,

      activeCertifications,

      awards:
        awards.length,

      activeAwards,
    };
  }, [
    profile,
    settings,
    milestones,
    partners,
    careers,
    certifications,
    awards,
  ]);

  const sectionInformation =
    useMemo(
      () => ({
        "about-us": {
          value:
            summary.profileReady
              ? "Lengkap"
              : "Belum lengkap",

          status:
            summary.profileReady,

          secondaryText:
            "Profil perusahaan utama",
        },

        location: {
          value:
            summary.locationReady
              ? "Lengkap"
              : "Belum lengkap",

          status:
            summary.locationReady,

          secondaryText:
            "Kontak dan lokasi kantor",
        },

        milestones: {
          value:
            summary.milestones,

          status:
            summary.activeMilestones >
            0,

          secondaryText:
            `${summary.activeMilestones} aktif`,
        },

        partners: {
          value:
            summary.partners,

          status:
            summary.activePartners > 0,

          secondaryText:
            `${summary.activePartners} aktif`,
        },

        careers: {
          value:
            summary.careers,

          status:
            summary.openCareers > 0,

          secondaryText:
            `${summary.openCareers} lowongan dibuka`,
        },

        certifications: {
          value:
            summary.certifications,

          status:
            summary.activeCertifications >
            0,

          secondaryText:
            `${summary.activeCertifications} aktif`,
        },

        awards: {
          value:
            summary.awards,

          status:
            summary.activeAwards > 0,

          secondaryText:
            `${summary.activeAwards} aktif`,
        },
      }),
      [summary]
    );

  function handleSectionChange(
    event
  ) {
    const selectedValue =
      event.target.value;

    if (!selectedValue) {
      return;
    }

    navigate(
      `/admin/company/${selectedValue}`
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#FF5A0A]">
            <Settings2 size={14} />
            Company Management
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#082B3A] md:text-4xl">
            Kelola Company
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
            Kelola profil perusahaan,
            lokasi, milestone, partner,
            lowongan pekerjaan,
            sertifikasi, dan penghargaan
            dari satu halaman.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="min-w-64">
            <label
              htmlFor="company-section-select"
              className="sr-only"
            >
              Pilih bagian Company
            </label>

            <select
              id="company-section-select"
              defaultValue=""
              onChange={
                handleSectionChange
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#082B3A] shadow-sm outline-none transition focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
            >
              <option
                value=""
                disabled
              >
                Pilih bagian Company
              </option>

              {companySections.map(
                (section) => (
                  <option
                    key={section.key}
                    value={section.key}
                  >
                    {section.label}
                  </option>
                )
              )}
            </select>
          </div>

          <button
            type="button"
            onClick={loadCompanyData}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#082B3A] shadow-sm transition hover:border-[#FF5A0A] hover:text-[#FF5A0A] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>
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
                Sebagian data belum
                tersedia
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
            className="shrink-0 text-xs font-semibold text-amber-700"
          >
            Tutup
          </button>
        </div>
      )}

      {loading ? (
        <LoadingCompanyDashboard />
      ) : (
        <>
          {/* Ringkasan */}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-3xl bg-[#082B3A] p-6 text-white">
              <FileText
                size={24}
                className="text-[#FF5A0A]"
              />

              <p className="mt-7 text-3xl font-bold">
                {summary.profileReady
                  ? "Siap"
                  : "Periksa"}
              </p>

              <p className="mt-2 text-sm text-white/60">
                Profil perusahaan
              </p>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <History
                size={24}
                className="text-violet-600"
              />

              <p className="mt-7 text-3xl font-bold text-[#082B3A]">
                {summary.milestones}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Total milestone
              </p>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <Handshake
                size={24}
                className="text-cyan-600"
              />

              <p className="mt-7 text-3xl font-bold text-[#082B3A]">
                {summary.partners}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Total partner
              </p>
            </article>

            <article className="rounded-3xl bg-gradient-to-br from-[#FF5A0A] to-[#FF7A35] p-6 text-white">
              <BriefcaseBusiness
                size={24}
              />

              <p className="mt-7 text-3xl font-bold">
                {summary.openCareers}
              </p>

              <p className="mt-2 text-sm text-white/80">
                Lowongan dibuka
              </p>
            </article>
          </section>

          {/* Daftar bagian */}
          <section>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#FF5A0A]">
                Company Modules
              </p>

              <h2 className="mt-3 text-2xl font-bold text-[#082B3A]">
                Pilih data yang akan
                dikelola
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Klik salah satu modul
                untuk membuka halaman
                pengelolaannya.
              </p>
            </div>

            <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {companySections.map(
                (section) => {
                  const Icon =
                    section.icon;

                  const information =
                    sectionInformation[
                      section.key
                    ];

                  return (
                    <Link
                      key={section.key}
                      to={section.to}
                      className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl"
                    >
                      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-slate-50 transition group-hover:bg-orange-50" />

                      <div className="relative">
                        <div className="flex items-start justify-between gap-4">
                          <div
                            className={`flex h-13 w-13 items-center justify-center rounded-2xl p-3 ring-1 ${section.iconClass}`}
                          >
                            <Icon size={23} />
                          </div>

                          <ArrowRight
                            size={20}
                            className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#FF5A0A]"
                          />
                        </div>

                        <h3 className="mt-6 text-xl font-bold text-[#082B3A]">
                          {section.label}
                        </h3>

                        <p className="mt-3 min-h-20 text-sm leading-7 text-slate-500">
                          {
                            section.description
                          }
                        </p>

                        <div className="mt-6 flex items-center justify-between gap-4 border-t border-slate-100 pt-5">
                          <div>
                            <p className="text-lg font-bold text-[#082B3A]">
                              {
                                information.value
                              }
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {
                                information.secondaryText
                              }
                            </p>
                          </div>

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                              information.status
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            <CheckCircle2
                              size={14}
                            />

                            {information.status
                              ? "Tersedia"
                              : "Perlu dilengkapi"}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                }
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}