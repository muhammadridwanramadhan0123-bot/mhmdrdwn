import { supabase } from "../lib/supabase";

/*
 * ======================================================
 * CONSTANTS
 * ======================================================
 */

const SERVICE_TABLE =
  "services";

const SECTION_TABLE =
  "service_page_sections";

const ITEM_TABLE =
  "service_page_section_items";

const MEDIA_BUCKET =
  "service-page-media";

const MAX_IMAGE_SIZE =
  5 * 1024 * 1024;

const MAX_PDF_SIZE =
  10 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const PDF_MIME_TYPE =
  "application/pdf";

const ALLOWED_STATUS = [
  "draft",
  "published",
  "archived",
];

const ALLOWED_SECTION_TYPES = [
  "hero",
  "intro",
  "icon_grid",
  "benefits",
  "stats",
  "download",
  "showcase",
  "features",
  "cta",
];

/*
 * ======================================================
 * GENERAL HELPERS
 * ======================================================
 */

function createUniqueId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID ===
      "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

function sanitizeFileName(
  fileName
) {
  const safeName =
    String(
      fileName ||
        "service-page-media"
    )
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        ""
      )
      .replace(/\s+/g, "-")
      .replace(
        /[^a-z0-9._-]/g,
        ""
      );

  return (
    safeName ||
    "service-page-media"
  );
}

