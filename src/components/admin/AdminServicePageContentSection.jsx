import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  BarChart3,
  Boxes,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  Edit3,
  Eye,
  FileText,
  ImageIcon,
  Layers3,
  ListChecks,
  LoaderCircle,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import { useAdminAuth } from "../../contexts/AdminAuthContext";
import { supabase } from "../../lib/supabase";

/* ======================================================
   TABLES
====================================================== */

const SECTION_TABLE =
  "service_page_sections";

const ITEM_TABLE =
  "service_page_section_items";

/* ======================================================
   SECTION TYPES
====================================================== */

const SECTION_TYPE_OPTIONS = [
  {
    value: "hero",
    label: "Hero",
  },
  {
    value: "intro",
    label: "Intro",
  },
  {
    value: "icon_grid",
    label: "Icon Grid",
  },
  {
    value: "benefits",
    label: "Benefits",
  },
  {
    value: "stats",
    label: "Statistics",
  },
  {
    value: "download",
    label: "Download",
  },
  {
    value: "showcase",
    label: "Showcase",
  },
  {
    value: "features",
    label: "Features",
  },
  {
    value: "cta",
    label: "CTA",
  },
];

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
   SECTION LABEL
====================================================== */

const SIMRS_SECTION_LABELS = {
  hero: {
    title: "Hero",
    description:
      "Integrated Healthcare Solutions dan pembuka utama halaman.",
  },

  intro: {
    title: "Intro / Penjelasan SIMRS",
    description:
      "Penjelasan utama mengenai SIMRS ERP Transmedic.",
  },

  "why-simrs": {
    title: "Mengapa SIMRS",
    description:
      "Enam alasan utama memilih SIMRS ERP Transmedic.",
  },

  benefits: {
    title: "Keunggulan",
    description:
      "Enam manfaat dan keunggulan implementasi SIMRS.",
  },

  "module-stats": {
    title: "Modul SIMRS",
    description:
      "Statistik 62 Modul Utama, 49 Modul Aplikasi dan 13 Modul Terintegrasi.",
  },

  catalog: {
    title: "Katalog Modul",
    description:
      "Section download katalog modul SIMRS ERP.",
  },

  standards: {
    title: "Standarisasi",
    description:
      "HL7 FHIR, SNOMED CT, ICD-9, ICD-10 dan ISO.",
  },

  integration: {
    title: "SATUSEHAT & BPJS",
    description:
      "Integrasi dengan SATUSEHAT Kemenkes dan BPJS Kesehatan.",
  },

  "ai-powered": {
    title: "AI-Powered Solutions",
    description:
      "Visual dan informasi solusi Artificial Intelligence.",
  },

  features: {
    title: "Fitur & Cakupan",
    description:
      "Menampilkan data dari service_features secara otomatis.",
  },

  cta: {
    title: "Call to Action",
    description:
      "Ajakan pengunjung untuk menghubungi Jasa Medika Transmedic.",
  },
};

/* ======================================================
   HELPERS
====================================================== */

