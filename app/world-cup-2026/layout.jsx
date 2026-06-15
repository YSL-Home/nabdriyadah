export const metadata = {
  title: "كأس العالم 2026 — المباريات والنتائج والترتيب | نبض الرياضة",
  description: "تابع كأس العالم 2026 مباشرة: جدول المباريات، النتائج اللحظية، ترتيب المجموعات والأدوار الإقصائية. تغطية كاملة من نبض الرياضة.",
  keywords: ["كأس العالم 2026", "مونديال 2026", "World Cup 2026", "نتائج كأس العالم", "ترتيب المجموعات", "مباريات كأس العالم"],
  alternates: { canonical: "https://nabdriyadah.com/world-cup-2026/" },
  openGraph: {
    title: "كأس العالم 2026 — المباريات والنتائج والترتيب",
    description: "جدول المباريات، النتائج اللحظية وترتيب المجموعات لكأس العالم 2026.",
    url: "https://nabdriyadah.com/world-cup-2026/",
    siteName: "نبض الرياضة",
    locale: "ar_AR",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SportsEvent",
  name: "كأس العالم لكرة القدم 2026",
  sport: "Football",
  startDate: "2026-06-11",
  endDate: "2026-07-19",
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  location: [
    { "@type": "Country", name: "United States" },
    { "@type": "Country", name: "Canada" },
    { "@type": "Country", name: "Mexico" },
  ],
  organizer: { "@type": "Organization", name: "FIFA", url: "https://www.fifa.com" },
  url: "https://nabdriyadah.com/world-cup-2026/",
  inLanguage: "ar",
};

export default function WorldCupLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  );
}
