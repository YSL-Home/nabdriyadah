import Link from "next/link";
import registry from "../../../content/players-registry.json";
import playerPhotos from "../../../content/player-photos.json";

export function generateStaticParams() {
  return Object.keys(registry).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const p = registry[params.slug];
  if (!p) return {};
  return {
    title: `${p.nameAr} — ${p.teamNameAr} | نبض الرياضة`,
    description: `صفحة ${p.nameAr} من نادي ${p.teamNameAr}`,
  };
}

function typeLabel(type) {
  if (type === "player") return "لاعب";
  if (type === "legend") return "أسطورة النادي";
  if (type === "staff") return "جهاز فني";
  return type;
}

function typeBadgeColor(type) {
  if (type === "player") return { bg: "#dbeafe", color: "#1d4ed8" };
  if (type === "legend") return { bg: "#fef3c7", color: "#d97706" };
  if (type === "staff") return { bg: "#f3f4f6", color: "#374151" };
  return { bg: "#f3f4f6", color: "#374151" };
}

export default function PlayerPage({ params }) {
  const p = registry[params.slug];
  if (!p) return <div style={{ padding: "60px", textAlign: "center", direction: "rtl" }}>اللاعب غير موجود</div>;

  const photoKey = `${p.teamSlug}/${p.type}/${p.index}`;
  const photo = playerPhotos[photoKey] || null;
  const badgeStyle = typeBadgeColor(p.type);
  const accent = p.accent || "#6366f1";

  const accentRgb = accent;

  return (
    <main style={{ minHeight: "100vh", background: "#f3f4f6", direction: "rtl" }}>

      {/* Hero */}
      <section style={{
        background: `linear-gradient(135deg, #0f172a, ${accent})`,
        padding: "52px 24px 80px",
        color: "white",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Decorative blob */}
        <div style={{ position: "absolute", top: "-80px", left: "-80px", width: "320px", height: "320px", borderRadius: "50%", background: `${accent}30`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-60px", right: "10%", width: "220px", height: "220px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />

        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          {/* Breadcrumb */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "28px", fontSize: "13px", opacity: 0.8, flexWrap: "wrap" }}>
            <Link href="/" style={{ color: "white", textDecoration: "none", opacity: 0.75 }}>الرئيسية</Link>
            <span>›</span>
            <Link href={p.leagueUrl || "/sport/football/"} style={{ color: "white", textDecoration: "none", opacity: 0.75 }}>{p.leagueName}</Link>
            <span>›</span>
            <Link href={`/team/${p.teamSlug}/`} style={{ color: "white", textDecoration: "none", opacity: 0.75 }}>{p.teamNameAr}</Link>
            <span>›</span>
            <span>{p.nameAr}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "32px", flexWrap: "wrap" }}>
            {/* Photo */}
            <div style={{
              width: "140px", height: "140px", borderRadius: "50%",
              overflow: "hidden", flexShrink: 0,
              border: "4px solid rgba(255,255,255,0.3)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
              background: `${accent}40`,
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              {photo ? (
                <img src={photo} alt={p.nameAr} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <svg width="72" height="72" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4.5" fill="rgba(255,255,255,0.75)" />
                  <path d="M3.5 20.5c0-4.694 3.806-8.5 8.5-8.5s8.5 3.806 8.5 8.5" stroke="rgba(255,255,255,0.75)" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: "200px" }}>
              <div style={{
                display: "inline-block",
                background: badgeStyle.bg, color: badgeStyle.color,
                padding: "5px 14px", borderRadius: "999px",
                fontSize: "12px", fontWeight: 800, marginBottom: "12px"
              }}>
                {typeLabel(p.type)}
              </div>
              <h1 style={{ margin: "0 0 8px", fontSize: "42px", fontWeight: 900, lineHeight: 1.1 }}>{p.nameAr}</h1>
              <Link href={`/team/${p.teamSlug}/`} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
                {p.teamLogo && (
                  <img src={p.teamLogo} alt={p.teamNameAr} style={{ width: "32px", height: "32px", objectFit: "contain", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }} />
                )}
                <span style={{ fontSize: "18px", fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>{p.teamNameAr}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div style={{ maxWidth: "900px", margin: "-36px auto 0", padding: "0 20px 60px", position: "relative" }}>

        {/* Quick stats card */}
        <section style={{
          background: "white", borderRadius: "24px", padding: "28px",
          boxShadow: "0 12px 36px rgba(0,0,0,0.08)",
          border: `1px solid ${accent}30`,
          marginBottom: "22px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            <div style={{ width: "5px", height: "30px", borderRadius: "999px", background: accent }} />
            <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 800 }}>معلومات</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "14px" }}>
            <div style={{ background: "#f9fafb", borderRadius: "14px", padding: "14px 16px", border: "1px solid #e5e7eb" }}>
              <div style={{ fontSize: "11px", color: "#9ca3af", fontWeight: 700, marginBottom: "6px" }}>الصفة</div>
              <div style={{ fontSize: "16px", fontWeight: 800, color: "#111827" }}>{typeLabel(p.type)}</div>
            </div>
            <div style={{ background: "#f9fafb", borderRadius: "14px", padding: "14px 16px", border: "1px solid #e5e7eb" }}>
              <div style={{ fontSize: "11px", color: "#9ca3af", fontWeight: 700, marginBottom: "6px" }}>النادي</div>
              <div style={{ fontSize: "16px", fontWeight: 800, color: "#111827" }}>{p.teamNameAr}</div>
            </div>
            <div style={{ background: "#f9fafb", borderRadius: "14px", padding: "14px 16px", border: "1px solid #e5e7eb" }}>
              <div style={{ fontSize: "11px", color: "#9ca3af", fontWeight: 700, marginBottom: "6px" }}>البطولة</div>
              <div style={{ fontSize: "16px", fontWeight: 800, color: "#111827" }}>{p.leagueName}</div>
            </div>
          </div>
        </section>

        {/* Back to team */}
        <section style={{ background: "white", borderRadius: "20px", padding: "22px 26px", boxShadow: "0 4px 14px rgba(0,0,0,0.04)", border: "1px solid #e5e7eb" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              {p.teamLogo && <img src={p.teamLogo} alt={p.teamNameAr} style={{ width: "48px", height: "48px", objectFit: "contain" }} />}
              <div>
                <div style={{ fontSize: "12px", color: "#9ca3af", fontWeight: 700, marginBottom: "2px" }}>ينتمي إلى</div>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "#111827" }}>{p.teamNameAr}</div>
              </div>
            </div>
            <Link href={`/team/${p.teamSlug}/`}
              style={{ textDecoration: "none", background: accent, color: "white", padding: "11px 22px", borderRadius: "999px", fontWeight: 800, fontSize: "14px" }}>
              صفحة النادي ←
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
