import { useState } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";
import { supabase } from "../../lib/supabase";

const ALLOWED_DASHBOARD_ROLES = ["admin", "editor"];

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (errorMessage) {
      setErrorMessage("");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const email = form.email.trim().toLowerCase();
    const password = form.password;

    if (!email) {
      setErrorMessage("Email wajib diisi.");
      return;
    }

    if (!password.trim()) {
      setErrorMessage("Password wajib diisi.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      // 1. Login menggunakan Supabase Authentication
      const {
        data: authData,
        error: authError,
      } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        if (authError.message === "Invalid login credentials") {
          throw new Error(
            "Email atau password yang Anda masukkan salah."
          );
        }

        if (authError.message === "Email not confirmed") {
          throw new Error(
            "Email akun belum dikonfirmasi."
          );
        }

        throw authError;
      }

      if (!authData.user) {
        throw new Error(
          "Data pengguna tidak ditemukan setelah login."
        );
      }

      // 2. Mengambil profile berdasarkan ID user Supabase Auth
      // Backend memakai profiles.id = auth.users.id
      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("id", authData.user.id)
        .maybeSingle();

      if (profileError) {
        await supabase.auth.signOut();

        throw new Error(
          `Gagal memeriksa hak akses pengguna: ${profileError.message}`
        );
      }

      if (!profile) {
        await supabase.auth.signOut();

        throw new Error(
          "Profil pengguna tidak ditemukan. Hubungi administrator sistem."
        );
      }

      // 3. Normalisasi nama role
      const normalizedRole = String(profile.role || "")
        .trim()
        .toLowerCase();

      // 4. Hanya admin dan editor yang boleh masuk dashboard
      if (
        !ALLOWED_DASHBOARD_ROLES.includes(normalizedRole)
      ) {
        await supabase.auth.signOut();

        throw new Error(
          "Akun Anda tidak memiliki izin untuk mengakses dashboard."
        );
      }

      // 5. Kembali ke halaman admin yang sebelumnya diminta
      const destination =
        location.state?.from || "/admin";

      navigate(destination, {
        replace: true,
      });
    } catch (error) {
      console.error("Login admin gagal:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Login gagal. Silakan coba kembali."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xl sm:p-9">
          {/* Identitas */}
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FF5A0A] text-sm font-extrabold text-white shadow-lg shadow-orange-950/20">
              JMT
            </div>

            <p className="mt-6 text-sm font-bold uppercase tracking-wider text-[#FF5A0A]">
              Jasa Medika Transmedic
            </p>

            <h1 className="mt-2 text-3xl font-bold text-[#082B3A]">
              Login Admin
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Masuk menggunakan akun admin atau editor untuk
              mengelola konten website.
            </p>
          </div>

          {/* Form login */}
          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
          >
            {errorMessage && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
              >
                {errorMessage}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-[#082B3A]"
              >
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                disabled={loading}
                placeholder="admin@example.com"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-[#082B3A]"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={
                    showPassword ? "text" : "password"
                  }
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Masukkan password"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-24 text-sm outline-none transition focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (previous) => !previous
                    )
                  }
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 transition hover:text-[#FF5A0A] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {showPassword
                    ? "Sembunyikan"
                    : "Lihat"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#FF5A0A] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#E94F00] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Memeriksa akun..."
                : "Masuk ke Dashboard"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs leading-5 text-slate-400">
            Dashboard hanya dapat diakses oleh role admin dan
            editor.
          </p>
        </div>
      </div>
    </main>
  );
}