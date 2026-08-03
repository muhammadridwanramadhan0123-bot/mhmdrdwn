import {
  useEffect,
  useState,
} from "react";
import {
  AlertTriangle,
  ImagePlus,
  LoaderCircle,
  Save,
  X,
} from "lucide-react";

import {
  getServiceCategories,
  normalizeServiceFeatures,
} from "../../services/serviceService";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

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
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const timezoneOffset =
    date.getTimezoneOffset();

  const localDate = new Date(
    date.getTime() -
      timezoneOffset * 60 * 1000
  );

  return localDate
    .toISOString()
    .slice(0, 16);
}

function createInitialValues(initialData) {
  return {
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    category_id:
      initialData?.category_id || "",

    short_description:
      initialData?.short_description || "",

    full_description:
      initialData?.full_description || "",

    icon: initialData?.icon || "",

    features: normalizeServiceFeatures(
      initialData?.features
    ).join("\n"),

    display_order:
      initialData?.display_order ??
      initialData?.sort_order ??
      0,

    status:
      initialData?.status || "draft",

    is_featured: Boolean(
      initialData?.is_featured
    ),

    published_at:
      formatDateTimeLocal(
        initialData?.published_at
      ),

    seo_title:
      initialData?.seo_title || "",

    seo_description:
      initialData?.seo_description || "",
  };
}

