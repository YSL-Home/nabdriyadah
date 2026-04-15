export const metadata = {
  metadataBase: new URL("https://nabdriyadah.com"),
  title: {
    default: "نبض الرياضة",
    template: "%s | نبض الرياضة"
  },
  description:
    "نبض الرياضة: موقع عربي لمتابعة آخر أخبار كرة القدم، نتائج المباريات، التحليلات، وأخبار الدوريات العالمية.",
  keywords: [
    "نبض الرياضة",
    "أخبار رياضية",
    "كرة القدم",
    "الدوري الإنجليزي",
    "الدوري الإسباني",
    "نتائج المباريات",
    "تحليلات رياضية"
  ],
  openGraph: {
    title: "نبض الرياضة",
    description:
      "موقع عربي لمتابعة آخر أخبار كرة القدم، نتائج المباريات، والتحليلات الرياضية.",
    url: "https://nabdriyadah.com",
    siteName: "نبض الرياضة",
    locale: "ar_AR",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "نبض الرياضة",
    description:
      "موقع عربي لمتابعة آخر أخبار كرة القدم، نتائج المباريات، والتحليلات الرياضية."
  },
  alternates: {
    canonical: "https://nabdriyadah.com"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
