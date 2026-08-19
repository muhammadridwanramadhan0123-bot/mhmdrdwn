import {
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle2,
  Cpu,
  Database,
  Download,
  FileText,
  HeartPulse,
  Layers3,
  Network,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Link } from "react-router-dom";

/* ======================================================
   ICON MAP
====================================================== */

const ICON_MAP = {
  heart:
    HeartPulse,

  "heart-pulse":
    HeartPulse,

  ai:
    Brain,

  brain:
    Brain,

  network:
    Network,

  integration:
    Network,

  layers:
    Layers3,

  analytics:
    BarChart3,

  chart:
    BarChart3,

  security:
    ShieldCheck,

  shield:
    ShieldCheck,

  database:
    Database,

  cpu:
    Cpu,

  check:
    CheckCircle2,

  sparkles:
    Sparkles,
};

/* ======================================================
   HELPERS
====================================================== */

function cleanText(value) {
  return String(
    value || ""
  ).trim();
}

function getIcon(iconName) {
  const key =
    cleanText(iconName)
      .toLowerCase();

  return (
    ICON_MAP[key] ||
    Sparkles
  );
}

function getStatusClass(status) {
  if (
    status ===
    "published"
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (
    status ===
    "archived"
  ) {
    return "border-slate-300 bg-slate-100 text-slate-600";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

/* ======================================================
   PREVIEW BADGE
====================================================== */

function PreviewStatusBadge({
  status,
}) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${getStatusClass(
        status
      )}`}
    >
      {status || "draft"}
    </span>
  );
}

/* ======================================================
   SECTION HEADER
====================================================== */

function SectionHeader({
  eyebrow,
  title,
  description,
  centered = false,
}) {
  return (
    <div
      className={
        centered
          ? "mx-auto max-w-3xl text-center"
          : "max-w-3xl"
      }
    >
      {eyebrow && (
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#FF5A0A]">
          {eyebrow}
        </p>
      )}

      {title && (
        <h2 className="mt-3 text-3xl font-bold leading-tight text-[#082B3A] md:text-4xl">
          {title}
        </h2>
      )}

      {description && (
        <p className="mt-5 whitespace-pre-line text-sm leading-8 text-slate-600 md:text-base">
          {description}
        </p>
      )}
    </div>
  );
}

/* ======================================================
   FEATURE GROUPING
====================================================== */

function createFeatureGroups(
  features = []
) {
  const records =
    Array.isArray(features)
      ? features
      : [];

  const roots =
    records.filter(
      (feature) =>
        !feature.parent_feature_id
    );

  const children =
    records.filter(
      (feature) =>
        Boolean(
          feature.parent_feature_id
        )
    );

  const rootsWithChildren =
    roots.map(
      (root) => ({
        ...root,

        children:
          children
            .filter(
              (child) =>
                child.parent_feature_id ===
                root.id
            )
            .sort(
              (
                first,
                second
              ) =>
                Number(
                  first.sort_order ||
                    0
                ) -
                Number(
                  second.sort_order ||
                    0
                )
            ),
      })
    );

  const groupMap =
    new Map();

  rootsWithChildren.forEach(
    (feature) => {
      const groupName =
        cleanText(
          feature.group_name
        );

      const groupOrder =
        Number(
          feature.group_order ||
            0
        );

      const key =
        `${groupOrder}::${groupName}`;

      if (
        !groupMap.has(key)
      ) {
        groupMap.set(
          key,
          {
            name:
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
          feature
        );
    }
  );

  return Array.from(
    groupMap.values()
  )
    .map((group) => ({
      ...group,

      features:
        group.features.sort(
          (
            first,
            second
          ) =>
            Number(
              first.sort_order ||
                0
            ) -
            Number(
              second.sort_order ||
                0
            )
        ),
    }))
    .sort(
      (
        first,
        second
      ) =>
        first.order -
        second.order
    );
}

/* ======================================================
   HERO
====================================================== */

function HeroSection({
  section,
  service,
  previewMode,
}) {
  const imageUrl =
    section.image_url ||
    service?.image_url ||
    "";

  const title =
    section.title ||
    service?.name ||
    "";

  const description =
    section.description ||
    service?.short_description ||
    "";

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="container-jmt">
        {previewMode && (
          <div className="mb-4">
            <PreviewStatusBadge
              status={
                section.status
              }
            />
          </div>
        )}

        <div className="relative overflow-hidden rounded-[32px] bg-[#082B3A] px-6 py-8 text-white shadow-xl md:px-10 md:py-12 lg:px-14 lg:py-14">
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#FF5A0A]/20 blur-3xl" />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr]">
            <div>
              {section.eyebrow && (
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-300">
                  {
                    section.eyebrow
                  }
                </p>
              )}

              <h1 className="mt-4 max-w-4xl text-3xl font-bold leading-[1.15] md:text-4xl lg:text-5xl">
                {title}
              </h1>

              {description && (
                <p className="mt-6 max-w-2xl whitespace-pre-line text-sm leading-8 text-white/70 md:text-base">
                  {description}
                </p>
              )}

              {section.button_label &&
                section.button_url && (
                  <Link
                    to={
                      section.button_url
                    }
                    className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#FF5A0A] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#E94F00]"
                  >
                    {
                      section.button_label
                    }

                    <ArrowRight
                      size={17}
                    />
                  </Link>
                )}
            </div>

            {imageUrl ? (
              <div className="overflow-hidden rounded-[26px] border border-white/10 bg-white/5 p-2 shadow-2xl">
                <img
                  src={
                    imageUrl
                  }
                  alt={
                    title
                  }
                  className="aspect-[4/3] w-full rounded-[20px] object-cover"
                />
              </div>
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center rounded-[26px] border border-white/10 bg-white/5">
                <HeartPulse
                  size={72}
                  className="text-white/20"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ======================================================
   INTRO
====================================================== */

function IntroSection({
  section,
  previewMode,
}) {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="container-jmt">
        <div className="mx-auto max-w-5xl">
          {previewMode && (
            <div className="mb-5">
              <PreviewStatusBadge
                status={
                  section.status
                }
              />
            </div>
          )}

          <SectionHeader
            eyebrow={
              section.eyebrow
            }
            title={
              section.title
            }
            description={
              section.description
            }
          />

          {section.image_url && (
            <div className="mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-2">
              <img
                src={
                  section.image_url
                }
                alt={
                  section.title ||
                  "Product"
                }
                className="max-h-[620px] w-full rounded-[20px] object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ======================================================
   ICON GRID
====================================================== */

function IconGridSection({
  section,
  previewMode,
}) {
  const items =
    Array.isArray(
      section.items
    )
      ? section.items
      : [];

  return (
    <section className="bg-slate-50 py-16 md:py-20">
      <div className="container-jmt">
        {previewMode && (
          <div className="mb-5">
            <PreviewStatusBadge
              status={
                section.status
              }
            />
          </div>
        )}

        <SectionHeader
          eyebrow={
            section.eyebrow
          }
          title={
            section.title
          }
          description={
            section.description
          }
          centered
        />

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map(
            (
              item,
              index
            ) => {
              const Icon =
                getIcon(
                  item.icon_name
                );

              return (
                <article
                  key={
                    item.id ||
                    `${item.title}-${index}`
                  }
                  className="rounded-3xl border border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl hover:shadow-slate-900/5"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-[#FF5A0A]">
                    <Icon
                      size={23}
                    />
                  </div>

                  <h3 className="mt-5 text-lg font-bold leading-7 text-[#082B3A]">
                    {
                      item.title
                    }
                  </h3>

                  {item.description && (
                    <p className="mt-3 text-sm leading-7 text-slate-500">
                      {
                        item.description
                      }
                    </p>
                  )}

                  {previewMode && (
                    <div className="mt-4">
                      <PreviewStatusBadge
                        status={
                          item.status
                        }
                      />
                    </div>
                  )}
                </article>
              );
            }
          )}
        </div>
      </div>
    </section>
  );
}

/* ======================================================
   BENEFITS
====================================================== */

function BenefitsSection({
  section,
  previewMode,
}) {
  const items =
    Array.isArray(
      section.items
    )
      ? section.items
      : [];

  return (
    <section className="bg-white py-16 md:py-20">
      <div className="container-jmt">
        {previewMode && (
          <div className="mb-5">
            <PreviewStatusBadge
              status={
                section.status
              }
            />
          </div>
        )}

        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <SectionHeader
            eyebrow={
              section.eyebrow
            }
            title={
              section.title
            }
            description={
              section.description
            }
          />

          <div className="grid gap-4 sm:grid-cols-2">
            {items.map(
              (
                item,
                index
              ) => (
                <article
                  key={
                    item.id ||
                    `${item.title}-${index}`
                  }
                  className="rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <CheckCircle2
                        size={17}
                      />
                    </div>

                    <div>
                      <h3 className="font-bold leading-6 text-[#082B3A]">
                        {
                          item.title
                        }
                      </h3>

                      {item.description && (
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {
                            item.description
                          }
                        </p>
                      )}

                      {previewMode && (
                        <div className="mt-3">
                          <PreviewStatusBadge
                            status={
                              item.status
                            }
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ======================================================
   STATS
====================================================== */

function StatsSection({
  section,
  previewMode,
}) {
  const items =
    Array.isArray(
      section.items
    )
      ? section.items
      : [];

  return (
    <section className="bg-[#082B3A] py-16 text-white md:py-20">
      <div className="container-jmt">
        {previewMode && (
          <div className="mb-5">
            <PreviewStatusBadge
              status={
                section.status
              }
            />
          </div>
        )}

        <div className="mx-auto max-w-4xl text-center">
          {section.eyebrow && (
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-300">
              {
                section.eyebrow
              }
            </p>
          )}

          {section.title && (
            <h2 className="mt-3 text-3xl font-bold leading-tight md:text-4xl">
              {
                section.title
              }
            </h2>
          )}

          {section.description && (
            <p className="mt-4 text-sm leading-7 text-white/60">
              {
                section.description
              }
            </p>
          )}
        </div>

        {section.image_url && (
          <div className="mx-auto mt-10 max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-2">
            <img
              src={
                section.image_url
              }
              alt={
                section.title ||
                "SIMRS modules"
              }
              className="w-full rounded-[20px] object-cover"
            />
          </div>
        )}

        <div className="mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-3">
          {items.map(
            (
              item,
              index
            ) => (
              <article
                key={
                  item.id ||
                  index
                }
                className="rounded-3xl border border-white/10 bg-white/5 p-7 text-center"
              >
                <p className="text-5xl font-bold text-[#FF5A0A]">
                  {
                    item.value ||
                    item.title
                  }
                </p>

                <p className="mt-3 text-sm font-semibold text-white/75">
                  {
                    item.label ||
                    item.title
                  }
                </p>

                {previewMode && (
                  <div className="mt-4 flex justify-center">
                    <PreviewStatusBadge
                      status={
                        item.status
                      }
                    />
                  </div>
                )}
              </article>
            )
          )}
        </div>
      </div>
    </section>
  );
}

/* ======================================================
   DOWNLOAD
====================================================== */

function DownloadSection({
  section,
  previewMode,
}) {
  return (
    <section className="bg-slate-50 py-16 md:py-20">
      <div className="container-jmt">
        {previewMode && (
          <div className="mb-5">
            <PreviewStatusBadge
              status={
                section.status
              }
            />
          </div>
        )}

        <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm md:p-9">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
            <div className="flex max-w-3xl items-start gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-[#FF5A0A]">
                <FileText
                  size={26}
                />
              </div>

              <div>
                {section.eyebrow && (
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#FF5A0A]">
                    {
                      section.eyebrow
                    }
                  </p>
                )}

                <h2 className="mt-2 text-2xl font-bold text-[#082B3A]">
                  {
                    section.title
                  }
                </h2>

                {section.description && (
                  <p className="mt-3 text-sm leading-7 text-slate-500">
                    {
                      section.description
                    }
                  </p>
                )}
              </div>
            </div>

            {section.file_url ? (
              <a
                href={
                  section.file_url
                }
                target="_blank"
                rel="noreferrer"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#FF5A0A] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#E94F00]"
              >
                <Download
                  size={17}
                />

                {section.button_label ||
                  "Unduh PDF"}
              </a>
            ) : (
              previewMode && (
                <span className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-700">
                  PDF belum diupload
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ======================================================
   SHOWCASE
====================================================== */

function ShowcaseSection({
  section,
  previewMode,
  reversed = false,
}) {
  return (
    <section className="bg-white py-14 md:py-18">
      <div className="container-jmt">
        {previewMode && (
          <div className="mb-5">
            <PreviewStatusBadge
              status={
                section.status
              }
            />
          </div>
        )}

        <div
          className={`grid items-center gap-10 lg:grid-cols-2 ${
            reversed
              ? "lg:[&>*:first-child]:order-2"
              : ""
          }`}
        >
          <div>
            <SectionHeader
              eyebrow={
                section.eyebrow
              }
              title={
                section.title
              }
              description={
                section.description
              }
            />

            {section.button_label &&
              section.button_url && (
                <Link
                  to={
                    section.button_url
                  }
                  className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#FF5A0A]"
                >
                  {
                    section.button_label
                  }

                  <ArrowRight
                    size={16}
                  />
                </Link>
              )}
          </div>

          {section.image_url ? (
            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50 p-2">
              <img
                src={
                  section.image_url
                }
                alt={
                  section.title ||
                  "Showcase"
                }
                className="aspect-[4/3] w-full rounded-[21px] object-cover"
              />
            </div>
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-slate-50">
              <div className="text-center">
                <Sparkles
                  size={45}
                  className="mx-auto text-slate-300"
                />

                <p className="mt-3 text-sm font-semibold text-slate-400">
                  Visual belum tersedia
                </p>

                {previewMode && (
                  <p className="mt-1 text-xs text-slate-400">
                    Upload gambar melalui Admin.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ======================================================
   FEATURES
====================================================== */

function FeaturesSection({
  section,
  service,
  features,
  previewMode,
}) {
  const groups =
    createFeatureGroups(
      features
    );

  return (
    <section className="bg-slate-50 py-16 md:py-20">
      <div className="container-jmt">
        {previewMode && (
          <div className="mb-5">
            <PreviewStatusBadge
              status={
                section.status
              }
            />
          </div>
        )}

        <SectionHeader
          eyebrow={
            section.eyebrow
          }
          title={
            section.title ||
            "Fitur & Cakupan"
          }
          description={
            section.description
          }
        />

        <div className="mt-10 space-y-10">
          {groups.map(
            (
              group,
              groupIndex
            ) => (
              <div
                key={`${group.order}-${group.name}-${groupIndex}`}
              >
                {group.name && (
                  <div className="mb-5 flex items-center gap-4">
                    <div className="h-px flex-1 bg-slate-200" />

                    <h3 className="max-w-3xl text-center text-sm font-bold uppercase tracking-[0.12em] text-[#082B3A]">
                      {
                        group.name
                      }
                    </h3>

                    <div className="h-px flex-1 bg-slate-200" />
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {group.features.map(
                    (
                      feature
                    ) => {
                      const hasChildren =
                        feature.children
                          ?.length >
                        0;

                      return (
                        <article
                          key={
                            feature.id
                          }
                          className={`overflow-hidden rounded-2xl border bg-white transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl hover:shadow-slate-900/5 ${
                            hasChildren
                              ? "border-orange-200"
                              : "border-slate-200"
                          }`}
                        >
                          <Link
                            to={`/services/${service.slug}/features/${feature.slug}`}
                            className="block p-5"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#FF5A0A]">
                                <Sparkles
                                  size={
                                    18
                                  }
                                />
                              </div>

                              <ArrowRight
                                size={17}
                                className="mt-2 text-slate-300"
                              />
                            </div>

                            <h4 className="mt-4 font-bold leading-6 text-[#082B3A]">
                              {
                                feature.name
                              }
                            </h4>

                            {feature.short_description && (
                              <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                                {
                                  feature.short_description
                                }
                              </p>
                            )}
                          </Link>

                          {hasChildren && (
                            <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-4">
                              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                                Subfitur
                              </p>

                              <div className="space-y-2">
                                {feature.children.map(
                                  (
                                    child
                                  ) => (
                                    <Link
                                      key={
                                        child.id
                                      }
                                      to={`/services/${service.slug}/features/${child.slug}`}
                                      className="flex items-center justify-between gap-3 rounded-xl bg-white px-3 py-2.5 text-xs font-semibold text-[#082B3A] transition hover:text-[#FF5A0A]"
                                    >
                                      {
                                        child.name
                                      }

                                      <ArrowRight
                                        size={
                                          13
                                        }
                                      />
                                    </Link>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        </article>
                      );
                    }
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}

/* ======================================================
   CTA
====================================================== */

function CTASection({
  section,
  previewMode,
}) {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="container-jmt">
        {previewMode && (
          <div className="mb-5">
            <PreviewStatusBadge
              status={
                section.status
              }
            />
          </div>
        )}

        <div className="relative overflow-hidden rounded-[30px] bg-[#082B3A] px-6 py-10 text-center text-white md:px-10 md:py-14">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#FF5A0A]/20 blur-3xl" />

          <div className="relative mx-auto max-w-3xl">
            {section.eyebrow && (
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-300">
                {
                  section.eyebrow
                }
              </p>
            )}

            {section.title && (
              <h2 className="mt-3 text-3xl font-bold">
                {
                  section.title
                }
              </h2>
            )}

            {section.description && (
              <p className="mt-4 text-sm leading-7 text-white/65">
                {
                  section.description
                }
              </p>
            )}

            {section.button_label &&
              section.button_url && (
                <Link
                  to={
                    section.button_url
                  }
                  className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#FF5A0A] px-5 py-3 text-sm font-bold text-white"
                >
                  {
                    section.button_label
                  }

                  <ArrowRight
                    size={17}
                  />
                </Link>
              )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ======================================================
   FALLBACK SECTION
====================================================== */

function GenericSection({
  section,
  previewMode,
}) {
  return (
    <section className="bg-white py-16">
      <div className="container-jmt">
        {previewMode && (
          <div className="mb-5">
            <PreviewStatusBadge
              status={
                section.status
              }
            />
          </div>
        )}

        <SectionHeader
          eyebrow={
            section.eyebrow
          }
          title={
            section.title
          }
          description={
            section.description
          }
        />
      </div>
    </section>
  );
}

/* ======================================================
   MAIN RENDERER
====================================================== */

export default function ServicePageSectionsRenderer({
  service,
  sections = [],
  features = [],
  previewMode = false,
}) {
  const safeSections =
    Array.isArray(sections)
      ? [...sections].sort(
          (
            first,
            second
          ) =>
            Number(
              first.sort_order ||
                0
            ) -
            Number(
              second.sort_order ||
                0
            )
        )
      : [];

  let showcaseCounter = 0;

  return (
    <>
      {safeSections.map(
        (
          section,
          index
        ) => {
          const key =
            section.id ||
            section.section_key ||
            index;

          switch (
            section.section_type
          ) {
            case "hero":
              return (
                <HeroSection
                  key={key}
                  section={
                    section
                  }
                  service={
                    service
                  }
                  previewMode={
                    previewMode
                  }
                />
              );

            case "intro":
              return (
                <IntroSection
                  key={key}
                  section={
                    section
                  }
                  previewMode={
                    previewMode
                  }
                />
              );

            case "icon_grid":
              return (
                <IconGridSection
                  key={key}
                  section={
                    section
                  }
                  previewMode={
                    previewMode
                  }
                />
              );

            case "benefits":
              return (
                <BenefitsSection
                  key={key}
                  section={
                    section
                  }
                  previewMode={
                    previewMode
                  }
                />
              );

            case "stats":
              return (
                <StatsSection
                  key={key}
                  section={
                    section
                  }
                  previewMode={
                    previewMode
                  }
                />
              );

            case "download":
              return (
                <DownloadSection
                  key={key}
                  section={
                    section
                  }
                  previewMode={
                    previewMode
                  }
                />
              );

            case "showcase": {
              const currentIndex =
                showcaseCounter;

              showcaseCounter += 1;

              return (
                <ShowcaseSection
                  key={key}
                  section={
                    section
                  }
                  previewMode={
                    previewMode
                  }
                  reversed={
                    currentIndex %
                      2 ===
                    1
                  }
                />
              );
            }

            case "features":
              return (
                <FeaturesSection
                  key={key}
                  section={
                    section
                  }
                  service={
                    service
                  }
                  features={
                    features
                  }
                  previewMode={
                    previewMode
                  }
                />
              );

            case "cta":
              return (
                <CTASection
                  key={key}
                  section={
                    section
                  }
                  previewMode={
                    previewMode
                  }
                />
              );

            default:
              return (
                <GenericSection
                  key={key}
                  section={
                    section
                  }
                  previewMode={
                    previewMode
                  }
                />
              );
          }
        }
      )}
    </>
  );
}