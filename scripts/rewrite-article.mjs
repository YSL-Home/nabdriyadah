import fs from "fs";
import path from "path";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const INPUT_PATH = path.join(process.cwd(), "content/raw-news.json");
const OUTPUT_PATH = path.join(process.cwd(), "content/articles/seo-articles.json");

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function normalizeText(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

function removeMarkdownFences(text = "") {
  return String(text).replace(/```json/gi, "").replace(/```/g, "").trim();
}

function extractJson(text = "") {
  const cleaned = removeMarkdownFences(text);
  try {
    return JSON.parse(cleaned);
  } catch {}
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

function containsLatin(text = "") {
  return /[A-Za-z]/.test(String(text));
}

function sanitizeArabic(text = "") {
  let value = String(text || "");
  value = removeMarkdownFences(value).replace(/\r/g, "");

  const lines = value.split("\n");
  const kept = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const latinCount = (trimmed.match(/[A-Za-z]/g) || []).length;
    const arabicCount = (trimmed.match(/[\u0600-\u06FF]/g) || []).length;
    if (latinCount > 0 && arabicCount === 0) continue;
    if (latinCount > arabicCount && latinCount > 4) continue;
    kept.push(trimmed);
  }

  return kept.join("\n\n").replace(/\n{3,}/g, "\n\n").replace(/[ ]{2,}/g, " ").trim();
}

function sanitizeKeywords(keywords) {
  if (!Array.isArray(keywords)) return [];
  return keywords.map((k) => sanitizeArabic(k)).map((k) => normalizeText(k)).filter(Boolean).slice(0, 8);
}

function sportLabel(sport = "football") {
  const labels = {
    football: "كرة القدم",
    basketball: "كرة السلة",
    tennis: "التنس",
    padel: "البادل",
    futsal: "كرة قدم الصالات",
    "premier-league": "الدوري الإنجليزي الممتاز",
    "la-liga": "الدوري الإسباني",
    mixed: "كرة القدم"
  };
  return labels[sport] || "الرياضة";
}

function sportSystemPrompt(sport = "football") {
  const prompts = {
    football:
      "أنت محرر في موقع رياضي عربي متخصص في كرة القدم. اكتب بأسلوب صحفي مباشر، دقيق، ومشوق. استخدم أسماء الأندية واللاعبين بالعربية.",
    basketball:
      "أنت محرر في موقع رياضي عربي متخصص في كرة السلة والـ NBA. اكتب بأسلوب صحفي مباشر، متحمس، ودقيق. اذكر الفرق واللاعبين بالعربية.",
    tennis:
      "أنت محرر في موقع رياضي عربي متخصص في التنس. اكتب بأسلوب صحفي دقيق وشيق. اذكر البطولات واللاعبين بالعربية.",
    padel:
      "أنت محرر في موقع رياضي عربي متخصص في رياضة البادل. اكتب بأسلوب صحفي حديث ومشوق. قدم البادل بطريقة جذابة للقارئ العربي.",
    futsal:
      "أنت محرر في موقع رياضي عربي متخصص في كرة قدم الصالات. اكتب بأسلوب صحفي مباشر ومتحمس.",
    mixed:
      "أنت محرر في موقع رياضي عربي. اكتب بأسلوب صحفي مباشر ومقروء، دون مقدمات عامة مكررة."
  };
  return prompts[sport] || prompts.mixed;
}

function sourceArabic(source = "") {
  if (source.includes("BBC")) return "بي بي سي سبورت";
  if (source.includes("Btolat")) return "بطولات";
  if (source.includes("Kooora")) return "كووورة";
  if (source.includes("Hesport")) return "هسبورت";
  if (source.includes("Al Jazeera")) return "الجزيرة رياضة";
  if (source.includes("Al Araby")) return "العربي الجديد رياضة";
  if (source.includes("Elsport")) return "إلسبورت";
  if (source.includes("Google News Basketball")) return "جوجل نيوز - كرة السلة";
  if (source.includes("Google News Tennis")) return "جوجل نيوز - التنس";
  if (source.includes("Google News Padel")) return "جوجل نيوز - البادل";
  if (source.includes("Google News Futsal")) return "جوجل نيوز - الصالات";
  if (source.includes("Google News")) return "جوجل نيوز";
  return "المصدر الرياضي";
}

function buildSlug(item, index) {
  const sport = item.sport || "football";
  const league = item.league || "mixed";

  if (sport === "basketball") return `basketball-${index + 1}`;
  if (sport === "tennis") return `tennis-${index + 1}`;
  if (sport === "padel") return `padel-${index + 1}`;
  if (sport === "futsal") return `futsal-${index + 1}`;
  if (league === "premier-league") return `premier-league-${index + 1}`;
  if (league === "la-liga") return `la-liga-${index + 1}`;
  return `football-${index + 1}`;
}

function buildImage(index) {
  const images = [
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1508098682722-e99c643e7485?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1534158914592-062992fbe900?auto=format&fit=crop&w=1200&q=80"
  ];
  return images[index % images.length];
}

function fallbackArticle(item, index) {
  const sport = item.sport || "football";
  const label = sportLabel(item.league || sport);
  const source = sourceArabic(item.source);
  const originalTitle = normalizeText(item.originalTitle || `خبر رياضي ${index + 1}`);
  const topic = originalTitle.length > 80 ? originalTitle.slice(0, 80) : originalTitle;

  const titles = [
    `${topic}`,
    `تطورات مهمة: ${topic}`,
    `آخر أخبار ${label}: ${topic}`,
    `متابعة خاصة — ${topic}`,
    `${label}: ${topic}`,
    `تفاصيل جديدة — ${topic}`,
    `مستجدات ${label}: ${topic}`,
    `تقرير خاص: ${topic}`
  ];

  const title = titles[index % titles.length];
  const description = `نستعرض في هذا التقرير أبرز التفاصيل المرتبطة بـ ${topic} في ${label} وفق المعطيات المتاحة.`;

  const content = [
    `تشهد ${label} حركة ملفتة هذه الأيام، وكان من أبرز ما يتداول خبر يخص: ${topic}.`,
    `وبحسب المعطيات المتوفرة، فإن هذا الخبر يرتبط مباشرة بالمشهد الراهن في ${label}.`,
    `ويأتي هذا التطور في سياق المنافسة الحالية والملفات الكبيرة التي تشغل المتابعين في هذا القطاع الرياضي.`,
    `وتحاول وسائل الإعلام الرياضية تقديم صورة أوضح عن خلفية هذا الملف وتداعياته المحتملة على المرحلة المقبلة.`,
    `كما يرى المتخصصون أن هذه التطورات تعكس حجم الاهتمام المتنامي بـ ${label} في الوسط الرياضي العربي.`,
    `في نبض الرياضة، نواصل متابعة هذا الملف ونقل أبرز المستجدات المرتبطة به فور ورودها.`
  ].join("\n\n");

  return {
    title,
    description,
    seoTitle: `${title} | نبض الرياضة`,
    seoDescription: description,
    content,
    keywords: [label, "أخبار رياضية", sportLabel(sport), "نتائج", "متابعة"]
  };
}

async function callOpenAI(prompt, temperature = 0.3, systemPrompt = null) {
  if (!OPENAI_API_KEY) return null;

  try {
    const messages = [
      {
        role: "system",
        content: systemPrompt || "أنت محرر في موقع رياضي عربي. اكتب بالعربية فقط، بأسلوب صحفي مباشر ومقروء."
      },
      { role: "user", content: prompt }
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ model: "gpt-4o-mini", temperature, messages })
    });

    const data = await response.json();
    if (!response.ok) {
      console.log("OpenAI error:", JSON.stringify(data?.error || data));
      return null;
    }
    return data?.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.log("OpenAI request failed:", error.message);
    return null;
  }
}

