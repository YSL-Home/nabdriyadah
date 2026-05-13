/**
 * generate-cartoon-concept.mjs
 * Uses Gemini Flash to generate a satirical motion design concept from an article.
 * Returns a structured scene description ready for Leonardo.ai image generation.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const SYSTEM_PROMPT = `أنت مخرج فني متخصص في إنشاء محتوى كاريكاتوري ساخر عن كرة القدم، على غرار قناة "Sports Series".

مهمتك: بناءً على خبر رياضي، أنشئ مفهوماً بصرياً ساخراً جاهزاً لتوليد صورة كاريكاتورية متحركة.

القواعد:
- استخدم استعارات بصرية قوية (مثل: الدفاع المتسرب = أنابيب مكسورة، المدرب المحتار = شخص ضائع في متاهة)
- الشخصيات يجب أن تكون كاريكاتورية مضخمة السمات
- الأسلوب البصري: flat design نصف مفصل، ألوان زاهية، خلفية بسيطة
- لا حوار، التعبير يكون بصرياً بالكامل
- الأولوية للإيجاز والتأثير البصري القوي

أجب دائماً بتنسيق JSON فقط، بدون أي نص إضافي.`;

/**
 * @param {Object} article - Article object from seo-articles.json
 * @returns {Object} concept - { scene, characters, metaphor, prompt_en, style }
 */
export async function generateCartoonConcept(article) {
  const userMessage = `خبر: ${article.title}
${article.description ? `تفاصيل: ${article.description}` : ""}

أنشئ مفهوماً بصرياً كاريكاتورياً لهذا الخبر بتنسيق JSON:
{
  "scene": "وصف المشهد بالعربية (جملة واحدة مفصلة)",
  "metaphor": "الاستعارة البصرية المستخدمة (مثل: الدفاع = أنابيب مكسورة)",
  "characters": [
    {
      "name": "اسم الشخصية (لاعب/مدرب)",
      "role": "دوره في المشهد",
      "expression": "تعبير الوجه (غاضب/حزين/مفاجأ/...)",
      "action": "ما يفعله في المشهد"
    }
  ],
  "prompt_en": "Detailed English prompt for image generation: cartoon caricature style, flat design, bold colors, [describe the full scene with characters and metaphor], Sports Series style, no text, 9:16 portrait",
  "background_color": "hex color code for background (e.g. #7BB8D4)",
  "sport": "${article.sport || "football"}",
  "teams": ${JSON.stringify(article.teams || [])}
}`;

  const result = await model.generateContent([
    { text: SYSTEM_PROMPT },
    { text: userMessage },
  ]);

  const raw = result.response.text().trim();

  // Strip markdown code blocks if present
  const jsonStr = raw.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();

  const concept = JSON.parse(jsonStr);
  concept.article_slug = article.slug;
  concept.article_title = article.title;
  concept.generated_at = new Date().toISOString();

  return concept;
}

// CLI usage: node generate-cartoon-concept.mjs '{"slug":"test","title":"ريال مدريد يخسر 3-0 أمام برشلونة"}'
if (process.argv[2]) {
  const article = JSON.parse(process.argv[2]);
  generateCartoonConcept(article)
    .then((c) => console.log(JSON.stringify(c, null, 2)))
    .catch(console.error);
}
