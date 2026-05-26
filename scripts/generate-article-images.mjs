import fs from "fs";
import path from "path";

// ── Clés API images — ordre de priorité coût croissant ────────────────────
// 1. Gemini Imagen       — Gratuit (si dispo sur compte)
// 2. Pollinations.ai     — 100% GRATUIT, sans clé, FLUX
// 3. Hugging Face FLUX   — Gratuit (clé HF libre)
// 4. GPT-Image / DALL-E  — Payant (fallback final)
const GOOGLE_API_KEY  = process.env.GOOGLE_API_KEY  || "";
const HF_API_KEY      = process.env.HF_API_KEY      || ""; // Hugging Face — gratuit sur hf.co
const OPENAI_API_KEY  = process.env.OPENAI_API_KEY  || "";
const FORCE_REGENERATE = process.env.FORCE_REGENERATE_IMAGES === "true";
// 20/run × 24 runs = 480 images/jour
const MAX_PER_RUN = parseInt(process.env.MAX_IMAGES_PER_RUN || "50", 10);
// Budget temps : 35 min (Pollinations ~40s × 50 = 2000s max, typiquement 20-25s chacune)
const MAX_RUNTIME_MS = parseInt(process.env.MAX_IMAGE_RUNTIME_MS || String(35 * 60 * 1000), 10);

// Pollinations ne nécessite aucune clé — toujours disponible
const HAS_IMAGE_API = true;

const ARTICLES_PATH = path.join(process.cwd(), "content/articles/seo-articles.json");
const OUTPUT_DIR = path.join(process.cwd(), "public/generated");

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function normalizeText(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

function safeReadJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return [];
  }
}

/* ── Team color palettes ─────────────────────────────────────────────────
   Used to make images visually distinct per club/team
   ──────────────────────────────────────────────────────────────────────── */
const TEAM_PALETTES = {
  "real-madrid":       { colors: "all-white kit, gold and white stands, royal blue accent accents", crowd: "sea of white and gold scarves" },
  "barcelona":         { colors: "deep navy blue and crimson red vertical stripes, gold accents", crowd: "blue and red mosaic in the stands" },
  "liverpool":         { colors: "vibrant red kit, Anfield red stands packed to the rafters", crowd: "swaying red and white scarves, famous Kop end" },
  "manchester-city":   { colors: "sky blue kit, light blue stands, silver architectural detail", crowd: "sea of sky blue scarves and flags" },
  "manchester-united": { colors: "deep red kit, Old Trafford red and black stands", crowd: "red and white scarves, united flags waving" },
  "arsenal":           { colors: "red and white kit, Emirates red and white tiered stands", crowd: "red cannon flags, north london atmosphere" },
  "chelsea":           { colors: "royal blue kit, Stamford Bridge blue west stand", crowd: "blue flags and scarves, London atmosphere" },
  "psg":               { colors: "dark navy, red and white hoops, Parc des Princes unique roof", crowd: "navy blue and red ultras pyro display" },
  "bayern-munich":     { colors: "deep red and white kit, Allianz Arena glowing red exterior", crowd: "vibrant yellow and red tifo, munich skyline" },
  "juventus":          { colors: "black and white vertical stripes, Allianz Stadium modern design", crowd: "black and white scarves, bianconeri atmosphere" },
  "atletico-madrid":   { colors: "red and white stripes, Metropolitano iconic stands", crowd: "red and white striped flags, passionate colchoneros" },
  "borussia-dortmund": { colors: "vivid yellow and black kit, Signal Iduna Park iconic yellow wall", crowd: "massive yellow and black tifo, Sudtribune wall" },
  "inter-milan":       { colors: "black and blue stripes, San Siro shared stadium", crowd: "black and blue nerazzurri flags" },
  "ac-milan":          { colors: "red and black stripes, historic San Siro atmosphere", crowd: "red and black rossoneri scarves" },
  "al-hilal":          { colors: "royal blue kit, modern Riyadh stadium", crowd: "blue and white saudi fans" },
  "al-nassr":          { colors: "yellow and blue kit, saudi pro league modern stadium", crowd: "yellow and blue al-nassr fans" },
};