async function arabizeIfNeeded(text, label = "النص") {
  const cleaned = sanitizeArabic(text);
  if (!containsLatin(cleaned)) return cleaned;

  const raw = await callOpenAI(
    `حوّل هذا ${label} إلى العربية فقط. اكتب الأسماء الأجنبية بحروف عربية. أعد النص فقط بدون شرح.\n\nالنص:\n${cleaned}`,
    0.1
  );

  if (!raw) return sanitizeArabic(cleaned.replace(/[A-Za-z0-9][^.\n]*[.\n]?/g, ""));
  return sanitizeArabic(raw);
}

async function rewriteArticle(item, index) {
  const fallback = fallbackArticle(item, index);

  const originalTitle = normalizeText(item.originalTitle || item.title || "");
  const originalDescription = normalizeText(item.originalDescription || item.description || "");
  const sport = item.sport || "football";
  const label = sportLabel(item.league || sport);
  const source = sourceArabic(item.source);

  if (!OPENAI_API_KEY) {
    return fallback;
  }

  const systemPrompt = sportSystemPrompt(sport);

  const prompt = `
أعد صياغة هذا الخبر الرياضي إلى مادة صحفية عربية كاملة.

المعلومات المتاحة:
- الرياضة / البطولة: ${label}
- المصدر: ${source}
- العنوان الأصلي: ${originalTitle}
- الوصف الأصلي: ${originalDescription}
- الوسوم الموضوعية: ${(item.topicTags || []).join("، ")}

قواعد إلزامية:
1. العنوان: يجب أن يذكر اسم الفريق أو اللاعب أو الحدث المحدد — لا عناوين عامة مثل "تفاصيل جديدة" أو "آخر المستجدات" وحدها
2. العنوان: بين 40 و 80 حرفاً، خبري مباشر، يثير الفضول
3. الوصف: جملة أو جملتان تلخص الخبر بشكل مشوق، 100-160 حرف
4. المحتوى: 5 فقرات صحفية واضحة، تبدأ بالخبر الأبرز ثم السياق والتحليل
5. الكلمات المفتاحية: 5 إلى 8 كلمات بالعربية متعلقة بالخبر
6. لا تستخدم أي جملة إنجليزية في المخرجات
7. الأسماء الأجنبية تُكتب بالحروف العربية

أعد JSON فقط بهذا الشكل:
{
  "title": "عنوان خبري يذكر الفريق أو اللاعب أو الحدث",
  "description": "وصف مختصر ومشوق",
  "seoTitle": "عنوان سيو يتضمن الكيان الرياضي",
  "seoDescription": "وصف سيو بين 100 و 160 حرف",
  "content": "فقرة 1\n\nفقرة 2\n\nفقرة 3\n\nفقرة 4\n\nفقرة 5",
  "keywords": ["كلمة1", "كلمة2", "كلمة3", "كلمة4", "كلمة5"]
}
`.trim();

  const raw = await callOpenAI(prompt, 0.35, systemPrompt);

  if (!raw) return fallback;

  const parsed = extractJson(raw);
  if (!parsed) {
    console.log(`JSON parse failed for article ${index + 1}, using fallback.`);
    return fallback;
  }

  let title = sanitizeArabic(parsed.title || fallback.title);
  let description = sanitizeArabic(parsed.description || fallback.description);
  let seoTitle = sanitizeArabic(parsed.seoTitle || `${title} | نبض الرياضة`);
  let seoDescription = sanitizeArabic(parsed.seoDescription || description);
  let content = sanitizeArabic(parsed.content || fallback.content);
  let keywords = sanitizeKeywords(parsed.keywords);

  title = await arabizeIfNeeded(title, "العنوان");
  description = await arabizeIfNeeded(description, "الوصف");
  seoTitle = await arabizeIfNeeded(seoTitle, "عنوان السيو");
  seoDescription = await arabizeIfNeeded(seoDescription, "وصف السيو");
  content = await arabizeIfNeeded(content, "المحتوى");

  if (!title || !description || !content) return fallback;

  if (!keywords.length) {
    keywords = item.topicTags?.length
      ? [...item.topicTags.slice(0, 4), label]
      : fallback.keywords;
  }

  return { title, description, seoTitle, seoDescription, content, keywords };
}

