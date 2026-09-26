import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase.js";


export function AdminProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");


  const [form, setForm] = useState(null);
  const [features, setFeatures] = useState([]);
  const [audiences, setAudiences] = useState([]);
  const [sections, setSections] = useState([]);
  const [pricing, setPricing] = useState([]);
  const [ctas, setCtas] = useState([]);

  const [newAudience, setNewAudience] = useState({
  audience_key: "",
  title: "",
  description: "",
  sort_order: 0,
  is_published: false,
});
  
  const [newFeature, setNewFeature] = useState({
    title: "",
    description: "",
    sort_order: 0,
  });

  const [newSection, setNewSection] = useState({
  section_key: "",
  eyebrow: "",
  title: "",
  body: "",
  layout: "standard",
  sort_order: 0,
  is_published: false,
});

  const [newPrice, setNewPrice] = useState({
    pricing_key: "",
    title: "",
    description: "",
    price_amount: "",
    price_currency: "DKK",
    price_interval: "",
    price_label: "",
    badge: "",
    sort_order: 0,
    is_published: false,
  });

  const [newCta, setNewCta] = useState({
  cta_key: "",
  label: "",
  url: "",
  variant: "primary",
  placement: "hero",
  sort_order: 0,
  is_external: false,
  is_published: false,
});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [featureSaving, setFeatureSaving] = useState(false);
  const [error, setError] = useState("");
  const [featureError, setFeatureError] = useState("");

  useEffect(() => {
    async function loadData() {
      const [
  productResult,
  featuresResult,
  audiencesResult,
  sectionsResult,
  pricingResult,
  ctasResult,
] = await Promise.all([
  supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      short_description,
      description,
      status,
      lifecycle_status,
      show_on_homepage,
      sort_order,
      website_url,
      published_at
    `)
    .eq("id", id)
    .single(),

  supabase
    .from("product_features")
    .select(`
      id,
      product_id,
      title,
      description,
      sort_order,
      created_at,
      updated_at
    `)
    .eq("product_id", id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true }),

  supabase
    .from("product_audiences")
    .select(`
      id,
      product_id,
      audience_key,
      title,
      description,
      sort_order,
      is_published,
      created_at,
      updated_at
    `)
    .eq("product_id", id)
    .order("sort_order", { ascending: true }),

  supabase
    .from("product_sections")
    .select(`
      id,
      product_id,
      section_key,
      eyebrow,
      title,
      body,
      layout,
      sort_order,
      is_published,
      created_at,
      updated_at
    `)
    .eq("product_id", id)
    .order("sort_order", { ascending: true }),

  supabase
    .from("product_pricing")
    .select(`
      id,
      product_id,
      pricing_key,
      title,
      description,
      price_amount,
      price_currency,
      price_interval,
      price_label,
      badge,
      sort_order,
      is_published,
      created_at,
      updated_at
    `)
    .eq("product_id", id)
    .order("sort_order", { ascending: true }),

  supabase
    .from("product_ctas")
    .select(`
      id,
      product_id,
      cta_key,
      label,
      url,
      variant,
      placement,
      sort_order,
      is_external,
      is_published,
      created_at,
      updated_at
    `)
    .eq("product_id", id)
    .order("sort_order", { ascending: true }),
]);

      if (productResult.error) {
        console.error(productResult.error);
        setError("Produktet kunne ikke hentes.");
      } else {
        const data = productResult.data;

        setForm({
          ...data,
          short_description: data.short_description ?? "",
          description: data.description ?? "",
          website_url: data.website_url ?? "",
        });
      }

      if (featuresResult.error) {
        console.error(featuresResult.error);
        setFeatureError("Produktfunktionerne kunne ikke hentes.");
      } else {
        setFeatures(
          (featuresResult.data ?? []).map((feature) => ({
            ...feature,
            description: feature.description ?? "",
          })),
        );
      }

      if (audiencesResult.error) {
  console.error(audiencesResult.error);
  setError("Målgrupperne kunne ikke hentes.");
} else {
  setAudiences(
    (audiencesResult.data ?? []).map((audience) => ({
      ...audience,
      description: audience.description ?? "",
    })),
  );
}

if (sectionsResult.error) {
  console.error(sectionsResult.error);
  setError("Produktsektionerne kunne ikke hentes.");
} else {
  setSections(
    (sectionsResult.data ?? []).map((section) => ({
      ...section,
      eyebrow: section.eyebrow ?? "",
      body: section.body ?? "",
    })),
  );
}

if (pricingResult.error) {
  console.error(pricingResult.error);
  setError("Priserne kunne ikke hentes.");
} else {
  setPricing(
    (pricingResult.data ?? []).map((price) => ({
      ...price,
      description: price.description ?? "",
      price_amount: price.price_amount ?? "",
      price_interval: price.price_interval ?? "",
      price_label: price.price_label ?? "",
      badge: price.badge ?? "",
    })),
  );
}

if (ctasResult.error) {
  console.error(ctasResult.error);
  setError("CTA'erne kunne ikke hentes.");
} else {
  setCtas(ctasResult.data ?? []);
}

      setLoading(false);
    }

    loadData();
  }, [id]);

  function updateField(event) {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function updateNewFeature(event) {
    const { name, value } = event.target;

    setNewFeature((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function updateFeature(featureId, field, value) {
    setFeatures((current) =>
      current.map((feature) =>
        feature.id === featureId
          ? { ...feature, [field]: value }
          : feature,
      ),
    );
  }

function updateAudience(audienceId, field, value) {
  setAudiences((current) =>
    current.map((audience) =>
      audience.id === audienceId
        ? { ...audience, [field]: value }
        : audience,
    ),
  );
}

function updateSection(sectionId, field, value) {
  setSections((current) =>
    current.map((section) =>
      section.id === sectionId
        ? { ...section, [field]: value }
        : section,
    ),
  );
}

function updatePrice(priceId, field, value) {
  setPricing((current) =>
    current.map((price) =>
      price.id === priceId
        ? { ...price, [field]: value }
        : price,
    ),
  );
}

function updateCta(ctaId, field, value) {
  setCtas((current) =>
    current.map((cta) =>
      cta.id === ctaId
        ? { ...cta, [field]: value }
        : cta,
    ),
  );
}

function updateNewCta(event) {
  const { name, value, type, checked } = event.target;

  setNewCta((current) => ({
    ...current,
    [name]: type === "checkbox" ? checked : value,
  }));
}

async function handleSavePrice(price) {
  if (!price.pricing_key.trim() || !price.title.trim()) {
    setError("Prisplanen skal have både nøgle og titel.");
    return;
  }

  setSaving(true);
  setError("");

  const updatedAt = new Date().toISOString();

  const { error: updateError } = await supabase
    .from("product_pricing")
    .update({
      pricing_key: price.pricing_key.trim(),
      title: price.title.trim(),
      description: price.description.trim() || null,
      price_amount:
        price.price_amount === "" ? null : Number(price.price_amount),
      price_currency: price.price_currency.trim() || "DKK",
      price_interval: price.price_interval.trim() || null,
      price_label: price.price_label.trim() || null,
      badge: price.badge.trim() || null,
      sort_order: Number(price.sort_order) || 0,
      is_published: price.is_published,
      updated_at: updatedAt,
    })
    .eq("id", price.id);

  if (updateError) {
    console.error(updateError);
    setError("Prisplanen kunne ikke gemmes.");
    setSaving(false);
    return;
  }

  setPricing((current) =>
    current
      .map((item) =>
        item.id === price.id
          ? { ...item, updated_at: updatedAt }
          : item,
      )
      .sort((a, b) => a.sort_order - b.sort_order),
  );

  setSaving(false);
}

async function handleCreateCta(event) {
  event.preventDefault();

  if (
    !newCta.cta_key.trim() ||
    !newCta.label.trim() ||
    !newCta.url.trim()
  ) {
    setError("Den nye CTA skal have nøgle, label og URL.");
    return;
  }

  setSaving(true);
  setError("");

  const { data, error: insertError } = await supabase
    .from("product_ctas")
    .insert({
      product_id: id,
      cta_key: newCta.cta_key.trim(),
      label: newCta.label.trim(),
      url: newCta.url.trim(),
      variant: newCta.variant,
      placement: newCta.placement,
      sort_order: Number(newCta.sort_order) || 0,
      is_external: newCta.is_external,
      is_published: newCta.is_published,
    })
    .select(`
      id,
      product_id,
      cta_key,
      label,
      url,
      variant,
      placement,
      sort_order,
      is_external,
      is_published,
      created_at,
      updated_at
    `)
    .single();

  if (insertError) {
    console.error(insertError);
    setError("CTA'en kunne ikke oprettes.");
    setSaving(false);
    return;
  }

  setCtas((current) =>
    [...current, data].sort((a, b) => a.sort_order - b.sort_order),
  );

  setNewCta({
    cta_key: "",
    label: "",
    url: "",
    variant: "primary",
    placement: "hero",
    sort_order: 0,
    is_external: false,
    is_published: false,
  });

  setSaving(false);
}

async function handleDeleteCta(cta) {
  const confirmed = window.confirm(
    `Er du sikker på, at du vil slette CTA'en "${cta.label}"?`,
  );

  if (!confirmed) return;

  setSaving(true);
  setError("");

  const { error: deleteError } = await supabase
    .from("product_ctas")
    .delete()
    .eq("id", cta.id);

  if (deleteError) {
    console.error(deleteError);
    setError("CTA'en kunne ikke slettes.");
    setSaving(false);
    return;
  }

  setCtas((current) =>
    current.filter((item) => item.id !== cta.id),
  );

  setSaving(false);
}

async function handleSaveCta(cta) {
  if (!cta.cta_key.trim() || !cta.label.trim() || !cta.url.trim()) {
    setError("CTA'en skal have nøgle, label og URL.");
    return;
  }

  setSaving(true);
  setError("");

  const updatedAt = new Date().toISOString();

  const { error: updateError } = await supabase
    .from("product_ctas")
    .update({
      cta_key: cta.cta_key.trim(),
      label: cta.label.trim(),
      url: cta.url.trim(),
      variant: cta.variant,
      placement: cta.placement,
      sort_order: Number(cta.sort_order) || 0,
      is_external: cta.is_external,
      is_published: cta.is_published,
      updated_at: updatedAt,
    })
    .eq("id", cta.id);

  if (updateError) {
    console.error(updateError);
    setError("CTA'en kunne ikke gemmes.");
    setSaving(false);
    return;
  }

  setCtas((current) =>
    current
      .map((item) =>
        item.id === cta.id
          ? { ...item, updated_at: updatedAt }
          : item,
      )
      .sort((a, b) => a.sort_order - b.sort_order),
  );

  setSaving(false);
}

async function handleCreatePrice(event) {
  event.preventDefault();

  if (!newPrice.pricing_key.trim() || !newPrice.title.trim()) {
    setError("Den nye prisplan skal have både nøgle og titel.");
    return;
  }

  setSaving(true);
  setError("");

  const { data, error: insertError } = await supabase
    .from("product_pricing")
    .insert({
      product_id: id,
      pricing_key: newPrice.pricing_key.trim(),
      title: newPrice.title.trim(),
      description: newPrice.description.trim() || null,
      price_amount:
        newPrice.price_amount === ""
          ? null
          : Number(newPrice.price_amount),
      price_currency: newPrice.price_currency.trim() || "DKK",
      price_interval: newPrice.price_interval.trim() || null,
      price_label: newPrice.price_label.trim() || null,
      badge: newPrice.badge.trim() || null,
      sort_order: Number(newPrice.sort_order) || 0,
      is_published: newPrice.is_published,
    })
    .select(`
      id,
      product_id,
      pricing_key,
      title,
      description,
      price_amount,
      price_currency,
      price_interval,
      price_label,
      badge,
      sort_order,
      is_published,
      created_at,
      updated_at
    `)
    .single();

  if (insertError) {
    console.error(insertError);
    setError("Prisplanen kunne ikke oprettes.");
    setSaving(false);
    return;
  }

  setPricing((current) =>
    [
      ...current,
      {
        ...data,
        description: data.description ?? "",
        price_amount: data.price_amount ?? "",
        price_interval: data.price_interval ?? "",
        price_label: data.price_label ?? "",
        badge: data.badge ?? "",
      },
    ].sort((a, b) => a.sort_order - b.sort_order),
  );

  setNewPrice({
    pricing_key: "",
    title: "",
    description: "",
    price_amount: "",
    price_currency: "DKK",
    price_interval: "",
    price_label: "",
    badge: "",
    sort_order: 0,
    is_published: false,
  });

  setSaving(false);
}

async function handleDeletePrice(price) {
  const confirmed = window.confirm(
    `Er du sikker på, at du vil slette prisplanen "${price.title}"?`,
  );

  if (!confirmed) return;

  setSaving(true);
  setError("");

  const { error: deleteError } = await supabase
    .from("product_pricing")
    .delete()
    .eq("id", price.id);

  if (deleteError) {
    console.error(deleteError);
    setError("Prisplanen kunne ikke slettes.");
    setSaving(false);
    return;
  }

  setPricing((current) =>
    current.filter((item) => item.id !== price.id),
  );

  setSaving(false);
}

function updateNewPrice(event) {
  const { name, value, type, checked } = event.target;

  setNewPrice((current) => ({
    ...current,
    [name]: type === "checkbox" ? checked : value,
  }));
}

function updateNewSection(event) {
  const { name, value, type, checked } = event.target;

  setNewSection((current) => ({
    ...current,
    [name]: type === "checkbox" ? checked : value,
  }));
}

async function handleSaveSection(section) {
  if (!section.section_key.trim() || !section.title.trim()) {
    setError("Sektionen skal have både nøgle og titel.");
    return;
  }

  setSaving(true);
  setError("");

  const updatedAt = new Date().toISOString();

  const { error: updateError } = await supabase
    .from("product_sections")
    .update({
      section_key: section.section_key.trim(),
      eyebrow: section.eyebrow.trim() || null,
      title: section.title.trim(),
      body: section.body.trim() || null,
      layout: section.layout.trim() || "standard",
      sort_order: Number(section.sort_order) || 0,
      is_published: section.is_published,
      updated_at: updatedAt,
    })
    .eq("id", section.id);

  if (updateError) {
    console.error(updateError);
    setError("Sektionen kunne ikke gemmes.");
    setSaving(false);
    return;
  }

  setSections((current) =>
    current
      .map((item) =>
        item.id === section.id
          ? { ...item, updated_at: updatedAt }
          : item,
      )
      .sort((a, b) => a.sort_order - b.sort_order),
  );

  setSaving(false);
}

async function handleCreateSection(event) {
  event.preventDefault();

  if (!newSection.section_key.trim() || !newSection.title.trim()) {
    setError("Den nye sektion skal have både nøgle og titel.");
    return;
  }

  setSaving(true);
  setError("");

  const { data, error: insertError } = await supabase
    .from("product_sections")
    .insert({
      product_id: id,
      section_key: newSection.section_key.trim(),
      eyebrow: newSection.eyebrow.trim() || null,
      title: newSection.title.trim(),
      body: newSection.body.trim() || null,
      layout: newSection.layout.trim() || "standard",
      sort_order: Number(newSection.sort_order) || 0,
      is_published: newSection.is_published,
    })
    .select(`
      id,
      product_id,
      section_key,
      eyebrow,
      title,
      body,
      layout,
      sort_order,
      is_published,
      created_at,
      updated_at
    `)
    .single();

  if (insertError) {
    console.error(insertError);
    setError("Sektionen kunne ikke oprettes.");
    setSaving(false);
    return;
  }

  setSections((current) =>
    [
      ...current,
      {
        ...data,
        eyebrow: data.eyebrow ?? "",
        body: data.body ?? "",
      },
    ].sort((a, b) => a.sort_order - b.sort_order),
  );

  setNewSection({
    section_key: "",
    eyebrow: "",
    title: "",
    body: "",
    layout: "standard",
    sort_order: 0,
    is_published: false,
  });

  setSaving(false);
}

async function handleDeleteSection(section) {
  const confirmed = window.confirm(
    `Er du sikker på, at du vil slette sektionen "${section.title}"?`,
  );

  if (!confirmed) return;

  setSaving(true);
  setError("");

  const { error: deleteError } = await supabase
    .from("product_sections")
    .delete()
    .eq("id", section.id);

  if (deleteError) {
    console.error(deleteError);
    setError("Sektionen kunne ikke slettes.");
    setSaving(false);
    return;
  }

  setSections((current) =>
    current.filter((item) => item.id !== section.id),
  );

  setSaving(false);
}

function updateNewAudience(event) {
  const { name, value, type, checked } = event.target;

  setNewAudience((current) => ({
    ...current,
    [name]: type === "checkbox" ? checked : value,
  }));
}

async function handleSaveAudience(audience) {
  if (!audience.audience_key.trim() || !audience.title.trim()) {
    setError("Målgruppen skal have både nøgle og titel.");
    return;
  }

  setSaving(true);
  setError("");

  const updatedAt = new Date().toISOString();

  const { error: updateError } = await supabase
    .from("product_audiences")
    .update({
      audience_key: audience.audience_key.trim(),
      title: audience.title.trim(),
      description: audience.description.trim() || null,
      sort_order: Number(audience.sort_order) || 0,
      is_published: audience.is_published,
      updated_at: updatedAt,
    })
    .eq("id", audience.id);

  if (updateError) {
    console.error(updateError);
    setError("Målgruppen kunne ikke gemmes.");
    setSaving(false);
    return;
  }

  setAudiences((current) =>
    current
      .map((item) =>
        item.id === audience.id
          ? { ...item, updated_at: updatedAt }
          : item,
      )
      .sort((a, b) => a.sort_order - b.sort_order),
  );

  setSaving(false);
}

async function handleCreateAudience(event) {
  event.preventDefault();

  if (!newAudience.audience_key.trim() || !newAudience.title.trim()) {
    setError("Den nye målgruppe skal have både nøgle og titel.");
    return;
  }

  setSaving(true);
  setError("");

  const { data, error: insertError } = await supabase
    .from("product_audiences")
    .insert({
      product_id: id,
      audience_key: newAudience.audience_key.trim(),
      title: newAudience.title.trim(),
      description: newAudience.description.trim() || null,
      sort_order: Number(newAudience.sort_order) || 0,
      is_published: newAudience.is_published,
    })
    .select(`
      id,
      product_id,
      audience_key,
      title,
      description,
      sort_order,
      is_published,
      created_at,
      updated_at
    `)
    .single();

  if (insertError) {
    console.error(insertError);
    setError("Målgruppen kunne ikke oprettes.");
    setSaving(false);
    return;
  }

  setAudiences((current) =>
    [
      ...current,
      {
        ...data,
        description: data.description ?? "",
      },
    ].sort((a, b) => a.sort_order - b.sort_order),
  );

  setNewAudience({
    audience_key: "",
    title: "",
    description: "",
    sort_order: 0,
    is_published: false,
  });

  setSaving(false);
}

async function handleDeleteAudience(audience) {
  const confirmed = window.confirm(
    `Er du sikker på, at du vil slette målgruppen "${audience.title}"?`,
  );

  if (!confirmed) return;

  setSaving(true);
  setError("");

  const { error: deleteError } = await supabase
    .from("product_audiences")
    .delete()
    .eq("id", audience.id);

  if (deleteError) {
    console.error(deleteError);
    setError("Målgruppen kunne ikke slettes.");
    setSaving(false);
    return;
  }

  setAudiences((current) =>
    current.filter((item) => item.id !== audience.id),
  );

  setSaving(false);
}

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const { error: updateError } = await supabase
      .from("products")
      .update({
        name: form.name.trim(),
        slug: form.slug.trim(),
        short_description: form.short_description.trim() || null,
        description: form.description.trim() || null,
        website_url: form.website_url.trim() || null,
        lifecycle_status: form.lifecycle_status,
        show_on_homepage: form.show_on_homepage,
        sort_order: Number(form.sort_order) || 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      console.error(updateError);
      setError("Ændringerne kunne ikke gemmes.");
      setSaving(false);
      return;
    }

    navigate("/admin", { replace: true });
  }

  async function handlePublishToggle() {
    setSaving(true);
    setError("");

    const publishing = form.status !== "published";
    const publishedAt = publishing ? new Date().toISOString() : null;

    const { error: updateError } = await supabase
      .from("products")
      .update({
        status: publishing ? "published" : "draft",
        published_at: publishedAt,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      console.error(updateError);
      setError(
        publishing
          ? "Produktet kunne ikke publiceres."
          : "Produktet kunne ikke afpubliceres.",
      );
      setSaving(false);
      return;
    }

    setForm((current) => ({
      ...current,
      status: publishing ? "published" : "draft",
      published_at: publishedAt,
    }));

    setSaving(false);
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Er du sikker på, at du vil slette "${form.name}"? Denne handling kan ikke fortrydes.`,
    );

    if (!confirmed) return;

    setSaving(true);
    setError("");

    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error(deleteError);
      setError("Produktet kunne ikke slettes.");
      setSaving(false);
      return;
    }

    navigate("/admin", { replace: true });
  }

  async function handleCreateFeature(event) {
    event.preventDefault();

    if (!newFeature.title.trim()) {
      setFeatureError("Funktionen skal have en titel.");
      return;
    }

    setFeatureSaving(true);
    setFeatureError("");

    const { data, error: insertError } = await supabase
      .from("product_features")
      .insert({
        product_id: id,
        title: newFeature.title.trim(),
        description: newFeature.description.trim() || null,
        sort_order: Number(newFeature.sort_order) || 0,
      })
      .select(`
        id,
        product_id,
        title,
        description,
        sort_order,
        created_at,
        updated_at
      `)
      .single();

    if (insertError) {
      console.error(insertError);
      setFeatureError("Funktionen kunne ikke oprettes.");
      setFeatureSaving(false);
      return;
    }

    setFeatures((current) =>
      [...current, { ...data, description: data.description ?? "" }].sort(
        (a, b) => a.sort_order - b.sort_order,
      ),
    );

    setNewFeature({
      title: "",
      description: "",
      sort_order: 0,
    });

    setFeatureSaving(false);
  }

  async function handleSaveFeature(feature) {
    if (!feature.title.trim()) {
      setFeatureError("Funktionen skal have en titel.");
      return;
    }

    setFeatureSaving(true);
    setFeatureError("");

    const updatedAt = new Date().toISOString();

    const { error: updateError } = await supabase
      .from("product_features")
      .update({
        title: feature.title.trim(),
        description: feature.description.trim() || null,
        sort_order: Number(feature.sort_order) || 0,
        updated_at: updatedAt,
      })
      .eq("id", feature.id);

    if (updateError) {
      console.error(updateError);
      setFeatureError("Funktionen kunne ikke gemmes.");
      setFeatureSaving(false);
      return;
    }

    setFeatures((current) =>
      current
        .map((item) =>
          item.id === feature.id
            ? { ...item, updated_at: updatedAt }
            : item,
        )
        .sort((a, b) => a.sort_order - b.sort_order),
    );

    setFeatureSaving(false);
  }

  async function handleDeleteFeature(feature) {
    const confirmed = window.confirm(
      `Er du sikker på, at du vil slette funktionen "${feature.title}"?`,
    );

    if (!confirmed) return;

    setFeatureSaving(true);
    setFeatureError("");

    const { error: deleteError } = await supabase
      .from("product_features")
      .delete()
      .eq("id", feature.id);

    if (deleteError) {
      console.error(deleteError);
      setFeatureError("Funktionen kunne ikke slettes.");
      setFeatureSaving(false);
      return;
    }

    setFeatures((current) =>
      current.filter((item) => item.id !== feature.id),
    );

    setFeatureSaving(false);
  }

  if (loading) {
    return (
      <main>
        <p>Henter produkt...</p>
      </main>
    );
  }

  if (!form) {
    return (
      <main>
        <p role="alert">{error || "Produktet findes ikke."}</p>

        <button type="button" onClick={() => navigate("/admin")}>
          Tilbage
        </button>
      </main>
    );
  }

  const tabs = [
    ["overview", "Oversigt"],
    ["content", "Indhold"],
    ["audiences", "Målgrupper"],
    ["pricing", "Priser"],
    ["ctas", "CTA'er"],
  ];

  const lifecycleLabels = {
    development: "Under udvikling",
    beta: "Beta",
    active: "Aktiv",
    coming_soon: "Kommer snart",
  };

  return (
    <main className="admin-editor">
      <button
        className="admin-back"
        type="button"
        onClick={() => navigate("/admin")}
      >
        ← Tilbage
      </button>

      <header className="admin-editor-header">
        <div>
          <p className="admin-eyebrow">Produktadministration</p>
          <h1>Rediger {form.name}</h1>
        </div>

        <div className="admin-product-meta">
          <span>
            {lifecycleLabels[form.lifecycle_status] ??
              form.lifecycle_status}
          </span>

          <span>
            {form.show_on_homepage
              ? "På forsiden"
              : "Skjult fra forsiden"}
          </span>

          <span>
            {form.status === "published"
              ? "Publiceret"
              : "Kladde"}
          </span>
        </div>
      </header>

      <nav className="admin-tabs" aria-label="Produktadministration">
        {tabs.map(([tab, label]) => (
          <button
            key={tab}
            type="button"
            className={
              activeTab === tab
                ? "admin-tab active"
                : "admin-tab"
            }
            onClick={() => setActiveTab(tab)}
          >
            {label}
          </button>
        ))}
      </nav>

      {error && (
        <p className="admin-error" role="alert">
          {error}
        </p>
      )}

      {activeTab === "overview" && (
        <section>
          <h2>Grundoplysninger</h2>

          <form onSubmit={handleSubmit}>
            <label>
              Navn
              <input
                name="name"
                value={form.name}
                onChange={updateField}
                required
              />
            </label>

            <label>
              Slug
              <input
                name="slug"
                value={form.slug}
                onChange={updateField}
                required
              />
            </label>

            <label>
              Kort beskrivelse
              <textarea
                name="short_description"
                value={form.short_description}
                onChange={updateField}
              />
            </label>

            <label>
              Beskrivelse
              <textarea
                name="description"
                value={form.description}
                onChange={updateField}
              />
            </label>

            <label>
              Produktwebsite
              <input
                name="website_url"
                type="url"
                value={form.website_url}
                onChange={updateField}
              />
            </label>

            <label>
              Sortering
              <input
                name="sort_order"
                type="number"
                value={form.sort_order}
                onChange={updateField}
              />
            </label>

            <h3>Synlighed og livscyklus</h3>

            <label>
              Produktstatus
              <select
                name="lifecycle_status"
                value={form.lifecycle_status}
                onChange={updateField}
              >
                <option value="development">Under udvikling</option>
                <option value="beta">Beta</option>
                <option value="active">Aktiv</option>
                <option value="coming_soon">Kommer snart</option>
              </select>
            </label>

            <label className="admin-checkbox">
              <input
                name="show_on_homepage"
                type="checkbox"
                checked={form.show_on_homepage}
                onChange={updateField}
              />
              Vis produkt på forsiden
            </label>

            <p>
              Publicering:{" "}
              <strong>
                {form.status === "published"
                  ? "Publiceret"
                  : "Kladde"}
              </strong>
            </p>

            <div className="admin-actions">
              <button type="submit" disabled={saving}>
                {saving ? "Gemmer..." : "Gem ændringer"}
              </button>

              <button
                type="button"
                onClick={handlePublishToggle}
                disabled={saving}
              >
                {form.status === "published"
                  ? "Afpublicér produkt"
                  : "Publicér produkt"}
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
              >
                Slet produkt
              </button>
            </div>
          </form>
        </section>
      )}

      {activeTab === "content" && (
        <>
          <section>
            <h2>Produktfunktioner</h2>

            <p>
              Funktionerne bruges på produktets offentlige produktside.
            </p>

            {featureError && (
              <p role="alert">{featureError}</p>
            )}

            {features.length === 0 ? (
              <p>Produktet har endnu ingen funktioner.</p>
            ) : (
              <div>
                {features.map((feature) => (
                  <article key={feature.id}>
                    <label>
                      Titel
                      <input
                        value={feature.title}
                        onChange={(event) =>
                          updateFeature(
                            feature.id,
                            "title",
                            event.target.value,
                          )
                        }
                      />
                    </label>

                    <label>
                      Beskrivelse
                      <textarea
                        value={feature.description}
                        onChange={(event) =>
                          updateFeature(
                            feature.id,
                            "description",
                            event.target.value,
                          )
                        }
                      />
                    </label>

                    <label>
                      Sortering
                      <input
                        type="number"
                        value={feature.sort_order}
                        onChange={(event) =>
                          updateFeature(
                            feature.id,
                            "sort_order",
                            event.target.value,
                          )
                        }
                      />
                    </label>

                    <button
                      type="button"
                      disabled={featureSaving}
                      onClick={() => handleSaveFeature(feature)}
                    >
                      Gem funktion
                    </button>

                    <button
                      type="button"
                      disabled={featureSaving}
                      onClick={() => handleDeleteFeature(feature)}
                    >
                      Slet funktion
                    </button>
                  </article>
                ))}
              </div>
            )}

            <h3>Tilføj funktion</h3>

            <form onSubmit={handleCreateFeature}>
              <label>
                Titel
                <input
                  name="title"
                  value={newFeature.title}
                  onChange={updateNewFeature}
                  required
                />
              </label>

              <label>
                Beskrivelse
                <textarea
                  name="description"
                  value={newFeature.description}
                  onChange={updateNewFeature}
                />
              </label>

              <label>
                Sortering
                <input
                  name="sort_order"
                  type="number"
                  value={newFeature.sort_order}
                  onChange={updateNewFeature}
                />
              </label>

              <button type="submit" disabled={featureSaving}>
                {featureSaving ? "Gemmer..." : "Tilføj funktion"}
              </button>
            </form>
          </section>

          <section>
            <h2>Indholdssektioner</h2>

            <p>
              Sektionerne bruges til at opbygge produktets offentlige
              produktside.
            </p>

            {sections.length === 0 ? (
              <p>Produktet har endnu ingen indholdssektioner.</p>
            ) : (
              <div>
                {sections.map((section) => (
                  <details
                    className="admin-section-editor"
                    key={section.id}
                  >
                    <summary>
                      <div>
                        <strong>
                          {section.title || "Sektion uden titel"}
                        </strong>

                        <span>
                          {section.layout} · Sortering {section.sort_order}
                        </span>
                      </div>

                      <span
                        className={
                          section.is_published
                            ? "admin-section-state published"
                            : "admin-section-state draft"
                        }
                      >
                        {section.is_published
                          ? "Publiceret"
                          : "Skjult"}
                      </span>
                    </summary>

                    <div className="admin-section-editor-body">
                    <label>
                      Nøgle
                      <input
                        value={section.section_key}
                        onChange={(event) =>
                          updateSection(
                            section.id,
                            "section_key",
                            event.target.value,
                          )
                        }
                      />
                    </label>

                    <label>
                      Overlinje
                      <input
                        value={section.eyebrow}
                        onChange={(event) =>
                          updateSection(
                            section.id,
                            "eyebrow",
                            event.target.value,
                          )
                        }
                      />
                    </label>

                    <label>
                      Titel
                      <input
                        value={section.title}
                        onChange={(event) =>
                          updateSection(
                            section.id,
                            "title",
                            event.target.value,
                          )
                        }
                      />
                    </label>

                    <label>
                      Indhold
                      <textarea
                        value={section.body}
                        onChange={(event) =>
                          updateSection(
                            section.id,
                            "body",
                            event.target.value,
                          )
                        }
                      />
                    </label>

                    <label>
                      Layout
                      <select
                        value={section.layout}
                        onChange={(event) =>
                          updateSection(
                            section.id,
                            "layout",
                            event.target.value,
                          )
                        }
                      >
                        <option value="standard">Standard</option>
                        <option value="process">Proces</option>
                        <option value="split">Delt layout</option>
                        <option value="roadmap">Roadmap</option>
                        <option value="report">Rapport</option>
                        <option value="security">Sikkerhed</option>
                        <option value="business">Erhverv / organisation</option>
                      </select>

                      <small className="admin-field-help">
                        Vælg hvordan sektionen præsenteres på produktsiden.
                      </small>
                    </label>

                    <label>
                      Sortering
                      <input
                        type="number"
                        value={section.sort_order}
                        onChange={(event) =>
                          updateSection(
                            section.id,
                            "sort_order",
                            event.target.value,
                          )
                        }
                      />
                    </label>

                    <label className="admin-checkbox">
                      <input
                        type="checkbox"
                        checked={section.is_published}
                        onChange={(event) =>
                          updateSection(
                            section.id,
                            "is_published",
                            event.target.checked,
                          )
                        }
                      />
                      Publiceret
                    </label>

                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => handleSaveSection(section)}
                    >
                      Gem sektion
                    </button>

                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => handleDeleteSection(section)}
                    >
                      Slet sektion
                    </button>
                  </div>
                  </details>
                ))}
              </div>
            )}

            <h3>Tilføj sektion</h3>

            <form onSubmit={handleCreateSection}>
              <label>
                Nøgle
                <input
                  name="section_key"
                  value={newSection.section_key}
                  onChange={updateNewSection}
                  required
                />
              </label>

              <label>
                Overlinje
                <input
                  name="eyebrow"
                  value={newSection.eyebrow}
                  onChange={updateNewSection}
                />
              </label>

              <label>
                Titel
                <input
                  name="title"
                  value={newSection.title}
                  onChange={updateNewSection}
                  required
                />
              </label>

              <label>
                Indhold
                <textarea
                  name="body"
                  value={newSection.body}
                  onChange={updateNewSection}
                />
              </label>

              <label>
                Layout
                <select
                  name="layout"
                  value={newSection.layout}
                  onChange={updateNewSection}
                >
                  <option value="standard">Standard</option>
                  <option value="process">Proces</option>
                  <option value="split">Delt layout</option>
                  <option value="roadmap">Roadmap</option>
                  <option value="report">Rapport</option>
                  <option value="security">Sikkerhed</option>
                  <option value="business">Erhverv / organisation</option>
                </select>

                <small className="admin-field-help">
                  Layoutet bestemmer den visuelle præsentation på produktsiden.
                </small>
              </label>

              <label>
                Sortering
                <input
                  name="sort_order"
                  type="number"
                  value={newSection.sort_order}
                  onChange={updateNewSection}
                />
              </label>

              <label className="admin-checkbox">
                <input
                  type="checkbox"
                  name="is_published"
                  checked={newSection.is_published}
                  onChange={updateNewSection}
                />
                Publiceret
              </label>

              <button type="submit" disabled={saving}>
                {saving ? "Opretter..." : "Tilføj sektion"}
              </button>
            </form>
          </section>
        </>
      )}

      {activeTab === "audiences" && (
        <section>
          <h2>Målgrupper</h2>

          <p>
            Målgrupperne bruges på produktets offentlige produktside.
          </p>

          {audiences.length === 0 ? (
            <p>Produktet har endnu ingen målgrupper.</p>
          ) : (
            <div>
              {audiences.map((audience) => (
                <article key={audience.id}>
                  <label>
                    Nøgle
                    <input
                      value={audience.audience_key}
                      onChange={(event) =>
                        updateAudience(
                          audience.id,
                          "audience_key",
                          event.target.value,
                        )
                      }
                    />
                  </label>

                  <label>
                    Titel
                    <input
                      value={audience.title}
                      onChange={(event) =>
                        updateAudience(
                          audience.id,
                          "title",
                          event.target.value,
                        )
                      }
                    />
                  </label>

                  <label>
                    Beskrivelse
                    <textarea
                      value={audience.description}
                      onChange={(event) =>
                        updateAudience(
                          audience.id,
                          "description",
                          event.target.value,
                        )
                      }
                    />
                  </label>

                  <label>
                    Sortering
                    <input
                      type="number"
                      value={audience.sort_order}
                      onChange={(event) =>
                        updateAudience(
                          audience.id,
                          "sort_order",
                          event.target.value,
                        )
                      }
                    />
                  </label>

                  <label className="admin-checkbox">
                    <input
                      type="checkbox"
                      checked={audience.is_published}
                      onChange={(event) =>
                        updateAudience(
                          audience.id,
                          "is_published",
                          event.target.checked,
                        )
                      }
                    />
                    Publiceret
                  </label>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleSaveAudience(audience)}
                  >
                    Gem målgruppe
                  </button>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleDeleteAudience(audience)}
                  >
                    Slet målgruppe
                  </button>
                </article>
              ))}
            </div>
          )}

          <h3>Tilføj målgruppe</h3>

          <form onSubmit={handleCreateAudience}>
            <label>
              Nøgle
              <input
                name="audience_key"
                value={newAudience.audience_key}
                onChange={updateNewAudience}
                required
              />
            </label>

            <label>
              Titel
              <input
                name="title"
                value={newAudience.title}
                onChange={updateNewAudience}
                required
              />
            </label>

            <label>
              Beskrivelse
              <textarea
                name="description"
                value={newAudience.description}
                onChange={updateNewAudience}
              />
            </label>

            <label>
              Sortering
              <input
                name="sort_order"
                type="number"
                value={newAudience.sort_order}
                onChange={updateNewAudience}
              />
            </label>

            <label className="admin-checkbox">
              <input
                name="is_published"
                type="checkbox"
                checked={newAudience.is_published}
                onChange={updateNewAudience}
              />
              Publiceret
            </label>

            <button type="submit" disabled={saving}>
              {saving ? "Gemmer..." : "Tilføj målgruppe"}
            </button>
          </form>
        </section>
      )}

      {activeTab === "pricing" && (
        <section>
          <h2>Priser</h2>

          <p>
            Prisplanerne bruges på produktets offentlige produktside.
          </p>

          {pricing.length === 0 ? (
            <p>Produktet har endnu ingen prisplaner.</p>
          ) : (
            <div>
              {pricing.map((price) => (
                <article key={price.id}>
                  <label>
                    Nøgle
                    <input
                      value={price.pricing_key}
                      onChange={(event) =>
                        updatePrice(
                          price.id,
                          "pricing_key",
                          event.target.value,
                        )
                      }
                    />
                  </label>

                  <label>
                    Titel
                    <input
                      value={price.title}
                      onChange={(event) =>
                        updatePrice(
                          price.id,
                          "title",
                          event.target.value,
                        )
                      }
                    />
                  </label>

                  <label>
                    Beskrivelse
                    <textarea
                      value={price.description}
                      onChange={(event) =>
                        updatePrice(
                          price.id,
                          "description",
                          event.target.value,
                        )
                      }
                    />
                  </label>

                  <label>
                    Pris
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={price.price_amount}
                      onChange={(event) =>
                        updatePrice(
                          price.id,
                          "price_amount",
                          event.target.value,
                        )
                      }
                    />
                  </label>

                  <label>
                    Valuta
                    <input
                      value={price.price_currency}
                      onChange={(event) =>
                        updatePrice(
                          price.id,
                          "price_currency",
                          event.target.value,
                        )
                      }
                    />
                  </label>

                  <label>
                    Interval
                    <input
                      value={price.price_interval}
                      onChange={(event) =>
                        updatePrice(
                          price.id,
                          "price_interval",
                          event.target.value,
                        )
                      }
                      placeholder="Fx month"
                    />
                  </label>

                  <label>
                    Prislabel
                    <input
                      value={price.price_label}
                      onChange={(event) =>
                        updatePrice(
                          price.id,
                          "price_label",
                          event.target.value,
                        )
                      }
                      placeholder="Fx 200 kr./md."
                    />
                  </label>

                  <label>
                    Badge
                    <input
                      value={price.badge}
                      onChange={(event) =>
                        updatePrice(
                          price.id,
                          "badge",
                          event.target.value,
                        )
                      }
                      placeholder="Fx Beta"
                    />
                  </label>

                  <label>
                    Sortering
                    <input
                      type="number"
                      value={price.sort_order}
                      onChange={(event) =>
                        updatePrice(
                          price.id,
                          "sort_order",
                          event.target.value,
                        )
                      }
                    />
                  </label>

                  <label className="admin-checkbox">
                    <input
                      type="checkbox"
                      checked={price.is_published}
                      onChange={(event) =>
                        updatePrice(
                          price.id,
                          "is_published",
                          event.target.checked,
                        )
                      }
                    />
                    Publiceret
                  </label>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleSavePrice(price)}
                  >
                    Gem prisplan
                  </button>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleDeletePrice(price)}
                  >
                    Slet prisplan
                  </button>
                </article>
              ))}
            </div>
          )}

          <h3>Tilføj prisplan</h3>

          <form onSubmit={handleCreatePrice}>
            <label>
              Nøgle
              <input
                name="pricing_key"
                value={newPrice.pricing_key}
                onChange={updateNewPrice}
                required
              />
            </label>

            <label>
              Titel
              <input
                name="title"
                value={newPrice.title}
                onChange={updateNewPrice}
                required
              />
            </label>

            <label>
              Beskrivelse
              <textarea
                name="description"
                value={newPrice.description}
                onChange={updateNewPrice}
              />
            </label>

            <label>
              Pris
              <input
                name="price_amount"
                type="number"
                min="0"
                step="0.01"
                value={newPrice.price_amount}
                onChange={updateNewPrice}
              />
            </label>

            <label>
              Valuta
              <input
                name="price_currency"
                value={newPrice.price_currency}
                onChange={updateNewPrice}
              />
            </label>

            <label>
              Interval
              <input
                name="price_interval"
                value={newPrice.price_interval}
                onChange={updateNewPrice}
                placeholder="Fx month"
              />
            </label>

            <label>
              Prislabel
              <input
                name="price_label"
                value={newPrice.price_label}
                onChange={updateNewPrice}
                placeholder="Fx 200 kr./md."
              />
            </label>

            <label>
              Badge
              <input
                name="badge"
                value={newPrice.badge}
                onChange={updateNewPrice}
                placeholder="Fx Beta"
              />
            </label>

            <label>
              Sortering
              <input
                name="sort_order"
                type="number"
                value={newPrice.sort_order}
                onChange={updateNewPrice}
              />
            </label>

            <label className="admin-checkbox">
              <input
                name="is_published"
                type="checkbox"
                checked={newPrice.is_published}
                onChange={updateNewPrice}
              />
              Publiceret
            </label>

            <button type="submit" disabled={saving}>
              {saving ? "Opretter..." : "Tilføj prisplan"}
            </button>
          </form>
        </section>
      )}

      {activeTab === "ctas" && (
        <section>
          <h2>CTA'er</h2>

          <p>
            CTA'er styrer knapper og links på produktets offentlige
            produktside.
          </p>

          {ctas.length === 0 ? (
            <p>Produktet har endnu ingen CTA'er.</p>
          ) : (
            <div>
              {ctas.map((cta) => (
                <article key={cta.id}>
                  <label>
                    Nøgle
                    <input
                      value={cta.cta_key}
                      onChange={(event) =>
                        updateCta(
                          cta.id,
                          "cta_key",
                          event.target.value,
                        )
                      }
                    />
                  </label>

                  <label>
                    Label
                    <input
                      value={cta.label}
                      onChange={(event) =>
                        updateCta(
                          cta.id,
                          "label",
                          event.target.value,
                        )
                      }
                    />
                  </label>

                  <label>
                    URL
                    <input
                      type="url"
                      value={cta.url}
                      onChange={(event) =>
                        updateCta(
                          cta.id,
                          "url",
                          event.target.value,
                        )
                      }
                    />
                  </label>

                  <label>
                    Variant
                    <select
                      value={cta.variant}
                      onChange={(event) =>
                        updateCta(
                          cta.id,
                          "variant",
                          event.target.value,
                        )
                      }
                    >
                      <option value="primary">Primary</option>
                      <option value="secondary">Secondary</option>
                      <option value="text">Text</option>
                    </select>
                  </label>

                  <label>
                    Placering
                    <select
                      value={cta.placement}
                      onChange={(event) =>
                        updateCta(
                          cta.id,
                          "placement",
                          event.target.value,
                        )
                      }
                    >
                      <option value="hero">Hero</option>
                      <option value="content">Content</option>
                      <option value="final">Final</option>
                    </select>
                  </label>

                  <label>
                    Sortering
                    <input
                      type="number"
                      value={cta.sort_order}
                      onChange={(event) =>
                        updateCta(
                          cta.id,
                          "sort_order",
                          event.target.value,
                        )
                      }
                    />
                  </label>

                  <label className="admin-checkbox">
                    <input
                      type="checkbox"
                      checked={cta.is_external}
                      onChange={(event) =>
                        updateCta(
                          cta.id,
                          "is_external",
                          event.target.checked,
                        )
                      }
                    />
                    Eksternt link
                  </label>

                  <label className="admin-checkbox">
                    <input
                      type="checkbox"
                      checked={cta.is_published}
                      onChange={(event) =>
                        updateCta(
                          cta.id,
                          "is_published",
                          event.target.checked,
                        )
                      }
                    />
                    Publiceret
                  </label>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleSaveCta(cta)}
                  >
                    Gem CTA
                  </button>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => handleDeleteCta(cta)}
                  >
                    Slet CTA
                  </button>
                </article>
              ))}
            </div>
          )}

          <h3>Tilføj CTA</h3>

          <form onSubmit={handleCreateCta}>
            <label>
              Nøgle
              <input
                name="cta_key"
                value={newCta.cta_key}
                onChange={updateNewCta}
                required
              />
            </label>

            <label>
              Label
              <input
                name="label"
                value={newCta.label}
                onChange={updateNewCta}
                required
              />
            </label>

            <label>
              URL
              <input
                name="url"
                type="url"
                value={newCta.url}
                onChange={updateNewCta}
                required
              />
            </label>

            <label>
              Variant
              <select
                name="variant"
                value={newCta.variant}
                onChange={updateNewCta}
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="text">Text</option>
              </select>
            </label>

            <label>
              Placering
              <select
                name="placement"
                value={newCta.placement}
                onChange={updateNewCta}
              >
                <option value="hero">Hero</option>
                <option value="content">Content</option>
                <option value="final">Final</option>
              </select>
            </label>

            <label>
              Sortering
              <input
                name="sort_order"
                type="number"
                value={newCta.sort_order}
                onChange={updateNewCta}
              />
            </label>

            <label className="admin-checkbox">
              <input
                name="is_external"
                type="checkbox"
                checked={newCta.is_external}
                onChange={updateNewCta}
              />
              Eksternt link
            </label>

            <label className="admin-checkbox">
              <input
                name="is_published"
                type="checkbox"
                checked={newCta.is_published}
                onChange={updateNewCta}
              />
              Publiceret
            </label>

            <button type="submit" disabled={saving}>
              {saving ? "Opretter..." : "Tilføj CTA"}
            </button>
          </form>
        </section>
      )}
    </main>
  );
}
