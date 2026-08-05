const WHATSAPP_NUMBER = "6287870007781";

const DEFAULT_MESSAGE =
  "Halo Jasa Medika Transmedic, saya ingin mendapatkan informasi lebih lanjut mengenai layanan JMT Group.";

export default function WhatsAppFloatingButton() {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    DEFAULT_MESSAGE
  )}`;

  return (
    <div className="group fixed bottom-5 right-5 z-[70] sm:bottom-7 sm:right-7">
      {/* Tooltip */}
      <div className="pointer-events-none absolute bottom-full right-0 mb-3 w-max max-w-[230px] translate-y-2 rounded-xl bg-[#082B3A] px-4 py-2.5 text-xs font-semibold leading-5 text-white opacity-0 shadow-xl transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        Hubungi kami melalui WhatsApp

        <div className="absolute -bottom-1 right-5 h-3 w-3 rotate-45 bg-[#082B3A]" />
      </div>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        aria-label="Hubungi Jasa Medika Transmedic melalui WhatsApp"
        title="Hubungi melalui WhatsApp"
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_12px_35px_rgba(37,211,102,0.4)] transition duration-300 hover:-translate-y-1 hover:scale-105 hover:bg-[#20BD5A] focus:outline-none focus:ring-4 focus:ring-green-200 sm:h-16 sm:w-16"
      >
        {/* Efek pulse */}
        <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366]/30" />

        {/* Logo WhatsApp */}
        <svg
          viewBox="0 0 32 32"
          aria-hidden="true"
          className="h-7 w-7 fill-current sm:h-8 sm:w-8"
        >
          <path d="M16.04 3C8.86 3 3.02 8.83 3.02 16c0 2.29.6 4.53 1.73 6.5L3 29l6.67-1.75A12.95 12.95 0 0 0 16.04 29C23.22 29 29 23.17 29 16S23.22 3 16.04 3Zm0 23.8a10.72 10.72 0 0 1-5.47-1.5l-.39-.23-3.96 1.04 1.06-3.86-.25-.4A10.75 10.75 0 0 1 5.2 16c0-5.98 4.86-10.8 10.84-10.8A10.78 10.78 0 0 1 26.82 16c0 5.98-4.82 10.8-10.78 10.8Zm5.93-8.08c-.33-.17-1.92-.95-2.22-1.06-.3-.11-.52-.17-.74.17-.22.33-.85 1.06-1.04 1.28-.19.22-.38.25-.71.08-.33-.17-1.38-.51-2.63-1.62a9.83 9.83 0 0 1-1.82-2.27c-.19-.33-.02-.51.14-.67.15-.15.33-.38.49-.57.17-.19.22-.33.33-.55.11-.22.05-.41-.03-.58-.08-.16-.74-1.78-1.01-2.44-.27-.64-.54-.55-.74-.56h-.63c-.22 0-.58.08-.88.41-.3.33-1.15 1.12-1.15 2.74s1.18 3.18 1.34 3.4c.17.22 2.32 3.54 5.62 4.97.78.34 1.4.54 1.87.69.79.25 1.51.22 2.08.13.63-.09 1.92-.79 2.19-1.55.27-.77.27-1.42.19-1.55-.08-.14-.3-.22-.63-.39Z" />
        </svg>

        {/* Status online */}
        <span className="absolute right-0.5 top-0.5 h-4 w-4 rounded-full border-2 border-white bg-emerald-300" />
      </a>
    </div>
  );
}