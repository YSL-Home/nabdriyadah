import Link from "next/link";
import articles from "../../content/articles/seo-articles.json";
import AdSlot from "./AdSlot";
import ArticleImage from "./ArticleImage";
import { getT } from "../../lib/i18n";

const CDN = "https://media.api-sports.io/football/leagues";

const footballLeagues = [
  { slug: "premier-league", country: "England",  fr: "Angleterre",  color: "#6d28d9", border: "#ddd6fe", logo: `${CDN}/39.png`,  logoBg: "#5b2d8e" },
  { slug: "la-liga",        country: "Spain",    fr: "Espagne",     color: "#ea580c", border: "#fed7aa", logo: `${CDN}/140.png`, logoBg: "#1a1a2e" },
  { slug: "bundesliga",     country: "Germany",  fr: "Allemagne",   color: "#dc2626", border: "#fecaca", logo: `${CDN}/78.png`,  logoBg: "#7f1d1d" },
  { slug: "serie-a",        country: "Italy",    fr: "Italie",      color: "#b45309", border: "#fde68a", logo: `${CDN}/135.png`, logoBg: "#1e3a5f" },
  { slug: "ligue-1",        country: "France",   fr: "France",      color: "#1d4ed8", border: "#bfdbfe", logo: `${CDN}/61.png`,  logoBg: "#1e3a8a" },
  { slug: "champions-league", country: "Europe", fr: "Europe",      color: "#f59e0b", border: "#fef08a", logo: `${CDN}/2.png`,  logoBg: "#1e3a8a" },
  { slug: "saudi-pro-league", country: "Saudi Arabia", fr: "Arabie Saoudite", color: "#15803d", border: "#bbf7d0", logo: `${CDN}/307.png`, logoBg: "#14532d" },
  { slug: "eredivisie",     country: "Netherlands", fr: "Pays-Bas",  color: "#b91c1c", border: "#fecaca", logo: `${CDN}/88.png`, logoBg: "#991b1b" },
];

const globalCompetitions = [
  { slug: "world-cup",           en: "World Cup",              fr: "Coupe du Monde",       country: "FIFA",  color: "#818cf8", logo: `${CDN}/1.png`,  logoBg: "#003087" },
  { slug: "euro",                en: "UEFA Euro",              fr: "Euro UEFA",             country: "UEFA",  color: "#60a5fa", logo: `${CDN}/4.png`,  logoBg: "#001b6e" },
  { slug: "afcon",               en: "Africa Cup of Nations",  fr: "CAN",                   country: "CAF",   color: "#fb923c", logo: `${CDN}/6.png`,  logoBg: "#002a12" },
  { slug: "caf-champions-league",en: "CAF Champions League",  fr: "Ligue des Champions CAF", country: "CAF", color: "#34d399", logo: `${CDN}/12.png`, logoBg: "#001a12" },
  { slug: "club-world-cup",      en: "Club World Cup",        fr: "Coupe du Monde des Clubs", country: "FIFA", color: "#fbbf24", logo: `${CDN}/15.png`, logoBg: "#001f50" },
];

const leagueTitles = {
  "premier-league":    { en: "Premier League",       fr: "Premier League"          },
  "la-liga":           { en: "La Liga",              fr: "La Liga"                 },
  "bundesliga":        { en: "Bundesliga",           fr: "Bundesliga"              },
  "serie-a":           { en: "Serie A",              fr: "Serie A"                 },
  "ligue-1":           { en: "Ligue 1",              fr: "Ligue 1"                 },
  "champions-league":  { en: "Champions League",    fr: "Ligue des Champions"     },
  "saudi-pro-league":  { en: "Saudi Pro League",    fr: "Saudi Pro League"        },
  "eredivisie":        { en: "Eredivisie",           fr: "Eredivisie"              },
  "nba":               { en: "NBA",                  fr: "NBA"                     },
  "atp":               { en: "ATP Tour",             fr: "ATP Tour"                },
  "wta":               { en: "WTA Tour",             fr: "WTA Tour"                },
  "padel-premier":     { en: "Premier Padel",        fr: "Premier Padel"           },
  "futsal-monde":      { en: "FIFA Futsal World Cup",fr: "Coupe du Monde Futsal"   },
  "f1":                { en: "Formula 1",            fr: "Formule 1"               },
  "pga-tour":          { en: "PGA Tour",             fr: "PGA Tour"                },
};

