import Link from "next/link";
import { notFound } from "next/navigation";
import articles from "../../../../content/articles/seo-articles.json";
import ArticleImage from "../../../components/ArticleImage";
import AdSlot from "../../../components/AdSlot";

export function generateStaticParams() {
  return articles.filter(a => a.slug).map(a => ({ slug: a.slug }));
}

export function generateMetadata({ params }) {
  const a = articles.find(x => x.slug === params.slug);
  if (!a) return { title: "Article introuvable" };
  const title = a.fr_title || a.sourceTitle || a.title;
  const desc  = a.fr_description || a.description;
  return {
    title: `${title} | Sports Pulse`,
    description: desc?.slice(0, 160),
    alternates: { canonical: `https://nabdriyadah.com/fr/articles/${params.slug}/` },
    openGraph: { title, description: desc?.slice(0, 160), type: "article" },
  };
}

export default function FrArticlePage({ params }) {
  const article = articles.find(a => a.slug === params.slug);
  if (!article) return notFound();

  const title       = article.fr_title       || article.sourceTitle || article.title;
  const description = article.fr_description || article.description;

  const leagueHref = article.league && article.league !== "mixed"
    ? `/fr/league/${article.league}/` : "/fr/";

  return (
    <main style={{ minHeight: "100vh", background: "#f8fafc", padding: "0 0 60px", direction: "ltr" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "28px 24px 0" }}>
        <Link href={leagueHref} style={{ color: "#1d4ed8", fontWeight: 700, textDecoration: "none", fontSize: "14px" }}>
          ← Retour
        </Link>

        <h1 style={{ fontSize: "clamp(22px, 4vw, 38px)", fontWeight: 900, color: "#111827", lineHeight: 1.3, margin: "18px 0 14px" }}>
          {title}
        </h1>

        <p style={{ fontSize: "17px", color: "#4b5563", lineHeight: 1.75, marginBottom: "24px", fontStyle: "italic" }}>
          {description}
        </p>

        <ArticleImage
          src={article.image}
          imageUrl={article.imageUrl}
          alt={title}
          sport={article.sport}
          league={article.league}
          slug={article.slug}
          style={{ width: "100%", maxHeight: "420px", objectFit: "cover", borderRadius: "20px", display: "block", marginBottom: "28px" }}
        />

        <AdSlot label="Publicité" minHeight={90} style={{ marginBottom: 28 }} />

        <div style={{
          background: "white", borderRadius: "20px", padding: "32px",
          border: "1px solid #e5e7eb", boxShadow: "0 4px 16px rgba(0,0,0,0.04)"
        }}>
          <div style={{
            background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "12px",
            padding: "14px 18px", marginBottom: "24px", fontSize: "14px", color: "#1d4ed8", fontWeight: 600
          }}>
            📖 Article complet en arabe — titre et résumé traduits ci-dessus
          </div>

          <div
            dir="rtl"
            style={{ fontSize: "17px", lineHeight: 2, color: "#1f2937", fontFamily: "serif" }}
            dangerouslySetInnerHTML={{ __html: (article.content || "").replace(/\n\n/g, "</p><p>").replace(/^/, "<p>").replace(/$/, "</p>") }}
          />

          {article.source && (
            <p style={{ marginTop: "28px", fontSize: "13px", color: "#9ca3af" }}>
              Source : {article.source}
            </p>
          )}
        </div>

        {article.faq?.length > 0 && (
          <section style={{ marginTop: "28px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "14px" }}>Questions fréquentes</h2>
            <div style={{ display: "grid", gap: "12px" }}>
              {article.faq.map((f, i) => (
                <details key={i} style={{ background: "white", borderRadius: "14px", padding: "16px 20px", border: "1px solid #e5e7eb" }}>
                  <summary style={{ fontWeight: 700, cursor: "pointer", fontSize: "15px", color: "#111827" }}>
                    {f.q}
                  </summary>
                  <p style={{ marginTop: "10px", fontSize: "14px", color: "#4b5563", lineHeight: 1.7 }}>{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          "headline": title,
          "description": description,
          "datePublished": article.publishedAt,
          "inLanguage": "fr",
          "url": `https://nabdriyadah.com/fr/articles/${article.slug}/`,
          "publisher": { "@type": "Organization", "name": "Sports Pulse" }
        })}} />
      </div>
    </main>
  );
}
