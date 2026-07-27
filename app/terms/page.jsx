export const metadata = {
  title: "شروط الاستخدام | نبض الرياضة",
  description: "شروط وأحكام استخدام موقع نبض الرياضة — الحقوق والمسؤوليات والقيود.",
  alternates: { canonical: "https://nabdriyadah.com/terms/" }
};

export default function TermsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-page)", padding: "40px 20px 80px", direction: "rtl" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>

        <h1 style={{ fontSize: "clamp(26px,5vw,40px)", fontWeight: 900, color: "var(--text-1)", marginBottom: "8px" }}>
          شروط الاستخدام
        </h1>
        <p style={{ color: "var(--text-3)", fontSize: "14px", marginBottom: "40px" }}>
          آخر تحديث: يوليو 2026
        </p>

        {[
          {
            title: "١. قبول الشروط",
            body: `باستخدامك لموقع نبض الرياضة (nabdriyadah.com)، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي من هذه الشروط، يُرجى الامتناع عن استخدام الموقع.`
          },
          {
            title: "٢. طبيعة المحتوى",
            body: `يُقدّم موقع نبض الرياضة محتوى إخبارياً رياضياً للأغراض الإعلامية العامة. نسعى جاهدين للتحقق من دقة المعلومات المنشورة، غير أننا لا نضمن اكتمالها أو خلوّها من الأخطاء في جميع الأوقات. في حال اكتشاف خطأ، يُرجى إبلاغنا عبر صفحة الاتصال.`
          },
          {
            title: "٣. حقوق الملكية الفكرية",
            body: `جميع المحتويات المنشورة على هذا الموقع — بما فيها النصوص والصور والشعارات والتصاميم — هي ملك لموقع نبض الرياضة أو مرخّصة من أصحابها. يُحظر نسخ المحتوى أو إعادة نشره أو توزيعه دون إذن كتابي مسبق.`
          },
          {
            title: "٤. الاستخدام المقبول",
            body: `يُسمح باستخدام الموقع للأغراض الشخصية غير التجارية فقط. يُحظر استخدام الموقع لأغراض غير قانونية، أو نشر محتوى مسيء، أو محاولة اختراق أنظمة الموقع، أو التأثير على أدائه بأي طريقة.`
          },
          {
            title: "٥. الروابط الخارجية",
            body: `قد يتضمن الموقع روابط لمواقع خارجية. هذه الروابط مُدرجة لتسهيل التنقل وليس إقراراً بمحتواها. لا نتحمل أي مسؤولية عن محتوى المواقع المرتبطة أو سياساتها.`
          },
          {
            title: "٦. الإعلانات",
            body: `يعرض الموقع إعلانات عبر Google AdSense. هذه الإعلانات يتحكم فيها طرف ثالث (Google) ولا يتحمل الموقع مسؤولية مضمونها. يمكنك إدارة تفضيلات الإعلانات من إعدادات حسابك في Google.`
          },
          {
            title: "٧. إخلاء المسؤولية",
            body: `يُقدَّم الموقع "كما هو" دون أي ضمانات صريحة أو ضمنية. لا يتحمل الموقع المسؤولية عن أي أضرار ناجمة عن استخدام المعلومات المنشورة أو عدم توفرها.`
          },
          {
            title: "٨. التعديلات",
            body: `نحتفظ بحق تعديل هذه الشروط في أي وقت دون إشعار مسبق. يُعدّ استمرارك في استخدام الموقع بعد نشر التعديلات قبولاً ضمنياً لها.`
          },
          {
            title: "٩. القانون المطبّق",
            body: `تخضع هذه الشروط للقوانين المغربية المعمول بها. في حال نشوء أي نزاع، تكون المحاكم المغربية المختصة بالنظر فيه.`
          },
          {
            title: "١٠. التواصل",
            body: `لأي استفسار حول هذه الشروط، يُرجى التواصل معنا عبر صفحة الاتصال أو على البريد الإلكتروني: contact@nabdriyadah.com`
          },
        ].map(({ title, body }) => (
          <section key={title} style={{
            background: "var(--bg-card)", borderRadius: "20px", padding: "28px 32px",
            border: "1px solid var(--border)", marginBottom: "20px",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)"
          }}>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-1)", marginBottom: "12px" }}>
              {title}
            </h2>
            <p style={{ fontSize: "16px", color: "var(--text-2)", lineHeight: 1.85, margin: 0 }}>
              {body}
            </p>
          </section>
        ))}

        <p style={{ textAlign: "center", color: "var(--text-3)", fontSize: "13px", marginTop: "40px" }}>
          نبض الرياضة · nabdriyadah.com
        </p>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "شروط الاستخدام",
          "url": "https://nabdriyadah.com/terms/",
          "publisher": { "@type": "Person", "name": "lahucef" }
        })}} />
      </div>
    </main>
  );
}
