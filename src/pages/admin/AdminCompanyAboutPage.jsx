import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  ExternalLink,
  FileDown,
  FileText,
  ImageIcon,
  LoaderCircle,
  RefreshCw,
  Save,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  deleteCompanyImage,
  getAdminCompanyProfile,
  saveCompanyProfile,
  uploadCompanyImage,
  uploadCompanyProfilePdf,
} from "../../services/companyAdminService";

const initialFormData = {
  id: 1,
  company_name: "",
  short_description: "",
  vision: "",
  mission: "",

  /*
   * Data berikut tidak diedit di halaman ini,
   * tetapi tetap disimpan agar tidak terhapus.
   */
  address: "",
  email: "",
  phone: "",
  website: "",

  logo_url: "",
  company_profile_pdf_url: "",
};

function normalizeMissionForEditor(value) {
  const text = String(value || "").trim();

  if (!text) {
    return "";
  }

  /*
   * Mengubah misi bernomor yang masih berada
   * dalam satu baris menjadi beberapa baris.
   */
  if (
    !text.includes("\n") &&
    /\d+\.\s/.test(text)
  ) {
    return text.replace(
      /\s+(?=\d+\.\s)/g,
      "\n"
    );
  }

  return text;
}

function getFileNameFromUrl(value) {
  const url = String(value || "").trim();

  if (!url) {
    return "";
  }

  try {
    const parsedUrl = new URL(url);

    const pathParts =
      parsedUrl.pathname.split("/");

    return decodeURIComponent(
      pathParts[pathParts.length - 1] ||
        "company-profile.pdf"
    );
  } catch {
    const pathParts = url.split("/");

    return (
      pathParts[pathParts.length - 1] ||
      "company-profile.pdf"
    );
  }
}

function AboutFormLoading() {
  return (
    <div className="space-y-6">
      <div className="h-28 animate-pulse rounded-3xl bg-slate-200" />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <div className="h-80 animate-pulse rounded-3xl bg-slate-200" />
          <div className="h-96 animate-pulse rounded-3xl bg-slate-200" />
        </div>

        <div className="h-[560px] animate-pulse rounded-3xl bg-slate-200" />
      </div>
    </div>
  );
}

