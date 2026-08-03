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
  CheckCircle2,
  Cpu,
  Factory,
  GraduationCap,
  HeartPulse,
  LoaderCircle,
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

import { getCompanyProfile } from "../../services/companyService";

/*
 * Informasi bidang usaha mengikuti
 * struktur website JMT sebelumnya.
 */
const businessUnits = [
  {
    title: "Healthcare Operator",
    description:
      "Solusi manajemen dan operasional layanan kesehatan, termasuk sistem digital terintegrasi serta pendampingan transformasi rumah sakit dan klinik.",
    icon: HeartPulse,
  },
  {
    title: "Facility Management",
    description:
      "Layanan perencanaan, desain, manajemen teknik, interior, dan pengelolaan fasilitas untuk mendukung operasional yang optimal.",
    icon: Building2,
  },
  {
    title: "Industry Training",
    description:
      "Program pelatihan berbasis kebutuhan industri teknologi informasi dengan pendekatan praktis dan materi yang relevan.",
    icon: GraduationCap,
  },
  {
    title: "Supply Chain Management",
    description:
      "Pengelolaan rantai pasok yang terintegrasi untuk mendukung ketersediaan logistik, peralatan medis, dan kebutuhan operasional.",
    icon: PackageCheck,
  },
];

/*
 * Data statistik mengikuti informasi
 * yang ditampilkan pada website lama.
 */
const companyStatistics = [
  {
    value: "100+",
    label: "Klien Fasilitas Kesehatan",
    description:
      "Rumah sakit, klinik, dan fasilitas pelayanan kesehatan di berbagai wilayah Indonesia.",
    icon: Building2,
  },
  {
    value: "150+",
    label: "Tenaga Profesional",
    description:
      "Programmer dan tenaga profesional yang mendukung pengembangan serta implementasi solusi.",
    icon: UsersRound,
  },
  {
    value: "20+",
    label: "Tahun Pengalaman",
    description:
      "Pengalaman ekosistem perusahaan dalam teknologi informasi dan layanan kesehatan.",
    icon: ShieldCheck,
  },
];

/*
 * Informasi penghargaan yang sebelumnya
 * ditampilkan pada halaman About Us lama.
 */
const awardItems = [
  {
    title: "RSUD dr. Iskak Tulungagung",
    description:
      "Transformasi digital mendukung peningkatan layanan dan kinerja rumah sakit serta memperoleh berbagai penghargaan layanan publik dan inovasi.",
    highlights: [
      "Public Service of the Year 2018",
      "The Inspiring and Innovative Hospital 2018",
      "Top Digital Award 2021",
    ],
  },
  {
    title:
      "RS Bhayangkara Tk. I R. Said Sukanto",
    description:
      "Meraih penghargaan BPJS Awards 2021 untuk kategori rumah sakit tipe A yang berkomitmen memberikan pelayanan terbaik kepada peserta JKN-KIS.",
    highlights: [
      "BPJS Awards 2021",
      "Kategori Rumah Sakit Tipe A",
    ],
  },
  {
    title: "RSUD Cibinong",
    description:
      "Mendapatkan apresiasi atas komitmen dalam integrasi sistem antrean daring dan integrasi proses klaim.",
    highlights: [
      "Integrasi Antrean Online",
      "Integrasi Sistem Klaim",
    ],
  },
];

/*
 * Daftar perusahaan yang ditampilkan
 * pada bagian Corporate Holding.
 */
const subsidiaryItems = [
  {
    name: "Netkrom Solusindo",
    category:
      "Network Infrastructure & Software Engineering",
    description:
      "Berfokus pada layanan jaringan komputer, rekayasa perangkat lunak, dan implementasi teknologi informasi untuk sektor kesehatan, pemerintah, dan perusahaan.",
    website: "https://netkromsolution.com",
    icon: Cpu,
  },
  {
    name: "Transindo Data Perkasa",
    category:
      "Healthcare Information System",
    description:
      "Penyedia layanan Sistem Informasi Manajemen Rumah Sakit berbasis web untuk fasilitas kesehatan, pemerintah, dan sektor swasta.",
    website: "https://transindodata.com",
    icon: HeartPulse,
  },
  {
    name: "Jasamedika Saranatama",
    category:
      "Hospital Information System",
    description:
      "Perusahaan pengembang Sistem Informasi Manajemen Rumah Sakit yang telah menghadirkan berbagai solusi digital untuk fasilitas kesehatan Indonesia.",
    website: "https://jasamedika.co.id",
    icon: Building2,
  },
  {
    name: "TéMP",
    category:
      "Facility & Interior Management",
    description:
      "Penyedia solusi furnitur, interior, dan pengelolaan fasilitas dengan pendekatan terintegrasi sesuai kebutuhan mitra dan klien.",
    website: "https://temp.co.id",
    icon: Factory,
  },
  {
    name: "Multi Variat Indonesia",
    category: "Internet of Things",
    description:
      "Mengembangkan solusi Internet of Things untuk mendukung integrasi perangkat, data, dan sistem operasional.",
    website: "",
    icon: Sparkles,
  },
  {
    name: "Trisprima Usahajaya",
    category:
      "Healthcare Logistics Management",
    description:
      "Mendukung pengelolaan logistik farmasi, alat kesehatan, dan bahan medis habis pakai agar lebih terpantau dan efisien.",
    website: "https://trisprima.com",
    icon: PackageCheck,
  },
];

