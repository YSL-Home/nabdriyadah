export const dynamic = "force-dynamic";

import fs from "fs";
import path from "path";
import Link from "next/link";

function getArticles() {
  try {
    const filePath = path.join(process.cwd(), "content/articles/seo-articles.json");
    const file = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(file);
  } catch (e) {
    return [];
  }
}

export default function Page() {
  const articles = getArticles();

  return (
    <main style={{ padding: 40, direction: "rtl", fontFamily: "system-ui" }}>
      <h1>🔥 الصفحة الديناميكية الجديدة</h1>

      <div style={{ marginBottom: 20 }}>
        عدد المقالات: {articles.length}
      </div>

      {articles.map((a, i) => (
        <div key={i} style={{ marginBottom: 20 }}>
          <h2>{a.title}</h2>
          <p>{a.description}</p>
        </div>
      ))}
    </main>
  );
}
