import Link from "next/link";
import { notFound } from "next/navigation";
import articles from "../../../content/articles/seo-articles.json";
import AdSlot from "../../components/AdSlot";

const footballLeagues = [
  { slug: "premier-league", title: "الدوري الإنجليزي الممتاز", country: "إنجلترا", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", color: "#6d28d9", bg: "#ede9fe", border: "#ddd6fe", logo: "/leagues/premier-league.png" },
  { slug: "la-liga", title: "الدوري الإسباني", country: "إسبانيا", flag: "🇪🇸", color: "#ea580c", bg: "#fff7ed", border: "#fed7aa", logo: "/leagues/la-liga.png" },
  { slug: "bundesliga", title: "البوندسليغا", country: "ألمانيا", flag: "🇩🇪", color: "#dc2626", bg: "#fee2e2", border: "#fecaca", logo: "/leagues/bundesliga.png" },
  { slug: "serie-a", title: "الدوري الإيطالي", country: "إيطاليا", flag: "🇮🇹", color: "#b45309", bg: "#fef3c7", border: "#fde68a", logo: "/leagues/serie-a.png" },
  { slug: "ligue-1", title: "الدوري الفرنسي", country: "فرنسا", flag: "🇫🇷", color: "#1d4ed8", bg: "#dbeafe", border: "#bfdbfe", logo: "/leagues/ligue-1.png" },
  { slug: "champions-league", title: "دوري أبطال أوروبا", country: "أوروبا", flag: "🏆", color: "#854d0e", bg: "#fef9c3", border: "#fef08a", logo: "/leagues/champions-league.png" },
  { slug: "saudi-pro-league", title: "الدوري السعودي للمحترفين", country: "السعودية", flag: "🇸🇦", color: "#15803d", bg: "#dcfce7", border: "#bbf7d0", logo: "/leagues/saudi-pro-league.png" },
  { slug: "eredivisie", title: "الدوري الهولندي", country: "هولندا", flag: "🇳🇱", color: "#b91c1c", bg: "#fee2e2", border: "#fecaca", logo: "/leagues/eredivisie.png" }
];

const sportConfig = {
  football: {
    title: "كرة القدم",
    slug: "football",
    description: "تغطية شاملة لأبرز دوريات كرة القدم العالمية — من البريميرليغ إلى الدوري السعودي.",
    icon: "⚽",
    colorFrom: "#0f172a",
    colorTo: "#1d4ed8",
    primary: "#1d4ed8",
    primarySoft: "#eff6ff",
    border: "#bfdbfe",
    pageBg: "#eff6ff",
    highlights: ["أبرز الدوريات العالمية", "8 بطولات كبرى", "انتقالات وأخبار", "تحليلات ونتائج"],
    isFootball: true
  },
  basketball: {
    title: "كرة السلة",
    slug: "basketball",
    description: "تابع أحدث أخبار كرة السلة والـ NBA وأبرز المباريات والانتقالات.",
    icon: "🏀",
    colorFrom: "#c2410c",
    colorTo: "#ea580c",
    primary: "#ea580c",
    primarySoft: "#fff7ed",
    border: "#fed7aa",
    pageBg: "#fff7ed",
    highlights: ["أخبار الـ NBA", "أبرز اللاعبين", "نتائج المباريات", "انتقالات كرة السلة"]
  },
  tennis: {
    title: "التنس",
    slug: "tennis",
    description: "تغطية شاملة لأخبار التنس العالمي، بطولات غراند سلام، وأبرز اللاعبين.",
    icon: "🎾",
    colorFrom: "#15803d",
    colorTo: "#16a34a",
    primary: "#16a34a",
    primarySoft: "#f0fdf4",
    border: "#bbf7d0",
    pageBg: "#f0fdf4",
    highlights: ["غراند سلام", "أبرز اللاعبين", "بطولة ويمبلدون", "رولان غاروس"]
  },
  padel: {
    title: "البادل",
    slug: "padel",
    description: "أخبار رياضة البادل العالمية، أبرز البطولات واللاعبين والمستجدات.",
    icon: "🏸",
    colorFrom: "#1d4ed8",
    colorTo: "#2563eb",
    primary: "#2563eb",
    primarySoft: "#eff6ff",
    border: "#bfdbfe",
    pageBg: "#eff6ff",
    highlights: ["World Padel Tour", "بطولات البادل", "أبرز اللاعبين", "تطور الرياضة"]
  },
  futsal: {
    title: "كرة قدم الصالات",
    slug: "futsal",
    description: "أحدث أخبار كرة قدم الصالات، بطولات الفوتسال ونتائج المباريات.",
    icon: "⚽",
    colorFrom: "#7c3aed",
    colorTo: "#9333ea",
    primary: "#7c3aed",
    primarySoft: "#f5f3ff",
    border: "#ddd6fe",
    pageBg: "#f5f3ff",
    highlights: ["فوتسال إندور", "بطولات الصالات", "أبرز الأندية", "نتائج المباريات"]
  }
};

export function generateStaticParams() {
  return Object.keys(sportConfig).map((slug) => ({ slug }));
}

export function generateMetadata({ params }) {
  const sport = sportConfig[params.slug];
  if (!sport) return { title: "القسم غير موجود" };

  return {
    title: sport.title,
    description: sport.description,
    alternates: { canonical: `https://nabdriyadah.com/sport/${params.slug}/` },
    openGraph: {
      title: sport.title,
      description: sport.description,
      url: `https://nabdriyadah.com/sport/${params.slug}/`,
      siteName: "نبض الرياضة",
      locale: "ar_AR",
      type: "website"
    }
  };
}

export default function SportPage({ params }) {
  const sport = sportConfig[params.slug];
  if (!sport) notFound();

  const sportArticles = articles
    .filter((a) => a.sport === params.slug || a.sport === "football" && params.slug === "football")
    .slice(0, 8);

  const featuredArticle = sportArticles[0] || null;
  const restArticles = sportArticles.slice(1);

  if (sport.isFootball) {
    return (
      <main style={{ minHeight: "100vh", background: sport.pageBg, padding: "28px 20px 52px", direction: "rtl" }}>
        <div style={{ maxWidth: "1450px", margin: "0 auto" }}>

          {/* Football Hero */}
          <section style={{ position: "relative", overflow: "hidden", background: `linear-gradient(135deg, ${sport.colorFrom}, ${sport.colorTo})`, borderRadius: "34px", padding: "40px 34px", color: "white", marginBottom: "28px", boxShadow: "0 18px 42px rgba(0,0,0,0.12)" }}>
            <div style={{ position: "absolute", top: "-60px", left: "-60px", width: "200px", height: "200px", borderRadius: "999px", background: "rgba(255,255,255,0.07)" }} />
            <div style={{ position: "absolute", bottom: "-80px", right: "-40px", width: "220px", height: "220px", borderRadius: "999px", background: "rgba(255,255,255,0.07)" }} />
            <div style={{ position: "relative" }}>
              <Link href="/" style={{ display: "inline-block", textDecoration: "none", color: "white", fontWeight: 700, fontSize: "14px", opacity: 0.9, marginBottom: "16px" }}>← الرئيسية</Link>
              <div style={{ display: "flex", alignItems: "center", gap: "18px", marginBottom: "14px" }}>
                <span style={{ fontSize: "64px" }}>{sport.icon}</span>
                <h1 style={{ margin: 0, fontSize: "56px", lineHeight: 1.2, fontWeight: 800 }}>{sport.title}</h1>
              </div>
              <p style={{ margin: "0 0 20px 0", maxWidth: "800px", fontSize: "20px", lineHeight: 1.9, opacity: 0.95 }}>{sport.description}</p>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                {sport.highlights.map((item, i) => (
                  <span key={i} style={{ background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.18)", padding: "8px 14px", borderRadius: "999px", fontSize: "13px", fontWeight: 700 }}>{item}</span>
                ))}
              </div>
            </div>
          </section>

          {/* Leagues Grid */}
          <section style={{ marginBottom: "28px" }}>
            <h2 style={{ margin: "0 0 18px 0", fontSize: "30px", fontWeight: 800, color: "#111827" }}>أبرز الدوريات العالمية</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "18px" }}>
              {footballLeagues.map((league) => (
                <Link key={league.slug} href={`/league/${league.slug}/`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div style={{ background: "white", border: `1px solid ${league.border}`, borderRadius: "24px", padding: "22px 18px", display: "flex", alignItems: "center", gap: "14px", boxShadow: "0 8px 20px rgba(0,0,0,0.04)" }}>
                    <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: league.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", flexShrink: 0 }}>
                      {league.flag}
                    </div>
                    <div>
                      <div style={{ color: league.color, fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>{league.country}</div>
                      <div style={{ fontSize: "16px", fontWeight: 800, color: "#111827", lineHeight: 1.4 }}>{league.title}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <AdSlot label="مساحة إعلانية" minHeight={90} style={{ marginBottom: 24 }} />

          {/* Football articles */}
          {sportArticles.length > 0 && (
            <section>
              <h2 style={{ margin: "0 0 18px 0", fontSize: "30px", fontWeight: 800, color: "#111827" }}>أحدث أخبار كرة القدم</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "20px" }}>
                {sportArticles.map((a) => (
                  <Link key={a.slug} href={`/articles/${a.slug}/`} style={{ textDecoration: "none", color: "inherit" }}>
                    <article style={{ background: "white", borderRadius: "22px", overflow: "hidden", border: "1px solid #e5e7eb", height: "100%" }}>
                      <img src={a.image} alt={a.title} style={{ width: "100%", height: "190px", objectFit: "cover", display: "block" }} />
                      <div style={{ padding: "18px" }}>
                        <h3 style={{ margin: "0 0 8px 0", fontSize: "18px", lineHeight: 1.6, fontWeight: 800, color: "#111827" }}>{a.title}</h3>
                        <p style={{ margin: 0, color: "#4b5563", fontSize: "14px", lineHeight: 1.8 }}>{a.description}</p>
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

  return (
    <main style={{ minHeight: "100vh", background: sport.pageBg, padding: "28px 20px 52px", direction: "rtl" }}>
      <div style={{ maxWidth: "1450px", margin: "0 auto" }}>

        {/* Hero */}
        <section
          style={{
            position: "relative",
            overflow: "hidden",
            background: `linear-gradient(135deg, ${sport.colorFrom}, ${sport.colorTo})`,
            borderRadius: "34px",
            padding: "40px 34px",
            color: "white",
            marginBottom: "28px",
            boxShadow: "0 18px 42px rgba(0,0,0,0.12)"
          }}
        >
          <div style={{ position: "absolute", top: "-60px", left: "-60px", width: "200px", height: "200px", borderRadius: "999px", background: "rgba(255,255,255,0.07)" }} />
          <div style={{ position: "absolute", bottom: "-80px", right: "-40px", width: "220px", height: "220px", borderRadius: "999px", background: "rgba(255,255,255,0.07)" }} />

          <div style={{ position: "relative" }}>
            <Link href="/" style={{ display: "inline-block", textDecoration: "none", color: "white", fontWeight: 700, fontSize: "14px", opacity: 0.9, marginBottom: "16px" }}>
              ← العودة إلى الرئيسية
            </Link>

            <div style={{ display: "flex", alignItems: "center", gap: "18px", marginBottom: "16px" }}>
              <span style={{ fontSize: "64px" }}>{sport.icon}</span>
              <h1 style={{ margin: 0, fontSize: "56px", lineHeight: 1.2, fontWeight: 800 }}>{sport.title}</h1>
            </div>

            <p style={{ margin: "0 0 20px 0", maxWidth: "800px", fontSize: "20px", lineHeight: 1.9, opacity: 0.95 }}>
              {sport.description}
            </p>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {sport.highlights.map((item, i) => (
                <span key={i} style={{ background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.18)", padding: "8px 14px", borderRadius: "999px", fontSize: "13px", fontWeight: 700 }}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <AdSlot label="مساحة إعلانية أعلى الصفحة" minHeight={90} style={{ marginBottom: 24 }} />

        {sportArticles.length === 0 ? (
          <section style={{ background: "white", borderRadius: "28px", padding: "40px", border: `1px solid ${sport.border}`, textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>{sport.icon}</div>
            <h2 style={{ margin: "0 0 12px 0", fontSize: "28px", fontWeight: 800 }}>محتوى قيد الإنشاء</h2>
            <p style={{ color: "#6b7280", fontSize: "18px", lineHeight: 1.9, maxWidth: "500px", margin: "0 auto" }}>
              يتم تجميع مواد {sport.title} تلقائياً. ستظهر المقالات فور اكتمال أول دورة تحديث للمحتوى.
            </p>
          </section>
        ) : (
          <>
            {/* Featured + sidebar */}
            {featuredArticle && (
              <section style={{ display: "grid", gridTemplateColumns: "1.3fr 0.7fr", gap: "24px", marginBottom: "28px" }}>
                <Link href={`/articles/${featuredArticle.slug}/`} style={{ textDecoration: "none", color: "inherit" }}>
                  <article style={{ background: "white", borderRadius: "28px", overflow: "hidden", border: `1px solid ${sport.border}`, boxShadow: "0 12px 30px rgba(0,0,0,0.05)", height: "100%" }}>
                    <img src={featuredArticle.image} alt={featuredArticle.title} style={{ width: "100%", height: "360px", objectFit: "cover", display: "block" }} />
                    <div style={{ padding: "28px" }}>
                      <div style={{ display: "inline-block", marginBottom: "12px", padding: "8px 14px", borderRadius: "999px", background: sport.primarySoft, color: sport.primary, fontSize: "13px", fontWeight: 700 }}>
                        الخبر الأبرز
                      </div>
                      <h2 style={{ margin: "0 0 12px 0", fontSize: "32px", lineHeight: 1.55, fontWeight: 800, color: "#111827" }}>
                        {featuredArticle.title}
                      </h2>
                      <p style={{ margin: 0, color: "#4b5563", fontSize: "17px", lineHeight: 1.9 }}>
                        {featuredArticle.description}
                      </p>
                    </div>
                  </article>
                </Link>

                <div style={{ display: "grid", gap: "16px", alignContent: "start" }}>
                  {restArticles.slice(0, 3).map((a) => (
                    <Link key={a.slug} href={`/articles/${a.slug}/`} style={{ textDecoration: "none", color: "inherit" }}>
                      <div style={{ background: "white", borderRadius: "22px", padding: "18px", border: `1px solid ${sport.border}`, display: "flex", gap: "14px", alignItems: "flex-start" }}>
                        <img src={a.image} alt={a.title} style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "14px", flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: "16px", fontWeight: 800, lineHeight: 1.55, color: "#111827", marginBottom: "6px" }}>{a.title}</div>
                          <div style={{ color: "#6b7280", fontSize: "14px", lineHeight: 1.7 }}>{a.description?.slice(0, 80)}...</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <AdSlot label="مساحة إعلانية وسط الصفحة" minHeight={120} style={{ marginBottom: 24 }} />

            {/* Grid of remaining articles */}
            {restArticles.slice(3).length > 0 && (
              <section>
                <h2 style={{ margin: "0 0 18px 0", fontSize: "34px", fontWeight: 800, color: "#111827" }}>
                  مزيد من أخبار {sport.title}
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "20px" }}>
                  {restArticles.slice(3).map((a) => (
                    <Link key={a.slug} href={`/articles/${a.slug}/`} style={{ textDecoration: "none", color: "inherit" }}>
                      <article style={{ background: "white", borderRadius: "24px", overflow: "hidden", border: `1px solid ${sport.border}`, height: "100%" }}>
                        <img src={a.image} alt={a.title} style={{ width: "100%", height: "200px", objectFit: "cover", display: "block" }} />
                        <div style={{ padding: "20px" }}>
                          <div style={{ display: "inline-block", marginBottom: "10px", padding: "6px 12px", borderRadius: "999px", background: sport.primarySoft, color: sport.primary, fontSize: "12px", fontWeight: 700 }}>
                            {sport.title}
                          </div>
                          <h3 style={{ margin: "0 0 10px 0", fontSize: "20px", lineHeight: 1.6, fontWeight: 800, color: "#111827" }}>{a.title}</h3>
                          <p style={{ margin: 0, color: "#4b5563", fontSize: "14px", lineHeight: 1.8 }}>{a.description}</p>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
