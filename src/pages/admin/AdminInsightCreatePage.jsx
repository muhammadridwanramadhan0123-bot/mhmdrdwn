import { useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import InsightForm from "../../components/admin/InsightForm";
import { createInsight } from "../../services/insightService";

export default function AdminInsightCreatePage() {
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleCreateInsight(
    values,
    coverFile
  ) {
    if (saving) return;

    try {
      setSaving(true);
      setErrorMessage("");

      const createdInsight = await createInsight(
        values,
        coverFile
      );

      navigate("/admin/insight", {
        replace: true,
        state: {
          successMessage: `Insight “${createdInsight.title}” berhasil dibuat.`,
        },
      });
    } catch (error) {
      console.error(
        "Gagal membuat Insight:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Insight gagal dibuat."
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
          to="/admin/insight"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#FF5A0A]"
        >
          <ArrowLeft size={17} />
          Kembali ke Insight
        </Link>

        <div className="mb-8 mt-6">
          <p className="text-sm font-bold uppercase tracking-wider text-[#FF5A0A]">
            Admin Dashboard
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#082B3A]">
            Tambah Insight
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Buat artikel, berita, atau informasi baru untuk
            website Jasa Medika Transmedic.
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
                Insight gagal dibuat
              </p>

              <p className="mt-1 text-sm leading-6 text-red-600">
                {errorMessage}
              </p>
            </div>
          </div>
        )}

        <InsightForm
          onSubmit={handleCreateInsight}
          loading={saving}
          submitLabel="Simpan Insight"
        />
      </div>
    </main>
  );
}