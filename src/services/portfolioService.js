import { supabase } from "../lib/supabase";

const PORTFOLIO_TABLE = "portfolios";
const PORTFOLIO_BUCKET = "portfolio-images";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAXIMUM_IMAGE_SIZE = 2 * 1024 * 1024;

/**
 * Mengubah nama file menjadi aman untuk Supabase Storage.
 */
function sanitizeFileName(fileName = "") {
  const sanitizedName = fileName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._-]/g, "");

  return sanitizedName || "portfolio-image";
}

/**
 * Mengubah nilai kosong menjadi null.
 */
function emptyToNull(value) {
  const normalizedValue = String(value ?? "").trim();

  return normalizedValue || null;
}

/**
 * Mengambil path file Storage dari public URL.
 *
 * Contoh URL:
 * https://xxx.supabase.co/storage/v1/object/public/portfolio-images/portfolios/file.jpg
 *
 * Hasil:
 * portfolios/file.jpg
 */
function getStoragePathFromPublicUrl(publicUrl) {
  if (!publicUrl) return "";

  const marker = `/storage/v1/object/public/${PORTFOLIO_BUCKET}/`;
  const markerIndex = publicUrl.indexOf(marker);

  if (markerIndex === -1) {
    return "";
  }

  return decodeURIComponent(
    publicUrl.slice(markerIndex + marker.length)
  );
}

/**
 * Mengubah data form menjadi payload database.
 *
 * Properti image berupa File tidak ikut dimasukkan ke database.
 */
function createPortfolioPayload(formData, imageUrl = "") {
  return {
    title: String(formData.title || "").trim(),
    slug: String(formData.slug || "").trim(),
    category: String(formData.category || "").trim(),

    short_description: String(
      formData.short_description || ""
    ).trim(),

    full_description: String(
      formData.full_description || ""
    ).trim(),

    challenge: emptyToNull(formData.challenge),
    solution: emptyToNull(formData.solution),
    result: emptyToNull(formData.result),
    client_name: emptyToNull(formData.client_name),

    project_year: Number(formData.project_year),

    image_url: imageUrl || null,

    status: formData.status || "draft",

    is_featured: Boolean(formData.is_featured),
  };
}

/**
 * Mengubah error Supabase menjadi pesan yang mudah dipahami.
 */
function getPortfolioErrorMessage(
  error,
  fallbackMessage = "Terjadi kesalahan pada data portfolio."
) {
  if (!error) return fallbackMessage;

  if (error.code === "23505") {
    return "Slug tersebut sudah digunakan. Gunakan slug yang berbeda.";
  }

  if (error.code === "42501") {
    return (
      "Akun ini tidak memiliki izin melakukan tindakan tersebut. " +
      "Periksa policy RLS tabel portfolios."
    );
  }

  if (error.message?.toLowerCase().includes("row-level security")) {
    return (
      "Tindakan ditolak oleh Row Level Security Supabase. " +
      "Periksa role akun dan policy tabel portfolios."
    );
  }

  return error.message || fallbackMessage;
}

/**
 * Validasi gambar sebelum di-upload.
 */
function validatePortfolioImage(file) {
  if (!(file instanceof File)) {
    throw new Error("File gambar portfolio tidak valid.");
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error(
      "Format gambar harus berupa JPG, PNG, atau WebP."
    );
  }

  if (file.size > MAXIMUM_IMAGE_SIZE) {
    throw new Error("Ukuran gambar maksimal 2 MB.");
  }
}

/**
 * Upload gambar portfolio ke Supabase Storage.
 */
export async function uploadPortfolioImage(file) {
  if (!file) {
    return {
      publicUrl: "",
      filePath: "",
    };
  }

  validatePortfolioImage(file);

  const safeFileName = sanitizeFileName(file.name);

  const uniqueId =
    typeof crypto?.randomUUID === "function"
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);

  const uniqueFileName = `${Date.now()}-${uniqueId}-${safeFileName}`;
  const filePath = `portfolios/${uniqueFileName}`;

  const { error: uploadError } = await supabase.storage
    .from(PORTFOLIO_BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error(
      "Gagal mengupload gambar portfolio:",
      uploadError
    );

    if (
      uploadError.message
        ?.toLowerCase()
        .includes("bucket not found")
    ) {
      throw new Error(
        `Bucket Storage "${PORTFOLIO_BUCKET}" tidak ditemukan.`
      );
    }

    throw new Error(
      `Gagal mengupload gambar: ${uploadError.message}`
    );
  }

  const { data: publicUrlData } = supabase.storage
    .from(PORTFOLIO_BUCKET)
    .getPublicUrl(filePath);

  if (!publicUrlData?.publicUrl) {
    await deletePortfolioImage(filePath);

    throw new Error(
      "URL gambar gagal dibuat setelah proses upload."
    );
  }

  return {
    publicUrl: publicUrlData.publicUrl,
    filePath,
  };
}

/**
 * Menghapus gambar dari Supabase Storage.
 */
