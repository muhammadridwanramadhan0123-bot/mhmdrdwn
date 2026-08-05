import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
} from "react-router-dom";
import {
  ArrowRight,
  ChevronDown,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Menu,
  Phone,
  X,
  Youtube,
} from "lucide-react";

import WhatsAppFloatingButton from "./WhatsAppFloatingButton";

const nav = [
  ["Home", "/"],
  ["Product & Services", "/services"],
  ["Portfolio", "/portfolio"],
  ["Company", "/company"],
  ["Insight", "/insight"],
  ["Contact Us", "/contact"],
];

const companyNavigation = [
  {
    label: "About Us",
    to: "/company/about-us",
    description: "Profil dan visi perusahaan",
  },
  {
    label: "Milestone",
    to: "/company/milestone",
    description: "Perjalanan dan pencapaian JMT",
  },
  {
    label: "Partners",
    to: "/company/partners",
    description: "Partner strategis perusahaan",
  },
  {
    label: "Location",
    to: "/company/location",
    description: "Alamat dan lokasi perusahaan",
  },
  {
    label: "Career",
    to: "/company/career",
    description: "Kesempatan bergabung bersama JMT",
  },
];

const socialMediaLinks = [
  {
    label: "Instagram",
    url: "https://www.instagram.com/jmtgroup.id/",
    icon: Instagram,
  },
  {
    label: "LinkedIn",
    url: "https://www.linkedin.com/company/jmtgroupid/",
    icon: Linkedin,
  },
  {
    label: "YouTube",
    url: "https://www.youtube.com/@jmtgroupid",
    icon: Youtube,
  },
];

