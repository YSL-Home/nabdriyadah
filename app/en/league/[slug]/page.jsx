import Link from "next/link";
import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import articles from "../../../../content/articles/seo-articles.json";
import teamsDataRaw from "../../../../content/teams-data.json";
import AdSlot from "../../../components/AdSlot";
import ArticleImage from "../../../components/ArticleImage";
import ArticleFiltersClient from "../../../components/ArticleFiltersClient";
import { getT } from "../../../../lib/i18n";
import { displayName } from "../../../../lib/teamNames";

const leagueConfig = {
  "premier-league":   { title: "Premier League",      logo: "https://media.api-sports.io/football/leagues/39.png",  theme: { heroFrom: "#3b0764", heroTo: "#7c3aed", primary: "#6d28d9", primarySoft: "#ede9fe", border: "#ddd6fe" } },
  "la-liga":          { title: "La Liga",              logo: "https://media.api-sports.io/football/leagues/140.png", theme: { heroFrom: "#9a3412", heroTo: "#f97316", primary: "#ea580c", primarySoft: "#fff7ed", border: "#fed7aa" } },
  "bundesliga":       { title: "Bundesliga",           logo: "https://media.api-sports.io/football/leagues/78.png",  theme: { heroFrom: "#1a1a1a", heroTo: "#dc2626", primary: "#dc2626", primarySoft: "#fef2f2", border: "#fecaca" } },
  "serie-a":          { title: "Serie A",              logo: "https://media.api-sports.io/football/leagues/135.png", theme: { heroFrom: "#1e3a8a", heroTo: "#3b82f6", primary: "#2563eb", primarySoft: "#eff6ff", border: "#bfdbfe" } },
  "ligue-1":          { title: "Ligue 1",              logo: "https://media.api-sports.io/football/leagues/61.png",  theme: { heroFrom: "#1e3a5f", heroTo: "#2563eb", primary: "#1d4ed8", primarySoft: "#eff6ff", border: "#bfdbfe" } },
  "champions-league": { title: "Champions League",    logo: "https://media.api-sports.io/football/leagues/2.png",   theme: { heroFrom: "#1e3a8a", heroTo: "#7c3aed", primary: "#4f46e5", primarySoft: "#eef2ff", border: "#c7d2fe" } },
  "saudi-pro-league": { title: "Saudi Pro League",    logo: "https://media.api-sports.io/football/leagues/307.png", theme: { heroFrom: "#14532d", heroTo: "#16a34a", primary: "#16a34a", primarySoft: "#f0fdf4", border: "#bbf7d0" } },
  "eredivisie":       { title: "Eredivisie",           logo: "https://media.api-sports.io/football/leagues/88.png",  theme: { heroFrom: "#dc2626", heroTo: "#f97316", primary: "#dc2626", primarySoft: "#fef2f2", border: "#fecaca" } },
  "mls":              { title: "MLS",                  logo: "https://media.api-sports.io/football/leagues/253.png", theme: { heroFrom: "#1e3a8a", heroTo: "#dc2626", primary: "#1d4ed8", primarySoft: "#eff6ff", border: "#bfdbfe" } },
  "liga-portugal":    { title: "Liga Portugal",        logo: "https://media.api-sports.io/football/leagues/94.png",  theme: { heroFrom: "#7f1d1d", heroTo: "#dc2626", primary: "#dc2626", primarySoft: "#fef2f2", border: "#fecaca" } },
  "botola":           { title: "Botola Pro",           logo: "https://media.api-sports.io/football/leagues/200.png", theme: { heroFrom: "#14532d", heroTo: "#16a34a", primary: "#16a34a", primarySoft: "#f0fdf4", border: "#bbf7d0" } },
  "world-cup":        { title: "FIFA World Cup",            logo: "https://media.api-sports.io/football/leagues/1.png",   theme: { heroFrom: "#1a1a2e", heroTo: "#c9a84c", primary: "#b45309", primarySoft: "#fffbeb", border: "#fde68a" } },
  "euro":             { title: "UEFA Euro",                 logo: "https://media.api-sports.io/football/leagues/4.png",   theme: { heroFrom: "#003399", heroTo: "#0066cc", primary: "#1d4ed8", primarySoft: "#eff6ff", border: "#bfdbfe" } },
  "afcon":            { title: "AFCON — Africa Cup of Nations", logo: "https://media.api-sports.io/football/leagues/6.png", theme: { heroFrom: "#78350f", heroTo: "#f59e0b", primary: "#d97706", primarySoft: "#fffbeb", border: "#fde68a" } },
  "caf-champions-league": { title: "CAF Champions League", logo: "https://media.api-sports.io/football/leagues/20.png",  theme: { heroFrom: "#78350f", heroTo: "#d97706", primary: "#b45309", primarySoft: "#fffbeb", border: "#fde68a" } },
  "club-world-cup":   { title: "Club World Cup",            logo: "https://media.api-sports.io/football/leagues/15.png",  theme: { heroFrom: "#1a1a2e", heroTo: "#4f46e5", primary: "#4f46e5", primarySoft: "#eef2ff", border: "#c7d2fe" } },
  "botola-ma":        { title: "Botola Pro (Morocco)",      logo: "https://media.api-sports.io/football/leagues/200.png", theme: { heroFrom: "#14532d", heroTo: "#16a34a", primary: "#16a34a", primarySoft: "#f0fdf4", border: "#bbf7d0" } },
  "ligue-pro-dz":     { title: "Algerian Pro League",       logo: "https://media.api-sports.io/football/leagues/197.png", theme: { heroFrom: "#14532d", heroTo: "#dc2626", primary: "#b91c1c", primarySoft: "#fef2f2", border: "#fecaca" } },
  "prem-egy":         { title: "Egyptian Premier League",   logo: "https://media.api-sports.io/football/leagues/233.png", theme: { heroFrom: "#7f1d1d", heroTo: "#dc2626", primary: "#b91c1c", primarySoft: "#fef2f2", border: "#fecaca" } },
  "ligue-pro-tn":     { title: "Tunisian Pro League",       logo: "https://media.api-sports.io/football/leagues/202.png", theme: { heroFrom: "#7f1d1d", heroTo: "#dc2626", primary: "#b91c1c", primarySoft: "#fef2f2", border: "#fecaca" } },
  "nba":              { title: "NBA",                       logo: "https://media.api-sports.io/basketball/leagues/12.png", theme: { heroFrom: "#1d4ed8", heroTo: "#dc2626", primary: "#1d4ed8", primarySoft: "#eff6ff", border: "#bfdbfe" } },
  "atp":              { title: "ATP Tour",                  logo: "https://media.api-sports.io/tennis/leagues/1.png",     theme: { heroFrom: "#1a1a2e", heroTo: "#0ea5e9", primary: "#0284c7", primarySoft: "#f0f9ff", border: "#bae6fd" } },
  "wta":              { title: "WTA Tour",                  logo: "https://media.api-sports.io/tennis/leagues/2.png",     theme: { heroFrom: "#9d174d", heroTo: "#ec4899", primary: "#db2777", primarySoft: "#fdf2f8", border: "#fbcfe8" } },
  "padel-premier":    { title: "Premier Padel",             logo: "https://media.api-sports.io/football/leagues/1.png",   theme: { heroFrom: "#065f46", heroTo: "#10b981", primary: "#059669", primarySoft: "#ecfdf5", border: "#a7f3d0" } },
  "futsal-monde":     { title: "Futsal World Cup",          logo: "https://media.api-sports.io/football/leagues/1.png",   theme: { heroFrom: "#1e3a8a", heroTo: "#3b82f6", primary: "#2563eb", primarySoft: "#eff6ff", border: "#bfdbfe" } },
  "f1":               { title: "Formula 1",                 logo: "https://media.api-sports.io/formula-1/logo.png",       theme: { heroFrom: "#1a1a1a", heroTo: "#dc2626", primary: "#dc2626", primarySoft: "#fef2f2", border: "#fecaca" } },
  "pga-tour":         { title: "PGA Tour",                  logo: "https://media.api-sports.io/golf/leagues/1.png",       theme: { heroFrom: "#14532d", heroTo: "#16a34a", primary: "#16a34a", primarySoft: "#f0fdf4", border: "#bbf7d0" } },
};

