import { useState } from "react";
import { Link } from "react-router-dom";

const currentYear = new Date().getFullYear();

const initialForm = {
  title: "",
  slug: "",
  category: "",
  short_description: "",
  full_description: "",
  challenge: "",
  solution: "",
  result: "",
  client_name: "",
  project_year: currentYear,
  status: "draft",
  is_featured: false,
  image: null,
};

function createSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function PortfolioForm({
  initialData = initialForm,
  submitLabel = "Simpan Portfolio",
  onSubmit,
}) {
  const [form, setForm] = useState({
    ...initialForm,
    ...initialData,
  });

  const [imagePreview, setImagePreview] = useState(
    initialData.image_url || ""
  );

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleTitleChange(event) {
    const title = event.target.value;

    setForm((previous) => ({
      ...previous,
      title,
      slug: createSlug(title),
    }));
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("File harus berupa gambar.");
      event.target.value = "";
      return;
    }

    const maximumSize = 2 * 1024 * 1024;

    if (file.size > maximumSize) {
      alert("Ukuran gambar maksimal 2 MB.");
      event.target.value = "";
      return;
    }

    setForm((previous) => ({
      ...previous,
      image: file,
    }));

    setImagePreview(URL.createObjectURL(file));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!form.title.trim()) {
      alert("Judul portfolio wajib diisi.");
      return;
    }

    if (!form.slug.trim()) {
      alert("Slug portfolio wajib diisi.");
      return;
    }

    if (!form.category.trim()) {
      alert("Kategori portfolio wajib diisi.");
      return;
    }

    if (!form.short_description.trim()) {
      alert("Deskripsi singkat wajib diisi.");
      return;
    }

    onSubmit(form);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border bg-white p-6 shadow-soft md:p-8"
    >
      <div className="grid gap-6 md:grid-cols-2">
        {/* Judul */}
        <div className="md:col-span-2">
          <label
            htmlFor="title"
            className="mb-2 block text-sm font-semibold text-navy"
          >
            Judul Portfolio
          </label>

          <input
            id="title"
            name="title"
            type="text"
            value={form.title}
            onChange={handleTitleChange}
            placeholder="Contoh: Hospital Information System"
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-orange"
          />
        </div>

        {/* Slug */}
        <div>
          <label
            htmlFor="slug"
            className="mb-2 block text-sm font-semibold text-navy"
          >
            Slug
          </label>

          <input
            id="slug"
            name="slug"
            type="text"
            value={form.slug}
            onChange={handleChange}
            placeholder="hospital-information-system"
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-orange"
          />

          <p className="mt-2 text-xs text-slate-400">
            Digunakan untuk alamat halaman portfolio.
          </p>
        </div>

        {/* Kategori */}
        <div>
          <label
            htmlFor="category"
            className="mb-2 block text-sm font-semibold text-navy"
          >
            Kategori
          </label>

          <select
            id="category"
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-orange"
          >
            <option value="">Pilih kategori</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Government">Government</option>
            <option value="Education">Education</option>
            <option value="Sports">Sports</option>
            <option value="Tourism">Tourism</option>
            <option value="Research">Research</option>
          </select>
        </div>

        {/* Deskripsi singkat */}
        <div className="md:col-span-2">
          <label
            htmlFor="short_description"
            className="mb-2 block text-sm font-semibold text-navy"
          >
            Deskripsi Singkat
          </label>

          <textarea
            id="short_description"
            name="short_description"
            value={form.short_description}
            onChange={handleChange}
            rows={3}
            placeholder="Tuliskan ringkasan singkat project..."
            className="w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-orange"
          />
        </div>

        {/* Deskripsi lengkap */}
        <div className="md:col-span-2">
          <label
            htmlFor="full_description"
            className="mb-2 block text-sm font-semibold text-navy"
          >
            Deskripsi Lengkap
          </label>

          <textarea
            id="full_description"
            name="full_description"
            value={form.full_description}
            onChange={handleChange}
            rows={6}
            placeholder="Tuliskan penjelasan lengkap mengenai project..."
            className="w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-orange"
          />
        </div>

        {/* Tantangan */}
        <div className="md:col-span-2">
          <label
            htmlFor="challenge"
            className="mb-2 block text-sm font-semibold text-navy"
          >
            Tantangan
          </label>

          <textarea
            id="challenge"
            name="challenge"
            value={form.challenge}
            onChange={handleChange}
            rows={4}
            placeholder="Jelaskan tantangan yang dihadapi..."
            className="w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-orange"
          />
        </div>

        {/* Solusi */}
        <div className="md:col-span-2">
          <label
            htmlFor="solution"
            className="mb-2 block text-sm font-semibold text-navy"
          >
            Solusi
          </label>

          <textarea
            id="solution"
            name="solution"
            value={form.solution}
            onChange={handleChange}
            rows={4}
            placeholder="Jelaskan solusi yang diberikan..."
            className="w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-orange"
          />
        </div>

        {/* Hasil */}
        <div className="md:col-span-2">
          <label
            htmlFor="result"
            className="mb-2 block text-sm font-semibold text-navy"
          >
            Hasil Project
          </label>

          <textarea
            id="result"
            name="result"
            value={form.result}
            onChange={handleChange}
            rows={4}
            placeholder="Jelaskan hasil yang dicapai..."
            className="w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-orange"
          />
        </div>

        {/* Nama klien */}
        <div>
          <label
            htmlFor="client_name"
            className="mb-2 block text-sm font-semibold text-navy"
          >
            Nama Klien
          </label>

          <input
            id="client_name"
            name="client_name"
            type="text"
            value={form.client_name}
            onChange={handleChange}
            placeholder="Nama perusahaan atau instansi"
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-orange"
          />
        </div>

        {/* Tahun */}
        <div>
          <label
            htmlFor="project_year"
            className="mb-2 block text-sm font-semibold text-navy"
          >
            Tahun Project
          </label>

          <input
            id="project_year"
            name="project_year"
            type="number"
            min="2000"
            max="2100"
            value={form.project_year}
            onChange={handleChange}
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-orange"
          />
        </div>

        {/* Status */}
        <div>
          <label
            htmlFor="status"
            className="mb-2 block text-sm font-semibold text-navy"
          >
            Status
          </label>

          <select
            id="status"
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition focus:border-orange"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Featured */}
        <div className="flex items-center">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              name="is_featured"
              type="checkbox"
              checked={form.is_featured}
              onChange={handleChange}
              className="h-5 w-5 accent-orange"
            />

            <span className="text-sm font-semibold text-navy">
              Jadikan portfolio unggulan
            </span>
          </label>
        </div>

        {/* Gambar */}
        <div className="md:col-span-2">
          <label
            htmlFor="image"
            className="mb-2 block text-sm font-semibold text-navy"
          >
            Gambar Portfolio
          </label>

          <input
            id="image"
            name="image"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleImageChange}
            className="w-full rounded-xl border bg-white px-4 py-3 text-sm"
          />

          <p className="mt-2 text-xs text-slate-400">
            Format JPG, PNG, atau WebP. Maksimal 2 MB.
          </p>

          {imagePreview && (
            <div className="mt-5 overflow-hidden rounded-2xl border bg-slate-100">
              <img
                src={imagePreview}
                alt="Preview portfolio"
                className="h-64 w-full object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {/* Tombol */}
      <div className="mt-8 flex flex-wrap justify-end gap-3 border-t pt-6">
        <Link
          to="/admin/portfolio"
          className="rounded-xl border px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-orange hover:text-orange"
        >
          Batal
        </Link>

        <button
          type="submit"
          className="rounded-xl bg-orange px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}