import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Edit3,
  Eye,
  EyeOff,
  GitBranch,
  ImageIcon,
  Layers3,
  LoaderCircle,
  Plus,
  RefreshCw,
  Save,
  Search,
  Sparkles,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";

import { Link } from "react-router-dom";

import { useAdminAuth } from "../../contexts/AdminAuthContext";

import {
  createServiceFeature,
  deleteServiceFeature,
  getAdminServiceFeatures,
  updateServiceFeature,
} from "../../services/serviceService";

/* ======================================================
   STATUS
====================================================== */

const STATUS_OPTIONS = [
  {
    value: "draft",
    label: "Draft",
  },
  {
    value: "published",
    label: "Published",
  },
  {
    value: "archived",
    label: "Archived",
  },
];

/* ======================================================
   GROUP STRUCTURE
====================================================== */

const SERVICE_GROUP_OPTIONS = {
  "simrs-erp": [
    {
      name: "Solusi Klinis & Pelayanan Pasien",
      order: 1,
    },
    {
      name: "Operasional & Manajemen Rumah Sakit",
      order: 2,
    },
    {
      name: "TransHealthcare Ecosystem",
      order: 3,
    },
  ],

  "infrastruktur-it-layanan-pendukung": [
    {
      name: "Penyedia Perangkat Keras",
      order: 1,
    },
    {
      name: "Penyedia Perangkat Lunak & Lisensi",
      order: 2,
    },
    {
      name: "Konsultan Jaringan",
      order: 3,
    },
  ],
};

/* ======================================================
   IMAGE CONFIG
====================================================== */

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_IMAGE_SIZE =
  2 * 1024 * 1024;

/* ======================================================
   HELPERS
====================================================== */

function cleanText(value) {
  return String(value || "").trim();
}

