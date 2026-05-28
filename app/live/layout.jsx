export const metadata = {
  title: "نتائج مباشرة | نبض الرياضة",
  description: "نتائج وأهداف المباريات مباشرة - كرة قدم، سلة، تنس",
  alternates: {
    canonical: "https://nabdriyadah.com/live/",
  },
  openGraph: {
    title: "نتائج مباشرة | نبض الرياضة",
    description: "نتائج وأهداف المباريات مباشرة - كرة قدم، سلة، تنس",
    url: "https://nabdriyadah.com/live/",
    siteName: "نبض الرياضة",
    locale: "ar_AR",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "نتائج مباشرة | نبض الرياضة",
  description: "نتائج وأهداف المباريات مباشرة - كرة قدم، سلة، تنس",
  url: "https://nabdriyadah.com/live/",
  inLanguage: "ar",
  publisher: {
    "@type": "Organization",
    name: "نبض الرياضة",
    url: "https://nabdriyadah.com",
  },
};

export default function LiveLayout({ children }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
