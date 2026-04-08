import fs from "fs";
import path from "path";

export default function Home() {
  const filePath = path.join(process.cwd(), "content/articles.json");
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  return (
    <main style={{ padding: "20px", direction: "rtl" }}>
      <h1 style={{ textAlign: "center" }}>نبض الرياضة</h1>

      {data.map((article, index) => (
        <div
          key={index}
          style={{
            background: "#f3f3f3",
            padding: "20px",
            margin: "20px 0",
            borderRadius: "10px",
          }}
        >
          <h2>{article.title}</h2>
          <p>{article.description}</p>
        </div>
      ))}
    </main>
  );
}