function normalizeString(
  value
) {
  return String(
    value || ""
  ).trim();
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

function normalizeStatus(
  value
) {
  const status =
    String(
      value || "draft"
    )
      .trim()
      .toLowerCase();

  return ALLOWED_STATUS.includes(
    status
  )
    ? status
    : "draft";
}

function normalizeSectionType(
  value
) {
  const sectionType =
    String(
      value || ""
    )
      .trim()
      .toLowerCase();

  if (
    !ALLOWED_SECTION_TYPES.includes(
      sectionType
    )
  ) {
    throw new Error(
      "Tipe section tidak valid."
    );
  }

  return sectionType;
}

/*
 * metadata dapat menerima:
 *
 * {}
 * JSON object
 * JSON string
 */

function normalizeMetadata(
  value
) {
  if (!value) {
    return {};
  }

  if (
    typeof value ===
      "object" &&
    !Array.isArray(value)
  ) {
    return value;
  }

  if (
    typeof value ===
    "string"
  ) {
    const trimmed =
      value.trim();

    if (!trimmed) {
      return {};
    }

    try {
      const parsed =
        JSON.parse(
          trimmed
        );

      if (
        parsed &&
        typeof parsed ===
          "object" &&
        !Array.isArray(
          parsed
        )
      ) {
        return parsed;
      }
    } catch {
      throw new Error(
        "Metadata harus berupa JSON yang valid."
      );
    }
  }

  return {};
}

/*
 * ======================================================
 * MEDIA HELPERS
 * ======================================================
 */

function validateImage(
  file
) {
  if (!file) {
    return;
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

  if (
    file.size >
    MAX_IMAGE_SIZE
  ) {
    throw new Error(
      "Ukuran gambar maksimal 5 MB."
    );
  }
}

function validatePdf(
  file
) {
  if (!file) {
    return;
  }

  const fileName =
    String(
      file.name || ""
    ).toLowerCase();

  const isPdf =
    file.type ===
      PDF_MIME_TYPE ||
    fileName.endsWith(
      ".pdf"
    );

  if (!isPdf) {
    throw new Error(
      "File katalog harus berformat PDF."
    );
  }

  if (
    file.size >
    MAX_PDF_SIZE
  ) {
    throw new Error(
      "Ukuran PDF maksimal 10 MB."
    );
  }
}

function createMediaPath(
  file,
  type = "images"
) {
  const fileName =
    sanitizeFileName(
      file.name
    );

  return `service-pages/${type}/${Date.now()}-${createUniqueId()}-${fileName}`;
}

function getStoragePathFromPublicUrl(
  publicUrl
) {
  if (!publicUrl) {
    return "";
  }

  const marker =
    `/storage/v1/object/public/${MEDIA_BUCKET}/`;

  const url =
    String(publicUrl);

  const markerIndex =
    url.indexOf(
      marker
    );

  if (
    markerIndex === -1
  ) {
    return "";
  }

  return decodeURIComponent(
    url.slice(
      markerIndex +
        marker.length
    )
  );
}

/*
 * ======================================================
 * ERROR HANDLING
 * ======================================================
 */

function throwPageError(
  error,
  fallbackMessage
) {
  console.error(
    fallbackMessage,
    error
  );

  if (
    error?.code ===
    "23505"
  ) {
    throw new Error(
      "Section Key tersebut sudah digunakan pada Product ini."
    );
  }

  if (
    error?.code ===
    "23503"
  ) {
    throw new Error(
      "Service atau Section induk tidak valid atau sudah tidak tersedia."
    );
  }

  if (
    error?.code ===
    "23514"
  ) {
    throw new Error(
      "Data tidak sesuai aturan database. Periksa tipe section, status, atau urutan."
    );
  }

  if (
    error?.code ===
    "23502"
  ) {
    throw new Error(
      "Terdapat data wajib yang belum diisi."
    );
  }

  if (
    error?.code ===
    "42501"
  ) {
    throw new Error(
      "Akun ini tidak memiliki izin untuk mengelola konten halaman Product."
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

/*
 * ======================================================
 * NORMALIZATION
 * ======================================================
 */

function normalizeSectionRecord(
  section
) {
  if (!section) {
    return null;
  }

  return {
    ...section,

    service_id:
      normalizeString(
        section.service_id
      ),

    section_key:
      normalizeString(
        section.section_key
      ),

    section_type:
      normalizeString(
        section.section_type
      ),

    eyebrow:
      normalizeString(
        section.eyebrow
      ),

    title:
      normalizeString(
        section.title
      ),

    description:
      normalizeString(
        section.description
      ),

    image_url:
      normalizeString(
        section.image_url
      ),

    file_url:
      normalizeString(
        section.file_url
      ),

    button_label:
      normalizeString(
        section.button_label
      ),

    button_url:
      normalizeString(
        section.button_url
      ),

    metadata:
      normalizeMetadata(
        section.metadata
      ),

    sort_order:
      normalizeNumber(
        section.sort_order,
        0
      ),

    status:
      normalizeStatus(
        section.status
      ),

    items:
      Array.isArray(
        section.items
      )
        ? section.items
        : [],
  };
}

function normalizeItemRecord(
  item
) {
  if (!item) {
    return null;
  }

  return {
    ...item,

    section_id:
      normalizeString(
        item.section_id
      ),

    title:
      normalizeString(
        item.title
      ),

    description:
      normalizeString(
        item.description
      ),

    value:
      normalizeString(
        item.value
      ),

    label:
      normalizeString(
        item.label
      ),

    icon_name:
      normalizeString(
        item.icon_name
      ),

    image_url:
      normalizeString(
        item.image_url
      ),

    file_url:
      normalizeString(
        item.file_url
      ),

    link_url:
      normalizeString(
        item.link_url
      ),

    sort_order:
      normalizeNumber(
        item.sort_order,
        0
      ),

    status:
      normalizeStatus(
        item.status
      ),
  };
}

/*
 * ======================================================
 * PAYLOAD
 * ======================================================
 */

function createSectionPayload(
  values = {},
  {
    serviceId = "",
    imageUrl = "",
    fileUrl = "",
    includeServiceId = false,
    includeImage = true,
    includeFile = true,
  } = {}
) {
  const sectionKey =
    normalizeString(
      values.section_key
    )
      .toLowerCase()
      .replace(
        /\s+/g,
        "-"
      );

  if (!sectionKey) {
    throw new Error(
      "Section Key wajib diisi."
    );
  }

  const sortOrder =
    normalizeNumber(
      values.sort_order,
      0
    );

  if (
    sortOrder < 0
  ) {
    throw new Error(
      "Urutan section minimal 0."
    );
  }

  const payload = {
    section_key:
      sectionKey,

    section_type:
      normalizeSectionType(
        values.section_type
      ),

    eyebrow:
      normalizeString(
        values.eyebrow
      ) || null,

    title:
      normalizeString(
        values.title
      ) || null,

    description:
      normalizeString(
        values.description
      ) || null,

    button_label:
      normalizeString(
        values.button_label
      ) || null,

    button_url:
      normalizeString(
        values.button_url
      ) || null,

    metadata:
      normalizeMetadata(
        values.metadata
      ),

    sort_order:
      Math.trunc(
        sortOrder
      ),

    status:
      normalizeStatus(
        values.status
      ),
  };

  if (
    includeServiceId
  ) {
    const normalizedServiceId =
      normalizeString(
        serviceId
      );

    if (
      !normalizedServiceId
    ) {
      throw new Error(
        "ID Service tidak tersedia."
      );
    }

    payload.service_id =
      normalizedServiceId;
  }

  if (includeImage) {
    payload.image_url =
      normalizeString(
        imageUrl
      ) || null;
  }

  if (includeFile) {
    payload.file_url =
      normalizeString(
        fileUrl
      ) || null;
  }

  return payload;
}

function createItemPayload(
  values = {},
  {
    sectionId = "",
    imageUrl = "",
    fileUrl = "",
    includeSectionId = false,
    includeImage = true,
    includeFile = true,
  } = {}
) {
  const sortOrder =
    normalizeNumber(
      values.sort_order,
      0
    );

  if (
    sortOrder < 0
  ) {
    throw new Error(
      "Urutan item minimal 0."
    );
  }

  const payload = {
    title:
      normalizeString(
        values.title
      ) || null,

    description:
      normalizeString(
        values.description
      ) || null,

    value:
      normalizeString(
        values.value
      ) || null,

    label:
      normalizeString(
        values.label
      ) || null,

    icon_name:
      normalizeString(
        values.icon_name
      ) || null,

    link_url:
      normalizeString(
        values.link_url
      ) || null,

    sort_order:
      Math.trunc(
        sortOrder
      ),

    status:
      normalizeStatus(
        values.status
      ),
  };

  if (
    includeSectionId
  ) {
    const normalizedSectionId =
      normalizeString(
        sectionId
      );

    if (
      !normalizedSectionId
    ) {
      throw new Error(
        "ID Section tidak tersedia."
      );
    }

    payload.section_id =
      normalizedSectionId;
  }

  if (includeImage) {
    payload.image_url =
      normalizeString(
        imageUrl
      ) || null;
  }

  if (includeFile) {
    payload.file_url =
      normalizeString(
        fileUrl
      ) || null;
  }

  return payload;
}

/*
 * ======================================================
 * STORAGE
 * ======================================================
 */

export async function uploadServicePageImage(
  file
) {
  validateImage(
    file
  );

  if (!file) {
    throw new Error(
      "File gambar tidak tersedia."
    );
  }

  const filePath =
    createMediaPath(
      file,
      "images"
    );

  const {
    error: uploadError,
  } = await supabase.storage
    .from(
      MEDIA_BUCKET
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
    throwPageError(
      uploadError,
      "Gambar halaman Product gagal diunggah."
    );
  }

  const {
    data: publicUrlData,
  } = supabase.storage
    .from(
      MEDIA_BUCKET
    )
    .getPublicUrl(
      filePath
    );

  const publicUrl =
    publicUrlData?.publicUrl ||
    "";

  if (!publicUrl) {
    try {
      await supabase.storage
        .from(
          MEDIA_BUCKET
        )
        .remove([
          filePath,
        ]);
    } catch (
      cleanupError
    ) {
      console.error(
        cleanupError
      );
    }

    throw new Error(
      "Public URL gambar gagal dibuat."
    );
  }

  return {
    filePath,
    publicUrl,
  };
}

export async function uploadServicePagePdf(
  file
) {
  validatePdf(
    file
  );

  if (!file) {
    throw new Error(
      "File PDF tidak tersedia."
    );
  }

  const filePath =
    createMediaPath(
      file,
      "files"
    );

  const {
    error: uploadError,
  } = await supabase.storage
    .from(
      MEDIA_BUCKET
    )
    .upload(
      filePath,
      file,
      {
        cacheControl:
          "3600",

        upsert: false,

        contentType:
          PDF_MIME_TYPE,
      }
    );

  if (uploadError) {
    throwPageError(
      uploadError,
      "File PDF gagal diunggah."
    );
  }

  const {
    data: publicUrlData,
  } = supabase.storage
    .from(
      MEDIA_BUCKET
    )
    .getPublicUrl(
      filePath
    );

  const publicUrl =
    publicUrlData?.publicUrl ||
    "";

  if (!publicUrl) {
    try {
      await supabase.storage
        .from(
          MEDIA_BUCKET
        )
        .remove([
          filePath,
        ]);
    } catch (
      cleanupError
    ) {
      console.error(
        cleanupError
      );
    }

    throw new Error(
      "Public URL PDF gagal dibuat."
    );
  }

  return {
    filePath,
    publicUrl,
  };
}

export async function deleteServicePageMedia(
  pathOrUrl
) {
  if (!pathOrUrl) {
    return true;
  }

  const stringValue =
    String(
      pathOrUrl
    );

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
      MEDIA_BUCKET
    )
    .remove([
      filePath,
    ]);

  if (error) {
    throwPageError(
      error,
      "Media halaman Product gagal dihapus."
    );
  }

  return true;
}

/*
 * ======================================================
 * ADMIN — GET SECTIONS + ITEMS
 * ======================================================
 */

export async function getAdminServicePageSections(
  serviceId
) {
  const normalizedServiceId =
    normalizeString(
      serviceId
    );

  if (
    !normalizedServiceId
  ) {
    return [];
  }

  const {
    data: sections,
    error: sectionError,
  } = await supabase
    .from(
      SECTION_TABLE
    )
    .select("*")
    .eq(
      "service_id",
      normalizedServiceId
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

  if (sectionError) {
    throwPageError(
      sectionError,
      "Konten halaman Product gagal dimuat."
    );
  }

  const normalizedSections =
    (sections || []).map(
      normalizeSectionRecord
    );

  if (
    normalizedSections.length ===
    0
  ) {
    return [];
  }

  const sectionIds =
    normalizedSections.map(
      (section) =>
        section.id
    );

  const {
    data: items,
    error: itemError,
  } = await supabase
    .from(
      ITEM_TABLE
    )
    .select("*")
    .in(
      "section_id",
      sectionIds
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

  if (itemError) {
    throwPageError(
      itemError,
      "Item konten halaman Product gagal dimuat."
    );
  }

  const normalizedItems =
    (items || []).map(
      normalizeItemRecord
    );

  return normalizedSections.map(
    (section) => ({
      ...section,

      items:
        normalizedItems.filter(
          (item) =>
            item.section_id ===
            section.id
        ),
    })
  );
}

/*
 * ======================================================
 * GET SECTION BY ID
 * ======================================================
 */

export async function getServicePageSectionById(
  sectionId
) {
  const normalizedSectionId =
    normalizeString(
      sectionId
    );

  if (
    !normalizedSectionId
  ) {
    throw new Error(
      "ID Section tidak tersedia."
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from(
      SECTION_TABLE
    )
    .select("*")
    .eq(
      "id",
      normalizedSectionId
    )
    .maybeSingle();

  if (error) {
    throwPageError(
      error,
      "Section gagal dimuat."
    );
  }

  return normalizeSectionRecord(
    data
  );
}

/*
 * ======================================================
 * CREATE SECTION
 * ======================================================
 */

export async function createServicePageSection(
  serviceId,
  values = {},
  imageFile = null,
  pdfFile = null
) {
  const normalizedServiceId =
    normalizeString(
      serviceId
    );

  if (
    !normalizedServiceId
  ) {
    throw new Error(
      "ID Service tidak tersedia."
    );
  }

  let uploadedImage =
    null;

  let uploadedPdf =
    null;

  try {
    let imageUrl =
      normalizeString(
        values.image_url
      );

    let fileUrl =
      normalizeString(
        values.file_url
      );

    if (imageFile) {
      uploadedImage =
        await uploadServicePageImage(
          imageFile
        );

      imageUrl =
        uploadedImage.publicUrl;
    }

    if (pdfFile) {
      uploadedPdf =
        await uploadServicePagePdf(
          pdfFile
        );

      fileUrl =
        uploadedPdf.publicUrl;
    }

    const payload =
      createSectionPayload(
        values,
        {
          serviceId:
            normalizedServiceId,

          imageUrl,

          fileUrl,

          includeServiceId:
            true,

          includeImage:
            true,

          includeFile:
            true,
        }
      );

    const {
      data,
      error,
    } = await supabase
      .from(
        SECTION_TABLE
      )
      .insert(
        payload
      )
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return normalizeSectionRecord(
      data
    );
  } catch (error) {
    if (
      uploadedImage?.filePath
    ) {
      try {
        await deleteServicePageMedia(
          uploadedImage.filePath
        );
      } catch (
        cleanupError
      ) {
        console.error(
          cleanupError
        );
      }
    }

    if (
      uploadedPdf?.filePath
    ) {
      try {
        await deleteServicePageMedia(
          uploadedPdf.filePath
        );
      } catch (
        cleanupError
      ) {
        console.error(
          cleanupError
        );
      }
    }

    throwPageError(
      error,
      "Section halaman Product gagal dibuat."
    );
  }
}

/*
 * ======================================================
 * UPDATE SECTION
 * ======================================================
 */

export async function updateServicePageSection(
  sectionId,
  values = {},
  imageFile = null,
  pdfFile = null
) {
  const normalizedSectionId =
    normalizeString(
      sectionId
    );

  if (
    !normalizedSectionId
  ) {
    throw new Error(
      "ID Section tidak tersedia."
    );
  }

  let uploadedImage =
    null;

  let uploadedPdf =
    null;

  try {
    const currentSection =
      await getServicePageSectionById(
        normalizedSectionId
      );

    if (!currentSection) {
      throw new Error(
        "Section tidak ditemukan."
      );
    }

    const mergedValues = {
      ...currentSection,
      ...values,
    };

    let nextImageUrl =
      currentSection.image_url ||
      "";

    let nextFileUrl =
      currentSection.file_url ||
      "";

    let includeImage =
      false;

    let includeFile =
      false;

    if (imageFile) {
      uploadedImage =
        await uploadServicePageImage(
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
        normalizeString(
          values.image_url
        );

      includeImage =
        nextImageUrl !==
        currentSection.image_url;
    }

    if (pdfFile) {
      uploadedPdf =
        await uploadServicePagePdf(
          pdfFile
        );

      nextFileUrl =
        uploadedPdf.publicUrl;

      includeFile =
        true;
    } else if (
      Object.prototype.hasOwnProperty.call(
        values,
        "file_url"
      )
    ) {
      nextFileUrl =
        normalizeString(
          values.file_url
        );

      includeFile =
        nextFileUrl !==
        currentSection.file_url;
    }

    const payload =
      createSectionPayload(
        mergedValues,
        {
          imageUrl:
            nextImageUrl,

          fileUrl:
            nextFileUrl,

          includeServiceId:
            false,

          includeImage,

          includeFile,
        }
      );

    const {
      data,
      error,
    } = await supabase
      .from(
        SECTION_TABLE
      )
      .update(
        payload
      )
      .eq(
        "id",
        normalizedSectionId
      )
      .select("*")
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error(
        "Section tidak ditemukan atau akun tidak memiliki izin untuk mengedit."
      );
    }

    const updated =
      normalizeSectionRecord(
        data
      );

    if (
      includeImage &&
      currentSection.image_url &&
      currentSection.image_url !==
        updated.image_url
    ) {
      try {
        await deleteServicePageMedia(
          currentSection.image_url
        );
      } catch (
        cleanupError
      ) {
        console.error(
          "Section berhasil diperbarui, tetapi gambar lama gagal dihapus:",
          cleanupError
        );
      }
    }

    if (
      includeFile &&
      currentSection.file_url &&
      currentSection.file_url !==
        updated.file_url
    ) {
      try {
        await deleteServicePageMedia(
          currentSection.file_url
        );
      } catch (
        cleanupError
      ) {
        console.error(
          "Section berhasil diperbarui, tetapi file lama gagal dihapus:",
          cleanupError
        );
      }
    }

    return updated;
  } catch (error) {
    if (
      uploadedImage?.filePath
    ) {
      try {
        await deleteServicePageMedia(
          uploadedImage.filePath
        );
      } catch (
        cleanupError
      ) {
        console.error(
          cleanupError
        );
      }
    }

    if (
      uploadedPdf?.filePath
    ) {
      try {
        await deleteServicePageMedia(
          uploadedPdf.filePath
        );
      } catch (
        cleanupError
      ) {
        console.error(
          cleanupError
        );
      }
    }

    throwPageError(
      error,
      "Section halaman Product gagal diperbarui."
    );
  }
}

/*
 * ======================================================
 * DELETE SECTION
 * ======================================================
 */

export async function deleteServicePageSection(
  sectionId
) {
  const normalizedSectionId =
    normalizeString(
      sectionId
    );

  if (
    !normalizedSectionId
  ) {
    throw new Error(
      "ID Section tidak tersedia."
    );
  }

  try {
    const section =
      await getServicePageSectionById(
        normalizedSectionId
      );

    if (!section) {
      throw new Error(
        "Section tidak ditemukan."
      );
    }

    /*
     * Ambil item sebelum section
     * dihapus untuk cleanup media.
     */

    const {
      data: items,
      error: itemError,
    } = await supabase
      .from(
        ITEM_TABLE
      )
      .select(
        "id, image_url, file_url"
      )
      .eq(
        "section_id",
        normalizedSectionId
      );

    if (itemError) {
      throw itemError;
    }

    const {
      data,
      error,
    } = await supabase
      .from(
        SECTION_TABLE
      )
      .delete()
      .eq(
        "id",
        normalizedSectionId
      )
      .select("id")
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error(
        "Section tidak ditemukan atau hanya admin yang dapat menghapus."
      );
    }

    const mediaUrls = [
      section.image_url,
      section.file_url,

      ...(items || []).flatMap(
        (item) => [
          item.image_url,
          item.file_url,
        ]
      ),
    ].filter(Boolean);

    for (
      const mediaUrl of
      mediaUrls
    ) {
      try {
        await deleteServicePageMedia(
          mediaUrl
        );
      } catch (
        cleanupError
      ) {
        console.error(
          "Section terhapus, tetapi media gagal dibersihkan:",
          cleanupError
        );
      }
    }

    return {
      deletedSection:
        section,
    };
  } catch (error) {
    throwPageError(
      error,
      "Section halaman Product gagal dihapus."
    );
  }
}

/*
 * ======================================================
 * GET ITEM BY ID
 * ======================================================
 */

export async function getServicePageItemById(
  itemId
) {
  const normalizedItemId =
    normalizeString(
      itemId
    );

  if (
    !normalizedItemId
  ) {
    throw new Error(
      "ID Item tidak tersedia."
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from(
      ITEM_TABLE
    )
    .select("*")
    .eq(
      "id",
      normalizedItemId
    )
    .maybeSingle();

  if (error) {
    throwPageError(
      error,
      "Item section gagal dimuat."
    );
  }

  return normalizeItemRecord(
    data
  );
}

/*
 * ======================================================
 * CREATE ITEM
 * ======================================================
 */

export async function createServicePageItem(
  sectionId,
  values = {},
  imageFile = null,
  pdfFile = null
) {
  const normalizedSectionId =
    normalizeString(
      sectionId
    );

  if (
    !normalizedSectionId
  ) {
    throw new Error(
      "ID Section tidak tersedia."
    );
  }

  let uploadedImage =
    null;

  let uploadedPdf =
    null;

  try {
    let imageUrl =
      normalizeString(
        values.image_url
      );

    let fileUrl =
      normalizeString(
        values.file_url
      );

    if (imageFile) {
      uploadedImage =
        await uploadServicePageImage(
          imageFile
        );

      imageUrl =
        uploadedImage.publicUrl;
    }

    if (pdfFile) {
      uploadedPdf =
        await uploadServicePagePdf(
          pdfFile
        );

      fileUrl =
        uploadedPdf.publicUrl;
    }

    const payload =
      createItemPayload(
        values,
        {
          sectionId:
            normalizedSectionId,

          imageUrl,

          fileUrl,

          includeSectionId:
            true,

          includeImage:
            true,

          includeFile:
            true,
        }
      );

    const {
      data,
      error,
    } = await supabase
      .from(
        ITEM_TABLE
      )
      .insert(
        payload
      )
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return normalizeItemRecord(
      data
    );
  } catch (error) {
    if (
      uploadedImage?.filePath
    ) {
      try {
        await deleteServicePageMedia(
          uploadedImage.filePath
        );
      } catch (
        cleanupError
      ) {
        console.error(
          cleanupError
        );
      }
    }

    if (
      uploadedPdf?.filePath
    ) {
      try {
        await deleteServicePageMedia(
          uploadedPdf.filePath
        );
      } catch (
        cleanupError
      ) {
        console.error(
          cleanupError
        );
      }
    }

    throwPageError(
      error,
      "Item section gagal ditambahkan."
    );
  }
}

/*
 * ======================================================
 * UPDATE ITEM
 * ======================================================
 */

export async function updateServicePageItem(
  itemId,
  values = {},
  imageFile = null,
  pdfFile = null
) {
  const normalizedItemId =
    normalizeString(
      itemId
    );

  if (
    !normalizedItemId
  ) {
    throw new Error(
      "ID Item tidak tersedia."
    );
  }

  let uploadedImage =
    null;

  let uploadedPdf =
    null;

  try {
    const currentItem =
      await getServicePageItemById(
        normalizedItemId
      );

    if (!currentItem) {
      throw new Error(
        "Item section tidak ditemukan."
      );
    }

    const mergedValues = {
      ...currentItem,
      ...values,
    };

    let nextImageUrl =
      currentItem.image_url ||
      "";

    let nextFileUrl =
      currentItem.file_url ||
      "";

    let includeImage =
      false;

    let includeFile =
      false;

    if (imageFile) {
      uploadedImage =
        await uploadServicePageImage(
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
        normalizeString(
          values.image_url
        );

      includeImage =
        nextImageUrl !==
        currentItem.image_url;
    }

    if (pdfFile) {
      uploadedPdf =
        await uploadServicePagePdf(
          pdfFile
        );

      nextFileUrl =
        uploadedPdf.publicUrl;

      includeFile =
        true;
    } else if (
      Object.prototype.hasOwnProperty.call(
        values,
        "file_url"
      )
    ) {
      nextFileUrl =
        normalizeString(
          values.file_url
        );

      includeFile =
        nextFileUrl !==
        currentItem.file_url;
    }

    const payload =
      createItemPayload(
        mergedValues,
        {
          imageUrl:
            nextImageUrl,

          fileUrl:
            nextFileUrl,

          includeSectionId:
            false,

          includeImage,

          includeFile,
        }
      );

    const {
      data,
      error,
    } = await supabase
      .from(
        ITEM_TABLE
      )
      .update(
        payload
      )
      .eq(
        "id",
        normalizedItemId
      )
      .select("*")
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error(
        "Item tidak ditemukan atau akun tidak memiliki izin untuk mengedit."
      );
    }

    const updated =
      normalizeItemRecord(
        data
      );

    if (
      includeImage &&
      currentItem.image_url &&
      currentItem.image_url !==
        updated.image_url
    ) {
      try {
        await deleteServicePageMedia(
          currentItem.image_url
        );
      } catch (
        cleanupError
      ) {
        console.error(
          "Item berhasil diperbarui, tetapi gambar lama gagal dihapus:",
          cleanupError
        );
      }
    }

    if (
      includeFile &&
      currentItem.file_url &&
      currentItem.file_url !==
        updated.file_url
    ) {
      try {
        await deleteServicePageMedia(
          currentItem.file_url
        );
      } catch (
        cleanupError
      ) {
        console.error(
          "Item berhasil diperbarui, tetapi file lama gagal dihapus:",
          cleanupError
        );
      }
    }

    return updated;
  } catch (error) {
    if (
      uploadedImage?.filePath
    ) {
      try {
        await deleteServicePageMedia(
          uploadedImage.filePath
        );
      } catch (
        cleanupError
      ) {
        console.error(
          cleanupError
        );
      }
    }

    if (
      uploadedPdf?.filePath
    ) {
      try {
        await deleteServicePageMedia(
          uploadedPdf.filePath
        );
      } catch (
        cleanupError
      ) {
        console.error(
          cleanupError
        );
      }
    }

    throwPageError(
      error,
      "Item section gagal diperbarui."
    );
  }
}

/*
 * ======================================================
 * DELETE ITEM
 * ======================================================
 */

export async function deleteServicePageItem(
  itemId
) {
  const normalizedItemId =
    normalizeString(
      itemId
    );

  if (
    !normalizedItemId
  ) {
    throw new Error(
      "ID Item tidak tersedia."
    );
  }

  try {
    const item =
      await getServicePageItemById(
        normalizedItemId
      );

    if (!item) {
      throw new Error(
        "Item tidak ditemukan."
      );
    }

    const {
      data,
      error,
    } = await supabase
      .from(
        ITEM_TABLE
      )
      .delete()
      .eq(
        "id",
        normalizedItemId
      )
      .select("id")
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error(
        "Item tidak ditemukan atau hanya admin yang dapat menghapus."
      );
    }

    const mediaUrls = [
      item.image_url,
      item.file_url,
    ].filter(Boolean);

    for (
      const mediaUrl of
      mediaUrls
    ) {
      try {
        await deleteServicePageMedia(
          mediaUrl
        );
      } catch (
        cleanupError
      ) {
        console.error(
          "Item terhapus, tetapi media gagal dibersihkan:",
          cleanupError
        );
      }
    }

    return {
      deletedItem:
        item,
    };
  } catch (error) {
    throwPageError(
      error,
      "Item section gagal dihapus."
    );
  }
}

/*
 * ======================================================
 * PUBLIC PRODUCT PAGE
 * ======================================================
 */

export async function getPublishedServicePageBySlug(
  serviceSlug
) {
  const normalizedSlug =
    normalizeString(
      serviceSlug
    );

  if (!normalizedSlug) {
    return null;
  }

  /*
   * Service utama harus Published.
   */

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
      status,
      seo_title,
      seo_description
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
    throwPageError(
      serviceError,
      "Product gagal dimuat."
    );
  }

  if (!service) {
    return null;
  }

  /*
   * Hanya section Published.
   */

  const {
    data: sections,
    error: sectionError,
  } = await supabase
    .from(
      SECTION_TABLE
    )
    .select("*")
    .eq(
      "service_id",
      service.id
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

  if (sectionError) {
    throwPageError(
      sectionError,
      "Konten Product gagal dimuat."
    );
  }

  const normalizedSections =
    (sections || []).map(
      normalizeSectionRecord
    );

  if (
    normalizedSections.length ===
    0
  ) {
    return {
      service,
      sections: [],
    };
  }

  const sectionIds =
    normalizedSections.map(
      (section) =>
        section.id
    );

  /*
   * Hanya item Published.
   */

  const {
    data: items,
    error: itemError,
  } = await supabase
    .from(
      ITEM_TABLE
    )
    .select("*")
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
    throwPageError(
      itemError,
      "Item konten Product gagal dimuat."
    );
  }

  const normalizedItems =
    (items || []).map(
      normalizeItemRecord
    );

  return {
    service,

    sections:
      normalizedSections.map(
        (section) => ({
          ...section,

          items:
            normalizedItems.filter(
              (item) =>
                item.section_id ===
                section.id
            ),
        })
      ),
  };
}
/*
 * ======================================================
 * BULK PUBLISH SERVICE PAGE CONTENT
 * ======================================================
 */

export async function publishServicePageContent(
  serviceId
) {
  const normalizedServiceId =
    String(serviceId || "").trim();

  if (!normalizedServiceId) {
    throw new Error(
      "ID Service tidak tersedia."
    );
  }

  try {
    /*
     * Ambil seluruh section.
     */

    const {
      data: sections,
      error: sectionError,
    } = await supabase
      .from(SECTION_TABLE)
      .select("id, status")
      .eq(
        "service_id",
        normalizedServiceId
      );

    if (sectionError) {
      throw sectionError;
    }

    const publishableSections =
      (sections || []).filter(
        (section) =>
          section.status !==
          "archived"
      );

    if (
      publishableSections.length ===
      0
    ) {
      throw new Error(
        "Tidak ada section yang dapat dipublikasikan."
      );
    }

    const sectionIds =
      publishableSections.map(
        (section) => section.id
      );

    /*
     * Publish item terlebih dahulu.
     *
     * Archived tetap Archived.
     */

    const {
      error: itemUpdateError,
    } = await supabase
      .from(ITEM_TABLE)
      .update({
        status: "published",
      })
      .in(
        "section_id",
        sectionIds
      )
      .neq(
        "status",
        "archived"
      );

    if (itemUpdateError) {
      throw itemUpdateError;
    }

    /*
     * Publish section.
     */

    const {
      error: sectionUpdateError,
    } = await supabase
      .from(SECTION_TABLE)
      .update({
        status: "published",
      })
      .eq(
        "service_id",
        normalizedServiceId
      )
      .neq(
        "status",
        "archived"
      );

    if (sectionUpdateError) {
      throw sectionUpdateError;
    }

    return true;
  } catch (error) {
    throwPageError(
      error,
      "Konten halaman Product gagal dipublikasikan."
    );
  }
}

/*
 * ======================================================
 * BULK UNPUBLISH SERVICE PAGE CONTENT
 * ======================================================
 */

export async function unpublishServicePageContent(
  serviceId
) {
  const normalizedServiceId =
    String(serviceId || "").trim();

  if (!normalizedServiceId) {
    throw new Error(
      "ID Service tidak tersedia."
    );
  }

  try {
    const {
      data: sections,
      error: sectionError,
    } = await supabase
      .from(SECTION_TABLE)
      .select("id")
      .eq(
        "service_id",
        normalizedServiceId
      );

    if (sectionError) {
      throw sectionError;
    }

    const sectionIds =
      (sections || []).map(
        (section) =>
          section.id
      );

    /*
     * Published item → Draft
     */

    if (
      sectionIds.length > 0
    ) {
      const {
        error: itemError,
      } = await supabase
        .from(ITEM_TABLE)
        .update({
          status: "draft",
        })
        .in(
          "section_id",
          sectionIds
        )
        .eq(
          "status",
          "published"
        );

      if (itemError) {
        throw itemError;
      }
    }

    /*
     * Published section → Draft
     */

    const {
      error: sectionUpdateError,
    } = await supabase
      .from(SECTION_TABLE)
      .update({
        status: "draft",
      })
      .eq(
        "service_id",
        normalizedServiceId
      )
      .eq(
        "status",
        "published"
      );

    if (sectionUpdateError) {
      throw sectionUpdateError;
    }

    return true;
  } catch (error) {
    throwPageError(
      error,
      "Konten halaman Product gagal dijadikan Draft."
    );
  }
}
/*
 * ======================================================
 * ADMIN PREVIEW PRODUCT PAGE
 * ======================================================
 *
 * Fungsi ini khusus halaman Preview Admin.
 *
 * Berbeda dengan:
 *
 * getPublishedServicePageBySlug()
 *
 * fungsi preview:
 * - membaca Service walaupun Draft
 * - membaca section Draft
 * - membaca section Published
 * - membaca section Archived
 * - membaca semua item
 *
 * Akses tetap diamankan oleh RLS + ProtectedAdminRoute.
 * ======================================================
 */

export async function getAdminServicePagePreview(
  serviceId
) {
  const normalizedServiceId =
    String(
      serviceId || ""
    ).trim();

  if (!normalizedServiceId) {
    throw new Error(
      "ID Service tidak tersedia."
    );
  }

  try {
    /*
     * ====================================================
     * SERVICE UTAMA
     * ====================================================
     */

    const {
      data: service,
      error: serviceError,
    } = await supabase
      .from(SERVICE_TABLE)
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
        seo_description
      `)
      .eq(
        "id",
        normalizedServiceId
      )
      .maybeSingle();

    if (serviceError) {
      throw serviceError;
    }

    /*
     * Service tidak ditemukan.
     */

    if (!service) {
      return null;
    }

    /*
     * ====================================================
     * SEMUA SECTION
     * ====================================================
     *
     * Tidak memakai:
     *
     * .eq("status", "published")
     *
     * karena halaman ini merupakan
     * Preview Admin.
     * ====================================================
     */

    const {
      data: sections,
      error: sectionError,
    } = await supabase
      .from(SECTION_TABLE)
      .select("*")
      .eq(
        "service_id",
        normalizedServiceId
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

    if (sectionError) {
      throw sectionError;
    }

    const normalizedSections =
      (sections || []).map(
        normalizeSectionRecord
      );

    /*
     * Belum memiliki section.
     */

    if (
      normalizedSections.length === 0
    ) {
      return {
        service,
        sections: [],
      };
    }

    /*
     * ====================================================
     * SEMUA ITEM
     * ====================================================
     */

    const sectionIds =
      normalizedSections.map(
        (section) =>
          section.id
      );

    const {
      data: items,
      error: itemError,
    } = await supabase
      .from(ITEM_TABLE)
      .select("*")
      .in(
        "section_id",
        sectionIds
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

    if (itemError) {
      throw itemError;
    }

    const normalizedItems =
      (items || []).map(
        normalizeItemRecord
      );

    /*
     * ====================================================
     * GABUNGKAN SECTION + ITEMS
     * ====================================================
     */

    const sectionsWithItems =
      normalizedSections.map(
        (section) => ({
          ...section,

          items:
            normalizedItems.filter(
              (item) =>
                item.section_id ===
                section.id
            ),
        })
      );

    return {
      service,

      sections:
        sectionsWithItems,
    };
  } catch (error) {
    throwPageError(
      error,
      "Preview halaman Product gagal dimuat."
    );
  }
}
/*
 * ======================================================
 * ADMIN SERVICES READINESS SUMMARY
 * ======================================================
 *
 * Digunakan halaman /admin/services
 * untuk menampilkan progress keempat
 * Product & Services utama.
 *
 * Tidak mengubah data.
 * Hanya membaca:
 *
 * - services
 * - service_page_sections
 * - service_page_section_items
 * - service_features
 * ======================================================
 */

export async function getAdminServiceReadinessSummaries(
  services = []
) {
  const serviceRecords =
    Array.isArray(services)
      ? services.filter(
          (service) =>
            Boolean(service?.id)
        )
      : [];

  if (
    serviceRecords.length === 0
  ) {
    return {};
  }

  const serviceIds =
    serviceRecords.map(
      (service) =>
        service.id
    );

  try {
    /*
     * ====================================================
     * SECTIONS + FEATURES
     * ====================================================
     */

    const [
      sectionResult,
      featureResult,
    ] = await Promise.all([
      supabase
        .from(SECTION_TABLE)
        .select(`
          id,
          service_id,
          section_key,
          section_type,
          title,
          description,
          image_url,
          file_url,
          status,
          sort_order
        `)
        .in(
          "service_id",
          serviceIds
        ),

      supabase
        .from(
          "service_features"
        )
        .select(`
          id,
          service_id,
          parent_feature_id,
          status
        `)
        .in(
          "service_id",
          serviceIds
        ),
    ]);

    if (
      sectionResult.error
    ) {
      throw sectionResult.error;
    }

    if (
      featureResult.error
    ) {
      throw featureResult.error;
    }

    const sections =
      Array.isArray(
        sectionResult.data
      )
        ? sectionResult.data
        : [];

    const features =
      Array.isArray(
        featureResult.data
      )
        ? featureResult.data
        : [];

    /*
     * ====================================================
     * ITEMS
     * ====================================================
     */

    const sectionIds =
      sections.map(
        (section) =>
          section.id
      );

    let items = [];

    if (
      sectionIds.length > 0
    ) {
      const {
        data: itemData,
        error: itemError,
      } = await supabase
        .from(ITEM_TABLE)
        .select(`
          id,
          section_id,
          status
        `)
        .in(
          "section_id",
          sectionIds
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

    /*
     * ====================================================
     * BUILD SUMMARY
     * ====================================================
     */

    const summaries = {};

    serviceRecords.forEach(
      (service) => {
        const serviceSections =
          sections.filter(
            (section) =>
              section.service_id ===
              service.id
          );

        const serviceFeatures =
          features.filter(
            (feature) =>
              feature.service_id ===
              service.id
          );

        const serviceSectionIds =
          new Set(
            serviceSections.map(
              (section) =>
                section.id
            )
          );

        const serviceItems =
          items.filter(
            (item) =>
              serviceSectionIds.has(
                item.section_id
              )
          );

        /*
         * ----------------------------------------------
         * Helper section
         * ----------------------------------------------
         */

        const findSection = (
          key
        ) =>
          serviceSections.find(
            (section) =>
              section.section_key ===
              key
          ) || null;

        const hero =
          findSection(
            "hero"
          );

        const intro =
          findSection(
            "intro"
          );

        const featureSection =
          findSection(
            "features"
          );

        const whySimrs =
          findSection(
            "why-simrs"
          );

        const benefits =
          findSection(
            "benefits"
          );

        const stats =
          findSection(
            "module-stats"
          );

        const catalog =
          findSection(
            "catalog"
          );

        const standards =
          findSection(
            "standards"
          );

        const integration =
          findSection(
            "integration"
          );

        const aiPowered =
          findSection(
            "ai-powered"
          );

        /*
         * ----------------------------------------------
         * Item counter per section
         * ----------------------------------------------
         */

        function getSectionItems(
          section
        ) {
          if (!section) {
            return [];
          }

          return serviceItems.filter(
            (item) =>
              item.section_id ===
              section.id
          );
        }

        /*
         * ----------------------------------------------
         * Generic required checks
         * ----------------------------------------------
         */

        const requiredChecks = [
          {
            id:
              "service-status",

            valid:
              service.status ===
              "published",
          },

          {
            id: "hero",

            valid:
              Boolean(hero) &&
              Boolean(
                String(
                  hero?.title ||
                    ""
                ).trim()
              ) &&
              Boolean(
                String(
                  hero?.description ||
                    ""
                ).trim()
              ),
          },

          {
            id: "intro",

            valid:
              Boolean(intro) &&
              Boolean(
                String(
                  intro?.title ||
                    ""
                ).trim()
              ) &&
              Boolean(
                String(
                  intro?.description ||
                    ""
                ).trim()
              ),
          },

          {
            id:
              "feature-section",

            valid:
              Boolean(
                featureSection
              ),
          },

          {
            id:
              "published-feature",

            valid:
              serviceFeatures.some(
                (feature) =>
                  feature.status ===
                  "published"
              ),
          },
        ];

        /*
         * ----------------------------------------------
         * SIMRS required checks
         * ----------------------------------------------
         */

        if (
          service.slug ===
          "simrs-erp"
        ) {
          requiredChecks.push(
            {
              id:
                "why-simrs",

              valid:
                getSectionItems(
                  whySimrs
                ).length >= 6,
            },

            {
              id:
                "benefits",

              valid:
                getSectionItems(
                  benefits
                ).length >= 6,
            },

            {
              id: "stats",

              valid:
                getSectionItems(
                  stats
                ).length >= 3,
            }
          );
        }

        /*
         * ----------------------------------------------
         * Warning / optional check
         * ----------------------------------------------
         */

        const warningChecks =
          [];

        if (
          service.slug ===
          "simrs-erp"
        ) {
          warningChecks.push(
            {
              id:
                "catalog",

              valid:
                Boolean(
                  catalog?.file_url
                ),
            },

            {
              id:
                "standards",

              valid:
                Boolean(
                  standards?.image_url
                ),
            },

            {
              id:
                "integration",

              valid:
                Boolean(
                  integration?.image_url
                ),
            },

            {
              id:
                "ai-powered",

              valid:
                Boolean(
                  aiPowered?.image_url
                ),
            }
          );
        }

        /*
         * ----------------------------------------------
         * Progress
         * ----------------------------------------------
         */

        const passedRequired =
          requiredChecks.filter(
            (check) =>
              check.valid
          ).length;

        const totalRequired =
          requiredChecks.length;

        const progress =
          totalRequired > 0
            ? Math.round(
                (
                  passedRequired /
                  totalRequired
                ) * 100
              )
            : 0;

        /*
         * ----------------------------------------------
         * Status totals
         * ----------------------------------------------
         */

        const publishedSections =
          serviceSections.filter(
            (section) =>
              section.status ===
              "published"
          ).length;

        const draftSections =
          serviceSections.filter(
            (section) =>
              section.status ===
              "draft"
          ).length;

        const archivedSections =
          serviceSections.filter(
            (section) =>
              section.status ===
              "archived"
          ).length;

        const publishedItems =
          serviceItems.filter(
            (item) =>
              item.status ===
              "published"
          ).length;

        const publishedFeatures =
          serviceFeatures.filter(
            (feature) =>
              feature.status ===
              "published"
          ).length;

        const warningCount =
          warningChecks.filter(
            (check) =>
              !check.valid
          ).length;

        const missingRequired =
          requiredChecks.filter(
            (check) =>
              !check.valid
          ).length;

        summaries[
          service.id
        ] = {
          service_id:
            service.id,

          service_slug:
            service.slug,

          ready:
            missingRequired ===
            0,

          progress,

          required_total:
            totalRequired,

          required_passed:
            passedRequired,

          missing_required:
            missingRequired,

          warning_count:
            warningCount,

          sections: {
            total:
              serviceSections.length,

            published:
              publishedSections,

            draft:
              draftSections,

            archived:
              archivedSections,
          },

          items: {
            total:
              serviceItems.length,

            published:
              publishedItems,
          },

          features: {
            total:
              serviceFeatures.length,

            published:
              publishedFeatures,
          },
        };
      }
    );

    return summaries;
  } catch (error) {
    throwPageError(
      error,
      "Status kesiapan Product & Services gagal dimuat."
    );
  }
}