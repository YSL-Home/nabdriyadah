import Link from "next/link";
import { notFound } from "next/navigation";
import articles from "../../../content/articles/seo-articles.json";

const leagueMap = {
  "premier-league": {
    title: "الدوري الإنجليزي الممتاز",
    shortLabel: "EPL",
    description:
      "تابع آخر أخبار الدوري الإنجليزي الممتاز، أبرز المستجدات، والتحليلات الخاصة بالأندية واللاعبين.",
    theme: {
      pageBg: "#f6f0ff",
      heroFrom: "#3b0764",
      heroTo: "#7c3aed",
      primary: "#6d28d9",
      primarySoft: "#ede9fe",
      border: "#ddd6fe",
      cardBg: "#ffffff",
      text: "#111827",
      subtext: "#4b5563",
      badgeBg: "rgba(255,255,255,0.16)",
      badgeText: "#ffffff"
    },
    highlights: [
      "أخبار مانشستر سيتي ومانشستر يونايتد",
      "متابعة ليفربول وآرسنال وتشيلسي",
      "تحليلات المباريات والنتائج والسباق على القمة"
    ]
  },
  "la-liga": {
    title: "الدوري الإسباني",
    shortLabel: "LL",
    description:
      "أحدث أخبار الدوري الإسباني مع متابعة خاصة لريال مدريد وبرشلونة وأبرز ملفات الليغا.",
    theme: {
      pageBg: "#fff7ed",
      heroFrom: "#9a3412",
      heroTo: "#f97316",
      primary: "#ea580c",
      primarySoft: "#ffedd5",
      border: "#fed7aa",
      cardBg: "#ffffff",
      text: "#111827",
      subtext: "#4b5563",
      badgeBg: "rgba(255,255,255,0.16)",
      badgeText: "#ffffff"
    },
    highlights: [
      "متابعة ريال مدريد وبرشلونة",
      "رصد مستجدات الليغا أسبوعًا بأسبوع",
      "ملفات المدربين والنجوم والنتائج"
    ]
  }
};