/* Map Arabic team names to keys */
const ARABIC_TO_TEAM = {
  "ريال مدريد": "real-madrid", "ريال": "real-madrid",
  "برشلونة": "barcelona", "برشلونه": "barcelona",
  "ليفربول": "liverpool",
  "مانشستر سيتي": "manchester-city", "سيتي": "manchester-city",
  "مانشستر يونايتد": "manchester-united", "يونايتد": "manchester-united",
  "أرسنال": "arsenal", "ارسنال": "arsenal",
  "تشيلسي": "chelsea",
  "باريس": "psg", "سان جيرمان": "psg",
  "بايرن": "bayern-munich",
  "يوفنتوس": "juventus",
  "أتلتيكو": "atletico-madrid",
  "دورتموند": "borussia-dortmund",
  "إنتر": "inter-milan", "انتر": "inter-milan",
  "ميلان": "ac-milan",
  "الهلال": "al-hilal",
  "النصر": "al-nassr",
};

function detectTeam(article) {
  const text = `${article.title || ""} ${article.description || ""} ${(article.keywords || []).join(" ")} ${article.en_title || ""}`;
  for (const [arabic, key] of Object.entries(ARABIC_TO_TEAM)) {
    if (text.includes(arabic)) return key;
  }
  // English check
  const lower = text.toLowerCase();
  for (const key of Object.keys(TEAM_PALETTES)) {
    if (lower.includes(key.replace("-", " "))) return key;
  }
  return null;
}

/* ── Visual event type detection ──────────────────────────────────────── */
function extractEventType(article) {
  const text = `${article.title || ""} ${article.description || ""} ${article.en_title || ""}`;
  if (/رحيل|يغادر|انتقال|صفقة|تعاقد|ينضم|transfer|signing|deal|move/i.test(text)) return "transfer";
  if (/لقب|تتويج|يرفع|بطل|champion|trophy|title|winner|win the/i.test(text))        return "trophy";
  if (/إصابة|غياب|يتعافى|injury|injured|out for/i.test(text))                       return "injury";
  if (/نهائي|final|semi.final|quarter/i.test(text))                                 return "final";
  if (/مؤتمر|تصريح|يؤكد|press conference|statement|confirms/i.test(text))           return "press";
  if (/هدف|فاز|تعادل|خسر|نتيجة|goal|match|result|score|defeated/i.test(text))      return "match";
  if (/تدريب|استعداد|training|preparation/i.test(text))                              return "training";
  if (/إحصاء|سجل|record|stats|ranking|classement/i.test(text))                      return "stats";
  return "general";
}

