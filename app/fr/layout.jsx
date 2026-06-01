export const metadata = {
  metadataBase: new URL("https://nabdriyadah.com"),
  title: {
    default: "Sports Pulse",
    template: "%s | Sports Pulse"
  },
  description: "Sports Pulse — Votre source quotidienne d'actualités sportives : football, basketball, tennis et padel des meilleures ligues mondiales.",
  alternates: {
    canonical: "https://nabdriyadah.com/fr/",
    languages: {
      "fr": "https://nabdriyadah.com/fr/",
      "ar": "https://nabdriyadah.com/",
      "en": "https://nabdriyadah.com/en/",
      "x-default": "https://nabdriyadah.com/",
    },
  },
  openGraph: {
    title: "Sports Pulse",
    description: "Actualités sportives quotidiennes : football, basketball, tennis et padel.",
    url: "https://nabdriyadah.com/fr/",
    siteName: "Sports Pulse",
    locale: "fr_FR",
    type: "website"
  }
};

import SiteFooter from "../components/SiteFooter";

export default function FrLayout({ children }) {
  return (
    <div lang="fr" dir="ltr">
      {children}
      <SiteFooter lang="fr" />
    </div>
  );
}
