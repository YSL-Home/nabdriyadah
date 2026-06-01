export const metadata = {
  title: "سياسة الخصوصية | نبض الرياضة",
  description: "سياسة الخصوصية لموقع نبض الرياضة — كيفية جمع البيانات واستخدامها وحمايتها.",
  alternates: { canonical: "https://nabdriyadah.com/privacy/" }
};

export default function PrivacyPage() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-page)", padding: "40px 20px 80px", direction: "rtl" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>

        <h1 style={{ fontSize: "clamp(26px,5vw,40px)", fontWeight: 900, color: "var(--text-1)", marginBottom: "8px" }}>
          سياسة الخصوصية
        </h1>
        <p style={{ color: "var(--text-3)", fontSize: "14px", marginBottom: "40px" }}>
          آخر تحديث: مايو 2026
        </p>

        {[
          {
            title: "١. مقدمة",
            body: `يُرحّب بكم في موقع نبض الرياضة (nabdriyadah.com). نحن نحترم خصوصيتكم ونلتزم بحماية بياناتكم الشخصية. توضّح هذه السياسة كيفية جمع المعلومات عند زيارتكم للموقع واستخدامها والحفاظ عليها.`
          },
          {
            title: "٢. المعلومات التي نجمعها",
            body: `نجمع تلقائياً بعض المعلومات غير الشخصية عند زيارة الموقع، من بينها: عنوان IP، نوع المتصفح، الصفحات التي تمت زيارتها، ومدة الزيارة. لا نجمع أي معلومات تعريفية شخصية مباشرة كالاسم أو البريد الإلكتروني دون موافقتكم الصريحة.`
          },
          {
            title: "٣. ملفات تعريف الارتباط (Cookies)",
            body: `يستخدم الموقع ملفات تعريف الارتباط لتحسين تجربة التصفح وتحليل حركة الزيارات عبر Google Analytics. كما تستخدم شركة Google (AdSense) ملفات تعريف الارتباط لعرض إعلانات مخصّصة بناءً على زياراتكم السابقة. يمكنكم إيقاف هذه الملفات من إعدادات المتصفح في أي وقت.`
          },
          {
            title: "٤. الإعلانات",
            body: `يستخدم موقع نبض الرياضة Google AdSense لعرض الإعلانات. قد تستخدم Google بيانات الزيارات لعرض إعلانات تتوافق مع اهتماماتكم. لمزيد من المعلومات حول كيفية استخدام Google للبيانات، يرجى زيارة: policies.google.com/privacy`
          },
          {
            title: "٥. أطراف ثالثة",
            body: `قد يتضمن الموقع روابط لمواقع خارجية. لسنا مسؤولين عن سياسات الخصوصية الخاصة بتلك المواقع، وننصح بمراجعة سياساتها بشكل مستقل.`
          },
          {
            title: "٦. حماية البيانات",
            body: `نتخذ تدابير تقنية وإدارية معقولة لحماية المعلومات المجموعة من الوصول غير المصرّح به أو الإفصاح عنها.`
          },
          {
            title: "٧. حقوق المستخدمين",
            body: `يحق لكم طلب الاطلاع على البيانات التي قد نكون جمعناها عنكم، أو تصحيحها أو حذفها. للتواصل معنا بشأن أي استفسار يتعلق بالخصوصية، يرجى زيارة صفحة الاتصال.`
          },
          {
            title: "٨. التعديلات على هذه السياسة",
            body: `نحتفظ بحق تعديل هذه السياسة في أي وقت. ستُنشر التغييرات على هذه الصفحة مع تحديث تاريخ المراجعة. ننصح بمراجعة هذه الصفحة بصفة دورية.`
          }
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
          "name": "سياسة الخصوصية",
          "url": "https://nabdriyadah.com/privacy/"
        })}} />
      </div>
    </main>
  );
}
