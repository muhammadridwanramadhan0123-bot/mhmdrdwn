import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  AlertTriangle,
  CheckCircle2,
  ImageIcon,
  LoaderCircle,
  RefreshCw,
  Save,
  UploadCloud,
} from "lucide-react";

import {
  useAdminAuth,
} from "../../contexts/AdminAuthContext";

import {
  deleteServiceImage,
  getAdminServicePageContent,
  updateServicePageSection,
  updateServicePageSectionItem,
  uploadServiceImage,
} from "../../services/serviceService";

const INFRASTRUCTURE_SLUG =
  "infrastruktur-it-layanan-pendukung";

const BENEFIT_ICON_OPTIONS = [
  "Layers",
  "ShieldCheck",
  "Settings",
  "Wrench",
  "Zap",
];

const GROUP_NAMES = [
  "Penyedia Perangkat Keras",
  "Penyedia Perangkat Lunak & Lisensi",
  "Konsultasi & Implementasi Jaringan",
];

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_IMAGE_SIZE =
  2 * 1024 * 1024;

/*
 * ======================================================
 * INPUT COMPONENTS
 * ======================================================
 */

function TextInput({
  label,
  value,
  onChange,
  placeholder = "",
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-[#082B3A]">
        {label}
      </label>

      <input
        type="text"
        value={value || ""}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={
          placeholder
        }
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#082B3A] outline-none transition focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  rows = 4,
  placeholder = "",
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-[#082B3A]">
        {label}
      </label>

      <textarea
        value={value || ""}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        rows={rows}
        placeholder={
          placeholder
        }
        className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-7 text-[#082B3A] outline-none transition focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
      />
    </div>
  );
}

function SaveButton({
  loading,
  onClick,
  children,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF5A0A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#E94F00] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <LoaderCircle
          size={17}
          className="animate-spin"
        />
      ) : (
        <Save size={17} />
      )}

      {children}
    </button>
  );
}

/*
 * ======================================================
 * COMPONENT
 * ======================================================
 */

export default function AdminInfrastructurePageContentSection({
  serviceId,
  serviceName = "",
  serviceSlug = "",
}) {
  const {
    isContentManager,
  } = useAdminAuth();

  const [
    content,
    setContent,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    savingKey,
    setSavingKey,
  ] = useState("");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [
    heroImageFile,
    setHeroImageFile,
  ] = useState(null);

  const [
    heroImagePreview,
    setHeroImagePreview,
  ] = useState("");

  /*
   * Komponen hanya boleh tampil
   * pada Infrastruktur.
   */
  const isInfrastructure =
    serviceSlug ===
    INFRASTRUCTURE_SLUG;

  /*
   * ====================================================
   * LOAD
   * ====================================================
   */

  const loadContent =
    useCallback(
      async () => {
        if (
          !serviceId ||
          !isInfrastructure
        ) {
          setContent(null);
          setLoading(false);

          return;
        }

        try {
          setLoading(true);

          setErrorMessage("");
          setSuccessMessage("");

          const data =
            await getAdminServicePageContent(
              serviceId
            );

          setContent(
            data
          );
        } catch (error) {
          console.error(
            "Konten Infrastruktur gagal dimuat:",
            error
          );

          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Konten Infrastruktur gagal dimuat."
          );
        } finally {
          setLoading(false);
        }
      },
      [
        serviceId,
        isInfrastructure,
      ]
    );

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  useEffect(() => {
    return () => {
      if (
        heroImagePreview.startsWith(
          "blob:"
        )
      ) {
        URL.revokeObjectURL(
          heroImagePreview
        );
      }
    };
  }, [heroImagePreview]);

  if (!isInfrastructure) {
    return null;
  }

  /*
   * ====================================================
   * LOCAL SECTION UPDATE
   * ====================================================
   */

  function updateSectionLocal(
    sectionKey,
    field,
    value
  ) {
    setContent(
      (current) => ({
        ...current,

        sections: {
          ...current.sections,

          [sectionKey]: {
            ...current.sections[
              sectionKey
            ],

            [field]:
              value,
          },
        },
      })
    );

    setSuccessMessage("");
  }

  function updateMetadataLocal(
    sectionKey,
    field,
    value
  ) {
    setContent(
      (current) => ({
        ...current,

        sections: {
          ...current.sections,

          [sectionKey]: {
            ...current.sections[
              sectionKey
            ],

            metadata: {
              ...(
                current.sections[
                  sectionKey
                ]?.metadata ||
                {}
              ),

              [field]:
                value,
            },
          },
        },
      })
    );

    setSuccessMessage("");
  }

  function updateGroupDescription(
    groupName,
    value
  ) {
    const currentMetadata =
      content.sections
        ?.features
        ?.metadata || {};

    const currentDescriptions =
      currentMetadata
        .group_descriptions ||
      {};

    updateMetadataLocal(
      "features",
      "group_descriptions",
      {
        ...currentDescriptions,
        [groupName]:
          value,
      }
    );
  }

  function updateBenefitLocal(
    itemId,
    field,
    value
  ) {
    setContent(
      (current) => ({
        ...current,

        sections: {
          ...current.sections,

          benefits: {
            ...current.sections
              .benefits,

            items:
              (
                current.sections
                  .benefits
                  ?.items ||
                []
              ).map(
                (item) =>
                  item.id ===
                  itemId
                    ? {
                        ...item,
                        [field]:
                          value,
                      }
                    : item
              ),
          },
        },
      })
    );

    setSuccessMessage("");
  }

  /*
   * ====================================================
   * HERO IMAGE
   * ====================================================
   */

  function handleHeroImageChange(
    event
  ) {
    const file =
      event.target
        .files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    if (
      !ALLOWED_IMAGE_TYPES.includes(
        file.type
      )
    ) {
      setErrorMessage(
        "Gambar harus berformat JPG, PNG, atau WebP."
      );

      return;
    }

    if (
      file.size >
      MAX_IMAGE_SIZE
    ) {
      setErrorMessage(
        "Ukuran gambar maksimal 2 MB."
      );

      return;
    }

    if (
      heroImagePreview.startsWith(
        "blob:"
      )
    ) {
      URL.revokeObjectURL(
        heroImagePreview
      );
    }

    setHeroImageFile(
      file
    );

    setHeroImagePreview(
      URL.createObjectURL(
        file
      )
    );

    setErrorMessage("");
  }

  /*
   * ====================================================
   * SAVE HERO
   * ====================================================
   */

  async function saveHero() {
    if (
      !isContentManager
    ) {
      setErrorMessage(
        "Akun tidak memiliki izin untuk mengedit konten."
      );

      return;
    }

    const hero =
      content.sections
        ?.hero;

    if (!hero?.id) {
      setErrorMessage(
        "Section Hero tidak ditemukan."
      );

      return;
    }

    let uploadedImage =
      null;

    try {
      setSavingKey(
        "hero"
      );

      setErrorMessage("");
      setSuccessMessage("");

      if (
        heroImageFile
      ) {
        uploadedImage =
          await uploadServiceImage(
            heroImageFile
          );
      }

      const previousImage =
        hero.image_url ||
        "";

      const updated =
        await updateServicePageSection(
          hero.id,
          {
            eyebrow:
              hero.eyebrow,

            title:
              hero.title,

            description:
              hero.description,

            image_url:
              uploadedImage
                ?.publicUrl ||
              hero.image_url,

            button_label:
              hero.button_label,

            button_url:
              hero.button_url,

            metadata:
              hero.metadata ||
              {},
          }
        );

      if (
        uploadedImage
          ?.publicUrl &&
        previousImage &&
        previousImage !==
          uploadedImage.publicUrl
      ) {
        try {
          await deleteServiceImage(
            previousImage
          );
        } catch (
          cleanupError
        ) {
          console.warn(
            "Gambar lama tidak berhasil dibersihkan:",
            cleanupError
          );
        }
      }

      setContent(
        (current) => ({
          ...current,

          sections: {
            ...current.sections,

            hero: {
              ...current.sections
                .hero,
              ...updated,
            },
          },
        })
      );

      setHeroImageFile(
        null
      );

      setHeroImagePreview(
        ""
      );

      setSuccessMessage(
        "Hero berhasil diperbarui."
      );
    } catch (error) {
      console.error(
        "Hero gagal diperbarui:",
        error
      );

      /*
       * Jika upload berhasil,
       * tetapi update DB gagal.
       */
      if (
        uploadedImage
          ?.publicUrl
      ) {
        try {
          await deleteServiceImage(
            uploadedImage.publicUrl
          );
        } catch {
          // abaikan cleanup
        }
      }

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Hero gagal diperbarui."
      );
    } finally {
      setSavingKey(
        ""
      );
    }
  }

  /*
   * ====================================================
   * SAVE SIMPLE SECTION
   * ====================================================
   */

  async function saveSection(
    sectionKey,
    successText
  ) {
    if (
      !isContentManager
    ) {
      setErrorMessage(
        "Akun tidak memiliki izin untuk mengedit konten."
      );

      return;
    }

    const section =
      content.sections?.[
        sectionKey
      ];

    if (!section?.id) {
      setErrorMessage(
        `Section ${sectionKey} tidak ditemukan.`
      );

      return;
    }

    try {
      setSavingKey(
        sectionKey
      );

      setErrorMessage("");
      setSuccessMessage("");

      const updated =
        await updateServicePageSection(
          section.id,
          {
            eyebrow:
              section.eyebrow,

            title:
              section.title,

            description:
              section.description,

            button_label:
              section.button_label,

            button_url:
              section.button_url,

            metadata:
              section.metadata ||
              {},
          }
        );

      setContent(
        (current) => ({
          ...current,

          sections: {
            ...current.sections,

            [sectionKey]: {
              ...current.sections[
                sectionKey
              ],
              ...updated,
            },
          },
        })
      );

      setSuccessMessage(
        successText
      );
    } catch (error) {
      console.error(
        `${sectionKey} gagal diperbarui:`,
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Konten gagal diperbarui."
      );
    } finally {
      setSavingKey(
        ""
      );
    }
  }

  /*
   * ====================================================
   * SAVE BENEFITS
   * ====================================================
   */

  async function saveBenefits() {
    if (
      !isContentManager
    ) {
      setErrorMessage(
        "Akun tidak memiliki izin untuk mengedit konten."
      );

      return;
    }

    const section =
      content.sections
        ?.benefits;

    if (!section?.id) {
      setErrorMessage(
        "Section Keunggulan tidak ditemukan."
      );

      return;
    }

    const items =
      Array.isArray(
        section.items
      )
        ? section.items
        : [];

    try {
      setSavingKey(
        "benefits"
      );

      setErrorMessage("");
      setSuccessMessage("");

      await updateServicePageSection(
        section.id,
        {
          eyebrow:
            section.eyebrow,

          title:
            section.title,

          description:
            section.description,
        }
      );

      await Promise.all(
        items.map(
          (item) =>
            updateServicePageSectionItem(
              item.id,
              {
                title:
                  item.title,

                description:
                  item.description,

                icon_name:
                  item.icon_name,
              }
            )
        )
      );

      setSuccessMessage(
        "Keunggulan berhasil diperbarui."
      );

      await loadContent();
    } catch (error) {
      console.error(
        "Keunggulan gagal diperbarui:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Keunggulan gagal diperbarui."
      );
    } finally {
      setSavingKey(
        ""
      );
    }
  }

  /*
   * ====================================================
   * LOADING
   * ====================================================
   */

  if (loading) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="py-12 text-center">
          <LoaderCircle
            size={38}
            className="mx-auto animate-spin text-[#FF5A0A]"
          />

          <p className="mt-4 text-sm font-semibold text-[#082B3A]">
            Memuat konten
            Infrastruktur...
          </p>
        </div>
      </section>
    );
  }

  if (!content) {
    return null;
  }

  const hero =
    content.sections
      ?.hero || {};

  const intro =
    content.sections
      ?.intro || {};

  const features =
    content.sections
      ?.features || {};

  const benefits =
    content.sections
      ?.benefits || {};

  const cta =
    content.sections
      ?.cta || {};

  const benefitItems =
    Array.isArray(
      benefits.items
    )
      ? benefits.items
      : [];

  const heroImage =
    heroImagePreview ||
    hero.image_url ||
    "";

  return (
    <section className="space-y-7 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
      {/* HEADER */}

      <div className="flex flex-col justify-between gap-5 border-b border-slate-100 pb-6 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#FF5A0A]">
            Konten Halaman
          </p>

          <h2 className="mt-3 text-2xl font-bold text-[#082B3A]">
            Konten Halaman
            Infrastruktur
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
            Kelola Hero,
            Intro, Cakupan,
            Keunggulan dan
            CTA halaman{" "}
            <span className="font-semibold text-[#082B3A]">
              {serviceName}
            </span>
            .
          </p>
        </div>

        <button
          type="button"
          onClick={
            loadContent
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-[#FF5A0A] hover:text-[#FF5A0A]"
        >
          <RefreshCw
            size={17}
          />

          Refresh
        </button>
      </div>

      {/* MESSAGE */}

      {errorMessage && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
          <AlertTriangle
            size={20}
            className="mt-0.5 shrink-0 text-red-600"
          />

          <p className="text-sm leading-6 text-red-700">
            {
              errorMessage
            }
          </p>
        </div>
      )}

      {successMessage && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
          <CheckCircle2
            size={20}
            className="mt-0.5 shrink-0 text-emerald-600"
          />

          <p className="text-sm leading-6 text-emerald-700">
            {
              successMessage
            }
          </p>
        </div>
      )}

      {/* =================================================
          HERO
      ================================================= */}

      <div className="rounded-3xl border border-slate-200 p-5 sm:p-6">
        <h3 className="text-lg font-bold text-[#082B3A]">
          1. Hero
        </h3>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
          <div className="space-y-5">
            <TextInput
              label="Eyebrow"
              value={
                hero.eyebrow
              }
              onChange={(
                value
              ) =>
                updateSectionLocal(
                  "hero",
                  "eyebrow",
                  value
                )
              }
            />

            <TextInput
              label="Judul Hero"
              value={
                hero.title
              }
              onChange={(
                value
              ) =>
                updateSectionLocal(
                  "hero",
                  "title",
                  value
                )
              }
            />

            <TextArea
              label="Deskripsi Hero"
              value={
                hero.description
              }
              onChange={(
                value
              ) =>
                updateSectionLocal(
                  "hero",
                  "description",
                  value
                )
              }
              rows={5}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <TextInput
                label="Label Tombol Utama"
                value={
                  hero.button_label
                }
                onChange={(
                  value
                ) =>
                  updateSectionLocal(
                    "hero",
                    "button_label",
                    value
                  )
                }
              />

              <TextInput
                label="URL Tombol Utama"
                value={
                  hero.button_url
                }
                onChange={(
                  value
                ) =>
                  updateSectionLocal(
                    "hero",
                    "button_url",
                    value
                  )
                }
              />

              <TextInput
                label="Label Tombol Kedua"
                value={
                  hero.metadata
                    ?.secondary_button_label
                }
                onChange={(
                  value
                ) =>
                  updateMetadataLocal(
                    "hero",
                    "secondary_button_label",
                    value
                  )
                }
              />

              <TextInput
                label="URL Tombol Kedua"
                value={
                  hero.metadata
                    ?.secondary_button_url
                }
                onChange={(
                  value
                ) =>
                  updateMetadataLocal(
                    "hero",
                    "secondary_button_url",
                    value
                  )
                }
              />
            </div>
          </div>

          {/* IMAGE */}

          <div>
            <p className="mb-2 text-sm font-semibold text-[#082B3A]">
              Gambar Hero
            </p>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              <div className="flex h-48 items-center justify-center overflow-hidden">
                {heroImage ? (
                  <img
                    src={
                      heroImage
                    }
                    alt="Hero Infrastruktur"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageIcon
                    size={45}
                    className="text-slate-300"
                  />
                )}
              </div>

              <div className="border-t border-slate-200 p-4">
                <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-[#FF5A0A] hover:text-[#FF5A0A]">
                  <UploadCloud
                    size={17}
                  />

                  Pilih Gambar

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={
                      handleHeroImageChange
                    }
                    className="hidden"
                  />
                </label>

                <p className="mt-2 text-center text-xs text-slate-400">
                  JPG, PNG,
                  WebP. Maksimal
                  2 MB.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <SaveButton
            loading={
              savingKey ===
              "hero"
            }
            onClick={
              saveHero
            }
          >
            Simpan Hero
          </SaveButton>
        </div>
      </div>

      {/* =================================================
          INTRO
      ================================================= */}

      <div className="rounded-3xl border border-slate-200 p-5 sm:p-6">
        <h3 className="text-lg font-bold text-[#082B3A]">
          2. Intro
        </h3>

        <div className="mt-6 space-y-5">
          <TextInput
            label="Judul"
            value={
              intro.title
            }
            onChange={(
              value
            ) =>
              updateSectionLocal(
                "intro",
                "title",
                value
              )
            }
          />

          <TextArea
            label="Deskripsi"
            value={
              intro.description
            }
            onChange={(
              value
            ) =>
              updateSectionLocal(
                "intro",
                "description",
                value
              )
            }
            rows={5}
          />
        </div>

        <div className="mt-6">
          <SaveButton
            loading={
              savingKey ===
              "intro"
            }
            onClick={() =>
              saveSection(
                "intro",
                "Intro berhasil diperbarui."
              )
            }
          >
            Simpan Intro
          </SaveButton>
        </div>
      </div>

      {/* =================================================
          FEATURES
      ================================================= */}

      <div className="rounded-3xl border border-slate-200 p-5 sm:p-6">
        <h3 className="text-lg font-bold text-[#082B3A]">
          3. Cakupan
          Layanan
        </h3>

        <div className="mt-6 space-y-5">
          <TextInput
            label="Eyebrow"
            value={
              features.eyebrow
            }
            onChange={(
              value
            ) =>
              updateSectionLocal(
                "features",
                "eyebrow",
                value
              )
            }
          />

          <TextInput
            label="Judul"
            value={
              features.title
            }
            onChange={(
              value
            ) =>
              updateSectionLocal(
                "features",
                "title",
                value
              )
            }
          />

          <TextArea
            label="Deskripsi Section"
            value={
              features.description
            }
            onChange={(
              value
            ) =>
              updateSectionLocal(
                "features",
                "description",
                value
              )
            }
          />

          <div className="border-t border-slate-100 pt-6">
            <p className="mb-5 text-sm font-bold text-[#082B3A]">
              Deskripsi
              Kelompok
            </p>

            <div className="space-y-5">
              {GROUP_NAMES.map(
                (
                  groupName
                ) => (
                  <TextArea
                    key={
                      groupName
                    }
                    label={
                      groupName
                    }
                    value={
                      features
                        .metadata
                        ?.group_descriptions
                        ?.[
                          groupName
                        ] || ""
                    }
                    onChange={(
                      value
                    ) =>
                      updateGroupDescription(
                        groupName,
                        value
                      )
                    }
                    rows={4}
                  />
                )
              )}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <SaveButton
            loading={
              savingKey ===
              "features"
            }
            onClick={() =>
              saveSection(
                "features",
                "Cakupan layanan berhasil diperbarui."
              )
            }
          >
            Simpan Cakupan
          </SaveButton>
        </div>
      </div>

      {/* =================================================
          BENEFITS
      ================================================= */}

      <div className="rounded-3xl border border-slate-200 p-5 sm:p-6">
        <h3 className="text-lg font-bold text-[#082B3A]">
          4. Keunggulan
        </h3>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <TextInput
            label="Eyebrow"
            value={
              benefits.eyebrow
            }
            onChange={(
              value
            ) =>
              updateSectionLocal(
                "benefits",
                "eyebrow",
                value
              )
            }
          />

          <TextInput
            label="Judul"
            value={
              benefits.title
            }
            onChange={(
              value
            ) =>
              updateSectionLocal(
                "benefits",
                "title",
                value
              )
            }
          />
        </div>

        <div className="mt-6 space-y-4">
          {benefitItems.map(
            (
              item,
              index
            ) => (
              <div
                key={
                  item.id
                }
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.12em] text-[#FF5A0A]">
                  Keunggulan{" "}
                  {index + 1}
                </p>

                <div className="grid gap-5 lg:grid-cols-[1fr_200px]">
                  <div className="space-y-4">
                    <TextInput
                      label="Judul"
                      value={
                        item.title
                      }
                      onChange={(
                        value
                      ) =>
                        updateBenefitLocal(
                          item.id,
                          "title",
                          value
                        )
                      }
                    />

                    <TextArea
                      label="Deskripsi"
                      value={
                        item.description
                      }
                      onChange={(
                        value
                      ) =>
                        updateBenefitLocal(
                          item.id,
                          "description",
                          value
                        )
                      }
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#082B3A]">
                      Icon
                    </label>

                    <select
                      value={
                        item.icon_name ||
                        "Layers"
                      }
                      onChange={(
                        event
                      ) =>
                        updateBenefitLocal(
                          item.id,
                          "icon_name",
                          event
                            .target
                            .value
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#082B3A] outline-none focus:border-[#FF5A0A]"
                    >
                      {BENEFIT_ICON_OPTIONS.map(
                        (
                          icon
                        ) => (
                          <option
                            key={
                              icon
                            }
                            value={
                              icon
                            }
                          >
                            {
                              icon
                            }
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        <div className="mt-6">
          <SaveButton
            loading={
              savingKey ===
              "benefits"
            }
            onClick={
              saveBenefits
            }
          >
            Simpan
            Keunggulan
          </SaveButton>
        </div>
      </div>

      {/* =================================================
          CTA
      ================================================= */}

      <div className="rounded-3xl border border-slate-200 p-5 sm:p-6">
        <h3 className="text-lg font-bold text-[#082B3A]">
          5. CTA
        </h3>

        <div className="mt-6 space-y-5">
          <TextInput
            label="Eyebrow"
            value={
              cta.eyebrow
            }
            onChange={(
              value
            ) =>
              updateSectionLocal(
                "cta",
                "eyebrow",
                value
              )
            }
          />

          <TextInput
            label="Judul CTA"
            value={
              cta.title
            }
            onChange={(
              value
            ) =>
              updateSectionLocal(
                "cta",
                "title",
                value
              )
            }
          />

          <TextArea
            label="Deskripsi CTA"
            value={
              cta.description
            }
            onChange={(
              value
            ) =>
              updateSectionLocal(
                "cta",
                "description",
                value
              )
            }
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <TextInput
              label="Label Tombol"
              value={
                cta.button_label
              }
              onChange={(
                value
              ) =>
                updateSectionLocal(
                  "cta",
                  "button_label",
                  value
                )
              }
            />

            <TextInput
              label="URL Tombol"
              value={
                cta.button_url
              }
              onChange={(
                value
              ) =>
                updateSectionLocal(
                  "cta",
                  "button_url",
                  value
                )
              }
            />
          </div>
        </div>

        <div className="mt-6">
          <SaveButton
            loading={
              savingKey ===
              "cta"
            }
            onClick={() =>
              saveSection(
                "cta",
                "CTA berhasil diperbarui."
              )
            }
          >
            Simpan CTA
          </SaveButton>
        </div>
      </div>
    </section>
  );
}