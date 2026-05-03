"use client";

/**
 * ArticleImage — Smart image picker
 * Priority: imageUrl (from RSS/OG) → large Unsplash action pool → gradient bg
 * Uses slug hash + title hash for maximum variety (80+ images per sport)
 */

// ── Large, high-quality action image pools ────────────────────────────────
const IMGS = {
  "premier-league": [
    "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=900&q=85",
    "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=900&q=85",
    "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=900&q=85",
    "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=900&q=85",
    "https://images.unsplash.com/photo-1471295253337-3ceaaedca402?w=900&q=85",
    "https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?w=900&q=85",
    "https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=900&q=85",
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=900&q=85",
    "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=900&q=85",
    "https://images.unsplash.com/photo-1551958219-acbc630e2914?w=900&q=85",
    "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=900&q=85",
    "https://images.unsplash.com/photo-1511886929837-354d827aae26?w=900&q=85",
    "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=900&q=85",
    "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=900&q=85",
    "https://images.unsplash.com/photo-1529926706528-db9e5010cd8e?w=900&q=85",
    "https://images.unsplash.com/photo-1607827448387-a67db1383b20?w=900&q=85",
    "https://images.unsplash.com/photo-1592659762303-90081d34b277?w=900&q=85",
    "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=900&q=85",
  ],
  "la-liga": [
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=900&q=85",
    "https://images.unsplash.com/photo-1551958219-acbc630e2914?w=900&q=85",
    "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=900&q=85",
    "https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=900&q=85",
    "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=900&q=85",
    "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=900&q=85",
    "https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=900&q=85",
    "https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?w=900&q=85",
    "https://images.unsplash.com/photo-1471295253337-3ceaaedca402?w=900&q=85",
    "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=900&q=85",
    "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=900&q=85",
    "https://images.unsplash.com/photo-1529926706528-db9e5010cd8e?w=900&q=85",
  ],
  "bundesliga": [
    "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=900&q=85",
    "https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?w=900&q=85",
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=900&q=85",
    "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=900&q=85",
    "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=900&q=85",
    "https://images.unsplash.com/photo-1607827448387-a67db1383b20?w=900&q=85",
    "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=900&q=85",
    "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=900&q=85",
    "https://images.unsplash.com/photo-1511886929837-354d827aae26?w=900&q=85",
    "https://images.unsplash.com/photo-1471295253337-3ceaaedca402?w=900&q=85",
  ],
  "serie-a": [
    "https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=900&q=85",
    "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=900&q=85",
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=900&q=85",
    "https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=900&q=85",
    "https://images.unsplash.com/photo-1551958219-acbc630e2914?w=900&q=85",
    "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=900&q=85",
    "https://images.unsplash.com/photo-1514667747639-a18eb4c7c0ea?w=900&q=85",
    "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=900&q=85",
    "https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=900&q=85",
    "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=900&q=85",
  ],
  "ligue-1": [
    "https://images.unsplash.com/photo-1552667466-07770ae110d0?w=900&q=85",
    "https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=900&q=85",
    "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=900&q=85",
    "https://images.unsplash.com/photo-1529926706528-db9e5010cd8e?w=900&q=85",
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=900&q=85",
    "https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=900&q=85",
    "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=900&q=85",
    "https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?w=900&q=85",
    "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=900&q=85",
    "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=900&q=85",
  ],
  "champions-league": [
    "https://images.unsplash.com/photo-1608831540955-35094d48694a?w=900&q=85",
    "https://images.unsplash.com/photo-1562552052-d5fa6f3c12ff?w=900&q=85",
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=900&q=85",
    "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=900&q=85",
    "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=900&q=85",
    "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=900&q=85",
    "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=900&q=85",
    "https://images.unsplash.com/photo-1511886929837-354d827aae26?w=900&q=85",
    "https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=900&q=85",
    "https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=900&q=85",
    "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=900&q=85",
    "https://images.unsplash.com/photo-1471295253337-3ceaaedca402?w=900&q=85",
  ],
  "saudi-pro-league": [
    "https://images.unsplash.com/photo-1620472478041-3c7984cc3ef4?w=900&q=85",
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=900&q=85",
    "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=900&q=85",
    "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=900&q=85",
    "https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=900&q=85",
    "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=900&q=85",
    "https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?w=900&q=85",
    "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=900&q=85",
  ],
  "eredivisie": [
    "https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=900&q=85",
    "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=900&q=85",
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=900&q=85",
    "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=900&q=85",
    "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=900&q=85",
    "https://images.unsplash.com/photo-1471295253337-3ceaaedca402?w=900&q=85",
  ],
  "mls": [
    "https://images.unsplash.com/photo-1529926706528-db9e5010cd8e?w=900&q=85",
    "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=900&q=85",
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=900&q=85",
    "https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=900&q=85",
    "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=900&q=85",
  ],
  basketball: [
    "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=900&q=85",
    "https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=900&q=85",
    "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=900&q=85",
    "https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=900&q=85",
    "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=900&q=85",
    "https://images.unsplash.com/photo-1577741314755-048d8525d31e?w=900&q=85",
    "https://images.unsplash.com/photo-1461897104016-0b3b00cc81ee?w=900&q=85",
    "https://images.unsplash.com/photo-1608245449230-4ac19066d2d0?w=900&q=85",
    "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=900&q=85",
    "https://images.unsplash.com/photo-1518003988-9499517da9c6?w=900&q=85",
    "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=900&q=85",
    "https://images.unsplash.com/photo-1560088824-1a44fcc7e60c?w=900&q=85",
    "https://images.unsplash.com/photo-1616051662975-f7839a3de3e2?w=900&q=85",
    "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=900&q=85",
    "https://images.unsplash.com/photo-1570498839593-e565b39455fc?w=900&q=85",
  ],
  tennis: [
    "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=900&q=85",
    "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=900&q=85",
    "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=900&q=85",
    "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=900&q=85",
    "https://images.unsplash.com/photo-1617691614625-57267b4c60c1?w=900&q=85",
    "https://images.unsplash.com/photo-1542144582-1ba00456b5e3?w=900&q=85",
    "https://images.unsplash.com/photo-1533155475-73c2c09bd7ae?w=900&q=85",
    "https://images.unsplash.com/photo-1611459615252-a4c23ba5e985?w=900&q=85",
    "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=900&q=85",
    "https://images.unsplash.com/photo-1530915534664-4ac6423a5b5f?w=900&q=85",
    "https://images.unsplash.com/photo-1568871734932-b6ef21e82b61?w=900&q=85",
    "https://images.unsplash.com/photo-1607166452427-7e4477079cb9?w=900&q=85",
  ],
  padel: [
    "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=900&q=85",
    "https://images.unsplash.com/photo-1529926706528-db9e5010cd8e?w=900&q=85",
    "https://images.unsplash.com/photo-1611459615252-a4c23ba5e985?w=900&q=85",
    "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=900&q=85",
    "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=900&q=85",
    "https://images.unsplash.com/photo-1617691614625-57267b4c60c1?w=900&q=85",
    "https://images.unsplash.com/photo-1542144582-1ba00456b5e3?w=900&q=85",
    "https://images.unsplash.com/photo-1530915534664-4ac6423a5b5f?w=900&q=85",
  ],
  futsal: [
    "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=900&q=85",
    "https://images.unsplash.com/photo-1552318965-6e6be7484ada?w=900&q=85",
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=900&q=85",
    "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=900&q=85",
    "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=900&q=85",
    "https://images.unsplash.com/photo-1529926706528-db9e5010cd8e?w=900&q=85",
  ],
  // Generic football — large pool for maximum variety
  football: [
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=900&q=85",
    "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=900&q=85",
    "https://images.unsplash.com/photo-1511886929837-354d827aae26?w=900&q=85",
    "https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=900&q=85",
    "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=900&q=85",
    "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=900&q=85",
    "https://images.unsplash.com/photo-1471295253337-3ceaaedca402?w=900&q=85",
    "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=900&q=85",
    "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=900&q=85",
    "https://images.unsplash.com/photo-1608831540955-35094d48694a?w=900&q=85",
    "https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=900&q=85",
    "https://images.unsplash.com/photo-1607827448387-a67db1383b20?w=900&q=85",
    "https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?w=900&q=85",
    "https://images.unsplash.com/photo-1529926706528-db9e5010cd8e?w=900&q=85",
    "https://images.unsplash.com/photo-1592659762303-90081d34b277?w=900&q=85",
    "https://images.unsplash.com/photo-1551958219-acbc630e2914?w=900&q=85",
    "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=900&q=85",
    "https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?w=900&q=85",
    "https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=900&q=85",
    "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=900&q=85",
    "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=900&q=85",
    "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=900&q=85",
    "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=900&q=85",
    "https://images.unsplash.com/photo-1562552052-d5fa6f3c12ff?w=900&q=85",
    "https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=900&q=85",
    "https://images.unsplash.com/photo-1552667466-07770ae110d0?w=900&q=85",
    "https://images.unsplash.com/photo-1620472478041-3c7984cc3ef4?w=900&q=85",
    "https://images.unsplash.com/photo-1514667747639-a18eb4c7c0ea?w=900&q=85",
  ],
};

