import { supabase } from "../lib/supabase";

const SERVICE_TABLE = "services";
const CATEGORY_TABLE = "service_categories";
const SERVICE_BUCKET = "service-images";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const ALLOWED_STATUS = [
  "draft",
  "published",
  "archived",
];

/*
 * Membuat ID unik untuk nama file Storage.
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

/*
 * Membersihkan nama file sebelum diunggah.
 */
function sanitizeFileName(fileName) {
  const cleanedName = String(
    fileName || "service-image"
  )
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._-]/g, "");

  return cleanedName || "service-image";
}

/*
 * Memastikan gambar sesuai aturan.
 */
function validateServiceImage(file) {
  if (!file) return;

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error(
      "Format gambar tidak didukung. Gunakan JPG, PNG, atau WebP."
    );
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error(
      "Ukuran gambar terlalu besar. Maksimal 2 MB."
    );
  }
}

/*
 * Membuat path file di bucket service-images.
 */
function createImagePath(file) {
  const safeFileName = sanitizeFileName(
    file.name
  );

  return `services/${Date.now()}-${createUniqueId()}-${safeFileName}`;
}

/*
 * Mengambil path Storage dari public URL.
 */
function getStoragePathFromPublicUrl(publicUrl) {
  if (!publicUrl) return "";

  const marker =
    `/storage/v1/object/public/${SERVICE_BUCKET}/`;

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

/*
 * Mengubah nilai tanggal menjadi ISO string.
 */
function normalizeDateValue(value) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

/*
 * Mengubah nilai menjadi angka.
 */
function normalizeNumber(value, fallback = 0) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return fallback;
  }

  return numberValue;
}

/*
 * Memastikan status hanya:
 * draft, published, atau archived.
 */
function normalizeStatus(value) {
  const normalizedStatus = String(
    value || "draft"
  )
    .trim()
    .toLowerCase();

  if (
    ALLOWED_STATUS.includes(
      normalizedStatus
    )
  ) {
    return normalizedStatus;
  }

  return "draft";
}

/*
 * Mengubah fitur menjadi array string
 * agar sesuai dengan kolom jsonb.
 *
 * Bisa menerima:
 * - array
 * - JSON string
 * - teks per baris
 * - teks dipisahkan koma
 */
export function normalizeServiceFeatures(
  value
) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map((item) =>
        String(item || "").trim()
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
            String(item || "").trim()
          )
          .filter(Boolean);
      }
    } catch {
      /*
       * Nilai bukan JSON.
       * Lanjutkan sebagai teks biasa.
       */
    }

    return trimmedValue
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

/*
 * Menormalisasi data kategori.
 */
function normalizeCategoryRecord(category) {
  if (!category) {
    return null;
  }

  return {
    ...category,

    name: String(
      category.name || ""
    ).trim(),

    display_name: String(
      category.name || ""
    ).trim(),
  };
}

/*
 * Membuat Map kategori agar pencarian
 * berdasarkan category_id lebih cepat.
 */
function createCategoryMap(categories) {
  return new Map(
    (categories || []).map((category) => [
      category.id,
      category,
    ])
  );
}

/*
 * Menormalisasi record service.
 *
 * Beberapa alias ditambahkan agar
 * kompatibel dengan halaman frontend lama:
 *
 * name             → title
 * full_description → description
 * features         → items
 */
function normalizeServiceRecord(
  service,
  categoryMap = new Map()
) {
  if (!service) {
    return null;
  }

  const categoryRecord =
    categoryMap.get(
      service.category_id
    ) || null;

  const normalizedFeatures =
    normalizeServiceFeatures(
      service.features
    );

  return {
    ...service,

    category_record: categoryRecord,

    category:
      categoryRecord?.name || "",

    category_name:
      categoryRecord?.name || "",

    category_slug:
      categoryRecord?.slug || "",

    title: service.name || "",

    description:
      service.full_description || "",

    items: normalizedFeatures,

    features: normalizedFeatures,
  };
}

/*
 * Membentuk payload untuk insert dan update.
 */
