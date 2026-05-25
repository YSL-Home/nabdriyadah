/**
 * upgrade-short-articles.mjs
 * Réécrit les articles existants trop courts (<400 mots arabes) pour
 * satisfaire les critères AdSense "contenu à valeur informative".
 *
 * Objectif : 600-800 mots arabes, 7 paragraphes structurés, 3 FAQs.
 * Traite 15 articles par run (Gemini free tier : 15 RPM, 1500 RPD).
 * Priorité : articles récents (<7 jours) d'abord.
 *
 * Usage  : node scripts/upgrade-short-articles.mjs
 * Env    : GOOGLE_API_KEY (primaire), GROQ_API_KEY (fallback 1),
 *          ANTHROPIC_API_KEY (fallback 2), OPENAI_API_KEY (fallback 3)
 */
import fs from "fs";
import path from "path";

const ARTICLES_PATH = path.join(process.cwd(), "content/articles/seo-articles.json");

// ── Clés API ──────────────────────────────────────────────────────────────
const GOOGLE_API_KEY    = process.env.GOOGLE_API_KEY    || "";
const GOOGLE_API_KEY_2  = process.env.GOOGLE_API_KEY_2  || "";
const GOOGLE_API_KEY_3  = process.env.GOOGLE_API_KEY_3  || "";
const GOOGLE_API_KEY_4  = process.env.GOOGLE_API_KEY_4  || "";
const GOOGLE_API_KEY_5  = process.env.GOOGLE_API_KEY_5  || "";
const GOOGLE_API_KEY_6  = process.env.GOOGLE_API_KEY_6  || "";
const GROQ_API_KEY      = process.env.GROQ_API_KEY      || "";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";
const OPENAI_API_KEY    = process.env.OPENAI_API_KEY    || "";

const GEMINI_MODEL    = "gemini-2.0-flash";
const GROQ_MODEL_70B  = "llama-3.3-70b-versatile";  // 6000 TPM
const GROQ_MODEL_8B   = "llama-3.1-8b-instant";      // 131072 TPM — fallback rapide
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5";

// ── Paramètres ────────────────────────────────────────────────────────────
const MAX_PER_RUN       = 60;    // 60/run × 24 runs/jour = 1440/jour → backlog 2446 en ~2 jours
const MIN_AR_WORDS      = 400;   // en dessous = article "court" à upgrader
const DELAY_MS          = 12000; // 12s entre appels — respecte TPM Groq 70B (6000/min ÷ 800tok = 8s mini)
const RECENT_DAYS       = 14;    // priorité aux articles < 14 jours

