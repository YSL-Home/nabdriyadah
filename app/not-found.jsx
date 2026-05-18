import Link from "next/link";

export const metadata = {
  title: "الصفحة غير موجودة | نبض الرياضة",
  description: "الصفحة التي تبحث عنها غير موجودة."
};

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
        direction: "rtl",
        fontFamily: "var(--font-inter, 'Inter', 'Segoe UI', Arial, sans-serif)",
        padding: "20px"
      }}
    >
      <div
        style={{
          maxWidth: "500px",
          width: "100%",
          textAlign: "center"
        }}
      >
        <div style={{ fontSize: "96px", lineHeight: 1, marginBottom: "16px" }}>
          404
        </div>
        <h1
          style={{
            fontSize: "32px",
            fontWeight: 800,
            color: "#111827",
            margin: "0 0 12px 0"
          }}
        >
          الصفحة غير موجودة
        </h1>
        <p
          style={{
            fontSize: "18px",
            color: "#6b7280",
            lineHeight: 1.8,
            margin: "0 0 32px 0"
          }}
        >
          عذراً، الصفحة التي تبحث عنها غير موجودة أو ربما تم نقلها.
        </p>
        <Link
          href="/"
          style={{
            display: "inline-block",
            background: "#2563eb",
            color: "#ffffff",
            textDecoration: "none",
            padding: "14px 32px",
            borderRadius: "12px",
            fontSize: "16px",
            fontWeight: 700,
            transition: "background 0.2s"
          }}
        >
          العودة إلى الرئيسية
        </Link>
      </div>
    </main>
  );
}