async function main() {
  let rawItems = [];

  try {
    rawItems = JSON.parse(fs.readFileSync(INPUT_PATH, "utf-8"));
  } catch (error) {
    console.error("Unable to read raw-news.json:", error.message);
    process.exit(1);
  }

  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    console.log("No raw news found.");
    process.exit(0);
  }

  // Dedup
  const unique = [];
  const seen = new Set();
  for (const item of rawItems) {
    const title = normalizeText(item.originalTitle || item.title || "");
    if (!title) continue;
    const key = title.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(item);
  }

  // Spread across sports: max 16 articles, 2 per non-football sport, rest football
  const footballItems = unique.filter((i) => !i.sport || i.sport === "football").slice(0, 10);
  const basketItems = unique.filter((i) => i.sport === "basketball").slice(0, 2);
  const tennisItems = unique.filter((i) => i.sport === "tennis").slice(0, 2);
  const padelItems = unique.filter((i) => i.sport === "padel").slice(0, 1);
  const futsalItems = unique.filter((i) => i.sport === "futsal").slice(0, 1);

  const selected = [...footballItems, ...basketItems, ...tennisItems, ...padelItems, ...futsalItems];

  const articles = [];

  for (let i = 0; i < selected.length; i++) {
    const item = selected[i];
    const label = item.originalTitle || `خبر ${i + 1}`;
    console.log(`Rewriting [${i + 1}/${selected.length}] (${item.sport || "football"}): ${label.slice(0, 60)}`);

    const rewritten = await rewriteArticle(item, i);

    articles.push({
      slug: buildSlug(item, i),
      sport: item.sport || "football",
      league: item.league || "mixed",
      source: item.source || "",
      topicTags: item.topicTags || ["الرياضة"],
      title: rewritten.title,
      description: rewritten.description,
      seoTitle: rewritten.seoTitle,
      seoDescription: rewritten.seoDescription,
      content: rewritten.content,
      keywords: rewritten.keywords,
      image: buildImage(i)
    });
  }

  ensureDir(OUTPUT_PATH);
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(articles, null, 2), "utf-8");
  console.log("SEO articles saved:", articles.length);
}

main();
