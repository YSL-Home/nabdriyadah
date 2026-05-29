import Link from "next/link";
import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import articles from "../../../../content/articles/seo-articles.json";

// Noms arabes et équipes pour les pilotes F1
const F1_DRIVER_META = {
  "kimi-antonelli": {
    nameAr: "كيمي أنتونيلي",
    countryAr: "إيطاليا",
    team: "Mercedes",
    teamAr: "مرسيدس",
    wins2026: 2,
    podiums2026: 4
  },
  "george-russell": {
    nameAr: "جورج راسل",
    countryAr: "بريطانيا",
    team: "Mercedes",
    teamAr: "مرسيدس",
    wins2026: 1,
    podiums2026: 4
  },
  "charles-leclerc": {
    nameAr: "تشارلز لوكلير",
    countryAr: "موناكو",
    team: "Ferrari",
    teamAr: "فيراري",
    wins2026: 0,
    podiums2026: 3
  },
  "lando-norris": {
    nameAr: "لاندو نوريس",
    countryAr: "بريطانيا",
    team: "McLaren",
    teamAr: "ماكلارين",
    wins2026: 0,
    podiums2026: 3
  },
  "lewis-hamilton": {
    nameAr: "لويس هاميلتون",
    countryAr: "بريطانيا",
    team: "Ferrari",
    teamAr: "فيراري",
    wins2026: 0,
    podiums2026: 2
  },
  "oscar-piastri": {
    nameAr: "أوسكار بياستري",
    countryAr: "أستراليا",
    team: "McLaren",
    teamAr: "ماكلارين",
    wins2026: 0,
    podiums2026: 2
  },
  "max-verstappen": {
    nameAr: "ماكس فيرستابن",
    countryAr: "هولندا",
    team: "Red Bull Racing",
    teamAr: "ريد بول",
    wins2026: 0,
    podiums2026: 1
  },
  "oliver-bearman": {
    nameAr: "أوليفر بيرمان",
    countryAr: "بريطانيا",
    team: "Haas",
    teamAr: "هاس",
    wins2026: 0,
    podiums2026: 1
  },
  "pierre-gasly": {
    nameAr: "بيير غاسلي",
    countryAr: "فرنسا",
    team: "Alpine",
    teamAr: "ألبين",
    wins2026: 0,
    podiums2026: 1
  },
  "liam-lawson": {
    nameAr: "ليام لوسون",
    countryAr: "نيوزيلندا",
    team: "Red Bull Racing",
    teamAr: "ريد بول",
    wins2026: 0,
    podiums2026: 0
  },
  "franco-colapinto": {
    nameAr: "فرانكو كولابينتو",
    countryAr: "الأرجنتين",
    team: "Alpine",
    teamAr: "ألبين",
    wins2026: 0,
    podiums2026: 0
  },
  "arvid-lindblad": {
    nameAr: "أرفيد ليندبلاد",
    countryAr: "بريطانيا",
    team: "Red Bull Racing",
    teamAr: "ريد بول",
    wins2026: 0,
    podiums2026: 0
  },
  "isack-hadjar": {
    nameAr: "إيساك حجار",
    countryAr: "فرنسا",
    team: "Racing Bulls",
    teamAr: "ريسينغ بولز",
    wins2026: 0,
    podiums2026: 0
  },
  "carlos-sainz": {
    nameAr: "كارلوس سينز",
    countryAr: "إسبانيا",
    team: "Williams",
    teamAr: "ويليامز",
    wins2026: 0,
    podiums2026: 0
  },
  "gabriel-bortoleto": {
    nameAr: "غابرييل بورتوليتو",
    countryAr: "البرازيل",
    team: "Kick Sauber",
    teamAr: "كيك ساوبر",
    wins2026: 0,
    podiums2026: 0
  },
  "esteban-ocon": {
    nameAr: "إستيبان أوكون",
    countryAr: "فرنسا",
    team: "Haas",
    teamAr: "هاس",
    wins2026: 0,
    podiums2026: 0
  },
  "alexander-albon": {
    nameAr: "ألكسندر ألبون",
    countryAr: "تايلاند",
    team: "Williams",
    teamAr: "ويليامز",
    wins2026: 0,
    podiums2026: 0
  },
  "nico-hülkenberg": {
    nameAr: "نيكو هولكنبرغ",
    countryAr: "ألمانيا",
    team: "Kick Sauber",
    teamAr: "كيك ساوبر",
    wins2026: 0,
    podiums2026: 0
  },
  "valtteri-bottas": {
    nameAr: "فالتيري بوتاس",
    countryAr: "فنلندا",
    team: "Kick Sauber",
    teamAr: "كيك ساوبر",
    wins2026: 0,
    podiums2026: 0
  },
  "sergio-pérez": {
    nameAr: "سيرخيو بيريز",
    countryAr: "المكسيك",
    team: "Racing Bulls",
    teamAr: "ريسينغ بولز",
    wins2026: 0,
    podiums2026: 0
  },
  "fernando-alonso": {
    nameAr: "فيرناندو ألونسو",
    countryAr: "إسبانيا",
    team: "Aston Martin",
    teamAr: "أستون مارتن",
    wins2026: 0,
    podiums2026: 0
  },
  "lance-stroll": {
    nameAr: "لانس سترول",
    countryAr: "كندا",
    team: "Aston Martin",
    teamAr: "أستون مارتن",
    wins2026: 0,
    podiums2026: 0
  }
};

