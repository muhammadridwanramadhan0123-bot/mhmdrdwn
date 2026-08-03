import { supabase } from "../lib/supabase";

const CONTACT_MESSAGE_TABLE = "contact_messages";

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizeContactMessage(record) {
  if (!record) {
    return null;
  }

  const displayName =
    normalizeText(record.full_name) ||
    normalizeText(record.name) ||
    "Tanpa nama";

  const serviceInterest =
    normalizeText(record.service_interest) ||
    normalizeText(record.service) ||
    "Tidak disebutkan";

  return {
    ...record,

    display_name: displayName,
    service_interest_display: serviceInterest,

    email_sent: Boolean(record.email_sent),

    has_automation_error: Boolean(
      normalizeText(record.automation_error) ||
        normalizeText(record.email_error)
    ),
  };
}

function throwContactMessageError(
  error,
  fallbackMessage
) {
  console.error(fallbackMessage, error);

  if (error?.code === "42501") {
    throw new Error(
      "Akun ini tidak memiliki izin untuk mengelola pesan kontak."
    );
  }

  const message = normalizeText(
    error?.message
  ).toLowerCase();

  if (
    message.includes("row-level security") ||
    message.includes(
      "violates row-level security"
    )
  ) {
    throw new Error(
      "Tindakan ditolak oleh policy RLS Supabase."
    );
  }

  throw new Error(
    error?.message || fallbackMessage
  );
}

/*
 * Mengambil seluruh pesan kontak untuk admin.
 */
export async function getAdminContactMessages() {
  const { data, error } = await supabase
    .from(CONTACT_MESSAGE_TABLE)
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throwContactMessageError(
      error,
      "Daftar pesan kontak gagal dimuat."
    );
  }

  return (data || []).map(
    normalizeContactMessage
  );
}

/*
 * Mengambil satu pesan berdasarkan ID.
 */
export async function getContactMessageById(
  id
) {
  if (!id) {
    throw new Error(
      "ID pesan kontak tidak tersedia."
    );
  }

  const { data, error } = await supabase
    .from(CONTACT_MESSAGE_TABLE)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throwContactMessageError(
      error,
      "Detail pesan kontak gagal dimuat."
    );
  }

  return normalizeContactMessage(data);
}

/*
 * Memperbarui status pesan.
 *
 * Contoh nilai:
 * new
 * read
 * replied
 * closed
 */
export async function updateContactMessageStatus(
  id,
  status
) {
  if (!id) {
    throw new Error(
      "ID pesan kontak tidak tersedia."
    );
  }

  const normalizedStatus = normalizeText(
    status
  ).toLowerCase();

  if (!normalizedStatus) {
    throw new Error(
      "Status pesan kontak wajib diisi."
    );
  }

  const payload = {
    status: normalizedStatus,
  };

  /*
   * Ketika status diubah menjadi replied,
   * simpan waktu balasan.
   */
  if (normalizedStatus === "replied") {
    payload.replied_at =
      new Date().toISOString();
  }

  const { data, error } = await supabase
    .from(CONTACT_MESSAGE_TABLE)
    .update(payload)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    throwContactMessageError(
      error,
      "Status pesan kontak gagal diperbarui."
    );
  }

  if (!data) {
    throw new Error(
      "Pesan tidak ditemukan atau akun tidak mempunyai izin untuk memperbarui."
    );
  }

  return normalizeContactMessage(data);
}

/*
 * Memperbarui data pengelolaan pesan.
 *
 * Kolom yang dapat diperbarui:
 * status
 * assigned_to
 * replied_at
 */
export async function updateContactMessage(
  id,
  values = {}
) {
  if (!id) {
    throw new Error(
      "ID pesan kontak tidak tersedia."
    );
  }

  const payload = {};

  if (values.status !== undefined) {
    payload.status = normalizeText(
      values.status
    ).toLowerCase();
  }

  if (values.assigned_to !== undefined) {
    payload.assigned_to =
      values.assigned_to || null;
  }

  if (values.replied_at !== undefined) {
    payload.replied_at =
      values.replied_at || null;
  }

  if (Object.keys(payload).length === 0) {
    throw new Error(
      "Tidak ada perubahan pesan yang dapat disimpan."
    );
  }

  if (
    payload.status === "replied" &&
    !payload.replied_at
  ) {
    payload.replied_at =
      new Date().toISOString();
  }

  const { data, error } = await supabase
    .from(CONTACT_MESSAGE_TABLE)
    .update(payload)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    throwContactMessageError(
      error,
      "Pesan kontak gagal diperbarui."
    );
  }

  if (!data) {
    throw new Error(
      "Pesan tidak ditemukan atau akun tidak mempunyai izin untuk memperbarui."
    );
  }

  return normalizeContactMessage(data);
}

/*
 * Menandai pesan baru sebagai sudah dibaca.
 */
export async function markContactMessageAsRead(
  id
) {
  const currentMessage =
    await getContactMessageById(id);

  if (!currentMessage) {
    throw new Error(
      "Pesan kontak tidak ditemukan."
    );
  }

  if (currentMessage.status !== "new") {
    return currentMessage;
  }

  return updateContactMessageStatus(
    id,
    "read"
  );
}

/*
 * Menghapus pesan kontak.
 * Policy backend membatasi tindakan ini
 * hanya untuk administrator.
 */
export async function deleteContactMessage(
  id
) {
  if (!id) {
    throw new Error(
      "ID pesan kontak tidak tersedia."
    );
  }

  const { data, error } = await supabase
    .from(CONTACT_MESSAGE_TABLE)
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    throwContactMessageError(
      error,
      "Pesan kontak gagal dihapus."
    );
  }

  if (!data) {
    throw new Error(
      "Pesan tidak ditemukan atau akun tidak mempunyai izin untuk menghapus."
    );
  }

  return data;
}