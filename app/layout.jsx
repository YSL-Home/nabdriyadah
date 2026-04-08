import "./globals.css";

export const metadata = {
  title: "نبض الرياضة",
  description: "أخبار رياضية لحظة بلحظة",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
} 
