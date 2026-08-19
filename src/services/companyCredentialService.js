import { supabase } from "../lib/supabase";

/*
 * ======================================================
 * TABLES
 * ======================================================
 */

const CERTIFICATIONS_TABLE =
  "certifications";

const AWARDS_TABLE =
  "awards";

const CERTIFICATION_TRANSLATIONS_TABLE =
  "certification_translations";

const AWARD_TRANSLATIONS_TABLE =
  "award_translations";

/*
 * ======================================================
 * STORAGE
 * ======================================================
 */

const CERTIFICATION_BUCKET =
  "certification-files";

const AWARD_BUCKET =
  "award-images";


export const CERTIFICATION_CATEGORIES = [
  "ISO",
  "Hak Cipta",
  "PSE",
  "BSSN",
  "Sertifikat Lain",
];


const IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];


const CERTIFICATION_FILE_TYPES = [
  ...IMAGE_TYPES,
  "application/pdf",
];


/*
 * ======================================================
 * LANGUAGE
 * ======================================================
 */

function normalizePublicLocale(
  locale = "id"
) {
  return locale === "en"
    ? "en"
    : "id";
}


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
    typeof translatedValue ===
    "string"
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


function nullableText(value) {
  const normalizedValue =
    normalizeText(value);

  return normalizedValue ||
    null;
}


function normalizeBoolean(
  value,
  fallback = false
) {
  if (
    typeof value ===
    "boolean"
  ) {
    return value;
  }

  if (
    value === "true" ||
    value === 1
  ) {
    return true;
  }

  if (
    value === "false" ||
    value === 0
  ) {
    return false;
  }

  return fallback;
}


function normalizeInteger(
  value,
  fallback = 0,
  minimum = 0
) {
  const parsedValue =
    Number.parseInt(
      value,
      10
    );

  if (
    !Number.isFinite(
      parsedValue
    )
  ) {
    return fallback;
  }

  return Math.max(
    parsedValue,
    minimum
  );
}


function normalizeOptionalYear(
  value
) {
  if (
    value === "" ||
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const year =
    Number.parseInt(
      value,
      10
    );

  if (
    !Number.isFinite(year) ||
    year < 1900 ||
    year > 2200
  ) {
    throw new Error(
      "Tahun harus berada antara 1900 dan 2200."
    );
  }

  return year;
}


function sanitizeFileName(
  fileName
) {
  const normalizedName =
    normalizeText(fileName) ||
    "file";

  const lastDotIndex =
    normalizedName.lastIndexOf(
      "."
    );

  const extension =
    lastDotIndex >= 0
      ? normalizedName
          .slice(
            lastDotIndex + 1
          )
          .toLowerCase()
      : "";

  const baseName =
    lastDotIndex >= 0
      ? normalizedName.slice(
          0,
          lastDotIndex
        )
      : normalizedName;

  const safeBaseName =
    baseName
      .toLowerCase()
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        ""
      )
      .replace(
        /[^a-z0-9]+/g,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        ""
      );

  const finalBaseName =
    safeBaseName ||
    "file";

  return extension
    ? `${finalBaseName}.${extension}`
    : finalBaseName;
}


function createUniqueFileName(
  fileName
) {
  const safeFileName =
    sanitizeFileName(
      fileName
    );

  const randomPart =
    Math.random()
      .toString(36)
      .slice(2, 10);

  return `${Date.now()}-${randomPart}-${safeFileName}`;
}


/*
 * ======================================================
 * ERROR
 * ======================================================
 */

function handleServiceError(
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
      "Akun tidak memiliki izin untuk melakukan tindakan ini."
    );
  }

  if (
    error?.code === "23514"
  ) {
    throw new Error(
      "Data tidak sesuai dengan aturan database. Periksa kategori, tahun, dan urutan tampil."
    );
  }

  if (
    error?.code === "23502"
  ) {
    throw new Error(
      "Terdapat kolom wajib yang belum diisi."
    );
  }

  const errorMessage =
    normalizeText(
      error?.message
    ).toLowerCase();

  if (
    errorMessage.includes(
      "row-level security"
    )
  ) {
    throw new Error(
      "Tindakan ditolak oleh policy RLS Supabase."
    );
  }

  throw new Error(
    error?.message ||
      fallbackMessage
  );
}


/*
 * ======================================================
 * AUTH
 * ======================================================
 */