function loadF1Drivers() {
  try {
    const p = path.join(process.cwd(), "content/standings/f1.json");
    const d = JSON.parse(fs.readFileSync(p, "utf-8"));
    return d.rankings || [];
  } catch {
    return [];
  }
}

export function generateStaticParams() {
  const drivers = loadF1Drivers();
  return drivers.map((d) => ({ slug: d.slug }));
}

export function generateMetadata({ params }) {
  const drivers = loadF1Drivers();
  const driver = drivers.find((d) => d.slug === params.slug);
  if (!driver) return { title: "سائق غير موجود" };

  const meta = F1_DRIVER_META[params.slug] || {};
  const nameAr = meta.nameAr || driver.name;

  return {
    title: `${nameAr} — المركز ${driver.rank} F1 2026 | نبض الرياضة`,
    description: `صفحة السائق ${nameAr}، المركز ${driver.rank} في بطولة الفورمولا 1 موسم 2026 مع ${meta.teamAr || driver.team || "فريق F1"}.`,
    alternates: {
      canonical: `https://nabdriyadah.com/player/f1/${params.slug}/`
    },
    openGraph: {
      title: `${nameAr} — F1 2026`,
      description: `بطولة الفورمولا 1 — ${nameAr}`,
      url: `https://nabdriyadah.com/player/f1/${params.slug}/`,
      siteName: "نبض الرياضة",
      locale: "ar_AR",
      type: "profile"
    }
  };
}

