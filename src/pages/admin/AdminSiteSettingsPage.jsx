import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ExternalLink,
  Globe2,
  Image,
  Instagram,
  Linkedin,
  LoaderCircle,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  RefreshCw,
  Save,
  Settings2,
  Upload,
  Youtube,
} from "lucide-react";

import {
  getAdminSiteSettings,
  saveAdminSiteSettings,
  uploadSiteLogo,
} from "../../services/siteSettingsAdminService";


const EMPTY_FORM = {
  company_name: "",
  tagline: "",
  email: "",
  phone: "",
  whatsapp: "",
  address: "",
  website: "",
  google_maps_url: "",
  instagram: "",
  linkedin: "",
  youtube: "",
  logo_url: "",
};


function normalizeSettingValue(
  value
) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(
    value
  );
}


function SettingsSkeleton() {
  return (
    <div className="space-y-6">

      <div className="h-40 animate-pulse rounded-3xl border border-slate-200 bg-white" />

      <div className="grid gap-6 xl:grid-cols-2">

        <div className="h-[440px] animate-pulse rounded-3xl border border-slate-200 bg-white" />

        <div className="h-[440px] animate-pulse rounded-3xl border border-slate-200 bg-white" />

      </div>

    </div>
  );
}


function FieldLabel({
  children,
  required = false,
}) {
  return (
    <label className="mb-2 block text-sm font-semibold text-slate-700">

      {children}

      {required && (
        <span className="ml-1 text-red-500">
          *
        </span>
      )}

    </label>
  );
}


