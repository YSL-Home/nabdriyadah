import articles from "../../content/articles/seo-articles.json";
import ArticleFiltersClient from "../components/ArticleFiltersClient";
import AdSlot from "../components/AdSlot";

export const metadata = {
  title: "جميع المقالات الرياضية | نبض الرياضة",
  description: "تصفح جميع أخبار ومقالات كرة القدم، السلة، التنس والرياضات العالمية والعربية.",
  alternates: { canonical: "https://nabdriyadah.com/articles/" },
  openGraph: {
    title: "المقالات الرياضية | نبض الرياضة",
    description: "أخبار ومقالات رياضية محدّثة باستمرار.",
    url: "https://nabdriyadah.com/articles/",
    siteName: "نبض الرياضة",
    locale: "ar_AR",
    type: "website",
  },
};

export default function ArticlesPage() {
  const sorted = [...articles].sort(
    (a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0)
  );

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px", direction: "rtl" }}>
      <h1 style={{ fontSize: "clamp(22px,4vw,32px)", fontWeight: 800, marginBottom: 24 }}>
        جميع المقالات الرياضية
      </h1>
      <AdSlot slot="articles-top" />
      <ArticleFiltersClient articles={sorted} lang="ar" />
    </main>
  );
}
