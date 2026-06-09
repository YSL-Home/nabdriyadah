import "./globals.css";
import { Inter } from "next/font/google";
import Script from "next/script";
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
      "x-default": "https://nabdriyadah.com/",
    },
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
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

const ADSENSE_ID = process.env.NEXT_PUBLIC_ADSENSE_ID || "ca-pub-6870790039775701";
const GTM_ID     = "GTM-MHCF745N";
const GA_ID      = "G-5420JXJVQ0";

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className={inter.variable}>
      <head>
        {/* DNS prefetch / preconnect pour les domaines d'images */}
        <link rel="preconnect" href="https://media.api-sports.io" />
        <link rel="dns-prefetch" href="https://media.api-sports.io" />
        <link rel="preconnect" href="https://www.thesportsdb.com" />
        <link rel="dns-prefetch" href="https://www.thesportsdb.com" />
        <link rel="preconnect" href="https://cdn.thesportsdb.com" />
        <link rel="dns-prefetch" href="https://cdn.thesportsdb.com" />

        {/*
          Anti-flash theme script — doit rester inline et synchrone pour éviter
          le flash blanc/noir avant le premier paint. C'est le SEUL script
          bloquant justifié ici.
          Logique : préférence système → sombre si nuit (20h–6h), clair sinon.
        */}
        <script dangerouslySetInnerHTML={{ __html:
          `(function(){var h=new Date().getHours(),night=h<6||h>=20;var pref=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;var saved=null;try{saved=localStorage.getItem('theme');}catch(e){}var dark=saved==='dark'||(saved===null&&(night||pref));if(dark){document.documentElement.setAttribute('data-theme','dark');}})();`
        }} />
      </head>

      <body style={{ margin: 0, fontFamily: "var(--font-inter, 'Inter', 'Segoe UI', Arial, sans-serif)" }}>
        {/* GTM noscript — doit être immédiatement après <body> */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0" width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        <ThemeController />
        <SiteHeader />
        {children}
        <SiteFooter lang="ar" />

        {/* ── Scripts analytics — chargés après le contenu (afterInteractive) ── */}

        {/* Google Tag Manager */}
        <Script
          id="gtm-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html:
            `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`
          }}
        />

        {/* Google Analytics GA4 */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script
          id="ga4-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html:
            `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`
          }}
        />

        {/* Google AdSense — lazyOnload pour ne pas bloquer le LCP */}
        <Script
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_ID}`}
          strategy="lazyOnload"
          crossOrigin="anonymous"
        />

        {/* Plausible Analytics — sans cookies, RGPD */}
        <Script
          src="https://plausible.io/js/script.js"
          data-domain="nabdriyadah.com"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
