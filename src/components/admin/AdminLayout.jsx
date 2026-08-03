import { useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  ExternalLink,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Mail,
  Menu,
  Newspaper,
  Stethoscope,
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
    end: false,
  },
  {
    label: "Insight",
    to: "/admin/insight",
    icon: Newspaper,
    end: false,
  },
  {
    label: "Services",
    to: "/admin/services",
    icon: Stethoscope,
    end: false,
  },
  {
  label: "Pesan Masuk",
  to: "/admin/messages",
  icon: Mail,
  end: false,
  },
];

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

function getNavLinkClass({ isActive }) {
  const baseClass =
    "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200";

  const activeClass =
    "bg-[#FF5A0A] text-white shadow-lg shadow-orange-500/20";

  const inactiveClass =
    "text-slate-300 hover:bg-white/8 hover:text-white";

  return `${baseClass} ${isActive ? activeClass : inactiveClass}`;
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  const { user, profile, role, signOut } = useAdminAuth();

  const displayName =
    profile?.full_name ||
    profile?.name ||
    user?.user_metadata?.full_name ||
    user?.email ||
    "Pengguna";

  const roleLabel = getRoleLabel(role);

  const avatarInitial = useMemo(() => {
    return String(displayName).trim().charAt(0).toUpperCase() || "U";
  }, [displayName]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

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
    <div className="min-h-screen bg-[#F4F7FB] lg:flex">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Tutup sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-[1px] lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[290px] flex-col border-r border-white/10 bg-[#082B3A] text-white transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="border-b border-white/10 px-6 pb-5 pt-6">
          <div className="flex items-start justify-between gap-3">
            <Link to="/admin" className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FF5A0A] text-lg font-extrabold text-white shadow-lg shadow-orange-950/20">
                JMT
              </div>

              <div className="min-w-0">
                <p className="truncate text-lg font-bold text-white">
                  JMT Admin
                </p>
                <p className="mt-0.5 truncate text-xs text-slate-300">
                  Content Management System
                </p>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="rounded-xl p-2 text-slate-300 transition hover:bg-white/10 hover:text-white lg:hidden"
              aria-label="Tutup sidebar"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Main Navigation
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
                  {({ isActive }) => (
                    <>
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
                          isActive
                            ? "bg-white/15 text-white"
                            : "bg-white/5 text-slate-300 group-hover:bg-white/10 group-hover:text-white"
                        }`}
                      >
                        <Icon size={18} strokeWidth={2.2} />
                      </div>

                      <span className="truncate">{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom action */}
        <div className="border-t border-white/10 p-4">
          <Link
            to="/"
            target="_blank"
            rel="noreferrer"
            className="mb-2 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
              <ExternalLink size={18} strokeWidth={2} />
            </div>
            <span>Lihat Website</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-red-300 transition hover:bg-red-500/10 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
              {isLoggingOut ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : (
                <LogOut size={18} strokeWidth={2} />
              )}
            </div>

            <span>
              {isLoggingOut ? "Sedang keluar..." : "Logout"}
            </span>
          </button>

          {logoutError && (
            <p className="mt-2 px-2 text-xs leading-5 text-red-300">
              {logoutError}
            </p>
          )}
        </div>
      </aside>

      {/* Main area */}
      <div className="min-w-0 flex-1">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
          <div className="flex h-20 items-center justify-between px-5 md:px-8">
            <div className="flex min-w-0 items-center gap-4">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="shrink-0 rounded-xl border border-slate-200 bg-white p-2.5 text-[#082B3A] transition hover:border-[#FF5A0A] hover:text-[#FF5A0A] lg:hidden"
                aria-label="Buka sidebar"
              >
                <Menu size={20} />
              </button>

              <div className="min-w-0">
                <p className="truncate text-xs font-bold uppercase tracking-[0.18em] text-[#FF5A0A]">
                  Jasa Medika Transmedic
                </p>
                <h1 className="mt-1 truncate text-2xl font-bold text-[#082B3A]">
                  Admin Dashboard
                </h1>
              </div>
            </div>

            <div className="hidden items-center gap-3 sm:flex">
              <div className="text-right">
                <p className="truncate text-sm font-semibold text-[#082B3A]">
                  {displayName}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {roleLabel}
                </p>
              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FFF0E8] font-bold text-[#FF5A0A] ring-1 ring-orange-100">
                {avatarInitial}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="min-h-[calc(100vh-5rem)] p-5 md:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}