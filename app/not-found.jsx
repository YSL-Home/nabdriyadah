import Link from "next/link";

export const metadata = {
  title: "404 | نبض الرياضة",
};

export default function NotFound() {
  return (
    <main
      style={{
        direction: "rtl",
        textAlign: "right",
        maxWidth: "600px",
        margin: "auto",
        padding: "60px 24px 80px",
      }}
    >
      <div style={{ fontSize: "64px", marginBottom: "16px", textAlign: "center" }}>⚽</div>

      <h1 style={{ fontSize: "clamp(24px, 5vw, 36px)", fontWeight: 900, textAlign: "center", marginBottom: "12px" }}>
        404 — الصفحة غير موجودة
      </h1>

      <p style={{ fontSize: "16px", lineHeight: 1.8, color: "var(--text-2)", textAlign: "center", marginBottom: "32px" }}>
        عذراً، الصفحة التي تبحث عنها غير متوفرة أو تم نقلها.
        يمكنك التنقل إلى إحدى الصفحات أدناه.
      </p>

      <nav
        aria-label="روابط مقترحة"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "12px",
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            minHeight: "52px",
            padding: "12px 16px",
            borderRadius: "12px",
            background: "var(--accent)",
            color: "white",
            fontWeight: 700,
            fontSize: "15px",
            textDecoration: "none",
            textAlign: "center",
          }}
        >
          🏠 الرئيسية
        </Link>

        <Link
          href="/articles/"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            minHeight: "52px",
            padding: "12px 16px",
            borderRadius: "12px",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            color: "var(--text-1)",
            fontWeight: 700,
            fontSize: "15px",
            textDecoration: "none",
            textAlign: "center",
          }}
        >
          📰 المقالات
        </Link>

        <Link
          href="/sport/football/"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            minHeight: "52px",
            padding: "12px 16px",
            borderRadius: "12px",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            color: "var(--text-1)",
            fontWeight: 700,
            fontSize: "15px",
            textDecoration: "none",
            textAlign: "center",
          }}
        >
          ⚽ كرة القدم
        </Link>

        <Link
          href="/live/"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            minHeight: "52px",
            padding: "12px 16px",
            borderRadius: "12px",
            background: "#fff0f0",
            border: "1px solid #fcc",
            color: "#c81e1e",
            fontWeight: 700,
            fontSize: "15px",
            textDecoration: "none",
            textAlign: "center",
          }}
        >
          🔴 نتائج مباشرة
        </Link>
      </nav>
    </main>
  );
}
