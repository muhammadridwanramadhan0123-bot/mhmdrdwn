import { useState } from "react";
import { CheckCircle2, Mail, MapPin, Phone } from "lucide-react";
import { PageHero } from "../components/Common";
import { supabase } from "../lib/supabase";

export default function ContactPage() {
const [sent, setSent] = useState(false);
const [errorMessage, setErrorMessage] = useState("");
const [loading, setLoading] = useState(false);

const submit = async (e) => {
  e.preventDefault();

  if (loading) return;

  const formElement = e.currentTarget;
  const formData = new FormData(formElement);

  const name = formData.get("name")?.trim();
  const company = formData.get("company")?.trim();
  const email = formData.get("email")?.trim();
  const phone = formData.get("phone")?.trim();
  const service = formData.get("service");
  const message = formData.get("message")?.trim();

  setSent(false);
  setErrorMessage("");

  if (!name || name.length < 3) {
    setErrorMessage("Nama minimal 3 karakter.");
    return;
  }

  if (!email) {
    setErrorMessage("Email wajib diisi.");
    return;
  }

  if (!phone || phone.length < 9) {
    setErrorMessage("Nomor telepon minimal 9 karakter.");
    return;
  }

  if (!message || message.length < 10) {
    setErrorMessage("Keterangan minimal 10 karakter.");
    return;
  }

  setLoading(true);

  const { error } = await supabase
    .from("contact_messages")
    .insert([
      {
        name,
        company,
        email,
        phone,
        service,
        message,
      },
    ]);

  if (error) {
    console.error("Supabase error:", error);
    setErrorMessage(`Pesan gagal dikirim: ${error.message}`);
    setLoading(false);
    return;
  }

  setSent(true);
  formElement.reset();
  setLoading(false);
};
  return (
    <>
      <PageHero eyebrow="Contact Us" title="Let’s Build Better Healthcare Together" description="Ceritakan kebutuhan fasilitas kesehatan atau organisasi Anda. Tim kami siap membantu menemukan solusi yang tepat." />
      <section className="container-jmt grid gap-10 py-16 lg:grid-cols-[.85fr_1.15fr]">
        <div>
          <h2 className="text-2xl font-bold">Hubungi JMT Group</h2><p className="mt-4 text-sm leading-7 text-slate-600">Kami terbuka untuk konsultasi solusi, partnership, implementasi, maupun informasi produk dan layanan.</p>
          <div className="mt-8 space-y-4">
            {[[MapPin, "Office", "Gedung Paramarta Tridharma, Jl. Cikutra Baru Raya No. 28, Bandung 40124"], [Phone, "Phone", "+62 878 7000 7781"], [Mail, "Email", "info@jasamedikatransmedic.com"]].map(([Icon, label, value]) => <div key={label} className="flex gap-4 rounded-2xl bg-mist p-5"><div className="h-fit rounded-xl bg-white p-3 text-orange"><Icon size={21} /></div><div><p className="text-xs font-semibold text-slate-400">{label}</p><p className="mt-1 text-sm font-medium leading-6">{value}</p></div></div>)}
          </div>
        </div>
        <div className="card p-6 md:p-9">
          <h2 className="text-2xl font-bold">Request a Consultation</h2><p className="mt-2 text-sm text-slate-500">Isi form berikut dan tim kami akan menghubungi Anda.</p>
          {sent && (
  <div className="mt-5 flex items-center gap-3 rounded-xl bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
    <CheckCircle2 size={20} />
    Pesan berhasil dikirim. Tim kami akan segera menghubungi Anda.
  </div>
)}

{errorMessage && (
  <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">
    {errorMessage}
  </div>
)}
          <form onSubmit={submit} className="mt-7 grid gap-5 sm:grid-cols-2">
            {[["Nama Lengkap", "name", "text"], ["Faskes / Perusahaan", "company", "text"], ["Email", "email", "email"], ["Telp / WhatsApp", "phone", "tel"]].map(([label, name, type]) => <label key={name} className="text-xs font-semibold">{label}<input name={name} type={type} required className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm font-normal outline-none focus:border-orange" /></label>)}
            <label className="text-xs font-semibold sm:col-span-2">Layanan yang Dibutuhkan<select name="service" className="mt-2 w-full rounded-lg border border-slate-200 px-4 py-3 text-sm font-normal outline-none focus:border-orange"><option>Healthcare Information System</option><option>Clinical & Patient Care</option><option>Hospital Operations</option><option>Healthcare Consulting</option><option>Infrastructure & Managed Services</option><option>Training & Talent Development</option></select></label>
            <label className="text-xs font-semibold sm:col-span-2">Keterangan<textarea name="message" rows="5" required className="mt-2 w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-sm font-normal outline-none focus:border-orange" /></label>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary sm:col-span-2 disabled:cursor-not-allowed disabled:opacity-60">
             {loading ? "Mengirim..." : "Submit Consultation"}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
