import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase.js";

export function AdminProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [features, setFeatures] = useState([]);
  const [newFeature, setNewFeature] = useState({
    title: "",
    description: "",
    sort_order: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [featureSaving, setFeatureSaving] = useState(false);
  const [error, setError] = useState("");
  const [featureError, setFeatureError] = useState("");

  useEffect(() => {
    async function loadData() {
      const [productResult, featuresResult] = await Promise.all([
        supabase
          .from("products")
          .select(`
            id,
            name,
            slug,
            short_description,
            description,
            status,
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

      setLoading(false);
    }

    loadData();
  }, [id]);

  function updateField(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
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

  return (
    <main>
      <button type="button" onClick={() => navigate("/admin")}>
        ← Tilbage
      </button>

      <h1>Rediger {form.name}</h1>

      <section>
        <h2>Produkt</h2>

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

          <p>
            Status: <strong>{form.status}</strong>
          </p>

          {error && <p role="alert">{error}</p>}

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
        </form>
      </section>

      <section>
        <h2>Produktfunktioner</h2>

        <p>
          Funktionerne kan senere vises på produktets offentlige side.
        </p>

        {featureError && <p role="alert">{featureError}</p>}

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
    </main>
  );
}