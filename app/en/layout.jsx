export const metadata = {
  metadataBase: new URL("https://nabdriyadah.com"),
  title: {
    default: "Sports Pulse",
    template: "%s | Sports Pulse"
  },
  description: "Sports Pulse — Your daily source for football, basketball, tennis and padel news from top leagues worldwide.",
  alternates: {
    canonical: "https://nabdriyadah.com/en/",
    languages: {
      "en": "https://nabdriyadah.com/en/",
      "ar": "https://nabdriyadah.com/",
      "fr": "https://nabdriyadah.com/fr/",
      "x-default": "https://nabdriyadah.com/",
    },
  },
  openGraph: {
    title: "Sports Pulse",
    description: "Daily sports news: football, basketball, tennis and padel coverage.",
    url: "https://nabdriyadah.com/en/",
    siteName: "Sports Pulse",
    locale: "en_US",
    type: "website"
  }
};

import SiteFooter from "../components/SiteFooter";

export default function EnLayout({ children }) {
  return (
    <div lang="en" dir="ltr">
      {children}
      <SiteFooter lang="en" />
    </div>
  );
}
