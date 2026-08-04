import { supabase } from "../lib/supabase";

const COMPANY_PROFILE_TABLE = "company_profile";
const SITE_SETTINGS_TABLE = "site_settings";
const MILESTONE_TABLE = "milestones";
const PARTNER_TABLE = "partners";
const CAREER_TABLE = "careers";

const SITE_ASSETS_BUCKET = "site-assets";
const PARTNER_LOGOS_BUCKET = "partner-logos";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const CAREER_STATUSES = [
  "draft",
  "open",
  "closed",
];

const EMPLOYMENT_TYPES = [
  "full-time",
  "part-time",
  "contract",
  "internship",
  "freelance",
];

function normalizeText(value) {
  return String(value ?? "").trim();
}

function nullableText(value) {
  const normalizedValue = normalizeText(value);

  return normalizedValue || null;
}

function normalizeBoolean(value, fallback = false) {
  if (typeof value === "boolean") {
    return value;
  }

  if (value === "true" || value === 1) {
    return true;
  }

  if (value === "false" || value === 0) {
    return false;
  }

  return fallback;
}

function normalizeInteger(
  value,
  fallback = 0,
  minimum = 0
) {
  const parsedValue = Number.parseInt(
    value,
    10
  );

  if (!Number.isFinite(parsedValue)) {
    return fallback;
  }

  return Math.max(parsedValue, minimum);
}

function parseSettingValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value !== "string") {
    return value;
  }

  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return "";
  }

  try {
    return JSON.parse(normalizedValue);
  } catch {
    return normalizedValue;
  }
}

function slugify(value) {
  return normalizeText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function sanitizeFileName(value) {
  const originalName =
    normalizeText(value) || "image";

  const extensionIndex =
    originalName.lastIndexOf(".");

  const extension =
    extensionIndex >= 0
      ? originalName
          .slice(extensionIndex + 1)
          .toLowerCase()
      : "";

  const baseName =
    extensionIndex >= 0
      ? originalName.slice(0, extensionIndex)
      : originalName;

  const safeBaseName =
    slugify(baseName) || "image";

  return extension
    ? `${safeBaseName}.${extension}`
    : safeBaseName;
}

function createUniqueFileName(fileName) {
  const safeFileName =
    sanitizeFileName(fileName);

  const randomPart = Math.random()
    .toString(36)
    .slice(2, 10);

  return `${Date.now()}-${randomPart}-${safeFileName}`;
}

function normalizeRequirements(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map((item) =>
        normalizeText(item)
      )
      .filter(Boolean);
  }

  if (typeof value === "string") {
    const normalizedValue = value.trim();

    if (!normalizedValue) {
      return [];
    }

    try {
      const parsedValue =
        JSON.parse(normalizedValue);

      if (Array.isArray(parsedValue)) {
        return parsedValue
          .map((item) =>
            normalizeText(item)
          )
          .filter(Boolean);
      }
    } catch {
      // Teks biasa diproses di bawah.
    }

    return normalizedValue
      .split(/\r?\n|;/)
      .map((item) =>
        item
          .replace(/^[-•]\s*/, "")
          .trim()
      )
      .filter(Boolean);
  }

  return [];
}

