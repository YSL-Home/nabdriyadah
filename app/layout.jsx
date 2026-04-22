export const metadata = {
  metadataBase: new URL("https://nabdriyadah.com"),
  title: {
    default: "نبض الرياضة",
    template: "%s | نبض الرياضة"
  },
  description:
    "نبض الرياضة موقع عربي للأخبار الرياضية يقدم تغطية يومية لأبرز مستجدات كرة القدم والدوريات الكبرى.",
  keywords: [
    "نبض الرياضة",
    "أخبار رياضية",
    "كرة القدم",
    "الدوري الإنجليزي",
    "الدوري الإسباني",
    "تحليلات رياضية"
  ],
  alternates: {
    canonical: "https://nabdriyadah.com/"
  },
  openGraph: {
    title: "نبض الرياضة",
    description:
      "موقع عربي للأخبار الرياضية يقدم تغطية يومية لأبرز مستجدات كرة القدم والدوريات الكبرى.",
    url: "https://nabdriyadah.com/",
    siteName: "نبض الرياضة",
    locale: "ar_AR",
    type: "website"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body
        style={{
          margin: 0,
          background: "#f3f4f6",
          color: "#111827",
          fontFamily: "Arial, sans-serif"
        }}
      >
        {children}
      </body>
    </html>
  );
}