const fallbackDescription =
  "Jasa Medika Transmedic Group adalah grup perusahaan yang berfokus pada inovasi dan pengembangan solusi terintegrasi di bidang layanan kesehatan. JMT Group menjadi mitra strategis bagi rumah sakit, klinik, dan institusi pendidikan kesehatan dalam menghadirkan sistem manajemen yang andal, efisien, dan berbasis teknologi.";

const fallbackVision =
  "Menjadi perusahaan terdepan dalam menyediakan dan mengembangkan solusi teknologi informasi yang tepat bagi fasilitas kesehatan di Indonesia.";

const fallbackMission = [
  "Mengembangkan perangkat lunak Sistem Informasi Manajemen Rumah Sakit dan solusi kesehatan yang berkualitas.",
  "Memberikan layanan konsultasi dalam bidang teknologi informasi rumah sakit dan layanan kesehatan.",
  "Menghadirkan solusi yang meningkatkan efektivitas penggunaan sistem informasi kesehatan.",
  "Mendukung kegiatan pendidikan dan penelitian dalam bidang sistem informasi serta layanan kesehatan.",
];

/*
 * Mengubah teks misi menjadi array.
 *
 * Mendukung misi yang disimpan menggunakan:
 * - baris baru;
 * - tanda titik koma;
 * - format JSON array.
 */
