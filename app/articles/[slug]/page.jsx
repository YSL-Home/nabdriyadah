import Link from "next/link";
import { notFound } from "next/navigation";
import articles from "../../../content/articles/seo-articles.json";
import ArticleImage from "../../components/ArticleImage";

const leagueBranding = {
  "premier-league": {
    title: "الدوري الإنجليزي الممتاز",
    href: "/league/premier-league/",
    leagueLogo: "https://media.api-sports.io/football/leagues/39.png",
    teams: [
      { name: "مانشستر سيتي", logo: "https://media.api-sports.io/football/teams/50.png" },
      { name: "مانشستر يونايتد", logo: "https://media.api-sports.io/football/teams/33.png" },
      { name: "ليفربول", logo: "https://media.api-sports.io/football/teams/40.png" },
      { name: "آرسنال", logo: "https://media.api-sports.io/football/teams/42.png" },
      { name: "تشيلسي", logo: "https://media.api-sports.io/football/teams/49.png" },
      { name: "توتنهام", logo: "https://media.api-sports.io/football/teams/47.png" }
    ],
    theme: { bg: "#f6f0ff", primary: "#6d28d9", primarySoft: "#ede9fe", border: "#ddd6fe", text: "#111827", subtext: "#4b5563", surface: "#ffffff" }
  },
  "la-liga": {
    title: "الدوري الإسباني",
    href: "/league/la-liga/",
    leagueLogo: "https://media.api-sports.io/football/leagues/140.png",
    teams: [
      { name: "ريال مدريد", logo: "https://media.api-sports.io/football/teams/541.png" },
      { name: "برشلونة", logo: "https://media.api-sports.io/football/teams/529.png" },
      { name: "أتلتيكو مدريد", logo: "https://media.api-sports.io/football/teams/530.png" },
      { name: "إشبيلية", logo: "https://media.api-sports.io/football/teams/536.png" },
      { name: "فالنسيا", logo: "https://media.api-sports.io/football/teams/532.png" },
      { name: "ريال سوسيداد", logo: "https://media.api-sports.io/football/teams/548.png" }
    ],
    theme: { bg: "#fff7ed", primary: "#ea580c", primarySoft: "#ffedd5", border: "#fed7aa", text: "#111827", subtext: "#4b5563", surface: "#ffffff" }
  },
  basketball: {
    title: "كرة السلة",
    href: "/sport/basketball/",
    leagueLogo: "/logo.svg",
    teams: [],
    theme: { bg: "#fff7ed", primary: "#c2410c", primarySoft: "#ffedd5", border: "#fed7aa", text: "#111827", subtext: "#4b5563", surface: "#ffffff" }
  },
  tennis: {
    title: "التنس",
    href: "/sport/tennis/",
    leagueLogo: "/logo.svg",
    teams: [],
    theme: { bg: "#f0fdf4", primary: "#15803d", primarySoft: "#dcfce7", border: "#bbf7d0", text: "#111827", subtext: "#4b5563", surface: "#ffffff" }
  },
  padel: {
    title: "البادل",
    href: "/sport/padel/",
    leagueLogo: "/logo.svg",
    teams: [],
    theme: { bg: "#eff6ff", primary: "#1d4ed8", primarySoft: "#dbeafe", border: "#bfdbfe", text: "#111827", subtext: "#4b5563", surface: "#ffffff" }
  },
  futsal: {
    title: "كرة قدم الصالات",
    href: "/sport/futsal/",
    leagueLogo: "/logo.svg",
    teams: [],
    theme: { bg: "#f5f3ff", primary: "#7c3aed", primarySoft: "#ede9fe", border: "#ddd6fe", text: "#111827", subtext: "#4b5563", surface: "#ffffff" }
  },
  mixed: {
    title: "كرة القدم",
    href: "/",
    leagueLogo: "/logo.svg",
    teams: [],
    theme: { bg: "#f3f4f6", primary: "#2563eb", primarySoft: "#eff6ff", border: "#dbeafe", text: "#111827", subtext: "#4b5563", surface: "#ffffff" }
  }
};

