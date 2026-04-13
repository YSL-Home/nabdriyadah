import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://example.com"),
  title: {
    default: "نبض الرياضة",
    template: "%s | نبض الرياضة",
  },
  description:
    "نبض الرياضة: موقع رياضي عربي يقدم آخر أخبار كرة القدم العربية والعالمية، نتائج المباريات، التحليلات، وأخبار الانتقالات.",
  keywords: [
    "نبض الرياضة",
    "أخبار الرياضة",
    "كرة القدم",
    "أخبار كرة القدم",
    "الدوري الإسباني",
    "الدوري الإنجليزي",
    "دوري أبطال أوروبا",
    "أخبار الانتقالات",
    "نتائج المباريات",
    "تحليلات رياضية",
  ],
  openGraph: {
    title: "نبض الرياضة",
    description:
      "تابع آخر أخبار كرة القدم العربية والعالمية، نتائج المباريات، التحليلات، وأخبار الانتقالات.",
    type: "website",
    locale: "ar_AR",
    siteName: "نبض الرياضة",
  },
  twitter: {
    card: "summary_large_image",
    title: "نبض الرياضة",
    description:
      "تابع آخر أخبار كرة القدم العربية والعالمية، نتائج المباريات، التحليلات، وأخبار الانتقالات.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