function createServicePayload(
  values,
  imageUrl,
  includeImage = true
) {
  const status = normalizeStatus(
    values.status
  );

  let publishedAt =
    normalizeDateValue(
      values.published_at
    );

  /*
   * Jika langsung Published tetapi tanggal
   * kosong, gunakan tanggal saat ini.
   */
  if (
    status === "published" &&
    !publishedAt
  ) {
    publishedAt =
      new Date().toISOString();
  }

  const displayOrder =
    normalizeNumber(
      values.display_order ??
        values.sort_order,
      0
    );

  const payload = {
    name: String(
      values.name ??
        values.title ??
        ""
    ).trim(),

    slug: String(values.slug || "")
      .trim()
      .toLowerCase(),

    category_id:
      values.category_id || null,

    short_description: String(
      values.short_description || ""
    ).trim(),

    full_description: String(
      values.full_description ??
        values.description ??
        ""
    ).trim(),

    icon: String(
      values.icon || ""
    ).trim(),

    features:
      normalizeServiceFeatures(
        values.features ??
          values.items
      ),

    /*
     * Karena tabel memiliki sort_order
     * dan display_order, keduanya dibuat
     * sinkron menggunakan nilai yang sama.
     */
    sort_order: displayOrder,
    display_order: displayOrder,

    is_featured: Boolean(
      values.is_featured
    ),

    status,

    seo_title: String(
      values.seo_title || ""
    ).trim(),

    seo_description: String(
      values.seo_description || ""
    ).trim(),

    published_at: publishedAt,
  };

  if (includeImage) {
    payload.image_url =
      imageUrl || null;
  }

  return payload;
}

/*
 * Mengubah error Supabase menjadi
 * pesan yang lebih mudah dipahami.
 */
function throwServiceError(
  error,
  fallbackMessage
) {
  console.error(
    fallbackMessage,
    error
  );

  if (error?.code === "23505") {
    throw new Error(
      "Slug tersebut sudah digunakan oleh layanan lain. Gunakan slug yang berbeda."
    );
  }

  if (error?.code === "23503") {
    throw new Error(
      "Kategori layanan tidak valid atau sudah tidak tersedia."
    );
  }

  if (error?.code === "42501") {
    throw new Error(
      "Akun ini tidak memiliki izin untuk melakukan tindakan tersebut."
    );
  }

  const message = String(
    error?.message || ""
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
      "Tindakan ditolak oleh policy RLS Supabase."
    );
  }

  throw new Error(
    error?.message ||
      fallbackMessage
  );
}

/*
 * Mengambil kategori layanan.
 *
 * includeInactive:
 * false → hanya kategori aktif
 * true  → semua kategori untuk admin
 */
export async function getServiceCategories({
  includeInactive = false,
} = {}) {
  let query = supabase
    .from(CATEGORY_TABLE)
    .select(
      `
        id,
        name,
        slug,
        description,
        icon,
        sort_order,
        is_active,
        created_at,
        updated_at
      `
    )
    .order("sort_order", {
      ascending: true,
    })
    .order("name", {
      ascending: true,
    });

  if (!includeInactive) {
    query = query.eq(
      "is_active",
      true
    );
  }

  const { data, error } =
    await query;

  if (error) {
    throwServiceError(
      error,
      "Kategori layanan gagal dimuat."
    );
  }

  return (data || []).map(
    normalizeCategoryRecord
  );
}

/*
 * Upload gambar ke bucket service-images.
 */