if (!GOOGLE_API_KEY && !GOOGLE_API_KEY_2 && !GOOGLE_API_KEY_3 && !GOOGLE_API_KEY_4 && !GOOGLE_API_KEY_5 && !GOOGLE_API_KEY_6 && !GROQ_API_KEY && !ANTHROPIC_API_KEY && !OPENAI_API_KEY) {
  console.log("Aucune clé API — upgrade ignoré.");
  process.exit(0);
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function arabicWordCount(text = "") {
  return (text.match(/[؀-ۿ]{2,}/g) || []).length;
}

function isFatal(msg = "") {
  return /credit balance is too low|Your credit balance|balance is too low|insufficient_quota|invalid_api_key|account.*deactivated|billing hard limit|exceeded your current quota|You exceeded.*quota|QUOTA_EXCEEDED|API_KEY_INVALID|PERMISSION_DENIED|reported as leaked|API key.*leaked|API_NOT_ENABLED|SERVICE_DISABLED|does not have permission|requests to this API.*been blocked|KEY_INVALID/i.test(msg);
}

// ── Flags fail-fast ───────────────────────────────────────────────────────
let _geminiDead    = false;
let _gemini2Dead   = false;
let _gemini3Dead   = false;
let _gemini4Dead   = false;
let _gemini5Dead   = false;
let _gemini6Dead   = false;
let _groqDead      = false; // 70B
let _groq8bDead    = false; // 8B
let _anthropicDead = false;
let _openAIDead    = false;

function noApiLeft() {
  return (_geminiDead    || !GOOGLE_API_KEY)    &&
         (_gemini2Dead   || !GOOGLE_API_KEY_2)  &&
         (_gemini3Dead   || !GOOGLE_API_KEY_3)  &&
         (_gemini4Dead   || !GOOGLE_API_KEY_4)  &&
         (_gemini5Dead   || !GOOGLE_API_KEY_5)  &&
         (_gemini6Dead   || !GOOGLE_API_KEY_6)  &&
         (_groqDead      || !GROQ_API_KEY)      &&
         (_groq8bDead    || !GROQ_API_KEY)      &&
         (_anthropicDead || !ANTHROPIC_API_KEY) &&
         (_openAIDead    || !OPENAI_API_KEY);
}

// ── Appels API ────────────────────────────────────────────────────────────
async function _callGeminiKey(apiKey, deadFlag, setDead, prompt) {
  if (!apiKey || deadFlag) return null;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 2048, temperature: 0.35 }
        })
      });
      if (res.ok) { const d = await res.json(); return d?.candidates?.[0]?.content?.parts?.[0]?.text || null; }
      const err = await res.text();
      if (res.status === 429) {
        if (/exceeded your current quota|QUOTA_EXCEEDED|daily.*limit/i.test(err)) { console.log("  ⛔ Gemini quota épuisé."); setDead(); return null; }
        if (attempt < 2) { await sleep(20000); continue; }
      }
      if (isFatal(err)) { setDead(); return null; }
      return null;
    } catch { return null; }
  }
  return null;
}
async function callGemini(prompt)  { return _callGeminiKey(GOOGLE_API_KEY,   _geminiDead,  () => { _geminiDead  = true; }, prompt); }
async function callGemini2(prompt) { return _callGeminiKey(GOOGLE_API_KEY_2, _gemini2Dead, () => { _gemini2Dead = true; }, prompt); }
async function callGemini3(prompt) { return _callGeminiKey(GOOGLE_API_KEY_3, _gemini3Dead, () => { _gemini3Dead = true; }, prompt); }
async function callGemini4(prompt) { return _callGeminiKey(GOOGLE_API_KEY_4, _gemini4Dead, () => { _gemini4Dead = true; }, prompt); }
async function callGemini5(prompt) { return _callGeminiKey(GOOGLE_API_KEY_5, _gemini5Dead, () => { _gemini5Dead = true; }, prompt); }
async function callGemini6(prompt) { return _callGeminiKey(GOOGLE_API_KEY_6, _gemini6Dead, () => { _gemini6Dead = true; }, prompt); }

async function _callGroqModel(model, deadFlag, setDead, prompt) {
  if (!GROQ_API_KEY || deadFlag) return null;
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, temperature: 0.35, max_tokens: 2500, messages: [{ role: "user", content: prompt }] })
    });
    const d = await res.json();
    if (!res.ok) {
      const msg = JSON.stringify(d?.error || d);
      if (/rate_limit_exceeded/i.test(msg)) {
        console.log(`  ↩ Groq ${model} rate limit — attente 30s...`);
        await sleep(30000);
        const r2 = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ model, temperature: 0.35, max_tokens: 2500, messages: [{ role: "user", content: prompt }] })
        });
        const d2 = await r2.json();
        if (r2.ok) return d2?.choices?.[0]?.message?.content || null;
      }
      if (isFatal(msg)) { setDead(); }
      return null;
    }
    return d?.choices?.[0]?.message?.content || null;
  } catch { return null; }
}
async function callGroq(prompt)   { return _callGroqModel(GROQ_MODEL_70B, _groqDead,   () => { _groqDead   = true; }, prompt); }
async function callGroq8b(prompt) { return _callGroqModel(GROQ_MODEL_8B,  _groq8bDead, () => { _groq8bDead = true; }, prompt); }

async function callAnthropic(prompt) {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL, max_tokens: 2500,
        messages: [{ role: "user", content: prompt }]
      })
    });
    const d = await res.json();
    if (!res.ok) {
      if (isFatal(d?.error?.message || "")) { _anthropicDead = true; }
      return null;
    }
    return d?.content?.[0]?.text || null;
  } catch { return null; }
}

