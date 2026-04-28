"use client";

// Images Unsplash par ligue / sport — chargement immédiat, pas de fichier local requis
const IMGS = {
  "premier-league": [
    "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=900&q=80",
    "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=900&q=80",
    "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=900&q=80",
  ],
  "la-liga": [
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=900&q=80",
    "https://images.unsplash.com/photo-1551958219-acbc630e2914?w=900&q=80",
    "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=900&q=80",
  ],
  "bundesliga": [
    "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=900&q=80",
    "https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?w=900&q=80",
  ],
  "serie-a": [
    "https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=900&q=80",
    "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=900&q=80",
  ],
  "ligue-1": [
    "https://images.unsplash.com/photo-1552667466-07770ae110d0?w=900&q=80",
    "https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=900&q=80",
  ],
  "champions-league": [
    "https://images.unsplash.com/photo-1608831540955-35094d48694a?w=900&q=80",
    "https://images.unsplash.com/photo-1562552052-d5fa6f3c12ff?w=900&q=80",
  ],
  "saudi-pro-league": [
    "https://images.unsplash.com/photo-1620472478041-3c7984cc3ef4?w=900&q=80",
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=900&q=80",
  ],
  basketball: [
    "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=900&q=80",
    "https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=900&q=80",
    "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=900&q=80",
  ],
  tennis: [
    "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=900&q=80",
    "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=900&q=80",
    "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=900&q=80",
  ],
  padel: [
    "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=900&q=80",
    "https://images.unsplash.com/photo-1529926706528-db9e5010cd8e?w=900&q=80",
  ],
  futsal: [
    "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=900&q=80",
    "https://images.unsplash.com/photo-1552318965-6e6be7484ada?w=900&q=80",
  ],
  football: [
    "https://images.unsplash.com/photo-1552318965-6e6be7484ada?w=900&q=80",
    "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=900&q=80",
    "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=900&q=80",
    "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=900&q=80",
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
