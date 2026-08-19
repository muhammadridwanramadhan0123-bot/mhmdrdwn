import { supabase } from "../lib/supabase";

const SERVICE_TABLE = "services";
const CATEGORY_TABLE = "service_categories";
const SERVICE_FEATURE_TABLE = "service_features";
const SERVICE_BUCKET = "service-images";

const SERVICE_PAGE_SECTION_TABLE = "service_page_sections";
const SERVICE_PAGE_SECTION_ITEM_TABLE = "service_page_section_items";

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

const PRODUCT_SERVICE_MENU_SLUGS = [
  "simrs-erp",
  "konsultasi-pengelolaan-fasilitas-kesehatan",
  "infrastruktur-it-layanan-pendukung",
  "pelatihan-pengembangan-sdm",
];

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
  const cleanedName = String(
    fileName || "service-image"
  )
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._-]/g, "");

  return cleanedName || "service-image";
}

function validateServiceImage(file) {
  if (!file) {
    return;
  }

  if (
    !ALLOWED_IMAGE_TYPES.includes(
      file.type
    )
  ) {
    throw new Error(
      "Format gambar tidak didukung. Gunakan JPG, PNG, atau WebP."
    );
  }

  if (
    file.size >
    MAX_IMAGE_SIZE
  ) {
    throw new Error(
      "Ukuran gambar terlalu besar. Maksimal 2 MB."
    );
  }
}

function createImagePath(file) {
  const safeFileName =
    sanitizeFileName(
      file.name
    );

  return `services/${Date.now()}-${createUniqueId()}-${safeFileName}`;
}

function createServiceFeatureImagePath(
  file
) {
  const safeFileName =
    sanitizeFileName(
      file?.name ||
        "service-feature-image"
    );

  return `features/${Date.now()}-${createUniqueId()}-${safeFileName}`;
}

function getStoragePathFromPublicUrl(
  publicUrl
) {
  if (!publicUrl) {
    return "";
  }

  const marker =
    `/storage/v1/object/public/${SERVICE_BUCKET}/`;

  const markerIndex =
    String(
      publicUrl
    ).indexOf(marker);

  if (
    markerIndex === -1
  ) {
    return "";
  }

  return decodeURIComponent(
    String(
      publicUrl
    ).slice(
      markerIndex +
        marker.length
    )
  );
}

function normalizeDateValue(
  value
) {
  if (!value) {
    return null;
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date.toISOString();
}

function normalizeNumber(
  value,
  fallback = 0
) {
  const numberValue =
    Number(value);

  return Number.isFinite(
    numberValue
  )
    ? numberValue
    : fallback;
}

function normalizeStatus(value) {
  const normalizedStatus =
    String(
      value || "draft"
    )
      .trim()
      .toLowerCase();

  return ALLOWED_STATUS.includes(
    normalizedStatus
  )
    ? normalizedStatus
    : "draft";
}

/*
 * ======================================================
 * TRANSLATION HELPERS
 * ======================================================
 */

function normalizePublicLocale(
  locale
) {
  return String(
    locale || "id"
  )
    .trim()
    .toLowerCase() === "en"
    ? "en"
    : "id";
}

function getTranslatedText(
  translatedValue,
  originalValue
) {
  if (
    typeof translatedValue ===
    "string"
  ) {
    const translated =
      translatedValue.trim();

    if (translated) {
      return translated;
    }
  }

  if (
    typeof originalValue ===
    "string"
  ) {
    return originalValue.trim();
  }

  return originalValue ?? "";
}

function normalizePublicObject(
  value
) {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value;
  }

  return {};
}

function mergeTranslatedMetadata(
  baseMetadata,
  translatedMetadata
) {
  const base =
    normalizePublicObject(
      baseMetadata
    );

  const translated =
    normalizePublicObject(
      translatedMetadata
    );

  const baseGroupDescriptions =
    normalizePublicObject(
      base.group_descriptions
    );

  const translatedGroupDescriptions =
    normalizePublicObject(
      translated.group_descriptions
    );

  return {
    ...base,
    ...translated,

    group_descriptions: {
      ...baseGroupDescriptions,
      ...translatedGroupDescriptions,
    },
  };
}

function sortPublicServiceFeatures(
  features = []
) {
  return [...features].sort(
    (
      firstItem,
      secondItem
    ) => {
      const firstGroupOrder =
        Number(
          firstItem.group_order
        ) || 0;

      const secondGroupOrder =
        Number(
          secondItem.group_order
        ) || 0;

      if (
        firstGroupOrder !==
        secondGroupOrder
      ) {
        return (
          firstGroupOrder -
          secondGroupOrder
        );
      }

      const firstSortOrder =
        Number(
          firstItem.sort_order
        ) || 0;

      const secondSortOrder =
        Number(
          secondItem.sort_order
        ) || 0;

      if (
        firstSortOrder !==
        secondSortOrder
      ) {
        return (
          firstSortOrder -
          secondSortOrder
        );
      }

      return String(
        firstItem.name || ""
      ).localeCompare(
        String(
          secondItem.name || ""
        ),
        "id"
      );
    }
  );
}

function createPublicServiceFeatureGroups(
  features = [],
  featuresSection = {}
) {
  const groupMap =
    new Map();

  const groupDescriptions =
    normalizePublicObject(
      featuresSection
        ?.metadata
        ?.group_descriptions
    );

  features.forEach(
    (feature) => {
      const groupName =
        String(
          feature.group_name || ""
        ).trim();

      if (!groupName) {
        return;
      }

      const baseGroupName =
        String(
          feature.base_group_name ||
            ""
        ).trim();

      if (
        !groupMap.has(
          groupName
        )
      ) {
        groupMap.set(
          groupName,
          {
            name:
              groupName,

            base_name:
              baseGroupName,

            order:
              Number(
                feature.group_order
              ) || 0,

            description:
              groupDescriptions[
                groupName
              ] ||
              groupDescriptions[
                baseGroupName
              ] ||
              "",

            features: [],
          }
        );
      }

      groupMap
        .get(groupName)
        .features.push(
          feature
        );
    }
  );

  return Array.from(
    groupMap.values()
  )
    .map(
      (group) => ({
        ...group,

        features:
          sortPublicServiceFeatures(
            group.features
          ),
      })
    )
    .sort(
      (
        firstGroup,
        secondGroup
      ) => {
        if (
          firstGroup.order !==
          secondGroup.order
        ) {
          return (
            firstGroup.order -
            secondGroup.order
          );
        }

        return firstGroup.name.localeCompare(
          secondGroup.name,
          "id"
        );
      }
    );
}

/*
 * ======================================================
 * LEGACY SERVICE FEATURES JSON
 * ======================================================
 */

