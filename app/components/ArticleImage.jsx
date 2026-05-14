"use client";

// Images Unsplash par ligue / sport — AUCUN doublon entre sports
// Chaque photo n'apparaît QUE dans UNE seule catégorie
const IMGS = {
  /* ── FOOTBALL / SOCCER ───────────────────────────────────────────────── */
  "premier-league": [
    "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=900&q=80", // Old Trafford / Anfield atmosphere
    "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=900&q=80", // Soccer ball on pitch
    "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=900&q=80", // Football stadium floodlit
  ],
  "la-liga": [
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=900&q=80", // Football match action
    "https://images.unsplash.com/photo-1551958219-acbc630e2914?w=900&q=80", // Football tackle
    "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=900&q=80", // Football goalkeeper
  ],
  "bundesliga": [
    "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=900&q=80", // Football crowd
    "https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?w=900&q=80", // Football stadium
  ],
  "serie-a": [
    "https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=900&q=80", // Football action
    "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=900&q=80", // Football player
  ],
  "ligue-1": [
    "https://images.unsplash.com/photo-1552667466-07770ae110d0?w=900&q=80", // Football match
    "https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=900&q=80", // Football pitch
  ],
  "champions-league": [
    "https://images.unsplash.com/photo-1608831540955-35094d48694a?w=900&q=80", // Champions League night
    "https://images.unsplash.com/photo-1562552052-d5fa6f3c12ff?w=900&q=80", // Football trophy atmosphere
  ],
  "saudi-pro-league": [
    "https://images.unsplash.com/photo-1620472478041-3c7984cc3ef4?w=900&q=80", // Football stadium modern
    "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=900&q=80", // Football pitch aerial
  ],
  football: [
    "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=900&q=80",
    "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?w=900&q=80",
    "https://images.unsplash.com/photo-1486286701208-1d58e9338013?w=900&q=80",
    "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=900&q=80",
    "https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=900&q=80",
    "https://images.unsplash.com/photo-1540747913346-19212a4b423a?w=900&q=80",
    "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=900&q=80",
    "https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=900&q=80",
    "https://images.unsplash.com/photo-1600679472829-3044539ce405?w=900&q=80",
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=900&q=80",
    "https://images.unsplash.com/photo-1565033566441-fb2d6f82d0e5?w=900&q=80",
    "https://images.unsplash.com/photo-1559057490-c5f8e9e94a60?w=900&q=80",
    "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=900&q=80",
    "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=900&q=80",
    "https://images.unsplash.com/photo-1542492977-5e6b8e1eb4ad?w=900&q=80",
    "https://images.unsplash.com/photo-1624880357913-a8539238245b?w=900&q=80",
    "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=900&q=80",
    "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=900&q=80",
    "https://images.unsplash.com/photo-1551958219-acbc630e2914?w=900&q=80",
    "https://images.unsplash.com/photo-1570498839593-e565b39455fc?w=900&q=80",
    "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=900&q=80",
    "https://images.unsplash.com/photo-1624362772770-a4aa0cf3b3f0?w=900&q=80",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80",
    "https://images.unsplash.com/photo-1477281765962-ef34e8bb0967?w=900&q=80",
    "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=900&q=80",
    "https://images.unsplash.com/photo-1617360534077-f9432d0a15f1?w=900&q=80",
    "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=900&q=80",
    "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=900&q=80",
    "https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=900&q=80",
    "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=900&q=80",
  ],

  /* ── BASKETBALL ──────────────────────────────────────────────────────── */
  basketball: [
    "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=900&q=80", // NBA arena court
    "https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=900&q=80", // Basketball dunk
    "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=900&q=80", // Basketball player
    "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=900&q=80", // Basketball court
    "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=900&q=80", // Basketball match
  ],

  /* ── TENNIS ──────────────────────────────────────────────────────────── */
  tennis: [
    "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=900&q=80", // Tennis racket clay
    "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=900&q=80", // Tennis player serve
    "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=900&q=80", // Tennis ball court
    "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=900&q=80", // Grand slam action
    "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=900&q=80", // Tennis aerial court
  ],

  /* ── PADEL ───────────────────────────────────────────────────────────── */
  padel: [
    "https://images.unsplash.com/photo-1612534847738-b3af9bc31f0c?w=900&q=80", // Padel glass court
    "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=900&q=80", // Padel racket
    "https://images.unsplash.com/photo-1629904888780-8de0c7933561?w=900&q=80", // Padel match
  ],

  /* ── FUTSAL ──────────────────────────────────────────────────────────── */
  futsal: [
    "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=900&q=80", // Indoor football
    "https://images.unsplash.com/photo-1552318965-6e6be7484ada?w=900&q=80", // Futsal court
    "https://images.unsplash.com/photo-1624880357913-a8539238245b?w=900&q=80", // Indoor soccer
  ],
};

const GRADIENTS = {
  football:   "linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)",
  basketball: "linear-gradient(135deg, #431407 0%, #c2410c 100%)",
  tennis:     "linear-gradient(135deg, #052e16 0%, #15803d 100%)",
  padel:      "linear-gradient(135deg, #2e1065 0%, #7c3aed 100%)",
  futsal:     "linear-gradient(135deg, #042f2e 0%, #0f766e 100%)",
};

// Choisit une image Unsplash stable basée sur le slug (pas aléatoire à chaque render)
function pickUnsplash(league, sport, slug = "") {
  const pool = IMGS[league] || IMGS[sport] || IMGS.football;
  const idx = slug.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % pool.length;
  return pool[idx];
}

export default function ArticleImage({ src, imageUrl, alt, sport, league, slug, style }) {
  const gradient = GRADIENTS[sport] || GRADIENTS.football;

  // Fallback Unsplash : toujours sport-correct, jamais l'image RSS (peut être mauvais sport)
  const unsplashFallback = pickUnsplash(league, sport, slug);

  // Priorité : image générée (si existante) → Unsplash correct par sport
  // On n'utilise PAS imageUrl comme fallback car la vignette RSS peut être hors-sujet
  const primarySrc = src || unsplashFallback;

  return (
    <div style={{ position: "relative", overflow: "hidden", background: gradient, ...style }}>
      <img
        src={primarySrc}
        alt={alt || ""}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", position: "absolute", inset: 0 }}
        loading="lazy"
        onError={e => {
          const el = e.currentTarget;
          if (el.dataset.fallback) { el.style.display = "none"; return; }
          el.dataset.fallback = "1";
          // Si l'image générée est 404 → Unsplash du bon sport
          el.src = el.src !== unsplashFallback ? unsplashFallback : "";
          if (!el.src) el.style.display = "none";
        }}
      />
    </div>
  );
}