export function generateStaticParams() {
  return Object.keys(leagueConfig).map(slug => ({ slug }));
}

export function generateMetadata({ params }) {
  const cfg = leagueConfig[params.slug];
  if (!cfg) return { title: "League not found" };
  return {
    title: `${cfg.title} — Standings, Teams & News | Sports Pulse`,
    description: `Follow the latest ${cfg.title} news, standings and team coverage on Sports Pulse.`,
    alternates: {
      canonical: `https://nabdriyadah.com/en/league/${params.slug}/`,
      languages: {
        "en": `https://nabdriyadah.com/en/league/${params.slug}/`,
        "fr": `https://nabdriyadah.com/fr/league/${params.slug}/`,
        "ar": `https://nabdriyadah.com/league/${params.slug}/`,
        "x-default": `https://nabdriyadah.com/league/${params.slug}/`,
      },
    },
  };
}

export default function EnLeaguePage({ params }) {
  const { slug } = params;
  const cfg = leagueConfig[slug];
  if (!cfg) return notFound();

  const tr = getT("en");
  const theme = cfg.theme;

  // Load standings
  let standings = [];
  try {
    const base = path.join(process.cwd(), "content/standings");
    const p = path.join(base, `${slug}.json`);
    if (p.startsWith(base + path.sep) || p === base) {
      const raw = JSON.parse(fs.readFileSync(p, "utf-8"));
      standings = raw.standings || [];
    }
  } catch {}

  // Teams for this league
  const leagueTeams = Object.entries(teamsDataRaw)
    .filter(([, t]) => t.league === slug)
    .map(([s, t]) => ({ slug: s, name: t.name, logo: t.logo }))
    .slice(0, 24);

  // Articles — all matching, sorted newest first
  const leagueArticles = articles
    .filter(a => a.slug && (a.league === slug || (a.league === "mixed" && a.sport === "football") || a.sport === "football"))
    .sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-page)", padding: "0 0 60px", direction: "ltr" }}>
      {/* Hero */}
      <section style={{ background: `linear-gradient(135deg, ${theme.heroFrom} 0%, ${theme.heroTo} 100%)`, color: "white", padding: "40px 24px 50px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", gap: "24px" }}>
          <img src={cfg.logo} alt={cfg.title} style={{ width: "80px", height: "80px", objectFit: "contain", filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3))" }} />
          <div>
            <h1 style={{ margin: 0, fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 900 }}>{cfg.title}</h1>
            <p style={{ margin: "8px 0 0", opacity: 0.85, fontSize: "16px" }}>
              Follow standings, results and team news for {cfg.title}
            </p>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "28px 24px 0" }}>
        <AdSlot label="Advertisement" minHeight={90} style={{ marginBottom: 24 }} />

        {/* Standings */}
        <section style={{ background: "var(--bg-card)", borderRadius: "24px", padding: "28px", border: `1px solid ${theme.border}`, marginBottom: "28px", boxShadow: "var(--shadow)" }}>
          <h2 style={{ margin: "0 0 20px", fontSize: "24px", fontWeight: 800, color: "var(--text-1)" }}>📊 {tr.leagueStandings}</h2>
          {standings.length === 0 ? (
            <p style={{ color: "var(--text-2)" }}>Standings are being updated, check back soon.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                <thead>
                  <tr style={{ background: theme.primarySoft, color: theme.primary || "#1d4ed8" }}>
                    {[tr.rank, "", "Team", tr.played, tr.won, tr.drawn, tr.lost, tr.gf, tr.ga, tr.gd, tr.points].map((h, i) => (
                      <th key={i} style={{ padding: "10px 8px", fontWeight: 800, textAlign: i > 1 ? "center" : "left", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {standings.map((row, i) => (
                    <tr key={row.slug || i} style={{ borderBottom: `1px solid var(--border)`, background: i % 2 === 0 ? "var(--bg-card)" : "var(--bg-soft)" }}>
                      <td style={{ padding: "10px 8px", fontWeight: 800, color: theme.primary, textAlign: "center" }}>{row.rank}</td>
                      <td style={{ padding: "10px 8px" }}>
                        {row.logo && <img src={row.logo} alt="" style={{ width: "24px", height: "24px", objectFit: "contain" }} />}
                      </td>
                      <td style={{ padding: "10px 8px", fontWeight: 700, color: "var(--text-1)" }}>
                        {row.slug
                          ? <Link href={`/en/team/${row.slug}/`} style={{ textDecoration: "none", color: "var(--text-1)" }}>{displayName(row.slug, row.name, "en")}</Link>
                          : displayName(row.slug, row.name, "en")}
                      </td>
                      {[row.played, row.won, row.drawn, row.lost, row.gf, row.ga, row.gd, row.points].map((v, j) => (
                        <td key={j} style={{ padding: "10px 8px", textAlign: "center", fontWeight: j === 7 ? 900 : 600, color: j === 7 ? theme.primary : "var(--text-2)" }}>{v ?? 0}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Teams */}
        <section style={{ marginBottom: "28px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "16px", color: "var(--text-1)" }}>🏟️ {tr.leagueTeams}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "12px" }}>
            {leagueTeams.map(t => (
              <Link key={t.slug} href={`/en/team/${t.slug}/`} style={{ textDecoration: "none" }}>
                <div style={{ background: "var(--bg-card)", borderRadius: "16px", padding: "16px", textAlign: "center", border: `1px solid var(--border)`, boxShadow: "var(--shadow)", transition: "box-shadow 0.15s" }}>
                  <img src={t.logo} alt={t.name} style={{ width: "48px", height: "48px", objectFit: "contain", marginBottom: "8px" }} />
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-1)", lineHeight: 1.3 }}>{t.name}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Latest News — compact grid */}
        {(() => {
          const recentArticles = articles
            .filter(a => a.slug && a.league === slug)
            .sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0))
            .slice(0, 6);
          if (recentArticles.length === 0) return null;
          return (
            <section style={{ marginBottom: "28px" }}>
              <h2 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "16px", color: "var(--text-1)" }}>Latest News</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                {recentArticles.map(a => (
                  <Link key={a.slug} href={`/articles/${a.slug}/`} style={{ textDecoration: "none", display: "flex", gap: "10px", alignItems: "flex-start", background: "var(--bg-card)", borderRadius: "12px", padding: "10px", border: "1px solid var(--border)" }}>
                    {a.image && (
                      <img src={a.image} alt="" loading="lazy" style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px", flexShrink: 0 }} />
                    )}
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-1)", lineHeight: 1.4 }}>{a.en_title || a.title}</span>
                  </Link>
                ))}
              </div>
            </section>
          );
        })()}

        {/* Articles */}
        <section>
          <h2 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "16px", color: "var(--text-1)" }}>📰 {tr.leagueArticles}</h2>
          <ArticleFiltersClient
            articles={leagueArticles}
            lang="en"
            prefix="/en"
            primaryColor={theme.primary}
            showSportFilter={true}
          />
        </section>
      </div>
    </main>
  );
}