export function generateStaticParams() {
  return articles.map((article) => ({
    slug: article.slug
  }));
}

export function generateMetadata({ params }) {
  const article = articles.find((item) => item.slug === params.slug);

  if (!article) {
    return {
      title: "المقال غير موجود",
      description: "هذه الصفحة غير متوفرة حالياً."
    };
  }

  const canonicalUrl = `https://nabdriyadah.com/articles/${article.slug}/`;
  const imageUrl = article.image?.startsWith("http")
    ? article.image
    : `https://nabdriyadah.com${article.image}`;

  return {
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.description,
    keywords: (article.keywords || []).join("، "),
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: article.seoTitle || article.title,
      description: article.seoDescription || article.description,
      url: canonicalUrl,
      siteName: "نبض الرياضة",
      locale: "ar_AR",
      type: "article",
      images: [{ url: imageUrl, width: 1536, height: 1024, alt: article.title }]
    },
    twitter: {
      card: "summary_large_image",
      title: article.seoTitle || article.title,
      description: article.seoDescription || article.description,
      images: [imageUrl]
    }
  };
}

function formatDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("ar-SA-u-nu-latn", {
      day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
  } catch {
    return "";
  }
}

function leagueLabel(league, sport) {
  if (league === "premier-league") return "الدوري الإنجليزي الممتاز";
  if (league === "la-liga") return "الدوري الإسباني";
  if (sport === "basketball") return "كرة السلة";
  if (sport === "tennis") return "التنس";
  if (sport === "padel") return "البادل";
  if (sport === "futsal") return "كرة قدم الصالات";
  return "كرة القدم";
}

function sportHref(league, sport) {
  if (league === "premier-league") return "/league/premier-league/";
  if (league === "la-liga") return "/league/la-liga/";
  if (sport === "basketball") return "/sport/basketball/";
  if (sport === "tennis") return "/sport/tennis/";
  if (sport === "padel") return "/sport/padel/";
  if (sport === "futsal") return "/sport/futsal/";
  return "/";
}

function scoreRelatedness(baseArticle, otherArticle) {
  let score = 0;

  if (baseArticle.league === otherArticle.league) score += 5;

  const baseTags = baseArticle.topicTags || [];
  const otherTags = otherArticle.topicTags || [];
  const sharedTags = baseTags.filter((tag) => otherTags.includes(tag));
  score += sharedTags.length * 3;

  const baseKeywords = baseArticle.keywords || [];
  const otherKeywords = otherArticle.keywords || [];
  const sharedKeywords = baseKeywords.filter((keyword) =>
    otherKeywords.includes(keyword)
  );
  score += sharedKeywords.length * 2;

  return score;
}