async function getCurrentUserId() {
  const {
    data,
    error,
  } =
    await supabase.auth.getUser();

  if (error) {
    handleServiceError(
      error,
      "Pengguna gagal diperiksa."
    );
  }

  const userId =
    data?.user?.id;

  if (!userId) {
    throw new Error(
      "Sesi login tidak ditemukan. Silakan login kembali."
    );
  }

  return userId;
}


/*
 * ======================================================
 * NORMALIZERS
 * ======================================================
 */

function normalizeCertification(
  record
) {
  if (!record) {
    return null;
  }

  return {
    ...record,

    title:
      normalizeText(
        record.title
      ),

    category:
      normalizeText(
        record.category
      ),

    description:
      normalizeText(
        record.description
      ),

    image_url:
      normalizeText(
        record.image_url
      ),

    document_url:
      normalizeText(
        record.document_url
      ),

    issued_year:
      record.issued_year
        ? Number(
            record.issued_year
          )
        : null,

    sort_order:
      Number(
        record.sort_order
      ) || 0,

    is_active:
      Boolean(
        record.is_active
      ),
  };
}


function normalizeAward(record) {
  if (!record) {
    return null;
  }

  return {
    ...record,

    title:
      normalizeText(
        record.title
      ),

    institution:
      normalizeText(
        record.institution
      ),

    description:
      normalizeText(
        record.description
      ),

    year:
      record.year
        ? Number(
            record.year
          )
        : null,

    image_url:
      normalizeText(
        record.image_url
      ),

    sort_order:
      Number(
        record.sort_order
      ) || 0,

    is_active:
      Boolean(
        record.is_active
      ),
  };
}


/*
 * ======================================================
 * TRANSLATION MERGERS
 * ======================================================
 */

function mergeCertificationTranslation(
  certification,
  translation,
  locale = "id"
) {
  const normalizedLocale =
    normalizePublicLocale(
      locale
    );

  if (
    normalizedLocale ===
    "id"
  ) {
    return {
      ...certification,

      locale: "id",

      translation_locale:
        "id",

      has_translation:
        false,
    };
  }

  return {
    ...certification,

    title:
      getTranslatedText(
        translation?.title,
        certification?.title
      ),

    description:
      getTranslatedText(
        translation
          ?.description,
        certification
          ?.description
      ),

    /*
     * category tetap canonical.
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


function mergeAwardTranslation(
  award,
  translation,
  locale = "id"
) {
  const normalizedLocale =
    normalizePublicLocale(
      locale
    );

  if (
    normalizedLocale ===
    "id"
  ) {
    return {
      ...award,

      locale: "id",

      translation_locale:
        "id",

      has_translation:
        false,
    };
  }

  return {
    ...award,

    title:
      getTranslatedText(
        translation?.title,
        award?.title
      ),

    institution:
      getTranslatedText(
        translation
          ?.institution,
        award
          ?.institution
      ),

    description:
      getTranslatedText(
        translation
          ?.description,
        award
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


/*
 * ======================================================
 * TRANSLATION QUERIES
 * ======================================================
 */

async function getCertificationTranslationsByIds(
  certificationIds,
  locale = "id"
) {
  const normalizedLocale =
    normalizePublicLocale(
      locale
    );

  if (
    normalizedLocale ===
      "id" ||
    !Array.isArray(
      certificationIds
    ) ||
    certificationIds.length ===
      0
  ) {
    return [];
  }

  const {
    data,
    error,
  } = await supabase
    .from(
      CERTIFICATION_TRANSLATIONS_TABLE
    )
    .select(`
      id,
      certification_id,
      locale,
      title,
      description,
      status
    `)
    .in(
      "certification_id",
      certificationIds
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
      `Translation Certification locale "${normalizedLocale}" gagal dimuat. Fallback ke Bahasa Indonesia:`,
      error
    );

    return [];
  }

  return data || [];
}


async function getAwardTranslationsByIds(
  awardIds,
  locale = "id"
) {
  const normalizedLocale =
    normalizePublicLocale(
      locale
    );

  if (
    normalizedLocale ===
      "id" ||
    !Array.isArray(
      awardIds
    ) ||
    awardIds.length === 0
  ) {
    return [];
  }

  const {
    data,
    error,
  } = await supabase
    .from(
      AWARD_TRANSLATIONS_TABLE
    )
    .select(`
      id,
      award_id,
      locale,
      title,
      institution,
      description,
      status
    `)
    .in(
      "award_id",
      awardIds
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
      `Translation Award locale "${normalizedLocale}" gagal dimuat. Fallback ke Bahasa Indonesia:`,
      error
    );

    return [];
  }

  return data || [];
}


