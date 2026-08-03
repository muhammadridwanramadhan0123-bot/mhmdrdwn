import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  Mail,
  MessageSquareText,
  Phone,
  RefreshCw,
  Save,
  Send,
  ServerCog,
  UserRound,
} from "lucide-react";
import {
  Link,
  useParams,
} from "react-router-dom";

import {
  getContactMessageById,
  markContactMessageAsRead,
  updateContactMessageStatus,
} from "../../services/contactMessageService";

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getStatusLabel(status) {
  switch (status) {
    case "read":
      return "Dibaca";

    case "replied":
      return "Dibalas";

    case "closed":
      return "Selesai";

    default:
      return "Baru";
  }
}

export default function AdminContactMessageDetailPage() {
  const { id } = useParams();

  const [message, setMessage] = useState(null);
  const [selectedStatus, setSelectedStatus] =
    useState("new");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const loadMessage = useCallback(async () => {
    if (!id) {
      setErrorMessage(
        "ID pesan tidak tersedia."
      );
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      let data =
        await getContactMessageById(id);

      if (!data) {
        setMessage(null);
        return;
      }

      /*
       * Pesan baru otomatis menjadi read
       * saat halaman detail dibuka.
       */
      if (data.status === "new") {
        try {
          data =
            await markContactMessageAsRead(
              id
            );
        } catch (readError) {
          console.error(
            "Pesan gagal ditandai sebagai dibaca:",
            readError
          );
        }
      }

      setMessage(data);
      setSelectedStatus(
        data?.status || "new"
      );
    } catch (error) {
      console.error(
        "Detail pesan gagal dimuat:",
        error
      );

      setMessage(null);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Detail pesan gagal dimuat."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadMessage();
  }, [loadMessage]);

  async function handleSaveStatus() {
    if (!id || saving) return;

    try {
      setSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      const updatedMessage =
        await updateContactMessageStatus(
          id,
          selectedStatus
        );

      setMessage(updatedMessage);

      setSuccessMessage(
        `Status berhasil diubah menjadi ${getStatusLabel(
          updatedMessage.status
        )}.`
      );

      window.setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
    } catch (error) {
      console.error(
        "Status pesan gagal diperbarui:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Status pesan gagal diperbarui."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <LoaderCircle
            size={44}
            className="mx-auto animate-spin text-[#FF5A0A]"
          />

          <p className="mt-4 font-semibold text-[#082B3A]">
            Memuat detail pesan
          </p>
        </div>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <MessageSquareText
            size={36}
            className="mx-auto text-slate-400"
          />

          <h1 className="mt-5 text-2xl font-bold text-[#082B3A]">
            Pesan tidak ditemukan
          </h1>

          <p className="mt-3 text-sm leading-7 text-slate-500">
            Pesan mungkin sudah dihapus atau akun
            tidak memiliki akses.
          </p>

          {errorMessage && (
            <p className="mt-3 text-sm text-red-600">
              {errorMessage}
            </p>
          )}

          <Link
            to="/admin/messages"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#FF5A0A] px-5 py-3 text-sm font-semibold text-white"
          >
            <ArrowLeft size={17} />
            Kembali ke Pesan
          </Link>
        </div>
      </div>
    );
  }

  const emailSubject = encodeURIComponent(
    `Re: ${
      message.subject || "Pesan dari Website JMT"
    }`
  );

  return (
    <div className="space-y-7">
      {/* Header */}
      <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <Link
            to="/admin/messages"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#FF5A0A]"
          >
            <ArrowLeft size={17} />
            Kembali ke Pesan Masuk
          </Link>

          <h1 className="mt-5 text-3xl font-bold text-[#082B3A]">
            Detail Pesan
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Diterima pada{" "}
            {formatDate(message.created_at)}
          </p>
        </div>

        <a
          href={`mailto:${message.email}?subject=${emailSubject}`}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF5A0A] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:bg-[#E94F00]"
        >
          <Send size={17} />
          Balas melalui Email
        </a>
      </section>

      {successMessage && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
          <CheckCircle2
            size={21}
            className="mt-0.5 text-emerald-600"
          />

          <p className="text-sm text-emerald-700">
            {successMessage}
          </p>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
          <AlertTriangle
            size={21}
            className="mt-0.5 text-red-600"
          />

          <p className="text-sm text-red-700">
            {errorMessage}
          </p>
        </div>
      )}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_360px]">
        {/* Isi pesan */}
        <article className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-[#FF5A0A]">
                <MessageSquareText size={23} />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#FF5A0A]">
                  Subjek
                </p>

                <h2 className="mt-2 text-2xl font-bold leading-8 text-[#082B3A]">
                  {message.subject ||
                    "Pesan Kontak"}
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Minat layanan:{" "}
                  <span className="font-semibold text-slate-700">
                    {
                      message.service_interest_display
                    }
                  </span>
                </p>
              </div>
            </div>

            <div className="mt-7 border-t border-slate-100 pt-7">
              <p className="whitespace-pre-line text-base leading-9 text-slate-600">
                {message.message}
              </p>
            </div>
          </div>

          {/* Informasi automasi */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <ServerCog
                size={21}
                className="text-[#FF5A0A]"
              />

              <h2 className="text-lg font-bold text-[#082B3A]">
                Status Automasi Email
              </h2>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Status Email
                </p>

                <p className="mt-2 text-sm font-semibold text-[#082B3A]">
                  {message.email_sent
                    ? "Berhasil dikirim"
                    : message.email_notification_status ||
                      "Pending"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Admin diberi tahu
                </p>

                <p className="mt-2 text-sm font-semibold text-[#082B3A]">
                  {formatDate(
                    message.admin_notified_at ||
                      message.notified_at
                  )}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Auto Reply
                </p>

                <p className="mt-2 text-sm font-semibold text-[#082B3A]">
                  {formatDate(
                    message.auto_reply_sent_at
                  )}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Error
                </p>

                <p
                  className={`mt-2 text-sm font-semibold ${
                    message.has_automation_error
                      ? "text-red-600"
                      : "text-emerald-600"
                  }`}
                >
                  {message.automation_error ||
                    message.email_error ||
                    "Tidak ada error"}
                </p>
              </div>
            </div>
          </div>
        </article>

        {/* Sidebar informasi */}
        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#082B3A]">
              Informasi Pengirim
            </h2>

            <div className="mt-5 space-y-5">
              <div className="flex items-start gap-3">
                <UserRound
                  size={18}
                  className="mt-0.5 text-slate-400"
                />

                <div>
                  <p className="text-xs text-slate-400">
                    Nama
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#082B3A]">
                    {message.display_name}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail
                  size={18}
                  className="mt-0.5 text-slate-400"
                />

                <div className="min-w-0">
                  <p className="text-xs text-slate-400">
                    Email
                  </p>

                  <a
                    href={`mailto:${message.email}`}
                    className="mt-1 block break-all text-sm font-semibold text-[#FF5A0A]"
                  >
                    {message.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone
                  size={18}
                  className="mt-0.5 text-slate-400"
                />

                <div>
                  <p className="text-xs text-slate-400">
                    Telepon
                  </p>

                  {message.phone ? (
                    <a
                      href={`tel:${message.phone}`}
                      className="mt-1 block text-sm font-semibold text-[#082B3A]"
                    >
                      {message.phone}
                    </a>
                  ) : (
                    <p className="mt-1 text-sm text-slate-500">
                      Tidak tersedia
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Building2
                  size={18}
                  className="mt-0.5 text-slate-400"
                />

                <div>
                  <p className="text-xs text-slate-400">
                    Perusahaan
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#082B3A]">
                    {message.company ||
                      "Tidak tersedia"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CalendarDays
                  size={18}
                  className="mt-0.5 text-slate-400"
                />

                <div>
                  <p className="text-xs text-slate-400">
                    Dikirim
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#082B3A]">
                    {formatDate(
                      message.created_at
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Pengaturan status */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Clock3
                size={20}
                className="text-[#FF5A0A]"
              />

              <h2 className="text-lg font-bold text-[#082B3A]">
                Status Pesan
              </h2>
            </div>

            <label
              htmlFor="message-status"
              className="mt-5 block text-sm font-semibold text-slate-600"
            >
              Ubah status
            </label>

            <select
              id="message-status"
              value={selectedStatus}
              onChange={(event) =>
                setSelectedStatus(
                  event.target.value
                )
              }
              disabled={saving}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#FF5A0A]"
            >
              <option value="new">
                Baru
              </option>

              <option value="read">
                Dibaca
              </option>

              <option value="replied">
                Dibalas
              </option>

              <option value="closed">
                Selesai
              </option>
            </select>

            <button
              type="button"
              onClick={handleSaveStatus}
              disabled={
                saving ||
                selectedStatus === message.status
              }
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#082B3A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0C3C50] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <LoaderCircle
                    size={17}
                    className="animate-spin"
                  />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save size={17} />
                  Simpan Status
                </>
              )}
            </button>

            {message.replied_at && (
              <p className="mt-4 text-xs leading-5 text-slate-400">
                Ditandai dibalas pada{" "}
                {formatDate(
                  message.replied_at
                )}
              </p>
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}