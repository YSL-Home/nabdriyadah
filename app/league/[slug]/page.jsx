import Link from "next/link";
import { notFound } from "next/navigation";
import articles from "../../../content/articles/seo-articles.json";
import AdSlot from "../../components/AdSlot";

const leagueMap = {
  "premier-league": {
    title: "الدوري الإنجليزي الممتاز",
    shortLabel: "EPL",
    description:
      "تابع آخر أخبار الدوري الإنجليزي الممتاز، أبرز المستجدات، والتحليلات الخاصة بالأندية واللاعبين.",
    leagueLogo: "/leagues/premier-league.png",
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
    ],
    teams: [
      { name: "مانشستر سيتي", slug: "manchester-city", logo: "/teams/premier-league/manchester-city.png" },
      { name: "مانشستر يونايتد", slug: "manchester-united", logo: "/teams/premier-league/manchester-united.png" },
      { name: "ليفربول", slug: "liverpool", logo: "/teams/premier-league/liverpool.png" },
      { name: "آرسنال", slug: "arsenal", logo: "/teams/premier-league/arsenal.png" },
      { name: "تشيلسي", slug: "chelsea", logo: "/teams/premier-league/chelsea.png" },
      { name: "توتنهام", slug: "tottenham", logo: "/teams/premier-league/tottenham.png" }
    ]
  },
  "la-liga": {
    title: "الدوري الإسباني",
    shortLabel: "LL",
    description: "أحدث أخبار الدوري الإسباني مع متابعة خاصة لريال مدريد وبرشلونة وأبرز ملفات الليغا.",
    leagueLogo: "/leagues/la-liga.png",
    theme: {
      pageBg: "#fff7ed", heroFrom: "#9a3412", heroTo: "#f97316", primary: "#ea580c",
      primarySoft: "#ffedd5", border: "#fed7aa", cardBg: "#ffffff",
      text: "#111827", subtext: "#4b5563", badgeBg: "rgba(255,255,255,0.16)", badgeText: "#ffffff"
    },
    highlights: ["متابعة ريال مدريد وبرشلونة", "رصد مستجدات الليغا", "ملفات المدربين والنجوم والنتائج"],
    teams: [
      { name: "ريال مدريد", slug: "real-madrid", logo: "/teams/la-liga/real-madrid.png" },
      { name: "برشلونة", slug: "barcelona", logo: "/teams/la-liga/barcelona.png" },
      { name: "أتلتيكو مدريد", slug: "atletico-madrid", logo: "/teams/la-liga/atletico-madrid.png" },
      { name: "إشبيلية", slug: "sevilla", logo: "/teams/la-liga/sevilla.png" },
      { name: "فالنسيا", slug: "valencia", logo: "/teams/la-liga/valencia.png" },
      { name: "ريال سوسيداد", slug: "real-sociedad", logo: "/teams/la-liga/real-sociedad.png" }
    ]
  },

  "bundesliga": {
    title: "الدوري الألماني — البوندسليغا",
    shortLabel: "BL",
    description: "تابع أحدث أخبار البوندسليغا، بايرن ميونخ، بوروسيا دورتموند وأبرز مجريات الدوري الألماني.",
    leagueLogo: "/leagues/bundesliga.png",
    theme: {
      pageBg: "#fff1f2", heroFrom: "#7f1d1d", heroTo: "#dc2626", primary: "#dc2626",
      primarySoft: "#fee2e2", border: "#fecaca", cardBg: "#ffffff",
      text: "#111827", subtext: "#4b5563", badgeBg: "rgba(255,255,255,0.16)", badgeText: "#ffffff"
    },
    highlights: ["بايرن ميونخ ودورتموند", "المنافسة على اللقب", "الإنتاج الشبابي الألماني", "الانتقالات"],
    teams: [
      { name: "بايرن ميونخ", slug: "bayern-munich", logo: "/teams/bundesliga/bayern-munich.png" },
      { name: "بوروسيا دورتموند", slug: "borussia-dortmund", logo: "/teams/bundesliga/borussia-dortmund.png" },
      { name: "باير ليفركوزن", slug: "bayer-leverkusen", logo: "/teams/bundesliga/bayer-leverkusen.png" },
      { name: "آر بي لايبزيغ", slug: "rb-leipzig", logo: "/teams/bundesliga/rb-leipzig.png" },
      { name: "إينتراخت فرانكفورت", slug: "eintracht-frankfurt", logo: "/teams/bundesliga/eintracht-frankfurt.png" },
      { name: "بوروسيا مونشنغلادباخ", slug: "borussia-monchengladbach", logo: "/teams/bundesliga/borussia-monchengladbach.png" }
    ]
  },

  "serie-a": {
    title: "الدوري الإيطالي — سيريا آ",
    shortLabel: "SA",
    description: "أبرز أخبار الدوري الإيطالي، يوفنتوس، ميلان، إنتر ميلان وأفضل البطولات الأوروبية.",
    leagueLogo: "/leagues/serie-a.png",
    theme: {
      pageBg: "#fffbeb", heroFrom: "#78350f", heroTo: "#d97706", primary: "#b45309",
      primarySoft: "#fef3c7", border: "#fde68a", cardBg: "#ffffff",
      text: "#111827", subtext: "#4b5563", badgeBg: "rgba(255,255,255,0.16)", badgeText: "#ffffff"
    },
    highlights: ["يوفنتوس وميلان وإنتر", "المنافسة الإيطالية", "نجوم الكالتشيو", "دوري أبطال أوروبا"],
    teams: [
      { name: "يوفنتوس", slug: "juventus", logo: "/teams/serie-a/juventus.png" },
      { name: "إيه سي ميلان", slug: "ac-milan", logo: "/teams/serie-a/ac-milan.png" },
      { name: "إنتر ميلان", slug: "inter-milan", logo: "/teams/serie-a/inter-milan.png" },
      { name: "نابولي", slug: "napoli", logo: "/teams/serie-a/napoli.png" },
      { name: "روما", slug: "as-roma", logo: "/teams/serie-a/as-roma.png" },
      { name: "لاتسيو", slug: "lazio", logo: "/teams/serie-a/lazio.png" }
    ]
  },

  "ligue-1": {
    title: "الدوري الفرنسي — ليغ 1",
    shortLabel: "L1",
    description: "آخر أخبار الدوري الفرنسي، باريس سان جيرمان، مرسيليا، موناكو وأبرز أحداث الليغ 1.",
    leagueLogo: "/leagues/ligue-1.png",
    theme: {
      pageBg: "#eff6ff", heroFrom: "#1e3a8a", heroTo: "#2563eb", primary: "#1d4ed8",
      primarySoft: "#dbeafe", border: "#bfdbfe", cardBg: "#ffffff",
      text: "#111827", subtext: "#4b5563", badgeBg: "rgba(255,255,255,0.16)", badgeText: "#ffffff"
    },
    highlights: ["باريس سان جيرمان", "الغزير الفرنسي من المواهب", "مرسيليا وموناكو", "الانتقالات"],
    teams: [
      { name: "باريس سان جيرمان", slug: "psg", logo: "/teams/ligue-1/psg.png" },
      { name: "أولمبيك مرسيليا", slug: "olympique-marseille", logo: "/teams/ligue-1/olympique-marseille.png" },
      { name: "موناكو", slug: "monaco", logo: "/teams/ligue-1/monaco.png" },
      { name: "أولمبيك ليون", slug: "olympique-lyon", logo: "/teams/ligue-1/olympique-lyon.png" },
      { name: "ليل", slug: "losc-lille", logo: "/teams/ligue-1/losc-lille.png" },
      { name: "ران", slug: "stade-rennes", logo: "/teams/ligue-1/stade-rennes.png" }
    ]
  },

  "champions-league": {
    title: "دوري أبطال أوروبا",
    shortLabel: "UCL",
    description: "تابع أحدث أخبار دوري أبطال أوروبا، المباريات الكبرى، وأبرز الأندية المتنافسة على اللقب.",
    leagueLogo: "/leagues/champions-league.png",
    theme: {
      pageBg: "#fefce8", heroFrom: "#713f12", heroTo: "#ca8a04", primary: "#854d0e",
      primarySoft: "#fef9c3", border: "#fef08a", cardBg: "#ffffff",
      text: "#111827", subtext: "#4b5563", badgeBg: "rgba(255,255,255,0.16)", badgeText: "#ffffff"
    },
    highlights: ["أبرز المجموعات", "الأدوار الإقصائية", "أفضل هداف", "تاريخ البطولة"],
    teams: [
      { name: "ريال مدريد", slug: "real-madrid", logo: "/teams/la-liga/real-madrid.png" },
      { name: "مانشستر سيتي", slug: "manchester-city", logo: "/teams/premier-league/manchester-city.png" },
      { name: "بايرن ميونخ", slug: "bayern-munich", logo: "/teams/bundesliga/bayern-munich.png" },
      { name: "باريس سان جيرمان", slug: "psg", logo: "/teams/ligue-1/psg.png" },
      { name: "برشلونة", slug: "barcelona", logo: "/teams/la-liga/barcelona.png" },
      { name: "إنتر ميلان", slug: "inter-milan", logo: "/teams/serie-a/inter-milan.png" }
    ]
  },

  "saudi-pro-league": {
    title: "دوري روشن للمحترفين",
    shortLabel: "SPL",
    description: "أخبار الدوري السعودي للمحترفين، الهلال، النصر، الاتحاد وأبرز نجوم الدوري.",
    leagueLogo: "/leagues/saudi-pro-league.png",
    theme: {
      pageBg: "#f0fdf4", heroFrom: "#14532d", heroTo: "#16a34a", primary: "#15803d",
      primarySoft: "#dcfce7", border: "#bbf7d0", cardBg: "#ffffff",
      text: "#111827", subtext: "#4b5563", badgeBg: "rgba(255,255,255,0.16)", badgeText: "#ffffff"
    },
    highlights: ["الهلال والنصر والاتحاد", "نجوم عالميون في السعودية", "المنافسة على اللقب", "الانتقالات الكبرى"],
    teams: [
      { name: "الهلال", slug: "al-hilal", logo: "/teams/saudi-pro-league/al-hilal.png" },
      { name: "النصر", slug: "al-nassr", logo: "/teams/saudi-pro-league/al-nassr.png" },
      { name: "الاتحاد", slug: "al-ittihad", logo: "/teams/saudi-pro-league/al-ittihad.png" },
      { name: "الأهلي", slug: "al-ahli", logo: "/teams/saudi-pro-league/al-ahli.png" },
      { name: "الشباب", slug: "al-shabab", logo: "/teams/saudi-pro-league/al-shabab.png" },
      { name: "الاتفاق", slug: "al-ettifaq", logo: "/teams/saudi-pro-league/al-ettifaq.png" }
    ]
  },

  "eredivisie": {
    title: "الدوري الهولندي — إريديفيزي",
    shortLabel: "ERE",
    description: "متابعة أبرز أخبار الدوري الهولندي، أياكس، بي إس في إيندهوفن وفاينورد.",
    leagueLogo: "/leagues/eredivisie.png",
    theme: {
      pageBg: "#fff1f2", heroFrom: "#7f1d1d", heroTo: "#ef4444", primary: "#b91c1c",
      primarySoft: "#fee2e2", border: "#fecaca", cardBg: "#ffffff",
      text: "#111827", subtext: "#4b5563", badgeBg: "rgba(255,255,255,0.16)", badgeText: "#ffffff"
    },
    highlights: ["أياكس وبي إس في", "تخريج المواهب", "المسار نحو أوروبا", "الأندية الكلاسيكية"],
    teams: [
      { name: "أياكس", slug: "ajax", logo: "/teams/eredivisie/ajax.png" },
      { name: "بي إس في إيندهوفن", slug: "psv-eindhoven", logo: "/teams/eredivisie/psv-eindhoven.png" },
      { name: "فاينورد", slug: "feyenoord", logo: "/teams/eredivisie/feyenoord.png" },
      { name: "آي زد ألكمار", slug: "az-alkmaar", logo: "/teams/eredivisie/az-alkmaar.png" },
      { name: "أوتريخت", slug: "utrecht", logo: "/teams/eredivisie/utrecht.png" },
      { name: "توينتي", slug: "fc-twente", logo: "/teams/eredivisie/fc-twente.png" }
    ]
  }
};

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
  const leagueArticles = articles.filter((article) => article.league === params.slug).slice(0, 12);
  const featuredArticle = leagueArticles[0] || null;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: theme.pageBg,
        padding: "28px 20px 52px",
        direction: "rtl"
      }}
    >
      <div style={{ maxWidth: "1450px", margin: "0 auto" }}>
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
            <div
              style={{
                background: "rgba(255,255,255,0.10)",
                border: "1px solid rgba(255,255,255,0.18)",
                borderRadius: "30px",
                padding: "22px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <img
                src={league.leagueLogo}
                alt={league.title}
                style={{
                  width: "140px",
                  height: "140px",
                  objectFit: "contain",
                  display: "block"
                }}
              />
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

        <AdSlot label="مساحة إعلانية أعلى صفحة البطولة" minHeight={90} style={{ marginBottom: 24 }} />

        <section
          style={{
            background: theme.cardBg,
            borderRadius: "28px",
            padding: "24px",
            border: `1px solid ${theme.border}`,
            boxShadow: "0 12px 30px rgba(0,0,0,0.05)",
            marginBottom: "24px"
          }}
        >
          <div
            style={{
              color: theme.primary,
              fontSize: "14px",
              fontWeight: 700,
              marginBottom: "12px"
            }}
          >
            الأندية الكبرى في البطولة
          </div>

          <div
            style={{
              width: "50%",
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: "14px"
            }}
          >
            {league.teams.map((team) => (
              <Link
                key={team.slug}
                href={`/team/${team.slug}/`}
                style={{
                  textDecoration: "none",
                  color: "inherit"
                }}
              >
                <div
                  style={{
                    background: theme.primarySoft,
                    border: `1px solid ${theme.border}`,
                    borderRadius: "20px",
                    padding: "14px 12px",
                    textAlign: "center"
                  }}
                >
                  <img
                    src={team.logo}
                    alt={team.name}
                    style={{
                      width: "52px",
                      height: "52px",
                      objectFit: "contain",
                      display: "block",
                      margin: "0 auto 10px"
                    }}
                  />
                  <div
                    style={{
                      color: theme.primary,
                      fontSize: "14px",
                      fontWeight: 700,
                      lineHeight: 1.6
                    }}
                  >
                    {team.name}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: "24px",
            marginBottom: "28px"
          }}
        >
          {featuredArticle ? (
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
          ) : null}

          <div
            style={{
              background: theme.cardBg,
              borderRadius: "28px",
              padding: "28px",
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

            <h2
              style={{
                margin: "0 0 14px 0",
                fontSize: "34px",
                lineHeight: 1.4,
                fontWeight: 800,
                color: theme.text
              }}
            >
              {league.title}
            </h2>

            <p
              style={{
                margin: "0 0 18px 0",
                color: theme.subtext,
                fontSize: "18px",
                lineHeight: 1.95
              }}
            >
              هذه الصفحة مخصصة لتجميع أبرز مواد {league.title} داخل الموقع، مع هوية
              بصرية خاصة بالبطولة وربط مباشر بصفحات الأندية والمقالات ذات الصلة.
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

        <AdSlot label="مساحة إعلانية وسط صفحة البطولة" minHeight={120} style={{ marginBottom: 24 }} />

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
                gridTemplateColumns: getGridColumns(leagueArticles.length),
                gap: "22px",
                justifyContent: leagueArticles.length <= 1 ? "start" : "stretch"
              }}
            >
              {leagueArticles.map((article, index) => (
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
