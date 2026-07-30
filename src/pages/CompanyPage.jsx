import { Award, CheckCircle2, Globe2, Handshake, ShieldCheck, Sparkles, Target } from "lucide-react";
import { CTA, PageHero, SectionHeading } from "../components/Common";

const reasons = [
  [ShieldCheck, "Healthcare Expertise", "Pengalaman panjang dalam membangun solusi teknologi untuk industri kesehatan."],
  [Sparkles, "Integrated Innovation", "Solusi lintas teknologi, operasional, infrastruktur, konsultasi, dan talenta."],
  [Handshake, "Strategic Partnership", "Pendampingan jangka panjang yang fokus pada kebutuhan dan hasil nyata."],
];

export default function CompanyPage() {
  return (
    <>
      <PageHero eyebrow="Company" title="Building the Future of Integrated Healthcare" description="JMT Group menghadirkan solusi terintegrasi untuk mendorong layanan kesehatan Indonesia yang modern, efisien, dan berkelanjutan." />
      <section className="container-jmt grid gap-12 py-20 lg:grid-cols-2 lg:items-center">
        <div className="rounded-3xl bg-gradient-to-br from-ink to-teal p-10 text-white"><Globe2 size={62} className="text-orange" /><p className="mt-20 text-3xl font-bold leading-tight">More than technology. We build a connected healthcare ecosystem.</p></div>
        <div><SectionHeading kicker="About Us" title="Mitra strategis transformasi fasilitas kesehatan" /><p className="mt-6 text-sm leading-7 text-slate-600">Jasa Medika Transmedic Group adalah penyedia solusi menyeluruh untuk manajemen rumah sakit dan layanan kesehatan. Didukung pengalaman lebih dari dua dekade, JMT membantu rumah sakit, klinik, dan fasilitas kesehatan meningkatkan mutu layanan serta keberlanjutan operasional.</p><p className="mt-4 text-sm leading-7 text-slate-600">Ekosistem bisnis JMT mencakup healthcare technology, professional services, infrastructure, education, healthcare operations, dan wellness.</p></div>
      </section>
      <section className="bg-mist py-20"><div className="container-jmt grid gap-6 md:grid-cols-2"><article className="card p-8"><Target className="text-orange" size={38} /><h2 className="mt-6 text-2xl font-bold">Vision</h2><p className="mt-3 text-sm leading-7 text-slate-600">Menjadi mitra terdepan dalam membangun ekosistem layanan kesehatan yang terintegrasi, modern, dan berkelanjutan.</p></article><article className="card p-8"><CheckCircle2 className="text-orange" size={38} /><h2 className="mt-6 text-2xl font-bold">Mission</h2><p className="mt-3 text-sm leading-7 text-slate-600">Menghadirkan teknologi yang andal, layanan profesional, serta kolaborasi strategis yang meningkatkan efisiensi dan kualitas layanan kesehatan.</p></article></div></section>
      <section className="container-jmt py-20"><SectionHeading kicker="Why JMT" title="Pengalaman, inovasi, dan kolaborasi" center /><div className="mt-12 grid gap-6 md:grid-cols-3">{reasons.map(([Icon, title, body]) => <article key={title} className="card p-8 text-center"><Icon size={38} className="mx-auto text-orange" /><h3 className="mt-5 font-semibold">{title}</h3><p className="mt-3 text-sm leading-7 text-slate-500">{body}</p></article>)}</div></section>
      <section className="bg-ink py-20 text-white"><div className="container-jmt"><SectionHeading kicker="Certifications & Recognition" title="Standar yang membangun kepercayaan" description="Komitmen terhadap keamanan, kepatuhan, dan kualitas layanan." /><div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-5">{["ISO", "Hak Cipta", "PSE", "BSSN", "Awards"].map((x) => <div key={x} className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center"><Award className="mx-auto text-orange" /><p className="mt-3 text-sm font-semibold">{x}</p></div>)}</div></div></section>
      <CTA />
    </>
  );
}