/* ── Rich, article-specific prompt builder ───────────────────────────── */
function buildPrompt(article) {
  const sport  = normalizeText(article.sport  || "football");
  const league = normalizeText(article.league || "");
  const event  = extractEventType(article);
  const teamKey = detectTeam(article);
  const team  = teamKey ? TEAM_PALETTES[teamKey] : null;

  // Prefer English title for AI clarity, fall back to French, then Arabic
  const readableTitle = normalizeText(
    article.en_title || article.fr_title || article.title || ""
  ).slice(0, 120);

  // English keywords from content
  const kw = (article.keywords || [])
    .filter(k => k && k.length > 2 && !/^[؀-ۿ]/.test(k))
    .slice(0, 4).join(", ");

  /* ── Stadium / arena environments ── */
  const ENV = {
    "premier-league":    "iconic english top-flight football stadium at night, floodlit emerald pitch, packed terraces of 60 000 fans, northerly city skyline visible beyond the stands",
    "la-liga":           "sunlit mediterranean football stadium, sand-coloured architecture, pitch immaculately groomed, sold-out capacity, terracotta stands",
    "bundesliga":        "german football stadium at dusk, distinctive lower tier, city skyline glowing orange, atmospheric tifo in the stands",
    "serie-a":           "grand historic italian football stadium, marble arches, packed curva with coloured smoke, roman architecture detail in background",
    "ligue-1":           "french top-flight football stadium, art-deco main stand, passionate ultras section with tifos, paris skyline at blue hour",
    "champions-league":  "enormous european football stadium at night, 80 000 seats full, blue-white spotlights, pre-match atmosphere, confetti in the air",
    "saudi-pro-league":  "futuristic middle-eastern football stadium, palm-tree silhouettes, fans in traditional white dress, gold architectural accents, desert twilight sky",
    "basketball":        "NBA-style arena with gleaming hardwood court, 20 000-seat sold-out venue, rafter championship banners, intense overhead spotlights",
    "tennis":            "grand-slam centre court, immaculate red clay or manicured grass, full three-tier grandstand, dramatic shadows across the baseline",
    "padel":             "professional padel facility, panoramic glass walls, electric blue-white LED lighting, smart spectator seating",
    "futsal":            "indoor futsal arena, polished timber floor, compact goals, crowd extremely close to the pitch, vivid coloured stands",
    "football":          "professional football stadium at twilight, stands packed with 50 000 fans, perfectly manicured pitch, city glow on the horizon",
  };

  /* ── Action scenes by event type ── */
  const ACTION = {
    transfer:  "solitary athletic silhouette standing at the tunnel entrance staring towards the empty pitch, soft farewell lighting, shallow depth of field, contemplative mood",
    trophy:    "gleaming golden trophy on the centre of the pitch, confetti shower, low dramatic hero angle, celebration flares in the background",
    injury:    "medical and physio team silhouettes in motion across the pitch, golden-hour backlight, empty stadium watching, focused professional atmosphere",
    final:     "two distinct groups of supporters in a split stadium, intense pre-match atmosphere, teams warming up in silhouette, dramatic lighting raking across the pitch",
    press:     "empty podium with microphones on the pitch edge, single dramatic overhead spotlight, anticipation and mystery, wide angle",
    match:     "intense aerial dueling silhouette, two athletic figures leaping at peak of motion, motion blur, roaring crowd in background, ball at apex",
    training:  "lone athletic figure silhouetted against a goalpost at first light, precision training drills, cinematic wide angle",
    stats:     "aerial bird's-eye view of pitch geometry, player formations visible as silhouettes, graphic sports journalism composition",
    general:   "sweeping cinematic aerial view of a packed stadium, crowd colour mosaic, pitch geometry, late-afternoon raking light",
  };

  const envKey = (league && ENV[league]) ? league : (sport && ENV[sport] ? sport : "football");
  const environment = ENV[envKey];
  const action = ACTION[event] || ACTION.general;

  // Team palette override
  const colorNote = team
    ? `TEAM VISUAL IDENTITY: fans dressed in ${team.colors}. Crowd detail: ${team.crowd}.`
    : "";

  return `You are creating a premium editorial sports photography image for a professional Arabic sports news website.

ABSOLUTE RULES (never break):
• Zero text, letters, numbers, captions, watermarks, scorelines or UI elements
• No identifiable real player faces or recognizable portraits
• No club logos, badges, jersey numbers, sponsor branding or trademark symbols
• No national flags as main subject (background crowd flags are acceptable)
• Pure photorealistic photography — no illustration, CGI render, painting or cartoon
• Output must be landscape 16:9 — perfect for a news article banner

SETTING:
${environment}

EVENT TYPE — "${event}":
${action}

${colorNote}

ARTICLE TOPIC (visual tone guide only — do NOT render as text):
"${readableTitle}"
${kw ? `Keywords: ${kw}` : ""}

TECHNICAL QUALITY:
• Getty Images / AFP wire photo standard — premium sports journalism
• Cinematically lit, emotionally resonant, visually striking
• Rich saturated colours, sharp foreground subject, creamy bokeh crowd background
• This image must feel 100% specific to this exact article — not a stock photo`.trim();
}

/**
 * Prompt court et direct pour FLUX (Pollinations / Hugging Face).
 * FLUX fonctionne mieux avec une description visuelle concise, pas d'instructions.
 */
