import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import PortfolioForm from "../../components/admin/PortfolioForm";
import { createPortfolio } from "../../services/portfolioService";

export default function AdminPortfolioCreatePage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] =
    useState("");

  async function handleCreatePortfolio(formData) {
    if (loading) return;

    try {
      setLoading(true);
      setErrorMessage("");

      const newPortfolio = await createPortfolio(
        formData
      );

      console.log(
        "Portfolio berhasil disimpan:",
        newPortfolio
      );

      alert("Portfolio berhasil disimpan ke database.");

      navigate("/admin/portfolio", {
        replace: true,
        state: {
          successMessage:
            "Portfolio berhasil ditambahkan.",
        },
      });
    } catch (error) {
      console.error(
        "Proses tambah portfolio gagal:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Portfolio gagal disimpan. Silakan coba kembali."
      );

      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-5 md:p-8">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/admin/portfolio"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#FF5A0A]"
        >
          <span aria-hidden="true">←</span>
          Kembali ke Portfolio
        </Link>

        <div className="mb-8 mt-6">
          <p className="text-sm font-bold uppercase tracking-wider text-[#FF5A0A]">
            Admin Dashboard
          </p>

          <h1 className="mt-2 text-3xl font-bold text-[#082B3A]">
            Tambah Portfolio
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Isi informasi project yang akan ditampilkan
            pada website Jasa Medika Transmedic.
          </p>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4"
          >
            <p className="font-semibold text-red-700">
              Portfolio gagal disimpan
            </p>

            <p className="mt-1 text-sm leading-6 text-red-600">
              {errorMessage}
            </p>
          </div>
        )}

        <PortfolioForm
          submitLabel="Simpan Portfolio"
          onSubmit={handleCreatePortfolio}
          loading={loading}
        />
      </div>
    </main>
  );
}