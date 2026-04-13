import Link from "next/link";
import articles from "@/data/seo-articles.json";

type Article = {
  slug: string;
  title: string;
  description: string;
  content: string;
  keywords?: string[];
  category?: string;
  image?: string;
  publishedAt?: string;
};

function containsArabic(text: string = "") {
  return /[\u0600-\u06FF]/.test(text);
}

function isMostlyArabic(text: string = "") {
  if (!text) return false;

  const cleaned = text.replace(/\s/g, "");
  if (!cleaned.length) return false;

  const arabicCount = (cleaned.match(/[\u0600-\u06FF]/g) || []).length;
  return arabicCount / cleaned.length >= 0.45;
}

function removeEnglishLetters(text: string = "") {
  return text.replace(/[A-Za-z]/g, "").replace(/\s+/g, " ").trim();
}

function cleanArabicText(text: string = "") {
  return removeEnglishLetters(text)
    .replace(/Read more/gi, "")
    .replace(/Breaking/gi, "")
    .replace(/Trending/gi, "")
    .replace(/Latest/gi, "")
    .replace(/Analysis/gi, "")
    .trim();
}

function isValidArabicArticle(article: Partial<Article>) {
  if (!article) return false;

  const title = article.title || "";
  const description = article.description || "";
  const content = article.content || "";

  if (!containsArabic(title)) return false;
  if (!containsArabic(description)) return false;
  if (!containsArabic(content)) return false;

  if (!isMostlyArabic(title)) return false;
  if (!isMostlyArabic(description)) return false;
  if (!isMostlyArabic(content)) return false;

  return true;
}

const allArticles = (articles as Article[])
  .map((article) => ({
    ...article,
    title: cleanArabicText(article.title),
    description: cleanArabicText(article.description),
    content: cleanArabicText(article.content),
  }))
  .filter(isValidArabicArticle);

function truncate(text: string = "", length: number) {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + "...";
}

function stripHtml(html: string = "") {
  return html.replace(/<[^>]*>/g, "").trim();
}

function getLatestArticles(items: Article[], count: number) {
  return [...items].slice(0, count);
}

function getMostReadArticles(items: Article[], count: number) {
  return [...items]
    .sort((a, b) => {
      const scoreA =
        (a.title?.length || 0) +
        (a.description?.length || 0) +
        (a.content?.length || 0);
      const scoreB =
        (b.title?.length || 0) +
        (b.description?.length || 0) +
        (b.content?.length || 0);
      return scoreB - scoreA;
    })
    .slice(0, count);
}

function getTrendingArticles(items: Article[], count: number) {
  return [...items].slice(0, count);
}

function getAnalysisArticles(items: Article[], count: number) {
  return [...items]
    .filter((item) => (item.content?.length || 0) > 1200)
    .slice(0, count);
}

const categories = [
  { slug: "football", name: "كرة القدم" },
  { slug: "world-football", name: "الكرة العالمية" },
  { slug: "arab-football", name: "الكرة العربية" },
  { slug: "transfers", name: "سوق الانتقالات" },
];

