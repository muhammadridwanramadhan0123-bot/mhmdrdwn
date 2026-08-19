import { supabase } from "../lib/supabase";

/*
 * ======================================================
 * BASE TABLES
 * ======================================================
 */

const COMPANY_PROFILE_TABLE =
  "company_profile";

const MILESTONE_TABLE =
  "milestones";

const PARTNER_TABLE =
  "partners";

const CAREER_TABLE =
  "careers";

const SITE_SETTINGS_TABLE =
  "site_settings";

/*
 * ======================================================
 * TRANSLATION TABLES
 * ======================================================
 */

const COMPANY_PROFILE_TRANSLATION_TABLE =
  "company_profile_translations";

const MILESTONE_TRANSLATION_TABLE =
  "milestone_translations";

const PARTNER_TRANSLATION_TABLE =
  "partner_translations";

const CAREER_TRANSLATION_TABLE =
  "career_translations";

/*
 * ======================================================
 * LANGUAGE HELPERS
 * ======================================================
 */

/**
 * Locale publik yang didukung.
 *
 * Saat ini:
 * - id
 * - en
 *
 * Locale lain otomatis fallback ke ID.
 */
function normalizePublicLocale(
  locale = "id"
) {
  return locale === "en"
    ? "en"
    : "id";
}

/**
 * Mengambil translation jika tersedia.
 *
 * Jika translation:
 * - null
 * - undefined
 * - string kosong
 *
 * maka menggunakan nilai Bahasa Indonesia.
 */
function getTranslatedText(
  translatedValue,
  baseValue
) {
  if (
    translatedValue === null ||
    translatedValue === undefined
  ) {
    return baseValue ?? "";
  }

  if (
    typeof translatedValue === "string"
  ) {
    const normalizedValue =
      translatedValue.trim();

    if (!normalizedValue) {
      return baseValue ?? "";
    }

    return translatedValue;
  }

  return translatedValue;
}

/*
 * ======================================================
 * GENERAL HELPERS
 * ======================================================
 */

function normalizeText(value) {
  return String(
    value ?? ""
  ).trim();
}

function parseSettingValue(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  if (
    typeof value !== "string"
  ) {
    return value;
  }

  const trimmedValue =
    value.trim();

  if (!trimmedValue) {
    return "";
  }

  try {
    return JSON.parse(
      trimmedValue
    );
  } catch {
    return trimmedValue;
  }
}

function throwCompanyError(
  error,
  fallbackMessage
) {
  console.error(
    fallbackMessage,
    error
  );

  if (
    error?.code === "42501"
  ) {
    throw new Error(
      "Akses data Company ditolak oleh policy RLS Supabase."
    );
  }

  const message =
    normalizeText(
      error?.message
    ).toLowerCase();

  if (
    message.includes(
      "row-level security"
    ) ||
    message.includes(
      "violates row-level security"
    )
  ) {
    throw new Error(
      "Akses data Company ditolak oleh policy RLS Supabase."
    );
  }

  throw new Error(
    error?.message ||
      fallbackMessage
  );
}

/*
 * ======================================================
 * BASE NORMALIZERS
 * ======================================================
 */