function throwCompanyAdminError(
  error,
  fallbackMessage
) {
  console.error(fallbackMessage, error);

  if (error?.code === "42501") {
    throw new Error(
      "Akun ini tidak memiliki izin untuk mengelola Company."
    );
  }

  if (error?.code === "23505") {
    throw new Error(
      "Data dengan slug atau nilai unik yang sama sudah tersedia."
    );
  }

  if (error?.code === "23514") {
    throw new Error(
      "Data ditolak karena tidak sesuai dengan aturan database."
    );
  }

  if (error?.code === "23502") {
    throw new Error(
      "Terdapat kolom wajib yang belum diisi."
    );
  }

  const errorMessage = normalizeText(
    error?.message
  ).toLowerCase();

  if (
    errorMessage.includes(
      "row-level security"
    ) ||
    errorMessage.includes(
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

async function getCurrentUserId() {
  const { data, error } =
    await supabase.auth.getUser();

  if (error) {
    throwCompanyAdminError(
      error,
      "Data pengguna gagal diperiksa."
    );
  }

  const userId = data?.user?.id;

  if (!userId) {
    throw new Error(
      "Sesi login tidak ditemukan. Silakan login kembali."
    );
  }

  return userId;
}

function normalizeCompanyProfile(record) {
  if (!record) {
    return null;
  }

  return {
    ...record,

    id: Number(record.id) || 1,

    company_name:
      normalizeText(
        record.nama_perusahaan
      ),

    short_description:
      normalizeText(
        record.deskripsi_singkat
      ),

    vision: normalizeText(record.visi),

    mission: normalizeText(record.misi),

    address:
      normalizeText(record.alamat),

    email:
      normalizeText(
        record.kontak_email
      ),

    phone:
      normalizeText(
        record.kontak_telepon
      ),

    website:
      normalizeText(record.website),

    logo_url:
      normalizeText(record.logo_url),

    company_profile_pdf_url:
      normalizeText(
        record.company_profile_pdf_url
      ),
  };
}

function normalizeMilestone(record) {
  if (!record) {
    return null;
  }

  return {
    ...record,

    year: Number(record.year) || null,

    title: normalizeText(record.title),

    description:
      normalizeText(record.description),

    image_url:
      normalizeText(record.image_url),

    sort_order:
      Number(record.sort_order) || 0,

    is_active: Boolean(record.is_active),
  };
}

function normalizePartner(record) {
  if (!record) {
    return null;
  }

  return {
    ...record,

    name: normalizeText(record.name),

    logo_url:
      normalizeText(record.logo_url),

    website_url:
      normalizeText(record.website_url),

    description:
      normalizeText(record.description),

    sort_order:
      Number(record.sort_order) || 0,

    is_active: Boolean(record.is_active),
  };
}

function normalizeCareer(record) {
  if (!record) {
    return null;
  }

  return {
    ...record,

    position:
      normalizeText(record.position),

    slug: normalizeText(record.slug),

    department:
      normalizeText(record.department),

    location:
      normalizeText(record.location),

    employment_type:
      normalizeText(
        record.employment_type
      ),

    description:
      normalizeText(record.description),

    requirements:
      normalizeRequirements(
        record.requirements
      ),

    closing_date:
      normalizeText(
        record.closing_date
      ),

    status:
      normalizeText(
        record.status
      ).toLowerCase(),
  };
}

/*
 * =========================================================
 * COMPANY PROFILE
 * =========================================================
 */

export async function getAdminCompanyProfile() {
  const { data, error } = await supabase
    .from(COMPANY_PROFILE_TABLE)
    .select("*")
    .order("id", {
      ascending: true,
    })
    .limit(1)
    .maybeSingle();

  if (error) {
    throwCompanyAdminError(
      error,
      "Profil perusahaan gagal dimuat."
    );
  }

  return normalizeCompanyProfile(data);
}

export async function saveCompanyProfile(
  values = {}
) {
  const companyName = normalizeText(
    values.company_name ||
      values.nama_perusahaan
  );

  if (!companyName) {
    throw new Error(
      "Nama perusahaan wajib diisi."
    );
  }

  const profileId =
    Number(values.id) || 1;

  const payload = {
    id: profileId,

    nama_perusahaan: companyName,

    deskripsi_singkat: nullableText(
      values.short_description ??
        values.deskripsi_singkat
    ),

    visi: nullableText(
      values.vision ?? values.visi
    ),

    misi: nullableText(
      values.mission ?? values.misi
    ),

    alamat: nullableText(
      values.address ?? values.alamat
    ),

    kontak_email: nullableText(
      values.email ??
        values.kontak_email
    ),

    kontak_telepon: nullableText(
      values.phone ??
        values.kontak_telepon
    ),

    website: nullableText(
      values.website
    ),

    logo_url: nullableText(
      values.logo_url
    ),

    company_profile_pdf_url:
      nullableText(
        values.company_profile_pdf_url
      ),
  };

  const { data, error } = await supabase
    .from(COMPANY_PROFILE_TABLE)
    .upsert(payload, {
      onConflict: "id",
    })
    .select("*")
    .single();

  if (error) {
    throwCompanyAdminError(
      error,
      "Profil perusahaan gagal disimpan."
    );
  }

  return normalizeCompanyProfile(data);
}

/*
 * =========================================================
 * SITE SETTINGS / LOCATION
 * =========================================================
 */

function buildSiteSettingsSnapshot(rows) {
  const settingValues = {};

  const directValues = {
    company_name: "",
    tagline: "",
    email: "",
    phone: "",
    whatsapp: "",
    address: "",
    logo_url: "",
    instagram_url: "",
    linkedin_url: "",
  };

  for (const row of rows || []) {
    const key = normalizeText(
      row.setting_key
    );

    if (
      key &&
      settingValues[key] === undefined
    ) {
      settingValues[key] =
        parseSettingValue(
          row.setting_value
        );
    }

    for (const columnName of Object.keys(
      directValues
    )) {
      if (
        !directValues[columnName] &&
        normalizeText(row[columnName])
      ) {
        directValues[columnName] =
          normalizeText(row[columnName]);
      }
    }
  }

  function settingOrDirect(
    settingKey,
    directKey = settingKey
  ) {
    const settingValue = normalizeText(
      settingValues[settingKey]
    );

    return (
      settingValue ||
      directValues[directKey] ||
      ""
    );
  }

  return {
    rows: rows || [],

    company_name: settingOrDirect(
      "company_name"
    ),

    tagline: settingOrDirect("tagline"),

    email: settingOrDirect("email"),

    phone: settingOrDirect("phone"),

    whatsapp:
      settingOrDirect("whatsapp"),

    address: settingOrDirect("address"),

    logo_url:
      settingOrDirect("logo_url"),

    instagram_url:
      settingOrDirect(
        "instagram",
        "instagram_url"
      ) ||
      settingOrDirect(
        "instagram_url",
        "instagram_url"
      ),

    linkedin_url:
      settingOrDirect(
        "linkedin",
        "linkedin_url"
      ) ||
      settingOrDirect(
        "linkedin_url",
        "linkedin_url"
      ),

    website: normalizeText(
      settingValues.website
    ),

    youtube_url:
      normalizeText(
        settingValues.youtube
      ) ||
      normalizeText(
        settingValues.youtube_url
      ),

    google_maps_url:
      normalizeText(
        settingValues.google_maps_url
      ),
  };
}

export async function getAdminSiteSettings() {
  const { data, error } = await supabase
    .from(SITE_SETTINGS_TABLE)
    .select("*")
    .order("updated_at", {
      ascending: false,
    });

  if (error) {
    throwCompanyAdminError(
      error,
      "Pengaturan lokasi gagal dimuat."
    );
  }

  return buildSiteSettingsSnapshot(
    data || []
  );
}

export async function saveCompanyLocation(
  values = {}
) {
  const userId =
    await getCurrentUserId();

  const currentProfile =
    await getAdminCompanyProfile();

  const companyName =
    normalizeText(values.company_name) ||
    currentProfile?.company_name ||
    "Jasa Medika Transmedic";

  const directValues = {
    company_name: companyName,

    tagline: nullableText(
      values.tagline
    ),

    email: nullableText(values.email),

    phone: nullableText(values.phone),

    whatsapp: nullableText(
      values.whatsapp
    ),

    address: nullableText(
      values.address
    ),

    logo_url: nullableText(
      values.logo_url
    ),

    instagram_url: nullableText(
      values.instagram_url
    ),

    linkedin_url: nullableText(
      values.linkedin_url
    ),

    updated_by: userId,

    is_public: true,
  };

  /*
   * Setiap setting_key disimpan tersendiri.
   * Kolom langsung ikut disamakan pada setiap
   * baris agar tidak menghasilkan nilai berbeda.
   */
  const keyValues = [
    ["company_name", companyName],
    ["tagline", values.tagline],
    ["email", values.email],
    ["phone", values.phone],
    ["whatsapp", values.whatsapp],
    ["address", values.address],
    ["logo_url", values.logo_url],
    [
      "instagram",
      values.instagram_url,
    ],
    [
      "linkedin",
      values.linkedin_url,
    ],
    ["website", values.website],
    [
      "youtube",
      values.youtube_url,
    ],
    [
      "google_maps_url",
      values.google_maps_url,
    ],
  ];

  const settingRows = keyValues.map(
    ([settingKey, settingValue]) => ({
      setting_key: settingKey,

      setting_value:
        normalizeText(settingValue),

      ...directValues,
    })
  );

  const { error: settingsError } =
    await supabase
      .from(SITE_SETTINGS_TABLE)
      .upsert(settingRows, {
        onConflict: "setting_key",
      });

  if (settingsError) {
    throwCompanyAdminError(
      settingsError,
      "Pengaturan lokasi gagal disimpan."
    );
  }

  /*
   * Kontak juga disinkronkan ke company_profile
   * karena halaman publik masih menggunakan
   * company_profile sebagai prioritas.
   */
  const profilePayload = {
    id: currentProfile?.id || 1,

    nama_perusahaan: companyName,

    deskripsi_singkat:
      currentProfile?.short_description ||
      null,

    visi:
      currentProfile?.vision || null,

    misi:
      currentProfile?.mission || null,

    alamat: nullableText(
      values.address
    ),

    kontak_email: nullableText(
      values.email
    ),

    kontak_telepon: nullableText(
      values.phone
    ),

    website: nullableText(
      values.website
    ),

    logo_url: nullableText(
      values.logo_url
    ),

    company_profile_pdf_url:
      nullableText(
        currentProfile
          ?.company_profile_pdf_url
      ),
  };

  const { error: profileError } =
    await supabase
      .from(COMPANY_PROFILE_TABLE)
      .upsert(profilePayload, {
        onConflict: "id",
      });

  if (profileError) {
    throwCompanyAdminError(
      profileError,
      "Kontak berhasil disimpan, tetapi sinkronisasi profil perusahaan gagal."
    );
  }

  return getAdminSiteSettings();
}

/*
 * =========================================================
 * MILESTONES
 * =========================================================
 */

export async function getAdminMilestones() {
  const { data, error } = await supabase
    .from(MILESTONE_TABLE)
    .select("*")
    .order("sort_order", {
      ascending: true,
    })
    .order("year", {
      ascending: true,
    });

  if (error) {
    throwCompanyAdminError(
      error,
      "Daftar milestone gagal dimuat."
    );
  }

  return (data || []).map(
    normalizeMilestone
  );
}

function createMilestonePayload(
  values,
  userId,
  isCreate = false
) {
  const year = normalizeInteger(
    values.year,
    0,
    0
  );

  if (year < 1900 || year > 2200) {
    throw new Error(
      "Tahun milestone harus berada antara 1900 dan 2200."
    );
  }

  const title = normalizeText(
    values.title
  );

  if (!title) {
    throw new Error(
      "Judul milestone wajib diisi."
    );
  }

  const payload = {
    year,
    title,

    description: nullableText(
      values.description
    ),

    image_url: nullableText(
      values.image_url
    ),

    sort_order: normalizeInteger(
      values.sort_order,
      0,
      0
    ),

    is_active: normalizeBoolean(
      values.is_active,
      true
    ),

    updated_by: userId,
  };

  if (isCreate) {
    payload.created_by = userId;
  }

  return payload;
}

export async function createMilestone(
  values = {}
) {
  const userId =
    await getCurrentUserId();

  const payload =
    createMilestonePayload(
      values,
      userId,
      true
    );

  const { data, error } = await supabase
    .from(MILESTONE_TABLE)
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    throwCompanyAdminError(
      error,
      "Milestone gagal ditambahkan."
    );
  }

  return normalizeMilestone(data);
}

export async function updateMilestone(
  id,
  values = {}
) {
  if (!id) {
    throw new Error(
      "ID milestone tidak tersedia."
    );
  }

  const userId =
    await getCurrentUserId();

  const payload =
    createMilestonePayload(
      values,
      userId,
      false
    );

  const { data, error } = await supabase
    .from(MILESTONE_TABLE)
    .update(payload)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    throwCompanyAdminError(
      error,
      "Milestone gagal diperbarui."
    );
  }

  if (!data) {
    throw new Error(
      "Milestone tidak ditemukan atau akun tidak mempunyai izin."
    );
  }

  return normalizeMilestone(data);
}

export async function deleteMilestone(id) {
  if (!id) {
    throw new Error(
      "ID milestone tidak tersedia."
    );
  }

  const { data, error } = await supabase
    .from(MILESTONE_TABLE)
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    throwCompanyAdminError(
      error,
      "Milestone gagal dihapus."
    );
  }

  if (!data) {
    throw new Error(
      "Milestone tidak ditemukan atau hanya admin yang dapat menghapus."
    );
  }

  return data;
}

