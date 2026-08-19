import {
  useState,
} from "react";

import {
  AlertTriangle,
  ArrowLeft,
  Plus,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import ServiceForm from "../../components/admin/ServiceForm";

import {
  createService,
} from "../../services/serviceService";

export default function AdminServiceCreatePage() {
  const navigate =
    useNavigate();

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  async function handleCreateService(
    values,
    imageFile
  ) {
    if (saving) {
      return;
    }

    try {
      setSaving(true);

      setErrorMessage("");

      const createdService =
        await createService(
          values,
          imageFile
        );

      /*
       * Setelah membuat Service,
       * langsung masuk ke workspace edit.
       *
       * Admin dapat lanjut mengisi:
       * - fitur
       * - CMS
       * - publish
       */

      navigate(
        `/admin/services/edit/${createdService.id}?tab=informasi`,
        {
          replace: true,
        }
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Service gagal dibuat."
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50/70">
      <div className="mx-auto max-w-7xl p-5 md:p-8">
        {/* BACK */}

        <Link
          to="/admin/services"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#FF5A0A]"
        >
          <ArrowLeft
            size={17}
          />
          Kembali ke Services
        </Link>

        {/* HEADER */}

        <section className="mt-5 overflow-hidden rounded-3xl bg-[#082B3A] px-6 py-7 text-white md:px-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FF5A0A]">
              <Plus
                size={
                  23
                }
              />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-300">
                Product & Services
              </p>

              <h1 className="mt-2 text-3xl font-bold">
                Tambah Service
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-7 text-white/60">
                Buat Product atau Service utama terlebih dahulu. Setelah
                disimpan, fitur, konten halaman dan pengaturan publikasi dapat
                dikelola dari workspace Edit Service.
              </p>
            </div>
          </div>
        </section>

        {/* ERROR */}

        {errorMessage && (
          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
            <AlertTriangle
              size={20}
              className="mt-0.5 shrink-0 text-red-600"
            />

            <p className="text-sm leading-6 text-red-700">
              {errorMessage}
            </p>
          </div>
        )}

        {/* FORM */}

        <div className="mt-6">
          <ServiceForm
            onSubmit={
              handleCreateService
            }
            loading={
              saving
            }
            submitLabel="Buat Service"
          />
        </div>
      </div>
    </main>
  );
}