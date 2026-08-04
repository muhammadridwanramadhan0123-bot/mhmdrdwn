import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Globe2,
  Instagram,
  Linkedin,
  LoaderCircle,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  RefreshCw,
  Save,
  Youtube,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  getAdminCompanyProfile,
  getAdminSiteSettings,
  saveCompanyLocation,
} from "../../services/companyAdminService";

const initialFormData = {
  company_name: "",
  tagline: "",
  address: "",
  email: "",
  phone: "",
  whatsapp: "",
  website: "",
  instagram_url: "",
  linkedin_url: "",
  youtube_url: "",
  google_maps_url: "",

  /*
   * Logo tidak diedit melalui halaman Location,
   * tetapi tetap dikirim agar tidak terhapus.
   */
  logo_url: "",
};

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizeExternalUrl(value) {
  const normalizedValue =
    normalizeText(value);

  if (!normalizedValue) {
    return "";
  }

  if (
    normalizedValue.startsWith("http://") ||
    normalizedValue.startsWith("https://")
  ) {
    return normalizedValue;
  }

  return `https://${normalizedValue}`;
}

function isValidEmail(value) {
  const normalizedValue =
    normalizeText(value);

  if (!normalizedValue) {
    return true;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    normalizedValue
  );
}

function isValidUrl(value) {
  const normalizedValue =
    normalizeText(value);

  if (!normalizedValue) {
    return true;
  }

  try {
    new URL(
      normalizeExternalUrl(
        normalizedValue
      )
    );

    return true;
  } catch {
    return false;
  }
}

function normalizeWhatsApp(value) {
  let normalizedValue = String(
    value || ""
  ).replace(/\D/g, "");

  if (!normalizedValue) {
    return "";
  }

  if (
    normalizedValue.startsWith("0")
  ) {
    normalizedValue =
      `62${normalizedValue.slice(1)}`;
  }

  return normalizedValue;
}

function getMapPreviewUrl(
  googleMapsUrl,
  address
) {
  const normalizedMapUrl =
    normalizeText(googleMapsUrl);

  /*
   * URL embed Google Maps dapat langsung
   * digunakan di dalam iframe.
   */
  if (
    normalizedMapUrl.includes(
      "/maps/embed"
    ) ||
    normalizedMapUrl.includes(
      "output=embed"
    )
  ) {
    return normalizedMapUrl;
  }

  /*
   * URL Google Maps biasa tidak selalu
   * dapat dimasukkan ke iframe. Karena itu
   * preview menggunakan pencarian alamat.
   */
  const mapQuery = encodeURIComponent(
    normalizeText(address) ||
      "Bandung, Indonesia"
  );

  return `https://www.google.com/maps?q=${mapQuery}&output=embed`;
}