/*
 * =========================================================
 * PARTNERS
 * =========================================================
 */

export async function getAdminPartners() {
  const { data, error } = await supabase
    .from(PARTNER_TABLE)
    .select("*")
    .order("sort_order", {
      ascending: true,
    })
    .order("name", {
      ascending: true,
    });

  if (error) {
    throwCompanyAdminError(
      error,
      "Daftar partner gagal dimuat."
    );
  }

  return (data || []).map(
    normalizePartner
  );
}

function createPartnerPayload(
  values,
  userId,
  isCreate = false
) {
  const name = normalizeText(values.name);

  if (!name) {
    throw new Error(
      "Nama partner wajib diisi."
    );
  }

  const payload = {
    name,

    logo_url: nullableText(
      values.logo_url
    ),

    website_url: nullableText(
      values.website_url
    ),

    description: nullableText(
      values.description
    ),

    sort_order: normalizeInteger(
      values.sort_order,
      0,
      0
    ),

    is_active: normalizeBoolean(
      values.is_active,
      true
    ),

    updated_by: userId,
  };

  if (isCreate) {
    payload.created_by = userId;
  }

  return payload;
}

export async function createPartner(
  values = {}
) {
  const userId =
    await getCurrentUserId();

  const payload =
    createPartnerPayload(
      values,
      userId,
      true
    );

  const { data, error } = await supabase
    .from(PARTNER_TABLE)
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    throwCompanyAdminError(
      error,
      "Partner gagal ditambahkan."
    );
  }

  return normalizePartner(data);
}