export default function Layout() {
  const [open, setOpen] = useState(false);

  const [
    desktopCompanyOpen,
    setDesktopCompanyOpen,
  ] = useState(false);

  const [
    mobileCompanyOpen,
    setMobileCompanyOpen,
  ] = useState(false);

  const companyDropdownRef = useRef(null);

  const { pathname } = useLocation();

  const isCompanyActive =
    pathname.startsWith("/company");

  /*
   * Tutup semua menu ketika pengguna
   * berpindah halaman.
   */
  useEffect(() => {
    setOpen(false);
    setDesktopCompanyOpen(false);
    setMobileCompanyOpen(false);
  }, [pathname]);

  /*
   * Tutup dropdown desktop ketika pengguna:
   * 1. Klik di luar dropdown.
   * 2. Menekan tombol Escape.
   */
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        companyDropdownRef.current &&
        !companyDropdownRef.current.contains(
          event.target
        )
      ) {
        setDesktopCompanyOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setDesktopCompanyOpen(false);
        setMobileCompanyOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  function closeMobileMenu() {
    setOpen(false);
    setMobileCompanyOpen(false);
  }

  function toggleMobileMenu() {
    const nextOpen = !open;

    setOpen(nextOpen);

    if (!nextOpen) {
      setMobileCompanyOpen(false);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="container-jmt flex h-20 items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            onClick={closeMobileMenu}
            className="shrink-0"
          >
            <img
              src="/logo.webp"
              alt="Jasa Medika Transmedic"
              className="h-11 w-auto"
            />
          </Link>

          {/* Navbar desktop */}
          <nav className="hidden items-center gap-7 lg:flex">
            {nav.map(([label, to]) => {
              /*
               * Menu Company dibuat berbeda
               * karena memiliki dropdown.
               */
              if (label === "Company") {
                return (
                  <div
                    key={to}
                    ref={companyDropdownRef}
                    className="relative"
                    onMouseEnter={() =>
                      setDesktopCompanyOpen(true)
                    }
                    onMouseLeave={() =>
                      setDesktopCompanyOpen(false)
                    }
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setDesktopCompanyOpen(
                          (currentValue) =>
                            !currentValue
                        )
                      }
                      className={`inline-flex items-center gap-1.5 text-[13px] font-medium transition hover:text-orange ${
                        isCompanyActive
                          ? "text-orange"
                          : "text-ink"
                      }`}
                      aria-haspopup="menu"
                      aria-expanded={
                        desktopCompanyOpen
                      }
                    >
                      Company

                      <ChevronDown
                        size={15}
                        className={`transition-transform duration-200 ${
                          desktopCompanyOpen
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </button>

                    {desktopCompanyOpen && (
                      <div
                        className="absolute left-1/2 top-full z-50 w-72 -translate-x-1/2 pt-5"
                        role="menu"
                      >
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-900/10">
                          <div className="border-b border-slate-100 px-4 py-3">
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange">
                              Company
                            </p>

                            <p className="mt-1 text-xs leading-5 text-slate-400">
                              Informasi tentang Jasa
                              Medika Transmedic
                            </p>
                          </div>

                          <div className="mt-2 space-y-1">
                            {companyNavigation.map(
                              (item) => {
                                const isActive =
                                  pathname === item.to;

                                return (
                                  <Link
                                    key={item.to}
                                    to={item.to}
                                    role="menuitem"
                                    onClick={() =>
                                      setDesktopCompanyOpen(
                                        false
                                      )
                                    }
                                    className={`group block rounded-xl px-4 py-3 transition ${
                                      isActive
                                        ? "bg-cream"
                                        : "hover:bg-slate-50"
                                    }`}
                                  >
                                    <div className="flex items-center justify-between gap-3">
                                      <div className="min-w-0">
                                        <p
                                          className={`text-sm font-semibold ${
                                            isActive
                                              ? "text-orange"
                                              : "text-ink group-hover:text-orange"
                                          }`}
                                        >
                                          {
                                            item.label
                                          }
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-slate-400">
                                          {
                                            item.description
                                          }
                                        </p>
                                      </div>

                                      <ArrowRight
                                        size={15}
                                        className={`shrink-0 transition-transform group-hover:translate-x-1 ${
                                          isActive
                                            ? "text-orange"
                                            : "text-slate-300 group-hover:text-orange"
                                        }`}
                                      />
                                    </div>
                                  </Link>
                                );
                              }
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              /*
               * Menu selain Company tetap
               * menggunakan NavLink seperti sebelumnya.
               */
              return (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `text-[13px] font-medium transition hover:text-orange ${
                      isActive
                        ? "text-orange"
                        : "text-ink"
                    }`
                  }
                >
                  {label}
                </NavLink>
              );
            })}
          </nav>

          {/* Tombol Contact Us desktop */}
          <Link
            to="/contact"
            className="btn-primary hidden lg:inline-flex"
          >
            Contact Us
            <ArrowRight size={16} />
          </Link>

          {/* Tombol menu mobile */}
          <button
            type="button"
            className="rounded-lg p-2 text-ink lg:hidden"
            onClick={toggleMobileMenu}
            aria-label={
              open
                ? "Tutup menu"
                : "Buka menu"
            }
            aria-expanded={open}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>

        {/* Navbar mobile */}
        {open && (
          <div className="border-t border-slate-100 bg-white px-5 py-5 shadow-lg lg:hidden">
            <nav className="container-jmt flex flex-col gap-1 px-0">
              {nav.map(([label, to]) => {
                /*
                 * Dropdown Company mobile.
                 */
                if (label === "Company") {
                  return (
                    <div key={to}>
                      <button
                        type="button"
                        onClick={() =>
                          setMobileCompanyOpen(
                            (currentValue) =>
                              !currentValue
                          )
                        }
                        className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm font-medium transition ${
                          isCompanyActive
                            ? "bg-cream text-orange"
                            : "text-ink hover:bg-slate-50"
                        }`}
                        aria-expanded={
                          mobileCompanyOpen
                        }
                      >
                        <span>Company</span>

                        <ChevronDown
                          size={17}
                          className={`transition-transform duration-200 ${
                            mobileCompanyOpen
                              ? "rotate-180"
                              : ""
                          }`}
                        />
                      </button>

                      {mobileCompanyOpen && (
                        <div className="ml-4 mt-1 space-y-1 border-l-2 border-orange/20 pl-3">
                          {companyNavigation.map(
                            (item) => {
                              const isActive =
                                pathname === item.to;

                              return (
                                <Link
                                  key={item.to}
                                  to={item.to}
                                  onClick={
                                    closeMobileMenu
                                  }
                                  className={`block rounded-lg px-4 py-3 text-sm transition ${
                                    isActive
                                      ? "bg-cream font-semibold text-orange"
                                      : "text-slate-600 hover:bg-slate-50 hover:text-orange"
                                  }`}
                                >
                                  {item.label}
                                </Link>
                              );
                            }
                          )}
                        </div>
                      )}
                    </div>
                  );
                }

                /*
                 * Menu mobile selain Company.
                 */
                return (
                  <Link
                    key={to}
                    to={to}
                    onClick={closeMobileMenu}
                    className={`rounded-lg px-4 py-3 text-sm font-medium transition ${
                      pathname === to
                        ? "bg-cream text-orange"
                        : "text-ink hover:bg-slate-50"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      <main>
        <Outlet />
      </main>

      {/* Footer tidak diubah */}
      <footer className="bg-ink text-white">
        <div className="container-jmt grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <img
              src="/logo.webp"
              alt="JMT"
              className="mb-5 h-12 rounded bg-white px-3 py-2"
            />

            <p className="max-w-lg text-sm leading-7 text-slate-300">
              Mitra strategis transformasi digital
              dan pengelolaan layanan kesehatan
              terintegrasi di Indonesia.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
  {socialMediaLinks.map((item) => {
    const Icon = item.icon;

    return (
      <a
        key={item.label}
        href={item.url}
        target="_blank"
        rel="noreferrer"
        aria-label={`Kunjungi ${item.label} Jasa Medika Transmedic`}
        title={item.label}
        className="group flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-slate-300 transition duration-300 hover:-translate-y-1 hover:border-orange hover:bg-orange hover:text-white"
      >
        <Icon
          size={19}
          className="transition-transform duration-300 group-hover:scale-110"
        />
      </a>
    );
  })}
</div>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">
              Quick Links
            </h3>

            <div className="space-y-3 text-sm text-slate-300">
              {nav
                .slice(1)
                .map(([label, to]) => (
                  <Link
                    key={to}
                    to={to}
                    className="block hover:text-orange"
                  >
                    {label}
                  </Link>
                ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-semibold">
              Contact
            </h3>

            <div className="space-y-4 text-sm text-slate-300">
              <p className="flex gap-3">
                <MapPin
                  size={18}
                  className="mt-1 shrink-0 text-orange"
                />

                Gedung Paramarta Tridharma, Jl.
                Cikutra Baru Raya No. 28, Bandung
                40124
              </p>

              <p className="flex items-center gap-3">
                <Phone
                  size={18}
                  className="text-orange"
                />

                +62 878 7000 7781
              </p>

              <p className="flex items-center gap-3">
                <Mail
                  size={18}
                  className="text-orange"
                />

                info@jasamedikatransmedic.com
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 py-5 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} PT Jasa
          Medika Transmedic. All rights reserved.
        </div>
      </footer>
      <WhatsAppFloatingButton />
    </div>
  );
}