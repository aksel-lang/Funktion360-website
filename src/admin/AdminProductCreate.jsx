import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";

export function AdminProductCreate() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    slug: "",
    short_description: "",
    description: "",
    website_url: "",
    sort_order: 0,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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

    const { error: insertError } = await supabase
      .from("products")
      .insert({
        name: form.name.trim(),
        slug: form.slug.trim(),
        short_description: form.short_description.trim() || null,
        description: form.description.trim() || null,
        website_url: form.website_url.trim() || null,
        sort_order: Number(form.sort_order) || 0,
        status: "draft",
        published_at: null,
      });

    if (insertError) {
      console.error(insertError);
      setError("Produktet kunne ikke oprettes.");
      setSaving(false);
      return;
    }

    navigate("/admin", { replace: true });
  }

  return (
    <main>
      <button type="button" onClick={() => navigate("/admin")}>
        ← Tilbage
      </button>

      <h1>Opret produkt</h1>

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
            placeholder="eksempel-produkt"
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

        {error && <p role="alert">{error}</p>}

        <button type="submit" disabled={saving}>
          {saving ? "Opretter..." : "Opret som kladde"}
        </button>
      </form>
    </main>
  );
}
