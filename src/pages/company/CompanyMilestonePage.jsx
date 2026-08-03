import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AlertTriangle,
  Building2,
  CalendarDays,
  CheckCircle2,
  Cloud,
  Cpu,
  GraduationCap,
  Handshake,
  HeartPulse,
  History,
  ImageIcon,
  LoaderCircle,
  Network,
  RefreshCw,
  Rocket,
  Sparkles,
} from "lucide-react";

import {
  CTA,
  PageHero,
  SectionHeading,
} from "../../components/Common";

import { getCompanyMilestones } from "../../services/companyService";

/*
 * Konten cadangan berdasarkan milestone
 * yang terdapat pada website JMT sebelumnya.
 *
 * Data ini hanya digunakan ketika tabel
 * milestones di Supabase masih kosong atau
 * tidak dapat dimuat.
 */
const fallbackMilestones = [
  {
    id: "fallback-2002",
    year: 2002,
    title: "PT Jasamedika Saranatama Berdiri",
    description:
      "Medifirst2000 mulai diterapkan pada lima rumah sakit.",
    image_url: "",
    sort_order: 1,
    is_active: true,
  },
  {
    id: "fallback-2008",
    year: 2008,
    title: "Ekspansi Medifirst2000",
    description:
      "Implementasi Medifirst2000 berkembang hingga 12 rumah sakit.",
    image_url: "",
    sort_order: 2,
    is_active: true,
  },
  {
    id: "fallback-2010",
    year: 2010,
    title: "PT Transindo Data Perkasa Berdiri",
    description:
      "Pengembangan sistem kesehatan pemerintah dan implementasi Transmedic dimulai.",
    image_url: "",
    sort_order: 3,
    is_active: true,
  },
  {
    id: "fallback-2011",
    year: 2011,
    title: "PT Netkrom Solusindo Berdiri",
    description:
      "Berfokus pada jaringan komputer dan pelatihan teknologi informasi.",
    image_url: "",
    sort_order: 4,
    is_active: true,
  },
  {
    id: "fallback-2014",
    year: 2014,
    title: "Perluasan Kolaborasi",
    description:
      "Pasar berkembang melalui kerja sama perusahaan teknologi dan Institut Teknologi Bandung.",
    image_url: "",
    sort_order: 5,
    is_active: true,
  },
  {
    id: "fallback-2015",
    year: 2015,
    title: "Pengembangan MEDISis",
    description:
      "SIMKESDIK dikembangkan untuk mendukung manajemen kesehatan peserta didik.",
    image_url: "",
    sort_order: 6,
    is_active: true,
  },
  {
    id: "fallback-2019",
    year: 2019,
    title: "Transmedic 2.0",
    description:
      "SIMRS berbasis web dan cloud mulai dikembangkan.",
    image_url: "",
    sort_order: 7,
    is_active: true,
  },
  {
    id: "fallback-2020",
    year: 2020,
    title: "Hospital Operator RSJP Paramarta",
    description:
      "Kerja sama operator rumah sakit dikembangkan di Bandung.",
    image_url: "",
    sort_order: 8,
    is_active: true,
  },
  {
    id: "fallback-2021-temp",
    year: 2021,
    title: "PT Temp Solusi Kreasi Berdiri",
    description:
      "Berfokus pada facility management, perhotelan, dan pariwisata.",
    image_url: "",
    sort_order: 9,
    is_active: true,
  },
  {
    id: "fallback-2021-sport",
    year: 2021,
    title: "PT Digital Sport System Berdiri",
    description:
      "Mengembangkan sistem informasi manajemen olahraga OlahraGo.",
    image_url: "",
    sort_order: 10,
    is_active: true,
  },
  {
    id: "fallback-2022-mvi",
    year: 2022,
    title: "PT Multi Variat Indonesia Berdiri",
    description:
      "Berfokus pada pengembangan solusi Internet of Things.",
    image_url: "",
    sort_order: 11,
    is_active: true,
  },
  {
    id: "fallback-2022-rsjp",
    year: 2022,
    title: "SIMRS dan IoT Ambulance",
    description:
      "Kerja sama dengan RSJP Paramarta diperluas melalui pengembangan SIMRS dan IoT Ambulance.",
    image_url: "",
    sort_order: 12,
    is_active: true,
  },
  {
    id: "fallback-2023-satusehat",
    year: 2023,
    title: "Kolaborasi Program SATUSEHAT",
    description:
      "MOU pengembangan program SATUSEHAT ditandatangani bersama Kementerian Kesehatan.",
    image_url: "",
    sort_order: 13,
    is_active: true,
  },
  {
    id: "fallback-2023-medirest",
    year: 2023,
    title: "Pengembangan Medirest",
    description:
      "Layanan wellness dan fisioterapi mulai dikembangkan.",
    image_url: "",
    sort_order: 14,
    is_active: true,
  },
  {
    id: "fallback-2023-telkom",
    year: 2023,
    title: "Kolaborasi Telkom Indonesia",
    description:
      "MOU pengembangan digitalisasi fasilitas kesehatan terintegrasi ditandatangani.",
    image_url: "",
    sort_order: 15,
    is_active: true,
  },
];

