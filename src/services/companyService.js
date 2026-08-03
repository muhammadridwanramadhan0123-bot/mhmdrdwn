import { supabase } from "../lib/supabase";

const COMPANY_PROFILE_TABLE = "company_profile";
const MILESTONE_TABLE = "milestones";
const PARTNER_TABLE = "partners";
const CAREER_TABLE = "careers";
const SITE_SETTINGS_TABLE = "site_settings";

function normalizeText(value) {
  return String(value ?? "").trim();
}

function parseSettingValue(value) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== "string") {
    return value;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "";
  }

  try {
    return JSON.parse(trimmedValue);
  } catch {
    return trimmedValue;
  }
}

function throwCompanyError(error, fallbackMessage) {
  console.error(fallbackMessage, error);

  if (error?.code === "42501") {
    throw new Error(
      "Akses data Company ditolak oleh policy RLS Supabase."
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
      "Akses data Company ditolak oleh policy RLS Supabase."
    );
  }

  throw new Error(
    error?.message || fallbackMessage
  );
}

function normalizeCompanyProfile(
  profile,
  settings = {}
) {
  const settingsProfile =
    typeof settings.company_profile === "object" &&
    settings.company_profile !== null
      ? settings.company_profile
      : {};

  return {
    id: profile?.id ?? null,

    company_name:
      normalizeText(
        profile?.nama_perusahaan
      ) ||
      normalizeText(
        settings.company_name
      ) ||
      normalizeText(
        settingsProfile.company_name
      ) ||
      "Jasa Medika Transmedic",

    short_description:
      normalizeText(
        profile?.deskripsi_singkat
      ) ||
      normalizeText(
        settings.company_description
      ) ||
      normalizeText(
        settingsProfile.description
      ),

    vision:
      normalizeText(profile?.visi) ||
      normalizeText(settings.vision) ||
      normalizeText(
        settingsProfile.vision
      ),

    mission:
      normalizeText(profile?.misi) ||
      normalizeText(settings.mission) ||
      normalizeText(
        settingsProfile.mission
      ),

    address:
      normalizeText(profile?.alamat) ||
      normalizeText(settings.address) ||
      normalizeText(
        settingsProfile.address
      ),

    email:
      normalizeText(
        profile?.kontak_email
      ) ||
      normalizeText(settings.email) ||
      normalizeText(
        settingsProfile.email
      ),

    phone:
      normalizeText(
        profile?.kontak_telepon
      ) ||
      normalizeText(settings.phone) ||
      normalizeText(
        settingsProfile.phone
      ),

    whatsapp:
      normalizeText(
        settings.whatsapp
      ) ||
      normalizeText(
        settingsProfile.whatsapp
      ),

    website:
      normalizeText(profile?.website) ||
      normalizeText(settings.website) ||
      normalizeText(
        settingsProfile.website
      ),

    logo_url:
      normalizeText(profile?.logo_url) ||
      normalizeText(settings.logo_url) ||
      normalizeText(
        settingsProfile.logo_url
      ),

    company_profile_pdf_url:
      normalizeText(
        profile?.company_profile_pdf_url
      ) ||
      normalizeText(
        settings.company_profile_pdf_url
      ),

    instagram_url:
      normalizeText(
        settings.instagram_url
      ) ||
      normalizeText(
        settings.instagram
      ) ||
      normalizeText(
        settingsProfile.instagram_url
      ),

    linkedin_url:
      normalizeText(
        settings.linkedin_url
      ) ||
      normalizeText(
        settingsProfile.linkedin_url
      ),
  };
}

function normalizeMilestone(record) {
  return {
    ...record,
    year: Number(record?.year) || null,
    title: normalizeText(record?.title),
    description: normalizeText(
      record?.description
    ),
    image_url: normalizeText(
      record?.image_url
    ),
    sort_order:
      Number(record?.sort_order) || 0,
    is_active: Boolean(record?.is_active),
  };
}

function normalizePartner(record) {
  return {
    ...record,
    name: normalizeText(record?.name),
    description: normalizeText(
      record?.description
    ),
    logo_url: normalizeText(
      record?.logo_url
    ),
    website_url: normalizeText(
      record?.website_url
    ),
    sort_order:
      Number(record?.sort_order) || 0,
    is_active: Boolean(record?.is_active),
  };
}

export function normalizeCareerRequirements(
  value
) {
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
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return [];
    }

    try {
      const parsedValue =
        JSON.parse(trimmedValue);

      if (Array.isArray(parsedValue)) {
        return parsedValue
          .map((item) =>
            normalizeText(item)
          )
          .filter(Boolean);
      }
    } catch {
      // Lanjutkan sebagai teks biasa.
    }

    return trimmedValue
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeCareer(record) {
  return {
    ...record,
    position: normalizeText(
      record?.position
    ),
    slug: normalizeText(record?.slug),
    department: normalizeText(
      record?.department
    ),
    location: normalizeText(
      record?.location
    ),
    employment_type: normalizeText(
      record?.employment_type
    ),
    description: normalizeText(
      record?.description
    ),
    requirements:
      normalizeCareerRequirements(
        record?.requirements
      ),
    status: normalizeText(
      record?.status
    ).toLowerCase(),
  };
}

