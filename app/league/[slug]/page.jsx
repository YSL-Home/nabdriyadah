import fs from "fs";
import path from "path";
import Link from "next/link";

function getArticles() {
  const filePath = path.join(process.cwd(), "content/articles/seo-articles.json");
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export async function generateMetadata({ params }) {
  const name = params.slug.replace("-", " ");

  return {
    title: `${name} | أخبار وتحليلات`,
    description: `تابع آخر أخبار ${name} وتحليلات المباريات والتحديثات.`,
  };
}

export default function LeaguePage({ params }) {
  const articles = getArticles();

  const leagueName = params.slug.replace("-", " ");

  const filtered = articles.filter(
    (a) =>
      a.source?.toLowerCase().includes(leagueName) ||
      a.keywords?.join(" ").toLowerCase().includes(leagueName)
  );

  return (
    <main style={{ padding: "30px", direction: "rtl" }}>
      <h1>🔥 {leagueName}</h1>

      {filtered.length === 0 ? (
        <p>لا توجد مقالات حالياً</p>
      ) : (
        filtered.map((article) => (
          <div key={article.slug} style={{ marginBottom: "20px" }}>
            <h3>
              <Link href={`/articles/${article.slug}`}>
                {article.title}
              </Link>
            </h3>
            <p>{article.description}</p>
          </div>
        ))
      )}
    </main>
  );
}
