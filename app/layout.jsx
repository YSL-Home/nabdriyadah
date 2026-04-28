import "./globals.css";
import SiteHeader from "./components/SiteHeader";

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
    "كرة السلة",
    "التنس",
    "البادل",
    "كرة قدم الصالات",
    "الدوري الإنجليزي",
    "الدوري الإسباني",
    "NBA",
    "تحليلات رياضية"
  ],
  alternates: {
    canonical: "https://nabdriyadah.com/"
  },
  openGraph: {
    title: "نبض الرياضة",
    description:
      "موقع عربي للأخبار الرياضية يقدم تغطية يومية لكرة القدم، كرة السلة، التنس، البادل والصالات.",
    url: "https://nabdriyadah.com/",
    siteName: "نبض الرياضة",
    locale: "ar_AR",
    type: "website"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-MHCF745N');`
          }}
        />
      </head>

      <body
        style={{
          margin: 0,
          color: "#111827",
          fontFamily: "Arial, sans-serif"
        }}
      >
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-MHCF745N"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
