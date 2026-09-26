import { supabase } from "./lib/supabase.js";
import { useEffect, useState } from "react";
import './styles.css';

const services = [
  ['01','Webapplikationer','Brugervenlige løsninger bygget til en konkret opgave.'],
  ['02','Interne systemer','Værktøjer, der understøtter arbejdet bag kulissen.'],
  ['03','Digitale arbejdsredskaber','Software, som passer til mennesker og arbejdsgange.'],
  ['04','Prototyper og MVP’er','En første version, der kan afprøves og forbedres.'],
  ['05','AI-integrationer','AI, hvor teknologien løser en reel opgave.'],
  ['06','Automatisering','Mindre gentaget arbejde. Mere tid til det vigtige.']
];
const stages = [
  ['01','Problem','Vi finder den konkrete udfordring og forstår dem, der skal bruge løsningen.'],
  ['02','Prototype','Vi bygger tidligt og gør idéen til noget, der kan prøves.'],
  ['03','Test','Vi afprøver, lærer og forbedrer i korte iterationer.'],
  ['04','Produkt','Vi gør løsningen klar til brug, videreudvikling og drift.']
];
const principles = [
  ['Security','Sikkerhed tænkes ind fra starten.'],['Privacy','Data behandles med omtanke.'],
  ['Documentation','Beslutninger og løsninger dokumenteres.'],['Testing','Funktion og kvalitet afprøves.'],
  ['Operations','Software skal også fungere i drift.']
];

