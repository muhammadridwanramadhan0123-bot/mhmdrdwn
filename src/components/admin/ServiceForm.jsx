import {
  useEffect,
  useState,
} from "react";

import {
  AlertTriangle,
  Check,
  FileText,
  ImagePlus,
  LoaderCircle,
  Save,
  Search,
  Settings2,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";

import {
  getServiceCategories,
  normalizeServiceFeatures,
} from "../../services/serviceService";

const MAX_IMAGE_SIZE =
  2 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

function createSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatDateTimeLocal(value) {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  const timezoneOffset =
    date.getTimezoneOffset();

  const localDate =
    new Date(
      date.getTime() -
        timezoneOffset *
          60 *
          1000
    );

  return localDate
    .toISOString()
    .slice(0, 16);
}

function createInitialValues(
  initialData
) {
  return {
    name:
      initialData?.name || "",

    slug:
      initialData?.slug || "",

    category_id:
      initialData?.category_id ||
      "",

    short_description:
      initialData?.short_description ||
      "",

    full_description:
      initialData?.full_description ||
      "",

    icon:
      initialData?.icon || "",

    /*
     * Tetap dipertahankan agar
     * legacy services.features
     * tidak terhapus ketika edit.
     *
     * Tidak lagi ditampilkan di UI.
     */
    features:
      normalizeServiceFeatures(
        initialData?.features
      ),

    display_order:
      initialData?.display_order ??
      initialData?.sort_order ??
      0,

    status:
      initialData?.status ||
      "draft",

    is_featured:
      Boolean(
        initialData?.is_featured
      ),

    published_at:
      formatDateTimeLocal(
        initialData?.published_at
      ),

    seo_title:
      initialData?.seo_title ||
      "",

    seo_description:
      initialData?.seo_description ||
      "",
  };
}

function FieldLabel({
  children,
  required = false,
}) {
  return (
    <label className="mb-2 block text-sm font-semibold text-[#082B3A]">
      {children}

      {required && (
        <span className="ml-1 text-red-500">
          *
        </span>
      )}
    </label>
  );
}

export default function ServiceForm({
  initialData = null,
  onSubmit,
  loading = false,
  submitLabel = "Simpan Service",
}) {
  const [
    values,
    setValues,
  ] = useState(() =>
    createInitialValues(
      initialData
    )
  );

  const [
    categories,
    setCategories,
  ] = useState([]);

  const [
    loadingCategories,
    setLoadingCategories,
  ] = useState(true);

  const [
    categoryError,
    setCategoryError,
  ] = useState("");

  const [
    imageFile,
    setImageFile,
  ] = useState(null);

  const [
    imagePreview,
    setImagePreview,
  ] = useState(
    initialData?.image_url ||
      ""
  );

  const [
    slugEdited,
    setSlugEdited,
  ] = useState(
    Boolean(
      initialData?.slug
    )
  );

  const [
    formError,
    setFormError,
  ] = useState("");

  /* ====================================================
     CATEGORIES
  ==================================================== */

  useEffect(() => {
    let mounted = true;

    async function loadCategories() {
      try {
        setLoadingCategories(
          true
        );

        setCategoryError("");

        const data =
          await getServiceCategories(
            {
              includeInactive:
                Boolean(
                  initialData
                ),
            }
          );

        if (!mounted) {
          return;
        }

        setCategories(
          data || []
        );
      } catch (error) {
        if (!mounted) {
          return;
        }

        setCategoryError(
          error instanceof Error
            ? error.message
            : "Kategori gagal dimuat."
        );
      } finally {
        if (mounted) {
          setLoadingCategories(
            false
          );
        }
      }
    }

    loadCategories();

    return () => {
      mounted = false;
    };
  }, [initialData]);

  /* ====================================================
     RESET WHEN SERVICE CHANGES
  ==================================================== */

  useEffect(() => {
    setValues(
      createInitialValues(
        initialData
      )
    );

    setImageFile(null);

    setImagePreview(
      initialData?.image_url ||
        ""
    );

    setSlugEdited(
      Boolean(
        initialData?.slug
      )
    );

    setFormError("");
  }, [initialData]);

  /* ====================================================
     IMAGE PREVIEW
  ==================================================== */

  useEffect(() => {
    if (!imageFile) {
      setImagePreview(
        initialData?.image_url ||
          ""
      );

      return undefined;
    }

    const objectUrl =
      URL.createObjectURL(
        imageFile
      );

    setImagePreview(
      objectUrl
    );

    return () => {
      URL.revokeObjectURL(
        objectUrl
      );
    };
  }, [
    imageFile,
    initialData?.image_url,
  ]);

  /* ====================================================
     INPUT
  ==================================================== */

  function handleChange(event) {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormError("");

    if (
      type === "checkbox"
    ) {
      setValues(
        (current) => ({
          ...current,
          [name]:
            checked,
        })
      );

      return;
    }

    if (
      name === "name"
    ) {
      setValues(
        (current) => ({
          ...current,

          name:
            value,

          slug:
            slugEdited
              ? current.slug
              : createSlug(
                  value
                ),
        })
      );

      return;
    }

    if (
      name === "slug"
    ) {
      setSlugEdited(
        true
      );

      setValues(
        (current) => ({
          ...current,

          slug:
            createSlug(
              value
            ),
        })
      );

      return;
    }

    setValues(
      (current) => ({
        ...current,

        [name]:
          value,
      })
    );
  }

  /* ====================================================
     IMAGE
  ==================================================== */

  function handleImageChange(
    event
  ) {
    const selectedFile =
      event.target.files?.[0];

    event.target.value =
      "";

    if (!selectedFile) {
      return;
    }

    if (
      !ALLOWED_IMAGE_TYPES.includes(
        selectedFile.type
      )
    ) {
      setFormError(
        "Format gambar harus JPG, PNG, atau WebP."
      );

      return;
    }

    if (
      selectedFile.size >
      MAX_IMAGE_SIZE
    ) {
      setFormError(
        "Ukuran gambar maksimal 2 MB."
      );

      return;
    }

    setImageFile(
      selectedFile
    );
  }

  function removeSelectedImage() {
    setImageFile(null);

    setImagePreview(
      initialData?.image_url ||
        ""
    );
  }

  /* ====================================================
     SUBMIT
  ==================================================== */

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setFormError("");

    if (
      !values.name.trim()
    ) {
      setFormError(
        "Nama Service wajib diisi."
      );

      return;
    }

    if (
      !values.slug.trim()
    ) {
      setFormError(
        "Slug Service wajib diisi."
      );

      return;
    }

    if (
      !values.category_id
    ) {
      setFormError(
        "Kategori Service wajib dipilih."
      );

      return;
    }

    if (
      !values.short_description.trim()
    ) {
      setFormError(
        "Deskripsi singkat wajib diisi."
      );

      return;
    }

    if (
      !values.full_description.trim()
    ) {
      setFormError(
        "Deskripsi lengkap wajib diisi."
      );

      return;
    }

    if (
      typeof onSubmit !==
      "function"
    ) {
      setFormError(
        "Fungsi penyimpanan tidak tersedia."
      );

      return;
    }

    await onSubmit(
      values,
      imageFile
    );
  }

  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="space-y-6"
    >
      {/* ERROR */}

      {(formError ||
        categoryError) && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
          <AlertTriangle
            size={20}
            className="mt-0.5 shrink-0 text-red-600"
          />

          <div>
            <p className="font-semibold text-red-800">
              Form belum dapat disimpan
            </p>

            <p className="mt-1 text-sm text-red-700">
              {formError ||
                categoryError}
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* LEFT */}

        <div className="space-y-6">
          {/* INFORMATION */}

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#FF5A0A]">
                  <FileText
                    size={
                      20
                    }
                  />
                </div>

                <div>
                  <h2 className="font-bold text-[#082B3A]">
                    Informasi Service
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Nama, URL, kategori dan deskripsi.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <FieldLabel
                  required
                >
                  Nama Service
                </FieldLabel>

                <input
                  name="name"
                  value={
                    values.name
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    loading
                  }
                  maxLength={
                    180
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <FieldLabel
                  required
                >
                  Slug
                </FieldLabel>

                <input
                  name="slug"
                  value={
                    values.slug
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    loading
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#FF5A0A]"
                />

                <p className="mt-2 text-xs text-slate-400">
                  /services/
                  {values.slug ||
                    "slug-service"}
                </p>
              </div>

              <div>
                <FieldLabel
                  required
                >
                  Kategori
                </FieldLabel>

                <select
                  name="category_id"
                  value={
                    values.category_id
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    loading ||
                    loadingCategories
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                >
                  <option value="">
                    {loadingCategories
                      ? "Memuat kategori..."
                      : "Pilih kategori"}
                  </option>

                  {categories.map(
                    (
                      category
                    ) => (
                      <option
                        key={
                          category.id
                        }
                        value={
                          category.id
                        }
                      >
                        {
                          category.name
                        }
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <FieldLabel
                  required
                >
                  Deskripsi Singkat
                </FieldLabel>

                <textarea
                  name="short_description"
                  value={
                    values.short_description
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    loading
                  }
                  rows={4}
                  maxLength={
                    300
                  }
                  className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-7 outline-none focus:border-[#FF5A0A]"
                />

                <p className="mt-2 text-right text-xs text-slate-400">
                  {
                    values.short_description
                      .length
                  }
                  /300
                </p>
              </div>

              <div>
                <FieldLabel
                  required
                >
                  Deskripsi Lengkap
                </FieldLabel>

                <textarea
                  name="full_description"
                  value={
                    values.full_description
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    loading
                  }
                  rows={10}
                  className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-7 outline-none focus:border-[#FF5A0A]"
                />
              </div>
            </div>
          </section>

          {/* SEO */}

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Search
                    size={
                      19
                    }
                  />
                </div>

                <div>
                  <h2 className="font-bold text-[#082B3A]">
                    SEO
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Judul dan deskripsi untuk mesin pencari.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5 p-6">
              <div>
                <FieldLabel>
                  SEO Title
                </FieldLabel>

                <input
                  name="seo_title"
                  value={
                    values.seo_title
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    loading
                  }
                  maxLength={
                    70
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#FF5A0A]"
                />

                <p className="mt-2 text-right text-xs text-slate-400">
                  {
                    values.seo_title
                      .length
                  }
                  /70
                </p>
              </div>

              <div>
                <FieldLabel>
                  SEO Description
                </FieldLabel>

                <textarea
                  name="seo_description"
                  value={
                    values.seo_description
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    loading
                  }
                  rows={4}
                  maxLength={
                    170
                  }
                  className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none focus:border-[#FF5A0A]"
                />

                <p className="mt-2 text-right text-xs text-slate-400">
                  {
                    values.seo_description
                      .length
                  }
                  /170
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT */}

        <aside className="space-y-6">
          {/* PUBLISH */}

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <Settings2
                size={20}
                className="text-[#FF5A0A]"
              />

              <h2 className="font-bold text-[#082B3A]">
                Pengaturan
              </h2>
            </div>

            <div className="mt-5 space-y-5">
              <div>
                <FieldLabel>
                  Status
                </FieldLabel>

                <select
                  name="status"
                  value={
                    values.status
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none"
                >
                  <option value="draft">
                    Draft
                  </option>

                  <option value="published">
                    Published
                  </option>

                  <option value="archived">
                    Archived
                  </option>
                </select>
              </div>

              <div>
                <FieldLabel>
                  Urutan Tampil
                </FieldLabel>

                <input
                  name="display_order"
                  type="number"
                  min="0"
                  value={
                    values.display_order
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none"
                />
              </div>

              <div>
                <FieldLabel>
                  Icon
                </FieldLabel>

                <input
                  name="icon"
                  value={
                    values.icon
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Stethoscope"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none"
                />
              </div>

              <div>
                <FieldLabel>
                  Tanggal Publish
                </FieldLabel>

                <input
                  name="published_at"
                  type="datetime-local"
                  value={
                    values.published_at
                  }
                  onChange={
                    handleChange
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none"
                />
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 p-4">
                <input
                  name="is_featured"
                  type="checkbox"
                  checked={
                    values.is_featured
                  }
                  onChange={
                    handleChange
                  }
                  className="mt-1 h-4 w-4 rounded border-slate-300 accent-[#FF5A0A]"
                />

                <div>
                  <p className="text-sm font-semibold text-[#082B3A]">
                    Featured Service
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Tandai sebagai layanan unggulan.
                  </p>
                </div>
              </label>
            </div>
          </section>

          {/* IMAGE */}

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <ImagePlus
                size={20}
                className="text-[#FF5A0A]"
              />

              <h2 className="font-bold text-[#082B3A]">
                Gambar Service
              </h2>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              {imagePreview ? (
                <img
                  src={
                    imagePreview
                  }
                  alt="Preview Service"
                  className="aspect-video w-full object-cover"
                />
              ) : (
                <div className="flex aspect-video items-center justify-center">
                  <ImagePlus
                    size={36}
                    className="text-slate-300"
                  />
                </div>
              )}
            </div>

            <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#082B3A] px-4 py-3 text-sm font-semibold text-white">
              <UploadCloud
                size={17}
              />
              Pilih Gambar

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={
                  handleImageChange
                }
                className="hidden"
              />
            </label>

            {imageFile && (
              <button
                type="button"
                onClick={
                  removeSelectedImage
                }
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600"
              >
                <X size={16} />
                Batalkan Gambar Baru
              </button>
            )}

            <p className="mt-3 text-xs leading-5 text-slate-400">
              JPG, PNG atau WebP. Maksimal 2 MB.
            </p>
          </section>

          {/* FEATURE INFO */}

          {initialData && (
            <section className="rounded-3xl border border-orange-100 bg-orange-50/60 p-5">
              <Sparkles
                size={20}
                className="text-[#FF5A0A]"
              />

              <p className="mt-3 text-sm font-bold text-[#082B3A]">
                Fitur dikelola terpisah
              </p>

              <p className="mt-1 text-xs leading-6 text-slate-600">
                Gunakan tab{" "}
                <strong>
                  Fitur & Cakupan
                </strong>{" "}
                pada halaman Edit Service. Daftar fitur lama tidak lagi
                ditampilkan di form utama.
              </p>
            </section>
          )}
        </aside>
      </div>

      {/* STICKY ACTION */}

      <div className="sticky bottom-4 z-20 flex justify-end rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl shadow-slate-900/5 backdrop-blur">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-[#FF5A0A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#E94F00] disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {loading ? (
            <LoaderCircle
              size={18}
              className="animate-spin"
            />
          ) : (
            <Save size={18} />
          )}

          {loading
            ? "Menyimpan..."
            : submitLabel}
        </button>
      </div>
    </form>
  );
}