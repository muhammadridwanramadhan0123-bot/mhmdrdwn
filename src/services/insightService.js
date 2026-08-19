import { supabase } from "../lib/supabase";

const INSIGHT_TABLE = "insights";
const INSIGHT_TRANSLATION_TABLE =
  "insight_translations";

const INSIGHT_BUCKET = "insight-images";

const MAX_COVER_SIZE = 2 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

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
 * Locale tidak dikenal akan fallback ke ID.
 */
function normalizePublicLocale(locale = "id") {
  return locale === "en" ? "en" : "id";
}

/**
 * Mengambil nilai translation.
 *
 * Jika translation:
 * - null
 * - undefined
 * - string kosong
 *
 * maka fallback ke Bahasa Indonesia.
 */
function getTranslatedText(
  translatedValue,
  baseValue
) {
  if (
    translatedValue === null ||
    translatedValue === undefined
  ) {
    return baseValue ?? null;
  }

  if (
    typeof translatedValue === "string"
  ) {
    const normalizedValue =
      translatedValue.trim();

    if (!normalizedValue) {
      return baseValue ?? null;
    }

    return translatedValue;
  }

  return translatedValue;
}

/**
 * Menggabungkan data base Insight
 * dengan translation.
 *
 * Yang diterjemahkan:
 * - title
 * - excerpt
 * - content
 * - seo_title
 * - seo_description
 *
 * Yang tetap berasal dari insights:
 * - id
 * - slug
 * - type
 * - category
 * - cover_image_url
 * - image_url
 * - author
 * - author_name
 * - published_at
 * - is_featured
 * - status
 * - timestamps
 */
function mergeInsightTranslation(
  insight,
  translation,
  locale = "id"
) {
  if (!insight) {
    return null;
  }

  const normalizedLocale =
    normalizePublicLocale(locale);

  /*
   * Bahasa Indonesia menggunakan
   * tabel insights langsung.
   */
  if (normalizedLocale === "id") {
    return {
      ...insight,

      locale: "id",

      translation_locale: "id",

      has_translation: false,
    };
  }

  /*
   * English + fallback per field.
   */
  return {
    ...insight,

    title: getTranslatedText(
      translation?.title,
      insight.title
    ),

    excerpt: getTranslatedText(
      translation?.excerpt,
      insight.excerpt
    ),

    content: getTranslatedText(
      translation?.content,
      insight.content
    ),

    seo_title: getTranslatedText(
      translation?.seo_title,
      insight.seo_title
    ),

    seo_description: getTranslatedText(
      translation?.seo_description,
      insight.seo_description
    ),

    locale: normalizedLocale,

    translation_locale: translation
      ? normalizedLocale
      : "id",

    has_translation: Boolean(translation),
  };
}

/*
 * ======================================================
 * GENERAL HELPERS
 * ======================================================
 */

function createUniqueId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

function sanitizeFileName(fileName) {
  return String(fileName || "cover")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._-]/g, "");
}

function validateCoverImage(file) {
  if (!file) return;

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error(
      "Format gambar tidak didukung. Gunakan JPG, PNG, atau WebP."
    );
  }

  if (file.size > MAX_COVER_SIZE) {
    throw new Error(
      "Ukuran gambar terlalu besar. Maksimal 2 MB."
    );
  }
}

function createCoverPath(file) {
  const safeFileName =
    sanitizeFileName(file.name);

  return `covers/${Date.now()}-${createUniqueId()}-${safeFileName}`;
}

function getStoragePathFromPublicUrl(publicUrl) {
  if (!publicUrl) return "";

  const marker =
    `/storage/v1/object/public/${INSIGHT_BUCKET}/`;

  const markerIndex =
    publicUrl.indexOf(marker);

  if (markerIndex === -1) {
    return "";
  }

  return decodeURIComponent(
    publicUrl.slice(
      markerIndex + marker.length
    )
  );
}

