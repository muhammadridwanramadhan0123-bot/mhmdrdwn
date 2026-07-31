import {
  LoaderCircle,
  ShieldAlert,
} from "lucide-react";
import {
  Link,
  Navigate,
  useLocation,
} from "react-router-dom";

import { useAdminAuth } from "../../contexts/AdminAuthContext";

export default function ProtectedAdminRoute({
  children,
}) {
  const location = useLocation();

  const {
    user,
    role,
    loading,
    authError,
    signOut,
    isContentManager,
  } = useAdminAuth();

  /*
   * Menunggu pemeriksaan session dan profile.
   */
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="text-center">
          <LoaderCircle
            size={44}
            className="mx-auto animate-spin text-[#FF5A0A]"
          />

          <h1 className="mt-5 text-xl font-bold text-[#082B3A]">
            Memeriksa akses
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Session dan role sedang diperiksa.
          </p>
        </div>
      </main>
    );
  }

  /*
   * Belum login.
   */
  if (!user) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  /*
   * User login tetapi role bukan admin/editor.
   */
  if (!isContentManager) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <ShieldAlert size={30} />
          </div>

          <h1 className="mt-6 text-2xl font-bold text-[#082B3A]">
            Akses ditolak
          </h1>

          <p className="mt-3 text-sm leading-7 text-slate-500">
            Akun ini tidak mempunyai izin untuk membuka
            dashboard admin.
          </p>

          <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
            Role saat ini:{" "}
            <span className="font-semibold text-[#082B3A]">
              {role || "tidak tersedia"}
            </span>
          </div>

          {authError && (
            <p className="mt-4 text-sm text-red-600">
              {authError}
            </p>
          )}

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              to="/"
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-[#082B3A] transition hover:border-[#FF5A0A] hover:text-[#FF5A0A]"
            >
              Kembali ke Website
            </Link>

            <button
              type="button"
              onClick={signOut}
              className="rounded-xl bg-[#FF5A0A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#E94F00]"
            >
              Keluar
            </button>
          </div>
        </div>
      </main>
    );
  }

  return children;
}