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
  if (!a) return { title: "Article not found" };
  const title = a.en_title || a.sourceTitle || a.title;
  const desc  = a.en_description || a.description;
  return {
    title: `${title} | Sports Pulse`,
    description: desc?.slice(0, 160),
    alternates: { canonical: `https://nabdriyadah.com/en/articles/${params.slug}/` },
    openGraph: { title, description: desc?.slice(0, 160), type: "article" },
  };
}

/** Render plain-text article body as paragraphs (no dangerouslySetInnerHTML) */
function ArticleBody({ text, dir = "ltr" }) {
  if (!text) return null;
  const paragraphs = text.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
  return (
    <div dir={dir} style={{ fontSize: "18px", lineHeight: 2, color: "var(--text-1)", fontFamily: "Georgia, serif" }}>
      {paragraphs.map((p, i) => (
        <p key={i} style={{ marginBottom: "20px" }}>{p}</p>
      ))}
    </div>
  );
}

export default function EnArticlePage({ params }) {
  const article = articles.find(a => a.slug === params.slug);
  if (!article) return notFound();

  const title       = article.en_title       || article.sourceTitle || article.title;
  const description = article.en_description || article.description;
  // Only show English body when truly available — never fall back to Arabic content
  const hasEnContent = Boolean(article.en_content?.trim());

  const leagueHref = article.league && article.league !== "mixed"
    ? `/en/league/${article.league}/` : "/en/";

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-page)", padding: "0 0 60px", direction: "ltr" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "28px 24px 0" }}>
        <Link href={leagueHref} style={{ color: "var(--accent)", fontWeight: 700, textDecoration: "none", fontSize: "14px" }}>
          ← Back
        </Link>

        <h1 style={{ fontSize: "clamp(22px, 4vw, 38px)", fontWeight: 900, color: "var(--text-1)", lineHeight: 1.3, margin: "18px 0 14px" }}>
          {title}
        </h1>

        <p style={{ fontSize: "17px", color: "var(--text-2)", lineHeight: 1.75, marginBottom: "24px", fontStyle: "italic" }}>
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

        <AdSlot label="Advertisement" minHeight={90} style={{ marginBottom: 28 }} />

        {/* Article body */}
        <div style={{
          background: "var(--bg-card)", borderRadius: "20px", padding: "32px",
          border: "1px solid var(--border)", boxShadow: "var(--shadow)"
        }}>
          {hasEnContent ? (
            <ArticleBody text={article.en_content} dir="ltr" />
          ) : (
            <div style={{
              textAlign: "center", padding: "40px 20px",
              color: "var(--text-2)", fontSize: "16px", lineHeight: 1.8
            }}>
              <div style={{ fontSize: "40px", marginBottom: "16px" }}>🔄</div>
              <p style={{ fontWeight: 700, color: "var(--text-1)", marginBottom: "10px", fontSize: "18px" }}>
                Full English article coming soon.
              </p>
              <p style={{ marginBottom: "16px" }}>
                Our team is currently translating this article. Check back shortly for the full English version.
              </p>
              {description && (
                <p style={{ fontSize: "15px", fontStyle: "italic", color: "var(--text-2)", maxWidth: "600px", margin: "0 auto" }}>
                  {description}
                </p>
              )}
            </div>
          )}

          {/* Source */}
          {article.source && (
            <p style={{ marginTop: "28px", fontSize: "13px", color: "var(--text-3)" }}>
              Source: {article.source}
            </p>
          )}
        </div>

        {/* FAQ */}
        {article.faq?.length > 0 && (
          <section style={{ marginTop: "28px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 800, marginBottom: "14px", color: "var(--text-1)" }}>Frequently Asked Questions</h2>
            <div style={{ display: "grid", gap: "12px" }}>
              {article.faq.map((f, i) => (
                <details key={i} style={{ background: "var(--bg-card)", borderRadius: "14px", padding: "16px 20px", border: "1px solid var(--border)" }}>
                  <summary style={{ fontWeight: 700, cursor: "pointer", fontSize: "15px", color: "var(--text-1)" }}>
                    {f.q}
                  </summary>
                  <p style={{ marginTop: "10px", fontSize: "14px", color: "var(--text-2)", lineHeight: 1.7 }}>{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "NewsArticle",
              "headline": title,
              "description": description,
              "url": `https://nabdriyadah.com/en/articles/${article.slug}/`,
              "inLanguage": "en",
              "datePublished": article.publishedAt || undefined,
              "dateModified": article.publishedAt || undefined,
              "articleSection": article.sport || "football",
              "image": article.image?.startsWith("http") ? article.image : article.image ? `https://nabdriyadah.com${article.image}` : undefined,
              "keywords": (article.keywords || []).join(", "),
              "author": { "@type": "Organization", "name": "Sports Pulse", "url": "https://nabdriyadah.com/en/" },
              "publisher": {
                "@type": "Organization",
                "name": "Sports Pulse",
                "url": "https://nabdriyadah.com",
                "logo": { "@type": "ImageObject", "url": "https://nabdriyadah.com/logo-v2.svg" }
              },
              "mainEntityOfPage": { "@type": "WebPage", "@id": `https://nabdriyadah.com/en/articles/${article.slug}/` }
            },
            ...(article.faq?.length > 0 ? [{
              "@type": "FAQPage",
              "mainEntity": article.faq.map(f => ({ "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a } }))
            }] : [])
          ]
        })}} />
      </div>
    </main>
  );
}
