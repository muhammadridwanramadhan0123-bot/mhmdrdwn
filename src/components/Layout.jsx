import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { ArrowRight, Instagram, Linkedin, Mail, MapPin, Menu, Phone, X } from "lucide-react";

const nav = [
  ["Home", "/"],
  ["Product & Services", "/services"],
  ["Portfolio", "/portfolio"],
  ["Company", "/company"],
  ["Insight", "/insight"],
  ["Contact Us", "/contact"],
];

export default function Layout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="container-jmt flex h-20 items-center justify-between">
          <Link to="/" onClick={() => setOpen(false)} className="shrink-0">
            <img src="/logo.webp" alt="Jasa Medika Transmedic" className="h-11 w-auto" />
          </Link>
          <nav className="hidden items-center gap-7 lg:flex">
            {nav.map(([label, to]) => (
              <NavLink key={to} to={to} className={({ isActive }) => `text-[13px] font-medium transition hover:text-orange ${isActive ? "text-orange" : "text-ink"}`}>
                {label}
              </NavLink>
            ))}
          </nav>
          <Link to="/contact" className="btn-primary hidden lg:inline-flex">Contact Us <ArrowRight size={16} /></Link>
          <button className="rounded-lg p-2 text-ink lg:hidden" onClick={() => setOpen(!open)} aria-label="Buka menu">
            {open ? <X /> : <Menu />}
          </button>
        </div>
        {open && (
          <div className="border-t bg-white px-5 py-5 lg:hidden">
            <nav className="container-jmt flex flex-col gap-1 px-0">
              {nav.map(([label, to]) => (
                <Link key={to} to={to} onClick={() => setOpen(false)} className={`rounded-lg px-4 py-3 text-sm font-medium ${pathname === to ? "bg-cream text-orange" : "text-ink"}`}>
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      <main><Outlet /></main>

      <footer className="bg-ink text-white">
        <div className="container-jmt grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <img src="/logo.webp" alt="JMT" className="mb-5 h-12 rounded bg-white px-3 py-2" />
            <p className="max-w-lg text-sm leading-7 text-slate-300">Mitra strategis transformasi digital dan pengelolaan layanan kesehatan terintegrasi di Indonesia.</p>
            <div className="mt-6 flex gap-3">
              {[Instagram, Linkedin].map((Icon, i) => <a key={i} href="#" className="rounded-lg border border-white/15 p-2.5 hover:border-orange hover:text-orange"><Icon size={18} /></a>)}
            </div>
          </div>
          <div>
            <h3 className="mb-4 font-semibold">Quick Links</h3>
            <div className="space-y-3 text-sm text-slate-300">
              {nav.slice(1).map(([label, to]) => <Link key={to} to={to} className="block hover:text-orange">{label}</Link>)}
            </div>
          </div>
          <div>
            <h3 className="mb-4 font-semibold">Contact</h3>
            <div className="space-y-4 text-sm text-slate-300">
              <p className="flex gap-3"><MapPin size={18} className="mt-1 shrink-0 text-orange" />Gedung Paramarta Tridharma, Jl. Cikutra Baru Raya No. 28, Bandung 40124</p>
              <p className="flex items-center gap-3"><Phone size={18} className="text-orange" />+62 878 7000 7781</p>
              <p className="flex items-center gap-3"><Mail size={18} className="text-orange" />info@jasamedikatransmedic.com</p>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 py-5 text-center text-xs text-slate-400">© {new Date().getFullYear()} PT Jasa Medika Transmedic. All rights reserved.</div>
      </footer>
    </div>
  );
}