function buildFluxPrompt(article) {
  const sport   = normalizeText(article.sport  || "football");
  const league  = normalizeText(article.league || "");
  const event   = extractEventType(article);
  const teamKey = detectTeam(article);
  const team    = teamKey ? TEAM_PALETTES[teamKey] : null;

  const SPORT_SCENE = {
    "premier-league":   "professional football stadium at night, floodlit pitch, packed crowd",
    "la-liga":          "sunlit football stadium, mediterranean atmosphere, sold-out stands",
    "bundesliga":       "german football stadium at dusk, atmospheric tifo, city skyline",
    "serie-a":          "historic italian football stadium, passionate ultras, marble architecture",
    "ligue-1":          "french football stadium, ultras section with tifos, city lights",
    "champions-league": "massive european football stadium at night, 80000 fans, blue spotlights",
    "saudi-pro-league": "futuristic middle-eastern stadium, palm trees, desert twilight",
    "basketball":       "NBA arena, gleaming hardwood court, rafter banners, overhead spotlights",
    "tennis":           "grand slam centre court, red clay, packed grandstand, dramatic shadows",
    "padel":            "professional padel court, glass walls, LED lighting, modern arena",
    "futsal":           "indoor futsal arena, polished floor, compact goals, vibrant stands",
    "football":         "professional football stadium, packed stands, manicured pitch, twilight",
    "f1":               "Formula 1 circuit, racing cars on track, pit lane, grandstands packed",
    "golf":             "golf course, green fairway, rolling hills, dramatic sky, tournament flags",
  };

  const EVENT_ACTION = {
    transfer:  "silhouette of athlete at tunnel entrance, farewell lighting, contemplative mood",
    trophy:    "gleaming golden trophy, confetti shower, celebration, dramatic hero angle",
    injury:    "medical team on pitch, golden-hour backlight, focused professional atmosphere",
    final:     "two supporter groups in stadium, pre-match atmosphere, intense atmosphere",
    press:     "empty podium with microphones, single spotlight, anticipation",
    match:     "two athletes in intense aerial duel, motion blur, roaring crowd behind",
    training:  "athlete silhouetted against goalpost at first light, training drills",
    stats:     "aerial bird's-eye view of pitch, player formations as silhouettes",
    general:   "cinematic aerial view of packed stadium, crowd colour mosaic, raking light",
  };

  const sceneKey = (league && SPORT_SCENE[league]) ? league : (SPORT_SCENE[sport] ? sport : "football");
  const scene  = SPORT_SCENE[sceneKey];
  const action = EVENT_ACTION[event] || EVENT_ACTION.general;
  const colors = team ? `, fans in ${team.colors}` : "";

  return `photorealistic sports editorial photography, ${scene}${colors}, ${action}, no text no logos no faces, Getty Images quality, cinematic lighting, 16:9 wide landscape`;
}

// ── Gemini Imagen (Google AI) — priorité 1, rapide et moins cher ─────────
async function tryGeminiImagen(prompt) {
  if (!GOOGLE_API_KEY) throw new Error("No GOOGLE_API_KEY");
  // Tronque le prompt à 480 chars (limite Imagen)
  const p = prompt.slice(0, 480);
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-fast-generate-001:predict?key=${GOOGLE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instances: [{ prompt: p }],
        parameters: { sampleCount: 1, aspectRatio: "16:9", safetyFilterLevel: "BLOCK_SOME" }
      })
    }
  );
  const data = await response.json();
  if (!response.ok) throw new Error(`Gemini Imagen error: ${JSON.stringify(data?.error || data).slice(0, 120)}`);
  const b64 = data?.predictions?.[0]?.bytesBase64Encoded;
  if (!b64) throw new Error("Gemini: no image data returned");
  return b64;
}

// ── Gemini 2.0 Flash — édition image (image → image similaire) ────────────
async function tryGeminiEdit(imageBuffer, article) {
  if (!GOOGLE_API_KEY) throw new Error("No GOOGLE_API_KEY");
  const sport  = normalizeText(article.sport  || "football");
  const league = normalizeText(article.league || "");
  const title  = normalizeText(article.en_title || article.fr_title || article.title || "").slice(0, 100);
  const prompt = [
    "Create a professional sports editorial photograph visually inspired by the reference image.",
    "Keep the same sport, setting, atmosphere and lighting mood.",
    "Make it a completely new photo — different moment, different angle, slight variation in composition.",
    "STRICT: no text, no logos, no watermarks, no identifiable player faces, no jersey numbers, no club badges.",
    "Output: photorealistic, premium sports journalism quality, 16:9 landscape banner format.",
    league ? `Sport context: ${league}` : `Sport: ${sport}`,
    title  ? `Article topic: "${title}"` : "",
  ].filter(Boolean).join(" ");

  const b64img = imageBuffer.toString("base64");
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${GOOGLE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [
          { text: prompt },
          { inline_data: { mime_type: "image/jpeg", data: b64img } }
        ]}],
        generationConfig: { responseModalities: ["IMAGE", "TEXT"] }
      })
    }
  );
  const data = await response.json();
  if (!response.ok) throw new Error(`Gemini edit error: ${JSON.stringify(data?.error || data).slice(0, 120)}`);
  for (const part of (data?.candidates?.[0]?.content?.parts || [])) {
    if (part.inline_data?.data) return part.inline_data.data;
  }
  throw new Error("Gemini edit: no image data in response");
}

