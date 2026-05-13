/**
 * build-character-library.mjs
 * Génère une fois les caricatures des top joueurs/coachs et les stocke.
 * Réutilisées dans tous les videos futurs → cohérence visuelle = marque.
 *
 * Utilise DALL-E 3 (secret existant) ou Leonardo.ai si disponible.
 * Stockage : content/character-library.json + public/generated/characters/
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const OPENAI_KEY = process.env.OPENAI_API_KEY;
const LEONARDO_KEY = process.env.LEONARDO_API_KEY;
const LIBRARY_PATH = path.join(ROOT, "content", "character-library.json");
const CHARS_DIR = path.join(ROOT, "public", "generated", "characters");

// ── Top 30 personnages du foot mondial ──────────────────────────────────────
const CHARACTERS = [
  // Joueurs stars
  { id: "mbappe",      name: "Kylian Mbappé",     role: "attaquant",  team: "Real Madrid",   nationality: "France" },
  { id: "haaland",     name: "Erling Haaland",    role: "attaquant",  team: "Man City",       nationality: "Norvège" },
  { id: "vinicius",    name: "Vinicius Jr",        role: "ailier",     team: "Real Madrid",   nationality: "Brésil" },
  { id: "bellingham",  name: "Jude Bellingham",   role: "milieu",     team: "Real Madrid",   nationality: "Angleterre" },
  { id: "pedri",       name: "Pedri",              role: "milieu",     team: "FC Barcelone",  nationality: "Espagne" },
  { id: "yamal",       name: "Lamine Yamal",       role: "ailier",     team: "FC Barcelone",  nationality: "Espagne" },
  { id: "salah",       name: "Mohamed Salah",      role: "ailier",     team: "Liverpool",     nationality: "Égypte" },
  { id: "lewandowski", name: "Robert Lewandowski", role: "attaquant",  team: "FC Barcelone",  nationality: "Pologne" },
  { id: "kane",        name: "Harry Kane",         role: "attaquant",  team: "Bayern Munich", nationality: "Angleterre" },
  { id: "dejong",      name: "Frenkie de Jong",    role: "milieu",     team: "FC Barcelone",  nationality: "Pays-Bas" },
  { id: "ter_stegen",  name: "Marc-André ter Stegen", role: "gardien", team: "FC Barcelone",  nationality: "Allemagne" },
  { id: "osimhen",     name: "Victor Osimhen",     role: "attaquant",  team: "Galatasaray",   nationality: "Nigéria" },
  { id: "saka",        name: "Bukayo Saka",        role: "ailier",     team: "Arsenal",       nationality: "Angleterre" },
  { id: "odegaard",    name: "Martin Ødegaard",    role: "milieu",     team: "Arsenal",       nationality: "Norvège" },
  { id: "neymar",      name: "Neymar Jr",          role: "attaquant",  team: "Al-Hilal",      nationality: "Brésil" },
  // Coachs
  { id: "ancelotti",   name: "Carlo Ancelotti",    role: "entraîneur", team: "Real Madrid",   nationality: "Italie" },
  { id: "flick",       name: "Hansi Flick",        role: "entraîneur", team: "FC Barcelone",  nationality: "Allemagne" },
  { id: "guardiola",   name: "Pep Guardiola",      role: "entraîneur", team: "Man City",      nationality: "Espagne" },
  { id: "klopp",       name: "Jürgen Klopp",       role: "entraîneur", team: "ex-Liverpool",  nationality: "Allemagne" },
  { id: "mourinho",    name: "José Mourinho",      role: "entraîneur", team: "Fenerbahçe",    nationality: "Portugal" },
  { id: "arteta",      name: "Mikel Arteta",       role: "entraîneur", team: "Arsenal",       nationality: "Espagne" },
  // Légendes actives en Arabie
  { id: "ronaldo",     name: "Cristiano Ronaldo",  role: "attaquant",  team: "Al-Nassr",      nationality: "Portugal" },
  { id: "benzema",     name: "Karim Benzema",      role: "attaquant",  team: "Al-Ittihad",    nationality: "France" },
  { id: "firmino",     name: "Roberto Firmino",    role: "attaquant",  team: "Al-Ahli",       nationality: "Brésil" },
  // Clubs arabes
  { id: "mahrez",      name: "Riyad Mahrez",       role: "ailier",     team: "Al-Ahli",       nationality: "Algérie" },
];

function buildCharacterPrompt(char) {
  return [
    `Cartoon caricature portrait of ${char.name}, ${char.role} for ${char.team},`,
    `exaggerated facial features in caricature style, Sports Series animation style,`,
    `flat design illustration, bold black outlines, vibrant saturated colors,`,
    `wearing ${char.team} football kit,`,
    char.role === "entraîneur"
      ? `wearing coach tracksuit, professional confident pose,`
      : `dynamic football pose, athletic energy,`,
    `clean white/light blue background, waist-up portrait,`,
    `professional motion design quality, no text, no watermark,`,
    `consistent cartoon style, bold expressive eyes, strong jawline caricature`,
  ].join(" ");
}

async function generateCharacterDallE(char, outputPath) {
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt: buildCharacterPrompt(char),
      n: 1,
      size: "1024x1024",
      quality: "hd",
      style: "vivid",
      response_format: "url",
    }),
  });

  if (!res.ok) throw new Error(`DALL-E error: ${(await res.text()).slice(0, 150)}`);

  const data = await res.json();
  const imageUrl = data.data[0].url;

  const imgRes = await fetch(imageUrl);
  const buffer = Buffer.from(await imgRes.arrayBuffer());
  fs.writeFileSync(outputPath, buffer);
}

async function generateCharacterLeonardo(char, outputPath) {
  const MODEL_ID = "e71a1c2f-4f80-4800-934f-2c68979d8cc8";

  const genRes = await fetch("https://cloud.leonardo.ai/api/rest/v1/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LEONARDO_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      modelId: MODEL_ID,
      prompt: buildCharacterPrompt(char),
      negative_prompt: "realistic photo, 3d render, text, watermark, blurry, deformed",
      width: 512,
      height: 512,
      num_images: 1,
      guidance_scale: 7,
      preset_style: "ILLUSTRATION",
      public: false,
    }),
  });

  const genData = await genRes.json();
  const generationId = genData.sdGenerationJob?.generationId;
  if (!generationId) throw new Error("No generation ID");

  // Poll for result
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    const pollRes = await fetch(
      `https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`,
      { headers: { Authorization: `Bearer ${LEONARDO_KEY}` } }
    );
    const pollData = await pollRes.json();
    const gen = pollData.generations_by_pk;
    if (gen?.status === "COMPLETE" && gen.generated_images?.[0]) {
      const imgRes = await fetch(gen.generated_images[0].url);
      const buffer = Buffer.from(await imgRes.arrayBuffer());
      fs.writeFileSync(outputPath, buffer);
      return;
    }
    if (gen?.status === "FAILED") throw new Error("Leonardo failed");
  }
  throw new Error("Leonardo timeout");
}

async function main() {
  console.log("\n╔══════════════════════════════════════════════════════╗");
  console.log("║   BUILD CHARACTER LIBRARY — نبض الرياضة             ║");
  console.log(`║   ${CHARACTERS.length} personnages × style cartoon                ║`);
  console.log("╚══════════════════════════════════════════════════════╝\n");

  fs.mkdirSync(CHARS_DIR, { recursive: true });

  let library = {};
  if (fs.existsSync(LIBRARY_PATH)) {
    library = JSON.parse(fs.readFileSync(LIBRARY_PATH, "utf-8"));
  }

  const useLeonardo = !!LEONARDO_KEY;
  console.log(`📡 Moteur: ${useLeonardo ? "Leonardo.ai (qualité pro)" : "DALL-E 3 (fallback)"}\n`);

  let generated = 0;
  let skipped = 0;

  for (const char of CHARACTERS) {
    const outputPath = path.join(CHARS_DIR, `${char.id}.png`);

    if (fs.existsSync(outputPath) && library[char.id]) {
      console.log(`  ⏭  ${char.name} — déjà dans la bibliothèque`);
      skipped++;
      continue;
    }

    try {
      process.stdout.write(`  🎨 ${char.name} (${char.team})...`);

      if (useLeonardo) {
        await generateCharacterLeonardo(char, outputPath);
      } else {
        await generateCharacterDallE(char, outputPath);
      }

      library[char.id] = {
        name: char.name,
        role: char.role,
        team: char.team,
        nationality: char.nationality,
        image_path: `/generated/characters/${char.id}.png`,
        generated_at: new Date().toISOString(),
        engine: useLeonardo ? "leonardo" : "dalle3",
      };

      fs.writeFileSync(LIBRARY_PATH, JSON.stringify(library, null, 2));
      generated++;
      console.log(" ✅");

      // Rate limit
      await new Promise((r) => setTimeout(r, 2000));
    } catch (err) {
      console.log(` ❌ ${err.message.slice(0, 80)}`);
    }
  }

  console.log(`\n✅ Bibliothèque mise à jour: ${generated} nouveaux, ${skipped} existants`);
  console.log(`📚 Total: ${Object.keys(library).length} personnages`);
  console.log(`📁 Stockage: content/character-library.json`);
}

main().catch((e) => { console.error("❌", e.message); process.exit(1); });