export default function ArticlePage({ params }) {
  const article = articles.find((item) => item.slug === params.slug);

  if (!article) {
    notFound();
  }

  const brandingKey = leagueBranding[article.sport] ? article.sport
    : leagueBranding[article.league] ? article.league
    : "mixed";
  const branding = leagueBranding[brandingKey];
  const theme = branding.theme;

  const relatedArticles = articles
    .filter((item) => item.slug !== article.slug)
    .map((item) => ({ ...item, score: scoreRelatedness(article, item) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: theme.bg,
        padding: "32px 20px 48px",
        direction: "rtl"
      }}
    >
      <div style={{ maxWidth: "1320px", margin: "0 auto" }}>
        <div className="article-layout">
          <aside className="article-sidebar" style={{ display: "grid", gap: "22px" }}>
            <section
              style={{
                background: theme.surface,
                borderRadius: "24px",
                padding: "24px",
                border: `1px solid ${theme.border}`,
                boxShadow: "0 10px 26px rgba(0,0,0,0.04)"
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "16px"
                }}
              >
                <img
                  src={branding.leagueLogo}
                  alt={branding.title}
                  style={{
                    width: "54px",
                    height: "54px",
                    objectFit: "contain",
                    display: "block"
                  }}
                />
                <div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: theme.primary
                    }}
                  >
                    البطولة
                  </div>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: 800,
                      color: theme.text
                    }}
                  >
                    {branding.title}
                  </div>
                </div>
              </div>

              <div
                style={{
                  color: theme.subtext,
                  fontSize: "16px",
                  lineHeight: 1.95
                }}
              >
                يتناول هذا المقال آخر المستجدات المرتبطة بـ {branding.title} مع
                متابعة لأهم التفاصيل والخلفيات المرتبطة بالخبر.
              </div>
            </section>

            {branding.teams.length > 0 ? (
              <section
                style={{
                  background: theme.surface,
                  borderRadius: "24px",
                  padding: "24px",
                  border: `1px solid ${theme.border}`,
                  boxShadow: "0 10px 26px rgba(0,0,0,0.04)"
                }}
              >
                <h2
                  style={{
                    margin: "0 0 16px 0",
                    fontSize: "24px",
                    fontWeight: 800
                  }}
                >
                  أندية بارزة
                </h2>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: "12px"
                  }}
                >
                  {branding.teams.map((team, index) => (
                    <div
                      key={index}
                      style={{
                        background: theme.primarySoft,
                        border: `1px solid ${theme.border}`,
                        borderRadius: "18px",
                        padding: "12px 10px",
                        textAlign: "center"
                      }}
                    >
                      <img
                        src={team.logo}
                        alt={team.name}
                        style={{
                          width: "46px",
                          height: "46px",
                          objectFit: "contain",
                          display: "block",
                          margin: "0 auto 8px"
                        }}
                      />
                      <div
                        style={{
                          color: theme.primary,
                          fontSize: "13px",
                          fontWeight: 700,
                          lineHeight: 1.6
                        }}
                      >
                        {team.name}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            <section
              style={{
                background: theme.surface,
                borderRadius: "24px",
                padding: "24px",
                border: `1px solid ${theme.border}`,
                boxShadow: "0 10px 26px rgba(0,0,0,0.04)"
              }}
            >
              <h2
                style={{
                  margin: "0 0 16px 0",
                  fontSize: "24px",
                  fontWeight: 800
                }}
              >
                مقالات ذات صلة
              </h2>

              <div style={{ display: "grid", gap: "16px" }}>
                {relatedArticles.map((relatedArticle) => (
                  <Link
                    key={relatedArticle.slug}
                    href={`/articles/${relatedArticle.slug}/`}
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                      paddingBottom: "14px",
                      borderBottom: "1px solid #f3f4f6"
                    }}
                  >
                    <div
                      style={{
                        fontSize: "18px",
                        fontWeight: 800,
                        lineHeight: 1.7,
                        marginBottom: "6px"
                      }}
                    >
                      {relatedArticle.title}
                    </div>

                    <div
                      style={{
                        color: theme.subtext,
                        fontSize: "14px",
                        lineHeight: 1.8
                      }}
                    >
                      {relatedArticle.description}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </aside>

          <article
            className="article-main"
            style={{
              background: theme.surface,
              borderRadius: "28px",
              overflow: "hidden",
              border: `1px solid ${theme.border}`,
              boxShadow: "0 14px 34px rgba(0,0,0,0.05)"
            }}
          >
            <ArticleImage
              src={article.image}
              imageUrl={article.imageUrl}
              alt={article.title}
              sport={article.sport}
              league={article.league}
              slug={article.slug}
              style={{ width: "100%", height: "430px", display: "block" }}
            />

            <div className="article-pad">
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  marginBottom: "18px",
                  alignItems: "center"
                }}
              >
                <Link
                  href="/"
                  style={{
                    color: theme.primary,
                    textDecoration: "none",
                    fontWeight: 700,
                    fontSize: "14px"
                  }}
                >
                  الرئيسية
                </Link>

                <span style={{ color: "#9ca3af" }}>←</span>

                <Link
                  href={sportHref(article.league, article.sport)}
                  style={{ color: theme.primary, textDecoration: "none", fontWeight: 700, fontSize: "14px" }}
                >
                  {leagueLabel(article.league, article.sport)}
                </Link>

                {article.publishedAt && (
                  <>
                    <span style={{ color: "#9ca3af" }}>•</span>
                    <span style={{ color: "#9ca3af", fontSize: "13px" }}>{formatDate(article.publishedAt)}</span>
                  </>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "16px"
                }}
              >
                <img
                  src={branding.leagueLogo}
                  alt={branding.title}
                  style={{
                    width: "52px",
                    height: "52px",
                    objectFit: "contain",
                    display: "block"
                  }}
                />
                <div
                  style={{
                    display: "inline-block",
                    padding: "8px 14px",
                    borderRadius: "999px",
                    background: theme.primarySoft,
                    color: theme.primary,
                    fontSize: "13px",
                    fontWeight: 700
                  }}
                >
                  {branding.title}
                </div>
              </div>

              <h1
                className="article-h1"
                style={{
                  margin: "0 0 16px 0",
                  color: theme.text
                }}
              >
                {article.title}
              </h1>

              <p
                style={{
                  margin: "0 0 22px 0",
                  fontSize: "22px",
                  lineHeight: 2,
                  color: theme.subtext
                }}
              >
                {article.description}
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  marginBottom: "28px"
                }}
              >
                {(article.keywords || []).map((keyword, index) => (
                  <span
                    key={index}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "999px",
                      background: theme.primarySoft,
                      color: theme.primary,
                      fontSize: "14px",
                      fontWeight: 700
                    }}
                  >
                    {keyword}
                  </span>
                ))}
              </div>

              <div
                style={{
                  background: "#f8fafc",
                  border: `1px solid ${theme.border}`,
                  borderRadius: "20px",
                  padding: "20px 22px",
                  marginBottom: "28px"
                }}
              >
                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: 800,
                    color: theme.text,
                    marginBottom: "8px"
                  }}
                >
                  خلاصة سريعة
                </div>

                <div
                  style={{
                    color: theme.subtext,
                    fontSize: "17px",
                    lineHeight: 1.9
                  }}
                >
                  {article.seoDescription || article.description}
                </div>
              </div>

              <div
                style={{
                  height: "1px",
                  background: theme.border,
                  marginBottom: "28px"
                }}
              />

              <div
                style={{
                  fontSize: "20px",
                  lineHeight: 2.15,
                  color: theme.text,
                  whiteSpace: "pre-wrap"
                }}
              >
                {article.content}
              </div>

              {article.faq && article.faq.length > 0 && (
                <div style={{ marginTop: "36px" }}>
                  <div style={{ height: "1px", background: theme.border, marginBottom: "28px" }} />
                  <h2 style={{ margin: "0 0 22px 0", fontSize: "28px", fontWeight: 800, color: theme.text }}>
                    أسئلة شائعة
                  </h2>
                  <div style={{ display: "grid", gap: "16px" }}>
                    {article.faq.map((item, i) => (
                      <div key={i} style={{ background: theme.primarySoft, border: `1px solid ${theme.border}`, borderRadius: "18px", padding: "20px 22px" }}>
                        <div style={{ fontSize: "18px", fontWeight: 800, color: theme.primary, marginBottom: "10px" }}>
                          {item.q}
                        </div>
                        <div style={{ fontSize: "17px", lineHeight: 1.9, color: theme.text }}>
                          {item.a}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </article>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "NewsArticle",
                "headline": article.seoTitle || article.title,
                "description": article.seoDescription || article.description,
                "url": `https://nabdriyadah.com/articles/${article.slug}/`,
                "inLanguage": "ar",
                "publisher": {
                  "@type": "Organization",
                  "name": "نبض الرياضة",
                  "url": "https://nabdriyadah.com"
                },
                "keywords": (article.keywords || []).join(", ")
              },
              ...(article.faq && article.faq.length > 0 ? [{
                "@type": "FAQPage",
                "mainEntity": article.faq.map((f) => ({
                  "@type": "Question",
                  "name": f.q,
                  "acceptedAnswer": { "@type": "Answer", "text": f.a }
                }))
              }] : [])
            ]
          })
        }}
      />
    </main>
  );
}