function createSlug(value) {
  return cleanText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getUngroupedGroupOrder(
  serviceSlug
) {
  if (
    serviceSlug ===
    "simrs-erp"
  ) {
    return 4;
  }

  return 0;
}

function getUngroupedLabel(
  serviceSlug
) {
  if (
    serviceSlug ===
    "simrs-erp"
  ) {
    return "Layanan Tambahan";
  }

  return "Tanpa Kelompok";
}

function createInitialFormData({
  sortOrder = 0,
  groupOrder = 0,
} = {}) {
  return {
    group_name: "",
    group_order:
      groupOrder,

    parent_feature_id: "",

    name: "",
    slug: "",

    short_description: "",
    full_description: "",

    image_url: "",

    sort_order:
      sortOrder,

    status: "draft",
  };
}

function getStatusLabel(status) {
  switch (status) {
    case "published":
      return "Published";

    case "archived":
      return "Archived";

    default:
      return "Draft";
  }
}

function getStatusClass(status) {
  switch (status) {
    case "published":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "archived":
      return "border-slate-300 bg-slate-100 text-slate-600";

    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}

function formatUpdatedAt(value) {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "id-ID",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(date);
}

/* ======================================================
   SORT FEATURES
====================================================== */

function sortFeatureRecords(
  items = []
) {
  const records =
    [...items];

  const featureMap =
    new Map(
      records.map(
        (feature) => [
          feature.id,
          feature,
        ]
      )
    );

  return records.sort(
    (
      first,
      second
    ) => {
      const firstGroup =
        Number(
          first.group_order
        ) || 0;

      const secondGroup =
        Number(
          second.group_order
        ) || 0;

      if (
        firstGroup !==
        secondGroup
      ) {
        return (
          firstGroup -
          secondGroup
        );
      }

      const firstParent =
        first.parent_feature_id
          ? featureMap.get(
              first.parent_feature_id
            )
          : null;

      const secondParent =
        second.parent_feature_id
          ? featureMap.get(
              second.parent_feature_id
            )
          : null;

      const firstRootOrder =
        Number(
          firstParent?.sort_order ??
            first.sort_order
        ) || 0;

      const secondRootOrder =
        Number(
          secondParent?.sort_order ??
            second.sort_order
        ) || 0;

      if (
        firstRootOrder !==
        secondRootOrder
      ) {
        return (
          firstRootOrder -
          secondRootOrder
        );
      }

      const firstIsChild =
        Boolean(
          first.parent_feature_id
        );

      const secondIsChild =
        Boolean(
          second.parent_feature_id
        );

      if (
        firstIsChild !==
        secondIsChild
      ) {
        return firstIsChild
          ? 1
          : -1;
      }

      const firstOrder =
        Number(
          first.sort_order
        ) || 0;

      const secondOrder =
        Number(
          second.sort_order
        ) || 0;

      if (
        firstOrder !==
        secondOrder
      ) {
        return (
          firstOrder -
          secondOrder
        );
      }

      return cleanText(
        first.name
      ).localeCompare(
        cleanText(
          second.name
        ),
        "id"
      );
    }
  );
}

/* ======================================================
   BUILD HIERARCHY
====================================================== */

function buildFeatureGroups(
  features,
  serviceSlug
) {
  const records =
    sortFeatureRecords(
      features
    );

  const featureMap =
    new Map(
      records.map(
        (feature) => [
          feature.id,
          feature,
        ]
      )
    );

  /*
   * Root feature:
   *
   * - parent kosong
   * - ATAU parent ID tidak ditemukan
   *
   * Kondisi kedua menjaga UI tetap bisa
   * menampilkan data orphan.
   */

  const roots =
    records
      .filter(
        (feature) =>
          !feature.parent_feature_id ||
          !featureMap.has(
            feature.parent_feature_id
          )
      )
      .map((feature) => ({
        ...feature,

        is_orphan:
          Boolean(
            feature.parent_feature_id
          ) &&
          !featureMap.has(
            feature.parent_feature_id
          ),

        children:
          records
            .filter(
              (child) =>
                child.parent_feature_id ===
                feature.id
            )
            .sort(
              (
                first,
                second
              ) =>
                (Number(
                  first.sort_order
                ) || 0) -
                (Number(
                  second.sort_order
                ) || 0)
            ),
      }));

  const groupMap =
    new Map();

  roots.forEach(
    (root) => {
      const groupName =
        cleanText(
          root.group_name
        );

      const groupOrder =
        Number(
          root.group_order
        ) || 0;

      const key =
        `${groupOrder}::${groupName}`;

      if (
        !groupMap.has(key)
      ) {
        groupMap.set(
          key,
          {
            key,
            name:
              groupName ||
              getUngroupedLabel(
                serviceSlug
              ),
            rawName:
              groupName,
            order:
              groupOrder,
            features: [],
          }
        );
      }

      groupMap
        .get(key)
        .features.push(
          root
        );
    }
  );

  return Array.from(
    groupMap.values()
  ).sort(
    (
      first,
      second
    ) => {
      if (
        first.order !==
        second.order
      ) {
        return (
          first.order -
          second.order
        );
      }

      return first.name.localeCompare(
        second.name,
        "id"
      );
    }
  );
}

/* ======================================================
   LOADING
====================================================== */

function LoadingSection() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="text-center">
          <LoaderCircle
            size={40}
            className="mx-auto animate-spin text-[#FF5A0A]"
          />

          <p className="mt-4 font-semibold text-[#082B3A]">
            Memuat Fitur & Cakupan...
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Mengambil hierarchy dari Supabase.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ======================================================
   FEATURE ROW
====================================================== */

function FeatureRow({
  feature,
  serviceSlug,
  isChild = false,

  isAdmin,
  isContentManager,

  togglingId,
  deletingId,

  onEdit,
  onToggle,
  onDelete,
}) {
  const isToggling =
    togglingId ===
    feature.id;

  const isDeleting =
    deletingId ===
    feature.id;

  const updatedAt =
    formatUpdatedAt(
      feature.updated_at
    );

  return (
    <div
      className={`group relative ${
        isChild
          ? "ml-6 border-l-2 border-orange-100 pl-5 sm:ml-10"
          : ""
      }`}
    >
      {isChild && (
        <div className="absolute -left-[2px] top-7 h-[2px] w-5 bg-orange-100" />
      )}

      <div
        className={`grid gap-4 rounded-2xl border bg-white px-4 py-4 transition hover:border-orange-200 hover:shadow-sm md:grid-cols-[minmax(0,1fr)_120px_90px_auto] md:items-center ${
          isChild
            ? "border-slate-100"
            : "border-slate-200"
        }`}
      >
        {/* NAME */}

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                isChild
                  ? "bg-orange-50 text-[#FF5A0A]"
                  : "bg-[#082B3A] text-white"
              }`}
            >
              {isChild ? (
                <GitBranch
                  size={15}
                />
              ) : (
                <Layers3
                  size={15}
                />
              )}
            </div>

            <div className="min-w-0">
              <p className="font-bold leading-6 text-[#082B3A]">
                {feature.name}
              </p>

              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
                <span>
                  {isChild
                    ? "Subfitur"
                    : "Fitur Utama"}
                </span>

                <span>
                  /{feature.slug}
                </span>

                {updatedAt && (
                  <span>
                    Update {updatedAt}
                  </span>
                )}
              </div>
            </div>
          </div>

          {feature.short_description && (
            <p className="mt-3 line-clamp-2 max-w-2xl text-xs leading-6 text-slate-500">
              {
                feature.short_description
              }
            </p>
          )}

          {feature.is_orphan && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-50 px-2.5 py-1.5 text-[10px] font-semibold text-red-600">
              <AlertTriangle
                size={12}
              />

              Parent tidak ditemukan
            </div>
          )}
        </div>

        {/* STATUS */}

        <div>
          <span
            className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${getStatusClass(
              feature.status
            )}`}
          >
            {getStatusLabel(
              feature.status
            )}
          </span>
        </div>

        {/* ORDER */}

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 md:hidden">
            Urutan
          </p>

          <p className="mt-1 text-sm font-bold text-[#082B3A] md:mt-0">
            {Number(
              feature.sort_order
            ) || 0}
          </p>
        </div>

        {/* ACTIONS */}

        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          {feature.status ===
            "published" &&
            serviceSlug && (
              <Link
                to={`/services/${serviceSlug}/features/${feature.slug}`}
                target="_blank"
                rel="noreferrer"
                title="Lihat halaman"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-[#FF5A0A] hover:text-[#FF5A0A]"
              >
                <ArrowUpRight
                  size={15}
                />
              </Link>
            )}

          {isContentManager && (
            <>
              <button
                type="button"
                onClick={() =>
                  onToggle(
                    feature
                  )
                }
                disabled={
                  isToggling ||
                  isDeleting
                }
                title={
                  feature.status ===
                  "published"
                    ? "Jadikan Draft"
                    : "Publish"
                }
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-[#FF5A0A] hover:text-[#FF5A0A] disabled:opacity-40"
              >
                {isToggling ? (
                  <LoaderCircle
                    size={15}
                    className="animate-spin"
                  />
                ) : feature.status ===
                  "published" ? (
                  <EyeOff
                    size={15}
                  />
                ) : (
                  <Eye
                    size={15}
                  />
                )}
              </button>

              <button
                type="button"
                onClick={() =>
                  onEdit(
                    feature
                  )
                }
                disabled={
                  isToggling ||
                  isDeleting
                }
                title="Edit"
                className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-[#082B3A] px-3 text-xs font-semibold text-white transition hover:bg-[#0A4053] disabled:opacity-40"
              >
                <Edit3
                  size={14}
                />

                Edit
              </button>
            </>
          )}

          {isAdmin && (
            <button
              type="button"
              onClick={() =>
                onDelete(
                  feature
                )
              }
              disabled={
                isDeleting ||
                isToggling
              }
              title="Hapus"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 text-red-500 transition hover:bg-red-50 disabled:opacity-40"
            >
              {isDeleting ? (
                <LoaderCircle
                  size={15}
                  className="animate-spin"
                />
              ) : (
                <Trash2
                  size={15}
                />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ======================================================
   MAIN COMPONENT
====================================================== */

export default function AdminServiceFeaturesSection({
  serviceId,
  serviceName = "",
  serviceSlug = "",
}) {
  const {
    isAdmin,
    isEditor,
    isContentManager,
  } = useAdminAuth();

  const availableGroups =
    SERVICE_GROUP_OPTIONS[
      serviceSlug
    ] || [];

  const ungroupedGroupOrder =
    getUngroupedGroupOrder(
      serviceSlug
    );

  /* ====================================================
     STATE
  ==================================================== */

  const [
    features,
    setFeatures,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    deletingId,
    setDeletingId,
  ] = useState("");

  const [
    togglingId,
    setTogglingId,
  ] = useState("");

  const [
    formOpen,
    setFormOpen,
  ] = useState(false);

  const [
    editingId,
    setEditingId,
  ] = useState("");

  const [
    featureType,
    setFeatureType,
  ] = useState("root");

  const [
    formData,
    setFormData,
  ] = useState(
    createInitialFormData({
      groupOrder:
        ungroupedGroupOrder,
    })
  );

  const [
    slugManuallyEdited,
    setSlugManuallyEdited,
  ] = useState(false);

  const [
    imageFile,
    setImageFile,
  ] = useState(null);

  const [
    imagePreviewUrl,
    setImagePreviewUrl,
  ] = useState("");

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("all");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    formErrorMessage,
    setFormErrorMessage,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [
    collapsedGroups,
    setCollapsedGroups,
  ] = useState({});

  /* ====================================================
     LOAD FEATURES
  ==================================================== */

  const loadFeatures =
    useCallback(async () => {
      if (!serviceId) {
        setFeatures([]);
        setLoading(false);

        return;
      }

      try {
        setLoading(true);

        setErrorMessage("");

        const data =
          await getAdminServiceFeatures(
            serviceId
          );

        setFeatures(
          sortFeatureRecords(
            Array.isArray(data)
              ? data
              : []
          )
        );
      } catch (error) {
        console.error(
          "Fitur Service gagal dimuat:",
          error
        );

        setFeatures([]);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Fitur Service gagal dimuat."
        );
      } finally {
        setLoading(false);
      }
    }, [serviceId]);

  useEffect(() => {
    loadFeatures();
  }, [loadFeatures]);

  /* ====================================================
     OBJECT URL CLEANUP
  ==================================================== */

  useEffect(() => {
    return () => {
      if (
        imagePreviewUrl.startsWith(
          "blob:"
        )
      ) {
        URL.revokeObjectURL(
          imagePreviewUrl
        );
      }
    };
  }, [imagePreviewUrl]);

  /* ====================================================
     SUMMARY
  ==================================================== */

  const summary =
    useMemo(() => {
      const root =
        features.filter(
          (feature) =>
            !feature.parent_feature_id
        ).length;

      const children =
        features.filter(
          (feature) =>
            Boolean(
              feature.parent_feature_id
            )
        ).length;

      const published =
        features.filter(
          (feature) =>
            feature.status ===
            "published"
        ).length;

      const draft =
        features.filter(
          (feature) =>
            feature.status ===
            "draft"
        ).length;

      return {
        total:
          features.length,
        root,
        children,
        published,
        draft,
      };
    }, [features]);

  /* ====================================================
     PARENT OPTIONS
  ==================================================== */

  const parentOptions =
    useMemo(() => {
      return features
        .filter(
          (feature) => {
            /*
             * Parent hanya root.
             */

            if (
              feature.parent_feature_id
            ) {
              return false;
            }

            /*
             * Tidak boleh dirinya sendiri.
             */

            if (
              editingId &&
              feature.id ===
                editingId
            ) {
              return false;
            }

            /*
             * Jika group sudah dipilih,
             * parent harus group yang sama.
             */

            if (
              formData.group_name &&
              cleanText(
                feature.group_name
              ) !==
                cleanText(
                  formData.group_name
                )
            ) {
              return false;
            }

            return true;
          }
        )
        .sort(
          (
            first,
            second
          ) => {
            const firstGroup =
              Number(
                first.group_order
              ) || 0;

            const secondGroup =
              Number(
                second.group_order
              ) || 0;

            if (
              firstGroup !==
              secondGroup
            ) {
              return (
                firstGroup -
                secondGroup
              );
            }

            return (
              (Number(
                first.sort_order
              ) || 0) -
              (Number(
                second.sort_order
              ) || 0)
            );
          }
        );
    }, [
      features,
      editingId,
      formData.group_name,
    ]);

  /* ====================================================
     HIERARCHY
  ==================================================== */

  const allGroups =
    useMemo(
      () =>
        buildFeatureGroups(
          features,
          serviceSlug
        ),
      [
        features,
        serviceSlug,
      ]
    );

  /* ====================================================
     FILTER HIERARCHY
  ==================================================== */

  const displayedGroups =
    useMemo(() => {
      const search =
        cleanText(
          searchTerm
        ).toLowerCase();

      function matchesStatus(
        feature
      ) {
        return (
          statusFilter ===
            "all" ||
          feature.status ===
            statusFilter
        );
      }

      function matchesSearch(
        feature
      ) {
        if (!search) {
          return true;
        }

        const searchable =
          [
            feature.name,
            feature.slug,
            feature.group_name,
            feature.short_description,
            feature.full_description,
          ]
            .map(
              (value) =>
                cleanText(
                  value
                ).toLowerCase()
            )
            .join(" ");

        return searchable.includes(
          search
        );
      }

      return allGroups
        .map((group) => {
          const groupMatches =
            !search ||
            group.name
              .toLowerCase()
              .includes(
                search
              );

          const roots =
            group.features
              .map((root) => {
                const rootMatches =
                  matchesStatus(
                    root
                  ) &&
                  (
                    matchesSearch(
                      root
                    ) ||
                    groupMatches
                  );

                const matchingChildren =
                  root.children.filter(
                    (child) =>
                      matchesStatus(
                        child
                      ) &&
                      (
                        matchesSearch(
                          child
                        ) ||
                        rootMatches ||
                        groupMatches
                      )
                  );

                /*
                 * Root ditampilkan sebagai
                 * konteks jika child cocok.
                 */

                if (
                  !rootMatches &&
                  matchingChildren.length ===
                    0
                ) {
                  return null;
                }

                return {
                  ...root,
                  children:
                    matchingChildren,
                };
              })
              .filter(Boolean);

          return {
            ...group,
            features:
              roots,
          };
        })
        .filter(
          (group) =>
            group.features
              .length > 0
        );
    }, [
      allGroups,
      searchTerm,
      statusFilter,
    ]);

  /* ====================================================
     IMAGE PREVIEW
  ==================================================== */

  function clearImagePreview() {
    if (
      imagePreviewUrl.startsWith(
        "blob:"
      )
    ) {
      URL.revokeObjectURL(
        imagePreviewUrl
      );
    }

    setImagePreviewUrl("");
  }

  /* ====================================================
     RESET FORM
  ==================================================== */

  function resetForm() {
    setEditingId("");

    setFeatureType(
      "root"
    );

    setFormData(
      createInitialFormData({
        groupOrder:
          ungroupedGroupOrder,
      })
    );

    setSlugManuallyEdited(
      false
    );

    setImageFile(null);

    clearImagePreview();

    setFormErrorMessage(
      ""
    );
  }

  /* ====================================================
     CLOSE FORM
  ==================================================== */

  function closeForm() {
    if (saving) {
      return;
    }

    setFormOpen(false);

    resetForm();
  }

  /* ====================================================
     NEXT SORT ORDER
  ==================================================== */

  function getNextRootSortOrder(
    groupName
  ) {
    const groupRoots =
      features.filter(
        (feature) =>
          !feature.parent_feature_id &&
          cleanText(
            feature.group_name
          ) ===
            cleanText(
              groupName
            )
      );

    return (
      groupRoots.reduce(
        (
          highest,
          feature
        ) =>
          Math.max(
            highest,
            Number(
              feature.sort_order
            ) || 0
          ),
        0
      ) + 1
    );
  }

  function getNextChildSortOrder(
    parentId
  ) {
    const children =
      features.filter(
        (feature) =>
          feature.parent_feature_id ===
          parentId
      );

    return (
      children.reduce(
        (
          highest,
          feature
        ) =>
          Math.max(
            highest,
            Number(
              feature.sort_order
            ) || 0
          ),
        0
      ) + 1
    );
  }

  /* ====================================================
     CREATE
  ==================================================== */

  function openCreateForm() {
    if (!isContentManager) {
      setErrorMessage(
        "Akun tidak memiliki izin untuk menambahkan fitur."
      );

      return;
    }

    resetForm();

    setFormData(
      createInitialFormData({
        sortOrder: 1,
        groupOrder:
          ungroupedGroupOrder,
      })
    );

    setErrorMessage("");

    setSuccessMessage("");

    setFormOpen(true);
  }

  /* ====================================================
     EDIT
  ==================================================== */

  function openEditForm(
    feature
  ) {
    if (!isContentManager) {
      setErrorMessage(
        "Akun tidak memiliki izin untuk mengedit fitur."
      );

      return;
    }

    /*
     * Parent dianggap valid jika:
     *
     * - parent memang tersedia
     * - parent merupakan root
     * - berada pada group yang sama
     */

    const validParent =
      feature.parent_feature_id
        ? features.find(
            (item) =>
              item.id ===
                feature.parent_feature_id &&
              !item.parent_feature_id &&
              cleanText(
                item.group_name
              ) ===
                cleanText(
                  feature.group_name
                )
          )
        : null;

    setEditingId(
      feature.id
    );

    setFeatureType(
      validParent
        ? "child"
        : "root"
    );

    setFormData({
      group_name:
        feature.group_name ||
        "",

      group_order:
        Number(
          feature.group_order
        ) || 0,

      parent_feature_id:
        validParent?.id ||
        "",

      name:
        feature.name || "",

      slug:
        feature.slug || "",

      short_description:
        feature.short_description ||
        "",

      full_description:
        feature.full_description ||
        "",

      image_url:
        feature.image_url ||
        "",

      sort_order:
        Number(
          feature.sort_order
        ) || 0,

      status:
        feature.status ||
        "draft",
    });

    setSlugManuallyEdited(
      true
    );

    setImageFile(null);

    clearImagePreview();

    setErrorMessage("");

    setFormErrorMessage("");

    setSuccessMessage("");

    setFormOpen(true);
  }

  /* ====================================================
     TYPE CHANGE
  ==================================================== */

  function handleFeatureTypeChange(
    nextType
  ) {
    setFeatureType(
      nextType
    );

    setFormErrorMessage(
      ""
    );

    if (
      nextType ===
      "root"
    ) {
      setFormData(
        (current) => ({
          ...current,

          parent_feature_id:
            "",

          sort_order:
            getNextRootSortOrder(
              current.group_name
            ),
        })
      );
    }
  }

  /* ====================================================
     INPUT
  ==================================================== */

  function handleInputChange(
    event
  ) {
    const {
      name,
      value,
    } =
      event.target;

    setSuccessMessage("");

    setFormErrorMessage(
      ""
    );

    if (
      name === "name"
    ) {
      setFormData(
        (current) => ({
          ...current,

          name:
            value,

          slug:
            slugManuallyEdited
              ? current.slug
              : createSlug(
                  value
                ),
        })
      );

      return;
    }

    if (
      name === "slug"
    ) {
      setSlugManuallyEdited(
        true
      );

      setFormData(
        (current) => ({
          ...current,

          slug:
            createSlug(
              value
            ),
        })
      );

      return;
    }

    setFormData(
      (current) => ({
        ...current,
        [name]: value,
      })
    );
  }

  /* ====================================================
     GROUP CHANGE
  ==================================================== */

  function handleGroupChange(
    event
  ) {
    const groupName =
      event.target.value;

    const selectedGroup =
      availableGroups.find(
        (group) =>
          group.name ===
          groupName
      );

    const groupOrder =
      selectedGroup
        ? selectedGroup.order
        : ungroupedGroupOrder;

    setFormData(
      (current) => ({
        ...current,

        group_name:
          groupName,

        group_order:
          groupOrder,

        /*
         * Parent harus direset
         * karena group berubah.
         */

        parent_feature_id:
          "",

        sort_order:
          featureType ===
          "root"
            ? getNextRootSortOrder(
                groupName
              )
            : 1,
      })
    );

    setFormErrorMessage(
      ""
    );
  }

  /* ====================================================
     PARENT CHANGE
  ==================================================== */

  function handleParentChange(
    event
  ) {
    const parentId =
      event.target.value;

    const parent =
      features.find(
        (feature) =>
          feature.id ===
          parentId
      );

    if (!parent) {
      setFormData(
        (current) => ({
          ...current,

          parent_feature_id:
            "",
        })
      );

      return;
    }

    setFormData(
      (current) => ({
        ...current,

        parent_feature_id:
          parent.id,

        /*
         * Child otomatis mengikuti
         * group parent.
         */

        group_name:
          parent.group_name ||
          "",

        group_order:
          Number(
            parent.group_order
          ) || 0,

        sort_order:
          getNextChildSortOrder(
            parent.id
          ),
      })
    );

    setFormErrorMessage(
      ""
    );
  }

  /* ====================================================
     IMAGE
  ==================================================== */

  function handleImageChange(
    event
  ) {
    const file =
      event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    if (
      !ALLOWED_IMAGE_TYPES.includes(
        file.type
      )
    ) {
      setFormErrorMessage(
        "Gambar harus berformat JPG, PNG, atau WebP."
      );

      return;
    }

    if (
      file.size >
      MAX_IMAGE_SIZE
    ) {
      setFormErrorMessage(
        "Ukuran gambar maksimal 2 MB."
      );

      return;
    }

    clearImagePreview();

    setImageFile(
      file
    );

    setImagePreviewUrl(
      URL.createObjectURL(
        file
      )
    );

    setFormErrorMessage(
      ""
    );
  }

  function handleRemoveImage() {
    setImageFile(null);

    clearImagePreview();

    setFormData(
      (current) => ({
        ...current,
        image_url: "",
      })
    );
  }

  /* ====================================================
     VALIDATE
  ==================================================== */

  function validateForm() {
    if (!serviceId) {
      return "ID Service tidak tersedia.";
    }

    if (
      !cleanText(
        formData.name
      )
    ) {
      return "Nama fitur wajib diisi.";
    }

    if (
      !cleanText(
        formData.slug
      )
    ) {
      return "Slug fitur wajib diisi.";
    }

    if (
      featureType ===
        "child" &&
      !formData.parent_feature_id
    ) {
      return "Parent Fitur wajib dipilih untuk Subfitur.";
    }

    if (
      featureType ===
        "root" &&
      formData.parent_feature_id
    ) {
      return "Fitur Utama tidak boleh memiliki Parent.";
    }

    if (
      editingId &&
      formData.parent_feature_id ===
        editingId
    ) {
      return "Fitur tidak dapat menjadi Parent untuk dirinya sendiri.";
    }

    const groupOrder =
      Number(
        formData.group_order
      );

    if (
      !Number.isFinite(
        groupOrder
      ) ||
      groupOrder < 0
    ) {
      return "Urutan kelompok tidak valid.";
    }

    const sortOrder =
      Number(
        formData.sort_order
      );

    if (
      !Number.isFinite(
        sortOrder
      ) ||
      sortOrder < 0
    ) {
      return "Urutan fitur tidak valid.";
    }

    if (
      !STATUS_OPTIONS.some(
        (option) =>
          option.value ===
          formData.status
      )
    ) {
      return "Status fitur tidak valid.";
    }

    return "";
  }

  /* ====================================================
     SAVE
  ==================================================== */

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    if (
      saving ||
      !isContentManager
    ) {
      return;
    }

    const validationMessage =
      validateForm();

    if (
      validationMessage
    ) {
      setFormErrorMessage(
        validationMessage
      );

      return;
    }

    try {
      setSaving(true);

      setErrorMessage("");

      setFormErrorMessage("");

      setSuccessMessage("");

      const payload = {
        group_name:
          cleanText(
            formData.group_name
          ),

        group_order:
          Number(
            formData.group_order
          ) || 0,

        parent_feature_id:
          featureType ===
          "child"
            ? formData.parent_feature_id ||
              null
            : null,

        name:
          cleanText(
            formData.name
          ),

        slug:
          createSlug(
            formData.slug
          ),

        short_description:
          cleanText(
            formData.short_description
          ),

        full_description:
          cleanText(
            formData.full_description
          ),

        image_url:
          formData.image_url ||
          "",

        sort_order:
          Number(
            formData.sort_order
          ) || 0,

        status:
          formData.status,
      };

      if (editingId) {
        const savedFeature =
          await updateServiceFeature(
            editingId,
            payload,
            imageFile
          );

        setFeatures(
          (current) =>
            sortFeatureRecords(
              current.map(
                (feature) =>
                  feature.id ===
                  editingId
                    ? savedFeature
                    : feature
              )
            )
        );

        setSuccessMessage(
          "Fitur berhasil diperbarui."
        );
      } else {
        const savedFeature =
          await createServiceFeature(
            serviceId,
            payload,
            imageFile
          );

        setFeatures(
          (current) =>
            sortFeatureRecords([
              ...current,
              savedFeature,
            ])
        );

        setSuccessMessage(
          "Fitur berhasil ditambahkan."
        );
      }

      setFormOpen(false);

      resetForm();
    } catch (error) {
      console.error(
        "Fitur gagal disimpan:",
        error
      );

      setFormErrorMessage(
        error instanceof Error
          ? error.message
          : "Fitur gagal disimpan."
      );
    } finally {
      setSaving(false);
    }
  }

  /* ====================================================
     TOGGLE STATUS
  ==================================================== */

  async function handleToggleStatus(
    feature
  ) {
    if (
      !isContentManager ||
      togglingId
    ) {
      return;
    }

    const nextStatus =
      feature.status ===
      "published"
        ? "draft"
        : "published";

    try {
      setTogglingId(
        feature.id
      );

      setErrorMessage("");

      const updatedFeature =
        await updateServiceFeature(
          feature.id,
          {
            parent_feature_id:
              feature.parent_feature_id ||
              null,

            group_name:
              feature.group_name ||
              "",

            group_order:
              Number(
                feature.group_order
              ) || 0,

            name:
              feature.name,

            slug:
              feature.slug,

            short_description:
              feature.short_description ||
              "",

            full_description:
              feature.full_description ||
              "",

            image_url:
              feature.image_url ||
              "",

            sort_order:
              Number(
                feature.sort_order
              ) || 0,

            status:
              nextStatus,
          }
        );

      setFeatures(
        (current) =>
          sortFeatureRecords(
            current.map(
              (item) =>
                item.id ===
                feature.id
                  ? updatedFeature
                  : item
            )
          )
      );

      setSuccessMessage(
        nextStatus ===
          "published"
          ? `${feature.name} berhasil dipublikasikan.`
          : `${feature.name} berhasil dijadikan Draft.`
      );
    } catch (error) {
      console.error(
        "Status fitur gagal diperbarui:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Status fitur gagal diperbarui."
      );
    } finally {
      setTogglingId("");
    }
  }

  /* ====================================================
     DELETE
  ==================================================== */

  async function handleDelete(
    feature
  ) {
    if (!isAdmin) {
      setErrorMessage(
        "Hanya admin yang dapat menghapus fitur."
      );

      return;
    }

    if (deletingId) {
      return;
    }

    const children =
      features.filter(
        (item) =>
          item.parent_feature_id ===
          feature.id
      );

    const warning =
      children.length > 0
        ? `\n\nFitur ini mempunyai ${children.length} Subfitur. Jika dihapus, Subfitur tersebut akan kehilangan Parent dan menjadi Fitur Utama.`
        : "";

    const confirmed =
      window.confirm(
        `Hapus fitur "${feature.name}"?${warning}\n\nData yang dihapus tidak dapat dikembalikan.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(
        feature.id
      );

      setErrorMessage("");

      setSuccessMessage("");

      await deleteServiceFeature(
        feature.id
      );

      /*
       * FK menggunakan ON DELETE SET NULL.
       * Refresh setelah delete memastikan child
       * yang kehilangan parent dibaca ulang.
       */

      await loadFeatures();

      setSuccessMessage(
        `Fitur "${feature.name}" berhasil dihapus.`
      );
    } catch (error) {
      console.error(
        "Fitur gagal dihapus:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Fitur gagal dihapus."
      );
    } finally {
      setDeletingId("");
    }
  }

  /* ====================================================
     COLLAPSE GROUP
  ==================================================== */

  function toggleGroup(
    groupKey
  ) {
    setCollapsedGroups(
      (current) => ({
        ...current,

        [groupKey]:
          !current[
            groupKey
          ],
      })
    );
  }

  /* ====================================================
     RESET FILTER
  ==================================================== */

  function resetFilters() {
    setSearchTerm("");

    setStatusFilter(
      "all"
    );
  }

  /* ====================================================
     LOADING
  ==================================================== */

  if (loading) {
    return (
      <LoadingSection />
    );
  }

  const displayedImage =
    imagePreviewUrl ||
    formData.image_url;

  /* ====================================================
     RENDER
  ==================================================== */

  return (
    <>
      <section className="space-y-6">
        {/* ==============================================
            HEADER
        ============================================== */}

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#FF5A0A]">
                <Layers3
                  size={14}
                />

                Fitur & Cakupan
              </div>

              <h2 className="mt-4 text-2xl font-bold text-[#082B3A]">
                Struktur Fitur Product
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">
                Kelola Fitur Utama, Subfitur, kelompok, hierarchy,
                halaman detail, urutan dan status untuk{" "}
                <span className="font-semibold text-[#082B3A]">
                  {serviceName ||
                    "Product ini"}
                </span>
                .
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={
                  loadFeatures
                }
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-[#FF5A0A] hover:text-[#FF5A0A]"
              >
                <RefreshCw
                  size={16}
                />

                Refresh
              </button>

              {isContentManager && (
                <button
                  type="button"
                  onClick={
                    openCreateForm
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-[#FF5A0A] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-[#E94F00]"
                >
                  <Plus
                    size={17}
                  />

                  Tambah Fitur
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ==============================================
            ERROR
        ============================================== */}

        {errorMessage && (
          <div
            role="alert"
            className="flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle
                size={20}
                className="mt-0.5 shrink-0 text-red-600"
              />

              <div>
                <p className="font-semibold text-red-800">
                  Terjadi kesalahan
                </p>

                <p className="mt-1 text-sm text-red-700">
                  {errorMessage}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setErrorMessage(
                  ""
                )
              }
              className="text-xs font-semibold text-red-700"
            >
              Tutup
            </button>
          </div>
        )}

        {/* ==============================================
            SUCCESS
        ============================================== */}

        {successMessage && (
          <div
            role="status"
            className="flex items-start justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2
                size={20}
                className="mt-0.5 shrink-0 text-emerald-600"
              />

              <div>
                <p className="font-semibold text-emerald-800">
                  Berhasil
                </p>

                <p className="mt-1 text-sm text-emerald-700">
                  {
                    successMessage
                  }
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setSuccessMessage(
                  ""
                )
              }
              className="text-xs font-semibold text-emerald-700"
            >
              Tutup
            </button>
          </div>
        )}

        {/* ==============================================
            ROLE INFO
        ============================================== */}

        {isEditor && (
          <div className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm leading-7 text-blue-700">
            Editor dapat menambah, mengedit, mengunggah gambar dan
            mengubah status fitur. Penghapusan fitur hanya dapat
            dilakukan oleh Admin.
          </div>
        )}

        {/* ==============================================
            SUMMARY
        ============================================== */}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <article className="rounded-2xl bg-[#082B3A] p-5 text-white">
            <Sparkles
              size={20}
              className="text-orange-300"
            />

            <p className="mt-4 text-3xl font-bold">
              {summary.total}
            </p>

            <p className="mt-1 text-sm text-white/55">
              Total Fitur
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <Layers3
              size={20}
              className="text-blue-600"
            />

            <p className="mt-4 text-3xl font-bold text-[#082B3A]">
              {summary.root}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Fitur Utama
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <GitBranch
              size={20}
              className="text-[#FF5A0A]"
            />

            <p className="mt-4 text-3xl font-bold text-[#082B3A]">
              {summary.children}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Subfitur
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <Eye
              size={20}
              className="text-emerald-600"
            />

            <p className="mt-4 text-3xl font-bold text-[#082B3A]">
              {summary.published}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Published
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <EyeOff
              size={20}
              className="text-amber-600"
            />

            <p className="mt-4 text-3xl font-bold text-[#082B3A]">
              {summary.draft}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Draft
            </p>
          </article>
        </div>

        {/* ==============================================
            FILTER
        ============================================== */}

        <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[minmax(0,1fr)_220px_auto]">
          <div className="relative">
            <Search
              size={17}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={
                searchTerm
              }
              onChange={(
                event
              ) =>
                setSearchTerm(
                  event.target.value
                )
              }
              placeholder="Cari fitur, subfitur, kelompok atau slug..."
              className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm text-[#082B3A] outline-none transition focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <select
            value={
              statusFilter
            }
            onChange={(
              event
            ) =>
              setStatusFilter(
                event.target.value
              )
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#082B3A] outline-none focus:border-[#FF5A0A]"
          >
            <option value="all">
              Semua Status
            </option>

            {STATUS_OPTIONS.map(
              (option) => (
                <option
                  key={
                    option.value
                  }
                  value={
                    option.value
                  }
                >
                  {
                    option.label
                  }
                </option>
              )
            )}
          </select>

          <button
            type="button"
            onClick={
              resetFilters
            }
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-[#FF5A0A] hover:text-[#FF5A0A]"
          >
            Reset
          </button>
        </div>

        {/* ==============================================
            GROUPED HIERARCHY
        ============================================== */}

        {displayedGroups.length ===
        0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <Layers3
              size={44}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-5 text-xl font-bold text-[#082B3A]">
              {features.length === 0
                ? "Fitur belum tersedia"
                : "Fitur tidak ditemukan"}
            </h3>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-slate-500">
              {features.length === 0
                ? "Tambahkan Fitur & Cakupan untuk Product ini."
                : "Ubah pencarian atau filter status untuk menampilkan fitur lainnya."}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {displayedGroups.map(
              (group) => {
                const collapsed =
                  Boolean(
                    collapsedGroups[
                      group.key
                    ]
                  );

                const rootCount =
                  group.features
                    .length;

                const childCount =
                  group.features.reduce(
                    (
                      total,
                      root
                    ) =>
                      total +
                      root.children
                        .length,
                    0
                  );

                return (
                  <section
                    key={
                      group.key
                    }
                    className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                  >
                    {/* GROUP HEADER */}

                    <button
                      type="button"
                      onClick={() =>
                        toggleGroup(
                          group.key
                        )
                      }
                      className="flex w-full items-center justify-between gap-5 bg-slate-50 px-5 py-5 text-left transition hover:bg-slate-100 sm:px-6"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#082B3A] text-white">
                          <Layers3
                            size={19}
                          />
                        </div>

                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#FF5A0A]">
                            Kelompok{" "}
                            {group.order}
                          </p>

                          <h3 className="mt-1 font-bold leading-6 text-[#082B3A] sm:text-lg">
                            {group.name}
                          </h3>

                          <p className="mt-1 text-xs text-slate-400">
                            {
                              rootCount
                            }{" "}
                            Fitur Utama ·{" "}
                            {
                              childCount
                            }{" "}
                            Subfitur
                          </p>
                        </div>
                      </div>

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
                        {collapsed ? (
                          <ChevronRight
                            size={18}
                          />
                        ) : (
                          <ChevronDown
                            size={18}
                          />
                        )}
                      </div>
                    </button>

                    {/* GROUP CONTENT */}

                    {!collapsed && (
                      <div className="space-y-4 p-4 sm:p-5">
                        {group.features.map(
                          (
                            root
                          ) => (
                            <div
                              key={
                                root.id
                              }
                              className="space-y-3"
                            >
                              <FeatureRow
                                feature={
                                  root
                                }
                                serviceSlug={
                                  serviceSlug
                                }
                                isAdmin={
                                  isAdmin
                                }
                                isContentManager={
                                  isContentManager
                                }
                                togglingId={
                                  togglingId
                                }
                                deletingId={
                                  deletingId
                                }
                                onEdit={
                                  openEditForm
                                }
                                onToggle={
                                  handleToggleStatus
                                }
                                onDelete={
                                  handleDelete
                                }
                              />

                              {root.children.map(
                                (
                                  child
                                ) => (
                                  <FeatureRow
                                    key={
                                      child.id
                                    }
                                    feature={
                                      child
                                    }
                                    serviceSlug={
                                      serviceSlug
                                    }
                                    isChild
                                    isAdmin={
                                      isAdmin
                                    }
                                    isContentManager={
                                      isContentManager
                                    }
                                    togglingId={
                                      togglingId
                                    }
                                    deletingId={
                                      deletingId
                                    }
                                    onEdit={
                                      openEditForm
                                    }
                                    onToggle={
                                      handleToggleStatus
                                    }
                                    onDelete={
                                      handleDelete
                                    }
                                  />
                                )
                              )}
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </section>
                );
              }
            )}
          </div>
        )}
      </section>

      {/* ==================================================
          MODAL
      ================================================== */}

      {formOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#082B3A]/80 px-3 py-5 backdrop-blur-sm sm:px-5 sm:py-8">
          <div className="mx-auto flex max-h-[calc(100vh-40px)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-h-[calc(100vh-64px)] sm:rounded-3xl">
            {/* ============================================
                MODAL HEADER
            ============================================ */}

            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-7">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#FF5A0A]">
                  Fitur & Cakupan
                </p>

                <h2 className="mt-2 text-xl font-bold text-[#082B3A] sm:text-2xl">
                  {editingId
                    ? "Edit Fitur"
                    : "Tambah Fitur"}
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  {serviceName ||
                    "Product & Services"}
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closeForm
                }
                disabled={
                  saving
                }
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-red-200 hover:text-red-600 disabled:opacity-50"
              >
                <X
                  size={19}
                />
              </button>
            </div>

            {/* ============================================
                FORM BODY
            ============================================ */}

            <form
              id="service-feature-form"
              onSubmit={
                handleSubmit
              }
              className="min-h-0 flex-1 overflow-y-auto"
            >
              <div className="grid gap-7 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_300px]">
                {/* ========================================
                    LEFT
                ======================================== */}

                <div className="space-y-6">
                  {/* FORM ERROR */}

                  {formErrorMessage && (
                    <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4">
                      <AlertTriangle
                        size={18}
                        className="mt-0.5 shrink-0 text-red-600"
                      />

                      <p className="text-sm leading-6 text-red-700">
                        {
                          formErrorMessage
                        }
                      </p>
                    </div>
                  )}

                  {/* ======================================
                      FEATURE TYPE
                  ====================================== */}

                  <div>
                    <p className="mb-3 text-sm font-bold text-[#082B3A]">
                      Tipe Fitur
                    </p>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {/* ROOT */}

                      <button
                        type="button"
                        onClick={() =>
                          handleFeatureTypeChange(
                            "root"
                          )
                        }
                        className={`rounded-2xl border p-4 text-left transition ${
                          featureType ===
                          "root"
                            ? "border-[#FF5A0A] bg-orange-50 ring-2 ring-orange-100"
                            : "border-slate-200 bg-white hover:border-orange-200"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                              featureType ===
                              "root"
                                ? "bg-[#FF5A0A] text-white"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            <Layers3
                              size={17}
                            />
                          </div>

                          <div>
                            <p className="font-bold text-[#082B3A]">
                              Fitur Utama
                            </p>

                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              Berdiri sendiri dan tidak membutuhkan Parent.
                            </p>
                          </div>
                        </div>
                      </button>

                      {/* CHILD */}

                      <button
                        type="button"
                        onClick={() =>
                          handleFeatureTypeChange(
                            "child"
                          )
                        }
                        className={`rounded-2xl border p-4 text-left transition ${
                          featureType ===
                          "child"
                            ? "border-[#FF5A0A] bg-orange-50 ring-2 ring-orange-100"
                            : "border-slate-200 bg-white hover:border-orange-200"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                              featureType ===
                              "child"
                                ? "bg-[#FF5A0A] text-white"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            <GitBranch
                              size={17}
                            />
                          </div>

                          <div>
                            <p className="font-bold text-[#082B3A]">
                              Subfitur
                            </p>

                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              Berada di bawah satu Fitur Utama.
                            </p>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* ======================================
                      GROUP
                  ====================================== */}

                  {availableGroups.length >
                    0 && (
                    <div>
                      <label
                        htmlFor="service-feature-group"
                        className="mb-2 block text-sm font-semibold text-[#082B3A]"
                      >
                        Kelompok Fitur
                      </label>

                      <select
                        id="service-feature-group"
                        value={
                          formData.group_name
                        }
                        onChange={
                          handleGroupChange
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#082B3A] outline-none transition focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
                      >
                        <option value="">
                          {getUngroupedLabel(
                            serviceSlug
                          )}
                        </option>

                        {availableGroups.map(
                          (
                            group
                          ) => (
                            <option
                              key={
                                group.name
                              }
                              value={
                                group.name
                              }
                            >
                              {
                                group.name
                              }
                            </option>
                          )
                        )}
                      </select>

                      <p className="mt-2 text-xs leading-5 text-slate-400">
                        Urutan kelompok ditentukan otomatis.
                      </p>
                    </div>
                  )}

                  {/* ======================================
                      PARENT - CHILD ONLY
                  ====================================== */}

                  {featureType ===
                    "child" && (
                    <div className="rounded-2xl border border-orange-200 bg-orange-50/60 p-4">
                      <label
                        htmlFor="service-feature-parent"
                        className="mb-2 block text-sm font-bold text-[#082B3A]"
                      >
                        Parent Fitur{" "}
                        <span className="text-red-500">
                          *
                        </span>
                      </label>

                      <select
                        id="service-feature-parent"
                        value={
                          formData.parent_feature_id
                        }
                        onChange={
                          handleParentChange
                        }
                        required
                        className="w-full rounded-xl border border-orange-200 bg-white px-4 py-3 text-sm text-[#082B3A] outline-none focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
                      >
                        <option value="">
                          Pilih Fitur Utama
                        </option>

                        {parentOptions.map(
                          (
                            feature
                          ) => (
                            <option
                              key={
                                feature.id
                              }
                              value={
                                feature.id
                              }
                            >
                              {
                                feature.name
                              }
                            </option>
                          )
                        )}
                      </select>

                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        Contoh: Tele-ICU, Tele-EKG, IoT Ambulance dan
                        Mobile Clinic menggunakan Telehealth sebagai
                        Parent.
                      </p>

                      {parentOptions.length ===
                        0 && (
                        <p className="mt-3 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-amber-700">
                          Tidak ada Fitur Utama yang tersedia pada kelompok
                          ini.
                        </p>
                      )}
                    </div>
                  )}

                  {/* ======================================
                      NAME
                  ====================================== */}

                  <div>
                    <label
                      htmlFor="service-feature-name"
                      className="mb-2 block text-sm font-semibold text-[#082B3A]"
                    >
                      Nama Fitur{" "}
                      <span className="text-red-500">
                        *
                      </span>
                    </label>

                    <input
                      id="service-feature-name"
                      name="name"
                      type="text"
                      value={
                        formData.name
                      }
                      onChange={
                        handleInputChange
                      }
                      required
                      placeholder="Contoh: EMR"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#082B3A] outline-none transition focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
                    />
                  </div>

                  {/* ======================================
                      SLUG
                  ====================================== */}

                  <div>
                    <label
                      htmlFor="service-feature-slug"
                      className="mb-2 block text-sm font-semibold text-[#082B3A]"
                    >
                      Slug{" "}
                      <span className="text-red-500">
                        *
                      </span>
                    </label>

                    <input
                      id="service-feature-slug"
                      name="slug"
                      type="text"
                      value={
                        formData.slug
                      }
                      onChange={
                        handleInputChange
                      }
                      required
                      placeholder="emr"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#082B3A] outline-none transition focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
                    />

                    <p className="mt-2 break-all text-xs text-slate-400">
                      /services/
                      {serviceSlug ||
                        "service"}
                      /features/
                      {formData.slug ||
                        "feature"}
                    </p>
                  </div>

                  {/* ======================================
                      SHORT DESCRIPTION
                  ====================================== */}

                  <div>
                    <label
                      htmlFor="service-feature-short-description"
                      className="mb-2 block text-sm font-semibold text-[#082B3A]"
                    >
                      Deskripsi Singkat
                    </label>

                    <textarea
                      id="service-feature-short-description"
                      name="short_description"
                      value={
                        formData.short_description
                      }
                      onChange={
                        handleInputChange
                      }
                      rows={3}
                      placeholder="Ringkasan singkat fitur..."
                      className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-7 text-[#082B3A] outline-none transition focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
                    />
                  </div>

                  {/* ======================================
                      FULL DESCRIPTION
                  ====================================== */}

                  <div>
                    <label
                      htmlFor="service-feature-full-description"
                      className="mb-2 block text-sm font-semibold text-[#082B3A]"
                    >
                      Deskripsi Lengkap
                    </label>

                    <textarea
                      id="service-feature-full-description"
                      name="full_description"
                      value={
                        formData.full_description
                      }
                      onChange={
                        handleInputChange
                      }
                      rows={7}
                      placeholder="Jelaskan fitur secara lengkap..."
                      className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-7 text-[#082B3A] outline-none transition focus:border-[#FF5A0A] focus:ring-2 focus:ring-orange-100"
                    />
                  </div>

                  {/* ======================================
                      ORDER + STATUS
                  ====================================== */}

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="service-feature-order"
                        className="mb-2 block text-sm font-semibold text-[#082B3A]"
                      >
                        Urutan
                      </label>

                      <input
                        id="service-feature-order"
                        name="sort_order"
                        type="number"
                        min="0"
                        value={
                          formData.sort_order
                        }
                        onChange={
                          handleInputChange
                        }
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-[#082B3A] outline-none focus:border-[#FF5A0A]"
                      />

                      <p className="mt-2 text-xs leading-5 text-slate-400">
                        Untuk Subfitur, urutan berlaku di dalam Parent.
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="service-feature-status"
                        className="mb-2 block text-sm font-semibold text-[#082B3A]"
                      >
                        Status
                      </label>

                      <select
                        id="service-feature-status"
                        name="status"
                        value={
                          formData.status
                        }
                        onChange={
                          handleInputChange
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[#082B3A] outline-none focus:border-[#FF5A0A]"
                      >
                        {STATUS_OPTIONS.map(
                          (
                            option
                          ) => (
                            <option
                              key={
                                option.value
                              }
                              value={
                                option.value
                              }
                            >
                              {
                                option.label
                              }
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  </div>
                </div>

                {/* ========================================
                    RIGHT - IMAGE
                ======================================== */}

                <aside>
                  <div className="sticky top-0">
                    <p className="text-sm font-bold text-[#082B3A]">
                      Gambar Fitur
                    </p>

                    <div className="mt-3 flex min-h-60 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50">
                      {displayedImage ? (
                        <img
                          src={
                            displayedImage
                          }
                          alt="Preview fitur"
                          className="h-60 w-full object-cover"
                        />
                      ) : (
                        <div className="px-5 text-center">
                          <ImageIcon
                            size={42}
                            className="mx-auto text-slate-300"
                          />

                          <p className="mt-3 text-sm font-semibold text-slate-500">
                            Belum ada gambar
                          </p>

                          <p className="mt-1 text-xs leading-5 text-slate-400">
                            JPG, PNG atau WebP maksimal 2 MB.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 space-y-3">
                      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#082B3A] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0A4053]">
                        <UploadCloud
                          size={16}
                        />

                        Pilih Gambar

                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={
                            handleImageChange
                          }
                          className="hidden"
                        />
                      </label>

                      {displayedImage && (
                        <button
                          type="button"
                          onClick={
                            handleRemoveImage
                          }
                          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          <Trash2
                            size={15}
                          />

                          Hapus Gambar
                        </button>
                      )}
                    </div>

                    {/* STRUCTURE INFO */}

                    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Struktur
                      </p>

                      <div className="mt-3 space-y-2 text-xs leading-5 text-slate-600">
                        <div className="flex items-center gap-2">
                          <CircleDot
                            size={13}
                            className="text-[#FF5A0A]"
                          />

                          {featureType ===
                          "root"
                            ? "Fitur Utama"
                            : "Subfitur"}
                        </div>

                        {formData.group_name && (
                          <div className="flex items-start gap-2">
                            <Layers3
                              size={13}
                              className="mt-1 shrink-0 text-[#FF5A0A]"
                            />

                            {
                              formData.group_name
                            }
                          </div>
                        )}

                        {featureType ===
                          "child" &&
                          formData.parent_feature_id && (
                            <div className="flex items-start gap-2">
                              <GitBranch
                                size={13}
                                className="mt-1 shrink-0 text-[#FF5A0A]"
                              />

                              Parent:{" "}
                              {features.find(
                                (
                                  feature
                                ) =>
                                  feature.id ===
                                  formData.parent_feature_id
                              )?.name ||
                                "-"}
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                </aside>
              </div>
            </form>

            {/* ============================================
                MODAL FOOTER
            ============================================ */}

            <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-slate-100 bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
              <button
                type="button"
                onClick={
                  closeForm
                }
                disabled={
                  saving
                }
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="submit"
                form="service-feature-form"
                disabled={
                  saving ||
                  !isContentManager
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF5A0A] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#E94F00] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <LoaderCircle
                      size={17}
                      className="animate-spin"
                    />

                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save
                      size={17}
                    />

                    {editingId
                      ? "Simpan Perubahan"
                      : "Tambah Fitur"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}