export async function updatePartner(
  id,
  values = {}
) {
  if (!id) {
    throw new Error(
      "ID partner tidak tersedia."
    );
  }

  const userId =
    await getCurrentUserId();

  const payload =
    createPartnerPayload(
      values,
      userId,
      false
    );

  const { data, error } = await supabase
    .from(PARTNER_TABLE)
    .update(payload)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    throwCompanyAdminError(
      error,
      "Partner gagal diperbarui."
    );
  }

  if (!data) {
    throw new Error(
      "Partner tidak ditemukan atau akun tidak mempunyai izin."
    );
  }

  return normalizePartner(data);
}

export async function deletePartner(id) {
  if (!id) {
    throw new Error(
      "ID partner tidak tersedia."
    );
  }

  const { data, error } = await supabase
    .from(PARTNER_TABLE)
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    throwCompanyAdminError(
      error,
      "Partner gagal dihapus."
    );
  }

  if (!data) {
    throw new Error(
      "Partner tidak ditemukan atau hanya admin yang dapat menghapus."
    );
  }

  return data;
}

/*
 * =========================================================
 * CAREERS
 * =========================================================
 */

export async function getAdminCareers() {
  const { data, error } = await supabase
    .from(CAREER_TABLE)
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throwCompanyAdminError(
      error,
      "Daftar Career gagal dimuat."
    );
  }

  return (data || []).map(
    normalizeCareer
  );
}

