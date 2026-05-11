import articles from "../content/articles/seo-articles.json";
import BreakingTicker from "./components/BreakingTicker";
import HomepageClient from "./components/HomepageClient";

export const metadata = {
  title: "نبض الرياضة — أخبار الرياضة العربية والعالمية",
  description: "تابع أحدث أخبار كرة القدم، كرة السلة، التنس، البادل والرياضات الأخرى مع تغطية يومية وتحليلات خاصة.",
  alternates: { canonical: "https://nabdriyadah.com/" }
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

  // Football toujours en tête — les autres sports en bas de page
  const football    = sorted.filter((a) => a.sport === "football");
  const nonFootball = sorted.filter((a) => a.sport !== "football");

  // Featured : meilleur article foot récent, sinon le plus récent toutes catégories
  const featured = football[0] ?? sorted[0] ?? null;

  // Secondary (2 cards hero) : foot en priorité
  const poolAfterFeatured = sorted.filter((a) => a !== featured);
  const footAfter = poolAfterFeatured.filter((a) => a.sport === "football");
  const secondary = footAfter.length >= 2
    ? footAfter.slice(0, 2)
    : [...footAfter, ...poolAfterFeatured.filter((a) => a.sport !== "football")].slice(0, 2);

  // Grid (6 cards) : foot d'abord, puis les autres
  const alreadyUsed = new Set([featured, ...secondary].filter(Boolean).map((a) => a.slug));
  const footGrid  = football.filter((a) => !alreadyUsed.has(a.slug));
  const otherGrid = nonFootball.filter((a) => !alreadyUsed.has(a.slug));
  const grid      = [...footGrid, ...otherGrid].slice(0, 9);

  // Sidebar : derniers articles quelle que soit la catégorie
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