async function callOpenAI(prompt) {
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini", max_tokens: 2500, temperature: 0.35,
        messages: [{ role: "user", content: prompt }]
      })
    });
    const d = await res.json();
    if (!res.ok) {
      if (isFatal(d?.error?.message || "")) { _openAIDead = true; }
      return null;
    }
    return d?.choices?.[0]?.message?.content || null;
  } catch { return null; }
}

async function callLLM(prompt) {
  const r1  = await callGemini(prompt);   if (r1)  return r1;
  const r1b = await callGemini2(prompt);  if (r1b) return r1b;
  const r1c = await callGemini3(prompt);  if (r1c) return r1c;
  const r1d = await callGemini4(prompt);  if (r1d) return r1d;
  const r1e = await callGemini5(prompt);  if (r1e) return r1e;
  const r1f = await callGemini6(prompt);  if (r1f) return r1f;
  const r2  = await callGroq(prompt);     if (r2)  return r2;
  const r2b = await callGroq8b(prompt);   if (r2b) return r2b;
  if (ANTHROPIC_API_KEY && !_anthropicDead) {
    const r = await callAnthropic(prompt); if (r) return r;
  }
  if (OPENAI_API_KEY && !_openAIDead) {
    const r = await callOpenAI(prompt); if (r) return r;
  }
  return null;
}

// ── Construction du prompt ─────────────────────────────────────────────────
function buildUpgradePrompt(article) {
  const sport = article.sport || "football";
  const league = article.league || "";
  const title = article.title || "";
  const desc = article.description || "";
  const existing = (article.content || "").slice(0, 600);

  return `أنت محرر رياضي متمرس. اكتب مقالاً صحفياً عربياً احترافياً ومفصلاً عن الموضوع التالي.

العنوان: ${title}
الرياضة: ${sport}${league ? " — " + league : ""}
${desc ? "الوصف: " + desc : ""}
${existing ? "المحتوى الموجود (مختصر): " + existing : ""}

متطلبات المقال:
- MINIMUM 7 فقرات طويلة مفصولة بـ \\n\\n
- كل فقرة: 80-130 كلمة عربية
- الإجمالي: 600-800 كلمة عربية
- البنية: مقدمة جذابة ← خلفية وسياق ← تفاصيل الحدث ← تحليل معمق ← أرقام وإحصاءات ← آراء وتوقعات الخبراء ← خلاصة ومستقبل
- أسلوب: صحفي تحليلي من مستوى بي بي سي عربي / الجزيرة الرياضية
- لا ماركداون، لا نقاط، فقرات نثرية فقط
- كل جملة تُضيف قيمة — ممنوع الحشو العام

بعد المقال، أضف قسم FAQ: 3 أسئلة وأجوبة مفيدة مرتبطة بالموضوع.
كل إجابة: 40-70 كلمة.

الردّ بتنسيق JSON فقط، بدون ماركداون:
{
  "content": "الفقرة الأولى...\\n\\nالفقرة الثانية...\\n\\n...",
  "faq": [
    {"q": "سؤال 1؟", "a": "إجابة مفصلة 1..."},
    {"q": "سؤال 2؟", "a": "إجابة مفصلة 2..."},
    {"q": "سؤال 3؟", "a": "إجابة مفصلة 3..."}
  ]
}`;
}

// ── Parsing de la réponse LLM ──────────────────────────────────────────────
function repairJsonNewlines(s) {
  return s.replace(/"(?:[^"\\]|\\.)*"/g, m =>
    m.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t")
  );
}

