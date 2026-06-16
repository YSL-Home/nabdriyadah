/**
 * fetch-live-snapshot.mjs
 * Récupère les matchs LIVE + ceux du jour via le proxy (rotation de clés côté CF)
 * et écrit content/live-snapshot.json. Les VISITEURS lisent ce JSON →
 * ils ne consomment plus le quota API-Football (seul le CI l'utilise).
 *
 * Fréquence: appelé dans le job breaking (toutes les 15 min). ~2 appels/run.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "..", "content", "live-snapshot.json");

const SITE = process.env.SITE_URL || "https://nabdriyadah.com";
const PROXY = `${SITE}/api/live`;

async function call(apiPath) {
  const res = await fetch(`${PROXY}?path=${encodeURIComponent(apiPath)}`);
  const data = await res.json();
  return data.response || [];
}

async function main() {
  const today = new Date().toISOString().slice(0, 10);
  let live = [], todayMatches = [];
  try { live = await call("fixtures?live=all"); } catch (e) { console.warn("live:", e.message); }
  try { todayMatches = await call(`fixtures?date=${today}`); } catch (e) { console.warn("today:", e.message); }

  // Si le proxy renvoie vide (quota épuisé), on garde l'ancien snapshot.
  let prev = {};
  try { prev = JSON.parse(fs.readFileSync(OUT, "utf-8")); } catch {}

  const snapshot = {
    date: today,
    fetchedAt: new Date().toISOString(),
    live: live.length ? live : (prev.live || []),
    today: todayMatches.length ? todayMatches : (prev.today || []),
  };

  fs.writeFileSync(OUT, JSON.stringify(snapshot, null, 2));
  console.log(`✅ snapshot: ${snapshot.live.length} live, ${snapshot.today.length} aujourd'hui (${today})`);
}

main().catch((e) => { console.error("Fatal:", e.message); process.exit(0); });
