import fs from "fs";
import path from "path";
import Link from "next/link";

function getArticles() {
  const filePath = path.join(process.cwd(), "content/articles/seo-articles.json");
  const file = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(file);
}

export default function LeaguePage({ params }) {
  const articles = getArticles();

  const filtered = articles.filter(
    (a) =>
      a.source?.toLowerCase().includes(params.slug.replace("-", " ")) ||
      a.keywords?.join(" ").toLowerCase().includes(params.slug.replace("-", " "))
  );

  return (
    <main style={{ padding: "30px", direction: "rtl" }}>
      <h1>🔥 {params.slug.replace("-", " ")}</h1>

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