export default function F1DriverPage({ params }) {
  const drivers = loadF1Drivers();
  const driver = drivers.find((d) => d.slug === params.slug);

  if (!driver) {
    notFound();
  }

  const meta = F1_DRIVER_META[params.slug] || {};
  const nameAr = meta.nameAr || driver.name;
  const countryAr = meta.countryAr || driver.country;
  const teamAr = meta.teamAr || driver.team || "—";

  const theme = {
    heroFrom: "#7f1d1d",
    heroTo: "#dc2626",
    primary: "#dc2626",
    primarySoft: "#fee2e2",
    border: "#fecaca",
    pageBg: "#fff1f2"
  };

  // Articles liés au pilote
  const relatedArticles = articles
    .filter((a) => a.slug && (a.title?.includes(driver.name) || a.title?.includes(nameAr) || a.tags?.includes(params.slug)))
    .sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0))
    .slice(0, 4);

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": driver.name,
    "sport": "Formula 1",
    "nationality": driver.country || meta.countryAr,
    "url": `https://nabdriyadah.com/player/f1/${params.slug}/`
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: theme.pageBg,
        padding: "0 0 52px",
        direction: "rtl"
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      {/* Hero */}
      <section
        style={{
          background: `linear-gradient(135deg, ${theme.heroFrom}, ${theme.heroTo})`,
          padding: "48px 24px 60px",
          color: "white",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-60px",
            left: "-60px",
            width: "200px",
            height: "200px",
            borderRadius: "999px",
            background: "rgba(255,255,255,0.07)"
          }}
        />
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <Link
            href="/league/f1/"
            style={{
              display: "inline-block",
              color: "white",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "14px",
              opacity: 0.9,
              marginBottom: "20px"
            }}
          >
            ← العودة إلى ترتيب F1
          </Link>

          <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
            {/* Rang */}
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.15)",
                border: "2px solid rgba(255,255,255,0.3)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
              }}
            >
              <span style={{ fontSize: "28px", fontWeight: 900, lineHeight: 1 }}>{driver.rank}</span>
              <span style={{ fontSize: "11px", opacity: 0.85, fontWeight: 600 }}>F1</span>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "inline-block",
                  background: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  padding: "5px 14px",
                  borderRadius: "999px",
                  fontSize: "12px",
                  fontWeight: 700,
                  marginBottom: "12px"
                }}
              >
                فورمولا 1 — موسم 2026
              </div>
              <h1
                style={{
                  margin: "0 0 8px",
                  fontSize: "clamp(28px, 5vw, 52px)",
                  fontWeight: 900,
                  lineHeight: 1.2
                }}
              >
                {nameAr}
              </h1>
              <p
                style={{
                  margin: 0,
                  fontSize: "18px",
                  opacity: 0.9,
                  fontWeight: 600
                }}
              >
                {driver.name} · {teamAr}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "28px 20px 0" }}>
        {/* Stats rapides */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "16px",
            marginBottom: "28px"
          }}
        >
          {[
            { label: "المركز في البطولة", value: `#${driver.rank}`, color: theme.primary },
            { label: "النقاط 2026", value: driver.points ?? "0", color: "#374151" },
            { label: "الانتصارات 2026", value: meta.wins2026 ?? 0, color: "#16a34a" },
            { label: "المنصات 2026", value: meta.podiums2026 ?? 0, color: "#ca8a04" },
            { label: "الجنسية", value: countryAr, color: "#374151" },
            { label: "الفريق", value: teamAr, color: theme.primary }
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                background: "white",
                borderRadius: "20px",
                padding: "18px",
                border: `1px solid ${theme.border}`,
                boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                textAlign: "center"
              }}
            >
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: 900,
                  color: stat.color,
                  marginBottom: "6px"
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </section>

        {/* Profil */}
        <section
          style={{
            background: "white",
            borderRadius: "24px",
            padding: "24px",
            border: `1px solid ${theme.border}`,
            boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
            marginBottom: "24px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{ width: "5px", height: "26px", borderRadius: "999px", background: theme.primary }} />
            <span style={{ color: theme.primary, fontSize: "18px", fontWeight: 800 }}>الملف الشخصي — 2026</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            {[
              { label: "الاسم الكامل", value: driver.name },
              { label: "الاسم بالعربية", value: nameAr },
              { label: "الجنسية", value: countryAr },
              { label: "الفريق الحالي", value: `${teamAr} (${meta.team || driver.team || "—"})` },
              { label: "ترتيب البطولة", value: `#${driver.rank}` },
              { label: "نقاط 2026", value: `${driver.points ?? 0} نقطة` }
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  padding: "14px",
                  background: "#f9fafb",
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb"
                }}
              >
                <div style={{ fontSize: "11px", color: "#9ca3af", fontWeight: 600, marginBottom: "4px" }}>
                  {item.label}
                </div>
                <div style={{ fontSize: "15px", fontWeight: 800, color: "#111827" }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Performances 2026 */}
        <section
          style={{
            background: "white",
            borderRadius: "24px",
            padding: "24px",
            border: `1px solid ${theme.border}`,
            boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
            marginBottom: "24px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
            <div style={{ width: "5px", height: "26px", borderRadius: "999px", background: theme.primary }} />
            <span style={{ color: theme.primary, fontSize: "18px", fontWeight: 800 }}>أداء موسم 2026</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              {
                label: "انتصارات الموسم",
                value: meta.wins2026 ?? 0,
                max: 5,
                color: "#16a34a",
                icon: "🏆"
              },
              {
                label: "المنصات (1-2-3)",
                value: meta.podiums2026 ?? 0,
                max: 8,
                color: "#ca8a04",
                icon: "🥇"
              },
              {
                label: "النقاط المكتسبة",
                value: driver.points ?? 0,
                max: 150,
                color: theme.primary,
                icon: "⚡"
              }
            ].map((item, i) => (
              <div key={i}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "6px"
                  }}
                >
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#374151" }}>
                    {item.icon} {item.label}
                  </span>
                  <span style={{ fontSize: "14px", fontWeight: 900, color: item.color }}>
                    {item.value}
                  </span>
                </div>
                <div
                  style={{
                    height: "8px",
                    borderRadius: "999px",
                    background: "#f3f4f6",
                    overflow: "hidden"
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      borderRadius: "999px",
                      background: item.color,
                      width: `${Math.min(100, (item.value / item.max) * 100)}%`,
                      transition: "width 0.3s"
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* آخر الأخبار */}
        {relatedArticles.length > 0 && (
          <section>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
              <div style={{ width: "5px", height: "26px", borderRadius: "999px", background: theme.primary }} />
              <span style={{ color: theme.primary, fontSize: "18px", fontWeight: 800 }}>
                آخر الأخبار
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {relatedArticles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/articles/${article.slug}/`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <article
                    style={{
                      background: "white",
                      borderRadius: "14px",
                      overflow: "hidden",
                      border: `1px solid ${theme.border}`,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "10px 12px"
                    }}
                  >
                    {article.image && (
                      <img
                        src={article.image}
                        alt=""
                        loading="lazy"
                        width={56}
                        height={56}
                        style={{
                          width: "56px",
                          height: "56px",
                          objectFit: "cover",
                          borderRadius: "10px",
                          flexShrink: 0
                        }}
                      />
                    )}
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#111827",
                        lineHeight: 1.4,
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden"
                      }}
                    >
                      {article.title}
                    </h3>
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
