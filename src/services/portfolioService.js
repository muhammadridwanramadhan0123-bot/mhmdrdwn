import { supabase } from "../lib/supabase";

const PORTFOLIO_TABLE = "portfolios";
const PORTFOLIO_TRANSLATION_TABLE =
  "portfolio_translations";

const PORTFOLIO_BUCKET =
  "portfolio-images";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAXIMUM_IMAGE_SIZE =
  2 * 1024 * 1024;

/*
 * ======================================================
 * LANGUAGE HELPERS
 * ======================================================
 */

/**
 * Locale publik yang didukung.
 *
 * Untuk sekarang:
 * - id
 * - en
 *
 * Locale yang tidak dikenal akan fallback ke id.
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
 * maka gunakan value Bahasa Indonesia.
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
    typeof translatedValue ===
    "string"
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
 * Menggabungkan portfolio Bahasa Indonesia
 * dengan translation.
 *
 * Field struktural tetap berasal dari
 * tabel portfolios:
 *
 * - id
 * - slug
 * - category
 * - client_name
 * - image_url
 * - project_year
 * - project_date
 * - status
 * - is_featured
 * - display_order
 * - timestamps
 *
 * Field editorial dapat diterjemahkan:
 *
 * - title
 * - short_description
 * - full_description
 * - challenge
 * - solution
 * - result
 * - seo_title
 * - seo_description
 */
function mergePortfolioTranslation(
  portfolio,
  translation,
  locale = "id"
) {
  if (!portfolio) {
    return null;
  }

  const normalizedLocale =
    normalizePublicLocale(locale);

  /*
   * Bahasa Indonesia menggunakan
   * source of truth langsung dari
   * portfolios.
   */
  if (
    normalizedLocale === "id"
  ) {
    return {
      ...portfolio,

      locale:
        "id",

      translation_locale:
        "id",

      has_translation:
        false,
    };
  }

  /*
   * English dengan fallback per field
   * ke Bahasa Indonesia.
   */
  return {
    ...portfolio,

    title:
      getTranslatedText(
        translation?.title,
        portfolio.title
      ),

    short_description:
      getTranslatedText(
        translation?.short_description,
        portfolio.short_description
      ),

    full_description:
      getTranslatedText(
        translation?.full_description,
        portfolio.full_description
      ),

    challenge:
      getTranslatedText(
        translation?.challenge,
        portfolio.challenge
      ),

    solution:
      getTranslatedText(
        translation?.solution,
        portfolio.solution
      ),

    result:
      getTranslatedText(
        translation?.result,
        portfolio.result
      ),

    seo_title:
      getTranslatedText(
        translation?.seo_title,
        portfolio.seo_title
      ),

    seo_description:
      getTranslatedText(
        translation?.seo_description,
        portfolio.seo_description
      ),

    /*
     * Structural fields seperti:
     *
     * slug
     * category
     * client_name
     * project_year
     *
     * tetap berasal dari portfolio
     * karena ...portfolio sudah
     * diletakkan di atas.
     */

    locale:
      normalizedLocale,

    translation_locale:
      translation
        ? normalizedLocale
        : "id",

    has_translation:
      Boolean(translation),
  };
}

/*
 * ======================================================
 * GENERAL HELPERS
 * ======================================================
 */

/**
 * Mengubah nama file menjadi aman
 * untuk Supabase Storage.
 */
function sanitizeFileName(
  fileName = ""
) {
  const sanitizedName =
    fileName
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(
        /[^a-z0-9._-]/g,
        ""
      );

  return (
    sanitizedName ||
    "portfolio-image"
  );
}

/**
 * Mengubah nilai kosong menjadi null.
 */
function emptyToNull(value) {
  const normalizedValue =
    String(
      value ?? ""
    ).trim();

  return normalizedValue || null;
}