// ── Gradient backgrounds (fallback when image fails) ──────────────────────
const GRADIENTS = {
  "premier-league":   "linear-gradient(135deg, #3b0764 0%, #7c3aed 100%)",
  "la-liga":          "linear-gradient(135deg, #9a3412 0%, #f97316 100%)",
  "bundesliga":       "linear-gradient(135deg, #1a1a1a 0%, #dc2626 100%)",
  "serie-a":          "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
  "ligue-1":          "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)",
  "champions-league": "linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%)",
  "saudi-pro-league": "linear-gradient(135deg, #14532d 0%, #16a34a 100%)",
  "eredivisie":       "linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)",
  "mls":              "linear-gradient(135deg, #1e3a8a 0%, #dc2626 100%)",
  football:           "linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)",
  basketball:         "linear-gradient(135deg, #431407 0%, #c2410c 100%)",
  tennis:             "linear-gradient(135deg, #052e16 0%, #15803d 100%)",
  padel:              "linear-gradient(135deg, #2e1065 0%, #7c3aed 100%)",
  futsal:             "linear-gradient(135deg, #042f2e 0%, #0f766e 100%)",
};

// ── Deterministic hash combining slug + title for maximum variety ─────────
function stableHash(slug = "", title = "") {
  const str = slug + "|" + title.slice(0, 20);
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) ^ str.charCodeAt(i);
    h = h >>> 0;
  }
  return h;
}

