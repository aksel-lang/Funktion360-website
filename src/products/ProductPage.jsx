import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase.js";

export function ProductPage() {
  const { slug } = useParams();

  const [product, setProduct] = useState(null);
  const [features, setFeatures] = useState([]);
  const [audiences, setAudiences] = useState([]);
  const [sections, setSections] = useState([]);
  const [pricing, setPricing] = useState([]);
  const [ctas, setCtas] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      setLoading(true);
      setError("");

      const { data: productData, error: productError } = await supabase
        .from("products")
        .select(`
          id,
          name,
          slug,
          short_description,
          description,
          status,
          website_url,
          published_at
        `)
        .eq("slug", slug)
        .eq("status", "published")
        .not("published_at", "is", null)
        .lte("published_at", new Date().toISOString())
        .maybeSingle();

      if (cancelled) return;

      if (productError) {
        console.error(productError);
        setError("Produktet kunne ikke indlæses.");
        setLoading(false);
        return;
      }

      if (!productData) {
        setProduct(null);
        setLoading(false);
        return;
      }

      const [
        featuresResult,
        audiencesResult,
        sectionsResult,
        pricingResult,
        ctasResult,
      ] = await Promise.all([
        supabase
          .from("product_features")
          .select(`
            id,
            title,
            description,
            sort_order
          `)
          .eq("product_id", productData.id)
          .order("sort_order", { ascending: true }),

        supabase
          .from("product_audiences")
          .select(`
            id,
            audience_key,
            title,
            description,
            sort_order
          `)
          .eq("product_id", productData.id)
          .eq("is_published", true)
          .order("sort_order", { ascending: true }),

        supabase
          .from("product_sections")
          .select(`
            id,
            section_key,
            eyebrow,
            title,
            body,
            layout,
            sort_order
          `)
          .eq("product_id", productData.id)
          .eq("is_published", true)
          .order("sort_order", { ascending: true }),

        supabase
          .from("product_pricing")
          .select(`
            id,
            pricing_key,
            title,
            description,
            price_amount,
            price_currency,
            price_interval,
            price_label,
            badge,
            sort_order
          `)
          .eq("product_id", productData.id)
          .eq("is_published", true)
          .order("sort_order", { ascending: true }),

        supabase
          .from("product_ctas")
          .select(`
            id,
            cta_key,
            label,
            url,
            variant,
            placement,
            sort_order,
            is_external
          `)
          .eq("product_id", productData.id)
          .eq("is_published", true)
          .order("sort_order", { ascending: true }),
      ]);

      if (cancelled) return;

      const relatedError =
        featuresResult.error ||
        audiencesResult.error ||
        sectionsResult.error ||
        pricingResult.error ||
        ctasResult.error;

      if (relatedError) {
        console.error(relatedError);
        setError("Produktets indhold kunne ikke indlæses.");
        setLoading(false);
        return;
      }

      setProduct(productData);
      setFeatures(featuresResult.data ?? []);
      setAudiences(audiencesResult.data ?? []);
      setSections(sectionsResult.data ?? []);
      setPricing(pricingResult.data ?? []);
      setCtas(ctasResult.data ?? []);
      setLoading(false);
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <main className="product-page">
        <p>Indlæser produkt...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="product-page">
        <Link to="/">← Tilbage til Funktion360</Link>
        <h1>Der opstod en fejl</h1>
        <p>{error}</p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="product-page">
        <Link to="/">← Tilbage til Funktion360</Link>
        <h1>Produktet blev ikke fundet</h1>
        <p>
          Produktet findes ikke eller er ikke publiceret.
        </p>
      </main>
    );
  }

  const heroCtas = ctas.filter((cta) => cta.placement === "hero");
  const contentCtas = ctas.filter((cta) => cta.placement === "content");
  const finalCtas = ctas.filter((cta) => cta.placement === "final");

  return (
    <main className="product-page">
      <Link to="/">← Funktion360</Link>

      <section className="product-hero">
        <p>Et produkt fra Funktion360</p>

        <h1>{product.name}</h1>

        {product.short_description && (
          <p>{product.short_description}</p>
        )}

        {heroCtas.length > 0 && (
          <div className="product-cta-group">
            {heroCtas.map((cta) => (
              <a
                key={cta.id}
                href={cta.url}
                target={cta.is_external ? "_blank" : undefined}
                rel={cta.is_external ? "noreferrer" : undefined}
                className={`product-cta product-cta--${cta.variant}`}
              >
                {cta.label}
              </a>
            ))}
          </div>
        )}
      </section>

      {product.description && (
        <section className="product-introduction">
          <p>{product.description}</p>
        </section>
      )}

      {audiences.length > 0 && (
        <section className="product-audiences">
          <h2>Hvem er {product.name} til?</h2>

          <div className="product-grid">
            {audiences.map((audience) => (
              <article key={audience.id}>
                <h3>{audience.title}</h3>
                {audience.description && (
                  <p>{audience.description}</p>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {sections.map((section) => (
        <section
          key={section.id}
          className={`product-section product-section--${section.layout}`}
        >
          {section.eyebrow && (
            <p className="product-eyebrow">{section.eyebrow}</p>
          )}

          <h2>{section.title}</h2>

          {section.body && <p>{section.body}</p>}
        </section>
      ))}

      {features.length > 0 && (
        <section className="product-features">
          <h2>Funktioner</h2>

          <div className="product-grid">
            {features.map((feature) => (
              <article key={feature.id}>
                <h3>{feature.title}</h3>
                {feature.description && (
                  <p>{feature.description}</p>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {contentCtas.length > 0 && (
        <section className="product-content-ctas">
          <div className="product-cta-group">
            {contentCtas.map((cta) => (
              <a
                key={cta.id}
                href={cta.url}
                target={cta.is_external ? "_blank" : undefined}
                rel={cta.is_external ? "noreferrer" : undefined}
                className={`product-cta product-cta--${cta.variant}`}
              >
                {cta.label}
              </a>
            ))}
          </div>
        </section>
      )}

      {pricing.length > 0 && (
        <section className="product-pricing">
          <h2>Priser</h2>

          <div className="product-grid">
            {pricing.map((price) => (
              <article key={price.id}>
                {price.badge && <p>{price.badge}</p>}

                <h3>{price.title}</h3>

                {price.price_label && (
                  <strong>{price.price_label}</strong>
                )}

                {price.description && (
                  <p>{price.description}</p>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {finalCtas.length > 0 && (
        <section className="product-final-cta">
          <h2>Vil du vide mere om {product.name}?</h2>

          <div className="product-cta-group">
            {finalCtas.map((cta) => (
              <a
                key={cta.id}
                href={cta.url}
                target={cta.is_external ? "_blank" : undefined}
                rel={cta.is_external ? "noreferrer" : undefined}
                className={`product-cta product-cta--${cta.variant}`}
              >
                {cta.label}
              </a>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}