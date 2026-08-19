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
  Edit3,
  Eye,
  EyeOff,
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
   CONFIG
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
    name: "Konsultasi & Implementasi Jaringan",
    order: 3,
  },
],
};

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

function getUngroupedGroupOrder(serviceSlug) {
  return serviceSlug === "simrs-erp"
    ? 4
    : 0;
}

function createInitialFormData(
  sortOrder = 0,
  groupOrder = 0
) {
  return {
    group_name: "",
    group_order: groupOrder,
    parent_feature_id: "",

    name: "",
    slug: "",

    short_description: "",
    full_description: "",

    image_url: "",

    sort_order: sortOrder,

    status: "draft",
  };
}

function createSlug(value) {
  return String(value || "")
    .trim()
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

function sortFeatureRecords(
  items = []
) {
  const records = [...items];

  const byId = new Map(
    records.map((item) => [
      item.id,
      item,
    ])
  );

  return records.sort(
    (
      firstItem,
      secondItem
    ) => {
      const firstGroup =
        Number(
          firstItem.group_order
        ) || 0;

      const secondGroup =
        Number(
          secondItem.group_order
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
        firstItem.parent_feature_id
          ? byId.get(
              firstItem.parent_feature_id
            )
          : null;

      const secondParent =
        secondItem.parent_feature_id
          ? byId.get(
              secondItem.parent_feature_id
            )
          : null;

      const firstRootOrder =
        Number(
          firstParent?.sort_order ??
            firstItem.sort_order
        ) || 0;

      const secondRootOrder =
        Number(
          secondParent?.sort_order ??
            secondItem.sort_order
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
          firstItem.parent_feature_id
        );

      const secondIsChild =
        Boolean(
          secondItem.parent_feature_id
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
          firstItem.sort_order
        ) || 0;

      const secondOrder =
        Number(
          secondItem.sort_order
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

function formatUpdatedAt(value) {
  if (!value) {
    return "Belum tersedia";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Belum tersedia";
  }

  return new Intl.DateTimeFormat(
    "id-ID",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(date);
}

function getStatusLabel(status) {
  if (status === "published") {
    return "Published";
  }

  if (status === "archived") {
    return "Archived";
  }

  return "Draft";
}

function getStatusClass(status) {
  if (status === "published") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "archived") {
    return "border-slate-300 bg-slate-100 text-slate-600";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

/* ======================================================
   COMPONENT
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

  /*
   * root  = fitur utama
   * child = subfitur
   */
  const [
    featureType,
    setFeatureType,
  ] = useState("root");

  const [
    formData,
    setFormData,
  ] = useState(
    createInitialFormData()
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

  /* ====================================================
     PARENT OPTIONS
  ==================================================== */

  const availableParentFeatures =
    useMemo(() => {
      return features
        .filter((feature) => {
          if (
            editingId &&
            feature.id ===
              editingId
          ) {
            return false;
          }

          /*
           * Hanya root feature boleh
           * menjadi parent.
           */
          if (
            feature.parent_feature_id
          ) {
            return false;
          }

          const featureGroup =
            String(
              feature.group_name ||
                ""
            ).trim();

          const currentGroup =
            String(
              formData.group_name ||
                ""
            ).trim();

          /*
           * Parent harus berada
           * pada group yang sama.
           */
          return (
            featureGroup ===
            currentGroup
          );
        })
        .sort(
          (
            firstItem,
            secondItem
          ) => {
            const firstOrder =
              Number(
                firstItem.sort_order
              ) || 0;

            const secondOrder =
              Number(
                secondItem.sort_order
              ) || 0;

            return (
              firstOrder -
              secondOrder
            );
          }
        );
    }, [
      features,
      editingId,
      formData.group_name,
    ]);

  /* ====================================================
     LOAD
  ==================================================== */

  const loadFeatures =
    useCallback(
      async () => {
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
            "Detail fitur gagal dimuat:",
            error
          );

          setFeatures([]);

          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Detail fitur gagal dimuat."
          );
        } finally {
          setLoading(false);
        }
      },
      [serviceId]
    );

  useEffect(() => {
    loadFeatures();
  }, [loadFeatures]);

  /* ====================================================
     IMAGE CLEANUP
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
     MODAL BODY LOCK
  ==================================================== */

  useEffect(() => {
    if (!formOpen) {
      return undefined;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [formOpen]);

  /* ====================================================
     SUMMARY
  ==================================================== */

  const summary =
    useMemo(() => {
      return {
        total:
          features.length,

        published:
          features.filter(
            (item) =>
              item.status ===
              "published"
          ).length,

        draft:
          features.filter(
            (item) =>
              item.status ===
              "draft"
          ).length,

        archived:
          features.filter(
            (item) =>
              item.status ===
              "archived"
          ).length,
      };
    }, [features]);

  /* ====================================================
     FILTER
  ==================================================== */

  const filteredFeatures =
    useMemo(() => {
      const normalizedSearch =
        searchTerm
          .trim()
          .toLowerCase();

      return features.filter(
        (feature) => {
          const parent =
            feature.parent_feature_id
              ? features.find(
                  (item) =>
                    item.id ===
                    feature.parent_feature_id
                )
              : null;

          const searchableText = [
            feature.group_name,
            feature.name,
            feature.slug,
            parent?.name,
            feature.short_description,
            feature.full_description,
          ]
            .map((value) =>
              String(
                value || ""
              )
                .trim()
                .toLowerCase()
            )
            .join(" ");

          const matchesSearch =
            !normalizedSearch ||
            searchableText.includes(
              normalizedSearch
            );

          const matchesStatus =
            statusFilter ===
              "all" ||
            feature.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      features,
      searchTerm,
      statusFilter,
    ]);

  /* ====================================================
     IMAGE
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

  function resetFormState() {
    setEditingId("");

    setFeatureType(
      "root"
    );

    setFormData(
      createInitialFormData(
        0,
        ungroupedGroupOrder
      )
    );

    setSlugManuallyEdited(
      false
    );

    setImageFile(null);

    clearImagePreview();

    setFormErrorMessage("");
  }

  function closeForm() {
    if (saving) {
      return;
    }

    setFormOpen(false);

    resetFormState();
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

    const highestSortOrder =
      features.reduce(
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
        -1
      );

    setEditingId("");

    setFeatureType(
      "root"
    );

    setFormData(
      createInitialFormData(
        highestSortOrder + 1,
        ungroupedGroupOrder
      )
    );

    setSlugManuallyEdited(
      false
    );

    setImageFile(null);

    clearImagePreview();

    setErrorMessage("");

    setFormErrorMessage("");

    setSuccessMessage("");

    setFormOpen(true);
  }

  /* ====================================================
     EDIT
  ==================================================== */

  function openEditForm(feature) {
  if (!isContentManager) {
    setErrorMessage(
      "Akun tidak memiliki izin untuk mengedit fitur."
    );

    return;
  }

  const validParent =
    feature.parent_feature_id
      ? features.find(
          (item) =>
            item.id ===
              feature.parent_feature_id &&
            !item.parent_feature_id &&
            String(
              item.group_name || ""
            ).trim() ===
              String(
                feature.group_name || ""
              ).trim()
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
      feature.group_name || "",

    group_order:
      Number(
        feature.group_order
      ) || 0,

    parent_feature_id:
      validParent?.id || "",

    name:
      feature.name || "",

    slug:
      feature.slug || "",

    short_description:
      feature.short_description || "",

    full_description:
      feature.full_description || "",

    image_url:
      feature.image_url || "",

    sort_order:
      Number(
        feature.sort_order
      ) || 0,

    status:
      feature.status || "draft",
  });

  setSlugManuallyEdited(
    true
  );

  setImageFile(
    null
  );

  clearImagePreview();

  setErrorMessage(
    ""
  );

  setFormErrorMessage(
    ""
  );

  setSuccessMessage(
    ""
  );

  setFormOpen(
    true
  );
}

  /* ====================================================
     INPUT
  ==================================================== */

  function handleInputChange(event) {
    const {
      name,
      value,
    } = event.target;

    setFormErrorMessage("");

    if (name === "name") {
      setFormData(
        (current) => ({
          ...current,

          name: value,

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

    if (name === "slug") {
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

        [name]:
          value,
      })
    );
  }

  function handleGroupChange(event) {
    const selectedGroupName =
      event.target.value;

    const selectedGroup =
      availableGroups.find(
        (group) =>
          group.name ===
          selectedGroupName
      );

    setFeatureType(
      "root"
    );

    setFormData(
      (current) => ({
        ...current,

        group_name:
          selectedGroupName,

        group_order:
          selectedGroup
            ? selectedGroup.order
            : ungroupedGroupOrder,

        parent_feature_id:
          "",
      })
    );

    setFormErrorMessage("");
  }

  function handleFeatureTypeChange(
    nextType
  ) {
    setFeatureType(
      nextType
    );

    setFormErrorMessage("");

    if (
      nextType === "root"
    ) {
      setFormData(
        (current) => ({
          ...current,
          parent_feature_id:
            "",
        })
      );
    }
  }

  function handleImageChange(event) {
    const selectedFile =
      event.target.files?.[0];

    event.target.value = "";

    if (!selectedFile) {
      return;
    }

    if (
      !ALLOWED_IMAGE_TYPES.includes(
        selectedFile.type
      )
    ) {
      setFormErrorMessage(
        "Gambar harus berformat JPG, PNG, atau WebP."
      );

      return;
    }

    if (
      selectedFile.size >
      MAX_IMAGE_SIZE
    ) {
      setFormErrorMessage(
        "Ukuran gambar maksimal 2 MB."
      );

      return;
    }

    clearImagePreview();

    setImageFile(
      selectedFile
    );

    setImagePreviewUrl(
      URL.createObjectURL(
        selectedFile
      )
    );

    setFormErrorMessage("");
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
     VALIDATION
  ==================================================== */

  function validateForm() {
    if (!serviceId) {
      return "ID Service tidak tersedia.";
    }

    if (
      !formData.name.trim()
    ) {
      return "Nama fitur wajib diisi.";
    }

    if (
      !formData.slug.trim()
    ) {
      return "Slug fitur wajib diisi.";
    }

    /*
     * Parent hanya wajib apabila
     * admin memilih tipe Subfitur.
     */
    if (
      featureType ===
        "child" &&
      !formData.parent_feature_id
    ) {
      return "Pilih Parent Fitur untuk membuat Subfitur.";
    }

    if (
      featureType ===
        "child" &&
      formData.parent_feature_id ===
        editingId
    ) {
      return "Fitur tidak dapat menjadi parent untuk dirinya sendiri.";
    }

    if (
      featureType ===
        "child"
    ) {
      const parent =
        features.find(
          (item) =>
            item.id ===
            formData.parent_feature_id
        );

      if (!parent) {
        return "Parent Fitur yang dipilih tidak ditemukan.";
      }

      if (
        parent.parent_feature_id
      ) {
        return "Subfitur tidak dapat digunakan sebagai Parent.";
      }

      if (
        String(
          parent.group_name ||
            ""
        ).trim() !==
        String(
          formData.group_name ||
            ""
        ).trim()
      ) {
        return "Parent harus berada pada kelompok yang sama.";
      }
    }

    const groupOrder =
      Number.parseInt(
        formData.group_order,
        10
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
      Number.parseInt(
        formData.sort_order,
        10
      );

    if (
      !Number.isFinite(
        sortOrder
      ) ||
      sortOrder < 0
    ) {
      return "Urutan fitur tidak valid.";
    }

    return "";
  }

  function scrollModalToTop() {
    window.requestAnimationFrame(
      () => {
        document
          .getElementById(
            "service-feature-modal-content"
          )
          ?.scrollTo({
            top: 0,
            behavior: "smooth",
          });
      }
    );
  }

  /* ====================================================
     SAVE
  ==================================================== */

  async function handleSubmit(event) {
    event.preventDefault();

    if (
      saving ||
      !isContentManager
    ) {
      return;
    }

    const validationMessage =
      validateForm();

    if (validationMessage) {
      setFormErrorMessage(
        validationMessage
      );

      scrollModalToTop();

      return;
    }

    try {
      setSaving(true);

      setFormErrorMessage("");

      setErrorMessage("");

      setSuccessMessage("");

      const payload = {
        group_name:
          formData.group_name.trim(),

        group_order:
          Number.parseInt(
            formData.group_order,
            10
          ),

        /*
         * Root = NULL.
         * Child = ID Parent.
         */
        parent_feature_id:
          featureType ===
            "child"
            ? formData.parent_feature_id
            : null,

        name:
          formData.name.trim(),

        slug:
          createSlug(
            formData.slug
          ),

        short_description:
          formData.short_description.trim(),

        full_description:
          formData.full_description.trim(),

        image_url:
          formData.image_url,

        sort_order:
          Number.parseInt(
            formData.sort_order,
            10
          ),

        status:
          formData.status,
      };

      let savedFeature;

      if (editingId) {
        savedFeature =
          await updateServiceFeature(
            editingId,
            payload,
            imageFile
          );

        setFeatures(
          (current) =>
            sortFeatureRecords(
              current.map(
                (item) =>
                  item.id ===
                  editingId
                    ? savedFeature
                    : item
              )
            )
        );

        setSuccessMessage(
          `Fitur “${savedFeature?.name || formData.name}” berhasil diperbarui.`
        );
      } else {
        savedFeature =
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
          `Fitur “${savedFeature?.name || formData.name}” berhasil ditambahkan.`
        );
      }

      setFormOpen(false);

      resetFormState();
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

      scrollModalToTop();
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
          ? `Fitur “${feature.name}” berhasil dipublikasikan.`
          : `Fitur “${feature.name}” berhasil dijadikan Draft.`
      );
    } catch (error) {
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

  async function handleDelete(feature) {
    if (
      !isAdmin ||
      deletingId
    ) {
      return;
    }

    const childCount =
      features.filter(
        (item) =>
          item.parent_feature_id ===
          feature.id
      ).length;

    const childNotice =
      childCount > 0
        ? `\n\nFitur ini memiliki ${childCount} subfitur. Subfitur akan menjadi fitur utama setelah parent dihapus.`
        : "";

    const confirmed =
      window.confirm(
        `Hapus fitur "${feature.name}"?${childNotice}\n\nData yang dihapus tidak dapat dikembalikan.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(
        feature.id
      );

      await deleteServiceFeature(
        feature.id
      );

      setFeatures(
        (current) =>
          sortFeatureRecords(
            current
              .filter(
                (item) =>
                  item.id !==
                  feature.id
              )
              .map(
                (item) =>
                  item.parent_feature_id ===
                  feature.id
                    ? {
                        ...item,
                        parent_feature_id:
                          null,
                      }
                    : item
              )
          )
      );

      setSuccessMessage(
        `Fitur “${feature.name}” berhasil dihapus.`
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Fitur gagal dihapus."
      );
    } finally {
      setDeletingId("");
    }
  }

  const displayedImage =
    imagePreviewUrl ||
    formData.image_url;

  if (loading) {
    return (
      <div className="flex min-h-72 items-center justify-center rounded-3xl border border-slate-200 bg-white">
        <div className="text-center">
          <LoaderCircle
            size={36}
            className="mx-auto animate-spin text-[#FF5A0A]"
          />

          <p className="mt-4 text-sm font-semibold text-[#082B3A]">
            Memuat fitur...
          </p>
        </div>
      </div>
    );
  }

  /* ====================================================
     RENDER
  ==================================================== */

  return (
    <>
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {/* HEADER */}

        <div className="border-b border-slate-100 px-6 py-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#FF5A0A]">
                <Layers3 size={15} />
                Feature Management
              </div>

              <h2 className="mt-2 text-2xl font-bold text-[#082B3A]">
                Fitur & Cakupan
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Kelola fitur utama dan subfitur untuk{" "}
                <strong className="text-[#082B3A]">
                  {serviceName}
                </strong>
                .
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={
                  loadFeatures
                }
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-[#FF5A0A] hover:text-[#FF5A0A]"
              >
                <RefreshCw size={16} />
                Refresh
              </button>

              {isContentManager && (
                <button
                  type="button"
                  onClick={
                    openCreateForm
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-[#FF5A0A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#E94F00]"
                >
                  <Plus size={17} />
                  Tambah Fitur
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6 p-6 lg:p-8">
          {/* MESSAGES */}

          {errorMessage && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4">
              <AlertTriangle
                size={19}
                className="mt-0.5 shrink-0 text-red-600"
              />

              <p className="text-sm text-red-700">
                {errorMessage}
              </p>
            </div>
          )}

          {successMessage && (
            <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
              <CheckCircle2
                size={19}
                className="mt-0.5 shrink-0 text-emerald-600"
              />

              <p className="text-sm text-emerald-700">
                {successMessage}
              </p>
            </div>
          )}

          {isEditor && (
            <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs leading-6 text-blue-700">
              Editor dapat menambah, mengedit, menentukan parent dan mengubah
              status. Penghapusan hanya tersedia untuk Admin.
            </div>
          )}

          {/* SUMMARY */}

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              [
                "Total",
                summary.total,
                "text-[#082B3A]",
              ],
              [
                "Published",
                summary.published,
                "text-emerald-600",
              ],
              [
                "Draft",
                summary.draft,
                "text-amber-600",
              ],
              [
                "Archived",
                summary.archived,
                "text-slate-500",
              ],
            ].map(
              ([
                label,
                value,
                color,
              ]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-4"
                >
                  <p
                    className={`text-2xl font-bold ${color}`}
                  >
                    {value}
                  </p>

                  <p className="mt-1 text-xs font-medium text-slate-500">
                    {label}
                  </p>
                </div>
              )
            )}
          </div>

          {/* FILTER */}

          <div className="grid gap-3 rounded-2xl bg-slate-50 p-3 md:grid-cols-[1fr_190px_auto]">
            <div className="relative">
              <Search
                size={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
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
                placeholder="Cari fitur..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#FF5A0A]"
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
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none"
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
                    {option.label}
                  </option>
                )
              )}
            </select>

            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
              }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600"
            >
              Reset
            </button>
          </div>

          {/* FEATURE LIST */}

          {filteredFeatures.length ===
          0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
              <Sparkles
                size={38}
                className="mx-auto text-slate-300"
              />

              <h3 className="mt-4 font-bold text-[#082B3A]">
                Fitur tidak ditemukan
              </h3>
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {filteredFeatures.map(
                (feature) => {
                  const parent =
                    feature.parent_feature_id
                      ? features.find(
                          (item) =>
                            item.id ===
                            feature.parent_feature_id
                        )
                      : null;

                  const publicUrl =
                    serviceSlug &&
                    feature.slug
                      ? `/services/${serviceSlug}/features/${feature.slug}`
                      : "";

                  return (
                    <article
                      key={
                        feature.id
                      }
                      className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-orange-200 hover:shadow-md"
                    >
                      <div className="flex gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                          {feature.image_url ? (
                            <img
                              src={
                                feature.image_url
                              }
                              alt={
                                feature.name
                              }
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageIcon
                              size={22}
                              className="text-slate-300"
                            />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${getStatusClass(
                                feature.status
                              )}`}
                            >
                              {getStatusLabel(
                                feature.status
                              )}
                            </span>

                            <span className="text-[11px] text-slate-400">
                              {formatUpdatedAt(
                                feature.updated_at
                              )}
                            </span>
                          </div>

                          <h3 className="mt-2 font-bold text-[#082B3A]">
                            {feature.name}
                          </h3>

                          {parent ? (
                            <p className="mt-1 text-xs font-medium text-[#FF5A0A]">
                              Subfitur dari{" "}
                              {parent.name}
                            </p>
                          ) : (
                            <p className="mt-1 text-xs text-slate-400">
                              Fitur Utama
                            </p>
                          )}

                          {feature.group_name && (
                            <p className="mt-2 text-xs text-slate-500">
                              {
                                feature.group_name
                              }
                            </p>
                          )}
                        </div>
                      </div>

                      <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-500">
                        {feature.short_description ||
                          "Deskripsi singkat belum tersedia."}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                        {publicUrl &&
                          feature.status ===
                            "published" && (
                            <Link
                              to={
                                publicUrl
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600"
                            >
                              <ArrowUpRight
                                size={
                                  14
                                }
                              />
                              Live
                            </Link>
                          )}

                        {isContentManager && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                openEditForm(
                                  feature
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg bg-[#082B3A] px-3 py-2 text-xs font-semibold text-white"
                            >
                              <Edit3
                                size={
                                  14
                                }
                              />
                              Edit
                            </button>

                            <button
                              type="button"
                              disabled={
                                togglingId ===
                                feature.id
                              }
                              onClick={() =>
                                handleToggleStatus(
                                  feature
                                )
                              }
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600"
                            >
                              {feature.status ===
                              "published" ? (
                                <EyeOff
                                  size={
                                    14
                                  }
                                />
                              ) : (
                                <Eye
                                  size={
                                    14
                                  }
                                />
                              )}

                              {feature.status ===
                              "published"
                                ? "Draft"
                                : "Publish"}
                            </button>
                          </>
                        )}

                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                feature
                              )
                            }
                            className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600"
                          >
                            <Trash2
                              size={
                                14
                              }
                            />
                            Hapus
                          </button>
                        )}
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          )}
        </div>
      </section>

      {/* ==================================================
          MODAL
      ================================================== */}

      {formOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-[#082B3A]/80 p-3 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex h-full items-center justify-center">
            <div className="flex max-h-[calc(100vh-1.5rem)] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
              {/* MODAL HEADER */}

              <div className="shrink-0 border-b border-slate-100 px-6 py-5">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#FF5A0A]">
                      Feature Management
                    </p>

                    <h2 className="mt-2 text-2xl font-bold text-[#082B3A]">
                      {editingId
                        ? "Edit Fitur"
                        : "Tambah Fitur"}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {serviceName}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={
                      closeForm
                    }
                    disabled={saving}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <form
                onSubmit={
                  handleSubmit
                }
                className="flex min-h-0 flex-1 flex-col"
              >
                <div
                  id="service-feature-modal-content"
                  className="min-h-0 flex-1 overflow-y-auto"
                >
                  <div className="p-6">
                    {formErrorMessage && (
                      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
                        <AlertTriangle
                          size={19}
                          className="mt-0.5 shrink-0 text-red-600"
                        />

                        <div>
                          <p className="font-semibold text-red-800">
                            Data belum dapat disimpan
                          </p>

                          <p className="mt-1 text-sm text-red-700">
                            {formErrorMessage}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="grid gap-7 lg:grid-cols-[1fr_300px]">
                      <div className="space-y-6">
                        {/* TYPE */}

                        <div>
                          <label className="mb-3 block text-sm font-semibold text-[#082B3A]">
                            Tipe Fitur
                          </label>

                          <div className="grid gap-3 sm:grid-cols-2">
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
                                  : "border-slate-200 bg-white hover:border-slate-300"
                              }`}
                            >
                              <p className="font-bold text-[#082B3A]">
                                Fitur Utama
                              </p>

                              <p className="mt-1 text-xs leading-5 text-slate-500">
                                Berdiri sendiri dan tidak membutuhkan Parent.
                              </p>
                            </button>

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
                                  : "border-slate-200 bg-white hover:border-slate-300"
                              }`}
                            >
                              <p className="font-bold text-[#082B3A]">
                                Subfitur
                              </p>

                              <p className="mt-1 text-xs leading-5 text-slate-500">
                                Berada di bawah fitur utama seperti Telehealth.
                              </p>
                            </button>
                          </div>
                        </div>

                        {/* GROUP */}

                        {availableGroups.length >
                          0 && (
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                              <label className="mb-2 block text-sm font-semibold text-[#082B3A]">
                                Kelompok Fitur
                              </label>

                              <select
                                value={
                                  formData.group_name
                                }
                                onChange={
                                  handleGroupChange
                                }
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#FF5A0A]"
                              >
                                <option value="">
                                  Tanpa Kelompok
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
                            </div>

                            <div>
                              <label className="mb-2 block text-sm font-semibold text-[#082B3A]">
                                Urutan Kelompok
                              </label>

                              <input
                                value={
                                  formData.group_order
                                }
                                readOnly
                                className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500"
                              />
                            </div>
                          </div>
                        )}

                        {/* PARENT */}

                        {featureType ===
                          "child" && (
                          <div>
                            <label className="mb-2 block text-sm font-semibold text-[#082B3A]">
                              Parent Fitur{" "}
                              <span className="text-red-500">
                                *
                              </span>
                            </label>

                            <select
                              name="parent_feature_id"
                              value={
                                formData.parent_feature_id
                              }
                              onChange={
                                handleInputChange
                              }
                              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#FF5A0A]"
                            >
                              <option value="">
                                Pilih Parent Fitur
                              </option>

                              {availableParentFeatures.map(
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

                            {availableParentFeatures.length ===
                              0 && (
                              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                                <p className="text-xs leading-5 text-amber-700">
                                  Belum ada Fitur Utama yang dapat dijadikan
                                  Parent pada kelompok ini. Buat Fitur Utama
                                  terlebih dahulu.
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {featureType ===
                          "root" && (
                          <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                            <p className="text-xs leading-5 text-blue-700">
                              Parent tidak diperlukan karena item ini adalah{" "}
                              <strong>
                                Fitur Utama
                              </strong>
                              . Nilai `parent_feature_id` akan disimpan sebagai
                              kosong/null.
                            </p>
                          </div>
                        )}

                        {/* NAME */}

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-[#082B3A]">
                            Nama Fitur{" "}
                            <span className="text-red-500">
                              *
                            </span>
                          </label>

                          <input
                            name="name"
                            value={
                              formData.name
                            }
                            onChange={
                              handleInputChange
                            }
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#FF5A0A]"
                          />
                        </div>

                        {/* SLUG */}

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-[#082B3A]">
                            Slug{" "}
                            <span className="text-red-500">
                              *
                            </span>
                          </label>

                          <input
                            name="slug"
                            value={
                              formData.slug
                            }
                            onChange={
                              handleInputChange
                            }
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#FF5A0A]"
                          />

                          <p className="mt-2 break-all text-xs text-slate-400">
                            /services/
                            {serviceSlug}
                            /features/
                            {formData.slug}
                          </p>
                        </div>

                        {/* SHORT */}

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-[#082B3A]">
                            Deskripsi Singkat
                          </label>

                          <textarea
                            name="short_description"
                            value={
                              formData.short_description
                            }
                            onChange={
                              handleInputChange
                            }
                            rows={4}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm leading-7 outline-none focus:border-[#FF5A0A]"
                          />
                        </div>

                        {/* FULL */}

                        <div>
                          <label className="mb-2 block text-sm font-semibold text-[#082B3A]">
                            Deskripsi Lengkap
                          </label>

                          <textarea
                            name="full_description"
                            value={
                              formData.full_description
                            }
                            onChange={
                              handleInputChange
                            }
                            rows={8}
                            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm leading-7 outline-none focus:border-[#FF5A0A]"
                          />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <label className="mb-2 block text-sm font-semibold text-[#082B3A]">
                              Urutan
                            </label>

                            <input
                              name="sort_order"
                              type="number"
                              min="0"
                              value={
                                formData.sort_order
                              }
                              onChange={
                                handleInputChange
                              }
                              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none"
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-semibold text-[#082B3A]">
                              Status
                            </label>

                            <select
                              name="status"
                              value={
                                formData.status
                              }
                              onChange={
                                handleInputChange
                              }
                              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
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

                      {/* IMAGE */}

                      <aside>
                        <p className="text-sm font-semibold text-[#082B3A]">
                          Gambar Fitur
                        </p>

                        <div className="mt-3 flex h-64 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50">
                          {displayedImage ? (
                            <img
                              src={
                                displayedImage
                              }
                              alt="Preview"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="text-center">
                              <ImageIcon
                                size={
                                  40
                                }
                                className="mx-auto text-slate-300"
                              />

                              <p className="mt-3 text-sm font-medium text-slate-400">
                                Belum ada gambar
                              </p>
                            </div>
                          )}
                        </div>

                        <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#082B3A] px-4 py-3 text-sm font-semibold text-white">
                          <UploadCloud
                            size={
                              17
                            }
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
                            className="mt-3 w-full rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600"
                          >
                            Hapus Gambar
                          </button>
                        )}

                        <p className="mt-3 text-xs leading-5 text-slate-400">
                          JPG, PNG, WebP. Maksimal 2 MB.
                        </p>
                      </aside>
                    </div>
                  </div>
                </div>

                {/* FOOTER */}

                <div className="shrink-0 border-t border-slate-100 bg-slate-50 px-6 py-4">
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={
                        closeForm
                      }
                      disabled={saving}
                      className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600"
                    >
                      Batal
                    </button>

                    <button
                      type="submit"
                      disabled={
                        saving ||
                        !isContentManager
                      }
                      className="inline-flex items-center gap-2 rounded-xl bg-[#FF5A0A] px-6 py-3 text-sm font-semibold text-white disabled:bg-slate-300"
                    >
                      {saving ? (
                        <LoaderCircle
                          size={18}
                          className="animate-spin"
                        />
                      ) : (
                        <Save
                          size={
                            18
                          }
                        />
                      )}

                      {saving
                        ? "Menyimpan..."
                        : editingId
                          ? "Simpan Perubahan"
                          : "Tambah Fitur"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}