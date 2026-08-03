import { supabase } from "../lib/supabase";

const CONSULTATION_TABLE = "consultations";

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizeConsultation(record) {
  if (!record) {
    return null;
  }

  return {
    ...record,

    display_name:
      normalizeText(record.full_name) ||
      "Tanpa nama",

    service_interest_display:
      normalizeText(record.service_interest) ||
      "Tidak disebutkan",

    consultation_method_display:
      normalizeText(
        record.consultation_method
      ) || "online",

    has_automation_error: Boolean(
      normalizeText(record.automation_error)
    ),
  };
}

function throwConsultationError(
  error,
  fallbackMessage
) {
  console.error(fallbackMessage, error);

  if (error?.code === "42501") {
    throw new Error(
      "Akun ini tidak memiliki izin untuk mengelola konsultasi."
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
 * Mengambil seluruh konsultasi untuk admin.
 */
export async function getAdminConsultations() {
  const { data, error } = await supabase
    .from(CONSULTATION_TABLE)
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throwConsultationError(
      error,
      "Daftar konsultasi gagal dimuat."
    );
  }

  return (data || []).map(
    normalizeConsultation
  );
}

/*
 * Mengambil satu konsultasi berdasarkan ID.
 */
export async function getConsultationById(
  id
) {
  if (!id) {
    throw new Error(
      "ID konsultasi tidak tersedia."
    );
  }

  const { data, error } = await supabase
    .from(CONSULTATION_TABLE)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throwConsultationError(
      error,
      "Detail konsultasi gagal dimuat."
    );
  }

  return normalizeConsultation(data);
}

/*
 * Memperbarui data pengelolaan konsultasi.
 */
export async function updateConsultation(
  id,
  values = {}
) {
  if (!id) {
    throw new Error(
      "ID konsultasi tidak tersedia."
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

  if (values.scheduled_at !== undefined) {
    payload.scheduled_at =
      values.scheduled_at || null;
  }

  if (values.completed_at !== undefined) {
    payload.completed_at =
      values.completed_at || null;
  }

  if (values.internal_notes !== undefined) {
    payload.internal_notes =
      normalizeText(values.internal_notes) ||
      null;
  }

  /*
   * Ketika status menjadi completed dan
   * completed_at belum diberikan,
   * gunakan waktu sekarang.
   */
  if (
    payload.status === "completed" &&
    !payload.completed_at
  ) {
    payload.completed_at =
      new Date().toISOString();
  }

  if (Object.keys(payload).length === 0) {
    throw new Error(
      "Tidak ada perubahan konsultasi yang dapat disimpan."
    );
  }

  const { data, error } = await supabase
    .from(CONSULTATION_TABLE)
    .update(payload)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    throwConsultationError(
      error,
      "Konsultasi gagal diperbarui."
    );
  }

  if (!data) {
    throw new Error(
      "Konsultasi tidak ditemukan atau akun tidak mempunyai izin untuk memperbarui."
    );
  }

  return normalizeConsultation(data);
}

/*
 * Memperbarui status konsultasi.
 */
export async function updateConsultationStatus(
  id,
  status
) {
  return updateConsultation(id, {
    status,
  });
}

/*
 * Menjadwalkan konsultasi.
 */
export async function scheduleConsultation(
  id,
  scheduledAt
) {
  if (!scheduledAt) {
    throw new Error(
      "Tanggal dan waktu konsultasi wajib dipilih."
    );
  }

  return updateConsultation(id, {
    status: "scheduled",
    scheduled_at: scheduledAt,
  });
}

/*
 * Menyelesaikan konsultasi.
 */
export async function completeConsultation(
  id,
  internalNotes = ""
) {
  return updateConsultation(id, {
    status: "completed",
    completed_at:
      new Date().toISOString(),
    internal_notes: internalNotes,
  });
}

/*
 * Menghapus konsultasi.
 * Policy backend membatasi tindakan ini
 * hanya untuk administrator.
 */
export async function deleteConsultation(
  id
) {
  if (!id) {
    throw new Error(
      "ID konsultasi tidak tersedia."
    );
  }

  const { data, error } = await supabase
    .from(CONSULTATION_TABLE)
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    throwConsultationError(
      error,
      "Konsultasi gagal dihapus."
    );
  }

  if (!data) {
    throw new Error(
      "Konsultasi tidak ditemukan atau akun tidak mempunyai izin untuk menghapus."
    );
  }

  return data;
}