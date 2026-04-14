export const metadata = {
  title: "نبض الرياضة",
  description: "أحدث الأخبار الرياضية العربية",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body
        style={{
          margin: 0,
          padding: 0,
          background: "#f3f4f6",
          fontFamily: "Arial, sans-serif",
        }}
      >
        {children}
      </body>
    </html>
  );
}