function normalizeMissionList(value) {
  if (!value) {
    return fallbackMission;
  }

  if (Array.isArray(value)) {
    const result = value
      .map((item) => String(item || "").trim())
      .filter(Boolean);

    return result.length > 0
      ? result
      : fallbackMission;
  }

  const text = String(value).trim();

  if (!text) {
    return fallbackMission;
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
    : fallbackMission;
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
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const loadCompanyProfile =
    useCallback(async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const data =
          await getCompanyProfile();

        setProfile(data);
      } catch (error) {
        console.error(
          "Profil perusahaan gagal dimuat:",
          error
        );

        /*
         * Halaman tetap menggunakan konten
         * fallback agar tidak kosong.
         */
        setProfile(null);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Profil perusahaan gagal dimuat."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadCompanyProfile();
  }, [loadCompanyProfile]);

  const missionItems = useMemo(
    () =>
      normalizeMissionList(
        profile?.mission
      ),
    [profile?.mission]
  );

  const companyName =
    profile?.company_name ||
    "Jasa Medika Transmedic Group";

  const companyDescription =
    profile?.short_description ||
    fallbackDescription;

  const companyVision =
    profile?.vision ||
    fallbackVision;

  if (loading) {
    return <AboutPageLoading />;
  }

  return (
    <>
      <PageHero
        eyebrow="Company — About Us"
        title="Building an Integrated Healthcare Ecosystem"
        description="Menghadirkan inovasi, teknologi, dan layanan terintegrasi untuk mendukung transformasi fasilitas kesehatan Indonesia."
      />

      {/* Peringatan ketika Supabase gagal */}
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
                  Data backend belum dapat dimuat
                </p>

                <p className="mt-1 text-sm leading-6 text-amber-700">
                  {errorMessage} Halaman sedang
                  menampilkan konten cadangan.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={loadCompanyProfile}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
            >
              <RefreshCw size={16} />
              Muat Ulang
            </button>
          </div>
        </section>
      )}

      {/* Tentang JMT */}
      <section className="container-jmt grid gap-12 py-20 lg:grid-cols-2 lg:items-center">
        <div className="relative min-h-[480px] overflow-hidden rounded-[2rem] bg-gradient-to-br from-ink via-[#0A4053] to-teal p-8 text-white shadow-xl md:p-12">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border border-white/10" />

          <div className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-orange/10 blur-2xl" />

          <div className="relative">
            {profile?.logo_url ? (
              <div className="inline-flex rounded-2xl bg-white p-4 shadow-lg">
                <img
                  src={profile.logo_url}
                  alt={companyName}
                  className="h-14 max-w-48 object-contain"
                />
              </div>
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange text-xl font-bold">
                JMT
              </div>
            )}

            <p className="mt-20 text-xs font-bold uppercase tracking-[0.2em] text-white/60">
              Integrated Healthcare Solutions
            </p>

            <p className="mt-5 max-w-xl text-3xl font-bold leading-tight md:text-4xl">
              More than technology. We build a
              connected healthcare ecosystem.
            </p>

            <div className="mt-10 flex items-center gap-3 border-t border-white/10 pt-6">
              <CheckCircle2
                size={19}
                className="shrink-0 text-orange"
              />

              <p className="text-sm leading-6 text-white/70">
                Inovasi, kolaborasi, dan layanan
                berkelanjutan untuk fasilitas
                kesehatan Indonesia.
              </p>
            </div>
          </div>
        </div>

        <div>
          <SectionHeading
            kicker="About Us"
            title={companyName}
          />

          <p className="mt-7 text-base leading-8 text-slate-600">
            {companyDescription}
          </p>

          <p className="mt-5 text-base leading-8 text-slate-600">
            Melalui berbagai unit usaha yang
            saling terhubung, JMT Group
            menyediakan layanan teknologi,
            operasional kesehatan, pengelolaan
            fasilitas, pelatihan industri, dan
            manajemen rantai pasok.
          </p>

          <p className="mt-5 text-base leading-8 text-slate-600">
            Dengan semangat inovasi dan
            kolaborasi, JMT Group berkomitmen
            mendukung terbentuknya ekosistem
            kesehatan yang modern, berkelanjutan,
            dan memiliki daya saing tinggi.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-orange">
                Established
              </p>

              <p className="mt-2 text-2xl font-bold text-ink">
                2022
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-orange">
                Focus
              </p>

              <p className="mt-2 text-lg font-bold text-ink">
                Integrated Healthcare
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bidang usaha */}
      <section className="bg-mist py-20">
        <div className="container-jmt">
          <SectionHeading
            kicker="Business Ecosystem"
            title="Layanan terintegrasi dalam satu ekosistem"
            description="Unit usaha JMT Group saling melengkapi untuk membantu fasilitas kesehatan meningkatkan kualitas, efisiensi, dan keberlanjutan operasional."
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

      {/* Statistik */}
      <section className="container-jmt py-20">
        <SectionHeading
          kicker="Our Experience"
          title="Pengalaman yang membangun kepercayaan"
          description="Didukung pengalaman, tenaga profesional, dan kolaborasi dengan berbagai fasilitas kesehatan."
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

      {/* Visi dan Misi */}
      <section className="bg-mist py-20">
        <div className="container-jmt grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-3xl bg-gradient-to-br from-ink to-teal p-8 text-white md:p-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-orange">
              <Target size={27} />
            </div>

            <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-orange">
              Vision
            </p>

            <h2 className="mt-3 text-3xl font-bold">
              Visi Perusahaan
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
              Mission
            </p>

            <h2 className="mt-3 text-3xl font-bold text-ink">
              Misi Perusahaan
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

      {/* Awards */}
      <section className="container-jmt py-20">
        <SectionHeading
          kicker="Awards & Recognition"
          title="Transformasi yang menghasilkan dampak"
          description="Berbagai fasilitas kesehatan mitra memperoleh pengakuan melalui peningkatan layanan, integrasi sistem, dan inovasi digital."
          center
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {awardItems.map((award) => (
            <article
              key={award.title}
              className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <Trophy size={26} />
              </div>

              <h3 className="mt-6 text-xl font-bold leading-7 text-ink">
                {award.title}
              </h3>

              <p className="mt-4 text-sm leading-7 text-slate-500">
                {award.description}
              </p>

              <div className="mt-6 space-y-3 border-t border-slate-100 pt-5">
                {award.highlights.map(
                  (highlight) => (
                    <div
                      key={highlight}
                      className="flex items-start gap-3"
                    >
                      <CheckCircle2
                        size={17}
                        className="mt-0.5 shrink-0 text-emerald-500"
                      />

                      <p className="text-sm leading-6 text-slate-600">
                        {highlight}
                      </p>
                    </div>
                  )
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Subsidiaries */}
      <section className="bg-ink py-20 text-white">
        <div className="container-jmt">
          <SectionHeading
            kicker="Corporate Holding"
            title="Jasamedika Transmedic Subsidiaries"
            description="Perusahaan dalam ekosistem JMT Group memiliki keahlian yang saling melengkapi dalam teknologi kesehatan, infrastruktur, fasilitas, IoT, dan logistik."
          />

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

                  <h3 className="mt-3 text-xl font-bold">
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