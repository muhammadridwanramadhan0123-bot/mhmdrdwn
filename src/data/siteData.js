import {
  Activity, Ambulance, Boxes, BrainCircuit, Building2, Cable, GraduationCap,
  HardDrive, HeartPulse, Hospital, Laptop, Network, Server, ShieldCheck,
  Stethoscope, UsersRound, Wifi,
} from "lucide-react";

export const serviceCategories = [
  {
    id: "healthcare-information-system",
    name: "Healthcare Information System",
    short: "Digitalisasi terintegrasi untuk operasional dan manajemen fasilitas kesehatan.",
    icon: Hospital,
    items: ["SIMRS – ERP", "TransHealthcare Ecosystem", "TransECA-X", "TransCPR-X", "TransCDSS-X", "TransCDI-X", "TransLOG-X", "TransDCA-X", "TransCPG-X", "e-Klinik", "e-Puskesmas", "SIMKESDIK"],
  },
  {
    id: "clinical-patient-care",
    name: "Clinical & Patient Care Solutions",
    short: "Meningkatkan kualitas pelayanan pasien melalui teknologi klinis modern.",
    icon: HeartPulse,
    items: ["EMR", "Mobile Apps Pasien", "Online Consultation", "Emergency Call Button", "e-Reservation", "e-Receipt", "Kios-K Self Service", "Tele-ICU", "Tele-EKG", "IoT Ambulance", "Mobile Clinic", "PACS", "LIS", "AI Medical Record", "AI Evidence Based Clinical Pathway"],
  },
  {
    id: "hospital-operations",
    name: "Hospital Operations & Management",
    short: "Mengoptimalkan proses kerja, aset, SDM, logistik, dan klaim rumah sakit.",
    icon: Activity,
    items: ["EIS", "HRIS", "Asset Management", "MKKO", "e-Logistic", "Kios-K", "AI Management Claim"],
  },
  {
    id: "consulting-facility",
    name: "Healthcare Consulting & Facility Solutions",
    short: "Pendampingan profesional dari perencanaan hingga pengelolaan fasilitas.",
    icon: Building2,
    items: ["Hospital Management Consulting", "Hospital Engineering, Planning & Design", "Integrated Facility Management", "Interior Management"],
  },
  {
    id: "infrastructure",
    name: "Infrastructure Solutions & Managed Services",
    short: "Infrastruktur IT yang aman, andal, dan siap mendukung layanan kesehatan.",
    icon: Server,
    items: ["Hardware Supply", "Server & Storage", "PC Client & Tablet", "Network Devices", "FO & UTP Cabling", "UPS & Backups", "Software & License", "Network Design", "LAN & WAN", "Wi-Fi", "Data Center", "Technical Support"],
  },
  {
    id: "training",
    name: "Training & Talent Development",
    short: "Pengembangan kompetensi teknologi melalui pelatihan dan kemitraan pendidikan.",
    icon: GraduationCap,
    items: ["Networking", "MikroTik", "Programming", "JTTI", "Educational Partnership"],
  },
];

export const featuredServices = [
  { title: "SIMRS – ERP", category: "Healthcare Information System", description: "Platform terpadu untuk manajemen rumah sakit yang efisien, aman, dan terukur.", icon: Hospital },
  { title: "TransHealthcare Ecosystem", category: "Healthcare Information System", description: "Ekosistem digital yang menghubungkan proses klinis dan operasional.", icon: BrainCircuit },
  { title: "Electronic Medical Record", category: "Clinical & Patient Care", description: "Pengelolaan rekam medis elektronik yang cepat dan berkesinambungan.", icon: Stethoscope },
  { title: "Telemedicine Solutions", category: "Clinical & Patient Care", description: "Layanan konsultasi kesehatan jarak jauh yang mudah diakses pasien.", icon: Laptop },
];

export const portfolios = [
  { title: "SATUSEHAT Solution", category: "Healthcare", description: "Interoperabilitas data kesehatan untuk ekosistem nasional.", icon: ShieldCheck, tone: "from-cyan-600 to-ink" },
  { title: "Medifant", category: "Healthcare", description: "Solusi digital untuk mendukung pelayanan fasilitas kesehatan.", icon: HeartPulse, tone: "from-teal to-ink" },
  { title: "COVID-19 System", category: "Healthcare", description: "Sistem informasi pendukung respons layanan kesehatan.", icon: Activity, tone: "from-orange to-amber-500" },
  { title: "Vertical Hospital", category: "Healthcare", description: "Transformasi digital untuk rumah sakit vertikal.", icon: Building2, tone: "from-sky-700 to-ink" },
  { title: "SIM Online", category: "Government", description: "Pengembangan sistem layanan publik yang efisien.", icon: Network, tone: "from-slate-600 to-ink" },
  { title: "Digital Taekwondo Indonesia", category: "Sports", description: "Digitalisasi administrasi dan ekosistem olahraga.", icon: UsersRound, tone: "from-red-600 to-orange" },
  { title: "Bunihayu Forest", category: "Tourism", description: "Transformasi layanan wisata dan hospitality.", icon: Wifi, tone: "from-emerald-600 to-teal" },
  { title: "Sari Medika Resort", category: "Tourism", description: "Sistem terintegrasi untuk wellness dan hospitality.", icon: Building2, tone: "from-amber-600 to-orange" },
  { title: "Healthcare Research", category: "Research", description: "Riset dan inovasi untuk masa depan layanan kesehatan.", icon: BrainCircuit, tone: "from-violet-600 to-ink" },
];

export const insights = [
  { type: "News", date: "24 Mei 2024", title: "JMT Group Raih Penghargaan Inovasi Digital Kesehatan", excerpt: "Komitmen JMT dalam mendorong transformasi digital fasilitas kesehatan di Indonesia." },
  { type: "Article", date: "19 Mei 2024", title: "Transformasi Digital Rumah Sakit di Indonesia", excerpt: "Langkah strategis membangun layanan kesehatan yang lebih terintegrasi dan berkelanjutan." },
  { type: "Article", date: "24 April 2024", title: "Masa Depan Telemedicine di Indonesia", excerpt: "Peluang teknologi telehealth dalam memperluas akses layanan kesehatan." },
];

export const stats = [
  ["22+", "Years of Excellence"],
  ["500+", "Projects Completed"],
  ["300+", "Healthcare Partners"],
  ["1000+", "Professionals"],
];