function createCareerPayload(
  values,
  userId,
  isCreate = false
) {
  const position = normalizeText(
    values.position
  );

  if (!position) {
    throw new Error(
      "Nama posisi wajib diisi."
    );
  }

  const slug =
    slugify(values.slug) ||
    slugify(position);

  if (!slug) {
    throw new Error(
      "Slug Career tidak valid."
    );
  }

  const status = normalizeText(
    values.status || "draft"
  ).toLowerCase();

  if (!CAREER_STATUSES.includes(status)) {
    throw new Error(
      "Status Career harus draft, open, atau closed."
    );
  }

  const employmentType =
    normalizeText(
      values.employment_type
    ).toLowerCase();

  if (
    employmentType &&
    !EMPLOYMENT_TYPES.includes(
      employmentType
    )
  ) {
    throw new Error(
      "Jenis pekerjaan tidak sesuai aturan database."
    );
  }

  const payload = {
    position,
    slug,

    department: nullableText(
      values.department
    ),

    location: nullableText(
      values.location
    ),

    employment_type:
      employmentType || null,

    description: nullableText(
      values.description
    ),

    requirements:
      normalizeRequirements(
        values.requirements
      ),

    closing_date: nullableText(
      values.closing_date
    ),

    status,

    seo_title: nullableText(
      values.seo_title
    ),

    seo_description: nullableText(
      values.seo_description
    ),

    updated_by: userId,
  };

  if (isCreate) {
    payload.created_by = userId;
  }

  return payload;
}