function cleanText(value) {
  return String(value || "").trim();
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

function normalizeSection(
  section
) {
  if (!section) {
    return null;
  }

  return {
    ...section,

    section_key:
      cleanText(
        section.section_key
      ),

    section_type:
      cleanText(
        section.section_type
      ),

    eyebrow:
      cleanText(
        section.eyebrow
      ),

    title:
      cleanText(
        section.title
      ),

    description:
      cleanText(
        section.description
      ),

    image_url:
      cleanText(
        section.image_url
      ),

    file_url:
      cleanText(
        section.file_url
      ),

    button_label:
      cleanText(
        section.button_label
      ),

    button_url:
      cleanText(
        section.button_url
      ),

    sort_order:
      normalizeNumber(
        section.sort_order
      ),

    status:
      section.status ||
      "draft",

    items: [],
  };
}

function normalizeItem(item) {
  if (!item) {
    return null;
  }

  return {
    ...item,

    title:
      cleanText(
        item.title
      ),

    description:
      cleanText(
        item.description
      ),

    value:
      cleanText(
        item.value
      ),

    label:
      cleanText(
        item.label
      ),

    icon_name:
      cleanText(
        item.icon_name
      ),

    image_url:
      cleanText(
        item.image_url
      ),

    file_url:
      cleanText(
        item.file_url
      ),

    link_url:
      cleanText(
        item.link_url
      ),

    sort_order:
      normalizeNumber(
        item.sort_order
      ),

    status:
      item.status ||
      "draft",
  };
}

function getStatusClass(
  status
) {
  if (
    status === "published"
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (
    status === "archived"
  ) {
    return "border-slate-300 bg-slate-100 text-slate-600";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

function getStatusLabel(
  status
) {
  if (
    status === "published"
  ) {
    return "Published";
  }

  if (
    status === "archived"
  ) {
    return "Archived";
  }

  return "Draft";
}

function getSectionDefinition(
  section
) {
  return (
    SIMRS_SECTION_LABELS[
      section.section_key
    ] || {
      title:
        section.title ||
        section.section_key ||
        "Section",

      description:
        section.description ||
        "Section halaman Product.",
    }
  );
}

function supportsItems(
  sectionType
) {
  return [
    "icon_grid",
    "benefits",
    "stats",
  ].includes(
    sectionType
  );
}

function getSectionIcon(
  sectionType
) {
  switch (sectionType) {
    case "hero":
      return Sparkles;

    case "intro":
      return FileText;

    case "icon_grid":
      return Boxes;

    case "benefits":
      return ListChecks;

    case "stats":
      return BarChart3;

    case "download":
      return Download;

    case "showcase":
      return ImageIcon;

    case "features":
      return Layers3;

    default:
      return FileText;
  }
}

function getMediaState(
  section
) {
  if (
    section.section_type ===
    "download"
  ) {
    return {
      needed: true,

      available:
        Boolean(
          section.file_url
        ),

      label:
        section.file_url
          ? "PDF tersedia"
          : "PDF belum tersedia",
    };
  }

  if (
    [
      "hero",
      "stats",
      "showcase",
    ].includes(
      section.section_type
    )
  ) {
    return {
      needed: true,

      available:
        Boolean(
          section.image_url
        ),

      label:
        section.image_url
          ? "Gambar tersedia"
          : "Gambar belum tersedia",
    };
  }

  return {
    needed: false,
    available: true,
    label: "",
  };
}

/* ======================================================
   INITIAL FORM
====================================================== */

function createInitialSectionForm(
  sortOrder = 1
) {
  return {
    section_key: "",
    section_type: "intro",

    eyebrow: "",
    title: "",
    description: "",

    button_label: "",
    button_url: "",

    sort_order:
      sortOrder,

    status: "draft",
  };
}

function createInitialItemForm(
  sortOrder = 1
) {
  return {
    title: "",
    description: "",

    value: "",
    label: "",

    icon_name: "",
    link_url: "",

    sort_order:
      sortOrder,

    status: "draft",
  };
}

/* ======================================================
   MAIN
====================================================== */

export default function AdminServicePageContentSection({
  serviceId,
  serviceName = "",
  serviceSlug = "",
  onChangeTab,
}) {
  const {
    isAdmin,
    isContentManager,
  } = useAdminAuth();

  const [
    sections,
    setSections,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  /* ====================================================
     SECTION FORM STATE
  ==================================================== */

  const [
    sectionModalOpen,
    setSectionModalOpen,
  ] = useState(false);

  const [
    editingSectionId,
    setEditingSectionId,
  ] = useState("");

  const [
    sectionForm,
    setSectionForm,
  ] = useState(
    createInitialSectionForm()
  );

  const [
    savingSection,
    setSavingSection,
  ] = useState(false);

  /* ====================================================
     ITEM MODAL STATE
  ==================================================== */

  const [
    itemModalOpen,
    setItemModalOpen,
  ] = useState(false);

  const [
    activeItemSection,
    setActiveItemSection,
  ] = useState(null);

  const [
    itemFormOpen,
    setItemFormOpen,
  ] = useState(false);

  const [
    editingItemId,
    setEditingItemId,
  ] = useState("");

  const [
    itemForm,
    setItemForm,
  ] = useState(
    createInitialItemForm()
  );

  const [
    savingItem,
    setSavingItem,
  ] = useState(false);

  const [
    deletingId,
    setDeletingId,
  ] = useState("");

  /* ====================================================
     COLLAPSE
  ==================================================== */

  const [
    collapsed,
    setCollapsed,
  ] = useState({});

  /* ====================================================
     LOAD PAGE CONTENT
  ==================================================== */

  const loadContent =
    useCallback(async () => {
      if (!serviceId) {
        setSections([]);
        setLoading(false);

        return;
      }

      try {
        setLoading(true);

        setErrorMessage("");

        const {
          data:
            sectionRecords,
          error:
            sectionError,
        } =
          await supabase
            .from(
              SECTION_TABLE
            )
            .select("*")
            .eq(
              "service_id",
              serviceId
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
          (
            sectionRecords ||
            []
          )
            .map(
              normalizeSection
            )
            .filter(Boolean);

        const sectionIds =
          normalizedSections.map(
            (section) =>
              section.id
          );

        let itemRecords =
          [];

        if (
          sectionIds.length >
          0
        ) {
          const {
            data,
            error,
          } =
            await supabase
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

          if (error) {
            throw error;
          }

          itemRecords =
            data || [];
        }

        const normalizedItems =
          itemRecords
            .map(
              normalizeItem
            )
            .filter(Boolean);

        const finalSections =
          normalizedSections.map(
            (section) => ({
              ...section,

              items:
                normalizedItems
                  .filter(
                    (item) =>
                      item.section_id ===
                      section.id
                  )
                  .sort(
                    (
                      first,
                      second
                    ) =>
                      first.sort_order -
                      second.sort_order
                  ),
            })
          );

        setSections(
          finalSections
        );
      } catch (error) {
        console.error(
          "Konten halaman Product gagal dimuat:",
          error
        );

        setSections([]);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Konten halaman Product gagal dimuat."
        );
      } finally {
        setLoading(false);
      }
    }, [serviceId]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  /* ====================================================
     SUMMARY
  ==================================================== */

  const summary =
    useMemo(() => {
      const items =
        sections.flatMap(
          (section) =>
            section.items ||
            []
        );

      const missingMedia =
        sections.filter(
          (section) => {
            const media =
              getMediaState(
                section
              );

            return (
              media.needed &&
              !media.available
            );
          }
        ).length;

      return {
        total:
          sections.length,

        published:
          sections.filter(
            (section) =>
              section.status ===
              "published"
          ).length,

        draft:
          sections.filter(
            (section) =>
              section.status ===
              "draft"
          ).length,

        items:
          items.length,

        missingMedia,
      };
    }, [sections]);

  /* ====================================================
     NEXT ORDERS
  ==================================================== */

  function getNextSectionOrder() {
    return (
      sections.reduce(
        (
          highest,
          section
        ) =>
          Math.max(
            highest,
            Number(
              section.sort_order
            ) || 0
          ),
        0
      ) + 1
    );
  }

  function getNextItemOrder(
    section
  ) {
    return (
      (
        section?.items ||
        []
      ).reduce(
        (
          highest,
          item
        ) =>
          Math.max(
            highest,
            Number(
              item.sort_order
            ) || 0
          ),
        0
      ) + 1
    );
  }

  /* ====================================================
     SECTION FORM
  ==================================================== */

  function openCreateSection() {
    if (
      !isContentManager
    ) {
      return;
    }

    setEditingSectionId(
      ""
    );

    setSectionForm(
      createInitialSectionForm(
        getNextSectionOrder()
      )
    );

    setSectionModalOpen(
      true
    );

    setErrorMessage("");
  }

  function openEditSection(
    section
  ) {
    if (
      !isContentManager
    ) {
      return;
    }

    setEditingSectionId(
      section.id
    );

    setSectionForm({
      section_key:
        section.section_key,

      section_type:
        section.section_type,

      eyebrow:
        section.eyebrow ||
        "",

      title:
        section.title ||
        "",

      description:
        section.description ||
        "",

      button_label:
        section.button_label ||
        "",

      button_url:
        section.button_url ||
        "",

      sort_order:
        Number(
          section.sort_order
        ) || 0,

      status:
        section.status ||
        "draft",
    });

    setSectionModalOpen(
      true
    );

    setErrorMessage("");
  }

  function closeSectionModal() {
    if (savingSection) {
      return;
    }

    setSectionModalOpen(
      false
    );

    setEditingSectionId(
      ""
    );

    setSectionForm(
      createInitialSectionForm()
    );
  }

  function handleSectionInput(
    event
  ) {
    const {
      name,
      value,
    } =
      event.target;

    setSectionForm(
      (current) => ({
        ...current,

        [name]:
          value,
      })
    );
  }

  async function saveSection(
    event
  ) {
    event.preventDefault();

    if (
      savingSection ||
      !isContentManager
    ) {
      return;
    }

    if (
      !cleanText(
        sectionForm.section_key
      )
    ) {
      setErrorMessage(
        "Section Key wajib diisi."
      );

      return;
    }

    if (
      !cleanText(
        sectionForm.section_type
      )
    ) {
      setErrorMessage(
        "Section Type wajib dipilih."
      );

      return;
    }

    try {
      setSavingSection(true);

      setErrorMessage("");

      setSuccessMessage("");

      const payload = {
        service_id:
          serviceId,

        section_key:
          cleanText(
            sectionForm.section_key
          )
            .toLowerCase()
            .replace(
              /\s+/g,
              "-"
            ),

        section_type:
          sectionForm.section_type,

        eyebrow:
          cleanText(
            sectionForm.eyebrow
          ) || null,

        title:
          cleanText(
            sectionForm.title
          ) || null,

        description:
          cleanText(
            sectionForm.description
          ) || null,

        button_label:
          cleanText(
            sectionForm.button_label
          ) || null,

        button_url:
          cleanText(
            sectionForm.button_url
          ) || null,

        sort_order:
          normalizeNumber(
            sectionForm.sort_order
          ),

        status:
          sectionForm.status,

        metadata: {},
      };

      if (
        editingSectionId
      ) {
        const {
          error,
        } =
          await supabase
            .from(
              SECTION_TABLE
            )
            .update(payload)
            .eq(
              "id",
              editingSectionId
            );

        if (error) {
          throw error;
        }

        setSuccessMessage(
          "Section berhasil diperbarui."
        );
      } else {
        const {
          error,
        } =
          await supabase
            .from(
              SECTION_TABLE
            )
            .insert(payload);

        if (error) {
          throw error;
        }

        setSuccessMessage(
          "Section baru berhasil ditambahkan."
        );
      }

      closeSectionModal();

      await loadContent();
    } catch (error) {
      console.error(
        "Section gagal disimpan:",
        error
      );

      setErrorMessage(
        error?.code ===
          "23505"
          ? "Section Key tersebut sudah digunakan pada Product ini."
          : error instanceof
              Error
            ? error.message
            : "Section gagal disimpan."
      );
    } finally {
      setSavingSection(false);
    }
  }

  /* ====================================================
     DELETE SECTION
  ==================================================== */

  async function deleteSection(
    section
  ) {
    if (!isAdmin) {
      setErrorMessage(
        "Hanya Admin yang dapat menghapus Section."
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Hapus Section "${getSectionDefinition(section).title}"?\n\nSeluruh item di dalam Section ini juga akan terhapus.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(
        section.id
      );

      setErrorMessage("");

      const {
        error,
      } =
        await supabase
          .from(
            SECTION_TABLE
          )
          .delete()
          .eq(
            "id",
            section.id
          );

      if (error) {
        throw error;
      }

      setSuccessMessage(
        "Section berhasil dihapus."
      );

      await loadContent();
    } catch (error) {
      console.error(
        "Section gagal dihapus:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Section gagal dihapus."
      );
    } finally {
      setDeletingId("");
    }
  }

  /* ====================================================
     ITEM MANAGER
  ==================================================== */

  function openItemManager(
    section
  ) {
    setActiveItemSection(
      section
    );

    setItemModalOpen(
      true
    );

    setItemFormOpen(
      false
    );

    setEditingItemId(
      ""
    );
  }

  function closeItemManager() {
    if (savingItem) {
      return;
    }

    setItemModalOpen(
      false
    );

    setActiveItemSection(
      null
    );

    setItemFormOpen(
      false
    );

    setEditingItemId(
      ""
    );
  }

  function openCreateItem() {
    if (
      !activeItemSection ||
      !isContentManager
    ) {
      return;
    }

    setEditingItemId(
      ""
    );

    setItemForm(
      createInitialItemForm(
        getNextItemOrder(
          activeItemSection
        )
      )
    );

    setItemFormOpen(
      true
    );
  }

  function openEditItem(
    item
  ) {
    setEditingItemId(
      item.id
    );

    setItemForm({
      title:
        item.title ||
        "",

      description:
        item.description ||
        "",

      value:
        item.value ||
        "",

      label:
        item.label ||
        "",

      icon_name:
        item.icon_name ||
        "",

      link_url:
        item.link_url ||
        "",

      sort_order:
        Number(
          item.sort_order
        ) || 0,

      status:
        item.status ||
        "draft",
    });

    setItemFormOpen(
      true
    );
  }

  function cancelItemForm() {
    if (savingItem) {
      return;
    }

    setItemFormOpen(
      false
    );

    setEditingItemId(
      ""
    );

    setItemForm(
      createInitialItemForm()
    );
  }

  function handleItemInput(
    event
  ) {
    const {
      name,
      value,
    } =
      event.target;

    setItemForm(
      (current) => ({
        ...current,

        [name]:
          value,
      })
    );
  }

  async function saveItem(
    event
  ) {
    event.preventDefault();

    if (
      !activeItemSection ||
      !isContentManager ||
      savingItem
    ) {
      return;
    }

    if (
      !cleanText(
        itemForm.title
      ) &&
      !cleanText(
        itemForm.value
      )
    ) {
      setErrorMessage(
        "Isi Title atau Value terlebih dahulu."
      );

      return;
    }

    try {
      setSavingItem(true);

      setErrorMessage("");

      const payload = {
        section_id:
          activeItemSection.id,

        title:
          cleanText(
            itemForm.title
          ) || null,

        description:
          cleanText(
            itemForm.description
          ) || null,

        value:
          cleanText(
            itemForm.value
          ) || null,

        label:
          cleanText(
            itemForm.label
          ) || null,

        icon_name:
          cleanText(
            itemForm.icon_name
          ) || null,

        link_url:
          cleanText(
            itemForm.link_url
          ) || null,

        sort_order:
          normalizeNumber(
            itemForm.sort_order
          ),

        status:
          itemForm.status,
      };

      if (
        editingItemId
      ) {
        const {
          error,
        } =
          await supabase
            .from(
              ITEM_TABLE
            )
            .update(payload)
            .eq(
              "id",
              editingItemId
            );

        if (error) {
          throw error;
        }

        setSuccessMessage(
          "Item konten berhasil diperbarui."
        );
      } else {
        const {
          error,
        } =
          await supabase
            .from(
              ITEM_TABLE
            )
            .insert(payload);

        if (error) {
          throw error;
        }

        setSuccessMessage(
          "Item konten berhasil ditambahkan."
        );
      }

      await loadContent();

      /*
       * Sinkronkan section aktif dengan
       * hasil load terbaru.
       */

      const {
        data:
          refreshedItems,
        error:
          refreshError,
      } =
        await supabase
          .from(
            ITEM_TABLE
          )
          .select("*")
          .eq(
            "section_id",
            activeItemSection.id
          )
          .order(
            "sort_order",
            {
              ascending: true,
            }
          );

      if (!refreshError) {
        setActiveItemSection(
          (current) => ({
            ...current,

            items:
              (
                refreshedItems ||
                []
              )
                .map(
                  normalizeItem
                )
                .filter(Boolean),
          })
        );
      }

      cancelItemForm();
    } catch (error) {
      console.error(
        "Item gagal disimpan:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Item konten gagal disimpan."
      );
    } finally {
      setSavingItem(false);
    }
  }

  async function deleteItem(
    item
  ) {
    if (!isAdmin) {
      setErrorMessage(
        "Hanya Admin yang dapat menghapus item."
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Hapus item "${item.title || item.label || item.value}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(
        item.id
      );

      const {
        error,
      } =
        await supabase
          .from(
            ITEM_TABLE
          )
          .delete()
          .eq(
            "id",
            item.id
          );

      if (error) {
        throw error;
      }

      setActiveItemSection(
        (current) => ({
          ...current,

          items:
            (
              current?.items ||
              []
            ).filter(
              (currentItem) =>
                currentItem.id !==
                item.id
            ),
        })
      );

      setSuccessMessage(
        "Item berhasil dihapus."
      );

      await loadContent();
    } catch (error) {
      console.error(
        "Item gagal dihapus:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Item gagal dihapus."
      );
    } finally {
      setDeletingId("");
    }
  }

  /* ====================================================
     COLLAPSE
  ==================================================== */

  function toggleCollapse(
    sectionId
  ) {
    setCollapsed(
      (current) => ({
        ...current,

        [sectionId]:
          !current[
            sectionId
          ],
      })
    );
  }

  /* ====================================================
     LOADING
  ==================================================== */

  if (loading) {
    return (
      <section className="flex min-h-[420px] items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="text-center">
          <LoaderCircle
            size={40}
            className="mx-auto animate-spin text-[#FF5A0A]"
          />

          <p className="mt-4 font-semibold text-[#082B3A]">
            Memuat Konten Halaman...
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Mengambil Page Builder dari Supabase.
          </p>
        </div>
      </section>
    );
  }

  /* ====================================================
     RENDER
  ==================================================== */

  return (
    <>
      <div className="space-y-6">
        {/* ==================================================
            HEADER
        ================================================== */}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#FF5A0A]">
                <FileText
                  size={14}
                />

                Page Builder
              </div>

              <h2 className="mt-4 text-2xl font-bold text-[#082B3A]">
                Konten Halaman Product
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">
                Atur urutan, teks, item, dan struktur halaman{" "}
                <span className="font-semibold text-[#082B3A]">
                  {serviceName ||
                    "Product ini"}
                </span>
                .
              </p>

              {serviceSlug ===
                "simrs-erp" && (
                <p className="mt-3 text-xs leading-6 text-slate-400">
                  Struktur SIMRS mengikuti urutan Hero → Intro → Mengapa SIMRS
                  → Keunggulan → Statistik Modul → Katalog → Standarisasi →
                  SATUSEHAT/BPJS → AI-Powered → Fitur & Cakupan.
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={
                  loadContent
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
                    openCreateSection
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-[#FF5A0A] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#E94F00]"
                >
                  <Plus
                    size={17}
                  />

                  Tambah Section
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ==================================================
            MESSAGES
        ================================================== */}

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
                  {successMessage}
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

        {/* ==================================================
            SUMMARY
        ================================================== */}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <article className="rounded-2xl bg-[#082B3A] p-5 text-white">
            <Layers3
              size={20}
              className="text-orange-300"
            />

            <p className="mt-4 text-3xl font-bold">
              {summary.total}
            </p>

            <p className="mt-1 text-sm text-white/55">
              Total Section
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
            <FileText
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

          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <ListChecks
              size={20}
              className="text-blue-600"
            />

            <p className="mt-4 text-3xl font-bold text-[#082B3A]">
              {summary.items}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Item Konten
            </p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-5">
            <ImageIcon
              size={20}
              className={
                summary.missingMedia >
                0
                  ? "text-amber-600"
                  : "text-emerald-600"
              }
            />

            <p className="mt-4 text-3xl font-bold text-[#082B3A]">
              {
                summary.missingMedia
              }
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Media Belum Ada
            </p>
          </article>
        </section>

        {/* ==================================================
            PAGE BUILDER
        ================================================== */}

        {sections.length ===
        0 ? (
          <section className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <FileText
              size={46}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-5 text-xl font-bold text-[#082B3A]">
              Section halaman belum tersedia
            </h3>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-slate-500">
              Tambahkan Section untuk mulai membangun halaman Product.
            </p>
          </section>
        ) : (
          <section className="space-y-4">
            {sections.map(
              (
                section,
                index
              ) => {
                const definition =
                  getSectionDefinition(
                    section
                  );

                const Icon =
                  getSectionIcon(
                    section.section_type
                  );

                const media =
                  getMediaState(
                    section
                  );

                const isCollapsed =
                  Boolean(
                    collapsed[
                      section.id
                    ]
                  );

                return (
                  <article
                    key={
                      section.id
                    }
                    className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                  >
                    {/* ====================================
                        SECTION TOP
                    ==================================== */}

                    <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[80px_minmax(0,1fr)_auto] lg:items-start">
                      {/* NUMBER */}

                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#082B3A] text-xl font-bold text-white">
                        {String(
                          index + 1
                        ).padStart(
                          2,
                          "0"
                        )}
                      </div>

                      {/* MAIN */}

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#FF5A0A]">
                            {
                              section.section_type
                            }
                          </span>

                          <span
                            className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${getStatusClass(
                              section.status
                            )}`}
                          >
                            {getStatusLabel(
                              section.status
                            )}
                          </span>

                          {media.needed && (
                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                                media.available
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {
                                media.label
                              }
                            </span>
                          )}
                        </div>

                        <div className="mt-4 flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[#082B3A]">
                            <Icon
                              size={18}
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#FF5A0A]">
                              {definition.title}
                            </p>

                            <h3 className="mt-1 text-lg font-bold leading-7 text-[#082B3A]">
                              {section.title ||
                                definition.title}
                            </h3>

                            <p className="mt-2 text-xs leading-6 text-slate-500">
                              {
                                definition.description
                              }
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* ACTION */}

                      <div className="flex flex-wrap gap-2 lg:justify-end">
                        {supportsItems(
                          section.section_type
                        ) && (
                          <button
                            type="button"
                            onClick={() =>
                              openItemManager(
                                section
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-[#FF5A0A] hover:text-[#FF5A0A]"
                          >
                            <ListChecks
                              size={14}
                            />

                            Kelola{" "}
                            {
                              section.items
                                .length
                            }{" "}
                            Item
                          </button>
                        )}

                        {section.section_key ===
                          "features" &&
                          onChangeTab && (
                            <button
                              type="button"
                              onClick={() =>
                                onChangeTab(
                                  "fitur"
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-[#FF5A0A] hover:text-[#FF5A0A]"
                            >
                              <Layers3
                                size={14}
                              />

                              Kelola Fitur
                            </button>
                          )}

                        {media.needed &&
                          onChangeTab && (
                            <button
                              type="button"
                              onClick={() =>
                                onChangeTab(
                                  "media"
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-[#FF5A0A] hover:text-[#FF5A0A]"
                            >
                              <ImageIcon
                                size={14}
                              />

                              Media
                            </button>
                          )}

                        {isContentManager && (
                          <button
                            type="button"
                            onClick={() =>
                              openEditSection(
                                section
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-xl bg-[#082B3A] px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-[#0A4053]"
                          >
                            <Edit3
                              size={14}
                            />

                            Edit
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            toggleCollapse(
                              section.id
                            )
                          }
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500"
                        >
                          {isCollapsed ? (
                            <ChevronDown
                              size={16}
                            />
                          ) : (
                            <ChevronUp
                              size={16}
                            />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* ====================================
                        SECTION DETAIL
                    ==================================== */}

                    {!isCollapsed && (
                      <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-5 sm:px-6">
                        <div className="grid gap-5 lg:grid-cols-3">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Eyebrow
                            </p>

                            <p className="mt-2 text-sm font-semibold text-[#082B3A]">
                              {section.eyebrow ||
                                "—"}
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Section Key
                            </p>

                            <p className="mt-2 break-all text-sm font-semibold text-[#082B3A]">
                              {
                                section.section_key
                              }
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Urutan
                            </p>

                            <p className="mt-2 text-sm font-semibold text-[#082B3A]">
                              {
                                section.sort_order
                              }
                            </p>
                          </div>
                        </div>

                        {section.description && (
                          <div className="mt-5">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Description
                            </p>

                            <p className="mt-2 max-w-4xl whitespace-pre-line text-sm leading-7 text-slate-600">
                              {
                                section.description
                              }
                            </p>
                          </div>
                        )}

                        {supportsItems(
                          section.section_type
                        ) &&
                          section.items
                            .length >
                            0 && (
                            <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                              {section.items
                                .slice(
                                  0,
                                  6
                                )
                                .map(
                                  (
                                    item
                                  ) => (
                                    <div
                                      key={
                                        item.id
                                      }
                                      className="rounded-xl border border-slate-200 bg-white px-3 py-3"
                                    >
                                      <p className="truncate text-xs font-semibold text-[#082B3A]">
                                        {item.value
                                          ? `${item.value} ${item.label || ""}`
                                          : item.title ||
                                            "Item"}
                                      </p>
                                    </div>
                                  )
                                )}
                            </div>
                          )}

                        {isAdmin && (
                          <div className="mt-5 border-t border-slate-200 pt-4">
                            <button
                              type="button"
                              onClick={() =>
                                deleteSection(
                                  section
                                )
                              }
                              disabled={
                                deletingId ===
                                section.id
                              }
                              className="inline-flex items-center gap-2 text-xs font-semibold text-red-500 transition hover:text-red-700 disabled:opacity-50"
                            >
                              {deletingId ===
                              section.id ? (
                                <LoaderCircle
                                  size={14}
                                  className="animate-spin"
                                />
                              ) : (
                                <Trash2
                                  size={14}
                                />
                              )}

                              Hapus Section
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              }
            )}
          </section>
        )}

        {/* ==================================================
            NOTE
        ================================================== */}

        <div className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4">
          <p className="text-sm font-semibold text-blue-800">
            Status Draft saat ini memang dipertahankan
          </p>

          <p className="mt-1 text-xs leading-6 text-blue-700">
            Lengkapi konten dan media terlebih dahulu. Publikasi seluruh
            halaman akan dilakukan melalui tab Publikasi setelah Preview
            dinyatakan sesuai.
          </p>
        </div>
      </div>

      {/* ==================================================
          SECTION MODAL
      ================================================== */}

      {sectionModalOpen && (
        <div className="fixed inset-0 z-[110] overflow-y-auto bg-[#082B3A]/80 px-4 py-6 backdrop-blur-sm">
          <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-5 border-b border-slate-100 px-6 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#FF5A0A]">
                  Page Builder
                </p>

                <h2 className="mt-2 text-2xl font-bold text-[#082B3A]">
                  {editingSectionId
                    ? "Edit Section"
                    : "Tambah Section"}
                </h2>
              </div>

              <button
                type="button"
                onClick={
                  closeSectionModal
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500"
              >
                <X
                  size={18}
                />
              </button>
            </div>

            <form
              onSubmit={
                saveSection
              }
            >
              <div className="space-y-5 p-6">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#082B3A]">
                      Section Key *
                    </label>

                    <input
                      type="text"
                      name="section_key"
                      value={
                        sectionForm.section_key
                      }
                      onChange={
                        handleSectionInput
                      }
                      disabled={
                        Boolean(
                          editingSectionId
                        )
                      }
                      required
                      placeholder="contoh: standards"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#FF5A0A] disabled:bg-slate-100 disabled:text-slate-500"
                    />

                    {editingSectionId && (
                      <p className="mt-2 text-xs text-slate-400">
                        Section Key tidak diubah setelah Section dibuat.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#082B3A]">
                      Section Type *
                    </label>

                    <select
                      name="section_type"
                      value={
                        sectionForm.section_type
                      }
                      onChange={
                        handleSectionInput
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#FF5A0A]"
                    >
                      {SECTION_TYPE_OPTIONS.map(
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

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#082B3A]">
                    Eyebrow
                  </label>

                  <input
                    type="text"
                    name="eyebrow"
                    value={
                      sectionForm.eyebrow
                    }
                    onChange={
                      handleSectionInput
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#FF5A0A]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#082B3A]">
                    Judul
                  </label>

                  <input
                    type="text"
                    name="title"
                    value={
                      sectionForm.title
                    }
                    onChange={
                      handleSectionInput
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#FF5A0A]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#082B3A]">
                    Deskripsi
                  </label>

                  <textarea
                    name="description"
                    value={
                      sectionForm.description
                    }
                    onChange={
                      handleSectionInput
                    }
                    rows={7}
                    className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-7 outline-none focus:border-[#FF5A0A]"
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#082B3A]">
                      Button Label
                    </label>

                    <input
                      type="text"
                      name="button_label"
                      value={
                        sectionForm.button_label
                      }
                      onChange={
                        handleSectionInput
                      }
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#FF5A0A]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#082B3A]">
                      Button URL
                    </label>

                    <input
                      type="text"
                      name="button_url"
                      value={
                        sectionForm.button_url
                      }
                      onChange={
                        handleSectionInput
                      }
                      placeholder="/contact"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#FF5A0A]"
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#082B3A]">
                      Urutan
                    </label>

                    <input
                      type="number"
                      name="sort_order"
                      min="0"
                      value={
                        sectionForm.sort_order
                      }
                      onChange={
                        handleSectionInput
                      }
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#FF5A0A]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#082B3A]">
                      Status
                    </label>

                    <select
                      name="status"
                      value={
                        sectionForm.status
                      }
                      onChange={
                        handleSectionInput
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#FF5A0A]"
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

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={
                    closeSectionModal
                  }
                  disabled={
                    savingSection
                  }
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={
                    savingSection
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF5A0A] px-6 py-3 text-sm font-bold text-white disabled:opacity-50"
                >
                  {savingSection ? (
                    <>
                      <LoaderCircle
                        size={16}
                        className="animate-spin"
                      />

                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save
                        size={16}
                      />

                      Simpan Section
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================
          ITEM MANAGER
      ================================================== */}

      {itemModalOpen &&
        activeItemSection && (
          <div className="fixed inset-0 z-[120] overflow-y-auto bg-[#082B3A]/80 px-4 py-6 backdrop-blur-sm">
            <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl">
              {/* HEADER */}

              <div className="flex items-start justify-between gap-5 border-b border-slate-100 px-6 py-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#FF5A0A]">
                    Section Items
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-[#082B3A]">
                    {getSectionDefinition(
                      activeItemSection
                    ).title}
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    {
                      activeItemSection.items
                        ?.length
                    }{" "}
                    item tersedia
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    closeItemManager
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500"
                >
                  <X
                    size={18}
                  />
                </button>
              </div>

              <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_380px]">
                {/* LIST */}

                <div className="border-b border-slate-100 p-5 lg:border-b-0 lg:border-r lg:p-6">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-bold text-[#082B3A]">
                      Daftar Item
                    </h3>

                    {isContentManager && (
                      <button
                        type="button"
                        onClick={
                          openCreateItem
                        }
                        className="inline-flex items-center gap-2 rounded-xl bg-[#082B3A] px-4 py-2.5 text-xs font-semibold text-white"
                      >
                        <Plus
                          size={14}
                        />

                        Tambah Item
                      </button>
                    )}
                  </div>

                  <div className="mt-5 space-y-3">
                    {(
                      activeItemSection.items ||
                      []
                    ).length ===
                    0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center">
                        <ListChecks
                          size={36}
                          className="mx-auto text-slate-300"
                        />

                        <p className="mt-3 text-sm font-semibold text-slate-500">
                          Belum ada item
                        </p>
                      </div>
                    ) : (
                      activeItemSection.items.map(
                        (
                          item
                        ) => (
                          <article
                            key={
                              item.id
                            }
                            className="rounded-2xl border border-slate-200 p-4"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-bold text-slate-500">
                                    #{item.sort_order}
                                  </span>

                                  <span
                                    className={`rounded-full border px-2 py-1 text-[9px] font-bold ${getStatusClass(
                                      item.status
                                    )}`}
                                  >
                                    {getStatusLabel(
                                      item.status
                                    )}
                                  </span>
                                </div>

                                <h4 className="mt-3 font-bold leading-6 text-[#082B3A]">
                                  {item.title ||
                                    item.label ||
                                    item.value ||
                                    "Item"}
                                </h4>

                                {item.value && (
                                  <p className="mt-1 text-2xl font-bold text-[#FF5A0A]">
                                    {item.value}
                                  </p>
                                )}

                                {item.description && (
                                  <p className="mt-2 text-xs leading-6 text-slate-500">
                                    {
                                      item.description
                                    }
                                  </p>
                                )}
                              </div>

                              <div className="flex gap-2">
                                {isContentManager && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openEditItem(
                                        item
                                      )
                                    }
                                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:text-[#FF5A0A]"
                                  >
                                    <Edit3
                                      size={14}
                                    />
                                  </button>
                                )}

                                {isAdmin && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      deleteItem(
                                        item
                                      )
                                    }
                                    disabled={
                                      deletingId ===
                                      item.id
                                    }
                                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 text-red-500"
                                  >
                                    {deletingId ===
                                    item.id ? (
                                      <LoaderCircle
                                        size={14}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <Trash2
                                        size={14}
                                      />
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          </article>
                        )
                      )
                    )}
                  </div>
                </div>

                {/* ITEM FORM */}

                <div className="bg-slate-50 p-5 lg:p-6">
                  {!itemFormOpen ? (
                    <div className="flex min-h-[350px] items-center justify-center text-center">
                      <div>
                        <ListChecks
                          size={40}
                          className="mx-auto text-slate-300"
                        />

                        <p className="mt-4 font-semibold text-[#082B3A]">
                          Pilih atau tambah item
                        </p>

                        <p className="mt-2 text-xs leading-6 text-slate-500">
                          Item digunakan untuk kartu Mengapa SIMRS,
                          Keunggulan, dan statistik modul.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <form
                      onSubmit={
                        saveItem
                      }
                      className="space-y-4"
                    >
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#FF5A0A]">
                          {editingItemId
                            ? "Edit Item"
                            : "Tambah Item"}
                        </p>

                        <h3 className="mt-1 font-bold text-[#082B3A]">
                          Konten Item
                        </h3>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-[#082B3A]">
                          Title
                        </label>

                        <input
                          type="text"
                          name="title"
                          value={
                            itemForm.title
                          }
                          onChange={
                            handleItemInput
                          }
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#FF5A0A]"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-[#082B3A]">
                          Description
                        </label>

                        <textarea
                          name="description"
                          value={
                            itemForm.description
                          }
                          onChange={
                            handleItemInput
                          }
                          rows={4}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm leading-6 outline-none focus:border-[#FF5A0A]"
                        />
                      </div>

                      {activeItemSection.section_type ===
                        "stats" && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="mb-1.5 block text-xs font-semibold text-[#082B3A]">
                              Value
                            </label>

                            <input
                              type="text"
                              name="value"
                              value={
                                itemForm.value
                              }
                              onChange={
                                handleItemInput
                              }
                              placeholder="62"
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#FF5A0A]"
                            />
                          </div>

                          <div>
                            <label className="mb-1.5 block text-xs font-semibold text-[#082B3A]">
                              Label
                            </label>

                            <input
                              type="text"
                              name="label"
                              value={
                                itemForm.label
                              }
                              onChange={
                                handleItemInput
                              }
                              placeholder="Modul Utama"
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#FF5A0A]"
                            />
                          </div>
                        </div>
                      )}

                      {activeItemSection.section_type ===
                        "icon_grid" && (
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-[#082B3A]">
                            Icon Name
                          </label>

                          <input
                            type="text"
                            name="icon_name"
                            value={
                              itemForm.icon_name
                            }
                            onChange={
                              handleItemInput
                            }
                            placeholder="brain, network, shield..."
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#FF5A0A]"
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-[#082B3A]">
                            Urutan
                          </label>

                          <input
                            type="number"
                            min="0"
                            name="sort_order"
                            value={
                              itemForm.sort_order
                            }
                            onChange={
                              handleItemInput
                            }
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#FF5A0A]"
                          />
                        </div>

                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-[#082B3A]">
                            Status
                          </label>

                          <select
                            name="status"
                            value={
                              itemForm.status
                            }
                            onChange={
                              handleItemInput
                            }
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#FF5A0A]"
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

                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          onClick={
                            cancelItemForm
                          }
                          className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600"
                        >
                          Batal
                        </button>

                        <button
                          type="submit"
                          disabled={
                            savingItem
                          }
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#FF5A0A] px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
                        >
                          {savingItem ? (
                            <LoaderCircle
                              size={15}
                              className="animate-spin"
                            />
                          ) : (
                            <Save
                              size={15}
                            />
                          )}

                          Simpan
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
    </>
  );
}