function buildLogo(shortLabel, primary, secondary) {
  return (
    <div
      style={{
        width: "170px",
        height: "170px",
        borderRadius: "36px",
        background: `linear-gradient(135deg, ${primary}, ${secondary})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 18px 34px rgba(0,0,0,0.14)",
        border: "1px solid rgba(255,255,255,0.2)"
      }}
    >
      <div
        style={{
          width: "110px",
          height: "110px",
          borderRadius: "999px",
          background: "rgba(255,255,255,0.16)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: "30px",
          fontWeight: 800,
          letterSpacing: "0.5px"
        }}
      >
        {shortLabel}
      </div>
    </div>
  );
}

function getGridColumns(count) {
  if (count <= 1) return "minmax(0, 420px)";
  if (count === 2) return "repeat(2, minmax(0, 1fr))";
  if (count === 3) return "repeat(3, minmax(0, 1fr))";
  return "repeat(4, minmax(0, 1fr))";
}

export function generateStaticParams() {
  return Object.keys(leagueMap).map((slug) => ({ slug }));
}

export function generateMetadata({ params }) {
  const league = leagueMap[params.slug];

  if (!league) {
    return {
      title: "القسم غير موجود",
      description: "هذه الصفحة غير متاحة حالياً."
    };
  }

  return {
    title: league.title,
    description: league.description,
    alternates: {
      canonical: `https://nabdriyadah.com/league/${params.slug}/`
    },
    openGraph: {
      title: league.title,
      description: league.description,
      url: `https://nabdriyadah.com/league/${params.slug}/`,
      siteName: "نبض الرياضة",
      locale: "ar_AR",
      type: "website"
    }
  };
}

export default function LeaguePage({ params }) {
  const league = leagueMap[params.slug];

  if (!league) {
    notFound();
  }

  const theme = league.theme;

  const leagueArticles = articles
    .filter((article) => article.league === params.slug)
    .slice(0, 12);

  const featuredArticle = leagueArticles[0] || null;
  const otherArticles = leagueArticles.slice(1);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: theme.pageBg,
        padding: "28px 20px 52px",
        direction: "rtl"
      }}
    >
      <div style={{ maxWidth: "1440px", margin: "0 auto" }}>
        <section
          style={{
            position: "relative",
            overflow: "hidden",
            background: `linear-gradient(135deg, ${theme.heroFrom}, ${theme.heroTo})`,
            borderRadius: "34px",
            padding: "34px",
            color: "white",
            marginBottom: "28px",
            boxShadow: "0 18px 42px rgba(0,0,0,0.12)"
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-70px",
              left: "-70px",
              width: "220px",
              height: "220px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.08)"
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-90px",
              right: "-40px",
              width: "240px",
              height: "240px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.08)"
            }}
          />

          <div
            style={{
              position: "relative",
              display: "grid",
              gridTemplateColumns: "220px minmax(0, 1fr)",
              gap: "30px",
              alignItems: "center"
            }}
          >
            <div style={{ display: "flex", justifyContent: "center" }}>
              {buildLogo(league.shortLabel, theme.heroFrom, theme.heroTo)}
            </div>

            <div>
              <Link
                href="/"
                style={{
                  display: "inline-block",
                  textDecoration: "none",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "14px",
                  opacity: 0.95,
                  marginBottom: "14px"
                }}
              >
                العودة إلى الرئيسية
              </Link>

              <div
                style={{
                  display: "inline-block",
                  background: theme.badgeBg,
                  color: theme.badgeText,
                  padding: "10px 16px",
                  borderRadius: "999px",
                  fontSize: "13px",
                  fontWeight: 700,
                  marginBottom: "16px",
                  border: "1px solid rgba(255,255,255,0.15)"
                }}
              >
                صفحة فئة متخصصة
              </div>

              <h1
                style={{
                  margin: "0 0 14px 0",
                  fontSize: "58px",
                  lineHeight: 1.18,
                  fontWeight: 800
                }}
              >
                {league.title}
              </h1>

              <p
                style={{
                  margin: 0,
                  fontSize: "21px",
                  lineHeight: 2,
                  maxWidth: "900px",
                  opacity: 0.96
                }}
              >
                {league.description}
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  flexWrap: "wrap",
                  marginTop: "20px"
                }}
              >
                {league.highlights.map((item, index) => (
                  <span
                    key={index}
                    style={{
                      background: "rgba(255,255,255,0.14)",
                      border: "1px solid rgba(255,255,255,0.16)",
                      padding: "9px 14px",
                      borderRadius: "999px",
                      fontSize: "14px",
                      fontWeight: 700
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {featuredArticle ? (
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 0.8fr",
              gap: "24px",
              marginBottom: "28px"
            }}
          >
            <Link
              href={`/articles/${featuredArticle.slug}/`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <article
                style={{
                  background: theme.cardBg,
                  borderRadius: "28px",
                  overflow: "hidden",
                  border: `1px solid ${theme.border}`,
                  boxShadow: "0 12px 30px rgba(0,0,0,0.05)",
                  height: "100%"
                }}
              >
                <img
                  src={featuredArticle.image}
                  alt={featuredArticle.title}
                  style={{
                    width: "100%",
                    height: "360px",
                    objectFit: "cover",
                    display: "block"
                  }}
                />

                <div style={{ padding: "28px" }}>
                  <div
                    style={{
                      display: "inline-block",
                      marginBottom: "12px",
                      padding: "8px 13px",
                      borderRadius: "999px",
                      background: theme.primarySoft,
                      color: theme.primary,
                      fontSize: "13px",
                      fontWeight: 700
                    }}
                  >
                    الخبر الأبرز
                  </div>

                  <h2
                    style={{
                      margin: "0 0 14px 0",
                      fontSize: "34px",
                      lineHeight: 1.55,
                      fontWeight: 800,
                      color: theme.text
                    }}
                  >
                    {featuredArticle.title}
                  </h2>

                  <p
                    style={{
                      margin: 0,
                      color: theme.subtext,
                      fontSize: "18px",
                      lineHeight: 1.95
                    }}
                  >
                    {featuredArticle.description}
                  </p>
                </div>
              </article>
            </Link>

            <div
              style={{
                background: theme.cardBg,
                borderRadius: "28px",
                padding: "26px",
                border: `1px solid ${theme.border}`,
                boxShadow: "0 12px 30px rgba(0,0,0,0.05)"
              }}
            >
              <div
                style={{
                  color: theme.primary,
                  fontSize: "14px",
                  fontWeight: 700,
                  marginBottom: "10px"
                }}
              >
                هوية القسم
              </div>

              <h3
                style={{
                  margin: "0 0 12px 0",
                  fontSize: "28px",
                  fontWeight: 800,
                  lineHeight: 1.55,
                  color: theme.text
                }}
              >
                {league.title}
              </h3>

              <p
                style={{
                  margin: "0 0 18px 0",
                  color: theme.subtext,
                  fontSize: "17px",
                  lineHeight: 1.95
                }}
              >
                هذه الصفحة مخصصة لتجميع أبرز مواد {league.title} داخل الموقع بنفس
                الهوية البصرية الخاصة بالبطولة، مع ربط مباشر بأهم المقالات المرتبطة
                بها.
              </p>

              <div
                style={{
                  display: "grid",
                  gap: "12px"
                }}
              >
                {league.highlights.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      background: theme.primarySoft,
                      border: `1px solid ${theme.border}`,
                      color: theme.primary,
                      padding: "12px 14px",
                      borderRadius: "16px",
                      fontSize: "15px",
                      fontWeight: 700
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {leagueArticles.length === 0 ? (
          <section
            style={{
              background: theme.cardBg,
              borderRadius: "24px",
              padding: "28px",
              border: `1px solid ${theme.border}`,
              color: theme.subtext,
              fontSize: "18px",
              lineHeight: 1.9
            }}
          >
            لا توجد مواد كافية في هذا القسم حالياً. سيتم تحديث الصفحة تلقائياً مع وصول
            أخبار جديدة مرتبطة بهذه البطولة.
          </section>
        ) : (
          <section>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "18px",
                gap: "12px",
                flexWrap: "wrap"
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "38px",
                  fontWeight: 800,
                  color: theme.text
                }}
              >
                أحدث مواد {league.title}
              </h2>

              <div
                style={{
                  color: theme.subtext,
                  fontSize: "15px"
                }}
              >
                تغطية متخصصة بنفس هوية البطولة وصفحتها
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: getGridColumns(otherArticles.length || 1),
                gap: "22px",
                justifyContent: otherArticles.length <= 1 ? "start" : "stretch"
              }}
            >
              {(otherArticles.length ? otherArticles : leagueArticles).map((article, index) => (
                <Link
                  key={article.slug}
                  href={`/articles/${article.slug}/`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <article
                    style={{
                      background: theme.cardBg,
                      borderRadius: "24px",
                      overflow: "hidden",
                      border: `1px solid ${theme.border}`,
                      boxShadow: "0 12px 30px rgba(0,0,0,0.05)",
                      height: "100%"
                    }}
                  >
                    <div style={{ position: "relative" }}>
                      <img
                        src={article.image}
                        alt={article.title}
                        style={{
                          width: "100%",
                          height: "220px",
                          objectFit: "cover",
                          display: "block"
                        }}
                      />

                      <div
                        style={{
                          position: "absolute",
                          top: "14px",
                          right: "14px",
                          background: "rgba(255,255,255,0.94)",
                          color: theme.primary,
                          padding: "8px 12px",
                          borderRadius: "999px",
                          fontSize: "13px",
                          fontWeight: 700
                        }}
                      >
                        {index === 0 ? league.shortLabel : "مقال"}
                      </div>
                    </div>

                    <div style={{ padding: "22px" }}>
                      <div
                        style={{
                          display: "inline-block",
                          marginBottom: "12px",
                          padding: "8px 12px",
                          borderRadius: "999px",
                          background: theme.primarySoft,
                          color: theme.primary,
                          fontSize: "13px",
                          fontWeight: 700
                        }}
                      >
                        {league.title}
                      </div>

                      <h3
                        style={{
                          margin: "0 0 12px 0",
                          fontSize: "22px",
                          lineHeight: 1.6,
                          fontWeight: 800,
                          color: theme.text
                        }}
                      >
                        {article.title}
                      </h3>

                      <p
                        style={{
                          margin: 0,
                          color: theme.subtext,
                          fontSize: "16px",
                          lineHeight: 1.9
                        }}
                      >
                        {article.description}
                      </p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
