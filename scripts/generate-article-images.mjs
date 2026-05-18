import fs from "fs";
import path from "path";

// Clés API disponibles — ordre de priorité coût croissant
const GOOGLE_API_KEY  = process.env.GOOGLE_API_KEY;   // Gemini Imagen — priorité 1
const OPENAI_API_KEY  = process.env.OPENAI_API_KEY;   // GPT            — priorité 2
const FORCE_REGENERATE = process.env.FORCE_REGENERATE_IMAGES === "true";
// Max images générées par run CI (évite timeout et coût excessif)
const MAX_PER_RUN = parseInt(process.env.MAX_IMAGES_PER_RUN || "25", 10);

const HAS_IMAGE_API = !!(GOOGLE_API_KEY || OPENAI_API_KEY);

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
      quality: "standard",
      response_format: "b64_json"
    })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(`dall-e-3 error: ${JSON.stringify(data?.error || data)}`);

  const b64 = data?.data?.[0]?.b64_json;
  if (!b64) throw new Error("dall-e-3: no image data returned");
  return b64;
}

// ── Orchestrateur : Gemini → GPT-Image-1 → DALL-E-3 ─────────────────────
async function generateImageBase64(prompt) {
  // 1. Gemini (le moins cher, souvent gratuit dans la free tier)
  if (GOOGLE_API_KEY) {
    try {
      const b64 = await tryGeminiImagen(prompt);
      console.log("    ✓ Gemini Imagen");
      return b64;
    } catch (e) {
      console.log(`    Gemini failed: ${e.message.slice(0, 80)}`);
    }
  }
  // 2. GPT-Image-1
  if (OPENAI_API_KEY) {
    try {
      const b64 = await tryGptImage1(prompt);
      console.log("    ✓ gpt-image-1");
      return b64;
    } catch (e) {
      console.log(`    gpt-image-1 failed: ${e.message.slice(0, 80)}`);
    }
    // 3. DALL-E-3 (fallback GPT)
    try {
      const b64 = await tryDallE3(prompt);
      console.log("    ✓ dall-e-3");
      return b64;
    } catch (e) {
      throw new Error(`All image APIs failed. Last: ${e.message.slice(0, 80)}`);
    }
  }
  throw new Error("No image API key configured");
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

// ── Résoudre les URLs Google News en URL directe de l'article ───────────────
async function resolveGoogleNewsUrl(url) {
  if (!url || !url.includes("news.google.com")) return url;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15",
        "Accept": "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    // L'URL finale après redirections est l'article réel
    const finalUrl = res.url;
    if (finalUrl && !finalUrl.includes("news.google.com")) return finalUrl;
    // Essayer d'extraire depuis le HTML si la redirection JS
    const html = await res.text();
    const m = html.match(/href=["'](https?:\/\/(?!news\.google)[^"']+)["']/);
    if (m) return m[1];
    return null;
  } catch {
    return null;
  }
}