export function normalizeServiceFeatures(
  value
) {
  if (!value) {
    return [];
  }

  if (
    Array.isArray(value)
  ) {
    return value
      .map((item) =>
        String(
          item || ""
        ).trim()
      )
      .filter(Boolean);
  }

  if (
    typeof value ===
    "string"
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
            String(
              item || ""
            ).trim()
          )
          .filter(Boolean);
      }
    } catch {
      /*
       * Bukan JSON.
       * Lanjut sebagai teks.
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

/*
 * ======================================================
 * CATEGORY HELPERS
 * ======================================================
 */

function normalizeCategoryRecord(
  category
) {
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

function createCategoryMap(
  categories
) {
  return new Map(
    (categories || []).map(
      (category) => [
        category.id,
        category,
      ]
    )
  );
}

/*
 * ======================================================
 * SERVICE NORMALIZATION
 * ======================================================
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

    category_record:
      categoryRecord,

    category:
      categoryRecord?.name ||
      "",

    category_name:
      categoryRecord?.name ||
      "",

    category_slug:
      categoryRecord?.slug ||
      "",

    title:
      service.name || "",

    description:
      service.full_description ||
      "",

    items:
      normalizedFeatures,

    features:
      normalizedFeatures,
  };
}

function createServicePayload(
  values,
  imageUrl,
  includeImage = true
) {
  const status =
    normalizeStatus(
      values.status
    );

  let publishedAt =
    normalizeDateValue(
      values.published_at
    );

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

    slug: String(
      values.slug || ""
    )
      .trim()
      .toLowerCase(),

    category_id:
      values.category_id ||
      null,

    short_description:
      String(
        values.short_description ||
          ""
      ).trim(),

    full_description:
      String(
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

    sort_order:
      displayOrder,

    display_order:
      displayOrder,

    is_featured:
      Boolean(
        values.is_featured
      ),

    status,

    seo_title:
      String(
        values.seo_title || ""
      ).trim(),

    seo_description:
      String(
        values.seo_description ||
          ""
      ).trim(),

    published_at:
      publishedAt,
  };

  if (includeImage) {
    payload.image_url =
      imageUrl || null;
  }

  return payload;
}

/*
 * ======================================================
 * ERROR HANDLING
 * ======================================================
 */

function throwServiceError(
  error,
  fallbackMessage
) {
  console.error(
    fallbackMessage,
    error
  );

  if (
    error?.code === "23505"
  ) {
    throw new Error(
      "Slug tersebut sudah digunakan oleh layanan lain. Gunakan slug yang berbeda."
    );
  }

  if (
    error?.code === "23503"
  ) {
    throw new Error(
      "Kategori layanan tidak valid atau sudah tidak tersedia."
    );
  }

  if (
    error?.code === "42501"
  ) {
    throw new Error(
      "Akun ini tidak memiliki izin untuk melakukan tindakan tersebut."
    );
  }

  const message =
    String(
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

function throwServiceFeatureError(
  error,
  fallbackMessage
) {
  console.error(
    fallbackMessage,
    error
  );

  if (
    error?.code === "23505"
  ) {
    throw new Error(
      "Slug fitur sudah digunakan. Gunakan slug fitur yang berbeda."
    );
  }

  if (
    error?.code === "23503"
  ) {
    throw new Error(
      "Layanan induk atau Parent Fitur tidak valid atau sudah tidak tersedia."
    );
  }

  if (
    error?.code === "23514"
  ) {
    throw new Error(
      "Data fitur tidak sesuai aturan database. Periksa status dan urutan tampil."
    );
  }

  if (
    error?.code === "23502"
  ) {
    throw new Error(
      "Terdapat data wajib fitur yang belum diisi."
    );
  }

  if (
    error?.code === "42501"
  ) {
    throw new Error(
      "Akun ini tidak memiliki izin untuk mengelola detail fitur."
    );
  }

  const message =
    String(
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
      "Tindakan ditolak oleh policy RLS service_features."
    );
  }

  throw new Error(
    error?.message ||
      fallbackMessage
  );
}

/*
 * ======================================================
 * SERVICE CATEGORIES
 * ======================================================
 */

export async function getServiceCategories({
  includeInactive = false,
} = {}) {
  let query = supabase
    .from(
      CATEGORY_TABLE
    )
    .select(`
      id,
      name,
      slug,
      description,
      icon,
      sort_order,
      is_active,
      created_at,
      updated_at
    `)
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

  if (!includeInactive) {
    query = query.eq(
      "is_active",
      true
    );
  }

  const {
    data,
    error,
  } = await query;

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

export async function getActiveServiceCategories() {
  return getServiceCategories();
}

/*
 * ======================================================
 * SERVICE IMAGE
 * ======================================================
 */

export async function uploadServiceImage(
  file
) {
  validateServiceImage(
    file
  );

  if (!file) {
    throw new Error(
      "File gambar layanan tidak tersedia."
    );
  }

  const filePath =
    createImagePath(file);

  const {
    error: uploadError,
  } = await supabase.storage
    .from(
      SERVICE_BUCKET
    )
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

  if (uploadError) {
    throwServiceError(
      uploadError,
      "Gambar layanan gagal diunggah."
    );
  }

  const {
    data: publicUrlData,
  } = supabase.storage
    .from(
      SERVICE_BUCKET
    )
    .getPublicUrl(
      filePath
    );

  const publicUrl =
    publicUrlData?.publicUrl ||
    "";

  if (!publicUrl) {
    await supabase.storage
      .from(
        SERVICE_BUCKET
      )
      .remove([
        filePath,
      ]);

    throw new Error(
      "Public URL gambar layanan gagal dibuat."
    );
  }

  return {
    filePath,
    publicUrl,
  };
}

export async function deleteServiceImage(
  pathOrUrl
) {
  if (!pathOrUrl) {
    return true;
  }

  const stringValue =
    String(pathOrUrl);

  const filePath =
    stringValue.startsWith(
      "http"
    )
      ? getStoragePathFromPublicUrl(
          stringValue
        )
      : stringValue;

  if (!filePath) {
    return false;
  }

  const {
    error,
  } = await supabase.storage
    .from(
      SERVICE_BUCKET
    )
    .remove([
      filePath,
    ]);

  if (error) {
    throwServiceError(
      error,
      "Gambar layanan gagal dihapus."
    );
  }

  return true;
}

/*
 * ======================================================
 * ADMIN SERVICES
 * ======================================================
 */

export async function getAdminServices() {
  try {
    const [
      serviceResult,
      categories,
    ] = await Promise.all([
      supabase
        .from(
          SERVICE_TABLE
        )
        .select("*")
        .order(
          "display_order",
          {
            ascending: true,
          }
        )
        .order(
          "created_at",
          {
            ascending: false,
          }
        ),

      getServiceCategories({
        includeInactive: true,
      }),
    ]);

    if (
      serviceResult.error
    ) {
      throw serviceResult.error;
    }

    const categoryMap =
      createCategoryMap(
        categories
      );

    return (
      serviceResult.data ||
      []
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
        .from(
          SERVICE_TABLE
        )
        .select("*")
        .eq(
          "id",
          id
        )
        .maybeSingle(),

      getServiceCategories({
        includeInactive: true,
      }),
    ]);

    if (
      serviceResult.error
    ) {
      throw serviceResult.error;
    }

    if (
      !serviceResult.data
    ) {
      return null;
    }

    return normalizeServiceRecord(
      serviceResult.data,
      createCategoryMap(
        categories
      )
    );
  } catch (error) {
    throwServiceError(
      error,
      "Data layanan gagal dimuat."
    );
  }
}

/*
 * ======================================================
 * PUBLIC SERVICES
 * ======================================================
 */

export async function getPublishedServices() {
  try {
    const [
      serviceResult,
      categories,
    ] = await Promise.all([
      supabase
        .from(
          SERVICE_TABLE
        )
        .select("*")
        .eq(
          "status",
          "published"
        )
        .order(
          "display_order",
          {
            ascending: true,
          }
        )
        .order(
          "published_at",
          {
            ascending: false,
          }
        ),

      getServiceCategories(),
    ]);

    if (
      serviceResult.error
    ) {
      throw serviceResult.error;
    }

    const categoryMap =
      createCategoryMap(
        categories
      );

    return (
      serviceResult.data ||
      []
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

export async function getFeaturedServices(
  limit = 4
) {
  const parsedLimit =
    Number(limit);

  const safeLimit =
    Number.isInteger(
      parsedLimit
    ) &&
    parsedLimit > 0
      ? parsedLimit
      : 4;

  try {
    const [
      serviceResult,
      categories,
    ] = await Promise.all([
      supabase
        .from(
          SERVICE_TABLE
        )
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
          "display_order",
          {
            ascending: true,
          }
        )
        .order(
          "published_at",
          {
            ascending: false,
          }
        )
        .limit(
          safeLimit
        ),

      getServiceCategories(),
    ]);

    if (
      serviceResult.error
    ) {
      throw serviceResult.error;
    }

    const categoryMap =
      createCategoryMap(
        categories
      );

    return (
      serviceResult.data ||
      []
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

export async function getPublishedServiceBySlug(
  slug
) {
  const normalizedSlug =
    String(
      slug || ""
    ).trim();

  if (!normalizedSlug) {
    return null;
  }

  const {
    data: service,
    error: serviceError,
  } = await supabase
    .from(
      SERVICE_TABLE
    )
    .select(`
      id,
      category_id,
      name,
      slug,
      short_description,
      full_description,
      image_url,
      icon,
      features,
      sort_order,
      display_order,
      is_featured,
      status,
      published_at,
      seo_title,
      seo_description,
      created_at,
      updated_at
    `)
    .eq(
      "slug",
      normalizedSlug
    )
    .eq(
      "status",
      "published"
    )
    .maybeSingle();

  if (serviceError) {
    throwServiceError(
      serviceError,
      "Detail layanan gagal dimuat."
    );
  }

  if (!service) {
    return null;
  }

  let category =
    null;

  if (
    service.category_id
  ) {
    const {
      data: categoryData,
      error: categoryError,
    } = await supabase
      .from(
        CATEGORY_TABLE
      )
      .select(
        "id, name, slug, description"
      )
      .eq(
        "id",
        service.category_id
      )
      .maybeSingle();

    if (categoryError) {
      console.warn(
        "Kategori layanan gagal dimuat:",
        categoryError
      );
    } else {
      category =
        categoryData;
    }
  }

  return {
    ...service,

    category,

    category_name:
      category?.name ||
      "",

    category_slug:
      category?.slug ||
      "",
  };
}

/*
 * ======================================================
 * PUBLIC SERVICE PAGE CMS
 * BILINGUAL ID / EN
 * ======================================================
 */

export async function getPublishedServicePageBySlug(
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
    return null;
  }

  /*
   * ====================================================
   * 1. SERVICE DASAR
   * ====================================================
   */

  const {
    data: baseService,
    error: serviceError,
  } = await supabase
    .from(
      SERVICE_TABLE
    )
    .select(`
      id,
      category_id,
      name,
      slug,
      short_description,
      full_description,
      image_url,
      icon,
      status,
      seo_title,
      seo_description,
      published_at,
      created_at,
      updated_at
    `)
    .eq(
      "slug",
      normalizedSlug
    )
    .eq(
      "status",
      "published"
    )
    .maybeSingle();

  if (serviceError) {
    throwServiceError(
      serviceError,
      "Service page gagal dimuat."
    );
  }

  if (!baseService) {
    return null;
  }

  /*
   * ====================================================
   * 2. SECTION + FEATURE DASAR
   * ====================================================
   */

  const [
    sectionResult,
    featureResult,
  ] = await Promise.all([
    supabase
      .from(
        SERVICE_PAGE_SECTION_TABLE
      )
      .select(`
        id,
        service_id,
        section_key,
        section_type,
        eyebrow,
        title,
        description,
        image_url,
        file_url,
        button_label,
        button_url,
        metadata,
        sort_order,
        status
      `)
      .eq(
        "service_id",
        baseService.id
      )
      .eq(
        "status",
        "published"
      )
      .order(
        "sort_order",
        {
          ascending: true,
        }
      ),

    supabase
      .from(
        SERVICE_FEATURE_TABLE
      )
      .select(`
        id,
        service_id,
        parent_feature_id,
        group_name,
        group_order,
        name,
        slug,
        short_description,
        full_description,
        image_url,
        sort_order,
        status
      `)
      .eq(
        "service_id",
        baseService.id
      )
      .eq(
        "status",
        "published"
      )
      .order(
        "group_order",
        {
          ascending: true,
          nullsFirst: false,
        }
      )
      .order(
        "sort_order",
        {
          ascending: true,
        }
      ),
  ]);

  if (
    sectionResult.error
  ) {
    throwServiceError(
      sectionResult.error,
      "Section halaman service gagal dimuat."
    );
  }

  if (
    featureResult.error
  ) {
    throwServiceFeatureError(
      featureResult.error,
      "Feature halaman service gagal dimuat."
    );
  }

  const baseSections =
    Array.isArray(
      sectionResult.data
    )
      ? sectionResult.data
      : [];

  const baseFeatures =
    Array.isArray(
      featureResult.data
    )
      ? featureResult.data
      : [];

  const sectionIds =
    baseSections.map(
      (section) =>
        section.id
    );

  const featureIds =
    baseFeatures.map(
      (feature) =>
        feature.id
    );

  /*
   * ====================================================
   * 3. ITEM SECTION DASAR
   * ====================================================
   */

  let baseSectionItems =
    [];

  if (
    sectionIds.length > 0
  ) {
    const {
      data: itemData,
      error: itemError,
    } = await supabase
      .from(
        SERVICE_PAGE_SECTION_ITEM_TABLE
      )
      .select(`
        id,
        section_id,
        title,
        description,
        value,
        label,
        icon_name,
        image_url,
        file_url,
        link_url,
        sort_order,
        status
      `)
      .in(
        "section_id",
        sectionIds
      )
      .eq(
        "status",
        "published"
      )
      .order(
        "sort_order",
        {
          ascending: true,
        }
      );

    if (itemError) {
      throwServiceError(
        itemError,
        "Item section gagal dimuat."
      );
    }

    baseSectionItems =
      Array.isArray(
        itemData
      )
        ? itemData
        : [];
  }

  /*
   * ====================================================
   * 4. TRANSLATION
   * ====================================================
   */

  let serviceTranslation =
    null;

  let sectionTranslations =
    [];

  let itemTranslations =
    [];

  let featureTranslations =
    [];

  if (
    normalizedLocale !==
    "id"
  ) {
    /*
     * SERVICE TRANSLATION
     */

    const {
      data,
      error,
    } = await supabase
      .from(
        "service_translations"
      )
      .select(`
        service_id,
        locale,
        name,
        short_description,
        full_description,
        seo_title,
        seo_description,
        status
      `)
      .eq(
        "service_id",
        baseService.id
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
        "Translation service tidak dapat dimuat. Menggunakan fallback Indonesia:",
        error
      );
    } else {
      serviceTranslation =
        data || null;
    }

    /*
     * SECTION TRANSLATIONS
     */

    if (
      sectionIds.length > 0
    ) {
      const {
        data,
        error,
      } = await supabase
        .from(
          "service_page_section_translations"
        )
        .select(`
          section_id,
          locale,
          eyebrow,
          title,
          description,
          button_label,
          metadata,
          status
        `)
        .in(
          "section_id",
          sectionIds
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
          "Translation section tidak dapat dimuat. Menggunakan fallback Indonesia:",
          error
        );
      } else {
        sectionTranslations =
          Array.isArray(
            data
          )
            ? data
            : [];
      }
    }

    /*
     * ITEM TRANSLATIONS
     */

    const itemIds =
      baseSectionItems.map(
        (item) =>
          item.id
      );

    if (
      itemIds.length > 0
    ) {
      const {
        data,
        error,
      } = await supabase
        .from(
          "service_page_section_item_translations"
        )
        .select(`
          item_id,
          locale,
          title,
          description,
          value,
          label,
          status
        `)
        .in(
          "item_id",
          itemIds
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
          "Translation item section tidak dapat dimuat. Menggunakan fallback Indonesia:",
          error
        );
      } else {
        itemTranslations =
          Array.isArray(
            data
          )
            ? data
            : [];
      }
    }

    /*
     * FEATURE TRANSLATIONS
     */

    if (
      featureIds.length > 0
    ) {
      const {
        data,
        error,
      } = await supabase
        .from(
          "service_feature_translations"
        )
        .select(`
          feature_id,
          locale,
          group_name,
          name,
          short_description,
          full_description,
          status
        `)
        .in(
          "feature_id",
          featureIds
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
          "Translation feature tidak dapat dimuat. Menggunakan fallback Indonesia:",
          error
        );
      } else {
        featureTranslations =
          Array.isArray(
            data
          )
            ? data
            : [];
      }
    }
  }

  /*
   * ====================================================
   * 5. TRANSLATION MAP
   * ====================================================
   */

  const sectionTranslationMap =
    new Map(
      sectionTranslations.map(
        (translation) => [
          translation.section_id,
          translation,
        ]
      )
    );

  const itemTranslationMap =
    new Map(
      itemTranslations.map(
        (translation) => [
          translation.item_id,
          translation,
        ]
      )
    );

  const featureTranslationMap =
    new Map(
      featureTranslations.map(
        (translation) => [
          translation.feature_id,
          translation,
        ]
      )
    );

  /*
   * ====================================================
   * 6. MERGE SECTION ITEMS
   * ====================================================
   */

  const itemsBySection =
    new Map();

  sectionIds.forEach(
    (sectionId) => {
      itemsBySection.set(
        sectionId,
        []
      );
    }
  );

  baseSectionItems.forEach(
    (baseItem) => {
      const translation =
        itemTranslationMap.get(
          baseItem.id
        );

      const mergedItem = {
        ...baseItem,

        title:
          getTranslatedText(
            translation?.title,
            baseItem.title
          ),

        description:
          getTranslatedText(
            translation?.description,
            baseItem.description
          ),

        value:
          getTranslatedText(
            translation?.value,
            baseItem.value
          ),

        label:
          getTranslatedText(
            translation?.label,
            baseItem.label
          ),

        sort_order:
          Number(
            baseItem.sort_order
          ) || 0,

        translation_locale:
          translation
            ? normalizedLocale
            : "id",
      };

      if (
        !itemsBySection.has(
          baseItem.section_id
        )
      ) {
        itemsBySection.set(
          baseItem.section_id,
          []
        );
      }

      itemsBySection
        .get(
          baseItem.section_id
        )
        .push(
          mergedItem
        );
    }
  );

  /*
   * ====================================================
   * 7. MERGE SECTIONS
   * ====================================================
   */

  const normalizedSections =
    baseSections.map(
      (baseSection) => {
        const translation =
          sectionTranslationMap.get(
            baseSection.id
          );

        return {
          ...baseSection,

          eyebrow:
            getTranslatedText(
              translation?.eyebrow,
              baseSection.eyebrow
            ),

          title:
            getTranslatedText(
              translation?.title,
              baseSection.title
            ),

          description:
            getTranslatedText(
              translation?.description,
              baseSection.description
            ),

          button_label:
            getTranslatedText(
              translation?.button_label,
              baseSection.button_label
            ),

          metadata:
            mergeTranslatedMetadata(
              baseSection.metadata,
              translation?.metadata
            ),

          sort_order:
            Number(
              baseSection.sort_order
            ) || 0,

          items:
            itemsBySection.get(
              baseSection.id
            ) || [],

          translation_locale:
            translation
              ? normalizedLocale
              : "id",
        };
      }
    );

  const sectionMap =
    normalizedSections.reduce(
      (
        result,
        section
      ) => {
        result[
          section.section_key
        ] =
          section;

        return result;
      },
      {}
    );

  /*
   * ====================================================
   * 8. MERGE SERVICE FEATURES
   * ====================================================
   */

  const translatedFeatures =
    sortPublicServiceFeatures(
      baseFeatures.map(
        (baseFeature) => {
          const translation =
            featureTranslationMap.get(
              baseFeature.id
            );

          const baseGroupName =
            String(
              baseFeature.group_name ||
                ""
            ).trim();

          return {
            ...baseFeature,

            base_group_name:
              baseGroupName,

            parent_feature_id:
              baseFeature.parent_feature_id ||
              null,

            group_name:
              getTranslatedText(
                translation?.group_name,
                baseGroupName
              ),

            group_order:
              Number(
                baseFeature.group_order
              ) || 0,

            name:
              getTranslatedText(
                translation?.name,
                baseFeature.name
              ),

            short_description:
              getTranslatedText(
                translation?.short_description,
                baseFeature.short_description
              ),

            full_description:
              getTranslatedText(
                translation?.full_description,
                baseFeature.full_description
              ),

            sort_order:
              Number(
                baseFeature.sort_order
              ) || 0,

            translation_locale:
              translation
                ? normalizedLocale
                : "id",
          };
        }
      )
    );

  /*
   * ====================================================
   * 9. MERGE SERVICE
   * ====================================================
   */

  const translatedService = {
    ...baseService,

    name:
      getTranslatedText(
        serviceTranslation?.name,
        baseService.name
      ),

    short_description:
      getTranslatedText(
        serviceTranslation?.short_description,
        baseService.short_description
      ),

    full_description:
      getTranslatedText(
        serviceTranslation?.full_description,
        baseService.full_description
      ),

    seo_title:
      getTranslatedText(
        serviceTranslation?.seo_title,
        baseService.seo_title
      ),

    seo_description:
      getTranslatedText(
        serviceTranslation?.seo_description,
        baseService.seo_description
      ),

    translation_locale:
      serviceTranslation
        ? normalizedLocale
        : "id",

    sections:
      sectionMap,

    section_list:
      normalizedSections,

    /*
     * Alias lama + baru.
     * Menjaga kompatibilitas komponen existing.
     */
    features:
      translatedFeatures,

    service_features:
      translatedFeatures,
  };

  /*
   * Feature groups dibuat SETELAH
   * translation selesai.
   */

  translatedService.feature_groups =
    createPublicServiceFeatureGroups(
      translatedFeatures,
      sectionMap.features ||
        {}
    );

  /*
   * Feature tanpa group tetap tersedia.
   */

  translatedService.standalone_features =
    translatedFeatures.filter(
      (feature) =>
        !String(
          feature.group_name ||
            ""
        ).trim()
    );

  return translatedService;
}

/*
 * ======================================================
 * PUBLIC SERVICES FOR PUBLIC PAGE
 * ======================================================
 */

export async function getPublishedServicesForPublic() {
  const {
    data,
    error,
  } = await supabase
    .from(
      SERVICE_TABLE
    )
    .select(`
      id,
      category_id,
      name,
      slug,
      short_description,
      full_description,
      image_url,
      icon,
      features,
      sort_order,
      display_order,
      is_featured,
      status,
      published_at
    `)
    .eq(
      "status",
      "published"
    )
    .order(
      "sort_order",
      {
        ascending: true,
      }
    );

  if (error) {
    throwServiceError(
      error,
      "Layanan publik gagal dimuat."
    );
  }

  return data || [];
}

/*
 * ======================================================
 * CREATE SERVICE
 * ======================================================
 */

export async function createService(
  values,
  imageFile = null
) {
  let uploadedImage =
    null;

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

    const {
      data,
      error,
    } = await supabase
      .from(
        SERVICE_TABLE
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
    if (
      uploadedImage?.filePath
    ) {
      try {
        await deleteServiceImage(
          uploadedImage.filePath
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

    throwServiceError(
      error,
      "Layanan gagal dibuat."
    );
  }
}

/*
 * ======================================================
 * UPDATE SERVICE
 * ======================================================
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

  let uploadedImage =
    null;

  try {
    const currentService =
      await getServiceById(
        id
      );

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

    const {
      data,
      error,
    } = await supabase
      .from(
        SERVICE_TABLE
      )
      .update(
        payload
      )
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
        "Layanan tidak ditemukan atau akun tidak memiliki izin untuk mengedit."
      );
    }

    if (
      shouldReplaceImage &&
      currentService.image_url
    ) {
      try {
        await deleteServiceImage(
          currentService.image_url
        );
      } catch (
        cleanupError
      ) {
        console.error(
          "Layanan berhasil diperbarui, tetapi gambar lama gagal dihapus:",
          cleanupError
        );
      }
    }

    return data;
  } catch (error) {
    if (
      uploadedImage?.filePath
    ) {
      try {
        await deleteServiceImage(
          uploadedImage.filePath
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

    throwServiceError(
      error,
      "Layanan gagal diperbarui."
    );
  }
}

/*
 * ======================================================
 * DELETE SERVICE
 * ======================================================
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
      await getServiceById(
        id
      );

    if (!service) {
      throw new Error(
        "Layanan tidak ditemukan."
      );
    }

    const {
      data,
      error,
    } = await supabase
      .from(
        SERVICE_TABLE
      )
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
        "Layanan tidak ditemukan atau akun tidak memiliki izin untuk menghapus."
      );
    }

    let imageDeleted =
      false;

    if (
      service.image_url
    ) {
      try {
        imageDeleted =
          await deleteServiceImage(
            service.image_url
          );
      } catch (
        storageError
      ) {
        console.error(
          "Layanan terhapus, tetapi gambar gagal dihapus:",
          storageError
        );
      }
    }

    return {
      deletedService:
        service,

      imageDeleted,
    };
  } catch (error) {
    throwServiceError(
      error,
      "Layanan gagal dihapus."
    );
  }
}

/*
 * ======================================================
 * SERVICE FEATURE HELPERS
 * ======================================================
 */

function normalizeServiceFeatureSlug(
  value
) {
  return String(
    value || ""
  )
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .replace(
      /&/g,
      " and "
    )
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    );
}

function normalizeServiceFeatureRecord(
  feature
) {
  if (!feature) {
    return null;
  }

  return {
    ...feature,

    service_id:
      String(
        feature.service_id ||
          ""
      ).trim(),

    parent_feature_id:
      feature.parent_feature_id
        ? String(
            feature.parent_feature_id
          ).trim()
        : null,

    group_name:
      String(
        feature.group_name ||
          ""
      ).trim(),

    group_order:
      Number(
        feature.group_order
      ) || 0,

    name:
      String(
        feature.name || ""
      ).trim(),

    slug:
      String(
        feature.slug || ""
      ).trim(),

    short_description:
      String(
        feature.short_description ||
          ""
      ).trim(),

    full_description:
      String(
        feature.full_description ||
          ""
      ).trim(),

    image_url:
      String(
        feature.image_url ||
          ""
      ).trim(),

    sort_order:
      Number(
        feature.sort_order
      ) || 0,

    status:
      normalizeStatus(
        feature.status
      ),
  };
}

function createServiceFeaturePayload(
  values = {},
  {
    serviceId = "",
    imageUrl = "",
    includeServiceId = false,
    includeImage = true,
  } = {}
) {
  const name =
    String(
      values.name || ""
    ).trim();

  if (!name) {
    throw new Error(
      "Nama fitur wajib diisi."
    );
  }

  const slug =
    normalizeServiceFeatureSlug(
      values.slug
    ) ||
    normalizeServiceFeatureSlug(
      name
    );

  if (!slug) {
    throw new Error(
      "Slug fitur tidak valid."
    );
  }

  const rawSortOrder =
    Number(
      values.sort_order ??
        0
    );

  if (
    !Number.isFinite(
      rawSortOrder
    ) ||
    rawSortOrder < 0
  ) {
    throw new Error(
      "Urutan fitur minimal bernilai 0."
    );
  }

  const rawGroupOrder =
    Number(
      values.group_order ??
        0
    );

  if (
    !Number.isFinite(
      rawGroupOrder
    ) ||
    rawGroupOrder < 0
  ) {
    throw new Error(
      "Urutan kelompok minimal bernilai 0."
    );
  }

  const parentFeatureId =
    values.parent_feature_id
      ? String(
          values.parent_feature_id
        ).trim()
      : null;

  const payload = {
    parent_feature_id:
      parentFeatureId ||
      null,

    group_name:
      String(
        values.group_name ||
          ""
      ).trim() ||
      null,

    group_order:
      Math.trunc(
        rawGroupOrder
      ),

    name,

    slug,

    short_description:
      String(
        values.short_description ||
          ""
      ).trim(),

    full_description:
      String(
        values.full_description ||
          ""
      ).trim(),

    sort_order:
      Math.trunc(
        rawSortOrder
      ),

    status:
      normalizeStatus(
        values.status
      ),

    updated_at:
      new Date().toISOString(),
  };

  if (
    includeServiceId
  ) {
    const normalizedServiceId =
      String(
        serviceId || ""
      ).trim();

    if (
      !normalizedServiceId
    ) {
      throw new Error(
        "ID layanan induk tidak tersedia."
      );
    }

    payload.service_id =
      normalizedServiceId;
  }

  if (includeImage) {
    payload.image_url =
      String(
        imageUrl || ""
      ).trim() ||
      null;
  }

  return payload;
}

/*
 * ======================================================
 * FEATURE IMAGE
 * ======================================================
 */

export async function uploadServiceFeatureImage(
  file
) {
  validateServiceImage(
    file
  );

  if (!file) {
    throw new Error(
      "File gambar fitur tidak tersedia."
    );
  }

  const filePath =
    createServiceFeatureImagePath(
      file
    );

  const {
    error: uploadError,
  } = await supabase.storage
    .from(
      SERVICE_BUCKET
    )
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

  if (uploadError) {
    throwServiceFeatureError(
      uploadError,
      "Gambar fitur gagal diunggah."
    );
  }

  const {
    data: publicUrlData,
  } = supabase.storage
    .from(
      SERVICE_BUCKET
    )
    .getPublicUrl(
      filePath
    );

  const publicUrl =
    publicUrlData?.publicUrl ||
    "";

  if (!publicUrl) {
    await supabase.storage
      .from(
        SERVICE_BUCKET
      )
      .remove([
        filePath,
      ]);

    throw new Error(
      "Public URL gambar fitur gagal dibuat."
    );
  }

  return {
    filePath,
    publicUrl,
  };
}

/*
 * ======================================================
 * ADMIN SERVICE FEATURES
 * ======================================================
 */

export async function getAdminServiceFeatures(
  serviceId
) {
  const normalizedServiceId =
    String(
      serviceId || ""
    ).trim();

  if (
    !normalizedServiceId
  ) {
    return [];
  }

  const {
    data,
    error,
  } = await supabase
    .from(
      SERVICE_FEATURE_TABLE
    )
    .select("*")
    .eq(
      "service_id",
      normalizedServiceId
    )
    .order(
      "group_order",
      {
        ascending: true,
      }
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
    throwServiceFeatureError(
      error,
      "Daftar detail fitur gagal dimuat."
    );
  }

  return (data || []).map(
    normalizeServiceFeatureRecord
  );
}

export async function getServiceFeatureById(
  featureId
) {
  const normalizedFeatureId =
    String(
      featureId || ""
    ).trim();

  if (
    !normalizedFeatureId
  ) {
    throw new Error(
      "ID fitur tidak tersedia."
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from(
      SERVICE_FEATURE_TABLE
    )
    .select("*")
    .eq(
      "id",
      normalizedFeatureId
    )
    .maybeSingle();

  if (error) {
    throwServiceFeatureError(
      error,
      "Detail fitur gagal dimuat."
    );
  }

  return normalizeServiceFeatureRecord(
    data
  );
}

export async function createServiceFeature(
  serviceId,
  values = {},
  imageFile = null
) {
  const normalizedServiceId =
    String(
      serviceId || ""
    ).trim();

  if (
    !normalizedServiceId
  ) {
    throw new Error(
      "ID layanan induk tidak tersedia."
    );
  }

  let uploadedImage =
    null;

  try {
    let nextImageUrl =
      String(
        values.image_url ||
          ""
      ).trim();

    if (imageFile) {
      uploadedImage =
        await uploadServiceFeatureImage(
          imageFile
        );

      nextImageUrl =
        uploadedImage.publicUrl;
    }

    const payload =
      createServiceFeaturePayload(
        values,
        {
          serviceId:
            normalizedServiceId,

          imageUrl:
            nextImageUrl,

          includeServiceId:
            true,

          includeImage:
            true,
        }
      );

    const {
      data,
      error,
    } = await supabase
      .from(
        SERVICE_FEATURE_TABLE
      )
      .insert(
        payload
      )
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return normalizeServiceFeatureRecord(
      data
    );
  } catch (error) {
    if (
      uploadedImage?.filePath
    ) {
      try {
        await deleteServiceImage(
          uploadedImage.filePath
        );
      } catch (
        cleanupError
      ) {
        console.error(
          "Gambar fitur sementara gagal dibersihkan:",
          cleanupError
        );
      }
    }

    throwServiceFeatureError(
      error,
      "Detail fitur gagal ditambahkan."
    );
  }
}

export async function updateServiceFeature(
  featureId,
  values = {},
  imageFile = null
) {
  const normalizedFeatureId =
    String(
      featureId || ""
    ).trim();

  if (
    !normalizedFeatureId
  ) {
    throw new Error(
      "ID fitur tidak tersedia."
    );
  }

  let uploadedImage =
    null;

  try {
    const currentFeature =
      await getServiceFeatureById(
        normalizedFeatureId
      );

    if (!currentFeature) {
      throw new Error(
        "Detail fitur tidak ditemukan."
      );
    }

    const mergedValues = {
      ...currentFeature,
      ...values,
    };

    if (
      String(
        mergedValues.parent_feature_id ||
          ""
      ) ===
      normalizedFeatureId
    ) {
      throw new Error(
        "Fitur tidak dapat menjadi Parent untuk dirinya sendiri."
      );
    }

    let nextImageUrl =
      currentFeature.image_url ||
      "";

    let includeImage =
      false;

    if (imageFile) {
      uploadedImage =
        await uploadServiceFeatureImage(
          imageFile
        );

      nextImageUrl =
        uploadedImage.publicUrl;

      includeImage =
        true;
    } else if (
      Object.prototype.hasOwnProperty.call(
        values,
        "image_url"
      )
    ) {
      nextImageUrl =
        String(
          values.image_url ||
            ""
        ).trim();

      includeImage =
        nextImageUrl !==
        currentFeature.image_url;
    }

    const payload =
      createServiceFeaturePayload(
        mergedValues,
        {
          imageUrl:
            nextImageUrl,

          includeServiceId:
            false,

          includeImage,
        }
      );

    const {
      data,
      error,
    } = await supabase
      .from(
        SERVICE_FEATURE_TABLE
      )
      .update(
        payload
      )
      .eq(
        "id",
        normalizedFeatureId
      )
      .select("*")
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error(
        "Detail fitur tidak ditemukan atau akun tidak memiliki izin untuk mengedit."
      );
    }

    const updatedFeature =
      normalizeServiceFeatureRecord(
        data
      );

    if (
      includeImage &&
      currentFeature.image_url &&
      currentFeature.image_url !==
        updatedFeature.image_url
    ) {
      try {
        await deleteServiceImage(
          currentFeature.image_url
        );
      } catch (
        cleanupError
      ) {
        console.error(
          "Detail fitur berhasil diperbarui, tetapi gambar lama gagal dihapus:",
          cleanupError
        );
      }
    }

    return updatedFeature;
  } catch (error) {
    if (
      uploadedImage?.filePath
    ) {
      try {
        await deleteServiceImage(
          uploadedImage.filePath
        );
      } catch (
        cleanupError
      ) {
        console.error(
          "Gambar fitur baru gagal dibersihkan:",
          cleanupError
        );
      }
    }

    throwServiceFeatureError(
      error,
      "Detail fitur gagal diperbarui."
    );
  }
}

export async function deleteServiceFeature(
  featureId
) {
  const normalizedFeatureId =
    String(
      featureId || ""
    ).trim();

  if (
    !normalizedFeatureId
  ) {
    throw new Error(
      "ID fitur tidak tersedia."
    );
  }

  try {
    const currentFeature =
      await getServiceFeatureById(
        normalizedFeatureId
      );

    if (!currentFeature) {
      throw new Error(
        "Detail fitur tidak ditemukan."
      );
    }

    const {
      data,
      error,
    } = await supabase
      .from(
        SERVICE_FEATURE_TABLE
      )
      .delete()
      .eq(
        "id",
        normalizedFeatureId
      )
      .select("id")
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error(
        "Detail fitur tidak ditemukan atau hanya admin yang dapat menghapus."
      );
    }

    let imageDeleted =
      false;

    if (
      currentFeature.image_url
    ) {
      try {
        imageDeleted =
          await deleteServiceImage(
            currentFeature.image_url
          );
      } catch (
        storageError
      ) {
        console.error(
          "Detail fitur terhapus, tetapi gambarnya gagal dihapus:",
          storageError
        );
      }
    }

    return {
      deletedFeature:
        currentFeature,

      imageDeleted,
    };
  } catch (error) {
    throwServiceFeatureError(
      error,
      "Detail fitur gagal dihapus."
    );
  }
}

/*
 * ======================================================
 * PUBLIC SERVICE FEATURES
 * ======================================================
 */

export async function getPublishedServiceFeaturesByServiceSlug(
  serviceSlug
) {
  const normalizedServiceSlug =
    String(
      serviceSlug || ""
    ).trim();

  if (
    !normalizedServiceSlug
  ) {
    return [];
  }

  const {
    data: parentService,
    error: serviceError,
  } = await supabase
    .from(
      SERVICE_TABLE
    )
    .select("*")
    .eq(
      "slug",
      normalizedServiceSlug
    )
    .eq(
      "status",
      "published"
    )
    .maybeSingle();

  if (serviceError) {
    throwServiceFeatureError(
      serviceError,
      "Layanan induk fitur gagal dimuat."
    );
  }

  if (!parentService) {
    return [];
  }

  const {
    data: features,
    error: featureError,
  } = await supabase
    .from(
      SERVICE_FEATURE_TABLE
    )
    .select("*")
    .eq(
      "service_id",
      parentService.id
    )
    .eq(
      "status",
      "published"
    )
    .order(
      "group_order",
      {
        ascending: true,
        nullsFirst: false,
      }
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

  if (featureError) {
    throwServiceFeatureError(
      featureError,
      "Daftar fitur layanan gagal dimuat."
    );
  }

  return (
    features || []
  ).map((feature) => ({
    ...normalizeServiceFeatureRecord(
      feature
    ),

    service:
      parentService,

    service_name:
      parentService.name,

    service_slug:
      parentService.slug,
  }));
}

export async function getPublishedServiceFeatureBySlug(
  serviceSlug,
  featureSlug,
  locale = "id"
) {
  const normalizedServiceSlug =
    String(
      serviceSlug || ""
    ).trim();

  const normalizedFeatureSlug =
    String(
      featureSlug || ""
    ).trim();

  const normalizedLocale =
    normalizePublicLocale(
      locale
    );

  if (
    !normalizedServiceSlug ||
    !normalizedFeatureSlug
  ) {
    return null;
  }

  /*
   * ====================================================
   * 1. SERVICE UTAMA
   * ====================================================
   */

  const {
    data: baseService,
    error: serviceError,
  } = await supabase
    .from(
      SERVICE_TABLE
    )
    .select("*")
    .eq(
      "slug",
      normalizedServiceSlug
    )
    .eq(
      "status",
      "published"
    )
    .maybeSingle();

  if (serviceError) {
    throwServiceFeatureError(
      serviceError,
      "Layanan induk detail fitur gagal dimuat."
    );
  }

  if (!baseService) {
    return null;
  }

  /*
   * ====================================================
   * 2. FEATURE UTAMA
   * ====================================================
   */

  const {
    data: baseFeature,
    error: featureError,
  } = await supabase
    .from(
      SERVICE_FEATURE_TABLE
    )
    .select("*")
    .eq(
      "service_id",
      baseService.id
    )
    .eq(
      "slug",
      normalizedFeatureSlug
    )
    .eq(
      "status",
      "published"
    )
    .maybeSingle();

  if (featureError) {
    throwServiceFeatureError(
      featureError,
      "Detail fitur layanan gagal dimuat."
    );
  }

  if (!baseFeature) {
    return null;
  }

  /*
   * ====================================================
   * 3. PARENT FEATURE
   * ====================================================
   */

  let baseParentFeature =
    null;

  if (
    baseFeature.parent_feature_id
  ) {
    const {
      data,
      error,
    } = await supabase
      .from(
        SERVICE_FEATURE_TABLE
      )
      .select("*")
      .eq(
        "id",
        baseFeature.parent_feature_id
      )
      .eq(
        "service_id",
        baseService.id
      )
      .eq(
        "status",
        "published"
      )
      .maybeSingle();

    if (error) {
      console.warn(
        "Parent feature gagal dimuat:",
        error
      );
    } else {
      baseParentFeature =
        data || null;
    }
  }

  /*
   * ====================================================
   * 4. CHILD FEATURES
   * ====================================================
   *
   * Contoh:
   *
   * Telehealth
   * ├── Tele-ICU
   * ├── Tele-EKG
   * ├── IoT Ambulance
   * └── Mobile Clinic
   *
   * Jika feature yang dibuka tidak mempunyai child,
   * hasilnya otomatis [].
   */

  const {
    data: childData,
    error: childError,
  } = await supabase
    .from(
      SERVICE_FEATURE_TABLE
    )
    .select("*")
    .eq(
      "service_id",
      baseService.id
    )
    .eq(
      "parent_feature_id",
      baseFeature.id
    )
    .eq(
      "status",
      "published"
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

  if (childError) {
    console.warn(
      "Child feature gagal dimuat:",
      childError
    );
  }

  const baseChildFeatures =
    Array.isArray(
      childData
    )
      ? childData
      : [];

  /*
   * ====================================================
   * 5. TRANSLATION
   * ====================================================
   */

  let serviceTranslation =
    null;

  let featureTranslationMap =
    new Map();

  /*
   * Bahasa Indonesia memakai
   * tabel utama sebagai source of truth.
   */
  if (
    normalizedLocale !==
    "id"
  ) {
    /*
     * ==================================================
     * SERVICE TRANSLATION
     * ==================================================
     */

    const {
      data,
      error,
    } = await supabase
      .from(
        "service_translations"
      )
      .select(`
        service_id,
        locale,
        name,
        short_description,
        full_description,
        seo_title,
        seo_description,
        status
      `)
      .eq(
        "service_id",
        baseService.id
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
        "Translation service detail feature gagal dimuat. Menggunakan Bahasa Indonesia:",
        error
      );
    } else {
      serviceTranslation =
        data || null;
    }

    /*
     * ==================================================
     * FEATURE TRANSLATIONS
     * ==================================================
     *
     * Ambil translation untuk:
     *
     * - feature yang sedang dibuka
     * - parent feature
     * - seluruh child feature
     */

    const translationFeatureIds =
      [
        baseFeature.id,

        baseParentFeature?.id,

        ...baseChildFeatures.map(
          (feature) =>
            feature.id
        ),
      ].filter(Boolean);

    if (
      translationFeatureIds.length >
      0
    ) {
      const {
        data,
        error,
      } = await supabase
        .from(
          "service_feature_translations"
        )
        .select(`
          feature_id,
          locale,
          group_name,
          name,
          short_description,
          full_description,
          status
        `)
        .in(
          "feature_id",
          translationFeatureIds
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
          "Translation detail feature gagal dimuat. Menggunakan Bahasa Indonesia:",
          error
        );
      } else {
        featureTranslationMap =
          new Map(
            (
              Array.isArray(
                data
              )
                ? data
                : []
            ).map(
              (translation) => [
                translation.feature_id,
                translation,
              ]
            )
          );
      }
    }
  }

  /*
   * ====================================================
   * 6. HELPER MERGE FEATURE
   * ====================================================
   *
   * Translation kosong otomatis
   * fallback ke Bahasa Indonesia.
   */

  function mergeFeatureTranslation(
    feature
  ) {
    if (!feature) {
      return null;
    }

    const normalizedFeature =
      normalizeServiceFeatureRecord(
        feature
      );

    const translation =
      featureTranslationMap.get(
        feature.id
      );

    return {
      ...normalizedFeature,

      group_name:
        getTranslatedText(
          translation?.group_name,
          normalizedFeature.group_name
        ),

      name:
        getTranslatedText(
          translation?.name,
          normalizedFeature.name
        ),

      short_description:
        getTranslatedText(
          translation?.short_description,
          normalizedFeature.short_description
        ),

      full_description:
        getTranslatedText(
          translation?.full_description,
          normalizedFeature.full_description
        ),

      /*
       * Structural field tetap dari
       * service_features utama.
       */

      id:
        normalizedFeature.id,

      service_id:
        normalizedFeature.service_id,

      parent_feature_id:
        normalizedFeature.parent_feature_id,

      slug:
        normalizedFeature.slug,

      group_order:
        normalizedFeature.group_order,

      sort_order:
        normalizedFeature.sort_order,

      image_url:
        normalizedFeature.image_url,

      status:
        normalizedFeature.status,

      /*
       * Informasi debugging / future use.
       */

      translation_locale:
        translation
          ? normalizedLocale
          : "id",
    };
  }

  /*
   * ====================================================
   * 7. MERGE SERVICE TRANSLATION
   * ====================================================
   */

  const translatedService = {
    ...baseService,

    name:
      getTranslatedText(
        serviceTranslation?.name,
        baseService.name
      ),

    short_description:
      getTranslatedText(
        serviceTranslation?.short_description,
        baseService.short_description
      ),

    full_description:
      getTranslatedText(
        serviceTranslation?.full_description,
        baseService.full_description
      ),

    seo_title:
      getTranslatedText(
        serviceTranslation?.seo_title,
        baseService.seo_title
      ),

    seo_description:
      getTranslatedText(
        serviceTranslation?.seo_description,
        baseService.seo_description
      ),

    /*
     * Structural fields tetap.
     */

    id:
      baseService.id,

    slug:
      baseService.slug,

    image_url:
      baseService.image_url,

    icon:
      baseService.icon,

    status:
      baseService.status,

    translation_locale:
      serviceTranslation
        ? normalizedLocale
        : "id",
  };

  /*
   * ====================================================
   * 8. MERGE CURRENT FEATURE
   * ====================================================
   */

  const translatedFeature =
    mergeFeatureTranslation(
      baseFeature
    );

  /*
   * ====================================================
   * 9. MERGE PARENT FEATURE
   * ====================================================
   */

  const translatedParentFeature =
    mergeFeatureTranslation(
      baseParentFeature
    );

  /*
   * ====================================================
   * 10. MERGE CHILD FEATURES
   * ====================================================
   */

  const translatedChildFeatures =
    baseChildFeatures
      .map(
        mergeFeatureTranslation
      )
      .filter(Boolean)
      .sort(
        (
          firstFeature,
          secondFeature
        ) => {
          const orderDifference =
            (
              Number(
                firstFeature.sort_order
              ) || 0
            ) -
            (
              Number(
                secondFeature.sort_order
              ) || 0
            );

          if (
            orderDifference !==
            0
          ) {
            return orderDifference;
          }

          return String(
            firstFeature.name || ""
          ).localeCompare(
            String(
              secondFeature.name ||
                ""
            ),
            normalizedLocale ===
              "en"
              ? "en"
              : "id"
          );
        }
      );

  /*
   * ====================================================
   * 11. FINAL RESULT
   * ====================================================
   */

  return {
    /*
     * Current feature menjadi root object
     * supaya tetap kompatibel dengan
     * frontend existing.
     */
    ...translatedFeature,

    /*
     * ==================================================
     * SERVICE
     * ==================================================
     */

    service:
      translatedService,

    service_id:
      translatedService.id,

    service_name:
      translatedService.name,

    service_slug:
      translatedService.slug,

    /*
     * ==================================================
     * HIERARCHY
     * ==================================================
     */

    parent_feature:
      translatedParentFeature,

    child_features:
      translatedChildFeatures,

    has_parent:
      Boolean(
        translatedParentFeature
      ),

    has_children:
      translatedChildFeatures.length >
      0,

    /*
     * ==================================================
     * LANGUAGE
     * ==================================================
     */

    locale:
      normalizedLocale,
  };
}

export async function getProductServicesMegaMenuData(
  locale = "id"
) {
  const normalizedLocale =
    normalizePublicLocale(
      locale
    );

  /*
   * ====================================================
   * 1. AMBIL 4 SERVICE UTAMA
   * ====================================================
   */

  const {
    data: services,
    error: servicesError,
  } = await supabase
    .from(
      SERVICE_TABLE
    )
    .select(`
      id,
      name,
      slug,
      short_description,
      sort_order,
      display_order,
      status
    `)
    .in(
      "slug",
      PRODUCT_SERVICE_MENU_SLUGS
    )
    .eq(
      "status",
      "published"
    );

  if (servicesError) {
    console.error(
      "Mega menu Product & Services gagal memuat layanan:",
      servicesError
    );

    throw new Error(
      servicesError.message ||
        "Product & Services gagal dimuat."
    );
  }

  const parentServices =
    Array.isArray(
      services
    )
      ? services
      : [];

  if (
    parentServices.length ===
    0
  ) {
    return [];
  }

  /*
   * ====================================================
   * 2. URUTKAN SERVICE SESUAI NAVBAR
   * ====================================================
   */

  const orderedServices =
    [...parentServices].sort(
      (
        firstItem,
        secondItem
      ) => {
        const firstIndex =
          PRODUCT_SERVICE_MENU_SLUGS.indexOf(
            firstItem.slug
          );

        const secondIndex =
          PRODUCT_SERVICE_MENU_SLUGS.indexOf(
            secondItem.slug
          );

        return (
          firstIndex -
          secondIndex
        );
      }
    );

  const serviceIds =
    orderedServices.map(
      (service) =>
        service.id
    );

  /*
   * ====================================================
   * 3. AMBIL FEATURE
   * ====================================================
   */

  const {
    data: features,
    error: featuresError,
  } = await supabase
    .from(
      SERVICE_FEATURE_TABLE
    )
    .select(`
      id,
      service_id,
      parent_feature_id,
      group_name,
      group_order,
      name,
      slug,
      short_description,
      full_description,
      sort_order,
      status
    `)
    .in(
      "service_id",
      serviceIds
    )
    .eq(
      "status",
      "published"
    );

  if (featuresError) {
    console.error(
      "Mega menu Product & Services gagal memuat fitur:",
      featuresError
    );

    throw new Error(
      featuresError.message ||
        "Fitur Product & Services gagal dimuat."
    );
  }

  const featureRecords =
    Array.isArray(
      features
    )
      ? features
      : [];

  /*
   * ====================================================
   * 4. BAHASA INDONESIA
   * ====================================================
   */

  if (
    normalizedLocale ===
    "id"
  ) {
    return orderedServices.map(
      (service) => {
        const serviceFeatures =
          featureRecords
            .filter(
              (feature) =>
                feature.service_id ===
                service.id
            )
            .map(
              (feature) => ({
                ...feature,

                parent_feature_id:
                  feature.parent_feature_id ||
                  null,

                group_name:
                  String(
                    feature.group_name ||
                      ""
                  ).trim(),

                group_order:
                  Number(
                    feature.group_order
                  ) || 0,

                name:
                  String(
                    feature.name ||
                      ""
                  ).trim(),

                slug:
                  String(
                    feature.slug ||
                      ""
                  ).trim(),

                short_description:
                  String(
                    feature.short_description ||
                      ""
                  ).trim(),

                full_description:
                  String(
                    feature.full_description ||
                      ""
                  ).trim(),

                sort_order:
                  Number(
                    feature.sort_order
                  ) || 0,

                translation_locale:
                  "id",
              })
            )
            .sort(
              (
                firstFeature,
                secondFeature
              ) => {
                if (
                  firstFeature.group_order !==
                  secondFeature.group_order
                ) {
                  return (
                    firstFeature.group_order -
                    secondFeature.group_order
                  );
                }

                if (
                  firstFeature.sort_order !==
                  secondFeature.sort_order
                ) {
                  return (
                    firstFeature.sort_order -
                    secondFeature.sort_order
                  );
                }

                return firstFeature.name.localeCompare(
                  secondFeature.name,
                  "id"
                );
              }
            );

        return {
          ...service,

          name:
            String(
              service.name ||
                ""
            ).trim(),

          short_description:
            String(
              service.short_description ||
                ""
            ).trim(),

          features:
            serviceFeatures,

          translation_locale:
            "id",
        };
      }
    );
  }

  /*
   * ====================================================
   * 5. ENGLISH TRANSLATIONS
   * ====================================================
   */

  const featureIds =
    featureRecords.map(
      (feature) =>
        feature.id
    );

  const {
    data:
      serviceTranslations,
    error:
      serviceTranslationsError,
  } = await supabase
    .from(
      "service_translations"
    )
    .select(`
      service_id,
      locale,
      name,
      short_description,
      full_description,
      seo_title,
      seo_description,
      status
    `)
    .in(
      "service_id",
      serviceIds
    )
    .eq(
      "locale",
      normalizedLocale
    )
    .eq(
      "status",
      "published"
    );

  if (
    serviceTranslationsError
  ) {
    console.warn(
      "Translation service gagal dimuat. Menggunakan Bahasa Indonesia:",
      serviceTranslationsError
    );
  }

  let featureTranslations =
    [];

  if (
    featureIds.length > 0
  ) {
    const {
      data,
      error,
    } = await supabase
      .from(
        "service_feature_translations"
      )
      .select(`
        feature_id,
        locale,
        group_name,
        name,
        short_description,
        full_description,
        status
      `)
      .in(
        "feature_id",
        featureIds
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
        "Translation feature gagal dimuat. Menggunakan Bahasa Indonesia:",
        error
      );
    } else {
      featureTranslations =
        Array.isArray(
          data
        )
          ? data
          : [];
    }
  }

  /*
   * ====================================================
   * 6. TRANSLATION MAP
   * ====================================================
   */

  const serviceTranslationMap =
    new Map(
      (
        Array.isArray(
          serviceTranslations
        )
          ? serviceTranslations
          : []
      ).map(
        (translation) => [
          translation.service_id,
          translation,
        ]
      )
    );

  const featureTranslationMap =
    new Map(
      featureTranslations.map(
        (translation) => [
          translation.feature_id,
          translation,
        ]
      )
    );

  /*
   * ====================================================
   * 7. MERGE BASE + TRANSLATION
   * ====================================================
   */

  return orderedServices.map(
    (service) => {
      const serviceTranslation =
        serviceTranslationMap.get(
          service.id
        );

      const serviceFeatures =
        featureRecords
          .filter(
            (feature) =>
              feature.service_id ===
              service.id
          )
          .map(
            (feature) => {
              const translation =
                featureTranslationMap.get(
                  feature.id
                );

              return {
                ...feature,

                parent_feature_id:
                  feature.parent_feature_id ||
                  null,

                group_order:
                  Number(
                    feature.group_order
                  ) || 0,

                slug:
                  String(
                    feature.slug ||
                      ""
                  ).trim(),

                sort_order:
                  Number(
                    feature.sort_order
                  ) || 0,

                group_name:
                  getTranslatedText(
                    translation?.group_name,
                    feature.group_name
                  ),

                name:
                  getTranslatedText(
                    translation?.name,
                    feature.name
                  ),

                short_description:
                  getTranslatedText(
                    translation?.short_description,
                    feature.short_description
                  ),

                full_description:
                  getTranslatedText(
                    translation?.full_description,
                    feature.full_description
                  ),

                translation_locale:
                  translation
                    ? normalizedLocale
                    : "id",
              };
            }
          )
          .sort(
            (
              firstFeature,
              secondFeature
            ) => {
              if (
                firstFeature.group_order !==
                secondFeature.group_order
              ) {
                return (
                  firstFeature.group_order -
                  secondFeature.group_order
                );
              }

              if (
                firstFeature.sort_order !==
                secondFeature.sort_order
              ) {
                return (
                  firstFeature.sort_order -
                  secondFeature.sort_order
                );
              }

              return firstFeature.name.localeCompare(
                secondFeature.name,
                normalizedLocale ===
                  "en"
                  ? "en"
                  : "id"
              );
            }
          );

      return {
        ...service,

        name:
          getTranslatedText(
            serviceTranslation?.name,
            service.name
          ),

        short_description:
          getTranslatedText(
            serviceTranslation?.short_description,
            service.short_description
          ),

        slug:
          String(
            service.slug ||
              ""
          ).trim(),

        features:
          serviceFeatures,

        translation_locale:
          serviceTranslation
            ? normalizedLocale
            : "id",
      };
    }
  );
}

/*
 * ======================================================
 * ADMIN SERVICE PAGE CONTENT
 * ======================================================
 */

export async function getAdminServicePageContent(
  serviceId
) {
  if (!serviceId) {
    throw new Error(
      "ID service tidak tersedia."
    );
  }

  try {
    const {
      data: sections,
      error: sectionError,
    } = await supabase
      .from(
        SERVICE_PAGE_SECTION_TABLE
      )
      .select(`
        id,
        service_id,
        section_key,
        section_type,
        eyebrow,
        title,
        description,
        image_url,
        file_url,
        button_label,
        button_url,
        metadata,
        sort_order,
        status,
        created_at,
        updated_at
      `)
      .eq(
        "service_id",
        serviceId
      )
      .order(
        "sort_order",
        {
          ascending: true,
        }
      );

    if (sectionError) {
      throw sectionError;
    }

    const sectionRecords =
      Array.isArray(
        sections
      )
        ? sections
        : [];

    const sectionIds =
      sectionRecords.map(
        (section) =>
          section.id
      );

    let items = [];

    if (
      sectionIds.length > 0
    ) {
      const {
        data:
          itemData,
        error:
          itemError,
      } = await supabase
        .from(
          SERVICE_PAGE_SECTION_ITEM_TABLE
        )
        .select(`
          id,
          section_id,
          title,
          description,
          value,
          label,
          icon_name,
          image_url,
          file_url,
          link_url,
          sort_order,
          status,
          created_at,
          updated_at
        `)
        .in(
          "section_id",
          sectionIds
        )
        .order(
          "sort_order",
          {
            ascending:
              true,
          }
        );

      if (itemError) {
        throw itemError;
      }

      items =
        Array.isArray(
          itemData
        )
          ? itemData
          : [];
    }

    const normalizedSections =
      sectionRecords.map(
        (section) => ({
          ...section,

          metadata:
            section.metadata &&
            typeof section.metadata ===
              "object"
              ? section.metadata
              : {},

          items:
            items.filter(
              (item) =>
                item.section_id ===
                section.id
            ),
        })
      );

    const sectionMap =
      normalizedSections.reduce(
        (
          result,
          section
        ) => {
          result[
            section.section_key
          ] = section;

          return result;
        },
        {}
      );

    return {
      sections:
        sectionMap,

      section_list:
        normalizedSections,
    };
  } catch (error) {
    throwServiceError(
      error,
      "Konten halaman service gagal dimuat."
    );
  }
}

/*
 * ======================================================
 * UPDATE SERVICE PAGE SECTION
 * ======================================================
 */

export async function updateServicePageSection(
  sectionId,
  values = {}
) {
  if (!sectionId) {
    throw new Error(
      "ID section tidak tersedia."
    );
  }

  const payload = {};

  if (
    Object.prototype.hasOwnProperty.call(
      values,
      "eyebrow"
    )
  ) {
    payload.eyebrow =
      String(
        values.eyebrow || ""
      ).trim() || null;
  }

  if (
    Object.prototype.hasOwnProperty.call(
      values,
      "title"
    )
  ) {
    payload.title =
      String(
        values.title || ""
      ).trim() || null;
  }

  if (
    Object.prototype.hasOwnProperty.call(
      values,
      "description"
    )
  ) {
    payload.description =
      String(
        values.description ||
          ""
      ).trim() || null;
  }

  if (
    Object.prototype.hasOwnProperty.call(
      values,
      "image_url"
    )
  ) {
    payload.image_url =
      String(
        values.image_url || ""
      ).trim() || null;
  }

  if (
    Object.prototype.hasOwnProperty.call(
      values,
      "button_label"
    )
  ) {
    payload.button_label =
      String(
        values.button_label ||
          ""
      ).trim() || null;
  }

  if (
    Object.prototype.hasOwnProperty.call(
      values,
      "button_url"
    )
  ) {
    payload.button_url =
      String(
        values.button_url || ""
      ).trim() || null;
  }

  if (
    Object.prototype.hasOwnProperty.call(
      values,
      "metadata"
    )
  ) {
    payload.metadata =
      values.metadata &&
      typeof values.metadata ===
        "object"
        ? values.metadata
        : {};
  }

  if (
    Object.prototype.hasOwnProperty.call(
      values,
      "status"
    )
  ) {
    payload.status =
      normalizeStatus(
        values.status
      );
  }

  try {
    const {
      data,
      error,
    } = await supabase
      .from(
        SERVICE_PAGE_SECTION_TABLE
      )
      .update(
        payload
      )
      .eq(
        "id",
        sectionId
      )
      .select("*")
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error(
        "Section tidak ditemukan atau akun tidak memiliki izin."
      );
    }

    return data;
  } catch (error) {
    throwServiceError(
      error,
      "Section halaman gagal diperbarui."
    );
  }
}

/*
 * ======================================================
 * UPDATE SERVICE PAGE SECTION ITEM
 * ======================================================
 */

export async function updateServicePageSectionItem(
  itemId,
  values = {}
) {
  if (!itemId) {
    throw new Error(
      "ID item section tidak tersedia."
    );
  }

  const payload = {};

  if (
    Object.prototype.hasOwnProperty.call(
      values,
      "title"
    )
  ) {
    payload.title =
      String(
        values.title || ""
      ).trim() || null;
  }

  if (
    Object.prototype.hasOwnProperty.call(
      values,
      "description"
    )
  ) {
    payload.description =
      String(
        values.description ||
          ""
      ).trim() || null;
  }

  if (
    Object.prototype.hasOwnProperty.call(
      values,
      "value"
    )
  ) {
    payload.value =
      String(
        values.value || ""
      ).trim() || null;
  }

  if (
    Object.prototype.hasOwnProperty.call(
      values,
      "label"
    )
  ) {
    payload.label =
      String(
        values.label || ""
      ).trim() || null;
  }

  if (
    Object.prototype.hasOwnProperty.call(
      values,
      "icon_name"
    )
  ) {
    payload.icon_name =
      String(
        values.icon_name ||
          ""
      ).trim() || null;
  }

  if (
    Object.prototype.hasOwnProperty.call(
      values,
      "image_url"
    )
  ) {
    payload.image_url =
      String(
        values.image_url ||
          ""
      ).trim() || null;
  }

  if (
    Object.prototype.hasOwnProperty.call(
      values,
      "file_url"
    )
  ) {
    payload.file_url =
      String(
        values.file_url ||
          ""
      ).trim() || null;
  }

  if (
    Object.prototype.hasOwnProperty.call(
      values,
      "link_url"
    )
  ) {
    payload.link_url =
      String(
        values.link_url ||
          ""
      ).trim() || null;
  }

  if (
    Object.prototype.hasOwnProperty.call(
      values,
      "sort_order"
    )
  ) {
    payload.sort_order =
      normalizeNumber(
        values.sort_order,
        0
      );
  }

  if (
    Object.prototype.hasOwnProperty.call(
      values,
      "status"
    )
  ) {
    payload.status =
      normalizeStatus(
        values.status
      );
  }

  try {
    const {
      data,
      error,
    } = await supabase
      .from(
        SERVICE_PAGE_SECTION_ITEM_TABLE
      )
      .update(
        payload
      )
      .eq(
        "id",
        itemId
      )
      .select("*")
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error(
        "Item section tidak ditemukan atau akun tidak memiliki izin."
      );
    }

    return data;
  } catch (error) {
    throwServiceError(
      error,
      "Item section gagal diperbarui."
    );
  }
}