export default function AdminCompanyAboutPage() {
  const [formData, setFormData] =
    useState(initialFormData);

  const [logoFile, setLogoFile] =
    useState(null);

  const [logoPreviewUrl, setLogoPreviewUrl] =
    useState("");

  const [pdfFile, setPdfFile] =
    useState(null);

  const [originalLogoUrl, setOriginalLogoUrl] =
    useState("");

  const [
    originalCompanyProfileUrl,
    setOriginalCompanyProfileUrl,
  ] = useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  /*
   * Membersihkan URL preview lokal ketika
   * file diganti atau komponen ditutup.
   */
  useEffect(() => {
    return () => {
      if (
        logoPreviewUrl.startsWith("blob:")
      ) {
        URL.revokeObjectURL(
          logoPreviewUrl
        );
      }
    };
  }, [logoPreviewUrl]);

  const loadCompanyProfile =
    useCallback(async () => {
      try {
        setLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        const profile =
          await getAdminCompanyProfile();

        const nextFormData = {
          ...initialFormData,

          id: profile?.id || 1,

          company_name:
            profile?.company_name || "",

          short_description:
            profile?.short_description ||
            "",

          vision:
            profile?.vision || "",

          mission:
            normalizeMissionForEditor(
              profile?.mission
            ),

          address:
            profile?.address || "",

          email:
            profile?.email || "",

          phone:
            profile?.phone || "",

          website:
            profile?.website || "",

          logo_url:
            profile?.logo_url || "",

          company_profile_pdf_url:
            profile
              ?.company_profile_pdf_url ||
            "",
        };

        setFormData(nextFormData);

        setOriginalLogoUrl(
          nextFormData.logo_url
        );

        setOriginalCompanyProfileUrl(
          nextFormData
            .company_profile_pdf_url
        );

        setLogoFile(null);
        setPdfFile(null);
        setLogoPreviewUrl("");
      } catch (error) {
        console.error(
          "Profil perusahaan gagal dimuat:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Profil perusahaan gagal dimuat."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadCompanyProfile();
  }, [loadCompanyProfile]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    setSuccessMessage("");
  }

  function handleLogoFileChange(event) {
    const selectedFile =
      event.target.files?.[0];

    event.target.value = "";

    if (!selectedFile) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(
        selectedFile.type
      )
    ) {
      setErrorMessage(
        "Logo harus berformat JPG, PNG, atau WebP."
      );

      return;
    }

    const maximumSize =
      5 * 1024 * 1024;

    if (
      selectedFile.size > maximumSize
    ) {
      setErrorMessage(
        "Ukuran logo maksimal 5 MB."
      );

      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    setLogoFile(selectedFile);

    setLogoPreviewUrl(
      URL.createObjectURL(selectedFile)
    );
  }

  function handlePdfFileChange(event) {
    const selectedFile =
      event.target.files?.[0];

    event.target.value = "";

    if (!selectedFile) {
      return;
    }

    if (
      selectedFile.type !==
      "application/pdf"
    ) {
      setErrorMessage(
        "Company profile harus berformat PDF."
      );

      return;
    }

    const maximumSize =
      10 * 1024 * 1024;

    if (
      selectedFile.size > maximumSize
    ) {
      setErrorMessage(
        "Ukuran file PDF maksimal 10 MB."
      );

      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setPdfFile(selectedFile);
  }

  function handleRemoveLogo() {
    setLogoFile(null);
    setLogoPreviewUrl("");

    setFormData((currentData) => ({
      ...currentData,
      logo_url: "",
    }));

    setSuccessMessage("");
  }

  function handleRemovePdf() {
    setPdfFile(null);

    setFormData((currentData) => ({
      ...currentData,
      company_profile_pdf_url: "",
    }));

    setSuccessMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!formData.company_name.trim()) {
      setErrorMessage(
        "Nama perusahaan wajib diisi."
      );

      return;
    }

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    const newlyUploadedAssets = [];

    let saveCompleted = false;

    try {
      let nextLogoUrl =
        formData.logo_url;

      let nextCompanyProfileUrl =
        formData
          .company_profile_pdf_url;

      /*
       * Upload logo baru apabila pengguna
       * memilih file gambar.
       */
      if (logoFile) {
        const uploadedLogo =
          await uploadCompanyImage(
            logoFile,
            "company"
          );

        nextLogoUrl =
          uploadedLogo.publicUrl;

        newlyUploadedAssets.push(
          uploadedLogo
        );
      }

      /*
       * Upload PDF baru apabila pengguna
       * memilih file company profile.
       */
      if (pdfFile) {
        const uploadedPdf =
          await uploadCompanyProfilePdf(
            pdfFile
          );

        nextCompanyProfileUrl =
          uploadedPdf.publicUrl;

        newlyUploadedAssets.push(
          uploadedPdf
        );
      }

      const savedProfile =
        await saveCompanyProfile({
          ...formData,

          logo_url: nextLogoUrl,

          company_profile_pdf_url:
            nextCompanyProfileUrl,
        });

      saveCompleted = true;

      /*
       * Setelah database berhasil diperbarui,
       * hapus file lama dari Storage.
       */
      const oldAssets = [];

      if (
        originalLogoUrl &&
        originalLogoUrl !==
          savedProfile.logo_url
      ) {
        oldAssets.push(originalLogoUrl);
      }

      if (
        originalCompanyProfileUrl &&
        originalCompanyProfileUrl !==
          savedProfile
            .company_profile_pdf_url
      ) {
        oldAssets.push(
          originalCompanyProfileUrl
        );
      }

      for (const assetUrl of oldAssets) {
        try {
          await deleteCompanyImage(
            assetUrl
          );
        } catch (deleteError) {
          /*
           * Gagal menghapus file lama tidak
           * membatalkan penyimpanan data.
           */
          console.warn(
            "File lama gagal dihapus:",
            deleteError
          );
        }
      }

      const nextFormData = {
        ...initialFormData,
        ...savedProfile,

        mission:
          normalizeMissionForEditor(
            savedProfile.mission
          ),
      };

      setFormData(nextFormData);

      setOriginalLogoUrl(
        savedProfile.logo_url || ""
      );

      setOriginalCompanyProfileUrl(
        savedProfile
          .company_profile_pdf_url || ""
      );

      setLogoFile(null);
      setPdfFile(null);
      setLogoPreviewUrl("");

      setSuccessMessage(
        "Profil perusahaan berhasil diperbarui."
      );
    } catch (error) {
      console.error(
        "Profil perusahaan gagal disimpan:",
        error
      );

      /*
       * Jika database belum berhasil disimpan,
       * file baru yang sudah terunggah dibersihkan.
       */
      if (!saveCompleted) {
        for (
          const uploadedAsset of
          newlyUploadedAssets
        ) {
          try {
            await deleteCompanyImage(
              uploadedAsset
            );
          } catch (cleanupError) {
            console.warn(
              "File sementara gagal dibersihkan:",
              cleanupError
            );
          }
        }
      }

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Profil perusahaan gagal disimpan."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <AboutFormLoading />;
  }

  const displayedLogo =
    logoPreviewUrl ||
    formData.logo_url;

  const displayedPdfName =
    pdfFile?.name ||
    getFileNameFromUrl(
      formData.company_profile_pdf_url
    );

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
            <Building2 size={14} />
            About Us
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-[#082B3A] md:text-4xl">
            Profil Perusahaan
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
            Kelola identitas, deskripsi, visi,
            misi, logo, dan dokumen company
            profile.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            to="/company/about-us"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-[#082B3A] shadow-sm transition hover:border-[#FF5A0A] hover:text-[#FF5A0A]"
          >
            Lihat Halaman Publik
            <ExternalLink size={16} />
          </Link>

          <button
            type="button"
            onClick={loadCompanyProfile}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-[#FF5A0A] hover:text-[#FF5A0A] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Reset
          </button>
        </div>
      </section>

      {/* Pesan error */}
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

      {/* Pesan berhasil */}
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
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          {/* Kolom form utama */}
          <div className="space-y-6">
            {/* Identitas */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Building2 size={22} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-[#082B3A]">
                    Identitas Perusahaan
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Informasi utama yang tampil
                    pada halaman About Us.
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
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    id="company_name"
                    name="company_name"
                    type="text"
                    value={
                      formData.company_name
                    }
                    onChange={handleChange}
                    required
                    placeholder="Contoh: Jasa Medika Transmedic"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#082B3A] outline-none transition placeholder:text-slate-400 focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-4">
                    <label
                      htmlFor="short_description"
                      className="text-sm font-semibold text-[#082B3A]"
                    >
                      Deskripsi Singkat
                    </label>

                    <span className="text-xs text-slate-400">
                      {
                        formData
                          .short_description
                          .length
                      }{" "}
                      karakter
                    </span>
                  </div>

                  <textarea
                    id="short_description"
                    name="short_description"
                    value={
                      formData
                        .short_description
                    }
                    onChange={handleChange}
                    rows={6}
                    placeholder="Tuliskan ringkasan mengenai perusahaan..."
                    className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-7 text-[#082B3A] outline-none transition placeholder:text-slate-400 focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              </div>
            </section>

            {/* Visi dan Misi */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                  <FileText size={22} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-[#082B3A]">
                    Visi dan Misi
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Jelaskan arah dan komitmen
                    utama perusahaan.
                  </p>
                </div>
              </div>

              <div className="mt-7 space-y-6">
                <div>
                  <label
                    htmlFor="vision"
                    className="mb-2 block text-sm font-semibold text-[#082B3A]"
                  >
                    Visi Perusahaan
                  </label>

                  <textarea
                    id="vision"
                    name="vision"
                    value={formData.vision}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Tuliskan visi perusahaan..."
                    className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-7 text-[#082B3A] outline-none transition placeholder:text-slate-400 focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="mission"
                    className="mb-2 block text-sm font-semibold text-[#082B3A]"
                  >
                    Misi Perusahaan
                  </label>

                  <textarea
                    id="mission"
                    name="mission"
                    value={formData.mission}
                    onChange={handleChange}
                    rows={9}
                    placeholder={`Tuliskan satu misi pada setiap baris.\n\nContoh:\nMengembangkan solusi kesehatan digital.\nMemberikan pelayanan terbaik.\nMeningkatkan efisiensi fasilitas kesehatan.`}
                    className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-7 text-[#082B3A] outline-none transition placeholder:text-slate-400 focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
                  />

                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    Gunakan satu baris untuk
                    setiap poin misi.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Kolom aset */}
          <aside className="space-y-6">
            {/* Logo */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <ImageIcon
                  size={20}
                  className="text-[#FF5A0A]"
                />

                <h2 className="font-bold text-[#082B3A]">
                  Logo Perusahaan
                </h2>
              </div>

              <div className="mt-5 flex min-h-52 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6">
                {displayedLogo ? (
                  <img
                    src={displayedLogo}
                    alt="Preview logo perusahaan"
                    className="max-h-36 max-w-full object-contain"
                  />
                ) : (
                  <div className="text-center">
                    <ImageIcon
                      size={38}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 text-sm font-semibold text-slate-500">
                      Logo belum tersedia
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-5 space-y-3">
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#082B3A] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0A4053]">
                  <UploadCloud size={17} />
                  Pilih Logo

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={
                      handleLogoFileChange
                    }
                    className="hidden"
                  />
                </label>

                {displayedLogo && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                    Hapus Logo
                  </button>
                )}
              </div>

              <p className="mt-4 text-xs leading-5 text-slate-400">
                Format JPG, PNG, atau WebP.
                Ukuran maksimal 5 MB.
              </p>
            </section>

            {/* PDF */}
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <FileDown
                  size={20}
                  className="text-[#FF5A0A]"
                />

                <h2 className="font-bold text-[#082B3A]">
                  Company Profile PDF
                </h2>
              </div>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                {displayedPdfName ? (
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                      <FileText size={23} />
                    </div>

                    <p className="mt-4 break-all text-sm font-semibold leading-6 text-[#082B3A]">
                      {displayedPdfName}
                    </p>

                    {formData
                      .company_profile_pdf_url &&
                      !pdfFile && (
                        <a
                          href={
                            formData
                              .company_profile_pdf_url
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-[#FF5A0A]"
                        >
                          Buka PDF
                          <ExternalLink
                            size={14}
                          />
                        </a>
                      )}
                  </div>
                ) : (
                  <div className="py-4 text-center">
                    <FileText
                      size={36}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 text-sm font-semibold text-slate-500">
                      PDF belum tersedia
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-5 space-y-3">
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#082B3A] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0A4053]">
                  <UploadCloud size={17} />
                  Pilih File PDF

                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={
                      handlePdfFileChange
                    }
                    className="hidden"
                  />
                </label>

                {displayedPdfName && (
                  <button
                    type="button"
                    onClick={handleRemovePdf}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                    Hapus PDF
                  </button>
                )}
              </div>

              <p className="mt-4 text-xs leading-5 text-slate-400">
                File wajib berformat PDF dengan
                ukuran maksimal 10 MB.
              </p>
            </section>
          </aside>
        </div>

        {/* Tombol simpan */}
        <section className="sticky bottom-4 z-20 flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-[#082B3A]">
              Simpan perubahan profil
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Perubahan akan langsung digunakan
              oleh halaman About Us publik.
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