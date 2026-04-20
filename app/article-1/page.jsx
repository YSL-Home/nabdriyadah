export default function Article1() {
  return (
    <main style={{ maxWidth: "900px", margin: "40px auto", padding: "20px" }}>
      
      <a href="/" style={{ color: "#2563eb", display: "block", marginBottom: "20px" }}>
        العودة إلى الرئيسية
      </a>

      <article style={{
        background: "#fff",
        borderRadius: "20px",
        padding: "30px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.05)"
      }}>

        <h1 style={{ fontSize: "32px", marginBottom: "20px" }}>
          المقال الأول
        </h1>

        <img 
          src="https://source.unsplash.com/1200x600/?football"
          style={{ width: "100%", borderRadius: "12px", marginBottom: "20px" }}
        />

        <p style={{ fontSize: "18px", lineHeight: "1.9" }}>
          هذه صفحة اختبار ثابتة للمقال الأول. سيتم استبدال هذا المحتوى لاحقًا
          بمحتوى ديناميكي قادم من نظام الذكاء الاصطناعي.
        </p>

      </article>

    </main>
  );
}
