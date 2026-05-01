import Link from "next/link";
import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import articles from "../../../../content/articles/seo-articles.json";
import teamsDataRaw from "../../../../content/teams-data.json";
import AdSlot from "../../../components/AdSlot";
import ArticleImage from "../../../components/ArticleImage";
import { getT } from "../../../../lib/i18n";

const leagueConfig = {
  "premier-league": { title: "Premier League", logo: "https://media.api-sports.io/football/leagues/39.png", theme: { heroFrom: "#3b0764", heroTo: "#7c3aed", primary: "#6d28d9", primarySoft: "#ede9fe", border: "#ddd6fe" } },
  "la-liga":        { title: "La Liga",         logo: "https://media.api-sports.io/football/leagues/140.png", theme: { heroFrom: "#9a3412", heroTo: "#f97316", primary: "#ea580c", primarySoft: "#fff7ed", border: "#fed7aa" } },
  "bundesliga":     { title: "Bundesliga",      logo: "https://media.api-sports.io/football/leagues/78.png", theme: { heroFrom: "#1a1a1a", heroTo: "#dc2626", primary: "#dc2626", primarySoft: "#fef2f2", border: "#fecaca" } },
  "serie-a":        { title: "Serie A",         logo: "https://media.api-sports.io/football/leagues/135.png", theme: { heroFrom: "#1e3a8a", heroTo: "#3b82f6", primary: "#2563eb", primarySoft: "#eff6ff", border: "#bfdbfe" } },
  "ligue-1":        { title: "Ligue 1",         logo: "https://media.api-sports.io/football/leagues/61.png", theme: { heroFrom: "#1e3a5f", heroTo: "#2563eb", primary: "#1d4ed8", primarySoft: "#eff6ff", border: "#bfdbfe" } },
  "champions-league": { title: "Ligue des Champions", logo: "https://media.api-sports.io/football/leagues/2.png", theme: { heroFrom: "#1e3a8a", heroTo: "#7c3aed", primary: "#4f46e5", primarySoft: "#eef2ff", border: "#c7d2fe" } },
  "saudi-pro-league": { title: "Saudi Pro League", logo: "https://media.api-sports.io/football/leagues/307.png", theme: { heroFrom: "#14532d", heroTo: "#16a34a", primary: "#16a34a", primarySoft: "#f0fdf4", border: "#bbf7d0" } },
  "eredivisie":     { title: "Eredivisie",      logo: "https://media.api-sports.io/football/leagues/88.png", theme: { heroFrom: "#dc2626", heroTo: "#f97316", primary: "#dc2626", primarySoft: "#fef2f2", border: "#fecaca" } },
  "mls":            { title: "MLS",             logo: "https://media.api-sports.io/football/leagues/253.png", theme: { heroFrom: "#1e3a8a", heroTo: "#dc2626", primary: "#1d4ed8", primarySoft: "#eff6ff", border: "#bfdbfe" } },
  "liga-portugal":  { title: "Liga Portugal",   logo: "https://media.api-sports.io/football/leagues/94.png", theme: { heroFrom: "#7f1d1d", heroTo: "#dc2626", primary: "#dc2626", primarySoft: "#fef2f2", border: "#fecaca" } },
  "botola":         { title: "Botola Pro",      logo: "https://media.api-sports.io/football/leagues/200.png", theme: { heroFrom: "#14532d", heroTo: "#16a34a", primary: "#16a34a", primarySoft: "#f0fdf4", border: "#bbf7d0" } },
};

export function generateStaticParams() {
  return Object.keys(leagueConfig).map(slug => ({ slug }));
}

export function generateMetadata({ params }) {
  const cfg = leagueConfig[params.slug];
  if (!cfg) return { title: "Ligue introuvable" };
  return {
    title: `${cfg.title} — Classement, Équipes & Actualités | Sports Pulse`,
    description: `Suivez les dernières actualités ${cfg.title}, classements et couverture des équipes sur Sports Pulse.`,
    alternates: { canonical: `https://nabdriyadah.com/fr/league/${params.slug}/` },
  };
}

