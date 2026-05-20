import Link from "next/link";
import fs from "fs";
import path from "path";
import articles from "../../content/articles/seo-articles.json";
import AdSlot from "./AdSlot";
import ArticleImage from "./ArticleImage";
import SportRankings from "./SportRankings";
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
  "premier-league":    { en: "Premier League",     fr: "Premier League"     },
  "la-liga":           { en: "La Liga",            fr: "La Liga"            },
  "bundesliga":        { en: "Bundesliga",         fr: "Bundesliga"         },
  "serie-a":           { en: "Serie A",            fr: "Serie A"            },
  "ligue-1":           { en: "Ligue 1",            fr: "Ligue 1"            },
  "champions-league":  { en: "Champions League",  fr: "Ligue des Champions" },
  "saudi-pro-league":  { en: "Saudi Pro League",  fr: "Saudi Pro League"   },
  "eredivisie":        { en: "Eredivisie",         fr: "Eredivisie"         },
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
    icon: "🎾",
    logo: "/logos/padel.svg",
    colorFrom: "#1d4ed8",
    colorTo: "#2563eb",
    primary: "#2563eb",
    primarySoft: "#eff6ff",
    border: "#bfdbfe",
    pageBg: "#eff6ff",
    en: {
      title: "Padel",
      description: "World padel news, Premier Padel, FIP rankings, top players and latest updates.",
      highlights: ["Premier Padel", "FIP World Ranking", "Top players", "Sport evolution"],
    },
    fr: {
      title: "Padel",
      description: "Actualités du padel mondial, Premier Padel, classement FIP, meilleurs joueurs.",
      highlights: ["Premier Padel", "Classement FIP", "Meilleurs joueurs", "Évolution du sport"],
    },
  },
  futsal: {
    icon: "🥅",
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
    logo: "/logos/f1.svg",
    colorFrom: "#7f1d1d",
    colorTo: "#dc2626",
    primary: "#dc2626",
    primarySoft: "#fef2f2",
    border: "#fecaca",
    pageBg: "#fef2f2",
    en: {
      title: "Formula 1",
      description: "Full coverage of Formula 1: drivers standings, team rankings, race calendar and results.",
      highlights: ["Drivers standings", "Race calendar", "Top teams", "Race results"],
      back: "← Home",
    },
    fr: {
      title: "Formule 1",
      description: "Toute l'actualité de la Formule 1 : classement pilotes, équipes, calendrier et résultats.",
      highlights: ["Classement pilotes", "Calendrier", "Meilleures écuries", "Résultats"],
      back: "← Accueil",
    },
  },
  golf: {
    icon: "⛳",
    logo: "/logos/golf.svg",
    colorFrom: "#052e16",
    colorTo: "#16a34a",
    primary: "#16a34a",
    primarySoft: "#f0fdf4",
    border: "#bbf7d0",
    pageBg: "#f0fdf4",
    en: {
      title: "Golf",
      description: "World golf news, PGA Tour, OWGR world rankings, majors and top players.",
      highlights: ["PGA Tour", "World Rankings", "Major Championships", "Top players"],
      back: "← Home",
    },
    fr: {
      title: "Golf",
      description: "Actualités du golf mondial, PGA Tour, classement OWGR, Majeurs et grands joueurs.",
      highlights: ["PGA Tour", "Classement mondial", "Tournois Majeurs", "Meilleurs joueurs"],
      back: "← Accueil",
    },
  },
};

function SportIcon({ cfg, size = 64 }) {
  if (cfg.logo) {
    return (
      <img
        src={cfg.logo}
        alt=""
        width={size}
        height={size}
        style={{ objectFit: "contain", filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.25))", flexShrink: 0 }}
      />
    );
  }
  return <span style={{ fontSize: `${size}px`, lineHeight: 1 }}>{cfg.icon}</span>;
}