function normalizeDateValue(value) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function createInsightPayload(
  values,
  coverImageUrl,
  includeCover = true
) {
  const normalizedStatus = String(
    values.status || "draft"
  )
    .trim()
    .toLowerCase();

  let publishedAt = normalizeDateValue(
    values.published_at
  );

  /*
   * Apabila langsung dipublikasikan
   * tetapi tanggal belum diisi,
   * gunakan tanggal saat ini.
   */
  if (
    normalizedStatus === "published" &&
    !publishedAt
  ) {
    publishedAt =
      new Date().toISOString();
  }

  const payload = {
    title: String(
      values.title || ""
    ).trim(),

    slug: String(
      values.slug || ""
    )
      .trim()
      .toLowerCase(),

    excerpt: String(
      values.excerpt || ""
    ).trim(),

    content: String(
      values.content || ""
    ).trim(),

    category: String(
      values.category || ""
    ).trim(),

    author_name: String(
      values.author_name || ""
    ).trim(),

    published_at: publishedAt,

    status: normalizedStatus,

    is_featured: Boolean(
      values.is_featured
    ),
  };

  if (includeCover) {
    payload.cover_image_url =
      coverImageUrl || null;
  }

  return payload;
}

function throwInsightError(
  error,
  fallbackMessage
) {
  console.error(
    fallbackMessage,
    error
  );

  if (error?.code === "23505") {
    throw new Error(
      "Slug tersebut sudah digunakan oleh insight lain. Gunakan slug yang berbeda."
    );
  }

  if (error?.code === "42501") {
    throw new Error(
      "Akun ini tidak memiliki izin untuk melakukan tindakan tersebut."
    );
  }

  const errorMessage = String(
    error?.message || ""
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
 * TRANSLATION HELPERS
 * ======================================================
 */

/**
 * Mengambil translation published
 * untuk sekumpulan Insight.
 *
 * Error translation tidak boleh
 * membuat halaman publik gagal.
 */
async function getPublishedInsightTranslationsByIds(
  insightIds,
  locale = "id"
) {
  const normalizedLocale =
    normalizePublicLocale(locale);

  if (
    normalizedLocale === "id" ||
    !Array.isArray(insightIds) ||
    insightIds.length === 0
  ) {
    return [];
  }

  const { data, error } =
    await supabase
      .from(
        INSIGHT_TRANSLATION_TABLE
      )
      .select(`
        id,
        insight_id,
        locale,
        title,
        excerpt,
        content,
        seo_title,
        seo_description,
        status
      `)
      .in(
        "insight_id",
        insightIds
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
      `Translation Insight locale "${normalizedLocale}" gagal dimuat. Fallback ke Bahasa Indonesia:`,
      error
    );

    return [];
  }

  return data || [];
}

/**
 * Mengambil satu translation
 * Insight berdasarkan insight_id.
 */
async function getPublishedInsightTranslationById(
  insightId,
  locale = "id"
) {
  const normalizedLocale =
    normalizePublicLocale(locale);

  if (
    normalizedLocale === "id" ||
    !insightId
  ) {
    return null;
  }

  const { data, error } =
    await supabase
      .from(
        INSIGHT_TRANSLATION_TABLE
      )
      .select(`
        id,
        insight_id,
        locale,
        title,
        excerpt,
        content,
        seo_title,
        seo_description,
        status
      `)
      .eq(
        "insight_id",
        insightId
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
      `Translation detail Insight locale "${normalizedLocale}" gagal dimuat. Fallback ke Bahasa Indonesia:`,
      error
    );

    return null;
  }

  return data || null;
}

/*
 * ======================================================
 * STORAGE
 * ======================================================
 */

/*
 * Mengunggah cover insight
 * ke Supabase Storage.
 */
export async function uploadInsightCover(file) {
  validateCoverImage(file);

  if (!file) {
    throw new Error(
      "File gambar cover tidak tersedia."
    );
  }

  const filePath =
    createCoverPath(file);

  const { error: uploadError } =
    await supabase.storage
      .from(INSIGHT_BUCKET)
      .upload(
        filePath,
        file,
        {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        }
      );

  if (uploadError) {
    throwInsightError(
      uploadError,
      "Gambar cover gagal diunggah."
    );
  }

  const { data: publicUrlData } =
    supabase.storage
      .from(INSIGHT_BUCKET)
      .getPublicUrl(filePath);

  const publicUrl =
    publicUrlData?.publicUrl || "";

  if (!publicUrl) {
    /*
     * Bersihkan file apabila
     * public URL tidak terbentuk.
     */
    await supabase.storage
      .from(INSIGHT_BUCKET)
      .remove([filePath]);

    throw new Error(
      "Public URL gambar cover gagal dibuat."
    );
  }

  return {
    filePath,
    publicUrl,
  };
}