// ── GPT-Image-1 ───────────────────────────────────────────────────────────
async function tryGptImage1(prompt) {
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt,
      size: "1536x1024",
      quality: "medium",
      output_format: "png"
    })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(`gpt-image-1 error: ${JSON.stringify(data?.error || data)}`);

  const b64 = data?.data?.[0]?.b64_json;
  if (!b64) throw new Error("gpt-image-1: no image data returned");
  return b64;
}

async function tryDallE3(prompt) {
  const truncated = prompt.slice(0, 900);

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt: truncated,
      n: 1,
      size: "1792x1024",
      quality: "standard"
      // response_format supprimé — invalide dans les versions récentes de l'API
    })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(`dall-e-3 error: ${JSON.stringify(data?.error || data)}`);

  const b64 = data?.data?.[0]?.b64_json;
  if (b64) return b64;
  // Fallback : télécharger depuis l'URL si pas de b64
  const imgUrl = data?.data?.[0]?.url;
  if (imgUrl) return (await fetchImageBuffer(imgUrl)).toString("base64");
  throw new Error("dall-e-3: no image data returned");
}

// ── Détection erreurs fatales (billing/auth/model manquant) ──────────────
function isFatalApiError(msg) {
  return /billing hard limit|insufficient_quota|invalid_api_key|account.*deactivated|"code":404|models\/.*is not found|model.*not found|not found.*model/i.test(msg);
}

// ── Flags fail-fast — évite de réessayer un modèle mort ──────────────────
let _apisFatal        = false;
let _geminiImagenDead = false;
let _geminiEditDead   = false;
let _openAIDead       = false;
let _pollinationsDead = false;
let _hfDead           = false;