export default function LocalizedSportPage({ slug, lang }) {
  const cfg = sportConfig[slug];
  if (!cfg) return null;

  const isRTL = lang === "ar";
  const dir   = isRTL ? "rtl" : "ltr";
  const prefix = lang === "ar" ? "" : `/${lang}`;
  const lc = cfg[lang] || cfg.en;

  const hasArabic = (str) => /[؀-ۿ]/.test(str || "");
  const getArticleTitle = (a) => {
    if (lang === "en") {
      if (a.en_title) return a.en_title;
      if (a.sourceTitle && !hasArabic(a.sourceTitle)) return a.sourceTitle;
      return null;
    }
    if (lang === "fr") {
      if (a.fr_title) return a.fr_title;
      if (a.en_title) return a.en_title;
      if (a.sourceTitle && !hasArabic(a.sourceTitle)) return a.sourceTitle;
      return null;
    }
    return a.title;
  };

  const sportArticles = articles
    .filter(a => a.slug && (a.sport === slug || (slug === "football" && (!a.sport || a.sport === "football"))))
    .filter(a => lang === "ar" || getArticleTitle(a) !== null)
    .slice(0, 8);

  const featuredArticle = sportArticles[0] || null;
  const restArticles    = sportArticles.slice(1);

  const articleTitle = (a) => getArticleTitle(a) || a.title;
  const articleDesc  = (a) => {
    if (lang === "en") return a.en_description || (!hasArabic(a.description) ? a.description : "") || "";
    if (lang === "fr") return a.fr_description || a.en_description || (!hasArabic(a.description) ? a.description : "") || "";
    return a.description;
  };
  const articleHref  = (a) => `${prefix}/articles/${a.slug}/`;

  const backLabel   = lc.back || (lang === "fr" ? "← Accueil" : "← Home");
  const leagueLabel = (l) => leagueTitles[l.slug]?.[lang] || leagueTitles[l.slug]?.en || l.slug;
  const countryLabel = (l) => lang === "fr" ? (l.fr || l.country) : l.country;

  // Standings data (read server-side from JSON files)
  const readStandings = (file) => {
    try { return JSON.parse(fs.readFileSync(path.join(process.cwd(), "content/standings", file), "utf-8")); } catch { return null; }
  };
  const STANDINGS_MAP = {
    tennis:     () => { const atp=readStandings("atp.json"); const wta=readStandings("wta.json"); return { data:atp?.rankings||[], data2:wta?.rankings||[], accentColor:"#15803d", accentColor2:"#7c3aed", titlePrimary: lang==="fr"?"ATP — Hommes":"ATP — Men", titleSecondary: lang==="fr"?"WTA — Femmes":"WTA — Women", sourceUrl:"https://www.atptour.com/en/rankings/singles", sourceLabel:"ATP Tour", sourceUrl2:"https://www.wtatennis.com/rankings/singles", sourceLabel2:"WTA Tour" }; },
    padel:      () => { const d=readStandings("padel-premier.json"); return { data:d?.men||[], data2:d?.women||[], accentColor:"#2563eb", accentColor2:"#7c3aed", titlePrimary: lang==="fr"?"FIP — Hommes":"FIP — Men", titleSecondary: lang==="fr"?"FIP — Femmes":"FIP — Women", sourceUrl:"https://www.padelfip.com/ranking-male/", sourceLabel:"FIP", sourceUrl2:"https://www.padelfip.com/ranking-female/", sourceLabel2:"FIP" }; },
    basketball: () => { const d=readStandings("nba.json"); return { data:d?.standings||[], accentColor:"#c2410c", titlePrimary: lang==="fr"?"NBA — Classement":"NBA — Standings", sourceUrl:"https://www.nba.com/standings", sourceLabel:"NBA" }; },
    f1:         () => { const d=readStandings("f1.json"); return { data:d?.rankings||[], accentColor:"#dc2626", titlePrimary: lang==="fr"?"F1 — Pilotes":"F1 — Drivers", sourceUrl:"https://www.formula1.com/en/results.html", sourceLabel:"F1" }; },
    golf:       () => { const d=readStandings("pga-tour.json"); return { data:d?.rankings||[], accentColor:"#16a34a", titlePrimary: lang==="fr"?"PGA Tour — Classement":"PGA Tour — Rankings", sourceUrl:"https://www.owgr.com/ranking", sourceLabel:"OWGR" }; },
    football:   () => { const d=readStandings("premier-league.json"); return { data:d?.standings||[], accentColor:"#1d4ed8", titlePrimary: lang==="fr"?"Premier League — Classement":"Premier League — Standings", sourceUrl:"https://www.premierleague.com/tables", sourceLabel:"PL" }; },
  };
  const standingsProps = STANDINGS_MAP[slug]?.() || null;

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
              <SportIcon cfg={cfg} size={64} />
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

        {/* ── Classement / Rankings ── */}
        {standingsProps && standingsProps.data?.length > 0 && (
          <section style={{ marginBottom: "28px" }}>
            <h2 style={{ margin: "0 0 14px 0", fontSize: "24px", fontWeight: 800, color: "#111827" }}>
              {lang === "fr" ? "Classement" : "Rankings"}
            </h2>
            <SportRankings sport={slug} lang={lang} {...standingsProps} />
          </section>
        )}

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
