/**
 * Cloudflare Pages Function — proxy api-sports.io avec ROTATION de clés.
 * URL: /api/live?path=fixtures%3Fdate%3D2026-06-02
 *
 * Clés (env, plan Free = 100 req/jour chacune) :
 *   API_FOOTBALL_KEY, API_FOOTBALL_KEY_2, API_FOOTBALL_KEY_3, ... _6
 * Si une clé atteint sa limite journalière, on passe à la suivante.
 */
export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const apiPath = url.searchParams.get("path") || "fixtures?live=all";

  const keys = [
    env.API_FOOTBALL_KEY, env.API_FOOTBALL_KEY_2, env.API_FOOTBALL_KEY_3,
    env.API_FOOTBALL_KEY_4, env.API_FOOTBALL_KEY_5, env.API_FOOTBALL_KEY_6,
  ].filter(Boolean);

  if (keys.length === 0) {
    return new Response(JSON.stringify({ error: "API_FOOTBALL_KEY not configured" }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }

  const apiUrl = `https://v3.football.api-sports.io/${apiPath}`;
  let lastData = null;

  for (const key of keys) {
    try {
      const res = await fetch(apiUrl, {
        headers: {
          "x-apisports-key": key,
          "x-rapidapi-host": "v3.football.api-sports.io",
        },
        cf: { cacheTtl: 120, cacheEverything: true },
      });
      const data = await res.json();
      lastData = data;

      // Limite journalière atteinte sur cette clé → essayer la suivante
      const errStr = JSON.stringify(data?.errors || {});
      if (errStr.includes("request limit for the day") || errStr.includes("requests")) {
        continue;
      }

      return new Response(JSON.stringify(data), {
        status: res.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=120",
        },
      });
    } catch (e) {
      lastData = { error: e.message };
    }
  }

  // Toutes les clés épuisées/en erreur
  return new Response(JSON.stringify(lastData || { error: "all keys exhausted" }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=120",
    },
  });
}
