import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  ArrowUpRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  Cpu,
  Factory,
  FileText,
  GraduationCap,
  HeartPulse,
  PackageCheck,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  UsersRound,
} from "lucide-react";

import {
  CTA,
  PageHero,
  SectionHeading,
} from "../../components/Common";

import {
  getCompanyProfile,
} from "../../services/companyService";

import {
  getActiveAwards,
  getActiveCertifications,
} from "../../services/companyCredentialService";

import {
  useLanguage,
} from "../../contexts/LanguageContext";

import gedungPerusahaan from "../../assets/images/gedung.webp";


function normalizeMissionList(
  value,
  fallbackItems = []
) {
  if (!value) {
    return fallbackItems;
  }

  if (Array.isArray(value)) {
    const result = value
      .map((item) =>
        String(item || "").trim()
      )
      .filter(Boolean);

    return result.length > 0
      ? result
      : fallbackItems;
  }

  const text = String(value).trim();

  if (!text) {
    return fallbackItems;
  }

  try {
    const parsed = JSON.parse(text);

    if (Array.isArray(parsed)) {
      const result = parsed
        .map((item) =>
          String(item || "").trim()
        )
        .filter(Boolean);

      if (result.length > 0) {
        return result;
      }
    }
  } catch {
    // Gunakan pemisahan teks biasa.
  }

  const result = text
    .split(/\r?\n|;/)
    .map((item) =>
      item
        .replace(/^[-•]\s*/, "")
        .trim()
    )
    .filter(Boolean);

  return result.length > 0
    ? result
    : fallbackItems;
}


function getCertificationCategoryClass(
  category
) {
  switch (category) {
    case "ISO":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "Hak Cipta":
      return "border-violet-200 bg-violet-50 text-violet-700";

    case "PSE":
      return "border-cyan-200 bg-cyan-50 text-cyan-700";

    case "BSSN":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "Sertifikat Lain":
    default:
      return "border-slate-200 bg-slate-100 text-slate-700";
  }
}


