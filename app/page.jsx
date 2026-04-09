import fs from "fs";
import path from "path";
import Link from "next/link";

export default function Home() {
  const filePath = path.join(process.cwd(), "content/articles/seo-articles.json");

  let articles = [];

  try {
    const file = fs.readFileSync(filePath, "utf-8");
    articles = JSON.parse(file);
  } catch (e) {
    console.error("Erreur lecture JSON:", e);
  }

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-10 rounded-3xl text-center mb-10">
        <h1 className="text-4xl font-bold">نبض الرياضة</h1>
        <p className="mt-2">أخبار - مباشر - فيديو - تحليلات</p>
      </div>

      <h2 className="text-2xl font-bold mb-6">🔥 أحدث المقالات</h2>

      {articles.length === 0 ? (
        <p className="text-gray-500 text-center">
          لا توجد مقالات حالياً...
        </p>
      ) : (
        articles.map((article, index) => (
          <Link key={index} href={`/articles/${article.slug}`}>
            <div className="bg-gray-100 p-6 rounded-2xl mb-4 cursor-pointer hover:bg-gray-200 transition">
              <h3 className="font-bold text-xl mb-2">
                {article.title}
              </h3>
              <p className="text-gray-600">
                {article.description}
              </p>
            </div>
          </Link>
        ))
      )}
    </main>
  );
}