const periodOptions = [
  {
    value: "all",
    label: "Semua Periode",
  },
  {
    value: "2002-2010",
    label: "2002–2010",
    start: 2002,
    end: 2010,
  },
  {
    value: "2011-2020",
    label: "2011–2020",
    start: 2011,
    end: 2020,
  },
  {
    value: "2021-2023",
    label: "2021–2023",
    start: 2021,
    end: 2023,
  },
];

function getMilestoneIcon(milestone) {
  const searchableText = [
    milestone?.title,
    milestone?.description,
  ]
    .join(" ")
    .toLowerCase();

  if (
    searchableText.includes("internet of things") ||
    searchableText.includes("iot")
  ) {
    return Cpu;
  }

  if (
    searchableText.includes("cloud") ||
    searchableText.includes("web")
  ) {
    return Cloud;
  }

  if (
    searchableText.includes("jaringan") ||
    searchableText.includes("netkrom")
  ) {
    return Network;
  }

  if (
    searchableText.includes("pelatihan") ||
    searchableText.includes("pendidikan") ||
    searchableText.includes("peserta didik")
  ) {
    return GraduationCap;
  }

  if (
    searchableText.includes("rumah sakit") ||
    searchableText.includes("simrs") ||
    searchableText.includes("kesehatan") ||
    searchableText.includes("medifirst") ||
    searchableText.includes("transmedic")
  ) {
    return HeartPulse;
  }

  if (
    searchableText.includes("kerja sama") ||
    searchableText.includes("kolaborasi") ||
    searchableText.includes("mou")
  ) {
    return Handshake;
  }

  if (
    searchableText.includes("berdiri") ||
    searchableText.includes("perusahaan")
  ) {
    return Building2;
  }

  return Rocket;
}

function getYearNumber(value) {
  const year = Number(value);

  return Number.isFinite(year)
    ? year
    : 0;
}

function sortMilestones(items) {
  return [...items].sort(
    (firstItem, secondItem) => {
      const firstOrder =
        Number(firstItem.sort_order) || 0;

      const secondOrder =
        Number(secondItem.sort_order) || 0;

      if (firstOrder !== secondOrder) {
        return firstOrder - secondOrder;
      }

      return (
        getYearNumber(firstItem.year) -
        getYearNumber(secondItem.year)
      );
    }
  );
}

