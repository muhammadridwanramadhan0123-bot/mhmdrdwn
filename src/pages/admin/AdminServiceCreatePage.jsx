import { useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import ServiceForm from "../../components/admin/ServiceForm";
import { createService } from "../../services/serviceService";

export default function AdminServiceCreatePage() {
  const navigate = useNavigate();

  const [saving, setSaving] =
    useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  async function handleCreateService(
    values,
    imageFile
  ) {
    if (saving) return;

    try {
      setSaving(true);
      setErrorMessage("");

      const createdService =
        await createService(
          values,
          imageFile
        );

      navigate("/admin/services", {
        replace: true,
        state: {
          successMessage: `Layanan “${createdService.name}” berhasil dibuat.`,
        },
      });
    } catch (error) {
      console.error(
        "Gagal membuat layanan:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Layanan gagal dibuat."
      );

      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="p-5 md:p-8">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/admin/services"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#FF5A0A]"
        >
          <ArrowLeft size={17} />
          Kembali ke Services
        </Link>

        <div className="mb-8 mt-6">
          <p className="text-sm font-bold uppercase tracking-wider text-[#FF5A0A]">
            Content Management
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#082B3A]">
            Tambah Service
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Tambahkan produk atau layanan baru
            untuk website Jasa Medika
            Transmedic.
          </p>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4"
          >
            <AlertTriangle
              size={21}
              className="mt-0.5 shrink-0 text-red-600"
            />

            <div>
              <p className="font-semibold text-red-700">
                Service gagal dibuat
              </p>

              <p className="mt-1 text-sm leading-6 text-red-600">
                {errorMessage}
              </p>
            </div>
          </div>
        )}

        <ServiceForm
          onSubmit={
            handleCreateService
          }
          loading={saving}
          submitLabel="Simpan Service"
        />
      </div>
    </main>
  );
}