function normalizeCompanyProfile(
  profile,
  settings = {}
) {
  const settingsProfile =
    typeof settings.company_profile ===
      "object" &&
    settings.company_profile !== null
      ? settings.company_profile
      : {};

  return {
    id:
      profile?.id ??
      null,

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
      normalizeText(
        profile?.visi
      ) ||
      normalizeText(
        settings.vision
      ) ||
      normalizeText(
        settingsProfile.vision
      ),

    mission:
      normalizeText(
        profile?.misi
      ) ||
      normalizeText(
        settings.mission
      ) ||
      normalizeText(
        settingsProfile.mission
      ),

    address:
      normalizeText(
        profile?.alamat
      ) ||
      normalizeText(
        settings.address
      ) ||
      normalizeText(
        settingsProfile.address
      ),

    email:
      normalizeText(
        profile?.kontak_email
      ) ||
      normalizeText(
        settings.email
      ) ||
      normalizeText(
        settingsProfile.email
      ),

    phone:
      normalizeText(
        profile?.kontak_telepon
      ) ||
      normalizeText(
        settings.phone
      ) ||
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
      normalizeText(
        profile?.website
      ) ||
      normalizeText(
        settings.website
      ) ||
      normalizeText(
        settingsProfile.website
      ),

    logo_url:
      normalizeText(
        profile?.logo_url
      ) ||
      normalizeText(
        settings.logo_url
      ) ||
      normalizeText(
        settingsProfile.logo_url
      ),

    company_profile_pdf_url:
      normalizeText(
        profile
          ?.company_profile_pdf_url
      ) ||
      normalizeText(
        settings
          .company_profile_pdf_url
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

function normalizeMilestone(
  record
) {
  return {
    ...record,

    year:
      Number(
        record?.year
      ) || null,

    title:
      normalizeText(
        record?.title
      ),

    description:
      normalizeText(
        record?.description
      ),

    image_url:
      normalizeText(
        record?.image_url
      ),

    sort_order:
      Number(
        record?.sort_order
      ) || 0,

    is_active:
      Boolean(
        record?.is_active
      ),
  };
}

function normalizePartner(
  record
) {
  return {
    ...record,

    name:
      normalizeText(
        record?.name
      ),

    description:
      normalizeText(
        record?.description
      ),

    logo_url:
      normalizeText(
        record?.logo_url
      ),

    website_url:
      normalizeText(
        record?.website_url
      ),

    sort_order:
      Number(
        record?.sort_order
      ) || 0,

    is_active:
      Boolean(
        record?.is_active
      ),
  };
}

/*
 * ======================================================
 * CAREER REQUIREMENTS
 * ======================================================
 */

export function normalizeCareerRequirements(
  value
) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map((item) =>
        normalizeText(
          item
        )
      )
      .filter(Boolean);
  }

  if (
    typeof value === "string"
  ) {
    const trimmedValue =
      value.trim();

    if (!trimmedValue) {
      return [];
    }

    try {
      const parsedValue =
        JSON.parse(
          trimmedValue
        );

      if (
        Array.isArray(
          parsedValue
        )
      ) {
        return parsedValue
          .map((item) =>
            normalizeText(
              item
            )
          )
          .filter(Boolean);
      }
    } catch {
      /*
       * Lanjutkan sebagai
       * teks biasa.
       */
    }

    return trimmedValue
      .split(/\r?\n|,/)
      .map((item) =>
        item.trim()
      )
      .filter(Boolean);
  }

  return [];
}

function normalizeCareer(
  record
) {
  return {
    ...record,

    position:
      normalizeText(
        record?.position
      ),

    slug:
      normalizeText(
        record?.slug
      ),

    department:
      normalizeText(
        record?.department
      ),

    location:
      normalizeText(
        record?.location
      ),

    employment_type:
      normalizeText(
        record?.employment_type
      ),

    description:
      normalizeText(
        record?.description
      ),

    requirements:
      normalizeCareerRequirements(
        record?.requirements
      ),

    seo_title:
      normalizeText(
        record?.seo_title
      ),

    seo_description:
      normalizeText(
        record?.seo_description
      ),

    status:
      normalizeText(
        record?.status
      ).toLowerCase(),
  };
}

/*
 * ======================================================
 * TRANSLATION MERGERS
 * ======================================================
 */

function mergeCompanyProfileTranslation(
  profile,
  translation,
  locale = "id"
) {
  const normalizedLocale =
    normalizePublicLocale(
      locale
    );

  if (
    normalizedLocale === "id"
  ) {
    return {
      ...profile,

      locale: "id",

      translation_locale:
        "id",

      has_translation:
        false,
    };
  }

  return {
    ...profile,

    short_description:
      getTranslatedText(
        translation
          ?.short_description,
        profile
          ?.short_description
      ),

    vision:
      getTranslatedText(
        translation?.vision,
        profile?.vision
      ),

    mission:
      getTranslatedText(
        translation?.mission,
        profile?.mission
      ),

    locale:
      normalizedLocale,

    translation_locale:
      translation
        ? normalizedLocale
        : "id",

    has_translation:
      Boolean(
        translation
      ),
  };
}

function mergeMilestoneTranslation(
  milestone,
  translation,
  locale = "id"
) {
  const normalizedLocale =
    normalizePublicLocale(
      locale
    );

  if (
    normalizedLocale === "id"
  ) {
    return {
      ...milestone,

      locale: "id",

      translation_locale:
        "id",

      has_translation:
        false,
    };
  }

  return {
    ...milestone,

    title:
      getTranslatedText(
        translation?.title,
        milestone?.title
      ),

    description:
      getTranslatedText(
        translation
          ?.description,
        milestone
          ?.description
      ),

    locale:
      normalizedLocale,

    translation_locale:
      translation
        ? normalizedLocale
        : "id",

    has_translation:
      Boolean(
        translation
      ),
  };
}

function mergePartnerTranslation(
  partner,
  translation,
  locale = "id"
) {
  const normalizedLocale =
    normalizePublicLocale(
      locale
    );

  if (
    normalizedLocale === "id"
  ) {
    return {
      ...partner,

      locale: "id",

      translation_locale:
        "id",

      has_translation:
        false,
    };
  }

  return {
    ...partner,

    /*
     * Nama organisasi tetap
     * berasal dari parent.
     */

    description:
      getTranslatedText(
        translation
          ?.description,
        partner?.description
      ),

    locale:
      normalizedLocale,

    translation_locale:
      translation
        ? normalizedLocale
        : "id",

    has_translation:
      Boolean(
        translation
      ),
  };
}

function mergeCareerTranslation(
  career,
  translation,
  locale = "id"
) {
  const normalizedLocale =
    normalizePublicLocale(
      locale
    );

  if (
    normalizedLocale === "id"
  ) {
    return {
      ...career,

      locale: "id",

      translation_locale:
        "id",

      has_translation:
        false,
    };
  }

  const translatedRequirements =
    normalizeCareerRequirements(
      translation
        ?.requirements
    );

  const baseRequirements =
    normalizeCareerRequirements(
      career?.requirements
    );

  return {
    ...career,

    position:
      getTranslatedText(
        translation?.position,
        career?.position
      ),

    department:
      getTranslatedText(
        translation
          ?.department,
        career?.department
      ),

    description:
      getTranslatedText(
        translation
          ?.description,
        career?.description
      ),

    requirements:
      translatedRequirements
        .length > 0
        ? translatedRequirements
        : baseRequirements,

    seo_title:
      getTranslatedText(
        translation
          ?.seo_title,
        career?.seo_title
      ),

    seo_description:
      getTranslatedText(
        translation
          ?.seo_description,
        career
          ?.seo_description
      ),

    /*
     * Tetap structural:
     *
     * slug
     * location
     * employment_type
     * closing_date
     * status
     */

    locale:
      normalizedLocale,

    translation_locale:
      translation
        ? normalizedLocale
        : "id",

    has_translation:
      Boolean(
        translation
      ),
  };
}

/*
 * ======================================================
 * TRANSLATION QUERIES
 * ======================================================
 */

/*
 * Translation error tidak boleh
 * mematikan halaman publik.
 *
 * Jika query translation gagal:
 *
 * console.warn()
 * ↓
 * fallback ke Bahasa Indonesia
 */

async function getCompanyProfileTranslation(
  companyProfileId,
  locale = "id"
) {
  const normalizedLocale =
    normalizePublicLocale(
      locale
    );

  if (
    normalizedLocale === "id" ||
    companyProfileId === null ||
    companyProfileId ===
      undefined
  ) {
    return null;
  }

  const {
    data,
    error,
  } = await supabase
    .from(
      COMPANY_PROFILE_TRANSLATION_TABLE
    )
    .select(`
      id,
      company_profile_id,
      locale,
      short_description,
      vision,
      mission,
      status
    `)
    .eq(
      "company_profile_id",
      companyProfileId
    )
    .eq(
      "locale",
      normalizedLocale
    )
    .eq(
      "status",
      "published"
    )
    .maybeSingle();

  if (error) {
    console.warn(
      `Translation Company Profile locale "${normalizedLocale}" gagal dimuat. Fallback ke Bahasa Indonesia:`,
      error
    );

    return null;
  }

  return data || null;
}

async function getMilestoneTranslationsByIds(
  milestoneIds,
  locale = "id"
) {
  const normalizedLocale =
    normalizePublicLocale(
      locale
    );

  if (
    normalizedLocale === "id" ||
    !Array.isArray(
      milestoneIds
    ) ||
    milestoneIds.length === 0
  ) {
    return [];
  }

  const {
    data,
    error,
  } = await supabase
    .from(
      MILESTONE_TRANSLATION_TABLE
    )
    .select(`
      id,
      milestone_id,
      locale,
      title,
      description,
      status
    `)
    .in(
      "milestone_id",
      milestoneIds
    )
    .eq(
      "locale",
      normalizedLocale
    )
    .eq(
      "status",
      "published"
    );

  if (error) {
    console.warn(
      `Translation Milestone locale "${normalizedLocale}" gagal dimuat. Fallback ke Bahasa Indonesia:`,
      error
    );

    return [];
  }

  return data || [];
}

async function getPartnerTranslationsByIds(
  partnerIds,
  locale = "id"
) {
  const normalizedLocale =
    normalizePublicLocale(
      locale
    );

  if (
    normalizedLocale === "id" ||
    !Array.isArray(
      partnerIds
    ) ||
    partnerIds.length === 0
  ) {
    return [];
  }

  const {
    data,
    error,
  } = await supabase
    .from(
      PARTNER_TRANSLATION_TABLE
    )
    .select(`
      id,
      partner_id,
      locale,
      description,
      status
    `)
    .in(
      "partner_id",
      partnerIds
    )
    .eq(
      "locale",
      normalizedLocale
    )
    .eq(
      "status",
      "published"
    );

  if (error) {
    console.warn(
      `Translation Partner locale "${normalizedLocale}" gagal dimuat. Fallback ke Bahasa Indonesia:`,
      error
    );

    return [];
  }

  return data || [];
}

async function getCareerTranslationsByIds(
  careerIds,
  locale = "id"
) {
  const normalizedLocale =
    normalizePublicLocale(
      locale
    );

  if (
    normalizedLocale === "id" ||
    !Array.isArray(
      careerIds
    ) ||
    careerIds.length === 0
  ) {
    return [];
  }

  const {
    data,
    error,
  } = await supabase
    .from(
      CAREER_TRANSLATION_TABLE
    )
    .select(`
      id,
      career_id,
      locale,
      position,
      department,
      description,
      requirements,
      seo_title,
      seo_description,
      status
    `)
    .in(
      "career_id",
      careerIds
    )
    .eq(
      "locale",
      normalizedLocale
    )
    .eq(
      "status",
      "published"
    );

  if (error) {
    console.warn(
      `Translation Career locale "${normalizedLocale}" gagal dimuat. Fallback ke Bahasa Indonesia:`,
      error
    );

    return [];
  }

  return data || [];
}

/*
 * ======================================================
 * SITE SETTINGS
 * ======================================================
 */

/**
 * Mengambil seluruh Site Settings publik.
 *
 * Site Settings tetap structural /
 * fallback existing.
 *
 * Mendukung dua struktur:
 *
 * 1. setting_key + setting_value
 *
 * 2. direct columns seperti:
 *    company_name
 *    email
 *    phone
 *    address
 *    logo_url
 */
export async function getPublicSiteSettings() {
  const {
    data,
    error,
  } = await supabase
    .from(
      SITE_SETTINGS_TABLE
    )
    .select("*")
    .eq(
      "is_public",
      true
    )
    .order(
      "updated_at",
      {
        ascending: false,
      }
    );

  if (error) {
    throwCompanyError(
      error,
      "Site Settings gagal dimuat."
    );
  }

  const settings = {};

  for (
    const row of data || []
  ) {
    const settingKey =
      normalizeText(
        row.setting_key
      );

    if (
      settingKey &&
      settings[
        settingKey
      ] === undefined
    ) {
      settings[
        settingKey
      ] =
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

    for (
      const columnName
      of directColumns
    ) {
      const columnValue =
        row[columnName];

      if (
        settings[
          columnName
        ] === undefined &&
        columnValue !== null &&
        columnValue !== ""
      ) {
        settings[
          columnName
        ] =
          columnValue;
      }
    }
  }

  return settings;
}

/*
 * ======================================================
 * COMPANY PROFILE
 * ======================================================
 */

/**
 * Pemakaian:
 *
 * getCompanyProfile()
 * → Bahasa Indonesia
 *
 * getCompanyProfile("id")
 * → Bahasa Indonesia
 *
 * getCompanyProfile("en")
 * → English + fallback per field ke ID
 */
export async function getCompanyProfile(
  locale = "id"
) {
  const normalizedLocale =
    normalizePublicLocale(
      locale
    );

  /*
   * Site Settings tetap digunakan
   * sebagai fallback existing.
   */
  const settings =
    await getPublicSiteSettings();

  const {
    data,
    error,
  } = await supabase
    .from(
      COMPANY_PROFILE_TABLE
    )
    .select("*")
    .order(
      "id",
      {
        ascending: true,
      }
    )
    .limit(1)
    .maybeSingle();

  if (error) {
    throwCompanyError(
      error,
      "Profil perusahaan gagal dimuat."
    );
  }

  const baseProfile =
    normalizeCompanyProfile(
      data,
      settings
    );

  /*
   * Bahasa Indonesia.
   */
  if (
    normalizedLocale === "id"
  ) {
    return mergeCompanyProfileTranslation(
      baseProfile,
      null,
      "id"
    );
  }

  /*
   * Jika company_profile benar-benar
   * tidak mempunyai record, kita hanya
   * mempunyai fallback site_settings.
   *
   * Dalam kondisi tersebut EN akan
   * fallback ke nilai ID tersebut.
   */
  if (
    data?.id === null ||
    data?.id === undefined
  ) {
    return mergeCompanyProfileTranslation(
      baseProfile,
      null,
      normalizedLocale
    );
  }

  const translation =
    await getCompanyProfileTranslation(
      data.id,
      normalizedLocale
    );

  return mergeCompanyProfileTranslation(
    baseProfile,
    translation,
    normalizedLocale
  );
}

/*
 * ======================================================
 * MILESTONES
 * ======================================================
 */

/**
 * getCompanyMilestones()
 * → ID
 *
 * getCompanyMilestones("en")
 * → EN + fallback ID
 */
export async function getCompanyMilestones(
  locale = "id"
) {
  const normalizedLocale =
    normalizePublicLocale(
      locale
    );

  const {
    data,
    error,
  } = await supabase
    .from(
      MILESTONE_TABLE
    )
    .select("*")
    .eq(
      "is_active",
      true
    )
    .order(
      "sort_order",
      {
        ascending: true,
      }
    )
    .order(
      "year",
      {
        ascending: true,
      }
    );

  if (error) {
    throwCompanyError(
      error,
      "Milestone perusahaan gagal dimuat."
    );
  }

  const milestones =
    (data || []).map(
      normalizeMilestone
    );

  if (
    normalizedLocale === "id" ||
    milestones.length === 0
  ) {
    return milestones.map(
      (milestone) =>
        mergeMilestoneTranslation(
          milestone,
          null,
          "id"
        )
    );
  }

  const milestoneIds =
    milestones.map(
      (milestone) =>
        milestone.id
    );

  const translations =
    await getMilestoneTranslationsByIds(
      milestoneIds,
      normalizedLocale
    );

  const translationMap =
    new Map(
      translations.map(
        (translation) => [
          translation.milestone_id,
          translation,
        ]
      )
    );

  return milestones.map(
    (milestone) =>
      mergeMilestoneTranslation(
        milestone,
        translationMap.get(
          milestone.id
        ) || null,
        normalizedLocale
      )
  );
}

/*
 * ======================================================
 * PARTNERS
 * ======================================================
 */

/**
 * getCompanyPartners()
 * → ID
 *
 * getCompanyPartners("en")
 * → English descriptions
 */
export async function getCompanyPartners(
  locale = "id"
) {
  const normalizedLocale =
    normalizePublicLocale(
      locale
    );

  const {
    data,
    error,
  } = await supabase
    .from(
      PARTNER_TABLE
    )
    .select("*")
    .eq(
      "is_active",
      true
    )
    .order(
      "sort_order",
      {
        ascending: true,
      }
    )
    .order(
      "name",
      {
        ascending: true,
      }
    );

  if (error) {
    throwCompanyError(
      error,
      "Partner perusahaan gagal dimuat."
    );
  }

  const partners =
    (data || []).map(
      normalizePartner
    );

  if (
    normalizedLocale === "id" ||
    partners.length === 0
  ) {
    return partners.map(
      (partner) =>
        mergePartnerTranslation(
          partner,
          null,
          "id"
        )
    );
  }

  const partnerIds =
    partners.map(
      (partner) =>
        partner.id
    );

  const translations =
    await getPartnerTranslationsByIds(
      partnerIds,
      normalizedLocale
    );

  const translationMap =
    new Map(
      translations.map(
        (translation) => [
          translation.partner_id,
          translation,
        ]
      )
    );

  return partners.map(
    (partner) =>
      mergePartnerTranslation(
        partner,
        translationMap.get(
          partner.id
        ) || null,
        normalizedLocale
      )
  );
}

/*
 * ======================================================
 * CAREERS
 * ======================================================
 */

/**
 * Mengambil Career publik:
 *
 * status = open
 *
 * closing_date:
 * - NULL → tampil
 * - hari ini / masa depan → tampil
 * - sudah lewat → tidak tampil
 *
 * getOpenCareers()
 * → ID
 *
 * getOpenCareers("en")
 * → EN + fallback ID
 */
export async function getOpenCareers(
  locale = "id"
) {
  const normalizedLocale =
    normalizePublicLocale(
      locale
    );

  const {
    data,
    error,
  } = await supabase
    .from(
      CAREER_TABLE
    )
    .select("*")
    .eq(
      "status",
      "open"
    )
    .order(
      "created_at",
      {
        ascending: false,
      }
    );

  if (error) {
    throwCompanyError(
      error,
      "Lowongan pekerjaan gagal dimuat."
    );
  }

  /*
   * Pertahankan behavior existing:
   * validasi closing_date juga
   * dilakukan di frontend service.
   */
  const today =
    new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );

  const careers =
    (data || [])
      .map(
        normalizeCareer
      )
      .filter(
        (career) => {
          if (
            !career.closing_date
          ) {
            return true;
          }

          const closingDate =
            new Date(
              `${career.closing_date}T00:00:00`
            );

          if (
            Number.isNaN(
              closingDate
                .getTime()
            )
          ) {
            return true;
          }

          return (
            closingDate >=
            today
          );
        }
      );

  if (
    normalizedLocale === "id" ||
    careers.length === 0
  ) {
    return careers.map(
      (career) =>
        mergeCareerTranslation(
          career,
          null,
          "id"
        )
    );
  }

  const careerIds =
    careers.map(
      (career) =>
        career.id
    );

  const translations =
    await getCareerTranslationsByIds(
      careerIds,
      normalizedLocale
    );

  const translationMap =
    new Map(
      translations.map(
        (translation) => [
          translation.career_id,
          translation,
        ]
      )
    );

  return careers.map(
    (career) =>
      mergeCareerTranslation(
        career,
        translationMap.get(
          career.id
        ) || null,
        normalizedLocale
      )
  );
}

/*
 * ======================================================
 * ALL COMPANY PUBLIC DATA
 * ======================================================
 */

/**
 * Mengambil seluruh data Company.
 *
 * getCompanyPublicData()
 * → ID
 *
 * getCompanyPublicData("en")
 * → EN
 *
 * Promise.allSettled tetap dipertahankan
 * agar satu modul gagal tidak mematikan
 * seluruh halaman Company.
 */
export async function getCompanyPublicData(
  locale = "id"
) {
  const normalizedLocale =
    normalizePublicLocale(
      locale
    );

  const results =
    await Promise.allSettled([
      getCompanyProfile(
        normalizedLocale
      ),

      getCompanyMilestones(
        normalizedLocale
      ),

      getCompanyPartners(
        normalizedLocale
      ),

      getOpenCareers(
        normalizedLocale
      ),
    ]);

  const [
    profileResult,
    milestoneResult,
    partnerResult,
    careerResult,
  ] = results;

  const errors = [];

  if (
    profileResult.status ===
    "rejected"
  ) {
    errors.push({
      module:
        "About Us dan Location",

      error:
        profileResult.reason,
    });
  }

  if (
    milestoneResult.status ===
    "rejected"
  ) {
    errors.push({
      module:
        "Milestone",

      error:
        milestoneResult.reason,
    });
  }

  if (
    partnerResult.status ===
    "rejected"
  ) {
    errors.push({
      module:
        "Partners",

      error:
        partnerResult.reason,
    });
  }

  if (
    careerResult.status ===
    "rejected"
  ) {
    errors.push({
      module:
        "Career",

      error:
        careerResult.reason,
    });
  }

  /*
   * Fallback profile jika
   * module profile gagal total.
   */
  const fallbackProfile =
    mergeCompanyProfileTranslation(
      normalizeCompanyProfile(
        null,
        {}
      ),
      null,
      normalizedLocale
    );

  return {
    profile:
      profileResult.status ===
      "fulfilled"
        ? profileResult.value
        : fallbackProfile,

    milestones:
      milestoneResult.status ===
      "fulfilled"
        ? milestoneResult.value
        : [],

    partners:
      partnerResult.status ===
      "fulfilled"
        ? partnerResult.value
        : [],

    careers:
      careerResult.status ===
      "fulfilled"
        ? careerResult.value
        : [],

    errors,

    locale:
      normalizedLocale,
  };
}