function parseResponse(raw = "") {
  const clean = raw.replace(/^```(?:json)?\s*/m, "").replace(/\s*```$/m, "").trim();
  const match = clean.match(/\{[\s\S]*\}/);
  if (!match) return null;
  let parsed = null;
  // Try 1: direct parse
  try { parsed = JSON.parse(match[0]); } catch {}
  // Try 2: repair newlines then parse
  if (!parsed) {
    try { parsed = JSON.parse(repairJsonNewlines(match[0])); } catch {}
  }
  if (!parsed || !parsed.content || typeof parsed.content !== "string") return null;
  return {
    content: parsed.content.trim(),
    faq: Array.isArray(parsed.faq) ? parsed.faq.slice(0, 3) : []
  };
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n╔════════════════════════════════════════════════════════╗");
  console.log("║    UPGRADE ARTICLES COURTS — نبض الرياضة             ║");
  console.log("╚════════════════════════════════════════════════════════╝");

  const articles = JSON.parse(fs.readFileSync(ARTICLES_PATH, "utf-8"));

  // Identifier les articles courts, triés par récence
  const recentCutoff = Date.now() - RECENT_DAYS * 24 * 3600 * 1000;
  const allShort = articles
    .map((a, i) => ({ a, i, words: arabicWordCount(a.content), ts: new Date(a.publishedAt || 0).getTime() }))
    .filter(({ words }) => words < MIN_AR_WORDS)
    .sort((x, y) => {
      // Priorité 1 : récents (<RECENT_DAYS jours)
      const xRecent = x.ts > recentCutoff ? 1 : 0;
      const yRecent = y.ts > recentCutoff ? 1 : 0;
      if (xRecent !== yRecent) return yRecent - xRecent;
      // Priorité 2 : plus récent en premier
      return y.ts - x.ts;
    });

  const toUpgrade = allShort.slice(0, MAX_PER_RUN);

  const provider = !_geminiDead ? "Gemini" : !_groqDead ? "Groq" : !_anthropicDead ? "Anthropic" : "OpenAI";
  console.log(`📰 Total articles    : ${articles.length}`);
  console.log(`⚠️  Articles courts  : ${allShort.length} (< ${MIN_AR_WORDS} mots arabes)`);
  console.log(`🔧 À upgrader ce run : ${toUpgrade.length} (cap: ${MAX_PER_RUN})`);
  console.log(`🤖 Primaire          : ${provider}`);
  console.log("─────────────────────────────────────────────────────────");

  if (toUpgrade.length === 0) {
    console.log("✅ Tous les articles sont déjà suffisamment longs !");
    return;
  }

  let upgraded = 0;
  let failed = 0;

  for (let k = 0; k < toUpgrade.length; k++) {
    if (noApiLeft()) {
      console.log("⛔ Toutes les APIs épuisées — arrêt.");
      break;
    }

    const { a: article, i: idx } = toUpgrade[k];
    const currentWords = arabicWordCount(article.content);
    process.stdout.write(`  [${k + 1}/${toUpgrade.length}] ${article.slug} (${currentWords}w)... `);

    const prompt = buildUpgradePrompt(article);

    try {
      const raw = await callLLM(prompt);
      if (!raw) {
        console.log("❌ aucune réponse API");
        failed++;
      } else {
        const parsed = parseResponse(raw);
        if (!parsed) {
          console.log("❌ JSON invalide");
          failed++;
        } else {
          const newWords = arabicWordCount(parsed.content);
          if (newWords < MIN_AR_WORDS) {
            console.log(`⚠ trop court (${newWords}w) — ignoré`);
            failed++;
          } else {
            articles[idx].content = parsed.content;
            if (parsed.faq.length > 0) articles[idx].faq = parsed.faq;
            // Reset en/fr content so backfill will retranslate the new longer content
            articles[idx].en_content = "";
            articles[idx].fr_content = "";
            upgraded++;
            console.log(`✓ ${newWords}w (était ${currentWords}w)`);
          }
        }
      }
    } catch (e) {
      console.log(`❌ erreur: ${e.message?.slice(0, 60)}`);
      failed++;
    }

    if (k < toUpgrade.length - 1 && !noApiLeft()) await sleep(DELAY_MS);
  }

  if (upgraded > 0) {
    fs.writeFileSync(ARTICLES_PATH, JSON.stringify(articles, null, 2), "utf-8");
    console.log(`\n✅ ${upgraded} articles upgradés — fichier sauvegardé.`);
    console.log(`   ${failed} échoués | ${allShort.length - upgraded} restants à traiter`);
    const remaining = allShort.length - upgraded;
    const runsLeft = Math.ceil(remaining / MAX_PER_RUN);
    console.log(`   Encore ~${runsLeft} runs pour tout upgrader (~${runsLeft} heures avec CI toutes les heures)`);
  } else {
    console.log("\nAucun article upgradé.");
  }
  console.log("─────────────────────────────────────────────────────────");
}

main().catch(e => {
  console.error("Upgrade error:", e.message);
  process.exit(1);
});
