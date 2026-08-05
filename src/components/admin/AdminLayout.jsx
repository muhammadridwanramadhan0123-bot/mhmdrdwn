import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  BriefcaseBusiness,
  Building2,
  ExternalLink,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Menu,
  Newspaper,
  PanelLeftClose,
  PanelLeftOpen,
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

const navigationGroups = [
  {
    label: "Overview",
    items: [
      {
        label: "Dashboard",
        description: "Ringkasan seluruh konten",
        to: "/admin",
        icon: LayoutDashboard,
        end: true,
      },
    ],
  },
  {
    label: "Content Management",
    items: [
      {
        label: "Services",
        description: "Produk dan layanan",
        to: "/admin/services",
        icon: Stethoscope,
        end: false,
      },
      {
        label: "Portfolio",
        description: "Project dan implementasi",
        to: "/admin/portfolio",
        icon: BriefcaseBusiness,
        end: false,
      },
      {
        label: "Insight",
        description: "Artikel dan berita",
        to: "/admin/insight",
        icon: Newspaper,
        end: false,
      },
      {
        label: "Company",
        description: "Profil dan informasi perusahaan",
        to: "/admin/company",
        icon: Building2,
        end: false,
      },
    ],
  },
];

function getRoleLabel(role) {
  switch (role) {
    case "admin":
      return "Administrator";

    case "editor":
      return "Content Editor";

    case "viewer":
      return "Viewer";

    default:
      return "Content Manager";
  }
}

function getCurrentPage(pathname) {
  if (pathname === "/admin") {
    return {
      eyebrow: "Overview",
      title: "Dashboard",
      description:
        "Ringkasan aktivitas dan performa konten website.",
    };
  }

  if (pathname.startsWith("/admin/services")) {
    return {
      eyebrow: "Content Management",
      title: "Services",
      description:
        "Kelola produk dan layanan Jasa Medika Transmedic.",
    };
  }

  if (pathname.startsWith("/admin/portfolio")) {
    return {
      eyebrow: "Content Management",
      title: "Portfolio",
      description:
        "Kelola project, implementasi, dan portfolio perusahaan.",
    };
  }

  if (pathname.startsWith("/admin/insight")) {
    return {
      eyebrow: "Content Management",
      title: "Insight",
      description:
        "Kelola artikel, berita, dan insight perusahaan.",
    };
  }

  if (pathname.startsWith("/admin/company")) {
    return {
      eyebrow: "Company Management",
      title: "Company",
      description:
        "Kelola profil dan informasi perusahaan.",
    };
  }

  return {
    eyebrow: "Administration",
    title: "JMT Admin",
    description:
      "Content Management System Jasa Medika Transmedic.",
  };
}

