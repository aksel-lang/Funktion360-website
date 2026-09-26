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
    lifecycle_status: "development",
    show_on_homepage: true,
    sort_order: 0,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function updateField(event) {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
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
      lifecycle_status: form.lifecycle_status,
      show_on_homepage: form.show_on_homepage,
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
    <main className="admin-editor">
      <button
        className="admin-back"
        type="button"
        onClick={() => navigate("/admin")}
      >
        ← Tilbage
      </button>

      <h1>Opret produkt</h1>

      <section>
        <h2>Produkt</h2>
        <p>Opret et nyt produkt som kladde. Indhold og publicering kan administreres bagefter.</p>

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
        </label>      <label>
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

      <label>
        <input
          name="show_on_homepage"
          type="checkbox"
          checked={form.show_on_homepage}
          onChange={updateField}
        />
        Vis produkt på forsiden
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
      </section>
    </main>
  );
}
