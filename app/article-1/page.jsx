import Link from "next/link";

export default function ArticleOnePage() {
  return (
    <main style={{ minHeight: "100vh", background: "#f3f4f6", padding: "40px 20px", direction: "rtl", fontFamily: "Arial, sans-serif" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <Link href="/" style={{ color: "#2563eb", textDecoration: "none", fontWeight: 700, display: "inline-block", marginBottom: "20px" }}>
          العودة إلى الرئيسية
        </Link>

        <article style={{ background: "white", borderRadius: "20px", padding: "30px", border: "1px solid #e5e7eb" }}>
          <h1 style={{ fontSize: "42px", marginTop: 0 }}>المقال الأول</h1>
          <p style={{ fontSize: "22px", lineHeight: 2 }}>
            هذه صفحة اختبار ثابتة للمقال الأول.
          </p>
        </article>
      </div>
    </main>
  );
}