export default function HomePage() {
  const latestArticles = getLatestArticles(allArticles, 7);
  const featuredArticle = latestArticles[0];
  const latestGrid = latestArticles.slice(1, 7);
  const mostReadArticles = getMostReadArticles(allArticles, 4);
  const trendingArticles = getTrendingArticles(allArticles, 4);
  const analysisArticles = getAnalysisArticles(allArticles, 3);

  return (
    <main dir="rtl" className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        <section className="mb-8">
          <h1 className="mb-3 text-3xl font-extrabold leading-tight md:text-5xl">
            نبض الرياضة
          </h1>
          <p className="max-w-3xl text-base leading-8 text-gray-600 md:text-lg">
            تغطية عربية شاملة لآخر أخبار كرة القدم، نتائج المباريات، أخبار الانتقالات،
            والتحليلات الرياضية المحدثة باستمرار.
          </p>
        </section>

        {featuredArticle && (
          <section className="mb-12 grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Link href={`/articles/${featuredArticle.slug}`} className="block h-full">
                <article className="h-full rounded-2xl border border-gray-200 bg-gray-50 p-6 transition hover:shadow-lg">
                  <div className="mb-4 inline-flex rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
                    الخبر الأبرز
                  </div>

                  <h2 className="mb-4 text-2xl font-extrabold leading-tight md:text-4xl">
                    {featuredArticle.title}
                  </h2>

                  <p className="mb-5 text-base leading-8 text-gray-700 md:text-lg">
                    {truncate(
                      featuredArticle.description ||
                        stripHtml(featuredArticle.content),
                      220
                    )}
                  </p>

                  <span className="inline-flex text-sm font-bold text-red-600">
                    اقرأ التفاصيل
                  </span>
                </article>
              </Link>
            </div>

            <div className="space-y-4">
              {latestGrid.slice(0, 3).map((article) => (
                <Link
                  key={article.slug}
                  href={`/articles/${article.slug}`}
                  className="block"
                >
                  <article className="rounded-2xl border border-gray-200 p-4 transition hover:shadow-md">
                    <div className="mb-2 text-xs font-bold text-gray-500">
                      آخر الأخبار
                    </div>
                    <h3 className="mb-2 text-lg font-bold leading-7">
                      {article.title}
                    </h3>
                    <p className="text-sm leading-7 text-gray-600">
                      {truncate(
                        article.description || stripHtml(article.content),
                        100
                      )}
                    </p>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mb-12">
          <h2 className="mb-5 text-2xl font-extrabold">آخر الأخبار</h2>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {latestGrid.map((article) => (
              <Link
                key={article.slug}
                href={`/articles/${article.slug}`}
                className="block"
              >
                <article className="h-full rounded-2xl border border-gray-200 p-5 transition hover:-translate-y-1 hover:shadow-lg">
                  <h3 className="mb-3 text-lg font-bold leading-7">
                    {article.title}
                  </h3>
                  <p className="text-sm leading-7 text-gray-600">
                    {truncate(
                      article.description || stripHtml(article.content),
                      120
                    )}
                  </p>
                </article>
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-12 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 p-6">
            <h2 className="mb-5 text-2xl font-extrabold">الأكثر قراءة</h2>
            <div className="space-y-4">
              {mostReadArticles.map((article, index) => (
                <Link
                  key={article.slug}
                  href={`/articles/${article.slug}`}
                  className="block"
                >
                  <article className="flex items-start gap-4 rounded-xl border-b border-gray-100 pb-4 transition hover:bg-gray-50">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-sm font-bold text-white">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="mb-1 text-base font-bold leading-7">
                        {article.title}
                      </h3>
                      <p className="text-sm leading-7 text-gray-600">
                        {truncate(
                          article.description || stripHtml(article.content),
                          90
                        )}
                      </p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 p-6">
            <h2 className="mb-5 text-2xl font-extrabold">ترند اليوم</h2>
            <div className="space-y-4">
              {trendingArticles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/articles/${article.slug}`}
                  className="block"
                >
                  <article className="rounded-xl border border-gray-100 p-4 transition hover:bg-gray-50">
                    <h3 className="mb-2 text-base font-bold leading-7">
                      {article.title}
                    </h3>
                    <p className="text-sm leading-7 text-gray-600">
                      {truncate(
                        article.description || stripHtml(article.content),
                        100
                      )}
                    </p>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="mb-5 text-2xl font-extrabold">تحليلات رياضية</h2>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {(analysisArticles.length > 0 ? analysisArticles : latestArticles.slice(0, 3)).map(
              (article) => (
                <Link
                  key={article.slug}
                  href={`/articles/${article.slug}`}
                  className="block"
                >
                  <article className="h-full rounded-2xl border border-amber-200 bg-amber-50 p-5 transition hover:shadow-lg">
                    <div className="mb-3 inline-flex rounded-full bg-amber-200 px-3 py-1 text-xs font-bold text-amber-900">
                      تحليل
                    </div>
                    <h3 className="mb-3 text-lg font-bold leading-7">
                      {article.title}
                    </h3>
                    <p className="text-sm leading-7 text-gray-700">
                      {truncate(
                        article.description || stripHtml(article.content),
                        130
                      )}
                    </p>
                  </article>
                </Link>
              )
            )}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="mb-5 text-2xl font-extrabold">البطولات والأقسام</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/league/${category.slug}`}
                className="block"
              >
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 text-center font-bold transition hover:bg-black hover:text-white">
                  {category.name}
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
          <h2 className="mb-4 text-2xl font-extrabold">روابط مهمة</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {allArticles.slice(0, 8).map((article) => (
              <Link
                key={article.slug}
                href={`/articles/${article.slug}`}
                className="rounded-xl border border-gray-200 bg-white p-4 text-sm font-medium transition hover:shadow"
              >
                {article.title}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