function getMapExternalUrl(
  googleMapsUrl,
  address
) {
  const normalizedMapUrl =
    normalizeText(googleMapsUrl);

  if (normalizedMapUrl) {
    return normalizeExternalUrl(
      normalizedMapUrl
    );
  }

  const mapQuery = encodeURIComponent(
    normalizeText(address) ||
      "Bandung, Indonesia"
  );

  return `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;
}

function LocationFormLoading() {
  return (
    <div className="space-y-6">
      <div className="h-28 animate-pulse rounded-3xl bg-slate-200" />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-6">
          <div className="h-80 animate-pulse rounded-3xl bg-slate-200" />
          <div className="h-96 animate-pulse rounded-3xl bg-slate-200" />
        </div>

        <div className="h-[600px] animate-pulse rounded-3xl bg-slate-200" />
      </div>
    </div>
  );
}

function FormField({
  id,
  label,
  icon: Icon,
  required = false,
  description = "",
  children,
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#082B3A]"
      >
        {Icon && (
          <Icon
            size={16}
            className="text-[#FF5A0A]"
          />
        )}

        {label}

        {required && (
          <span className="text-red-500">
            *
          </span>
        )}
      </label>

      {children}

      {description && (
        <p className="mt-2 text-xs leading-5 text-slate-400">
          {description}
        </p>
      )}
    </div>
  );
}

export default function AdminCompanyLocationPage() {
  const [formData, setFormData] =
    useState(initialFormData);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const loadLocationData =
    useCallback(async () => {
      try {
        setLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        const [
          settings,
          profile,
        ] = await Promise.all([
          getAdminSiteSettings(),
          getAdminCompanyProfile(),
        ]);

        setFormData({
          company_name:
            settings?.company_name ||
            profile?.company_name ||
            "",

          tagline:
            settings?.tagline || "",

          address:
            settings?.address ||
            profile?.address ||
            "",

          email:
            settings?.email ||
            profile?.email ||
            "",

          phone:
            settings?.phone ||
            profile?.phone ||
            "",

          whatsapp:
            settings?.whatsapp || "",

          website:
            settings?.website ||
            profile?.website ||
            "",

          instagram_url:
            settings?.instagram_url ||
            "",

          linkedin_url:
            settings?.linkedin_url ||
            "",

          youtube_url:
            settings?.youtube_url ||
            "",

          google_maps_url:
            settings?.google_maps_url ||
            "",

          logo_url:
            settings?.logo_url ||
            profile?.logo_url ||
            "",
        });
      } catch (error) {
        console.error(
          "Informasi lokasi gagal dimuat:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Informasi lokasi gagal dimuat."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadLocationData();
  }, [loadLocationData]);

  function handleChange(event) {
    const { name, value } =
      event.target;

    setFormData(
      (currentFormData) => ({
        ...currentFormData,
        [name]: value,
      })
    );

    setSuccessMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const companyName =
      normalizeText(
        formData.company_name
      );

    const address =
      normalizeText(formData.address);

    const email =
      normalizeText(formData.email);

    if (!companyName) {
      setErrorMessage(
        "Nama perusahaan belum tersedia. Periksa halaman About Us."
      );

      return;
    }

    if (!address) {
      setErrorMessage(
        "Alamat kantor wajib diisi."
      );

      return;
    }

    if (
      email &&
      !isValidEmail(email)
    ) {
      setErrorMessage(
        "Format email tidak valid."
      );

      return;
    }

    const urlFields = [
      {
        label: "Website",
        value: formData.website,
      },
      {
        label: "Instagram",
        value:
          formData.instagram_url,
      },
      {
        label: "LinkedIn",
        value:
          formData.linkedin_url,
      },
      {
        label: "YouTube",
        value:
          formData.youtube_url,
      },
      {
        label: "Google Maps",
        value:
          formData.google_maps_url,
      },
    ];

    const invalidUrl = urlFields.find(
      (field) =>
        field.value &&
        !isValidUrl(field.value)
    );

    if (invalidUrl) {
      setErrorMessage(
        `Format URL ${invalidUrl.label} tidak valid.`
      );

      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      const payload = {
        ...formData,

        company_name: companyName,
        address,
        email,

        phone: normalizeText(
          formData.phone
        ),

        whatsapp:
          normalizeWhatsApp(
            formData.whatsapp
          ),

        website:
          formData.website
            ? normalizeExternalUrl(
                formData.website
              )
            : "",

        instagram_url:
          formData.instagram_url
            ? normalizeExternalUrl(
                formData.instagram_url
              )
            : "",

        linkedin_url:
          formData.linkedin_url
            ? normalizeExternalUrl(
                formData.linkedin_url
              )
            : "",

        youtube_url:
          formData.youtube_url
            ? normalizeExternalUrl(
                formData.youtube_url
              )
            : "",

        google_maps_url:
          formData.google_maps_url
            ? normalizeExternalUrl(
                formData.google_maps_url
              )
            : "",
      };

      const savedSettings =
        await saveCompanyLocation(
          payload
        );

      setFormData(
        (currentFormData) => ({
          ...currentFormData,
          ...payload,

          company_name:
            savedSettings
              ?.company_name ||
            payload.company_name,

          tagline:
            savedSettings?.tagline ??
            payload.tagline,

          address:
            savedSettings?.address ||
            payload.address,

          email:
            savedSettings?.email ||
            payload.email,

          phone:
            savedSettings?.phone ??
            payload.phone,

          whatsapp:
            savedSettings?.whatsapp ??
            payload.whatsapp,

          website:
            savedSettings?.website ??
            payload.website,

          instagram_url:
            savedSettings
              ?.instagram_url ??
            payload.instagram_url,

          linkedin_url:
            savedSettings
              ?.linkedin_url ??
            payload.linkedin_url,

          youtube_url:
            savedSettings
              ?.youtube_url ??
            payload.youtube_url,

          google_maps_url:
            savedSettings
              ?.google_maps_url ??
            payload.google_maps_url,

          logo_url:
            savedSettings?.logo_url ??
            payload.logo_url,
        })
      );

      setSuccessMessage(
        "Informasi lokasi dan kontak berhasil diperbarui."
      );
    } catch (error) {
      console.error(
        "Informasi lokasi gagal disimpan:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Informasi lokasi gagal disimpan."
      );
    } finally {
      setSaving(false);
    }
  }

  const mapPreviewUrl = useMemo(
    () =>
      getMapPreviewUrl(
        formData.google_maps_url,
        formData.address
      ),
    [
      formData.google_maps_url,
      formData.address,
    ]
  );

  const mapExternalUrl = useMemo(
    () =>
      getMapExternalUrl(
        formData.google_maps_url,
        formData.address
      ),
    [
      formData.google_maps_url,
      formData.address,
    ]
  );

  const whatsappPreviewUrl =
    useMemo(() => {
      const number =
        normalizeWhatsApp(
          formData.whatsapp
        );

      return number
        ? `https://wa.me/${number}`
        : "";
    }, [formData.whatsapp]);

  if (loading) {
    return <LocationFormLoading />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <Link
            to="/admin/company"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#FF5A0A]"
          >
            <ArrowLeft size={17} />
            Company Management
          </Link>

          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#FF5A0A]">
            <MapPin size={14} />
            Location
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#082B3A] md:text-4xl">
            Lokasi dan Kontak
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
            Kelola alamat kantor, telepon,
            email, WhatsApp, peta, website,
            dan akun media sosial perusahaan.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            to="/company/location"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-[#082B3A] shadow-sm transition hover:border-[#FF5A0A] hover:text-[#FF5A0A]"
          >
            Lihat Halaman Publik
            <ExternalLink size={16} />
          </Link>

          <button
            type="button"
            onClick={loadLocationData}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-[#FF5A0A] hover:text-[#FF5A0A] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Reset
          </button>
        </div>
      </section>

      {/* Error */}
      {errorMessage && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4"
        >
          <AlertTriangle
            size={21}
            className="mt-0.5 shrink-0 text-red-600"
          />

          <div>
            <p className="font-semibold text-red-800">
              Terjadi kesalahan
            </p>

            <p className="mt-1 text-sm leading-6 text-red-700">
              {errorMessage}
            </p>
          </div>
        </div>
      )}

      {/* Success */}
      {successMessage && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4"
        >
          <CheckCircle2
            size={21}
            className="mt-0.5 shrink-0 text-emerald-600"
          />

          <div>
            <p className="font-semibold text-emerald-800">
              Perubahan tersimpan
            </p>

            <p className="mt-1 text-sm leading-6 text-emerald-700">
              {successMessage}
            </p>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_430px]">
          {/* Form */}
          <div className="space-y-6">
            {/* Informasi kantor */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-[#FF5A0A]">
                  <MapPin size={22} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-[#082B3A]">
                    Informasi Kantor
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Informasi alamat yang akan
                    ditampilkan pada website.
                  </p>
                </div>
              </div>

              <div className="mt-7 space-y-6">
                <div>
                  <label
                    htmlFor="company_name"
                    className="mb-2 block text-sm font-semibold text-[#082B3A]"
                  >
                    Nama Perusahaan
                  </label>

                  <input
                    id="company_name"
                    name="company_name"
                    type="text"
                    value={
                      formData.company_name
                    }
                    readOnly
                    className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500 outline-none"
                  />

                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    Nama perusahaan dikelola
                    melalui halaman About Us.
                  </p>
                </div>

                <FormField
                  id="address"
                  label="Alamat Lengkap"
                  icon={MapPin}
                  required
                  description="Masukkan alamat lengkap agar pencarian Google Maps lebih akurat."
                >
                  <textarea
                    id="address"
                    name="address"
                    value={
                      formData.address
                    }
                    onChange={handleChange}
                    rows={5}
                    required
                    placeholder="Gedung, nama jalan, nomor, kota, kode pos..."
                    className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-7 text-[#082B3A] outline-none transition placeholder:text-slate-400 focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
                  />
                </FormField>

                <FormField
                  id="google_maps_url"
                  label="URL Google Maps"
                  icon={Navigation}
                  description="Opsional. Tempel URL Google Maps kantor. Jika kosong, peta dibuat berdasarkan alamat."
                >
                  <input
                    id="google_maps_url"
                    name="google_maps_url"
                    type="text"
                    value={
                      formData
                        .google_maps_url
                    }
                    onChange={handleChange}
                    placeholder="https://maps.google.com/..."
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#082B3A] outline-none transition placeholder:text-slate-400 focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
                  />
                </FormField>
              </div>
            </section>

            {/* Kontak */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Phone size={22} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-[#082B3A]">
                    Informasi Kontak
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Kontak resmi yang dapat
                    digunakan pengunjung website.
                  </p>
                </div>
              </div>

              <div className="mt-7 grid gap-6 md:grid-cols-2">
                <FormField
                  id="email"
                  label="Email"
                  icon={Mail}
                >
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="info@perusahaan.com"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#082B3A] outline-none transition placeholder:text-slate-400 focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
                  />
                </FormField>

                <FormField
                  id="phone"
                  label="Nomor Telepon"
                  icon={Phone}
                >
                  <input
                    id="phone"
                    name="phone"
                    type="text"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+62 22 0000 0000"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#082B3A] outline-none transition placeholder:text-slate-400 focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
                  />
                </FormField>

                <FormField
                  id="whatsapp"
                  label="WhatsApp"
                  icon={MessageCircle}
                  description="Dapat diisi dengan 0878... atau 62878.... Sistem akan mengubahnya ke format internasional."
                >
                  <input
                    id="whatsapp"
                    name="whatsapp"
                    type="text"
                    value={
                      formData.whatsapp
                    }
                    onChange={handleChange}
                    placeholder="6287870007781"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#082B3A] outline-none transition placeholder:text-slate-400 focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
                  />
                </FormField>

                <FormField
                  id="website"
                  label="Website"
                  icon={Globe2}
                >
                  <input
                    id="website"
                    name="website"
                    type="text"
                    value={
                      formData.website
                    }
                    onChange={handleChange}
                    placeholder="https://website.com"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#082B3A] outline-none transition placeholder:text-slate-400 focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
                  />
                </FormField>
              </div>
            </section>

            {/* Media sosial */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                  <Instagram size={22} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-[#082B3A]">
                    Media Sosial
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Tautan akun media sosial resmi
                    perusahaan.
                  </p>
                </div>
              </div>

              <div className="mt-7 space-y-6">
                <FormField
                  id="instagram_url"
                  label="Instagram"
                  icon={Instagram}
                >
                  <input
                    id="instagram_url"
                    name="instagram_url"
                    type="text"
                    value={
                      formData
                        .instagram_url
                    }
                    onChange={handleChange}
                    placeholder="https://instagram.com/jmtgroup.id"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#082B3A] outline-none transition placeholder:text-slate-400 focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
                  />
                </FormField>

                <FormField
                  id="linkedin_url"
                  label="LinkedIn"
                  icon={Linkedin}
                >
                  <input
                    id="linkedin_url"
                    name="linkedin_url"
                    type="text"
                    value={
                      formData
                        .linkedin_url
                    }
                    onChange={handleChange}
                    placeholder="https://linkedin.com/company/..."
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#082B3A] outline-none transition placeholder:text-slate-400 focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
                  />
                </FormField>

                <FormField
                  id="youtube_url"
                  label="YouTube"
                  icon={Youtube}
                >
                  <input
                    id="youtube_url"
                    name="youtube_url"
                    type="text"
                    value={
                      formData.youtube_url
                    }
                    onChange={handleChange}
                    placeholder="https://youtube.com/@..."
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#082B3A] outline-none transition placeholder:text-slate-400 focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
                  />
                </FormField>
              </div>
            </section>
          </div>

          {/* Preview */}
          <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#FF5A0A]">
                      Location Preview
                    </p>

                    <h2 className="mt-2 font-bold text-[#082B3A]">
                      Preview Peta
                    </h2>
                  </div>

                  <a
                    href={mapExternalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-[#FF5A0A] hover:text-[#FF5A0A]"
                    aria-label="Buka Google Maps"
                    title="Buka Google Maps"
                  >
                    <ExternalLink size={17} />
                  </a>
                </div>
              </div>

              <div className="h-80 bg-slate-100">
                <iframe
                  key={mapPreviewUrl}
                  src={mapPreviewUrl}
                  title="Preview lokasi perusahaan"
                  className="h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>

              <div className="p-6">
                <div className="flex items-start gap-3">
                  <MapPin
                    size={20}
                    className="mt-0.5 shrink-0 text-[#FF5A0A]"
                  />

                  <div>
                    <p className="font-semibold text-[#082B3A]">
                      {formData.company_name ||
                        "Jasa Medika Transmedic"}
                    </p>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {formData.address ||
                        "Alamat kantor belum diisi."}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Preview kontak */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#FF5A0A]">
                Contact Preview
              </p>

              <h2 className="mt-2 font-bold text-[#082B3A]">
                Kontak yang Ditampilkan
              </h2>

              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                  <Mail
                    size={18}
                    className="mt-0.5 shrink-0 text-[#FF5A0A]"
                  />

                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Email
                    </p>

                    <p className="mt-1 break-all text-sm font-semibold text-[#082B3A]">
                      {formData.email ||
                        "Belum diisi"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                  <Phone
                    size={18}
                    className="mt-0.5 shrink-0 text-[#FF5A0A]"
                  />

                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Telepon
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#082B3A]">
                      {formData.phone ||
                        "Belum diisi"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                  <MessageCircle
                    size={18}
                    className="mt-0.5 shrink-0 text-emerald-600"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      WhatsApp
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#082B3A]">
                      {formData.whatsapp ||
                        "Belum diisi"}
                    </p>

                    {whatsappPreviewUrl && (
                      <a
                        href={
                          whatsappPreviewUrl
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600"
                      >
                        Uji WhatsApp
                        <ExternalLink
                          size={13}
                        />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </aside>
        </div>

        {/* Tombol simpan */}
        <section className="sticky bottom-4 z-20 flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-[#082B3A]">
              Simpan informasi lokasi
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Data akan disinkronkan ke
              site_settings dan company_profile.
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF5A0A] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:bg-[#E94F00] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <LoaderCircle
                  size={18}
                  className="animate-spin"
                />
                Menyimpan...
              </>
            ) : (
              <>
                <Save size={18} />
                Simpan Perubahan
              </>
            )}
          </button>
        </section>
      </form>
    </div>
  );
}