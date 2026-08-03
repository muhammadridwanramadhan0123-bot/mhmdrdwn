import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ExternalLink,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import InsightForm from "../../components/admin/InsightForm";
import {
  getInsightById,
  updateInsight,
} from "../../services/insightService";

export default function AdminInsightEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [insight, setInsight] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadInsight = useCallback(async () => {
    if (!id) {
      setErrorMessage("ID Insight tidak tersedia.");
      setLoadingData(false);
      return;
    }

    try {
      setLoadingData(true);
      setErrorMessage("");

      const data = await getInsightById(id);

      setInsight(data);
    } catch (error) {
      console.error(
        "Gagal mengambil data Insight:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Data Insight gagal dimuat."
      );

      setInsight(null);
    } finally {
      setLoadingData(false);
    }
  }, [id]);

  useEffect(() => {
    loadInsight();
  }, [loadInsight]);

  async function handleUpdateInsight(
    values,
    coverFile
  ) {
    if (!id || saving) return;

    try {
      setSaving(true);
      setErrorMessage("");

      const updatedInsight = await updateInsight(
        id,
        values,
        coverFile
      );

      navigate("/admin/insight", {
        replace: true,
        state: {
          successMessage: `Insight “${updatedInsight.title}” berhasil diperbarui.`,
        },
      });
    } catch (error) {
      console.error(
        "Gagal memperbarui Insight:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Insight gagal diperbarui."
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

  if (loadingData) {
    return (
      <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center p-6">
        <div className="text-center">
          <LoaderCircle
            size={44}
            className="mx-auto animate-spin text-[#FF5A0A]"
          />

          <h1 className="mt-5 text-xl font-bold text-[#082B3A]">
            Memuat data Insight
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Data sedang diambil dari Supabase.
          </p>
        </div>
      </main>
    );
  }

  if (!insight && !errorMessage) {
    return (
      <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center p-6">
        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-2xl font-bold text-[#FF5A0A]">
            !
          </div>

          <h1 className="mt-6 text-2xl font-bold text-[#082B3A]">
            Insight tidak ditemukan
          </h1>

          <p className="mt-3 text-sm leading-7 text-slate-500">
            Data Insight tidak tersedia atau sudah dihapus
            dari database.
          </p>

          <Link
            to="/admin/insight"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#FF5A0A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#E94F00]"
          >
            <ArrowLeft size={17} />
            Kembali ke Insight
          </Link>
        </div>
      </main>
    );
  }

  if (!insight && errorMessage) {
    return (
      <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center p-6">
        <div className="w-full max-w-lg rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertTriangle size={29} />
          </div>

          <h1 className="mt-6 text-2xl font-bold text-[#082B3A]">
            Data gagal dimuat
          </h1>

          <p className="mt-3 text-sm leading-7 text-red-600">
            {errorMessage}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/admin/insight"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-[#FF5A0A] hover:text-[#FF5A0A]"
            >
              <ArrowLeft size={17} />
              Kembali
            </Link>

            <button
              type="button"
              onClick={loadInsight}
              className="inline-flex items-center gap-2 rounded-xl bg-[#FF5A0A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#E94F00]"
            >
              <RefreshCw size={17} />
              Coba Lagi
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="p-5 md:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/admin/insight"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#FF5A0A]"
          >
            <ArrowLeft size={17} />
            Kembali ke Insight
          </Link>

          {insight.status === "published" &&
            insight.slug && (
              <Link
                to={`/insight/${insight.slug}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#082B3A] transition hover:border-[#FF5A0A] hover:text-[#FF5A0A]"
              >
                <ExternalLink size={17} />
                Lihat Insight
              </Link>
            )}
        </div>

        <div className="mb-8 mt-6">
          <p className="text-sm font-bold uppercase tracking-wider text-[#FF5A0A]">
            Content Management
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#082B3A]">
            Edit Insight
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Perbarui isi artikel, cover, dan pengaturan
            publikasi Insight.
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
                Insight gagal diperbarui
              </p>

              <p className="mt-1 text-sm leading-6 text-red-600">
                {errorMessage}
              </p>
            </div>
          </div>
        )}

        <InsightForm
          key={insight.id}
          initialData={insight}
          onSubmit={handleUpdateInsight}
          loading={saving}
          submitLabel="Simpan Perubahan"
        />
      </div>
    </main>
  );
}