/*
 * ======================================================
 * PUBLIC CERTIFICATIONS — BILINGUAL
 * ======================================================
 */

export async function getActiveCertifications(
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
      CERTIFICATIONS_TABLE
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
      "created_at",
      {
        ascending: true,
      }
    );

  if (error) {
    handleServiceError(
      error,
      "Sertifikasi gagal dimuat."
    );
  }

  const certifications =
    (data || []).map(
      normalizeCertification
    );

  if (
    normalizedLocale ===
      "id" ||
    certifications.length ===
      0
  ) {
    return certifications.map(
      (certification) =>
        mergeCertificationTranslation(
          certification,
          null,
          "id"
        )
    );
  }

  const certificationIds =
    certifications.map(
      (certification) =>
        certification.id
    );

  const translations =
    await getCertificationTranslationsByIds(
      certificationIds,
      normalizedLocale
    );

  const translationMap =
    new Map(
      translations.map(
        (translation) => [
          translation
            .certification_id,
          translation,
        ]
      )
    );

  return certifications.map(
    (certification) =>
      mergeCertificationTranslation(
        certification,

        translationMap.get(
          certification.id
        ) || null,

        normalizedLocale
      )
  );
}


/*
 * ======================================================
 * ADMIN CERTIFICATIONS
 * ======================================================
 */

export async function getAdminCertifications() {
  const {
    data,
    error,
  } = await supabase
    .from(
      CERTIFICATIONS_TABLE
    )
    .select("*")
    .order(
      "sort_order",
      {
        ascending: true,
      }
    )
    .order(
      "created_at",
      {
        ascending: false,
      }
    );

  if (error) {
    handleServiceError(
      error,
      "Daftar sertifikasi gagal dimuat."
    );
  }

  return (data || []).map(
    normalizeCertification
  );
}


function createCertificationPayload(
  values,
  userId,
  isCreate = false
) {
  const title =
    normalizeText(
      values.title
    );

  if (!title) {
    throw new Error(
      "Judul sertifikasi wajib diisi."
    );
  }

  const category =
    normalizeText(
      values.category
    );

  if (
    !CERTIFICATION_CATEGORIES.includes(
      category
    )
  ) {
    throw new Error(
      "Kategori sertifikasi tidak valid."
    );
  }

  const payload = {
    title,
    category,

    description:
      nullableText(
        values.description
      ),

    image_url:
      nullableText(
        values.image_url
      ),

    document_url:
      nullableText(
        values.document_url
      ),

    issued_year:
      normalizeOptionalYear(
        values.issued_year
      ),

    sort_order:
      normalizeInteger(
        values.sort_order,
        0,
        0
      ),

    is_active:
      normalizeBoolean(
        values.is_active,
        true
      ),

    updated_by:
      userId,

    updated_at:
      new Date()
        .toISOString(),
  };

  if (isCreate) {
    payload.created_by =
      userId;
  }

  return payload;
}


export async function createCertification(
  values = {}
) {
  const userId =
    await getCurrentUserId();

  const payload =
    createCertificationPayload(
      values,
      userId,
      true
    );

  const {
    data,
    error,
  } = await supabase
    .from(
      CERTIFICATIONS_TABLE
    )
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    handleServiceError(
      error,
      "Sertifikasi gagal ditambahkan."
    );
  }

  return normalizeCertification(
    data
  );
}


export async function updateCertification(
  id,
  values = {}
) {
  if (!id) {
    throw new Error(
      "ID sertifikasi tidak tersedia."
    );
  }

  const userId =
    await getCurrentUserId();

  const payload =
    createCertificationPayload(
      values,
      userId,
      false
    );

  const {
    data,
    error,
  } = await supabase
    .from(
      CERTIFICATIONS_TABLE
    )
    .update(payload)
    .eq(
      "id",
      id
    )
    .select("*")
    .maybeSingle();

  if (error) {
    handleServiceError(
      error,
      "Sertifikasi gagal diperbarui."
    );
  }

  if (!data) {
    throw new Error(
      "Sertifikasi tidak ditemukan atau akun tidak memiliki izin."
    );
  }

  return normalizeCertification(
    data
  );
}


