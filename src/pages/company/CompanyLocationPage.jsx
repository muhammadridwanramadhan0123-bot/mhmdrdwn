import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AlertTriangle,
  Building2,
  Check,
  Copy,
  ExternalLink,
  Globe2,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  RefreshCw,
  Route,
  ShieldCheck,
} from "lucide-react";

import {
  CTA,
  PageHero,
  SectionHeading,
} from "../../components/Common";

import { getCompanyProfile } from "../../services/companyService";

/*
 * Informasi cadangan mengikuti website
 * Jasa Medika Transmedic sebelumnya.
 *
 * Nilai dari Supabase tetap diprioritaskan.
 */
const fallbackProfile = {
  company_name: "Jasa Medika Transmedic",
  address:
    "Gedung Paramarta Tridharma, Jl. Cikutra Baru Raya No. 28, Bandung 40124, Indonesia",
  email: "info@jasamedikatransmedic.com",
  phone: "+62 22 877877 81",
  whatsapp: "+62 878 7000 7781",
  website: "https://www.jasamedikatransmedic.com",
  instagram_url:
    "https://www.instagram.com/jmtgroup.id",
};

/*
 * Mengubah nomor telepon menjadi format
 * yang bisa digunakan oleh atribut tel:.
 */
function createPhoneHref(value) {
  const normalizedValue = String(value || "")
    .trim()
    .replace(/[^\d+]/g, "");

  return normalizedValue
    ? `tel:${normalizedValue}`
    : "#";
}

/*
 * Mengubah nomor WhatsApp menjadi angka
 * internasional tanpa karakter tambahan.
 */
function createWhatsAppNumber(value) {
  let number = String(value || "").replace(
    /\D/g,
    ""
  );

  if (!number) {
    return "";
  }

  if (number.startsWith("0")) {
    number = `62${number.slice(1)}`;
  }

  return number;
}

function createWhatsAppHref(
  value,
  companyName
) {
  const number =
    createWhatsAppNumber(value);

  if (!number) {
    return "#";
  }

  const message = encodeURIComponent(
    `Halo ${companyName}, saya ingin mendapatkan informasi lebih lanjut mengenai layanan Jasa Medika Transmedic.`
  );

  return `https://wa.me/${number}?text=${message}`;
}

/*
 * Memastikan alamat website mempunyai
 * protokol http atau https.
 */
function normalizeExternalUrl(value) {
  const normalizedValue = String(
    value || ""
  ).trim();

  if (!normalizedValue) {
    return "";
  }

  if (
    normalizedValue.startsWith(
      "http://"
    ) ||
    normalizedValue.startsWith(
      "https://"
    )
  ) {
    return normalizedValue;
  }

  return `https://${normalizedValue}`;
}

/*
 * Mendukung nilai Instagram dalam format:
 * - @jmtgroup.id
 * - jmtgroup.id
 * - URL lengkap Instagram
 */
function normalizeInstagramUrl(value) {
  const normalizedValue = String(
    value || ""
  ).trim();

  if (!normalizedValue) {
    return "";
  }

  if (
    normalizedValue.startsWith(
      "http://"
    ) ||
    normalizedValue.startsWith(
      "https://"
    )
  ) {
    return normalizedValue;
  }

  const username = normalizedValue
    .replace(/^@/, "")
    .replace(
      /^instagram\.com\//,
      ""
    );

  return `https://www.instagram.com/${username}`;
}

function getInstagramLabel(value) {
  const normalizedValue = String(
    value || ""
  ).trim();

  if (!normalizedValue) {
    return "@jmtgroup.id";
  }

  if (
    normalizedValue.includes(
      "instagram.com/"
    )
  ) {
    const username = normalizedValue
      .split("instagram.com/")[1]
      ?.split(/[/?#]/)[0];

    return username
      ? `@${username}`
      : "@jmtgroup.id";
  }

  return normalizedValue.startsWith("@")
    ? normalizedValue
    : `@${normalizedValue}`;
}

function LocationPageLoading() {
  return (
    <>
      <div className="h-[420px] animate-pulse bg-slate-200" />

      <section className="container-jmt py-20">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-5">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-28 animate-pulse rounded-3xl bg-slate-200"
              />
            ))}
          </div>

          <div className="h-[560px] animate-pulse rounded-3xl bg-slate-200" />
        </div>
      </section>
    </>
  );
}

