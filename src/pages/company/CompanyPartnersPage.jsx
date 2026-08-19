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
  ExternalLink,
  Globe2,
  Handshake,
  ImageIcon,
  Landmark,
  RefreshCw,
  Search,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

import {
  CTA,
  PageHero,
  SectionHeading,
} from "../../components/Common";

import {
  getCompanyPartners,
} from "../../services/companyService";

import {
  useLanguage,
} from "../../contexts/LanguageContext";


function createFallbackPartners(
  language
) {
  const description =
    language === "en"
      ? "A strategic partner of Jasa Medika Transmedic."
      : "Partner strategis Jasa Medika Transmedic.";

  return [
    ["fallback-kemenkes", "Kementrian Kesehatan Republik Indonesia"],
    ["fallback-dto", "Digital Transformasi Office"],
    ["fallback-bpjs", "BPJS Kesehatan"],
    ["fallback-samsung", "Samsung"],
    ["fallback-telkom", "Telkom Indonesia"],
    ["fallback-ocbc-nisp", "OCBC NISP"],
    ["fallback-bni", "BNI"],
    ["fallback-indofarma", "Indofarma"],
    ["fallback-pesona", "Pesona Group"],
    ["fallback-artha-graha", "Bank Artha Graha Internasional"],
    ["fallback-bank-bjb", "Bank BJB"],
    ["fallback-bni-network", "BNI Network"],
    ["fallback-bank-ocbc", "Bank OCBC"],
  ].map(
    ([id, name], index) => ({
      id,
      name,
      logo_url: "",
      website_url: "",
      description:
        id === "fallback-pesona"
          ? language === "en"
            ? "PT Pesona Scientific & Pesona Satwa."
            : "PT. Pesona Scientific & Pesona Satwa."
          : description,
      sort_order:
        index + 1,
      is_active: true,
    })
  );
}


