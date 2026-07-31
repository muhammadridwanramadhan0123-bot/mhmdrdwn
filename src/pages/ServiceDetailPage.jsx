import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  MessageCircle,
} from "lucide-react";
import { CTA } from "../components/Common";
import { supabase } from "../lib/supabase";

export default function ServiceDetailPage() {
  const { slug } = useParams();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadService() {
      setLoading(true);
      setErrorMessage("");

      try {
        const { data, error } = await supabase
          .from("services")
          .select("*")
          .eq("slug", slug)
          .eq("status", "published")
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (isMounted) {
          setService(data);
        }
      } catch (error) {
        console.error("Supabase service detail error:", error);

        if (isMounted) {
          setErrorMessage(
            "Detail layanan gagal dimuat. Silakan coba kembali."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (slug) {
      loadService();
    } else {
      setLoading(false);
      setService(null);
    }

    return () => {
      isMounted = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!service) return;

    document.title = `${service.title} | JMT Group`;

    return () => {
      document.title = "JMT Group";
    };
  }, [service]);

  function getServiceItems() {
    if (!service?.items) return [];

    if (Array.isArray(service.items)) {
      return service.items;
    }

    if (typeof service.items === "string") {
      return service.items
        .split(/\r?\n|,/)
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [];
  }

  const serviceItems = getServiceItems();

  if (loading) {
    return (
      <main className="container-jmt min-h-[60vh] py-20">
        <div className="mx-auto max-w-4xl animate-pulse">
          <div className="h-4 w-40 rounded bg-slate-200" />
          <div className="mt-8 h-10 w-3/4 rounded bg-slate-200" />
          <div className="mt-5 h-5 w-full rounded bg-slate-100" />
          <div className="mt-3 h-5 w-2/3 rounded bg-slate-100" />
          <div className="mt-10 h-80 rounded-3xl bg-slate-200" />
        </div>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="container-jmt min-h-[60vh] py-20">
        <div className="mx-auto max-w-xl rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
          <h1 className="text-xl font-bold text-red-800">
            Terjadi kesalahan
          </h1>

          <p className="mt-3 text-sm leading-6 text-red-700">
            {errorMessage}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-lg bg-red-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-800"
          >
            Coba Lagi
          </button>
        </div>
      </main>
    );
  }

  if (!service) {
    return (
      <main className="container-jmt min-h-[60vh] py-20">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-orange">
            404
          </p>

          <h1 className="mt-3 text-3xl font-bold text-slate-900">
            Layanan tidak ditemukan
          </h1>

          <p className="mt-4 leading-7 text-slate-600">
            Layanan yang Anda cari mungkin belum dipublikasikan, sudah
            dipindahkan, atau alamatnya tidak tepat.
          </p>

          <Link
            to="/services"
            className="mt-7 inline-flex items-center gap-2 rounded-lg bg-orange px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <ArrowLeft size={18} />
            Kembali ke Layanan
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
      <main>
        <section className="border-b bg-gradient-to-br from-white via-cream/40 to-mist">
          <div className="container-jmt py-14 md:py-20">
            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center gap-2 text-sm text-slate-500"
            >
              <Link to="/" className="transition hover:text-orange">
                Beranda
              </Link>

              <span>/</span>

              <Link
                to="/services"
                className="transition hover:text-orange"
              >
                Layanan
              </Link>

              <span>/</span>

              <span className="font-medium text-slate-800">
                {service.title}
              </span>
            </nav>

            <div className="mt-10 grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange">
                  {service.category || "Product & Services"}
                </p>

                <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
                  {service.title}
                </h1>

                {service.short_description && (
                  <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
                    {service.short_description}
                  </p>
                )}

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 rounded-lg bg-orange px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                  >
                    Konsultasikan Kebutuhan
                    <ArrowRight size={18} />
                  </Link>

                  <Link
                    to="/services"
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-orange hover:text-orange"
                  >
                    <ArrowLeft size={18} />
                    Semua Layanan
                  </Link>
                </div>
              </div>

              <div>
                {service.image_url ? (
                  <img
                    src={service.image_url}
                    alt={service.title}
                    className="h-72 w-full rounded-3xl object-cover shadow-soft md:h-96"
                  />
                ) : (
                  <div className="flex h-72 items-center justify-center rounded-3xl bg-white p-8 text-center shadow-soft md:h-96">
                    <div>
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cream text-orange">
                        <CheckCircle2 size={32} />
                      </div>

                      <p className="mt-5 font-semibold text-slate-800">
                        Integrated Healthcare Solution
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Solusi profesional yang disesuaikan dengan
                        kebutuhan organisasi Anda.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="container-jmt py-14 md:py-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
            <article>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-orange">
                Tentang Layanan
              </p>

              <h2 className="mt-3 text-3xl font-bold text-slate-900">
                Solusi yang sesuai dengan kebutuhan Anda
              </h2>

              {service.description ? (
                <div className="mt-6 whitespace-pre-line text-base leading-8 text-slate-600">
                  {service.description}
                </div>
              ) : (
                <p className="mt-6 leading-8 text-slate-600">
                  Informasi lengkap mengenai layanan ini akan segera
                  tersedia. Silakan hubungi tim kami untuk memperoleh
                  penjelasan dan konsultasi lebih lanjut.
                </p>
              )}

              {serviceItems.length > 0 && (
                <div className="mt-10">
                  <h2 className="text-2xl font-bold text-slate-900">
                    Cakupan Layanan
                  </h2>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {serviceItems.map((item, index) => (
                      <div
                        key={`${item}-${index}`}
                        className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4"
                      >
                        <CheckCircle2
                          size={20}
                          className="mt-0.5 shrink-0 text-orange"
                        />

                        <span className="text-sm leading-6 text-slate-600">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </article>

            <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-soft lg:sticky lg:top-28">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cream text-orange">
                <MessageCircle size={25} />
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-900">
                Butuh informasi lebih lanjut?
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                Diskusikan kebutuhan organisasi Anda bersama tim JMT
                Group.
              </p>

              <Link
                to="/contact"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-orange px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Hubungi Tim Kami
                <ArrowRight size={17} />
              </Link>

              <div className="mt-6 border-t border-slate-100 pt-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Kategori
                </p>

                <p className="mt-2 text-sm font-semibold text-slate-700">
                  {service.category || "Healthcare Service"}
                </p>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <CTA />
    </>
  );
}