/*
 * Menghapus cover dari
 * Supabase Storage.
 *
 * Parameter dapat berupa:
 * - path file
 * - public URL
 */
export async function deleteInsightCover(
  pathOrUrl
) {
  if (!pathOrUrl) {
    return true;
  }

  const filePath =
    String(pathOrUrl).startsWith(
      "http"
    )
      ? getStoragePathFromPublicUrl(
          pathOrUrl
        )
      : pathOrUrl;

  if (!filePath) {
    return false;
  }

  const { error } =
    await supabase.storage
      .from(INSIGHT_BUCKET)
      .remove([filePath]);

  if (error) {
    throwInsightError(
      error,
      "Gambar cover gagal dihapus."
    );
  }

  return true;
}

/*
 * ======================================================
 * ADMIN READ
 * ======================================================
 */

/*
 * Mengambil semua insight
 * untuk halaman admin.
 *
 * Admin existing tetap memakai
 * source of truth Bahasa Indonesia.
 */
export async function getAdminInsights() {
  const { data, error } =
    await supabase
      .from(INSIGHT_TABLE)
      .select("*")
      .order(
        "created_at",
        {
          ascending: false,
        }
      );

  if (error) {
    throwInsightError(
      error,
      "Daftar insight gagal dimuat."
    );
  }

  return data || [];
}

/*
 * ======================================================
 * PUBLIC LIST
 * ======================================================
 */

/**
 * Mengambil Insight published
 * untuk halaman publik.
 *
 * Pemakaian:
 *
 * getPublishedInsights()
 * → ID
 *
 * getPublishedInsights("id")
 * → ID
 *
 * getPublishedInsights("en")
 * → EN + fallback ID
 */
export async function getPublishedInsights(
  locale = "id"
) {
  const normalizedLocale =
    normalizePublicLocale(locale);

  /*
   * ====================================================
   * 1. BASE INSIGHTS
   * ====================================================
   */

  const {
    data: baseInsights,
    error: baseError,
  } = await supabase
    .from(INSIGHT_TABLE)
    .select("*")
    .eq(
      "status",
      "published"
    )
    .order(
      "published_at",
      {
        ascending: false,
      }
    );

  if (baseError) {
    throwInsightError(
      baseError,
      "Insight publik gagal dimuat."
    );
  }

  const insights =
    Array.isArray(baseInsights)
      ? baseInsights
      : [];

  /*
   * Bahasa Indonesia langsung
   * menggunakan base.
   */
  if (
    normalizedLocale === "id" ||
    insights.length === 0
  ) {
    return insights.map(
      (insight) =>
        mergeInsightTranslation(
          insight,
          null,
          "id"
        )
    );
  }

  /*
   * ====================================================
   * 2. TRANSLATIONS
   * ====================================================
   */

  const insightIds =
    insights.map(
      (insight) => insight.id
    );

  const translations =
    await getPublishedInsightTranslationsByIds(
      insightIds,
      normalizedLocale
    );

  const translationMap =
    new Map(
      translations.map(
        (translation) => [
          translation.insight_id,
          translation,
        ]
      )
    );

  /*
   * ====================================================
   * 3. MERGE
   * ====================================================
   */

  return insights.map(
    (insight) =>
      mergeInsightTranslation(
        insight,
        translationMap.get(
          insight.id
        ) || null,
        normalizedLocale
      )
  );
}

/*
 * ======================================================
 * FEATURED INSIGHTS
 * ======================================================
 */

/**
 * Mengambil Insight featured
 * untuk homepage.
 *
 * Signature lama tetap aman:
 *
 * getFeaturedInsights()
 * getFeaturedInsights(3)
 *
 * Sekarang juga mendukung:
 *
 * getFeaturedInsights(3, "en")
 *
 * Parameter locale dibuat sebagai
 * argumen kedua agar penggunaan
 * existing getFeaturedInsights(3)
 * tidak rusak.
 */
