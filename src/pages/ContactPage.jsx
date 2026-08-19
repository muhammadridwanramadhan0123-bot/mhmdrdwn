import {
  useMemo,
  useRef,
  useState,
} from "react";

import {
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

import {
  PageHero,
} from "../components/Common";

import {
  supabase,
} from "../lib/supabase";

import {
  useLanguage,
} from "../contexts/LanguageContext";


const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


export default function ContactPage() {
  const {
    language,
    t,
  } = useLanguage();

  const [
    sent,
    setSent,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  /*
   * Synchronous submit lock.
   *
   * State loading digunakan untuk UI.
   * Ref digunakan untuk memastikan dua submit
   * yang sangat berdekatan tidak memanggil RPC dua kali.
   */
  const submittingRef =
    useRef(false);


  /*
   * Value disimpan dalam format canonical.
   *
   * Label berubah mengikuti bahasa,
   * tetapi value database tetap sama.
   */
  const serviceOptions =
    useMemo(
      () => [
        {
          value:
            "simrs-erp",

          label: t(
            "contactPage.services.simrs",
            "SIMRS & ERP"
          ),
        },

        {
          value:
            "healthcare-facility-management",

          label: t(
            "contactPage.services.consulting",
            "Konsultasi & Pengelolaan Fasilitas Kesehatan"
          ),
        },

        {
          value:
            "it-infrastructure-support",

          label: t(
            "contactPage.services.infrastructure",
            "Infrastruktur IT & Layanan Pendukung"
          ),
        },

        {
          value:
            "training-human-resource-development",

          label: t(
            "contactPage.services.training",
            "Pelatihan & Pengembangan SDM"
          ),
        },
      ],
      [
        language,
        t,
      ]
    );


  const contactItems =
    useMemo(
      () => [
        {
          icon: MapPin,

          label: t(
            "contactPage.office",
            "Kantor"
          ),

          value:
            "Gedung Paramarta Tridharma, Jl. Cikutra Baru Raya No. 28, Bandung 40124",
        },

        {
          icon: Phone,

          label: t(
            "contactPage.phone",
            "Telepon"
          ),

          value:
            "+62 878 7000 7781",
        },

        {
          icon: Mail,

          label: t(
            "contactPage.email",
            "Email"
          ),

          value:
            "info@jasamedikatransmedic.com",
        },
      ],
      [
        language,
        t,
      ]
    );


  const submit =
    async (event) => {
      event.preventDefault();

      /*
       * Double-submit protection.
       */
      if (
        submittingRef.current
      ) {
        return;
      }

      const formElement =
        event.currentTarget;

      const formData =
        new FormData(
          formElement
        );


      const name =
        String(
          formData.get(
            "name"
          ) || ""
        ).trim();

      const company =
        String(
          formData.get(
            "company"
          ) || ""
        ).trim();

      const email =
        String(
          formData.get(
            "email"
          ) || ""
        )
          .trim()
          .toLowerCase();

      const phone =
        String(
          formData.get(
            "phone"
          ) || ""
        ).trim();

      const service =
        String(
          formData.get(
            "service"
          ) || ""
        ).trim();

      const message =
        String(
          formData.get(
            "message"
          ) || ""
        ).trim();

      /*
       * Honeypot.
       *
       * User normal tidak akan
       * mengisi field ini.
       */
      const website =
        String(
          formData.get(
            "website"
          ) || ""
        ).trim();


      setSent(false);
      setErrorMessage("");


      /*
       * ==================================================
       * FRONTEND VALIDATION
       * ==================================================
       */

      if (
        !name ||
        name.length < 2
      ) {
        setErrorMessage(
          t(
            "contactPage.errors.name",
            "Nama minimal 2 karakter."
          )
        );

        return;
      }


      if (!email) {
        setErrorMessage(
          t(
            "contactPage.errors.emailRequired",
            "Email wajib diisi."
          )
        );

        return;
      }


      if (
        !EMAIL_PATTERN.test(
          email
        )
      ) {
        setErrorMessage(
          t(
            "contactPage.errors.emailInvalid",
            "Format email tidak valid."
          )
        );

        return;
      }


      const normalizedPhone =
        phone.replace(
          /\D/g,
          ""
        );

      if (
        !phone ||
        normalizedPhone.length <
          9
      ) {
        setErrorMessage(
          t(
            "contactPage.errors.phone",
            "Nomor telepon minimal 9 digit."
          )
        );

        return;
      }


      if (!service) {
        setErrorMessage(
          t(
            "contactPage.errors.service",
            "Silakan pilih layanan yang dibutuhkan."
          )
        );

        return;
      }


      if (
        !message ||
        message.length < 10
      ) {
        setErrorMessage(
          t(
            "contactPage.errors.message",
            "Keterangan minimal 10 karakter."
          )
        );

        return;
      }


      /*
       * Lock sebelum request dilakukan.
       */
      submittingRef.current =
        true;

      setLoading(true);


      try {
        /*
         * ==================================================
         * SUBMIT VIA SECURITY DEFINER RPC
         * ==================================================
         *
         * Jangan kembali menggunakan:
         *
         * .from("contact_messages").insert(...)
         */

        const {
          error,
        } =
          await supabase.rpc(
            "submit_contact_message",
            {
              p_full_name:
                name,

              p_email:
                email,

              p_message:
                message,

              p_company:
                company ||
                null,

              p_phone:
                phone ||
                null,

              p_subject:
                t(
                  "contactPage.defaultSubject",
                  "Permintaan Konsultasi Website"
                ),

              p_service_interest:
                service,

              p_website:
                website ||
                null,

              p_locale:
                language === "en"
                  ? "en"
                  : "id",
            }
          );


        if (error) {
          /*
           * Detail teknis hanya untuk developer.
           * Jangan expose error.message ke visitor.
           */
          console.error(
            "Contact RPC error:",
            error
          );

          setErrorMessage(
            t(
              "contactPage.errors.submit",
              "Pesan gagal dikirim. Silakan coba kembali."
            )
          );

          return;
        }


        setSent(true);
        formElement.reset();
      } catch (error) {
        console.error(
          "Contact submit error:",
          error
        );

        setErrorMessage(
          t(
            "contactPage.errors.submit",
            "Pesan gagal dikirim. Silakan coba kembali."
          )
        );
      } finally {
        submittingRef.current =
          false;

        setLoading(false);
      }
    };


  return (
    <>
      <PageHero
        eyebrow={t(
          "contactPage.heroEyebrow",
          "Hubungi Kami"
        )}
        title={t(
          "contactPage.heroTitle",
          "Mari Bangun Layanan Kesehatan yang Lebih Baik Bersama"
        )}
        description={t(
          "contactPage.heroDescription",
          "Ceritakan kebutuhan fasilitas kesehatan atau organisasi Anda. Tim kami siap membantu menemukan solusi yang tepat."
        )}
      />


      <section className="container-jmt grid gap-10 py-16 lg:grid-cols-[.85fr_1.15fr]">
        {/* CONTACT INFORMATION */}

        <div>
          <h2 className="text-2xl font-bold">
            {t(
              "contactPage.infoTitle",
              "Hubungi JMT Group"
            )}
          </h2>

          <p className="mt-4 text-sm leading-7 text-slate-600">
            {t(
              "contactPage.infoDescription",
              "Kami terbuka untuk konsultasi solusi, partnership, implementasi, maupun informasi produk dan layanan."
            )}
          </p>


          <div className="mt-8 space-y-4">
            {contactItems.map(
              (item) => {
                const Icon =
                  item.icon;

                return (
                  <div
                    key={
                      item.label
                    }
                    className="flex gap-4 rounded-2xl bg-mist p-5"
                  >
                    <div className="h-fit rounded-xl bg-white p-3 text-orange">
                      <Icon
                        size={21}
                      />
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-slate-400">
                        {
                          item.label
                        }
                      </p>

                      <p className="mt-1 text-sm font-medium leading-6">
                        {
                          item.value
                        }
                      </p>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>


        {/* CONSULTATION FORM */}

        <div className="card p-6 md:p-9">
          <h2 className="text-2xl font-bold">
            {t(
              "contactPage.formTitle",
              "Ajukan Konsultasi"
            )}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {t(
              "contactPage.formDescription",
              "Isi form berikut dan tim kami akan menghubungi Anda."
            )}
          </p>


          {sent && (
            <div
              role="status"
              aria-live="polite"
              className="mt-5 flex items-start gap-3 rounded-xl bg-emerald-50 p-4 text-sm font-medium leading-6 text-emerald-700"
            >
              <CheckCircle2
                size={20}
                className="mt-0.5 shrink-0"
              />

              <span>
                {t(
                  "contactPage.success",
                  "Pesan berhasil dikirim. Tim kami akan segera menghubungi Anda."
                )}
              </span>
            </div>
          )}


          {errorMessage && (
            <div
              role="alert"
              aria-live="assertive"
              className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-medium leading-6 text-red-700"
            >
              {errorMessage}
            </div>
          )}


          <form
            onSubmit={submit}
            aria-busy={
              loading
                ? "true"
                : "false"
            }
            className="mt-7 grid gap-5 sm:grid-cols-2"
          >
            {/* HONEYPOT */}

            <div
              aria-hidden="true"
              className="absolute -left-[9999px] h-px w-px overflow-hidden"
            >
              <label>
                Website

                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </label>
            </div>


            {/* NAMA */}

            <label className="text-xs font-semibold">
              {t(
                "contactPage.fullName",
                "Nama Lengkap"
              )}

              <input
                name="name"
                type="text"
                required
                minLength={2}
                maxLength={120}
                autoComplete="name"
                placeholder={t(
                  "contactPage.fullNamePlaceholder",
                  "Masukkan nama lengkap"
                )}
                className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm font-normal outline-none transition focus:border-orange focus:ring-2 focus:ring-orange/10"
              />
            </label>


            {/* PERUSAHAAN */}

            <label className="text-xs font-semibold">
              {t(
                "contactPage.companyOptional",
                "Faskes / Perusahaan (opsional)"
              )}

              <input
                name="company"
                type="text"
                maxLength={160}
                autoComplete="organization"
                placeholder={t(
                  "contactPage.companyPlaceholder",
                  "Nama fasilitas kesehatan atau perusahaan"
                )}
                className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm font-normal outline-none transition focus:border-orange focus:ring-2 focus:ring-orange/10"
              />
            </label>


            {/* EMAIL */}

            <label className="text-xs font-semibold">
              {t(
                "contactPage.emailLabel",
                "Email"
              )}

              <input
                name="email"
                type="email"
                required
                maxLength={254}
                autoComplete="email"
                placeholder={t(
                  "contactPage.emailPlaceholder",
                  "contoh@email.com"
                )}
                className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm font-normal outline-none transition focus:border-orange focus:ring-2 focus:ring-orange/10"
              />
            </label>


            {/* PHONE */}

            <label className="text-xs font-semibold">
              {t(
                "contactPage.phoneLabel",
                "Telp / WhatsApp"
              )}

              <input
                name="phone"
                type="tel"
                required
                maxLength={40}
                autoComplete="tel"
                placeholder={t(
                  "contactPage.phonePlaceholder",
                  "Contoh: 081234567890"
                )}
                className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm font-normal outline-none transition focus:border-orange focus:ring-2 focus:ring-orange/10"
              />
            </label>


            {/* SERVICE */}

            <label className="text-xs font-semibold sm:col-span-2">
              {t(
                "contactPage.service",
                "Layanan yang Dibutuhkan"
              )}

              <select
                name="service"
                required
                defaultValue=""
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-normal outline-none transition focus:border-orange focus:ring-2 focus:ring-orange/10"
              >
                <option
                  value=""
                  disabled
                >
                  {t(
                    "contactPage.selectService",
                    "Pilih layanan"
                  )}
                </option>

                {serviceOptions.map(
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
            </label>


            {/* MESSAGE */}

            <label className="text-xs font-semibold sm:col-span-2">
              {t(
                "contactPage.message",
                "Keterangan"
              )}

              <textarea
                name="message"
                rows={5}
                required
                minLength={10}
                maxLength={5000}
                placeholder={t(
                  "contactPage.messagePlaceholder",
                  "Ceritakan kebutuhan, kendala, atau solusi yang Anda perlukan..."
                )}
                className="mt-2 w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-sm font-normal outline-none transition focus:border-orange focus:ring-2 focus:ring-orange/10"
              />
            </label>


            {/* SUBMIT */}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary sm:col-span-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? t(
                    "contactPage.submitting",
                    "Mengirim..."
                  )
                : t(
                    "contactPage.submit",
                    "Kirim Permintaan Konsultasi"
                  )}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}