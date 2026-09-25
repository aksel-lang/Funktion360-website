import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase.js";

export function AdminProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProduct() {
      const { data, error: loadError } = await supabase
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
        .single();

      if (loadError) {
        console.error(loadError);
        setError("Produktet kunne ikke hentes.");
      } else {
        setForm({
          ...data,
          short_description: data.short_description ?? "",
          description: data.description ?? "",
          website_url: data.website_url ?? "",
        });
      }

      setLoading(false);
    }

    loadProduct();
  }, [id]);

  function updateField(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
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

    const { error: updateError } = await supabase
      .from("products")
      .update({
        status: publishing ? "published" : "draft",
        published_at: publishing ? new Date().toISOString() : null,
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
      published_at: publishing ? new Date().toISOString() : null,
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

  if (loading) {
    return <main><p>Henter produkt...</p></main>;
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
    </main>
  );
}