function MilestoneVisual({ milestone }) {
  const [imageFailed, setImageFailed] =
    useState(false);

  const Icon = getMilestoneIcon(milestone);

  if (
    milestone.image_url &&
    !imageFailed
  ) {
    return (
      <div className="relative h-52 overflow-hidden bg-slate-100">
        <img
          src={milestone.image_url}
          alt={milestone.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          onError={() =>
            setImageFailed(true)
          }
        />

        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />

        <div className="absolute bottom-4 left-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/90 text-orange shadow-lg backdrop-blur">
          <Icon size={21} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-52 items-center justify-center overflow-hidden bg-gradient-to-br from-ink via-[#0A4053] to-teal">
      <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full border border-white/10" />

      <div className="absolute -bottom-16 -left-12 h-44 w-44 rounded-full bg-orange/10 blur-xl" />

      <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/10 text-orange backdrop-blur">
        <Icon size={36} />
      </div>
    </div>
  );
}

function MilestonePageLoading() {
  return (
    <>
      <div className="h-[420px] animate-pulse bg-slate-200" />

      <section className="container-jmt py-20">
        <div className="mx-auto max-w-5xl">
          <div className="h-12 w-2/3 animate-pulse rounded-xl bg-slate-200" />

          <div className="mt-5 h-5 w-full animate-pulse rounded bg-slate-100" />

          <div className="mt-14 space-y-8">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-64 animate-pulse rounded-3xl bg-slate-200"
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default function CompanyMilestonePage() {
  const [milestones, setMilestones] =
    useState([]);

  const [selectedPeriod, setSelectedPeriod] =
    useState("all");

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [usingFallback, setUsingFallback] =
    useState(false);

  const loadMilestones =
    useCallback(async () => {
      try {
        setLoading(true);
        setErrorMessage("");
        setUsingFallback(false);

        const data =
          await getCompanyMilestones();

        if (
          Array.isArray(data) &&
          data.length > 0
        ) {
          setMilestones(
            sortMilestones(data)
          );

          return;
        }

        /*
         * Tabel tersedia tetapi belum memiliki
         * data aktif.
         */
        setMilestones(
          fallbackMilestones
        );

        setUsingFallback(true);
      } catch (error) {
        console.error(
          "Milestone gagal dimuat:",
          error
        );

        /*
         * Konten lama tetap ditampilkan agar
         * halaman tidak menjadi kosong.
         */
        setMilestones(
          fallbackMilestones
        );

        setUsingFallback(true);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Milestone perusahaan gagal dimuat."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadMilestones();
  }, [loadMilestones]);

  const filteredMilestones = useMemo(() => {
    if (selectedPeriod === "all") {
      return milestones;
    }

    const selectedOption =
      periodOptions.find(
        (option) =>
          option.value === selectedPeriod
      );

    if (
      !selectedOption?.start ||
      !selectedOption?.end
    ) {
      return milestones;
    }

    return milestones.filter(
      (milestone) => {
        const year = getYearNumber(
          milestone.year
        );

        return (
          year >= selectedOption.start &&
          year <= selectedOption.end
        );
      }
    );
  }, [milestones, selectedPeriod]);

  const firstYear = useMemo(() => {
    if (milestones.length === 0) {
      return "-";
    }

    return Math.min(
      ...milestones.map((milestone) =>
        getYearNumber(milestone.year)
      )
    );
  }, [milestones]);

  const lastYear = useMemo(() => {
    if (milestones.length === 0) {
      return "-";
    }

    return Math.max(
      ...milestones.map((milestone) =>
        getYearNumber(milestone.year)
      )
    );
  }, [milestones]);

  const totalYears = useMemo(() => {
    const uniqueYears = new Set(
      milestones.map((milestone) =>
        getYearNumber(milestone.year)
      )
    );

    return uniqueYears.size;
  }, [milestones]);

  if (loading) {
    return <MilestonePageLoading />;
  }

  return (
    <>
      <PageHero
        eyebrow="Company — Milestone"
        title="A Journey of Innovation and Collaboration"
        description="Perjalanan JMT Group dalam mengembangkan teknologi, layanan, dan ekosistem kesehatan yang semakin terintegrasi."
      />

      {/* Informasi error */}
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
                  Data Supabase belum dapat dimuat
                </p>

                <p className="mt-1 text-sm leading-6 text-amber-700">
                  {errorMessage} Halaman sedang
                  menampilkan data cadangan.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={loadMilestones}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
            >
              <RefreshCw size={16} />
              Muat Ulang
            </button>
          </div>
        </section>
      )}

      {/* Ringkasan perjalanan */}
      <section className="container-jmt py-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)] lg:items-center">
          <div>
            <SectionHeading
              kicker="Our Journey"
              title="Lebih dari dua dekade membangun solusi kesehatan"
              description="Perjalanan perusahaan dimulai dari pengembangan Sistem Informasi Manajemen Rumah Sakit hingga terbentuknya ekosistem teknologi, fasilitas, pelatihan, IoT, dan layanan kesehatan."
            />

            <p className="mt-7 max-w-3xl text-base leading-8 text-slate-600">
              Setiap pencapaian mencerminkan
              komitmen JMT Group dalam menjawab
              perubahan kebutuhan industri
              kesehatan melalui inovasi,
              kolaborasi, dan pengembangan solusi
              yang berkelanjutan.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <article className="rounded-3xl bg-ink p-6 text-white">
              <CalendarDays
                size={24}
                className="text-orange"
              />

              <p className="mt-7 text-4xl font-bold">
                {firstYear}
              </p>

              <p className="mt-2 text-sm text-white/60">
                Awal perjalanan
              </p>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <History
                size={24}
                className="text-orange"
              />

              <p className="mt-7 text-4xl font-bold text-ink">
                {lastYear}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Milestone terbaru
              </p>
            </article>

            <article className="col-span-2 rounded-3xl bg-gradient-to-r from-orange to-[#FF7A35] p-6 text-white">
              <div className="flex items-center justify-between gap-5">
                <div>
                  <p className="text-4xl font-bold">
                    {milestones.length}
                  </p>

                  <p className="mt-2 text-sm text-white/80">
                    Pencapaian dalam {totalYears} tahun
                    penting
                  </p>
                </div>

                <Sparkles
                  size={36}
                  className="text-white/70"
                />
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-mist py-20">
        <div className="container-jmt">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange">
                Company Timeline
              </p>

              <h2 className="mt-3 text-3xl font-bold text-ink md:text-4xl">
                Milestone Perusahaan
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
                Pilih periode untuk melihat
                perjalanan dan pencapaian perusahaan.
              </p>
            </div>

            <div className="w-full md:w-64">
              <label
                htmlFor="milestone-period"
                className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500"
              >
                Filter Periode
              </label>

              <select
                id="milestone-period"
                value={selectedPeriod}
                onChange={(event) =>
                  setSelectedPeriod(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-ink outline-none transition focus:border-orange focus:ring-2 focus:ring-orange/10"
              >
                {periodOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {usingFallback && !errorMessage && (
            <div className="mt-8 flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4">
              <CheckCircle2
                size={20}
                className="mt-0.5 shrink-0 text-blue-600"
              />

              <p className="text-sm leading-6 text-blue-700">
                Tabel milestones belum memiliki data
                aktif. Saat ini halaman menampilkan
                riwayat perusahaan dari website
                sebelumnya.
              </p>
            </div>
          )}

          {filteredMilestones.length === 0 ? (
            <div className="mt-12 rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
              <ImageIcon
                size={38}
                className="mx-auto text-slate-300"
              />

              <h3 className="mt-5 text-xl font-bold text-ink">
                Milestone tidak ditemukan
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Tidak ada milestone pada periode yang
                dipilih.
              </p>

              <button
                type="button"
                onClick={() =>
                  setSelectedPeriod("all")
                }
                className="mt-6 rounded-xl bg-orange px-5 py-3 text-sm font-semibold text-white"
              >
                Tampilkan Semua
              </button>
            </div>
          ) : (
            <div className="relative mt-14">
              {/* Garis timeline */}
              <div className="absolute bottom-0 left-6 top-0 w-px bg-slate-300 md:left-1/2 md:-translate-x-1/2" />

              <div className="space-y-10 md:space-y-14">
                {filteredMilestones.map(
                  (milestone, index) => {
                    const isLeft =
                      index % 2 === 0;

                    return (
                      <article
                        key={milestone.id}
                        className="relative"
                      >
                        {/* Titik timeline */}
                        <div className="absolute left-6 top-8 z-10 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full bg-white ring-4 ring-orange/20 md:left-1/2">
                          <div className="h-2.5 w-2.5 rounded-full bg-orange" />
                        </div>

                        <div
                          className={`ml-14 md:ml-0 md:flex ${
                            isLeft
                              ? "md:justify-start"
                              : "md:justify-end"
                          }`}
                        >
                          <div className="w-full md:w-[calc(50%-3.5rem)]">
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-orange px-4 py-2 text-sm font-bold text-white shadow-lg shadow-orange/20">
                              <CalendarDays size={15} />

                              {milestone.year}
                            </div>

                            <div className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange/30 hover:shadow-xl">
                              <MilestoneVisual
                                milestone={milestone}
                              />

                              <div className="p-6 md:p-7">
                                <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange">
                                  Milestone{" "}
                                  {String(index + 1).padStart(
                                    2,
                                    "0"
                                  )}
                                </p>

                                <h3 className="mt-3 text-xl font-bold leading-8 text-ink md:text-2xl">
                                  {milestone.title}
                                </h3>

                                {milestone.description && (
                                  <p className="mt-4 text-sm leading-7 text-slate-500">
                                    {
                                      milestone.description
                                    }
                                  </p>
                                )}

                                <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
                                  <CheckCircle2
                                    size={17}
                                    className="shrink-0 text-emerald-500"
                                  />

                                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    Company Journey
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  }
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Penutup */}
      <section className="container-jmt py-20">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-ink via-[#0A4053] to-teal p-8 text-white md:p-12">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10" />

          <div className="absolute -bottom-20 left-1/3 h-52 w-52 rounded-full bg-orange/10 blur-2xl" />

          <div className="relative max-w-3xl">
            <Rocket
              size={38}
              className="text-orange"
            />

            <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-orange">
              Moving Forward
            </p>

            <h2 className="mt-4 text-3xl font-bold leading-tight md:text-4xl">
              Melanjutkan perjalanan menuju
              ekosistem kesehatan yang semakin
              terintegrasi
            </h2>

            <p className="mt-6 text-base leading-8 text-white/70">
              JMT Group terus memperkuat inovasi,
              kemitraan strategis, dan pengembangan
              layanan untuk mendukung masa depan
              kesehatan Indonesia.
            </p>
          </div>
        </div>
      </section>

      <CTA />
    </>
  );
}