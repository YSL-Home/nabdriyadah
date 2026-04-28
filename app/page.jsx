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

  const breaking = sorted.filter((a) => {
    if (!a.publishedAt) return false;
    return Date.now() - new Date(a.publishedAt).getTime() < 6 * 60 * 60 * 1000;
  }).slice(0, 8);

  const featured  = sorted[0]           ?? null;
  const secondary = sorted.slice(1, 3);
  const grid      = sorted.slice(3, 9);
  const sidebar   = sorted.slice(9, 15);
  const basketball = sorted.filter((a) => a.sport === "basketball").slice(0, 4);
  const tennis     = sorted.filter((a) => a.sport === "tennis").slice(0, 4);
  const padel      = sorted.filter((a) => a.sport === "padel").slice(0, 4);

  return (
    <div style={{ background: "#0d1117", minHeight: "100vh", direction: "rtl" }}>

      {/* Breaking ticker */}
      {breaking.length > 0 && <BreakingTicker items={breaking} />}

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
        />
      </div>
    </div>
  );
}
