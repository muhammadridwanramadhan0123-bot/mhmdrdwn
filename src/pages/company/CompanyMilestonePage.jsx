import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  History,
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
 * Data cadangan digunakan ketika tabel
 * milestones masih kosong atau gagal dimuat.
 *
 * image_url tetap dicantumkan agar struktur
 * data konsisten, tetapi tidak ditampilkan
 * pada timeline publik.
 */
const fallbackMilestones = [
  {
    id: "fallback-2002",
    year: 2002,
    title:
      "PT Jasamedika Saranatama Berdiri",
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
    title:
      "PT Transindo Data Perkasa Berdiri",
    description:
      "Pengembangan sistem kesehatan pemerintah dan implementasi Transmedic dimulai.",
    image_url: "",
    sort_order: 3,
    is_active: true,
  },
  {
    id: "fallback-2011",
    year: 2011,
    title:
      "PT Netkrom Solusindo Berdiri",
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
    title:
      "Hospital Operator RSJP Paramarta",
    description:
      "Kerja sama operator rumah sakit dikembangkan di Bandung.",
    image_url: "",
    sort_order: 8,
    is_active: true,
  },
  {
    id: "fallback-2021-temp",
    year: 2021,
    title:
      "PT Temp Solusi Kreasi Berdiri",
    description:
      "Berfokus pada facility management, perhotelan, dan pariwisata.",
    image_url: "",
    sort_order: 9,
    is_active: true,
  },
  {
    id: "fallback-2021-sport",
    year: 2021,
    title:
      "PT Digital Sport System Berdiri",
    description:
      "Mengembangkan sistem informasi manajemen olahraga OlahraGo.",
    image_url: "",
    sort_order: 10,
    is_active: true,
  },
  {
    id: "fallback-2022-mvi",
    year: 2022,
    title:
      "PT Multi Variat Indonesia Berdiri",
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
    title:
      "Kolaborasi Program SATUSEHAT",
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
    title:
      "Kolaborasi Telkom Indonesia",
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

/*
 * Membagi milestone menjadi beberapa baris.
 * Setiap baris desktop berisi maksimal 3 data.
 */
function createTimelineRows(items) {
  const indexedItems = items.map(
    (item, index) => ({
      ...item,
      sequence: index + 1,
    })
  );

  const rows = [];

  for (
    let index = 0;
    index < indexedItems.length;
    index += 3
  ) {
    const rowItems =
      indexedItems.slice(
        index,
        index + 3
      );

    const rowIndex = rows.length;

    /*
     * Baris ganjil dibalik agar alur timeline
     * bergerak seperti ular:
     *
     * kiri → kanan
     * kanan → kiri
     */
    rows.push(
      rowIndex % 2 === 1
        ? [...rowItems].reverse()
        : rowItems
    );
  }

  return rows;
}

function MilestonePageLoading() {
  return (
    <>
      <div className="h-[420px] animate-pulse bg-slate-200" />

      <section className="container-jmt py-20">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <div className="h-5 w-36 animate-pulse rounded bg-slate-200" />

            <div className="mt-5 h-12 w-3/4 animate-pulse rounded bg-slate-200" />

            <div className="mt-6 space-y-3">
              <div className="h-4 animate-pulse rounded bg-slate-100" />

              <div className="h-4 animate-pulse rounded bg-slate-100" />

              <div className="h-4 w-4/5 animate-pulse rounded bg-slate-100" />
            </div>
          </div>

          <div className="h-64 animate-pulse rounded-3xl bg-slate-200" />
        </div>
      </section>

      <section className="bg-[#082B3A] py-20">
        <div className="container-jmt">
          <div className="h-[720px] animate-pulse rounded-3xl bg-white/5" />
        </div>
      </section>
    </>
  );
}

export default function CompanyMilestonePage() {
  const [
    milestones,
    setMilestones,
  ] = useState([]);

  const [
    selectedPeriod,
    setSelectedPeriod,
  ] = useState("all");

  const [loading, setLoading] =
    useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    usingFallback,
    setUsingFallback,
  ] = useState(false);

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

        setMilestones(
          sortMilestones(
            fallbackMilestones
          )
        );

        setUsingFallback(true);
      } catch (error) {
        console.error(
          "Milestone gagal dimuat:",
          error
        );

        setMilestones(
          sortMilestones(
            fallbackMilestones
          )
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

  const filteredMilestones =
    useMemo(() => {
      if (
        selectedPeriod === "all"
      ) {
        return milestones;
      }

      const selectedOption =
        periodOptions.find(
          (option) =>
            option.value ===
            selectedPeriod
        );

      if (
        !selectedOption?.start ||
        !selectedOption?.end
      ) {
        return milestones;
      }

      return milestones.filter(
        (milestone) => {
          const year =
            getYearNumber(
              milestone.year
            );

          return (
            year >=
              selectedOption.start &&
            year <= selectedOption.end
          );
        }
      );
    }, [
      milestones,
      selectedPeriod,
    ]);

  const timelineRows = useMemo(
    () =>
      createTimelineRows(
        filteredMilestones
      ),
    [filteredMilestones]
  );

  const firstYear = useMemo(() => {
    const validYears = milestones
      .map((milestone) =>
        getYearNumber(
          milestone.year
        )
      )
      .filter((year) => year > 0);

    if (validYears.length === 0) {
      return "-";
    }

    return Math.min(...validYears);
  }, [milestones]);

  const lastYear = useMemo(() => {
    const validYears = milestones
      .map((milestone) =>
        getYearNumber(
          milestone.year
        )
      )
      .filter((year) => year > 0);

    if (validYears.length === 0) {
      return "-";
    }

    return Math.max(...validYears);
  }, [milestones]);

  const totalYears = useMemo(() => {
    const uniqueYears = new Set(
      milestones
        .map((milestone) =>
          getYearNumber(
            milestone.year
          )
        )
        .filter((year) => year > 0)
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

      {/* Peringatan Supabase */}
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
                  Data Supabase belum
                  dapat dimuat
                </p>

                <p className="mt-1 text-sm leading-6 text-amber-700">
                  {errorMessage} Halaman
                  sedang menampilkan data
                  cadangan.
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
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)] lg:items-center">
          <div>
            <SectionHeading
              kicker="Our Journey"
              title="Lebih dari dua dekade membangun solusi kesehatan"
              description="Perjalanan perusahaan dimulai dari pengembangan Sistem Informasi Manajemen Rumah Sakit hingga terbentuknya ekosistem teknologi, fasilitas, pelatihan, IoT, dan layanan kesehatan."
            />

            <p className="mt-7 max-w-3xl text-base leading-8 text-slate-600">
              Setiap pencapaian mencerminkan
              komitmen JMT Group dalam
              menjawab perubahan kebutuhan
              industri kesehatan melalui
              inovasi, kolaborasi, dan
              pengembangan solusi yang
              berkelanjutan.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <article className="rounded-3xl bg-[#082B3A] p-6 text-white shadow-xl">
              <CalendarDays
                size={24}
                className="text-[#FF5A0A]"
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
                className="text-[#FF5A0A]"
              />

              <p className="mt-7 text-4xl font-bold text-[#082B3A]">
                {lastYear}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Milestone terbaru
              </p>
            </article>

            <article className="col-span-2 rounded-3xl bg-gradient-to-r from-[#FF5A0A] to-[#FF7A35] p-6 text-white shadow-lg">
              <div className="flex items-center justify-between gap-5">
                <div>
                  <p className="text-4xl font-bold">
                    {milestones.length}
                  </p>

                  <p className="mt-2 text-sm text-white/80">
                    Pencapaian dalam{" "}
                    {totalYears} tahun penting
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
      <section className="relative overflow-hidden bg-[#082B3A] py-20 text-white">
        {/* Dekorasi background */}
        <div className="pointer-events-none absolute -left-40 top-32 h-96 w-96 rounded-full bg-[#FF5A0A]/5 blur-3xl" />

        <div className="pointer-events-none absolute -right-48 bottom-20 h-[420px] w-[420px] rounded-full bg-cyan-400/5 blur-3xl" />

        <div className="container-jmt relative">
          <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF6B1A]">
                Company Timeline
              </p>

              <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-tight text-white md:text-4xl">
                Perjalanan dan pencapaian
                perusahaan
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55 md:text-base">
                Perjalanan JMT Group dalam
                membangun solusi teknologi,
                operasional, dan layanan
                kesehatan yang terintegrasi.
              </p>
            </div>

            <div className="w-full md:w-64">
              <label
                htmlFor="milestone-period"
                className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-white/45"
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
                className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-[#FF5A0A] focus:ring-2 focus:ring-[#FF5A0A]/20"
              >
                {periodOptions.map(
                  (option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      className="bg-[#082B3A] text-white"
                    >
                      {option.label}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          {usingFallback &&
            !errorMessage && (
              <div className="mt-8 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
                <CheckCircle2
                  size={20}
                  className="mt-0.5 shrink-0 text-emerald-400"
                />

                <p className="text-sm leading-6 text-white/65">
                  Tabel milestones belum
                  memiliki data aktif. Saat
                  ini halaman menampilkan
                  riwayat perusahaan dari
                  website sebelumnya.
                </p>
              </div>
            )}

          {filteredMilestones.length ===
          0 ? (
            <div className="mt-12 rounded-3xl border border-white/10 bg-white/5 px-6 py-16 text-center">
              <History
                size={42}
                className="mx-auto text-white/25"
              />

              <h3 className="mt-5 text-xl font-bold text-white">
                Milestone tidak ditemukan
              </h3>

              <p className="mt-2 text-sm text-white/50">
                Tidak ada milestone pada
                periode yang dipilih.
              </p>

              <button
                type="button"
                onClick={() =>
                  setSelectedPeriod("all")
                }
                className="mt-6 rounded-xl bg-[#FF5A0A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#E94F00]"
              >
                Tampilkan Semua
              </button>
            </div>
          ) : (
            <>
              {/* Timeline desktop */}
              <div className="relative mt-16 hidden lg:block">
                {timelineRows.map(
                  (
                    row,
                    rowIndex
                  ) => {
                    const hasNextRow =
                      rowIndex <
                      timelineRows.length -
                        1;

                    const connectorRight =
                      rowIndex % 2 === 0;

                    return (
                      <div
                        key={`timeline-row-${rowIndex}`}
                        className="relative h-[320px]"
                      >
                        {/* Garis horizontal */}
                        <div className="pointer-events-none absolute left-[16.6667%] right-[16.6667%] top-24 h-px bg-[#B8D5C7]/50" />

                        {/* Sambungan lengkung ke baris berikutnya */}
                        {hasNextRow && (
                          <div
                            className={`pointer-events-none absolute top-24 h-[320px] w-[16.6667%] border-[#B8D5C7]/50 ${
                              connectorRight
                                ? "right-0 rounded-r-[999px] border-b border-r border-t"
                                : "left-0 rounded-l-[999px] border-b border-l border-t"
                            }`}
                          />
                        )}

                        <div className="relative grid h-full grid-cols-3">
                          {row.map(
                            (
                              milestone
                            ) => (
                              <article
                                key={
                                  milestone.id
                                }
                                className="relative h-full px-7 text-center"
                              >
                                {/* Tahun */}
                                <p className="pt-3 text-5xl font-bold tracking-tight text-[#D9F0DF]">
                                  {
                                    milestone.year
                                  }
                                </p>

                                {/* Titik timeline */}
                                <span className="absolute left-1/2 top-[87px] z-10 flex h-[18px] w-[18px] -translate-x-1/2 items-center justify-center rounded-[5px] bg-white shadow-[0_0_0_5px_rgba(255,255,255,0.08)]">
                                  <span className="h-1.5 w-1.5 rounded-full bg-[#FF5A0A]" />
                                </span>

                                {/* Konten */}
                                <div className="absolute inset-x-7 top-[132px]">
                                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF6B1A]">
                                    Milestone{" "}
                                    {String(
                                      milestone.sequence
                                    ).padStart(
                                      2,
                                      "0"
                                    )}
                                  </p>

                                  <h3 className="mx-auto mt-3 max-w-sm text-lg font-bold leading-7 text-white">
                                    {
                                      milestone.title
                                    }
                                  </h3>

                                  {milestone.description && (
                                    <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/55">
                                      {
                                        milestone.description
                                      }
                                    </p>
                                  )}
                                </div>
                              </article>
                            )
                          )}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>

              {/* Timeline mobile dan tablet */}
              <div className="relative mt-14 lg:hidden">
                <div className="absolute bottom-3 left-[9px] top-3 w-px bg-[#B8D5C7]/40" />

                <div className="space-y-10">
                  {filteredMilestones.map(
                    (
                      milestone,
                      index
                    ) => (
                      <article
                        key={
                          milestone.id
                        }
                        className="relative pl-11"
                      >
                        <span className="absolute left-0 top-2 z-10 flex h-[19px] w-[19px] items-center justify-center rounded-[5px] bg-white shadow-[0_0_0_5px_rgba(255,255,255,0.08)]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#FF5A0A]" />
                        </span>

                        <p className="text-4xl font-bold tracking-tight text-[#D9F0DF]">
                          {milestone.year}
                        </p>

                        <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF6B1A]">
                          Milestone{" "}
                          {String(
                            index + 1
                          ).padStart(
                            2,
                            "0"
                          )}
                        </p>

                        <h3 className="mt-3 text-xl font-bold leading-7 text-white">
                          {milestone.title}
                        </h3>

                        {milestone.description && (
                          <p className="mt-3 max-w-xl text-sm leading-7 text-white/55">
                            {
                              milestone.description
                            }
                          </p>
                        )}

                        {index <
                          filteredMilestones.length -
                            1 && (
                          <div className="mt-8 h-px bg-white/10" />
                        )}
                      </article>
                    )
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Penutup */}
      <section className="container-jmt py-20">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#082B3A] via-[#0A4053] to-teal p-8 text-white md:p-12">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10" />

          <div className="absolute -bottom-20 left-1/3 h-52 w-52 rounded-full bg-[#FF5A0A]/10 blur-2xl" />

          <div className="relative max-w-3xl">
            <Rocket
              size={38}
              className="text-[#FF5A0A]"
            />

            <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-[#FF6B1A]">
              Moving Forward
            </p>

            <h2 className="mt-4 text-3xl font-bold leading-tight md:text-4xl">
              Melanjutkan perjalanan menuju
              ekosistem kesehatan yang
              semakin terintegrasi
            </h2>

            <p className="mt-6 text-base leading-8 text-white/70">
              JMT Group terus memperkuat
              inovasi, kemitraan strategis,
              dan pengembangan layanan untuk
              mendukung masa depan kesehatan
              Indonesia.
            </p>
          </div>
        </div>
      </section>

      <CTA />
    </>
  );
}