// Leagues per non-football sport
const sportLeagues = {
  basketball: [
    { slug: "nba", country: "USA", fr: "États-Unis", color: "#c2410c", border: "#fed7aa", logo: "https://a.espncdn.com/i/teamlogos/leagues/500/nba.png", logoBg: "#431407" },
  ],
  tennis: [
    { slug: "atp", country: "International", fr: "International", color: "#15803d", border: "#bbf7d0", logo: "https://a.espncdn.com/i/teamlogos/leagues/500/atp.png", logoBg: "#052e16" },
    { slug: "wta", country: "International", fr: "International", color: "#a21caf", border: "#f0abfc", logo: "https://a.espncdn.com/i/teamlogos/leagues/500/wta.png", logoBg: "#4a044e" },
  ],
  padel: [
    { slug: "padel-premier", country: "International", fr: "International", color: "#7c3aed", border: "#ddd6fe", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Premier_Padel_logo.svg/200px-Premier_Padel_logo.svg.png", logoBg: "#2e1065" },
  ],
  futsal: [
    { slug: "futsal-monde", country: "FIFA", fr: "FIFA", color: "#0f766e", border: "#99f6e4", logo: "https://media.api-sports.io/football/leagues/1.png", logoBg: "#042f2e" },
  ],
  f1: [
    { slug: "f1", country: "FIA", fr: "FIA", color: "#dc2626", border: "#fecaca", logo: "https://a.espncdn.com/i/teamlogos/leagues/500/f1.png", logoBg: "#7f1d1d" },
  ],
  golf: [
    { slug: "pga-tour", country: "USA", fr: "États-Unis", color: "#16a34a", border: "#bbf7d0", logo: "https://a.espncdn.com/i/teamlogos/leagues/500/pga.png", logoBg: "#052e16" },
  ],
};

const sportConfig = {
  football: {
    icon: "⚽",
    colorFrom: "#0f172a",
    colorTo: "#1d4ed8",
    primary: "#1d4ed8",
    primarySoft: "#eff6ff",
    border: "#bfdbfe",
    pageBg: "#eff6ff",
    en: {
      title: "Football",
      description: "Full coverage of the world's biggest football leagues — from the Premier League to the Saudi Pro League.",
      highlights: ["Top world leagues", "8 major competitions", "Transfers & news", "Analysis & results"],
      leaguesTitle: "Major Leagues",
      compTitle: "International & Continental",
      newsTitle: "Latest Football News",
      back: "← Home",
    },
    fr: {
      title: "Football",
      description: "Toute l'actualité des plus grands championnats de football — de la Premier League à la Saudi Pro League.",
      highlights: ["Meilleurs championnats", "8 grandes compétitions", "Transferts & actus", "Analyses & résultats"],
      leaguesTitle: "Championnats majeurs",
      compTitle: "Compétitions internationales",
      newsTitle: "Dernières actus football",
      back: "← Accueil",
    },
    isFootball: true,
  },
  basketball: {
    icon: "🏀",
    colorFrom: "#c2410c",
    colorTo: "#ea580c",
    primary: "#ea580c",
    primarySoft: "#fff7ed",
    border: "#fed7aa",
    pageBg: "#fff7ed",
    en: {
      title: "Basketball",
      description: "Follow the latest basketball & NBA news, top games and transfers.",
      highlights: ["NBA news", "Top players", "Game results", "Basketball transfers"],
    },
    fr: {
      title: "Basketball",
      description: "Suivez l'actualité du basketball et de la NBA, les meilleurs matchs et transferts.",
      highlights: ["Actus NBA", "Meilleurs joueurs", "Résultats", "Transferts basketball"],
    },
  },
  tennis: {
    icon: "🎾",
    colorFrom: "#15803d",
    colorTo: "#16a34a",
    primary: "#16a34a",
    primarySoft: "#f0fdf4",
    border: "#bbf7d0",
    pageBg: "#f0fdf4",
    en: {
      title: "Tennis",
      description: "Full coverage of world tennis: Grand Slams, ATP/WTA rankings and top players.",
      highlights: ["Grand Slams", "Top players", "Wimbledon", "Roland Garros"],
    },
    fr: {
      title: "Tennis",
      description: "Toute l'actualité du tennis mondial : Grand Chelems, classements ATP/WTA et grands joueurs.",
      highlights: ["Grand Chelems", "Meilleurs joueurs", "Wimbledon", "Roland Garros"],
    },
  },
  padel: {
    icon: "🏸",
    colorFrom: "#1d4ed8",
    colorTo: "#2563eb",
    primary: "#2563eb",
    primarySoft: "#eff6ff",
    border: "#bfdbfe",
    pageBg: "#eff6ff",
    en: {
      title: "Padel",
      description: "World padel news, major tournaments, top players and latest updates.",
      highlights: ["World Padel Tour", "Tournaments", "Top players", "Sport evolution"],
    },
    fr: {
      title: "Padel",
      description: "Actualités du padel mondial, grandes compétitions, meilleurs joueurs et dernières infos.",
      highlights: ["World Padel Tour", "Tournois", "Meilleurs joueurs", "Évolution du sport"],
    },
  },
  futsal: {
    icon: "⚽",
    colorFrom: "#7c3aed",
    colorTo: "#9333ea",
    primary: "#7c3aed",
    primarySoft: "#f5f3ff",
    border: "#ddd6fe",
    pageBg: "#f5f3ff",
    en: {
      title: "Futsal",
      description: "Latest futsal and indoor football news, tournaments and match results.",
      highlights: ["Indoor Football", "Futsal tournaments", "Top clubs", "Match results"],
    },
    fr: {
      title: "Futsal",
      description: "Dernières actualités du futsal et football en salle, compétitions et résultats.",
      highlights: ["Football indoor", "Tournois futsal", "Meilleurs clubs", "Résultats"],
    },
  },
  f1: {
    icon: "🏎️",
    colorFrom: "#7f1d1d",
    colorTo: "#dc2626",
    primary: "#dc2626",
    primarySoft: "#fee2e2",
    border: "#fecaca",
    pageBg: "#fff1f2",
    en: {
      title: "Formula 1",
      description: "Full Formula 1 coverage — race results, driver standings, team news and Grand Prix updates.",
      highlights: ["Driver standings", "Grand Prix results", "Red Bull & Ferrari", "Max Verstappen"],
    },
    fr: {
      title: "Formule 1",
      description: "Toute l'actualité de la Formule 1 — résultats de courses, classements pilotes et infos écuries.",
      highlights: ["Classement pilotes", "Résultats Grand Prix", "Red Bull & Ferrari", "Max Verstappen"],
    },
  },
  golf: {
    icon: "⛳",
    colorFrom: "#052e16",
    colorTo: "#16a34a",
    primary: "#16a34a",
    primarySoft: "#dcfce7",
    border: "#bbf7d0",
    pageBg: "#f0fdf4",
    en: {
      title: "Golf",
      description: "Golf news, PGA Tour rankings, Masters results and top players worldwide.",
      highlights: ["PGA Tour", "World rankings", "Masters & Majors", "Scottie Scheffler"],
    },
    fr: {
      title: "Golf",
      description: "Actualités golf, classements PGA Tour, résultats des Majors et meilleurs joueurs.",
      highlights: ["PGA Tour", "Classement mondial", "Masters & Majors", "Scottie Scheffler"],
    },
  },
};

export default function LocalizedSportPage({ slug, lang }) {
  const cfg = sportConfig[slug];
  if (!cfg) return null;

  const isRTL = lang === "ar";
  const dir   = isRTL ? "rtl" : "ltr";
  const prefix = lang === "ar" ? "" : `/${lang}`;
  const lc = cfg[lang] || cfg.en;

  const sportArticles = articles
    .filter(a => a.slug && (a.sport === slug || (slug === "football" && (!a.sport || a.sport === "football"))))
    .slice(0, 8);

  const featuredArticle = sportArticles[0] || null;
  const restArticles    = sportArticles.slice(1);

  const articleTitle = (a) => lang === "en" ? (a.en_title || a.title) : lang === "fr" ? (a.fr_title || a.title) : a.title;
  const articleDesc  = (a) => lang === "en" ? (a.en_description || a.description) : lang === "fr" ? (a.fr_description || a.description) : a.description;
  const articleHref  = (a) => `${prefix}/articles/${a.slug}/`;

  const backLabel   = lc.back || (lang === "fr" ? "← Accueil" : "← Home");
  const leagueLabel = (l) => leagueTitles[l.slug]?.[lang] || leagueTitles[l.slug]?.en || l.slug;
  const countryLabel = (l) => lang === "fr" ? (l.fr || l.country) : l.country;

  return (
    <main style={{ minHeight: "100vh", background: cfg.pageBg, padding: "28px 20px 52px", direction: dir }}>
      <div style={{ maxWidth: "1450px", margin: "0 auto" }}>

        {/* Hero */}
        <section style={{
          position: "relative", overflow: "hidden",
          background: `linear-gradient(135deg, ${cfg.colorFrom}, ${cfg.colorTo})`,
          borderRadius: "34px", padding: "40px 34px", color: "white",
          marginBottom: "28px", boxShadow: "0 18px 42px rgba(0,0,0,0.12)"
        }}>
          <div style={{ position: "absolute", top: "-60px", left: "-60px", width: "200px", height: "200px", borderRadius: "999px", background: "rgba(255,255,255,0.07)" }} />
          <div style={{ position: "absolute", bottom: "-80px", right: "-40px", width: "220px", height: "220px", borderRadius: "999px", background: "rgba(255,255,255,0.07)" }} />
          <div style={{ position: "relative" }}>
            <Link href={`${prefix}/`} style={{ display: "inline-block", textDecoration: "none", color: "white", fontWeight: 700, fontSize: "14px", opacity: 0.9, marginBottom: "16px" }}>
              {backLabel}
            </Link>
            <div style={{ display: "flex", alignItems: "center", gap: "18px", marginBottom: "14px" }}>
              <span style={{ fontSize: "64px" }}>{cfg.icon}</span>
              <h1 style={{ margin: 0, fontSize: "clamp(32px,5vw,56px)", fontWeight: 900 }}>{lc.title}</h1>
            </div>
            <p style={{ margin: "0 0 20px 0", maxWidth: "800px", fontSize: "20px", lineHeight: 1.9, opacity: 0.95 }}>{lc.description}</p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {lc.highlights.map((item, i) => (
                <span key={i} style={{ background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.18)", padding: "8px 14px", borderRadius: "999px", fontSize: "13px", fontWeight: 700 }}>{item}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Non-football sports: Leagues */}
        {!cfg.isFootball && sportLeagues[slug] && sportLeagues[slug].length > 0 && (
          <section style={{ marginBottom: "28px" }}>
            <h2 style={{ margin: "0 0 16px 0", fontSize: "26px", fontWeight: 800, color: "#111827" }}>
              {lang === "fr" ? "Compétitions" : lang === "en" ? "Competitions" : "البطولات والمسابقات"}
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
              {sportLeagues[slug].map((league) => (
                <Link key={league.slug} href={`${prefix}/league/${league.slug}/`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div style={{ background: "white", border: `1px solid #e5e7eb`, borderRadius: "22px", padding: "18px 16px", display: "flex", alignItems: "center", gap: "12px", boxShadow: "0 6px 20px rgba(0,0,0,0.06)", borderTop: `4px solid ${league.color}` }}>
                    <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: league.logoBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden", padding: "8px" }}>
                      <img src={league.logo} alt={leagueTitles[league.slug]?.[lang] || league.slug} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    </div>
                    <div>
                      <div style={{ color: league.color, fontSize: "11px", fontWeight: 700, marginBottom: "3px" }}>{lang === "fr" ? (league.fr || league.country) : league.country}</div>
                      <div style={{ fontSize: "15px", fontWeight: 800, color: "#111827", lineHeight: 1.4 }}>{leagueTitles[league.slug]?.[lang] || leagueTitles[league.slug]?.en || league.slug}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Football: Leagues + Competitions */}
        {cfg.isFootball && (
          <>
            <section style={{ marginBottom: "24px" }}>
              <h2 style={{ margin: "0 0 16px 0", fontSize: "28px", fontWeight: 800, color: "#111827" }}>{lc.leaguesTitle || "Leagues"}</h2>
              <div className="g4">
                {footballLeagues.map((league) => (
                  <Link key={league.slug} href={`${prefix}/league/${league.slug}/`} style={{ textDecoration: "none", color: "inherit" }}>
                    <div style={{ background: "white", border: `1px solid #e5e7eb`, borderRadius: "22px", padding: "18px 16px", display: "flex", alignItems: "center", gap: "12px", boxShadow: "0 6px 20px rgba(0,0,0,0.06)", borderTop: `4px solid ${league.color}` }}>
                      <div style={{ width: "56px", height: "56px", borderRadius: "14px", background: league.logoBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden", padding: "8px" }}>
                        <img src={league.logo} alt={leagueLabel(league)} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                      </div>
                      <div>
                        <div style={{ color: league.color, fontSize: "11px", fontWeight: 700, marginBottom: "3px" }}>{countryLabel(league)}</div>
                        <div style={{ fontSize: "15px", fontWeight: 800, color: "#111827", lineHeight: 1.4 }}>{leagueLabel(league)}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <section style={{ marginBottom: "28px" }}>
              <h2 style={{ margin: "0 0 16px 0", fontSize: "28px", fontWeight: 800, color: "#111827" }}>{lc.compTitle || "International"}</h2>
              <div className="g5 g5-mobile2">
                {globalCompetitions.map((comp) => (
                  <Link key={comp.slug} href={`${prefix}/league/${comp.slug}/`} style={{ textDecoration: "none", color: "inherit" }}>
                    <div style={{ background: "white", border: `1px solid #e5e7eb`, borderRadius: "22px", padding: "20px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", boxShadow: "0 6px 20px rgba(0,0,0,0.06)", textAlign: "center", borderTop: `4px solid ${comp.color}` }}>
                      <div style={{ width: "60px", height: "60px", borderRadius: "14px", background: comp.logoBg, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", padding: "8px" }}>
                        <img src={comp.logo} alt={comp[lang] || comp.en} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                      </div>
                      <div style={{ color: comp.color, fontSize: "11px", fontWeight: 700 }}>{comp.country}</div>
                      <div style={{ fontSize: "14px", fontWeight: 800, color: "#111827", lineHeight: 1.4 }}>{comp[lang] || comp.en}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}

        <AdSlot label={lang === "fr" ? "Publicité" : "Advertisement"} minHeight={90} style={{ marginBottom: 24 }} />

        {/* Articles */}
        {sportArticles.length > 0 && (
          <section>
            <h2 style={{ margin: "0 0 18px 0", fontSize: "30px", fontWeight: 800, color: "#111827" }}>
              {lc.newsTitle || (lang === "fr" ? `Dernières actus ${lc.title}` : `Latest ${lc.title} News`)}
            </h2>
            <div className="g4">
              {sportArticles.map((a) => (
                <Link key={a.slug} href={articleHref(a)} style={{ textDecoration: "none", color: "inherit" }}>
                  <article style={{ background: "white", borderRadius: "22px", overflow: "hidden", border: "1px solid #e5e7eb", height: "100%" }}>
                    <ArticleImage src={a.image} imageUrl={a.imageUrl} alt={articleTitle(a)} sport={a.sport} league={a.league} slug={a.slug} style={{ width: "100%", height: "190px", display: "block" }} />
                    <div style={{ padding: "18px" }}>
                      <h3 style={{ margin: "0 0 8px 0", fontSize: "17px", lineHeight: 1.6, fontWeight: 800, color: "#111827" }}>{articleTitle(a)}</h3>
                      <p style={{ margin: 0, color: "#4b5563", fontSize: "14px", lineHeight: 1.8 }}>{(articleDesc(a) || "").slice(0, 100)}…</p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        )}

        {sportArticles.length === 0 && (
          <section style={{ background: "white", borderRadius: "28px", padding: "40px", border: `1px solid ${cfg.border}`, textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>{cfg.icon}</div>
            <h2 style={{ margin: "0 0 12px 0", fontSize: "28px", fontWeight: 800 }}>
              {lang === "fr" ? "Contenu en cours de génération" : "Content being generated"}
            </h2>
            <p style={{ color: "#6b7280", fontSize: "18px", lineHeight: 1.9, maxWidth: "500px", margin: "0 auto" }}>
              {lang === "fr" ? `Les articles ${lc.title} seront disponibles lors du prochain cycle de mise à jour.` : `${lc.title} articles will appear after the next content refresh cycle.`}
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