function AboutPageLoading() {
  return (
    <>
      <div className="h-[420px] animate-pulse bg-slate-200" />

      <section className="container-jmt py-20">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="h-[420px] animate-pulse rounded-3xl bg-slate-200" />

          <div>
            <div className="h-5 w-28 animate-pulse rounded bg-slate-200" />

            <div className="mt-5 h-12 w-3/4 animate-pulse rounded bg-slate-200" />

            <div className="mt-8 space-y-3">
              <div className="h-4 animate-pulse rounded bg-slate-100" />
              <div className="h-4 animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-4/5 animate-pulse rounded bg-slate-100" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}


export default function CompanyAboutPage() {
  const {
    language,
    t,
  } = useLanguage();

  const tr = useCallback(
    (idText, enText) =>
      language === "en"
        ? enText
        : idText,
    [language]
  );

  const [profile, setProfile] =
    useState(null);

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


  const fallbackMission = useMemo(
    () => [
      t(
        "company.aboutPage.fallbackMission1",
        "Mengembangkan perangkat lunak Sistem Informasi Manajemen Rumah Sakit dan solusi kesehatan yang berkualitas."
      ),
      t(
        "company.aboutPage.fallbackMission2",
        "Memberikan layanan konsultasi dalam bidang teknologi informasi rumah sakit dan layanan kesehatan."
      ),
      t(
        "company.aboutPage.fallbackMission3",
        "Menghadirkan solusi yang meningkatkan efektivitas penggunaan sistem informasi kesehatan."
      ),
      t(
        "company.aboutPage.fallbackMission4",
        "Mendukung kegiatan pendidikan dan penelitian dalam bidang sistem informasi serta layanan kesehatan."
      ),
    ],
    [language, t]
  );


  const businessUnits = useMemo(
    () => [
      {
        title: t(
          "company.aboutPage.healthcareOperator",
          "Operator Layanan Kesehatan"
        ),
        description: t(
          "company.aboutPage.healthcareOperatorDescription",
          "Solusi manajemen dan operasional layanan kesehatan, termasuk sistem digital terintegrasi serta pendampingan transformasi rumah sakit dan klinik."
        ),
        icon: HeartPulse,
      },
      {
        title: t(
          "company.aboutPage.facilityManagement",
          "Manajemen Fasilitas"
        ),
        description: t(
          "company.aboutPage.facilityManagementDescription",
          "Layanan perencanaan, desain, manajemen teknik, interior, dan pengelolaan fasilitas untuk mendukung operasional yang optimal."
        ),
        icon: Building2,
      },
      {
        title: t(
          "company.aboutPage.industryTraining",
          "Pelatihan Industri"
        ),
        description: t(
          "company.aboutPage.industryTrainingDescription",
          "Program pelatihan berbasis kebutuhan industri teknologi informasi dengan pendekatan praktis dan materi yang relevan."
        ),
        icon: GraduationCap,
      },
      {
        title: t(
          "company.aboutPage.supplyChain",
          "Manajemen Rantai Pasok"
        ),
        description: t(
          "company.aboutPage.supplyChainDescription",
          "Pengelolaan rantai pasok yang terintegrasi untuk mendukung ketersediaan logistik, peralatan medis, dan kebutuhan operasional."
        ),
        icon: PackageCheck,
      },
    ],
    [language, t]
  );


  const companyStatistics = useMemo(
    () => [
      {
        value: "100+",
        label: t(
          "company.aboutPage.healthcareClients",
          "Klien Fasilitas Kesehatan"
        ),
        description: t(
          "company.aboutPage.healthcareClientsDescription",
          "Rumah sakit, klinik, dan fasilitas pelayanan kesehatan di berbagai wilayah Indonesia."
        ),
        icon: Building2,
      },
      {
        value: "150+",
        label: t(
          "company.aboutPage.professionals",
          "Tenaga Profesional"
        ),
        description: t(
          "company.aboutPage.professionalsDescription",
          "Programmer dan tenaga profesional yang mendukung pengembangan serta implementasi solusi."
        ),
        icon: UsersRound,
      },
      {
        value: "20+",
        label: t(
          "company.aboutPage.yearsExperience",
          "Tahun Pengalaman"
        ),
        description: t(
          "company.aboutPage.yearsExperienceDescription",
          "Pengalaman ekosistem perusahaan dalam teknologi informasi dan layanan kesehatan."
        ),
        icon: ShieldCheck,
      },
    ],
    [language, t]
  );


  const subsidiaryItems = useMemo(
    () => [
      {
        name: "Netkrom Solusindo",
        category:
          "Network Infrastructure & Software Engineering",
        description: t(
          "company.aboutPage.subsidiaryNetkrom",
          "Berfokus pada layanan jaringan komputer, rekayasa perangkat lunak, dan implementasi teknologi informasi untuk sektor kesehatan, pemerintah, dan perusahaan."
        ),
        website:
          "https://netkromsolution.com",
        icon: Cpu,
      },
      {
        name: "Transindo Data Perkasa",
        category:
          "Healthcare Information System",
        description: t(
          "company.aboutPage.subsidiaryTransindo",
          "Penyedia layanan Sistem Informasi Manajemen Rumah Sakit berbasis web untuk fasilitas kesehatan, pemerintah, dan sektor swasta."
        ),
        website:
          "https://transindodata.com",
        icon: HeartPulse,
      },
      {
        name: "Jasamedika Saranatama",
        category:
          "Hospital Information System",
        description: t(
          "company.aboutPage.subsidiaryJasamedika",
          "Perusahaan pengembang Sistem Informasi Manajemen Rumah Sakit yang telah menghadirkan berbagai solusi digital untuk fasilitas kesehatan Indonesia."
        ),
        website:
          "https://jasamedika.co.id",
        icon: Building2,
      },
      {
        name: "TéMP",
        category:
          "Facility & Interior Management",
        description: t(
          "company.aboutPage.subsidiaryTemp",
          "Penyedia solusi furnitur, interior, dan pengelolaan fasilitas dengan pendekatan terintegrasi sesuai kebutuhan mitra dan klien."
        ),
        website:
          "https://temp.co.id",
        icon: Factory,
      },
      {
        name: "Multi Variat Indonesia",
        category:
          "Internet of Things",
        description: t(
          "company.aboutPage.subsidiaryMvi",
          "Mengembangkan solusi Internet of Things untuk mendukung integrasi perangkat, data, dan sistem operasional."
        ),
        website: "",
        icon: Sparkles,
      },
      {
        name: "Trisprima Usahajaya",
        category:
          "Healthcare Logistics Management",
        description: t(
          "company.aboutPage.subsidiaryTrisprima",
          "Mendukung pengelolaan logistik farmasi, alat kesehatan, dan bahan medis habis pakai agar lebih terpantau dan efisien."
        ),
        website:
          "https://trisprima.com",
        icon: PackageCheck,
      },
    ],
    [language, t]
  );


  const loadCompanyData =
    useCallback(async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const results =
          await Promise.allSettled([
            getCompanyProfile(
              language
            ),

            /*
             * Tahap 8.4M nanti:
             * service Certification dan Award
             * akan menerima language juga.
             */
            getActiveCertifications(),
            getActiveAwards(),
          ]);

        const [
          profileResult,
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
            tr(
              "profil perusahaan",
              "company profile"
            )
          );

          console.error(
            "Profil perusahaan gagal dimuat:",
            profileResult.reason
          );
        }

        if (
          certificationResult.status ===
          "fulfilled"
        ) {
          setCertifications(
            Array.isArray(
              certificationResult.value
            )
              ? certificationResult.value
              : []
          );
        } else {
          setCertifications([]);

          failedModules.push(
            tr(
              "sertifikasi",
              "certifications"
            )
          );

          console.error(
            "Sertifikasi gagal dimuat:",
            certificationResult.reason
          );
        }

        if (
          awardResult.status ===
          "fulfilled"
        ) {
          setAwards(
            Array.isArray(
              awardResult.value
            )
              ? awardResult.value
              : []
          );
        } else {
          setAwards([]);

          failedModules.push(
            tr(
              "penghargaan",
              "awards"
            )
          );

          console.error(
            "Penghargaan gagal dimuat:",
            awardResult.reason
          );
        }

        if (
          failedModules.length > 0
        ) {
          setErrorMessage(
            tr(
              `Sebagian data backend gagal dimuat: ${failedModules.join(
                ", "
              )}.`,
              `Some backend data could not be loaded: ${failedModules.join(
                ", "
              )}.`
            )
          );
        }
      } catch (error) {
        console.error(
          "Halaman About Us gagal dimuat:",
          error
        );

        setProfile(null);
        setCertifications([]);
        setAwards([]);

        setErrorMessage(
          tr(
            "Halaman About Us gagal dimuat.",
            "The About Us page could not be loaded."
          )
        );
      } finally {
        setLoading(false);
      }
    }, [
      language,
      tr,
    ]);


  useEffect(() => {
    loadCompanyData();
  }, [loadCompanyData]);


  const missionItems = useMemo(
    () =>
      normalizeMissionList(
        profile?.mission,
        fallbackMission
      ),
    [
      profile?.mission,
      fallbackMission,
    ]
  );


  const companyName =
    profile?.company_name ||
    "Jasa Medika Transmedic Group";

  const companyDescription =
    profile?.short_description ||
    t(
      "company.aboutPage.fallbackDescription",
      "Jasa Medika Transmedic Group adalah grup perusahaan yang berfokus pada inovasi dan pengembangan solusi terintegrasi di bidang layanan kesehatan."
    );

  const companyVision =
    profile?.vision ||
    t(
      "company.aboutPage.fallbackVision",
      "Menjadi perusahaan terdepan dalam menyediakan dan mengembangkan solusi teknologi informasi yang tepat bagi fasilitas kesehatan di Indonesia."
    );


  function getCertificationCategoryLabel(
    category
  ) {
    switch (category) {
      case "Hak Cipta":
        return t(
          "company.aboutPage.copyright",
          "Hak Cipta"
        );

      case "Sertifikat Lain":
        return t(
          "company.aboutPage.otherCertificate",
          "Sertifikat Lain"
        );

      default:
        return category;
    }
  }


  if (loading) {
    return <AboutPageLoading />;
  }


  return (
    <>
      <PageHero
        eyebrow={t(
          "company.aboutPage.heroEyebrow",
          "Perusahaan — Tentang Kami"
        )}
        title={t(
          "company.aboutPage.heroTitle",
          "Membangun Ekosistem Kesehatan yang Terintegrasi"
        )}
        description={t(
          "company.aboutPage.heroDescription",
          "Menghadirkan inovasi, teknologi, dan layanan terintegrasi untuk mendukung transformasi fasilitas kesehatan Indonesia."
        )}
      />


      {errorMessage && (
        <section className="container-jmt pt-8">
          <div className="flex flex-col justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <AlertTriangle
                size={21}
                className="mt-0.5 shrink-0 text-amber-600"
              />

              <div>
                <p className="font-semibold text-amber-800">
                  {t(
                    "company.common.backendWarning",
                    "Sebagian data backend belum dapat dimuat"
                  )}
                </p>

                <p className="mt-1 text-sm leading-6 text-amber-700">
                  {errorMessage}{" "}
                  {t(
                    "company.common.backendWarningDescription",
                    "Bagian lain pada halaman tetap dapat ditampilkan."
                  )}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={loadCompanyData}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
            >
              <RefreshCw size={16} />

              {t(
                "company.common.reload",
                "Muat Ulang"
              )}
            </button>
          </div>
        </section>
      )}


      <section className="container-jmt grid gap-12 py-20 lg:grid-cols-2 lg:items-center">
        <div className="relative min-h-[480px] overflow-hidden rounded-[2rem] shadow-xl">
          <img
            src={gedungPerusahaan}
            alt={tr(
              "Gedung perusahaan Jasa Medika Transmedic",
              "Jasa Medika Transmedic company building"
            )}
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#082B3A]/88 via-[#082B3A]/45 to-[#082B3A]/10" />

          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />

          <div className="relative flex h-full flex-col justify-end p-8 text-white md:p-12">
            <span className="inline-flex w-fit rounded-full bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
              Jasa Medika Transmedic
            </span>
          </div>
        </div>


        <div>
          <SectionHeading
            kicker={t(
              "company.aboutPage.sectionKicker",
              "Tentang Kami"
            )}
            title={companyName}
          />

          <p className="mt-7 text-base leading-8 text-slate-600">
            {companyDescription}
          </p>

          <p className="mt-5 text-base leading-8 text-slate-600">
            {t(
              "company.aboutPage.paragraphTwo",
              "Melalui berbagai unit usaha yang saling terhubung, JMT Group menyediakan layanan teknologi, operasional kesehatan, pengelolaan fasilitas, pelatihan industri, dan manajemen rantai pasok."
            )}
          </p>

          <p className="mt-5 text-base leading-8 text-slate-600">
            {t(
              "company.aboutPage.paragraphThree",
              "Dengan semangat inovasi dan kolaborasi, JMT Group berkomitmen mendukung terbentuknya ekosistem kesehatan yang modern, berkelanjutan, dan memiliki daya saing tinggi."
            )}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-orange">
                {t(
                  "company.aboutPage.established",
                  "Didirikan"
                )}
              </p>

              <p className="mt-2 text-2xl font-bold text-ink">
                2022
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-orange">
                {t(
                  "company.aboutPage.focus",
                  "Fokus"
                )}
              </p>

              <p className="mt-2 text-lg font-bold text-ink">
                {t(
                  "company.aboutPage.focusValue",
                  "Layanan Kesehatan Terintegrasi"
                )}
              </p>
            </div>
          </div>
        </div>
      </section>


      <section className="bg-mist py-20">
        <div className="container-jmt">
          <SectionHeading
            kicker={t(
              "company.aboutPage.businessKicker",
              "Ekosistem Bisnis"
            )}
            title={t(
              "company.aboutPage.businessTitle",
              "Layanan terintegrasi dalam satu ekosistem"
            )}
            description={t(
              "company.aboutPage.businessDescription",
              "Unit usaha JMT Group saling melengkapi untuk membantu fasilitas kesehatan meningkatkan kualitas, efisiensi, dan keberlanjutan operasional."
            )}
            center
          />

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {businessUnits.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange/30 hover:shadow-xl"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange/10 text-orange transition group-hover:bg-orange group-hover:text-white">
                    <Icon size={25} />
                  </div>

                  <h3 className="mt-6 text-xl font-bold text-ink">
                    {item.title}
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-slate-500">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>


      <section className="container-jmt py-20">
        <SectionHeading
          kicker={t(
            "company.aboutPage.experienceKicker",
            "Pengalaman Kami"
          )}
          title={t(
            "company.aboutPage.experienceTitle",
            "Pengalaman yang membangun kepercayaan"
          )}
          description={t(
            "company.aboutPage.experienceDescription",
            "Didukung pengalaman, tenaga profesional, dan kolaborasi dengan berbagai fasilitas kesehatan."
          )}
          center
        />

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {companyStatistics.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.label}
                className="relative overflow-hidden rounded-3xl bg-ink p-8 text-white"
              >
                <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full border border-white/10" />

                <div className="relative">
                  <Icon
                    size={30}
                    className="text-orange"
                  />

                  <p className="mt-8 text-5xl font-bold">
                    {item.value}
                  </p>

                  <h3 className="mt-3 text-lg font-semibold">
                    {item.label}
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-white/60">
                    {item.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>


      <section className="bg-mist py-20">
        <div className="container-jmt grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-3xl bg-gradient-to-br from-ink to-teal p-8 text-white md:p-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-orange">
              <Target size={27} />
            </div>

            <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-orange">
              {t(
                "company.aboutPage.vision",
                "Visi"
              )}
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              {t(
                "company.aboutPage.visionTitle",
                "Visi Perusahaan"
              )}
            </h2>

            <p className="mt-6 text-base leading-8 text-white/70">
              {companyVision}
            </p>
          </article>


          <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange/10 text-orange">
              <CheckCircle2 size={27} />
            </div>

            <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-orange">
              {t(
                "company.aboutPage.mission",
                "Misi"
              )}
            </p>

            <h2 className="mt-3 text-3xl font-bold text-ink">
              {t(
                "company.aboutPage.missionTitle",
                "Misi Perusahaan"
              )}
            </h2>

            <div className="mt-7 space-y-4">
              {missionItems.map(
                (mission, index) => (
                  <div
                    key={`${mission}-${index}`}
                    className="flex items-start gap-4 rounded-2xl bg-slate-50 p-4"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange text-xs font-bold text-white">
                      {index + 1}
                    </div>

                    <p className="pt-1 text-sm leading-7 text-slate-600">
                      {mission}
                    </p>
                  </div>
                )
              )}
            </div>
          </article>
        </div>
      </section>


      {certifications.length > 0 && (
        <section className="container-jmt py-20">
          <SectionHeading
            kicker={t(
              "company.aboutPage.certificationsKicker",
              "Sertifikasi & Akreditasi"
            )}
            title={t(
              "company.aboutPage.certificationsTitle",
              "Standar, legalitas, dan keamanan yang terpercaya"
            )}
            description={t(
              "company.aboutPage.certificationsDescription",
              "Sertifikasi, registrasi, dan pengakuan yang memperkuat komitmen JMT Group terhadap kualitas layanan, legalitas, dan keamanan sistem."
            )}
            center
          />

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {certifications.map(
              (certification) => (
                <article
                  key={certification.id}
                  className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange/30 hover:shadow-xl"
                >
                  <div className="relative flex h-52 items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 to-mist">
                    {certification.image_url ? (
                      <img
                        src={
                          certification.image_url
                        }
                        alt={
                          certification.title
                        }
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="text-center">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-orange shadow-sm">
                          <ShieldCheck
                            size={38}
                          />
                        </div>

                        <p className="mt-4 text-sm font-semibold text-slate-400">
                          {getCertificationCategoryLabel(
                            certification.category
                          )}
                        </p>
                      </div>
                    )}

                    <span
                      className={`absolute left-5 top-5 rounded-full border px-3 py-1.5 text-xs font-semibold ${getCertificationCategoryClass(
                        certification.category
                      )}`}
                    >
                      {getCertificationCategoryLabel(
                        certification.category
                      )}
                    </span>
                  </div>

                  <div className="p-7">
                    {certification.issued_year && (
                      <p className="flex items-center gap-2 text-sm font-semibold text-orange">
                        <CalendarDays
                          size={16}
                        />

                        {t(
                          "company.aboutPage.issued",
                          "Diterbitkan"
                        )}{" "}
                        {
                          certification.issued_year
                        }
                      </p>
                    )}

                    <h3 className="mt-4 text-xl font-bold leading-8 text-ink">
                      {
                        certification.title
                      }
                    </h3>

                    {certification.description && (
                      <p className="mt-4 text-sm leading-7 text-slate-500">
                        {
                          certification.description
                        }
                      </p>
                    )}

                    {certification.document_url && (
                      <div className="mt-6 border-t border-slate-100 pt-5">
                        <a
                          href={
                            certification.document_url
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-semibold text-orange transition hover:underline"
                        >
                          <FileText
                            size={17}
                          />

                          {t(
                            "company.aboutPage.viewDocument",
                            "Lihat Dokumen"
                          )}

                          <ArrowUpRight
                            size={16}
                          />
                        </a>
                      </div>
                    )}
                  </div>
                </article>
              )
            )}
          </div>
        </section>
      )}


      {awards.length > 0 && (
        <section className="bg-mist py-20">
          <div className="container-jmt">
            <SectionHeading
              kicker={t(
                "company.aboutPage.awardsKicker",
                "Penghargaan & Pengakuan"
              )}
              title={t(
                "company.aboutPage.awardsTitle",
                "Penghargaan atas inovasi dan kontribusi"
              )}
              description={t(
                "company.aboutPage.awardsDescription",
                "Pengakuan yang diterima perusahaan atas kontribusi, inovasi, kolaborasi, dan pengembangan solusi dalam ekosistem layanan kesehatan."
              )}
              center
            />

            <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {awards.map((award) => (
                <article
                  key={award.id}
                  className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-amber-200 hover:shadow-xl"
                >
                  <div className="relative flex h-56 items-center justify-center overflow-hidden bg-white">
                    {award.image_url ? (
                      <img
                        src={award.image_url}
                        alt={award.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="text-center">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-50 text-amber-600">
                          <Trophy
                            size={38}
                          />
                        </div>

                        <p className="mt-4 text-sm font-semibold text-slate-400">
                          {t(
                            "company.aboutPage.awardsKicker",
                            "Penghargaan & Pengakuan"
                          )}
                        </p>
                      </div>
                    )}

                    {award.year && (
                      <span className="absolute left-5 top-5 rounded-full bg-orange px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
                        {award.year}
                      </span>
                    )}
                  </div>

                  <div className="p-7">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                      <Trophy size={23} />
                    </div>

                    <h3 className="mt-5 text-xl font-bold leading-8 text-ink">
                      {award.title}
                    </h3>

                    {award.institution && (
                      <p className="mt-3 flex items-start gap-2 text-sm font-semibold leading-6 text-orange">
                        <Building2
                          size={16}
                          className="mt-0.5 shrink-0"
                        />

                        {award.institution}
                      </p>
                    )}

                    {award.description && (
                      <p className="mt-4 text-sm leading-7 text-slate-500">
                        {award.description}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}


      <section className="bg-ink py-20 text-white">
        <div className="container-jmt">
          <div className="max-w-4xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange">
              {t(
                "company.aboutPage.holdingKicker",
                "Holding Perusahaan"
              )}
            </p>

            <h2 className="mt-4 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
              {t(
                "company.aboutPage.holdingTitle",
                "Anak Perusahaan Jasamedika Transmedic"
              )}
            </h2>

            <p className="mt-5 max-w-3xl text-sm leading-7 text-white/65 md:text-base">
              {t(
                "company.aboutPage.holdingDescription",
                "Perusahaan dalam ekosistem JMT Group memiliki keahlian yang saling melengkapi dalam teknologi kesehatan, infrastruktur, fasilitas, IoT, dan logistik."
              )}
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {subsidiaryItems.map((item) => {
              const Icon = item.icon;

              const cardContent = (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-white/10 p-3 text-orange">
                      <Icon size={24} />
                    </div>

                    {item.website && (
                      <ArrowUpRight
                        size={18}
                        className="text-white/30 transition group-hover:text-orange"
                      />
                    )}
                  </div>

                  <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-orange">
                    {item.category}
                  </p>

                  <h3 className="mt-3 text-xl font-bold text-white">
                    {item.name}
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-white/60">
                    {item.description}
                  </p>
                </>
              );

              if (item.website) {
                return (
                  <a
                    key={item.name}
                    href={item.website}
                    target="_blank"
                    rel="noreferrer"
                    className="group rounded-3xl border border-white/10 bg-white/5 p-7 transition hover:-translate-y-1 hover:border-orange/40 hover:bg-white/10"
                  >
                    {cardContent}
                  </a>
                );
              }

              return (
                <article
                  key={item.name}
                  className="group rounded-3xl border border-white/10 bg-white/5 p-7"
                >
                  {cardContent}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <CTA />
    </>
  );
}