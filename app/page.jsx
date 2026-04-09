import fs from "fs";
import path from "path";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function Home() {
  let articles = [];

  try {
    const filePath = path.join(process.cwd(), "content/articles/seo-articles.json");
    const fileData = fs.readFileSync(filePath, "utf-8");
    articles = JSON.parse(fileData);
  } catch (error) {
    console.log("No articles found");
  }

  return (
    <main style={{ padding: "20px", fontFamily: "Arial" }}>
      
      {/* HEADER */}
      <div
        style={{
          background: "linear-gradient(90deg,#3b82f6,#7c3aed)",
          padding: "40px",
          borderRadius: "20px",
          textAlign: "center",
          color: "white",
          marginBottom: "40px"
        }}
      >
        <h1 style={{ fontSize: "40px", margin: 0 }}>نبض الرياضة</h1>
        <p style={{ marginTop: "10px" }}>
          أخبار - مباشر - فيديو - تحليلات
        </p>
      </div>

      {/* TITLE */}
      <h2 style={{ textAlign: "right", marginBottom: "20px" }}>
        🔥 أحدث المقالات
      </h2>

      {/* ARTICLES */}
      {articles.length === 0 ? (
        <p style={{ textAlign: "center" }}>لا توجد مقالات حالياً</p>
      ) : (
        articles.map((article, index) => (
          <Link key={index} href={`/articles/${article.slug}`} style={{ textDecoration: "none" }}>
            <div
              style={{
                background: "#f3f4f6",
                padding: "25px",
                borderRadius: "15px",
                marginBottom: "20px",
                direction: "rtl"
              }}
            >
              <h3 style={{ marginBottom: "10px", color: "#111" }}>
                {article.title}
              </h3>

              <p style={{ color: "#555" }}>
                {article.description}
              </p>

              <div style={{ fontSize: "12px", color: "#888", marginTop: "10px" }}>
                أخبار رياضية • كرة القدم
              </div>
            </div>
          </Link>
        ))
      )}
    </main>
  );
}