export default function CompanyLocationPage() {
  const [profile, setProfile] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [copiedField, setCopiedField] =
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
          "Lokasi perusahaan gagal dimuat:",
          error
        );

        /*
         * Halaman tetap menampilkan data
         * cadangan ketika backend gagal.
         */
        setProfile(null);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Informasi lokasi perusahaan gagal dimuat."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadCompanyProfile();
  }, [loadCompanyProfile]);

  const companyData = useMemo(
    () => ({
      company_name:
        profile?.company_name ||
        fallbackProfile.company_name,

      address:
        profile?.address ||
        fallbackProfile.address,

      email:
        profile?.email ||
        fallbackProfile.email,

      phone:
        profile?.phone ||
        fallbackProfile.phone,

      whatsapp:
        profile?.whatsapp ||
        fallbackProfile.whatsapp,

      website:
        profile?.website ||
        fallbackProfile.website,

      instagram_url:
        profile?.instagram_url ||
        fallbackProfile.instagram_url,
    }),
    [profile]
  );

  const mapQuery = encodeURIComponent(
    companyData.address
  );

  const mapEmbedUrl =
    `https://www.google.com/maps?q=${mapQuery}&output=embed`;

  const mapNavigationUrl =
    `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  const whatsappHref =
    createWhatsAppHref(
      companyData.whatsapp,
      companyData.company_name
    );

  const websiteHref =
    normalizeExternalUrl(
      companyData.website
    );

  const instagramHref =
    normalizeInstagramUrl(
      companyData.instagram_url
    );

  const instagramLabel =
    getInstagramLabel(
      companyData.instagram_url
    );

  async function handleCopy(
    field,
    value
  ) {
    if (!value) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        value
      );

      setCopiedField(field);

      window.setTimeout(() => {
        setCopiedField("");
      }, 2000);
    } catch (error) {
      console.error(
        "Informasi gagal disalin:",
        error
      );
    }
  }

  if (loading) {
    return <LocationPageLoading />;
  }

  const contactItems = [
    {
      key: "address",
      label: "Alamat Kantor",
      value: companyData.address,
      description:
        "Kantor Jasa Medika Transmedic di Bandung.",
      icon: MapPin,
      href: mapNavigationUrl,
      external: true,
    },
    {
      key: "phone",
      label: "Telepon",
      value: companyData.phone,
      description:
        "Hubungi kantor melalui sambungan telepon.",
      icon: Phone,
      href: createPhoneHref(
        companyData.phone
      ),
      external: false,
    },
    {
      key: "email",
      label: "Email",
      value: companyData.email,
      description:
        "Kirim pertanyaan dan kebutuhan kerja sama.",
      icon: Mail,
      href: `mailto:${companyData.email}`,
      external: false,
    },
    {
      key: "instagram",
      label: "Instagram",
      value: instagramLabel,
      description:
        "Ikuti informasi dan aktivitas terbaru JMT.",
      icon: Instagram,
      href: instagramHref,
      external: true,
    },
  ];

  return (
    <>
      <PageHero
        eyebrow="Company — Location"
        title="Visit and Connect With Us"
        description="Temukan lokasi kantor Jasa Medika Transmedic dan hubungi tim kami untuk informasi layanan, kerja sama, dan kebutuhan transformasi kesehatan."
      />

      {/* Peringatan backend */}
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
                  menampilkan informasi lokasi
                  cadangan.
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

      {/* Informasi utama */}
      <section className="container-jmt py-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
          <div>
            <SectionHeading
              kicker="Our Location"
              title="Kunjungi kantor Jasa Medika Transmedic"
              description="Kami berlokasi di Bandung dan siap mendiskusikan kebutuhan teknologi, operasional, fasilitas, serta transformasi layanan kesehatan."
            />

            <div className="mt-9 space-y-4">
              {contactItems.map((item) => {
                const Icon = item.icon;

                return (
                  <article
                    key={item.key}
                    className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:border-orange/30 hover:shadow-lg"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange/10 text-orange transition group-hover:bg-orange group-hover:text-white">
                        <Icon size={21} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
                          {item.label}
                        </p>

                        <a
                          href={item.href}
                          target={
                            item.external
                              ? "_blank"
                              : undefined
                          }
                          rel={
                            item.external
                              ? "noreferrer"
                              : undefined
                          }
                          className="mt-2 block break-words text-base font-bold leading-7 text-ink transition hover:text-orange"
                        >
                          {item.value}
                        </a>

                        <p className="mt-2 text-xs leading-5 text-slate-500">
                          {item.description}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(
                            item.key,
                            item.value
                          )
                        }
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition hover:border-orange hover:text-orange"
                        aria-label={`Salin ${item.label}`}
                        title={`Salin ${item.label}`}
                      >
                        {copiedField ===
                        item.key ? (
                          <Check
                            size={17}
                            className="text-emerald-600"
                          />
                        ) : (
                          <Copy size={17} />
                        )}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {/* Peta */}
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl">
            <div className="relative h-[520px] bg-slate-100">
              <iframe
                src={mapEmbedUrl}
                title={`Lokasi ${companyData.company_name}`}
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />

              <div className="pointer-events-none absolute left-5 top-5 max-w-xs rounded-2xl border border-white/40 bg-white/90 p-4 shadow-lg backdrop-blur">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange text-white">
                    <Building2 size={19} />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-ink">
                      {companyData.company_name}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Bandung, Indonesia
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-4 border-t border-slate-100 p-5 sm:flex-row sm:items-center">
              <div className="flex items-start gap-3">
                <Navigation
                  size={20}
                  className="mt-0.5 shrink-0 text-orange"
                />

                <div>
                  <p className="text-sm font-semibold text-ink">
                    Petunjuk arah
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Buka lokasi menggunakan Google
                    Maps.
                  </p>
                </div>
              </div>

              <a
                href={mapNavigationUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange/20 transition hover:bg-[#E94F00]"
              >
                <Route size={17} />
                Buka Peta
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Cara menghubungi */}
      <section className="bg-mist py-20">
        <div className="container-jmt">
          <SectionHeading
            kicker="Connect With Us"
            title="Pilih cara terbaik untuk menghubungi kami"
            description="Tim Jasa Medika Transmedic siap membantu menjawab kebutuhan informasi, layanan, dan kolaborasi."
            center
          />

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {/* WhatsApp */}
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-600 group-hover:text-white">
                <MessageCircle size={25} />
              </div>

              <p className="mt-7 text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">
                Direct Message
              </p>

              <h3 className="mt-3 text-xl font-bold text-ink">
                WhatsApp
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-500">
                Hubungi tim kami melalui pesan
                WhatsApp untuk komunikasi yang
                praktis.
              </p>

              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600">
                Mulai Percakapan
                <ExternalLink size={15} />
              </span>
            </a>

            {/* Email */}
            <a
              href={`mailto:${companyData.email}`}
              className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange/30 hover:shadow-xl"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange/10 text-orange transition group-hover:bg-orange group-hover:text-white">
                <Mail size={25} />
              </div>

              <p className="mt-7 text-xs font-bold uppercase tracking-[0.16em] text-orange">
                Business Inquiry
              </p>

              <h3 className="mt-3 text-xl font-bold text-ink">
                Email
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-500">
                Kirim proposal, pertanyaan bisnis,
                atau kebutuhan kerja sama melalui
                email.
              </p>

              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-orange">
                Kirim Email
                <ExternalLink size={15} />
              </span>
            </a>

            {/* Website */}
            <a
              href={websiteHref}
              target="_blank"
              rel="noreferrer"
              className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-cyan-300 hover:shadow-xl"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600 transition group-hover:bg-cyan-600 group-hover:text-white">
                <Globe2 size={25} />
              </div>

              <p className="mt-7 text-xs font-bold uppercase tracking-[0.16em] text-cyan-600">
                Official Website
              </p>

              <h3 className="mt-3 text-xl font-bold text-ink">
                Website
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-500">
                Pelajari lebih lanjut mengenai
                layanan dan solusi Jasa Medika
                Transmedic.
              </p>

              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-600">
                Kunjungi Website
                <ExternalLink size={15} />
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* Keamanan dan kepercayaan */}
      <section className="container-jmt py-20">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-ink via-[#0A4053] to-teal p-8 text-white md:p-12">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10" />

          <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-orange/10 blur-2xl" />

          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="max-w-3xl">
              <ShieldCheck
                size={38}
                className="text-orange"
              />

              <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-orange">
                Strategic Partnership
              </p>

              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-4xl">
                Mari diskusikan kebutuhan
                transformasi layanan kesehatan Anda
              </h2>

              <p className="mt-6 text-base leading-8 text-white/70">
                Tim kami siap membantu merancang
                solusi teknologi, operasional,
                infrastruktur, dan pengembangan
                layanan yang sesuai dengan kebutuhan
                institusi Anda.
              </p>
            </div>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange px-6 py-4 text-sm font-semibold text-white shadow-xl shadow-orange/20 transition hover:bg-[#E94F00]"
            >
              <MessageCircle size={18} />
              Hubungi Tim JMT
            </a>
          </div>
        </div>
      </section>

      <CTA />
    </>
  );
}