// ── Pollinations.ai — 100% GRATUIT, sans clé, FLUX 1.1 ───────────────────
// Endpoint public, commercial allowed. Pas de compte requis.
// Prend un prompt FLUX court (buildFluxPrompt) — pas le prompt GPT long
async function tryPollinations(fluxPrompt, attempt = 1) {
  if (_pollinationsDead) throw new Error("Pollinations désactivé");
  const safe = fluxPrompt.replace(/\s+/g, " ").trim().slice(0, 400);
  const encoded = encodeURIComponent(safe);
  const seed = Math.floor(Math.random() * 999999);
  // Résolution réduite 912×608 — génération ~2× plus rapide (vs 1536×1024)
  const url = `https://image.pollinations.ai/prompt/${encoded}?model=flux&width=912&height=608&nologo=true&enhance=false&seed=${seed}`;

  const ctrl = new AbortController();
  const timeoutMs = 40000; // 40s (image 912×608 génère en ~15-30s)
  const timeout = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { "User-Agent": "nabdriyadah-sports/1.0" }
    });
    clearTimeout(timeout);
    if (!res.ok) {
      if (res.status >= 500) {
        // Retry once on server error
        if (attempt < 2) {
          await new Promise(r => setTimeout(r, 5000));
          return tryPollinations(fluxPrompt, 2);
        }
        throw new Error(`Pollinations ${res.status}`);
      }
      if (res.status === 429) {
        // Rate limit — retry after 10s
        if (attempt < 2) {
          await new Promise(r => setTimeout(r, 10000));
          return tryPollinations(fluxPrompt, 2);
        }
        throw new Error("Pollinations rate limit");
      }
      _pollinationsDead = true;
      throw new Error(`Pollinations fatal ${res.status}`);
    }
    const ct = res.headers.get("content-type") || "";
    if (!ct.includes("image")) throw new Error(`Not an image: ${ct}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 10000) throw new Error("Image trop petite (probablement erreur)");
    return buf.toString("base64");
  } catch (e) {
    clearTimeout(timeout);
    // Retry once on network timeout
    if (e.name === "AbortError" && attempt < 2) {
      console.log("    Pollinations timeout — retry...");
      await new Promise(r => setTimeout(r, 3000));
      return tryPollinations(fluxPrompt, 2);
    }
    throw e;
  }
}

// ── Hugging Face Inference API — GRATUIT avec clé HF (hf.co) ─────────────
// Modèle : FLUX.1-schnell (rapide, haute qualité, libre de droits)
// Clé gratuite : https://huggingface.co/settings/tokens
const HF_MODEL = "black-forest-labs/FLUX.1-schnell";
async function tryHuggingFace(fluxPrompt) {
  if (!HF_API_KEY || _hfDead) throw new Error("HF non configuré");
  const condensed = fluxPrompt.replace(/\s+/g, " ").trim().slice(0, 500);
  const res = await fetch(
    `https://api-inference.huggingface.co/models/${HF_MODEL}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
        "X-Use-Cache": "false"
      },
      body: JSON.stringify({
        inputs: condensed,
        parameters: { width: 1344, height: 768, num_inference_steps: 4, guidance_scale: 0 }
      })
    }
  );
  if (!res.ok) {
    const err = await res.text().catch(() => String(res.status));
    if (/loading|currently loading/i.test(err)) throw new Error("HF model loading (retry)");
    if (isFatalApiError(err) || res.status === 401 || res.status === 403) {
      _hfDead = true; throw new Error(`HF fatal: ${err.slice(0, 80)}`);
    }
    throw new Error(`HF error ${res.status}: ${err.slice(0, 80)}`);
  }
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("image")) throw new Error(`HF: Not an image (${ct})`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 10000) throw new Error("HF: Image trop petite");
  return buf.toString("base64");
}

async function generateImageBase64(prompt, article) {
  // Construit le prompt FLUX court pour Pollinations / HF
  const fluxPrompt = article ? buildFluxPrompt(article) : prompt.slice(0, 300);

  // Ordre : Gemini Imagen → Pollinations (free) → HF FLUX (free) → GPT → DALL-E

  // 1. Gemini Imagen (gratuit si dispo sur le compte)
  if (GOOGLE_API_KEY && !_geminiImagenDead) {
    try {
      const b64 = await tryGeminiImagen(prompt);
      console.log("    ✓ Gemini Imagen");
      return b64;
    } catch (e) {
      console.log(`    Gemini Imagen: ${e.message.slice(0, 80)}`);
      if (isFatalApiError(e.message)) {
        console.log("  ⛔ Gemini Imagen indisponible (404/quota) — désactivé.");
        _geminiImagenDead = true;
      }
    }
  }

  // 2. Pollinations.ai — 100% gratuit, sans clé, FLUX
  if (!_pollinationsDead) {
    try {
      const b64 = await tryPollinations(fluxPrompt);
      console.log("    ✓ Pollinations FLUX");
      return b64;
    } catch (e) {
      console.log(`    Pollinations: ${e.message.slice(0, 80)}`);
      // Pollinations peut être lent — pas fatal sauf flag explicitement mis
    }
  }

  // 3. Hugging Face FLUX.1-schnell (gratuit avec clé HF)
  if (HF_API_KEY && !_hfDead) {
    try {
      const b64 = await tryHuggingFace(fluxPrompt);
      console.log("    ✓ HuggingFace FLUX.1-schnell");
      return b64;
    } catch (e) {
      console.log(`    HuggingFace: ${e.message.slice(0, 80)}`);
    }
  }

  // 4. GPT-Image-1 (payant — fallback si crédits dispo)
  if (OPENAI_API_KEY && !_openAIDead) {
    try {
      const b64 = await tryGptImage1(prompt);
      console.log("    ✓ gpt-image-1");
      return b64;
    } catch (e) {
      console.log(`    gpt-image-1: ${e.message.slice(0, 80)}`);
      if (isFatalApiError(e.message)) {
        _openAIDead = true;
        // Essai DALL-E-3 unique
        try {
          const b64 = await tryDallE3(prompt);
          console.log("    ✓ dall-e-3");
          return b64;
        } catch (e3) {
          if (isFatalApiError(e3.message)) {
            console.log("  ⛔ OpenAI billing fatal — désactivé.");
            _apisFatal = true;
          }
        }
      }
    }
    // DALL-E-3 fallback normal
    if (!_openAIDead && !_apisFatal) {
      try {
        const b64 = await tryDallE3(prompt);
        console.log("    ✓ dall-e-3");
        return b64;
      } catch (e) {
        if (isFatalApiError(e.message)) { _openAIDead = true; }
      }
    }
  }

  return null; // toutes les APIs ont échoué
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function downloadImage(url, destPath) {
  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
    redirect: "follow"
  });
  if (!response.ok) throw new Error(`Download failed: ${response.status}`);
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("image")) throw new Error(`Not an image: ${contentType}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length < 5000) throw new Error("Image too small, likely a placeholder");
  fs.writeFileSync(destPath, buffer);
}

// ── Scrape OG image from source article page ───────────────────────────────
async function scrapeOgImage(url) {
  if (!url) return null;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 9000);
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1)" },
      redirect: "follow",
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const html = await res.text();
    // Try og:image first, then twitter:image
    const patterns = [
      /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i,
      /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i,
      /<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i,
      /<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i,
    ];
    for (const re of patterns) {
      const m = html.match(re);
      if (m && m[1] && m[1].startsWith("http")) return m[1];
    }
    return null;
  } catch {
    return null;
  }
}

// ── Download image to buffer ───────────────────────────────────────────────
async function fetchImageBuffer(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12000);
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
    redirect: "follow",
    signal: ctrl.signal,
  });
  clearTimeout(timer);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("image")) throw new Error(`Not an image: ${ct}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 4000) throw new Error("Image too small or placeholder");
  return buf;
}