export function App(){
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      const { data, error } = await supabase
        .from("products")
        .select(`
          id,
          name,
          slug,
          short_description,
          website_url,
          sort_order,
          published_at,
          product_features (
            id,
            title,
            description,
            sort_order
            )
        `)
        .eq("status", "published")
        .lte("published_at", new Date().toISOString())
        .order("sort_order", { ascending: true });

      if (!active) return;

      if (error) {
        console.error("Kunne ikke hente produkter:", error);
        return;
      }

      setProducts(data ?? []);
    }

    loadProducts();

    return () => {
      active = false;
    };
  }, []);

  const [open,setOpen]=useState(false);
  const close=()=>setOpen(false);
  return <>
    <a className="skip" href="#indhold">Gå til indhold</a>
    <div className="dark" id="top">
      <header className="header wrap">
        <a className="brand" href="#top" onClick={close} aria-label="Funktion360, til toppen">Funktion<span>360</span></a>
        <button className="menu" type="button" aria-expanded={open} aria-controls="navigation" onClick={()=>setOpen(!open)}>{open?'Luk':'Menu'} <span aria-hidden="true">{open?'×':'+'}</span></button>
        <nav className={open?'nav open':'nav'} id="navigation" aria-label="Hovednavigation">
          <a href="#specialsoftware" onClick={close}>Specialsoftware</a><a href="#metode" onClick={close}>Metode</a><a href="#produkter" onClick={close}>Produkter</a><a href="#ansvar" onClick={close}>Ansvar</a><a href="#om" onClick={close}>Om os</a><a className="nav-cta" href="#kontakt" onClick={close}>Arbejd med os ↗</a>
        </nav>
      </header>
      <main id="indhold"><section className="hero wrap" aria-labelledby="hero-title">
        <div><p className="eyebrow">Dansk softwarestudio</p><h1 id="hero-title">Software med<br/>funktion.<br/><em>Bygget med fart.</em></h1>
          <p className="intro">Funktion360 er et dansk softwarestudio, der udvikler digitale produkter og specialbyggede systemer. Vi kombinerer domæneviden, moderne teknologi og AI-assisteret udvikling for at gå hurtigt fra problem til fungerende software.</p>
          <div className="actions"><a className="button lime" href="#produkter">Se vores produkter ↗</a><a className="button outline" href="#kontakt">Arbejd med os</a></div>
        </div><div className="hero-art" aria-hidden="true"><img src="/orbit.png" alt=""/><p>Idéer.<br/>Systemer.<br/>Mennesker.<br/>I bevægelse.</p></div>
      </section></main>
      <div className="hero-footer wrap"><span>Specialsoftware</span><span>Moderne teknologi</span><span>AI-assisteret udvikling</span><span>Vibe coding</span></div>
    </div>

    <section className="section services" id="specialsoftware"><div className="wrap">
      <div className="section-head"><div><p className="eyebrow">01 / Specialsoftware</p><h2>Digitale løsninger,<br/>der passer til virkeligheden.</h2></div><p>Vi bygger software ud fra konkrete problemer og arbejdsgange. Nogle gange er det en prototype. Andre gange er det et helt system, som skal fungere hver dag.</p></div>
      <div className="service-grid">{services.map(([n,title,body])=><article className="service" key={n}><span className="number">{n}</span><div><h3>{title}</h3><p>{body}</p></div></article>)}</div>
      <a className="text-link" href="#kontakt">Fortæl os om jeres idé ↗</a>
    </div></section>

    <section className="section method" id="metode"><div className="wrap">
      <div className="section-head"><div><p className="eyebrow">02 / Vores måde at bygge på</p><h2>Fra problem<br/>til produkt.</h2></div><p>Vi arbejder i korte iterationer. AI kan give fart til udviklingen, men domæneforståelse, tekniske valg, test og ansvar ligger stadig hos mennesker.</p></div>
      <ol className="stages">{stages.map(([n,title,body])=><li key={n}><span className={n==='04'?'stage active':'stage'}>{n}</span><h3>{title}</h3><p>{body}</p></li>)}</ol>
      <div className="note"><strong>Vibe coding, med faglig retning.</strong><p>Vi bruger moderne værktøjer til at lære hurtigt og bygge målrettet. Løsningerne skal også kunne forstås, testes og vedligeholdes.</p></div>
    </div></section>

    <section className="section products" id="produkter"><div className="wrap">
      <div className="section-head"><div><p className="eyebrow">03 / Egne produkter</p><h2>Idéer bliver også<br/>til egne produkter.</h2></div><p>Vi udvikler egne løsninger ud fra behov, vi ser i praksis. Produktoversigten kan vokse, når nye idéer bliver til software.</p></div>
      {products.map((product, index) => (
        <div className="product" key={product.id}>
          <div className="product-mark">
            {product.name.charAt(0).toUpperCase()}<span>360</span>
          </div>

          <div>
            <small>
              Produkt {String(index + 1).padStart(2, "0")}
            </small>

            <h3>{product.name}</h3>

            {product.product_features?.length > 0 && (
  <ul className="product-features">
    {product.product_features
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((feature) => (
        <li className="product-feature" key={feature.id}>
          <strong>{feature.title}</strong>
          {feature.description && (
            <p>{feature.description}</p>
          )}
        </li>
      ))}
  </ul>
)}
          </div>

          <span className="status">Under udvikling</span>
        </div>
      ))}
    </div></section>

    <section className="section responsibility" id="ansvar"><div className="wrap">
      <div className="section-head"><div><p className="eyebrow">04 / Ansvarlig software</p><h2>Hurtigt bygget.<br/>Grundigt tænkt.</h2></div><p>Hurtige iterationer stiller krav til kvalitet. Når software bruges af organisationer og i socialområdet, er sikkerhed, databeskyttelse og pålidelig drift en del af arbejdet.</p></div>
      <div className="principles">{principles.map(([title,body])=><div className="principle" key={title}><span className="dot" aria-hidden="true"/><h3>{title}</h3><p>{body}</p></div>)}</div>
      <p className="tech">Vi arbejder blandt andet med <strong>TypeScript, Next.js, React, Supabase, PostgreSQL, moderne cloud-infrastruktur og AI/LLM-integrationer.</strong> Valget af teknologi følger altid opgaven.</p>
    </div></section>

    <section className="section about" id="om"><div className="wrap split"><div><p className="eyebrow">05 / Om Funktion360</p><h2>Et lille studio.<br/><em>Store ambitioner.</em></h2></div><div><p>Funktion360 er et lille dansk softwarestudio. Vi bygger ud fra konkrete problemer frem for teknologi for teknologiens skyld.</p><p>Det giver korte beslutningsveje, plads til eksperimenter og mulighed for at forbedre en løsning hurtigt sammen med dem, der skal bruge den.</p></div></div></section>
    <section className="contact" id="kontakt"><div className="wrap split"><div><p className="eyebrow">06 / Kontakt</p><h2>Har du en idé,<br/>vi skal bygge på?</h2></div><div><p>Vi hører gerne om specialudvikling, samarbejde, produktlicenser, partnerskaber og andre henvendelser.</p><a className="button lime" href="mailto:kontakt@funktion360.dk?subject=Henvendelse%20til%20Funktion360">Skriv til os ↗</a></div></div></section>
    <footer className="footer"><div className="wrap footer-inner"><a className="brand" href="#top">Funktion<span>360</span></a><p>Software med funktion. Bygget med fart.</p><a href="#top">Til toppen ↑</a></div></footer>
  </>;
}
