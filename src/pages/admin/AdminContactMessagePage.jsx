import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Eye,
  Inbox,
  LoaderCircle,
  Mail,
  MessageSquareText,
  RefreshCw,
  Search,
  Send,
  Trash2,
  X,
} from "lucide-react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAdminAuth } from "../../contexts/AdminAuthContext";
import {
  deleteContactMessage,
  getAdminContactMessages,
} from "../../services/contactMessageService";

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

function getStatusStyle(status) {
  switch (status) {
    case "read":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "replied":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "closed":
      return "border-slate-200 bg-slate-100 text-slate-600";

    default:
      return "border-orange-200 bg-orange-50 text-[#FF5A0A]";
  }
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getEmailStatus(message) {
  if (message.email_sent) {
    return {
      label: "Email terkirim",
      className:
        "bg-emerald-50 text-emerald-700",
    };
  }

  if (
    message.has_automation_error ||
    message.email_notification_status === "failed"
  ) {
    return {
      label: "Email gagal",
      className: "bg-red-50 text-red-700",
    };
  }

  return {
    label: "Email pending",
    className: "bg-amber-50 text-amber-700",
  };
}

export default function AdminContactMessagePage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { role, isAdmin } = useAdminAuth();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] =
    useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");

  const [deleteTarget, setDeleteTarget] =
    useState(null);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const data =
        await getAdminContactMessages();

      setMessages(data || []);
    } catch (error) {
      console.error(
        "Pesan masuk gagal dimuat:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Pesan masuk gagal dimuat."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    const message =
      location.state?.successMessage;

    if (!message) return undefined;

    setSuccessMessage(message);

    navigate(location.pathname, {
      replace: true,
      state: {},
    });

    const timeout = window.setTimeout(() => {
      setSuccessMessage("");
    }, 5000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [
    location.pathname,
    location.state,
    navigate,
  ]);

  const statistics = useMemo(() => {
    return {
      total: messages.length,

      new: messages.filter(
        (message) => message.status === "new"
      ).length,

      read: messages.filter(
        (message) => message.status === "read"
      ).length,

      replied: messages.filter(
        (message) => message.status === "replied"
      ).length,
    };
  }, [messages]);

  const filteredMessages = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    return messages.filter((message) => {
      const searchableText = [
        message.display_name,
        message.email,
        message.phone,
        message.company,
        message.subject,
        message.service_interest_display,
        message.message,
      ]
        .map((value) =>
          String(value || "").toLowerCase()
        )
        .join(" ");

      const matchesSearch =
        !normalizedSearch ||
        searchableText.includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" ||
        message.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [messages, search, statusFilter]);

  function openDeleteModal(message) {
    if (!isAdmin) {
      setErrorMessage(
        "Hanya administrator yang dapat menghapus pesan."
      );

      return;
    }

    setDeleteTarget(message);
  }

  function closeDeleteModal() {
    if (isDeleting) return;

    setDeleteTarget(null);
  }

  async function handleDeleteMessage() {
    if (
      !deleteTarget ||
      isDeleting ||
      !isAdmin
    ) {
      return;
    }

    const messageToDelete = deleteTarget;

    try {
      setIsDeleting(true);
      setErrorMessage("");

      await deleteContactMessage(
        messageToDelete.id
      );

      setMessages((currentMessages) =>
        currentMessages.filter(
          (message) =>
            message.id !== messageToDelete.id
        )
      );

      setDeleteTarget(null);

      setSuccessMessage(
        `Pesan dari “${messageToDelete.display_name}” berhasil dihapus.`
      );

      window.setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
    } catch (error) {
      console.error(
        "Pesan gagal dihapus:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Pesan gagal dihapus."
      );

      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <div className="space-y-7">
        {/* Header */}
        <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#FF5A0A]">
              <Inbox size={14} />
              Customer Inbox
            </div>

            <h1 className="mt-4 text-3xl font-bold text-[#082B3A] md:text-4xl">
              Pesan Masuk
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
              Kelola pertanyaan dan pesan yang
              dikirim melalui halaman Contact Us.
            </p>
          </div>

          <button
            type="button"
            onClick={loadMessages}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#082B3A] shadow-sm transition hover:border-[#FF5A0A] hover:text-[#FF5A0A] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={
                loading ? "animate-spin" : ""
              }
            />

            Refresh
          </button>
        </section>

        {/* Informasi role */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs text-slate-500">
            Akses:
          </span>

          <span className="rounded-full bg-slate-200 px-3 py-1.5 text-xs font-semibold capitalize text-[#082B3A]">
            {role || "Memuat role"}
          </span>

          {role === "editor" && (
            <span className="text-xs text-slate-400">
              Editor dapat membaca dan memperbarui
              status, tetapi tidak dapat menghapus.
            </span>
          )}
        </div>

        {/* Pesan sukses */}
        {successMessage && (
          <div
            role="status"
            className="flex items-start justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2
                size={21}
                className="mt-0.5 text-emerald-600"
              />

              <div>
                <p className="font-semibold text-emerald-800">
                  Berhasil
                </p>

                <p className="mt-1 text-sm text-emerald-700">
                  {successMessage}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setSuccessMessage("")
              }
              className="text-emerald-600"
              aria-label="Tutup pesan sukses"
            >
              <X size={19} />
            </button>
          </div>
        )}

        {/* Pesan error */}
        {errorMessage && (
          <div
            role="alert"
            className="flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle
                size={21}
                className="mt-0.5 text-red-600"
              />

              <div>
                <p className="font-semibold text-red-800">
                  Terjadi kesalahan
                </p>

                <p className="mt-1 text-sm leading-6 text-red-700">
                  {errorMessage}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setErrorMessage("")
              }
              className="text-red-600"
              aria-label="Tutup pesan error"
            >
              <X size={19} />
            </button>
          </div>
        )}

        {/* Statistik */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Total Pesan",
              value: statistics.total,
              icon: Mail,
              iconClass:
                "bg-blue-50 text-blue-600",
            },
            {
              label: "Pesan Baru",
              value: statistics.new,
              icon: Inbox,
              iconClass:
                "bg-orange-50 text-[#FF5A0A]",
            },
            {
              label: "Sudah Dibaca",
              value: statistics.read,
              icon: Eye,
              iconClass:
                "bg-violet-50 text-violet-600",
            },
            {
              label: "Sudah Dibalas",
              value: statistics.replied,
              icon: Send,
              iconClass:
                "bg-emerald-50 text-emerald-600",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.label}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">
                      {item.label}
                    </p>

                    <p className="mt-3 text-3xl font-bold text-[#082B3A]">
                      {item.value}
                    </p>
                  </div>

                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl ${item.iconClass}`}
                  >
                    <Icon size={20} />
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        {/* Filter */}
        <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_220px_auto]">
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <label
              htmlFor="message-search"
              className="sr-only"
            >
              Cari pesan
            </label>

            <input
              id="message-search"
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Cari nama, email, perusahaan, atau isi pesan..."
              className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#FF5A0A]"
          >
            <option value="all">
              Semua status
            </option>

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
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
            }}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-[#FF5A0A] hover:text-[#FF5A0A]"
          >
            Reset Filter
          </button>
        </section>

        {/* Daftar pesan */}
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-80 items-center justify-center">
              <div className="text-center">
                <LoaderCircle
                  size={42}
                  className="mx-auto animate-spin text-[#FF5A0A]"
                />

                <p className="mt-4 font-semibold text-[#082B3A]">
                  Memuat pesan masuk
                </p>
              </div>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Inbox size={30} />
              </div>

              <h2 className="mt-5 text-xl font-bold text-[#082B3A]">
                Pesan tidak ditemukan
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {messages.length === 0
                  ? "Belum ada pesan kontak yang masuk."
                  : "Tidak ada pesan yang sesuai dengan pencarian atau filter."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1150px]">
                <thead className="bg-slate-50">
                  <tr className="text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-4">
                      Pengirim
                    </th>

                    <th className="px-6 py-4">
                      Pesan
                    </th>

                    <th className="px-6 py-4">
                      Layanan
                    </th>

                    <th className="px-6 py-4">
                      Status
                    </th>

                    <th className="px-6 py-4">
                      Email
                    </th>

                    <th className="px-6 py-4">
                      Waktu
                    </th>

                    <th className="px-6 py-4 text-right">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredMessages.map(
                    (message) => {
                      const emailStatus =
                        getEmailStatus(message);

                      return (
                        <tr
                          key={message.id}
                          className={`transition hover:bg-slate-50 ${
                            message.status === "new"
                              ? "bg-orange-50/30"
                              : ""
                          }`}
                        >
                          <td className="px-6 py-5">
                            <div className="min-w-52">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-[#082B3A]">
                                  {message.display_name}
                                </p>

                                {message.status ===
                                  "new" && (
                                  <span className="h-2 w-2 rounded-full bg-[#FF5A0A]" />
                                )}
                              </div>

                              <p className="mt-1 text-xs text-slate-500">
                                {message.email}
                              </p>

                              {message.company && (
                                <p className="mt-1 text-xs text-slate-400">
                                  {message.company}
                                </p>
                              )}
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <div className="max-w-72">
                              <p className="truncate text-sm font-semibold text-slate-700">
                                {message.subject ||
                                  "Pesan Kontak"}
                              </p>

                              <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                                {message.message}
                              </p>
                            </div>
                          </td>

                          <td className="px-6 py-5 text-sm text-slate-600">
                            {
                              message.service_interest_display
                            }
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusStyle(
                                message.status
                              )}`}
                            >
                              {getStatusLabel(
                                message.status
                              )}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${emailStatus.className}`}
                            >
                              {emailStatus.label}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <span className="inline-flex items-center gap-2 text-xs text-slate-500">
                              <Clock3 size={14} />
                              {formatDate(
                                message.created_at
                              )}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex justify-end gap-2">
                              <Link
                                to={`/admin/messages/${message.id}`}
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-[#082B3A] transition hover:border-[#FF5A0A] hover:text-[#FF5A0A]"
                              >
                                <MessageSquareText
                                  size={15}
                                />
                                Detail
                              </Link>

                              {isAdmin && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    openDeleteModal(
                                      message
                                    )
                                  }
                                  className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                                >
                                  <Trash2 size={15} />
                                  Hapus
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}

          {!loading && messages.length > 0 && (
            <div className="border-t border-slate-100 px-6 py-4">
              <p className="text-xs text-slate-500">
                Menampilkan{" "}
                <span className="font-semibold text-[#082B3A]">
                  {filteredMessages.length}
                </span>{" "}
                dari{" "}
                <span className="font-semibold text-[#082B3A]">
                  {messages.length}
                </span>{" "}
                pesan.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Modal hapus */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-message-title"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeDeleteModal();
            }
          }}
        >
          <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <Trash2 size={27} />
            </div>

            <h2
              id="delete-message-title"
              className="mt-5 text-2xl font-bold text-[#082B3A]"
            >
              Hapus pesan?
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-500">
              Pesan dari{" "}
              <span className="font-semibold text-[#082B3A]">
                “{deleteTarget.display_name}”
              </span>{" "}
              akan dihapus permanen.
            </p>

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={isDeleting}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleDeleteMessage}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {isDeleting ? (
                  <>
                    <LoaderCircle
                      size={17}
                      className="animate-spin"
                    />
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 size={17} />
                    Ya, Hapus
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}