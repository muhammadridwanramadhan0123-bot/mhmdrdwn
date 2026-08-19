import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  AlertTriangle,
  ArrowRight,
  Building2,
  GraduationCap,
  HeartPulse,
  RefreshCw,
  Server,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import {
  supabase,
} from "../lib/supabase";

import {
  useLanguage,
} from "../contexts/LanguageContext";


const HOME_SERVICE_SLUGS = [
  "simrs-erp",
  "konsultasi-pengelolaan-fasilitas-kesehatan",
  "infrastruktur-it-layanan-pendukung",
  "pelatihan-pengembangan-sdm",
];


function getServiceIcon(slug) {
  switch (slug) {
    case "simrs-erp":
      return HeartPulse;

    case "konsultasi-pengelolaan-fasilitas-kesehatan":
      return Building2;

    case "infrastruktur-it-layanan-pendukung":
      return Server;

    case "pelatihan-pengembangan-sdm":
      return GraduationCap;

    default:
      return HeartPulse;
  }
}


function getTranslatedText(
  translatedValue,
  originalValue
) {
  const translated =
    String(
      translatedValue || ""
    ).trim();

  if (translated) {
    return translated;
  }

  return String(
    originalValue || ""
  ).trim();
}


export default function FeaturedServiceSection() {
  const {
    language,
  } = useLanguage();

  const isEnglish =
    language === "en";


  const [
    services,
    setServices,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");


  const loadServices =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setErrorMessage("");


          /*
           * ==============================================
           * 1. AMBIL 4 SERVICE UTAMA
           * ==============================================
           */

          const {
            data:
              baseServices,
            error:
              serviceError,
          } =
            await supabase
              .from(
                "services"
              )
              .select(`
                id,
                name,
                slug,
                short_description,
                image_url,
                icon,
                status
              `)
              .eq(
                "status",
                "published"
              )
              .in(
                "slug",
                HOME_SERVICE_SLUGS
              );


          if (serviceError) {
            throw serviceError;
          }


          const serviceRecords =
            Array.isArray(
              baseServices
            )
              ? baseServices
              : [];


          /*
           * ==============================================
           * 2. ENGLISH TRANSLATION
           * ==============================================
           */

          let translationMap =
            new Map();


          if (
            isEnglish &&
            serviceRecords.length >
              0
          ) {
            const serviceIds =
              serviceRecords.map(
                (service) =>
                  service.id
              );


            const {
              data:
                translations,
              error:
                translationError,
            } =
              await supabase
                .from(
                  "service_translations"
                )
                .select(`
                  service_id,
                  locale,
                  name,
                  short_description,
                  status
                `)
                .in(
                  "service_id",
                  serviceIds
                )
                .eq(
                  "locale",
                  "en"
                )
                .eq(
                  "status",
                  "published"
                );


            /*
             * Translation gagal bukan
             * berarti section gagal.
             *
             * Fallback ke ID.
             */
            if (
              translationError
            ) {
              console.warn(
                "Translation homepage services gagal dimuat. Menggunakan Bahasa Indonesia:",
                translationError
              );
            } else {
              translationMap =
                new Map(
                  (
                    Array.isArray(
                      translations
                    )
                      ? translations
                      : []
                  ).map(
                    (
                      translation
                    ) => [
                      translation.service_id,
                      translation,
                    ]
                  )
                );
            }
          }


          /*
           * ==============================================
           * 3. MERGE BASE + TRANSLATION
           * ==============================================
           */

          const mergedServices =
            serviceRecords.map(
              (service) => {
                const translation =
                  translationMap.get(
                    service.id
                  );


                return {
                  ...service,

                  name:
                    isEnglish
                      ? getTranslatedText(
                          translation?.name,
                          service.name
                        )
                      : String(
                          service.name ||
                            ""
                        ).trim(),

                  short_description:
                    isEnglish
                      ? getTranslatedText(
                          translation?.short_description,
                          service.short_description
                        )
                      : String(
                          service.short_description ||
                            ""
                        ).trim(),

                  translation_locale:
                    translation
                      ? "en"
                      : "id",
                };
              }
            );


          /*
           * ==============================================
           * 4. URUTKAN SESUAI 4 PRODUCT UTAMA
           * ==============================================
           */

          const orderedServices =
            HOME_SERVICE_SLUGS
              .map(
                (slug) =>
                  mergedServices.find(
                    (service) =>
                      service.slug ===
                      slug
                  )
              )
              .filter(Boolean);


          setServices(
            orderedServices
          );
        } catch (error) {
          console.error(
            "Products & Services gagal dimuat:",
            error
          );

          setErrorMessage(
            isEnglish
              ? "Products & Services could not be loaded."
              : "Produk & Layanan gagal dimuat."
          );
        } finally {
          setLoading(false);
        }
      },
      [
        isEnglish,
      ]
    );


  useEffect(() => {
    loadServices();
  }, [loadServices]);


  return (
    <section className="bg-mist py-20">
      <div className="container-jmt">

        {/* HEADER */}

        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange">
              {isEnglish
                ? "Products & Services"
                : "Produk & Layanan"}
            </p>


            <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-tight text-[#082B3A] md:text-4xl">
              {isEnglish
                ? "Integrated Solutions for Healthcare Services"
                : "Solusi Terintegrasi untuk Layanan Kesehatan"}
            </h2>


            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500">
              {isEnglish
                ? "Digital solutions, healthcare facility management, IT infrastructure, and human resource development within one integrated ecosystem."
                : "Solusi digital, pengelolaan fasilitas kesehatan, infrastruktur teknologi, dan pengembangan SDM dalam satu ekosistem terintegrasi."}
            </p>
          </div>


          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-sm font-semibold text-orange transition hover:opacity-70"
          >
            {isEnglish
              ? "View All Services"
              : "Lihat Semua Layanan"}

            <ArrowRight
              size={16}
            />
          </Link>
        </div>


        {/* LOADING */}

        {loading && (
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">

            {[1, 2, 3, 4].map(
              (item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                >
                  <div className="aspect-video animate-pulse bg-slate-200" />

                  <div className="p-6">
                    <div className="h-11 w-11 animate-pulse rounded-xl bg-slate-200" />

                    <div className="mt-5 h-5 w-3/4 animate-pulse rounded bg-slate-200" />

                    <div className="mt-4 h-3 w-full animate-pulse rounded bg-slate-100" />

                    <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-slate-100" />
                  </div>
                </div>
              )
            )}
          </div>
        )}


        {/* ERROR */}

        {!loading &&
          errorMessage && (
            <div className="mt-10 rounded-3xl border border-red-200 bg-red-50 px-6 py-12 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                <AlertTriangle
                  size={26}
                />
              </div>


              <h3 className="mt-5 text-xl font-bold text-[#082B3A]">
                {isEnglish
                  ? "Products & Services could not be loaded"
                  : "Produk & Layanan gagal dimuat"}
              </h3>


              <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-red-600">
                {errorMessage}
              </p>


              <button
                type="button"
                onClick={
                  loadServices
                }
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                <RefreshCw
                  size={17}
                />

                {isEnglish
                  ? "Try Again"
                  : "Coba Lagi"}
              </button>
            </div>
          )}


        {/* EMPTY */}

        {!loading &&
          !errorMessage &&
          services.length ===
            0 && (
            <div className="mt-10 rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center">

              <HeartPulse
                size={36}
                className="mx-auto text-slate-300"
              />


              <h3 className="mt-5 text-xl font-bold text-[#082B3A]">
                {isEnglish
                  ? "Products & Services are not available yet"
                  : "Produk & Layanan belum tersedia"}
              </h3>
            </div>
          )}


        {/* 4 PRODUCTS */}

        {!loading &&
          !errorMessage &&
          services.length >
            0 && (
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">

              {services.map(
                (service) => {
                  const Icon =
                    getServiceIcon(
                      service.slug
                    );


                  const detailUrl =
                    `/services/${encodeURIComponent(
                      service.slug
                    )}`;


                  return (
                    <Link
                      key={
                        service.id
                      }
                      to={
                        detailUrl
                      }
                      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft transition duration-300 hover:-translate-y-1 hover:border-orange/30 hover:shadow-xl"
                    >

                      {/* IMAGE */}

                      {service.image_url ? (
                        <div className="overflow-hidden bg-slate-100">
                          <img
                            src={
                              service.image_url
                            }
                            alt={
                              service.name
                            }
                            loading="lazy"
                            className="aspect-video w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-[#082B3A] to-cyan-700">
                          <Icon
                            size={52}
                            strokeWidth={
                              1.25
                            }
                            className="text-white/80"
                          />
                        </div>
                      )}


                      {/* CONTENT */}

                      <article className="flex flex-1 flex-col p-6">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cream text-orange">
                          <Icon
                            size={23}
                          />
                        </div>


                        <h3 className="mt-5 text-lg font-semibold leading-7 text-[#082B3A] transition group-hover:text-orange">
                          {
                            service.name
                          }
                        </h3>


                        <p className="mt-3 line-clamp-3 text-xs leading-6 text-slate-500">
                          {service.short_description ||
                            (isEnglish
                              ? "Service information will be available soon."
                              : "Informasi layanan akan segera tersedia.")}
                        </p>


                        <div className="mt-auto pt-6">
                          <span className="inline-flex items-center gap-2 text-sm font-semibold text-orange">
                            {isEnglish
                              ? "Learn More"
                              : "Pelajari Selengkapnya"}

                            <ArrowRight
                              size={16}
                              className="transition group-hover:translate-x-1"
                            />
                          </span>
                        </div>
                      </article>
                    </Link>
                  );
                }
              )}
            </div>
          )}
      </div>
    </section>
  );
}