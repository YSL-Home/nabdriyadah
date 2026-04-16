import Link from "next/link";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        padding: "40px 20px",
        direction: "rtl",
        fontFamily: "Arial, sans-serif"
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "56px", marginBottom: "20px" }}>نبض الرياضة</h1>
        <p style={{ fontSize: "22px", marginBottom: "30px" }}>
          اختبار روابط المقالات الثابتة
        </p>

        <div style={{ display: "grid", gap: "20px" }}>
          <Link
            href="/article-1/"
            style={{
              display: "block",
              background: "white",
              padding: "24px",
              borderRadius: "18px",
              border: "1px solid #e5e7eb",
              textDecoration: "none",
              color: "#111827",
              fontSize: "28px",
              fontWeight: "800"
            }}
          >
            المقال الأول
          </Link>

          <Link
            href="/article-2/"
            style={{
              display: "block",
              background: "white",
              padding: "24px",
              borderRadius: "18px",
              border: "1px solid #e5e7eb",
              textDecoration: "none",
              color: "#111827",
              fontSize: "28px",
              fontWeight: "800"
            }}
          >
            المقال الثاني
          </Link>
        </div>
      </div>
    </main>
  );
}
