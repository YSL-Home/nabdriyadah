import Link from "next/link";
import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import articles from "../../../content/articles/seo-articles.json";
import AdSlot from "../../components/AdSlot";
import ArticleImage from "../../components/ArticleImage";
import ArticleFiltersClient from "../../components/ArticleFiltersClient";
import SportRankings from "../../components/SportRankings";

// Logos fiables depuis le CDN API-Football (même source que la page live)
const CDN = "https://media.api-sports.io/football/leagues";

const footballLeagues = [
  { slug: "premier-league", title: "الدوري الإنجليزي الممتاز", country: "إنجلترا", color: "#6d28d9", border: "#ddd6fe", logo: `${CDN}/39.png`,  logoBg: "#5b2d8e" },
  { slug: "la-liga",        title: "الدوري الإسباني",          country: "إسبانيا",  color: "#ea580c", border: "#fed7aa", logo: `${CDN}/140.png`, logoBg: "#1a1a2e" },
  { slug: "bundesliga",     title: "البوندسليغا",              country: "ألمانيا",  color: "#dc2626", border: "#fecaca", logo: `${CDN}/78.png`,  logoBg: "#7f1d1d" },
  { slug: "serie-a",        title: "الدوري الإيطالي",          country: "إيطاليا",  color: "#b45309", border: "#fde68a", logo: `${CDN}/135.png`, logoBg: "#1e3a5f" },
  { slug: "ligue-1",        title: "الدوري الفرنسي",           country: "فرنسا",   color: "#1d4ed8", border: "#bfdbfe", logo: `${CDN}/61.png`,  logoBg: "#1e3a8a" },
  { slug: "champions-league", title: "دوري أبطال أوروبا",    country: "أوروبا",   color: "#f59e0b", border: "#fef08a", logo: `${CDN}/2.png`,   logoBg: "#1e3a8a" },
  { slug: "saudi-pro-league", title: "الدوري السعودي للمحترفين", country: "السعودية", color: "#15803d", border: "#bbf7d0", logo: `${CDN}/307.png`, logoBg: "#14532d" },
  { slug: "eredivisie",     title: "الدوري الهولندي",          country: "هولندا",   color: "#b91c1c", border: "#fecaca", logo: `${CDN}/88.png`,  logoBg: "#991b1b" }
];