function getNavClass(isActive) {
  const baseClass =
    "group relative flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition-all duration-200";

  const activeClass =
    "bg-white text-[#082B3A] shadow-[0_12px_30px_rgba(0,0,0,0.18)]";

  const inactiveClass =
    "text-slate-300 hover:bg-white/[0.08] hover:text-white";

  return `${baseClass} ${
    isActive ? activeClass : inactiveClass
  }`;
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [
    sidebarCollapsed,
    setSidebarCollapsed,
  ] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return (
      window.localStorage.getItem(
        "jmt_admin_sidebar_collapsed"
      ) === "true"
    );
  });

  const [
    isLoggingOut,
    setIsLoggingOut,
  ] = useState(false);

  const [
    logoutError,
    setLogoutError,
  ] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  const {
    user,
    profile,
    role,
    signOut,
  } = useAdminAuth();

  const displayName =
    profile?.full_name ||
    profile?.name ||
    user?.user_metadata?.full_name ||
    user?.email ||
    "Pengguna";

  const email =
    profile?.email ||
    user?.email ||
    "";

  const roleLabel = getRoleLabel(role);

  const avatarInitial = useMemo(() => {
    return (
      String(displayName)
        .trim()
        .charAt(0)
        .toUpperCase() || "U"
    );
  }, [displayName]);

  const currentPage = useMemo(
    () =>
      getCurrentPage(
        location.pathname
      ),
    [location.pathname]
  );

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    window.localStorage.setItem(
      "jmt_admin_sidebar_collapsed",
      String(sidebarCollapsed)
    );
  }, [sidebarCollapsed]);

  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    try {
      setIsLoggingOut(true);
      setLogoutError("");

      await signOut();

      navigate("/admin/login", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Logout gagal:",
        error
      );

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
    <div className="min-h-screen bg-[#F3F6FA] lg:flex">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Tutup sidebar"
          onClick={() =>
            setSidebarOpen(false)
          }
          className="fixed inset-0 z-40 bg-slate-950/55 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[292px] flex-col overflow-hidden border-r border-white/10 bg-[#071F2A] text-white shadow-2xl transition-all duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        } ${
          sidebarCollapsed
            ? "lg:w-[96px]"
            : "lg:w-[292px]"
        }`}
      >
        {/* Dekorasi sidebar */}
        <div className="pointer-events-none absolute -left-24 top-24 h-56 w-56 rounded-full bg-[#FF5A0A]/10 blur-3xl" />

        <div className="pointer-events-none absolute -right-28 bottom-16 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

        {/* Brand */}
        <div className="relative border-b border-white/10 px-4 py-5">
          <div className="flex items-center justify-between gap-3">
            <Link
              to="/admin"
              className="flex min-w-0 items-center gap-3"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-lg">
                <img
                  src="/logo.webp"
                  alt="Jasa Medika Transmedic"
                  className="h-9 w-9 object-contain"
                />
              </div>

              <div
                className={`min-w-0 ${
                  sidebarCollapsed
                    ? "lg:hidden"
                    : ""
                }`}
              >
                <p className="truncate text-base font-bold text-white">
                  JMT Admin
                </p>

                <p className="mt-0.5 truncate text-[11px] font-medium uppercase tracking-[0.12em] text-white/45">
                  Management System
                </p>
              </div>
            </Link>

            <button
              type="button"
              onClick={() =>
                setSidebarOpen(false)
              }
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white/60 transition hover:bg-white/10 hover:text-white lg:hidden"
              aria-label="Tutup sidebar"
            >
              <X size={20} />
            </button>

            {!sidebarCollapsed && (
              <button
                type="button"
                onClick={() =>
                  setSidebarCollapsed(true)
                }
                className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white/45 transition hover:bg-white/10 hover:text-white lg:flex"
                aria-label="Perkecil sidebar"
              >
                <PanelLeftClose
                  size={19}
                />
              </button>
            )}

            {sidebarCollapsed && (
              <button
                type="button"
                onClick={() =>
                  setSidebarCollapsed(false)
                }
                className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white/45 transition hover:bg-white/10 hover:text-white lg:flex"
                aria-label="Perbesar sidebar"
              >
                <PanelLeftOpen
                  size={19}
                />
              </button>
            )}
          </div>
        </div>

        {/* Informasi pengguna */}
        <div className="relative px-4 pt-5">
          <div
            className={`rounded-2xl border border-white/10 bg-white/[0.06] p-3 ${
              sidebarCollapsed
                ? "lg:flex lg:justify-center lg:p-2"
                : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF5A0A] to-[#FF8548] text-sm font-bold text-white shadow-lg shadow-orange-950/20">
                {avatarInitial}

                <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#071F2A] bg-emerald-400" />
              </div>

              <div
                className={`min-w-0 ${
                  sidebarCollapsed
                    ? "lg:hidden"
                    : ""
                }`}
              >
                <p className="truncate text-sm font-semibold text-white">
                  {displayName}
                </p>

                <p className="mt-0.5 truncate text-xs text-white/45">
                  {roleLabel}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigasi */}
        <div className="relative flex-1 overflow-y-auto px-4 py-6">
          <nav className="space-y-7">
            {navigationGroups.map(
              (group) => (
                <div key={group.label}>
                  <p
                    className={`mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 ${
                      sidebarCollapsed
                        ? "lg:hidden"
                        : ""
                    }`}
                  >
                    {group.label}
                  </p>

                  <div className="space-y-1.5">
                    {group.items.map(
                      (item) => {
                        const Icon =
                          item.icon;

                        return (
                          <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            title={
                              sidebarCollapsed
                                ? item.label
                                : undefined
                            }
                            className={({
                              isActive,
                            }) =>
                              getNavClass(
                                isActive
                              )
                            }
                          >
                            {({
                              isActive,
                            }) => (
                              <>
                                <div
                                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
                                    isActive
                                      ? "bg-[#FF5A0A] text-white shadow-md shadow-orange-200"
                                      : "bg-white/[0.06] text-white/60 group-hover:bg-white/10 group-hover:text-white"
                                  }`}
                                >
                                  <Icon
                                    size={19}
                                    strokeWidth={
                                      2.1
                                    }
                                  />
                                </div>

                                <div
                                  className={`min-w-0 flex-1 ${
                                    sidebarCollapsed
                                      ? "lg:hidden"
                                      : ""
                                  }`}
                                >
                                  <p className="truncate">
                                    {item.label}
                                  </p>

                                  <p
                                    className={`mt-0.5 truncate text-[11px] font-normal ${
                                      isActive
                                        ? "text-slate-400"
                                        : "text-white/30 group-hover:text-white/45"
                                    }`}
                                  >
                                    {
                                      item.description
                                    }
                                  </p>
                                </div>

                                {isActive && (
                                  <span
                                    className={`h-2 w-2 shrink-0 rounded-full bg-[#FF5A0A] ${
                                      sidebarCollapsed
                                        ? "lg:hidden"
                                        : ""
                                    }`}
                                  />
                                )}
                              </>
                            )}
                          </NavLink>
                        );
                      }
                    )}
                  </div>
                </div>
              )
            )}
          </nav>
        </div>

        {/* Bottom sidebar */}
        <div className="relative border-t border-white/10 p-4">
          <Link
            to="/"
            target="_blank"
            rel="noreferrer"
            title={
              sidebarCollapsed
                ? "Lihat Website"
                : undefined
            }
            className="group mb-2 flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-white/60 transition hover:bg-white/[0.08] hover:text-white"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] transition group-hover:bg-white/10">
              <ExternalLink
                size={18}
              />
            </div>

            <span
              className={
                sidebarCollapsed
                  ? "lg:hidden"
                  : ""
              }
            >
              Lihat Website
            </span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            title={
              sidebarCollapsed
                ? "Logout"
                : undefined
            }
            className="group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-semibold text-red-300 transition hover:bg-red-500/10 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10">
              {isLoggingOut ? (
                <LoaderCircle
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <LogOut size={18} />
              )}
            </div>

            <span
              className={
                sidebarCollapsed
                  ? "lg:hidden"
                  : ""
              }
            >
              {isLoggingOut
                ? "Sedang keluar..."
                : "Logout"}
            </span>
          </button>

          {logoutError &&
            !sidebarCollapsed && (
              <p className="mt-2 px-3 text-xs leading-5 text-red-300">
                {logoutError}
              </p>
            )}
        </div>
      </aside>

      {/* Main area */}
      <div className="min-w-0 flex-1">
        {/* Header admin */}
        <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
          <div className="flex min-h-20 items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setSidebarOpen(true)
                }
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-[#082B3A] shadow-sm transition hover:border-orange-200 hover:text-[#FF5A0A] lg:hidden"
                aria-label="Buka sidebar"
              >
                <Menu size={20} />
              </button>

              <div className="min-w-0">
                <p className="truncate text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF5A0A] sm:text-xs">
                  {currentPage.eyebrow}
                </p>

                <div className="mt-1 flex min-w-0 items-center gap-3">
                  <h1 className="truncate text-xl font-bold tracking-tight text-[#082B3A] sm:text-2xl">
                    {currentPage.title}
                  </h1>

                  <span className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 md:inline-flex">
                    Online
                  </span>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <Link
                to="/"
                target="_blank"
                rel="noreferrer"
                className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-orange-200 hover:text-[#FF5A0A] md:inline-flex"
              >
                Preview Website
                <ExternalLink
                  size={15}
                />
              </Link>

              <div className="hidden h-10 w-px bg-slate-200 sm:block" />

              <div className="hidden min-w-0 text-right sm:block">
                <p className="max-w-40 truncate text-sm font-semibold text-[#082B3A]">
                  {displayName}
                </p>

                <p className="max-w-40 truncate text-xs text-slate-400">
                  {email || roleLabel}
                </p>
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF5A0A] to-[#FF8548] text-sm font-bold text-white shadow-lg shadow-orange-200">
                {avatarInitial}
              </div>
            </div>
          </div>
        </header>

        {/* Konten halaman */}
        <main className="min-h-[calc(100vh-5rem)] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-[1500px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}