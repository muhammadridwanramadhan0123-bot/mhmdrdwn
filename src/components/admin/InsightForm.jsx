import { useEffect, useState } from "react";
import {
  ImagePlus,
  LoaderCircle,
  Save,
  X,
} from "lucide-react";

const MAX_COVER_SIZE = 2 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const INSIGHT_CATEGORIES = [
  "News",
  "Article",
];

function normalizeInsightCategory(value) {
  const normalizedValue = String(value || "")
    .trim()
    .toLowerCase();

  if (normalizedValue === "article") {
    return "Article";
  }

  return "News";
}

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

  const offset = date.getTimezoneOffset();
  const localDate = new Date(
    date.getTime() - offset * 60 * 1000
  );

  return localDate.toISOString().slice(0, 16);
}

function createInitialValues(initialData) {
  return {
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    category: normalizeInsightCategory(initialData?.category),
    excerpt: initialData?.excerpt || "",
    content: initialData?.content || "",
    author_name:
      initialData?.author_name || "JMT Editorial",
    published_at: formatDateTimeLocal(
      initialData?.published_at
    ),
    status: initialData?.status || "draft",
    is_featured: Boolean(
      initialData?.is_featured
    ),
  };
}

export default function InsightForm({
  initialData = null,
  onSubmit,
  loading = false,
  submitLabel = "Simpan Insight",
}) {
  const [values, setValues] = useState(() =>
    createInitialValues(initialData)
  );

  const [coverFile, setCoverFile] =
    useState(null);

  const [coverPreview, setCoverPreview] =
    useState(
      initialData?.cover_image_url || ""
    );

  const [slugEdited, setSlugEdited] =
    useState(Boolean(initialData?.slug));

  const [formError, setFormError] =
    useState("");

  useEffect(() => {
    setValues(createInitialValues(initialData));
    setCoverFile(null);
    setCoverPreview(
      initialData?.cover_image_url || ""
    );
    setSlugEdited(Boolean(initialData?.slug));
    setFormError("");
  }, [initialData]);

  useEffect(() => {
    if (!coverFile) {
      setCoverPreview(
        initialData?.cover_image_url || ""
      );

      return undefined;
    }

    const objectUrl =
      URL.createObjectURL(coverFile);

    setCoverPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [
    coverFile,
    initialData?.cover_image_url,
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

    if (name === "title") {
      setValues((currentValues) => ({
        ...currentValues,
        title: value,
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

  function handleCoverChange(event) {
    const selectedFile =
      event.target.files?.[0] || null;

    setFormError("");

    if (!selectedFile) {
      setCoverFile(null);
      return;
    }

    if (
      !ALLOWED_IMAGE_TYPES.includes(
        selectedFile.type
      )
    ) {
      setFormError(
        "Format cover harus JPG, PNG, atau WebP."
      );

      event.target.value = "";
      return;
    }

    if (selectedFile.size > MAX_COVER_SIZE) {
      setFormError(
        "Ukuran cover maksimal 2 MB."
      );

      event.target.value = "";
      return;
    }

    setCoverFile(selectedFile);
  }

  function removeSelectedCover() {
    setCoverFile(null);
    setCoverPreview(
      initialData?.cover_image_url || ""
    );

    const fileInput =
      document.getElementById(
        "insight-cover-image"
      );

    if (fileInput) {
      fileInput.value = "";
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) return;

    setFormError("");

    if (!values.title.trim()) {
      setFormError(
        "Judul insight wajib diisi."
      );
      return;
    }

    if (!values.slug.trim()) {
      setFormError(
        "Slug insight wajib diisi."
      );
      return;
    }

    if (!values.category.trim()) {
      setFormError(
        "Kategori insight wajib diisi."
      );
      return;
    }

    if (!values.excerpt.trim()) {
      setFormError(
        "Ringkasan insight wajib diisi."
      );
      return;
    }

    if (!values.content.trim()) {
      setFormError(
        "Isi insight wajib diisi."
      );
      return;
    }

    if (typeof onSubmit !== "function") {
      setFormError(
        "Fungsi penyimpanan tidak tersedia."
      );
      return;
    }

    await onSubmit(values, coverFile);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {formError && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4"
        >
          <p className="font-semibold text-red-700">
            Form belum dapat disimpan
          </p>

          <p className="mt-1 text-sm text-red-600">
            {formError}
          </p>
        </div>
      )}

      {/* Informasi utama */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-[#082B3A]">
          Informasi Utama
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Masukkan judul, slug, kategori, dan
          ringkasan artikel.
        </p>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label
              htmlFor="insight-title"
              className="mb-2 block text-sm font-semibold text-[#082B3A]"
            >
              Judul Insight
              <span className="text-red-500">
                {" "}*
              </span>
            </label>

            <input
              id="insight-title"
              name="title"
              type="text"
              value={values.title}
              onChange={handleChange}
              placeholder="Contoh: Transformasi Digital Rumah Sakit"
              maxLength={180}
              disabled={loading}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100 disabled:bg-slate-100"
            />

            <p className="mt-2 text-right text-xs text-slate-400">
              {values.title.length}/180
            </p>
          </div>

          <div>
            <label
              htmlFor="insight-slug"
              className="mb-2 block text-sm font-semibold text-[#082B3A]"
            >
              Slug
              <span className="text-red-500">
                {" "}*
              </span>
            </label>

            <input
              id="insight-slug"
              name="slug"
              type="text"
              value={values.slug}
              onChange={handleChange}
              placeholder="transformasi-digital-rumah-sakit"
              maxLength={200}
              disabled={loading}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100 disabled:bg-slate-100"
            />

            <p className="mt-2 text-xs text-slate-400">
              URL: /insight/
              {values.slug || "slug-artikel"}
            </p>
          </div>

          <div>
  <label
    htmlFor="insight-category"
    className="mb-2 block text-sm font-semibold text-[#082B3A]"
  >
    Kategori
    <span className="text-red-500">
      {" "}*
    </span>
  </label>

  <div className="relative">
    <select
      id="insight-category"
      name="category"
      value={values.category}
      onChange={handleChange}
      disabled={loading}
      className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 pr-11 text-sm text-[#082B3A] outline-none transition focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-slate-100"
    >
      {INSIGHT_CATEGORIES.map((category) => (
        <option
          key={category}
          value={category}
        >
          {category}
        </option>
      ))}
    </select>

    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
    >
      <path
        d="m6 8 4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>

    <p className="mt-2 text-xs text-slate-400">
        Pilih News untuk berita perusahaan atau Article
       untuk artikel dan wawasan.
    </p>
  </div>

          <div className="md:col-span-2">
            <label
              htmlFor="insight-excerpt"
              className="mb-2 block text-sm font-semibold text-[#082B3A]"
            >
              Ringkasan
              <span className="text-red-500">
                {" "}*
              </span>
            </label>

            <textarea
              id="insight-excerpt"
              name="excerpt"
              value={values.excerpt}
              onChange={handleChange}
              placeholder="Tuliskan ringkasan singkat artikel..."
              rows={4}
              maxLength={300}
              disabled={loading}
              className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-7 outline-none transition focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100 disabled:bg-slate-100"
            />

            <p className="mt-2 text-right text-xs text-slate-400">
              {values.excerpt.length}/300
            </p>
          </div>
        </div>
      </section>

      {/* Isi artikel */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-[#082B3A]">
          Isi Artikel
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Isi artikel masih menggunakan teks biasa.
          Pemisahan paragraf dapat menggunakan baris
          baru.
        </p>

        <div className="mt-6">
          <label
            htmlFor="insight-content"
            className="mb-2 block text-sm font-semibold text-[#082B3A]"
          >
            Konten
            <span className="text-red-500">
              {" "}*
            </span>
          </label>

          <textarea
            id="insight-content"
            name="content"
            value={values.content}
            onChange={handleChange}
            placeholder="Tuliskan isi artikel secara lengkap..."
            rows={14}
            disabled={loading}
            className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-7 outline-none transition focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100 disabled:bg-slate-100"
          />
        </div>
      </section>

      {/* Cover */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-[#082B3A]">
          Gambar Cover
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Gunakan JPG, PNG, atau WebP dengan ukuran
          maksimal 2 MB.
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <label
              htmlFor="insight-cover-image"
              className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center transition hover:border-[#FF5A0A] hover:bg-orange-50"
            >
              <ImagePlus
                size={38}
                className="text-[#FF5A0A]"
              />

              <span className="mt-4 text-sm font-semibold text-[#082B3A]">
                Pilih gambar cover
              </span>

              <span className="mt-2 text-xs text-slate-500">
                Rekomendasi rasio 16:9
              </span>
            </label>

            <input
              id="insight-cover-image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleCoverChange}
              disabled={loading}
              className="sr-only"
            />

            {coverFile && (
              <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#082B3A]">
                    {coverFile.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {(
                      coverFile.size /
                      1024 /
                      1024
                    ).toFixed(2)}{" "}
                    MB
                  </p>
                </div>

                <button
                  type="button"
                  onClick={removeSelectedCover}
                  disabled={loading}
                  className="ml-4 rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                  aria-label="Hapus gambar yang dipilih"
                >
                  <X size={18} />
                </button>
              </div>
            )}
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-[#082B3A]">
              Preview Cover
            </p>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              {coverPreview ? (
                <img
                  src={coverPreview}
                  alt="Preview cover insight"
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
                      Belum ada cover
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Publikasi */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-[#082B3A]">
          Pengaturan Publikasi
        </h2>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div>
            <label
              htmlFor="insight-author"
              className="mb-2 block text-sm font-semibold text-[#082B3A]"
            >
              Nama Penulis
            </label>

            <input
              id="insight-author"
              name="author_name"
              type="text"
              value={values.author_name}
              onChange={handleChange}
              placeholder="JMT Editorial"
              disabled={loading}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100 disabled:bg-slate-100"
            />
          </div>

          <div>
            <label
              htmlFor="insight-status"
              className="mb-2 block text-sm font-semibold text-[#082B3A]"
            >
              Status
            </label>

            <select
              id="insight-status"
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
              htmlFor="insight-published-at"
              className="mb-2 block text-sm font-semibold text-[#082B3A]"
            >
              Tanggal Publikasi
            </label>

            <input
              id="insight-published-at"
              name="published_at"
              type="datetime-local"
              value={values.published_at}
              onChange={handleChange}
              disabled={loading}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100 disabled:bg-slate-100"
            />

            <p className="mt-2 text-xs leading-5 text-slate-400">
              Bila status Published dan tanggal kosong,
              sistem akan memakai waktu saat disimpan.
            </p>
          </div>

          <div className="flex items-center">
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4">
              <input
                name="is_featured"
                type="checkbox"
                checked={values.is_featured}
                onChange={handleChange}
                disabled={loading}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#FF5A0A] focus:ring-[#FF5A0A]"
              />

              <span>
                <span className="block text-sm font-semibold text-[#082B3A]">
                  Featured Insight
                </span>

                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  Prioritaskan artikel ini pada homepage.
                </span>
              </span>
            </label>
          </div>
        </div>
      </section>

      {/* Tombol */}
      <div className="flex flex-wrap justify-end gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex min-w-44 items-center justify-center gap-2 rounded-xl bg-[#FF5A0A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#E94F00] disabled:cursor-not-allowed disabled:opacity-60"
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