// Leagues / compétitions par sport (non-football)
const sportLeagues = {
  basketball: [
    { slug: "nba",        title: "NBA — الدوري الأمريكي",            logo: "https://a.espncdn.com/i/teamlogos/leagues/500/nba.png",         color: "#c2410c" },
    { slug: "euroleague", title: "يورو ليغ — كرة السلة الأوروبية",  logo: "https://upload.wikimedia.org/wikipedia/en/thumb/0/06/EuroLeague_Basketball_logo.svg/200px-EuroLeague_Basketball_logo.svg.png", color: "#b45309" },
  ],
  tennis: [
    { slug: "atp", title: "ATP — ترتيب الرجال",  logo: "https://upload.wikimedia.org/wikipedia/en/thumb/3/3f/ATP_Tour_logo.svg/200px-ATP_Tour_logo.svg.png", color: "#1d4ed8" },
    { slug: "wta", title: "WTA — ترتيب السيدات", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/3/3a/WTA_logo_2010.svg/200px-WTA_logo_2010.svg.png", color: "#7c3aed" },
  ],
  padel: [
    { slug: "padel-premier", title: "Premier Padel — الترتيب العالمي", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Premier_Padel_logo.svg/200px-Premier_Padel_logo.svg.png", color: "#7c3aed" },
  ],
  futsal: [
    { slug: "futsal-monde", title: "كأس العالم للصالات — FIFA", logo: "https://media.api-sports.io/football/leagues/1.png", color: "#0f766e" },
  ],
  f1: [
    { slug: "f1", title: "فورمولا 1 — بطولة العالم", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/F1.svg/200px-F1.svg.png", color: "#dc2626" },
  ],
  golf: [
    { slug: "pga-tour", title: "PGA Tour — الترتيب العالمي", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/4/4e/PGA_Tour_logo.svg/200px-PGA_Tour_logo.svg.png", color: "#16a34a" },
  ],
};

const globalCompetitions = [
  { slug: "world-cup",           title: "كأس العالم",         country: "FIFA",  color: "#818cf8", border: "#ddd6fe", logo: `${CDN}/1.png`,  logoBg: "#003087" },
  { slug: "euro",                title: "يورو",               country: "UEFA",  color: "#60a5fa", border: "#bfdbfe", logo: `${CDN}/4.png`,  logoBg: "#001b6e" },
  { slug: "afcon",               title: "كأس أمم أفريقيا",    country: "CAF",   color: "#fb923c", border: "#fed7aa", logo: `${CDN}/6.png`,  logoBg: "#002a12" },
  { slug: "caf-champions-league",title: "أبطال أفريقيا",      country: "CAF",   color: "#34d399", border: "#bbf7d0", logo: `${CDN}/12.png`, logoBg: "#001a12" },
  { slug: "club-world-cup",      title: "كأس العالم للأندية", country: "FIFA",  color: "#fbbf24", border: "#fef08a", logo: `${CDN}/15.png`, logoBg: "#001f50" }
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
    icon: "🎾",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Premier_Padel_logo.svg/320px-Premier_Padel_logo.svg.png",
    colorFrom: "#1d4ed8",
    colorTo: "#2563eb",
    primary: "#2563eb",
    primarySoft: "#eff6ff",
    border: "#bfdbfe",
    pageBg: "#eff6ff",
    highlights: ["Premier Padel", "FIP World Ranking", "أبرز اللاعبين", "تطور الرياضة"]
  },
  futsal: {
    title: "كرة قدم الصالات",
    slug: "futsal",
    description: "أحدث أخبار كرة قدم الصالات، بطولات الفوتسال ونتائج المباريات.",
    icon: "🥅",
    colorFrom: "#0f766e",
    colorTo: "#14b8a6",
    primary: "#0f766e",
    primarySoft: "#f0fdfa",
    border: "#99f6e4",
    pageBg: "#f0fdfa",
    highlights: ["فوتسال إندور", "بطولات الصالات", "أبرز الأندية", "نتائج المباريات"]
  },
  f1: {
    title: "فورمولا 1",
    slug: "f1",
    description: "تغطية شاملة لسباقات الفورمولا 1، ترتيب السائقين والفرق وجدول السباقات.",
    icon: "🏎️",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/F1.svg/320px-F1.svg.png",
    colorFrom: "#7f1d1d",
    colorTo: "#dc2626",
    primary: "#dc2626",
    primarySoft: "#fef2f2",
    border: "#fecaca",
    pageBg: "#fef2f2",
    highlights: ["ترتيب السائقين", "جدول السباقات", "أبرز الفرق", "نتائج الجولات"]
  },
  golf: {
    title: "الغولف",
    slug: "golf",
    description: "أحدث أخبار الغولف العالمي، تصنيف اللاعبين، PGA Tour وأبرز البطولات.",
    icon: "⛳",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/4/4e/PGA_Tour_logo.svg/320px-PGA_Tour_logo.svg.png",
    colorFrom: "#052e16",
    colorTo: "#16a34a",
    primary: "#16a34a",
    primarySoft: "#f0fdf4",
    border: "#bbf7d0",
    pageBg: "#f0fdf4",
    highlights: ["PGA Tour", "OWGR World Ranking", "بطولات الماجور", "أبرز المحترفين"]
  }
};

// Affiche le logo officiel si disponible, sinon l'emoji
function SportIcon({ sport, size = 64 }) {
  if (sport.logo) {
    return (
      <img
        src={sport.logo}
        alt={sport.title}
        width={size}
        height={size}
        style={{ objectFit: "contain", filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.25))", flexShrink: 0 }}
      />
    );
  }
  return <span style={{ fontSize: `${size}px`, lineHeight: 1 }}>{sport.icon}</span>;
}

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

function fmtDate(iso) {
  if (!iso) return "";
  try { return new Date(iso).toLocaleDateString("ar-SA-u-nu-latn", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return ""; }
}

// Lit les données de classement pour un sport donné (Server-side)
function getStandingsProps(slug) {
  const read = (file) => {
    try { return JSON.parse(fs.readFileSync(path.join(process.cwd(), "content/standings", file), "utf-8")); }
    catch { return null; }
  };
  const STANDING_CONFIG = {
    tennis: () => {
      const atp = read("atp.json"); const wta = read("wta.json");
      return { data: atp?.rankings||[], data2: wta?.rankings||[], accentColor:"#15803d", accentColor2:"#7c3aed",
        titlePrimary:"ATP — ترتيب الرجال", titleSecondary:"WTA — ترتيب السيدات",
        sourceUrl:"https://www.atptour.com/en/rankings/singles", sourceLabel:"ATP Tour",
        sourceUrl2:"https://www.wtatennis.com/rankings/singles", sourceLabel2:"WTA Tour" };
    },
    padel: () => {
      const d = read("padel-premier.json");
      return { data: d?.men||[], data2: d?.women||[], accentColor:"#2563eb", accentColor2:"#7c3aed",
        titlePrimary:"FIP — ترتيب الرجال", titleSecondary:"FIP — ترتيب السيدات",
        sourceUrl:"https://www.padelfip.com/ranking-male/", sourceLabel:"FIP",
        sourceUrl2:"https://www.padelfip.com/ranking-female/", sourceLabel2:"FIP" };
    },
    basketball: () => {
      const d = read("nba.json");
      return { data: d?.standings||[], accentColor:"#c2410c",
        titlePrimary:"NBA — الترتيب العام",
        sourceUrl:"https://www.nba.com/standings", sourceLabel:"NBA" };
    },
    f1: () => {
      const d = read("f1.json");
      return { data: d?.rankings||[], accentColor:"#dc2626",
        titlePrimary:"فورمولا 1 — ترتيب السائقين",
        sourceUrl:"https://www.formula1.com/en/results.html", sourceLabel:"F1" };
    },
    golf: () => {
      const d = read("pga-tour.json");
      return { data: d?.rankings||[], accentColor:"#16a34a",
        titlePrimary:"PGA Tour — التصنيف العالمي",
        sourceUrl:"https://www.owgr.com/ranking", sourceLabel:"OWGR" };
    },
    football: () => {
      const d = read("premier-league.json");
      return { data: d?.standings||[], accentColor:"#1d4ed8",
        titlePrimary:"الدوري الإنجليزي — الترتيب",
        sourceUrl:"https://www.premierleague.com/tables", sourceLabel:"Premier League" };
    },
  };
  return STANDING_CONFIG[slug]?.() || null;
}

export default function SportPage({ params }) {
  const sport = sportConfig[params.slug];
  if (!sport) notFound();

  const sportArticles = articles
    .filter((a) => a.sport === params.slug || (a.sport === "football" && params.slug === "football"))
    .sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));

  const featuredArticle = sportArticles[0] || null;
  const restArticles = sportArticles.slice(1);
  const standingsProps = getStandingsProps(params.slug);

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
                <SportIcon sport={sport} size={64} />
                <h1 className="th1" style={{ margin: 0 }}>{sport.title}</h1>
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
          <section style={{ marginBottom: "24px" }}>
            <h2 style={{ margin: "0 0 16px 0", fontSize: "28px", fontWeight: 800, color: "#111827" }}>الدوريات الكبرى</h2>
            <div className="g4">
              {footballLeagues.map((league) => (
                <Link key={league.slug} href={`/league/${league.slug}/`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div style={{ background: "white", border: `1px solid #e5e7eb`, borderRadius: "22px", padding: "18px 16px", display: "flex", alignItems: "center", gap: "12px", boxShadow: "0 6px 20px rgba(0,0,0,0.06)", borderTop: `4px solid ${league.color}` }}>
                    <div style={{ width: "56px", height: "56px", borderRadius: "14px", background: league.logoBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden", padding: "8px" }}>
                      <img src={league.logo} alt={league.title} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    </div>
                    <div>
                      <div style={{ color: league.color, fontSize: "11px", fontWeight: 700, marginBottom: "3px" }}>{league.country}</div>
                      <div style={{ fontSize: "15px", fontWeight: 800, color: "#111827", lineHeight: 1.4 }}>{league.title}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Global Competitions */}
          <section style={{ marginBottom: "28px" }}>
            <h2 style={{ margin: "0 0 16px 0", fontSize: "28px", fontWeight: 800, color: "#111827" }}>البطولات الدولية والقارية</h2>
            <div className="g5 g5-mobile2">
              {globalCompetitions.map((comp) => (
                <Link key={comp.slug} href={`/league/${comp.slug}/`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div style={{ background: "white", border: `1px solid #e5e7eb`, borderRadius: "22px", padding: "20px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", boxShadow: "0 6px 20px rgba(0,0,0,0.06)", textAlign: "center", borderTop: `4px solid ${comp.color}` }}>
                    <div style={{ width: "60px", height: "60px", borderRadius: "14px", background: comp.logoBg, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", padding: "8px" }}>
                      <img src={comp.logo} alt={comp.title} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    </div>
                    <div style={{ color: comp.color, fontSize: "11px", fontWeight: 700 }}>{comp.country}</div>
                    <div style={{ fontSize: "14px", fontWeight: 800, color: "#111827", lineHeight: 1.4 }}>{comp.title}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <AdSlot label="مساحة إعلانية" minHeight={90} style={{ marginBottom: 24 }} />

          {/* ── Classement Premier League ── */}
          {standingsProps && standingsProps.data?.length > 0 && (
            <section style={{ marginBottom: "28px" }}>
              <h2 style={{ margin: "0 0 16px 0", fontSize: "26px", fontWeight: 800, color: "#111827" }}>الترتيب</h2>
              <SportRankings sport={params.slug} lang="ar" {...standingsProps} />
            </section>
          )}

          {/* Football articles */}
          {sportArticles.length > 0 && (
            <section>
              <h2 style={{ margin: "0 0 18px 0", fontSize: "30px", fontWeight: 800, color: "#111827" }}>أحدث أخبار كرة القدم</h2>
              <ArticleFiltersClient
                articles={sportArticles}
                lang="ar"
                prefix=""
                primaryColor={sport.primary}
                showSportFilter={false}
              />
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
              <SportIcon sport={sport} size={64} />
              <h1 className="th1" style={{ margin: 0 }}>{sport.title}</h1>
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

        {/* ── Classement inline ── */}
        {standingsProps && standingsProps.data?.length > 0 && (
          <section style={{ marginBottom: "28px" }}>
            <h2 style={{ margin: "0 0 14px 0", fontSize: "26px", fontWeight: 800, color: "#111827" }}>الترتيب والتصنيف</h2>
            <SportRankings sport={params.slug} lang="ar" {...standingsProps} />
          </section>
        )}

        {/* ── Grille des leagues / classements pour les sports non-football ── */}
        {sportLeagues[params.slug] && (
          <section style={{ marginBottom: "36px" }}>
            <h2 style={{ margin: "0 0 18px 0", fontSize: "28px", fontWeight: 800, color: "#111827" }}>البطولات والتصنيفات</h2>
            <div className="g4">
              {sportLeagues[params.slug].map((league) => (
                <Link key={league.slug} href={`/league/${league.slug}/`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div style={{
                    background: "white",
                    border: `1px solid ${sport.border}`,
                    borderTop: `4px solid ${league.color}`,
                    borderRadius: "22px",
                    padding: "20px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                    cursor: "pointer",
                    transition: "box-shadow .2s"
                  }}>
                    <img src={league.logo} alt={league.title} width={52} height={52}
                      style={{ objectFit: "contain", flexShrink: 0, borderRadius: "8px" }} />
                    <div>
                      <div style={{ fontSize: "15px", fontWeight: 800, color: "#111827", lineHeight: 1.3 }}>{league.title}</div>
                      <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>عرض الجدول والترتيب ←</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {sportArticles.length === 0 ? (
          <section style={{ background: "white", borderRadius: "28px", padding: "40px", border: `1px solid ${sport.border}`, textAlign: "center" }}>
            <div style={{ marginBottom: "16px", display: "flex", justifyContent: "center" }}><SportIcon sport={sport} size={48} /></div>
            <h2 style={{ margin: "0 0 12px 0", fontSize: "28px", fontWeight: 800 }}>محتوى قيد الإنشاء</h2>
            <p style={{ color: "#6b7280", fontSize: "18px", lineHeight: 1.9, maxWidth: "500px", margin: "0 auto" }}>
              يتم تجميع مواد {sport.title} تلقائياً. ستظهر المقالات فور اكتمال أول دورة تحديث للمحتوى.
            </p>
          </section>
        ) : (
          <section>
            <h2 style={{ margin: "0 0 18px 0", fontSize: "34px", fontWeight: 800, color: "#111827" }}>
              أحدث أخبار {sport.title}
            </h2>
            <ArticleFiltersClient
              articles={sportArticles}
              lang="ar"
              prefix=""
              primaryColor={sport.primary}
              showSportFilter={false}
            />
          </section>
        )}
      </div>
    </main>
  );
}