export default function ServiceForm({
  initialData = null,
  onSubmit,
  loading = false,
  submitLabel = "Simpan Service",
}) {
  const [values, setValues] = useState(() =>
    createInitialValues(initialData)
  );

  const [categories, setCategories] =
    useState([]);

  const [loadingCategories, setLoadingCategories] =
    useState(true);

  const [categoryError, setCategoryError] =
    useState("");

  const [imageFile, setImageFile] =
    useState(null);

  const [imagePreview, setImagePreview] =
    useState(
      initialData?.image_url || ""
    );

  const [slugEdited, setSlugEdited] =
    useState(Boolean(initialData?.slug));

  const [formError, setFormError] =
    useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      try {
        setLoadingCategories(true);
        setCategoryError("");

        const data =
          await getServiceCategories({
            includeInactive:
              Boolean(initialData),
          });

        if (!isMounted) return;

        setCategories(data);
      } catch (error) {
        if (!isMounted) return;

        console.error(
          "Kategori service gagal dimuat:",
          error
        );

        setCategoryError(
          error instanceof Error
            ? error.message
            : "Kategori service gagal dimuat."
        );
      } finally {
        if (isMounted) {
          setLoadingCategories(false);
        }
      }
    }

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, [initialData]);

  useEffect(() => {
    setValues(
      createInitialValues(initialData)
    );

    setImageFile(null);

    setImagePreview(
      initialData?.image_url || ""
    );

    setSlugEdited(
      Boolean(initialData?.slug)
    );

    setFormError("");
  }, [initialData]);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview(
        initialData?.image_url || ""
      );

      return undefined;
    }

    const objectUrl =
      URL.createObjectURL(imageFile);

    setImagePreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [
    imageFile,
    initialData?.image_url,
  ]);

  function handleChange(event) {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    if (type === "checkbox") {
      setValues((currentValues) => ({
        ...currentValues,
        [name]: checked,
      }));

      return;
    }

    if (name === "name") {
      setValues((currentValues) => ({
        ...currentValues,
        name: value,
        slug: slugEdited
          ? currentValues.slug
          : createSlug(value),
      }));

      return;
    }

    if (name === "slug") {
      setSlugEdited(true);

      setValues((currentValues) => ({
        ...currentValues,
        slug: createSlug(value),
      }));

      return;
    }

    setValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));
  }

  function handleImageChange(event) {
    const selectedFile =
      event.target.files?.[0] || null;

    setFormError("");

    if (!selectedFile) {
      setImageFile(null);
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

      event.target.value = "";
      return;
    }

    if (
      selectedFile.size >
      MAX_IMAGE_SIZE
    ) {
      setFormError(
        "Ukuran gambar maksimal 2 MB."
      );

      event.target.value = "";
      return;
    }

    setImageFile(selectedFile);
  }

  function removeSelectedImage() {
    setImageFile(null);

    setImagePreview(
      initialData?.image_url || ""
    );

    const input =
      document.getElementById(
        "service-image"
      );

    if (input) {
      input.value = "";
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) return;

    setFormError("");

    if (!values.name.trim()) {
      setFormError(
        "Nama layanan wajib diisi."
      );
      return;
    }

    if (!values.slug.trim()) {
      setFormError(
        "Slug layanan wajib diisi."
      );
      return;
    }

    if (!values.category_id) {
      setFormError(
        "Kategori layanan wajib dipilih."
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
      typeof onSubmit !== "function"
    ) {
      setFormError(
        "Fungsi penyimpanan tidak tersedia."
      );
      return;
    }

    await onSubmit(values, imageFile);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {(formError || categoryError) && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4"
        >
          <AlertTriangle
            size={21}
            className="mt-0.5 shrink-0 text-red-600"
          />

          <div>
            <p className="font-semibold text-red-700">
              Form belum dapat disimpan
            </p>

            <p className="mt-1 text-sm leading-6 text-red-600">
              {formError || categoryError}
            </p>
          </div>
        </div>
      )}

      {/* Informasi utama */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-[#082B3A]">
          Informasi Utama
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Masukkan nama, slug, kategori,
          dan deskripsi layanan.
        </p>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label
              htmlFor="service-name"
              className="mb-2 block text-sm font-semibold text-[#082B3A]"
            >
              Nama Layanan{" "}
              <span className="text-red-500">
                *
              </span>
            </label>

            <input
              id="service-name"
              name="name"
              type="text"
              value={values.name}
              onChange={handleChange}
              maxLength={180}
              disabled={loading}
              placeholder="Contoh: Hospital Information System"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100 disabled:bg-slate-100"
            />

            <p className="mt-2 text-right text-xs text-slate-400">
              {values.name.length}/180
            </p>
          </div>

          <div>
            <label
              htmlFor="service-slug"
              className="mb-2 block text-sm font-semibold text-[#082B3A]"
            >
              Slug{" "}
              <span className="text-red-500">
                *
              </span>
            </label>

            <input
              id="service-slug"
              name="slug"
              type="text"
              value={values.slug}
              onChange={handleChange}
              maxLength={200}
              disabled={loading}
              placeholder="hospital-information-system"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100 disabled:bg-slate-100"
            />

            <p className="mt-2 text-xs text-slate-400">
              URL: /services/
              {values.slug ||
                "slug-layanan"}
            </p>
          </div>

          <div>
            <label
              htmlFor="service-category"
              className="mb-2 block text-sm font-semibold text-[#082B3A]"
            >
              Kategori{" "}
              <span className="text-red-500">
                *
              </span>
            </label>

            <select
              id="service-category"
              name="category_id"
              value={values.category_id}
              onChange={handleChange}
              disabled={
                loading ||
                loadingCategories
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100 disabled:bg-slate-100"
            >
              <option value="">
                {loadingCategories
                  ? "Memuat kategori..."
                  : "Pilih kategori layanan"}
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                    {!category.is_active
                      ? " (Tidak aktif)"
                      : ""}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="service-short-description"
              className="mb-2 block text-sm font-semibold text-[#082B3A]"
            >
              Deskripsi Singkat{" "}
              <span className="text-red-500">
                *
              </span>
            </label>

            <textarea
              id="service-short-description"
              name="short_description"
              value={
                values.short_description
              }
              onChange={handleChange}
              maxLength={300}
              rows={4}
              disabled={loading}
              placeholder="Tuliskan ringkasan singkat layanan..."
              className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-7 outline-none transition focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100 disabled:bg-slate-100"
            />

            <p className="mt-2 text-right text-xs text-slate-400">
              {
                values.short_description
                  .length
              }
              /300
            </p>
          </div>

          <div className="md:col-span-2">
            <label
              htmlFor="service-full-description"
              className="mb-2 block text-sm font-semibold text-[#082B3A]"
            >
              Deskripsi Lengkap{" "}
              <span className="text-red-500">
                *
              </span>
            </label>

            <textarea
              id="service-full-description"
              name="full_description"
              value={
                values.full_description
              }
              onChange={handleChange}
              rows={10}
              disabled={loading}
              placeholder="Tuliskan penjelasan lengkap mengenai layanan..."
              className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-7 outline-none transition focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100 disabled:bg-slate-100"
            />
          </div>
        </div>
      </section>

      {/* Fitur dan tampilan */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-[#082B3A]">
          Fitur dan Tampilan
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Masukkan daftar fitur satu fitur
          pada setiap baris.
        </p>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label
              htmlFor="service-features"
              className="mb-2 block text-sm font-semibold text-[#082B3A]"
            >
              Fitur Layanan
            </label>

            <textarea
              id="service-features"
              name="features"
              value={values.features}
              onChange={handleChange}
              rows={8}
              disabled={loading}
              placeholder={`Hospital Information System\nElectronic Medical Record\nManagement Dashboard`}
              className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-7 outline-none transition focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100 disabled:bg-slate-100"
            />

            <p className="mt-2 text-xs leading-5 text-slate-400">
              Data akan disimpan sebagai array
              JSON pada kolom features.
            </p>
          </div>

          <div>
            <label
              htmlFor="service-icon"
              className="mb-2 block text-sm font-semibold text-[#082B3A]"
            >
              Nama Icon
            </label>

            <input
              id="service-icon"
              name="icon"
              type="text"
              value={values.icon}
              onChange={handleChange}
              disabled={loading}
              placeholder="Contoh: Stethoscope"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100 disabled:bg-slate-100"
            />
          </div>

          <div>
            <label
              htmlFor="service-display-order"
              className="mb-2 block text-sm font-semibold text-[#082B3A]"
            >
              Urutan Tampil
            </label>

            <input
              id="service-display-order"
              name="display_order"
              type="number"
              min="0"
              step="1"
              value={values.display_order}
              onChange={handleChange}
              disabled={loading}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100 disabled:bg-slate-100"
            />

            <p className="mt-2 text-xs text-slate-400">
              Angka terkecil tampil lebih awal.
            </p>
          </div>
        </div>
      </section>

      {/* Gambar */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-[#082B3A]">
          Gambar Layanan
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Gunakan JPG, PNG, atau WebP,
          maksimal 2 MB.
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <label
              htmlFor="service-image"
              className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center transition hover:border-[#FF5A0A] hover:bg-orange-50"
            >
              <ImagePlus
                size={38}
                className="text-[#FF5A0A]"
              />

              <span className="mt-4 text-sm font-semibold text-[#082B3A]">
                Pilih gambar layanan
              </span>

              <span className="mt-2 text-xs text-slate-500">
                Rekomendasi rasio 16:9
              </span>
            </label>

            <input
              id="service-image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              disabled={loading}
              className="sr-only"
            />

            {imageFile && (
              <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#082B3A]">
                    {imageFile.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {(
                      imageFile.size /
                      1024 /
                      1024
                    ).toFixed(2)}{" "}
                    MB
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    removeSelectedImage
                  }
                  disabled={loading}
                  className="ml-4 rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                  aria-label="Hapus gambar pilihan"
                >
                  <X size={18} />
                </button>
              </div>
            )}
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-[#082B3A]">
              Preview Gambar
            </p>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview layanan"
                  className="aspect-video w-full object-cover"
                />
              ) : (
                <div className="flex aspect-video items-center justify-center">
                  <div className="text-center text-slate-400">
                    <ImagePlus
                      size={30}
                      className="mx-auto"
                    />

                    <p className="mt-2 text-xs">
                      Belum ada gambar
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Publikasi dan SEO */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-[#082B3A]">
          Publikasi dan SEO
        </h2>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="service-status"
              className="mb-2 block text-sm font-semibold text-[#082B3A]"
            >
              Status
            </label>

            <select
              id="service-status"
              name="status"
              value={values.status}
              onChange={handleChange}
              disabled={loading}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100 disabled:bg-slate-100"
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
            <label
              htmlFor="service-published-at"
              className="mb-2 block text-sm font-semibold text-[#082B3A]"
            >
              Tanggal Publikasi
            </label>

            <input
              id="service-published-at"
              name="published_at"
              type="datetime-local"
              value={values.published_at}
              onChange={handleChange}
              disabled={loading}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100 disabled:bg-slate-100"
            />
          </div>

          <div className="md:col-span-2">
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4">
              <input
                name="is_featured"
                type="checkbox"
                checked={
                  values.is_featured
                }
                onChange={handleChange}
                disabled={loading}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#FF5A0A] focus:ring-[#FF5A0A]"
              />

              <span>
                <span className="block text-sm font-semibold text-[#082B3A]">
                  Featured Service
                </span>

                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  Tampilkan layanan ini sebagai
                  layanan unggulan di homepage.
                </span>
              </span>
            </label>
          </div>

          <div>
            <label
              htmlFor="service-seo-title"
              className="mb-2 block text-sm font-semibold text-[#082B3A]"
            >
              SEO Title
            </label>

            <input
              id="service-seo-title"
              name="seo_title"
              type="text"
              value={values.seo_title}
              onChange={handleChange}
              maxLength={180}
              disabled={loading}
              placeholder="Judul untuk mesin pencari"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100 disabled:bg-slate-100"
            />
          </div>

          <div>
            <label
              htmlFor="service-seo-description"
              className="mb-2 block text-sm font-semibold text-[#082B3A]"
            >
              SEO Description
            </label>

            <textarea
              id="service-seo-description"
              name="seo_description"
              value={
                values.seo_description
              }
              onChange={handleChange}
              maxLength={300}
              rows={4}
              disabled={loading}
              placeholder="Deskripsi untuk mesin pencari"
              className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-7 outline-none transition focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100 disabled:bg-slate-100"
            />
          </div>
        </div>
      </section>

      {/* Tombol simpan */}
      <div className="flex justify-end rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <button
          type="submit"
          disabled={
            loading ||
            loadingCategories
          }
          className="inline-flex min-w-48 items-center justify-center gap-2 rounded-xl bg-[#FF5A0A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#E94F00] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
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
              {submitLabel}
            </>
          )}
        </button>
      </div>
    </form>
  );
}