// ── Scrape OG image from source article page ───────────────────────────────
async function scrapeOgImage(url) {
  if (!url) return null;
  try {
    // Résoudre les redirections Google News
    const resolvedUrl = await resolveGoogleNewsUrl(url);
    if (!resolvedUrl) return null;

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 9000);
    const res = await fetch(resolvedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1)",
        "Accept": "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const html = await res.text();
    // Try og:image first, then twitter:image, then first large <img>
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
  if (!HAS_IMAGE_API) {
    console.log("Aucune clé API image (GOOGLE_API_KEY / OPENAI_API_KEY) — génération images ignorée.");
    process.exit(0);
  }
  console.log(`Image API: ${GOOGLE_API_KEY ? "Gemini ✓" : ""}${OPENAI_API_KEY ? " GPT ✓" : ""}`);

  const articles = safeReadJson(ARTICLES_PATH);

  if (!Array.isArray(articles) || articles.length === 0) {
    console.log("No articles found, skipping image generation.");
    process.exit(0);
  }

  ensureDir(OUTPUT_DIR);

  let changed = false;
  let generated = 0;

  // Trier : articles sans image générée en premier (priorité aux nouveaux articles)
  const sorted = [...articles].sort((a, b) => {
    const aHas = a.image && a.image.startsWith("/generated/") && fs.existsSync(path.join(OUTPUT_DIR, `${a.slug}.png`));
    const bHas = b.image && b.image.startsWith("/generated/") && fs.existsSync(path.join(OUTPUT_DIR, `${b.slug}.png`));
    if (aHas && !bHas) return 1;
    if (!aHas && bHas) return -1;
    return 0;
  });

  for (const article of sorted) {
    if (generated >= MAX_PER_RUN) {
      console.log(`Limite atteinte (${MAX_PER_RUN} images/run). Arrêt.`);
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
      // Mettre à jour le chemin dans l'article si besoin
      if (article.image !== publicImagePath) {
        article.image = publicImagePath;
        changed = true;
      }
      continue;
    }

    // ── Step 1: find source image (RSS imageUrl → OG scrape) ─────────────
    const rssImageUrl = article.imageUrl || null;
    const sourceUrl   = article.sourceUrl || null;

    let sourceImgBuffer = null;
    let sourceLabel = "";

    // Try RSS image first
    if (rssImageUrl) {
      try {
        console.log(`  Fetching RSS image buffer: ${rssImageUrl.slice(0, 80)}`);
        sourceImgBuffer = await fetchImageBuffer(rssImageUrl);
        sourceLabel = "RSS";
      } catch (e) {
        console.log(`  RSS buffer failed (${e.message.slice(0, 60)})`);
      }
    }

    // Try OG image from source article page if RSS failed
    if (!sourceImgBuffer && sourceUrl) {
      try {
        console.log(`  Scraping OG image from: ${sourceUrl.slice(0, 80)}`);
        const ogUrl = await scrapeOgImage(sourceUrl);
        if (ogUrl) {
          sourceImgBuffer = await fetchImageBuffer(ogUrl);
          sourceLabel = "OG";
          console.log(`  OG image found: ${ogUrl.slice(0, 80)}`);
        } else {
          console.log(`  No OG image found`);
        }
      } catch (e) {
        console.log(`  OG scrape failed (${e.message.slice(0, 60)})`);
      }
    }

    // ── Step 2: clone via GPT edit if we have a source image ─────────────
    if (sourceImgBuffer && OPENAI_API_KEY) {
      try {
        console.log(`Cloning image via GPT edit [${sourceLabel}]: ${slug}`);
        const b64 = await editImageWithGPT(sourceImgBuffer, article);
        fs.writeFileSync(absoluteImagePath, Buffer.from(b64, "base64"));
        // Mettre à jour dans la liste originale (articles), pas sorted
        const orig = articles.find(a => a.slug === slug);
        if (orig) orig.image = publicImagePath;
        changed = true;
        generated++;
        console.log(`  ✓ Cloned (${sourceLabel}): ${fileName} [${generated}/${MAX_PER_RUN}]`);
        await sleep(1000);
        continue;
      } catch (editErr) {
        console.log(`  GPT edit failed (${editErr.message.slice(0, 80)}), falling back to AI generation...`);
      }
    }

    // ── Step 3: AI generation fallback (no source image or edit failed) ──
    try {
      console.log(`Generating image: ${slug} (sport: ${article.sport || "football"})`);
      const prompt = buildPrompt(article);
      const base64 = await generateImageBase64(prompt);
      fs.writeFileSync(absoluteImagePath, Buffer.from(base64, "base64"));
      const orig = articles.find(a => a.slug === slug);
      if (orig) orig.image = publicImagePath;
      changed = true;
      generated++;
      console.log(`  ✓ Generated: ${fileName} [${generated}/${MAX_PER_RUN}]`);
      await sleep(1500);
    } catch (error) {
      console.log(`  Image failed for ${slug}: ${error.message}`);
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
