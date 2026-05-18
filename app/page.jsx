import articles from "../content/articles/seo-articles.json";
import BreakingTicker from "./components/BreakingTicker";
import HomepageClient from "./components/HomepageClient";

export const metadata = {
  title: "نبض الرياضة — أخبار الرياضة العربية والعالمية",
  description: "تابع أحدث أخبار كرة القدم، كرة السلة، التنس، البادل والرياضات الأخرى مع تغطية يومية وتحليلات خاصة.",
  alternates: { canonical: "https://nabdriyadah.com/" },
  openGraph: {
    images: [{ url: "https://nabdriyadah.com/og-default.jpg", width: 1200, height: 630, alt: "نبض الرياضة" }]
  }
};

function sortByDate(items) {
  return [...items].sort((a, b) => {
    const da = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const db = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return db - da;
  });
}

export default function HomePage() {
  const sorted = sortByDate(articles);

  // Ticker : articles des dernières 24h. Si aucun, on prend les 8 plus récents.
  const recentBreaking = sorted.filter((a) => {
    if (!a.publishedAt) return false;
    return Date.now() - new Date(a.publishedAt).getTime() < 24 * 60 * 60 * 1000;
  });
  const breaking = (recentBreaking.length > 0 ? recentBreaking : sorted).slice(0, 8);

  // ── Tri intelligent : récence + bonus football ──────────────────────────
  // Le foot obtient un bonus de 48h (comme s'il était 2 jours plus récent),
  // ce qui le priorise sans jamais mettre un article de 3 semaines avant
  // un article d'hier d'un autre sport.
  const FOOTBALL_BONUS_MS = 96 * 60 * 60 * 1000; // 96h en ms — foot prioritaire si < 4j de décalage

  function effectiveDate(a) {
    const ts = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    return a.sport === "football" ? ts + FOOTBALL_BONUS_MS : ts;
  }

  const boosted = [...sorted].sort((a, b) => effectiveDate(b) - effectiveDate(a));

  // Featured : 1er article du tri boosté
  const featured = boosted[0] ?? null;

  // Secondary (2 cartes hero) : 2 suivants du tri boosté
  const poolAfterFeatured = boosted.filter((a) => a !== featured);
  const secondary = poolAfterFeatured.slice(0, 2);

  // Grid (9 cartes max) : suivants du tri boosté
  const alreadyUsed = new Set([featured, ...secondary].filter(Boolean).map((a) => a.slug));
  const grid = boosted.filter((a) => !alreadyUsed.has(a.slug)).slice(0, 9);

  // Sidebar : articles récents mixtes (triés par date réelle, pas boostée)
  const gridSlugs = new Set(grid.map((a) => a.slug));
  const sidebar = sorted
    .filter((a) => !alreadyUsed.has(a.slug) && !gridSlugs.has(a.slug))
    .slice(0, 6);

  const basketball = sorted.filter((a) => a.sport === "basketball").slice(0, 4);
  const tennis     = sorted.filter((a) => a.sport === "tennis").slice(0, 4);
  const padel      = sorted.filter((a) => a.sport === "padel").slice(0, 4);

  // Sport counts for categories bar
  const sportCounts = {
    football:   sorted.filter((a) => a.sport === "football").length,
    basketball: sorted.filter((a) => a.sport === "basketball").length,
    tennis:     sorted.filter((a) => a.sport === "tennis").length,
    padel:      sorted.filter((a) => a.sport === "padel").length,
    futsal:     sorted.filter((a) => a.sport === "futsal").length,
  };

  return (
    <div style={{ background: "var(--bg-page)", minHeight: "100vh", direction: "rtl" }}>

      {/* Bandeau عاجل — toujours visible */}
      <BreakingTicker items={breaking} />

      {/* Main animated content — client component */}
      <div style={{ maxWidth: "1450px", margin: "0 auto", padding: "20px 16px 60px" }}>
        <HomepageClient
          featured={featured}
          secondary={secondary}
          grid={grid}
          sidebar={sidebar}
          basketball={basketball}
          tennis={tennis}
          padel={padel}
          sportCounts={sportCounts}
          totalArticles={sorted.length}
        />
      </div>
    </div>
  );
}
