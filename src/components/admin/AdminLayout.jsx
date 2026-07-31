import { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  ExternalLink,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Menu,
  PlusCircle,
  X,
} from "lucide-react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAdminAuth } from "../../contexts/AdminAuthContext";

const navigationItems = [
  {
    label: "Dashboard",
    to: "/admin",
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: "Portfolio",
    to: "/admin/portfolio",
    icon: BriefcaseBusiness,
    end: true,
  },
  {
    label: "Tambah Portfolio",
    to: "/admin/portfolio/create",
    icon: PlusCircle,
    end: true,
  },
];

function getNavLinkClass({ isActive }) {
  const baseClass =
    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition duration-200";

  const activeClass =
    "bg-[#FF5A0A] text-white shadow-lg shadow-orange-950/20";

  const inactiveClass =
    "text-slate-200 hover:bg-white/10 hover:text-white";

  return `${baseClass} ${
    isActive ? activeClass : inactiveClass
  }`;
}

function getRoleLabel(role) {
  switch (role) {
    case "admin":
      return "Administrator";

    case "editor":
      return "Editor";

    case "viewer":
      return "Viewer";

    default:
      return "Content Manager";
  }
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  /*
   * Data user dan role sekarang berasal dari AdminAuthContext.
   */
  const {
    user,
    profile,
    role,
    signOut,
  } = useAdminAuth();

  /*
   * Gunakan nama profile apabila tersedia.
   * Bila tidak ada, gunakan email user.
   */
  const displayName =
    profile?.full_name ||
    profile?.name ||
    user?.user_metadata?.full_name ||
    user?.email ||
    "Pengguna";

  const roleLabel = getRoleLabel(role);

  const avatarInitial =
    String(displayName)
      .trim()
      .charAt(0)
      .toUpperCase() || "U";

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  /*
   * Logout Supabase yang sebenarnya.
   */
  async function handleLogout() {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);
      setLogoutError("");

      await signOut();

      navigate("/admin/login", {
        replace: true,
      });
    } catch (error) {
      console.error("Logout gagal:", error);

      setLogoutError(
        error instanceof Error
          ? error.message
          : "Logout gagal dilakukan."
      );
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 lg:flex">
      {/* Overlay sidebar mobile */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Tutup sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#082B3A] text-white shadow-xl transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-white/15 px-6">
          <Link
            to="/admin"
            className="flex min-w-0 items-center gap-3"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FF5A0A] text-lg font-extrabold text-white shadow-lg shadow-orange-950/20">
              JMT
            </div>

            <div className="min-w-0">
              <p className="truncate text-base font-bold text-white">
                JMT Admin
              </p>

              <p className="mt-0.5 truncate text-xs text-slate-300">
                Content Management
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-300 transition hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Tutup sidebar"
          >
            <X size={21} />
          </button>
        </div>

        {/* Menu navigasi */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-4 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Main Menu
          </p>

          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={getNavLinkClass}
                >
                  <Icon
                    size={19}
                    strokeWidth={2}
                    className="shrink-0"
                  />

                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Informasi akun di sidebar */}
        <div className="border-t border-white/10 px-4 pt-4">
          <div className="rounded-xl bg-white/5 px-4 py-3">
            <p className="truncate text-sm font-semibold text-white">
              {displayName}
            </p>

            <p className="mt-1 truncate text-xs capitalize text-slate-300">
              {roleLabel}
            </p>
          </div>
        </div>

        {/* Menu bawah */}
        <div className="p-4">
          <Link
            to="/"
            target="_blank"
            rel="noreferrer"
            className="mb-2 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white"
          >
            <ExternalLink
              size={19}
              strokeWidth={2}
              className="shrink-0"
            />

            <span>Lihat Website</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-300 transition hover:bg-red-500/15 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoggingOut ? (
              <LoaderCircle
                size={19}
                className="shrink-0 animate-spin"
              />
            ) : (
              <LogOut
                size={19}
                strokeWidth={2}
                className="shrink-0"
              />
            )}

            <span>
              {isLoggingOut
                ? "Sedang keluar..."
                : "Logout"}
            </span>
          </button>

          {logoutError && (
            <p className="mt-2 px-4 text-xs leading-5 text-red-300">
              {logoutError}
            </p>
          )}
        </div>
      </aside>

      {/* Bagian kanan dashboard */}
      <div className="min-w-0 flex-1">
        {/* Header dashboard */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur md:px-8">
          <div className="flex min-w-0 items-center gap-4">
            {/* Tombol sidebar mobile */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="shrink-0 rounded-xl border border-slate-200 p-2.5 text-[#082B3A] transition hover:border-[#FF5A0A] hover:text-[#FF5A0A] lg:hidden"
              aria-label="Buka sidebar"
            >
              <Menu size={21} />
            </button>

            {/* Judul header */}
            <div className="min-w-0">
              <p className="truncate text-xs font-bold uppercase tracking-wider text-[#FF5A0A]">
                Jasa Medika Transmedic
              </p>

              <h1 className="mt-1 truncate text-lg font-bold text-[#082B3A]">
                Admin Dashboard
              </h1>
            </div>
          </div>

          {/* Profil user yang sedang login */}
          <div className="hidden items-center gap-3 sm:flex">
            <div className="max-w-[220px] text-right">
              <p className="truncate text-sm font-semibold text-[#082B3A]">
                {displayName}
              </p>

              <p className="truncate text-xs text-slate-500">
                {roleLabel}
              </p>
            </div>

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FFF0E8] font-bold text-[#FF5A0A]">
              {avatarInitial}
            </div>
          </div>
        </header>

        {/* Halaman melalui Outlet */}
        <div className="min-h-[calc(100vh-5rem)]">
          <Outlet />
        </div>
      </div>
    </div>
  );
}