// ── GPT-Image-1 edit: create visually similar image from source photo ──────
async function editImageWithGPT(imageBuffer, article) {
  if (!OPENAI_API_KEY) throw new Error("No OPENAI_API_KEY");

  const sport  = normalizeText(article.sport  || "football");
  const league = normalizeText(article.league || "");
  const title  = normalizeText(article.en_title || article.fr_title || article.title || "").slice(0, 100);

  const prompt = [
    "Create a professional sports editorial photograph visually inspired by the reference image.",
    "Keep the same sport, same general setting (stadium/court/arena), same atmosphere and lighting mood.",
    "Make it a completely new photo — different moment, different angle, slight variation in composition.",
    "STRICT: no text, no logos, no watermarks, no identifiable player faces, no jersey numbers, no club badges.",
    "Output: photorealistic, premium sports journalism quality, 16:9 landscape banner format.",
    league ? `Sport context: ${league}` : `Sport: ${sport}`,
    title  ? `Article topic: "${title}"` : "",
  ].filter(Boolean).join(" ");

  const formData = new FormData();
  formData.append("model", "gpt-image-1");
  formData.append("image[]", new Blob([imageBuffer], { type: "image/jpeg" }), "source.jpg");
  formData.append("prompt", prompt);
  formData.append("size", "1536x1024");
  formData.append("n", "1");

  const res = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(`GPT edit error: ${JSON.stringify(data?.error || data).slice(0, 120)}`);

  const b64 = data?.data?.[0]?.b64_json;
  if (!b64) throw new Error("GPT edit: no image data");
  return b64;
}