/**
 * Mengambil path file Storage
 * dari public URL.
 *
 * Contoh URL:
 *
 * https://xxx.supabase.co/storage/v1/object/public/portfolio-images/portfolios/file.jpg
 *
 * Hasil:
 *
 * portfolios/file.jpg
 */
function getStoragePathFromPublicUrl(
  publicUrl
) {
  if (!publicUrl) {
    return "";
  }

  const marker =
    `/storage/v1/object/public/${PORTFOLIO_BUCKET}/`;

  const markerIndex =
    publicUrl.indexOf(marker);

  if (markerIndex === -1) {
    return "";
  }

  return decodeURIComponent(
    publicUrl.slice(
      markerIndex +
        marker.length
    )
  );
}

/**
 * Mengubah data form menjadi
 * payload database.
 *
 * Properti image berupa File
 * tidak ikut dimasukkan ke database.
 */
function createPortfolioPayload(
  formData,
  imageUrl = ""
) {
  return {
    title:
      String(
        formData.title || ""
      ).trim(),

    slug:
      String(
        formData.slug || ""
      ).trim(),

    category:
      String(
        formData.category || ""
      ).trim(),

    short_description:
      String(
        formData.short_description ||
          ""
      ).trim(),

    full_description:
      String(
        formData.full_description ||
          ""
      ).trim(),

    challenge:
      emptyToNull(
        formData.challenge
      ),

    solution:
      emptyToNull(
        formData.solution
      ),

    result:
      emptyToNull(
        formData.result
      ),

    client_name:
      emptyToNull(
        formData.client_name
      ),

    project_year:
      Number(
        formData.project_year
      ),

    image_url:
      imageUrl || null,

    status:
      formData.status ||
      "draft",

    is_featured:
      Boolean(
        formData.is_featured
      ),
  };
}

/**
 * Mengubah error Supabase
 * menjadi pesan yang mudah dipahami.
 */
function getPortfolioErrorMessage(
  error,
  fallbackMessage =
    "Terjadi kesalahan pada data portfolio."
) {
  if (!error) {
    return fallbackMessage;
  }

  if (
    error.code === "23505"
  ) {
    return (
      "Slug tersebut sudah digunakan. " +
      "Gunakan slug yang berbeda."
    );
  }

  if (
    error.code === "42501"
  ) {
    return (
      "Akun ini tidak memiliki izin melakukan tindakan tersebut. " +
      "Periksa policy RLS tabel portfolios."
    );
  }

  if (
    error.message
      ?.toLowerCase()
      .includes(
        "row-level security"
      )
  ) {
    return (
      "Tindakan ditolak oleh Row Level Security Supabase. " +
      "Periksa role akun dan policy tabel portfolios."
    );
  }

  return (
    error.message ||
    fallbackMessage
  );
}

/**
 * Validasi gambar sebelum
 * di-upload.
 */
function validatePortfolioImage(
  file
) {
  if (
    !(file instanceof File)
  ) {
    throw new Error(
      "File gambar portfolio tidak valid."
    );
  }

  if (
    !ALLOWED_IMAGE_TYPES.includes(
      file.type
    )
  ) {
    throw new Error(
      "Format gambar harus berupa JPG, PNG, atau WebP."
    );
  }

  if (
    file.size >
    MAXIMUM_IMAGE_SIZE
  ) {
    throw new Error(
      "Ukuran gambar maksimal 2 MB."
    );
  }
}

/*
 * ======================================================
 * TRANSLATION HELPERS
 * ======================================================
 */

/**
 * Mengambil seluruh translation
 * portfolio berdasarkan ID.
 *
 * Translation error TIDAK membuat
 * halaman publik gagal.
 *
 * Website akan fallback ke Bahasa
 * Indonesia.
 */