function pickImage(league, sport, slug, title = "") {
  const pool = IMGS[league] || IMGS[sport] || IMGS.football;
  const idx = stableHash(slug, title) % pool.length;
  return pool[idx];
}

// ── Component ─────────────────────────────────────────────────────────────
export default function ArticleImage({ src, imageUrl, alt, sport, league, slug, style }) {
  const gradient = GRADIENTS[league] || GRADIENTS[sport] || GRADIENTS.football;
  const fallback = pickImage(league, sport, slug, alt);

  // Determine primary source:
  // 1. imageUrl from RSS (actual article image) — best option
  // 2. src if not a local /generated/ path
  // 3. Unsplash fallback based on slug+title hash
  const isGenerated = typeof src === "string" && src.startsWith("/generated/");
  const primary = imageUrl || (!isGenerated && src) || fallback;

  return (
    <div style={{ position: "relative", overflow: "hidden", background: gradient, ...style }}>
      <img
        src={primary}
        alt={alt || ""}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          position: "absolute",
          inset: 0,
        }}
        loading="lazy"
        onError={e => {
          const el = e.currentTarget;
          if (el.dataset.fallbackTried) { el.style.display = "none"; return; }
          el.dataset.fallbackTried = "1";
          if (el.src !== fallback) {
            el.src = fallback;
          } else {
            el.style.display = "none";
          }
        }}
      />
    </div>
  );
}
