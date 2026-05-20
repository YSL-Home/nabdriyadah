import "./globals.css";
import { Inter } from "next/font/google";
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";
import ThemeController from "./components/ThemeController";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "800", "900"],
});

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
    canonical: "https://nabdriyadah.com/",
    languages: {
      "ar": "https://nabdriyadah.com/",
      "fr": "https://nabdriyadah.com/fr/",
      "en": "https://nabdriyadah.com/en/",
    }
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
    <html lang="ar" dir="rtl" className={inter.variable}>
      <head>
        {/* Anti-flash: CLAIR par défaut — sombre seulement 20h–6h ou préférence système */}
        <script dangerouslySetInnerHTML={{ __html:
          `(function(){var h=new Date().getHours(),night=h<6||h>=20;var dark=night||(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches&&!night===false);if(dark){document.documentElement.setAttribute('data-theme','dark');}})();`
        }} />
        {/* Google AdSense — auto-ads activés sur tout le site */}
        {(process.env.NEXT_PUBLIC_ADSENSE_ID || "ca-pub-6870790039775701") && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_ID || "ca-pub-6870790039775701"}`}
            crossOrigin="anonymous"
          />
        )}
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-MHCF745N');`
          }}
        />
        {/* Google Analytics GA4 — nabdriyadah.com */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-5420JXJVQ0" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-5420JXJVQ0');`
          }}
        />
        {/* Protection DevTools — dissuasion inspection source */}
        <script dangerouslySetInnerHTML={{ __html: `
(function(){
  // Désactiver le clic droit
  document.addEventListener('contextmenu', function(e){ e.preventDefault(); return false; });
  // Bloquer F12, Ctrl+Shift+I/J/U, Ctrl+U
  document.addEventListener('keydown', function(e){
    if(e.key==='F12'||(e.ctrlKey&&e.shiftKey&&(e.key==='I'||e.key==='J'||e.key==='C'))||(e.ctrlKey&&e.key==='U')||(e.metaKey&&e.altKey&&(e.key==='I'||e.key==='J'))){
      e.preventDefault(); return false;
    }
  });
})();
        `}} />
      </head>

      <body style={{ margin: 0, fontFamily: "var(--font-inter, 'Inter', 'Segoe UI', Arial, sans-serif)" }}>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-MHCF745N"
            height="0" width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        {/* Contrôleur de thème jour/nuit — client uniquement */}
        <ThemeController />
        <SiteHeader />
        {children}
        <SiteFooter lang="ar" />
      </body>
    </html>
  );
}