export async function getFeaturedInsights(
  limit = 3,
  locale = "id"
) {
  const safeLimit =
    Number.isInteger(limit) &&
    limit > 0
      ? limit
      : 3;

  const normalizedLocale =
    normalizePublicLocale(locale);

  /*
   * ====================================================
   * 1. BASE FEATURED
   * ====================================================
   */

  const {
    data: baseInsights,
    error: baseError,
  } = await supabase
    .from(INSIGHT_TABLE)
    .select("*")
    .eq(
      "status",
      "published"
    )
    .eq(
      "is_featured",
      true
    )
    .order(
      "published_at",
      {
        ascending: false,
      }
    )
    .limit(safeLimit);

  if (baseError) {
    throwInsightError(
      baseError,
      "Featured insight gagal dimuat."
    );
  }

  const insights =
    Array.isArray(baseInsights)
      ? baseInsights
      : [];

  if (
    normalizedLocale === "id" ||
    insights.length === 0
  ) {
    return insights.map(
      (insight) =>
        mergeInsightTranslation(
          insight,
          null,
          "id"
        )
    );
  }

  /*
   * ====================================================
   * 2. TRANSLATIONS
   * ====================================================
   */

  const insightIds =
    insights.map(
      (insight) => insight.id
    );

  const translations =
    await getPublishedInsightTranslationsByIds(
      insightIds,
      normalizedLocale
    );

  const translationMap =
    new Map(
      translations.map(
        (translation) => [
          translation.insight_id,
          translation,
        ]
      )
    );

  return insights.map(
    (insight) =>
      mergeInsightTranslation(
        insight,
        translationMap.get(
          insight.id
        ) || null,
        normalizedLocale
      )
  );
}

/*
 * ======================================================
 * ADMIN DETAIL BY ID
 * ======================================================
 */

/*
 * Mengambil satu insight untuk
 * halaman edit admin.
 *
 * Tetap memakai base ID.
 */
export async function getInsightById(id) {
  if (!id) {
    throw new Error(
      "ID insight tidak tersedia."
    );
  }

  const { data, error } =
    await supabase
      .from(INSIGHT_TABLE)
      .select("*")
      .eq(
        "id",
        id
      )
      .maybeSingle();

  if (error) {
    throwInsightError(
      error,
      "Data insight gagal dimuat."
    );
  }

  return data;
}

/*
 * ======================================================
 * PUBLIC DETAIL BY SLUG
 * ======================================================
 */

/**
 * Mengambil detail Insight publik
 * berdasarkan slug.
 *
 * Pemakaian:
 *
 * getPublishedInsightBySlug(slug)
 * → ID
 *
 * getPublishedInsightBySlug(
 *   slug,
 *   "id"
 * )
 * → ID
 *
 * getPublishedInsightBySlug(
 *   slug,
 *   "en"
 * )
 * → English + fallback ID
 */
export async function getPublishedInsightBySlug(
  slug,
  locale = "id"
) {
  const normalizedSlug =
    String(
      slug || ""
    ).trim();

  const normalizedLocale =
    normalizePublicLocale(locale);

  if (!normalizedSlug) {
    throw new Error(
      "Slug insight tidak tersedia."
    );
  }

  /*
   * ====================================================
   * 1. BASE INSIGHT
   * ====================================================
   */

  const {
    data: insight,
    error: insightError,
  } = await supabase
    .from(INSIGHT_TABLE)
    .select("*")
    .eq(
      "slug",
      normalizedSlug
    )
    .eq(
      "status",
      "published"
    )
    .maybeSingle();

  if (insightError) {
    throwInsightError(
      insightError,
      "Detail insight gagal dimuat."
    );
  }

  /*
   * Insight tidak ditemukan
   * bukan query error.
   */
  if (!insight) {
    return null;
  }

  /*
   * ID langsung base.
   */
  if (
    normalizedLocale === "id"
  ) {
    return mergeInsightTranslation(
      insight,
      null,
      "id"
    );
  }

  /*
   * ====================================================
   * 2. TRANSLATION
   * ====================================================
   */

  const translation =
    await getPublishedInsightTranslationById(
      insight.id,
      normalizedLocale
    );

  /*
   * ====================================================
   * 3. MERGE + FALLBACK
   * ====================================================
   */

  return mergeInsightTranslation(
    insight,
    translation,
    normalizedLocale
  );
}

/*
 * ======================================================
 * CREATE
 * ======================================================
 */

/*
 * Membuat insight baru.
 *
 * values berisi data form.
 * coverFile berisi File input gambar.
 *
 * Source of truth tetap tabel insights.
 */