export async function deletePortfolioImage(filePath) {
  if (!filePath) return true;

  const { error } = await supabase.storage
    .from(PORTFOLIO_BUCKET)
    .remove([filePath]);

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

/**
 * Mengambil seluruh portfolio untuk dashboard admin.
 *
 * RLS backend menentukan data apa saja yang boleh dilihat
 * oleh role admin atau editor.
 */
export async function getAdminPortfolios() {
  const { data, error } = await supabase
    .from(PORTFOLIO_TABLE)
    .select("*")
    .order("created_at", {
      ascending: false,
    });

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

/**
 * Mengambil seluruh portfolio berstatus published
 * untuk halaman publik.
 */
export async function getPublishedPortfolios() {
  const { data, error } = await supabase
    .from(PORTFOLIO_TABLE)
    .select("*")
    .eq("status", "published")
    .order("is_featured", {
      ascending: false,
    })
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Gagal mengambil portfolio published:",
      error
    );

    throw new Error(
      getPortfolioErrorMessage(
        error,
        "Portfolio publik gagal dimuat."
      )
    );
  }

  return data || [];
}

/**
 * Mengambil satu portfolio berdasarkan ID.
 */
export async function getPortfolioById(id) {
  if (!id) {
    throw new Error("ID portfolio tidak tersedia.");
  }

  const { data, error } = await supabase
    .from(PORTFOLIO_TABLE)
    .select("*")
    .eq("id", id)
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

/**
 * Mengambil satu portfolio published berdasarkan slug.
 * Digunakan pada halaman detail portfolio publik.
 */
export async function getPublishedPortfolioBySlug(slug) {
  if (!slug) {
    throw new Error("Slug portfolio tidak tersedia.");
  }

  const { data, error } = await supabase
    .from(PORTFOLIO_TABLE)
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error(
      "Gagal mengambil portfolio berdasarkan slug:",
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

/**
 * Menambahkan portfolio baru.
 */
export async function createPortfolio(formData) {
  let uploadedFilePath = "";

  try {
    let imageUrl = formData.image_url || "";

    if (formData.image instanceof File) {
      const uploadResult = await uploadPortfolioImage(
        formData.image
      );

      imageUrl = uploadResult.publicUrl;
      uploadedFilePath = uploadResult.filePath;
    }

    const payload = createPortfolioPayload(
      formData,
      imageUrl
    );

    const { data, error } = await supabase
      .from(PORTFOLIO_TABLE)
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    /*
     * Jika upload berhasil tetapi insert database gagal,
     * hapus file yang sudah di-upload.
     */
    if (uploadedFilePath) {
      try {
        await deletePortfolioImage(uploadedFilePath);
      } catch (cleanupError) {
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

/**
 * Memperbarui portfolio.
 *
 * Bisa menerima data form dan file gambar baru.
 */
export async function updatePortfolio(id, formData) {
  if (!id) {
    throw new Error("ID portfolio tidak tersedia.");
  }

  let newUploadedFilePath = "";
  let oldImagePath = "";

  try {
    let imageUrl = formData.image_url || "";

    /*
     * Jika admin memilih gambar baru,
     * upload terlebih dahulu.
     */
    if (formData.image instanceof File) {
      oldImagePath = getStoragePathFromPublicUrl(
        formData.image_url
      );

      const uploadResult = await uploadPortfolioImage(
        formData.image
      );

      imageUrl = uploadResult.publicUrl;
      newUploadedFilePath = uploadResult.filePath;
    }

    const payload = createPortfolioPayload(
      formData,
      imageUrl
    );

    const { data, error } = await supabase
      .from(PORTFOLIO_TABLE)
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    /*
     * Database berhasil diperbarui.
     * Gambar lama dapat dihapus setelah gambar baru tersimpan.
     */
    if (
      oldImagePath &&
      newUploadedFilePath &&
      oldImagePath !== newUploadedFilePath
    ) {
      try {
        await deletePortfolioImage(oldImagePath);
      } catch (deleteError) {
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
     * Bersihkan gambar baru yang sempat di-upload.
     */
    if (newUploadedFilePath) {
      try {
        await deletePortfolioImage(
          newUploadedFilePath
        );
      } catch (cleanupError) {
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

/**
 * Menghapus portfolio dari database.
 *
 * Hanya role admin yang seharusnya diizinkan
 * oleh policy DELETE backend.
 */
export async function deletePortfolio(id) {
  if (!id) {
    throw new Error("ID portfolio tidak tersedia.");
  }

  /*
   * Ambil data terlebih dahulu agar image_url diketahui.
   */
  const portfolio = await getPortfolioById(id);

  if (!portfolio) {
    throw new Error("Portfolio tidak ditemukan.");
  }

  const { error } = await supabase
    .from(PORTFOLIO_TABLE)
    .delete()
    .eq("id", id);

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
   * Hapus gambar setelah row database berhasil dihapus.
   */
  const imagePath = getStoragePathFromPublicUrl(
    portfolio.image_url
  );

  if (imagePath) {
    try {
      await deletePortfolioImage(imagePath);
    } catch (storageError) {
      console.error(
        "Portfolio berhasil dihapus, tetapi file gambar gagal dihapus:",
        storageError
      );
    }
  }

  return true;
}