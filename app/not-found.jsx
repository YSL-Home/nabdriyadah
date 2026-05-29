import Link from "next/link";

export const metadata = {
  title: "404 | نبض الرياضة",
};

export default function NotFound() {
  return (
    <main
      style={{
        direction: "rtl",
        textAlign: "center",
        maxWidth: "600px",
        margin: "auto",
        padding: "80px 24px",
      }}
    >
      <h1 style={{ fontSize: "32px", fontWeight: "bold" }}>
        404 - الصفحة غير موجودة
      </h1>
      <p>عذراً، الصفحة التي تبحث عنها غير متوفرة.</p>
      <nav style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "8px", alignItems: "center" }}>
        <Link href="/" style={{ color: "var(--accent)" }}>الرئيسية</Link>
        <Link href="/articles/" style={{ color: "var(--accent)" }}>المقالات</Link>
        <Link href="/sport/football/" style={{ color: "var(--accent)" }}>كرة القدم</Link>
        <Link href="/live/" style={{ color: "var(--accent)" }}>نتائج مباشرة</Link>
      </nav>
    </main>
  );
}
