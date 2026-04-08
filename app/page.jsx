export const metadata = {
  title: "نبض الرياضة | أخبار رياضية لحظة بلحظة",
  description: "موقع رياضي عربي حديث للأخبار والمباريات المباشرة",
};

export default function Page() {
  return (
    <main style={{ padding: "40px", fontFamily: "system-ui" }}>
      
      {/* HEADER */}
      <div style={{
        background: "linear-gradient(135deg,#2563eb,#7c3aed)",
        color: "white",
        padding: "40px",
        borderRadius: "20px",
        textAlign: "center"
      }}>
        <h1 style={{ fontSize: "40px", margin: 0 }}>نبض الرياضة</h1>
        <p>أخبار - مباشر - فيديو - تحليلات</p>
      </div>

      {/* NEWS */}
      <section style={{ marginTop: "40px" }}>
        <h2>🔥 أهم الأخبار</h2>

        <div style={{ display: "grid", gap: "20px" }}>
          
          <div style={{ background: "white", padding: "20px", borderRadius: "15px" }}>
            <h3>برشلونة يفوز على ريال مدريد في الكلاسيكو</h3>
            <p>نتيجة مثيرة تشعل محركات البحث حول العالم</p>
          </div>

          <div style={{ background: "white", padding: "20px", borderRadius: "15px" }}>
            <h3>الهلال ضد النصر: نتيجة مباشرة</h3>
            <p>متابعة لحظية لأقوى مباراة في الدوري السعودي</p>
          </div>

          <div style={{ background: "white", padding: "20px", borderRadius: "15px" }}>
            <h3>بطولة جديدة في البادل تنطلق</h3>
            <p>اهتمام متزايد برياضة البادل في العالم العربي</p>
          </div>

        </div>
      </section>

      {/* LIVE MATCH */}
      <section style={{ marginTop: "40px" }}>
        <h2>🔴 المباريات المباشرة</h2>

        <div style={{ display: "grid", gap: "20px" }}>

          <div style={{ background: "white", padding: "20px", borderRadius: "15px" }}>
            <h3>برشلونة vs ريال مدريد</h3>
            <p style={{ fontSize: "24px", fontWeight: "bold" }}>2 - 1</p>
            <p>الدقيقة 88</p>
          </div>

          <div style={{ background: "white", padding: "20px", borderRadius: "15px" }}>
            <h3>الهلال vs النصر</h3>
            <p style={{ fontSize: "24px", fontWeight: "bold" }}>1 - 2</p>
            <p>الدقيقة 72</p>
          </div>

        </div>
      </section>

      {/* CATEGORIES */}
      <section style={{ marginTop: "40px" }}>
        <h2>📊 الأقسام</h2>

        <div style={{ display: "grid", gap: "15px", gridTemplateColumns: "repeat(2,1fr)" }}>
          <div style={{ background: "white", padding: "20px", borderRadius: "15px" }}>أخبار عالمية</div>
          <div style={{ background: "white", padding: "20px", borderRadius: "15px" }}>الدوريات العربية</div>
          <div style={{ background: "white", padding: "20px", borderRadius: "15px" }}>المنتخبات</div>
          <div style={{ background: "white", padding: "20px", borderRadius: "15px" }}>الانتقالات</div>
          <div style={{ background: "white", padding: "20px", borderRadius: "15px" }}>كرة السلة</div>
          <div style={{ background: "white", padding: "20px", borderRadius: "15px" }}>التنس</div>
          <div style={{ background: "white", padding: "20px", borderRadius: "15px" }}>البادل</div>
        </div>
      </section>

    </main>
  );
}
