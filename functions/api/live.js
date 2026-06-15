/**
 * Cloudflare Pages Function — proxy api-sports.io
 * URL: /api/live?path=fixtures%3Fdate%3D2026-06-02
 * Clé API: env variable API_FOOTBALL_KEY (côté serveur, non exposée)
 */
export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const apiPath = url.searchParams.get("path") || "fixtures?live=all";
  const apiKey  = env.API_FOOTBALL_KEY || "";

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "API_FOOTBALL_KEY not configured" }), {
      status: 500, headers: { "Content-Type": "application/json" }
    });
  }

  const apiUrl = `https://v3.football.api-sports.io/${apiPath}`;

  try {
    const res = await fetch(apiUrl, {
      headers: {
        "x-apisports-key": apiKey,
        "x-rapidapi-host": "v3.football.api-sports.io",
      },
      cf: { cacheTtl: 300, cacheEverything: true },
    });

    const data = await res.json();

    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 502, headers: { "Content-Type": "application/json" }
    });
  }
}