export async function deleteCertification(
  id
) {
  if (!id) {
    throw new Error(
      "ID sertifikasi tidak tersedia."
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from(
      CERTIFICATIONS_TABLE
    )
    .delete()
    .eq(
      "id",
      id
    )
    .select("id")
    .maybeSingle();

  if (error) {
    handleServiceError(
      error,
      "Sertifikasi gagal dihapus."
    );
  }

  if (!data) {
    throw new Error(
      "Sertifikasi tidak ditemukan atau hanya admin yang dapat menghapus."
    );
  }

  return data;
}


/*
 * ======================================================
 * PUBLIC AWARDS — BILINGUAL
 * ======================================================
 */

export async function getActiveAwards(
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
      AWARDS_TABLE
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
      "created_at",
      {
        ascending: true,
      }
    );

  if (error) {
    handleServiceError(
      error,
      "Penghargaan gagal dimuat."
    );
  }

  const awards =
    (data || []).map(
      normalizeAward
    );

  if (
    normalizedLocale ===
      "id" ||
    awards.length === 0
  ) {
    return awards.map(
      (award) =>
        mergeAwardTranslation(
          award,
          null,
          "id"
        )
    );
  }

  const awardIds =
    awards.map(
      (award) =>
        award.id
    );

  const translations =
    await getAwardTranslationsByIds(
      awardIds,
      normalizedLocale
    );

  const translationMap =
    new Map(
      translations.map(
        (translation) => [
          translation.award_id,
          translation,
        ]
      )
    );

  return awards.map(
    (award) =>
      mergeAwardTranslation(
        award,

        translationMap.get(
          award.id
        ) || null,

        normalizedLocale
      )
  );
}


/*
 * ======================================================
 * ADMIN AWARDS
 * ======================================================
 */

export async function getAdminAwards() {
  const {
    data,
    error,
  } = await supabase
    .from(
      AWARDS_TABLE
    )
    .select("*")
    .order(
      "sort_order",
      {
        ascending: true,
      }
    )
    .order(
      "created_at",
      {
        ascending: false,
      }
    );

  if (error) {
    handleServiceError(
      error,
      "Daftar penghargaan gagal dimuat."
    );
  }

  return (data || []).map(
    normalizeAward
  );
}


function createAwardPayload(
  values,
  userId,
  isCreate = false
) {
  const title =
    normalizeText(
      values.title
    );

  if (!title) {
    throw new Error(
      "Nama penghargaan wajib diisi."
    );
  }

  const payload = {
    title,

    institution:
      nullableText(
        values.institution
      ),

    description:
      nullableText(
        values.description
      ),

    year:
      normalizeOptionalYear(
        values.year
      ),

    image_url:
      nullableText(
        values.image_url
      ),

    sort_order:
      normalizeInteger(
        values.sort_order,
        0,
        0
      ),

    is_active:
      normalizeBoolean(
        values.is_active,
        true
      ),

    updated_by:
      userId,

    updated_at:
      new Date()
        .toISOString(),
  };

  if (isCreate) {
    payload.created_by =
      userId;
  }

  return payload;
}


export async function createAward(
  values = {}
) {
  const userId =
    await getCurrentUserId();

  const payload =
    createAwardPayload(
      values,
      userId,
      true
    );

  const {
    data,
    error,
  } = await supabase
    .from(
      AWARDS_TABLE
    )
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    handleServiceError(
      error,
      "Penghargaan gagal ditambahkan."
    );
  }

  return normalizeAward(
    data
  );
}


export async function updateAward(
  id,
  values = {}
) {
  if (!id) {
    throw new Error(
      "ID penghargaan tidak tersedia."
    );
  }

  const userId =
    await getCurrentUserId();

  const payload =
    createAwardPayload(
      values,
      userId,
      false
    );

  const {
    data,
    error,
  } = await supabase
    .from(
      AWARDS_TABLE
    )
    .update(payload)
    .eq(
      "id",
      id
    )
    .select("*")
    .maybeSingle();

  if (error) {
    handleServiceError(
      error,
      "Penghargaan gagal diperbarui."
    );
  }

  if (!data) {
    throw new Error(
      "Penghargaan tidak ditemukan atau akun tidak memiliki izin."
    );
  }

  return normalizeAward(
    data
  );
}