export default function AdminSiteSettingsPage() {
  const [
    form,
    setForm,
  ] = useState(
    EMPTY_FORM
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    uploadingLogo,
    setUploadingLogo,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");


  /*
   * ====================================================
   * LOAD SETTINGS
   * ====================================================
   */

  const loadSettings =
    useCallback(
      async () => {
        try {
          setLoading(
            true
          );

          setErrorMessage(
            ""
          );

          const settings =
            await getAdminSiteSettings();


          setForm({
            company_name:
              normalizeSettingValue(
                settings.company_name
              ),

            tagline:
              normalizeSettingValue(
                settings.tagline
              ),

            email:
              normalizeSettingValue(
                settings.email
              ),

            phone:
              normalizeSettingValue(
                settings.phone
              ),

            whatsapp:
              normalizeSettingValue(
                settings.whatsapp
              ),

            address:
              normalizeSettingValue(
                settings.address
              ),

            website:
              normalizeSettingValue(
                settings.website
              ),

            google_maps_url:
              normalizeSettingValue(
                settings.google_maps_url
              ),

            instagram:
              normalizeSettingValue(
                settings.instagram
              ),

            linkedin:
              normalizeSettingValue(
                settings.linkedin
              ),

            youtube:
              normalizeSettingValue(
                settings.youtube
              ),

            logo_url:
              normalizeSettingValue(
                settings.logo_url
              ),
          });

        } catch (error) {
          console.error(
            "Admin Site Settings gagal dimuat:",
            error
          );

          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Site Settings gagal dimuat."
          );

        } finally {
          setLoading(
            false
          );
        }
      },
      []
    );


  useEffect(() => {
    loadSettings();
  }, [loadSettings]);


  /*
   * ====================================================
   * INPUT
   * ====================================================
   */

  function handleChange(
    event
  ) {
    const {
      name,
      value,
    } =
      event.target;

    setForm(
      (
        current
      ) => ({
        ...current,
        [name]:
          value,
      })
    );

    if (
      successMessage
    ) {
      setSuccessMessage(
        ""
      );
    }
  }


  /*
   * ====================================================
   * LOGO
   * ====================================================
   */

  async function handleLogoUpload(
    event
  ) {
    const file =
      event.target
        .files?.[0];

    event.target.value =
      "";

    if (!file) {
      return;
    }

    try {
      setUploadingLogo(
        true
      );

      setErrorMessage(
        ""
      );

      setSuccessMessage(
        ""
      );


      const uploaded =
        await uploadSiteLogo(
          file
        );


      setForm(
        (
          current
        ) => ({
          ...current,

          logo_url:
            uploaded.publicUrl,
        })
      );


      setSuccessMessage(
        "Logo berhasil diunggah. Klik Simpan Perubahan untuk menerapkannya pada website."
      );

    } catch (error) {
      console.error(
        "Upload logo gagal:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Logo gagal diunggah."
      );

    } finally {
      setUploadingLogo(
        false
      );
    }
  }


  /*
   * ====================================================
   * SAVE
   * ====================================================
   */

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    if (saving) {
      return;
    }


    if (
      !form.company_name.trim()
    ) {
      setErrorMessage(
        "Nama perusahaan wajib diisi."
      );

      return;
    }


    if (
      form.email &&
      !form.email.includes(
        "@"
      )
    ) {
      setErrorMessage(
        "Format email belum valid."
      );

      return;
    }


    try {
      setSaving(
        true
      );

      setErrorMessage(
        ""
      );

      setSuccessMessage(
        ""
      );


      await saveAdminSiteSettings(
        form
      );


      setSuccessMessage(
        "Site Settings berhasil disimpan."
      );


      await loadSettings();

    } catch (error) {
      console.error(
        "Simpan Site Settings gagal:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Site Settings gagal disimpan."
      );

    } finally {
      setSaving(
        false
      );
    }
  }


  if (loading) {
    return (
      <SettingsSkeleton />
    );
  }


  return (
    <div className="space-y-7">

      {/* ==================================================
          PAGE HEADER
      ================================================== */}

      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">

        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-orange/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-orange">

            <Settings2
              size={14}
            />

            System Settings

          </div>


          <h1 className="mt-4 text-3xl font-bold text-[#082B3A]">
            Site Settings
          </h1>


          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
            Kelola identitas website, informasi kontak, lokasi,
            media sosial, dan WhatsApp yang digunakan pada website publik.
          </p>
        </div>


        <button
          type="button"
          onClick={
            loadSettings
          }
          disabled={
            saving
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-orange hover:text-orange disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={17}
          />

          Refresh
        </button>

      </div>


      {/* ==================================================
          MESSAGES
      ================================================== */}

      {errorMessage && (
        <div className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">

          <AlertTriangle
            size={20}
            className="mt-0.5 shrink-0"
          />

          <span>
            {
              errorMessage
            }
          </span>

        </div>
      )}


      {successMessage && (
        <div className="flex gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">

          <CheckCircle2
            size={20}
            className="mt-0.5 shrink-0"
          />

          <span>
            {
              successMessage
            }
          </span>

        </div>
      )}


      <form
        onSubmit={
          handleSubmit
        }
        className="space-y-6"
      >

        {/* ==================================================
            BRANDING
        ================================================== */}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-7">

          <div className="flex items-start gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Building2
                size={21}
              />
            </div>


            <div>
              <h2 className="font-bold text-[#082B3A]">
                Identitas Website
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Nama, tagline, dan logo global website.
              </p>
            </div>

          </div>


          <div className="mt-7 grid gap-6 lg:grid-cols-2">

            <div>
              <FieldLabel
                required
              >
                Nama Perusahaan
              </FieldLabel>

              <input
                type="text"
                name="company_name"
                value={
                  form.company_name
                }
                onChange={
                  handleChange
                }
                placeholder="Jasa Medika Transmedic"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-orange focus:ring-4 focus:ring-orange/10"
              />
            </div>


            <div>
              <FieldLabel>
                Tagline
              </FieldLabel>

              <input
                type="text"
                name="tagline"
                value={
                  form.tagline
                }
                onChange={
                  handleChange
                }
                placeholder="Integrated Healthcare Solutions"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-orange focus:ring-4 focus:ring-orange/10"
              />
            </div>

          </div>


          {/* LOGO */}

          <div className="mt-6">

            <FieldLabel>
              Logo Website
            </FieldLabel>


            <div className="grid gap-5 lg:grid-cols-[180px_minmax(0,1fr)]">

              <div className="flex min-h-[120px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-5">

                {form.logo_url ? (
                  <img
                    src={
                      form.logo_url
                    }
                    alt="Preview logo"
                    className="max-h-20 max-w-full object-contain"
                  />
                ) : (
                  <Image
                    size={34}
                    className="text-slate-300"
                  />
                )}

              </div>


              <div className="space-y-3">

                <input
                  type="url"
                  name="logo_url"
                  value={
                    form.logo_url
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="https://..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-orange focus:ring-4 focus:ring-orange/10"
                />


                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-orange hover:text-orange">

                  {uploadingLogo ? (
                    <LoaderCircle
                      size={17}
                      className="animate-spin"
                    />
                  ) : (
                    <Upload
                      size={17}
                    />
                  )}

                  {uploadingLogo
                    ? "Mengunggah..."
                    : "Upload Logo"}

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={
                      handleLogoUpload
                    }
                    disabled={
                      uploadingLogo
                    }
                    className="hidden"
                  />

                </label>


                <p className="text-xs leading-6 text-slate-400">
                  Format JPG, PNG, atau WebP. Maksimal 5 MB.
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* ==================================================
            CONTACT
        ================================================== */}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-7">

          <div className="flex items-start gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Phone
                size={21}
              />
            </div>


            <div>
              <h2 className="font-bold text-[#082B3A]">
                Kontak & Lokasi
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Digunakan pada footer, tombol WhatsApp, dan informasi kontak publik.
              </p>
            </div>

          </div>


          <div className="mt-7 grid gap-6 lg:grid-cols-2">

            <div>
              <FieldLabel>
                Email
              </FieldLabel>

              <div className="relative">
                <Mail
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="email"
                  name="email"
                  value={
                    form.email
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="info@example.com"
                  className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-orange focus:ring-4 focus:ring-orange/10"
                />
              </div>
            </div>


            <div>
              <FieldLabel>
                Telepon
              </FieldLabel>

              <div className="relative">
                <Phone
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  name="phone"
                  value={
                    form.phone
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="+62 ..."
                  className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-orange focus:ring-4 focus:ring-orange/10"
                />
              </div>
            </div>


            <div>
              <FieldLabel>
                WhatsApp
              </FieldLabel>

              <div className="relative">
                <MessageCircle
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  name="whatsapp"
                  value={
                    form.whatsapp
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="628xxxxxxxxxx"
                  className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-orange focus:ring-4 focus:ring-orange/10"
                />
              </div>

              <p className="mt-2 text-xs text-slate-400">
                Disarankan menggunakan format internasional tanpa tanda +.
              </p>
            </div>


            <div>
              <FieldLabel>
                Google Maps URL
              </FieldLabel>

              <div className="relative">
                <MapPin
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="url"
                  name="google_maps_url"
                  value={
                    form.google_maps_url
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="https://maps..."
                  className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-orange focus:ring-4 focus:ring-orange/10"
                />
              </div>
            </div>

          </div>


          <div className="mt-6">

            <FieldLabel>
              Alamat
            </FieldLabel>

            <textarea
              name="address"
              value={
                form.address
              }
              onChange={
                handleChange
              }
              rows={4}
              placeholder="Alamat lengkap perusahaan"
              className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-7 outline-none transition focus:border-orange focus:ring-4 focus:ring-orange/10"
            />

          </div>

        </section>


        {/* ==================================================
            ONLINE PRESENCE
        ================================================== */}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-7">

          <div className="flex items-start gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <Globe2
                size={21}
              />
            </div>


            <div>
              <h2 className="font-bold text-[#082B3A]">
                Website & Media Sosial
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                URL yang digunakan pada footer dan tautan eksternal website.
              </p>
            </div>

          </div>


          <div className="mt-7 grid gap-6 lg:grid-cols-2">

            <div>
              <FieldLabel>
                Website
              </FieldLabel>

              <div className="relative">
                <Globe2
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="url"
                  name="website"
                  value={
                    form.website
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="https://..."
                  className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-orange focus:ring-4 focus:ring-orange/10"
                />
              </div>
            </div>


            <div>
              <FieldLabel>
                Instagram
              </FieldLabel>

              <div className="relative">
                <Instagram
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="url"
                  name="instagram"
                  value={
                    form.instagram
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="https://instagram.com/..."
                  className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-orange focus:ring-4 focus:ring-orange/10"
                />
              </div>
            </div>


            <div>
              <FieldLabel>
                LinkedIn
              </FieldLabel>

              <div className="relative">
                <Linkedin
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="url"
                  name="linkedin"
                  value={
                    form.linkedin
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="https://linkedin.com/company/..."
                  className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-orange focus:ring-4 focus:ring-orange/10"
                />
              </div>
            </div>


            <div>
              <FieldLabel>
                YouTube
              </FieldLabel>

              <div className="relative">
                <Youtube
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="url"
                  name="youtube"
                  value={
                    form.youtube
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="https://youtube.com/@..."
                  className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-orange focus:ring-4 focus:ring-orange/10"
                />
              </div>
            </div>

          </div>


          {/* PREVIEW LINKS */}

          <div className="mt-7 rounded-2xl bg-slate-50 p-5">

            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              Quick Preview
            </p>


            <div className="mt-4 flex flex-wrap gap-2">

              {[
                {
                  label:
                    "Website",

                  href:
                    form.website,
                },
                {
                  label:
                    "Instagram",

                  href:
                    form.instagram,
                },
                {
                  label:
                    "LinkedIn",

                  href:
                    form.linkedin,
                },
                {
                  label:
                    "YouTube",

                  href:
                    form.youtube,
                },
                {
                  label:
                    "Google Maps",

                  href:
                    form.google_maps_url,
                },
              ]
                .filter(
                  (
                    item
                  ) =>
                    Boolean(
                      item.href
                        ?.trim()
                    )
                )
                .map(
                  (
                    item
                  ) => (
                    <a
                      key={
                        item.label
                      }
                      href={
                        item.href
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-orange hover:text-orange"
                    >
                      {
                        item.label
                      }

                      <ExternalLink
                        size={13}
                      />
                    </a>
                  )
                )}

            </div>

          </div>

        </section>


        {/* ==================================================
            SAVE
        ================================================== */}

        <div className="sticky bottom-4 z-20 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur">

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

            <div>
              <p className="text-sm font-semibold text-[#082B3A]">
                Simpan Site Settings
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Perubahan akan digunakan oleh header, footer, kontak, social media, dan WhatsApp website.
              </p>
            </div>


            <button
              type="submit"
              disabled={
                saving ||
                uploadingLogo
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF5A0A] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-[#e94f00] disabled:cursor-not-allowed disabled:opacity-60"
            >

              {saving ? (
                <LoaderCircle
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <Save
                  size={18}
                />
              )}


              {saving
                ? "Menyimpan..."
                : "Simpan Perubahan"}

            </button>

          </div>

        </div>

      </form>

    </div>
  );
}