async function main() {
  const RUN_START = Date.now();
  const isOverBudget = () => Date.now() - RUN_START > MAX_RUNTIME_MS;

  // Pollinations est toujours disponible (pas de clé requise)
  console.log(`Image API: ${GOOGLE_API_KEY ? "Gemini ✓" : "Gemini ✗"} | Pollinations ✓ (gratuit) | ${HF_API_KEY ? "HuggingFace ✓" : "HF ✗"} | ${OPENAI_API_KEY ? "GPT ✓" : "GPT ✗"}`);
  console.log(`Budget temps: ${MAX_RUNTIME_MS / 60000} min | MAX_PER_RUN: ${MAX_PER_RUN}`);

  const articles = safeReadJson(ARTICLES_PATH);

  if (!Array.isArray(articles) || articles.length === 0) {
    console.log("No articles found, skipping image generation.");
    process.exit(0);
  }

  ensureDir(OUTPUT_DIR);

  let changed = false;
  let generated = 0;

  // Trier : articles sans image générée en premier (nouveaux articles prioritaires)
  const sorted = [...articles].sort((a, b) => {
    const aHas = a.image && a.image.startsWith("/generated/") && fs.existsSync(path.join(OUTPUT_DIR, `${a.slug}.png`));
    const bHas = b.image && b.image.startsWith("/generated/") && fs.existsSync(path.join(OUTPUT_DIR, `${b.slug}.png`));
    return (aHas ? 1 : 0) - (bHas ? 1 : 0);
  });

  for (const article of sorted) {
    if (generated >= MAX_PER_RUN || _apisFatal || isOverBudget()) {
      if (_apisFatal) console.log("  ⛔ APIs indisponibles — génération abandonnée.");
      else if (isOverBudget()) console.log(`⏱ Budget temps atteint (${MAX_RUNTIME_MS / 60000} min). Arrêt propre.`);
      else console.log(`Limite atteinte (${MAX_PER_RUN} images/run). Arrêt.`);
      break;
    }

    const slug = normalizeText(article.slug || "");
    if (!slug) continue;

    const fileName = `${slug}.png`;
    const absoluteImagePath = path.join(OUTPUT_DIR, fileName);
    const publicImagePath = `/generated/${fileName}`;

    // Skip si image déjà générée (fichier PNG existe) et non forcé
    const alreadyGenerated = fs.existsSync(absoluteImagePath);
    const isUnsplash = (article.image || "").includes("unsplash.com");

    if (!FORCE_REGENERATE && alreadyGenerated && !isUnsplash) {
      if (article.image !== publicImagePath) { article.image = publicImagePath; changed = true; }
      continue;
    }

    // ── Step 1: image source directe (RSS imageUrl → OG scrape) ────────────
    // Priorité absolue : télécharger l'image originale de l'article source, sans AI edit
    const rssImageUrl = article.imageUrl || null;
    const sourceUrl   = article.sourceUrl || null;
    let sourceImgBuffer = null;

    if (rssImageUrl) {
      try {
        sourceImgBuffer = await fetchImageBuffer(rssImageUrl);
        console.log(`  ✓ Source directe (RSS): ${slug}`);
      } catch { /* silent */ }
    }

    if (!sourceImgBuffer && sourceUrl) {
      try {
        const ogUrl = await scrapeOgImage(sourceUrl);
        if (ogUrl) {
          sourceImgBuffer = await fetchImageBuffer(ogUrl);
          console.log(`  ✓ Source directe (OG): ${slug}`);
        }
      } catch { /* silent */ }
    }

    // Image source trouvée → sauvegarder directement sans AI
    if (sourceImgBuffer) {
      fs.writeFileSync(absoluteImagePath, sourceImgBuffer);
      articles.find(a => a.slug === slug).image = publicImagePath;
      changed = true; generated++;
      console.log(`  ✓ Direct copy: ${fileName} [${generated}/${MAX_PER_RUN}]`);
      continue;
    }

    if (_apisFatal) break;

    // ── Step 3: génération IA pure (pas d'image source ou clone échoué) ──
    try {
      console.log(`  Generating: ${slug} (${article.sport || "football"})`);
      const base64 = await generateImageBase64(buildPrompt(article));
      if (!base64) { console.log(`  Skipped (APIs fatales): ${slug}`); break; }
      fs.writeFileSync(absoluteImagePath, Buffer.from(base64, "base64"));
      articles.find(a => a.slug === slug).image = publicImagePath;
      changed = true; generated++;
      console.log(`  ✓ Generated: ${fileName} [${generated}/${MAX_PER_RUN}]`);
      await sleep(1200);
    } catch (error) {
      console.log(`  Failed ${slug}: ${error.message.slice(0, 100)}`);
      if (_apisFatal) break;
    }
  }

  if (changed) {
    fs.writeFileSync(ARTICLES_PATH, JSON.stringify(articles, null, 2), "utf-8");
    console.log("Updated articles with generated image paths.");
  }

  console.log("Image generation finished.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