/*
 * Mengambil semua Site Settings publik.
 *
 * Mendukung dua struktur sekaligus:
 * 1. setting_key + setting_value
 * 2. kolom langsung seperti company_name,
 *    email, phone, address, dan logo_url
 */
export async function getPublicSiteSettings() {
  const { data, error } = await supabase
    .from(SITE_SETTINGS_TABLE)
    .select("*")
    .eq("is_public", true)
    .order("updated_at", {
      ascending: false,
    });

  if (error) {
    throwCompanyError(
      error,
      "Site Settings gagal dimuat."
    );
  }

  const settings = {};

  for (const row of data || []) {
    const settingKey = normalizeText(
      row.setting_key
    );

    if (
      settingKey &&
      settings[settingKey] === undefined
    ) {
      settings[settingKey] =
        parseSettingValue(
          row.setting_value
        );
    }

    const directColumns = [
      "company_name",
      "tagline",
      "email",
      "phone",
      "whatsapp",
      "address",
      "logo_url",
      "instagram_url",
      "linkedin_url",
    ];

    for (const columnName of directColumns) {
      const columnValue = row[columnName];

      if (
        settings[columnName] === undefined &&
        columnValue !== null &&
        columnValue !== ""
      ) {
        settings[columnName] =
          columnValue;
      }
    }
  }

  return settings;
}

/*
 * Mengambil profil utama perusahaan.
 *
 * company_profile diprioritaskan.
 * site_settings menjadi fallback.
 */
export async function getCompanyProfile() {
  const settings =
    await getPublicSiteSettings();

  const { data, error } = await supabase
    .from(COMPANY_PROFILE_TABLE)
    .select("*")
    .order("id", {
      ascending: true,
    })
    .limit(1)
    .maybeSingle();

  if (error) {
    throwCompanyError(
      error,
      "Profil perusahaan gagal dimuat."
    );
  }

  return normalizeCompanyProfile(
    data,
    settings
  );
}

/*
 * Mengambil milestone aktif.
 */
export async function getCompanyMilestones() {
  const { data, error } = await supabase
    .from(MILESTONE_TABLE)
    .select("*")
    .eq("is_active", true)
    .order("sort_order", {
      ascending: true,
    })
    .order("year", {
      ascending: true,
    });

  if (error) {
    throwCompanyError(
      error,
      "Milestone perusahaan gagal dimuat."
    );
  }

  return (data || []).map(
    normalizeMilestone
  );
}

/*
 * Mengambil partner aktif.
 */
export async function getCompanyPartners() {
  const { data, error } = await supabase
    .from(PARTNER_TABLE)
    .select("*")
    .eq("is_active", true)
    .order("sort_order", {
      ascending: true,
    })
    .order("name", {
      ascending: true,
    });

  if (error) {
    throwCompanyError(
      error,
      "Partner perusahaan gagal dimuat."
    );
  }

  return (data || []).map(
    normalizePartner
  );
}

/*
 * Mengambil lowongan yang sedang dibuka.
 *
 * Status publik tabel careers adalah:
 * status = open
 */
export async function getOpenCareers() {
  const { data, error } = await supabase
    .from(CAREER_TABLE)
    .select("*")
    .eq("status", "open")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throwCompanyError(
      error,
      "Lowongan pekerjaan gagal dimuat."
    );
  }

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  return (data || [])
    .map(normalizeCareer)
    .filter((career) => {
      if (!career.closing_date) {
        return true;
      }

      const closingDate = new Date(
        `${career.closing_date}T00:00:00`
      );

      if (
        Number.isNaN(
          closingDate.getTime()
        )
      ) {
        return true;
      }

      return closingDate >= today;
    });
}

/*
 * Mengambil seluruh data Company sekaligus.
 *
 * Promise.allSettled dipakai agar satu modul
 * yang gagal tidak mematikan halaman lain.
 */
export async function getCompanyPublicData() {
  const results = await Promise.allSettled([
    getCompanyProfile(),
    getCompanyMilestones(),
    getCompanyPartners(),
    getOpenCareers(),
  ]);

  const [
    profileResult,
    milestoneResult,
    partnerResult,
    careerResult,
  ] = results;

  const errors = [];

  if (profileResult.status === "rejected") {
    errors.push({
      module: "About Us dan Location",
      error: profileResult.reason,
    });
  }

  if (
    milestoneResult.status === "rejected"
  ) {
    errors.push({
      module: "Milestone",
      error: milestoneResult.reason,
    });
  }

  if (partnerResult.status === "rejected") {
    errors.push({
      module: "Partners",
      error: partnerResult.reason,
    });
  }

  if (careerResult.status === "rejected") {
    errors.push({
      module: "Career",
      error: careerResult.reason,
    });
  }

  return {
    profile:
      profileResult.status === "fulfilled"
        ? profileResult.value
        : normalizeCompanyProfile(
            null,
            {}
          ),

    milestones:
      milestoneResult.status === "fulfilled"
        ? milestoneResult.value
        : [],

    partners:
      partnerResult.status === "fulfilled"
        ? partnerResult.value
        : [],

    careers:
      careerResult.status === "fulfilled"
        ? careerResult.value
        : [],

    errors,
  };
}