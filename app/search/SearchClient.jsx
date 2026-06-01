"use client";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import Link from "next/link";
import articles from "../../content/articles/seo-articles.json";
import ArticleImage from "../components/ArticleImage";

/* ── Helpers ──────────────────────────────────────────── */
function fmtDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("ar-SA-u-nu-latn", {
      day: "numeric", month: "short", year: "numeric",
    });
  } catch { return ""; }
}

const LEAGUE_LABELS = {
  "premier-league": "الإنجليزي",
  "la-liga": "الإسباني",
  "bundesliga": "البوندسليغا",
  "serie-a": "السيريا آ",
  "ligue-1": "الليغ 1",
  "champions-league": "أبطال أوروبا",
  "saudi-pro-league": "السعودي",
  "eredivisie": "الهولندي",
  "mixed": "مختلطة",
};

const LEAGUE_ACCENT = {
  "premier-league": "#7c3aed",
  "la-liga": "#ea580c",
  "bundesliga": "#dc2626",
  "serie-a": "#b45309",
  "ligue-1": "#1d4ed8",
  "champions-league": "#d97706",
  "saudi-pro-league": "#15803d",
  "eredivisie": "#b91c1c",
  football: "#2563eb",
  basketball: "#c2410c",
  tennis: "#15803d",
  padel: "#7c3aed",
  futsal: "#0f766e",
};

/* ── Article card (minimal, inline) ──────────────────── */
function ArticleCard({ a }) {
  const accent = LEAGUE_ACCENT[a.league] || LEAGUE_ACCENT[a.sport] || "#4f8eff";
  return (
    <Link href={`/articles/${a.slug}/`} style={{ textDecoration: "none", display: "block" }}>
      <article
        className="card-hover"
        style={{
          background: "var(--bg-card)", borderRadius: "18px", overflow: "hidden",
          border: "1px solid var(--border)", boxShadow: "var(--shadow)",
          height: "100%", transition: "transform 0.2s, box-shadow 0.2s",
        }}
      >
        <ArticleImage
          src={a.image} imageUrl={a.imageUrl} alt={a.title}
          sport={a.sport} league={a.league} slug={a.slug}
          style={{ height: "175px", display: "block" }}
        />
        <div style={{ padding: "14px 16px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
            <span style={{
              padding: "4px 10px", borderRadius: "999px",
              background: accent + "20", color: accent,
              fontSize: "11px", fontWeight: 700,
              border: `1px solid ${accent}33`,
            }}>
              {LEAGUE_LABELS[a.league] || a.sport}
            </span>
            {a.publishedAt && (
              <span style={{ color: "var(--text-3)", fontSize: "11px" }}>
                🕐 {fmtDate(a.publishedAt)}
              </span>
            )}
          </div>
          <h3 style={{
            margin: "0 0 7px", fontSize: "15px", fontWeight: 800,
            color: "var(--text-1)", lineHeight: 1.55,
            display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {a.title}
          </h3>
          <p style={{
            margin: 0, fontSize: "13px", color: "var(--text-2)", lineHeight: 1.65,
            display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {a.description}
          </p>
        </div>
      </article>
    </Link>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════════════════ */
export default function SearchClient() {
  const params = useSearchParams();
  const q = (params.get("q") || "").trim();

  const results = useMemo(() => {
    if (!q) return [];
    const kw = q.toLowerCase();
    return articles.filter(a => {
      const haystack = [
        a.title,
        a.content,
        a.description,
        a.sourceTitle,
        ...(a.topicTags || []),
        ...(a.keywords || []),
      ].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(kw);
    });
  }, [q]);

  return (
    <div style={{ direction: "rtl" }}>
      <h1 style={{ fontSize: "clamp(20px, 4vw, 28px)", fontWeight: 800, marginBottom: 8 }}>
        البحث
      </h1>

      {!q ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-3)" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>🔍</div>
          <p style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>اكتب كلمة للبحث</p>
        </div>
      ) : results.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-3)" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>😔</div>
          <p style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>
            لا توجد نتائج لـ: <span style={{ color: "var(--text-1)" }}>{q}</span>
          </p>
        </div>
      ) : (
        <>
          <p style={{ color: "var(--text-3)", fontSize: "14px", marginBottom: "24px" }}>
            <strong style={{ color: "var(--text-1)" }}>{results.length}</strong> نتيجة لـ:{" "}
            <strong style={{ color: "var(--accent)" }}>{q}</strong>
          </p>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "20px",
          }}>
            {results.map(a => <ArticleCard key={a.slug} a={a} />)}
          </div>
        </>
      )}
    </div>
  );
}
