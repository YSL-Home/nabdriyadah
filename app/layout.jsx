export const metadata = {
  title: "نبض الرياضة",
  description: "أحدث الأخبار الرياضية العربية"
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