export async function deleteAward(
  id
) {
  if (!id) {
    throw new Error(
      "ID penghargaan tidak tersedia."
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from(
      AWARDS_TABLE
    )
    .delete()
    .eq(
      "id",
      id
    )
    .select("id")
    .maybeSingle();

  if (error) {
    handleServiceError(
      error,
      "Penghargaan gagal dihapus."
    );
  }

  if (!data) {
    throw new Error(
      "Penghargaan tidak ditemukan atau hanya admin yang dapat menghapus."
    );
  }

  return data;
}


/*
 * ======================================================
 * STORAGE
 * ======================================================
 */

async function uploadStorageFile({
  file,
  bucket,
  folder,
  allowedTypes,
  maximumSize,
}) {
  if (
    !(file instanceof File)
  ) {
    throw new Error(
      "File tidak tersedia."
    );
  }

  if (
    !allowedTypes.includes(
      file.type
    )
  ) {
    throw new Error(
      "Format file tidak didukung."
    );
  }

  if (
    file.size >
    maximumSize
  ) {
    const maximumSizeInMb =
      Math.round(
        maximumSize /
          (1024 * 1024)
      );

    throw new Error(
      `Ukuran file maksimal ${maximumSizeInMb} MB.`
    );
  }

  const fileName =
    createUniqueFileName(
      file.name
    );

  const filePath =
    `${folder}/${fileName}`;

  const {
    error,
  } =
    await supabase.storage
      .from(bucket)
      .upload(
        filePath,
        file,
        {
          cacheControl:
            "3600",

          upsert: false,

          contentType:
            file.type,
        }
      );

  if (error) {
    handleServiceError(
      error,
      "File gagal diunggah."
    );
  }

  const {
    data,
  } =
    supabase.storage
      .from(bucket)
      .getPublicUrl(
        filePath
      );

  return {
    bucket,
    filePath,
    publicUrl:
      data.publicUrl,
  };
}


export async function uploadCertificationFile(
  file
) {
  const isPdf =
    file?.type ===
    "application/pdf";

  return uploadStorageFile({
    file,

    bucket:
      CERTIFICATION_BUCKET,

    folder:
      isPdf
        ? "documents"
        : "images",

    allowedTypes:
      CERTIFICATION_FILE_TYPES,

    maximumSize:
      10 * 1024 * 1024,
  });
}


export async function uploadAwardImage(
  file
) {
  return uploadStorageFile({
    file,

    bucket:
      AWARD_BUCKET,

    folder:
      "awards",

    allowedTypes:
      IMAGE_TYPES,

    maximumSize:
      3 * 1024 * 1024,
  });
}


function getStorageInformationFromUrl(
  publicUrl
) {
  const normalizedUrl =
    normalizeText(
      publicUrl
    );

  if (!normalizedUrl) {
    return null;
  }

  const availableBuckets = [
    CERTIFICATION_BUCKET,
    AWARD_BUCKET,
  ];

  for (
    const bucket
    of availableBuckets
  ) {
    const marker =
      `/storage/v1/object/public/${bucket}/`;

    const markerIndex =
      normalizedUrl.indexOf(
        marker
      );

    if (
      markerIndex < 0
    ) {
      continue;
    }

    const rawFilePath =
      normalizedUrl.slice(
        markerIndex +
          marker.length
      );

    return {
      bucket,

      filePath:
        decodeURIComponent(
          rawFilePath
            .split("?")[0]
        ),
    };
  }

  return null;
}


export async function deleteCredentialAsset(
  value
) {
  if (!value) {
    return false;
  }

  let bucket = "";
  let filePath = "";

  if (
    typeof value ===
    "object"
  ) {
    bucket =
      normalizeText(
        value.bucket
      );

    filePath =
      normalizeText(
        value.filePath
      );

    if (
      (!bucket ||
        !filePath) &&
      value.publicUrl
    ) {
      const storageInformation =
        getStorageInformationFromUrl(
          value.publicUrl
        );

      bucket =
        storageInformation
          ?.bucket ||
        bucket;

      filePath =
        storageInformation
          ?.filePath ||
        filePath;
    }
  } else {
    const storageInformation =
      getStorageInformationFromUrl(
        value
      );

    bucket =
      storageInformation
        ?.bucket ||
      "";

    filePath =
      storageInformation
        ?.filePath ||
      "";
  }

  if (
    !bucket ||
    !filePath
  ) {
    return false;
  }

  const {
    error,
  } =
    await supabase.storage
      .from(bucket)
      .remove([
        filePath,
      ]);

  if (error) {
    handleServiceError(
      error,
      "File gagal dihapus dari Storage."
    );
  }

  return true;
}