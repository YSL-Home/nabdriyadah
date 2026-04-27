"use client";

const GRADIENTS = {
  football: "linear-gradient(135deg, #0f172a, #1d4ed8)",
  basketball: "linear-gradient(135deg, #431407, #c2410c)",
  tennis: "linear-gradient(135deg, #052e16, #15803d)",
  padel: "linear-gradient(135deg, #2e1065, #7c3aed)",
  futsal: "linear-gradient(135deg, #042f2e, #0f766e)",
};

export default function ArticleImage({ src, alt, sport, style }) {
  const fallback = GRADIENTS[sport] || GRADIENTS.football;
  return (
    <div style={{ position: "relative", overflow: "hidden", background: fallback, ...style }}>
      <img
        src={src}
        alt={alt}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", position: "absolute", inset: 0 }}
        onError={e => { e.currentTarget.style.display = "none"; }}
      />
    </div>
  );
}
