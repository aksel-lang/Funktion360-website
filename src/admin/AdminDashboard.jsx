import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";

export function AdminDashboard() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      const { data: userData } = await supabase.auth.getUser();
      setEmail(userData.user?.email ?? "");

      const { data, error: productsError } = await supabase
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
          created_at,
          updated_at,
          published_at
        `)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (productsError) {
        setError("Produkterne kunne ikke hentes.");
        console.error(productsError);
      } else {
        setProducts(data ?? []);
      }

      setLoadingProducts(false);
    }

    loadDashboard();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/admin/login", { replace: true });
  }

  return (
    <main>
      <header>
        <div>
          <p>Funktion360</p>
          <h1>Administration</h1>
        </div>

        <button type="button" onClick={handleLogout}>
          Log ud
        </button>
      </header>

      <section>
        <p>Logget ind som</p>
        <strong>{email}</strong>
      </section>

      <section>
        <div>
          <h2>Produkter</h2>
          <p>Administrér Funktion360s produkter.</p>
          <Link to="/admin/products/new">
            Opret produkt
          </Link>
        </div>

        {loadingProducts && <p>Henter produkter...</p>}

        {error && <p role="alert">{error}</p>}

        {!loadingProducts && !error && products.length === 0 && (
          <p>Der er endnu ingen produkter.</p>
        )}

        {!loadingProducts && products.length > 0 && (
          <div>
            {products.map((product) => (
              <article key={product.id}>
                <div>
                  <small>
                    {product.status === "published"
                      ? "Publiceret"
                      : "Kladde"}
                  </small>

                  <h3>{product.name}</h3>

                  {product.short_description && (
                    <p>{product.short_description}</p>
                  )}
                </div>

                <div>
                  <span>/{product.slug}</span>

                  {product.published_at && (
                    <span>
                      {" · "}
                      {new Date(product.published_at).toLocaleDateString(
                        "da-DK",
                      )}
                    </span>
                  )}

                  <Link to={`/admin/products/${product.id}/edit`}>
                    Rediger
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