export async function createInsight(
  values,
  coverFile = null
) {
  let uploadedCover = null;

  try {
    if (coverFile) {
      uploadedCover =
        await uploadInsightCover(
          coverFile
        );
    }

    const payload =
      createInsightPayload(
        values,
        uploadedCover?.publicUrl ||
          null,
        true
      );

    const { data, error } =
      await supabase
        .from(INSIGHT_TABLE)
        .insert(payload)
        .select("*")
        .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    /*
     * Hapus gambar baru apabila
     * insert database gagal.
     */
    if (uploadedCover?.filePath) {
      try {
        await deleteInsightCover(
          uploadedCover.filePath
        );
      } catch (cleanupError) {
        console.error(
          "Gagal membersihkan cover setelah insert gagal:",
          cleanupError
        );
      }
    }

    throwInsightError(
      error,
      "Insight gagal dibuat."
    );
  }
}

/*
 * ======================================================
 * UPDATE
 * ======================================================
 */

/*
 * Memperbarui insight.
 *
 * Cover lama dipertahankan jika
 * coverFile tidak diberikan.
 *
 * Translation tidak disentuh.
 */
export async function updateInsight(
  id,
  values,
  coverFile = null
) {
  if (!id) {
    throw new Error(
      "ID insight tidak tersedia."
    );
  }

  let uploadedCover = null;

  try {
    const currentInsight =
      await getInsightById(id);

    if (!currentInsight) {
      throw new Error(
        "Insight tidak ditemukan."
      );
    }

    if (coverFile) {
      uploadedCover =
        await uploadInsightCover(
          coverFile
        );
    }

    const shouldReplaceCover =
      Boolean(
        uploadedCover?.publicUrl
      );

    const payload =
      createInsightPayload(
        values,
        uploadedCover?.publicUrl,
        shouldReplaceCover
      );

    const { data, error } =
      await supabase
        .from(INSIGHT_TABLE)
        .update(payload)
        .eq(
          "id",
          id
        )
        .select("*")
        .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error(
        "Insight tidak ditemukan atau akun tidak memiliki izin untuk mengedit."
      );
    }

    /*
     * Hapus cover lama setelah
     * update database berhasil.
     */
    if (
      shouldReplaceCover &&
      currentInsight.cover_image_url
    ) {
      try {
        await deleteInsightCover(
          currentInsight.cover_image_url
        );
      } catch (cleanupError) {
        console.error(
          "Insight berhasil diperbarui, tetapi cover lama gagal dihapus:",
          cleanupError
        );
      }
    }

    return data;
  } catch (error) {
    /*
     * Hapus cover baru apabila
     * update database gagal.
     */
    if (uploadedCover?.filePath) {
      try {
        await deleteInsightCover(
          uploadedCover.filePath
        );
      } catch (cleanupError) {
        console.error(
          "Gagal membersihkan cover baru:",
          cleanupError
        );
      }
    }

    throwInsightError(
      error,
      "Insight gagal diperbarui."
    );
  }
}

/*
 * ======================================================
 * DELETE
 * ======================================================
 */

/*
 * Menghapus insight dan
 * cover terkait.
 *
 * insight_translations ikut terhapus
 * melalui FK ON DELETE CASCADE.
 */
export async function deleteInsight(id) {
  if (!id) {
    throw new Error(
      "ID insight tidak tersedia."
    );
  }

  try {
    const insight =
      await getInsightById(id);

    if (!insight) {
      throw new Error(
        "Insight tidak ditemukan."
      );
    }

    const { data, error } =
      await supabase
        .from(INSIGHT_TABLE)
        .delete()
        .eq(
          "id",
          id
        )
        .select("id")
        .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error(
        "Insight tidak ditemukan atau akun tidak memiliki izin untuk menghapus."
      );
    }

    let coverDeleted = false;

    if (
      insight.cover_image_url
    ) {
      try {
        coverDeleted =
          await deleteInsightCover(
            insight.cover_image_url
          );
      } catch (storageError) {
        console.error(
          "Insight terhapus, tetapi cover gagal dihapus:",
          storageError
        );
      }
    }

    return {
      deletedInsight: insight,
      coverDeleted,
    };
  } catch (error) {
    throwInsightError(
      error,
      "Insight gagal dihapus."
    );
  }
}