async function getPublishedPortfolioTranslationsByIds(
  portfolioIds,
  locale = "id"
) {
  const normalizedLocale =
    normalizePublicLocale(locale);

  if (
    normalizedLocale === "id" ||
    !Array.isArray(
      portfolioIds
    ) ||
    portfolioIds.length === 0
  ) {
    return [];
  }

  const {
    data,
    error,
  } = await supabase
    .from(
      PORTFOLIO_TRANSLATION_TABLE
    )
    .select(
      `
        id,
        portfolio_id,
        locale,
        title,
        short_description,
        full_description,
        challenge,
        solution,
        result,
        seo_title,
        seo_description,
        status
      `
    )
    .in(
      "portfolio_id",
      portfolioIds
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
    /*
     * Translation adalah enhancement.
     *
     * Jika translation gagal,
     * data Bahasa Indonesia tetap
     * boleh ditampilkan.
     */
    console.warn(
      `Translation portfolio locale "${normalizedLocale}" gagal dimuat. Fallback ke Bahasa Indonesia:`,
      error
    );

    return [];
  }

  return data || [];
}

/**
 * Mengambil satu translation
 * portfolio berdasarkan ID.
 */
async function getPublishedPortfolioTranslationById(
  portfolioId,
  locale = "id"
) {
  const normalizedLocale =
    normalizePublicLocale(locale);

  if (
    normalizedLocale === "id" ||
    !portfolioId
  ) {
    return null;
  }

  const {
    data,
    error,
  } = await supabase
    .from(
      PORTFOLIO_TRANSLATION_TABLE
    )
    .select(
      `
        id,
        portfolio_id,
        locale,
        title,
        short_description,
        full_description,
        challenge,
        solution,
        result,
        seo_title,
        seo_description,
        status
      `
    )
    .eq(
      "portfolio_id",
      portfolioId
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
      `Translation detail portfolio locale "${normalizedLocale}" gagal dimuat. Fallback ke Bahasa Indonesia:`,
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

/**
 * Upload gambar portfolio
 * ke Supabase Storage.
 */
export async function uploadPortfolioImage(
  file
) {
  if (!file) {
    return {
      publicUrl: "",
      filePath: "",
    };
  }

  validatePortfolioImage(
    file
  );

  const safeFileName =
    sanitizeFileName(
      file.name
    );

  const uniqueId =
    typeof crypto?.randomUUID ===
    "function"
      ? crypto.randomUUID()
      : Math.random()
          .toString(36)
          .slice(2);

  const uniqueFileName =
    `${Date.now()}-${uniqueId}-${safeFileName}`;

  const filePath =
    `portfolios/${uniqueFileName}`;

  const {
    error: uploadError,
  } = await supabase.storage
    .from(PORTFOLIO_BUCKET)
    .upload(
      filePath,
      file,
      {
        cacheControl:
          "3600",

        contentType:
          file.type,

        upsert:
          false,
      }
    );

  if (uploadError) {
    console.error(
      "Gagal mengupload gambar portfolio:",
      uploadError
    );

    if (
      uploadError.message
        ?.toLowerCase()
        .includes(
          "bucket not found"
        )
    ) {
      throw new Error(
        `Bucket Storage "${PORTFOLIO_BUCKET}" tidak ditemukan.`
      );
    }

    throw new Error(
      `Gagal mengupload gambar: ${uploadError.message}`
    );
  }

  const {
    data: publicUrlData,
  } = supabase.storage
    .from(PORTFOLIO_BUCKET)
    .getPublicUrl(
      filePath
    );

  if (
    !publicUrlData?.publicUrl
  ) {
    await deletePortfolioImage(
      filePath
    );

    throw new Error(
      "URL gambar gagal dibuat setelah proses upload."
    );
  }

  return {
    publicUrl:
      publicUrlData.publicUrl,

    filePath,
  };
}

/**
 * Menghapus gambar dari
 * Supabase Storage.
 */
export async function deletePortfolioImage(
  filePath
) {
  if (!filePath) {
    return true;
  }

  const {
    error,
  } = await supabase.storage
    .from(PORTFOLIO_BUCKET)
    .remove([
      filePath,
    ]);

  if (error) {
    console.error(
      "Gagal menghapus gambar dari Storage:",
      error
    );

    throw new Error(
      `Gagal menghapus gambar: ${error.message}`
    );
  }

  return true;
}

/*
 * ======================================================
 * ADMIN READ
 * ======================================================
 */

/**
 * Mengambil seluruh portfolio
 * untuk dashboard admin.
 *
 * Tidak memakai translation karena
 * form admin existing tetap mengelola
 * source of truth Bahasa Indonesia.
 *
 * RLS backend menentukan data apa
 * yang boleh dilihat admin/editor.
 */
export async function getAdminPortfolios() {
  const {
    data,
    error,
  } = await supabase
    .from(
      PORTFOLIO_TABLE
    )
    .select("*")
    .order(
      "created_at",
      {
        ascending:
          false,
      }
    );

  if (error) {
    console.error(
      "Gagal mengambil data portfolio admin:",
      error
    );

    throw new Error(
      getPortfolioErrorMessage(
        error,
        "Daftar portfolio gagal dimuat."
      )
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
 * Mengambil seluruh portfolio
 * berstatus published untuk halaman
 * publik.
 *
 * Pemakaian:
 *
 * getPublishedPortfolios()
 * → Bahasa Indonesia
 *
 * getPublishedPortfolios("id")
 * → Bahasa Indonesia
 *
 * getPublishedPortfolios("en")
 * → English + fallback Indonesia
 */
export async function getPublishedPortfolios(
  locale = "id"
) {
  const normalizedLocale =
    normalizePublicLocale(locale);

  /*
   * ====================================================
   * 1. BASE PORTFOLIO
   * ====================================================
   */

  const {
    data:
      basePortfolios,
    error:
      baseError,
  } = await supabase
    .from(
      PORTFOLIO_TABLE
    )
    .select("*")
    .eq(
      "status",
      "published"
    )
    .order(
      "is_featured",
      {
        ascending:
          false,
      }
    )
    .order(
      "created_at",
      {
        ascending:
          false,
      }
    );

  if (baseError) {
    console.error(
      "Gagal mengambil portfolio published:",
      baseError
    );

    throw new Error(
      getPortfolioErrorMessage(
        baseError,
        "Portfolio publik gagal dimuat."
      )
    );
  }

  const portfolios =
    Array.isArray(
      basePortfolios
    )
      ? basePortfolios
      : [];

  /*
   * Bahasa Indonesia tidak
   * membutuhkan query translation.
   */
  if (
    normalizedLocale === "id" ||
    portfolios.length === 0
  ) {
    return portfolios.map(
      (portfolio) =>
        mergePortfolioTranslation(
          portfolio,
          null,
          "id"
        )
    );
  }

  /*
   * ====================================================
   * 2. EN TRANSLATIONS
   * ====================================================
   */

  const portfolioIds =
    portfolios.map(
      (portfolio) =>
        portfolio.id
    );

  const translations =
    await getPublishedPortfolioTranslationsByIds(
      portfolioIds,
      normalizedLocale
    );

  const translationMap =
    new Map(
      translations.map(
        (translation) => [
          translation.portfolio_id,
          translation,
        ]
      )
    );

  /*
   * ====================================================
   * 3. MERGE
   * ====================================================
   */

  return portfolios.map(
    (portfolio) =>
      mergePortfolioTranslation(
        portfolio,
        translationMap.get(
          portfolio.id
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

/**
 * Mengambil satu portfolio
 * berdasarkan ID.
 *
 * Digunakan admin.
 *
 * Tetap menggunakan base Bahasa
 * Indonesia agar edit/create existing
 * tidak terganggu.
 */
export async function getPortfolioById(
  id
) {
  if (!id) {
    throw new Error(
      "ID portfolio tidak tersedia."
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from(
      PORTFOLIO_TABLE
    )
    .select("*")
    .eq(
      "id",
      id
    )
    .maybeSingle();

  if (error) {
    console.error(
      "Gagal mengambil detail portfolio berdasarkan ID:",
      error
    );

    throw new Error(
      getPortfolioErrorMessage(
        error,
        "Detail portfolio gagal dimuat."
      )
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
 * Mengambil satu portfolio published
 * berdasarkan slug.
 *
 * Digunakan halaman detail portfolio.
 *
 * Pemakaian:
 *
 * getPublishedPortfolioBySlug(slug)
 * → Bahasa Indonesia
 *
 * getPublishedPortfolioBySlug(
 *   slug,
 *   "en"
 * )
 * → English + fallback Indonesia
 */
export async function getPublishedPortfolioBySlug(
  slug,
  locale = "id"
) {
  const normalizedSlug =
    String(
      slug || ""
    ).trim();

  const normalizedLocale =
    normalizePublicLocale(
      locale
    );

  if (!normalizedSlug) {
    throw new Error(
      "Slug portfolio tidak tersedia."
    );
  }

  /*
   * ====================================================
   * 1. BASE PORTFOLIO
   * ====================================================
   */

  const {
    data:
      portfolio,
    error:
      portfolioError,
  } = await supabase
    .from(
      PORTFOLIO_TABLE
    )
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

  if (portfolioError) {
    console.error(
      "Gagal mengambil portfolio berdasarkan slug:",
      portfolioError
    );

    throw new Error(
      getPortfolioErrorMessage(
        portfolioError,
        "Detail portfolio gagal dimuat."
      )
    );
  }

  /*
   * Tidak ditemukan bukan query error.
   */
  if (!portfolio) {
    return null;
  }

  /*
   * ID langsung menggunakan base.
   */
  if (
    normalizedLocale === "id"
  ) {
    return mergePortfolioTranslation(
      portfolio,
      null,
      "id"
    );
  }

  /*
   * ====================================================
   * 2. EN TRANSLATION
   * ====================================================
   */

  const translation =
    await getPublishedPortfolioTranslationById(
      portfolio.id,
      normalizedLocale
    );

  /*
   * ====================================================
   * 3. MERGE + FALLBACK
   * ====================================================
   */

  return mergePortfolioTranslation(
    portfolio,
    translation,
    normalizedLocale
  );
}

/*
 * ======================================================
 * CREATE
 * ======================================================
 */

/**
 * Menambahkan portfolio baru.
 *
 * Data admin tetap masuk ke tabel
 * portfolios sebagai source of truth ID.
 */
export async function createPortfolio(
  formData
) {
  let uploadedFilePath =
    "";

  try {
    let imageUrl =
      formData.image_url ||
      "";

    if (
      formData.image instanceof
      File
    ) {
      const uploadResult =
        await uploadPortfolioImage(
          formData.image
        );

      imageUrl =
        uploadResult.publicUrl;

      uploadedFilePath =
        uploadResult.filePath;
    }

    const payload =
      createPortfolioPayload(
        formData,
        imageUrl
      );

    const {
      data,
      error,
    } = await supabase
      .from(
        PORTFOLIO_TABLE
      )
      .insert(
        payload
      )
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    /*
     * Jika upload berhasil tetapi
     * insert database gagal,
     * hapus file yang sudah
     * di-upload.
     */
    if (
      uploadedFilePath
    ) {
      try {
        await deletePortfolioImage(
          uploadedFilePath
        );
      } catch (
        cleanupError
      ) {
        console.error(
          "Gagal membersihkan gambar setelah insert gagal:",
          cleanupError
        );
      }
    }

    console.error(
      "Gagal menambahkan portfolio:",
      error
    );

    throw new Error(
      getPortfolioErrorMessage(
        error,
        "Portfolio gagal disimpan ke database."
      )
    );
  }
}

/*
 * ======================================================
 * UPDATE
 * ======================================================
 */

/**
 * Memperbarui portfolio.
 *
 * Bisa menerima data form dan
 * file gambar baru.
 *
 * Tetap mengubah source of truth
 * tabel portfolios.
 */
export async function updatePortfolio(
  id,
  formData
) {
  if (!id) {
    throw new Error(
      "ID portfolio tidak tersedia."
    );
  }

  let newUploadedFilePath =
    "";

  let oldImagePath =
    "";

  try {
    let imageUrl =
      formData.image_url ||
      "";

    /*
     * Jika admin memilih gambar
     * baru, upload terlebih dahulu.
     */
    if (
      formData.image instanceof
      File
    ) {
      oldImagePath =
        getStoragePathFromPublicUrl(
          formData.image_url
        );

      const uploadResult =
        await uploadPortfolioImage(
          formData.image
        );

      imageUrl =
        uploadResult.publicUrl;

      newUploadedFilePath =
        uploadResult.filePath;
    }

    const payload =
      createPortfolioPayload(
        formData,
        imageUrl
      );

    const {
      data,
      error,
    } = await supabase
      .from(
        PORTFOLIO_TABLE
      )
      .update(
        payload
      )
      .eq(
        "id",
        id
      )
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    /*
     * Database berhasil diperbarui.
     *
     * Gambar lama dapat dihapus
     * setelah gambar baru berhasil
     * tersimpan.
     */
    if (
      oldImagePath &&
      newUploadedFilePath &&
      oldImagePath !==
        newUploadedFilePath
    ) {
      try {
        await deletePortfolioImage(
          oldImagePath
        );
      } catch (
        deleteError
      ) {
        console.error(
          "Data berhasil diperbarui, tetapi gambar lama gagal dihapus:",
          deleteError
        );
      }
    }

    return data;
  } catch (error) {
    /*
     * Update database gagal.
     *
     * Bersihkan gambar baru
     * yang sempat di-upload.
     */
    if (
      newUploadedFilePath
    ) {
      try {
        await deletePortfolioImage(
          newUploadedFilePath
        );
      } catch (
        cleanupError
      ) {
        console.error(
          "Gagal membersihkan gambar baru:",
          cleanupError
        );
      }
    }

    console.error(
      "Gagal memperbarui portfolio:",
      error
    );

    throw new Error(
      getPortfolioErrorMessage(
        error,
        "Portfolio gagal diperbarui."
      )
    );
  }
}

/*
 * ======================================================
 * DELETE
 * ======================================================
 */

/**
 * Menghapus portfolio dari database.
 *
 * Hanya role admin yang seharusnya
 * diizinkan oleh policy DELETE backend.
 *
 * portfolio_translations otomatis
 * ikut terhapus karena FK:
 *
 * ON DELETE CASCADE
 */
export async function deletePortfolio(
  id
) {
  if (!id) {
    throw new Error(
      "ID portfolio tidak tersedia."
    );
  }

  /*
   * Ambil data terlebih dahulu
   * agar image_url diketahui.
   */
  const portfolio =
    await getPortfolioById(
      id
    );

  if (!portfolio) {
    throw new Error(
      "Portfolio tidak ditemukan."
    );
  }

  const {
    error,
  } = await supabase
    .from(
      PORTFOLIO_TABLE
    )
    .delete()
    .eq(
      "id",
      id
    );

  if (error) {
    console.error(
      "Gagal menghapus portfolio:",
      error
    );

    throw new Error(
      getPortfolioErrorMessage(
        error,
        "Portfolio gagal dihapus."
      )
    );
  }

  /*
   * Translation portfolio akan
   * otomatis terhapus dari database
   * melalui ON DELETE CASCADE.
   *
   * Sekarang hapus gambar Storage.
   */
  const imagePath =
    getStoragePathFromPublicUrl(
      portfolio.image_url
    );

  if (imagePath) {
    try {
      await deletePortfolioImage(
        imagePath
      );
    } catch (
      storageError
    ) {
      console.error(
        "Portfolio berhasil dihapus, tetapi file gambar gagal dihapus:",
        storageError
      );
    }
  }

  return true;
}