export default function FrLeaguePage({ params }) {
  const { slug } = params;
  const cfg = leagueConfig[slug];
  if (!cfg) return notFound();

  const tr = getT("fr");
  const theme = cfg.theme;

  let standings = [];
  try {
    const p = path.join(process.cwd(), "content/standings", `${slug}.json`);
    const raw = JSON.parse(fs.readFileSync(p, "utf-8"));
    standings = raw.standings || [];
  } catch {}

  const leagueTeams = Object.entries(teamsDataRaw)
    .filter(([, t]) => t.league === slug)
    .map(([s, t]) => ({ slug: s, name: t.name, logo: t.logo }))
    .slice(0, 24);

  const leagueArticles = articles
    .filter(a => a.slug && (a.league === slug || a.league === "mixed" || a.sport === "football"))
    .slice(0, 6);

  return (
    <main style={{ minHeight: "100vh", background: "#f8fafc", padding: "0 0 60px", direction: "ltr" }}>
      <section style={{ background: `linear-gradient(135deg, ${theme.heroFrom} 0%, ${theme.heroTo} 100%)`, color: "white", padding: "40px 24px 50px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", gap: "24px" }}>
          <img src={cfg.logo} alt={cfg.title} style={{ width: "80px", height: "80px", objectFit: "contain", filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3))" }} />
          <div>
            <h1 style={{ margin: 0, fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 900 }}>{cfg.title}</h1>
            <p style={{ margin: "8px 0 0", opacity: 0.85, fontSize: "16px" }}>
              Classement, résultats et actualités {cfg.title}
            </p>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "28px 24px 0" }}>
        <AdSlot label="Publicité" minHeight={90} style={{ marginBottom: 24 }} />

        <section style={{ background: "white", borderRadius: "24px", padding: "28px", border: `1px solid ${theme.border}`, marginBottom: "28px", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}>
          <h2 style={{ margin: "0 0 20px", fontSize: "24px", fontWeight: 800 }}>📊 {tr.leagueStandings}</h2>
          {standings.length === 0 ? (
            <p style={{ color: "#6b7280" }}>Le classement sera disponible prochainement.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                <thead>
                  <tr style={{ background: theme.primarySoft, color: theme.primary }}>
                    {[tr.rank, "", "Équipe", tr.played, tr.won, tr.drawn, tr.lost, tr.gf, tr.ga, tr.gd, tr.points].map((h, i) => (
                      <th key={i} style={{ padding: "10px 8px", fontWeight: 800, textAlign: i > 1 ? "center" : "left", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {standings.map((row, i) => (
                    <tr key={row.slug || i} style={{ borderBottom: `1px solid ${theme.border}`, background: i % 2 === 0 ? "white" : theme.primarySoft + "66" }}>
                      <td style={{ padding: "10px 8px", fontWeight: 800, color: theme.primary, textAlign: "center" }}>{row.rank}</td>
                      <td style={{ padding: "10px 8px" }}>{row.logo && <img src={row.logo} alt="" style={{ width: "24px", height: "24px", objectFit: "contain" }} />}</td>
                      <td style={{ padding: "10px 8px", fontWeight: 700 }}>
                        {row.slug ? <Link href={`/fr/team/${row.slug}/`} style={{ textDecoration: "none", color: "#111827" }}>{row.name}</Link> : row.name}
                      </td>
                      {[row.played, row.won, row.drawn, row.lost, row.gf, row.ga, row.gd, row.points].map((v, j) => (
                        <td key={j} style={{ padding: "10px 8px", textAlign: "center", fontWeight: j === 7 ? 900 : 600, color: j === 7 ? theme.primary : "#374151" }}>{v ?? 0}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section style={{ marginBottom: "28px" }}>
          <h2 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "16px" }}>🏟️ {tr.leagueTeams}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "12px" }}>
            {leagueTeams.map(t => (
              <Link key={t.slug} href={`/fr/team/${t.slug}/`} style={{ textDecoration: "none" }}>
                <div style={{ background: "white", borderRadius: "16px", padding: "16px", textAlign: "center", border: `1px solid ${theme.border}`, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                  <img src={t.logo} alt={t.name} style={{ width: "48px", height: "48px", objectFit: "contain", marginBottom: "8px" }} />
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#111827", lineHeight: 1.3 }}>{t.name}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "16px" }}>📰 {tr.leagueArticles}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "18px" }}>
            {leagueArticles.map(a => (
              <Link key={a.slug} href={`/fr/articles/${a.slug}/`} style={{ textDecoration: "none", color: "inherit" }}>
                <article style={{ background: "white", borderRadius: "20px", overflow: "hidden", border: `1px solid ${theme.border}` }}>
                  <ArticleImage src={a.image} imageUrl={a.imageUrl} alt={a.title} sport={a.sport} league={a.league} slug={a.slug} style={{ width: "100%", height: "160px", display: "block" }} />
                  <div style={{ padding: "14px" }}>
                    <h3 style={{ margin: "0 0 6px", fontSize: "15px", fontWeight: 800, color: "#111827", lineHeight: 1.5 }}>{a.title}</h3>
                    <p style={{ margin: 0, fontSize: "13px", color: "#6b7280", lineHeight: 1.6 }}>{a.description}</p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