export async function createCareer(
  values = {}
) {
  const userId =
    await getCurrentUserId();

  const payload =
    createCareerPayload(
      values,
      userId,
      true
    );

  const { data, error } = await supabase
    .from(CAREER_TABLE)
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    throwCompanyAdminError(
      error,
      "Career gagal ditambahkan."
    );
  }

  return normalizeCareer(data);
}

export async function updateCareer(
  id,
  values = {}
) {
  if (!id) {
    throw new Error(
      "ID Career tidak tersedia."
    );
  }

  const userId =
    await getCurrentUserId();

  const payload =
    createCareerPayload(
      values,
      userId,
      false
    );

  const { data, error } = await supabase
    .from(CAREER_TABLE)
    .update(payload)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    throwCompanyAdminError(
      error,
      "Career gagal diperbarui."
    );
  }

  if (!data) {
    throw new Error(
      "Career tidak ditemukan atau akun tidak mempunyai izin."
    );
  }

  return normalizeCareer(data);
}

export async function deleteCareer(id) {
  if (!id) {
    throw new Error(
      "ID Career tidak tersedia."
    );
  }

  const { data, error } = await supabase
    .from(CAREER_TABLE)
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    throwCompanyAdminError(
      error,
      "Career gagal dihapus."
    );
  }

  if (!data) {
    throw new Error(
      "Career tidak ditemukan atau hanya admin yang dapat menghapus."
    );
  }

  return data;
}

/*
 * =========================================================
 * STORAGE
 * =========================================================
 */

function getUploadConfiguration(assetType) {
  switch (assetType) {
    case "partner":
      return {
        bucket: PARTNER_LOGOS_BUCKET,
        folder: "partners",
        maxSize: 3 * 1024 * 1024,
      };

    case "milestone":
      return {
        bucket: SITE_ASSETS_BUCKET,
        folder: "milestones",
        maxSize: 5 * 1024 * 1024,
      };

    case "company":
    default:
      return {
        bucket: SITE_ASSETS_BUCKET,
        folder: "company",
        maxSize: 5 * 1024 * 1024,
      };
  }
}

