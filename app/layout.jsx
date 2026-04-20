export const metadata = {
  metadataBase: new URL("https://nabdriyadah.com"),
  title: {
    default: "نبض الرياضة",
    template: "%s | نبض الرياضة"
  },
  description:
    "نبض الرياضة: موقع عربي لمتابعة آخر أخبار كرة القدم، نتائج المباريات، والتحليلات الرياضية.",
  keywords: [
    "نبض الرياضة",
    "أخبار رياضية",
    "كرة القدم",
    "نتائج المباريات",
    "الدوري الإنجليزي",
    "الدوري الإسباني"
  ],
  alternates: {
    canonical: "https://nabdriyadah.com/"
  },
  openGraph: {
    title: "نبض الرياضة",
    description:
      "موقع عربي لمتابعة آخر أخبار كرة القدم، نتائج المباريات، والتحليلات الرياضية.",
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
