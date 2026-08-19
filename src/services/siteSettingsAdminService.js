import { supabase } from "../lib/supabase";

const SITE_SETTINGS_TABLE =
  "site_settings";

const SITE_ASSETS_BUCKET =
  "site-assets";

const MAX_LOGO_SIZE =
  5 * 1024 * 1024;

const ALLOWED_LOGO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];


/*
 * ======================================================
 * HELPERS
 * ======================================================
 */

function normalizeText(value) {
  return String(
    value ?? ""
  ).trim();
}


function throwSiteSettingsError(
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
      "Akun ini tidak memiliki izin untuk mengubah Site Settings."
    );
  }

  const message =
    normalizeText(
      error?.message
    ).toLowerCase();

  if (
    message.includes(
      "row-level security"
    )
  ) {
    throw new Error(
      "Perubahan ditolak oleh policy RLS Supabase."
    );
  }

  throw new Error(
    error?.message ||
      fallbackMessage
  );
}


function sanitizeFileName(
  fileName
) {
  return normalizeText(
    fileName || "logo"
  )
    .toLowerCase()
    .replace(
      /\s+/g,
      "-"
    )
    .replace(
      /[^a-z0-9._-]/g,
      ""
    );
}


function createUniqueId() {
  if (
    typeof crypto !==
      "undefined" &&
    typeof crypto.randomUUID ===
      "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}


/*
 * ======================================================
 * GET ADMIN SITE SETTINGS
 * ======================================================
 */

export async function getAdminSiteSettings() {
  const {
    data,
    error,
  } = await supabase
    .from(
      SITE_SETTINGS_TABLE
    )
    .select(`
      id,
      setting_key,
      setting_value,
      is_public,
      updated_at
    `)
    .order(
      "setting_key",
      {
        ascending: true,
      }
    );


  if (error) {
    throwSiteSettingsError(
      error,
      "Site Settings gagal dimuat."
    );
  }


  const settings = {};


  for (
    const row
    of data || []
  ) {
    const key =
      normalizeText(
        row.setting_key
      );

    if (!key) {
      continue;
    }

    settings[key] =
      row.setting_value ??
      "";

    settings[
      `${key}__id`
    ] = row.id;

    settings[
      `${key}__updated_at`
    ] = row.updated_at;
  }


  return settings;
}


/*
 * ======================================================
 * SAVE SITE SETTINGS
 * ======================================================
 *
 * setting_key menjadi source of truth.
 *
 * Tidak menulis direct columns lama.
 */

export async function saveAdminSiteSettings(
  values
) {
  const settingsToSave = {
    company_name:
      normalizeText(
        values.company_name
      ),

    tagline:
      normalizeText(
        values.tagline
      ),

    email:
      normalizeText(
        values.email
      ),

    phone:
      normalizeText(
        values.phone
      ),

    whatsapp:
      normalizeText(
        values.whatsapp
      ),

    address:
      normalizeText(
        values.address
      ),

    website:
      normalizeText(
        values.website
      ),

    google_maps_url:
      normalizeText(
        values.google_maps_url
      ),

    instagram:
      normalizeText(
        values.instagram
      ),

    linkedin:
      normalizeText(
        values.linkedin
      ),

    youtube:
      normalizeText(
        values.youtube
      ),

    logo_url:
      normalizeText(
        values.logo_url
      ),
  };


  const rows =
    Object.entries(
      settingsToSave
    ).map(
      ([
        settingKey,
        settingValue,
      ]) => ({
        setting_key:
          settingKey,

        setting_value:
          settingValue,

        is_public:
          true,
      })
    );


  const {
    data,
    error,
  } = await supabase
    .from(
      SITE_SETTINGS_TABLE
    )
    .upsert(
      rows,
      {
        onConflict:
          "setting_key",
      }
    )
    .select(`
      id,
      setting_key,
      setting_value,
      is_public,
      updated_at
    `);


  if (error) {
    throwSiteSettingsError(
      error,
      "Site Settings gagal disimpan."
    );
  }


  return data || [];
}


/*
 * ======================================================
 * UPLOAD LOGO
 * ======================================================
 */

export async function uploadSiteLogo(
  file
) {
  if (!file) {
    throw new Error(
      "File logo tidak tersedia."
    );
  }


  if (
    !ALLOWED_LOGO_TYPES.includes(
      file.type
    )
  ) {
    throw new Error(
      "Format logo harus JPG, PNG, atau WebP."
    );
  }


  if (
    file.size >
    MAX_LOGO_SIZE
  ) {
    throw new Error(
      "Ukuran logo maksimal 5 MB."
    );
  }


  const fileName =
    sanitizeFileName(
      file.name
    );


  const filePath =
    `branding/${Date.now()}-${createUniqueId()}-${fileName}`;


  const {
    error: uploadError,
  } =
    await supabase.storage
      .from(
        SITE_ASSETS_BUCKET
      )
      .upload(
        filePath,
        file,
        {
          cacheControl:
            "3600",

          upsert:
            false,

          contentType:
            file.type,
        }
      );


  if (uploadError) {
    throwSiteSettingsError(
      uploadError,
      "Logo gagal diunggah."
    );
  }


  const {
    data: publicUrlData,
  } =
    supabase.storage
      .from(
        SITE_ASSETS_BUCKET
      )
      .getPublicUrl(
        filePath
      );


  const publicUrl =
    publicUrlData
      ?.publicUrl ||
    "";


  if (!publicUrl) {
    await supabase.storage
      .from(
        SITE_ASSETS_BUCKET
      )
      .remove([
        filePath,
      ]);

    throw new Error(
      "Public URL logo gagal dibuat."
    );
  }


  return {
    filePath,
    publicUrl,
  };
}