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
    "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=900&q=80", // Football dribble
    "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?w=900&q=80", // Soccer player kicking
    "https://images.unsplash.com/photo-1486286701208-1d58e9338013?w=900&q=80", // Football stadium aerial
    "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=900&q=80", // Football field
    "https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=900&q=80", // Football boots on grass
    "https://images.unsplash.com/photo-1540747913346-19212a4b423a?w=900&q=80", // Football header
  ],

  /* ── BASKETBALL ──────────────────────────────────────────────────────── */
  basketball: [
    "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=900&q=80", // NBA arena court overhead
    "https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=900&q=80", // Basketball dunk action
    "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=900&q=80", // Basketball player orange ball
    "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=900&q=80", // NBA match crowd
    "https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?w=900&q=80", // Basketball court lines
    "https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=900&q=80", // Basketball hoop closeup
    "https://images.unsplash.com/photo-1569227997603-33b9191f0b32?w=900&q=80", // Basketball game defense
  ],

  /* ── TENNIS ──────────────────────────────────────────────────────────── */
  tennis: [
    "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=900&q=80", // Tennis racket on clay court
    "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=900&q=80", // Tennis player serve
    "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=900&q=80", // Yellow tennis ball on court
    "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=900&q=80", // Grand slam match action
    "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=900&q=80", // Tennis court aerial view
    "https://images.unsplash.com/photo-1543209392-e29e4f0f5718?w=900&q=80", // Grass court Wimbledon style
    "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=900&q=80", // Tennis doubles play
  ],

  /* ── PADEL ───────────────────────────────────────────────────────────── */
  padel: [
    "https://images.unsplash.com/photo-1612534847738-b3af9bc31f0c?w=900&q=80", // Padel panoramic glass court
    "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=900&q=80", // Padel racket close-up
    "https://images.unsplash.com/photo-1629904888780-8de0c7933561?w=900&q=80", // Padel match action
    "https://images.unsplash.com/photo-1613483187530-47c239bea8e5?w=900&q=80", // Indoor padel court LED lighting
    "https://images.unsplash.com/photo-1637166887163-9abf34e5f2d5?w=900&q=80", // Padel ball and racket
    "https://images.unsplash.com/photo-1614974121916-81c2f0e04e58?w=900&q=80", // Padel players smash
  ],

  /* ── FUTSAL ──────────────────────────────────────────────────────────── */
  futsal: [
    "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=900&q=80", // Indoor football hall
    "https://images.unsplash.com/photo-1552318965-6e6be7484ada?w=900&q=80", // Futsal court overhead
    "https://images.unsplash.com/photo-1624880357913-a8539238245b?w=900&q=80", // Indoor soccer players
    "https://images.unsplash.com/photo-1569802483988-60d56a6f8892?w=900&q=80", // Futsal goal action
    "https://images.unsplash.com/photo-1578165109989-4de6b28d96cc?w=900&q=80", // Indoor sports hall
  ],

  /* ── F1 / FORMULA 1 ─────────────────────────────────────────────────────── */
  f1: [
    "https://images.unsplash.com/photo-1541348263662-e068662d82af?w=900&q=80", // F1 car racing at speed
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80", // F1 racing circuit aerial
    "https://images.unsplash.com/photo-1593814681464-eef5af2b0628?w=900&q=80", // F1 pit stop mechanics
    "https://images.unsplash.com/photo-1579134752408-c7d4a0e8462c?w=900&q=80", // F1 race start grid
    "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=900&q=80", // Racing car cockpit helmet
    "https://images.unsplash.com/photo-1619067990685-63de48ecf693?w=900&q=80", // F1 car on track close-up
    "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=900&q=80", // Motorsport racing blur
  ],

  /* ── GOLF ───────────────────────────────────────────────────────────────── */
  golf: [
    "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=900&q=80", // Golf tournament players
    "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=900&q=80", // Golf swing follow-through
    "https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=900&q=80", // Golf green and hole
    "https://images.unsplash.com/photo-1542435503-956c469947f6?w=900&q=80", // Golf ball near hole
    "https://images.unsplash.com/photo-1632134638948-4c2f0c59f4c0?w=900&q=80", // Golf fairway panoramic
    "https://images.unsplash.com/photo-1592919505780-303950717480?w=900&q=80", // Golf player on course
    "https://images.unsplash.com/photo-1530028828-5e3e-4bd4-b7cc-ee0c85e29a32?w=900&q=80", // Golf club sunset
  ],
};

const GRADIENTS = {
  football:   "linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)",
  basketball: "linear-gradient(135deg, #431407 0%, #c2410c 100%)",
  tennis:     "linear-gradient(135deg, #052e16 0%, #15803d 100%)",
  padel:      "linear-gradient(135deg, #2e1065 0%, #7c3aed 100%)",
  futsal:     "linear-gradient(135deg, #042f2e 0%, #0f766e 100%)",
  f1:         "linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)",
  golf:       "linear-gradient(135deg, #052e16 0%, #15803d 100%)",
};

// Choisit une image Unsplash stable basée sur le slug (pas aléatoire à chaque render)
function pickUnsplash(league, sport, slug = "") {
  const pool = IMGS[league] || IMGS[sport] || IMGS.football;
  const idx = slug.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % pool.length;
  return pool[idx];
}

export default function ArticleImage({ src, imageUrl, alt, sport, league, slug, style }) {
  const gradient = GRADIENTS[sport] || GRADIENTS.football;

  // Si src pointe vers /generated/ (non-existant), on ignore et on prend Unsplash directement
  const isGenerated = typeof src === "string" && src.startsWith("/generated/");
  const primarySrc = isGenerated
    ? (imageUrl || pickUnsplash(league, sport, slug))
    : (src || imageUrl || pickUnsplash(league, sport, slug));

  const fallbackSrc = pickUnsplash(league, sport, slug);

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
          el.src = el.src !== fallbackSrc ? fallbackSrc : "";
          if (!el.src) el.style.display = "none";
        }}
      />
    </div>
  );
}