export async function uploadCompanyImage(
  file,
  assetType = "company"
) {
  if (!(file instanceof File)) {
    throw new Error(
      "File gambar tidak tersedia."
    );
  }

  if (
    !ALLOWED_IMAGE_TYPES.includes(
      file.type
    )
  ) {
    throw new Error(
      "Format gambar harus JPG, PNG, atau WebP."
    );
  }

  const configuration =
    getUploadConfiguration(assetType);

  if (file.size > configuration.maxSize) {
    const maxSizeInMB = Math.round(
      configuration.maxSize /
        (1024 * 1024)
    );

    throw new Error(
      `Ukuran gambar maksimal ${maxSizeInMB} MB.`
    );
  }

  const fileName =
    createUniqueFileName(file.name);

  const filePath =
    `${configuration.folder}/${fileName}`;

  const { error } = await supabase.storage
    .from(configuration.bucket)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (error) {
    throwCompanyAdminError(
      error,
      "Gambar gagal diunggah."
    );
  }

  const { data } = supabase.storage
    .from(configuration.bucket)
    .getPublicUrl(filePath);

  return {
    bucket: configuration.bucket,
    filePath,
    publicUrl: data.publicUrl,
  };
}

function getStorageInformationFromUrl(
  publicUrl
) {
  const normalizedUrl =
    normalizeText(publicUrl);

  if (!normalizedUrl) {
    return null;
  }

  const bucketNames = [
    SITE_ASSETS_BUCKET,
    PARTNER_LOGOS_BUCKET,
  ];

  for (const bucket of bucketNames) {
    const marker =
      `/storage/v1/object/public/${bucket}/`;

    const markerIndex =
      normalizedUrl.indexOf(marker);

    if (markerIndex < 0) {
      continue;
    }

    const rawPath = normalizedUrl.slice(
      markerIndex + marker.length
    );

    return {
      bucket,
      filePath: decodeURIComponent(
        rawPath.split("?")[0]
      ),
    };
  }

  return null;
}

export async function deleteCompanyImage(
  value,
  bucketHint = ""
) {
  if (!value) {
    return false;
  }

  let bucket = normalizeText(bucketHint);
  let filePath = "";

  if (typeof value === "object") {
    bucket =
      normalizeText(value.bucket) ||
      bucket;

    filePath = normalizeText(
      value.filePath
    );

    if (
      !filePath &&
      value.publicUrl
    ) {
      const storageInformation =
        getStorageInformationFromUrl(
          value.publicUrl
        );

      bucket =
        storageInformation?.bucket ||
        bucket;

      filePath =
        storageInformation?.filePath ||
        "";
    }
  } else {
    const storageInformation =
      getStorageInformationFromUrl(
        value
      );

    if (storageInformation) {
      bucket =
        storageInformation.bucket;

      filePath =
        storageInformation.filePath;
    } else {
      filePath = normalizeText(value);
    }
  }

  if (!bucket || !filePath) {
    return false;
  }

  const { error } = await supabase.storage
    .from(bucket)
    .remove([filePath]);

  if (error) {
    throwCompanyAdminError(
      error,
      "Gambar gagal dihapus dari Storage."
    );
  }

  return true;
}

export async function uploadPartnerLogo(
  file
) {
  return uploadCompanyImage(
    file,
    "partner"
  );
}

export async function uploadMilestoneImage(
  file
) {
  return uploadCompanyImage(
    file,
    "milestone"
  );
}

export async function uploadCompanyProfilePdf(file) {
  if (!(file instanceof File)) {
    throw new Error(
      "File company profile tidak tersedia."
    );
  }

  if (file.type !== "application/pdf") {
    throw new Error(
      "File company profile harus berformat PDF."
    );
  }

  const maximumFileSize =
    10 * 1024 * 1024;

  if (file.size > maximumFileSize) {
    throw new Error(
      "Ukuran file PDF maksimal 10 MB."
    );
  }

  const fileName =
    createUniqueFileName(file.name);

  const filePath =
    `company-profile/${fileName}`;

  const { error } = await supabase.storage
    .from(SITE_ASSETS_BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: "application/pdf",
    });

  if (error) {
    throwCompanyAdminError(
      error,
      "File company profile gagal diunggah."
    );
  }

  const { data } = supabase.storage
    .from(SITE_ASSETS_BUCKET)
    .getPublicUrl(filePath);

  return {
    bucket: SITE_ASSETS_BUCKET,
    filePath,
    publicUrl: data.publicUrl,
  };
}