function getPartnerInitials(name) {
  const words =
    String(name || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  if (words.length === 0) {
    return "PT";
  }

  if (words.length === 1) {
    return words[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return words
    .slice(0, 2)
    .map(
      (word) =>
        word.charAt(0)
    )
    .join("")
    .toUpperCase();
}


function sortPartners(
  items,
  language = "id"
) {
  return [...items].sort(
    (
      firstPartner,
      secondPartner
    ) => {
      const firstOrder =
        Number(
          firstPartner.sort_order
        ) || 0;

      const secondOrder =
        Number(
          secondPartner.sort_order
        ) || 0;

      if (
        firstOrder !==
        secondOrder
      ) {
        return (
          firstOrder -
          secondOrder
        );
      }

      return String(
        firstPartner.name || ""
      ).localeCompare(
        String(
          secondPartner.name ||
            ""
        ),
        language === "en"
          ? "en"
          : "id"
      );
    }
  );
}


function PartnerLogo({
  partner,
}) {
  const [
    imageFailed,
    setImageFailed,
  ] = useState(false);

  if (
    partner.logo_url &&
    !imageFailed
  ) {
    return (
      <div className="flex h-28 items-center justify-center rounded-2xl border border-slate-100 bg-white p-5">
        <img
          src={
            partner.logo_url
          }
          alt={`Logo ${partner.name}`}
          className="max-h-20 max-w-full object-contain transition duration-300 group-hover:scale-105"
          loading="lazy"
          onError={() =>
            setImageFailed(
              true
            )
          }
        />
      </div>
    );
  }

  return (
    <div className="relative flex h-28 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#082B3A] via-[#0A4053] to-teal">
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full border border-white/10" />

      <div className="absolute -bottom-10 -left-8 h-24 w-24 rounded-full bg-orange/10 blur-xl" />

      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-xl font-bold text-white backdrop-blur">
        {getPartnerInitials(
          partner.name
        )}
      </div>
    </div>
  );
}


function PartnersPageLoading() {
  return (
    <>
      <div className="h-[420px] animate-pulse bg-slate-200" />

      <section className="container-jmt py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mx-auto h-5 w-32 animate-pulse rounded bg-slate-200" />
          <div className="mx-auto mt-5 h-12 w-2/3 animate-pulse rounded-xl bg-slate-200" />
          <div className="mx-auto mt-5 h-4 w-full animate-pulse rounded bg-slate-100" />
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(
            (item) => (
              <div
                key={item}
                className="h-72 animate-pulse rounded-3xl border border-slate-200 bg-white"
              />
            )
          )}
        </div>
      </section>
    </>
  );
}


export default function CompanyPartnersPage() {
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

  const [
    partners,
    setPartners,
  ] = useState([]);

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const [
    selectedFilter,
    setSelectedFilter,
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


  const filterOptions =
    useMemo(
      () => [
        {
          value: "all",
          label: tr(
            "Semua Partner",
            "All Partners"
          ),
        },
        {
          value: "with-logo",
          label: tr(
            "Memiliki Logo",
            "With Logo"
          ),
        },
        {
          value:
            "with-website",
          label: tr(
            "Memiliki Website",
            "With Website"
          ),
        },
      ],
      [tr]
    );


  const loadPartners =
    useCallback(async () => {
      try {
        setLoading(true);
        setErrorMessage("");
        setUsingFallback(false);

        const data =
          await getCompanyPartners(
            language
          );

        if (
          Array.isArray(data) &&
          data.length > 0
        ) {
          setPartners(
            sortPartners(
              data,
              language
            )
          );

          return;
        }

        setPartners(
          createFallbackPartners(
            language
          )
        );

        setUsingFallback(true);
      } catch (error) {
        console.error(
          "Partner perusahaan gagal dimuat:",
          error
        );

        setPartners(
          createFallbackPartners(
            language
          )
        );

        setUsingFallback(true);
        setErrorMessage(
          "LOAD_ERROR"
        );
      } finally {
        setLoading(false);
      }
    }, [
      language,
    ]);


  useEffect(() => {
    loadPartners();
  }, [loadPartners]);


  const partnerSummary =
    useMemo(() => ({
      total:
        partners.length,

      withLogo:
        partners.filter(
          (partner) =>
            Boolean(
              String(
                partner.logo_url ||
                  ""
              ).trim()
            )
        ).length,

      withWebsite:
        partners.filter(
          (partner) =>
            Boolean(
              String(
                partner.website_url ||
                  ""
              ).trim()
            )
        ).length,
    }), [partners]);


  const filteredPartners =
    useMemo(() => {
      const normalizedSearch =
        searchTerm
          .trim()
          .toLowerCase();

      return partners.filter(
        (partner) => {
          const searchableText =
            [
              partner.name,
              partner.description,
            ]
              .map((value) =>
                String(
                  value || ""
                ).toLowerCase()
              )
              .join(" ");

          const matchesSearch =
            !normalizedSearch ||
            searchableText.includes(
              normalizedSearch
            );

          let matchesFilter =
            true;

          if (
            selectedFilter ===
            "with-logo"
          ) {
            matchesFilter =
              Boolean(
                String(
                  partner.logo_url ||
                    ""
                ).trim()
              );
          }

          if (
            selectedFilter ===
            "with-website"
          ) {
            matchesFilter =
              Boolean(
                String(
                  partner.website_url ||
                    ""
                ).trim()
              );
          }

          return (
            matchesSearch &&
            matchesFilter
          );
        }
      );
    }, [
      partners,
      searchTerm,
      selectedFilter,
    ]);


  function resetFilters() {
    setSearchTerm("");
    setSelectedFilter(
      "all"
    );
  }


  if (loading) {
    return <PartnersPageLoading />;
  }


  return (
    <>
      <PageHero
        eyebrow={t(
          "company.partnersPage.heroEyebrow",
          "Perusahaan — Mitra"
        )}
        title={t(
          "company.partnersPage.heroTitle",
          "Kolaborasi untuk Membangun Ekosistem yang Lebih Kuat"
        )}
        description={t(
          "company.partnersPage.heroDescription",
          "JMT berkolaborasi dengan berbagai institusi dan organisasi untuk mendukung transformasi layanan kesehatan dan teknologi."
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
                  {tr(
                    "Data Supabase belum dapat dimuat",
                    "Supabase data could not be loaded"
                  )}
                </p>

                <p className="mt-1 text-sm leading-6 text-amber-700">
                  {tr(
                    "Halaman sedang menampilkan daftar partner cadangan.",
                    "The page is currently displaying the fallback partner list."
                  )}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={
                loadPartners
              }
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
            >
              <RefreshCw
                size={16}
              />

              {t(
                "company.common.reload",
                "Muat Ulang"
              )}
            </button>
          </div>
        </section>
      )}


      <section className="container-jmt py-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)] lg:items-center">
          <div>
            <SectionHeading
              kicker={tr(
                "Perusahaan Mitra Kami",
                "Our Partner Companies"
              )}
              title={tr(
                "Kolaborasi untuk menciptakan dampak yang lebih luas",
                "Collaboration to create a broader impact"
              )}
              description={tr(
                "JMT Group membangun kemitraan strategis untuk memperkuat inovasi, teknologi, pembiayaan, dan layanan kesehatan yang terintegrasi.",
                "JMT Group builds strategic partnerships to strengthen innovation, technology, financing, and integrated healthcare services."
              )}
            />

            <p className="mt-7 max-w-3xl text-base leading-8 text-slate-600">
              {tr(
                "Setiap kolaborasi menjadi bagian penting dalam menghadirkan solusi yang relevan, berkelanjutan, dan memberikan nilai tambah bagi fasilitas kesehatan serta masyarakat.",
                "Each collaboration plays an important role in delivering relevant, sustainable solutions that create added value for healthcare facilities and communities."
              )}
            </p>
          </div>


          <div className="grid grid-cols-2 gap-4">
            <article className="rounded-3xl bg-[#082B3A] p-6 text-white">
              <Handshake
                size={25}
                className="text-orange"
              />

              <p className="mt-8 text-4xl font-bold">
                {partnerSummary.total}
              </p>

              <p className="mt-2 text-sm text-white/60">
                {tr(
                  "Partner terdaftar",
                  "Registered partners"
                )}
              </p>
            </article>


            <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <Globe2
                size={25}
                className="text-orange"
              />

              <p className="mt-8 text-4xl font-bold text-ink">
                {
                  partnerSummary.withWebsite
                }
              </p>

              <p className="mt-2 text-sm text-slate-500">
                {tr(
                  "Website tersedia",
                  "Websites available"
                )}
              </p>
            </article>


            <article className="col-span-2 rounded-3xl bg-gradient-to-r from-orange to-[#FF7A35] p-6 text-white">
              <div className="flex items-center justify-between gap-5">
                <div>
                  <p className="text-3xl font-bold">
                    {tr(
                      "Kemitraan Strategis",
                      "Strategic Partnership"
                    )}
                  </p>

                  <p className="mt-2 text-sm text-white/80">
                    {tr(
                      "Kolaborasi lintas industri dan institusi.",
                      "Cross-industry and institutional collaboration."
                    )}
                  </p>
                </div>

                <UsersRound
                  size={38}
                  className="shrink-0 text-white/70"
                />
              </div>
            </article>
          </div>
        </div>
      </section>


      <section className="bg-mist py-20">
        <div className="container-jmt">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange">
                {tr(
                  "Direktori Partner",
                  "Partner Directory"
                )}
              </p>

              <h2 className="mt-3 text-3xl font-bold text-ink md:text-4xl">
                {tr(
                  "Daftar Partner",
                  "Partner List"
                )}
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
                {tr(
                  "Temukan partner berdasarkan nama atau ketersediaan informasi.",
                  "Find partners by name or available information."
                )}
              </p>
            </div>

            <p className="text-sm text-slate-500">
              {tr(
                "Menampilkan",
                "Showing"
              )}{" "}
              <span className="font-bold text-ink">
                {
                  filteredPartners.length
                }
              </span>{" "}
              {tr(
                "dari",
                "of"
              )}{" "}
              <span className="font-bold text-ink">
                {
                  partners.length
                }
              </span>{" "}
              {tr(
                "partner",
                "partners"
              )}
            </p>
          </div>


          {usingFallback &&
            !errorMessage && (
              <div className="mt-8 flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4">
                <CheckCircle2
                  size={20}
                  className="mt-0.5 shrink-0 text-blue-600"
                />

                <p className="text-sm leading-6 text-blue-700">
                  {tr(
                    "Tabel partners belum memiliki data aktif. Halaman sedang menampilkan daftar partner cadangan.",
                    "The partners table does not currently contain active data. The page is displaying a fallback partner list."
                  )}
                </p>
              </div>
            )}


          <div className="mt-10 grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-[minmax(0,1fr)_250px_auto]">
            <div className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <label
                htmlFor="partner-search"
                className="sr-only"
              >
                {tr(
                  "Cari partner",
                  "Search partners"
                )}
              </label>

              <input
                id="partner-search"
                type="search"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
                placeholder={tr(
                  "Cari nama partner...",
                  "Search partner name..."
                )}
                className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-orange focus:ring-2 focus:ring-orange/10"
              />
            </div>


            <div>
              <label
                htmlFor="partner-filter"
                className="sr-only"
              >
                {tr(
                  "Filter partner",
                  "Partner filter"
                )}
              </label>

              <select
                id="partner-filter"
                value={
                  selectedFilter
                }
                onChange={(event) =>
                  setSelectedFilter(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-ink outline-none transition focus:border-orange focus:ring-2 focus:ring-orange/10"
              >
                {filterOptions.map(
                  (option) => (
                    <option
                      key={
                        option.value
                      }
                      value={
                        option.value
                      }
                    >
                      {
                        option.label
                      }
                    </option>
                  )
                )}
              </select>
            </div>


            <button
              type="button"
              onClick={resetFilters}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-orange hover:text-orange"
            >
              Reset
            </button>
          </div>


          {filteredPartners.length ===
          0 ? (
            <div className="mt-10 rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
              <ImageIcon
                size={40}
                className="mx-auto text-slate-300"
              />

              <h3 className="mt-5 text-xl font-bold text-ink">
                {tr(
                  "Partner tidak ditemukan",
                  "Partner not found"
                )}
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                {tr(
                  "Tidak ada partner yang sesuai dengan pencarian atau filter.",
                  "No partners match your search or selected filter."
                )}
              </p>

              <button
                type="button"
                onClick={resetFilters}
                className="mt-6 rounded-xl bg-orange px-5 py-3 text-sm font-semibold text-white"
              >
                {tr(
                  "Tampilkan Semua",
                  "Show All"
                )}
              </button>
            </div>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredPartners.map(
                (partner) => {
                  const cardContent = (
                    <>
                      <PartnerLogo
                        partner={
                          partner
                        }
                      />

                      <div className="flex flex-1 flex-col p-6">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange/10 text-orange">
                            <Building2
                              size={19}
                            />
                          </div>

                          {partner.website_url && (
                            <ArrowUpRight
                              size={18}
                              className="text-slate-300 transition group-hover:text-orange"
                            />
                          )}
                        </div>

                        <h3 className="mt-5 text-lg font-bold leading-7 text-ink">
                          {
                            partner.name
                          }
                        </h3>

                        <p className="mt-3 flex-1 text-sm leading-7 text-slate-500">
                          {partner.description ||
                            tr(
                              "Partner strategis Jasa Medika Transmedic.",
                              "A strategic partner of Jasa Medika Transmedic."
                            )}
                        </p>

                        <div className="mt-6 border-t border-slate-100 pt-5">
                          {partner.website_url ? (
                            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange">
                              {t(
                                "company.partnersPage.visitWebsite",
                                "Kunjungi Website"
                              )}

                              <ExternalLink
                                size={14}
                              />
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                              <ShieldCheck
                                size={14}
                              />

                              {tr(
                                "Mitra Strategis",
                                "Strategic Partner"
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </>
                  );

                  if (
                    partner.website_url
                  ) {
                    return (
                      <a
                        key={
                          partner.id
                        }
                        href={
                          partner.website_url
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="group flex overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange/30 hover:shadow-xl"
                      >
                        <div className="flex w-full flex-col">
                          {cardContent}
                        </div>
                      </a>
                    );
                  }

                  return (
                    <article
                      key={
                        partner.id
                      }
                      className="group flex overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange/30 hover:shadow-xl"
                    >
                      <div className="flex w-full flex-col">
                        {cardContent}
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          )}
        </div>
      </section>


      <section className="container-jmt py-20">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#082B3A] via-[#0A4053] to-teal p-8 text-white md:p-12">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border border-white/10" />

          <div className="absolute -bottom-20 left-1/3 h-52 w-52 rounded-full bg-orange/10 blur-2xl" />

          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="max-w-3xl">
              <Landmark
                size={38}
                className="text-orange"
              />

              <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-orange">
                {tr(
                  "Kolaborasi Strategis",
                  "Strategic Collaboration"
                )}
              </p>

              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-4xl">
                {tr(
                  "Bersama membangun ekosistem kesehatan yang lebih kuat",
                  "Building a stronger healthcare ecosystem together"
                )}
              </h2>

              <p className="mt-6 text-base leading-8 text-white/70">
                {tr(
                  "JMT Group terbuka untuk kolaborasi strategis dalam teknologi, operasional, fasilitas, pelatihan, dan layanan kesehatan.",
                  "JMT Group welcomes strategic collaboration across technology, operations, facilities, training, and healthcare services."
                )}
              </p>
            </div>

            <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-white/10 bg-white/10 text-orange backdrop-blur">
              <Handshake
                size={42}
              />
            </div>
          </div>
        </div>
      </section>

      <CTA />
    </>
  );
}