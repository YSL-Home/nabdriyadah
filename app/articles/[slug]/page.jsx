import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
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

function stripHtml(html: string = "") {
  return html.replace(/<[^>]*>/g, "");
}

function getArticleBySlug(slug: string) {
  return allArticles.find((article) => article.slug === slug);
}

export async function generateStaticParams() {
  return allArticles.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return {
      title: "المقال غير موجود",
    };
  }

  return {
    title: article.title,
    description: article.description,
    keywords: article.keywords || [
      "أخبار الرياضة",
      "كرة القدم",
      "نبض الرياضة",
    ],
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      locale: "ar_AR",
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const relatedArticles = allArticles
    .filter((item) => item.slug !== article.slug)
    .slice(0, 4);

  return (
    <main dir="rtl" className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto max-w-4xl px-4 py-8 md:px-6 lg:px-8">
        <article className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8">
          <div className="mb-4 text-sm font-bold text-red-600">أخبار الرياضة</div>

          <h1 className="mb-4 text-3xl font-extrabold leading-tight md:text-5xl">
            {article.title}
          </h1>

          <p className="mb-8 text-lg leading-8 text-gray-600">
            {article.description}
          </p>

          <div className="prose prose-lg max-w-none leading-8 prose-headings:text-gray-900 prose-p:text-gray-800">
            {stripHtml(article.content)
              .split("\n")
              .filter(Boolean)
              .map((paragraph, index) => (
                <p key={index} className="mb-5 text-base leading-8 text-gray-800">
                  {paragraph}
                </p>
              ))}
          </div>
        </article>

        <section className="mt-10 rounded-2xl border border-gray-200 bg-gray-50 p-6">
          <h2 className="mb-5 text-2xl font-extrabold">اقرأ أيضاً</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {relatedArticles.map((related) => (
              <Link
                key={related.slug}
                href={`/articles/${related.slug}`}
                className="rounded-xl border border-gray-200 bg-white p-4 transition hover:shadow"
              >
                <h3 className="text-base font-bold leading-7">{related.title}</h3>
                <p className="mt-2 text-sm leading-7 text-gray-600">
                  {related.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