export async function uploadServiceImage(
  file
) {
  validateServiceImage(file);

  if (!file) {
    throw new Error(
      "File gambar layanan tidak tersedia."
    );
  }

  const filePath =
    createImagePath(file);

  const { error: uploadError } =
    await supabase.storage
      .from(SERVICE_BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

  if (uploadError) {
    throwServiceError(
      uploadError,
      "Gambar layanan gagal diunggah."
    );
  }

  const { data: publicUrlData } =
    supabase.storage
      .from(SERVICE_BUCKET)
      .getPublicUrl(filePath);

  const publicUrl =
    publicUrlData?.publicUrl || "";

  if (!publicUrl) {
    await supabase.storage
      .from(SERVICE_BUCKET)
      .remove([filePath]);

    throw new Error(
      "Public URL gambar layanan gagal dibuat."
    );
  }

  return {
    filePath,
    publicUrl,
  };
}

/*
 * Menghapus gambar dari Storage.
 *
 * pathOrUrl dapat berupa:
 * - path file Storage
 * - public URL gambar
 */
export async function deleteServiceImage(
  pathOrUrl
) {
  if (!pathOrUrl) {
    return true;
  }

  const stringValue =
    String(pathOrUrl);

  const filePath =
    stringValue.startsWith("http")
      ? getStoragePathFromPublicUrl(
          stringValue
        )
      : stringValue;

  if (!filePath) {
    return false;
  }

  const { error } =
    await supabase.storage
      .from(SERVICE_BUCKET)
      .remove([filePath]);

  if (error) {
    throwServiceError(
      error,
      "Gambar layanan gagal dihapus."
    );
  }

  return true;
}

/*
 * Mengambil seluruh service untuk admin.
 */
export async function getAdminServices() {
  try {
    const [
      serviceResult,
      categories,
    ] = await Promise.all([
      supabase
        .from(SERVICE_TABLE)
        .select("*")
        .order("display_order", {
          ascending: true,
        })
        .order("created_at", {
          ascending: false,
        }),

      getServiceCategories({
        includeInactive: true,
      }),
    ]);

    if (serviceResult.error) {
      throw serviceResult.error;
    }

    const categoryMap =
      createCategoryMap(categories);

    return (
      serviceResult.data || []
    ).map((service) =>
      normalizeServiceRecord(
        service,
        categoryMap
      )
    );
  } catch (error) {
    throwServiceError(
      error,
      "Daftar layanan admin gagal dimuat."
    );
  }
}

/*
 * Mengambil service Published
 * untuk halaman publik.
 */
export async function getPublishedServices() {
  try {
    const [
      serviceResult,
      categories,
    ] = await Promise.all([
      supabase
        .from(SERVICE_TABLE)
        .select("*")
        .eq("status", "published")
        .order("display_order", {
          ascending: true,
        })
        .order("published_at", {
          ascending: false,
        }),

      getServiceCategories(),
    ]);

    if (serviceResult.error) {
      throw serviceResult.error;
    }

    const categoryMap =
      createCategoryMap(categories);

    return (
      serviceResult.data || []
    ).map((service) =>
      normalizeServiceRecord(
        service,
        categoryMap
      )
    );
  } catch (error) {
    throwServiceError(
      error,
      "Layanan publik gagal dimuat."
    );
  }
}

/*
 * Mengambil featured service
 * untuk homepage.
 */
export async function getFeaturedServices(
  limit = 4
) {
  const parsedLimit =
    Number(limit);

  const safeLimit =
    Number.isInteger(parsedLimit) &&
    parsedLimit > 0
      ? parsedLimit
      : 4;

  try {
    const [
      serviceResult,
      categories,
    ] = await Promise.all([
      supabase
        .from(SERVICE_TABLE)
        .select("*")
        .eq("status", "published")
        .eq("is_featured", true)
        .order("display_order", {
          ascending: true,
        })
        .order("published_at", {
          ascending: false,
        })
        .limit(safeLimit),

      getServiceCategories(),
    ]);

    if (serviceResult.error) {
      throw serviceResult.error;
    }

    const categoryMap =
      createCategoryMap(categories);

    return (
      serviceResult.data || []
    ).map((service) =>
      normalizeServiceRecord(
        service,
        categoryMap
      )
    );
  } catch (error) {
    throwServiceError(
      error,
      "Featured services gagal dimuat."
    );
  }
}

/*
 * Mengambil satu service berdasarkan ID.
 */
export async function getServiceById(
  id
) {
  if (!id) {
    throw new Error(
      "ID layanan tidak tersedia."
    );
  }

  try {
    const [
      serviceResult,
      categories,
    ] = await Promise.all([
      supabase
        .from(SERVICE_TABLE)
        .select("*")
        .eq("id", id)
        .maybeSingle(),

      getServiceCategories({
        includeInactive: true,
      }),
    ]);

    if (serviceResult.error) {
      throw serviceResult.error;
    }

    if (!serviceResult.data) {
      return null;
    }

    const categoryMap =
      createCategoryMap(categories);

    return normalizeServiceRecord(
      serviceResult.data,
      categoryMap
    );
  } catch (error) {
    throwServiceError(
      error,
      "Data layanan gagal dimuat."
    );
  }
}

/*
 * Mengambil detail service Published
 * berdasarkan slug.
 */
export async function getPublishedServiceBySlug(
  slug
) {
  if (!slug) {
    throw new Error(
      "Slug layanan tidak tersedia."
    );
  }

  try {
    const [
      serviceResult,
      categories,
    ] = await Promise.all([
      supabase
        .from(SERVICE_TABLE)
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle(),

      getServiceCategories(),
    ]);

    if (serviceResult.error) {
      throw serviceResult.error;
    }

    if (!serviceResult.data) {
      return null;
    }

    const categoryMap =
      createCategoryMap(categories);

    return normalizeServiceRecord(
      serviceResult.data,
      categoryMap
    );
  } catch (error) {
    throwServiceError(
      error,
      "Detail layanan gagal dimuat."
    );
  }
}

/*
 * Membuat service baru.
 */
export async function createService(
  values,
  imageFile = null
) {
  let uploadedImage = null;

  try {
    if (imageFile) {
      uploadedImage =
        await uploadServiceImage(
          imageFile
        );
    }

    const payload =
      createServicePayload(
        values,
        uploadedImage?.publicUrl ||
          null,
        true
      );

    const { data, error } =
      await supabase
        .from(SERVICE_TABLE)
        .insert(payload)
        .select("*")
        .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    /*
     * Bersihkan gambar apabila insert
     * database gagal.
     */
    if (uploadedImage?.filePath) {
      try {
        await deleteServiceImage(
          uploadedImage.filePath
        );
      } catch (cleanupError) {
        console.error(
          "Gagal membersihkan gambar setelah insert gagal:",
          cleanupError
        );
      }
    }

    throwServiceError(
      error,
      "Layanan gagal dibuat."
    );
  }
}

/*
 * Memperbarui service.
 *
 * Jika imageFile kosong, gambar lama
 * tetap dipertahankan.
 */
export async function updateService(
  id,
  values,
  imageFile = null
) {
  if (!id) {
    throw new Error(
      "ID layanan tidak tersedia."
    );
  }

  let uploadedImage = null;

  try {
    const currentService =
      await getServiceById(id);

    if (!currentService) {
      throw new Error(
        "Layanan tidak ditemukan."
      );
    }

    if (imageFile) {
      uploadedImage =
        await uploadServiceImage(
          imageFile
        );
    }

    const shouldReplaceImage =
      Boolean(
        uploadedImage?.publicUrl
      );

    const payload =
      createServicePayload(
        values,
        uploadedImage?.publicUrl,
        shouldReplaceImage
      );

    const { data, error } =
      await supabase
        .from(SERVICE_TABLE)
        .update(payload)
        .eq("id", id)
        .select("*")
        .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error(
        "Layanan tidak ditemukan atau akun tidak memiliki izin untuk mengedit."
      );
    }

    /*
     * Hapus gambar lama setelah update
     * database berhasil.
     */
    if (
      shouldReplaceImage &&
      currentService.image_url
    ) {
      try {
        await deleteServiceImage(
          currentService.image_url
        );
      } catch (cleanupError) {
        console.error(
          "Layanan berhasil diperbarui, tetapi gambar lama gagal dihapus:",
          cleanupError
        );
      }
    }

    return data;
  } catch (error) {
    /*
     * Bersihkan gambar baru apabila
     * update database gagal.
     */
    if (uploadedImage?.filePath) {
      try {
        await deleteServiceImage(
          uploadedImage.filePath
        );
      } catch (cleanupError) {
        console.error(
          "Gagal membersihkan gambar baru:",
          cleanupError
        );
      }
    }

    throwServiceError(
      error,
      "Layanan gagal diperbarui."
    );
  }
}

/*
 * Menghapus service beserta gambarnya.
 */
export async function deleteService(
  id
) {
  if (!id) {
    throw new Error(
      "ID layanan tidak tersedia."
    );
  }

  try {
    const service =
      await getServiceById(id);

    if (!service) {
      throw new Error(
        "Layanan tidak ditemukan."
      );
    }

    const { data, error } =
      await supabase
        .from(SERVICE_TABLE)
        .delete()
        .eq("id", id)
        .select("id")
        .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error(
        "Layanan tidak ditemukan atau akun tidak memiliki izin untuk menghapus."
      );
    }

    let imageDeleted = false;

    if (service.image_url) {
      try {
        imageDeleted =
          await deleteServiceImage(
            service.image_url
          );
      } catch (storageError) {
        console.error(
          "Layanan terhapus, tetapi gambar gagal dihapus:",
          storageError
        );
      }
    }

    return {
      deletedService: service,
      imageDeleted,
    };
  } catch (error) {
    throwServiceError(
      error,
      "Layanan gagal dihapus."
    );
  }
}